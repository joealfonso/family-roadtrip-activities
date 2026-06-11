"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSaved, unsaveActivity, SavedActivity } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import type { ActivityType } from "@/lib/activities";

function SavedCard({ item, onRemove }: { item: SavedActivity; onRemove: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const meta = CATEGORY_META[item.type as ActivityType] ?? { color: "#888", label: item.type, emoji: "📝" };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      border: "1.5px solid rgba(0,0,0,0.07)",
    }}>
      {/* Accent stripe */}
      <div style={{ height: 4, backgroundColor: meta.color }} />

      <div style={{ padding: "18px 18px 16px" }}>
        {/* Category chip + remove */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: meta.color, background: `${meta.color}15`,
            padding: "3px 10px", borderRadius: 20,
          }}>
            {meta.emoji} {meta.label}
          </span>
          <button
            onClick={onRemove}
            aria-label="Remove"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, color: "#ccc", padding: 4, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800,
            color: "#111", margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
          }}>
            {item.title}
          </p>
        </div>

        {/* Content */}
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6,
          color: "#444", margin: "0 0 12px",
        }}>
          {item.content}
        </p>

        {/* Answer / hint reveal */}
        {(item.answer || item.hint) && (
          <div>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                  color: meta.color, background: "none", border: "none",
                  cursor: "pointer", padding: 0, textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {item.type === "riddle" ? "Reveal answer" : "Show answer / hint"}
              </button>
            ) : (
              <div style={{
                background: "#F7F7F7", border: "1px solid #E8E8E8",
                borderRadius: 10, padding: "12px 14px",
              }}>
                {item.answer && (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#111", margin: item.hint ? "0 0 4px" : "0" }}>
                    {item.answer}
                  </p>
                )}
                {item.hint && (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#888", fontStyle: "italic", margin: 0 }}>
                    {item.hint}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quiz options */}
        {item.options && item.options.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {item.options.map(opt => (
              <div
                key={opt}
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: opt === item.answer ? "#E8F7F0" : "#F7F7F7",
                  border: `1px solid ${opt === item.answer ? "#2F9E6E" : "#E8E8E8"}`,
                  fontFamily: "var(--font-sans)", fontSize: 13,
                  color: opt === item.answer ? "#1A6B49" : "#555",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {opt === item.answer && <span style={{ fontWeight: 700, color: "#2F9E6E" }}>✓</span>}
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedActivity[]>([]);

  useEffect(() => {
    setItems(getSaved().slice().reverse()); // newest first
  }, []);

  const handleRemove = (id: string) => {
    unsaveActivity(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EE", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: "#1C4B3A",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.85)", background: "none", border: "none",
            cursor: "pointer", padding: "8px 0",
          }}
        >
          ← Home
        </button>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800,
          color: "#fff", margin: 0, letterSpacing: "-0.01em",
        }}>
          🔖 Saved
        </p>
        <div style={{ width: 60 }} />
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>🗒️</p>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
              color: "#1A1A1A", margin: "0 0 8px",
            }}>
              Nothing saved yet
            </p>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 14, color: "#999",
              margin: "0 0 24px", lineHeight: 1.6,
            }}>
              Tap the 🗒️ button on any activity card<br />to save it here for later.
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "#1C4B3A", color: "#fff", border: "none",
                borderRadius: 12, padding: "12px 28px",
                fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Browse activities →
            </button>
          </div>
        ) : (
          <>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13, color: "#999",
              margin: "0 0 18px",
            }}>
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {items.map(item => (
                <SavedCard
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
