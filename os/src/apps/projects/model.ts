// The explorer's model: filters, sorts and folders over the repositories. Pure, so it is tested alone.
import { CATEGORIES, rank, statusOf, type Repo, type Status } from "@/data/repos";

export type Sort = "ranked" | "stars" | "pushed" | "name";
export type View = "icons" | "details";

export interface Filters {
  folder: string; // "all", "flagships" or a category key ("private" included)
  query: string;
  language: string;
  status: Status | "";
  sort: Sort;
}

export const INITIAL: Filters = { folder: "all", query: "", language: "", status: "", sort: "ranked" };

export const SORTS: Record<Sort, { label: string; compare: (a: Repo, b: Repo) => number }> = {
  ranked: { label: "Ranked", compare: rank },
  stars: { label: "Stars", compare: (a, b) => (b.stars ?? -1) - (a.stars ?? -1) || rank(a, b) },
  pushed: { label: "Recently pushed", compare: (a, b) => (b.pushed ?? "").localeCompare(a.pushed ?? "") },
  name: { label: "Name", compare: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) },
};

export const STATUSES: Status[] = ["active", "maintained", "archived", "private"];

export function inFolder(repo: Repo, folder: string) {
  if (folder === "all") return true;
  if (folder === "flagships") return repo.featured;
  return repo.category === folder;
}

export function matches(repo: Repo, f: Filters) {
  const q = f.query.trim().toLowerCase();
  const text = `${repo.name} ${repo.description} ${repo.language ?? ""} ${repo.topics.join(" ")}`.toLowerCase();
  return inFolder(repo, f.folder) && (!q || text.includes(q)) && (!f.language || repo.language === f.language) && (!f.status || statusOf(repo) === f.status);
}

export function folderList(repos: Repo[]) {
  const keys = ["all", "flagships", ...Object.keys(CATEGORIES)];
  const label = (key: string) => (key === "all" ? "All projects" : key === "flagships" ? "Flagships" : CATEGORIES[key]);
  return keys.map((id) => ({ id, label: label(id), count: repos.filter((r) => inFolder(r, id)).length })).filter((f) => f.count > 0 || f.id === "all");
}

export type Folder = ReturnType<typeof folderList>[number];
