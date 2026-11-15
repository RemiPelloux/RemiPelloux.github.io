// Welcome screen on the home page, once per browser session: Immersive (the 3D Antibes at /riviera/)
// or Lite (this page). boot.js adds .welcome-open before first paint when it should show.
import { t } from "./i18n.js";

const root = document.documentElement;

function remember(choice) {
  try {
    sessionStorage.setItem("experience", choice);
    localStorage.setItem("experience", choice);
  } catch {
    /* private window: the choice holds for this page only */
  }
}

function last() {
  try {
    return localStorage.getItem("experience");
  } catch {
    return null;
  }
}

function webgl() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

// One card: its picture, title, line of text and small print. `card` is one entry of cards().
function option(card) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `welcome-option ${card.kind}`;
  button.dataset.choice = card.kind;
  button.innerHTML = `<img src="${card.picture}" width="960" height="540" alt=""><span class="welcome-copy"><b></b><span></span><small></small></span>`;
  button.querySelector("img").alt = card.alt;
  button.querySelector("b").textContent = card.title;
  button.querySelector(".welcome-copy > span").textContent = card.text;
  button.querySelector("small").textContent = card.meta;
  return button;
}

// RIVIERA.OS falls back to its 2D desktop without WebGL, so Immersive always works.
function cards(canFly) {
  const immersive = {
    kind: "immersive",
    title: t("Immersive", "Immersif"),
    text: t("Sit at my computer: RIVIERA.OS, with a terminal that works, my projects, a map of Antibes and a Shiba on the desk.", "Asseyez-vous à mon ordinateur : RIVIERA.OS, avec un vrai terminal, mes projets, une carte d'Antibes et un Shiba sur le bureau."),
    meta: canFly ? t("3D workstation, best on a computer", "Poste de travail en 3D, idéal sur ordinateur") : t("Opens as a 2D desktop in this browser", "S'ouvre en bureau 2D dans ce navigateur"),
    picture: "/assets/welcome/immersive.webp",
    alt: t("A retro computer on a desk at night, running RIVIERA.OS", "Un ordinateur rétro sur un bureau, la nuit, sous RIVIERA.OS"),
  };
  const lite = {
    kind: "lite",
    title: t("Lite", "Lite"),
    text: t("The portfolio as a page: projects, security work, the year in commits and the CV.", "Le portfolio en une page : projets, sécurité, l'année en commits et le CV."),
    meta: t("Fast, reads well on any phone", "Rapide, se lit bien sur tout téléphone"),
    picture: "/assets/welcome/lite.webp",
    alt: t("The portfolio home page", "La page d'accueil du portfolio"),
  };
  return [immersive, lite];
}

// The dialog's frame and its words; the two cards go into .welcome-options.
function shell() {
  const overlay = document.createElement("div");
  overlay.className = "welcome";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "welcome-title");
  overlay.innerHTML = `<div class="welcome-inner"><p class="welcome-kicker"></p><h1 id="welcome-title"></h1><p class="welcome-lede"></p><div class="welcome-options"></div><p class="welcome-foot"></p></div>`;
  overlay.querySelector(".welcome-kicker").textContent = "Rémi Pelloux";
  overlay.querySelector("h1").textContent = t("How would you like to visit?", "Comment voulez-vous visiter ?");
  overlay.querySelector(".welcome-lede").textContent = t("Same work, two ways in. You can switch at any time.", "Le même travail, deux entrées. Vous pourrez changer à tout moment.");
  overlay.querySelector(".welcome-foot").textContent = t("Press I or L. Escape opens Lite.", "Touche I ou L. Échap ouvre Lite.");
  return overlay;
}

function build(canFly) {
  const overlay = shell();
  const [immersive, lite] = cards(canFly).map(option);
  overlay.querySelector(".welcome-options").append(immersive, lite);
  const previous = last();
  const mark = previous === "immersive" ? immersive : previous === "lite" ? lite : null;
  if (mark) mark.classList.add("last");
  document.body.append(overlay);
  const phone = window.matchMedia("(max-width: 759px)").matches;
  return { overlay, immersive, lite, first: mark || (canFly && !phone ? immersive : lite) };
}

const FADE_MS = 320;

// Immersive leaves for RIVIERA.OS; Lite fades the dialog out and stays on the classic site.
function choices(view, resolve) {
  const fly = () => {
    remember("immersive");
    view.overlay.classList.add("leaving");
    window.location.href = "/riviera/";
  };
  const stay = () => {
    remember("lite");
    root.classList.remove("welcome-open");
    const fade = view.overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: "ease-out", fill: "both" });
    fade.finished.then(() => view.overlay.remove());
    resolve();
  };
  return { fly, stay };
}

// I and L pick, Escape is Lite, and Tab stays between the two cards.
function keys(view, choice) {
  return (event) => {
    const key = event.key.toLowerCase();
    if (key === "escape" || key === "l") choice.stay();
    else if (key === "i") choice.fly();
    else if (key !== "tab") return;
    else {
      event.preventDefault();
      (document.activeElement === view.immersive ? view.lite : view.immersive).focus();
    }
  };
}

export function welcome() {
  if (!root.classList.contains("welcome-open")) return Promise.resolve();
  const view = build(webgl());
  view.first.focus();
  return new Promise((resolve) => {
    const choice = choices(view, () => {
      window.removeEventListener("keydown", onKey);
      resolve();
    });
    const onKey = keys(view, choice);
    view.immersive.addEventListener("click", choice.fly);
    view.lite.addEventListener("click", choice.stay);
    window.addEventListener("keydown", onKey);
  });
}
