// Language transition: three swells rise over the page like a tide, the new language
// is stamped on the last one with a hit-stop, then the tide goes back out.
// Route changes use the same tide, faster and without the stamp.
import { calm, pause, blip } from "./juice.js";

const SWELLS = 3;
const SWELL_MS = 520;
const STAGGER_MS = 90;
const ROUTE_SPEED = 1.6; // route changes run this much faster than the language wipe
const DRIFT_MS = 1400;
const STAMP_MS = 260;
const HIT_STOP_MS = 140;
const STAMP_HZ = 110;
const STAMP_SOUND_MS = 200;
const EASE_IN_OUT = "cubic-bezier(0.7, 0, 0.2, 1)";
const EASE_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const BELOW = "translateY(calc(100% + 96px))"; // the crest stands 80px above its swell
const SVG = "http://www.w3.org/2000/svg";
const CREST_WIDTH = 2880;
const CREST_HEIGHT = 80;
const WAVELENGTHS = [720, 480, 360];

// A crest twice as wide as the screen, so it can drift sideways while the swell rises.
function crest(wavelength) {
  const half = wavelength / 2;
  const humps = " t" + half + ",0";
  const d = "M0,40 q" + half / 2 + ",-36 " + half + ",0" + humps.repeat(CREST_WIDTH / half - 1);
  const svg = document.createElementNS(SVG, "svg");
  const path = document.createElementNS(SVG, "path");
  svg.setAttribute("viewBox", `0 0 ${CREST_WIDTH} ${CREST_HEIGHT}`);
  svg.setAttribute("preserveAspectRatio", "none");
  path.setAttribute("d", `${d} V${CREST_HEIGHT} H0 Z`);
  svg.append(path);
  return svg;
}

function build(label) {
  const overlay = document.createElement("div");
  overlay.className = "wipe";
  overlay.setAttribute("aria-hidden", "true");
  for (let i = 0; i < SWELLS; i += 1) {
    const swell = document.createElement("i");
    swell.append(crest(WAVELENGTHS[i]));
    overlay.append(swell);
  }
  const stamp = document.createElement("b");
  stamp.textContent = label;
  overlay.append(stamp);
  document.body.append(overlay);
  return { overlay, swells: [...overlay.querySelectorAll("i")], stamp };
}

function drift(swells) {
  swells.forEach((swell, index) => {
    const frames = [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }];
    const direction = index % 2 ? "reverse" : "normal";
    swell.firstChild.animate(frames, { duration: DRIFT_MS, iterations: Infinity, direction, easing: "linear" });
  });
}

// The tide comes in back to front and goes out front to back.
function tide(swells, from, to, speed = 1) {
  const order = to === BELOW ? [...swells].reverse() : swells;
  const runs = order.map((swell, index) => {
    const frames = [{ transform: from }, { transform: to }];
    return swell.animate(frames, { duration: SWELL_MS / speed, delay: (index * STAGGER_MS) / speed, easing: EASE_IN_OUT, fill: "both" }).finished;
  });
  return Promise.all(runs);
}

function stampIn(stamp) {
  const frames = [
    { transform: "scale(2.6) rotate(-8deg)", opacity: 0 },
    { transform: "scale(1) rotate(-4deg)", opacity: 1 },
  ];
  return stamp.animate(frames, { duration: STAMP_MS, easing: EASE_BACK, fill: "both" }).finished;
}

export async function wipe(label, swap) {
  if (calm()) return swap();
  const { overlay, swells, stamp } = build(label);
  drift(swells);
  await tide(swells, BELOW, "none");
  await swap();
  await stampIn(stamp);
  blip(STAMP_HZ, STAMP_SOUND_MS, "sawtooth");
  await pause(HIT_STOP_MS);
  stamp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SWELL_MS / 2, fill: "both" });
  await tide(swells, "none", BELOW);
  overlay.remove();
}

export async function tideOver(swap) {
  if (calm()) return swap();
  const { overlay, swells } = build("");
  drift(swells);
  await tide(swells, BELOW, "none", ROUTE_SPEED);
  await swap();
  await tide(swells, "none", BELOW, ROUTE_SPEED);
  overlay.remove();
}
