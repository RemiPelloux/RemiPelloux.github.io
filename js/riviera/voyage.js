// Chapter 06: the boat from the portfolio's footer, in blocks. Rémi at the helm, the Shiba at the bow,
// sailing back and forth across the bay west of Juan-les-Pins. Still when motion is reduced.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, SHIBA } from "./palette.js";

const SCALE = 4; // drawn larger than life, so the crew reads from the camera stop
const FROM = new THREE.Vector2(-1880, -1000);
const TO = new THREE.Vector2(-1690, -640);
const CROSSING_SECONDS = 55;

const COLOURS = { hull: BLUE.white, band: BLUE.antibes, deck: "#8FAED3", sail: BLUE.foam, mast: BLUE.deep, coat: "#123A63", skin: "#E9B48E", cap: BLUE.white, ...SHIBA };

// [x, y, z, width, height, depth, colour], bow toward +x.
const BLOCKS = [
  [0, 0, 0, 12, 1.4, 4.4, "hull"], [6.5, 0.3, 0, 1.6, 1, 2.6, "hull"], [0, -0.4, 0, 12.2, 0.5, 4.5, "band"], [0, 0.8, 0, 11, 0.2, 3.8, "deck"],
  [0.5, 6, 0, 0.4, 10, 0.4, "mast"], [-1.2, 6, 0, 3, 8, 0.15, "sail"], [2.2, 5, 0, 2.6, 6, 0.15, "sail"],
  [-4, 1.9, 0, 1.2, 1.8, 1.2, "coat"], [-4, 3.2, 0, 1, 1, 1, "skin"], [-4, 3.85, 0, 1.15, 0.35, 1.15, "cap"], [-3, 2, 0, 0.3, 1.4, 1.4, "mast"],
  [4.6, 1.5, 0, 1.6, 1.2, 1, "fur"], [5.6, 2.3, 0, 1, 1, 1, "fur"], [6.1, 2.1, 0, 0.5, 0.5, 0.6, "cream"], [5.5, 3, -0.3, 0.3, 0.5, 0.3, "fur"], [5.5, 3, 0.3, 0.3, 0.5, 0.3, "fur"], [3.8, 2.2, 0, 0.5, 0.8, 0.5, "cream"],
];

function makeBoat() {
  const boat = new THREE.Group();
  for (const [x, y, z, w, h, d, key] of BLOCKS) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: COLOURS[key], emissive: key === "sail" ? BLUE.antibes : 0x000000, emissiveIntensity: 0.3 }));
    block.position.set(x, y, z);
    boat.add(block);
  }
  boat.scale.setScalar(SCALE);
  return boat;
}

export function makeVoyage() {
  const boat = makeBoat();
  const course = TO.clone().sub(FROM);
  const heading = Math.atan2(course.y, course.x);
  const place = (seconds) => {
    const phase = (seconds / CROSSING_SECONDS) % 2;
    const along = phase < 1 ? phase : 2 - phase;
    const point = FROM.clone().addScaledVector(course, along);
    boat.position.set(point.x, 1.5 + Math.sin(seconds * 1.3) * 0.6, -point.y);
    boat.rotation.y = phase < 1 ? heading : heading + Math.PI;
    boat.rotation.z = Math.sin(seconds * 0.9) * 0.04;
  };
  place(CROSSING_SECONDS * 0.4);
  return { boat, place, centre: FROM.clone().lerp(TO, 0.45) };
}
