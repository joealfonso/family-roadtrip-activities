"use client";

import { useState } from "react";
import { AppSettings, saveSettings, setArrivalTime, getArrivalTime } from "@/lib/store";

interface Props {
  settings:  AppSettings;
  onUpdate:  (s: AppSettings) => void;
  onClose:   () => void;
  onOpenLog: () => void;
}

function Toggle({ on, onChange, label, sub }: {
  on: boolean; onChange: (v: boolean) => void; label: string; sub: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", textAlign: "left",
      }}
    >
      <div>
        <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 15, fontWeight: 600, color: "#1A1A1A", margin: 0 }}>{label}</p>
        <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 12, color: "#888", margin: "2px 0 0" }}>{sub}</p>
      </div>
      <div style={{
        width: 46, height: 26, borderRadius: 13, flexShrink: 0, marginLeft: 16,
        backgroundColor: on ? "#1A1A1A" : "#D0D0D0",
        position: "relative", transition: "background-color 200ms ease",
      }}>
        <div style={{
          position: "absolute", top: 3, left: on ? 23 : 3,
          width: 20, height: 20, borderRadius: "50%",
          backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 200ms ease",
        }} />
      </div>
    </button>
  );
}

export default function SettingsPanel({ settings, onUpdate, onClose, onOpenLog }: Props) {
  const existing = getArrivalTime();
  const [timeVal, setTimeVal] = useState<string>(() => {
    if (!existing) return "";
    const d = new Date(existing);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const set = (patch: Partial<AppSettings>) => {
    const next = saveSettings(patch);
    onUpdate(next);
  };

  const handleTimeChange = (val: string) => {
    setTimeVal(val);
    if (!val) { setArrivalTime(null); return; }
    const [h, m] = val.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    setArrivalTime(d.toISOString());
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}>
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: "100%", maxWidth: 560, margin: "0 auto",
          backgroundColor: "#fff", borderRadius: "20px 20px 0 0",
          padding: "8px 24px 48px",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0", margin: "12px auto 24px" }} />

        <h2 style={{ fontFamily: "var(--font-display,sans-serif)", fontSize: 20, fontWeight: 800, color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Settings
        </h2>
        <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 13, color: "#999", margin: "0 0 8px" }}>
          Banff Road Trip · Jun 17–19
        </p>

        <Toggle
          on={settings.soundEnabled}
          onChange={v => set({ soundEnabled: v })}
          label="🔔 Sound effects"
          sub="Chimes on correct answers, buzzer on wrong"
        />
        <Toggle
          on={settings.banffMode}
          onChange={v => set({ banffMode: v })}
          label="🏔 Banff mode"
          sub="Only show Banff-specific activities"
        />

        {/* GPS countdown */}
        <Toggle
          on={settings.gpsMode}
          onChange={v => {
            set({ gpsMode: v });
            if (!v) setArrivalTime(null); // clear GPS-set ETA when disabled
          }}
          label="📍 Use my location"
          sub="Live countdown based on where you are right now"
        />

        {/* Manual time fallback — shown only when GPS is off */}
        {!settings.gpsMode && (
          <div style={{ padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, fontWeight: 600, color: "#555", margin: "0 0 4px" }}>
              ⏱ Or set arrival time manually
            </p>
            <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 12, color: "#bbb", margin: "0 0 12px" }}>
              Backup for when GPS isn't available
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="time"
                value={timeVal}
                onChange={e => handleTimeChange(e.target.value)}
                style={{
                  fontFamily: "var(--font-mono,monospace)", fontSize: 18, fontWeight: 600,
                  color: "#1A1A1A", border: "2px solid #E0E0E0", borderRadius: 10,
                  padding: "10px 14px", background: "#F8F8F8", outline: "none", cursor: "pointer",
                }}
              />
              {timeVal && (
                <button
                  onClick={() => { setTimeVal(""); setArrivalTime(null); }}
                  style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 12, color: "#bbb", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Trip log */}
        <button
          onClick={() => { onClose(); onOpenLog(); }}
          style={{
            width: "100%", marginTop: 16, padding: "14px 20px",
            fontFamily: "var(--font-sans,sans-serif)", fontSize: 15, fontWeight: 600,
            color: "#1A1A1A", backgroundColor: "#F5F5F5",
            border: "none", borderRadius: 12, cursor: "pointer",
            textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span>📓 View trip log</span>
          <span style={{ color: "#bbb" }}>→</span>
        </button>
      </div>
    </div>
  );
}
