// The repository catalog: loading, the eight districts, filtering and sorting. No three.js here,
// so Lite mode can use it too.

export const DISTRICTS = [
  { key: "ai", en: "AI", fr: "IA" },
  { key: "devtools", en: "Developer tools", fr: "Outils de développement" },
  { key: "native", en: "Native and devices", fr: "Natif et appareils" },
  { key: "infrastructure", en: "Infrastructure", fr: "Infrastructure" },
  { key: "security", en: "Security", fr: "Sécurité" },
  { key: "gaming", en: "Gaming", fr: "Jeu" },
  { key: "web", en: "Web", fr: "Web" },
  { key: "experiments", en: "Experiments", fr: "Expériences" },
];

let cached = null;

export async function loadCatalog() {
  cached ??= fetch("/assets/riviera/repos.json").then((response) => response.json());
  return cached;
}

const SORTS = {
  pushed: (a, b) => b.pushed.localeCompare(a.pushed),
  stars: (a, b) => b.stars - a.stars || b.pushed.localeCompare(a.pushed),
  name: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
};

function matches(repo, words) {
  const text = [repo.name, repo.description, repo.language || "", ...repo.topics].join(" ").toLowerCase();
  return words.every((word) => text.includes(word));
}

// view: { query, district, sort, forks }
export function select(repos, view) {
  const words = view.query.toLowerCase().split(/\s+/).filter(Boolean);
  return repos
    .filter((repo) => (view.forks || !repo.fork) && (view.district === "all" || repo.category === view.district))
    .filter((repo) => matches(repo, words))
    .sort(SORTS[view.sort] || SORTS.pushed);
}

export function countBy(repos, key) {
  const counts = new Map();
  for (const repo of repos) counts.set(repo[key], (counts.get(repo[key]) || 0) + 1);
  return counts;
}
