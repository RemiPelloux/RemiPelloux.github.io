/// <reference types="node" />
// The one fake: fetch() serves the real catalog file, as GitHub Pages would.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, vi } from "vitest";

// Tests run from os/, so the catalog is one folder up.
const CATALOG = readFileSync(resolve(process.cwd(), "../assets/riviera/repos.json"), "utf8");

vi.stubGlobal("fetch", async (url: string) =>
  url === "/assets/riviera/repos.json" ? new Response(CATALOG, { status: 200 }) : new Response("not found", { status: 404 }),
);

// Node 26 ships its own localStorage global, which shadows jsdom's and is undefined without a
// storage file. An in-memory Storage stands in for the browser's, for both storages.
class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }
}

for (const name of ["localStorage", "sessionStorage"]) Object.defineProperty(globalThis, name, { value: new MemoryStorage(), configurable: true });

beforeEach(() => (localStorage.clear(), sessionStorage.clear()));
