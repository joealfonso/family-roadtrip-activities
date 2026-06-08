"use client";

import { useState, useEffect, useCallback } from "react";
import { activities, getRandomActivity, Activity } from "@/lib/activities";
import ActivityDisplay from "@/components/ActivityDisplay";
import AvatarPicker, { AVATARS } from "@/components/AvatarPicker";
import Stats from "@/components/Stats";

const STORAGE_KEY = "banff-roadtrip-v1";
const TOTAL = activities.length;

interface PlayerState {
  name: string;
  avatar: string;
  score: number;
}

interface AppState {
  players: PlayerState[];
  completedIds: string[];
  streak: number;
  setup: boolean;
  activePlayer: number;
}

const DEFAULT_STATE: AppState = {
  players: [
    { name: "Player 1", avatar: "🦙", score: 0 },
    { name: "Player 2", avatar: "🐸", score: 0 },
  ],
  completedIds: [],
  streak: 0,
  setup: true,
  activePlayer: 0,
};

function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(s: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export default function Home() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [current, setCurrent] = useState<Activity | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadState();
    setState(saved);
    if (!saved.setup) {
      setCurrent(getRandomActivity(saved.completedIds));
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((s: AppState) => {
    setState(s);
    saveState(s);
  }, []);

  const handleComplete = (pts: number) => {
    if (!current) return;

    const newCompleted = [...state.completedIds, current.id];
    const newStreak = state.streak + 1;

    const updatedPlayers = state.players.map((p, i) =>
      i === state.activePlayer ? { ...p, score: p.score + pts } : p
    );

    const newActivePlayer = (state.activePlayer + 1) % state.players.length;

    const newState: AppState = {
      ...state,
      players: updatedPlayers,
      completedIds: newCompleted,
      streak: newStreak,
      activePlayer: newActivePlayer,
    };

    persist(newState);

    if (newStreak % 5 === 0) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }

    setTimeout(() => {
      const next = getRandomActivity(newCompleted);
      setCurrent(next);
    }, 800);
  };

  const handleSetupComplete = () => {
    const newState = { ...state, setup: false };
    persist(newState);
    setCurrent(getRandomActivity([]));
  };

  const handleReset = () => {
    if (!confirm("Reset ALL progress and scores? This can't be undone!")) return;
    const fresh = { ...DEFAULT_STATE, players: state.players, setup: false };
    persist(fresh);
    setCurrent(getRandomActivity([]));
  };

  const updatePlayer = (index: number, field: keyof PlayerState, value: string) => {
    const updated = state.players.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    persist({ ...state, players: updated });
  };

  const addPlayer = () => {
    if (state.players.length >= 6) return;
    const next = AVATARS[state.players.length % AVATARS.length];
    persist({
      ...state,
      players: [
        ...state.players,
        { name: `Player ${state.players.length + 1}`, avatar: next.emoji, score: 0 },
      ],
    });
  };

  const removePlayer = (index: number) => {
    if (state.players.length <= 1) return;
    persist({
      ...state,
      players: state.players.filter((_, i) => i !== index),
      activePlayer: 0,
    });
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">🚗 Loading your trip...</div>
      </div>
    );
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────
  if (state.setup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-center">
            <div className="text-6xl mb-2">🚗🏔️</div>
            <h1 className="text-2xl font-extrabold text-white">Banff Road Trip!</h1>
            <p className="text-sky-100 text-sm mt-1">June 17–19 • Family Edition</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-extrabold text-gray-800 mb-3">Who's in the car? 🚘</h2>
              <div className="space-y-3">
                {state.players.map((player, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                    <AvatarPicker
                      value={player.avatar}
                      playerName=""
                      onSelect={(emoji, name) => {
                        updatePlayer(i, "avatar", emoji);
                        if (player.name === `Player ${i + 1}`) updatePlayer(i, "name", name.split(" ")[0]);
                      }}
                    />
                    <input
                      type="text"
                      value={player.name}
                      maxLength={14}
                      onChange={(e) => updatePlayer(i, "name", e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 font-semibold text-sm focus:outline-none focus:border-indigo-400"
                      placeholder={`Player ${i + 1} name`}
                    />
                    {state.players.length > 1 && (
                      <button
                        onClick={() => removePlayer(i)}
                        className="text-red-400 hover:text-red-600 text-xl font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {state.players.length < 6 && (
                <button
                  onClick={addPlayer}
                  className="mt-3 w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-500 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  + Add player
                </button>
              )}
            </div>

            <div className="bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-700 space-y-1">
              <p className="font-bold">🎮 How to play:</p>
              <p>• Draw activities one at a time</p>
              <p>• Players take turns answering</p>
              <p>• Earn points for correct answers</p>
              <p>• 57 Banff activities to unlock!</p>
            </div>

            <button
              onClick={handleSetupComplete}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Let's Go! 🚗💨
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  const activePlayerData = state.players[state.activePlayer] ?? state.players[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 pb-8">
      {/* Confetti burst */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce-slow">🎉</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-extrabold text-lg leading-tight">🏔️ Banff Trip</h1>
          <p className="text-sky-200 text-xs">June 17–19 · {state.completedIds.length}/{TOTAL} done</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            {showStats ? "🃏 Activity" : "🏆 Scores"}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* Active player indicator */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">{activePlayerData.avatar}</span>
          <div className="flex-1">
            <p className="text-white font-bold">{activePlayerData.name}'s turn</p>
            <p className="text-sky-200 text-xs">{activePlayerData.score} pts</p>
          </div>
          {state.streak >= 3 && (
            <span className="text-orange-300 font-bold text-sm">🔥 {state.streak}</span>
          )}
        </div>

        {/* Stats panel */}
        {showStats && (
          <div className="bg-white rounded-3xl shadow-xl p-5 animate-pop-in">
            <Stats
              players={state.players}
              completed={state.completedIds.length}
              total={TOTAL}
              streak={state.streak}
            />
            <button
              onClick={handleReset}
              className="mt-4 w-full text-xs text-red-400 underline underline-offset-2 hover:text-red-600"
            >
              Reset all progress
            </button>
          </div>
        )}

        {/* Activity card */}
        {!showStats && current && (
          <ActivityDisplay
            key={current.id}
            activity={current}
            onComplete={handleComplete}
          />
        )}

        {/* No activity (all done) */}
        {!showStats && !current && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-pop-in">
            <div className="text-6xl mb-3">🎊</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You did it!</h2>
            <p className="text-gray-600 mb-4">All {TOTAL} activities completed. Banff legends!</p>
            <button
              onClick={() => {
                persist({ ...state, completedIds: [], streak: 0 });
                setCurrent(getRandomActivity([]));
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-2xl shadow"
            >
              🔄 Play Again!
            </button>
          </div>
        )}

        {/* Skip button */}
        {!showStats && current && (
          <button
            onClick={() => {
              persist({ ...state, streak: 0 });
              setCurrent(getRandomActivity(state.completedIds));
            }}
            className="w-full py-2 text-white/70 text-sm underline underline-offset-2 hover:text-white"
          >
            Skip this one →
          </button>
        )}
      </div>
    </div>
  );
}
