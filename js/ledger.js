// Draws the contribution ledger and reports the day under the pointer or the arrow keys.
import { LEDGER_START, LEDGER_COUNTS } from "./ledger-data.js";

const LEVEL_FLOORS = [1, 10, 40, 100]; // contributions needed for steps l1 to l4
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const KEY_STEPS = {
  ArrowLeft: -DAYS_PER_WEEK,
  ArrowRight: DAYS_PER_WEEK,
  ArrowUp: -1,
  ArrowDown: 1,
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const numberFormat = new Intl.NumberFormat("en-GB");

const grid = document.querySelector("[data-ledger-grid]");
const readout = document.querySelector("[data-ledger-read]");
const peakIndex = LEDGER_COUNTS.indexOf(Math.max(...LEDGER_COUNTS));
let selected = -1;

function dayLabel(index) {
  const date = new Date(Date.parse(LEDGER_START) + index * MS_PER_DAY);
  return dateFormat.format(date);
}

function levelClass(count, index) {
  if (index === peakIndex) return "peak";
  const level = LEVEL_FLOORS.filter((floor) => count >= floor).length;
  return level ? `l${level}` : "";
}

function summary() {
  const total = LEDGER_COUNTS.reduce((sum, count) => sum + count, 0);
  const active = LEDGER_COUNTS.filter((count) => count > 0).length;
  return (
    `${numberFormat.format(total)} contributions, public and private, since ${dayLabel(0)}. ` +
    `Active on ${active} of ${LEDGER_COUNTS.length} days. ` +
    `Busiest day, in rust: ${dayLabel(peakIndex)}, with ${LEDGER_COUNTS[peakIndex]}.`
  );
}

function select(index) {
  grid.children[selected]?.classList.remove("on");
  selected = index;
  if (index < 0) {
    readout.textContent = summary();
    return;
  }
  grid.children[index].classList.add("on");
  const count = LEDGER_COUNTS[index];
  const noun = count === 1 ? "contribution" : "contributions";
  readout.textContent = `${dayLabel(index)}: ${numberFormat.format(count)} ${noun}.`;
}

function onPointer(event) {
  const index = [...grid.children].indexOf(event.target);
  if (index >= 0 && index !== selected) select(index);
}

function onKey(event) {
  const step = KEY_STEPS[event.key];
  if (step === undefined) return;
  event.preventDefault();
  const from = selected < 0 ? peakIndex : selected;
  const last = LEDGER_COUNTS.length - 1;
  select(Math.min(last, Math.max(0, from + step)));
}

function render() {
  const cells = LEDGER_COUNTS.map((count, index) => {
    const cell = document.createElement("i");
    cell.className = levelClass(count, index);
    return cell;
  });
  grid.replaceChildren(...cells);
  grid.addEventListener("pointermove", onPointer);
  grid.addEventListener("pointerdown", onPointer);
  grid.addEventListener("pointerleave", () => select(-1));
  grid.addEventListener("keydown", onKey);
  grid.addEventListener("blur", () => select(-1));
  select(-1);
}

if (grid && readout) render();
