"use client";

import { useState, useEffect, useRef } from "react";
import { formatCountdown, getCountdownLabel } from "@/lib/store";
import { playFanfare } from "@/lib/sounds";
import { useLocationETA } from "@/lib/useLocationETA";

interface Props {
  arrivalISO:   string | null;
  soundEnabled: boolean;
  gpsMode:      boolean;
}

function fmtDist(km: number): string {
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

function fmtMins(mins: number): string {
  if (mins < 1)  return "less than a minute";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export default function CountdownBanner({ arrivalISO, soundEnabled, gpsMode }: Props) {
  // GPS state owned internally — no prop-passing risk
  const gps = useLocationETA(gpsMode);

  const [manualLabel, setManualLabel] = useState<string | null>(null);
  const [manualKind,  setManualKind]  = useState<"arrived" | "close" | "normal">("normal");
  const firedFanfare = useRef(false);

  // Manual-time countdown (only when GPS is off and a time is set)
  useEffect(() => {
    if (gps.active || !arrivalISO) {
      setManualLabel(null);
      return;
    }
    const tick = () => {
      setManualKind(getCountdownLabel(arrivalISO));
      setManualLabel(formatCountdown(arrivalISO));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [arrivalISO, gps.active]);

  // Fanfare on arrival
  const arrived = gps.active ? gps.arrived : manualKind === "arrived";
  useEffect(() => {
    if (arrived && !firedFanfare.current && soundEnabled) {
      playFanfare();
      firedFanfare.current = true;
    }
    if (!arrived) firedFanfare.current = false;
  }, [arrived, soundEnabled]);

  // ── GPS states ──────────────────────────────────────────────────────────────
  if (gps.active && gps.loading) {
    return (
      <div style={bannerStyle("#555")}>
        <span>📍</span>
        <span>Getting your location…</span>
      </div>
    );
  }

  if (gps.active && gps.error) {
    return (
      <div style={bannerStyle("#B04040")}>
        <span>⚠️</span>
        <span>{gps.error}</span>
      </div>
    );
  }

  if (gps.active && gps.distanceKm !== null) {
    const close = !gps.arrived && (gps.etaMins ?? 99) < 30;
    const bg = gps.arrived ? "#2F9E6E" : close ? "#C98A00" : "#1A1A1A";
    return (
      <div style={bannerStyle(bg)}>
        <span style={{ fontSize: 18 }}>{gps.arrived ? "🎉" : "📍"}</span>
        <span>
          {gps.arrived
            ? "You made it to Banff! Welcome to the mountains."
            : close
            ? `${fmtDist(gps.distanceKm)} away · Almost there — ${fmtMins(gps.etaMins!)} to go!`
            : `${fmtDist(gps.distanceKm)} to Banff · ~${fmtMins(gps.etaMins!)}`}
        </span>
      </div>
    );
  }

  // ── Manual countdown fallback ───────────────────────────────────────────────
  if (!gps.active && manualLabel) {
    const close = manualKind === "close";
    const bg = manualKind === "arrived" ? "#2F9E6E" : close ? "#C98A00" : "#1A1A1A";
    return (
      <div style={bannerStyle(bg)}>
        <span style={{ fontSize: 18 }}>
          {manualKind === "arrived" ? "🎉" : close ? "⏳" : "🏔"}
        </span>
        <span>
          {manualKind === "arrived"
            ? "You made it to Banff! Welcome to the mountains."
            : close
            ? `Almost there — ${manualLabel} to go!`
            : `${manualLabel} until Banff`}
        </span>
      </div>
    );
  }

  return null;
}

function bannerStyle(bg: string): React.CSSProperties {
  return {
    backgroundColor: bg,
    color: "#fff",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "var(--font-sans, sans-serif)",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    transition: "background-color 600ms ease",
  };
}
