"use client";
import { useRouter } from "next/navigation";
import { ActivityType } from "@/lib/activities";
import { ALL_TYPES, CATEGORY_META, TYPE_TO_SLUG } from "@/lib/categories";
import {
  IllustrationTalk, IllustrationFact, IllustrationTrueFalse,
  IllustrationQuiz, IllustrationGame, IllustrationRiddle,
} from "@/components/CategoryIcons";

const ILLUSTRATIONS: Record<ActivityType, () => JSX.Element> = {
  conversation: IllustrationTalk,
  fact:         IllustrationFact,
  trueFalse:    IllustrationTrueFalse,
  quiz:         IllustrationQuiz,
  game:         IllustrationGame,
  riddle:       IllustrationRiddle,
};

interface Props {
  currentType: ActivityType;
  onClose: () => void;
}

export default function CategoryNav({ currentType, onClose }: Props) {
  const router = useRouter();

  const go = (type: ActivityType) => {
    onClose();
    router.push(`/${TYPE_TO_SLUG[type]}`);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        backgroundColor: "#111",
        display: "flex", flexDirection: "column",
        animation: "fade-up 200ms ease both",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "28px 28px 20px",
        borderBottom: "1px solid #222",
      }}>
        <p style={{
          fontFamily: "var(--font-sans, sans-serif)",
          fontSize: 13, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#666", margin: 0,
        }}>
          Switch category
        </p>
        <button
          onClick={onClose}
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 28, fontWeight: 300,
            color: "#666", background: "none",
            border: "none", cursor: "pointer",
            lineHeight: 1, padding: "0 4px",
          }}
        >
          ×
        </button>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: 0,
        overflow: "hidden",
      }}
      className="nav-grid"
      >
        {ALL_TYPES.map((type) => {
          const meta   = CATEGORY_META[type];
          const active = type === currentType;
          const Illustration = ILLUSTRATIONS[type];
          return (
            <button
              key={type}
              onClick={() => go(type)}
              style={{
                position: "relative",
                border: "none",
                backgroundColor: active ? meta.color : "#1A1A1A",
                cursor: "pointer",
                overflow: "hidden",
                padding: 0,
                outline: active ? `3px solid ${meta.color}` : "none",
                outlineOffset: -3,
                transition: "background-color 120ms ease",
              }}
            >
              {/* Illustration — faint on inactive */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "12% 8% 28% 8%",
                opacity: active ? 1 : 0.35,
              }}>
                <Illustration />
              </div>

              {/* Label */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "10px 14px 14px",
                background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
              }}>
                <p style={{
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: 13, fontWeight: 700,
                  color: active ? "#fff" : "#888",
                  margin: 0, letterSpacing: "-0.01em",
                }}>
                  {meta.label}
                </p>
                {active && (
                  <p style={{
                    fontFamily: "var(--font-sans, sans-serif)",
                    fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "2px 0 0",
                  }}>
                    Current
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Home */}
      <div style={{ padding: "16px 28px 32px", borderTop: "1px solid #222" }}>
        <button
          onClick={() => { onClose(); router.push("/"); }}
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 14, fontWeight: 500,
            color: "#555", background: "none",
            border: "none", cursor: "pointer", padding: 0,
          }}
        >
          ← Back to all categories
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-grid { grid-template-columns: repeat(2, 1fr) !important; grid-template-rows: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
