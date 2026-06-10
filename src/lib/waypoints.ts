export type NearbyType = "hike" | "viewpoint" | "food" | "activity" | "swim" | "drive";

export interface NearbyItem {
  name: string;
  emoji: string;
  type: NearbyType;
  duration: string;
  description: string;
  tip?: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  date: string;       // "Jun 10"
  day: number;        // 1–11
  color: string;
  tagline: string;
  driveNote?: string; // shown at top of card — drive context
  arrivalNote: string;
  coords: Coords;     // centre of the stop — used for nearest-waypoint lookup
  nearby: NearbyItem[];
}

// ── Geo helpers ────────────────────────────────────────────────────────────────

function toRad(deg: number) { return (deg * Math.PI) / 180; }

/** Haversine distance in km between two lat/lng points */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/** Returns the closest waypoint to the given position */
export function findNearestWaypoint(pos: Coords): { waypoint: Waypoint; distanceKm: number } {
  let nearest = WAYPOINTS[0];
  let minDist = distanceKm(pos, WAYPOINTS[0].coords);
  for (const wp of WAYPOINTS.slice(1)) {
    const d = distanceKm(pos, wp.coords);
    if (d < minDist) { minDist = d; nearest = wp; }
  }
  return { waypoint: nearest, distanceKm: minDist };
}

export const WAYPOINTS: Waypoint[] = [
  // ── Day 1: Jun 10 — Seattle → Revelstoke ──────────────────────────────────
  {
    id: "revelstoke",
    name: "Revelstoke, BC",
    shortName: "Revelstoke",
    emoji: "🏔️",
    date: "Jun 10",
    day: 1,
    color: "#4A7C59",
    tagline: "Mountain town at the end of the big drive",
    driveNote: "8.5–10 hrs from Seattle — biggest drive day of the trip.",
    coords: { lat: 51.0017, lng: -118.1957 },
    arrivalNote: "You made it. Revelstoke sits where the Columbia River meets the mountains — a proper outdoor town that's been quietly cool for decades. Tomorrow's an easier day.",
    nearby: [
      {
        name: "Revelstoke Downtown",
        emoji: "🛍️",
        type: "food",
        duration: "1 hr",
        description: "MacKenzie Ave is the walkable main street. Great restaurants, local breweries, and coffee. You've earned a sit-down meal.",
        tip: "Kawakubo restaurant and the Quartermaster Eatery are both excellent. La Baguette for breakfast next morning.",
      },
      {
        name: "Revelstoke Mountain Resort Gondola",
        emoji: "🚡",
        type: "activity",
        duration: "2–3 hrs",
        description: "Summer gondola to the summit (1,980 m) with sweeping Columbia River valley views. Hiking at the top, or just the views.",
        tip: "Check if open in your visit window — operating days vary by season.",
      },
      {
        name: "Meadows in the Sky Parkway",
        emoji: "🌸",
        type: "drive",
        duration: "1.5–2 hrs",
        description: "A winding road up Mount Revelstoke National Park to subalpine meadows with wildflowers. The last stretch requires a shuttle — cars park at 1,400 m.",
        tip: "Wildflowers peak late July — in June it may still be snowy at the top. Check road status.",
      },
      {
        name: "Columbia River Walk",
        emoji: "🌊",
        type: "activity",
        duration: "30 min",
        description: "Easy flat walk along the Columbia riverfront right from downtown. Good leg-stretcher after a 9-hour drive.",
      },
      {
        name: "Begbie Falls",
        emoji: "💧",
        type: "hike",
        duration: "1.5 hrs return",
        description: "Short hike to a dramatic 40 m waterfall just outside town. Good easy option if legs need a gentle stretch but not a full hike.",
      },
    ],
  },

  // ── Day 2: Jun 11 — Revelstoke → Canmore (en route stops) ────────────────
  {
    id: "glaciernp",
    name: "Glacier National Park",
    shortName: "Glacier NP",
    emoji: "🧊",
    date: "Jun 11",
    day: 2,
    color: "#3D6B8A",
    tagline: "Rogers Pass — the spine of the Selkirks",
    driveNote: "En route from Revelstoke. Rogers Pass is about 1.5 hrs east.",
    coords: { lat: 51.2985, lng: -117.5253 },
    arrivalNote: "This is Canada's Glacier National Park (not the one in Montana). Rogers Pass cuts through the Selkirk Mountains — 400+ glaciers visible from the highway, including some right from the road.",
    nearby: [
      {
        name: "Rogers Pass Summit Stop",
        emoji: "🏔️",
        type: "viewpoint",
        duration: "15–20 min",
        description: "Pull over at the Rogers Pass Discovery Centre at 1,327 m. Free exhibits on the pass's avalanche history and railway engineering. The views alone are worth stopping.",
        tip: "The highway through here required building the most sophisticated avalanche control system in North America — artillery and explosives are still used today.",
      },
      {
        name: "Illecillewaet Campground Trailhead",
        emoji: "🥾",
        type: "hike",
        duration: "30 min–4 hrs",
        description: "Several trails start here — the short Meeting of the Waters (20 min) is a great leg stretch. The Illecillewaet Glacier viewpoint trail is longer (4 hrs) if time allows.",
      },
      {
        name: "Loop Brook Trail",
        emoji: "🌲",
        type: "hike",
        duration: "1 hr",
        description: "Easy loop past old CPR railway loops and mountain views. Historical signs explain how trains navigated the pass before the tunnel was built.",
      },
      {
        name: "Glacier Viewpoints (Highway)",
        emoji: "🧊",
        type: "viewpoint",
        duration: "5 min",
        description: "Several pull-offs along Highway 1 through the pass have direct views of glaciers on the mountainsides. No hiking required.",
      },
    ],
  },
  {
    id: "yoho",
    name: "Yoho National Park",
    shortName: "Yoho NP",
    emoji: "💦",
    date: "Jun 11",
    day: 2,
    color: "#2D6E5A",
    tagline: "Takakkaw Falls and Emerald Lake",
    driveNote: "En route from Glacier NP to Canmore. Field, BC is 2–2.5 hrs past Rogers Pass.",
    coords: { lat: 51.3956, lng: -116.4903 },
    arrivalNote: "'Yoho' is a Cree expression of awe and wonder. Standing in front of Takakkaw Falls — Canada's second-highest waterfall — you'll understand why.",
    nearby: [
      {
        name: "Takakkaw Falls",
        emoji: "💦",
        type: "viewpoint",
        duration: "30–45 min",
        description: "384 m waterfall — one of the tallest in Canada. A short walk from the parking lot brings you right to the base. The spray reaches you before you can see the top.",
        tip: "The road to Takakkaw (Yoho Valley Road) has tight switchbacks — double-check if your vehicle length is under 8 m. Otherwise walk or take the shuttle from Field.",
      },
      {
        name: "Emerald Lake",
        emoji: "💚",
        type: "activity",
        duration: "1–2 hrs",
        description: "A truly emerald-green lake surrounded by forest and peaks. Canoe rentals available. Emerald Lake Lodge has a great deck for lunch.",
        tip: "The 5 km loop trail around the lake is one of the best easy hikes in the Rockies.",
      },
      {
        name: "Natural Bridge",
        emoji: "🌉",
        type: "viewpoint",
        duration: "15 min",
        description: "The Kicking Horse River has carved a natural rock arch. Quick stop just off the highway — dramatic water rushing through the gap.",
      },
      {
        name: "Field, BC — Small Town Stop",
        emoji: "🏘️",
        type: "food",
        duration: "20–30 min",
        description: "Tiny mountain town (population ~150!) right on the Trans-Canada. The Truffle Pigs Bistro is a surprisingly excellent restaurant. Good fuel and snack stop.",
        tip: "Truffle Pigs is reservations-only at dinner but walk-ins often work for lunch.",
      },
    ],
  },
  {
    id: "canmore",
    name: "Canmore, AB",
    shortName: "Canmore",
    emoji: "🏘️",
    date: "Jun 11–15",
    day: 2,
    color: "#5E8A6E",
    tagline: "Your base camp for 5 nights",
    driveNote: "1 hr east of Field / Yoho. Last stop before 5 nights based here.",
    coords: { lat: 51.0891, lng: -115.3544 },
    arrivalNote: "Canmore is your home base. Less touristy than Banff, better grocery stores, real local restaurants — and the Three Sisters mountain backdrop is one of the best in the Rockies.",
    nearby: [
      {
        name: "Main Street (Centennial / 8th St)",
        emoji: "☕",
        type: "food",
        duration: "1 hr",
        description: "The walkable downtown core with excellent food and coffee. Rocky Mountain Bagel Co., Valbella Deli, Communitea Café, and the Iron Goat Pub are all standouts.",
        tip: "Valbella has exceptional charcuterie and sandwiches — perfect for picnic packing on day trips.",
      },
      {
        name: "Grassi Lakes Trail",
        emoji: "🥾",
        type: "hike",
        duration: "1.5–2.5 hrs",
        description: "Two stunning turquoise lakes on a moderate hike with ancient Indigenous rock art at the top. Take the upper trail for better views — harder but far more rewarding.",
        tip: "One of the best moderate hikes in the Canmore area. Great for the whole family.",
      },
      {
        name: "Quarry Lake",
        emoji: "🏊",
        type: "swim",
        duration: "1–2 hrs",
        description: "The only actually swimmable lake near Canmore. Calm, clear, and warmer than any glacier lake. Picnic tables and a small beach.",
      },
      {
        name: "Bow River Trail",
        emoji: "🌊",
        type: "activity",
        duration: "30–60 min",
        description: "Flat riverside path through town with mountain views in every direction. Good daily morning walk from wherever you're staying.",
      },
      {
        name: "Ha Ling Peak (Strenuous)",
        emoji: "🏔️",
        type: "hike",
        duration: "3.5–5 hrs return",
        description: "The steep peak directly above Canmore. Rewards with 360° views of the Bow Valley. Not for young kids but excellent for fit older children and adults.",
      },
      {
        name: "Banff Townsite (30 min drive)",
        emoji: "🏰",
        type: "activity",
        duration: "Half day",
        description: "Banff Ave shopping and restaurants, Bow Falls, Banff Springs Hotel, Cave & Basin. Easy 25-min drive from Canmore.",
        tip: "Parking in Banff is brutal in peak season. Try the Fenlands lot or arrive before 9am.",
      },
    ],
  },

  // ── Day 3: Jun 12 — Canmore ↔ Lake Louise day ────────────────────────────
  {
    id: "johnstoncanyon",
    name: "Johnston Canyon",
    shortName: "Johnston Canyon",
    emoji: "💧",
    date: "Jun 12",
    day: 3,
    color: "#B5451B",
    tagline: "Into the slot canyon",
    driveNote: "45 min west of Canmore on Hwy 1.",
    coords: { lat: 51.2424, lng: -115.8327 },
    arrivalNote: "The catwalks literally cling to the canyon walls over the rushing river. The Lower Falls are easy and iconic; the Upper Falls and Inkpots reward the extra effort significantly.",
    nearby: [
      {
        name: "Lower Falls",
        emoji: "🌊",
        type: "hike",
        duration: "1 hr return",
        description: "Paved catwalk suspended over the canyon walls leads to a 10 m waterfall. Stroller-accessible, outstanding canyon views. The mist from the falls is refreshing.",
        tip: "Go early — one of the busiest trails in Banff. Pre-8am or late afternoon is much better.",
      },
      {
        name: "Upper Falls",
        emoji: "💦",
        type: "hike",
        duration: "2 hrs return",
        description: "Continue from the lower falls to a 40 m cascade in a narrower gorge. Spray can be intense in early summer — bring a light jacket.",
      },
      {
        name: "The Inkpots",
        emoji: "🫙",
        type: "hike",
        duration: "4–5 hrs return",
        description: "Push past the upper falls to six vivid cold-spring pools in an open alpine meadow. The contrast — slot canyon to open meadow — is stunning. Pack lunch.",
        tip: "This turns it into a half-day hike. Worth every step but plan accordingly.",
      },
    ],
  },
  {
    id: "lakelouise",
    name: "Lake Louise",
    shortName: "Lake Louise",
    emoji: "💎",
    date: "Jun 12",
    day: 3,
    color: "#4A8FA8",
    tagline: "The Jewel of the Rockies",
    driveNote: "45 min west of Johnston Canyon, or 1.5 hrs from Canmore.",
    coords: { lat: 51.4167, lng: -116.2167 },
    arrivalNote: "One of the most photographed lakes on Earth — and it earns it. The turquoise colour from glacial rock flour looks fake in photos. In person it's even more impossible-looking.",
    nearby: [
      {
        name: "Lakeshore Walk",
        emoji: "🌊",
        type: "activity",
        duration: "30–40 min",
        description: "Flat path along the lake to the far end and back. The Victoria Glacier fills the view the whole way. Canoe rentals on the lakeshore.",
      },
      {
        name: "Plain of Six Glaciers Tea House",
        emoji: "🍵",
        type: "hike",
        duration: "3–4 hrs return",
        description: "Hike from the lake to a historic tea house directly under the glaciers. Fresh scones and soup at altitude — no electricity, no road access, cash only.",
        tip: "One of the most satisfying hikes in the park. Plan for it as the main event of the day.",
      },
      {
        name: "Lake Agnes Tea House",
        emoji: "☕",
        type: "hike",
        duration: "2.5–3 hrs return",
        description: "Steep climb to a small mountain lake with a tea house. Can be combined with Six Glaciers into a full-day loop.",
      },
      {
        name: "Château Lake Louise",
        emoji: "🏨",
        type: "activity",
        duration: "20 min",
        description: "Walk through the legendary château lobby and grab a coffee with the lake view. The lakeview terrace is one of the best seats in Canada.",
      },
    ],
  },
  {
    id: "morainelake",
    name: "Moraine Lake",
    shortName: "Moraine Lake",
    emoji: "🏔️",
    date: "Jun 12",
    day: 3,
    color: "#3A7D9C",
    tagline: "Valley of the Ten Peaks",
    driveNote: "14 km from Lake Louise village. Requires shuttle or reservation — no private vehicles in peak season.",
    coords: { lat: 51.3217, lng: -116.1859 },
    arrivalNote: "This was on the Canadian $20 bill. The 'Valley of the Ten Peaks' behind it was voted the most beautiful view in Canada. The colour is even more vivid than Lake Louise.",
    nearby: [
      {
        name: "Rockpile Viewpoint",
        emoji: "⛰️",
        type: "viewpoint",
        duration: "15 min",
        description: "The classic $20-bill view. Short scramble up the rockpile beside the parking lot. Best photo in the park — especially with the ten peaks reflected in the lake.",
        tip: "Shuttle from Lake Louise village required in peak season (mid-June onward). Book Parks Canada reservation in advance.",
      },
      {
        name: "Lakeshore Trail",
        emoji: "🌊",
        type: "hike",
        duration: "1 hr return",
        description: "Easy flat trail along the lake's edge. Views toward the Ten Peaks get more dramatic the further you go.",
      },
      {
        name: "Consolation Lakes",
        emoji: "🏞️",
        type: "hike",
        duration: "2 hrs return",
        description: "Moderate trail through boulder fields to two hidden alpine lakes. Quieter than the main shore and strikingly beautiful.",
        tip: "Regular grizzly activity in this area. Make noise and hike in groups.",
      },
      {
        name: "Canoe Rental",
        emoji: "🛶",
        type: "swim",
        duration: "1–2 hrs",
        description: "Paddle toward the Ten Peaks on the most photogenic lake on the trip. One of those experiences that lives rent-free in your head for years.",
      },
    ],
  },

  // ── Day 4: Jun 13 — Canmore ↔ Icefields Parkway day trip ─────────────────
  {
    id: "peytolake",
    name: "Peyto Lake",
    shortName: "Peyto Lake",
    emoji: "🦊",
    date: "Jun 13",
    day: 4,
    color: "#2E7D9C",
    tagline: "The neon lake — fox-shaped from above",
    driveNote: "~1.5 hrs from Canmore on the Icefields Parkway (Hwy 93). Bow Summit is the highest point on the Parkway.",
    coords: { lat: 51.7167, lng: -116.5333 },
    arrivalNote: "The Parkway opens north of Lake Louise. Peyto Lake — named after eccentric guide Bill Peyto — glows neon turquoise and looks uncannily like a fox from the Bow Summit viewpoint above.",
    nearby: [
      {
        name: "Bow Summit Viewpoint",
        emoji: "🏔️",
        type: "viewpoint",
        duration: "20 min",
        description: "Short walk from the parking lot to the most photographed viewpoint on the Parkway. At 2,069 m — the highest drivable point. Bring a layer, even in June.",
      },
      {
        name: "Bow Summit Meadow Trail",
        emoji: "🥾",
        type: "hike",
        duration: "1.5–2 hrs return",
        description: "Continue past the viewpoint into subalpine meadows. Marmots and pikas almost guaranteed. Worth the extra km over the crowded viewpoint platform.",
      },
      {
        name: "Mistaya Canyon (nearby)",
        emoji: "🪨",
        type: "activity",
        duration: "30 min",
        description: "A few km south — short walk to a dramatic narrow canyon carved by the Mistaya River. The rock formations look like the earth cracked open. Often overlooked, always impressive.",
      },
    ],
  },
  {
    id: "columbiaicefield",
    name: "Columbia Icefield",
    shortName: "Icefield",
    emoji: "🧊",
    date: "Jun 13",
    day: 4,
    color: "#5B8DB8",
    tagline: "The Ice Age hasn't ended here",
    driveNote: "~3 hrs from Canmore, ~1.5 hrs north of Peyto Lake. This is the natural turnaround point for the day trip.",
    coords: { lat: 52.2167, lng: -117.2333 },
    arrivalNote: "325 km² of glacial ice — the largest icefield in the Rockies south of Alaska. Eight glaciers pour off its edges. The Athabasca Glacier in front of you has been retreating since 1870.",
    nearby: [
      {
        name: "Athabasca Glacier Walk",
        emoji: "🧊",
        type: "activity",
        duration: "1–2 hrs",
        description: "Walk the marked trail to the glacier's edge and touch 10,000-year-old ice. Marker posts show where the ice reached in 1890, 1920, 1950, 1980… the retreat is staggering.",
        tip: "DO NOT cross the barriers — crevasses and sudden melt are genuinely dangerous. The safe zone is well-marked.",
      },
      {
        name: "Ice Explorer Tour",
        emoji: "🚙",
        type: "activity",
        duration: "1.5 hrs",
        description: "Massive purpose-built vehicles drive onto the glacier surface. Guides explain the ice, you get to stand on it and drink melt water straight from a pool.",
        tip: "Pricey but genuinely memorable. Book online in advance.",
      },
      {
        name: "Skywalk",
        emoji: "🌉",
        type: "viewpoint",
        duration: "45 min",
        description: "Glass-floored platform 280 m above the Sunwapta Valley. Brave the glass floor for a truly stomach-dropping view. Combined ticket with Ice Explorer available.",
      },
      {
        name: "Discovery Centre",
        emoji: "🏛️",
        type: "activity",
        duration: "45 min",
        description: "Free entry museum with glaciology and climate change exhibits. Great observation deck facing the glacier — good if weather closes in.",
      },
    ],
  },

  // ── Day 5: Jun 14 — Canmore local / Banff flex ───────────────────────────
  {
    id: "grassi",
    name: "Grassi Lakes & Banff",
    shortName: "Canmore Flex",
    emoji: "🌿",
    date: "Jun 14",
    day: 5,
    color: "#5E7A42",
    tagline: "Local day — go at your own pace",
    coords: { lat: 51.0891, lng: -115.3544 },
    arrivalNote: "No big drive today. Grassi Lakes are right above Canmore — one of the best moderate hikes in the area. Or spend the day in Banff townsite. Or both.",
    nearby: [
      {
        name: "Grassi Lakes",
        emoji: "🏞️",
        type: "hike",
        duration: "1.5–2.5 hrs",
        description: "Two vivid turquoise lakes above Canmore with ancient Stoney Nakoda rock art at the top. Take the upper (harder) trail for the best views and a sense of accomplishment.",
        tip: "The lower trail is easier and faster. The upper trail adds 30–45 min but reveals much better canyon views.",
      },
      {
        name: "Banff Avenue & Bow Falls",
        emoji: "🏔️",
        type: "activity",
        duration: "2–3 hrs",
        description: "Banff's main street for shops and lunch. Walk to Bow Falls (15 min from downtown) — surprisingly powerful waterfall right in town.",
      },
      {
        name: "Banff Upper Hot Springs",
        emoji: "♨️",
        type: "swim",
        duration: "2 hrs",
        description: "Natural geothermal pool at 37–40°C on the side of Sulphur Mountain. Towel and suit rental available. Perfect recovery after days of hiking.",
        tip: "Go late afternoon (4–6pm) — less crowded than midday.",
      },
      {
        name: "Cave & Basin NHS",
        emoji: "🪨",
        type: "activity",
        duration: "1 hr",
        description: "The discovery of these hot springs in 1883 literally created Banff National Park. The museum tells the whole story of how a national park was invented.",
      },
      {
        name: "Banff Gondola",
        emoji: "🚡",
        type: "activity",
        duration: "2–3 hrs",
        description: "8-minute gondola to Sulphur Mountain summit (2,281 m). Views of six mountain ranges and a boardwalk to a historic weather station at the top.",
        tip: "Book online. The sunset gondola ride is worth the later timing.",
      },
    ],
  },

  // ── Day 6: Jun 15 — Canmore → Drumheller ─────────────────────────────────
  {
    id: "drumheller",
    name: "Drumheller, AB",
    shortName: "Drumheller",
    emoji: "🦕",
    date: "Jun 15–16",
    day: 6,
    color: "#9B5A1A",
    tagline: "Dinosaur capital of the world",
    driveNote: "3–3.5 hrs east of Canmore. Easy transition drive through the prairies.",
    coords: { lat: 51.4635, lng: -112.7333 },
    arrivalNote: "The badlands of Drumheller are one of the most surreal landscapes in Canada — red and orange canyon walls, hoodoos, and more dinosaur fossils per square kilometre than almost anywhere on Earth.",
    nearby: [
      {
        name: "Royal Tyrrell Museum",
        emoji: "🦴",
        type: "activity",
        duration: "3–4 hrs",
        description: "One of the world's great natural history museums — 40+ mounted dinosaur skeletons, fossil prep labs you can watch through glass, and the largest collection of dinosaur specimens on Earth. Don't skip this.",
        tip: "Budget a full half-day minimum. The Cretaceous Garden walkway outside is free and has replica fossils set in real badlands landscape.",
      },
      {
        name: "Hoodoos Trail",
        emoji: "🗿",
        type: "hike",
        duration: "1 hr",
        description: "Short flat walk past the iconic hoodoo formations — mushroom-shaped rock towers up to 7 m tall carved by erosion. Otherworldly at sunset.",
        tip: "The hoodoos are 2.5 km east of Drumheller town. Easy to combine with an evening drive.",
      },
      {
        name: "Horseshoe Canyon",
        emoji: "🏜️",
        type: "viewpoint",
        duration: "1–1.5 hrs",
        description: "One of the most dramatic canyon views in Alberta — a sweeping badlands bowl 11 km west of Drumheller. Short trails descend into the canyon. Sunrise and sunset are jaw-dropping.",
        tip: "Free entry, no crowds compared to the museum. Go early morning or late afternoon.",
      },
      {
        name: "World's Largest Dinosaur",
        emoji: "🦖",
        type: "activity",
        duration: "20 min",
        description: "A 26 m fibreglass T-Rex statue in the middle of Drumheller town. You can climb into its mouth for a view. Ridiculous and mandatory.",
      },
      {
        name: "Canadian Badlands Passion Play (if timing works)",
        emoji: "🎭",
        type: "activity",
        duration: "Half day",
        description: "An outdoor amphitheatre cut into the badlands cliff. Check if it's running during your visit — the natural setting is extraordinary.",
      },
      {
        name: "Atlas Coal Mine NHS",
        emoji: "⛏️",
        type: "activity",
        duration: "1.5 hrs",
        description: "Last surviving wooden coal tipple in Canada. Guided underground mine tours available. Good for older kids interested in history.",
        tip: "30 min east of Drumheller in East Coulee. Pair with a drive through the canyon villages.",
      },
    ],
  },

  // ── Day 8: Jun 17 — Drumheller → Radium Hot Springs ─────────────────────
  {
    id: "radium",
    name: "Radium Hot Springs, BC",
    shortName: "Radium",
    emoji: "♨️",
    date: "Jun 17",
    day: 8,
    color: "#7A4F8A",
    tagline: "Soak in the Rockies' hottest springs",
    driveNote: "5–6 hrs from Drumheller — the longest mid-trip transition. You re-enter the Rockies through Kootenay National Park.",
    coords: { lat: 50.6206, lng: -116.0742 },
    arrivalNote: "Radium Hot Springs is where the Rockies meet the Columbia Valley. The springs are the hottest natural springs in the Canadian Rockies — 54°C at the source, cooled to a very soakable 40°C in the pools.",
    nearby: [
      {
        name: "Radium Hot Springs Pools",
        emoji: "♨️",
        type: "swim",
        duration: "2–3 hrs",
        description: "The namesake attraction — geothermal spring pools right inside Kootenay National Park. A hot pool (~40°C) and a cool pool (~18°C). Set against dramatic Sinclair Canyon cliffs.",
        tip: "Open daily. Suit and towel rental available. Go in the evening when it's quieter and the canyon walls glow in the low light.",
      },
      {
        name: "Sinclair Canyon Walk",
        emoji: "🪨",
        type: "hike",
        duration: "30 min",
        description: "The hot springs sit at the mouth of Sinclair Canyon — a narrow slot canyon the highway and river both thread through. Walk the short trail along the canyon walls.",
      },
      {
        name: "Kootenay National Park Drives",
        emoji: "🚗",
        type: "drive",
        duration: "1–2 hrs",
        description: "The highway through Kootenay NP offers excellent wildlife viewing — bighorn sheep are almost guaranteed on the road through the canyon. Also: paint pots (coloured iron springs), marble canyon.",
        tip: "Marble Canyon and the Paint Pots are 45 min north and both worth a stop if you haven't been.",
      },
      {
        name: "Bighorn Sheep Viewing",
        emoji: "🐏",
        type: "viewpoint",
        duration: "Ongoing",
        description: "Bighorn sheep lick road salt off the highway through Sinclair Canyon — sometimes blocking traffic. Don't feed them, but do pull over for photos.",
      },
      {
        name: "Columbia River Wetlands",
        emoji: "🐦",
        type: "activity",
        duration: "1 hr",
        description: "The Columbia Valley south of Radium has one of the most important wetland bird sanctuaries in North America. Herons, ospreys, eagles, and waterfowl by the hundreds.",
      },
    ],
  },

  // ── Day 9: Jun 18 — Radium → Penticton ───────────────────────────────────
  {
    id: "penticton",
    name: "Penticton, BC",
    shortName: "Penticton",
    emoji: "🍷",
    date: "Jun 18–19",
    day: 9,
    color: "#9B3A5A",
    tagline: "Okanagan wine, beaches, and sun",
    driveNote: "5–5.5 hrs from Radium through the Kootenays and into the Okanagan. One of the most scenic drives of the whole trip.",
    coords: { lat: 49.4990, lng: -119.5937 },
    arrivalNote: "Penticton sits between two lakes with 192 days of sunshine per year. After a week of mountains, the Okanagan warmth, beaches, and wine country is a different kind of beautiful.",
    nearby: [
      {
        name: "Okanagan Lake Beach (Penticton)",
        emoji: "🏖️",
        type: "swim",
        duration: "Half day",
        description: "Long sandy beach right in town on Okanagan Lake. Actually warm enough to swim in June (18–22°C in summer). Clean, calm, and huge.",
        tip: "The north end of the beach near the channel is quieter. Skaha Lake beach (south end of town) is even less crowded.",
      },
      {
        name: "Okanagan Wine Tasting",
        emoji: "🍷",
        type: "activity",
        duration: "Half day",
        description: "Penticton is surrounded by 80+ wineries. Naramata Bench (15 min from town) has a dense cluster of excellent small producers. Most offer tastings for $5–15.",
        tip: "Recommended: Lake Breeze, La Frenz, Poplar Grove. Call ahead — some are appointment-only.",
      },
      {
        name: "Kettle Valley Rail Trail",
        emoji: "🚴",
        type: "activity",
        duration: "1–3 hrs",
        description: "Old railway converted to a multi-use trail through orchards and above the lake. Flat and easy — great for walking or cycling. Bike rentals available in town.",
      },
      {
        name: "Skaha Lake",
        emoji: "🌊",
        type: "swim",
        duration: "2 hrs",
        description: "Smaller, quieter lake at the south end of town. Warm water, sandy beach, and much less crowded than Okanagan Lake. Local favourite.",
      },
      {
        name: "Penticton Farmers Market",
        emoji: "🍑",
        type: "food",
        duration: "1 hr",
        description: "Saturday morning market with Okanagan produce, baked goods, and crafts. In June: cherries, strawberries, asparagus, and early peaches.",
        tip: "One of the best farmers markets in BC. If your dates align, don't miss it.",
      },
      {
        name: "Penticton Craft Beer",
        emoji: "🍺",
        type: "food",
        duration: "1–2 hrs",
        description: "Cannery Brewing and Bad Tattoo Brewing are both excellent. Cannery's patio overlooking Okanagan Lake is one of the best spots in town.",
      },
    ],
  },
];

export function getWaypointById(id: string): Waypoint | undefined {
  return WAYPOINTS.find((w) => w.id === id);
}

export const TYPE_BADGE: Record<NearbyType, { label: string; color: string }> = {
  hike:      { label: "Hike",      color: "#5E8A6E" },
  viewpoint: { label: "View",      color: "#4A8FA8" },
  food:      { label: "Food",      color: "#C0652B" },
  activity:  { label: "Activity",  color: "#7048B6" },
  swim:      { label: "Swim",      color: "#2979A8" },
  drive:     { label: "Drive",     color: "#8B7355" },
};
