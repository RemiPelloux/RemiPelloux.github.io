// Canvas and controls for the Schelling model.
import { COLS, ROWS, createModel, step, meanLikeShare } from "./model.js";
import { locale, t } from "./i18n.js";
import { feedback } from "./juice.js";

const CELL = 20; // canvas pixels per grid cell
const GAP = 2;
const MAX_STEPS = 400;
const DEFAULT_SEED = 42;
const MAX_SEED = 2 ** 32 - 1;
const PERCENT = 100;
const COLOR_TOKENS = ["--paper-2", "--ink", "--accent"]; // empty, group 1, group 2

let canvas = null;
let context = null;
let seedInput = null;
let runButton = null;
let readout = null;
let status = null;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let model;
let frame = 0;

function palette() {
  const style = getComputedStyle(document.documentElement);
  return COLOR_TOKENS.map((token) => style.getPropertyValue(token).trim());
}

function draw() {
  const colors = palette();
  context.fillStyle = colors[0];
  context.fillRect(0, 0, canvas.width, canvas.height);
  model.grid.forEach((group, index) => {
    if (!group) return;
    context.fillStyle = colors[group];
    const x = (index % COLS) * CELL;
    const y = Math.floor(index / COLS) * CELL;
    context.fillRect(x, y, CELL - GAP, CELL - GAP);
  });
}

function report() {
  const like = Math.round(meanLikeShare(model.grid) * PERCENT);
  const moved = new Intl.NumberFormat(locale()).format(model.moved);
  const state = model.settled
    ? t(`Settled after ${model.steps} steps. Every agent is content.`, `Stable après ${model.steps} pas. Chaque agent est satisfait.`)
    : t(`Step ${model.steps}. ${moved} agents moved.`, `Pas ${model.steps}. ${moved} agents déplacés.`);
  const seed = t(`Seed ${model.seed}.`, `Graine ${model.seed}.`);
  const tail = t(`Like neighbours: ${like} %.`, `Voisins semblables : ${like} %.`);
  readout.textContent = `${seed} ${state} ${tail}`;
}

function labelRun() {
  runButton.textContent = frame ? t("Pause model", "Mettre en pause") : t("Run model", "Lancer le modèle");
}

function finished() {
  return model.settled || model.steps >= MAX_STEPS;
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  labelRun();
  if (!finished()) return;
  status.textContent = readout.textContent;
  feedback("large", readout);
}

function tick() {
  step(model);
  draw();
  report();
  if (finished()) stop();
  else frame = requestAnimationFrame(tick);
}

function runToEnd() {
  while (!finished()) step(model);
  draw();
  report();
  stop();
}

function toggleRun() {
  if (frame) return stop();
  if (finished()) reset();
  if (reducedMotion.matches) return runToEnd();
  frame = requestAnimationFrame(tick);
  labelRun();
}

function readSeed() {
  const value = Math.floor(Number(seedInput.value));
  const seed = Number.isFinite(value) ? Math.min(MAX_SEED, Math.max(0, value)) : DEFAULT_SEED;
  seedInput.value = seed;
  return seed;
}

function reset() {
  if (frame) stop();
  model = createModel(readSeed());
  status.textContent = "";
  draw();
  report();
}

function stepOnce() {
  if (frame) stop();
  step(model);
  draw();
  report();
}

const live = () => Boolean(canvas?.isConnected);

export function mountModel() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  const root = document.querySelector("[data-model]");
  canvas = root?.querySelector("canvas") ?? null;
  if (!canvas) return;
  context = canvas.getContext("2d");
  seedInput = root.querySelector("[data-model-seed]");
  runButton = root.querySelector("[data-model-run]");
  readout = root.querySelector("[data-model-read]");
  status = root.querySelector("[data-model-status]");
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  runButton.addEventListener("click", toggleRun);
  root.querySelector("[data-model-step]").addEventListener("click", stepOnce);
  root.querySelector("[data-model-reset]").addEventListener("click", reset);
  seedInput.addEventListener("change", reset);
  reset();
  labelRun();
}

document.addEventListener("themechange", () => live() && draw());
document.addEventListener("langchange", () => {
  if (!live()) return;
  report();
  labelRun();
});
