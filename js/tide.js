// Lab page: three sine swells on a canvas, the same shapes as the waves between pages.
import { locale, t } from "./i18n.js";
import { calm } from "./juice.js";

const WIDTH = 1016;
const HEIGHT = 300;
const STEP = 8; // pixels between two points of a crest
const LAYERS = [
  { length: 1, height: 1, speed: 1, base: 0.36, alpha: 0.3 },
  { length: 0.66, height: 0.7, speed: -1.4, base: 0.54, alpha: 0.55 },
  { length: 0.5, height: 0.5, speed: 1.9, base: 0.72, alpha: 1 },
];
const TURN = Math.PI * 2;
const MS = 1000;
let canvas = null;
let context = null;
let frame = 0;

const setting = (name) => Number(document.querySelector(`[data-tide-${name}]`).value);

function draw(seconds) {
  const [height, length, speed] = ["height", "length", "speed"].map(setting);
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  LAYERS.forEach((layer) => {
    const shift = (seconds * speed * layer.speed) / (length * layer.length);
    context.globalAlpha = layer.alpha;
    context.beginPath();
    context.moveTo(0, HEIGHT);
    for (let x = 0; x <= WIDTH; x += STEP) {
      const y = HEIGHT * layer.base + Math.sin((x / (length * layer.length) - shift) * TURN) * height * layer.height;
      context.lineTo(x, y);
    }
    context.lineTo(WIDTH, HEIGHT);
    context.fill();
  });
  context.globalAlpha = 1;
}

function describe() {
  const [height, length, speed] = ["height", "length", "speed"].map(setting);
  const period = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(length / speed);
  document.querySelector("[data-tide-read]").textContent = speed
    ? t(`Front swell: ${height} px high, ${length} px long, one crest every ${period} s.`, `Houle de devant : ${height} px de haut, ${length} px de long, une crête toutes les ${period} s.`)
    : t(`Front swell: ${height} px high, ${length} px long, standing still.`, `Houle de devant : ${height} px de haut, ${length} px de long, à l'arrêt.`);
}

function tick(now) {
  if (!canvas?.isConnected) return;
  draw(now / MS);
  if (!calm()) frame = requestAnimationFrame(tick);
}

function refresh() {
  if (!canvas?.isConnected) return;
  describe();
  if (calm()) draw(0);
}

export function mountTide() {
  cancelAnimationFrame(frame);
  canvas = document.querySelector("[data-tide]");
  if (!canvas) return;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  context = canvas.getContext("2d");
  describe();
  frame = requestAnimationFrame(tick);
}

document.addEventListener("input", (event) => event.target.closest("[data-tide-controls]") && refresh());
document.addEventListener("langchange", refresh);
document.addEventListener("themechange", refresh);
