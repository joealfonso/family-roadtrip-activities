"use client";

// Flaticon-inspired flat-vector illustrations — viewBox 0 0 100 100
// Style: bold duotone — primary shape full opacity, back/shadow shape ~55%,
//        inner details via dark overlay (rgba(0,0,0,0.12-0.18))

// ── Talk It Out — two overlapping speech bubbles ──────────────────────────────
export function IllustrationTalk() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Back bubble (offset bottom-right, dimmer) */}
      <path
        d="M26 28 Q26 20 34 20 L88 20 Q96 20 96 28 L96 62 Q96 70 88 70 L64 70 L55 80 L57 70 L34 70 Q26 70 26 62 Z"
        fill="white" fillOpacity="0.52"
      />
      {/* Back bubble text lines */}
      <rect x="34" y="32" width="54" height="5" rx="2.5" fill="rgba(0,0,0,0.10)"/>
      <rect x="34" y="42" width="42" height="5" rx="2.5" fill="rgba(0,0,0,0.10)"/>

      {/* Front bubble */}
      <path
        d="M4 14 Q4 6 12 6 L72 6 Q80 6 80 14 L80 52 Q80 60 72 60 L28 60 L18 72 L20 60 L12 60 Q4 60 4 52 Z"
        fill="white" fillOpacity="0.96"
      />
      {/* Front bubble text lines */}
      <rect x="12" y="18" width="60" height="6" rx="3" fill="rgba(0,0,0,0.12)"/>
      <rect x="12" y="29" width="48" height="6" rx="3" fill="rgba(0,0,0,0.12)"/>
      <rect x="12" y="40" width="34" height="6" rx="3" fill="rgba(0,0,0,0.12)"/>
    </svg>
  );
}

// ── Fun Fact — lightbulb with rays ────────────────────────────────────────────
export function IllustrationFact() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Glow rays */}
      {([
        [50, 3, 50, 11],
        [74, 9, 69, 16],
        [26, 9, 31, 16],
        [88, 28, 81, 32],
        [12, 28, 19, 32],
      ] as [number,number,number,number][]).map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.55"/>
      ))}

      {/* Bulb body */}
      <path
        d="M50 14 C35 14 23 26 23 42 C23 54 30 63 39 68 L39 75 Q39 78 42 78 L58 78 Q61 78 61 75 L61 68 C70 63 77 54 77 42 C77 26 65 14 50 14 Z"
        fill="white" fillOpacity="0.95"
      />
      {/* Inner highlight */}
      <path d="M36 24 C31 31 30 40 32 48"
        stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.35" fill="none"/>
      {/* Filament lines */}
      <line x1="44" y1="46" x2="44" y2="60" stroke="rgba(0,0,0,0.10)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="42" x2="50" y2="60" stroke="rgba(0,0,0,0.10)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="56" y1="46" x2="56" y2="60" stroke="rgba(0,0,0,0.10)" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Base — 3 segments */}
      <rect x="37" y="80" width="26" height="6" rx="3"   fill="white" fillOpacity="0.95"/>
      <rect x="39" y="88" width="22" height="6" rx="3"   fill="white" fillOpacity="0.95"/>
      <rect x="42" y="96" width="16" height="5" rx="2.5" fill="white" fillOpacity="0.95"/>
    </svg>
  );
}

// ── True or False — checkmark + X ─────────────────────────────────────────────
export function IllustrationTrueFalse() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Soft circle backgrounds */}
      <circle cx="27" cy="52" r="22" fill="white" fillOpacity="0.18"/>
      <circle cx="73" cy="52" r="22" fill="white" fillOpacity="0.18"/>

      {/* Subtle centre divider */}
      <line x1="50" y1="14" x2="50" y2="88" stroke="white" strokeWidth="1.5" strokeOpacity="0.20"/>

      {/* Checkmark */}
      <polyline
        points="12,53 24,67 43,31"
        fill="none" stroke="white" strokeWidth="10"
        strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95"
      />

      {/* X */}
      <line x1="59" y1="31" x2="89" y2="71" stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.95"/>
      <line x1="89" y1="31" x2="59" y2="71" stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.95"/>
    </svg>
  );
}

// ── Quiz Time — big bold question mark + sparkles ─────────────────────────────
export function IllustrationQuiz() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow ? (offset, dimmer) */}
      <path
        d="M36 42 C36 30 43 22 52 22 C63 22 70 30 70 40 C70 50 62 54 57 60 C55 63 54 66 54 70"
        fill="none" stroke="white" strokeWidth="13"
        strokeLinecap="round" strokeOpacity="0.30"
        transform="translate(3,3)"
      />
      <circle cx="57" cy="81" r="7" fill="white" fillOpacity="0.30" transform="translate(3,3)"/>

      {/* Main ? */}
      <path
        d="M36 42 C36 30 43 22 52 22 C63 22 70 30 70 40 C70 50 62 54 57 60 C55 63 54 66 54 70"
        fill="none" stroke="white" strokeWidth="12"
        strokeLinecap="round" strokeOpacity="0.95"
      />
      <circle cx="54" cy="82" r="6.5" fill="white" fillOpacity="0.95"/>

      {/* 4-point sparkles */}
      <path d="M17 22 L19 15 L21 22 L28 24 L21 26 L19 33 L17 26 L10 24 Z"
        fill="white" fillOpacity="0.65"/>
      <path d="M80 65 L82 58 L84 65 L91 67 L84 69 L82 76 L80 69 L73 67 Z"
        fill="white" fillOpacity="0.50"/>
      <circle cx="83" cy="20" r="4" fill="white" fillOpacity="0.45"/>
      <circle cx="16" cy="76" r="3" fill="white" fillOpacity="0.38"/>
    </svg>
  );
}

// ── Mini Game — modern game controller ───────────────────────────────────────
export function IllustrationGame() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow body (offset, dimmer) */}
      <path
        d="M22 38 C14 38 10 46 8 56 L6 68 Q4 80 16 78 C22 77 26 70 30 62 L70 62 C74 70 78 77 84 78 Q96 80 94 68 L92 56 C90 46 86 38 78 38 C70 38 66 42 58 44 L42 44 C34 42 30 38 22 38 Z"
        fill="white" fillOpacity="0.30"
        transform="translate(2,3)"
      />

      {/* Main body */}
      <path
        d="M22 38 C14 38 10 46 8 56 L6 68 Q4 80 16 78 C22 77 26 70 30 62 L70 62 C74 70 78 77 84 78 Q96 80 94 68 L92 56 C90 46 86 38 78 38 C70 38 66 42 58 44 L42 44 C34 42 30 38 22 38 Z"
        fill="white" fillOpacity="0.95"
      />

      {/* D-pad — left */}
      <rect x="20" y="46" width="7" height="20" rx="2.5" fill="rgba(0,0,0,0.16)"/>
      <rect x="14" y="52" width="19" height="8" rx="2.5" fill="rgba(0,0,0,0.16)"/>

      {/* Thumbstick circles */}
      <circle cx="36" cy="56" r="5" fill="rgba(0,0,0,0.12)"/>
      <circle cx="64" cy="56" r="5" fill="rgba(0,0,0,0.12)"/>

      {/* Face buttons (ABXY) — right cluster */}
      <circle cx="74" cy="46" r="5" fill="rgba(255,80,80,0.80)"/>
      <circle cx="74" cy="58" r="5" fill="rgba(80,200,80,0.80)"/>
      <circle cx="68" cy="52" r="5" fill="rgba(80,140,255,0.80)"/>
      <circle cx="80" cy="52" r="5" fill="rgba(255,200,40,0.80)"/>

      {/* Select / Start */}
      <rect x="43" y="50" width="7" height="4" rx="2" fill="rgba(0,0,0,0.14)"/>
      <rect x="52" y="50" width="7" height="4" rx="2" fill="rgba(0,0,0,0.14)"/>
    </svg>
  );
}

// ── Riddle — magnifying glass (Flaticon style) ────────────────────────────────
export function IllustrationRiddle() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow (offset) */}
      <circle cx="40" cy="40" r="27" fill="white" fillOpacity="0.28" transform="translate(3,3)"/>
      <line x1="62" y1="62" x2="91" y2="91" stroke="white" strokeWidth="14"
        strokeLinecap="round" strokeOpacity="0.28" transform="translate(3,3)"/>

      {/* Lens ring */}
      <circle cx="40" cy="40" r="27" fill="white" fillOpacity="0.95"/>
      {/* Lens glass tint */}
      <circle cx="40" cy="40" r="19" fill="white" fillOpacity="0.28"/>
      {/* Lens highlight arc */}
      <path d="M26 26 C20 33 18 43 20 52"
        stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.45" fill="none"/>

      {/* Handle */}
      <line x1="62" y1="62" x2="91" y2="91"
        stroke="white" strokeWidth="14" strokeLinecap="round" strokeOpacity="0.95"/>

      {/* Question mark inside lens */}
      <path d="M34 37 C34 31 37 27 42 27 C47 27 50 31 50 35 C50 40 46 42 44 45 C43 47 43 48 43 49"
        fill="none" stroke="rgba(0,0,0,0.22)"
        strokeWidth="3.8" strokeLinecap="round"/>
      <circle cx="43" cy="54" r="2.2" fill="rgba(0,0,0,0.22)"/>
    </svg>
  );
}

export function IllustrationRhyme() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      <rect width="80" height="80" rx="20" fill="#D97706"/>
      {/* Mic body */}
      <rect x="31" y="14" width="18" height="28" rx="9" fill="white" fillOpacity="0.95"/>
      {/* Mic stand */}
      <path d="M40 42 L40 62" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <path d="M28 62 L52 62" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      {/* Sound waves */}
      <path d="M22 32 C18 36 18 44 22 48" stroke="white" strokeWidth="3.5" strokeLinecap="round" fillOpacity="0" fill="none" opacity="0.7"/>
      <path d="M58 32 C62 36 62 44 58 48" stroke="white" strokeWidth="3.5" strokeLinecap="round" fillOpacity="0" fill="none" opacity="0.7"/>
      {/* Mic grill lines */}
      <line x1="31" y1="28" x2="49" y2="28" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.3"/>
      <line x1="31" y1="33" x2="49" y2="33" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.3"/>
    </svg>
  );
}
