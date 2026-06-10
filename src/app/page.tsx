"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ActivityType } from "@/lib/activities";
import { ALL_TYPES, CATEGORY_META, TYPE_TO_SLUG } from "@/lib/categories";
import { getSettings, AppSettings } from "@/lib/store";
import SettingsPanel from "@/components/SettingsPanel";
import TripLogPanel  from "@/components/TripLogPanel";

// ── Palette ──────────────────────────────────────────────────────────────────
const PINE      = "#1C4B3A";
const PINE_DARK = "#132E23";
const GLACIER   = "#4A8FA8";
const PARCHMENT = "#F6F1EA";

// ── Greetings ─────────────────────────────────────────────────────────────────
const GREETINGS = [
  { word: "Hello",     lang: "English",    phonetic: "heh-LOH"           },
  { word: "Bonjour",   lang: "French",     phonetic: "bon-ZHOOR"         },
  { word: "Hola",      lang: "Spanish",    phonetic: "OH-lah"            },
  { word: "Ciao",      lang: "Italian",    phonetic: "CHOW"              },
  { word: "Hei",       lang: "Norwegian",  phonetic: "hay"               },
  { word: "Merhaba",   lang: "Turkish",    phonetic: "mehr-HAH-bah"      },
  { word: "Olá",       lang: "Portuguese", phonetic: "oh-LAH"            },
  { word: "Namaste",   lang: "Hindi",      phonetic: "nah-mah-STAY"      },
  { word: "Salut",     lang: "Romanian",   phonetic: "sah-LOOT"          },
  { word: "Hallo",     lang: "German",     phonetic: "HAH-loh"           },
  { word: "Ahoj",      lang: "Czech",      phonetic: "ah-HOY"            },
  { word: "Sawubona",  lang: "Zulu",       phonetic: "sah-woo-BOH-nah"   },
  { word: "Nǐ hǎo",    lang: "Mandarin",   phonetic: "nee HOW"           },
  { word: "Halló",     lang: "Icelandic",  phonetic: "HAH-loh"           },
];

function sayWord(word: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = lang === "Mandarin" ? "zh-CN"
           : lang === "Japanese" ? "ja-JP"
           : lang === "Korean"   ? "ko-KR"
           : lang === "Arabic"   ? "ar-SA"
           : lang === "Hindi"    ? "hi-IN"
           : lang === "Zulu"     ? "zu-ZA"
           : "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

// ── Mountain hero card ────────────────────────────────────────────────────────
function WordCard({ greeting }: { greeting: typeof GREETINGS[number] }) {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 0,
      background: `linear-gradient(175deg, ${GLACIER} 0%, ${PINE} 55%, ${PINE_DARK} 100%)`,
      margin: 0,
      padding: "28px 24px 88px",
    }}>
      {/* Top row: language badge + Say it */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <span suppressHydrationWarning style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 20, padding: "4px 12px",
        }}>
          {greeting.lang}
        </span>

        <button
          onClick={() => sayWord(greeting.word, greeting.lang)}
          aria-label={`Pronounce ${greeting.word}`}
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 20,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "var(--font-sans)",
            fontSize: 12, fontWeight: 600,
            padding: "5px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <span>🔊</span> Say it
        </button>
      </div>

      {/* The word */}
      <div style={{ textAlign: "center" }}>
        <p suppressHydrationWarning style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(56px, 14vw, 88px)",
          fontWeight: 900,
          color: "#fff",
          margin: 0, lineHeight: 1,
          letterSpacing: "-0.02em",
          textShadow: "0 2px 20px rgba(0,0,0,0.25)",
        }}>
          {greeting.word}
        </p>
        <p suppressHydrationWarning style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14, fontStyle: "italic",
          color: "rgba(255,255,255,0.58)",
          margin: "10px 0 0", letterSpacing: "0.02em",
        }}>
          / {greeting.phonetic} /
        </p>
      </div>

      {/* Mountain silhouette layers */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90 }} aria-hidden>
        <svg viewBox="0 0 200 45" preserveAspectRatio="none" width="100%" height="100%">
          {/* Distant range — lighter */}
          <path
            d="M0,45 L0,30 L12,20 L22,27 L35,12 L48,23 L58,17 L70,22 L82,10 L95,20 L108,14 L120,22 L132,8 L145,18 L158,13 L170,20 L182,15 L200,22 L200,45 Z"
            fill="rgba(255,255,255,0.10)"
          />
          {/* Mid range */}
          <path
            d="M0,45 L0,36 L18,26 L30,32 L44,20 L56,28 L68,22 L80,29 L95,18 L110,26 L124,20 L138,27 L152,16 L165,24 L178,19 L200,26 L200,45 Z"
            fill="rgba(255,255,255,0.08)"
          />
          {/* Foreground ridge — darkest */}
          <path
            d="M0,45 L0,40 L20,34 L32,38 L46,28 L58,35 L72,30 L85,36 L100,25 L114,33 L128,27 L142,34 L156,29 L170,35 L184,30 L200,36 L200,45 Z"
            fill={PINE_DARK}
            fillOpacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Flat icons ────────────────────────────────────────────────────────────────
const FLAT_ICONS: Record<ActivityType, (color: string) => React.ReactNode> = {
  conversation: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M4 6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-5 4v-4H6a2 2 0 0 1-2-2V6Z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 22v2a2 2 0 0 0 2 2h12l5 4v-4h1a2 2 0 0 0 2-2v-8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  fact: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 4C12.477 4 8 8.477 8 14c0 3.72 1.98 6.98 4.95 8.78V26h10v-3.22A10 10 0 0 0 28 14c0-5.523-4.477-10-10-10Z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M13 26h10M14 30h8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 14h.01M18 11v6M21 14h.01" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  trueFalse: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <polyline points="5,19 11,26 21,10" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="25" y1="10" x2="33" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="33" y1="10" x2="25" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  quiz: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M13 13a5 5 0 0 1 9.9 1c0 3-4.9 4-4.9 7" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="18" cy="27" r="1.5" fill={c}/>
    </svg>
  ),
  game: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="12" width="28" height="16" rx="8" stroke={c} strokeWidth="2"/>
      <line x1="11" y1="17" x2="11" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="20" x2="14" y2="20" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="23" cy="18" r="1.5" fill={c}/>
      <circle cx="27" cy="21" r="1.5" fill={c}/>
      <circle cx="23" cy="24" r="1.5" fill={c}/>
      <circle cx="19" cy="21" r="1.5" fill={c}/>
    </svg>
  ),
  riddle: (c) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="16" cy="16" r="9" stroke={c} strokeWidth="2"/>
      <line x1="22.5" y1="22.5" x2="31" y2="31" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Activity card ─────────────────────────────────────────────────────────────
function ActivityCard({ type, onSelect }: { type: ActivityType; onSelect: () => void }) {
  const meta = CATEGORY_META[type];
  return (
    <button
      onClick={onSelect}
      style={{
        background: "none",
        border: "none",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 10,
        textAlign: "left", cursor: "pointer", width: "100%",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {FLAT_ICONS[type](meta.color)}
      <div>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: 15, fontWeight: 700,
          color: "#1A1A1A",
          margin: 0, lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          {meta.label}
        </p>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12, fontWeight: 500,
          color: "rgba(0,0,0,0.42)",
          margin: "3px 0 0", lineHeight: 1.4,
        }}>
          {meta.tagline}
        </p>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [greeting,      setGreeting]      = useState(GREETINGS[0]);
  const [settings,      setSettings]      = useState<AppSettings>({ soundEnabled: true, banffMode: false, gpsMode: false });
  const [showSettings,  setShowSettings]  = useState(false);
  const [showLog,       setShowLog]       = useState(false);

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    setSettings(getSettings());
  }, []);

  const handleSettingsUpdate = (s: AppSettings) => setSettings(s);

return (
    <div style={{ minHeight: "100vh", backgroundColor: PARCHMENT, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: PARCHMENT,
        padding: "0 20px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} suppressHydrationWarning>
          <span style={{ fontSize: 18 }}>🏔</span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 16, fontWeight: 700,
            color: PINE, letterSpacing: "-0.02em",
          }}>
            Banff Road Trip
          </span>
          {settings.banffMode && (
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700,
              color: "#fff", background: PINE,
              padding: "3px 9px", borderRadius: 20, letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              Banff
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setShowLog(true)} aria-label="Trip log"
            style={iconBtnStyle}>📓</button>
          <button onClick={() => setShowSettings(true)} aria-label="Settings"
            style={iconBtnStyle}>⚙️</button>
        </div>
      </header>

      {/* ── Word of the Day ──────────────────────────────────────────── */}
      <WordCard greeting={greeting} />

      {/* ── Activity grid ────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}>
        {ALL_TYPES.map((type) => (
          <ActivityCard
            key={type}
            type={type}
            onSelect={() => router.push(`/${TYPE_TO_SLUG[type]}`)}
          />
        ))}
      </div>

      <div style={{ height: 32 }} />

      {/* ── Overlays ─────────────────────────────────────────────────── */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
          onOpenLog={() => setShowLog(true)}
        />
      )}
      {showLog && <TripLogPanel onClose={() => setShowLog(false)} />}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10,
  border: "none", background: "rgba(0,0,0,0.06)",
  cursor: "pointer", fontSize: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
};
