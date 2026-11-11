// Language transition: ink strips drop over the page, the new language is stamped
// on them with a hit-stop and a shake, then the strips fall away.
import { calm, pause, shake, blip } from "./juice.js";

const STRIPS = 8;
const STRIP_MS = 300;
const STAGGER_MS = 38;
const STAMP_MS = 260;
const HIT_STOP_MS = 140;
const STAMP_TRAUMA = 0.75;
const STAMP_HZ = 110;
const STAMP_SOUND_MS = 200;
const EASE_IN_OUT = "cubic-bezier(0.7, 0, 0.2, 1)";
const EASE_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function build(label) {
  const overlay = document.createElement("div");
  overlay.className = "wipe";
  overlay.setAttribute("aria-hidden", "true");
  for (let i = 0; i < STRIPS; i += 1) overlay.append(document.createElement("i"));
  const stamp = document.createElement("b");
  stamp.textContent = label;
  overlay.append(stamp);
  document.body.append(overlay);
  return { overlay, strips: [...overlay.querySelectorAll("i")], stamp };
}

function sweep(strips, from, to, origin) {
  const runs = strips.map((strip, index) => {
    strip.style.transformOrigin = origin;
    return strip.animate([{ transform: `scaleY(${from})` }, { transform: `scaleY(${to})` }], {
      duration: STRIP_MS,
      delay: index * STAGGER_MS,
      easing: EASE_IN_OUT,
      fill: "both",
    }).finished;
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
  const { overlay, strips, stamp } = build(label);
  await sweep(strips, 0, 1, "top");
  await swap();
  await stampIn(stamp);
  shake(STAMP_TRAUMA);
  blip(STAMP_HZ, STAMP_SOUND_MS, "sawtooth");
  await pause(HIT_STOP_MS);
  stamp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: STRIP_MS, fill: "both" });
  await sweep(strips, 1, 0, "bottom");
  overlay.remove();
}
