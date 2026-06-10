// Synthesized sound effects via Web Audio API — no audio files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return ctx;
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine"
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.connect(env);
  env.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, ac.currentTime + startOffset);
  env.gain.linearRampToValueAtTime(gain, ac.currentTime + startOffset + 0.01);
  env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + duration);
  osc.start(ac.currentTime + startOffset);
  osc.stop(ac.currentTime + startOffset + duration + 0.05);
}

// Ascending 3-note chime — correct answer / reveal
export function playCorrect() {
  try {
    tone(523, 0,    0.18, 0.3);   // C5
    tone(659, 0.13, 0.18, 0.3);   // E5
    tone(784, 0.26, 0.3,  0.35);  // G5
  } catch { /* AudioContext blocked */ }
}

// Descending buzz — wrong answer
export function playWrong() {
  try {
    tone(320, 0,    0.12, 0.28, "sawtooth");
    tone(240, 0.13, 0.22, 0.22, "sawtooth");
  } catch {}
}

// Soft click — advancing to next card
export function playNext() {
  try {
    tone(440, 0,    0.06, 0.12, "sine");
    tone(330, 0.05, 0.08, 0.08, "sine");
  } catch {}
}

// Full fanfare — arrived! / special moment
// Ascending reveal chime — riddle answer shown
export function playReveal() {
  try {
    tone(440, 0,    0.12, 0.22);
    tone(554, 0.11, 0.12, 0.22);
    tone(659, 0.22, 0.22, 0.28);
  } catch {}
}

export function playFanfare() {
  try {
    tone(523,  0,    0.12, 0.28);  // C5
    tone(659,  0.10, 0.12, 0.28);  // E5
    tone(784,  0.20, 0.14, 0.30);  // G5
    tone(1047, 0.32, 0.35, 0.35);  // C6
    tone(784,  0.50, 0.14, 0.22);  // G5
    tone(1047, 0.62, 0.45, 0.38);  // C6
  } catch {}
}
