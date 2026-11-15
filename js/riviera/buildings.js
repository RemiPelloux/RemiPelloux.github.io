// Every building in Antibes from OpenStreetMap, extruded to its mapped or estimated height.
// At blue hour about a third of them have lit windows, drawn by the shader, not by geometry.
import * as THREE from "/vendor/three/three.module.min.js";
import { LAND } from "./palette.js";
import { Mesher, extrude, lowestGround, seeded, toVec2 } from "./geometry.js";

const LIT_SHARE = 0.34;
const BURY = 3; // walls go this far below the lowest ground point, so no building floats

const WINDOWS = `
float wall = 1.0 - step(0.6, abs(vNormalWorld.y));
float floorBand = step(0.42, fract(vWorldPos.y / 3.1)) * step(fract(vWorldPos.y / 3.1), 0.82);
float bay = step(0.38, fract((vWorldPos.x + vWorldPos.z) / 2.7));
totalEmissiveRadiance += wall * floorBand * bay * vLit * vec3(0.72, 0.86, 1.0) * 1.6;
`;

function withWindows(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aLit;\nvarying float vLit;\nvarying vec3 vWorldPos;\nvarying vec3 vNormalWorld;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvLit = aLit;\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvNormalWorld = normalize(mat3(modelMatrix) * objectNormal);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLit;\nvarying vec3 vWorldPos;\nvarying vec3 vNormalWorld;")
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${WINDOWS}`);
  };
  return material;
}

function addBuilding(mesher, record, scene) {
  const [doubledHeight, ...flat] = record;
  const outline = toVec2(flat);
  if (outline.length < 3) return;
  const ground = lowestGround(outline, scene.heightAt);
  const shade = 0.82 + scene.random() * 0.18;
  extrude(mesher, [outline], {
    base: ground - BURY,
    top: ground + doubledHeight / 2,
    color: scene.roof.clone().multiplyScalar(shade),
    wallColor: scene.wall.clone().multiplyScalar(shade),
    extra: scene.random() < LIT_SHARE ? 0.55 + scene.random() * 0.45 : 0,
  });
}

export function makeBuildings(world) {
  const mesher = new Mesher();
  const scene = {
    heightAt: world.heightAt,
    random: seeded(1550),
    roof: new THREE.Color(LAND.stone),
    wall: new THREE.Color(LAND.stoneShade),
  };
  for (const record of world.buildings) addBuilding(mesher, record, scene);
  const material = withWindows(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  return new THREE.Mesh(mesher.build("aLit"), material);
}
