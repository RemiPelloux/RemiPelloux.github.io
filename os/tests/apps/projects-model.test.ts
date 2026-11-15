import { describe, expect, it } from "vitest";
import { loadRepos } from "@/data/repos";
import { folderList, INITIAL, matches, SORTS } from "@/apps/projects/model";

describe("explorer filters", () => {
  it("finds a repository by a word of its description", async () => {
    const repos = await loadRepos();
    const hits = repos.filter((r) => matches(r, { ...INITIAL, query: "Plaud" }));
    expect(hits.map((r) => r.name)).toContain("OpenPlod");
  });
  it("shows only private projects in the Private folder", async () => {
    const repos = await loadRepos();
    expect(repos.filter((r) => matches(r, { ...INITIAL, folder: "private" })).every((r) => r.private)).toBe(true);
  });
  it("finds nothing for a word no repository has", async () => {
    const repos = await loadRepos();
    expect(repos.filter((r) => matches(r, { ...INITIAL, query: "zzqqxx" }))).toEqual([]);
  });
  it("counts every repository in All and drops empty folders", async () => {
    const repos = await loadRepos();
    const folders = folderList(repos);
    expect(folders[0]).toMatchObject({ id: "all", count: repos.length });
    expect(folders.every((f) => f.count > 0)).toBe(true);
  });
  it("sorts by stars with private projects last", async () => {
    const sorted = [...(await loadRepos())].sort(SORTS.stars.compare);
    expect(sorted[0].stars).toBeGreaterThanOrEqual(sorted[1].stars ?? 0);
    expect(sorted.at(-1)?.private).toBe(true);
  });
});
