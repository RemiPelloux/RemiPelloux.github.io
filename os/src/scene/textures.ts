// Small canvas-drawn textures for labels, stickers, book spines and the window view. Drawing them in
// 2D at load time costs a few milliseconds and no downloads; every canvas stays at 1024 px or less.
import * as THREE from "three";

export type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();

// A texture's cache key and pixel size.
export interface Canvas {
  key: string;
  w: number;
  h: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

// One texture per key, drawn once: StrictMode mounts twice and the themes swap back and forth.
export function canvasTexture({ key, w, h }: Canvas, paint: Paint) {
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

export function rounded(ctx: CanvasRenderingContext2D, { x, y, w, h }: Box, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

// Text that shrinks until it fits the width it is given.
export interface TextFit {
  x: number;
  y: number;
  max: number; // widest the text may be, in pixels
  size: number; // starting font size, in pixels
  font?: string;
  weight?: number;
}

export function fitText(ctx: CanvasRenderingContext2D, text: string, { x, y, max, size, font = FONT, weight = 700 }: TextFit) {
  let px = size;
  do {
    ctx.font = `${weight} ${px}px ${font}`;
    px -= 1;
  } while (ctx.measureText(text).width > max && px > 6);
  ctx.fillText(text, x, y);
}

// A book spine: a coloured cloth band, two gold rules, the title written sideways like a real shelf.
export function spine(title: string, cloth: string, ink: string) {
  return canvasTexture({ key: `spine:${title}`, w: 512, h: 64 }, (ctx, w, h) => {
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
    fitText(ctx, title, { x: w / 2, y: h / 2 + 2, max: w - 70, size: 34 });
  });
}

// A flat label: background, text, optional border. Used by floppies, the sticky note, the badge.
export function label(canvas: Canvas, paint: Paint) {
  return canvasTexture({ ...canvas, key: `label:${canvas.key}` }, paint);
}
