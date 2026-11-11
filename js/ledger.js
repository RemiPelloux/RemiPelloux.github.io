// Contribution ledger: state, readout and input for the skyline canvas.
import { LEDGER_START, LEDGER_COUNTS } from "./ledger-data.js";
import { locale, t } from "./i18n.js";
import { blip, calm, shake } from "./juice.js";
import { releaseShiba } from "./shiba.js";
import { Skyline } from "./skyline.js";

const LEVEL_FLOORS = [1, 10, 40, 100]; // contributions needed for steps 1 to 4
const PEAK_LEVEL = 5;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const NOTE_BASE_HZ = 220;
const NOTE_STEP_HZ = 110;
const NOTE_MS = 50;
const PRESS_TRAUMA = 0.25;
const KEY_STEPS = {
  ArrowLeft: -DAYS_PER_WEEK,
  ArrowRight: DAYS_PER_WEEK,
  ArrowUp: -1,
  ArrowDown: 1,
};

const peakIndex = LEDGER_COUNTS.indexOf(Math.max(...LEDGER_COUNTS));
const level = (count) => LEVEL_FLOORS.filter((floor) => count >= floor).length;
const levels = LEDGER_COUNTS.map((count, index) => (index === peakIndex ? PEAK_LEVEL : level(count)));
let canvas = null;
let readout = null;
let skyline = null;
let selected = -1;

function dayLabel(index) {
  const date = new Date(Date.parse(LEDGER_START) + index * MS_PER_DAY);
  return new Intl.DateTimeFormat(locale(), { dateStyle: "full", timeZone: "UTC" }).format(date);
}

const format = (value) => new Intl.NumberFormat(locale()).format(value);

function summary() {
  const total = format(LEDGER_COUNTS.reduce((sum, count) => sum + count, 0));
  const active = LEDGER_COUNTS.filter((count) => count > 0).length;
  const days = LEDGER_COUNTS.length;
  const peak = LEDGER_COUNTS[peakIndex];
  return t(
    `${total} contributions, public and private, since ${dayLabel(0)}. Active on ${active} of ${days} days. Tallest bar, in colour: ${dayLabel(peakIndex)}, with ${peak}.`,
    `${total} contributions, publiques et privées, depuis le ${dayLabel(0)}. Actif ${active} jours sur ${days}. La plus haute barre, en couleur : ${dayLabel(peakIndex)}, avec ${peak}.`,
  );
}

function describe() {
  if (selected < 0) return summary();
  const count = LEDGER_COUNTS[selected];
  const noun = count === 1 ? "contribution" : "contributions";
  return t(`${dayLabel(selected)}: ${format(count)} ${noun}.`, `${dayLabel(selected)} : ${format(count)} ${noun}.`);
}

function select(index) {
  selected = index;
  skyline.select(index);
  readout.textContent = describe();
}

function press(index) {
  if (index < 0) return;
  blip(NOTE_BASE_HZ + level(LEDGER_COUNTS[index]) * NOTE_STEP_HZ, NOTE_MS, "triangle");
  shake(PRESS_TRAUMA);
  if (index === peakIndex) releaseShiba();
}

function onPointer(event) {
  const box = canvas.getBoundingClientRect();
  const index = skyline.hit(event.clientX - box.left, event.clientY - box.top);
  if (!calm()) skyline.tilt((event.clientX - box.left) / box.width - 0.5);
  if (index !== selected) select(index);
  if (event.type === "pointerdown") press(index);
}

function onKey(event) {
  if (event.key === "Enter") return press(selected);
  const step = KEY_STEPS[event.key];
  if (step === undefined) return;
  event.preventDefault();
  const from = selected < 0 ? peakIndex : selected;
  select(Math.min(LEDGER_COUNTS.length - 1, Math.max(0, from + step)));
}

export function mountLedger() {
  canvas = document.querySelector("[data-ledger]");
  readout = document.querySelector("[data-ledger-read]");
  if (!canvas || !readout) return;
  skyline = new Skyline(canvas, LEDGER_COUNTS, levels);
  canvas.addEventListener("pointermove", onPointer);
  canvas.addEventListener("pointerdown", onPointer);
  canvas.addEventListener("pointerleave", () => select(-1));
  canvas.addEventListener("keydown", onKey);
  canvas.addEventListener("blur", () => select(-1));
  selected = -1;
  readout.textContent = describe();
  skyline.replay(calm());
}

const live = () => Boolean(canvas?.isConnected && skyline);
document.addEventListener("langchange", () => live() && (readout.textContent = describe()));
document.addEventListener("themechange", () => live() && skyline.retheme());
document.addEventListener("introdone", () => live() && skyline.replay(calm()));
window.addEventListener("resize", () => live() && skyline.draw());
