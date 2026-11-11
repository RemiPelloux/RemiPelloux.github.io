// Top bar: language, theme and sound switches, and the local time in Nice.
import { lang, locale, ready, setLang, store, t } from "./i18n.js";
import { feedback, soundOn } from "./juice.js";
import { wipe } from "./wipe.js";

const THEMES = ["light", "dark", "terminal"];
const THEME_NAMES = {
  light: ["Paper", "Papier"],
  dark: ["Ink", "Encre"],
  terminal: ["Terminal", "Terminal"],
};
const CLOCK_INTERVAL_MS = 30_000;
const root = document.documentElement;
const langButton = document.querySelector("[data-lang-switch]");
const themeButton = document.querySelector("[data-theme-switch]");
const soundButton = document.querySelector("[data-sound-switch]");
const clock = document.querySelector("[data-clock]");
let busy = false;

function label() {
  if (langButton) langButton.textContent = t("Français", "English");
  if (themeButton) themeButton.textContent = t("Theme: ", "Thème : ") + t(...THEME_NAMES[root.dataset.theme]);
  if (soundButton) soundButton.textContent = t("Sound: ", "Son : ") + (soundOn() ? "on" : "off");
  if (clock) showTime();
}

async function switchLang() {
  if (busy) return;
  busy = true;
  const next = lang() === "fr" ? "en" : "fr";
  await wipe(next.toUpperCase(), () => setLang(next));
  busy = false;
}

function switchTheme() {
  const index = THEMES.indexOf(root.dataset.theme);
  root.dataset.theme = THEMES[(index + 1) % THEMES.length];
  store("theme", root.dataset.theme);
  label();
  feedback("medium", themeButton);
  document.dispatchEvent(new Event("themechange"));
}

function switchSound() {
  store("sound", soundOn() ? "off" : "on");
  label();
  feedback("small", soundButton);
}

function showTime() {
  const time = new Intl.DateTimeFormat(locale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date());
  clock.textContent = t(`${time} in Nice`, `${time} à Nice`);
}

langButton?.addEventListener("click", switchLang);
themeButton?.addEventListener("click", switchTheme);
soundButton?.addEventListener("click", switchSound);
document.addEventListener("langchange", label);
if (clock) setInterval(showTime, CLOCK_INTERVAL_MS);
ready.then(label);
