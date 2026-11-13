// Client-side routing over real pages. Every route is also a plain HTML file,
// so a direct visit, a shared link and a browser without JavaScript all work.
import { adoptTitle, lang, setLang } from "./i18n.js";
import { blip } from "./juice.js";
import { tideOver } from "./wipe.js";

const ROUTES = ["/", "/cv/", "/wiki/", "/work/", "/lab/", "/toolbox/", "/security/", "/work/openplod/", "/work/containust/", "/work/modelly/"];
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

async function swap(page) {
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
  await tideOver(async () => {
    await swap(page);
    settle(url.hash);
  });
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
