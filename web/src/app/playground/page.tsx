"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

// ─── Constants ───────────────────────────────────────────────
const CW = 960;
const CH = 540;
const GRAVITY = 0.1;
const CHAR_W = 64;
const CHAR_H = 70;
const MAX_HP = 100;
const BOOM_R = 40;
const FRAMES = 8;
const ANIM_SPEED = 120;
const POWER_CHARGE_SPEED = 1.2; // per frame while holding space
const BULLET_RADIUS = 10;
const BULLET_SPEED = 0.13;

// ─── Types ───────────────────────────────────────────────────
interface Player {
  x: number;
  hp: number;
  angle: number;
  power: number;
}
interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  firedBy: 0 | 1;
  age: number; // frames since fired
}
interface Boom {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

type Phase = "menu" | "aim" | "charging" | "fire" | "over";

// ─── Terrain ─────────────────────────────────────────────────
function makeTerrain(): number[] {
  const t: number[] = [];
  const seed = Math.random() * 100;
  for (let x = 0; x < CW; x++) {
    t.push(
      CH * 0.55 +
        Math.sin((x + seed) * 0.006) * 70 +
        Math.sin((x + seed) * 0.018 + 1.5) * 35 +
        Math.sin((x + seed) * 0.004 + 3) * 50
    );
  }
  return t;
}

function getTerrainY(terrain: number[], x: number): number {
  const i = Math.max(0, Math.min(CW - 1, Math.round(x)));
  return terrain[i];
}

// ─── Sprite helpers ──────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function tintRed(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(200,50,50,0.45)";
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

// ─── Page ────────────────────────────────────────────────────
export default function PlaygroundPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h1 className="text-3xl font-bold">Playground</h1>
          <div className="flex flex-col items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Content() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">GunPow Arena</h1>
            <p className="mt-1 text-muted-foreground">
              Turn-based artillery battle — Arrow keys to aim, hold Space to
              charge, release to fire!
            </p>
          </div>

          {!isLoaded ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
              <p className="text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          ) : !isSignedIn ? (
            <div className="rounded-xl border border-border bg-accent/50 p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Sign in to play GunPow Arena
              </p>
              <SignInButton mode="modal">
                <button className="cursor-pointer rounded-lg bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-90">
                  Sign In to Play
                </button>
              </SignInButton>
            </div>
          ) : (
            <GunPowGame />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Game ────────────────────────────────────────────────────
function GunPowGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spritesRef = useRef<{
    p1Idle: HTMLImageElement[];
    p1Atk: HTMLImageElement[];
    p2Idle: HTMLCanvasElement[];
    p2Atk: HTMLCanvasElement[];
    loaded: boolean;
  }>({ p1Idle: [], p1Atk: [], p2Idle: [], p2Atk: [], loaded: false });

  // All mutable game state in one ref
  const g = useRef({
    phase: "menu" as Phase,
    turn: 0 as 0 | 1,
    wind: 0,
    terrain: makeTerrain(),
    players: [
      { x: 120, hp: MAX_HP, angle: 45, power: 0 },
      { x: CW - 120, hp: MAX_HP, angle: 135, power: 0 },
    ] as [Player, Player],
    proj: null as Projectile | null,
    booms: [] as Boom[],
    winner: null as number | null,
    animFrame: 0,
    animTimer: 0,
    isAttacking: [false, false] as [boolean, boolean],
    attackFrame: [0, 0] as [number, number],
    // Keyboard
    keysDown: new Set<string>(),
    charging: false,
    chargePower: 0, // 0-100, fills while space held
    chargeDir: 1, // 1 = up, -1 = down (oscillates)
  });

  // Reactive state for UI below canvas
  const [phase, setPhase] = useState<Phase>("menu");
  const [turn, setTurn] = useState<0 | 1>(0);
  const [wind, setWind] = useState(0);
  const [hp, setHp] = useState<[number, number]>([MAX_HP, MAX_HP]);
  const [winner, setWinner] = useState<number | null>(null);
  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // Load sprites
  useEffect(() => {
    (async () => {
      try {
        const [idles, atks] = await Promise.all([
          Promise.all(
            Array.from({ length: FRAMES }, (_, i) =>
              loadImage(`/game/knight/idle/2D_KNIGHT__Idle_00${i}.png`)
            )
          ),
          Promise.all(
            Array.from({ length: FRAMES }, (_, i) =>
              loadImage(`/game/knight/attack/2D_KNIGHT__Attack_00${i}.png`)
            )
          ),
        ]);
        spritesRef.current = {
          p1Idle: idles,
          p1Atk: atks,
          p2Idle: idles.map(tintRed),
          p2Atk: atks.map(tintRed),
          loaded: true,
        };
        setSpritesLoaded(true);
      } catch (e) {
        console.error("Sprite load failed", e);
      }
    })();
  }, []);

  // ─── Keyboard handling ───────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Prevent page scroll
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      const s = g.current;
      if (e.type === "keydown") {
        s.keysDown.add(e.key);

        // Space starts charging
        if (e.key === " " && !e.repeat && (s.phase === "aim")) {
          s.phase = "charging";
          s.charging = true;
          s.chargePower = 0;
          s.chargeDir = 1;
          setPhase("charging");
        }

        // Enter to start game from menu / restart from over
        if (e.key === "Enter" && (s.phase === "menu" || s.phase === "over")) {
          startGame();
        }
      }

      if (e.type === "keyup") {
        s.keysDown.delete(e.key);

        // Space release = fire
        if (e.key === " " && s.charging && s.phase === "charging") {
          s.charging = false;
          s.players[s.turn].power = s.chargePower;
          doFire();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Draw ────────────────────────────────────────────────
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, ts: number) => {
      const s = g.current;
      const sp = spritesRef.current;

      // Anim tick
      if (ts - s.animTimer > ANIM_SPEED) {
        s.animFrame = (s.animFrame + 1) % FRAMES;
        s.animTimer = ts;
        for (let i = 0; i < 2; i++) {
          if (s.isAttacking[i]) {
            s.attackFrame[i]++;
            if (s.attackFrame[i] >= FRAMES) {
              s.isAttacking[i] = false;
              s.attackFrame[i] = 0;
            }
          }
        }
      }

      // ── Input: arrows adjust angle ──
      if (s.phase === "aim" || s.phase === "charging") {
        const p = s.players[s.turn];
        if (s.keysDown.has("ArrowUp")) p.angle = Math.min(175, p.angle + 1);
        if (s.keysDown.has("ArrowDown")) p.angle = Math.max(5, p.angle - 1);
        if (s.keysDown.has("ArrowLeft")) p.angle = Math.min(175, p.angle + 1);
        if (s.keysDown.has("ArrowRight")) p.angle = Math.max(5, p.angle - 1);
      }

      // ── Charge power oscillation ──
      if (s.charging && s.phase === "charging") {
        s.chargePower += POWER_CHARGE_SPEED * s.chargeDir;
        if (s.chargePower >= 100) {
          s.chargePower = 100;
          s.chargeDir = -1;
        }
        if (s.chargePower <= 0) {
          s.chargePower = 0;
          s.chargeDir = 1;
        }
      }

      // ── Sky ──
      const sky = ctx.createLinearGradient(0, 0, 0, CH);
      sky.addColorStop(0, "#1a1a2e");
      sky.addColorStop(0.5, "#16213e");
      sky.addColorStop(1, "#0f3460");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CW, CH);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < 60; i++) {
        ctx.fillRect((i * 137.5) % CW, (i * 97.3) % (CH * 0.4), 1.5, 1.5);
      }

      // ── Terrain ──
      const terrain = s.terrain;
      const tg = ctx.createLinearGradient(0, CH * 0.4, 0, CH);
      tg.addColorStop(0, "#2d5016");
      tg.addColorStop(0.3, "#1a3a0a");
      tg.addColorStop(1, "#0d1f05");
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(0, CH);
      for (let x = 0; x < CW; x++) ctx.lineTo(x, terrain[x]);
      ctx.lineTo(CW, CH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a8c1f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < CW; x++) {
        x === 0 ? ctx.moveTo(x, terrain[x]) : ctx.lineTo(x, terrain[x]);
      }
      ctx.stroke();

      // ── Characters ──
      if (sp.loaded) {
        for (let pi = 0; pi < 2; pi++) {
          const p = s.players[pi];
          const ty = getTerrainY(terrain, p.x);
          const isAtk = s.isAttacking[pi];
          const sprites =
            pi === 0
              ? isAtk ? sp.p1Atk : sp.p1Idle
              : isAtk ? sp.p2Atk : sp.p2Idle;
          const frame = Math.min(
            isAtk ? s.attackFrame[pi] : s.animFrame,
            FRAMES - 1
          );
          const img = sprites[frame];

          ctx.save();
          if (pi === 1) {
            ctx.translate(p.x, ty - CHAR_H);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -CHAR_W / 2, 0, CHAR_W, CHAR_H);
          } else {
            ctx.drawImage(img, p.x - CHAR_W / 2, ty - CHAR_H, CHAR_W, CHAR_H);
          }
          ctx.restore();

          // ── Aim line ──
          if ((s.phase === "aim" || s.phase === "charging") && s.turn === pi) {
            const rad =
              pi === 0
                ? (p.angle * Math.PI) / 180
                : ((180 - p.angle) * Math.PI) / 180;
            const orig = { x: p.x, y: ty - CHAR_H * 0.5 };
            const lineLen = 60;
            const tip = {
              x: orig.x + Math.cos(rad) * lineLen,
              y: orig.y - Math.sin(rad) * lineLen,
            };
            const color = pi === 0 ? "rgba(100,200,255," : "rgba(255,100,100,";

            // Dotted line
            ctx.strokeStyle = color + "0.9)";
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 5]);
            ctx.beginPath();
            ctx.moveTo(orig.x, orig.y);
            ctx.lineTo(tip.x, tip.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Arrowhead
            const aLen = 12;
            const aAng = 0.4;
            ctx.fillStyle = color + "0.9)";
            ctx.beginPath();
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(
              tip.x - Math.cos(rad - aAng) * aLen,
              tip.y + Math.sin(rad - aAng) * aLen
            );
            ctx.lineTo(
              tip.x - Math.cos(rad + aAng) * aLen,
              tip.y + Math.sin(rad + aAng) * aLen
            );
            ctx.closePath();
            ctx.fill();

            // Angle label near character
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${p.angle}°`, p.x, ty - CHAR_H - 8);
          }
        }
      }

      // ── Projectile (BIG and visible!) ──
      if (s.proj) {
        const pr = s.proj;

        // Trail - thick and bright
        for (let i = 0; i < pr.trail.length; i++) {
          const t = i / pr.trail.length;
          const r = 3 + t * (BULLET_RADIUS - 2);
          ctx.fillStyle = `rgba(255,${150 + Math.round(t * 105)},0,${t * 0.7})`;
          ctx.beginPath();
          ctx.arc(pr.trail[i].x, pr.trail[i].y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer glow
        ctx.save();
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Core bright center
        const bg = ctx.createRadialGradient(
          pr.x - 2, pr.y - 2, 0,
          pr.x, pr.y, BULLET_RADIUS
        );
        bg.addColorStop(0, "#ffffff");
        bg.addColorStop(0.3, "#ffee44");
        bg.addColorStop(0.7, "#ff6600");
        bg.addColorStop(1, "rgba(255,50,0,0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Spark particles around bullet
        for (let i = 0; i < 5; i++) {
          const sa = ((ts / 50) + i * 1.25) % (Math.PI * 2);
          const sd = BULLET_RADIUS + 4 + Math.sin(ts / 80 + i) * 3;
          ctx.fillStyle = `rgba(255,200,50,${0.5 + Math.sin(ts / 60 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(
            pr.x + Math.cos(sa) * sd,
            pr.y + Math.sin(sa) * sd,
            2, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }

      // ── Explosions ──
      for (let i = s.booms.length - 1; i >= 0; i--) {
        const b = s.booms[i];
        // Big radial gradient explosion
        const eg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        eg.addColorStop(0, `rgba(255,255,200,${b.alpha})`);
        eg.addColorStop(0.2, `rgba(255,200,50,${b.alpha})`);
        eg.addColorStop(0.5, `rgba(255,100,0,${b.alpha * 0.7})`);
        eg.addColorStop(1, `rgba(200,0,0,0)`);
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        // Shockwave ring
        if (b.alpha > 0.3) {
          ctx.strokeStyle = `rgba(255,255,255,${b.alpha * 0.5})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 1.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        b.r += 2.5;
        b.alpha -= 0.025;
        if (b.alpha <= 0) s.booms.splice(i, 1);
      }

      // ── HUD ──
      // Health bars
      for (let pi = 0; pi < 2; pi++) {
        const bx = pi === 0 ? 20 : CW - 220;
        const p = s.players[pi];
        ctx.fillStyle = pi === 0 ? "#64c8ff" : "#ff6464";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(
          pi === 0 ? "Player 1 (Knight)" : "Player 2 (Knight)",
          bx, 25
        );
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(bx, 32, 200, 16);
        const pct = p.hp / MAX_HP;
        ctx.fillStyle = pct > 0.5 ? "#4caf50" : pct > 0.25 ? "#ff9800" : "#f44336";
        ctx.fillRect(bx + 1, 33, 198 * pct, 14);
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${p.hp} / ${MAX_HP}`, bx + 100, 45);
      }

      // Wind
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("WIND", CW / 2, 20);
      const ww = 120;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(CW / 2 - ww / 2, 26, ww, 12);
      if (s.wind !== 0) {
        const wpx = (s.wind / 5) * (ww / 2);
        ctx.fillStyle = s.wind > 0 ? "rgba(100,200,255,0.7)" : "rgba(255,150,100,0.7)";
        ctx.fillRect(
          s.wind > 0 ? CW / 2 : CW / 2 + wpx,
          27, Math.abs(wpx), 10
        );
      }
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CW / 2, 26);
      ctx.lineTo(CW / 2, 38);
      ctx.stroke();
      ctx.fillStyle = "#ccc";
      ctx.font = "10px sans-serif";
      ctx.fillText(
        s.wind > 0 ? `→ ${s.wind.toFixed(1)}` : s.wind < 0 ? `← ${Math.abs(s.wind).toFixed(1)}` : "Calm",
        CW / 2, 52
      );

      // ── Power charge bar (big, centered, visible!) ──
      if (s.phase === "charging") {
        const barW = 300;
        const barH = 28;
        const barX = CW / 2 - barW / 2;
        const barY = CH - 70;

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 6);
        ctx.fill();
        ctx.stroke();

        // Power fill with gradient
        const pct = s.chargePower / 100;
        const pg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        pg.addColorStop(0, "#22cc44");
        pg.addColorStop(0.5, "#ffcc00");
        pg.addColorStop(0.8, "#ff6600");
        pg.addColorStop(1, "#ff0000");
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * pct, barH, 4);
        ctx.fill();

        // Power text
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `POWER: ${Math.round(s.chargePower)}%`,
          CW / 2, barY + barH / 2 + 6
        );

        // "Release SPACE to fire" hint
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "13px sans-serif";
        ctx.fillText("Release SPACE to fire!", CW / 2, barY + barH + 20);
      }

      // Turn indicator
      if (s.phase === "aim") {
        const label = `Player ${s.turn + 1}'s Turn`;
        ctx.fillStyle = s.turn === 0 ? "#64c8ff" : "#ff6464";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, CW / 2, CH - 50);

        // Controls hint
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "13px sans-serif";
        ctx.fillText(
          "↑↓ Angle  |  Hold SPACE to charge power",
          CW / 2, CH - 30
        );
      }

      // Game over
      if (s.phase === "over" && s.winner !== null) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = s.winner === 0 ? "#64c8ff" : "#ff6464";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Player ${s.winner + 1} Wins!`, CW / 2, CH / 2 - 20);
        ctx.fillStyle = "#aaa";
        ctx.font = "16px sans-serif";
        ctx.fillText("Press Enter or click 'New Game'", CW / 2, CH / 2 + 20);
      }

      // Menu
      if (s.phase === "menu") {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = "#ff6600";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GunPow Arena", CW / 2, CH / 2 - 40);
        ctx.fillStyle = "#ccc";
        ctx.font = "18px sans-serif";
        ctx.fillText("Turn-based artillery battle", CW / 2, CH / 2);
        ctx.fillStyle = "#64c8ff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Press Enter or click Start!", CW / 2, CH / 2 + 40);
      }
    },
    []
  );

  // ─── Game loop ───────────────────────────────────────────
  useEffect(() => {
    if (!spritesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let running = true;

    function loop(ts: number) {
      if (!running || !ctx) return;
      const s = g.current;

      // Physics
      if (s.phase === "fire" && s.proj) {
        const p = s.proj;
        p.age++;
        p.vy += GRAVITY;
        p.vx += s.wind * 0.002;
        p.x += p.vx;
        p.y += p.vy;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 50) p.trail.shift();

        // Terrain collision (skip first few frames so bullet clears the ground)
        if (p.age > 5 && p.x >= 0 && p.x < CW && p.y >= getTerrainY(s.terrain, p.x)) {
          explode(p.x, p.y);
          requestAnimationFrame(loop);
          return;
        }

        // Player hit (skip the player who fired for first 15 frames)
        for (let pi = 0; pi < 2; pi++) {
          if (pi === p.firedBy && p.age < 15) continue;
          const pl = s.players[pi];
          const ty = getTerrainY(s.terrain, pl.x);
          const dx = p.x - pl.x;
          const dy = p.y - (ty - CHAR_H / 2);
          if (Math.sqrt(dx * dx + dy * dy) < CHAR_W / 2) {
            explode(p.x, p.y);
            requestAnimationFrame(loop);
            return;
          }
        }

        // Out of bounds
        if (p.x < -80 || p.x > CW + 80 || p.y > CH + 80) {
          s.proj = null;
          nextTurn();
        }
      }

      draw(ctx, ts);
      requestAnimationFrame(loop);
    }

    function explode(ex: number, ey: number) {
      const s = g.current;
      s.proj = null;
      s.booms.push({ x: ex, y: ey, r: 8, alpha: 1 });

      // Crater
      for (
        let x = Math.max(0, Math.floor(ex - BOOM_R));
        x < Math.min(CW, Math.ceil(ex + BOOM_R));
        x++
      ) {
        const d = Math.abs(x - ex);
        if (d < BOOM_R) {
          s.terrain[x] = Math.min(
            CH - 5,
            s.terrain[x] + Math.sqrt(BOOM_R * BOOM_R - d * d) * 0.6
          );
        }
      }

      // Damage
      for (let pi = 0; pi < 2; pi++) {
        const pl = s.players[pi];
        const ty = getTerrainY(s.terrain, pl.x);
        const dist = Math.hypot(ex - pl.x, ey - (ty - CHAR_H / 2));
        if (dist < BOOM_R * 2.5) {
          const dmg = Math.round(Math.max(5, 35 * (1 - dist / (BOOM_R * 2.5))));
          pl.hp = Math.max(0, pl.hp - dmg);
          setHp([s.players[0].hp, s.players[1].hp]);
          if (pl.hp <= 0) {
            s.phase = "over";
            s.winner = pi === 0 ? 1 : 0;
            setPhase("over");
            setWinner(s.winner);
            return;
          }
        }
      }

      setTimeout(nextTurn, 700);
    }

    function nextTurn() {
      const s = g.current;
      if (s.phase === "over") return;
      s.turn = s.turn === 0 ? 1 : 0;
      s.wind = +(Math.random() * 10 - 5).toFixed(1);
      s.phase = "aim";
      s.chargePower = 0;
      s.charging = false;
      setTurn(s.turn);
      setWind(s.wind);
      setPhase("aim");
    }

    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [spritesLoaded, draw]);

  // ─── Actions ─────────────────────────────────────────────
  const startGame = useCallback(() => {
    const s = g.current;
    s.terrain = makeTerrain();
    s.players = [
      { x: 80 + Math.random() * 100, hp: MAX_HP, angle: 45, power: 0 },
      { x: CW - 80 - Math.random() * 100, hp: MAX_HP, angle: 135, power: 0 },
    ];
    s.proj = null;
    s.booms = [];
    s.winner = null;
    s.turn = 0;
    s.wind = +(Math.random() * 10 - 5).toFixed(1);
    s.phase = "aim";
    s.isAttacking = [false, false];
    s.attackFrame = [0, 0];
    s.chargePower = 0;
    s.charging = false;
    setPhase("aim");
    setTurn(0);
    setWind(s.wind);
    setHp([MAX_HP, MAX_HP]);
    setWinner(null);
    // Focus canvas area so keyboard works
    containerRef.current?.focus();
  }, []);

  const doFire = useCallback(() => {
    const s = g.current;
    if (s.phase !== "charging") return;
    const pi = s.turn;
    const p = s.players[pi];
    const ty = getTerrainY(s.terrain, p.x);
    const power = Math.max(10, s.chargePower);

    s.isAttacking[pi] = true;
    s.attackFrame[pi] = 0;

    const rad =
      pi === 0
        ? (p.angle * Math.PI) / 180
        : ((180 - p.angle) * Math.PI) / 180;
    const speed = power * BULLET_SPEED;

    // Spawn bullet ahead of the character so it doesn't self-collide
    const spawnOffset = CHAR_W * 0.8;
    s.proj = {
      x: p.x + Math.cos(rad) * spawnOffset,
      y: ty - CHAR_H * 0.5 - Math.sin(rad) * spawnOffset,
      vx: Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
      trail: [],
      firedBy: pi as 0 | 1,
      age: 0,
    };
    s.phase = "fire";
    setPhase("fire");
  }, []);

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        tabIndex={0}
        className="overflow-hidden rounded-xl border border-border outline-none focus:ring-2 focus:ring-foreground/30"
        onClick={() => containerRef.current?.focus()}
      >
        <div className="relative w-full" style={{ aspectRatio: `${CW}/${CH}` }}>
          {!spritesLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                <p className="mt-3 text-muted-foreground">Loading sprites...</p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Controls bar */}
      <div className="rounded-xl border border-border bg-accent/50 p-4">
        {phase === "menu" && (
          <div className="flex justify-center">
            <button
              onClick={startGame}
              disabled={!spritesLoaded}
              className="cursor-pointer rounded-lg bg-foreground px-8 py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Start Game
            </button>
          </div>
        )}

        {phase === "over" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-lg font-bold">
              {winner !== null ? `Player ${winner + 1} wins!` : "Game Over"}
            </p>
            <button
              onClick={startGame}
              className="cursor-pointer rounded-lg bg-foreground px-8 py-3 font-semibold text-background transition-opacity hover:opacity-90"
            >
              New Game
            </button>
          </div>
        )}

        {(phase === "aim" || phase === "charging" || phase === "fire") && (
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${turn === 0 ? "bg-blue-400" : "bg-red-400"}`}
              />
              <span className="font-semibold">Player {turn + 1}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Wind: </span>
              <span className="font-mono font-semibold">
                {wind > 0 ? `→ ${wind}` : wind < 0 ? `← ${Math.abs(wind)}` : "Calm"}
              </span>
            </div>

            <div>
              <span className="text-blue-400">P1: {hp[0]}</span>
              {" / "}
              <span className="text-red-400">P2: {hp[1]}</span>
            </div>

            <div className="text-muted-foreground">
              ↑↓ Angle &nbsp;|&nbsp; Hold <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono">Space</kbd> to charge &amp; release to fire
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold">Arrow Keys to Aim</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Press ↑↓ to adjust your firing angle
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold">Hold Space to Charge</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Power oscillates 0→100→0 — release at the right moment!
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold">Destructible Terrain</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Explosions carve craters — use terrain to your advantage
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Character sprites from{" "}
        <a
          href="https://opengameart.org/content/2d-knight-chibi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          OpenGameArt.org
        </a>{" "}
        (CC0 License)
      </p>
    </div>
  );
}
