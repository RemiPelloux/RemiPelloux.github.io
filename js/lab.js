// Lab page: commit rhythm, tide, tones, palette and the dog.
import { LEDGER_START, LEDGER_COUNTS } from "./ledger-data.js";
import { locale, t } from "./i18n.js";
import { feedback, tone } from "./juice.js";
import { releaseShiba } from "./shiba.js";
import { mountTide } from "./tide.js";

const DAY_MS = 86_400_000;
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const SWATCHES = ["--paper", "--paper-2", "--paper-3", "--rule", "--l1", "--l2", "--l3", "--ink-3", "--ink-2", "--ink", "--accent"];
const HEX = 16;
let rhythmMode = "weekday";

const number = (value) => new Intl.NumberFormat(locale()).format(value);
const dayAt = (index) => new Date(Date.parse(LEDGER_START) + index * DAY_MS);

function byWeekday() {
  const name = new Intl.DateTimeFormat(locale(), { weekday: "long", timeZone: "UTC" });
  const totals = new Map(MONDAY_FIRST.map((day) => [day, { label: "", value: 0 }]));
  LEDGER_COUNTS.forEach((count, index) => {
    const slot = totals.get(dayAt(index).getUTCDay());
    slot.label = name.format(dayAt(index));
    slot.value += count;
  });
  return [...totals.values()];
}

function byMonth() {
  const name = new Intl.DateTimeFormat(locale(), { month: "short", year: "2-digit", timeZone: "UTC" });
  const totals = new Map();
  LEDGER_COUNTS.forEach((count, index) => {
    const label = name.format(dayAt(index));
    totals.set(label, (totals.get(label) ?? 0) + count);
  });
  return [...totals].map(([label, value]) => ({ label, value }));
}

function drawRhythm() {
  const list = document.querySelector("[data-rhythm-bars]");
  if (!list) return;
  const rows = rhythmMode === "weekday" ? byWeekday() : byMonth();
  const max = Math.max(...rows.map((row) => row.value));
  const top = rows.find((row) => row.value === max);
  const low = rows.reduce((least, row) => (row.value < least.value ? row : least));
  list.style.setProperty("--max", max);
  list.innerHTML = rows
    .map((row, index) => `<li><span>${row.label}</span><span class="bar" style="--v:${row.value};--i:${index}"></span><span class="mono">${number(row.value)}</span></li>`)
    .join("");
  document.querySelector("[data-rhythm-read]").textContent = t(
    `Busiest: ${top.label}, with ${number(top.value)} contributions. Quietest: ${low.label}, with ${number(low.value)}.`,
    `Le plus chargé : ${top.label}, avec ${number(top.value)} contributions. Le plus calme : ${low.label}, avec ${number(low.value)}.`,
  );
  document.querySelectorAll("[data-rhythm]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.rhythm === rhythmMode));
  });
}

function toHex(color) {
  const parts = color.match(/\d+/g);
  if (!parts || color.startsWith("#")) return color.toUpperCase();
  return "#" + parts.slice(0, 3).map((part) => Number(part).toString(HEX).padStart(2, "0")).join("").toUpperCase();
}

function drawPalette() {
  const holder = document.querySelector("[data-palette]");
  if (!holder) return;
  const style = getComputedStyle(document.documentElement);
  holder.innerHTML = SWATCHES.map((token) => {
    const value = toHex(style.getPropertyValue(token).trim());
    return `<li><button type="button" data-copy="${value}" style="--swatch:var(${token})"><span class="chip"></span><span class="mono">${token.slice(2)}</span><span class="mono faint">${value}</span></button></li>`;
  }).join("");
}

async function copy(button) {
  const value = button.dataset.copy;
  const read = document.querySelector("[data-palette-read]");
  try {
    await navigator.clipboard.writeText(value);
    read.textContent = t(`Copied ${value}.`, `${value} copié.`);
  } catch {
    read.textContent = value;
  }
  feedback("small", button.querySelector(".chip"));
}

function play(button) {
  const [hz, ms, type] = button.dataset.tone.split(",");
  tone(Number(hz), Number(ms), type);
  feedback("small", button);
}

function onClick(event) {
  const button = event.target.closest("[data-rhythm], [data-copy], [data-tone], [data-dog]");
  if (!button) return;
  if (button.dataset.rhythm) {
    rhythmMode = button.dataset.rhythm;
    drawRhythm();
  } else if (button.dataset.copy) copy(button);
  else if (button.dataset.tone) play(button);
  else releaseShiba();
}

export function mountLab() {
  drawRhythm();
  drawPalette();
  mountTide();
}

document.addEventListener("click", onClick);
document.addEventListener("langchange", drawRhythm);
document.addEventListener("themechange", drawPalette);
