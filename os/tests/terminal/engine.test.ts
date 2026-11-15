import { describe, expect, it } from "vitest";
import { commonPrefix, complete, HOME, listing, parse, resolve } from "@/terminal/engine";
import "@/terminal/commands";

describe("parse", () => {
  it("splits words and keeps quoted strings together", () => {
    expect(parse(`echo "hello world" 'it is' x`)).toEqual(["echo", "hello world", "it is", "x"]);
  });
  it("gives nothing for a blank line", () => {
    expect(parse("   ")).toEqual([]);
  });
});

describe("resolve", () => {
  it("follows relative paths, ~ and ..", () => {
    expect(resolve(HOME, "projects")).toBe(`${HOME}/projects`);
    expect(resolve(`${HOME}/projects`, "..")).toBe(HOME);
    expect(resolve("/tmp", "~")).toBe(HOME);
  });
  it("never climbs above the root", () => {
    expect(resolve("/", "../../..")).toBe("/");
  });
});

describe("listing", () => {
  it("lists a folder per public and private repository", async () => {
    const projects = await listing(`${HOME}/projects`);
    expect(projects).toContain("OpenPlod/");
    expect(projects).toContain("OpenPro/");
  });
  it("gives a private repository no source file", async () => {
    expect(await listing(`${HOME}/projects/OpenPro`)).toEqual(["README.md"]);
    expect(await listing(`${HOME}/projects/OpenPlod`)).toEqual(["README.md", "source.url"]);
  });
  it("returns null for a folder that does not exist", async () => {
    expect(await listing(`${HOME}/nowhere`)).toBeNull();
  });
});

describe("complete", () => {
  it("completes command names", async () => {
    expect(await complete("hel", HOME)).toEqual(["help"]);
  });
  it("completes project names after open", async () => {
    expect(await complete("open OpenPl", HOME)).toEqual(["OpenPlod"]);
  });
  it("offers nothing for an unknown start", async () => {
    expect(await complete("zzzz", HOME)).toEqual([]);
  });
  it("finds the longest shared start", () => {
    expect(commonPrefix(["OpenPlod", "OpenPro"])).toBe("OpenP");
    expect(commonPrefix([])).toBe("");
  });
});
