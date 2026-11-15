// Starts the 3D world and wires the switches. "Lite" is the classic portfolio at "/", so the Lite
// button, the L key, a browser without WebGL 2 and a failed start all go there. The still-image
// layout in this page is only what a visitor without JavaScript sees.
import { mountLanguage } from "./lang.js";
import { mountExplorer } from "./explorer.js";
import { mountPanel } from "./panel.js";
import { mountChapters, mountLanguages } from "./chapters.js";

const still = window.matchMedia("(prefers-reduced-motion: reduce)");

function webgl() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

// Lite is the classic portfolio at "/": the old still-image layout here is only a no-JavaScript fallback.
function toLite() {
  try {
    sessionStorage.setItem("experience", "lite");
    localStorage.setItem("experience", "lite");
  } catch {
    /* "/?lite" skips the welcome screen anyway */
  }
  window.location.href = "/?lite";
}

function show() {
  document.documentElement.dataset.mode = "immersive";
  for (const button of document.querySelectorAll("[data-mode-button]")) {
    button.setAttribute("aria-pressed", String(button.dataset.modeButton === "immersive"));
  }
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
    // ?still snaps the camera to each stop and hides the interface: used to render the stills.
    still: new URLSearchParams(window.location.search).has("still"),
  };
  if (page.still) document.documentElement.classList.add("still-shot");
  try {
    const { startImmersive } = await import("./immersive.js");
    await startImmersive(page);
    document.documentElement.classList.add("world-ready");
  } catch (error) {
    console.error(error);
    toLite();
  }
}

const flies = webgl();
if (!flies) toLite();
show();
for (const button of document.querySelectorAll('[data-mode-button="lite"]')) button.addEventListener("click", toLite);
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "l" && !event.target.closest("input, textarea")) toLite();
});
// Screenshots that are not loaded yet fade in when they arrive, instead of popping in.
for (const image of document.querySelectorAll(".shot img")) {
  if (image.complete) continue;
  image.decoding = "async";
  image.classList.add("fading");
  const show = () => image.classList.add("in");
  image.addEventListener("load", show, { once: true });
  image.addEventListener("error", show, { once: true });
}
mountLanguage().then(() => {
  mountExplorer();
  mountPanel();
  mountChapters();
  mountLanguages(document.querySelector("[data-languages]"));
});
if (flies) immerse();
