// Phone version: a tab bar at the bottom of the screen and long sections folded under their heading.
// Wider screens and browsers without JavaScript keep the plain page.
import { t } from "./i18n.js";

const phone = window.matchMedia("(max-width: 720px)");
const FOLDABLE = '[data-page="index"] .band:not(.gallery)';
const bar = document.createElement("nav");

function tabs() {
  return [
    ["/", t("Home", "Accueil")],
    ["/#work", t("Work", "Projets")],
    ["/lab/", t("Lab", "Labo")],
    ["/cv/", "CV"],
    ["https://www.linkedin.com/in/remipelloux/", "Contact"],
  ];
}

function drawBar() {
  const here = window.location.pathname;
  bar.className = "tabbar mono";
  bar.setAttribute("aria-label", t("Main", "Principal"));
  bar.innerHTML = tabs()
    .map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  if (!bar.isConnected) document.body.append(bar);
  document.documentElement.classList.add("has-tabbar");
}

function setFold(band, open) {
  band.classList.toggle("folded", !open);
  band.querySelector(":scope > h2").setAttribute("aria-expanded", String(open));
}

function fold(band) {
  const heading = band.querySelector(":scope > h2");
  heading.setAttribute("role", "button");
  heading.tabIndex = 0;
  setFold(band, false);
}

function unfold(band) {
  const heading = band.querySelector(":scope > h2");
  ["role", "tabindex", "aria-expanded"].forEach((name) => heading.removeAttribute(name));
  band.classList.remove("folded");
}

function openTarget() {
  const target = window.location.hash ? document.querySelector(window.location.hash) : null;
  const band = target?.closest(".band.folded");
  if (!band) return;
  setFold(band, true);
  target.scrollIntoView();
}

function onToggle(event) {
  const heading = event.target.closest('.band > h2[role="button"]');
  if (!heading) return;
  if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  setFold(heading.parentElement, heading.getAttribute("aria-expanded") !== "true");
}

export function mountMobile() {
  drawBar();
  document.querySelectorAll(FOLDABLE).forEach(phone.matches ? fold : unfold);
  if (phone.matches) openTarget();
}

document.addEventListener("click", onToggle);
document.addEventListener("keydown", onToggle);
document.addEventListener("langchange", drawBar);
window.addEventListener("hashchange", openTarget);
phone.addEventListener("change", mountMobile);
