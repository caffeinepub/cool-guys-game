import { useCallback, useEffect, useRef } from "react";
import type { DevilFruit, GameResult, PlayerSelections } from "../../App";

interface Props {
  playerSelections: PlayerSelections;
  onGameOver: (result: GameResult) => void;
}

// --- Game Constants ---
const CANVAS_W = 900;
const CANVAS_H = 500;
const PLAYER_W = 36;
const PLAYER_H = 52;
const PLAYER_SPEED = 3.5;
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const GROUND_Y = CANVAS_H - 80;
const ATTACK_RANGE = 70;
const ATTACK_DAMAGE = 15;
const BOSS_BASE_HP = 200;
const SPECIAL_COOLDOWN_FRAMES = 312; // ~5 seconds at 60fps

const FRUIT_COLORS: Record<
  DevilFruit,
  { primary: string; secondary: string; glow: string }
> = {
  "mera-mera": {
    primary: "#ff4500",
    secondary: "#ff8800",
    glow: "rgba(255,80,0,0.7)",
  },
  "goro-goro": {
    primary: "#00aaff",
    secondary: "#ffff00",
    glow: "rgba(0,170,255,0.7)",
  },
  "hana-hana": {
    primary: "#cc44ff",
    secondary: "#ff88cc",
    glow: "rgba(200,60,255,0.7)",
  },
  "gomu-gomu": {
    primary: "#aadd00",
    secondary: "#ffdd00",
    glow: "rgba(160,220,0,0.7)",
  },
};

const FRUIT_SPECIAL_DAMAGE: Record<DevilFruit, number> = {
  "mera-mera": 45,
  "goro-goro": 50,
  "hana-hana": 35,
  "gomu-gomu": 40,
};

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  onGround: boolean;
  attacking: boolean;
  attackTimer: number;
  fruit: DevilFruit;
  facing: number;
  specialCooldown: number;
  specialActive: boolean;
  specialTimer: number;
  isDead: boolean;
}

interface Boss {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  vx: number;
  attackTimer: number;
  level: number;
  tentacleAngle: number;
  eyeFlash: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface GameState {
  p1: Player;
  p2: Player;
  boss: Boss;
  level: number;
  score: number;
  particles: Particle[];
  time: number;
  levelTransition: number;
  gameOver: boolean;
}

function createPlayer(x: number, fruit: DevilFruit, facing: number): Player {
  return {
    x,
    y: GROUND_Y - PLAYER_H,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    onGround: true,
    attacking: false,
    attackTimer: 0,
    fruit,
    facing,
    specialCooldown: 0,
    specialActive: false,
    specialTimer: 0,
    isDead: false,
  };
}

function createBoss(level: number): Boss {
  const hp = Math.floor(BOSS_BASE_HP * level * 1.5);
  return {
    x: CANVAS_W / 2 - 40,
    y: GROUND_Y - 120,
    hp,
    maxHp: hp,
    vx: 1.5 + level * 0.3,
    attackTimer: 0,
    level,
    tentacleAngle: 0,
    eyeFlash: 0,
  };
}

function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      color,
      size: Math.random() * 5 + 2,
    });
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, time: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0, "#050810");
  sky.addColorStop(0.6, "#0a1428");
  sky.addColorStop(1, "#0d1f3c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137.5 + time * 0.01) % CANVAS_W;
    const sy = (i * 97 + Math.sin(time * 0.001 + i) * 2) % (CANVAS_H * 0.6);
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const moonGrad = ctx.createRadialGradient(750, 60, 0, 750, 60, 35);
  moonGrad.addColorStop(0, "rgba(255,240,180,0.9)");
  moonGrad.addColorStop(0.7, "rgba(220,200,140,0.6)");
  moonGrad.addColorStop(1, "rgba(200,180,120,0)");
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(750, 60, 35, 0, Math.PI * 2);
  ctx.fill();

  const waveY = GROUND_Y + 20;
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (let x = 0; x <= CANVAS_W; x += 10) {
      const y =
        waveY + Math.sin(x * 0.015 + time * 0.002 + w * 1.2) * (8 - w * 2);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fillStyle = `rgba(10,40,80,${0.3 + w * 0.15})`;
    ctx.fill();
  }

  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 20);
  groundGrad.addColorStop(0, "#1a3050");
  groundGrad.addColorStop(1, "#0d1f3c");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.strokeStyle = "rgba(100,180,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.stroke();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  time: number,
  label: string,
) {
  const colors = FRUIT_COLORS[p.fruit];
  if (p.isDead) return;

  const bob = Math.sin(time * 0.05) * 3;
  const px = p.x;
  const py = p.y + bob;

  ctx.save();
  ctx.translate(px + PLAYER_W / 2, py + PLAYER_H / 2);
  if (p.facing < 0) ctx.scale(-1, 1);

  if (p.specialActive) {
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 30;
  } else if (p.attacking) {
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 15;
  } else {
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8;
  }

  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.roundRect(-10, -10, 20, 30, 4);
  ctx.fill();

  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-10, 5, 20, 4);

  ctx.fillStyle = "#f8d8a0";
  ctx.beginPath();
  ctx.arc(0, -20, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(0, -28, 10, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(-4, -22, 2, 0, Math.PI * 2);
  ctx.arc(4, -22, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-3, -23, 1, 0, Math.PI * 2);
  ctx.arc(5, -23, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.fillRect(-8, 20, 7, 16);
  ctx.fillRect(1, 20, 7, 16);

  ctx.fillStyle = colors.primary;
  if (p.attacking) {
    ctx.save();
    ctx.translate(10, -5);
    ctx.rotate(-0.5);
    ctx.fillRect(0, -4, 22, 8);
    ctx.fillStyle = "#f8d8a0";
    ctx.beginPath();
    ctx.arc(24, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillRect(-16, -8, 6, 18);
    ctx.fillRect(10, -8, 6, 18);
  }

  ctx.restore();

  ctx.save();
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = colors.primary;
  ctx.textAlign = "center";
  ctx.fillText(label, px + PLAYER_W / 2, py - 10);
  ctx.restore();
}

function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, time: number) {
  const bx = boss.x;
  const by = boss.y;
  const bw = 100;
  const bh = 120;
  boss.tentacleAngle = time * 0.03;

  ctx.save();
  ctx.shadowColor = "rgba(200,0,0,0.8)";
  ctx.shadowBlur = 30;

  const bodyGrad = ctx.createRadialGradient(
    bx + bw / 2,
    by + bh / 2,
    0,
    bx + bw / 2,
    by + bh / 2,
    60,
  );
  bodyGrad.addColorStop(0, "#440022");
  bodyGrad.addColorStop(0.6, "#220011");
  bodyGrad.addColorStop(1, "#110008");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(bx + bw / 2, by + bh / 2, 52, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 8;
  for (let t = 0; t < 6; t++) {
    const angle = (t / 6) * Math.PI * 2 + boss.tentacleAngle;
    const tx1 = bx + bw / 2 + Math.cos(angle) * 45;
    const ty1 = by + bh * 0.7 + Math.sin(angle * 2) * 10;
    const tx2 = bx + bw / 2 + Math.cos(angle) * 90;
    const ty2 = ty1 + Math.sin(time * 0.05 + t) * 30 + 30;

    const tentacleGrad = ctx.createLinearGradient(tx1, ty1, tx2, ty2);
    tentacleGrad.addColorStop(0, "rgba(100,0,50,0.9)");
    tentacleGrad.addColorStop(1, "rgba(50,0,25,0.3)");
    ctx.strokeStyle = tentacleGrad;

    ctx.beginPath();
    ctx.moveTo(bx + bw / 2, by + bh * 0.65);
    ctx.quadraticCurveTo(tx1, ty1, tx2, ty2);
    ctx.stroke();

    ctx.fillStyle = "rgba(180,0,80,0.6)";
    ctx.beginPath();
    ctx.arc(tx2, ty2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const eyeFlash = boss.eyeFlash > 0;
  const eyeColor = eyeFlash ? "rgba(255,255,0,1)" : "rgba(255,30,0,1)";

  for (const ex of [bx + bw / 2 - 15, bx + bw / 2 + 15]) {
    const ey = by + bh * 0.35;
    const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
    eg.addColorStop(0, eyeColor);
    eg.addColorStop(1, "rgba(200,0,0,0)");
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(ex, ey, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "rgba(255,60,60,0.9)";
  ctx.textAlign = "center";
  ctx.fillText(`BOSS LV.${boss.level}`, bx + bw / 2, by - 15);

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, gs: GameState) {
  ctx.fillStyle = "rgba(5,8,20,0.85)";
  ctx.fillRect(0, 0, CANVAS_W, 60);
  ctx.strokeStyle = "rgba(180,140,50,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, CANVAS_W, 60);

  const drawBar = (
    x: number,
    y: number,
    w: number,
    h: number,
    current: number,
    max: number,
    fillColor: string,
    label: string,
    labelColor: string,
  ) => {
    ctx.fillStyle = "rgba(20,30,50,0.8)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    const pct = Math.max(0, current / max);
    if (pct > 0) {
      ctx.fillStyle = fillColor;
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, w * pct, h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = "rgba(180,140,50,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "left";
    ctx.fillText(`${label} ${current}/${max}`, x, y - 3);
  };

  const p1Colors = FRUIT_COLORS[gs.p1.fruit];
  const p2Colors = FRUIT_COLORS[gs.p2.fruit];

  drawBar(
    10,
    30,
    160,
    12,
    gs.p1.hp,
    gs.p1.maxHp,
    p1Colors.primary,
    "P1",
    p1Colors.primary,
  );
  drawBar(
    10,
    10,
    160,
    12,
    Math.max(0, SPECIAL_COOLDOWN_FRAMES - gs.p1.specialCooldown),
    SPECIAL_COOLDOWN_FRAMES,
    p1Colors.secondary,
    "SP",
    p1Colors.secondary,
  );

  drawBar(
    CANVAS_W / 2 - 120,
    30,
    240,
    14,
    gs.boss.hp,
    gs.boss.maxHp,
    "#cc2200",
    "",
    "rgba(255,80,60,0.9)",
  );
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "rgba(255,100,80,0.9)";
  ctx.textAlign = "center";
  ctx.fillText(
    `BOSS LV.${gs.boss.level} — ${gs.boss.hp}/${gs.boss.maxHp}`,
    CANVAS_W / 2,
    20,
  );

  drawBar(
    CANVAS_W - 170,
    30,
    160,
    12,
    gs.p2.hp,
    gs.p2.maxHp,
    p2Colors.primary,
    "P2",
    p2Colors.primary,
  );
  drawBar(
    CANVAS_W - 170,
    10,
    160,
    12,
    Math.max(0, SPECIAL_COOLDOWN_FRAMES - gs.p2.specialCooldown),
    SPECIAL_COOLDOWN_FRAMES,
    p2Colors.secondary,
    "SP",
    p2Colors.secondary,
  );

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "rgba(200,160,60,0.9)";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL ${gs.level}   SCORE: ${gs.score}`, CANVAS_W / 2, 56);
}

function drawLevelTransition(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (gs.levelTransition <= 0) return;
  const alpha = Math.min(1, gs.levelTransition / 30);
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.7})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "bold 56px sans-serif";
  ctx.fillStyle = "rgba(200,160,60,1)";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL ${gs.level}`, CANVAS_W / 2, CANVAS_H / 2 - 20);
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("NEW BOSS INCOMING!", CANVAS_W / 2, CANVAS_H / 2 + 30);
  ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, gs: GameState) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, gs.time);
  drawBoss(ctx, gs.boss, gs.time);
  drawPlayer(ctx, gs.p1, gs.time, "P1");
  drawPlayer(ctx, gs.p2, gs.time, "P2");
  drawParticles(ctx, gs.particles);
  drawHUD(ctx, gs);
  drawLevelTransition(ctx, gs);
}

function updatePlayer(
  player: Player,
  gs: GameState,
  keys: Set<string>,
  leftKey: string,
  rightKey: string,
  upKey: string,
  attackKey: string,
  specialKey: string,
  bossDamage: number,
) {
  if (player.isDead) return;

  player.vx = 0;
  if (keys.has(leftKey)) {
    player.vx = -PLAYER_SPEED;
    player.facing = -1;
  }
  if (keys.has(rightKey)) {
    player.vx = PLAYER_SPEED;
    player.facing = 1;
  }
  if (keys.has(upKey) && player.onGround) {
    player.vy = JUMP_POWER;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  if (player.y + PLAYER_H >= GROUND_Y) {
    player.y = GROUND_Y - PLAYER_H;
    player.vy = 0;
    player.onGround = true;
  }

  player.x = Math.max(0, Math.min(CANVAS_W - PLAYER_W, player.x));

  if (player.attackTimer > 0) {
    player.attackTimer--;
    player.attacking = player.attackTimer > 10;
  }

  if (keys.has(attackKey) && player.attackTimer === 0) {
    player.attackTimer = 25;
    player.attacking = true;
    const dist = Math.abs(player.x + PLAYER_W / 2 - (gs.boss.x + 50));
    if (dist < ATTACK_RANGE) {
      gs.boss.hp = Math.max(0, gs.boss.hp - ATTACK_DAMAGE);
      gs.score += 10;
      spawnParticles(
        gs.particles,
        gs.boss.x + 50,
        gs.boss.y + 60,
        FRUIT_COLORS[player.fruit].primary,
        8,
      );
      gs.boss.eyeFlash = 10;
    }
  }

  if (player.specialCooldown > 0) player.specialCooldown--;
  if (player.specialTimer > 0) {
    player.specialTimer--;
    player.specialActive = true;
  } else {
    player.specialActive = false;
  }

  if (keys.has(specialKey) && player.specialCooldown === 0) {
    player.specialCooldown = SPECIAL_COOLDOWN_FRAMES;
    player.specialTimer = 30;
    const dist = Math.abs(player.x + PLAYER_W / 2 - (gs.boss.x + 50));
    if (dist < ATTACK_RANGE * 2) {
      const specialDmg = FRUIT_SPECIAL_DAMAGE[player.fruit];
      gs.boss.hp = Math.max(0, gs.boss.hp - specialDmg);
      gs.score += 50;
      spawnParticles(
        gs.particles,
        gs.boss.x + 50,
        gs.boss.y + 60,
        FRUIT_COLORS[player.fruit].primary,
        20,
      );
      gs.boss.eyeFlash = 20;
    }
  }

  if (gs.boss.attackTimer === 0) {
    const bossCenter = gs.boss.x + 50;
    const playerCenter = player.x + PLAYER_W / 2;
    const dist = Math.abs(playerCenter - bossCenter);
    if (dist < 80) {
      player.hp = Math.max(0, player.hp - bossDamage);
      if (player.hp <= 0) player.isDead = true;
    }
  }
}

function updateBoss(gs: GameState) {
  const boss = gs.boss;
  if (boss.eyeFlash > 0) boss.eyeFlash--;

  const alivePlayers = [gs.p1, gs.p2].filter((p) => !p.isDead);
  if (alivePlayers.length === 0) return;

  const target = alivePlayers.reduce((closest, p) => {
    const dc = Math.abs(boss.x + 50 - (closest.x + PLAYER_W / 2));
    const dp = Math.abs(boss.x + 50 - (p.x + PLAYER_W / 2));
    return dp < dc ? p : closest;
  });

  const dir = target.x + PLAYER_W / 2 > boss.x + 50 ? 1 : -1;
  boss.x += dir * boss.vx;
  boss.x = Math.max(0, Math.min(CANVAS_W - 100, boss.x));

  if (boss.attackTimer > 0) {
    boss.attackTimer--;
  } else {
    boss.attackTimer = Math.max(30, 90 - gs.level * 5);
  }

  if (boss.hp <= 0) {
    gs.level++;
    gs.score += gs.level * 100;
    gs.boss = createBoss(gs.level);
    gs.levelTransition = 90;
    if (!gs.p1.isDead) gs.p1.hp = Math.min(gs.p1.maxHp, gs.p1.hp + 30);
    if (!gs.p2.isDead) gs.p2.hp = Math.min(gs.p2.maxHp, gs.p2.hp + 30);
  }
}

function update(gs: GameState, keys: Set<string>) {
  if (gs.gameOver) return;
  gs.time++;

  if (gs.levelTransition > 0) {
    gs.levelTransition--;
    return;
  }

  const bossDamage = 5 + gs.level * 2;

  for (let i = gs.particles.length - 1; i >= 0; i--) {
    const p = gs.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= 0.04;
    if (p.life <= 0) gs.particles.splice(i, 1);
  }

  updatePlayer(gs.p1, gs, keys, "a", "d", "w", "f", "q", bossDamage);
  updatePlayer(
    gs.p2,
    gs,
    keys,
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "l",
    "o",
    bossDamage,
  );
  updateBoss(gs);

  if (gs.p1.isDead && gs.p2.isDead) {
    gs.gameOver = true;
  }
}

export default function GameScreen({ playerSelections, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const initGame = useCallback(() => {
    gsRef.current = {
      p1: createPlayer(80, playerSelections.p1, 1),
      p2: createPlayer(CANVAS_W - 120, playerSelections.p2, -1),
      boss: createBoss(1),
      level: 1,
      score: 0,
      particles: [],
      time: 0,
      levelTransition: 0,
      gameOver: false,
    };
  }, [playerSelections]);

  useEffect(() => {
    initGame();

    function handleKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key);
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function gameLoop(timestamp: number) {
      const gs = gsRef.current;
      if (!gs || !ctx) return;

      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      update(gs, keysRef.current);
      render(ctx, gs);

      if (gs.gameOver) {
        onGameOver({
          level: gs.level,
          score: gs.score,
          p1Fruit: gs.p1.fruit,
          p2Fruit: gs.p2.fruit,
        });
        return;
      }
      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [initGame, onGameOver]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#050810" }}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          data-ocid="game.canvas_target"
          style={{
            display: "block",
            border: "1px solid rgba(180,140,50,0.4)",
            borderRadius: "4px",
            boxShadow: "0 0 40px rgba(180,140,50,0.2)",
            maxWidth: "100vw",
          }}
        />
      </div>
      <div className="mt-3 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          P1: WASD move · F attack · Q special &nbsp;|&nbsp; P2: Arrows move · L
          attack · O special
        </p>
      </div>
    </div>
  );
}
