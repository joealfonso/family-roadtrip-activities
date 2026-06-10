"use client";

import { useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type ColorId = "red" | "blue" | "green" | "yellow" | "purple" | "orange";
type SegId   = ColorId | "wild" | "x";
type Phase   = "setup" | "playing" | "spinning" | "wild" | "done";

// ── Game colors (shared across all players) ────────────────────────────────────
const COLORS: { id: ColorId; label: string; hex: string }[] = [
  { id: "red",    label: "Red",    hex: "#E8472A" },
  { id: "blue",   label: "Blue",   hex: "#1B72C0" },
  { id: "green",  label: "Green",  hex: "#2F9E6E" },
  { id: "yellow", label: "Yellow", hex: "#D4AC0D" },
  { id: "purple", label: "Purple", hex: "#7048B6" },
  { id: "orange", label: "Orange", hex: "#D97706" },
];

// ── Spinner segments (clockwise from top) ─────────────────────────────────────
const SEGMENTS: { id: SegId; label: string; hex: string }[] = [
  { id: "red",    label: "Red",    hex: "#E8472A" },
  { id: "orange", label: "Orange", hex: "#D97706" },
  { id: "x",      label: "✕",      hex: "#D0D0D0" },
  { id: "blue",   label: "Blue",   hex: "#1B72C0" },
  { id: "green",  label: "Green",  hex: "#2F9E6E" },
  { id: "wild",   label: "★",      hex: "rainbow" },
  { id: "yellow", label: "Yellow", hex: "#D4AC0D" },
  { id: "purple", label: "Purple", hex: "#7048B6" },
];
// Rainbow sub-slice colors for the wild segment
const RAINBOW = ["#E8472A", "#D97706", "#D4AC0D", "#2F9E6E", "#1B72C0", "#7048B6"];

// ── Player accent colors ───────────────────────────────────────────────────────
const PLAYER_ACCENTS = ["#E8472A", "#1B72C0", "#2F9E6E"];
const PLAYER_NAMES   = ["Player 1", "Player 2", "Player 3"];

// ── SVG geometry (centred at origin, viewBox "-110 -110 220 220") ──────────────
const R = 90; // wheel radius

function polarXY(deg: number, r: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
}

function slicePath(startDeg: number, endDeg: number, r = R): string {
  const s = polarXY(startDeg, r);
  const e = polarXY(endDeg, r);
  return `M 0 0 L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`;
}

// ── Player state ───────────────────────────────────────────────────────────────
interface Player {
  name:   string;
  accent: string;
  marked: Set<ColorId>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ColorSpinner() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [phase,      setPhase]      = useState<Phase>("setup");
  const [players,    setPlayers]    = useState<Player[]>([]);
  const [curIdx,     setCurIdx]     = useState(0);
  const [lastMsg,    setLastMsg]    = useState("");
  const [winner,     setWinner]     = useState<Player | null>(null);

  const wheelRef = useRef<SVGGElement>(null);
  const rotRef   = useRef(0);

  // ── Apply a color to the current player ──────────────────────────────────────
  const applyColor = (colorId: ColorId, playerIdx: number, nPlayers: number) => {
    setPlayers(prev => {
      const alreadyHad = prev[playerIdx].marked.has(colorId);
      const next = prev.map((p, i) => {
        if (i !== playerIdx) return p;
        const m = new Set(p.marked);
        m.add(colorId);
        return { ...p, marked: m };
      });
      const colorDef = COLORS.find(c => c.id === colorId)!;

      if (next[playerIdx].marked.size === COLORS.length) {
        setWinner(next[playerIdx]);
        setPhase("done");
      } else {
        setLastMsg(alreadyHad ? `Already have ${colorDef.label} — pass it on!` : `${colorDef.label}! ✓`);
        setPhase("playing");
        setCurIdx((playerIdx + 1) % nPlayers);
      }
      return next;
    });
  };

  // ── Spin sound (Web Audio API — ratchet clicks that slow to a stop) ──────────
  const playSpinSound = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const spinDuration = 3.5; // matches CSS transition
      let t        = 0;
      let interval = 0.028; // seconds between first clicks (~36 clicks/s)
      const decay  = 1.055;  // each gap grows by 5.5% → natural deceleration

      while (t < spinDuration) {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Pitch drops slightly as wheel slows (600 Hz → 300 Hz)
        const progress = t / spinDuration;
        osc.frequency.value = 600 - progress * 300 + (Math.random() * 80 - 40);

        const now = ctx.currentTime + t;
        gain.gain.setValueAtTime(0,   now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.003);
        gain.gain.linearRampToValueAtTime(0,    now + 0.016);

        osc.start(now);
        osc.stop(now + 0.02);

        t        += interval;
        interval *= decay;
      }

      setTimeout(() => ctx.close(), (spinDuration + 0.3) * 1000);
    } catch {
      // silently fail (no audio permission, etc.)
    }
  };

  // ── Spin ──────────────────────────────────────────────────────────────────────
  const doSpin = () => {
    if (phase !== "playing") return;

    playSpinSound();

    const snapshotIdx  = curIdx;
    const snapshotNP   = numPlayers;

    // Choose a random target segment and position within it
    const targetSeg    = Math.floor(Math.random() * 8);
    const offsetInSeg  = 8 + Math.random() * 30;          // 8°–38° into segment
    const targetAngle  = targetSeg * 45 + offsetInSeg;

    // Ensure we rotate forward enough from the current position
    const currentMod   = rotRef.current % 360;
    let   needed       = (targetAngle - currentMod + 360) % 360;
    if (needed < 90) needed += 360;

    const extraSpins   = (5 + Math.floor(Math.random() * 4)) * 360;
    const newRot       = rotRef.current + extraSpins + needed;
    rotRef.current     = newRot;

    if (wheelRef.current) {
      wheelRef.current.style.transition     = "transform 3.5s cubic-bezier(0.17, 0.67, 0.05, 1.0)";
      wheelRef.current.style.transformOrigin = "0px 0px";
      wheelRef.current.style.transform      = `rotate(${newRot}deg)`;
    }

    setPhase("spinning");
    setLastMsg("");

    setTimeout(() => {
      const segIdx = Math.floor((newRot % 360) / 45) % 8;
      const seg    = SEGMENTS[segIdx];

      if (seg.id === "x") {
        setLastMsg("✕  No luck this turn!");
        setPhase("playing");
        setCurIdx((snapshotIdx + 1) % snapshotNP);
      } else if (seg.id === "wild") {
        setPhase("wild");
      } else {
        applyColor(seg.id as ColorId, snapshotIdx, snapshotNP);
      }
    }, 3700);
  };

  // ── Start / reset ─────────────────────────────────────────────────────────────
  const startGame = () => {
    setPlayers(Array.from({ length: numPlayers }, (_, i) => ({
      name: PLAYER_NAMES[i], accent: PLAYER_ACCENTS[i], marked: new Set<ColorId>(),
    })));
    setCurIdx(0);
    setLastMsg("");
    setWinner(null);
    rotRef.current = 0;
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform  = "rotate(0deg)";
    }
    setPhase("playing");
  };

  const currentPlayer = players[curIdx];

  // ── SETUP ─────────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "8px 0" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 52, margin: "0 0 8px" }}>🎨</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, margin: "0 0 6px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>
            Color Spinner
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#888", margin: 0, lineHeight: 1.5 }}>
            Spin to collect all 6 colors.<br />First player to match them all wins!
          </p>
        </div>

        {/* How to play */}
        <div style={{ width: "100%", maxWidth: 320, background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["🎨", "Land on a color → mark it on your board"],
            ["★", "Rainbow Wild → pick any unmarked color"],
            ["✕", "X → no luck, next player's turn"],
          ].map(([icon, text]) => (
            <div key={icon} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#555" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Player count */}
        <div style={{ width: "100%", maxWidth: 320 }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", margin: "0 0 10px" }}>
            Number of players
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[2, 3].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)} style={{
                flex: 1, padding: "20px 0",
                fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900,
                color: numPlayers === n ? "#fff" : "#1A1A1A",
                background: numPlayers === n ? "#1C4B3A" : "rgba(0,0,0,0.05)",
                border: `2px solid ${numPlayers === n ? "#1C4B3A" : "transparent"}`,
                borderRadius: 14, cursor: "pointer", transition: "all 150ms ease",
              }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player preview */}
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: numPlayers }, (_, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px",
              background: `${PLAYER_ACCENTS[i]}12`,
              borderRadius: 12, border: `1.5px solid ${PLAYER_ACCENTS[i]}30`,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: PLAYER_ACCENTS[i], flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#333" }}>
                {PLAYER_NAMES[i]}
              </span>
            </div>
          ))}
        </div>

        <button onClick={startGame} style={{
          width: "100%", maxWidth: 320, height: 56,
          background: "#1C4B3A", color: "#fff", border: "none", borderRadius: 14,
          fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, cursor: "pointer",
          letterSpacing: "-0.01em",
        }}>
          Start Game →
        </button>
      </div>
    );
  }

  // ── WINNER ────────────────────────────────────────────────────────────────────
  if (phase === "done" && winner) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "8px 0" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 64, margin: "0 0 12px" }}>🏆</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, margin: "0 0 6px", color: winner.accent, letterSpacing: "-0.02em" }}>
            {winner.name} wins!
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#888", margin: 0 }}>
            All 6 colors matched first
          </p>
        </div>

        {/* Winning color row */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {COLORS.map(c => (
            <div key={c.id} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: c.hex, boxShadow: `0 3px 8px ${c.hex}60`,
            }} />
          ))}
        </div>

        {/* Final scores */}
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              background: p.name === winner.name ? `${p.accent}18` : "rgba(0,0,0,0.03)",
              borderRadius: 12, border: `1.5px solid ${p.name === winner.name ? `${p.accent}40` : "transparent"}`,
            }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: p.accent }}>
                {p.name} {p.name === winner.name ? "🏆" : ""}
              </span>
              <div style={{ display: "flex", gap: 5 }}>
                {COLORS.map(c => (
                  <div key={c.id} style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: p.marked.has(c.id) ? c.hex : "#E8E8E8",
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
          <button onClick={startGame} style={{
            flex: 2, height: 52, background: "#1C4B3A", color: "#fff",
            border: "none", borderRadius: 14, fontFamily: "var(--font-sans)",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Play Again
          </button>
          <button onClick={() => setPhase("setup")} style={{
            flex: 1, height: 52, background: "rgba(0,0,0,0.06)", color: "#666",
            border: "none", borderRadius: 14, fontFamily: "var(--font-sans)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Change players
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "4px 0" }}>

      {/* Turn indicator */}
      <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
        {players.map((p, i) => (
          <div key={i} style={{
            padding: "7px 18px", borderRadius: 20,
            background: i === curIdx ? p.accent : "rgba(0,0,0,0.05)",
            border: `2px solid ${i === curIdx ? p.accent : "transparent"}`,
            transition: "all 250ms ease",
          }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
              color: i === curIdx ? "#fff" : "#ccc",
              transition: "color 250ms ease",
            }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* Spinner SVG */}
      <div style={{ position: "relative", userSelect: "none" }}>
        <svg
          viewBox="-110 -110 220 220"
          width="300"
          height="300"
          style={{ display: "block", overflow: "visible" }}
        >
          {/* ── Rotating wheel ── */}
          <g ref={wheelRef}>
            {SEGMENTS.map((seg, i) => {
              const startDeg = i * 45;
              const endDeg   = (i + 1) * 45;
              const midDeg   = startDeg + 22.5;
              const lp       = polarXY(midDeg, R * 0.62);

              if (seg.id === "wild") {
                // Rainbow wild: 6 sub-slices + star label
                return (
                  <g key={i}>
                    {RAINBOW.map((rColor, ri) => (
                      <path
                        key={ri}
                        d={slicePath(startDeg + ri * 7.5, startDeg + (ri + 1) * 7.5)}
                        fill={rColor}
                        stroke="#fff"
                        strokeWidth="0.8"
                      />
                    ))}
                    {/* White star in centre of segment */}
                    <text
                      x={lp.x.toFixed(2)} y={lp.y.toFixed(2)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="#fff" fontSize="16" fontWeight="900"
                      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
                    >
                      ★
                    </text>
                  </g>
                );
              }

              return (
                <g key={i}>
                  <path
                    d={slicePath(startDeg, endDeg)}
                    fill={seg.hex}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={lp.x.toFixed(2)} y={lp.y.toFixed(2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={seg.id === "x" ? "#999" : "#fff"}
                    fontSize={seg.id === "x" ? "18" : "11"}
                    fontWeight="800"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

            {/* Centre hub */}
            <circle r="16" fill="#fff" stroke="#E0E0E0" strokeWidth="2" />
            <circle r="5"  fill="#D0D0D0" />
          </g>

          {/* ── Fixed outer ring ── */}
          <circle r={R + 4} fill="none" stroke="#E0E0E0" strokeWidth="2.5" />

          {/* ── Fixed pointer (downward-pointing triangle above wheel) ── */}
          <polygon
            points="0,-107 -9,-94 9,-94"
            fill="#1A1A1A"
          />
          <polygon
            points="0,-105 -7,-94 7,-94"
            fill="#fff"
          />
        </svg>
      </div>

      {/* Result message */}
      <div style={{ minHeight: 24, textAlign: "center" }}>
        {lastMsg && (
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
            color: "#1A1A1A", margin: 0,
          }}>
            {lastMsg}
          </p>
        )}
        {phase === "spinning" && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#bbb", margin: 0 }}>
            Spinning…
          </p>
        )}
      </div>

      {/* SPIN button */}
      <button
        onClick={doSpin}
        disabled={phase !== "playing"}
        style={{
          width: "100%", maxWidth: 300, height: 58,
          background: phase === "playing"
            ? (currentPlayer?.accent ?? "#1C4B3A")
            : "#E0E0E0",
          color: "#fff", border: "none", borderRadius: 16,
          fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900,
          cursor: phase === "playing" ? "pointer" : "default",
          letterSpacing: "0.01em", transition: "background 350ms ease",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseDown={e  => { if (phase === "playing") { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}}
        onMouseUp={e    => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
        onTouchStart={e => { if (phase === "playing") { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}}
        onTouchEnd={e   => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
      >
        {phase === "playing"
          ? `${currentPlayer?.name ?? ""} — SPIN!`
          : phase === "spinning"
          ? "Spinning…"
          : "Wait…"}
      </button>

      {/* Player boards */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
        {players.map((p, pi) => (
          <div key={pi} style={{
            background: pi === curIdx ? `${p.accent}10` : "rgba(0,0,0,0.03)",
            borderRadius: 14, padding: "14px 16px",
            border: `1.5px solid ${pi === curIdx ? `${p.accent}40` : "rgba(0,0,0,0.06)"}`,
            transition: "all 200ms ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
                color: pi === curIdx ? p.accent : "#aaa",
                transition: "color 200ms ease",
              }}>
                {p.name}
                {pi === curIdx && phase === "playing" && (
                  <span style={{ marginLeft: 6, fontWeight: 500, opacity: 0.7 }}>← your turn</span>
                )}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "#ccc" }}>
                {p.marked.size} / {COLORS.length}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map(c => {
                const done = p.marked.has(c.id);
                return (
                  <div key={c.id} style={{
                    flex: 1, aspectRatio: "1",
                    borderRadius: "50%",
                    background: done ? c.hex : "#EBEBEB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: done ? `0 2px 6px ${c.hex}55` : "none",
                    transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}>
                    {done && (
                      <span style={{
                        fontSize: "clamp(10px, 2.5vw, 14px)",
                        color: "#fff", fontWeight: 900, lineHeight: 1,
                      }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Wild color picker overlay ── */}
      {phase === "wild" && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            zIndex: 60,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{
            background: "#fff", borderRadius: "20px 20px 0 0",
            padding: "8px 24px 52px",
            width: "100%", maxWidth: 480,
            boxShadow: "0 -4px 40px rgba(0,0,0,0.18)",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E0E0", margin: "12px auto 20px" }} />

            <p style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900,
              color: "#1A1A1A", margin: "0 0 4px", textAlign: "center",
              letterSpacing: "-0.02em",
            }}>
              ★ Wild! Pick any color
            </p>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13, color: "#aaa",
              textAlign: "center", margin: "0 0 22px",
            }}>
              {currentPlayer?.name} — choose a color to mark
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {COLORS.map(c => {
                const already = currentPlayer?.marked.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (!already) {
                        applyColor(c.id, curIdx, numPlayers);
                      }
                    }}
                    disabled={already}
                    style={{
                      width: 72, height: 72,
                      borderRadius: 18,
                      background: already ? "#EBEBEB" : c.hex,
                      border: "none",
                      cursor: already ? "default" : "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 4,
                      opacity: already ? 0.35 : 1,
                      transition: "all 150ms ease",
                      boxShadow: already ? "none" : `0 3px 10px ${c.hex}55`,
                    }}
                    onMouseEnter={e => { if (!already) e.currentTarget.style.transform = "scale(1.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {already
                      ? <span style={{ fontSize: 20, color: "#bbb" }}>✓</span>
                      : <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>{c.label}</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
