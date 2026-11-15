// Picks Immersive or Lite and wires the switches. Lite never downloads three.js or the world data;
// the language, the repository explorer and the chapter list work the same in both.
import { mountLanguage } from "./lang.js";
import { mountExplorer } from "./explorer.js";
import { mountPanel } from "./panel.js";
import { mountChapters, mountLanguages } from "./chapters.js";

const KEY = "riviera-mode";
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function remember(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* private window: the choice lasts until the page reloads */
  }
}

function webgl() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function chooseMode() {
  if (!webgl()) return "lite";
  return stored() || (still.matches || navigator.connection?.saveData ? "lite" : "immersive");
}

function show(mode) {
  document.documentElement.dataset.mode = mode;
  for (const button of document.querySelectorAll("[data-mode-button]")) {
    button.setAttribute("aria-pressed", String(button.dataset.modeButton === mode));
  }
}

function switchTo(mode) {
  if (mode === document.documentElement.dataset.mode) return;
  remember(mode);
  window.location.reload();
}

async function immerse() {
  const page = {
    canvas: document.querySelector("[data-world]"),
    sections: [...document.querySelectorAll("[data-stop]")],
    labels: document.querySelector("[data-labels]"),
    cards: [...document.querySelectorAll(".card")],
    companion: document.querySelector("[data-companion]"),
    boot: document.querySelector("[data-boot]"),
    calm: still.matches,
    // ?still snaps the camera to each stop and hides the interface: used to render the Lite images.
    still: new URLSearchParams(window.location.search).has("still"),
  };
  if (page.still) document.documentElement.classList.add("still-shot");
  try {
    const { startImmersive } = await import("./immersive.js");
    await startImmersive(page);
    document.documentElement.classList.add("world-ready");
  } catch (error) {
    console.error(error);
    show("lite");
  }
}

const mode = chooseMode();
show(mode);
for (const button of document.querySelectorAll("[data-mode-button]")) {
  button.addEventListener("click", () => switchTo(button.dataset.modeButton));
}
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "l" && !event.target.closest("input, textarea")) switchTo(mode === "lite" ? "immersive" : "lite");
});
mountLanguage().then(() => {
  mountExplorer();
  mountPanel();
  mountChapters();
  mountLanguages(document.querySelector("[data-languages]"));
});
if (mode === "immersive") immerse();
