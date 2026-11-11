// Game feel: decaying screen shake, squash and stretch, short tones, importance tiers.
// Everything here is silent and still under prefers-reduced-motion.

const DECAY_PER_SECOND = 1.6;
const SHAKE_SPEED = 34;
const MAX_X = 14;
const MAX_Y = 9;
const MAX_ROLL_DEG = 0.7;
const POP_MS = 240;
const POP_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // overshoots, then settles
const VOLUME = 0.05;
const SILENCE = 0.0001;
const MS = 1000;
const TIERS = {
  small: { hz: 620, ms: 45, trauma: 0 },
  medium: { hz: 330, ms: 80, trauma: 0.4 },
  large: { hz: 150, ms: 160, trauma: 0.8 },
};

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const target = document.querySelector("[data-shake]");
let trauma = 0;
let frame = 0;
let last = 0;
let phase = 0;
let audio;

export const calm = () => reduced.matches;
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shakeFrame(now) {
  const dt = (now - last) / MS;
  last = now;
  trauma = Math.max(0, trauma - DECAY_PER_SECOND * dt);
  phase += dt * SHAKE_SPEED;
  const power = trauma * trauma; // quadratic: small hits barely move, big hits punch
  const x = MAX_X * power * Math.sin(phase * 1.7);
  const y = MAX_Y * power * Math.sin(phase * 2.3);
  const roll = MAX_ROLL_DEG * power * Math.sin(phase * 1.1);
  target.style.transform = trauma ? `translate(${x}px, ${y}px) rotate(${roll}deg)` : "";
  frame = trauma ? requestAnimationFrame(shakeFrame) : 0;
}

// Hits add trauma, they do not reset it.
export function shake(amount) {
  if (calm() || !target || !amount) return;
  trauma = Math.min(1, trauma + amount);
  if (frame) return;
  last = performance.now();
  frame = requestAnimationFrame(shakeFrame);
}

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
  if (!soundOn()) return;
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
  const { hz, ms, trauma: amount } = TIERS[tier];
  blip(hz, ms);
  shake(amount);
  pop(element);
}
