"use client";
import { useState } from "react";
import { Activity } from "@/lib/activities";
import { playCorrect, playWrong, playReveal, playNext } from "@/lib/sounds";

interface Props {
  activity: Activity;
  onNext: () => void;
  accentColor: string;
  soundEnabled?: boolean;
}

export default function ActivityDisplay({ activity, onNext, accentColor, soundEnabled = true }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tfAnswer, setTfAnswer]             = useState<boolean | null>(null);
  const [revealed, setRevealed]             = useState(false);

  const sfx = (fn: () => void) => { if (soundEnabled) fn(); };

  const quizCorrect = selectedAnswer === activity.answer;
  const tfCorrect   =
    tfAnswer !== null &&
    ((activity.answer === "true" && tfAnswer) || (activity.answer === "false" && !tfAnswer));

  const handleNext = () => { sfx(playNext); onNext(); };

  return (
    <div
      className="animate-fade-up"
      style={{
        backgroundColor: "#fff",
        border: "2px solid rgba(0,0,0,0.07)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 0 rgba(0,0,0,0.08)",
      }}
    >
      {/* Accent stripe */}
      <div style={{ height: 5, backgroundColor: accentColor }} />

      <div style={{ padding: "28px 24px 24px" }}>

        {/* Emoji + title */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
          <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{activity.emoji}</span>
          <h2 style={{
            fontFamily: "var(--font-display, var(--font-sans, sans-serif))",
            fontSize: "clamp(20px, 4vw, 26px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "#111",
            margin: 0,
          }}>
            {activity.title}
          </h2>
        </div>

        {/* Body text */}
        <p style={{
          fontFamily: "var(--font-sans, sans-serif)",
          fontSize: "clamp(16px, 2.5vw, 18px)",
          lineHeight: 1.65,
          color: "#444",
          margin: "0 0 28px",
        }}>
          {activity.content}
        </p>

        {/* ── Quiz ── */}
        {activity.type === "quiz" && activity.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {activity.options.map((opt) => {
              const isSelected = opt === selectedAnswer;
              const isCorrect  = opt === activity.answer;
              let bg = "#F7F7F7", border = "#E8E8E8", color = "#222", opacity = 1;
              if (selectedAnswer) {
                if (isCorrect)       { bg = "#E8F7F0"; border = "#2F9E6E"; color = "#1A6B49"; }
                else if (isSelected) { bg = "#FDEDED"; border = "#E8472A"; color = "#C03020"; }
                else                 { opacity = 0.35; }
              }
              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (selectedAnswer) return;
                    setSelectedAnswer(opt);
                    sfx(opt === activity.answer ? playCorrect : playWrong);
                  }}
                  style={{
                    textAlign: "left", padding: "14px 16px", borderRadius: 12,
                    border: `1.5px solid ${border}`, backgroundColor: bg,
                    fontFamily: "var(--font-sans, sans-serif)", fontSize: 15, color,
                    opacity, cursor: selectedAnswer ? "default" : "pointer",
                    transition: "all 140ms ease",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  {selectedAnswer && isCorrect   && <span style={{ color: "#2F9E6E", fontWeight: 700 }}>✓</span>}
                  {selectedAnswer && isSelected && !isCorrect && <span style={{ color: "#E8472A", fontWeight: 700 }}>✗</span>}
                  {opt}
                </button>
              );
            })}
            {selectedAnswer && (
              <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, fontWeight: 600, color: quizCorrect ? "#2F9E6E" : "#E8472A", margin: "4px 0 0" }}>
                {quizCorrect ? "Correct!" : `Answer: ${activity.answer}`}
              </p>
            )}
            {selectedAnswer && activity.hint && <Hint text={activity.hint} />}
          </div>
        )}

        {/* ── True / False ── */}
        {activity.type === "trueFalse" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {([true, false] as const).map((val) => {
                const isSelected  = tfAnswer === val;
                const answered    = tfAnswer !== null;
                const thisCorrect = (val && activity.answer === "true") || (!val && activity.answer === "false");
                let bg = val ? "#E8F7F0" : "#FDEDED";
                let border = val ? "#2F9E6E" : "#E8472A";
                let color  = val ? "#1A6B49" : "#C03020";
                let opacity = 1;
                if (answered) {
                  if (!isSelected) { opacity = 0.25; }
                  else if (!thisCorrect) { bg = "#FDEDED"; border = "#E8472A"; color = "#C03020"; }
                }
                return (
                  <button
                    key={String(val)}
                    onClick={() => {
                      if (answered) return;
                      setTfAnswer(val);
                      const correct = (val && activity.answer === "true") || (!val && activity.answer === "false");
                      sfx(correct ? playCorrect : playWrong);
                    }}
                    style={{
                      flex: 1, padding: "16px 0", borderRadius: 12,
                      border: `1.5px solid ${border}`, backgroundColor: bg,
                      fontFamily: "var(--font-sans, sans-serif)", fontSize: 16, fontWeight: 600,
                      color, opacity, cursor: answered ? "default" : "pointer",
                      transition: "all 140ms ease",
                    }}
                  >
                    {val ? "True" : "False"}
                  </button>
                );
              })}
            </div>
            {tfAnswer !== null && (
              <>
                <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, fontWeight: 600, color: tfCorrect ? "#2F9E6E" : "#E8472A", margin: "0 0 10px" }}>
                  {tfCorrect ? "Correct!" : `Answer: ${activity.answer === "true" ? "True" : "False"}`}
                </p>
                {activity.hint && <Hint text={activity.hint} />}
              </>
            )}
          </div>
        )}

        {/* ── Riddle ── */}
        {activity.type === "riddle" && (
          <div style={{ marginBottom: 24 }}>
            {!revealed ? (
              <button
                onClick={() => { setRevealed(true); sfx(playReveal); }}
                style={{
                  fontFamily: "var(--font-sans, sans-serif)", fontSize: 14, fontWeight: 600,
                  color: accentColor, textDecoration: "underline", textUnderlineOffset: 3,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                Reveal answer
              </button>
            ) : (
              <div className="animate-pop-in" style={{ backgroundColor: "#F7F7F7", borderRadius: 12, padding: "14px 16px", border: "1px solid #E8E8E8" }}>
                <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 16, fontWeight: 700, color: "#111", margin: activity.hint ? "0 0 6px" : "0" }}>
                  {activity.answer}
                </p>
                {activity.hint && <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, color: "#888", fontStyle: "italic", margin: 0 }}>{activity.hint}</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Next button ── */}
        <button
          onClick={handleNext}
          style={{
            width: "100%", height: 54, borderRadius: 12, border: "none",
            backgroundColor: accentColor,
            fontFamily: "var(--font-sans, sans-serif)", fontSize: 16, fontWeight: 600,
            color: "#fff", cursor: "pointer", letterSpacing: "-0.01em",
            transition: "transform 140ms cubic-bezier(0.34,1.56,0.64,1), opacity 140ms ease",
          }}
          onMouseDown={e  => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}
          onMouseUp={e    => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.opacity = "1"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}
          onTouchEnd={e   => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.opacity = "1"; }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <div style={{ backgroundColor: "#F7F7F7", border: "1px solid #E8E8E8", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
      <p style={{ fontFamily: "var(--font-sans,sans-serif)", fontSize: 14, fontStyle: "italic", color: "#888", margin: 0 }}>{text}</p>
    </div>
  );
}
