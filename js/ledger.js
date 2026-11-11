// Draws the contribution ledger and reports the day under the pointer or the arrow keys.
import { LEDGER_START, LEDGER_COUNTS } from "./ledger-data.js";
import { locale, ready, t } from "./i18n.js";
import { blip, pop } from "./juice.js";
import { releaseShiba } from "./shiba.js";

const LEVEL_FLOORS = [1, 10, 40, 100]; // contributions needed for steps l1 to l4
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const NOTE_BASE_HZ = 220;
const NOTE_STEP_HZ = 110;
const NOTE_MS = 50;
const KEY_STEPS = {
  ArrowLeft: -DAYS_PER_WEEK,
  ArrowRight: DAYS_PER_WEEK,
  ArrowUp: -1,
  ArrowDown: 1,
};

const grid = document.querySelector("[data-ledger-grid]");
const readout = document.querySelector("[data-ledger-read]");
const peakIndex = LEDGER_COUNTS.indexOf(Math.max(...LEDGER_COUNTS));
let selected = -1;

function dayLabel(index) {
  const date = new Date(Date.parse(LEDGER_START) + index * MS_PER_DAY);
  return new Intl.DateTimeFormat(locale(), { dateStyle: "full", timeZone: "UTC" }).format(date);
}

const format = (value) => new Intl.NumberFormat(locale()).format(value);
const level = (count) => LEVEL_FLOORS.filter((floor) => count >= floor).length;

function summary() {
  const total = format(LEDGER_COUNTS.reduce((sum, count) => sum + count, 0));
  const active = LEDGER_COUNTS.filter((count) => count > 0).length;
  const days = LEDGER_COUNTS.length;
  const peak = LEDGER_COUNTS[peakIndex];
  return t(
    `${total} contributions, public and private, since ${dayLabel(0)}. Active on ${active} of ${days} days. Busiest day, in rust: ${dayLabel(peakIndex)}, with ${peak}.`,
    `${total} contributions, publiques et privées, depuis le ${dayLabel(0)}. Actif ${active} jours sur ${days}. Jour le plus chargé, en rouille : ${dayLabel(peakIndex)}, avec ${peak}.`,
  );
}

function describe() {
  if (selected < 0) return summary();
  const count = LEDGER_COUNTS[selected];
  const noun = count === 1 ? "contribution" : "contributions";
  return t(`${dayLabel(selected)}: ${format(count)} ${noun}.`, `${dayLabel(selected)} : ${format(count)} ${noun}.`);
}

function select(index) {
  grid.children[selected]?.classList.remove("on");
  selected = index;
  grid.children[index]?.classList.add("on");
  readout.textContent = describe();
}

function press(index) {
  if (index < 0) return;
  pop(grid.children[index], 0.6);
  blip(NOTE_BASE_HZ + level(LEDGER_COUNTS[index]) * NOTE_STEP_HZ, NOTE_MS, "triangle");
  if (index === peakIndex) releaseShiba();
}

function onPointer(event) {
  const index = [...grid.children].indexOf(event.target);
  if (index >= 0 && index !== selected) select(index);
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

function render() {
  const cells = LEDGER_COUNTS.map((count, index) => {
    const cell = document.createElement("i");
    cell.className = index === peakIndex ? "peak" : `l${level(count)}`;
    cell.style.setProperty("--c", Math.floor(index / DAYS_PER_WEEK));
    return cell;
  });
  grid.replaceChildren(...cells);
  grid.addEventListener("pointermove", onPointer);
  grid.addEventListener("pointerdown", onPointer);
  grid.addEventListener("pointerleave", () => select(-1));
  grid.addEventListener("keydown", onKey);
  grid.addEventListener("blur", () => select(-1));
  document.addEventListener("langchange", () => select(selected));
  select(-1);
}

if (grid && readout) ready.then(render);
