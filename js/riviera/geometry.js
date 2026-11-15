// Turns the world file's flat rings into three.js geometry.
// World coordinates: x east, y north, in metres. Three.js: x east, y up, z south (z = -north).
import * as THREE from "/vendor/three/three.module.min.js";

export const toVec2 = (flat) => {
  const points = [];
  for (let i = 0; i < flat.length; i += 2) points.push(new THREE.Vector2(flat[i] / 2, flat[i + 1] / 2));
  return points;
};

// Collects non-indexed triangles; each triangle gets flat normals once the geometry is built.
export class Mesher {
  constructor() {
    this.positions = [];
    this.colors = [];
    this.extra = [];
  }

  vertex(point, color, extra = 0) {
    this.positions.push(point[0], point[1], point[2]);
    this.colors.push(color.r, color.g, color.b);
    this.extra.push(extra);
  }

  triangle(corners, color, extra) {
    for (const corner of corners) this.vertex(corner, color, extra);
  }

  build(extraName) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
    if (extraName) geometry.setAttribute(extraName, new THREE.Float32BufferAttribute(this.extra, 1));
    geometry.computeVertexNormals();
    return geometry;
  }
}

const lift = (point, height) => [point.x, height, -point.y];

function roof(mesher, rings, part) {
  const [outer, ...holes] = rings;
  const all = outer.concat(...holes);
  for (const face of THREE.ShapeUtils.triangulateShape(outer, holes)) {
    mesher.triangle(face.map((i) => lift(all[i], part.top)), part.color, part.extra);
  }
}

function walls(mesher, ring, part) {
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const quad = [lift(a, part.base), lift(b, part.base), lift(b, part.top), lift(a, part.top)];
    mesher.triangle([quad[0], quad[1], quad[2]], part.wallColor, part.extra);
    mesher.triangle([quad[0], quad[2], quad[3]], part.wallColor, part.extra);
  }
}

// part: { base, top, color, wallColor, extra }. rings[0] is the outline, the rest are holes.
export function extrude(mesher, rings, part) {
  const [outer, ...holes] = rings;
  if (THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  for (const hole of holes) if (!THREE.ShapeUtils.isClockWise(hole)) hole.reverse();
  roof(mesher, rings, part);
  for (const ring of rings) walls(mesher, ring, part);
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
