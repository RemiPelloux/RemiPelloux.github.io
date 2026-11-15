import { describe, expect, it } from "vitest";
import { SIZE } from "@/data/antibes";
import { clampView, homeView, MAX_ZOOM, onStage, scaleBar, zoomAround } from "@/apps/map/view";

const size = { w: 600, h: 400 };

describe("map view", () => {
  it("starts on the whole chart, centred", () => {
    const view = homeView(size);
    expect(view.cx).toBe(SIZE.width / 2);
    expect(onStage([view.cx, view.cy], view, size)).toEqual({ left: 300, top: 200 });
  });
  it("keeps the point under the cursor in place when zooming", () => {
    const view = homeView(size);
    const point: [number, number] = [view.cx + 100, view.cy - 50];
    const before = onStage(point, view, size);
    const after = onStage(point, zoomAround(view, 1.4, { x: before.left, y: before.top, size }), size);
    expect(after.left).toBeCloseTo(before.left);
    expect(after.top).toBeCloseTo(before.top);
  });
  it("never zooms past street level or pans off the chart", () => {
    const view = clampView({ cx: -5000, cy: SIZE.height * 3, z: 99 }, size);
    expect(view).toEqual({ cx: 0, cy: SIZE.height, z: MAX_ZOOM });
  });
  it("picks a round scale that fits", () => {
    expect(scaleBar(0.1).label).toBe("1 km");
    expect(scaleBar(1).label).toBe("100 m");
  });
});
