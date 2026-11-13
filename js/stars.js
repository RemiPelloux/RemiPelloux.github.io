// Live star counts and the latest public push, from the GitHub API, cached for an hour in the browser.
// The numbers written in the pages are the fallback when the API cannot be reached.
import { locale, store, t } from "./i18n.js";

const API = "https://api.github.com/users/RemiPelloux/repos?per_page=100&type=owner";
const CACHE_KEY = "github-repos";
const CACHE_MS = 3_600_000;
let data = null;
let pending = null;

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    return cached && Date.now() - cached.at < CACHE_MS ? cached : null;
  } catch {
    return null;
  }
}

async function load() {
  const cached = readCache();
  if (cached) return cached;
  const response = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
  const repos = await response.json();
  const own = repos.filter((repo) => !repo.fork);
  const fresh = {
    at: Date.now(),
    stars: Object.fromEntries(repos.map((repo) => [repo.name, repo.stargazers_count])),
    total: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    repos: own.length,
    latest: latestPush(own),
  };
  store(CACHE_KEY, JSON.stringify(fresh));
  return fresh;
}

function latestPush(repos) {
  const SELF = "RemiPelloux.github.io"; // this site: every deploy would win
  const [last] = repos.filter((repo) => repo.name !== SELF).sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
  return last ? { name: last.name, url: last.html_url, at: last.pushed_at } : null;
}

// "Latest public push: repo, date", under the introduction.
function showLatest() {
  const line = document.querySelector("[data-now]");
  if (!line || !data.latest) return;
  const date = new Intl.DateTimeFormat(locale(), { dateStyle: "long" }).format(new Date(data.latest.at));
  const link = document.createElement("a");
  link.href = data.latest.url;
  link.textContent = data.latest.name;
  line.replaceChildren(t("Latest public push: ", "Dernier push public : "), link, `, ${date}.`);
  line.hidden = false;
}

const format = (value) => new Intl.NumberFormat(locale()).format(value);

function phrase(count) {
  const noun = count === 1 ? t("star", "étoile") : t("stars", "étoiles");
  return `${format(count)} ${noun}`;
}

// data-count is what the count-up animation aims for, so it follows the live value.
function setCount(selector, value) {
  for (const element of document.querySelectorAll(selector)) {
    element.dataset.count = value;
    element.textContent = format(value);
  }
}

function apply() {
  for (const element of document.querySelectorAll("[data-stars]")) {
    const count = data.stars[element.dataset.stars];
    if (Number.isInteger(count)) element.textContent = phrase(count);
  }
  setCount("[data-stars-total]", data.total);
  setCount("[data-repos-total]", data.repos);
  showLatest();
}

export function mountStars() {
  if (data) return apply();
  pending ??= load()
    .then((loaded) => {
      data = loaded;
      apply();
    })
    .catch(() => {
      // Offline or rate limited: the written numbers stay.
    });
}

document.addEventListener("langchange", () => data && apply());
