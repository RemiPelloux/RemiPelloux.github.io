import { countBy, loadCatalog } from "./catalog.js";

// The chapter menu: a button that names the chapter on screen and opens the list of all eight.
// Picking one glides there (or jumps, when motion is reduced) and closes the menu.
function mountMenu(links) {
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
  for (const link of links.values()) {
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

// Knows which chapter is on screen: marks it in the chapter menu and tells the Shiba, once per chapter.
export function mountChapters() {
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const links = new Map([...document.querySelectorAll(".bar nav a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const name = mountMenu(links);
  let current = "00";
  name(current);
  document.addEventListener("riviera:lang", () => name(current));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.target.dataset.chapter === current) continue;
      current = entry.target.dataset.chapter;
      for (const [id, link] of links) link.toggleAttribute("aria-current", id === `ch-${current}`);
      name(current);
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
