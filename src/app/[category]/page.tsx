"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activities, Activity, ActivityType } from "@/lib/activities";
import { SLUG_TO_TYPE, CATEGORY_META, TYPE_TO_SLUG, ALL_TYPES } from "@/lib/categories";
import { getSettings, logActivity } from "@/lib/store";
import ActivityDisplay from "@/components/ActivityDisplay";
import CategoryNav from "@/components/CategoryNav";
import TicTacToe from "@/components/TicTacToe";

// Activity IDs that are Banff-specific (vs generic road trip)
const BANFF_IDS = new Set([
  "conv-3","conv-4","conv-6","conv-7","conv-10",
  "fact-1","fact-2","fact-3","fact-4","fact-5","fact-6","fact-7","fact-8","fact-9","fact-10",
  "tf-1","tf-2","tf-3","tf-4","tf-5","tf-6","tf-7","tf-8","tf-9","tf-10",
  "quiz-1","quiz-2","quiz-3","quiz-4","quiz-5","quiz-6","quiz-7","quiz-8","quiz-9","quiz-10",
  "game-1","game-2","game-3","game-6","game-7",
  "rid-1","rid-2","rid-3","rid-4","rid-5","rid-6","rid-7","rid-8","rid-9","rid-10",
  "bonus-1","bonus-2","bonus-3","bonus-4","bonus-5","bonus-6","bonus-7",
]);

function pickRandom(pool: Activity[], exclude: string[]): Activity | null {
  const available = pool.filter(a => !exclude.includes(a.id));
  if (available.length === 0) return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  return available[Math.floor(Math.random() * available.length)];
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const router       = useRouter();
  const searchParams = useSearchParams();
  const type         = SLUG_TO_TYPE[category] as ActivityType | undefined;

  const [current,   setCurrent]   = useState<Activity | null>(null);
  const [seenIds,   setSeenIds]   = useState<string[]>([]);
  const [cardKey,   setCardKey]   = useState(0);
  const [navOpen,   setNavOpen]   = useState(false);
  const [hydrated,  setHydrated]  = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [banffMode, setBanffMode] = useState(false);

  // Build filtered pool
  const getPool = (bMode: boolean) => {
    if (!type) return [];
    const all = activities.filter(a => a.type === type);
    if (!bMode) return all;
    const banff = all.filter(a => BANFF_IDS.has(a.id));
    return banff.length >= 2 ? banff : all; // fallback if too few
  };

  useEffect(() => {
    if (!type) { router.replace("/"); return; }
    const s = getSettings();
    const bMode = s.banffMode || searchParams.get("banff") === "1";
    setSoundEnabled(s.soundEnabled);
    setBanffMode(bMode);
    const pool = getPool(bMode);
    setCurrent(pickRandom(pool, []));
    setSeenIds([]);
    setCardKey(0);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, router]);

  const handleNext = () => {
    if (!current || !type) return;
    // Log the completed activity
    logActivity({ id: current.id, type, title: current.title, emoji: current.emoji });
    const newSeen = [...seenIds, current.id];
    setSeenIds(newSeen);
    const pool = getPool(banffMode);
    setCurrent(pickRandom(pool, newSeen));
    setCardKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!type || !hydrated) return <div style={{ minHeight: "100vh", background: "#F6F3EE" }} />;

  const meta     = CATEGORY_META[type];
  const allIdx   = ALL_TYPES.indexOf(type);
  const prevType = ALL_TYPES[(allIdx - 1 + ALL_TYPES.length) % ALL_TYPES.length];
  const nextType = ALL_TYPES[(allIdx + 1) % ALL_TYPES.length];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F3EE", paddingBottom: 80 }}>

      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: meta.color,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56, flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            fontFamily: "var(--font-sans, sans-serif)", fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.85)", background: "none", border: "none",
            cursor: "pointer", padding: "8px 0",
            display: "flex", alignItems: "center", gap: 4, minWidth: 60,
          }}
        >
          ← Home
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {banffMode && (
            <span style={{
              fontFamily: "var(--font-sans,sans-serif)", fontSize: 10, fontWeight: 700,
              color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.2)",
              padding: "3px 8px", borderRadius: 20, letterSpacing: "0.06em",
            }}>
              🏔 BANFF
            </span>
          )}
          <p style={{
            fontFamily: "var(--font-display, var(--font-sans, sans-serif))",
            fontSize: 16, fontWeight: 800, color: "#fff", margin: 0,
            letterSpacing: "-0.01em", textShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}>
            {meta.label}
          </p>
        </div>

        <button
          onClick={() => setNavOpen(true)}
          style={{
            fontFamily: "var(--font-sans, sans-serif)", fontSize: 13, fontWeight: 600,
            color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.18)",
            border: "none", borderRadius: 8, cursor: "pointer",
            padding: "6px 12px", minWidth: 60, textAlign: "right",
          }}
        >
          Switch ↗
        </button>
      </header>

      {/* ── Activity card ──────────────────────────────────────────────── */}
      <main style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "28px 16px 24px", boxSizing: "border-box" }}>
        {type === "game" ? (
          <TicTacToe />
        ) : current ? (
          <ActivityDisplay
            key={`${current.id}-${cardKey}`}
            activity={current}
            onNext={handleNext}
            accentColor={meta.color}
            soundEnabled={soundEnabled}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#aaa", paddingTop: 80, fontFamily: "var(--font-sans, sans-serif)" }}>
            No activities found.
          </p>
        )}
      </main>

      {/* ── Fixed bottom nav ───────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", alignItems: "stretch",
        borderTop: "1px solid #E8E8E8", backgroundColor: "#fff",
        zIndex: 20, height: 56,
      }}>
        <button
          onClick={() => router.push(`/${TYPE_TO_SLUG[prevType]}${banffMode ? "?banff=1" : ""}`)}
          style={{
            flex: 1, padding: "0 16px",
            fontFamily: "var(--font-sans, sans-serif)", fontSize: 13, fontWeight: 600,
            color: CATEGORY_META[prevType].color, background: "none", border: "none",
            borderRight: "1px solid #E8E8E8", cursor: "pointer", textAlign: "left",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          ← {CATEGORY_META[prevType].label}
        </button>
        <button
          onClick={() => setNavOpen(true)}
          style={{
            width: 56, flexShrink: 0, fontSize: 20, color: "#bbb",
            background: "none", border: "none", borderRight: "1px solid #E8E8E8", cursor: "pointer",
          }}
        >
          ⋯
        </button>
        <button
          onClick={() => router.push(`/${TYPE_TO_SLUG[nextType]}${banffMode ? "?banff=1" : ""}`)}
          style={{
            flex: 1, padding: "0 16px",
            fontFamily: "var(--font-sans, sans-serif)", fontSize: 13, fontWeight: 600,
            color: CATEGORY_META[nextType].color, background: "none", border: "none",
            cursor: "pointer", textAlign: "right",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {CATEGORY_META[nextType].label} →
        </button>
      </nav>

      {navOpen && <CategoryNav currentType={type} onClose={() => setNavOpen(false)} />}
    </div>
  );
}
