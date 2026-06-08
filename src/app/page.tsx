"use client";

import { useState, useEffect } from "react";
import { activities, getRandomActivity, Activity, ActivityType, TYPE_LABELS, TYPE_COLORS } from "@/lib/activities";
import ActivityDisplay from "@/components/ActivityDisplay";

const ALL_TYPES: ActivityType[] = ["conversation", "fact", "trueFalse", "quiz", "game", "riddle"];
const STORAGE_KEY = "banff-categories-v1";

function loadSelected(): ActivityType[] {
  if (typeof window === "undefined") return ALL_TYPES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : ALL_TYPES;
  } catch {
    return ALL_TYPES;
  }
}

export default function Home() {
  const [selected, setSelected] = useState<ActivityType[]>(ALL_TYPES);
  const [current, setCurrent] = useState<Activity | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const cats = loadSelected();
    setSelected(cats);
    const pool = activities.filter((a) => cats.includes(a.type));
    if (pool.length > 0) setCurrent(pool[Math.floor(Math.random() * pool.length)]);
    setHydrated(true);
  }, []);

  const pickNext = (cats: ActivityType[], exclude: string[]) => {
    const pool = activities.filter((a) => cats.includes(a.type) && !exclude.includes(a.id));
    if (pool.length === 0) {
      // all seen — reset
      const full = activities.filter((a) => cats.includes(a.type));
      return full[Math.floor(Math.random() * full.length)] ?? null;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleNext = () => {
    if (!current) return;
    const newSeen = [...seenIds, current.id];
    setSeenIds(newSeen);
    setCurrent(pickNext(selected, newSeen));
  };

  const toggleCategory = (type: ActivityType) => {
    let next: ActivityType[];
    if (selected.includes(type)) {
      if (selected.length === 1) return; // keep at least one
      next = selected.filter((t) => t !== type);
    } else {
      next = [...selected, type];
    }
    setSelected(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // If current activity is no longer in a selected category, pick a new one
    if (current && !next.includes(current.type)) {
      setSeenIds([]);
      const pool = activities.filter((a) => next.includes(a.type));
      setCurrent(pool[Math.floor(Math.random() * pool.length)] ?? null);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">🚗 Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 pb-10">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 text-center">
        <div className="text-4xl mb-1">🚗🏔️</div>
        <h1 className="text-white font-extrabold text-2xl">Banff Road Trip</h1>
        <p className="text-sky-200 text-sm">June 17–19</p>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 pt-2">
        {/* Category filter */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2 px-1">
            Choose categories
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((type) => {
              const active = selected.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleCategory(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95
                    ${active
                      ? `bg-gradient-to-r ${TYPE_COLORS[type]} text-white shadow-md`
                      : "bg-white/20 text-white/60"
                    }`}
                >
                  {TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity card */}
        {current ? (
          <ActivityDisplay key={current.id} activity={current} onNext={handleNext} />
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p className="text-gray-500">Select at least one category above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
