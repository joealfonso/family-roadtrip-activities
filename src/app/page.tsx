"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

const GREETINGS = [
  { word: "Hello",       lang: "English",    phonetic: "heh-LOH"           },
  { word: "Bonjour",     lang: "French",     phonetic: "bon-ZHOOR"         },
  { word: "Hola",        lang: "Spanish",    phonetic: "OH-lah"            },
  { word: "Ciao",        lang: "Italian",    phonetic: "CHOW"              },
  { word: "Hei",         lang: "Norwegian",  phonetic: "hay"               },
  { word: "Merhaba",     lang: "Turkish",    phonetic: "mehr-HAH-bah"      },
  { word: "Olá",         lang: "Portuguese", phonetic: "oh-LAH"            },
  { word: "こんにちは",    lang: "Japanese",   phonetic: "kon-nee-chee-WAH"  },
  { word: "안녕하세요",    lang: "Korean",     phonetic: "an-nyong-ha-SEY-o" },
  { word: "Namaste",     lang: "Hindi",      phonetic: "nah-mah-STAY"      },
  { word: "Salut",       lang: "Romanian",   phonetic: "sah-LOOT"          },
  { word: "Hallo",       lang: "German",     phonetic: "HAH-loh"           },
  { word: "Привет",      lang: "Russian",    phonetic: "pree-VYET"         },
  { word: "Γεια σου",    lang: "Greek",      phonetic: "YAH-soo"           },
  { word: "Ahoj",        lang: "Czech",      phonetic: "ah-HOY"            },
  { word: "Sawubona",    lang: "Zulu",       phonetic: "sah-woo-BOH-nah"   },
  { word: "Marhaba",     lang: "Arabic",     phonetic: "mar-HAH-bah"       },
  { word: "Nǐ hǎo",      lang: "Mandarin",   phonetic: "nee HOW"           },
  { word: "Salam",       lang: "Persian",    phonetic: "sah-LAHM"          },
  { word: "Halló",       lang: "Icelandic",  phonetic: "HAH-loh"           },
];

// DiceBear pixel-art avatars via API — seeds chosen for visual variety
const AVATARS = [
  { seed: "Banff",      bottom: 18, right: 60,  size: 108, rotate: 4  },
  { seed: "Explorer",   bottom: 18, right: 168, size: 96,  rotate: -3 },
  { seed: "Rocky",      bottom: 18, right: 262, size: 114, rotate: 2  },
  { seed: "Adventure",  bottom: 18, right: 374, size: 90,  rotate: -5 },
];

function HeroBackground() {
  return (
    <svg
      viewBox="0 0 1400 320"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky gradient layer */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8D8F0" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#C8ECF8" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <rect width="1400" height="320" fill="url(#sky)"/>

      {/* Sun */}
      <circle cx="1280" cy="58" r="42" fill="#FFE066" fillOpacity="0.55"/>
      <circle cx="1280" cy="58" r="54" fill="#FFE066" fillOpacity="0.2"/>

      {/* Far mountains */}
      <polygon points="0,320 180,100 360,320"    fill="#7BA8C4" fillOpacity="0.28"/>
      <polygon points="220,320 440,60 660,320"   fill="#6E9DB8" fillOpacity="0.24"/>
      <polygon points="500,320 730,80 960,320"   fill="#7BA8C4" fillOpacity="0.22"/>
      <polygon points="800,320 1050,55 1240,320" fill="#6294AC" fillOpacity="0.26"/>
      <polygon points="1100,320 1320,90 1400,320" fill="#7BA8C4" fillOpacity="0.2"/>

      {/* Snow caps */}
      <polygon points="180,100 200,68 220,100"   fill="white" fillOpacity="0.65"/>
      <polygon points="440,60  462,26  484,60"   fill="white" fillOpacity="0.6"/>
      <polygon points="730,80  752,44  774,80"   fill="white" fillOpacity="0.58"/>
      <polygon points="1050,55 1072,18 1094,55"  fill="white" fillOpacity="0.62"/>

      {/* Cloud 1 — large, left */}
      <ellipse cx="140" cy="95"  rx="85" ry="34" fill="white" fillOpacity="0.88"/>
      <ellipse cx="175" cy="74"  rx="52" ry="44" fill="white" fillOpacity="0.88"/>
      <ellipse cx="105" cy="88"  rx="46" ry="30" fill="white" fillOpacity="0.88"/>

      {/* Cloud 2 — mid */}
      <ellipse cx="620" cy="72"  rx="68" ry="28" fill="white" fillOpacity="0.75"/>
      <ellipse cx="652" cy="54"  rx="44" ry="36" fill="white" fillOpacity="0.75"/>
      <ellipse cx="588" cy="66"  rx="38" ry="24" fill="white" fillOpacity="0.75"/>

      {/* Cloud 3 — small, upper right */}
      <ellipse cx="1060" cy="50" rx="52" ry="22" fill="white" fillOpacity="0.65"/>
      <ellipse cx="1082" cy="36" rx="34" ry="28" fill="white" fillOpacity="0.65"/>
      <ellipse cx="1038" cy="45" rx="30" ry="18" fill="white" fillOpacity="0.65"/>

      {/* Foreground hills / grass */}
      <ellipse cx="700"  cy="360" rx="820" ry="100" fill="#9ED4A0" fillOpacity="0.45"/>
      <ellipse cx="100"  cy="370" rx="300" ry="80"  fill="#AADA9E" fillOpacity="0.38"/>
      <ellipse cx="1320" cy="365" rx="260" ry="75"  fill="#9ED4A0" fillOpacity="0.38"/>

      {/* Path/road hint at bottom */}
      <ellipse cx="700" cy="330" rx="120" ry="18" fill="#E8D5A0" fillOpacity="0.35"/>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState(GREETINGS[0]);

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#D6EEF8", overflowX: "hidden" }}>

      {/* ── Top header bar ───────────────────────────────────────────────── */}
      <header style={{
        background: "linear-gradient(135deg, #4A90D9 0%, #5B4FCF 100%)",
        padding: "0 24px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 12px rgba(74,100,210,0.35)",
      }}>
        <span style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: "#fff",
          textShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}>
          🏔 Banff Road Trip
        </span>
        <span style={{
          fontFamily: "var(--font-sans, sans-serif)",
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.8)",
          background: "rgba(255,255,255,0.15)",
          padding: "4px 12px",
          borderRadius: 20,
        }}>
          Jun 17–19
        </span>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #B8E0F5 0%, #CBE9F7 60%, #D6EEF8 100%)",
        padding: "32px 32px 48px",
        overflow: "hidden",
        minHeight: 160,
      }}>
        <HeroBackground />

        {/* Text — left side, z above scene, capped so avatars don't overlap */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "55%" }}>
          <h1 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "clamp(52px, 9vw, 120px)",
            fontWeight: 900,
            color: "#1A3A5C",
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            margin: "0 0 8px",
            whiteSpace: "nowrap",
            textShadow: "0 3px 0 rgba(255,255,255,0.55)",
          }}>
            {greeting.word}!
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: 0 }}>
            <span style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: "clamp(12px, 1.4vw, 15px)",
              fontWeight: 700,
              color: "#2E6DA4",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              {greeting.lang}
            </span>
            <span style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "clamp(11px, 1.1vw, 13px)",
              fontWeight: 400,
              color: "#5A90B8",
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}>
              /{greeting.phonetic}/
            </span>
          </div>
        </div>

        {/* DiceBear pixel-art characters — right side, sitting on the grass */}
        <div className="hero-avatars" style={{
          position: "absolute",
          bottom: 0,
          right: 40,
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          zIndex: 3,
        }}>
          {AVATARS.map((a) => (
            <img
              key={a.seed}
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a.seed}&backgroundColor=transparent`}
              alt=""
              aria-hidden="true"
              style={{
                width: a.size,
                height: a.size,
                transform: `rotate(${a.rotate}deg)`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))",
                imageRendering: "pixelated",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      <main className="home-grid" style={{ padding: "28px 20px 40px" }}>
        {ALL_TYPES.map((type) => {
          const meta = CATEGORY_META[type];
          const Illustration = ILLUSTRATIONS[type];

          return (
            <button
              key={type}
              onClick={() => router.push(`/${TYPE_TO_SLUG[type]}`)}
              className="home-card"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="home-tile"
                style={{
                  backgroundColor: meta.color,
                  aspectRatio: "1 / 1",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  overflow: "hidden",
                  padding: "12%",
                  boxSizing: "border-box",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
                  border: "3px solid rgba(0,0,0,0.08)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                }}
              >
                <Illustration />
              </div>

              <div style={{ padding: "10px 4px 0" }}>
                <p style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "clamp(14px, 1.7vw, 18px)",
                  fontWeight: 800,
                  color: "#1A3A5C",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  margin: "0 0 3px",
                }}>
                  {meta.label}
                </p>
                <p style={{
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: "clamp(12px, 1.1vw, 14px)",
                  fontWeight: 500,
                  color: "#4A7FA8",
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {meta.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </main>

      <style>{`
        .home-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 960px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .home-card:hover .home-tile {
          transform: translateY(-3px);
          box-shadow: 0 8px 0 rgba(0,0,0,0.15) !important;
        }

        .home-card:active .home-tile {
          transform: translateY(2px);
          box-shadow: 0 2px 0 rgba(0,0,0,0.18) !important;
        }

        /* Hide avatars on small screens to avoid overlap */
        @media (max-width: 700px) {
          .home-grid {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 20px 16px 40px !important;
          }
          .hero-avatars {
            display: none;
          }
          .home-tile {
            border-radius: 14px !important;
          }
        }

        @media (max-width: 900px) {
          .hero-avatars img {
            width: 72px !important;
            height: 72px !important;
          }
        }
      `}</style>
    </div>
  );
}
