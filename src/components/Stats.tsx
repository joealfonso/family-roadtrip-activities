"use client";

interface PlayerStats {
  name: string;
  avatar: string;
  score: number;
}

interface Props {
  players: PlayerStats[];
  completed: number;
  total: number;
  streak: number;
}

const BADGES = [
  { threshold: 50, emoji: "🌱", label: "Seedling" },
  { threshold: 100, emoji: "🏕️", label: "Camper" },
  { threshold: 200, emoji: "🥾", label: "Hiker" },
  { threshold: 350, emoji: "⛰️", label: "Climber" },
  { threshold: 500, emoji: "🏔️", label: "Summit Pro" },
  { threshold: 750, emoji: "🦅", label: "Eagle Scout" },
  { threshold: 1000, emoji: "🌟", label: "Banff Legend" },
];

function getBadge(score: number) {
  const earned = BADGES.filter((b) => score >= b.threshold);
  return earned[earned.length - 1] ?? { emoji: "🗺️", label: "Explorer" };
}

export default function Stats({ players, completed, total, streak }: Props) {
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>🎯 Activities</span>
          <span>{completed}/{total} done ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {streak >= 3 && (
        <div className="text-center text-sm font-bold text-orange-600 animate-bounce-slow">
          🔥 {streak}-activity streak! Keep going!
        </div>
      )}

      {/* Player scoreboard */}
      <div className="grid gap-2">
        {players
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((p, i) => {
            const badge = getBadge(p.score);
            return (
              <div
                key={p.name}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2
                  ${i === 0 ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"}`}
              >
                <span className="text-xl">{i === 0 ? "👑" : i === 1 ? "🥈" : "🥉"}</span>
                <span className="text-2xl">{p.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {badge.emoji} {badge.label}
                  </p>
                </div>
                <span className="font-extrabold text-indigo-600 text-lg">{p.score}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
