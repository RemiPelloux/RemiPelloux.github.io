// The Shiba at its station, in the corner of the screen. It follows the pointer with its head,
// wags now and then, and answers a click with something true about the world it is watching.
import * as THREE from "/vendor/three/three.module.min.js";
import { makeShiba } from "./voxels.js";

const HINTS = [
  (f) => [`Every building down there is a real one from OpenStreetMap. ${f.buildings} of them.`, `Chaque bâtiment, en bas, est un vrai, tiré d'OpenStreetMap. Il y en a ${f.buildings}.`],
  () => ["The glowing lines are the real streets of Antibes.", "Les lignes lumineuses sont les vraies rues d'Antibes."],
  () => ["Fort Carré dates from 1550. Vauban reworked it at the end of the 17th century.", "Le Fort Carré date de 1550. Vauban l'a remanié à la fin du XVIIe siècle."],
  () => ["The light on the plateau is the Garoupe lighthouse.", "La lumière sur le plateau, c'est le phare de la Garoupe."],
  () => ["Rémi was born down there.", "Rémi est né juste là, en bas."],
  () => ["Press L for the Lite version. I will still be here.", "Appuyez sur L pour la version Lite. Je serai toujours là."],
];
// One line the first time each chapter comes on screen.
const CHAPTER_LINES = {
  "02": ["Inland, every field Rémi works in gets its own platform.", "Dans les terres, chaque domaine de Rémi a sa plateforme."],
  "03": ["Each tower is a public repository. Point at one, or search below.", "Chaque tour est un dépôt public. Pointez-en une, ou cherchez plus bas."],
  "04": ["The flagships. Each one has its own object on top.", "Les projets phares. Chacun a son objet au sommet."],
  "05": ["Hover a language and its towers light up.", "Survolez un langage et ses tours s'allument."],
  "06": ["That is us on the boat. He steers, I keep watch.", "C'est nous, sur le bateau. Il tient la barre, je fais le guet."],
  "07": ["End of the coast. LinkedIn is the fastest way to reach him.", "Fin de la côte. LinkedIn est le moyen le plus rapide de le joindre."],
};
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

function say(bubble, state, line) {
  bubble.textContent = line[document.documentElement.lang === "fr" ? 1 : 0];
  bubble.hidden = false;
  clearTimeout(state.timer);
  state.timer = setTimeout(() => (bubble.hidden = true), 5200);
}

function hearChapters(bubble, state) {
  const heard = new Set();
  document.addEventListener("riviera:chapter", (event) => {
    const line = CHAPTER_LINES[event.detail.chapter];
    if (!line || heard.has(event.detail.chapter)) return;
    heard.add(event.detail.chapter);
    state.perk = 1;
    say(bubble, state, line);
  });
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
    say(bubble, state, HINTS[state.clicks % HINTS.length](facts));
    if (state.clicks === SECRET_CLICKS) facts.onSecret();
  });
  hearChapters(bubble, state);
  return (seconds) => {
    const box = renderer.domElement.getBoundingClientRect();
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
    pose(shiba, state, seconds);
    renderer.render(scene, camera);
  };
}
