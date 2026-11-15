// Fort Carré and the old town ramparts, in painted limestone, brighter than the town and outlined in light.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";
import { Mesher, WALL_TILE, extrude, lowestGround, toVec2 } from "./geometry.js";

const FORT_HEIGHT = 20;
const RAMPART_HEIGHT = 11;
const WHITE = new THREE.Color(1, 1, 1);

function outline(geometry) {
  const edges = new THREE.EdgesGeometry(geometry, 30);
  const material = new THREE.LineBasicMaterial({ color: BLUE.glow, transparent: true, opacity: 0.75 });
  return new THREE.LineSegments(edges, material);
}

function fortMesh(world) {
  const mesher = new Mesher();
  for (const part of world.fort) {
    const rings = [toVec2(part.o), ...part.h.map(toVec2)];
    const ground = lowestGround(rings[0], world.heightAt);
    extrude(mesher, rings, { base: ground - 4, top: ground + FORT_HEIGHT, color: WHITE, wallColor: WHITE });
  }
  return mesher.build();
}

function rampartSegment(mesher, [a, b], world) {
  const [groundA, groundB] = [world.heightAt(a.x, a.y), world.heightAt(b.x, b.y)];
  const quad = [[a.x, groundA - 3, -a.y], [b.x, groundB - 3, -b.y], [b.x, groundB + RAMPART_HEIGHT, -b.y], [a.x, groundA + RAMPART_HEIGHT, -a.y]];
  const [u, top] = [a.distanceTo(b) / WALL_TILE, (RAMPART_HEIGHT + 3) / WALL_TILE];
  const uv = [[0, 0], [u, 0], [u, top], [0, top]];
  mesher.triangle([quad[0], quad[1], quad[2]], { color: WHITE, uvs: [uv[0], uv[1], uv[2]] });
  mesher.triangle([quad[0], quad[2], quad[3]], { color: WHITE, uvs: [uv[0], uv[2], uv[3]] });
}

function rampartMesh(world) {
  const mesher = new Mesher();
  for (const line of world.walls) {
    const points = toVec2(line);
    for (let i = 0; i + 1 < points.length; i += 1) rampartSegment(mesher, [points[i], points[i + 1]], world);
  }
  return mesher.build();
}

export function makeFort(world, textures) {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ map: textures.stone, vertexColors: true, side: THREE.DoubleSide, emissive: BLUE.antibes, emissiveIntensity: 0.35 });
  const fort = fortMesh(world);
  const ramparts = rampartMesh(world);
  group.add(new THREE.Mesh(fort, material), outline(fort), new THREE.Mesh(ramparts, material), outline(ramparts));
  return group;
}
