// Builds the Antibes world and runs it. Loaded only in Immersive mode.
import * as THREE from "/vendor/three/three.module.min.js";
import { loadWorld } from "./data.js";
import { HORIZON, makeLights, makeSky } from "./sky.js";
import { makeTerrain, shoreMask } from "./terrain.js";
import { makeSea } from "./sea.js";
import { makeBuildings } from "./buildings.js";
import { makeFort } from "./fort.js";
import { makePort } from "./port.js";
import { makePines } from "./pines.js";
import { makeBeacons } from "./beacons.js";
import { makeLabels } from "./labels.js";
import { makeShiba } from "./voxels.js";
import { Rig } from "./rig.js";
import { runBoot } from "./boot.js";
import { mountCompanion } from "./companion.js";

const FOG = { near: 3500, far: 21000 };
const GIANT = { scale: 7, x: 382, y: 2416 };

function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  return renderer;
}

function buildWorld(world) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HORIZON, FOG.near, FOG.far);
  const sea = makeSea(world, shoreMask(world), scene.fog);
  const beacons = makeBeacons(world);
  scene.add(makeSky(), makeLights(), sea, makeTerrain(world), makeBuildings(world), makeFort(world), makePort(world), makePines(world), beacons);
  return { scene, sea, beacons };
}

// The secret: five clicks on the Shiba put a giant one on top of Fort Carré.
function giantShiba(scene, world) {
  const giant = makeShiba({ station: false });
  giant.scale.setScalar(GIANT.scale);
  giant.position.set(GIANT.x, world.heightAt(GIANT.x, GIANT.y) + 18, -GIANT.y);
  giant.rotation.y = Math.PI * 0.35;
  scene.add(giant);
}

function resize(renderer, camera, size) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (size.x === width && size.y === height) return;
  size.set(width, height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export async function startImmersive(page) {
  const world = await loadWorld("/assets/riviera/");
  const renderer = makeRenderer(page.canvas);
  const { scene, sea, beacons } = buildWorld(world);
  const camera = new THREE.PerspectiveCamera(42, 1, 2, 320000);
  const rig = new Rig(camera, page.sections);
  rig.calm = page.calm || page.still;
  const placeLabels = makeLabels(page.labels, world.heightAt);
  const facts = { buildings: world.buildings.length.toLocaleString("en-GB"), calm: page.calm, onSecret: () => giantShiba(scene, world) };
  const drawShiba = mountCompanion(page.companion, facts);
  const size = new THREE.Vector2();
  const clock = new THREE.Clock();
  if (rig.calm) rig.jump();
  runBoot(page.boot, world, rig.calm);
  renderer.setAnimationLoop(() => {
    const delta = Math.min(0.1, clock.getDelta());
    const seconds = page.calm ? 0 : clock.elapsedTime;
    resize(renderer, camera, size);
    rig.update(seconds, delta);
    sea.material.uniforms.time.value = seconds;
    beacons.userData.turn(seconds);
    placeLabels(camera, size, page.cards.map((card) => card.getBoundingClientRect()));
    renderer.render(scene, camera);
    drawShiba(seconds);
  });
  return () => renderer.setAnimationLoop(null);
}
