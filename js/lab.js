// Lab page: the shelf of public repositories and the commit rhythm.
import { LEDGER_START, LEDGER_COUNTS } from "./ledger-data.js";
import { locale, t } from "./i18n.js";

const DAY_MS = 86_400_000;
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const MIN_FOR_OWN_CHIP = 2;
let rhythmMode = "weekday";
let language = "";
let order = "pushed";

const number = (value) => new Intl.NumberFormat(locale()).format(value);
const dayAt = (index) => new Date(Date.parse(LEDGER_START) + index * DAY_MS);
const cards = () => [...document.querySelectorAll("[data-shelf] > li")];

function languageChips() {
  const counts = new Map();
  cards().forEach((card) => counts.set(card.dataset.language, (counts.get(card.dataset.language) ?? 0) + 1));
  const own = [...counts].filter(([, count]) => count >= MIN_FOR_OWN_CHIP).sort((a, b) => b[1] - a[1]);
  const rest = cards().length - own.reduce((sum, [, count]) => sum + count, 0);
  const list = [["", t("All", "Tout"), cards().length], ...own.map(([name, count]) => [name, name, count])];
  if (rest) list.push(["other", t("Other", "Autres"), rest]);
  return { list, named: new Set(own.map(([name]) => name)) };
}

function byOrder(a, b) {
  const stars = Number(b.dataset.starCount) - Number(a.dataset.starCount);
  return (order === "stars" && stars) || b.dataset.pushed.localeCompare(a.dataset.pushed);
}

function drawShelf() {
  const shelf = document.querySelector("[data-shelf]");
  if (!shelf) return;
  const { list, named } = languageChips();
  const filter = document.querySelector("[data-shelf-filter]");
  filter.hidden = false;
  filter.innerHTML = list
    .map(([key, label, count]) => `<button class="button" type="button" data-shelf-language="${key}" aria-pressed="${key === language}">${label} <span class="faint">${count}</span></button>`)
    .join("");
  document.querySelectorAll("[data-shelf-sort]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.shelfSort === order));
  });
  shelf.append(...cards().sort(byOrder));
  cards().forEach((card) => {
    const own = card.dataset.language;
    card.hidden = Boolean(language) && (language === "other" ? named.has(own) : own !== language);
  });
}

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

function onClick(event) {
  const button = event.target.closest("[data-rhythm], [data-shelf-language], [data-shelf-sort]");
  if (!button) return;
  if (button.dataset.rhythm) {
    rhythmMode = button.dataset.rhythm;
    drawRhythm();
    return;
  }
  if (button.dataset.shelfSort) order = button.dataset.shelfSort;
  else language = button.dataset.shelfLanguage;
  drawShelf();
}

export function mountLab() {
  language = "";
  drawShelf();
  drawRhythm();
}

document.addEventListener("click", onClick);
document.addEventListener("langchange", () => {
  drawShelf();
  drawRhythm();
});
