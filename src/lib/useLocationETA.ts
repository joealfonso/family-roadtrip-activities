"use client";

import { useState, useEffect, useRef } from "react";
import { setArrivalTime } from "./store";

// Banff townsite centre
const BANFF = { lat: 51.1784, lng: -115.5708 };

// Conservative average: mountain roads, speed changes, brief stops
const AVG_SPEED_KMH = 78;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLng = r(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export interface ETAState {
  active:      boolean;
  loading:     boolean;
  error:       string | null;
  distanceKm:  number | null;
  etaMins:     number | null;
  arrived:     boolean;
}

const IDLE: ETAState = {
  active: false, loading: false, error: null,
  distanceKm: null, etaMins: null, arrived: false,
};

export function useLocationETA(enabled: boolean): ETAState {
  const [state, setState] = useState<ETAState>(IDLE);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setState(IDLE);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ ...IDLE, active: true, error: "GPS not available on this device" });
      return;
    }

    setState({ ...IDLE, active: true, loading: true });

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const distanceKm = haversineKm(
          pos.coords.latitude, pos.coords.longitude,
          BANFF.lat, BANFF.lng
        );
        const arrived  = distanceKm < 2;
        const etaMins  = arrived ? 0 : Math.round(distanceKm / AVG_SPEED_KMH * 60);
        const etaISO   = arrived
          ? new Date(Date.now() - 1000).toISOString()       // mark as arrived
          : new Date(Date.now() + etaMins * 60_000).toISOString();

        setArrivalTime(etaISO);
        setState({ active: true, loading: false, error: null, distanceKm, etaMins, arrived });
      },
      (err) => {
        const msg =
          err.code === 1 ? "Location permission denied — enable it in Settings" :
          err.code === 2 ? "Location unavailable" :
          "GPS timed out";
        setState(s => ({ ...s, loading: false, error: msg }));
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled]);

  return state;
}
