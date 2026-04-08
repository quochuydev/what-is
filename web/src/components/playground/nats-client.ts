// Lightweight NATS client over WebSocket (no external deps)
// Implements just enough of the NATS protocol for pub/sub

export type NatsMessageHandler = (subject: string, data: string) => void;

export interface NatsAuth {
  user?: string;
  pass?: string;
  token?: string;
}

export class NatsWsClient {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<
    string,
    { sid: number; handler: NatsMessageHandler }
  >();
  private sidCounter = 0;
  private connected = false;
  private waitingForConnectPong = false;
  private auth: NatsAuth = {};
  private onConnect?: () => void;
  private onDisconnect?: (reason: string) => void;
  private onError?: (err: string) => void;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  // For MSG commands that span two frames (header + payload)
  private pendingMsg: { subject: string; sid: number; numBytes: number } | null =
    null;

  constructor(opts?: {
    auth?: NatsAuth;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (err: string) => void;
  }) {
    this.auth = opts?.auth || {};
    this.onConnect = opts?.onConnect;
    this.onDisconnect = opts?.onDisconnect;
    this.onError = opts?.onError;
  }

  connect(url: string): void {
    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      this.onError?.(`Failed to create WebSocket: ${e}`);
      return;
    }

    this.ws.onopen = () => {
      // NATS server sends INFO first, we respond in onmessage
    };

    this.ws.binaryType = "arraybuffer";
    this.ws.onmessage = (event) => {
      let raw: string;
      if (typeof event.data === "string") {
        raw = event.data;
      } else if (event.data instanceof ArrayBuffer) {
        raw = new TextDecoder().decode(event.data);
      } else {
        // Blob fallback
        return;
      }
      console.log("[NATS] recv:", raw.substring(0, 200));
      this.handleFrame(raw);
    };

    this.ws.onclose = (event) => {
      this.connected = false;
      if (this.pingInterval) clearInterval(this.pingInterval);
      console.log("[NATS] close:", event.code, event.reason);
      this.onDisconnect?.(`Connection closed (code: ${event.code}, reason: ${event.reason || "none"})`);
    };

    this.ws.onerror = (event) => {
      console.log("[NATS] error:", event);
      this.onError?.("WebSocket connection error");
    };
  }

  private handleFrame(raw: string): void {
    // NATS over WebSocket: each frame can contain one or more protocol lines
    // Split by \r\n and process each line. Some frames may not have trailing \r\n.
    const lines = raw.split("\r\n").filter((l) => l.length > 0);

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // If we're waiting for a MSG payload from a previous frame
      if (this.pendingMsg) {
        const payload = line.substring(0, this.pendingMsg.numBytes);
        this.deliverMessage(this.pendingMsg.subject, this.pendingMsg.sid, payload);
        this.pendingMsg = null;
        i++;
        continue;
      }

      if (line.startsWith("INFO ")) {
        // Respond with CONNECT immediately, including auth if provided
        const connectPayload: Record<string, unknown> = {
          verbose: false,
          pedantic: false,
          lang: "js",
          version: "1.0.0",
          protocol: 1,
        };
        if (this.auth.token) connectPayload.auth_token = this.auth.token;
        if (this.auth.user) connectPayload.user = this.auth.user;
        if (this.auth.pass) connectPayload.pass = this.auth.pass;
        this.send(`CONNECT ${JSON.stringify(connectPayload)}\r\n`);
        // Send PING and wait for PONG before marking connected
        this.waitingForConnectPong = true;
        this.send("PING\r\n");
      } else if (line === "PING") {
        this.send("PONG\r\n");
      } else if (line === "PONG") {
        if (this.waitingForConnectPong) {
          // CONNECT was accepted — now safe to subscribe and notify
          this.waitingForConnectPong = false;
          this.connected = true;

          // Re-subscribe existing subs
          for (const [subject, { sid }] of this.subscriptions) {
            this.send(`SUB ${subject} ${sid}\r\n`);
          }

          // Keepalive ping
          if (this.pingInterval) clearInterval(this.pingInterval);
          this.pingInterval = setInterval(() => {
            if (this.connected) this.send("PING\r\n");
          }, 25000);

          this.onConnect?.();
        }
      } else if (line.startsWith("MSG ")) {
        // MSG <subject> <sid> [reply-to] <#bytes>
        const parts = line.split(" ");
        const subject = parts[1];
        const sid = parseInt(parts[2]);
        const numBytes = parseInt(parts[parts.length - 1]);

        // Payload is the next line
        if (i + 1 < lines.length) {
          const payload = lines[i + 1].substring(0, numBytes);
          this.deliverMessage(subject, sid, payload);
          i++; // skip payload line
        } else {
          // Payload will arrive in the next frame
          this.pendingMsg = { subject, sid, numBytes };
        }
      } else if (line.startsWith("-ERR")) {
        this.onError?.(`NATS error: ${line}`);
      }
      // +OK, other lines: ignore

      i++;
    }
  }

  private deliverMessage(subject: string, _sid: number, payload: string): void {
    for (const [subSubject, sub] of this.subscriptions) {
      if (this.matchSubject(subSubject, subject)) {
        try {
          sub.handler(subject, payload);
        } catch {
          // handler error, ignore
        }
      }
    }
  }

  private matchSubject(pattern: string, subject: string): boolean {
    if (pattern === subject) return true;
    // Wildcard >
    if (pattern.endsWith(".>")) {
      const prefix = pattern.slice(0, -1); // keep the dot
      return subject.startsWith(prefix) || subject === pattern.slice(0, -2);
    }
    // Wildcard *
    if (pattern.includes("*")) {
      const pp = pattern.split(".");
      const sp = subject.split(".");
      if (pp.length !== sp.length) return false;
      return pp.every((p, idx) => p === "*" || p === sp[idx]);
    }
    return false;
  }

  private send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[NATS] send:", data.substring(0, 200).replace(/\r\n/g, "\\r\\n"));
      this.ws.send(data);
    }
  }

  subscribe(subject: string, handler: NatsMessageHandler): number {
    const sid = ++this.sidCounter;
    this.subscriptions.set(subject, { sid, handler });
    if (this.connected) {
      this.send(`SUB ${subject} ${sid}\r\n`);
    }
    return sid;
  }

  unsubscribe(subject: string): void {
    const sub = this.subscriptions.get(subject);
    if (sub) {
      if (this.connected) this.send(`UNSUB ${sub.sid}\r\n`);
      this.subscriptions.delete(subject);
    }
  }

  publish(subject: string, data: string): void {
    if (!this.connected) return;
    const encoded = new TextEncoder().encode(data);
    this.send(`PUB ${subject} ${encoded.length}\r\n${data}\r\n`);
  }

  close(): void {
    this.connected = false;
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.connected;
  }
}
