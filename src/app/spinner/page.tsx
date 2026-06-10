"use client";

import { useRouter } from "next/navigation";
import ColorSpinner from "@/components/ColorSpinner";

const COLOR = "#D97706";

export default function SpinnerPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F3EE", paddingBottom: 40 }}>

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
          🎨 Color Spinner
        </p>
        <div style={{ width: 60 }} />
      </header>

      {/* ── Game ── */}
      <main style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        <ColorSpinner />
      </main>
    </div>
  );
}
