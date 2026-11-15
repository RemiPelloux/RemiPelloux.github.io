// The Shiba at its station, in the corner of the screen. It follows the pointer with its head,
// wags now and then, and answers a click with something true about the world it is watching.
import * as THREE from "/vendor/three/three.module.min.js";
import { makeShiba } from "./voxels.js";

const HINTS_EN = [
  (facts) => `Every building down there is a real one from OpenStreetMap. ${facts.buildings} of them.`,
  () => "The glowing lines are the real streets of Antibes.",
  () => "Fort Carré dates from 1550. Vauban reworked it at the end of the 17th century.",
  () => "The light on the plateau is the Garoupe lighthouse.",
  () => "Rémi was born down there.",
  () => "Press L for the Lite version. I will still be here.",
];
const SECRET_CLICKS = 5;

function stage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#FFFFFF", "#0A3A73", 2.2));
  const sun = new THREE.DirectionalLight("#FFFFFF", 1.6);
  sun.position.set(8, 14, 10);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 200);
  camera.position.set(14, 12, 26);
  camera.lookAt(0, 4.5, 0);
  return { renderer, scene, camera };
}

function pose(shiba, state, seconds) {
  const { head, ears, tail } = shiba.userData;
  head.rotation.y += (state.look.x * 0.6 - head.rotation.y) * 0.1;
  head.rotation.x += (-state.look.y * 0.25 - head.rotation.x) * 0.1;
  const wagging = state.calm ? 0 : Math.max(0, Math.sin(seconds * 0.7)) ** 8;
  tail.rotation.z = Math.sin(seconds * 14) * 0.35 * wagging;
  const perk = 1 + state.perk * 0.25;
  ears.forEach((ear) => ear.scale.set(1, perk, 1));
  shiba.position.y = state.hop * 2.5;
  state.perk *= 0.94;
  state.hop = Math.max(0, state.hop - 0.06);
}

function speak(bubble, state, facts) {
  const hint = HINTS_EN[state.clicks % HINTS_EN.length](facts);
  bubble.textContent = hint;
  bubble.hidden = false;
  clearTimeout(state.timer);
  state.timer = setTimeout(() => (bubble.hidden = true), 5200);
}

export function mountCompanion(root, facts) {
  const { renderer, scene, camera } = stage(root.querySelector("canvas"));
  const shiba = makeShiba();
  shiba.rotation.y = -0.35;
  scene.add(shiba);
  const bubble = root.querySelector("[data-bubble]");
  const state = { look: { x: 0, y: 0 }, perk: 0, hop: 0, clicks: 0, calm: facts.calm };
  window.addEventListener("pointermove", (event) => {
    state.look.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.look.y = (event.clientY / window.innerHeight) * 2 - 1;
  });
  root.querySelector("button").addEventListener("click", () => {
    Object.assign(state, { perk: 1, hop: state.calm ? 0 : 1, clicks: state.clicks + 1 });
    speak(bubble, state, facts);
    if (state.clicks === SECRET_CLICKS) facts.onSecret();
  });
  return (seconds) => {
    const box = renderer.domElement.getBoundingClientRect();
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
    pose(shiba, state, seconds);
    renderer.render(scene, camera);
  };
}
