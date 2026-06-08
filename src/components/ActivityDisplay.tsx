"use client";
import { useState } from "react";
import { Activity, TYPE_COLORS, TYPE_BG, TYPE_LABELS } from "@/lib/activities";

interface Props {
  activity: Activity;
  onComplete: (points: number) => void;
}

export default function ActivityDisplay({ activity, onComplete }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const gradient = TYPE_COLORS[activity.type];
  const bgClass = TYPE_BG[activity.type];
  const label = TYPE_LABELS[activity.type];

  const handleComplete = () => {
    let pts = activity.points;
    if (activity.type === "quiz" && selectedAnswer !== activity.answer) pts = Math.floor(pts / 2);
    if (activity.type === "trueFalse") {
      const correct = activity.answer === "true" ? true : false;
      if (tfAnswer !== correct) pts = Math.floor(pts / 2);
    }
    setDone(true);
    onComplete(pts);
  };

  const quizCorrect = selectedAnswer === activity.answer;
  const tfCorrect =
    tfAnswer !== null &&
    ((activity.answer === "true" && tfAnswer === true) ||
      (activity.answer === "false" && tfAnswer === false));

  return (
    <div className={`rounded-3xl border-2 ${bgClass} overflow-hidden shadow-xl animate-pop-in`}>
      {/* Header band */}
      <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center gap-2`}>
        <span className="text-2xl">{activity.emoji}</span>
        <span className="text-white font-bold text-sm uppercase tracking-widest">{label}</span>
        <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {activity.points} pts
        </span>
      </div>

      <div className="p-5 space-y-4">
        <h2 className="text-xl font-extrabold text-gray-800">{activity.title}</h2>
        <p className="text-gray-700 leading-relaxed text-base">{activity.content}</p>

        {/* QUIZ */}
        {activity.type === "quiz" && activity.options && (
          <div className="space-y-2">
            {activity.options.map((opt) => {
              let cls =
                "w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ";
              if (!selectedAnswer) {
                cls += "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 active:scale-95";
              } else if (opt === activity.answer) {
                cls += "border-emerald-500 bg-emerald-100 text-emerald-800";
              } else if (opt === selectedAnswer) {
                cls += "border-red-400 bg-red-100 text-red-700";
              } else {
                cls += "border-gray-200 bg-white opacity-50";
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => !selectedAnswer && setSelectedAnswer(opt)}
                >
                  {opt === activity.answer && selectedAnswer ? "✅ " : opt === selectedAnswer ? "❌ " : ""}
                  {opt}
                </button>
              );
            })}
            {selectedAnswer && (
              <p className={`text-sm font-semibold mt-1 ${quizCorrect ? "text-emerald-700" : "text-red-600"}`}>
                {quizCorrect ? "🎉 Correct! Full points!" : `Correct answer: ${activity.answer} — half points`}
              </p>
            )}
          </div>
        )}

        {/* TRUE / FALSE */}
        {activity.type === "trueFalse" && (
          <div className="flex gap-3">
            {[true, false].map((val) => {
              let cls =
                "flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all duration-200 active:scale-95 ";
              if (tfAnswer === null) {
                cls += val
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100";
              } else if (tfAnswer === val) {
                cls += tfCorrect && val === tfAnswer
                  ? "border-emerald-500 bg-emerald-100"
                  : !tfCorrect && val === tfAnswer
                  ? "border-red-500 bg-red-100"
                  : "opacity-40 border-gray-200 bg-white";
              } else {
                cls += "opacity-40 border-gray-200 bg-white";
              }
              return (
                <button
                  key={String(val)}
                  className={cls}
                  onClick={() => tfAnswer === null && setTfAnswer(val)}
                >
                  {val ? "✅ True" : "❌ False"}
                </button>
              );
            })}
          </div>
        )}

        {/* T/F result */}
        {activity.type === "trueFalse" && tfAnswer !== null && (
          <p className={`text-sm font-semibold ${tfCorrect ? "text-emerald-700" : "text-red-600"}`}>
            {tfCorrect ? "🎉 Correct! Full points!" : `Wrong — half points. The answer was: ${activity.answer === "true" ? "TRUE" : "FALSE"}`}
          </p>
        )}

        {/* Hint / Answer toggle */}
        {(activity.hint || activity.answer) && activity.type !== "quiz" && activity.type !== "trueFalse" && (
          <div>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="text-sm font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                {activity.type === "riddle" ? "🔍 Reveal Answer" : "💡 Show Hint"}
              </button>
            ) : (
              <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm text-gray-700">
                {activity.type === "riddle" && (
                  <p className="font-bold text-gray-800 mb-1">Answer: {activity.answer}</p>
                )}
                {activity.hint && <p className="italic">{activity.hint}</p>}
              </div>
            )}
          </div>
        )}

        {/* T/F hint */}
        {activity.type === "trueFalse" && tfAnswer !== null && activity.hint && (
          <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm italic text-gray-600">
            {activity.hint}
          </div>
        )}

        {/* Complete button */}
        {!done && (
          <button
            onClick={handleComplete}
            disabled={
              (activity.type === "quiz" && !selectedAnswer) ||
              (activity.type === "trueFalse" && tfAnswer === null)
            }
            className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg transition-all duration-200 shadow-lg
              bg-gradient-to-r ${gradient}
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-95`}
          >
            ✅ Done — Next Activity!
          </button>
        )}

        {done && (
          <div className="text-center py-2 text-emerald-600 font-bold animate-bounce-slow">
            +{activity.points} pts added! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
