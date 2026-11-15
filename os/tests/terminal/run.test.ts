import { beforeEach, describe, expect, it } from "vitest";
import { HOME, type Line } from "@/terminal/engine";
import { History } from "@/terminal/history";
import { execute, type Session } from "@/terminal/run";
import { useOs } from "@/state/store";
import "@/terminal/commands";
import "@/terminal/eggs";

function session(): Session & { out: Line[] } {
  const out: Line[] = [];
  const print: Session["print"] = (value) => (Array.isArray(value) ? value : [value]).forEach((v) => out.push(typeof v === "string" ? { text: v } : v));
  return { out, print, clear: () => (out.length = 0), cwd: HOME, setCwd: () => {}, history: new History(), windowId: "w0" };
}

const text = (s: { out: Line[] }) => s.out.map((l) => l.text).join("\n");

beforeEach(() => useOs.setState({ windows: [], focused: null, achievements: [] }));

describe("execute", () => {
  it("runs help and unlocks the first achievement", async () => {
    const s = session();
    await execute("help", s);
    expect(text(s)).toContain("open <app|project>");
    expect(useOs.getState().achievements).toContain("first-command");
  });
  it("reports an unknown command", async () => {
    const s = session();
    await execute("frobnicate", s);
    expect(s.out[0]).toMatchObject({ kind: "err", text: expect.stringContaining("command not found") });
  });
  it("opens a project window with open <name>", async () => {
    await execute("open GalaxyCrash", session());
    expect(useOs.getState().windows.map((w) => [w.app, w.props.name])).toEqual([["project", "GalaxyCrash"]]);
  });
  it("refuses to open something that does not exist", async () => {
    const s = session();
    await execute("open NotARealRepo", s);
    expect(s.out[0].kind).toBe("err");
    expect(useOs.getState().windows).toEqual([]);
  });
  it("brews coffee only with the right words", async () => {
    await execute("sudo make-me-a-coffee", session());
    expect(useOs.getState().achievements).toContain("coffee");
    await execute("sudo rm -rf /", session());
    expect(useOs.getState().achievements).toContain("sudo-fail");
  });
  it("records history without duplicates and ignores blank lines", async () => {
    const s = session();
    await execute("whoami", s);
    await execute("   ", s);
    await execute("whoami", s);
    expect(s.history.entries).toEqual(["whoami"]);
  });
});
