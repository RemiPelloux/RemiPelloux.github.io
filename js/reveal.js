// Scroll behaviour: sections and rows reveal as they enter, labels decode,
// numbers count up, a bar shows progress.
import { locale } from "./i18n.js";
import { calm } from "./juice.js";

const VISIBLE_SHARE = 0.12;
const COUNT_MS = 1400;
const ROW_STAGGER_MS = 70;
const SCRAMBLE_STEP_MS = 34;
const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789<>/";
const ROWS = ".work > li, .table tbody tr, .practice > li, .points > li, .coast-legend > li, .qa > dt, .qa > dd, .job";
const progress = document.createElement("div");
let observer = null;
let queued = false;

const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));
const glyph = () => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

function countUp(element) {
  const target = Number(element.dataset.count);
  const format = new Intl.NumberFormat(locale());
  const start = performance.now();
  function tick(now) {
    const done = Math.min(1, (now - start) / COUNT_MS);
    element.textContent = format.format(Math.round(target * easeOutExpo(done)));
    if (done < 1 && element.isConnected) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// The label settles one letter at a time, left to right.
function scramble(element) {
  const final = element.textContent;
  let settled = 0;
  const timer = setInterval(() => {
    settled += 1;
    const rest = [...final.slice(settled)].map((character) => (character === " " ? " " : glyph())).join("");
    element.textContent = final.slice(0, settled) + rest;
    if (settled >= final.length || !element.isConnected) clearInterval(timer);
  }, SCRAMBLE_STEP_MS);
}

function enter(target, order) {
  target.style.transitionDelay = target.classList.contains("rise") ? `${order * ROW_STAGGER_MS}ms` : "";
  target.classList.add("in");
  target.querySelectorAll("[data-count]").forEach(countUp);
  target.querySelectorAll(":scope > h2 > span:last-child").forEach(scramble);
  observer.unobserve(target);
}

function onIntersect(entries) {
  entries.filter((entry) => entry.isIntersecting).forEach((entry, order) => enter(entry.target, order));
}

function showProgress() {
  queued = false;
  const range = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
}

function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(showProgress);
}

export function mountReveal() {
  if (calm()) return;
  observer?.disconnect();
  observer = new IntersectionObserver(onIntersect, { threshold: VISIBLE_SHARE });
  document.querySelectorAll(ROWS).forEach((row) => row.classList.add("rise"));
  document.querySelectorAll("[data-reveal], .rise").forEach((element) => observer.observe(element));
  showProgress();
}

if (!calm()) {
  document.documentElement.classList.add("motion");
  progress.className = "progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  window.addEventListener("scroll", onScroll, { passive: true });
}
