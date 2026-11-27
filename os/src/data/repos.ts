// Repositories as the OS sees them. Public ones come from /assets/riviera/repos.json, which a GitHub
// Action refreshes from the GitHub API every day, so nothing here is invented. Private ones are listed
// by hand with the description from their GitHub page only: no source link, no stars, no dates.

export type Status = "active" | "maintained" | "archived" | "private";

export interface Repo {
  name: string;
  description: string;
  language: string | null;
  stars: number | null;
  pushed: string | null;
  created: string | null;
  topics: string[];
  homepage: string | null;
  url: string | null;
  category: string;
  featured: boolean;
  fork: boolean;
  archived: boolean;
  private: boolean;
}

export const CATEGORIES: Record<string, string> = {
  ai: "AI",
  devtools: "Developer tools",
  native: "Native and devices",
  infrastructure: "Infrastructure",
  security: "Security",
  gaming: "Gaming",
  web: "Web",
  experiments: "Experiments",
  private: "Private",
};

// Never listed anywhere on the OS.
const HIDDEN = new Set(["agent-mangaka-forge"]);

// Private repositories: descriptions as written on their GitHub pages (or a plain line when the page
// has none). They open as cards with a "private repository" badge and no link.
const PRIVATE: Array<Pick<Repo, "name" | "description" | "category">> = [
  { name: "OpenPro", description: "OpenPro product workspace: the French professional network with AI matching, where I am CTO and co-founder.", category: "private" },
  { name: "OpenNotes", description: "OpenNotes — the AI Pin software. Zero-friction voice client for OpenWhistle.", category: "private" },
  { name: "LeadsIt", description: "LeadsIt — AI-powered B2B lead generation from Google Maps (enrichment, CRM, credit packs). FR/EN.", category: "private" },
  { name: "SyncStart", description: "Private repository. Details on request.", category: "private" },
  { name: "OpenChat", description: "Private repository. Details on request.", category: "private" },
  { name: "polymarket-mm", description: "Private repository. Details on request.", category: "private" },
];

// Real screenshots and case studies already on the site, for the project windows.
export const VISUALS: Record<string, { shot?: string; caseStudy?: string }> = {
  OpenVision: { shot: "/assets/shots/openvision.webp" },
  OpenPlod: { shot: "/assets/shots/openplod-library.webp", caseStudy: "/work/openplod/" },
  Modelly: { shot: "/assets/shots/modelly.webp", caseStudy: "/work/modelly/" },
  Containust: { shot: "/assets/shots/containust.webp", caseStudy: "/work/containust/" },
  HackoogleMini: { shot: "/assets/shots/hackooglemini.webp" },
  "pelloux-guidelines": { shot: "/assets/shots/pelloux-guidelines.webp" },
  SmarttyTest: { shot: "/assets/shots/smarttytest.webp" },
  iadevlearn: { shot: "/assets/shots/iadevlearn.webp" },
};

const DAY_MS = 86_400_000;

export function statusOf(repo: Repo): Status {
  if (repo.private) return "private";
  if (repo.archived) return "archived";
  const days = repo.pushed ? (Date.now() - Date.parse(repo.pushed)) / DAY_MS : Infinity;
  return days < 90 ? "active" : "maintained";
}

export const STATUS_LABEL: Record<Status, string> = { active: "Active", maintained: "Maintained", archived: "Archived", private: "Private" };

// Flagships first, then by stars, then by the last push.
export function rank(a: Repo, b: Repo) {
  return Number(b.featured) - Number(a.featured) || (b.stars ?? -1) - (a.stars ?? -1) || (b.pushed ?? "").localeCompare(a.pushed ?? "");
}

interface CatalogFile {
  owner: string;
  featured: string[];
  repos: Array<Omit<Repo, "private"> & { description: string | null }>;
}

let cached: Promise<Repo[]> | null = null;

export function loadRepos(): Promise<Repo[]> {
  cached ??= fetch("/assets/riviera/repos.json")
    .then((response) => (response.ok ? (response.json() as Promise<CatalogFile>) : Promise.reject(new Error(String(response.status)))))
    .then((file) => file.repos.filter((repo) => !repo.fork && !HIDDEN.has(repo.name)).map((repo) => ({ ...repo, description: repo.description ?? "", private: false })))
    .catch(() => [] as Repo[])
    .then((publicRepos) => [...publicRepos, ...PRIVATE.map(privateRepo)].sort(rank));
  return cached;
}

function privateRepo(entry: (typeof PRIVATE)[number]): Repo {
  return { ...entry, language: null, stars: null, pushed: null, created: null, topics: [], homepage: null, url: null, featured: false, fork: false, archived: false, private: true };
}

export const GITHUB = "https://github.com/RemiPelloux";
