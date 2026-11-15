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

function option(kind, title, text, meta, picture, alt) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `welcome-option ${kind}`;
  button.dataset.choice = kind;
  button.innerHTML = `<img src="${picture}" width="960" height="540" alt=""><span class="welcome-copy"><b></b><span></span><small></small></span>`;
  button.querySelector("img").alt = alt;
  button.querySelector("b").textContent = title;
  button.querySelector(".welcome-copy > span").textContent = text;
  button.querySelector("small").textContent = meta;
  return button;
}

function build(canFly) {
  const overlay = document.createElement("div");
  overlay.className = "welcome";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "welcome-title");
  overlay.innerHTML = `<div class="welcome-inner"><p class="welcome-kicker"></p><h1 id="welcome-title"></h1><p class="welcome-lede"></p><div class="welcome-options"></div><p class="welcome-foot"></p></div>`;
  overlay.querySelector(".welcome-kicker").textContent = "Rémi Pelloux";
  overlay.querySelector("h1").textContent = t("How would you like to visit?", "Comment voulez-vous visiter ?");
  overlay.querySelector(".welcome-lede").textContent = t(
    "Same work, two ways in. You can switch at any time.",
    "Le même travail, deux entrées. Vous pourrez changer à tout moment.",
  );
  const immersive = option(
    "immersive",
    t("Immersive", "Immersif"),
    t("Sit at my computer: RIVIERA.OS, with a terminal that works, my projects, a map of Antibes and a Shiba on the desk.", "Asseyez-vous à mon ordinateur : RIVIERA.OS, avec un vrai terminal, mes projets, une carte d'Antibes et un Shiba sur le bureau."),
    canFly ? t("3D workstation, best on a computer", "Poste de travail en 3D, idéal sur ordinateur") : t("Opens as a 2D desktop in this browser", "S'ouvre en bureau 2D dans ce navigateur"),
    "/assets/welcome/immersive.webp",
    t("A retro computer on a desk at night, running RIVIERA.OS", "Un ordinateur rétro sur un bureau, la nuit, sous RIVIERA.OS"),
  );
  // RIVIERA.OS falls back to its 2D desktop without WebGL, so Immersive always works.
  const lite = option(
    "lite",
    t("Lite", "Lite"),
    t("The portfolio as a page: projects, security work, the year in commits and the CV.", "Le portfolio en une page : projets, sécurité, l'année en commits et le CV."),
    t("Fast, reads well on any phone", "Rapide, se lit bien sur tout téléphone"),
    "/assets/welcome/lite.webp",
    t("The portfolio home page", "La page d'accueil du portfolio"),
  );
  const options = overlay.querySelector(".welcome-options");
  options.append(immersive, lite);
  const previous = last();
  const mark = previous === "immersive" ? immersive : previous === "lite" ? lite : null;
  if (mark) mark.classList.add("last");
  overlay.querySelector(".welcome-foot").textContent = t("Press I or L. Escape opens Lite.", "Touche I ou L. Échap ouvre Lite.");
  document.body.append(overlay);
  const phone = window.matchMedia("(max-width: 759px)").matches;
  return { overlay, immersive, lite, first: mark || (canFly && !phone ? immersive : lite) };
}

export function welcome() {
  if (!root.classList.contains("welcome-open")) return Promise.resolve();
  const canFly = webgl();
  const { overlay, immersive, lite, first } = build(canFly);
  first.focus();
  return new Promise((resolve) => {
    function fly() {
      remember("immersive");
      overlay.classList.add("leaving");
      window.location.href = "/riviera/";
    }
    function stay() {
      remember("lite");
      window.removeEventListener("keydown", onKey);
      root.classList.remove("welcome-open");
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "both" });
      fade.finished.then(() => overlay.remove());
      resolve();
    }
    function onKey(event) {
      const key = event.key.toLowerCase();
      if (key === "escape" || key === "l") stay();
      else if (key === "i") fly();
      else if (key === "tab") {
        // Keep focus inside the dialog.
        const target = document.activeElement === immersive ? lite : immersive;
        event.preventDefault();
        target.focus();
      }
    }
    immersive.addEventListener("click", fly);
    lite.addEventListener("click", stay);
    window.addEventListener("keydown", onKey);
  });
}
