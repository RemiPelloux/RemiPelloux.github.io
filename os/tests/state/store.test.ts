import { beforeEach, describe, expect, it } from "vitest";
import { useOs } from "@/state/store";

const os = () => useOs.getState();

beforeEach(() => useOs.setState({ windows: [], focused: null, achievements: [], toast: null }));

describe("windows", () => {
  it("opens, focuses the newest and closes back to the one below", () => {
    const a = os().open("about");
    const b = os().open("contact");
    expect(os().focused).toBe(b);
    os().close(b);
    expect(os().focused).toBe(a);
  });
  it("focuses an open window instead of opening it twice", () => {
    const a = os().open("project", { props: { name: "OpenPlod" } });
    os().open("contact");
    expect(os().open("project", { props: { name: "OpenPlod" } })).toBe(a);
    expect(os().windows).toHaveLength(2);
  });
  it("hands focus on when the focused window is minimised", () => {
    const a = os().open("about");
    const b = os().open("contact");
    os().minimize(b);
    expect(os().focused).toBe(a);
  });
});

describe("achievements", () => {
  it("unlocks once, remembers it and shows a toast", () => {
    os().unlock("pi", "Achievement: Tinkerer");
    os().unlock("pi", "Achievement: Tinkerer");
    expect(os().achievements).toEqual(["pi"]);
    expect(JSON.parse(localStorage.getItem("riviera-os-achievements")!)).toEqual(["pi"]);
    expect(os().toast?.text).toBe("Achievement: Tinkerer");
  });
});
