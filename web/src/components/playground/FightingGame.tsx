"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  action: "idle" | "walk" | "jump" | "punch" | "kick" | "hit" | "dead";
  facing: "left" | "right";
  attackFrame: number;
  hitFrame: number;
  alive: boolean;
}

export interface FightingGameProps {
  players: Map<string, PlayerState>;
  localPlayerId: string;
  onLocalStateChange: (state: PlayerState) => void;
  onHit: (targetId: string, damage: number) => void;
  onDead: () => void;
  gameActive: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_W = 800;
const CANVAS_H = 450;
const GROUND_Y = 390;
const GRAVITY = 0.55;
const JUMP_FORCE = -11;
const MOVE_SPEED = 3.5;
const PLAYER_W = 36;
const PLAYER_H = 56;
const PUNCH_RANGE = 48;
const KICK_RANGE = 58;
const PUNCH_DAMAGE = 8;
const KICK_DAMAGE = 13;
const ATTACK_FRAMES = 12;
const HIT_FRAMES = 10;
const ATTACK_COOLDOWN = 22;

// Character type based on color
type CharacterType = "ninja" | "fighter";

function getCharacterType(color: string): CharacterType {
  const ninjaColors = ["#3b82f6", "#06b6d4", "#a855f7", "#22c55e"];
  return ninjaColors.includes(color) ? "ninja" : "fighter";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FightingGame({
  players,
  localPlayerId,
  onLocalStateChange,
  onHit,
  onDead,
  gameActive,
}: FightingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const cooldownRef = useRef(0);
  const frameCountRef = useRef(0);
  const playersRef = useRef(players);
  const gameActiveRef = useRef(gameActive);
  const localPlayerRef = useRef<PlayerState | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [canvasScale, setCanvasScale] = useState(1);

  playersRef.current = players;
  gameActiveRef.current = gameActive;

  // Track local player — sync health from parent (AI damage) but keep local position
  useEffect(() => {
    const lp = players.get(localPlayerId);
    if (lp && localPlayerRef.current) {
      localPlayerRef.current.health = lp.health;
      localPlayerRef.current.hitFrame = Math.max(localPlayerRef.current.hitFrame, lp.hitFrame);
      localPlayerRef.current.alive = lp.alive;
      if (!lp.alive) localPlayerRef.current.action = "dead";
    } else if (lp) {
      localPlayerRef.current = { ...lp };
    }
  }, [players, localPlayerId]);

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyZ", "KeyX", "Space"].includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const scale = Math.min(parent.clientWidth / CANVAS_W, 1);
      setCanvasScale(scale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Game Loop ─────────────────────────────────────────────────────────────

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    frameCountRef.current++;
    const frame = frameCountRef.current;

    // Update local player
    const local = localPlayerRef.current;
    if (local && local.alive && gameActiveRef.current) {
      const keys = keysRef.current;
      const onGround = local.y >= GROUND_Y - PLAYER_H;

      // Movement
      if (local.hitFrame <= 0 && local.attackFrame <= 0) {
        let moving = false;
        if (keys.has("ArrowLeft") || keys.has("KeyA")) {
          local.vx = -MOVE_SPEED;
          local.facing = "left";
          moving = true;
        } else if (keys.has("ArrowRight") || keys.has("KeyD")) {
          local.vx = MOVE_SPEED;
          local.facing = "right";
          moving = true;
        } else {
          local.vx *= 0.7;
          if (Math.abs(local.vx) < 0.3) local.vx = 0;
        }

        // Jump
        if ((keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Space")) && onGround) {
          local.vy = JUMP_FORCE;
        }

        // Attack
        if (cooldownRef.current <= 0) {
          if (keys.has("KeyZ")) {
            local.action = "punch";
            local.attackFrame = ATTACK_FRAMES;
            cooldownRef.current = ATTACK_COOLDOWN;
            checkAttackHits(local, PUNCH_RANGE, PUNCH_DAMAGE);
          } else if (keys.has("KeyX")) {
            local.action = "kick";
            local.attackFrame = ATTACK_FRAMES;
            cooldownRef.current = ATTACK_COOLDOWN;
            checkAttackHits(local, KICK_RANGE, KICK_DAMAGE);
          }
        }

        if (local.attackFrame <= 0) {
          if (!onGround) local.action = "jump";
          else if (moving) local.action = "walk";
          else local.action = "idle";
        }
      }

      // Physics
      local.vy += GRAVITY;
      local.x += local.vx;
      local.y += local.vy;

      // Bounds
      if (local.x < 0) local.x = 0;
      if (local.x > CANVAS_W - PLAYER_W) local.x = CANVAS_W - PLAYER_W;
      if (local.y >= GROUND_Y - PLAYER_H) {
        local.y = GROUND_Y - PLAYER_H;
        local.vy = 0;
      }

      // Tick cooldowns
      if (local.attackFrame > 0) local.attackFrame--;
      if (local.hitFrame > 0) local.hitFrame--;
      if (cooldownRef.current > 0) cooldownRef.current--;

      // Check death
      if (local.health <= 0 && local.alive) {
        local.alive = false;
        local.action = "dead";
        onDead();
      }

      // Send state update every 3 frames
      if (frame % 3 === 0) {
        onLocalStateChange({ ...local });
      }
    }

    // Update particles
    updateParticles();

    // ─── Render ────────────────────────────────────────────────────────────

    renderBackground(ctx, frame);

    // Render all players
    const allPlayers = Array.from(playersRef.current.values());
    for (const p of allPlayers) {
      const state = p.id === localPlayerId && localPlayerRef.current ? localPlayerRef.current : p;
      renderPlayer(ctx, state, frame);
    }

    // Render particles
    renderParticles(ctx);

    // HUD
    renderHUD(ctx, allPlayers, localPlayerId);

    // Game over overlay
    if (gameActiveRef.current) {
      const alivePlayers = allPlayers.filter((p) => {
        const s = p.id === localPlayerId && localPlayerRef.current ? localPlayerRef.current : p;
        return s.alive;
      });
      if (alivePlayers.length <= 1 && allPlayers.length > 1) {
        const winner = alivePlayers[0];
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Victory text with glow
        ctx.save();
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 40px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        if (winner) {
          ctx.fillText(`${winner.name} WINS!`, CANVAS_W / 2, CANVAS_H / 2 - 10);
        } else {
          ctx.fillText("DRAW!", CANVAS_W / 2, CANVAS_H / 2);
        }
        ctx.restore();
      }
    }

    // Not active overlay
    if (!gameActiveRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.save();
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for players...", CANVAS_W / 2, CANVAS_H / 2);
      ctx.restore();
    }
  }, [localPlayerId, onLocalStateChange, onDead]);

  // Check attack hits against other players
  function checkAttackHits(attacker: PlayerState, range: number, damage: number) {
    const allPlayers = Array.from(playersRef.current.values());
    const ax = attacker.facing === "right" ? attacker.x + PLAYER_W : attacker.x - range;
    const ay = attacker.y;

    for (const target of allPlayers) {
      if (target.id === attacker.id || !target.alive) continue;
      const tx = target.x;
      const ty = target.y;

      if (
        ax < tx + PLAYER_W &&
        ax + range > tx &&
        ay < ty + PLAYER_H &&
        ay + PLAYER_H > ty
      ) {
        onHit(target.id, damage);
        const px = attacker.facing === "right" ? tx : tx + PLAYER_W;
        spawnHitParticles(px, ty + PLAYER_H / 2, damage > 10 ? "#ff6b35" : "#fbbf24");
      }
    }
  }

  // ─── Particles ─────────────────────────────────────────────────────────────

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: "spark" | "dust";
  }

  function spawnHitParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 15 + Math.random() * 15,
        maxLife: 30,
        color,
        size: 1.5 + Math.random() * 3,
        type: "spark",
      });
    }
    // Impact flash
    particlesRef.current.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 6,
      maxLife: 6,
      color: "#fff",
      size: 18,
      type: "spark",
    });
  }

  function updateParticles() {
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.97;
      p.life--;
      return p.life > 0;
    });
  }

  function renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of particlesRef.current) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      if (p.size > 10) {
        // Flash effect
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ─── Background ────────────────────────────────────────────────────────────

  function renderBackground(ctx: CanvasRenderingContext2D, frame: number) {
    // Sky gradient - night city
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, "#0a0a1a");
    sky.addColorStop(0.3, "#0f1128");
    sky.addColorStop(0.7, "#151a3a");
    sky.addColorStop(1, "#1a1f45");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    const starSeed = [23, 67, 134, 201, 289, 356, 412, 478, 534, 601, 667, 723, 55, 189, 345, 500, 656];
    for (const s of starSeed) {
      const sx = (s * 3.7) % CANVAS_W;
      const sy = (s * 1.3) % (GROUND_Y * 0.4);
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + s));
      ctx.globalAlpha = twinkle * 0.7;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;

    // Moon
    ctx.save();
    ctx.shadowColor = "#c4d4ff";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#dde4ff";
    ctx.beginPath();
    ctx.arc(680, 55, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Moon dark side
    ctx.fillStyle = "#0a0a1a";
    ctx.beginPath();
    ctx.arc(688, 50, 15, 0, Math.PI * 2);
    ctx.fill();

    // Background buildings (far layer) - dark silhouettes
    ctx.fillStyle = "#0d0f20";
    drawBuildingLayer(ctx, [
      { x: 0, w: 60, h: 130 },
      { x: 55, w: 45, h: 170 },
      { x: 95, w: 70, h: 110 },
      { x: 160, w: 50, h: 195 },
      { x: 205, w: 80, h: 140 },
      { x: 280, w: 55, h: 180 },
      { x: 330, w: 70, h: 120 },
      { x: 395, w: 45, h: 200 },
      { x: 435, w: 85, h: 155 },
      { x: 515, w: 50, h: 185 },
      { x: 560, w: 65, h: 130 },
      { x: 620, w: 55, h: 175 },
      { x: 670, w: 75, h: 145 },
      { x: 740, w: 60, h: 165 },
    ], GROUND_Y);

    // Far building windows (dim yellow/blue)
    drawBuildingWindows(ctx, [
      { x: 0, w: 60, h: 130 },
      { x: 55, w: 45, h: 170 },
      { x: 95, w: 70, h: 110 },
      { x: 160, w: 50, h: 195 },
      { x: 205, w: 80, h: 140 },
      { x: 280, w: 55, h: 180 },
      { x: 330, w: 70, h: 120 },
      { x: 395, w: 45, h: 200 },
      { x: 435, w: 85, h: 155 },
      { x: 515, w: 50, h: 185 },
      { x: 560, w: 65, h: 130 },
      { x: 620, w: 55, h: 175 },
      { x: 670, w: 75, h: 145 },
      { x: 740, w: 60, h: 165 },
    ], GROUND_Y, 0.2, frame);

    // Midground buildings
    ctx.fillStyle = "#111328";
    drawBuildingLayer(ctx, [
      { x: 20, w: 80, h: 100 },
      { x: 120, w: 60, h: 80 },
      { x: 200, w: 100, h: 120 },
      { x: 320, w: 70, h: 90 },
      { x: 420, w: 90, h: 110 },
      { x: 540, w: 65, h: 75 },
      { x: 630, w: 85, h: 105 },
      { x: 730, w: 70, h: 85 },
    ], GROUND_Y);

    // Midground windows
    drawBuildingWindows(ctx, [
      { x: 20, w: 80, h: 100 },
      { x: 120, w: 60, h: 80 },
      { x: 200, w: 100, h: 120 },
      { x: 320, w: 70, h: 90 },
      { x: 420, w: 90, h: 110 },
      { x: 540, w: 65, h: 75 },
      { x: 630, w: 85, h: 105 },
      { x: 730, w: 70, h: 85 },
    ], GROUND_Y, 0.35, frame);

    // Ground / arena floor
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    groundGrad.addColorStop(0, "#1e2040");
    groundGrad.addColorStop(0.3, "#181a35");
    groundGrad.addColorStop(1, "#10122a");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

    // Ground line with glow
    ctx.save();
    ctx.shadowColor = "#4a5aff";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "#3a4a8a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();
    ctx.restore();

    // Subtle ground grid
    ctx.strokeStyle = "rgba(60,70,140,0.15)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = GROUND_Y + 15; y < CANVAS_H; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }
  }

  function drawBuildingLayer(
    ctx: CanvasRenderingContext2D,
    buildings: { x: number; w: number; h: number }[],
    groundY: number
  ) {
    for (const b of buildings) {
      ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
    }
  }

  function drawBuildingWindows(
    ctx: CanvasRenderingContext2D,
    buildings: { x: number; w: number; h: number }[],
    groundY: number,
    brightness: number,
    frame: number
  ) {
    for (const b of buildings) {
      const cols = Math.floor(b.w / 14);
      const rows = Math.floor(b.h / 18);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Pseudo-random on/off based on position
          const hash = (b.x * 7 + c * 13 + r * 31) % 10;
          if (hash > 5) continue;
          const flicker = 0.7 + 0.3 * Math.sin(frame * 0.01 + hash * 2);
          const wx = b.x + 5 + c * 14;
          const wy = groundY - b.h + 8 + r * 18;
          const isWarm = hash < 3;
          ctx.fillStyle = isWarm
            ? `rgba(255,220,130,${brightness * flicker})`
            : `rgba(140,180,255,${brightness * flicker * 0.7})`;
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }
  }

  // ─── Character Rendering ───────────────────────────────────────────────────

  function renderPlayer(ctx: CanvasRenderingContext2D, p: PlayerState, frame: number) {
    const charType = getCharacterType(p.color);

    if (!p.alive && p.action === "dead") {
      renderDeadPlayer(ctx, p, charType);
      return;
    }

    // Hit flash
    if (p.hitFrame > 0 && frame % 4 < 2) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    const cx = p.x + PLAYER_W / 2;
    const cy = p.y;
    const flip = p.facing === "left" ? -1 : 1;

    ctx.translate(cx, cy);
    ctx.scale(flip, 1);

    if (charType === "ninja") {
      renderNinja(ctx, p, frame);
    } else {
      renderFighter(ctx, p, frame);
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    // Glow effect for ninja
    if (charType === "ninja" && p.alive) {
      ctx.save();
      ctx.globalAlpha = 0.15 + 0.05 * Math.sin(frame * 0.08);
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.ellipse(cx, p.y + PLAYER_H - 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Health bar above player
    renderPlayerHealthBar(ctx, p);

    // Name tag
    ctx.fillStyle = "#bbb";
    ctx.font = "bold 9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.name, cx, p.y - 16);
  }

  function renderDeadPlayer(ctx: CanvasRenderingContext2D, p: PlayerState, charType: CharacterType) {
    ctx.globalAlpha = 0.35;
    ctx.save();
    ctx.translate(p.x + PLAYER_W / 2, GROUND_Y - 8);
    ctx.rotate(Math.PI / 2);
    ctx.scale(0.8, 0.8);
    if (charType === "ninja") {
      // Simplified fallen ninja
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(-PLAYER_W / 2, -25, PLAYER_W, PLAYER_H);
      ctx.fillStyle = "#2a2a4e";
      ctx.beginPath();
      ctx.arc(0, -28, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Simplified fallen fighter
      ctx.fillStyle = "#5a1a1a";
      ctx.fillRect(-PLAYER_W / 2, -25, PLAYER_W, PLAYER_H);
      ctx.fillStyle = "#7a2a2a";
      ctx.beginPath();
      ctx.arc(0, -28, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function renderNinja(ctx: CanvasRenderingContext2D, p: PlayerState, frame: number) {
    const breathe = Math.sin(frame * 0.06) * 1.5;
    const walkCycle = Math.sin(frame * 0.2) * 12;

    // Shadow beneath
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, PLAYER_H, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Legs ──
    ctx.strokeStyle = "#1a1a30";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    if (p.action === "walk") {
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-5, 38);
      ctx.lineTo(-5 + walkCycle * 0.4, PLAYER_H + 1);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(5, 38);
      ctx.lineTo(5 - walkCycle * 0.4, PLAYER_H + 1);
      ctx.stroke();
    } else if (p.action === "kick" && p.attackFrame > 0) {
      // Back leg planted
      ctx.beginPath();
      ctx.moveTo(-5, 38);
      ctx.lineTo(-10, PLAYER_H + 1);
      ctx.stroke();
      // Kicking leg extended
      ctx.strokeStyle = "#2a2a50";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(5, 36);
      ctx.lineTo(30, 34);
      ctx.stroke();
      // Glowing foot
      ctx.save();
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(32, 34, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.action === "jump") {
      ctx.beginPath();
      ctx.moveTo(-5, 38);
      ctx.lineTo(-8, 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, 38);
      ctx.lineTo(8, 48);
      ctx.stroke();
    } else {
      // Idle
      ctx.beginPath();
      ctx.moveTo(-5, 38);
      ctx.lineTo(-7, PLAYER_H + breathe);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, 38);
      ctx.lineTo(7, PLAYER_H + breathe);
      ctx.stroke();
    }

    // Ninja shoes
    ctx.fillStyle = "#111";
    if (p.action === "walk") {
      ctx.fillRect(-8 + walkCycle * 0.4, PLAYER_H - 2, 7, 4);
      ctx.fillRect(2 - walkCycle * 0.4, PLAYER_H - 2, 7, 4);
    } else if (p.action !== "kick") {
      ctx.fillRect(-10, PLAYER_H - 2 + breathe, 7, 4);
      ctx.fillRect(4, PLAYER_H - 2 + breathe, 7, 4);
    }

    // ── Torso ──
    // Dark ninja outfit
    ctx.fillStyle = "#1a1a30";
    ctx.beginPath();
    ctx.moveTo(-13, 14);
    ctx.lineTo(13, 14);
    ctx.lineTo(11, 40);
    ctx.lineTo(-11, 40);
    ctx.closePath();
    ctx.fill();
    // Outfit detail - center line
    ctx.strokeStyle = "#2a2a50";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, 40);
    ctx.stroke();
    // Belt with blue glow
    ctx.save();
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(-12, 32, 24, 4);
    ctx.restore();

    // ── Arms ──
    ctx.strokeStyle = "#1a1a30";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    if (p.action === "punch" && p.attackFrame > 0) {
      // Punching arm extended
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(32, 18);
      ctx.stroke();
      // Glowing fist
      ctx.save();
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.arc(34, 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Back arm
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(-14, 30);
      ctx.stroke();
    } else if (p.action === "kick" && p.attackFrame > 0) {
      // Arms in guard position
      ctx.beginPath();
      ctx.moveTo(10, 18);
      ctx.lineTo(16, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 18);
      ctx.lineTo(-16, 14);
      ctx.stroke();
    } else if (p.action === "walk") {
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(10 + Math.sin(frame * 0.2) * 8, 34);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(-10 - Math.sin(frame * 0.2) * 8, 34);
      ctx.stroke();
    } else {
      // Idle combat stance
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(16, 16 + breathe * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(-15, 28 + breathe * 0.5);
      ctx.stroke();
    }

    // ── Head ──
    // Ninja hood
    ctx.fillStyle = "#1a1a30";
    ctx.beginPath();
    ctx.arc(0, 7, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a2a50";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Mask band / eyes area
    ctx.fillStyle = "#0f0f20";
    ctx.fillRect(-10, 3, 20, 7);

    // Eyes - glowing blue
    ctx.save();
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(2, 4, 5, 4);
    ctx.fillRect(-7, 4, 5, 4);
    // Pupils
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(4, 5, 2, 2);
    ctx.fillRect(-5, 5, 2, 2);
    ctx.restore();

    // Headband tails (flowing)
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    const tailWave = Math.sin(frame * 0.1) * 4;
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(-18, 6 + tailWave, -24, 10 + tailWave);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.quadraticCurveTo(-16, 10 + tailWave * 0.7, -20, 14 + tailWave * 0.7);
    ctx.stroke();
  }

  function renderFighter(ctx: CanvasRenderingContext2D, p: PlayerState, frame: number) {
    const breathe = Math.sin(frame * 0.05) * 1.5;
    const walkCycle = Math.sin(frame * 0.18) * 12;

    // Shadow beneath
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, PLAYER_H, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Legs ──
    ctx.strokeStyle = "#4a2020";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    if (p.action === "walk") {
      ctx.beginPath();
      ctx.moveTo(-6, 40);
      ctx.lineTo(-6 + walkCycle * 0.4, PLAYER_H + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 40);
      ctx.lineTo(6 - walkCycle * 0.4, PLAYER_H + 1);
      ctx.stroke();
    } else if (p.action === "kick" && p.attackFrame > 0) {
      ctx.beginPath();
      ctx.moveTo(-6, 40);
      ctx.lineTo(-10, PLAYER_H + 1);
      ctx.stroke();
      // Heavy kick
      ctx.strokeStyle = "#8b2020";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(6, 38);
      ctx.lineTo(32, 36);
      ctx.stroke();
      // Boot
      ctx.save();
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(34, 36, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.action === "jump") {
      ctx.beginPath();
      ctx.moveTo(-6, 40);
      ctx.lineTo(-10, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 40);
      ctx.lineTo(10, 50);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-6, 40);
      ctx.lineTo(-8, PLAYER_H + breathe);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 40);
      ctx.lineTo(8, PLAYER_H + breathe);
      ctx.stroke();
    }

    // Heavy boots
    ctx.fillStyle = "#3a1515";
    if (p.action === "walk") {
      ctx.fillRect(-10 + walkCycle * 0.4, PLAYER_H - 3, 9, 5);
      ctx.fillRect(2 - walkCycle * 0.4, PLAYER_H - 3, 9, 5);
    } else if (p.action !== "kick") {
      ctx.fillRect(-12, PLAYER_H - 3 + breathe, 9, 5);
      ctx.fillRect(4, PLAYER_H - 3 + breathe, 9, 5);
    }

    // ── Torso / Armor ──
    // Base body
    ctx.fillStyle = "#6b1a1a";
    ctx.beginPath();
    ctx.moveTo(-15, 14);
    ctx.lineTo(15, 14);
    ctx.lineTo(13, 42);
    ctx.lineTo(-13, 42);
    ctx.closePath();
    ctx.fill();

    // Armor plates
    ctx.fillStyle = "#8b2020";
    // Chest plate
    ctx.beginPath();
    ctx.moveTo(-12, 15);
    ctx.lineTo(12, 15);
    ctx.lineTo(10, 30);
    ctx.lineTo(-10, 30);
    ctx.closePath();
    ctx.fill();
    // Plate highlight
    ctx.fillStyle = "#a83030";
    ctx.beginPath();
    ctx.moveTo(-8, 16);
    ctx.lineTo(0, 16);
    ctx.lineTo(-2, 28);
    ctx.lineTo(-8, 28);
    ctx.closePath();
    ctx.fill();

    // Armor edge lines
    ctx.strokeStyle = "#4a1010";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, 15);
    ctx.lineTo(12, 15);
    ctx.lineTo(10, 30);
    ctx.lineTo(-10, 30);
    ctx.closePath();
    ctx.stroke();

    // Belt
    ctx.fillStyle = "#3a1010";
    ctx.fillRect(-13, 33, 26, 5);
    // Belt buckle
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-3, 33, 6, 5);

    // Shoulder pads
    ctx.fillStyle = "#8b2020";
    ctx.beginPath();
    ctx.ellipse(-14, 17, 6, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, 17, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a1010";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-14, 17, 6, 4, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(14, 17, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.stroke();

    // ── Arms ──
    ctx.strokeStyle = "#6b1a1a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    if (p.action === "punch" && p.attackFrame > 0) {
      // Power punch
      ctx.strokeStyle = "#8b2020";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(14, 20);
      ctx.lineTo(34, 20);
      ctx.stroke();
      // Armored fist
      ctx.save();
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(36, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Back arm guard
      ctx.strokeStyle = "#6b1a1a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-14, 20);
      ctx.lineTo(-18, 28);
      ctx.stroke();
    } else if (p.action === "kick" && p.attackFrame > 0) {
      ctx.beginPath();
      ctx.moveTo(14, 18);
      ctx.lineTo(18, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, 18);
      ctx.lineTo(-18, 14);
      ctx.stroke();
    } else if (p.action === "walk") {
      ctx.beginPath();
      ctx.moveTo(14, 20);
      ctx.lineTo(14 + Math.sin(frame * 0.18) * 8, 36);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, 20);
      ctx.lineTo(-14 - Math.sin(frame * 0.18) * 8, 36);
      ctx.stroke();
    } else {
      // Powerful stance
      ctx.beginPath();
      ctx.moveTo(14, 20);
      ctx.lineTo(20, 16 + breathe * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, 20);
      ctx.lineTo(-18, 30 + breathe * 0.5);
      ctx.stroke();
    }

    // Arm guards (forearm armor)
    if (p.action !== "punch" && p.action !== "kick") {
      ctx.fillStyle = "#8b2020";
      ctx.beginPath();
      ctx.ellipse(18, 16 + breathe * 0.5, 3, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Head ──
    // Skin
    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.arc(0, 7, 11, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = "#8b2020";
    ctx.beginPath();
    ctx.arc(0, 5, 12, Math.PI, 0);
    ctx.fill();
    // Helmet visor edge
    ctx.strokeStyle = "#4a1010";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 5, 12, Math.PI, 0);
    ctx.stroke();
    // Helmet crest
    ctx.fillStyle = "#a83030";
    ctx.beginPath();
    ctx.moveTo(-2, -7);
    ctx.lineTo(2, -7);
    ctx.lineTo(1, 2);
    ctx.lineTo(-1, 2);
    ctx.closePath();
    ctx.fill();

    // Eyes - fierce
    ctx.fillStyle = "#fff";
    ctx.fillRect(2, 4, 5, 4);
    ctx.fillRect(-7, 4, 5, 4);
    // Angry brow
    ctx.strokeStyle = "#5a3020";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, 2);
    ctx.lineTo(-2, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, 2);
    ctx.lineTo(2, 3);
    ctx.stroke();
    // Pupils
    ctx.fillStyle = "#2a1010";
    ctx.fillRect(4, 5, 2, 2);
    ctx.fillRect(-5, 5, 2, 2);

    // Mouth - determined
    ctx.strokeStyle = "#8b5a40";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, 12);
    ctx.lineTo(3, 12);
    ctx.stroke();
  }

  function renderPlayerHealthBar(ctx: CanvasRenderingContext2D, p: PlayerState) {
    const barW = 44;
    const barH = 4;
    const barX = p.x + PLAYER_W / 2 - barW / 2;
    const barY = p.y - 10;

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    const healthPct = Math.max(0, p.health / 100);
    const hpColor = healthPct > 0.5 ? "#22c55e" : healthPct > 0.25 ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * healthPct, barH);
  }

  function renderHUD(ctx: CanvasRenderingContext2D, allPlayers: PlayerState[], localId: string) {
    // Top HUD panel
    const panelH = 44;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, CANVAS_W, panelH);
    // Bottom border
    ctx.strokeStyle = "rgba(100,120,200,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, panelH);
    ctx.lineTo(CANVAS_W, panelH);
    ctx.stroke();

    const barW = Math.min(150, (CANVAS_W - 60) / allPlayers.length - 16);
    const startX = (CANVAS_W - (barW + 16) * allPlayers.length + 16) / 2;

    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers[i];
      const state = p.id === localId && localPlayerRef.current ? localPlayerRef.current : p;
      const x = startX + i * (barW + 16);
      const y = 8;

      const charType = getCharacterType(state.color);
      const isLocal = state.id === localId;

      // Character type icon area
      const iconColor = charType === "ninja" ? "#3b82f6" : "#ef4444";
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      ctx.arc(x + 8, y + 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(charType === "ninja" ? "N" : "F", x + 8, y + 17);

      // Name
      ctx.fillStyle = state.alive ? "#fff" : "#555";
      ctx.font = `bold 10px 'Segoe UI', sans-serif`;
      ctx.textAlign = "left";
      const displayName = isLocal ? `${state.name} (YOU)` : state.name;
      ctx.fillText(displayName.slice(0, 14), x + 20, y + 10);

      // Health bar
      const hpBarX = x + 20;
      const hpBarY = y + 15;
      const hpBarW = barW - 20;
      const hpBarH = 10;

      // HP bar background
      ctx.fillStyle = "#1a1a2a";
      ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

      const healthPct = Math.max(0, state.health / 100);
      if (state.alive) {
        // Gradient HP bar
        const hpGrad = ctx.createLinearGradient(hpBarX, hpBarY, hpBarX + hpBarW * healthPct, hpBarY);
        if (healthPct > 0.5) {
          hpGrad.addColorStop(0, "#16a34a");
          hpGrad.addColorStop(1, "#22c55e");
        } else if (healthPct > 0.25) {
          hpGrad.addColorStop(0, "#d97706");
          hpGrad.addColorStop(1, "#f59e0b");
        } else {
          hpGrad.addColorStop(0, "#dc2626");
          hpGrad.addColorStop(1, "#ef4444");
        }
        ctx.fillStyle = hpGrad;
        ctx.fillRect(hpBarX, hpBarY, hpBarW * healthPct, hpBarH);
      }

      // HP bar border
      ctx.strokeStyle = isLocal ? "rgba(255,255,255,0.5)" : "rgba(100,120,200,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

      // HP text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 7px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.ceil(state.health)}`, hpBarX + hpBarW / 2, hpBarY + 8);
    }
  }

  // ─── Animation Frame ──────────────────────────────────────────────────────

  useEffect(() => {
    let animId: number;
    const tick = () => {
      gameLoop();
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameLoop]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          width: CANVAS_W * canvasScale,
          height: CANVAS_H * canvasScale,
        }}
        className="rounded-lg border border-border"
      />
    </div>
  );
}
