// Fort Carré and the old town ramparts, drawn brighter than the town and outlined in light.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, LAND } from "./palette.js";
import { Mesher, extrude, lowestGround, toVec2 } from "./geometry.js";

const FORT_HEIGHT = 20;
const RAMPART_HEIGHT = 11;

function outline(geometry) {
  const edges = new THREE.EdgesGeometry(geometry, 30);
  const material = new THREE.LineBasicMaterial({ color: BLUE.glow, transparent: true, opacity: 0.9 });
  return new THREE.LineSegments(edges, material);
}

function fortMesh(world) {
  const mesher = new Mesher();
  const color = new THREE.Color(LAND.fort);
  for (const part of world.fort) {
    const rings = [toVec2(part.o), ...part.h.map(toVec2)];
    const ground = lowestGround(rings[0], world.heightAt);
    extrude(mesher, rings, { base: ground - 4, top: ground + FORT_HEIGHT, color, wallColor: color.clone().multiplyScalar(0.8) });
  }
  return mesher.build();
}

function rampartMesh(world) {
  const mesher = new Mesher();
  const color = new THREE.Color(LAND.stone);
  for (const line of world.walls) {
    const points = toVec2(line);
    for (let i = 0; i + 1 < points.length; i += 1) {
      const [a, b] = [points[i], points[i + 1]];
      const [groundA, groundB] = [world.heightAt(a.x, a.y), world.heightAt(b.x, b.y)];
      const quad = [[a.x, groundA - 3, -a.y], [b.x, groundB - 3, -b.y], [b.x, groundB + RAMPART_HEIGHT, -b.y], [a.x, groundA + RAMPART_HEIGHT, -a.y]];
      mesher.triangle([quad[0], quad[1], quad[2]], color);
      mesher.triangle([quad[0], quad[2], quad[3]], color);
    }
  }
  return mesher.build();
}

export function makeFort(world) {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, emissive: BLUE.antibes, emissiveIntensity: 0.6 });
  const fort = fortMesh(world);
  group.add(new THREE.Mesh(fort, material), outline(fort));
  const ramparts = rampartMesh(world);
  group.add(new THREE.Mesh(ramparts, material), outline(ramparts));
  return group;
}
