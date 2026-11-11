// Easter egg: type "shiba" anywhere and a pixel shiba runs across the page.
import { blip, calm, feedback } from "./juice.js";

const BODY = [
  "............o..o..",
  ".oo.........oo.oo.",
  "o..o........ooooo.",
  "o.oo........oookoo",
  ".ooo........occcck",
  "..oooooooooooccc..",
  "..ooooooooooooc...",
  "..oooooooooooocc..",
  "..ooccccccccocc...",
];
const LEGS = [
  ["..oo.oo....oo.oo..", "..oo.oo....oo.oo..", "..cc.cc....cc.cc.."],
  [".oo..oo.....oo.oo.", "oo...oo......oo.oo", "cc...cc......cc.cc"],
];
const COLORS = { o: "#D9822B", c: "#F6E7C8", k: "#1A1A18" };
const PIXEL = 6;
const RUN_MS = 3800;
const STILL_MS = 3000;
const STRIDE_MS = 110;
const HOPS = 9;
const HOP_PX = 26;
const BARK = [[440, 70], [330, 110]]; // hertz, milliseconds
const BARK_GAP_MS = 90;
const WORD = "shiba";

let buffer = "";
let running = false;

function sprite(legs) {
  const rows = [...BODY, ...legs];
  const canvas = document.createElement("canvas");
  canvas.width = rows[0].length * PIXEL;
  canvas.height = rows.length * PIXEL;
  const context = canvas.getContext("2d");
  rows.forEach((row, y) => {
    [...row].forEach((code, x) => {
      if (!COLORS[code]) return;
      context.fillStyle = COLORS[code];
      context.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
    });
  });
  return canvas;
}

function build() {
  const dog = document.createElement("div");
  dog.className = "shiba";
  dog.setAttribute("aria-hidden", "true");
  const bubble = document.createElement("span");
  bubble.textContent = "wouf";
  const frames = LEGS.map(sprite);
  dog.append(bubble, ...frames);
  document.body.append(dog);
  return { dog, frames };
}

function bark() {
  BARK.forEach(([hz, ms], index) => setTimeout(() => blip(hz, ms), index * BARK_GAP_MS));
}

function finish(dog) {
  dog.remove();
  running = false;
}

function run({ dog, frames }) {
  const start = performance.now();
  const distance = window.innerWidth + dog.offsetWidth;
  function tick(now) {
    const progress = (now - start) / RUN_MS;
    if (progress >= 1) return finish(dog);
    const x = progress * distance - dog.offsetWidth;
    const y = -Math.abs(Math.sin(progress * HOPS * Math.PI)) * HOP_PX;
    dog.style.transform = `translate(${x}px, ${y}px)`;
    const stride = Math.floor((now - start) / STRIDE_MS) % frames.length;
    frames.forEach((frame, index) => { frame.hidden = index !== stride; });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function releaseShiba() {
  if (running) return;
  running = true;
  const parts = build();
  parts.frames[1].hidden = true;
  bark();
  feedback("medium");
  if (calm()) setTimeout(() => finish(parts.dog), STILL_MS);
  else run(parts);
}

function onKey(event) {
  if (event.key.length !== 1) return;
  buffer = (buffer + event.key.toLowerCase()).slice(-WORD.length);
  if (buffer === WORD) releaseShiba();
}

window.addEventListener("keydown", onKey);
if (document.body.dataset.shiba === "now") releaseShiba();
