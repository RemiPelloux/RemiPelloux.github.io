// Night and day. The sky switch turns the world between blue hour and a bright Riviera day, as one eased
// sunrise or sunset: the sky, fog, sea and lights move together, the stars fade, and the windows go dark.
// Switching to day, the moon sinks into the sea and the sun rises from the east to its day height;
// switching back, the sun sets and the moon comes up again. Light and the path on the water follow them.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, MOON } from "./palette.js";
import { t } from "./lang.js";

const CYCLE_SECONDS = 2.6;
const KEY = "riviera-sky";

// Each entry: [night, day]. Colours are lerped, numbers are lerped.
const LOOK = {
  zenith: ["#081C3D", "#2F77C1"],
  middle: ["#0E3366", "#6E9FD5"],
  horizon: [BLUE.horizon, "#C9DCF0"],
  afterglow: [BLUE.glow, "#FFFFFF"],
  seaDeep: [BLUE.abyss, BLUE.sea],
  seaMid: [BLUE.sea, BLUE.antibes],
  seaShallow: [BLUE.shallow, "#3FB5D8"],
  seaSky: [BLUE.horizon, "#B7CFEA"],
  hemiSky: [BLUE.glow, "#FFFFFF"],
  hemiGround: [BLUE.deep, BLUE.sea],
  hemi: [1.55, 2.1],
  sun: [1.15, 2.6],
  windows: [0.55, 0.04],
  wallLight: [1.2, 1.6],
  groundLight: [1.45, 2.8],
  roads: [0.85, 0.25],
  roofGlow: [0.25, 0.0],
  stoneGlow: [0.35, 0.08],
  bloom: [0.75, 0.22],
  threshold: [0.62, 0.92],
  exposure: [1.28, 1.08],
};

const smooth = (x) => x * x * (3 - 2 * x);
const ramp = (from, to, x) => smooth(Math.min(1, Math.max(0, (x - from) / (to - from))));

// Directions on the sky from an elevation and an azimuth measured from east toward south, in radians.
// World axes: x east, y up, z south.
function skyAt(elevation, azimuth, target) {
  return target.set(Math.cos(elevation) * Math.cos(azimuth), Math.sin(elevation), Math.cos(elevation) * Math.sin(azimuth));
}

const MOON_AT = new THREE.Vector3(...MOON).normalize();
const MOON_ELEVATION = Math.asin(MOON_AT.y);
const MOON_AZIMUTH = Math.atan2(MOON_AT.z, MOON_AT.x);
const BELOW = -0.14; // radians under the horizon: far enough that the disc and its glow are gone
const SUN = { day: 0.19, fromAzimuth: 0.72, toAzimuth: 0.95 }; // rises in front of the horizon view, settles about 11 degrees up, south-east
const LIGHT_DISTANCE = 6000;

// t from 0 (night) to 1 (day): the moon sets over the first half, the sun rises over the second.
function bodies(t, moon, sun) {
  skyAt(MOON_ELEVATION + (BELOW - MOON_ELEVATION) * ramp(0, 0.55, t), MOON_AZIMUTH, moon);
  const rise = ramp(0.4, 1, t);
  skyAt(BELOW + (SUN.day - BELOW) * rise, SUN.fromAzimuth + (SUN.toAzimuth - SUN.fromAzimuth) * rise, sun);
  return moon.y >= sun.y ? moon : sun; // whichever is higher lights the world and the water
}

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function remember(sky) {
  try {
    localStorage.setItem(KEY, sky);
  } catch {
    /* private window: the sky resets on the next visit */
  }
}

// Finds what the cycle drives in the built world: materials by their role, not by position in the scene.
function targets(built, renderer, post) {
  const found = { renderer, post, sky: null, hemi: null, sun: null, walls: [], roofs: [], stone: [], ground: [] };
  built.scene.traverse((object) => {
    if (object.isHemisphereLight) found.hemi = object;
    if (object.isDirectionalLight) found.sun = object;
    const material = object.material;
    if (!material) return;
    if (material.uniforms?.stars) found.sky = material;
    const role = material.userData.daylight; // "walls", "roofs", "stone" or "ground", set where the material is made
    if (role && !found[role].includes(material)) found[role].push(material);
  });
  found.sea = built.sea.material;
  found.fog = built.scene.fog;
  return found;
}

function blend(key, t) {
  const [night, day] = LOOK[key];
  if (typeof night === "number") return night + (day - night) * t;
  return new THREE.Color(night).lerp(new THREE.Color(day), t);
}

function apply(world, t) {
  const sky = world.sky.uniforms;
  const lit = bodies(t, sky.moonDir.value, sky.sunDir.value);
  world.sea.uniforms.moonDir.value.copy(lit);
  world.sun.position.copy(lit).multiplyScalar(LIGHT_DISTANCE);
  for (const key of ["zenith", "middle", "afterglow"]) sky[key].value.copy(blend(key, t));
  sky.horizon.value.copy(blend("horizon", t));
  world.fog.color.copy(sky.horizon.value); // the sea reads this same colour object for its fog
  sky.night.value = 1 - t;
  const sea = world.sea.uniforms;
  sea.deep.value.copy(blend("seaDeep", t));
  sea.mid.value.copy(blend("seaMid", t));
  sea.shallow.value.copy(blend("seaShallow", t));
  sea.sky.value.copy(blend("seaSky", t));
  world.hemi.color.copy(blend("hemiSky", t));
  world.hemi.groundColor.copy(blend("hemiGround", t));
  world.hemi.intensity = blend("hemi", t);
  world.sun.intensity = blend("sun", t);
  for (const m of world.walls) (m.emissiveIntensity = blend("windows", t)), m.color.setScalar(blend("wallLight", t));
  for (const m of world.ground) (m.emissiveIntensity = blend("roads", t)), m.color.setScalar(blend("groundLight", t));
  for (const m of world.roofs) m.emissiveIntensity = blend("roofGlow", t);
  for (const m of world.stone) m.emissiveIntensity = blend("stoneGlow", t);
  world.post.setBloom(blend("bloom", t), blend("threshold", t));
  world.renderer.toneMappingExposure = blend("exposure", t);
}

// The sky toggle in the bar (data-sky-toggle) shows a sun at night and a moon by day: it names
// what you switch to. The N key does the same.
function mountToggle(state) {
  const toggle = document.querySelector("[data-sky-toggle]");
  const mark = () => {
    const name = state.wanted ? "day" : "night";
    document.documentElement.dataset.sky = name;
    toggle?.setAttribute("aria-label", state.wanted ? t("Switch to night", "Passer à la nuit") : t("Switch to day", "Passer au jour"));
  };
  const flip = () => {
    state.wanted = state.wanted ? 0 : 1;
    remember(state.wanted ? "day" : "night");
    mark();
  };
  toggle?.addEventListener("click", flip);
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "n" && !event.target.closest("input, textarea")) flip();
  });
  document.addEventListener("riviera:lang", mark);
  return mark;
}

// Returns { update(delta) }: eases the world toward the sky the visitor picked.
export function makeDaylight(built, renderer, post, calm) {
  const world = targets(built, renderer, post);
  const state = { wanted: stored() === "day" ? 1 : 0 };
  let shown = state.wanted;
  let applied = -1;
  const mark = mountToggle(state);
  mark();
  return {
    update(delta) {
      const wanted = state.wanted;
      if (calm) shown = wanted;
      else shown += Math.sign(wanted - shown) * Math.min(Math.abs(wanted - shown), delta / CYCLE_SECONDS);
      if (shown === applied) return;
      applied = shown;
      apply(world, smooth(shown));
    },
  };
}
