"use client";

import { useState } from "react";

type Square = "X" | "O" | null;

const PURPLE = "#7048B6";
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diags
];

function checkWinner(squares: Square[]): { winner: Square; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

export default function TicTacToe() {
  const [squares,   setSquares]   = useState<Square[]>(Array(9).fill(null));
  const [xIsNext,   setXIsNext]   = useState(true);
  const [scores,    setScores]    = useState({ X: 0, O: 0, draw: 0 });
  const [flash,     setFlash]     = useState(false);

  const result    = checkWinner(squares);
  const winner    = result?.winner ?? null;
  const winLine   = result?.line ?? [];
  const isDraw    = !winner && squares.every(Boolean);
  const gameOver  = !!winner || isDraw;

  const handleClick = (i: number) => {
    if (squares[i] || gameOver) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);

    // Check for end immediately with new state
    const r = checkWinner(next);
    const d = !r && next.every(Boolean);
    if (r || d) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
      setScores(prev => ({
        ...prev,
        ...(r ? { [r.winner as string]: prev[r.winner as "X" | "O"] + 1 } : { draw: prev.draw + 1 }),
      }));
    }
  };

  const reset = () => {
    setSquares(Array(9).fill(null));
    // Next game starts with loser (or O if draw)
    if (winner === "X") setXIsNext(false);
    else if (winner === "O") setXIsNext(true);
    else setXIsNext(prev => !prev);
  };

  const fullReset = () => {
    setSquares(Array(9).fill(null));
    setScores({ X: 0, O: 0, draw: 0 });
    setXIsNext(true);
  };

  const statusText = winner
    ? `${winner} wins! 🎉`
    : isDraw
    ? "Draw! 🤝"
    : `${xIsNext ? "X" : "O"}'s turn`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "8px 0" }}>

      {/* Score board */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {(["X", "O", "draw"] as const).map((key) => (
          <div key={key} style={{
            flex: 1, textAlign: "center",
            background: key === "X" ? `${PURPLE}18` : key === "O" ? "#E8472A18" : "rgba(0,0,0,0.04)",
            borderRadius: 14, padding: "14px 8px",
            border: `1.5px solid ${key === "X" ? `${PURPLE}30` : key === "O" ? "#E8472A30" : "rgba(0,0,0,0.08)"}`,
          }}>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, margin: 0,
              color: key === "X" ? PURPLE : key === "O" ? "#E8472A" : "#999",
            }}>
              {scores[key]}
            </p>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: key === "X" ? PURPLE : key === "O" ? "#E8472A" : "#bbb",
              margin: "4px 0 0",
            }}>
              {key === "draw" ? "Draw" : `Player ${key}`}
            </p>
          </div>
        ))}
      </div>

      {/* Status */}
      <p style={{
        fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
        color: winner === "X" ? PURPLE : winner === "O" ? "#E8472A" : isDraw ? "#888" : "#1A1A1A",
        margin: 0, textAlign: "center",
        transition: "color 200ms ease",
      }}>
        {statusText}
      </p>

      {/* Board */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10, width: "100%", maxWidth: 320,
        animation: flash ? "pop-in 300ms ease" : "none",
      }}>
        {squares.map((sq, i) => {
          const isWinSquare = winLine.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              style={{
                aspectRatio: "1",
                borderRadius: 16,
                border: "none",
                background: isWinSquare
                  ? (winner === "X" ? `${PURPLE}22` : "#E8472A22")
                  : "rgba(0,0,0,0.05)",
                cursor: sq || gameOver ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 160ms ease, transform 100ms ease",
                transform: sq ? "scale(1)" : "scale(1)",
                outline: isWinSquare
                  ? `2.5px solid ${winner === "X" ? PURPLE : "#E8472A"}`
                  : "none",
              }}
              onMouseEnter={e => { if (!sq && !gameOver) e.currentTarget.style.background = "rgba(0,0,0,0.09)"; }}
              onMouseLeave={e => { if (!sq && !gameOver) e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
            >
              <span style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(32px, 10vw, 52px)", fontWeight: 900,
                color: sq === "X" ? PURPLE : "#E8472A",
                opacity: sq ? 1 : 0,
                transform: sq ? "scale(1)" : "scale(0.4)",
                transition: "opacity 120ms ease, transform 120ms ease",
                display: "block",
                lineHeight: 1,
              }}>
                {sq}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
        <button
          onClick={reset}
          style={{
            flex: 2,
            padding: "16px 0",
            fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
            color: "#fff", background: PURPLE,
            border: "none", borderRadius: 14, cursor: "pointer",
            transition: "opacity 140ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {gameOver ? "Play Again" : "Reset"}
        </button>
        <button
          onClick={fullReset}
          style={{
            flex: 1,
            padding: "16px 0",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            color: "#999", background: "rgba(0,0,0,0.06)",
            border: "none", borderRadius: 14, cursor: "pointer",
          }}
        >
          Clear scores
        </button>
      </div>
    </div>
  );
}
