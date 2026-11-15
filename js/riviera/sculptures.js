// Chapter 04: each featured project gets its own object on top of its tower, a picture of what it does.
// Built from simple blocks, in white light, so they read from far away.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";

const solid = new THREE.MeshLambertMaterial({ color: BLUE.white, emissive: BLUE.glow, emissiveIntensity: 0.55 });
const lit = new THREE.MeshBasicMaterial({ color: BLUE.white });
const dim = new THREE.MeshLambertMaterial({ color: BLUE.antibes, emissive: BLUE.antibes, emissiveIntensity: 0.6 });

function box(size, position, material = solid) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  return mesh;
}

// OpenVision: an eye, the project's own mark.
function eye() {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(16, 2.2, 8, 40), solid);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), lit);
  return new THREE.Group().add(ring, pupil);
}

// OpenPlod: a waveform, for the voice recordings it keeps.
function waveform() {
  const heights = [6, 14, 24, 32, 20, 28, 12, 22, 8];
  return new THREE.Group().add(...heights.map((h, i) => box([3, h, 3], [(i - 4) * 5, 0, 0])));
}

// Modelly: a grid of agents, a few of them active.
function agents() {
  const group = new THREE.Group();
  for (let i = 0; i < 25; i += 1) group.add(box([4, 4, 4], [((i % 5) - 2) * 7, 0, (Math.floor(i / 5) - 2) * 7], [3, 7, 11, 18, 22].includes(i) ? lit : dim));
  return group;
}

// Containust: three containers, stacked.
function containers() {
  return new THREE.Group().add(box([30, 9, 12], [0, -10, 0]), box([30, 9, 12], [0, 0, 0], dim), box([30, 9, 12], [0, 10, 0]));
}

// HackoogleMini: the speaker's puck with its four lights.
function puck() {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(15, 16, 7, 32), dim);
  const lights = [-6, -2, 2, 6].map((x) => box([2.4, 1.2, 2.4], [x, 4, 0], lit));
  return new THREE.Group().add(body, ...lights);
}

// Pelloux Guidelines: ten rules, ten slabs.
function rules() {
  return new THREE.Group().add(...Array.from({ length: 10 }, (_, i) => box([26 - i * 1.6, 1.6, 18 - i], [0, i * 2.6 - 12, 0], i % 3 ? solid : lit)));
}

// SmarttyTest: a change, and the few tests it reaches.
function impact() {
  const group = new THREE.Group().add(box([3, 22, 3], [0, -6, 0]));
  [[-10, 8, -4], [9, 10, 3], [-4, 14, 8], [6, 5, -9]].forEach(([x, y, z], i) => {
    const branch = box([Math.hypot(x, z), 1.2, 1.2], [x / 2, y - 3, z / 2]);
    branch.rotation.y = -Math.atan2(z, x);
    group.add(box([5, 5, 5], [x, y, z], i < 2 ? lit : dim), branch);
  });
  return group;
}

// OpenSw: a handheld console.
function handheld() {
  const screen = box([22, 13, 2], [0, 0, 0], lit);
  const grips = [-15, 15].map((x) => box([7, 15, 4], [x, 0, 0], dim));
  return new THREE.Group().add(screen, ...grips);
}

const MAKERS = { OpenVision: eye, OpenPlod: waveform, Modelly: agents, Containust: containers, HackoogleMini: puck, "pelloux-guidelines": rules, SmarttyTest: impact, OpenSw: handheld };

// One object above each featured tower. Returns a function that turns them slowly.
export function placeSculptures(universe, altitude) {
  const pieces = [];
  for (const [name, make] of Object.entries(MAKERS)) {
    const tower = universe.find(name);
    if (!tower) continue;
    const piece = make();
    piece.position.set(tower.x, altitude + tower.height + 34, -tower.y);
    universe.group.add(piece);
    pieces.push({ piece, tower });
  }
  return (seconds, rise) => {
    for (const { piece, tower } of pieces) {
      piece.rotation.y = seconds * 0.25;
      piece.visible = rise > 0.95;
      piece.position.y = altitude + tower.height * rise + 34;
    }
  };
}
