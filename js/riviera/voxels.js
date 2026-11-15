// The Shiba, built from blocks like the pixel boat in the footer of the portfolio.
// Sitting, facing +z. One unit is one block. Head, ears and tail are separate groups so they can move.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, SHIBA } from "./palette.js";

// [x, y, z, width, height, depth, colour]
const BODY = [
  [0, 1.5, -1, 5, 3, 5, "fur"], [0, 4, 0.8, 4, 4, 3, "fur"], [0, 3.7, 2.4, 2.4, 3, 0.4, "cream"],
  [-1.2, 1, 2, 1.2, 2, 1.2, "cream"], [1.2, 1, 2, 1.2, 2, 1.2, "cream"],
  [-2.2, 0.5, 0.6, 1.4, 1, 2.2, "fur"], [2.2, 0.5, 0.6, 1.4, 1, 2.2, "fur"],
];
const HEAD = [
  [0, 0, 0, 4.4, 3.6, 3.6, "fur"], [0, -0.7, 2.1, 2.2, 1.6, 1.4, "cream"], [0, -0.1, 2.85, 0.7, 0.5, 0.3, "nose"],
  [-1.6, -0.7, 1.4, 1, 1.2, 1, "cream"], [1.6, -0.7, 1.4, 1, 1.2, 1, "cream"],
  [-1, 0.6, 1.85, 0.5, 0.6, 0.2, "dark"], [1, 0.6, 1.85, 0.5, 0.6, 0.2, "dark"],
  [-1, 1.25, 1.85, 0.5, 0.25, 0.2, "cream"], [1, 1.25, 1.85, 0.5, 0.25, 0.2, "cream"],
];
const EAR = [[0, 0.9, 0, 1.2, 1.8, 0.8, "fur"], [0, 0.7, 0.45, 0.6, 1, 0.1, "cream"]];
const TAIL = [[0, 0, 0, 1.6, 1.6, 1.6, "fur"], [0, 1.3, 0.4, 1.6, 1.4, 1.6, "cream"], [0, 1.6, 1.4, 1.4, 1, 1.4, "fur"]];
const STATION = [[0, -0.3, 0.5, 9, 0.6, 9, "deck"], [-5.2, 2.6, 2.2, 0.3, 3.4, 4.6, "screen"]];

const COLOURS = { fur: SHIBA.fur, cream: SHIBA.cream, dark: SHIBA.dark, nose: SHIBA.nose, deck: BLUE.sea, screen: BLUE.shallow };

function blocks(list) {
  const group = new THREE.Group();
  for (const [x, y, z, w, h, d, key] of list) {
    const glow = key === "screen";
    const material = glow
      ? new THREE.MeshBasicMaterial({ color: COLOURS[key], transparent: true, opacity: 0.75 })
      : new THREE.MeshLambertMaterial({ color: COLOURS[key] });
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    block.position.set(x, y, z);
    group.add(block);
  }
  return group;
}

function part(list, position) {
  const group = blocks(list);
  group.position.set(...position);
  return group;
}

export function makeShiba({ station = true } = {}) {
  const shiba = new THREE.Group();
  const head = part(HEAD, [0, 7.2, 1.2]);
  const ears = [-1.4, 1.4].map((x) => part(EAR, [x, 1.6, -0.4]));
  head.add(...ears);
  const tail = part(TAIL, [0, 3.6, -3.7]);
  shiba.add(blocks(BODY), head, tail);
  if (station) shiba.add(blocks(STATION));
  shiba.userData = { head, ears, tail };
  return shiba;
}
