"use client";

import { useRouter } from "next/navigation";
import DragonGame from "@/components/DragonGame";

const COLOR = "#27AE60";

export default function DragonPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#87CEEB", paddingBottom: 0 }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: COLOR,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56,
      }}>
        <button
          onClick={() => router.push("/game")}
          style={{
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.85)", background: "none", border: "none",
            cursor: "pointer", padding: "8px 0",
          }}
        >
          ← Games
        </button>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800,
          color: "#fff", margin: 0, letterSpacing: "-0.01em",
        }}>
          🐉 Dragon Flight
        </p>
        <div style={{ width: 60 }} />
      </header>

      {/* ── Game (full screen, no extra padding) ── */}
      <main style={{ width: "100%", maxWidth: 390, margin: "0 auto" }}>
        <DragonGame />
      </main>
    </div>
  );
}
