import { countBy, loadCatalog } from "./catalog.js";

// Knows which chapter is on screen: marks it in the chapter list and tells the Shiba, once per chapter.
export function mountChapters() {
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const links = new Map([...document.querySelectorAll(".bar nav a")].map((a) => [a.getAttribute("href").slice(1), a]));
  let current = null;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.target.dataset.chapter === current) continue;
      current = entry.target.dataset.chapter;
      for (const [id, link] of links) link.toggleAttribute("aria-current", id === `ch-${current}`);
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
