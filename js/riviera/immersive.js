// Builds the Antibes world and runs it. Loaded only in Immersive mode.
import * as THREE from "/vendor/three/three.module.min.js";
import { loadWorld } from "./data.js";
import { loadCatalog } from "./catalog.js";
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
import { ALTITUDE, Universe, towerView, universeStops } from "./universe.js";
import { placeSculptures } from "./sculptures.js";
import { makeVoyage } from "./voyage.js";
import { watchTowers } from "./pointer.js";
import { Rig, STOPS } from "./rig.js";
import { runBoot } from "./boot.js";
import { loadTextures } from "./textures.js";
import { makePost } from "./post.js";
import { makeDaylight } from "./daylight.js";
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

function buildWorld(world, repos, { images, textures }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HORIZON, FOG.near, FOG.far);
  const parts = { sea: makeSea(world, shoreMask(world), scene.fog), beacons: makeBeacons(world), universe: new Universe(repos), voyage: makeVoyage() };
  parts.turnSculptures = placeSculptures(parts.universe, ALTITUDE);
  scene.add(makeSky(textures.sky), makeLights(), parts.sea, makeTerrain(world, images), makeBuildings(world, textures), makeFort(world, textures), makePort(world, textures), makePines(world));
  scene.add(parts.beacons, parts.universe.group, parts.voyage.boat);
  return { scene, ...parts };
}

// The secret: five clicks on the Shiba put a giant one on top of Fort Carré.
function giantShiba(scene, world) {
  const giant = makeShiba({ station: false });
  giant.scale.setScalar(GIANT.scale);
  giant.position.set(GIANT.x, world.heightAt(GIANT.x, GIANT.y) + 18, -GIANT.y);
  giant.rotation.y = Math.PI * 0.35;
  scene.add(giant);
}

function districtPlaces(universe) {
  return universe.districts.map((d) => ({ name: { en: d.en, fr: d.fr }, x: d.x, y: d.y - d.radius * 0.6, height: ALTITUDE + 18, district: true }));
}

function resize(renderer, camera, size, post) {
  const [width, height] = [window.innerWidth, window.innerHeight];
  if (size.x === width && size.y === height) return;
  size.set(width, height);
  renderer.setSize(width, height, false);
  post.resize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Explorer and chapter 05 talk to the world through events.
function listen(built, rig) {
  document.addEventListener("riviera:focus", (event) => {
    const tower = built.universe.find(event.detail.name);
    if (!tower) return;
    const [x, y, z, tx, ty, tz] = towerView(tower, 210);
    rig.look(new THREE.Vector3(x, y, z), new THREE.Vector3(tx, ty, tz));
    built.universe.highlight((repo) => repo.name === event.detail.name);
    setTimeout(() => built.universe.highlight(null), 4000);
  });
  document.addEventListener("riviera:highlight", (event) => {
    const { language } = event.detail;
    built.universe.highlight(language ? (repo) => repo.language === language : null);
  });
}

// How far the towers have risen: nothing before chapter 02, everything by its stop.
function riseFor(rig) {
  const at = rig.indexOf("domains");
  return Math.min(1, Math.max(0, (rig.shown - (at - 0.9)) / 0.9));
}

// In chapter 04 the camera holds one overview; the flagship being read lights up instead.
function lightFlagship(view) {
  const stop = view.rig.current();
  const name = stop?.startsWith("feature-") ? stop.slice("feature-".length) : null;
  if (name === view.flagship) return;
  view.flagship = name;
  view.built.universe.highlight(name ? (repo) => repo.name === name : null);
}

function frame(view, seconds, delta) {
  const { built, rig, renderer, camera, size, post } = view;
  resize(renderer, camera, size, post);
  rig.update(delta);
  view.daylight.update(delta);
  lightFlagship(view);
  const rise = rig.calm ? Math.round(riseFor(rig)) : riseFor(rig);
  built.universe.setRise(rise);
  built.turnSculptures(seconds, rise);
  built.voyage.place(seconds);
  built.sea.material.uniforms.time.value = seconds;
  built.universe.time.value = seconds;
  built.beacons.userData.turn(seconds);
  view.placeLabels(camera, size, view.page.cards.map((card) => card.getBoundingClientRect()));
  post.render(seconds);
  view.drawShiba(seconds);
}

export async function startImmersive(page) {
  const renderer = makeRenderer(page.canvas);
  const [world, catalog, painted] = await Promise.all([loadWorld("/assets/riviera/"), loadCatalog(), loadTextures(renderer)]);
  const built = buildWorld(world, catalog.repos, painted);
  const camera = new THREE.PerspectiveCamera(42, 1, 2, 320000);
  const rig = new Rig(camera, page.sections, { ...STOPS, ...universeStops(built.universe) }, world.heightAt);
  rig.calm = page.calm || page.still;
  const facts = { buildings: world.buildings.length.toLocaleString("en-GB"), calm: page.calm, onSecret: () => giantShiba(built.scene, world) };
  const post = makePost(renderer, built.scene, camera);
  const view = { page, built, rig, renderer, camera, post, daylight: makeDaylight(built, renderer, post, rig.calm), size: new THREE.Vector2(), placeLabels: makeLabels(page.labels, world.heightAt, districtPlaces(built.universe)), drawShiba: mountCompanion(page.companion, facts) };
  listen(built, rig);
  watchTowers(page.canvas, built.universe, camera);
  if (rig.calm) rig.jump();
  runBoot(page.boot, world, rig.calm);
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = Math.min(0.1, clock.getDelta());
    frame(view, page.calm ? 0 : clock.elapsedTime, delta);
  });
}
