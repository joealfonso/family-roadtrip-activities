"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { activities, Activity, ActivityType } from "@/lib/activities";
import { SLUG_TO_TYPE, CATEGORY_META, TYPE_TO_SLUG, ALL_TYPES } from "@/lib/categories";
import ActivityDisplay from "@/components/ActivityDisplay";
import CategoryNav from "@/components/CategoryNav";

function pickRandom(type: ActivityType, exclude: string[]): Activity | null {
  const pool = activities.filter((a) => a.type === type && !exclude.includes(a.id));
  if (pool.length === 0) {
    const full = activities.filter((a) => a.type === type);
    return full.length ? full[Math.floor(Math.random() * full.length)] : null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const router = useRouter();
  const type = SLUG_TO_TYPE[category] as ActivityType | undefined;

  const [current, setCurrent]   = useState<Activity | null>(null);
  const [seenIds, setSeenIds]   = useState<string[]>([]);
  const [cardKey, setCardKey]   = useState(0);
  const [navOpen, setNavOpen]   = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!type) { router.replace("/"); return; }
    setCurrent(pickRandom(type, []));
    setSeenIds([]);
    setCardKey(0);
    setHydrated(true);
  }, [type, router]);

  const handleNext = () => {
    if (!current || !type) return;
    const newSeen = [...seenIds, current.id];
    setSeenIds(newSeen);
    setCurrent(pickRandom(type, newSeen));
    setCardKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!type || !hydrated) {
    return <div style={{ minHeight: "100vh", background: "#fff" }} />;
  }

  const meta     = CATEGORY_META[type];
  const allIdx   = ALL_TYPES.indexOf(type);
  const prevType = ALL_TYPES[(allIdx - 1 + ALL_TYPES.length) % ALL_TYPES.length];
  const nextType = ALL_TYPES[(allIdx + 1) % ALL_TYPES.length];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#D6EEF8", paddingBottom: 80 }}>

      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: meta.color,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        height: 56,
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            background: "none", border: "none",
            cursor: "pointer", padding: "8px 0",
            display: "flex", alignItems: "center", gap: 4,
            minWidth: 60,
          }}
        >
          ← Home
        </button>

        <p style={{
          fontFamily: "var(--font-display, var(--font-sans, sans-serif))",
          fontSize: 16, fontWeight: 800,
          color: "#fff", margin: 0,
          letterSpacing: "-0.01em",
          textShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}>
          {meta.label}
        </p>

        <button
          onClick={() => setNavOpen(true)}
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 13, fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.18)",
            border: "none", borderRadius: 8,
            cursor: "pointer", padding: "6px 12px",
            minWidth: 60, textAlign: "right",
          }}
        >
          Switch ↗
        </button>
      </header>

      {/* ── Activity card — full width on phone, max 680px on desktop ────── */}
      <main style={{
        width: "100%",
        maxWidth: 680,
        margin: "0 auto",
        padding: "28px 16px 24px",
        boxSizing: "border-box",
      }}>
        {current ? (
          <ActivityDisplay
            key={`${current.id}-${cardKey}`}
            activity={current}
            onNext={handleNext}
            accentColor={meta.color}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#aaa", paddingTop: 80, fontFamily: "var(--font-sans, sans-serif)" }}>
            No activities found.
          </p>
        )}
      </main>

      {/* ── Fixed bottom nav bar ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", alignItems: "stretch",
        borderTop: "1px solid #e8e8e8",
        backgroundColor: "#fff",
        zIndex: 20,
        height: 56,
      }}>
        <button
          onClick={() => router.push(`/${TYPE_TO_SLUG[prevType]}`)}
          style={{
            flex: 1, padding: "0 16px",
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 13, fontWeight: 600,
            color: CATEGORY_META[prevType].color,
            background: "none", border: "none",
            borderRight: "1px solid #e8e8e8",
            cursor: "pointer", textAlign: "left",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          ← {CATEGORY_META[prevType].label}
        </button>

        <button
          onClick={() => setNavOpen(true)}
          style={{
            width: 56, flexShrink: 0,
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 20, color: "#bbb",
            background: "none", border: "none",
            borderRight: "1px solid #e8e8e8",
            cursor: "pointer",
          }}
        >
          ⋯
        </button>

        <button
          onClick={() => router.push(`/${TYPE_TO_SLUG[nextType]}`)}
          style={{
            flex: 1, padding: "0 16px",
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 13, fontWeight: 600,
            color: CATEGORY_META[nextType].color,
            background: "none", border: "none",
            cursor: "pointer", textAlign: "right",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {CATEGORY_META[nextType].label} →
        </button>
      </nav>

      {/* ── Full-screen category nav ─────────────────────────────────────── */}
      {navOpen && (
        <CategoryNav currentType={type} onClose={() => setNavOpen(false)} />
      )}
    </div>
  );
}
