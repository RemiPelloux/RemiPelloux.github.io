// The sea under the skyline: a few wave lines that roll while they are on screen
// and swell under the pointer.

const LINES = 7;
const HEIGHT_PX = 150;
const STEP_PX = 6;
const BASE_AMPLITUDE = 3;
const AMPLITUDE_GROWTH = 2.2; // each line nearer the viewer rolls a little more
const WAVELENGTH_PX = 190;
const SPEED = 0.0011; // radians per millisecond for the nearest line
const SWELL_PX = 22;
const SWELL_REACH_PX = 160;
const MIN_ALPHA = 0.18;

let canvas = null;
let context = null;
let visible = false;
let running = false;
let pointerX = -1e6;
const observer = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible && !running) requestAnimationFrame(frame);
});

function waveY(line, x, time) {
  const depth = (line + 1) / LINES;
  const phase = (x / WAVELENGTH_PX) * (1.6 - depth * 0.6) + time * SPEED * (0.4 + depth) + line * 1.3;
  const swell = SWELL_PX * depth * Math.exp(-(((x - pointerX) / SWELL_REACH_PX) ** 2));
  const roll = (BASE_AMPLITUDE + line * AMPLITUDE_GROWTH) * Math.sin(phase * Math.PI * 2);
  return (HEIGHT_PX / (LINES + 1)) * (line + 1) + roll - swell;
}

function drawLine(line, width, time, color) {
  context.beginPath();
  for (let x = 0; x <= width + STEP_PX; x += STEP_PX) context.lineTo(x, waveY(line, x, time));
  context.globalAlpha = MIN_ALPHA + (1 - MIN_ALPHA) * ((line + 1) / LINES);
  context.strokeStyle = color;
  context.lineWidth = 1 + line * 0.25;
  context.stroke();
}

function frame(time) {
  running = visible && Boolean(canvas?.isConnected);
  if (!running) return;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(HEIGHT_PX * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  for (let line = 0; line < LINES; line += 1) drawLine(line, width, time, color);
  if (!still.matches) requestAnimationFrame(frame);
  else running = false;
}

const still = window.matchMedia("(prefers-reduced-motion: reduce)");

function onMove(event) {
  if (canvas?.isConnected) pointerX = event.clientX - canvas.getBoundingClientRect().left;
}

export function mountSea() {
  observer.disconnect();
  canvas = document.querySelector("[data-sea]");
  if (!canvas) return;
  context = canvas.getContext("2d");
  observer.observe(canvas);
}

window.addEventListener("pointermove", onMove, { passive: true });
document.addEventListener("themechange", () => visible && !running && requestAnimationFrame(frame));
