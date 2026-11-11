// Opening sequence, once per browser session: ink strips cover the page while the year's
// commit count runs up, then the strips fall away and the page starts.
// boot.js decides whether it runs and hides the page until this module takes over.
import { LEDGER_COUNTS } from "./ledger-data.js";
import { locale, t } from "./i18n.js";
import { blip, pause, shake } from "./juice.js";

const STRIPS = 8;
const COUNT_MS = 1100;
const HOLD_MS = 220;
const STRIP_MS = 520;
const STAGGER_MS = 45;
const LIFT_EASE = "cubic-bezier(0.7, 0, 0.2, 1)";
const END_TRAUMA = 0.45;
const END_HZ = 140;
const END_SOUND_MS = 180;
const root = document.documentElement;

const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));

function build() {
  const overlay = document.createElement("div");
  overlay.className = "intro";
  overlay.setAttribute("aria-hidden", "true");
  for (let i = 0; i < STRIPS; i += 1) overlay.append(document.createElement("i"));
  const panel = document.createElement("div");
  panel.innerHTML = "<b>0</b><span></span>";
  panel.lastChild.textContent = t("commits in the last 12 months", "commits sur les 12 derniers mois");
  overlay.append(panel);
  document.body.append(overlay);
  return { overlay, panel, number: panel.firstChild };
}

function count(number, total) {
  const format = new Intl.NumberFormat(locale());
  const start = performance.now();
  return new Promise((resolve) => {
    function tick(now) {
      const done = Math.min(1, (now - start) / COUNT_MS);
      number.textContent = format.format(Math.round(total * easeOutExpo(done)));
      if (done < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

function lift(overlay) {
  const runs = [...overlay.querySelectorAll("i")].map((strip, index) =>
    strip.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], {
      duration: STRIP_MS,
      delay: index * STAGGER_MS,
      easing: LIFT_EASE,
      fill: "both",
    }).finished,
  );
  return Promise.all(runs);
}

export async function playIntro() {
  if (!root.classList.contains("intro-running")) return;
  const { overlay, panel, number } = build();
  root.classList.add("intro-covered");
  await count(number, LEDGER_COUNTS.reduce((sum, value) => sum + value, 0));
  await pause(HOLD_MS);
  panel.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-24px)" }], { duration: 260, fill: "both" });
  root.classList.remove("intro-running", "intro-covered");
  document.dispatchEvent(new Event("introdone"));
  blip(END_HZ, END_SOUND_MS, "sawtooth");
  shake(END_TRAUMA);
  await lift(overlay);
  overlay.remove();
}
