// Theme switch and the local time in Nice.

const THEME_KEY = "theme";
const CLOCK_INTERVAL_MS = 30_000;
const root = document.documentElement;
const themeButton = document.querySelector("[data-theme-switch]");
const clock = document.querySelector("[data-clock]");
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

function otherTheme() {
  return root.dataset.theme === "dark" ? "light" : "dark";
}

function labelThemeButton() {
  themeButton.textContent = `Switch to ${otherTheme()} paper`;
}

function switchTheme() {
  root.dataset.theme = otherTheme();
  try {
    localStorage.setItem(THEME_KEY, root.dataset.theme);
  } catch {
    // Storage is blocked in some private windows. The switch still works for this visit.
  }
  labelThemeButton();
  document.dispatchEvent(new Event("themechange"));
}

function showTime() {
  clock.textContent = `${timeFormat.format(new Date())} in Nice`;
}

if (themeButton) {
  labelThemeButton();
  themeButton.addEventListener("click", switchTheme);
}

if (clock) {
  showTime();
  setInterval(showTime, CLOCK_INTERVAL_MS);
}
