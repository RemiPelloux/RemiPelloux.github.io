// English lives in the HTML. French comes from js/fr/<page>.js, keyed by data-i18n.

const root = document.documentElement;
const page = document.body.dataset.page;
const english = new Map();
const englishTitle = document.title;

export const lang = () => root.lang || "en";
export const t = (en, fr) => (lang() === "fr" ? fr : en);
export const locale = () => t("en-GB", "fr-FR");

export function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is blocked in some private windows. The choice still holds for this visit.
  }
}

async function dictionary(code) {
  if (code !== "fr") return null;
  return (await import(`./fr/${page}.js`)).default;
}

export async function setLang(code) {
  const dict = await dictionary(code);
  for (const element of document.querySelectorAll("[data-i18n]")) {
    if (!english.has(element)) english.set(element, element.innerHTML);
    element.innerHTML = dict?.[element.dataset.i18n] ?? english.get(element);
  }
  document.title = dict?.title ?? englishTitle;
  root.lang = code;
  root.dataset.lang = code;
  store("lang", code);
  document.dispatchEvent(new Event("langchange"));
}

export const ready = setLang(root.dataset.lang === "fr" ? "fr" : "en");
