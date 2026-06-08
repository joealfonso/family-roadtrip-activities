"use client";
import { useState } from "react";
import { Activity, TYPE_COLORS, TYPE_BG, TYPE_LABELS } from "@/lib/activities";

interface Props {
  activity: Activity;
  onNext: () => void;
}

export default function ActivityDisplay({ activity, onNext }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);

  const gradient = TYPE_COLORS[activity.type];
  const bgClass = TYPE_BG[activity.type];
  const label = TYPE_LABELS[activity.type];

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
      </div>

      <div className="p-5 space-y-4">
        <h2 className="text-xl font-extrabold text-gray-800">{activity.title}</h2>
        <p className="text-gray-700 leading-relaxed text-base">{activity.content}</p>

        {/* QUIZ */}
        {activity.type === "quiz" && activity.options && (
          <div className="space-y-2">
            {activity.options.map((opt) => {
              let cls = "w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ";
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
                <button key={opt} className={cls} onClick={() => !selectedAnswer && setSelectedAnswer(opt)}>
                  {opt === activity.answer && selectedAnswer ? "✅ " : opt === selectedAnswer ? "❌ " : ""}
                  {opt}
                </button>
              );
            })}
            {selectedAnswer && (
              <p className={`text-sm font-semibold ${quizCorrect ? "text-emerald-700" : "text-red-600"}`}>
                {quizCorrect ? "🎉 Correct!" : `Answer: ${activity.answer}`}
              </p>
            )}
          </div>
        )}

        {/* TRUE / FALSE */}
        {activity.type === "trueFalse" && (
          <div className="flex gap-3">
            {[true, false].map((val) => {
              let cls = "flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all duration-200 active:scale-95 ";
              if (tfAnswer === null) {
                cls += val
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100";
              } else if (tfAnswer === val) {
                cls += tfCorrect ? "border-emerald-500 bg-emerald-100" : "border-red-500 bg-red-100";
              } else {
                cls += "opacity-40 border-gray-200 bg-white";
              }
              return (
                <button key={String(val)} className={cls} onClick={() => tfAnswer === null && setTfAnswer(val)}>
                  {val ? "✅ True" : "❌ False"}
                </button>
              );
            })}
          </div>
        )}

        {/* T/F result + hint */}
        {activity.type === "trueFalse" && tfAnswer !== null && (
          <div className="space-y-2">
            <p className={`text-sm font-semibold ${tfCorrect ? "text-emerald-700" : "text-red-600"}`}>
              {tfCorrect ? "🎉 Correct!" : `Answer: ${activity.answer === "true" ? "TRUE" : "FALSE"}`}
            </p>
            {activity.hint && (
              <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm italic text-gray-600">
                {activity.hint}
              </div>
            )}
          </div>
        )}

        {/* Quiz hint after answer */}
        {activity.type === "quiz" && selectedAnswer && activity.hint && (
          <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm italic text-gray-600">
            {activity.hint}
          </div>
        )}

        {/* Reveal for riddles */}
        {activity.type === "riddle" && (
          <div>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="text-sm font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                🔍 Reveal Answer
              </button>
            ) : (
              <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                <p className="font-bold text-gray-800">Answer: {activity.answer}</p>
                {activity.hint && <p className="italic">{activity.hint}</p>}
              </div>
            )}
          </div>
        )}

        {/* Hint for facts/conversations/games */}
        {["fact", "conversation", "game"].includes(activity.type) && activity.hint && (
          <div className="bg-white/70 border border-gray-200 rounded-xl p-3 text-sm italic text-gray-600">
            💡 {activity.hint}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg transition-all duration-200 shadow-lg
            bg-gradient-to-r ${gradient}
            hover:scale-[1.02] active:scale-95`}
        >
          Next Activity →
        </button>
      </div>
    </div>
  );
}
