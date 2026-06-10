"use client";

import { useState } from "react";
import { getTripLog, clearTripLog, groupByDay } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { ActivityType } from "@/lib/activities";

interface Props {
  onClose: () => void;
}

export default function TripLogPanel({ onClose }: Props) {
  const [log, setLog] = useState(() => getTripLog());
  const groups = groupByDay(log.entries);

  const handleClear = () => {
    if (!confirm("Clear all logged activities?")) return;
    clearTripLog();
    setLog({ entries: [] });
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: "100%", maxWidth: 560, margin: "0 auto",
          backgroundColor: "#fff", borderRadius: "20px 20px 0 0",
          padding: "8px 24px 48px",
          maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0", margin: "12px auto 24px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display,sans-serif)", fontSize: 20, fontWeight: 800, color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>
            📓 Trip Log
          </h2>
          {log.entries.length > 0 && (
            <button
              onClick={handleClear}
              style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 12, color: "#bbb", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear all
            </button>
          )}
        </div>

        {log.entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#bbb" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📭</p>
            <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, margin: 0 }}>
              No activities logged yet. Play some games!
            </p>
          </div>
        ) : (
          groups.map(({ label, entries }) => (
            <div key={label} style={{ marginBottom: 24 }}>
              <p style={{
                fontFamily: "var(--font-sans,sans-serif)", fontSize: 11, fontWeight: 700,
                color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase",
                margin: "0 0 10px",
              }}>
                {label} · {entries.length} {entries.length === 1 ? "activity" : "activities"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entries.map((e, i) => {
                  const meta = CATEGORY_META[e.type as ActivityType];
                  const time = new Date(e.ts).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={`${e.id}-${i}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 12,
                      backgroundColor: "#F8F8F8",
                    }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{e.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, fontWeight: 600, color: "#1A1A1A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {e.title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{
                            fontFamily: "var(--font-sans,sans-serif)", fontSize: 10, fontWeight: 700,
                            color: "#fff", backgroundColor: meta?.color ?? "#888",
                            padding: "1px 7px", borderRadius: 20, letterSpacing: "0.04em",
                          }}>
                            {meta?.label ?? e.type}
                          </span>
                          <span style={{ fontFamily: "var(--font-mono,monospace)", fontSize: 11, color: "#bbb" }}>{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
