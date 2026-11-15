// Turns the world file's flat rings into three.js geometry.
// World coordinates: x east, y north, in metres. Three.js: x east, y up, z south (z = -north).
import * as THREE from "/vendor/three/three.module.min.js";

export const toVec2 = (flat) => {
  const points = [];
  for (let i = 0; i < flat.length; i += 2) points.push(new THREE.Vector2(flat[i] / 2, flat[i + 1] / 2));
  return points;
};

// Collects non-indexed triangles with texture coordinates; each triangle gets flat normals once built.
// style: { color, uvs (one [u, v] per corner), extra }.
export class Mesher {
  constructor() {
    this.positions = [];
    this.colors = [];
    this.uvs = [];
  }

  triangle(corners, style) {
    corners.forEach((corner, i) => {
      this.positions.push(corner[0], corner[1], corner[2]);
      this.colors.push(style.color.r, style.color.g, style.color.b);
      this.uvs.push(...(style.uvs?.[i] ?? [0, 0]));
    });
  }

  build() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(this.uvs, 2));
    geometry.computeVertexNormals();
    return geometry;
  }
}

const lift = (point, height) => [point.x, height, -point.y];
export const ROOF_TILE = 40; // metres of roof per texture repeat
export const WALL_TILE = 16; // metres of facade per texture repeat

function roof(mesher, rings, part) {
  const [outer, ...holes] = rings;
  const all = outer.concat(...holes);
  for (const face of THREE.ShapeUtils.triangulateShape(outer, holes)) {
    const corners = face.map((i) => all[i]);
    mesher.triangle(corners.map((p) => lift(p, part.top)), { color: part.color, uvs: corners.map((p) => [p.x / ROOF_TILE, p.y / ROOF_TILE]) });
  }
}

function walls(mesher, ring, part) {
  let along = 0;
  const v = (height) => (height - part.base) / WALL_TILE;
  for (let i = 0; i < ring.length; i += 1) {
    const [a, b] = [ring[i], ring[(i + 1) % ring.length]];
    const [u0, u1] = [along / WALL_TILE, (along + a.distanceTo(b)) / WALL_TILE];
    along += a.distanceTo(b);
    const quad = [lift(a, part.base), lift(b, part.base), lift(b, part.top), lift(a, part.top)];
    const uv = [[u0, 0], [u1, 0], [u1, v(part.top)], [u0, v(part.top)]];
    mesher.triangle([quad[0], quad[1], quad[2]], { color: part.wallColor, uvs: [uv[0], uv[1], uv[2]] });
    mesher.triangle([quad[0], quad[2], quad[3]], { color: part.wallColor, uvs: [uv[0], uv[2], uv[3]] });
  }
}

// part: { base, top, color, wallColor }. rings[0] is the outline, the rest are holes.
// target is one Mesher, or { roofs, walls } to keep roofs and walls apart for their own textures.
export function extrude(target, rings, part) {
  const [outer, ...holes] = rings;
  if (THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  for (const hole of holes) if (!THREE.ShapeUtils.isClockWise(hole)) hole.reverse();
  roof(target.roofs ?? target, rings, part);
  for (const ring of rings) walls(target.walls ?? target, ring, part);
}

export function lowestGround(points, heightAt) {
  let low = Infinity;
  for (const point of points) low = Math.min(low, heightAt(point.x, point.y));
  return low;
}

export function centroid(points) {
  const sum = points.reduce((acc, point) => acc.add(point), new THREE.Vector2());
  return sum.divideScalar(points.length);
}

export function inside(point, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [a, b] = [ring[i], ring[j]];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

// Small seeded random, so the pines and boats land in the same place on every visit.
export function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
