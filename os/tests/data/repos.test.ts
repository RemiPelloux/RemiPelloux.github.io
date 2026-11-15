import { describe, expect, it } from "vitest";
import { loadRepos, rank, statusOf, type Repo } from "@/data/repos";

describe("loadRepos", () => {
  it("ranks flagships first and never lists forks or hidden repositories", async () => {
    const repos = await loadRepos();
    const firstPlain = repos.findIndex((r) => !r.featured);
    expect(repos.slice(0, firstPlain).every((r) => r.featured)).toBe(true);
    expect(repos.some((r) => r.fork)).toBe(false);
    expect(repos.some((r) => r.name === "agent-mangaka-forge")).toBe(false);
  });
  it("gives private repositories no link, stars or dates", async () => {
    const privates = (await loadRepos()).filter((r) => r.private);
    expect(privates.map((r) => r.name).sort()).toEqual(["LeadsIt", "OpenChat", "OpenNotes", "OpenPro", "SyncStart", "polymarket-mm"]);
    expect(privates.every((r) => r.url === null && r.stars === null && r.pushed === null)).toBe(true);
  });
});

const base = { featured: false, stars: 0, pushed: "2020-01-01", private: false, archived: false } as Repo;

describe("statusOf", () => {
  it("calls a repository pushed this week active", () => {
    expect(statusOf({ ...base, pushed: new Date().toISOString().slice(0, 10) })).toBe("active");
  });
  it("puts private and archived first", () => {
    expect(statusOf({ ...base, private: true })).toBe("private");
    expect(statusOf({ ...base, archived: true })).toBe("archived");
    expect(statusOf(base)).toBe("maintained");
  });
});

describe("rank", () => {
  it("orders by flagship, then stars", () => {
    const list = [{ ...base, stars: 9 }, { ...base, featured: true, stars: 0 }, { ...base, stars: 40 }];
    expect(list.sort(rank).map((r) => [r.featured, r.stars])).toEqual([[true, 0], [false, 40], [false, 9]]);
  });
});
