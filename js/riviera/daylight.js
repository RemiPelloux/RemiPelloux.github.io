// Night and day. The sky switch turns the world between blue hour and a bright Riviera day, as one eased
// sunrise or sunset: the sky, fog, sea and lights move together, the stars fade, and the windows go dark.
// The moon disc low over the sea becomes the sun, and its path on the water stays.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";

const CYCLE_SECONDS = 2.6;
const KEY = "riviera-sky";

// Each entry: [night, day]. Colours are lerped, numbers are lerped.
const LOOK = {
  zenith: [BLUE.night, "#2F77C1"],
  middle: [BLUE.deep, "#6E9FD5"],
  horizon: [BLUE.horizon, "#C9DCF0"],
  afterglow: [BLUE.glow, "#FFFFFF"],
  seaDeep: [BLUE.abyss, BLUE.sea],
  seaMid: [BLUE.sea, BLUE.antibes],
  seaShallow: [BLUE.shallow, "#3FB5D8"],
  seaSky: [BLUE.horizon, "#B7CFEA"],
  hemiSky: [BLUE.glow, "#FFFFFF"],
  hemiGround: [BLUE.deep, BLUE.sea],
  hemi: [1.0, 2.1],
  sun: [0.8, 2.6],
  windows: [0.55, 0.04],
  wallLight: [1, 1.6],
  groundLight: [1, 2.8],
  roads: [0.85, 0.25],
  roofGlow: [0.25, 0.0],
  stoneGlow: [0.35, 0.08],
  bloom: [0.75, 0.22],
  threshold: [0.62, 0.92],
  exposure: [1.0, 1.08],
};

const smooth = (x) => x * x * (3 - 2 * x);

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

// Returns { update(delta), toggle(), sky() }. The switch buttons carry data-sky-button="night|day".
export function makeDaylight(built, renderer, post, calm) {
  const world = targets(built, renderer, post);
  let wanted = stored() === "day" ? 1 : 0;
  let shown = wanted;
  let applied = -1;
  const buttons = [...document.querySelectorAll("[data-sky-button]")];
  const mark = () => {
    const name = wanted ? "day" : "night";
    document.documentElement.dataset.sky = name;
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.skyButton === name));
  };
  const set = (name) => {
    wanted = name === "day" ? 1 : 0;
    remember(name);
    mark();
  };
  for (const button of buttons) button.addEventListener("click", () => set(button.dataset.skyButton));
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "n" && !event.target.closest("input, textarea")) set(wanted ? "night" : "day");
  });
  mark();
  return {
    update(delta) {
      if (calm) shown = wanted;
      else shown += Math.sign(wanted - shown) * Math.min(Math.abs(wanted - shown), delta / CYCLE_SECONDS);
      if (shown === applied) return;
      applied = shown;
      apply(world, smooth(shown));
    },
  };
}
