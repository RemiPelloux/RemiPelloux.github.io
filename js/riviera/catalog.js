// The repository catalog: loading, the eight districts, and the top ten. No three.js here,
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

// Only the ten best repositories stand in the world and in the list; the rest are one click away on GitHub.
export const TOP = 10;
export const GITHUB_REPOS = "https://github.com/RemiPelloux?tab=repositories";

// Flagships first, then the most stars, then the most recently pushed.
const rank = (a, b) => Number(b.featured) - Number(a.featured) || b.stars - a.stars || b.pushed.localeCompare(a.pushed);

let cached = null;

// { repos: the top ten, ranked; all: every public repository; total: how many are not forks }
export async function loadCatalog() {
  cached ??= fetch("/assets/riviera/repos.json")
    .then((response) => response.json())
    .then((data) => {
      const own = data.repos.filter((repo) => !repo.fork);
      return { ...data, all: data.repos, total: own.length, repos: [...own].sort(rank).slice(0, TOP) };
    });
  return cached;
}

export function countBy(repos, key) {
  const counts = new Map();
  for (const repo of repos) counts.set(repo[key], (counts.get(repo[key]) || 0) + 1);
  return counts;
}
