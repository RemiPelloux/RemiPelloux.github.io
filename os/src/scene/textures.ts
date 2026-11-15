// Small canvas-drawn textures for labels, stickers, book spines and the window view. Drawing them in
// 2D at load time costs a few milliseconds and no downloads; every canvas stays at 1024 px or less.
import * as THREE from "three";

export type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();

// One texture per key, drawn once: StrictMode mounts twice and the themes swap back and forth.
export function canvasTexture(key: string, w: number, h: number, paint: Paint) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  paint(ctx, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

export const FONT = `"Inter", "Helvetica Neue", Arial, sans-serif`;
export const MONO = `"JetBrains Mono", "Menlo", monospace`;

export function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// Text that shrinks until it fits the width it is given.
export function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, size: number, font = FONT, weight = 700) {
  let px = size;
  do {
    ctx.font = `${weight} ${px}px ${font}`;
    px -= 1;
  } while (ctx.measureText(text).width > max && px > 6);
  ctx.fillText(text, x, y);
}

// A book spine: a coloured cloth band, two gold rules, the title written sideways like a real shelf.
export function spine(title: string, cloth: string, ink: string) {
  return canvasTexture(`spine:${title}`, 512, 64, (ctx, w, h) => {
    ctx.fillStyle = cloth;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgb(255 255 255 / 0.08)";
    ctx.fillRect(0, 0, w, h * 0.35);
    ctx.fillStyle = "#d8b35a";
    ctx.fillRect(18, 8, 4, h - 16);
    ctx.fillRect(w - 22, 8, 4, h - 16);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fitText(ctx, title, w / 2, h / 2 + 2, w - 70, 34);
  });
}

// A flat label: background, text, optional border. Used by floppies, the sticky note, the badge.
export function label(key: string, w: number, h: number, paint: Paint) {
  return canvasTexture(`label:${key}`, w, h, paint);
}
