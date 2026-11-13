// Game feel: squash and stretch, short tones, importance tiers.
// Everything here is silent and still under prefers-reduced-motion.

const POP_MS = 240;
const POP_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // overshoots, then settles
const VOLUME = 0.05;
const SILENCE = 0.0001;
const MS = 1000;
const TIERS = {
  small: { hz: 620, ms: 45 },
  medium: { hz: 330, ms: 80 },
  large: { hz: 150, ms: 160 },
};

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let audio;

export const calm = () => reduced.matches;
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function pop(element, squash = 0.25) {
  if (calm() || !element) return;
  const from = `scale(${1 + squash}, ${1 - squash})`;
  element.animate([{ transform: from }, { transform: "scale(1)" }], {
    duration: POP_MS,
    easing: POP_EASE,
  });
}

export function soundOn() {
  try {
    return localStorage.getItem("sound") === "on";
  } catch {
    return false;
  }
}

export function blip(hz, ms, type = "square") {
  if (soundOn()) tone(hz, ms, type);
}

// Plays whatever the sound setting says: for keys the visitor presses on purpose.
export function tone(hz, ms, type = "square") {
  audio ??= new AudioContext();
  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = hz;
  gain.gain.setValueAtTime(VOLUME, now);
  gain.gain.exponentialRampToValueAtTime(SILENCE, now + ms / MS);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + ms / MS);
}

// One call per event. The tier keeps the feedback in proportion.
export function feedback(tier, element) {
  const { hz, ms } = TIERS[tier];
  blip(hz, ms);
  pop(element);
}
