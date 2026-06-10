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
  const rawGps = useLocationETA(gpsMode);

  // Flatten to safe primitives — never access rawGps.anything inline
  const gpsActive     = rawGps?.active     ?? false;
  const gpsLoading    = rawGps?.loading    ?? false;
  const gpsError      = rawGps?.error      ?? null;
  const gpsDistanceKm = rawGps?.distanceKm ?? null;
  const gpsEtaMins    = rawGps?.etaMins    ?? null;
  const gpsArrived    = rawGps?.arrived    ?? false;

  const [manualLabel, setManualLabel] = useState<string | null>(null);
  const [manualKind,  setManualKind]  = useState<"arrived" | "close" | "normal">("normal");
  const firedFanfare = useRef(false);

  // Manual-time countdown (only when GPS is off and a time is set)
  useEffect(() => {
    if (gpsActive || !arrivalISO) {
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
  }, [arrivalISO, gpsActive]);

  // Fanfare on arrival
  const arrived = gpsActive ? gpsArrived : manualKind === "arrived";
  useEffect(() => {
    if (arrived && !firedFanfare.current && soundEnabled) {
      playFanfare();
      firedFanfare.current = true;
    }
    if (!arrived) firedFanfare.current = false;
  }, [arrived, soundEnabled]);

  // ── GPS states ──────────────────────────────────────────────────────────────
  if (gpsActive && gpsLoading) {
    return (
      <div style={bannerStyle("#555")}>
        <span>📍</span>
        <span>Getting your location…</span>
      </div>
    );
  }

  if (gpsActive && gpsError) {
    return (
      <div style={bannerStyle("#B04040")}>
        <span>⚠️</span>
        <span>{gpsError}</span>
      </div>
    );
  }

  if (gpsActive && gpsDistanceKm !== null) {
    const close = !gpsArrived && (gpsEtaMins ?? 99) < 30;
    const bg = gpsArrived ? "#2F9E6E" : close ? "#C98A00" : "#1A1A1A";
    return (
      <div style={bannerStyle(bg)}>
        <span style={{ fontSize: 18 }}>{gpsArrived ? "🎉" : "📍"}</span>
        <span>
          {gpsArrived
            ? "You made it to Banff! Welcome to the mountains."
            : close
            ? `${fmtDist(gpsDistanceKm)} away · Almost there — ${fmtMins(gpsEtaMins!)} to go!`
            : `${fmtDist(gpsDistanceKm)} to Banff · ~${fmtMins(gpsEtaMins!)}`}
        </span>
      </div>
    );
  }

  // ── Manual countdown fallback ───────────────────────────────────────────────
  if (!gpsActive && manualLabel) {
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
