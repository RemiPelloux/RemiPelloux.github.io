// Scroll behaviour: sections reveal as they enter, numbers count up, a bar shows progress.
import { locale } from "./i18n.js";
import { calm } from "./juice.js";

const VISIBLE_SHARE = 0.12;
const COUNT_MS = 1400;
const progress = document.createElement("div");
let observer = null;
let queued = false;

const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));

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

function onIntersect(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("in");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    observer.unobserve(entry.target);
  }
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
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
  showProgress();
}

if (!calm()) {
  document.documentElement.classList.add("motion");
  progress.className = "progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  window.addEventListener("scroll", onScroll, { passive: true });
}
