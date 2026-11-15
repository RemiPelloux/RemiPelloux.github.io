// Every building in Antibes from OpenStreetMap, extruded to its mapped or estimated height,
// dressed with a painted facade (lit windows included) and painted rooftops.
import * as THREE from "/vendor/three/three.module.min.js";
import { LAND } from "./palette.js";
import { Mesher, extrude, lowestGround, seeded, toVec2 } from "./geometry.js";

const BURY = 3; // walls go this far below the lowest ground point, so no building floats
const WINDOW_GLOW = 0.55;
const BLUE_ROOF = new THREE.Color(LAND.stoneShade); // a little light of their own, so roofs never sink into the ground

function addBuilding(meshers, record, scene) {
  const [doubledHeight, ...flat] = record;
  const outline = toVec2(flat);
  if (outline.length < 3) return;
  const ground = lowestGround(outline, scene.heightAt);
  const shade = 0.72 + scene.random() * 0.28;
  const roof = new THREE.Color(LAND.stone).multiplyScalar(shade); // pale stone roofs, as seen from above at night
  extrude(meshers, [outline], { base: ground - BURY, top: ground + doubledHeight / 2, color: roof, wallColor: new THREE.Color().setScalar(shade) });
}

function wallMaterial(facade) {
  return new THREE.MeshLambertMaterial({ map: facade, vertexColors: true, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: facade, emissiveIntensity: WINDOW_GLOW });
}

export function makeBuildings(world, textures) {
  const meshers = { roofs: new Mesher(), walls: new Mesher() };
  const scene = { heightAt: world.heightAt, random: seeded(1550) };
  for (const record of world.buildings) addBuilding(meshers, record, scene);
  const roofs = new THREE.Mesh(meshers.roofs.build(), new THREE.MeshLambertMaterial({ map: textures.roof, vertexColors: true, side: THREE.DoubleSide, emissive: BLUE_ROOF, emissiveIntensity: 0.25 }));
  const walls = new THREE.Mesh(meshers.walls.build(), wallMaterial(textures.facade));
  return new THREE.Group().add(roofs, walls);
}
