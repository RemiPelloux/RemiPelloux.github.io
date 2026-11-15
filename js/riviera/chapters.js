import { countBy, loadCatalog } from "./catalog.js";

// The chapter menu: a button that names the chapter on screen and opens the list of all eight.
// Picking one glides there (or jumps, when motion is reduced) and closes the menu.
function mountMenu(links, jumpLinks) {
  const button = document.querySelector("[data-menu-button]");
  const list = document.querySelector("[data-menu-list]");
  if (!button || !list) return () => {};
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const open = (yes) => {
    list.hidden = !yes;
    button.setAttribute("aria-expanded", String(yes));
    if (yes) (list.querySelector("[aria-current]") || list.querySelector("a")).focus();
  };
  button.addEventListener("click", () => open(list.hidden));
  document.addEventListener("click", (event) => !list.hidden && !event.target.closest("[data-menu]") && open(false));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !list.hidden) (open(false), button.focus());
  });
  for (const link of jumpLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      target.scrollIntoView({ behavior: still.matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
      open(false);
    });
  }
  const now = document.querySelector("[data-menu-now]");
  return (chapter) => {
    const name = links.get(`ch-${chapter}`)?.querySelector("span")?.textContent ?? "";
    now.textContent = `${chapter} ${name}`;
  };
}

// The left rail on large screens: a dot, the number and the name of each chapter, on a line that
// fills as the visitor goes. Built from the menu's own links, so the list lives in one place.
function mountRail(menuLinks) {
  const rail = document.querySelector("[data-rail]");
  if (!rail) return { links: [], fill: () => {} };
  rail.innerHTML = `<i class="rail-line"><i class="rail-fill" data-rail-fill></i></i><ol>${[...menuLinks].map((link) => {
    const number = link.querySelector("b").textContent;
    const name = link.querySelector("span");
    return `<li><a href="${link.getAttribute("href")}"><i class="dot"></i><b>${number}</b><span data-name="${name.dataset.i18n}">${name.textContent}</span></a></li>`;
  }).join("")}</ol>`;
  const fill = rail.querySelector("[data-rail-fill]");
  const links = [...rail.querySelectorAll("a")];
  return { links, fill: (index) => (fill.style.transform = `scaleY(${index / Math.max(1, links.length - 1)})`) };
}

// Knows which chapter is on screen: marks it in the menu and the rail, and tells the Shiba, once per chapter.
export function mountChapters() {
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const menuLinks = [...document.querySelectorAll(".bar nav a")];
  const rail = mountRail(menuLinks);
  const all = [...menuLinks, ...rail.links];
  const name = mountMenu(new Map(menuLinks.map((a) => [a.getAttribute("href").slice(1), a])), all);
  let current = "00";
  const mark = () => {
    for (const link of all) link.toggleAttribute("aria-current", link.getAttribute("href") === `#ch-${current}`);
    rail.fill(Number(current));
    name(current);
  };
  mark();
  document.addEventListener("riviera:lang", () => {
    for (const span of document.querySelectorAll("[data-rail] [data-name]")) span.textContent = document.querySelector(`.bar nav [data-i18n="${span.dataset.name}"]`).textContent;
    name(current);
  });
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.target.dataset.chapter === current) continue;
      current = entry.target.dataset.chapter;
      mark();
      document.dispatchEvent(new CustomEvent("riviera:chapter", { detail: { chapter: current } }));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  chapters.forEach((chapter) => observer.observe(chapter));
}

// Public repositories by language, from the catalog. Hovering or focusing one lights up its towers.
export async function mountLanguages(list) {
  if (!list) return;
  const { all: repos } = await loadCatalog();
  const counts = [...countBy(repos.filter((r) => !r.fork && r.language), "language")].sort((a, b) => b[1] - a[1]);
  list.innerHTML = counts.map(([language, n]) => `<li><button type="button" data-language="${language}">${language} <span>${n}</span></button></li>`).join("");
  const send = (language) => document.dispatchEvent(new CustomEvent("riviera:highlight", { detail: { language } }));
  const over = (event) => event.target.closest("[data-language]") && send(event.target.closest("[data-language]").dataset.language);
  list.addEventListener("pointerover", over);
  list.addEventListener("focusin", over);
  list.addEventListener("pointerleave", () => send(null));
  list.addEventListener("focusout", () => send(null));
}
