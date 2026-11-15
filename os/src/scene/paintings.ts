// Pictures painted once on a 2D canvas: the map of Antibes pinned on the wall (the real coastline, from
// antibesOutline.ts), the view through the window by day and by night, and the desk mat.
import type { Theme } from "../state/store";
import { BOUNDS, LAND, PLACES } from "./antibesOutline";
import { canvasTexture, FONT, MONO } from "./textures";

// Draws the coastline into a box; returns the projection so labels can be placed on it.
function coast(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }, fill: string, stroke: string) {
  const [minX, minY, maxX, maxY] = BOUNDS;
  const scale = Math.min(box.w / (maxX - minX), box.h / (maxY - minY));
  const at = (x: number, y: number): [number, number] => [box.x + (x - minX) * scale, box.y + (maxY - y) * scale];
  ctx.beginPath();
  for (const ring of LAND) {
    for (let i = 0; i < ring.length; i += 2) {
      const [px, py] = at(ring[i], ring[i + 1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  ctx.fillStyle = fill;
  ctx.fill("evenodd");
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  return at;
}

export function mapPoster() {
  return canvasTexture("map-poster", 600, 800, (ctx, w, h) => {
    ctx.fillStyle = "#e9dfc6";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#9cc0cf";
    ctx.fillRect(24, 96, w - 48, h - 120);
    const at = coast(ctx, { x: 24, y: 96, w: w - 48, h: h - 120 }, "#efe6cf", "#3e5a6b");
    ctx.fillStyle = "#2c2a26";
    ctx.font = `800 52px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("ANTIBES", w / 2, 70);
    ctx.font = `600 20px ${FONT}`;
    ctx.textAlign = "left";
    for (const place of PLACES) {
      const [px, py] = at(place.at[0], place.at[1]);
      ctx.fillStyle = "#c0392b";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2c2a26";
      ctx.fillText(place.name, Math.min(px + 9, w - 170), py + 6);
    }
    ctx.strokeStyle = "#5b4a35";
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 96, w - 48, h - 120);
  });
}

// The old town over the sea: ramparts, the Château Grimaldi's tower and the cathedral's bell tower.
function skyline(ctx: CanvasRenderingContext2D, w: number, h: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  const steps = [0.05, 0.12, 0.2, 0.28, 0.36, 0.46, 0.55, 0.62, 0.7, 0.78, 0.86, 0.94, 1];
  steps.forEach((t, i) => ctx.lineTo(w * t, h * (0.64 - (i % 3) * 0.025)));
  ctx.lineTo(w, h * 0.72);
  ctx.fill();
  ctx.fillRect(w * 0.42, h * 0.5, w * 0.06, h * 0.2);
  ctx.fillRect(w * 0.6, h * 0.53, w * 0.04, h * 0.17);
}

function lights(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#ffd27a";
  for (let i = 0; i < 70; i += 1) {
    const x = ((i * 97) % 100) / 100;
    const y = 0.58 + (((i * 53) % 11) / 11) * 0.12;
    ctx.fillRect(w * x, h * y, 3, 3);
  }
}

export function windowView(theme: Theme) {
  return canvasTexture(`window-${theme}`, 512, 640, (ctx, w, h) => {
    const night = theme === "night";
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, night ? "#141038" : "#5fa6e8");
    sky.addColorStop(1, night ? "#6b3f7a" : "#ffe1b0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = night ? "#f4f1e6" : "#fff6dc";
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.2, night ? 22 : 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = night ? "#0f1838" : "#1f6fb5";
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    skyline(ctx, w, h, night ? "#1c1530" : "#c9a77e");
    if (night) lights(ctx, w, h);
  });
}

export function deskMat() {
  return canvasTexture("desk-mat", 1024, 410, (ctx, w, h) => {
    ctx.fillStyle = "#231b38";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.28;
    coast(ctx, { x: w * 0.55, y: -h * 0.25, w: w * 0.5, h: h * 1.5 }, "#3a2f5c", "#8f7bff");
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#8f7bff";
    ctx.font = `700 28px ${MONO}`;
    ctx.fillText("ANTIBES", 36, h - 32);
    ctx.strokeStyle = "rgb(143 123 255 / 0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
  });
}
