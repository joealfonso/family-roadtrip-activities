"use client";

import { useEffect, useRef, useState } from "react";

// ── Canvas dimensions ─────────────────────────────────────────────────────────
const W = 390;
const H = 600;
const DRAGON_SPEED = 5;
const HIT_RADIUS   = 32; // collision distance

// ── Types ─────────────────────────────────────────────────────────────────────
interface Item {
  x: number; y: number;
  type: "star" | "gem" | "cloud";
  vy: number;
  phase: number; // for wobble/shimmer
  done?: boolean;
}
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; r: number;
}
interface GameState {
  dragon: { x: number; y: number };
  items: Item[];
  particles: Particle[];
  score: number;
  lives: number;
  frame: number;
  holdLeft: boolean;
  holdRight: boolean;
  over: boolean;
  started: boolean;
  bgOffset: number;
  wingAngle: number;
  wingDir: number;
  fallSpeed: number;
  spawnTimer: number;
  spawnRate: number;
  flashTimer: number; // red flash on hit
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function drawCloudBlobAt(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
) {
  ctx.beginPath();
  ctx.arc(x,          y,          r,        0, Math.PI * 2);
  ctx.arc(x + r * .8, y + r * .3, r * .75,  0, Math.PI * 2);
  ctx.arc(x - r * .7, y + r * .4, r * .60,  0, Math.PI * 2);
  ctx.arc(x + r * .2, y + r * .5, r * .70,  0, Math.PI * 2);
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, spin: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a  = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const ia = a + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(ia) * (r * .42), Math.sin(ia) * (r * .42));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGem(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, hue: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `hsl(${hue},80%,62%)`;
  ctx.shadowColor = `hsl(${hue},90%,70%)`;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  // hexagonal gem
  ctx.moveTo(0, -16);
  ctx.lineTo(13, -5);
  ctx.lineTo(13, 7);
  ctx.lineTo(0, 16);
  ctx.lineTo(-13, 7);
  ctx.lineTo(-13, -5);
  ctx.closePath();
  ctx.fill();
  // highlight facet
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(13, -5);
  ctx.lineTo(0, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDragon(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  wingA: number, tilt: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // ── tail ──
  ctx.strokeStyle = "#1E7A45";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(24, 2);
  ctx.quadraticCurveTo(42, tilt < 0 ? -12 : 14, 36, tilt < 0 ? 10 : -6);
  ctx.stroke();

  // ── upper wing ──
  ctx.fillStyle = "#1A6B3C";
  ctx.save();
  ctx.rotate(-wingA - 0.15);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-28, -34);
  ctx.lineTo(-6,  -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── lower wing ──
  ctx.save();
  ctx.rotate(wingA + 0.15);
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-28, 34);
  ctx.lineTo(-6,  8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── body ──
  ctx.fillStyle = "#27AE60";
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── belly ──
  ctx.fillStyle = "#82E0AA";
  ctx.beginPath();
  ctx.ellipse(0, 5, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── head ──
  ctx.fillStyle = "#27AE60";
  ctx.beginPath();
  ctx.ellipse(-24, -2, 13, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── eye ──
  ctx.fillStyle = "#F9CA24";
  ctx.beginPath();
  ctx.arc(-28, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.arc(-28, -5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-27, -6, 1, 0, Math.PI * 2);
  ctx.fill();

  // ── snout / nostril ──
  ctx.fillStyle = "#1E7A45";
  ctx.beginPath();
  ctx.arc(-34, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // ── horns ──
  ctx.fillStyle = "#D4AC0D";
  const hornData = [[-20, -12], [-14, -13]] as const;
  for (const [hx, hy] of hornData) {
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + 2, hy - 12);
    ctx.lineTo(hx + 6, hy);
    ctx.fill();
  }

  // ── fire breath (subtle glow when moving) ──
  if (Math.abs(tilt) > 0.05) {
    const grd = ctx.createRadialGradient(-38, 0, 1, -38, 0, 14);
    grd.addColorStop(0,   "rgba(255,200,0,0.7)");
    grd.addColorStop(0.5, "rgba(255,90,0,0.35)");
    grd.addColorStop(1,   "rgba(255,60,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(-44, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DragonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const g = useRef<GameState>({
    dragon: { x: W / 2, y: H - 110 },
    items: [], particles: [],
    score: 0, lives: 3, frame: 0,
    holdLeft: false, holdRight: false,
    over: false, started: false,
    bgOffset: 0, wingAngle: 0, wingDir: 1,
    fallSpeed: 2.8, spawnTimer: 0, spawnRate: 65,
    flashTimer: 0,
  });

  const [display, setDisplay] = useState({ score: 0, lives: 3 });
  const [phase, setPhase] = useState<"start" | "playing" | "over">("start");

  // ── Sounds (Web Audio) ────────────────────────────────────────────────────
  const playCollect = (type: "star" | "gem") => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = type === "gem" ? 880 : 660;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.start(); osc.stop(ctx.currentTime + 0.22);
      setTimeout(() => ctx.close(), 400);
    } catch { /* silent */ }
  };

  const playHit = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.25;
      src.connect(gain); gain.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 500);
    } catch { /* silent */ }
  };

  // ── Start / reset ─────────────────────────────────────────────────────────
  const startGame = () => {
    const s = g.current;
    s.dragon = { x: W / 2, y: H - 110 };
    s.items = []; s.particles = [];
    s.score = 0; s.lives = 3; s.frame = 0;
    s.holdLeft = false; s.holdRight = false;
    s.over = false; s.started = true;
    s.bgOffset = 0; s.wingAngle = 0; s.wingDir = 1;
    s.fallSpeed = 2.8; s.spawnTimer = 0; s.spawnRate = 65;
    s.flashTimer = 0;
    setDisplay({ score: 0, lives: 3 });
    setPhase("playing");
  };

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d")!;
    let rafId: number;

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const s = g.current;
      if (!s.started || s.over) {
        // Draw a still sky while on start/over screens
        drawSkyBg(ctx2d, 0);
        return;
      }

      s.frame++;
      s.bgOffset = (s.bgOffset + 0.6) % H;

      // Wing flap
      s.wingAngle += 0.14 * s.wingDir;
      if (Math.abs(s.wingAngle) > 0.45) s.wingDir *= -1;

      // Difficulty ramp (every 10 pts speed up a little)
      s.fallSpeed  = 2.8 + s.score * 0.06;
      s.spawnRate  = Math.max(28, 65 - s.score * 0.8);

      // Dragon movement
      const tgt = s.holdLeft ? -1 : s.holdRight ? 1 : 0;
      if (s.holdLeft  && s.dragon.x > 36)     s.dragon.x -= DRAGON_SPEED;
      if (s.holdRight && s.dragon.x < W - 36) s.dragon.x += DRAGON_SPEED;
      const tilt = tgt * 0.28;

      // Spawn items
      s.spawnTimer++;
      if (s.spawnTimer >= s.spawnRate) {
        s.spawnTimer = 0;
        const r = Math.random();
        const type: Item["type"] = r < 0.48 ? "star" : r < 0.72 ? "gem" : "cloud";
        s.items.push({
          x: 36 + Math.random() * (W - 72),
          y: -32,
          type,
          vy: s.fallSpeed + (Math.random() - 0.5) * 0.8,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Update items
      for (const it of s.items) it.y += it.vy;

      // Collision
      for (const it of s.items) {
        if (it.done) continue;
        const dx = it.x - s.dragon.x;
        const dy = it.y - s.dragon.y;
        if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) {
          it.done = true;
          if (it.type === "cloud") {
            s.lives = Math.max(0, s.lives - 1);
            s.flashTimer = 18;
            playHit();
            for (let i = 0; i < 10; i++) {
              s.particles.push({
                x: it.x, y: it.y,
                vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5,
                life: 30, maxLife: 30, color: "#8899BB", r: 7,
              });
            }
            if (s.lives <= 0) {
              s.over = true;
              setPhase("over");
            } else {
              setDisplay(d => ({ ...d, lives: s.lives }));
            }
          } else {
            const pts = it.type === "gem" ? 3 : 1;
            s.score += pts;
            setDisplay(d => ({ ...d, score: s.score }));
            playCollect(it.type);
            const col = it.type === "gem" ? "#60D4F8" : "#FFD700";
            for (let i = 0; i < 8; i++) {
              s.particles.push({
                x: it.x, y: it.y,
                vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 6,
                life: 28, maxLife: 28, color: col, r: 6,
              });
            }
          }
        }
      }

      // Prune
      s.items     = s.items.filter(it => !it.done && it.y < H + 40);
      s.particles = s.particles.filter(p => p.life > 0);
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.93; p.vy *= 0.93;
        p.life--;
      }

      // ── Draw ──────────────────────────────────────────────────────────
      drawSkyBg(ctx2d, s.bgOffset);

      // Red flash overlay on hit
      if (s.flashTimer > 0) {
        s.flashTimer--;
        ctx2d.save();
        ctx2d.fillStyle = `rgba(220,30,30,${(s.flashTimer / 18) * 0.28})`;
        ctx2d.fillRect(0, 0, W, H);
        ctx2d.restore();
      }

      // Items
      for (const it of s.items) {
        const wobble = Math.sin(s.frame * 0.08 + it.phase) * 2;
        if (it.type === "star") {
          ctx2d.shadowColor = "#FFD700";
          ctx2d.shadowBlur = 12;
          ctx2d.fillStyle = "#FFD700";
          drawStar(ctx2d, it.x + wobble, it.y, 14, s.frame * 0.022);
          ctx2d.shadowBlur = 0;
        } else if (it.type === "gem") {
          drawGem(ctx2d, it.x + wobble, it.y, (s.frame * 2.5 + it.phase * 60) % 360);
        } else {
          // Storm cloud
          ctx2d.fillStyle = "#607080";
          ctx2d.shadowColor = "rgba(0,0,0,0.3)";
          ctx2d.shadowBlur = 8;
          drawCloudBlobAt(ctx2d, it.x, it.y, 26);
          ctx2d.shadowBlur = 0;
          // Lightning bolt
          ctx2d.fillStyle = "#FFE566";
          ctx2d.shadowColor = "#FFE566";
          ctx2d.shadowBlur = 6;
          ctx2d.beginPath();
          ctx2d.moveTo(it.x + 3,  it.y - 10);
          ctx2d.lineTo(it.x - 3,  it.y + 1);
          ctx2d.lineTo(it.x + 3,  it.y + 1);
          ctx2d.lineTo(it.x - 3,  it.y + 12);
          ctx2d.lineTo(it.x + 8,  it.y - 1);
          ctx2d.lineTo(it.x + 1,  it.y - 1);
          ctx2d.closePath();
          ctx2d.fill();
          ctx2d.shadowBlur = 0;
        }
      }

      // Particles
      for (const p of s.particles) {
        const a = p.life / p.maxLife;
        ctx2d.save();
        ctx2d.globalAlpha = a;
        ctx2d.fillStyle = p.color;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r * (0.5 + a * 0.5), 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // Dragon
      drawDragon(ctx2d, s.dragon.x, s.dragon.y, s.wingAngle, tilt);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Background ────────────────────────────────────────────────────────────
  function drawSkyBg(ctx: CanvasRenderingContext2D, offset: number) {
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0,   "#4FA8D8");
    grd.addColorStop(0.6, "#87CEEB");
    grd.addColorStop(1,   "#B8E4F8");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Soft decorative background clouds
    const bgClouds = [
      { bx: 60,  by: 80  },
      { bx: 240, by: 160 },
      { bx: 120, by: 300 },
      { bx: 310, by: 420 },
      { bx: 50,  by: 500 },
    ];
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (const { bx, by } of bgClouds) {
      const cy = ((by + offset) % (H + 60)) - 30;
      drawCloudBlobAt(ctx, bx, cy, 36);
    }
  }

  // ── Touch handling ────────────────────────────────────────────────────────
  const updateHold = (touches: React.TouchList, rect: DOMRect) => {
    let left = false, right = false;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].clientX - rect.left < rect.width / 2) left = true;
      else right = true;
    }
    g.current.holdLeft  = left;
    g.current.holdRight = right;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (phase !== "playing") return;
    updateHold(e.touches, e.currentTarget.getBoundingClientRect());
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    updateHold(e.touches, e.currentTarget.getBoundingClientRect());
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    updateHold(e.touches, e.currentTarget.getBoundingClientRect());
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  g.current.holdLeft  = true;
      if (e.key === "ArrowRight") g.current.holdRight = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  g.current.holdLeft  = false;
      if (e.key === "ArrowRight") g.current.holdRight = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ position: "relative", touchAction: "none", userSelect: "none" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block", width: "100%", maxWidth: W, borderRadius: 14 }}
      />

      {/* ── HUD ── */}
      {phase === "playing" && (
        <div style={{
          position: "absolute", top: 14, left: 0, right: 0,
          display: "flex", justifyContent: "space-between",
          padding: "0 18px", pointerEvents: "none",
        }}>
          <div style={{ background: "rgba(255,255,255,0.72)", borderRadius: 20, padding: "5px 14px", backdropFilter: "blur(4px)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 900, color: "#1A1A1A" }}>
              ⭐ {display.score}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.72)", borderRadius: 20, padding: "5px 14px", backdropFilter: "blur(4px)" }}>
            <span style={{ fontSize: 15 }}>
              {"❤️".repeat(Math.max(0, display.lives))}
              {"🖤".repeat(Math.max(0, 3 - display.lives))}
            </span>
          </div>
        </div>
      )}

      {/* ── Left / Right touch zones (shown while playing) ── */}
      {phase === "playing" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 16 }}>
            <span style={{ fontSize: 28, opacity: 0.18 }}>◀</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 16 }}>
            <span style={{ fontSize: 28, opacity: 0.18 }}>▶</span>
          </div>
        </div>
      )}

      {/* ── Start screen ── */}
      {phase === "start" && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 14,
          background: "rgba(70,160,210,0.88)",
          backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <p style={{ fontSize: 72, margin: 0, lineHeight: 1 }}>🐉</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, margin: "10px 0 4px", color: "#fff", letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            Dragon Flight
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.88)", textAlign: "center", margin: "0 0 6px", lineHeight: 1.6, padding: "0 28px" }}>
            Collect ⭐ stars and 💎 gems.<br />
            Dodge ⚡ storm clouds!
          </p>
          <div style={{ display: "flex", gap: 20, margin: "4px 0 20px", fontSize: 22 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>◀</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>hold left</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>▶</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>hold right</div>
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "#E8472A", color: "#fff", border: "none",
              borderRadius: 16, padding: "15px 44px",
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900,
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 4px 16px rgba(232,71,42,0.4)",
            }}
          >
            Fly! 🐉
          </button>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "10px 0 0" }}>
            Arrow keys also work on desktop
          </p>
        </div>
      )}

      {/* ── Game over screen ── */}
      {phase === "over" && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 14,
          background: "rgba(40,100,150,0.90)",
          backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <p style={{ fontSize: 60, margin: 0 }}>💨</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, margin: "8px 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>
            Knocked out!
          </h2>
          <div style={{ display: "flex", gap: 24, margin: "6px 0 22px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "#FFD700", margin: 0 }}>⭐ {display.score}</p>
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "#27AE60", color: "#fff", border: "none",
              borderRadius: 16, padding: "14px 44px",
              fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900,
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 4px 16px rgba(39,174,96,0.4)",
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => { g.current.started = false; setPhase("start"); }}
            style={{
              background: "transparent", color: "rgba(255,255,255,0.6)", border: "none",
              fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", marginTop: 6,
            }}
          >
            Back to menu
          </button>
        </div>
      )}
    </div>
  );
}
