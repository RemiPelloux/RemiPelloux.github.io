// Canvas and controls for the Schelling model.
import { COLS, ROWS, createModel, step, meanLikeShare } from "./model.js";

const CELL = 20; // canvas pixels per grid cell
const GAP = 2;
const MAX_STEPS = 400;
const DEFAULT_SEED = 42;
const MAX_SEED = 2 ** 32 - 1;
const PERCENT = 100;
const COLOR_TOKENS = ["--paper-2", "--ink", "--accent"]; // empty, group 1, group 2

const root = document.querySelector("[data-model]");
const canvas = root?.querySelector("canvas");
const context = canvas?.getContext("2d");
const seedInput = root?.querySelector("[data-model-seed]");
const runButton = root?.querySelector("[data-model-run]");
const readout = root?.querySelector("[data-model-read]");
const status = root?.querySelector("[data-model-status]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const numberFormat = new Intl.NumberFormat("en-GB");

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
  const state = model.settled
    ? `Settled after ${model.steps} steps. Every agent is content.`
    : `Step ${model.steps}. ${numberFormat.format(model.moved)} agents moved.`;
  readout.textContent = `Seed ${model.seed}. ${state} Like neighbours: ${like} %.`;
}

function finished() {
  return model.settled || model.steps >= MAX_STEPS;
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  runButton.textContent = "Run model";
  if (finished()) status.textContent = readout.textContent;
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
  runButton.textContent = "Pause model";
  frame = requestAnimationFrame(tick);
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

function start() {
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  runButton.addEventListener("click", toggleRun);
  root.querySelector("[data-model-step]").addEventListener("click", stepOnce);
  root.querySelector("[data-model-reset]").addEventListener("click", reset);
  seedInput.addEventListener("change", reset);
  document.addEventListener("themechange", draw);
  reset();
}

if (context) start();
