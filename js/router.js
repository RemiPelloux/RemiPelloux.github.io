// Client-side routing over real pages. Every route is also a plain HTML file,
// so a direct visit, a shared link and a browser without JavaScript all work.
import { adoptTitle, lang, setLang } from "./i18n.js";
import { blip, calm } from "./juice.js";

const ROUTES = ["/", "/cv/", "/wiki/"];
const LEAVE_MS = 120;
const ENTER_MS = 260;
const ENTER_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const NAV_HZ = 520;
const NAV_SOUND_MS = 40;
const wrap = document.querySelector(".wrap");
let afterSwap = () => {};
let current = null;

function routeOf(url) {
  if (url.origin !== window.location.origin) return null;
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  return ROUTES.includes(path) ? path : null;
}

async function fetchPage(route) {
  const response = await fetch(route, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${route}: ${response.status}`);
  return new DOMParser().parseFromString(await response.text(), "text/html");
}

function slide(frames, duration, easing = "ease-out") {
  if (calm()) return Promise.resolve();
  return wrap.animate(frames, { duration, easing }).finished;
}

async function swap(page) {
  await slide([{ opacity: 1 }, { opacity: 0, transform: "translateY(12px)" }], LEAVE_MS);
  wrap.innerHTML = page.querySelector(".wrap").innerHTML;
  document.body.dataset.page = page.body.dataset.page;
  adoptTitle(page.title);
  await setLang(lang());
  afterSwap();
}

function settle(hash) {
  const target = hash && document.querySelector(hash);
  if (target) target.scrollIntoView();
  else window.scrollTo(0, 0);
  blip(NAV_HZ, NAV_SOUND_MS, "triangle");
  slide([{ opacity: 0, transform: "translateY(-16px)" }, { opacity: 1, transform: "none" }], ENTER_MS, ENTER_EASE);
}

async function show(url, push) {
  let page;
  try {
    page = await fetchPage(routeOf(url));
  } catch {
    window.location.href = url.href; // fall back to a normal page load
    return;
  }
  if (push) window.history.pushState({}, "", url.href);
  current = routeOf(url);
  await swap(page);
  settle(url.hash);
}

function onClick(event) {
  const link = event.target.closest("a[href]");
  if (!link || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
  const url = new URL(link.href);
  const route = routeOf(url);
  if (!route || route === current) return;
  event.preventDefault();
  show(url, true);
}

export function startRouter(onSwap) {
  afterSwap = onSwap;
  current = routeOf(new URL(window.location.href));
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    if (routeOf(url) && routeOf(url) !== current) show(url, false);
  });
}
