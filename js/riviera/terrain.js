// The land: a heightmap mesh painted with woods, beaches and the real road network as light.
import * as THREE from "/vendor/three/three.module.min.js";
import { LAND } from "./palette.js";

const TEXTURE_WIDTH = 2048;
const SEA_FLOOR = -8;
const ROAD_WIDTH = [0, 1.1, 1.7, 2.6]; // by road class, in texture pixels

function canvasFor(world) {
  const [minX, minY, maxX, maxY] = world.bounds;
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = Math.round((TEXTURE_WIDTH * (maxY - minY)) / (maxX - minX));
  const context = canvas.getContext("2d");
  const scale = canvas.width / (maxX - minX);
  context.setTransform(scale, 0, 0, -scale, -minX * scale, maxY * scale);
  return { canvas, context, scale };
}

function trace(context, flat, close = true) {
  context.moveTo(flat[0] / 2, flat[1] / 2);
  for (let i = 2; i < flat.length; i += 2) context.lineTo(flat[i] / 2, flat[i + 1] / 2);
  if (close) context.closePath();
}

function fill(context, rings, color) {
  context.fillStyle = color;
  for (const ring of rings) {
    context.beginPath();
    trace(context, ring);
    context.fill();
  }
}

const EDGE_FADE = 450; // metres over which the land fades into the night at the map's borders

// Darkens a band along each border, so the map's straight cut edges disappear into the night.
function fadeEdges(context, bounds, color) {
  const [minX, minY, maxX, maxY] = bounds;
  const bands = [[minX, 0, minX + EDGE_FADE, 0], [maxX, 0, maxX - EDGE_FADE, 0], [0, minY, 0, minY + EDGE_FADE], [0, maxY, 0, maxY - EDGE_FADE]];
  for (const [x0, y0, x1, y1] of bands) {
    const gradient = context.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgb(3 11 26 / 0)");
    context.fillStyle = gradient;
    context.fillRect(minX, minY, maxX - minX, maxY - minY);
  }
}

function paintLand(world) {
  const paint = canvasFor(world);
  const { context } = paint;
  context.fillStyle = LAND.ground;
  for (const land of world.land) {
    context.beginPath();
    trace(context, land.o);
    land.h.forEach((hole) => trace(context, hole));
    context.fill("evenodd");
  }
  fill(context, world.woods, LAND.wood);
  fill(context, world.beaches, LAND.beach);
  fadeEdges(context, world.bounds, "rgb(3 11 26)");
  return paint.canvas;
}

function paintRoads(world) {
  const paint = canvasFor(world);
  const { context, scale } = paint;
  context.fillStyle = "#000";
  context.fillRect(-1e5, -1e5, 2e5, 2e5);
  context.strokeStyle = LAND.road;
  context.lineCap = "round";
  for (const [kind, ...line] of world.roads) {
    context.globalAlpha = 0.35 + kind * 0.2;
    context.lineWidth = ROAD_WIDTH[kind] / scale;
    context.beginPath();
    trace(context, line, false);
    context.stroke();
  }
  context.globalAlpha = 1;
  fadeEdges(context, world.bounds, "rgb(0 0 0)");
  return paint.canvas;
}

// A blurred land mask: bright near the coast, so the sea turns turquoise in the shallows.
export function shoreMask(world) {
  const sharp = canvasFor(world);
  fill(sharp.context, world.land.map((land) => land.o), "#fff");
  const soft = document.createElement("canvas");
  [soft.width, soft.height] = [sharp.canvas.width / 2, sharp.canvas.height / 2];
  const context = soft.getContext("2d");
  context.fillStyle = "#000"; // opaque, so the blur fades the red channel instead of only the alpha
  context.fillRect(0, 0, soft.width, soft.height);
  context.filter = "blur(18px)";
  context.drawImage(sharp.canvas, 0, 0, soft.width, soft.height);
  return new THREE.CanvasTexture(soft);
}

function shapeGround(geometry, world) {
  const [columns] = world.grid;
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const height = world.heights[i] ? world.heightAt(position.getX(i), -position.getZ(i)) : SEA_FLOOR;
    position.setY(i, height);
  }
  geometry.computeVertexNormals();
  return columns;
}

export function makeTerrain(world) {
  const [minX, minY, maxX, maxY] = world.bounds;
  const [columns, rows] = world.grid;
  const geometry = new THREE.PlaneGeometry(maxX - minX, maxY - minY, columns - 1, rows - 1);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate((minX + maxX) / 2, 0, -(minY + maxY) / 2);
  shapeGround(geometry, world);
  const material = new THREE.MeshLambertMaterial({
    map: new THREE.CanvasTexture(paintLand(world)),
    emissiveMap: new THREE.CanvasTexture(paintRoads(world)),
    emissive: 0xffffff,
    emissiveIntensity: 0.85,
  });
  material.map.colorSpace = THREE.SRGBColorSpace;
  material.map.anisotropy = 4;
  return new THREE.Mesh(geometry, material);
}
