// Place names pinned to the 3D world, as HTML so they stay sharp and readable.
import * as THREE from "/vendor/three/three.module.min.js";
import { GAROUPE } from "./beacons.js";
import { lang } from "./lang.js";

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

function write(label, place) {
  const name = typeof place.name === "string" ? place.name : place.name[lang()];
  label.innerHTML = place.note ? `${name} <span>${place.note}</span>` : name;
}

function element(place) {
  const label = document.createElement("p");
  label.className = place.district ? "place district" : "place";
  write(label, place);
  return label;
}

// extra: more places, such as the district platforms, with an absolute height instead of a lift.
export function makeLabels(layer, heightAt, extra = []) {
  const pins = [...extra, ...PLACES].map((place) => ({
    place,
    point: new THREE.Vector3(place.x, place.height ?? heightAt(place.x, place.y) + place.lift, -place.y),
    label: layer.appendChild(element(place)),
  }));
  document.addEventListener("riviera:lang", () => pins.forEach((pin) => write(pin.label, pin.place)));
  const projected = new THREE.Vector3();
  return function place(camera, size, textBlocks) {
    const taken = [...textBlocks];
    for (const pin of pins) {
      projected.copy(pin.point).project(camera);
      const screen = { x: ((projected.x + 1) / 2) * size.x, y: ((1 - projected.y) / 2) * size.y };
      const fade = visibility({ projected, distance: camera.position.distanceTo(pin.point), screen }, taken);
      if (fade > 0) taken.push(screen);
      // Only touch the DOM when something changed: most labels sit hidden most of the time.
      const opacity = fade.toFixed(2);
      if (opacity !== pin.opacity) pin.label.style.opacity = pin.opacity = opacity;
      if (fade === 0) continue;
      const transform = `translate(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px)`;
      if (transform !== pin.transform) pin.label.style.transform = pin.transform = transform;
    }
  };
}
