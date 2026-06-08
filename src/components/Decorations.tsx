// Background decorations: mountains + rainbow

export function MountainScene() {
  return (
    <svg
      viewBox="0 0 1200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {/* Rainbow arcs — behind everything */}
      <path d="M 200 320 A 420 420 0 0 1 1040 320" stroke="#FF6B6B" strokeWidth="28" fill="none" strokeOpacity="0.18"/>
      <path d="M 228 320 A 392 392 0 0 1 1012 320" stroke="#FF9F43" strokeWidth="28" fill="none" strokeOpacity="0.18"/>
      <path d="M 256 320 A 364 364 0 0 1 984 320"  stroke="#FECA57" strokeWidth="28" fill="none" strokeOpacity="0.18"/>
      <path d="M 284 320 A 336 336 0 0 1 956 320"  stroke="#48DBAD" strokeWidth="28" fill="none" strokeOpacity="0.18"/>
      <path d="M 312 320 A 308 308 0 0 1 928 320"  stroke="#54A0FF" strokeWidth="28" fill="none" strokeOpacity="0.18"/>
      <path d="M 340 320 A 280 280 0 0 1 900 320"  stroke="#A29BFE" strokeWidth="28" fill="none" strokeOpacity="0.18"/>

      {/* Far background mountains — lightest */}
      <polygon points="0,320 220,80 440,320"     fill="#C8D8E8" fillOpacity="0.5"/>
      <polygon points="200,320 450,50 700,320"   fill="#B8CCE0" fillOpacity="0.45"/>
      <polygon points="500,320 720,90 940,320"   fill="#C4D4E4" fillOpacity="0.4"/>
      <polygon points="750,320 1000,60 1200,320" fill="#BCC8DC" fillOpacity="0.45"/>

      {/* Mid mountains */}
      <polygon points="0,320 140,160 340,320"    fill="#7FA8C0" fillOpacity="0.4"/>
      <polygon points="260,320 460,100 680,320"  fill="#6E9AAE" fillOpacity="0.38"/>
      <polygon points="520,320 750,130 940,320"  fill="#7AA2B8" fillOpacity="0.36"/>
      <polygon points="820,320 1060,110 1200,320" fill="#6A94A8" fillOpacity="0.4"/>

      {/* Foreground mountains — darkest */}
      <polygon points="-20,320 120,200 320,320"    fill="#4A7A94" fillOpacity="0.5"/>
      <polygon points="180,320 380,140 600,320"    fill="#3D6E88" fillOpacity="0.48"/>
      <polygon points="440,320 680,160 860,320"    fill="#4A7A94" fillOpacity="0.45"/>
      <polygon points="720,320 960,175 1100,320"   fill="#3D6E88" fillOpacity="0.5"/>
      <polygon points="1000,320 1140,205 1220,320" fill="#4A7A94" fillOpacity="0.45"/>

      {/* Snow caps */}
      <polygon points="120,200 140,168 162,200"   fill="white" fillOpacity="0.7"/>
      <polygon points="380,140 400,105 422,140"   fill="white" fillOpacity="0.7"/>
      <polygon points="680,160 700,122 722,160"   fill="white" fillOpacity="0.65"/>
      <polygon points="960,175 980,140 1000,175"  fill="white" fillOpacity="0.7"/>
      <polygon points="220,80  240,48  260,80"    fill="white" fillOpacity="0.55"/>
      <polygon points="450,50  472,16  494,50"    fill="white" fillOpacity="0.5"/>
      <polygon points="720,90  742,55  764,90"    fill="white" fillOpacity="0.52"/>
      <polygon points="1000,60 1022,24 1044,60"   fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

export function FloatingDots() {
  // Scattered decorative dots — very subtle
  const dots = [
    { cx: 60,   cy: 40,  r: 6,  op: 0.12 },
    { cx: 180,  cy: 15,  r: 4,  op: 0.1  },
    { cx: 340,  cy: 55,  r: 8,  op: 0.08 },
    { cx: 520,  cy: 20,  r: 5,  op: 0.1  },
    { cx: 700,  cy: 45,  r: 7,  op: 0.09 },
    { cx: 860,  cy: 12,  r: 4,  op: 0.1  },
    { cx: 1020, cy: 50,  r: 6,  op: 0.08 },
    { cx: 1150, cy: 25,  r: 5,  op: 0.1  },
  ];
  return (
    <svg viewBox="0 0 1200 80" style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none" }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#111" fillOpacity={d.op}/>
      ))}
    </svg>
  );
}
