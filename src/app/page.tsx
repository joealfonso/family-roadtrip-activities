"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ActivityType } from "@/lib/activities";
import { ALL_TYPES, CATEGORY_META, TYPE_TO_SLUG } from "@/lib/categories";
import { getSettings, AppSettings } from "@/lib/store";
import { WAYPOINTS, Waypoint } from "@/lib/waypoints";
import SettingsPanel from "@/components/SettingsPanel";
import TripLogPanel  from "@/components/TripLogPanel";

// ── Trip day logic ────────────────────────────────────────────────────────────
const TRIP_START_MS = new Date("2026-06-10T00:00:00").getTime();
const TRIP_DAYS     = 11;

function getTripDay(): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - TRIP_START_MS) / 86_400_000) + 1;
}

// ── Day banner ────────────────────────────────────────────────────────────────
function DayBanner({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [day, setDay] = useState<number | null>(null);

  useEffect(() => { setDay(getTripDay()); }, []);
  if (day === null) return null; // avoid hydration mismatch

  // Before trip
  if (day < 1) {
    const daysUntil = 1 - day;
    return (
      <div style={{
        background: "#F0F7FF", borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🚗</span>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: PINE, margin: 0, letterSpacing: "-0.01em" }}>
            Trip starts in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#888", margin: 0 }}>
            Jun 10 · Seattle → Revelstoke
          </p>
        </div>
      </div>
    );
  }

  // After trip
  if (day > TRIP_DAYS) {
    return (
      <div style={{
        background: "#F0FFF5", borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "#1A6B49", margin: 0 }}>
          Trip complete! What a journey 🎉
        </p>
      </div>
    );
  }

  // During trip — find waypoints for today
  const todayWps = WAYPOINTS.filter(w => w.day === day);
  const primary: Waypoint | undefined = todayWps[0];
  if (!primary) return null;

  return (
    <button
      onClick={() => onNavigate(primary.id)}
      style={{
        width: "100%", textAlign: "left",
        background: `linear-gradient(105deg, ${primary.color}22 0%, ${primary.color}08 100%)`,
        borderBottom: `1px solid ${primary.color}30`,
        borderTop: "none", borderLeft: "none", borderRight: "none",
        padding: "12px 20px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Day pill */}
      <div style={{
        flexShrink: 0,
        background: primary.color, color: "#fff",
        borderRadius: 10, padding: "4px 10px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>DAY</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{day}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 16 }}>{primary.emoji}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: primary.color, letterSpacing: "-0.01em" }}>
            {primary.name}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#888", margin: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {primary.tagline}
          {todayWps.length > 1 && (
            <span style={{ color: primary.color, fontWeight: 600 }}>
              {" "}+{todayWps.length - 1} more stop{todayWps.length > 2 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      <span style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: primary.color, opacity: 0.5, flexShrink: 0 }}>›</span>
    </button>
  );
}

// ── Palette ──────────────────────────────────────────────────────────────────
const PINE      = "#1C4B3A";
const PINE_DARK = "#132E23";
const GLACIER   = "#4A8FA8";
const PARCHMENT = "#F6F1EA";

// ── Greetings ─────────────────────────────────────────────────────────────────
const GREETINGS = [
  { word: "Hello",        lang: "English",     phonetic: "heh-LOH"              },
  { word: "Bonjour",      lang: "French",      phonetic: "bon-ZHOOR"            },
  { word: "Hola",         lang: "Spanish",     phonetic: "OH-lah"               },
  { word: "Ciao",         lang: "Italian",     phonetic: "CHOW"                 },
  { word: "Hei",          lang: "Norwegian",   phonetic: "hay"                  },
  { word: "Merhaba",      lang: "Turkish",     phonetic: "mehr-HAH-bah"         },
  { word: "Olá",          lang: "Portuguese",  phonetic: "oh-LAH"               },
  { word: "Namaste",      lang: "Hindi",       phonetic: "nah-mah-STAY"         },
  { word: "Salut",        lang: "Romanian",    phonetic: "sah-LOOT"             },
  { word: "Hallo",        lang: "German",      phonetic: "HAH-loh"              },
  { word: "Ahoj",         lang: "Czech",       phonetic: "ah-HOY"               },
  { word: "Sawubona",     lang: "Zulu",        phonetic: "sah-woo-BOH-nah"      },
  { word: "Nǐ hǎo",       lang: "Mandarin",    phonetic: "nee HOW"              },
  { word: "Halló",        lang: "Icelandic",   phonetic: "HAH-loh"              },
  { word: "Konnichiwa",   lang: "Japanese",    phonetic: "kon-ee-CHEE-wah"      },
  { word: "Annyeong",     lang: "Korean",      phonetic: "ahn-NYUNG"            },
  { word: "Привет",       lang: "Russian",     phonetic: "pree-VYET"            },
  { word: "Marhaba",      lang: "Arabic",      phonetic: "mar-HAH-bah"          },
  { word: "Shalom",       lang: "Hebrew",      phonetic: "shah-LOME"            },
  { word: "Yassas",       lang: "Greek",       phonetic: "YAH-sahs"             },
  { word: "Hej",          lang: "Swedish",     phonetic: "hay"                  },
  { word: "Hei",          lang: "Finnish",     phonetic: "hay"                  },
  { word: "Dag",          lang: "Dutch",       phonetic: "dahk"                 },
  { word: "Zdravo",       lang: "Croatian",    phonetic: "ZDRAH-voh"            },
  { word: "Cześć",        lang: "Polish",      phonetic: "cheshch"              },
  { word: "Szia",         lang: "Hungarian",   phonetic: "see-YAH"              },
  { word: "Tere",         lang: "Estonian",    phonetic: "TEH-reh"              },
  { word: "Labas",        lang: "Lithuanian",  phonetic: "LAH-bahs"             },
  { word: "Kumusta",      lang: "Filipino",    phonetic: "koo-MOO-stah"         },
  { word: "Sawasdee",     lang: "Thai",        phonetic: "sah-WAHT-dee"         },
  { word: "Xin chào",     lang: "Vietnamese",  phonetic: "sin CHOW"             },
  { word: "Halo",         lang: "Indonesian",  phonetic: "HAH-loh"              },
  { word: "Jambo",        lang: "Swahili",     phonetic: "JAHM-boh"             },
  { word: "Mbote",        lang: "Lingala",     phonetic: "mm-BOH-teh"           },
  { word: "Sannu",        lang: "Hausa",       phonetic: "SAH-noo"              },
  { word: "Salam",        lang: "Persian",     phonetic: "sah-LAHM"             },
  { word: "Barev",        lang: "Armenian",    phonetic: "bah-REV"              },
  { word: "Gamarjoba",    lang: "Georgian",    phonetic: "gah-mar-JOH-bah"      },
  { word: "Sain baina uu",lang: "Mongolian",   phonetic: "sain BAI-nah oo"      },
  { word: "Aloha",        lang: "Hawaiian",    phonetic: "ah-LOH-hah"           },
  { word: "Osiyo",        lang: "Cherokee",    phonetic: "oh-SEE-yoh"           },
  { word: "Oki",          lang: "Blackfoot",   phonetic: "OH-kee"               },
  { word: "Adler",        lang: "🦅",          phonetic: "ADD-ler"              },
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

// ── Compact word-of-the-day strip ─────────────────────────────────────────────
function WordStrip({ greeting, onCycle }: { greeting: typeof GREETINGS[number]; onCycle: () => void }) {
  return (
    <div style={{
      background: `linear-gradient(105deg, ${PINE} 0%, ${GLACIER} 100%)`,
      padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {/* Word + phonetic */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "0 0 2px" }}>
          Word of the road
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span suppressHydrationWarning style={{
            fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900,
            color: "#fff", letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            {greeting.word}
          </span>
          <span suppressHydrationWarning style={{
            fontFamily: "var(--font-sans)", fontSize: 12, fontStyle: "italic",
            color: "rgba(255,255,255,0.5)",
          }}>
            / {greeting.phonetic} /
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => sayWord(greeting.word, greeting.lang)}
          aria-label={`Pronounce ${greeting.word}`}
          style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 20, color: "rgba(255,255,255,0.9)",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            padding: "6px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          🔊
        </button>
        <button
          onClick={onCycle}
          suppressHydrationWarning
          aria-label="Next language"
          style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 20, color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
            padding: "6px 10px", cursor: "pointer",
          }}
        >
          {greeting.lang} ↻
        </button>
      </div>
    </div>
  );
}

// ── Flat icons ────────────────────────────────────────────────────────────────
const FLAT_ICONS: Record<ActivityType, (color: string) => React.ReactNode> = {
  conversation: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <path d="M4 6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-5 4v-4H6a2 2 0 0 1-2-2V6Z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 22v2a2 2 0 0 0 2 2h12l5 4v-4h1a2 2 0 0 0 2-2v-8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  fact: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <path d="M18 4C12.477 4 8 8.477 8 14c0 3.72 1.98 6.98 4.95 8.78V26h10v-3.22A10 10 0 0 0 28 14c0-5.523-4.477-10-10-10Z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M13 26h10M14 30h8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 14h.01M18 11v6M21 14h.01" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  trueFalse: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <polyline points="5,19 11,26 21,10" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="25" y1="10" x2="33" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="33" y1="10" x2="25" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  quiz: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <path d="M13 13a5 5 0 0 1 9.9 1c0 3-4.9 4-4.9 7" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="18" cy="27" r="1.5" fill={c}/>
    </svg>
  ),
  game: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
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
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <circle cx="16" cy="16" r="9" stroke={c} strokeWidth="2"/>
      <line x1="22.5" y1="22.5" x2="31" y2="31" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  rhyme: (c) => (
    <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
      <circle cx="10" cy="22" r="4" stroke={c} strokeWidth="2"/>
      <circle cx="24" cy="26" r="4" stroke={c} strokeWidth="2"/>
      <path d="M14 22V10h10v14" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ── Activity card ─────────────────────────────────────────────────────────────
function ActivityCard({ type, onSelect }: { type: ActivityType; onSelect: () => void }) {
  const meta = CATEGORY_META[type];
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="activity-card"
      style={{
        background: hovered ? `${meta.color}12` : "none",
        border: "none",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: 16,
        textAlign: "left", cursor: "pointer", width: "100%",
        WebkitTapHighlightColor: "transparent",
        transition: "background 140ms ease",
      }}
    >
      {FLAT_ICONS[type](meta.color)}
      <div>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: 18, fontWeight: 700,
          color: "#1A1A1A",
          margin: 0, lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          {meta.label}
        </p>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14, fontWeight: 500,
          color: "rgba(0,0,0,0.42)",
          margin: "5px 0 0", lineHeight: 1.4,
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
  const [greetingIdx,   setGreetingIdx]   = useState(0);
  const [settings,      setSettings]      = useState<AppSettings>({ soundEnabled: true, banffMode: false, gpsMode: false });
  const [showSettings,  setShowSettings]  = useState(false);
  const [showLog,       setShowLog]       = useState(false);

  useEffect(() => {
    setGreetingIdx(Math.floor(Math.random() * GREETINGS.length));
    setSettings(getSettings());
  }, []);

  const greeting = GREETINGS[greetingIdx];
  const cycleGreeting = () => setGreetingIdx((i) => (i + 1) % GREETINGS.length);

  const handleSettingsUpdate = (s: AppSettings) => setSettings(s);

return (
    <div style={{ minHeight: "100vh", backgroundColor: PARCHMENT, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: PARCHMENT,
        padding: "0 24px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} suppressHydrationWarning>
          <span style={{ fontSize: 22 }}>🏔</span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 18, fontWeight: 700,
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
          <button onClick={() => router.push("/saved")} aria-label="Saved activities"
            className="icon-btn" style={iconBtnStyle}>🔖</button>
          <button onClick={() => setShowLog(true)} aria-label="Trip log"
            className="icon-btn" style={iconBtnStyle}>📓</button>
          <button onClick={() => setShowSettings(true)} aria-label="Settings"
            className="icon-btn" style={iconBtnStyle}>⚙️</button>
        </div>
      </header>

      {/* ── Word of the road ─────────────────────────────────────────── */}
      <WordStrip greeting={greeting} onCycle={cycleGreeting} />

      {/* ── Today banner ─────────────────────────────────────────────── */}
      <DayBanner onNavigate={(id) => router.push(`/waypoint/${id}`)} />

      {/* ── Route Strip ──────────────────────────────────────────────── */}
      <div style={{ padding: "20px 0 4px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
            color: "#1A1A1A", margin: 0, letterSpacing: "-0.01em",
          }}>Your Route</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#aaa", margin: 0 }}>
            Jun 10–20 · 11 days
          </p>
        </div>

        {/* Horizontal scroll row */}
        <div style={{
          display: "flex", gap: 10, overflowX: "auto",
          padding: "0 20px 16px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {/* Near Me card — always first */}
          <button
            onClick={() => router.push("/nearby")}
            style={{
              flexShrink: 0,
              background: "linear-gradient(135deg, #1C4B3A 0%, #4A8FA8 100%)",
              border: "none",
              borderRadius: 14,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
              width: 120,
              boxShadow: "0 2px 8px rgba(28,75,58,0.25)",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(28,75,58,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(28,75,58,0.25)";
            }}
          >
            <p style={{ fontSize: 22, margin: "0 0 6px", lineHeight: 1 }}>📍</p>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
              color: "#fff", margin: "0 0 4px", lineHeight: 1.2,
            }}>
              Near Me
            </p>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
              color: "rgba(255,255,255,0.65)", margin: 0,
            }}>
              Use location
            </p>
          </button>

          {WAYPOINTS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => router.push(`/waypoint/${wp.id}`)}
              style={{
                flexShrink: 0,
                background: "#fff",
                border: "1.5px solid rgba(0,0,0,0.07)",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                width: 120,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
              }}
            >
              <p style={{ fontSize: 22, margin: "0 0 6px", lineHeight: 1 }}>{wp.emoji}</p>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
                color: "#1A1A1A", margin: "0 0 4px", lineHeight: 1.2,
              }}>
                {wp.shortName}
              </p>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
                color: wp.color, margin: 0,
                letterSpacing: "0.03em",
              }}>
                Day {wp.day}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity grid ────────────────────────────────────────────── */}
      <div className="activity-grid" style={{
        display: "grid",
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
  width: 42, height: 42, borderRadius: 12,
  border: "none", background: "rgba(0,0,0,0.06)",
  cursor: "pointer", fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center",
};
