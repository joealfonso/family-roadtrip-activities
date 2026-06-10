"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  WAYPOINTS,
  Waypoint,
  NearbyItem,
  findNearestWaypoint,
  distanceKm,
  TYPE_BADGE,
} from "@/lib/waypoints";

type Status = "idle" | "locating" | "found" | "denied" | "error";

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>{item.emoji}</span>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
            color: "#1A1A1A", margin: 0, lineHeight: 1.25,
          }}>
            {item.name}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase",
            color: "#fff", background: badge.color,
            padding: "3px 9px", borderRadius: 20,
          }}>
            {badge.label}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: "#999" }}>
            ⏱ {item.duration}
          </span>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55, color: "#444", margin: 0 }}>
        {item.description}
      </p>

      {item.tip && (
        <div style={{
          background: "#FFF9ED", border: "1px solid #F0D98A",
          borderRadius: 10, padding: "10px 14px",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.5,
            color: "#7A5C00", margin: 0,
          }}>
            {item.tip}
          </p>
        </div>
      )}
    </div>
  );
}

function WaypointPicker({
  current,
  onPick,
}: {
  current: Waypoint;
  onPick: (wp: Waypoint) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", padding: "14px 18px",
          background: "#fff", border: "1.5px solid #E0E0E0",
          borderRadius: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: current.color }}>
          {current.emoji} {current.name}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#bbb" }}>
          {open ? "▲" : "▼"} change
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", borderRadius: 14, border: "1.5px solid #E0E0E0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 30, overflow: "hidden",
          maxHeight: 320, overflowY: "auto",
        }}>
          {WAYPOINTS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => { onPick(wp); setOpen(false); }}
              style={{
                width: "100%", padding: "12px 18px",
                background: wp.id === current.id ? `${wp.color}12` : "none",
                border: "none", borderBottom: "1px solid rgba(0,0,0,0.05)",
                cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: wp.color }}>
                {wp.emoji} {wp.shortName}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#bbb" }}>
                {wp.date}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NearbyPage() {
  const router = useRouter();
  const [status, setStatus]       = useState<Status>("idle");
  const [waypoint, setWaypoint]   = useState<Waypoint | null>(null);
  const [distKm, setDistKm]       = useState<number | null>(null);
  const [manual, setManual]       = useState(false);

  const locate = () => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("locating");
    setManual(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const result = findNearestWaypoint({ lat, lng });
        setWaypoint(result.waypoint);
        setDistKm(result.distanceKm);
        setStatus("found");
      },
      () => setStatus("denied"),
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-locate on mount
  useEffect(() => { locate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualPick = (wp: Waypoint) => {
    setWaypoint(wp);
    setDistKm(null);
    setManual(true);
    setStatus("found");
  };

  const accentColor = waypoint?.color ?? "#1C4B3A";

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EE", paddingBottom: 40 }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: accentColor,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56,
        transition: "background-color 400ms ease",
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
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800,
          color: "#fff", margin: 0, letterSpacing: "-0.01em",
        }}>
          📍 Near Me
        </p>
        <button
          onClick={locate}
          style={{
            fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.18)",
            border: "none", borderRadius: 20,
            padding: "5px 12px", cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Locating ───────────────────────────────────────────────── */}
        {status === "locating" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>🔍</p>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
              color: "#1A1A1A", margin: "0 0 8px",
            }}>
              Finding your location…
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#999", margin: 0 }}>
              Allow location access when prompted
            </p>
          </div>
        )}

        {/* ── Denied / Error ─────────────────────────────────────────── */}
        {(status === "denied" || status === "error") && (
          <div style={{ textAlign: "center", padding: "40px 0 24px" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>📵</p>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
              color: "#1A1A1A", margin: "0 0 8px",
            }}>
              Location not available
            </p>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 14, color: "#888",
              margin: "0 0 24px", lineHeight: 1.6,
            }}>
              {status === "denied"
                ? "Location permission was denied. Pick your stop manually below."
                : "Couldn't get your location. Pick your stop manually below."}
            </p>
            <div style={{ textAlign: "left" }}>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                color: "#1A1A1A", margin: "0 0 10px",
              }}>
                Pick your stop
              </p>
              <WaypointPicker
                current={waypoint ?? WAYPOINTS[0]}
                onPick={handleManualPick}
              />
            </div>
          </div>
        )}

        {/* ── Found ──────────────────────────────────────────────────── */}
        {status === "found" && waypoint && (
          <>
            {/* Location result card */}
            <div style={{
              background: "#fff",
              borderRadius: 20,
              padding: "20px 20px 18px",
              marginBottom: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: `2px solid ${accentColor}22`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: accentColor,
                }}>
                  {manual ? "📌 Manually selected" : "📍 Nearest stop"}
                </span>
                {!manual && distKm !== null && (
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#bbb", fontWeight: 500 }}>
                    {distKm < 10
                      ? `${Math.round(distKm * 10) / 10} km away`
                      : `${Math.round(distKm)} km away`}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 32, lineHeight: 1 }}>{waypoint.emoji}</span>
                <div>
                  <p style={{
                    fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                    color: accentColor, margin: 0, lineHeight: 1.1,
                  }}>
                    {waypoint.name}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-sans)", fontSize: 13, color: "#888",
                    margin: "3px 0 0",
                  }}>
                    {waypoint.tagline}
                  </p>
                </div>
              </div>

              {/* Change stop */}
              <div style={{ marginTop: 14 }}>
                <p style={{
                  fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
                  color: "#bbb", letterSpacing: "0.06em", textTransform: "uppercase",
                  margin: "0 0 8px",
                }}>
                  Not where you are?
                </p>
                <WaypointPicker current={waypoint} onPick={handleManualPick} />
              </div>
            </div>

            {/* Nearby list */}
            <div style={{ marginBottom: 16 }}>
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em",
              }}>
                Things to do
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#999", margin: "0 0 16px" }}>
                {waypoint.nearby.length} suggestion{waypoint.nearby.length !== 1 ? "s" : ""} near {waypoint.shortName}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {waypoint.nearby.map((item, i) => (
                  <NearbyCard key={i} item={item} />
                ))}
              </div>
            </div>

            {/* Other nearby stops */}
            {(() => {
              const others = WAYPOINTS.filter((w) => w.id !== waypoint.id).slice(0, 3);
              return (
                <div style={{ marginTop: 28 }}>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                    color: "#1A1A1A", margin: "0 0 10px", letterSpacing: "-0.01em",
                  }}>
                    Other stops on your route
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {WAYPOINTS.filter((w) => w.id !== waypoint.id).map((wp) => (
                      <button
                        key={wp.id}
                        onClick={() => handleManualPick(wp)}
                        style={{
                          background: "#fff", border: "none", borderRadius: 12,
                          padding: "12px 16px", cursor: "pointer", textAlign: "left",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: wp.color }}>
                          {wp.emoji} {wp.shortName}
                        </span>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#bbb" }}>
                          {wp.date} · {wp.nearby.length} things →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* ── Idle (initial, before geo completes) ───────────────────── */}
        {status === "idle" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>📍</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "#999", margin: 0 }}>
              Getting your location…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
