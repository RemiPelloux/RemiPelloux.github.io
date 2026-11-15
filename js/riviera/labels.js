// Place names pinned to the 3D world, as HTML so they stay sharp and readable.
import * as THREE from "/vendor/three/three.module.min.js";
import { GAROUPE } from "./beacons.js";

const PLACES = [
  { name: "Fort Carré", note: "1550", x: 382, y: 2416, lift: 50 },
  { name: "Port Vauban", x: 300, y: 1900, lift: 30 },
  { name: "Vieille ville", x: 359, y: 1414, lift: 40 },
  { name: "Château Grimaldi", note: "Musée Picasso", x: 467, y: 1354, lift: 45 },
  { name: "Phare de la Garoupe", x: GAROUPE.x, y: GAROUPE.y, lift: 60 },
  { name: "Cap d'Antibes", x: 476, y: -1511, lift: 80 },
  { name: "Juan-les-Pins", x: -672, y: -96, lift: 60 },
];

const NEAR = 400;
const FAR = 4200;

const GAP_X = 170;
const GAP_Y = 34;

// 0 when the place is behind the camera, off screen, too near, too far, under a label already shown
// or under a block of text. `taken` holds both: shown labels as points, text blocks as rectangles.
function visibility({ projected, distance, screen }, taken) {
  const covered = taken.some((rect) => rect.width && screen.x > rect.left - 90 && screen.x < rect.right + 90 && screen.y > rect.top - 20 && screen.y < rect.bottom + 40);
  const onScreen = projected.z < 1 && Math.abs(projected.x) < 0.95 && Math.abs(projected.y) < 0.9;
  const clear = taken.every((other) => other.width || Math.abs(other.x - screen.x) > GAP_X || Math.abs(other.y - screen.y) > GAP_Y);
  if (!onScreen || !clear || covered) return 0;
  return Math.max(0, Math.min(1, (FAR - distance) / 900, (distance - NEAR) / 200));
}

function element(place) {
  const label = document.createElement("p");
  label.className = "place";
  label.innerHTML = place.note ? `${place.name} <span>${place.note}</span>` : place.name;
  return label;
}

export function makeLabels(layer, heightAt) {
  const pins = PLACES.map((place) => ({
    point: new THREE.Vector3(place.x, heightAt(place.x, place.y) + place.lift, -place.y),
    label: layer.appendChild(element(place)),
  }));
  const projected = new THREE.Vector3();
  return function place(camera, size, textBlocks) {
    const taken = [...textBlocks];
    for (const pin of pins) {
      projected.copy(pin.point).project(camera);
      const screen = { x: ((projected.x + 1) / 2) * size.x, y: ((1 - projected.y) / 2) * size.y };
      const fade = visibility({ projected, distance: camera.position.distanceTo(pin.point), screen }, taken);
      if (fade > 0) taken.push(screen);
      pin.label.style.opacity = fade.toFixed(2);
      pin.label.style.transform = `translate(${screen.x}px, ${screen.y}px)`;
    }
  };
}
