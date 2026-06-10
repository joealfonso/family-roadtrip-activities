"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ActivityType } from "@/lib/activities";
import { ALL_TYPES, CATEGORY_META, TYPE_TO_SLUG } from "@/lib/categories";
import { getSettings, getArrivalTime, AppSettings } from "@/lib/store";
import CountdownBanner from "@/components/CountdownBanner";
import SettingsPanel   from "@/components/SettingsPanel";
import TripLogPanel    from "@/components/TripLogPanel";

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
        <span style={{
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
        <p style={{
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
        <p style={{
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

// ── Activity card ─────────────────────────────────────────────────────────────
function ActivityCard({
  type, selected, onSelect,
}: {
  type: ActivityType;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = CATEGORY_META[type];
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        background: selected ? meta.color : "#fff",
        border: `2.5px solid ${selected ? meta.color : "rgba(0,0,0,0.07)"}`,
        borderRadius: 18,
        padding: "20px 16px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        textAlign: "left", cursor: "pointer", width: "100%",
        transition: "transform 140ms ease, box-shadow 140ms ease, background 160ms ease, border-color 160ms ease",
        boxShadow: selected
          ? `0 6px 20px ${meta.color}44, 0 2px 6px ${meta.color}22`
          : "0 2px 8px rgba(0,0,0,0.06)",
        transform: selected ? "scale(1.03)" : "scale(1)",
        minHeight: 140,
      }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>{meta.emoji}</span>
      <div>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: 15, fontWeight: 700,
          color: selected ? "#fff" : "#1A1A1A",
          margin: 0, lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          {meta.label}
        </p>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12, fontWeight: 500,
          color: selected ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.42)",
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
  const [greeting,      setGreeting]      = useState<typeof GREETINGS[number] | null>(null);
  const [settings,      setSettings]      = useState<AppSettings>({ soundEnabled: true, banffMode: false, gpsMode: false });
  const [arrivalISO,    setArrivalISO]    = useState<string | null>(null);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showLog,       setShowLog]       = useState(false);
  const [selectedType,  setSelectedType]  = useState<ActivityType | null>(null);

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    setSettings(getSettings());
    setArrivalISO(getArrivalTime());
  }, []);

  const handleSettingsUpdate = (s: AppSettings) => {
    setSettings(s);
    setArrivalISO(getArrivalTime());
  };

  const handleSelect = (type: ActivityType) => {
    setSelectedType(prev => prev === type ? null : type);
  };

  const handleGo = () => {
    if (!selectedType) return;
    router.push(`/${TYPE_TO_SLUG[selectedType]}${settings.banffMode ? "?banff=1" : ""}`);
  };

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

      {/* ── Countdown ────────────────────────────────────────────────── */}
      <CountdownBanner
        arrivalISO={arrivalISO}
        soundEnabled={settings.soundEnabled}
        gpsMode={settings.gpsMode}
      />

      {/* ── Word of the Day ──────────────────────────────────────────── */}
      {greeting && <WordCard greeting={greeting} />}
      {!greeting && <div style={{ height: 24 }} />}

      {/* ── Section label ────────────────────────────────────────────── */}
      <div style={{ padding: "4px 24px 16px" }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.35)", margin: 0,
        }}>
          Pick an activity
        </p>
      </div>

      {/* ── Activity grid ────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        padding: "0 20px",
        maxWidth: 640, margin: "0 auto",
      }}>
        {ALL_TYPES.map(type => (
          <ActivityCard
            key={type}
            type={type}
            selected={selectedType === type}
            onSelect={() => handleSelect(type)}
          />
        ))}
      </div>

      {/* ── Let's go CTA ─────────────────────────────────────────────── */}
      {selectedType && (
        <div
          className="animate-slide-up"
          style={{
            position: "sticky",
            bottom: 0,
            padding: "16px 20px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            background: `linear-gradient(to top, ${PARCHMENT} 70%, transparent)`,
            marginTop: 20,
          }}
        >
          <button
            onClick={handleGo}
            style={{
              width: "100%",
              background: CATEGORY_META[selectedType].color,
              color: "#fff",
              border: "none",
              borderRadius: 18,
              padding: "18px 24px",
              fontFamily: "var(--font-display)",
              fontWeight: 900, fontSize: 18,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              boxShadow: `0 6px 0 rgba(0,0,0,0.18), 0 8px 24px ${CATEGORY_META[selectedType].color}44`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 100ms ease, box-shadow 100ms ease",
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "translateY(3px)", e.currentTarget.style.boxShadow = `0 3px 0 rgba(0,0,0,0.18)`)}
            onMouseUp={e => (e.currentTarget.style.transform = "", e.currentTarget.style.boxShadow = "")}
            onTouchStart={e => (e.currentTarget.style.transform = "translateY(3px)", e.currentTarget.style.boxShadow = `0 3px 0 rgba(0,0,0,0.18)`)}
            onTouchEnd={e => (e.currentTarget.style.transform = "", e.currentTarget.style.boxShadow = "")}
          >
            Let's go! <span style={{ fontSize: 20 }}>→</span>
          </button>
        </div>
      )}

      {/* Bottom breathing room when no CTA */}
      {!selectedType && <div style={{ height: 48 }} />}

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
