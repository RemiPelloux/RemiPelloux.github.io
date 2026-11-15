// Port Vauban: the real piers and quays, and boats moored along every pontoon inside the marinas.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, LAND } from "./palette.js";
import { Mesher, centroid, extrude, inside, seeded, toVec2 } from "./geometry.js";

const PIER_TOP = 1.6;
const BOAT_SPACING = 5.5;
const MAX_BOATS = 1600;

function piersMesh(world) {
  const mesher = new Mesher();
  const color = new THREE.Color(LAND.stone);
  for (const flat of world.piers) {
    const ring = toVec2(flat);
    if (ring.length >= 3) extrude(mesher, [ring], { base: -2, top: PIER_TOP, color, wallColor: color });
  }
  return new THREE.Mesh(mesher.build(), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
}

// The longest edge gives the pontoon's direction; boats moor on both sides of it.
function axisOf(ring) {
  let best = { length: 0 };
  for (let i = 0; i < ring.length; i += 1) {
    const edge = ring[(i + 1) % ring.length].clone().sub(ring[i]);
    if (edge.length() > best.length) best = { length: edge.length(), start: ring[i], direction: edge.normalize() };
  }
  return best;
}

function berths(ring, random) {
  const axis = axisOf(ring);
  const across = new THREE.Vector2(-axis.direction.y, axis.direction.x);
  const spots = [];
  for (let d = 3; d < axis.length - 3; d += BOAT_SPACING) {
    for (const side of [-1, 1]) {
      const length = 9 + random() * random() * 26;
      const point = axis.start.clone().addScaledVector(axis.direction, d).addScaledVector(across, side * (2.5 + length / 2));
      if (random() < 0.82) spots.push({ point, length, angle: Math.atan2(across.y, across.x) });
    }
  }
  return spots;
}

function boatGeometry() {
  const hull = new THREE.Shape([[-0.5, -0.17], [0.32, -0.17], [0.5, 0], [0.32, 0.17], [-0.5, 0.17]].map(([x, y]) => new THREE.Vector2(x, y)));
  const geometry = new THREE.ExtrudeGeometry(hull, { depth: 0.09, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  const cabin = new THREE.BoxGeometry(0.4, 0.07, 0.2).translate(-0.08, 0.12, 0);
  const merged = new THREE.BufferGeometry();
  const parts = [geometry.toNonIndexed(), cabin.toNonIndexed()];
  const positions = parts.flatMap((part) => Array.from(part.attributes.position.array));
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.computeVertexNormals();
  return merged;
}

function boatsMesh(world) {
  const random = seeded(1680);
  const marinas = world.marinas.map(toVec2);
  const spots = world.piers.map(toVec2).filter((ring) => ring.length >= 3 && marinas.some((m) => inside(centroid(ring), m))).flatMap((ring) => berths(ring, random));
  const count = Math.min(MAX_BOATS, spots.length);
  const material = new THREE.MeshLambertMaterial({ color: BLUE.white, emissive: BLUE.antibes, emissiveIntensity: 0.2 });
  const boats = new THREE.InstancedMesh(boatGeometry(), material, count);
  const matrix = new THREE.Matrix4();
  spots.slice(0, count).forEach((spot, i) => {
    const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spot.angle);
    matrix.compose(new THREE.Vector3(spot.point.x, 0.2, -spot.point.y), turn, new THREE.Vector3(spot.length, spot.length, spot.length));
    boats.setMatrixAt(i, matrix);
  });
  return boats;
}

export function makePort(world) {
  const group = new THREE.Group();
  group.add(piersMesh(world), boatsMesh(world));
  return group;
}
