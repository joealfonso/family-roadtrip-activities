"use client";

import { WAYPOINTS } from "@/lib/waypoints";

interface RouteMapProps {
  selectedId?: string;
  userCoords?: { lat: number; lng: number };
}

// ── Projection ────────────────────────────────────────────────────────────────
// Tight bounds around the actual stops (with a little padding)
const MIN_LNG = -120.2, MAX_LNG = -112.2;
const MIN_LAT =  49.0,  MAX_LAT =  52.7;
const VW = 320, VH = 180;

function project(lat: number, lng: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * VW;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * VH;
  return { x, y };
}

// Slight jitter for waypoints that share coords (Grassi ≈ Canmore)
const OFFSETS: Record<string, { dx: number; dy: number }> = {
  grassi:            { dx:  6, dy:  8 },
  johnstoncanyon:    { dx: -7, dy: -6 },
  morainelake:       { dx:  8, dy:  6 },
};

export default function RouteMap({ selectedId, userCoords }: RouteMapProps) {
  const pts = WAYPOINTS.map(wp => {
    const off = OFFSETS[wp.id] ?? { dx: 0, dy: 0 };
    const { x, y } = project(wp.coords.lat, wp.coords.lng);
    return { x: x + off.dx, y: y + off.dy, wp };
  });

  const userPt = userCoords ? project(userCoords.lat, userCoords.lng) : null;

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      background: "#EDF4FA",
      border: "1.5px solid rgba(0,0,0,0.07)",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    }}>
      <svg
        viewBox={`-12 -12 ${VW + 24} ${VH + 24}`}
        width="100%"
        style={{ display: "block" }}
        aria-label="Route map"
      >
        {/* ── Background ── */}
        <rect x={-12} y={-12} width={VW + 24} height={VH + 24} fill="#EDF4FA" />

        {/* ── Subtle grid lines for orientation ── */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={`v${t}`}
            x1={(t * VW).toFixed(0)} y1={-12} x2={(t * VW).toFixed(0)} y2={VH + 12}
            stroke="rgba(255,255,255,0.6)" strokeWidth="1"
          />
        ))}
        {[0.33, 0.67].map(t => (
          <line key={`h${t}`}
            x1={-12} y1={(t * VH).toFixed(0)} x2={VW + 12} y2={(t * VH).toFixed(0)}
            stroke="rgba(255,255,255,0.6)" strokeWidth="1"
          />
        ))}

        {/* ── Waypoint dots ── */}
        {pts.map(({ x, y, wp }) => {
          const sel = wp.id === selectedId;
          const cx = x.toFixed(1), cy = y.toFixed(1);
          return (
            <g key={wp.id}>
              {/* Selection pulse ring */}
              {sel && (
                <circle cx={cx} cy={cy} r="14" fill={wp.color} opacity="0.18" />
              )}

              {/* Main dot */}
              <circle
                cx={cx} cy={cy}
                r={sel ? 8 : 5}
                fill={sel ? wp.color : "#fff"}
                stroke={wp.color}
                strokeWidth={sel ? 0 : 2}
              />

              {/* Day number inside unselected dots */}
              {!sel && (
                <text
                  x={cx} y={(y + 0.5).toFixed(1)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="5" fontWeight="700"
                  fill={wp.color}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {wp.day}
                </text>
              )}

              {/* Emoji above selected dot */}
              {sel && (
                <text
                  x={cx} y={(y - 14).toFixed(1)}
                  textAnchor="middle" dominantBaseline="auto"
                  fontSize="14"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {wp.emoji}
                </text>
              )}

              {/* Name below selected dot */}
              {sel && (
                <text
                  x={cx} y={(y + 20).toFixed(1)}
                  textAnchor="middle" dominantBaseline="hanging"
                  fontSize="7.5" fontWeight="800"
                  fill={wp.color}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {wp.shortName}
                </text>
              )}
            </g>
          );
        })}

        {/* ── User GPS dot ── */}
        {userPt && (
          <g>
            <circle cx={userPt.x.toFixed(1)} cy={userPt.y.toFixed(1)} r="10" fill="#1B72C0" opacity="0.15" />
            <circle cx={userPt.x.toFixed(1)} cy={userPt.y.toFixed(1)} r="5"  fill="#1B72C0" stroke="#fff" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* ── Legend bar ── */}
      <div style={{
        padding: "8px 14px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10,
      }}>
        {selectedId ? (() => {
          const wp = WAYPOINTS.find(w => w.id === selectedId);
          return wp ? (
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: wp.color }}>
              {wp.emoji} {wp.name} · Day {wp.day}
            </span>
          ) : null;
        })() : (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#bbb" }}>
            {WAYPOINTS.length} stops · Jun 10–20
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "#bbb" }}>
            Numbers = day
          </span>
          {userCoords && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans)", fontSize: 10, color: "#1B72C0", fontWeight: 600 }}>
              <svg width="7" height="7"><circle cx="3.5" cy="3.5" r="3.5" fill="#1B72C0"/></svg>
              You
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
