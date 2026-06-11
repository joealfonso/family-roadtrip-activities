"use client";

import { useRouter } from "next/navigation";
import { WAYPOINTS, getWaypointById, TYPE_BADGE, NearbyItem } from "@/lib/waypoints";
import { ALL_TYPES, CATEGORY_META, TYPE_TO_SLUG } from "@/lib/categories";

const DAY_COLORS = ["", "#1C4B3A", "#2E6DA4", "#5C6B3A"];

function NearbyCard({ item }: { item: NearbyItem }) {
  const badge = TYPE_BADGE[item.type];
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 20px 18px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>{item.emoji}</span>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 16, fontWeight: 700,
            color: "#1A1A1A", margin: 0, lineHeight: 1.25,
          }}>
            {item.name}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "#fff",
            background: badge.color,
            padding: "3px 9px", borderRadius: 20,
          }}>
            {badge.label}
          </span>
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12, fontWeight: 500,
            color: "#999",
          }}>
            ⏱ {item.duration}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: 14, lineHeight: 1.55,
        color: "#444", margin: 0,
      }}>
        {item.description}
      </p>

      {/* Tip */}
      {item.tip && (
        <div style={{
          background: "#FFF9ED",
          border: "1px solid #F0D98A",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13, lineHeight: 1.5,
            color: "#7A5C00", margin: 0,
          }}>
            {item.tip}
          </p>
        </div>
      )}
    </div>
  );
}

export default function WaypointPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const waypoint = getWaypointById(params.id);

  if (!waypoint) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", color: "#999", fontSize: 16 }}>Waypoint not found.</p>
          <button onClick={() => router.push("/")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "none", background: "#1C4B3A", color: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            ← Home
          </button>
        </div>
      </div>
    );
  }

  // Which waypoints are adjacent?
  const idx      = WAYPOINTS.findIndex((w) => w.id === waypoint.id);
  const prevWp   = idx > 0 ? WAYPOINTS[idx - 1] : null;
  const nextWp   = idx < WAYPOINTS.length - 1 ? WAYPOINTS[idx + 1] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EE", paddingBottom: 80 }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: waypoint.color,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56, flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.85)", background: "none", border: "none",
            cursor: "pointer", padding: "8px 0",
          }}
        >
          ← Home
        </button>

        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: 16, fontWeight: 800,
          color: "#fff", margin: 0,
          letterSpacing: "-0.01em",
        }}>
          {waypoint.emoji} {waypoint.shortName}
        </p>

        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          background: "rgba(255,255,255,0.18)",
          padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em",
        }}>
          Day {waypoint.day}
        </span>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(170deg, ${waypoint.color} 0%, ${waypoint.color}CC 60%, #F6F3EE 100%)`,
        padding: "32px 20px 40px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px", lineHeight: 1 }}>{waypoint.emoji}</p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 7vw, 40px)",
            fontWeight: 900, color: "#fff",
            margin: "0 0 8px", lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}>
            {waypoint.name}
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14, fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            margin: 0, lineHeight: 1.5,
          }}>
            {waypoint.tagline}
          </p>
        </div>
      </div>

      {/* ── Arrival Note ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: "18px 20px",
          marginTop: -20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📍</span>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14, lineHeight: 1.6,
            color: "#333", margin: 0,
            fontStyle: "italic",
          }}>
            {waypoint.arrivalNote}
          </p>
        </div>

        {/* ── Section header ─────────────────────────────────────────── */}
        <div style={{ padding: "28px 0 16px" }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 20, fontWeight: 800,
            color: "#1A1A1A", margin: 0,
            letterSpacing: "-0.02em",
          }}>
            What&rsquo;s Nearby
          </h2>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13, color: "#999",
            margin: "4px 0 0",
          }}>
            {waypoint.nearby.length} thing{waypoint.nearby.length !== 1 ? "s" : ""} to do near {waypoint.shortName}
          </p>
        </div>

        {/* ── Nearby cards ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {waypoint.nearby.map((item, i) => (
            <NearbyCard key={i} item={item} />
          ))}
        </div>

        {/* ── Activities ────────────────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
            color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em",
          }}>
            Activities
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#999", margin: "0 0 14px" }}>
            Play a round while you&apos;re here
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_TYPES.filter(t => t !== "game").map(t => {
              const m = CATEGORY_META[t];
              return (
                <button
                  key={t}
                  onClick={() => router.push(`/${TYPE_TO_SLUG[t]}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 14px",
                    background: `${m.color}14`,
                    border: `1.5px solid ${m.color}30`,
                    borderRadius: 24, cursor: "pointer",
                    transition: "all 140ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${m.color}28`; e.currentTarget.style.borderColor = `${m.color}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${m.color}14`; e.currentTarget.style.borderColor = `${m.color}30`; }}
                >
                  <span style={{ fontSize: 16 }}>{m.emoji}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: m.color }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
            {/* Games chip */}
            <button
              onClick={() => router.push("/game")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 14px",
                background: `${CATEGORY_META.game.color}14`,
                border: `1.5px solid ${CATEGORY_META.game.color}30`,
                borderRadius: 24, cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>🎮</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: CATEGORY_META.game.color }}>
                Games
              </span>
            </button>
          </div>
        </div>

        {/* ── Next/Prev waypoints ────────────────────────────────────── */}
        {(prevWp || nextWp) && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: 18, fontWeight: 800,
              color: "#1A1A1A", margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}>
              Your Route
            </h2>
            <div style={{ display: "flex", gap: 10 }}>
              {prevWp && (
                <button
                  onClick={() => router.push(`/waypoint/${prevWp.id}`)}
                  style={{
                    flex: 1, padding: "14px 16px",
                    background: "#fff", border: "none", borderRadius: 14,
                    cursor: "pointer", textAlign: "left",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#bbb", margin: "0 0 4px", fontWeight: 600, letterSpacing: "0.04em" }}>← PREV STOP</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: prevWp.color, margin: 0 }}>
                    {prevWp.emoji} {prevWp.shortName}
                  </p>
                </button>
              )}
              {nextWp && (
                <button
                  onClick={() => router.push(`/waypoint/${nextWp.id}`)}
                  style={{
                    flex: 1, padding: "14px 16px",
                    background: "#fff", border: "none", borderRadius: 14,
                    cursor: "pointer", textAlign: "right",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#bbb", margin: "0 0 4px", fontWeight: 600, letterSpacing: "0.04em" }}>NEXT STOP →</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: nextWp.color, margin: 0 }}>
                    {nextWp.emoji} {nextWp.shortName}
                  </p>
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>

      {/* ── Fixed bottom nav ───────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", alignItems: "stretch",
        borderTop: "1px solid #E8E8E8", backgroundColor: "#fff",
        zIndex: 20, height: 56,
      }}>
        {prevWp && (
          <button
            onClick={() => router.push(`/waypoint/${prevWp.id}`)}
            style={{
              flex: 1, padding: "0 16px",
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
              color: prevWp.color, background: "none", border: "none",
              borderRight: "1px solid #E8E8E8", cursor: "pointer", textAlign: "left",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            ← {prevWp.shortName}
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          style={{
            flex: prevWp && nextWp ? 0 : 1,
            width: prevWp && nextWp ? 56 : undefined,
            flexShrink: 0, fontSize: 20, color: "#bbb",
            background: "none", border: "none",
            borderRight: nextWp ? "1px solid #E8E8E8" : "none",
            cursor: "pointer",
          }}
        >
          🏠
        </button>
        {nextWp && (
          <button
            onClick={() => router.push(`/waypoint/${nextWp.id}`)}
            style={{
              flex: 1, padding: "0 16px",
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
              color: nextWp.color, background: "none", border: "none",
              cursor: "pointer", textAlign: "right",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {nextWp.shortName} →
          </button>
        )}
      </nav>
    </div>
  );
}
