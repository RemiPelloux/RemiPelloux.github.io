// Umbrella pines, scattered inside the woods mapped on the Cap, with a seeded random so they never move.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";
import { inside, seeded, toVec2 } from "./geometry.js";

const SQUARE_METRES_PER_PINE = 260;
const MAX_PINES = 5000;

function scatter(ring, random, count) {
  const xs = ring.map((p) => p.x);
  const ys = ring.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const points = [];
  for (let tries = 0; points.length < count && tries < count * 4; tries += 1) {
    const point = new THREE.Vector2(minX + random() * (maxX - minX), minY + random() * (maxY - minY));
    if (inside(point, ring)) points.push(point);
  }
  return points;
}

function area(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) sum += ring[i].cross(ring[(i + 1) % ring.length]);
  return Math.abs(sum) / 2;
}

function pinePart(geometry, color, count) {
  return new THREE.InstancedMesh(geometry, new THREE.MeshLambertMaterial({ color }), count);
}

export function makePines(world) {
  const random = seeded(1928);
  const points = world.woods.map(toVec2).flatMap((ring) => scatter(ring, random, Math.round(area(ring) / SQUARE_METRES_PER_PINE))).slice(0, MAX_PINES);
  const canopy = pinePart(new THREE.SphereGeometry(1, 7, 4).scale(4.2, 1.5, 4.2), BLUE.deep, points.length);
  const trunk = pinePart(new THREE.CylinderGeometry(0.25, 0.35, 8, 4).translate(0, 4, 0), BLUE.night, points.length);
  const matrix = new THREE.Matrix4();
  points.forEach((point, i) => {
    const size = 0.75 + random() * 0.6;
    const ground = world.heightAt(point.x, point.y);
    matrix.makeScale(size, size, size).setPosition(point.x, ground, -point.y);
    trunk.setMatrixAt(i, matrix);
    matrix.makeScale(size, size, size).setPosition(point.x, ground + 8.5 * size, -point.y);
    canopy.setMatrixAt(i, matrix);
  });
  return new THREE.Group().add(trunk, canopy);
}
