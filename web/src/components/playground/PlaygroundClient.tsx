"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  FightingGame,
  PlayerState,
} from "@/components/playground/FightingGame";
import { NatsWsClient, NatsAuth } from "@/components/playground/nats-client";
import type { NatsConfig } from "@/app/playground/page";

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAYER_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const ARENA_W = 800;
const PLAYER_W = 36;
const PLAYER_H = 56;
const GROUND_Y = 390;

type GamePhase = "lobby" | "waiting" | "fighting" | "gameover";

type RoomPlayer = { id: string; name: string; color: string; ready: boolean };

// ─── Message Types (sent over NATS subject) ─────────────────────────────────

type ArenaMessage =
  | { type: "join"; player: { id: string; name: string; color: string } }
  | { type: "present"; player: { id: string; name: string; color: string } }
  | { type: "ready"; playerId: string }
  | { type: "start"; players: { id: string; name: string; color: string }[] }
  | { type: "state"; player: PlayerState }
  | { type: "hit"; targetId: string; damage: number; attackerId: string }
  | { type: "dead"; playerId: string }
  | { type: "leave"; playerId: string };

// ─── Page ────────────────────────────────────────────────────────────────────

export function PlaygroundClient({ natsConfig }: { natsConfig: NatsConfig }) {
  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundContent natsConfig={natsConfig} />
    </Suspense>
  );
}

function PlaygroundLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Playground</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Main Content ────────────────────────────────────────────────────────────

function PlaygroundContent({ natsConfig }: { natsConfig: NatsConfig }) {
  const { isSignedIn, isLoaded: authLoaded, user } = useUser();

  const natsEnabled = natsConfig.enabled && !!natsConfig.url;

  // Lobby state
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomId, setRoomId] = useState("1");
  const [useLocalMode, setUseLocalMode] = useState(true);
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [statusMsg, setStatusMsg] = useState("");

  // Room state (online waiting room)
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Game state
  const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map());
  const [localPlayerId, setLocalPlayerId] = useState("");
  const [gameActive, setGameActive] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Refs
  const natsRef = useRef<NatsWsClient | null>(null);
  const aiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playersRef = useRef(players);
  const localIdRef = useRef(localPlayerId);
  const localColorRef = useRef("");
  const roomPlayersRef = useRef(roomPlayers);
  const phaseRef = useRef(phase);
  playersRef.current = players;
  localIdRef.current = localPlayerId;
  roomPlayersRef.current = roomPlayers;
  phaseRef.current = phase;

  // Set default name from Clerk user
  useEffect(() => {
    if (user?.firstName) {
      setPlayerName(user.firstName);
    }
  }, [user]);

  // ─── Create a player state ────────────────────────────────────────────────

  function createPlayer(
    id: string,
    name: string,
    color: string,
    index: number,
    total: number
  ): PlayerState {
    const spacing = (ARENA_W - 80) / Math.max(total - 1, 1);
    return {
      id,
      name,
      color,
      x: 40 + index * spacing,
      y: GROUND_Y - PLAYER_H,
      vx: 0,
      vy: 0,
      health: 100,
      action: "idle",
      facing: index < total / 2 ? "right" : "left",
      attackFrame: 0,
      hitFrame: 0,
      alive: true,
    };
  }

  // ─── NATS subject for current room ────────────────────────────────────────

  function getRoomSubject() {
    return `arena.room.${roomId.trim() || "1"}`;
  }

  // ─── Publish message to room ──────────────────────────────────────────────

  function publishToRoom(msg: ArenaMessage) {
    natsRef.current?.publish(getRoomSubject(), JSON.stringify(msg));
  }

  // ─── Handle incoming NATS messages ────────────────────────────────────────

  const handleArenaMessage = useCallback(
    (_subject: string, data: string) => {
      let msg: ArenaMessage;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }

      const myId = localIdRef.current;

      switch (msg.type) {
        case "join": {
          if (msg.player.id === myId) break; // ignore own join
          // Add to room players
          setRoomPlayers((prev) => {
            if (prev.find((p) => p.id === msg.player.id)) return prev;
            return [...prev, { ...msg.player, ready: false }];
          });
          // Respond with "present" so the new player sees us
          if (natsRef.current?.isConnected) {
            natsRef.current.publish(
              getRoomSubject(),
              JSON.stringify({
                type: "present",
                player: {
                  id: myId,
                  name: playerName || "Player",
                  color: localColorRef.current,
                },
              } satisfies ArenaMessage)
            );
          }
          break;
        }

        case "present": {
          if (msg.player.id === myId) break;
          setRoomPlayers((prev) => {
            if (prev.find((p) => p.id === msg.player.id)) return prev;
            return [...prev, { ...msg.player, ready: false }];
          });
          break;
        }

        case "ready": {
          if (msg.playerId === myId) break;
          setRoomPlayers((prev) =>
            prev.map((p) =>
              p.id === msg.playerId ? { ...p, ready: true } : p
            )
          );
          break;
        }

        case "start": {
          const newPlayers = new Map<string, PlayerState>();
          msg.players.forEach((p, i) => {
            newPlayers.set(
              p.id,
              createPlayer(p.id, p.name, p.color, i, msg.players.length)
            );
          });
          setPlayers(newPlayers);
          setPhase("fighting");
          setGameActive(true);
          setStatusMsg("FIGHT!");
          break;
        }

        case "state": {
          if (msg.player.id === myId) break;
          if (phaseRef.current !== "fighting") break;
          setPlayers((prev) => {
            const next = new Map(prev);
            const existing = next.get(msg.player.id);
            if (existing) {
              next.set(msg.player.id, { ...existing, ...msg.player });
            }
            return next;
          });
          break;
        }

        case "hit": {
          if (phaseRef.current !== "fighting") break;
          // Only apply if I'm the target (each client manages own health)
          if (msg.targetId === myId) {
            setPlayers((prev) => {
              const next = new Map(prev);
              const target = next.get(msg.targetId);
              if (target && target.alive) {
                const updated = { ...target };
                updated.health = Math.max(0, updated.health - msg.damage);
                updated.hitFrame = 10;
                if (updated.health <= 0) {
                  updated.alive = false;
                  updated.action = "dead";
                }
                next.set(msg.targetId, updated);
              }
              return next;
            });
          }
          break;
        }

        case "dead": {
          if (msg.playerId === myId) break;
          setPlayers((prev) => {
            const next = new Map(prev);
            const p = next.get(msg.playerId);
            if (p) {
              next.set(msg.playerId, {
                ...p,
                alive: false,
                action: "dead",
                health: 0,
              });
            }
            return next;
          });
          break;
        }

        case "leave": {
          setRoomPlayers((prev) => prev.filter((p) => p.id !== msg.playerId));
          setPlayers((prev) => {
            const next = new Map(prev);
            next.delete(msg.playerId);
            return next;
          });
          break;
        }
      }
    },
    [playerName]
  );

  // ─── Local Mode (with AI bots) ────────────────────────────────────────────

  const startLocalGame = useCallback(() => {
    const id = "local-player";
    setLocalPlayerId(id);
    const total = maxPlayers;
    const newPlayers = new Map<string, PlayerState>();

    newPlayers.set(
      id,
      createPlayer(id, playerName || "You", PLAYER_COLORS[0], 0, total)
    );

    const botNames = [
      "Brutus",
      "Shadow",
      "Blaze",
      "Viper",
      "Storm",
      "Frost",
      "Rogue",
    ];
    for (let i = 1; i < total; i++) {
      const botId = `bot-${i}`;
      newPlayers.set(
        botId,
        createPlayer(
          botId,
          botNames[i - 1] || `Bot ${i}`,
          PLAYER_COLORS[i % PLAYER_COLORS.length],
          i,
          total
        )
      );
    }

    setPlayers(newPlayers);
    setPhase("fighting");
    setGameActive(true);
    setWinner(null);
    setStatusMsg("FIGHT!");

    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    aiIntervalRef.current = setInterval(() => updateAI(), 50);
  }, [maxPlayers, playerName]);

  // AI bot logic
  function updateAI() {
    setPlayers((prev) => {
      const next = new Map(prev);
      const allPlayers = Array.from(next.values());
      const alivePlayers = allPlayers.filter((p) => p.alive);

      if (alivePlayers.length <= 1) {
        if (aiIntervalRef.current) {
          clearInterval(aiIntervalRef.current);
          aiIntervalRef.current = null;
        }
        return next;
      }

      for (const bot of allPlayers) {
        if (!bot.id.startsWith("bot-") || !bot.alive) continue;

        let nearest: PlayerState | null = null;
        let nearestDist = Infinity;
        for (const other of alivePlayers) {
          if (other.id === bot.id) continue;
          const dist = Math.abs(other.x - bot.x);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = other;
          }
        }
        if (!nearest) continue;

        const onGround = bot.y >= GROUND_Y - PLAYER_H;
        if (bot.attackFrame > 0) bot.attackFrame--;
        if (bot.hitFrame > 0) bot.hitFrame--;
        if (bot.hitFrame > 0) continue;

        bot.facing = nearest.x > bot.x ? "right" : "left";

        if (nearestDist > 55) {
          bot.vx = nearest.x > bot.x ? 2.5 : -2.5;
          bot.action = "walk";
        } else if (nearestDist < 30) {
          bot.vx = nearest.x > bot.x ? -1.5 : 1.5;
          bot.action = "walk";
        } else {
          bot.vx *= 0.7;
          bot.action = "idle";
        }

        if (nearestDist < 60 && bot.attackFrame <= 0 && Math.random() < 0.15) {
          if (Math.random() < 0.5) {
            bot.action = "punch";
            bot.attackFrame = 12;
            if (nearestDist < 48 && nearest.alive) {
              nearest.health -= 8;
              nearest.hitFrame = 10;
              if (nearest.health <= 0) {
                nearest.alive = false;
                nearest.action = "dead";
              }
            }
          } else {
            bot.action = "kick";
            bot.attackFrame = 12;
            if (nearestDist < 58 && nearest.alive) {
              nearest.health -= 13;
              nearest.hitFrame = 10;
              if (nearest.health <= 0) {
                nearest.alive = false;
                nearest.action = "dead";
              }
            }
          }
        }

        if (onGround && Math.random() < 0.02) bot.vy = -11;

        if (
          bot.health < 30 &&
          nearestDist < 80 &&
          Math.random() < 0.05 &&
          onGround
        ) {
          bot.vy = -11;
          bot.vx = nearest.x > bot.x ? -4 : 4;
        }

        bot.vy += 0.55;
        bot.x += bot.vx;
        bot.y += bot.vy;
        if (bot.x < 0) bot.x = 0;
        if (bot.x > ARENA_W - PLAYER_W) bot.x = ARENA_W - PLAYER_W;
        if (bot.y >= GROUND_Y - PLAYER_H) {
          bot.y = GROUND_Y - PLAYER_H;
          bot.vy = 0;
        }
      }

      return next;
    });
  }

  // ─── Online Mode (NATS) ───────────────────────────────────────────────────

  const connectNats = useCallback(() => {
    if (!natsConfig.url) return;

    const id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const color =
      PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
    setLocalPlayerId(id);
    localIdRef.current = id;
    localColorRef.current = color;
    setPhase("waiting");
    setStatusMsg("Connecting to NATS...");
    setRoomPlayers([{ id, name: playerName || "Player", color, ready: false }]);
    setIsReady(false);

    const auth: NatsAuth = {};
    if (natsConfig.token) auth.token = natsConfig.token;

    const nats = new NatsWsClient({
      auth,
      onConnect: () => {
        setStatusMsg(`Connected! Room: ${roomId}`);
        // Subscribe to room subject
        nats.subscribe(getRoomSubject(), handleArenaMessage);
        // Announce join
        nats.publish(
          getRoomSubject(),
          JSON.stringify({
            type: "join",
            player: { id, name: playerName || "Player", color },
          } satisfies ArenaMessage)
        );
      },
      onDisconnect: (reason) => {
        setStatusMsg(`Disconnected: ${reason}`);
        if (phaseRef.current === "waiting") setPhase("lobby");
      },
      onError: (err) => {
        setStatusMsg(`Error: ${err}`);
        setPhase("lobby");
      },
    });

    natsRef.current = nats;
    nats.connect(natsConfig.url);
  }, [natsConfig, roomId, playerName, handleArenaMessage]);

  // Toggle ready
  const toggleReady = useCallback(() => {
    setIsReady(true);
    setRoomPlayers((prev) =>
      prev.map((p) =>
        p.id === localIdRef.current ? { ...p, ready: true } : p
      )
    );
    publishToRoom({ type: "ready", playerId: localIdRef.current });
  }, []);

  // Start online game (any player can trigger when all ready)
  const startOnlineGame = useCallback(() => {
    const rp = roomPlayersRef.current;
    publishToRoom({
      type: "start",
      players: rp.map((p) => ({ id: p.id, name: p.name, color: p.color })),
    });
    // Also apply locally
    const newPlayers = new Map<string, PlayerState>();
    rp.forEach((p, i) => {
      newPlayers.set(
        p.id,
        createPlayer(p.id, p.name, p.color, i, rp.length)
      );
    });
    setPlayers(newPlayers);
    setPhase("fighting");
    setGameActive(true);
    setStatusMsg("FIGHT!");
  }, []);

  const disconnectNats = useCallback(() => {
    if (natsRef.current) {
      publishToRoom({ type: "leave", playerId: localIdRef.current });
      natsRef.current.close();
      natsRef.current = null;
    }
    setPhase("lobby");
    setRoomPlayers([]);
    setStatusMsg("");
  }, []);

  // ─── Game callbacks ───────────────────────────────────────────────────────

  const handleLocalStateChange = useCallback(
    (state: PlayerState) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        next.set(state.id, state);
        return next;
      });

      // Send via NATS if connected
      if (natsRef.current?.isConnected) {
        publishToRoom({ type: "state", player: state });
      }

      // Check game over (local mode)
      if (useLocalMode) {
        const allPlayers = Array.from(playersRef.current.values());
        const alive = allPlayers.filter((p) => p.alive);
        if (alive.length <= 1 && allPlayers.length > 1 && gameActive) {
          setGameActive(false);
          setPhase("gameover");
          if (alive[0]) setWinner(alive[0].name);
          if (aiIntervalRef.current) {
            clearInterval(aiIntervalRef.current);
            aiIntervalRef.current = null;
          }
        }
      }
    },
    [useLocalMode, gameActive]
  );

  const handleHit = useCallback(
    (targetId: string, damage: number) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        const target = next.get(targetId);
        if (target && target.alive) {
          const updated = { ...target };
          updated.health = Math.max(0, updated.health - damage);
          updated.hitFrame = 10;
          if (updated.health <= 0) {
            updated.alive = false;
            updated.action = "dead";
          }
          next.set(targetId, updated);
        }
        return next;
      });

      // Send via NATS
      if (natsRef.current?.isConnected) {
        publishToRoom({
          type: "hit",
          targetId,
          damage,
          attackerId: localPlayerId,
        });
      }
    },
    [localPlayerId]
  );

  const handleDead = useCallback(() => {
    if (natsRef.current?.isConnected) {
      publishToRoom({ type: "dead", playerId: localPlayerId });
    }
  }, [localPlayerId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (natsRef.current) {
        natsRef.current.close();
        natsRef.current = null;
      }
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
  }, []);

  // ─── Check game over (online mode) ───────────────────────────────────────

  useEffect(() => {
    if (!gameActive || useLocalMode || phase !== "fighting") return;
    const allPlayers = Array.from(players.values());
    const alive = allPlayers.filter((p) => p.alive);
    if (alive.length <= 1 && allPlayers.length > 1) {
      setGameActive(false);
      setPhase("gameover");
      if (alive[0]) setWinner(alive[0].name);
    }
  }, [players, gameActive, useLocalMode, phase]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Playground</h1>
            <span className="rounded bg-accent px-2 py-1 text-xs text-muted-foreground">
              Simulated
            </span>
          </div>

          {/* Auth gate */}
          {!authLoaded ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
              <p className="mt-4 text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          ) : !isSignedIn ? (
            <div className="rounded-xl border border-border bg-accent/50 p-8 text-center">
              <h2 className="text-xl font-semibold">2D Battle Arena</h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to play the multiplayer fighting game
              </p>
              <SignInButton mode="modal">
                <button className="mt-4 cursor-pointer rounded-lg bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-90">
                  Sign In to Play
                </button>
              </SignInButton>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ─── Lobby ─────────────────────────────────────────── */}
              {phase === "lobby" && (
                <div className="rounded-xl border border-border bg-accent/50 p-6 sm:p-8">
                  <h2 className="text-2xl font-bold">2D Battle Arena</h2>
                  <p className="mt-1 text-muted-foreground">
                    Free-for-all fighting — last one standing wins!
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your fighter name"
                        maxLength={16}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Players (2–8)
                      </label>
                      <input
                        type="number"
                        value={maxPlayers}
                        onChange={(e) =>
                          setMaxPlayers(
                            Math.min(
                              8,
                              Math.max(2, parseInt(e.target.value) || 2)
                            )
                          )
                        }
                        min={2}
                        max={8}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                      />
                    </div>
                  </div>

                  {/* Mode toggle */}
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium">
                      Mode
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setUseLocalMode(true)}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          useLocalMode
                            ? "bg-foreground text-background"
                            : "border border-border bg-background hover:bg-accent"
                        }`}
                      >
                        Local (vs AI Bots)
                      </button>
                      {natsEnabled && (
                        <button
                          onClick={() => setUseLocalMode(false)}
                          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            !useLocalMode
                              ? "bg-foreground text-background"
                              : "border border-border bg-background hover:bg-accent"
                          }`}
                        >
                          Online (NATS)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Room ID (online mode only) */}
                  {!useLocalMode && (
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium">
                        Room ID
                      </label>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="e.g. 1, lobby, my-room"
                        maxLength={32}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground sm:w-64"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Share the same Room ID with friends to play together
                      </p>
                    </div>
                  )}

                  {statusMsg && (
                    <p className="mt-3 text-sm text-red-500">{statusMsg}</p>
                  )}

                  <button
                    onClick={useLocalMode ? startLocalGame : connectNats}
                    className="mt-6 w-full cursor-pointer rounded-lg bg-foreground px-6 py-3 text-lg font-bold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {useLocalMode ? "Start Game" : "Join Room"}
                  </button>

                  {/* Controls info */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-3">
                      <h3 className="text-sm font-semibold">Move</h3>
                      <p className="text-xs text-muted-foreground">
                        Arrow keys or WASD
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <h3 className="text-sm font-semibold">Punch</h3>
                      <p className="text-xs text-muted-foreground">
                        Z key — 8 damage, fast
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <h3 className="text-sm font-semibold">Kick</h3>
                      <p className="text-xs text-muted-foreground">
                        X key — 13 damage, longer range
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Waiting Room ─────────────────────────────────── */}
              {phase === "waiting" && (
                <div className="rounded-xl border border-border bg-accent/50 p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      Room: {roomId}
                    </h2>
                    <span className="rounded bg-accent px-3 py-1 text-sm">
                      {roomPlayers.length} player
                      {roomPlayers.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {statusMsg}
                  </p>

                  {/* Player list */}
                  <div className="mt-4 space-y-2">
                    {roomPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="font-medium">
                          {p.name}
                          {p.id === localPlayerId && " (you)"}
                        </span>
                        <span className="ml-auto text-sm">
                          {p.ready ? (
                            <span className="text-green-500">Ready</span>
                          ) : (
                            <span className="text-muted-foreground">
                              Waiting...
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    {!isReady ? (
                      <button
                        onClick={toggleReady}
                        className="cursor-pointer rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Ready!
                      </button>
                    ) : (
                      <button
                        onClick={startOnlineGame}
                        disabled={roomPlayers.length < 2}
                        className="cursor-pointer rounded-lg bg-foreground px-6 py-2 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Start Game ({roomPlayers.length} players)
                      </button>
                    )}
                    <button
                      onClick={disconnectNats}
                      className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                    >
                      Leave Room
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Fighting / Game Over ─────────────────────────── */}
              {(phase === "fighting" || phase === "gameover") && (
                <div className="space-y-4">
                  {statusMsg && phase === "fighting" && (
                    <p className="text-center text-sm font-medium text-muted-foreground">
                      {statusMsg}
                    </p>
                  )}

                  <FightingGame
                    players={players}
                    localPlayerId={localPlayerId}
                    onLocalStateChange={handleLocalStateChange}
                    onHit={handleHit}
                    onDead={handleDead}
                    gameActive={gameActive}
                  />

                  <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                    <span>← → or A/D: Move</span>
                    <span>↑ or W or Space: Jump</span>
                    <span>Z: Punch</span>
                    <span>X: Kick</span>
                  </div>

                  {phase === "gameover" && (
                    <div className="rounded-xl border border-border bg-accent/50 p-6 text-center">
                      <h3 className="text-2xl font-bold">
                        {winner} wins! 🏆
                      </h3>
                      <button
                        onClick={() => {
                          if (natsRef.current) {
                            natsRef.current.close();
                            natsRef.current = null;
                          }
                          setPhase("lobby");
                          setPlayers(new Map());
                          setGameActive(false);
                          setWinner(null);
                          setStatusMsg("");
                          setRoomPlayers([]);
                          setIsReady(false);
                        }}
                        className="mt-4 cursor-pointer rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
                      >
                        Play Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
