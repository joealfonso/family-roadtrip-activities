// localStorage helpers — all SSR-safe (return fallback on server)

export function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  soundEnabled: boolean;
  banffMode: boolean;
  gpsMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  banffMode: false,
  gpsMode: false,
};

export function getSettings(): AppSettings {
  return getLS<AppSettings>("banff_settings", DEFAULT_SETTINGS);
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...patch };
  setLS("banff_settings", next);
  return next;
}

// ── Countdown ─────────────────────────────────────────────────────────────────

export function getArrivalTime(): string | null {
  return getLS<string | null>("banff_arrival", null);
}

export function setArrivalTime(iso: string | null): void {
  setLS("banff_arrival", iso);
}

export function getCountdownLabel(arrivalISO: string): "arrived" | "close" | "normal" {
  const diff = new Date(arrivalISO).getTime() - Date.now();
  if (diff <= 0) return "arrived";
  if (diff < 30 * 60 * 1000) return "close";
  return "normal";
}

export function formatCountdown(arrivalISO: string): string {
  const diff = new Date(arrivalISO).getTime() - Date.now();
  if (diff <= 0) return "arrived";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h} hr ${m} min`;
  if (m > 0) return `${m} min`;
  return "less than a minute";
}

// ── Saved activities ─────────────────────────────────────────────────────────

export interface SavedActivity {
  id: string;
  type: string;
  title: string;
  emoji: string;
  content: string;
  answer?: string;
  hint?: string;
  options?: string[];
  savedAt: number;
}

export function getSaved(): SavedActivity[] {
  return getLS<SavedActivity[]>("trip_saved", []);
}

export function isSaved(id: string): boolean {
  return getSaved().some(s => s.id === id);
}

export function toggleSaved(activity: Omit<SavedActivity, "savedAt">): boolean {
  const saved = getSaved();
  const idx = saved.findIndex(s => s.id === activity.id);
  if (idx >= 0) {
    saved.splice(idx, 1);
    setLS("trip_saved", saved);
    return false; // removed
  }
  saved.push({ ...activity, savedAt: Date.now() });
  setLS("trip_saved", saved);
  return true; // added
}

export function unsaveActivity(id: string): void {
  const saved = getSaved().filter(s => s.id !== id);
  setLS("trip_saved", saved);
}

// ── Trip log ──────────────────────────────────────────────────────────────────

export interface TripEntry {
  id: string;
  type: string;
  title: string;
  emoji: string;
  ts: number; // Date.now()
}

export interface TripLog {
  entries: TripEntry[];
}

export function getTripLog(): TripLog {
  return getLS<TripLog>("banff_triplog", { entries: [] });
}

export function logActivity(entry: Omit<TripEntry, "ts">): void {
  const log = getTripLog();
  // Avoid duplicates within 10 seconds (double-click guard)
  const recent = log.entries.at(-1);
  if (recent && recent.id === entry.id && Date.now() - recent.ts < 10_000) return;
  log.entries.push({ ...entry, ts: Date.now() });
  setLS("banff_triplog", log);
}

export function clearTripLog(): void {
  setLS("banff_triplog", { entries: [] });
}

// Group entries by calendar date label
export function groupByDay(entries: TripEntry[]): { label: string; entries: TripEntry[] }[] {
  const map = new Map<string, TripEntry[]>();
  for (const e of entries) {
    const d = new Date(e.ts);
    const label = d.toLocaleDateString("en-CA", { weekday: "long", month: "short", day: "numeric" });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(e);
  }
  return Array.from(map.entries()).map(([label, entries]) => ({ label, entries }));
}
