// Archive page: filter the repository table by language.
import { t } from "./i18n.js";

const MIN_FOR_OWN_CHIP = 2;
let chosen = "";

const rows = () => [...document.querySelectorAll(".archive .table tbody tr")];
const languageOf = (row) => row.lastElementChild.textContent.trim();

function chips() {
  const counts = new Map();
  rows().forEach((row) => counts.set(languageOf(row), (counts.get(languageOf(row)) ?? 0) + 1));
  const own = [...counts].filter(([, count]) => count >= MIN_FOR_OWN_CHIP).sort((a, b) => b[1] - a[1]);
  const rest = rows().length - own.reduce((sum, [, count]) => sum + count, 0);
  const list = [["", t("All", "Tout"), rows().length], ...own.map(([name, count]) => [name, name, count])];
  if (rest) list.push(["other", t("Other", "Autres"), rest]);
  return { list, named: new Set(own.map(([name]) => name)) };
}

function apply() {
  const holder = document.querySelector("[data-filter]");
  if (!holder) return;
  const { list, named } = chips();
  holder.hidden = false;
  holder.innerHTML = list
    .map(([key, label, count]) => `<button class="button" type="button" data-language="${key}" aria-pressed="${key === chosen}">${label} <span class="faint">${count}</span></button>`)
    .join("");
  rows().forEach((row) => {
    const language = languageOf(row);
    row.hidden = Boolean(chosen) && (chosen === "other" ? named.has(language) : language !== chosen);
  });
}

export function mountArchive() {
  chosen = "";
  apply();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-language]");
  if (!button) return;
  chosen = button.dataset.language;
  apply();
});
document.addEventListener("langchange", apply);
