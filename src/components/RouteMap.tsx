"use client";

import { WAYPOINTS } from "@/lib/waypoints";

interface RouteMapProps {
  selectedId?: string;                      // highlighted waypoint (nearest / picked)
  userCoords?: { lat: number; lng: number }; // raw GPS position
}

// ── Projection ────────────────────────────────────────────────────────────────
// Bounding box that comfortably contains the whole route
const MIN_LNG = -120.6, MAX_LNG = -112.0;
const MIN_LAT =  49.0,  MAX_LAT =  52.7;
const VW = 340, VH = 200; // SVG viewBox size

function project(lat: number, lng: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * VW;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * VH; // y inverted
  return { x, y };
}

export default function RouteMap({ selectedId, userCoords }: RouteMapProps) {
  const pts = WAYPOINTS.map(wp => ({ ...project(wp.coords.lat, wp.coords.lng), wp }));

  // Build polyline points string
  const linePoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

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
        viewBox={`-8 -8 ${VW + 16} ${VH + 16}`}
        width="100%"
        style={{ display: "block" }}
        aria-label="Route map"
      >
        {/* ── Background ── */}
        <rect x={-8} y={-8} width={VW + 16} height={VH + 16} fill="#EDF4FA" />

        {/* ── Route line (dashed, behind dots) ── */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#B0C8D8"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeDasharray="4 3"
        />

        {/* ── Waypoint dots ── */}
        {pts.map(({ x, y, wp }) => {
          const isSelected = wp.id === selectedId;
          return (
            <g key={wp.id}>
              {/* Selection halo */}
              {isSelected && (
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="11" fill={wp.color} opacity="0.22" />
              )}
              {/* Dot */}
              <circle
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r={isSelected ? 6 : 4}
                fill={isSelected ? wp.color : "#fff"}
                stroke={wp.color}
                strokeWidth={isSelected ? 2 : 1.5}
              />
              {/* Emoji label for selected */}
              {isSelected && (
                <text
                  x={x.toFixed(1)}
                  y={(y - 13).toFixed(1)}
                  textAnchor="middle"
                  fontSize="13"
                  style={{ userSelect: "none" }}
                >
                  {wp.emoji}
                </text>
              )}
              {/* Name label for selected */}
              {isSelected && (
                <text
                  x={x.toFixed(1)}
                  y={(y + 18).toFixed(1)}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="700"
                  fill={wp.color}
                  style={{ userSelect: "none" }}
                >
                  {wp.shortName}
                </text>
              )}
            </g>
          );
        })}

        {/* ── User GPS position ── */}
        {userPt && (
          <g>
            <circle cx={userPt.x.toFixed(1)} cy={userPt.y.toFixed(1)} r="9" fill="#1B72C0" opacity="0.18" />
            <circle cx={userPt.x.toFixed(1)} cy={userPt.y.toFixed(1)} r="5" fill="#1B72C0" stroke="#fff" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{
        padding: "8px 14px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        {selectedId && (() => {
          const wp = WAYPOINTS.find(w => w.id === selectedId);
          return wp ? (
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: wp.color }}>
              {wp.emoji} {wp.name} · Day {wp.day}
            </span>
          ) : null;
        })()}
        {userCoords && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)", fontSize: 11, color: "#1B72C0", fontWeight: 600, marginLeft: "auto" }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#1B72C0"/></svg>
            Your location
          </span>
        )}
        {!selectedId && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#bbb" }}>
            {WAYPOINTS.length} stops · Jun 10–20
          </span>
        )}
      </div>
    </div>
  );
}
