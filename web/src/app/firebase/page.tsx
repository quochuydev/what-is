"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";

export default function FirebasePage() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState("Hello from what-is!");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const getDeviceToken = async () => {
    setTokenLoading(true);
    setStatus(null);
    try {
      const { initializeApp } = await import("firebase/app");
      const { getMessaging, getToken } = await import("firebase/messaging");

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        setStatus("Firebase client config not set. Check NEXT_PUBLIC_FIREBASE_* env vars.");
        setTokenLoading(false);
        return;
      }

      // Pass config to service worker
      if ("serviceWorker" in navigator) {
        const sw = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        // Post config to SW
        sw.active?.postMessage({
          type: "FIREBASE_CONFIG",
          config: firebaseConfig,
        });
      }

      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission denied");
        setTokenLoading(false);
        return;
      }

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      setDeviceToken(fcmToken);
      setToken(fcmToken);
      setStatus("Device token retrieved successfully");
    } catch (err) {
      console.error(err);
      setStatus(`Error getting token: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTokenLoading(false);
    }
  };

  const sendTest = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/firebase/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), title, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Sent! Message ID: ${data.messageId}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[720px] px-4 py-8 sm:py-12">
          <h1 className="mb-6 text-3xl font-bold">Firebase Notifications</h1>

          <div className="space-y-6">
            {/* Get Device Token */}
            <div className="rounded-xl border border-border bg-accent/50 p-6">
              <h2 className="text-xl font-semibold">1. Get Device Token</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Request notification permission and retrieve your FCM device
                token.
              </p>
              <button
                onClick={getDeviceToken}
                disabled={tokenLoading}
                className="mt-4 cursor-pointer rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {tokenLoading ? "Requesting..." : "Get Device Token"}
              </button>

              {deviceToken && (
                <div className="mt-4">
                  <label className="text-sm font-medium">Device Token:</label>
                  <textarea
                    readOnly
                    value={deviceToken}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
                  />
                </div>
              )}
            </div>

            {/* Send Test Notification */}
            <div className="rounded-xl border border-border bg-accent/50 p-6">
              <h2 className="text-xl font-semibold">2. Send Test Notification</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Token</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste device token here"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Body</label>
                  <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                  />
                </div>
                <button
                  onClick={sendTest}
                  disabled={loading || !token.trim()}
                  className="cursor-pointer rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Test Notification"}
                </button>
              </div>
            </div>

            {status && (
              <div
                className={`rounded-lg p-4 ${
                  status.startsWith("Error") || status.startsWith("Network")
                    ? "bg-red-500/10 text-red-500"
                    : "bg-green-500/10 text-green-600"
                }`}
              >
                {status}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
