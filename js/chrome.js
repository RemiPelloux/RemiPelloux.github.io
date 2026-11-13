// Top bar: language, theme and sound switches, and the local time in Nice.
// Clicks are delegated, so the switches keep working after a route change.
import { lang, locale, setLang, store, t } from "./i18n.js";
import { calm, feedback, soundOn } from "./juice.js";
import { wipe } from "./wipe.js";

const THEMES = ["light", "azur"];
const THEME_NAMES = {
  light: ["Paper", "Papier"],
  azur: ["Azur", "Azur"],
};
const CLOCK_INTERVAL_MS = 30_000;
const root = document.documentElement;
const find = (name) => document.querySelector(`[data-${name}]`);
let busy = false;

function clockText() {
  const time = new Intl.DateTimeFormat(locale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date());
  return t(`${time} in Nice`, `${time} à Nice`);
}

function setText(name, text) {
  const element = find(name);
  if (element) element.textContent = text;
}

export function mountChrome() {
  const group = find("lang-group");
  group?.setAttribute("aria-label", t("Language", "Langue"));
  for (const button of group?.querySelectorAll("[data-lang-set]") ?? []) {
    button.setAttribute("aria-pressed", String(button.dataset.langSet === lang()));
  }
  setText("theme-switch", t("Theme: ", "Thème : ") + t(...THEME_NAMES[root.dataset.theme]));
  setText("sound-switch", t("Sound: ", "Son : ") + (soundOn() ? "on" : "off"));
  setText("clock", clockText());
}

// The thumb slides at once, then the page follows behind the wipe.
async function switchLang(button) {
  const next = button.dataset.langSet;
  if (busy || next === lang()) return;
  busy = true;
  root.dataset.lang = next;
  feedback("small", button);
  await wipe(next.toUpperCase(), () => setLang(next));
  busy = false;
}

function applyNextTheme() {
  const index = THEMES.indexOf(root.dataset.theme);
  root.dataset.theme = THEMES[(index + 1) % THEMES.length];
  store("theme", root.dataset.theme);
  mountChrome();
  document.dispatchEvent(new Event("themechange"));
}

// The new theme grows out of the button as a circle, where the browser supports it.
function switchTheme(button) {
  const box = button.getBoundingClientRect();
  root.style.setProperty("--reveal-x", `${box.left + box.width / 2}px`);
  root.style.setProperty("--reveal-y", `${box.top + box.height / 2}px`);
  if (document.startViewTransition && !calm()) document.startViewTransition(applyNextTheme);
  else applyNextTheme();
  feedback("small", button);
}

function switchSound(button) {
  store("sound", soundOn() ? "off" : "on");
  mountChrome();
  feedback("small", button);
}

function onClick(event) {
  const button = event.target.closest("button");
  if (!button) return;
  if ("langSet" in button.dataset) switchLang(button);
  if ("themeSwitch" in button.dataset) switchTheme(button);
  if ("soundSwitch" in button.dataset) switchSound(button);
}

document.addEventListener("click", onClick);
document.addEventListener("langchange", mountChrome);
setInterval(() => setText("clock", clockText()), CLOCK_INTERVAL_MS);
