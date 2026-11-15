// English lives in the HTML; French comes from fr.js, keyed by data-i18n. The choice is shared
// with the rest of the portfolio through the same "lang" key.
const KEY = "lang";
const root = document.documentElement;
const english = new Map();
let englishHead = null;

export const lang = () => (root.lang === "fr" ? "fr" : "en");
export const t = (en, fr) => (lang() === "fr" ? fr : en);

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function remember(code) {
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* private window: the choice lasts for this visit */
  }
}

function head() {
  const description = document.querySelector('meta[name="description"]');
  englishHead ??= { title: document.title, description: description.content };
  return description;
}

async function swap(code) {
  const description = head();
  const dictionary = code === "fr" ? (await import("./fr.js")).FR : null;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    if (!english.has(element)) english.set(element, element.innerHTML);
    element.innerHTML = dictionary?.[element.dataset.i18n] ?? english.get(element);
  }
  document.title = dictionary?.title ?? englishHead.title;
  description.content = dictionary?.description ?? englishHead.description;
}

export async function setLanguage(code) {
  await swap(code);
  root.lang = code;
  for (const button of document.querySelectorAll("[data-lang-button]")) button.setAttribute("aria-pressed", String(button.dataset.langButton === code));
  document.dispatchEvent(new CustomEvent("riviera:lang", { detail: { lang: code } }));
}

export function mountLanguage() {
  for (const button of document.querySelectorAll("[data-lang-button]")) {
    button.addEventListener("click", () => {
      remember(button.dataset.langButton);
      setLanguage(button.dataset.langButton);
    });
  }
  return setLanguage(stored() === "fr" ? "fr" : "en");
}
