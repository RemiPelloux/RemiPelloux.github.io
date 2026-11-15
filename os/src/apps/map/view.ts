// The chart's view: a centre in SVG metres and a zoom in pixels per metre. Pure functions, so the
// maths is tested without a browser.
import { SIZE } from "@/data/antibes";

export interface View {
  cx: number;
  cy: number;
  z: number;
}

export interface Size {
  w: number;
  h: number;
}

export const MAX_ZOOM = 2.5;
export const STEP = 1.4; // one press of + or −
export const PAN_PX = 80; // one arrow key press
const MIN_FIT = 0.8; // how far out past "whole chart" the visitor may zoom
const SCALES = [50, 100, 200, 250, 500, 1000, 2000];
const SCALE_PX = 110;

const fitZoom = ({ w, h }: Size) => Math.min(w / SIZE.width, h / SIZE.height);
const clampZoom = (z: number, size: Size) => Math.min(MAX_ZOOM, Math.max(fitZoom(size) * MIN_FIT, z));

export const homeView = (size: Size): View => ({ cx: SIZE.width / 2, cy: SIZE.height / 2, z: fitZoom(size) });

// Keeps the centre on the chart and the zoom between "whole map" and street level.
export function clampView(view: View, size: Size): View {
  return { z: clampZoom(view.z, size), cx: Math.min(SIZE.width, Math.max(0, view.cx)), cy: Math.min(SIZE.height, Math.max(0, view.cy)) };
}

// Zooms by `factor`, keeping the chart point under `at` (stage pixels) where it is.
export function zoomAround(view: View, factor: number, at: { x: number; y: number; size: Size }): View {
  const z = clampZoom(view.z * factor, at.size);
  const dx = at.x - at.size.w / 2;
  const dy = at.y - at.size.h / 2;
  return { z, cx: view.cx + dx / view.z - dx / z, cy: view.cy + dy / view.z - dy / z };
}

// The longest round distance that fits in about 110 pixels.
export function scaleBar(z: number) {
  const metres = [...SCALES].reverse().find((m) => m * z <= SCALE_PX) ?? SCALES[0];
  return { px: metres * z, label: metres >= 1000 ? `${metres / 1000} km` : `${metres} m` };
}

// Where a chart point lands on the stage, in pixels.
export function onStage(point: [number, number], view: View, size: Size) {
  return { left: (point[0] - view.cx) * view.z + size.w / 2, top: (point[1] - view.cy) * view.z + size.h / 2 };
}
