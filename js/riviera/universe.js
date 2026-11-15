// Chapter 02 and 03: eight district platforms float over inland Antibes, and every public repository
// stands on its district as a tower. Taller towers have more stars; brighter ones were pushed more recently.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";
import { DISTRICTS } from "./catalog.js";

export const CENTRE = { x: -1250, y: 1450 };
export const ALTITUDE = 300;
const RING = 560;
const TOWER_WIDTH = 15;
const DAY_MS = 86_400_000;

function towerHeight(repo) {
  return 28 + 34 * Math.log2(1 + repo.stars) + (repo.featured ? 40 : 0);
}

function freshness(repo, now) {
  const days = (now - Date.parse(repo.pushed)) / DAY_MS;
  return Math.max(0, 1 - days / 900);
}

// District centres on a ring, repositories on a golden-angle spiral around each centre.
export function layout(repos) {
  const now = Date.now();
  const districts = DISTRICTS.map((district, i) => {
    const angle = (i / DISTRICTS.length) * Math.PI * 2;
    return { ...district, x: CENTRE.x + Math.cos(angle) * RING, y: CENTRE.y + Math.sin(angle) * RING, repos: [] };
  });
  const byKey = new Map(districts.map((d) => [d.key, d]));
  for (const repo of repos.filter((r) => !r.fork)) {
    const district = byKey.get(repo.category);
    const k = district.repos.length;
    const radius = 34 + 26 * Math.sqrt(k);
    const angle = k * 2.39996;
    district.repos.push({ repo, x: district.x + Math.cos(angle) * radius, y: district.y + Math.sin(angle) * radius, height: towerHeight(repo), fresh: freshness(repo, now) });
  }
  for (const d of districts) d.radius = 60 + 26 * Math.sqrt(d.repos.length);
  return districts;
}

function platforms(districts) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: BLUE.antibes, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
  const rim = new THREE.LineBasicMaterial({ color: BLUE.glow, transparent: true, opacity: 0.8 });
  for (const d of districts) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(d.radius, 6).rotateX(-Math.PI / 2), material);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CircleGeometry(d.radius, 6)).rotateX(-Math.PI / 2), rim);
    disc.position.set(d.x, ALTITUDE, -d.y);
    edge.position.copy(disc.position);
    group.add(disc, edge);
  }
  return group;
}

// Faint lines from each tower to its district centre, and around the ring of districts.
function links(districts) {
  const points = [];
  districts.forEach((d, i) => {
    const next = districts[(i + 1) % districts.length];
    points.push(d.x, ALTITUDE, -d.y, next.x, ALTITUDE, -next.y);
    for (const t of d.repos) points.push(d.x, ALTITUDE, -d.y, t.x, ALTITUDE, -t.y);
  });
  const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color: BLUE.glow, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  return new THREE.LineSegments(geometry, material);
}

// Towers glow brighter toward the top, carry slow scan lines and a rim of light: bloom does the rest.
const HOLOGRAM_VERTEX = "#include <project_vertex>\nvHeight = position.y;\nvWorldY = (modelMatrix * instanceMatrix * vec4(position, 1.0)).y;\nvRim = 1.0 - abs(dot(normalize(normalMatrix * mat3(instanceMatrix) * objectNormal), vec3(0.0, 0.0, 1.0)));";
const HOLOGRAM_FRAGMENT = "#include <emissivemap_fragment>\nfloat scan = smoothstep(0.82, 1.0, fract(vWorldY * 0.06 - time * 0.25));\ntotalEmissiveRadiance += vColor * (0.18 + 0.9 * vHeight * vHeight + scan * 0.35 + pow(clamp(vRim, 0.0, 1.0), 3.0) * 0.6);";

function hologram(material, time) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying float vHeight;\nvarying float vWorldY;\nvarying float vRim;").replace("#include <project_vertex>", HOLOGRAM_VERTEX);
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform float time;\nvarying float vHeight;\nvarying float vWorldY;\nvarying float vRim;").replace("#include <emissivemap_fragment>", HOLOGRAM_FRAGMENT);
  };
  return material;
}

function towers(entries, time) {
  const geometry = new THREE.BoxGeometry(TOWER_WIDTH, 1, TOWER_WIDTH).translate(0, 0.5, 0);
  const material = hologram(new THREE.MeshLambertMaterial({ color: 0x4a6f9c, transparent: true, opacity: 0.92 }), time);
  const mesh = new THREE.InstancedMesh(geometry, material, entries.length);
  entries.forEach((t, i) => mesh.setColorAt(i, baseColour(t)));
  return mesh;
}

export function baseColour(tower) {
  if (tower.repo.featured) return new THREE.Color(BLUE.white);
  return new THREE.Color(BLUE.sea).lerp(new THREE.Color(BLUE.glow), 0.35 + tower.fresh * 0.65);
}

const ease = (x) => 1 - (1 - x) ** 3;

export class Universe {
  constructor(repos) {
    this.districts = layout(repos);
    this.entries = this.districts.flatMap((d) => d.repos);
    this.group = new THREE.Group();
    this.time = { value: 0 };
    this.towers = towers(this.entries, this.time);
    this.links = links(this.districts);
    this.group.add(platforms(this.districts), this.links, this.towers);
    this.matrix = new THREE.Matrix4();
    this.rise = -1;
  }

  // 0: nothing has risen, 1: every tower at full height. Towers rise in turn, district by district.
  setRise(rise) {
    if (Math.abs(rise - this.rise) < 0.002) return;
    this.rise = rise;
    this.entries.forEach((t, i) => {
      const grown = ease(Math.min(1, Math.max(0, rise * 1.8 - (i / this.entries.length) * 0.8)));
      this.matrix.makeScale(1, Math.max(0.01, t.height * grown), 1).setPosition(t.x, ALTITUDE, -t.y);
      this.towers.setMatrixAt(i, this.matrix);
    });
    this.towers.instanceMatrix.needsUpdate = true;
    this.towers.boundingSphere = null; // so picking sees the new heights
    this.links.material.opacity = 0.35 * rise;
    this.group.visible = rise > 0.001;
  }

  find(name) {
    return this.entries.find((t) => t.repo.name === name);
  }

  // Lights up the towers that pass the test and dims the rest; no test restores the colours.
  highlight(test) {
    this.entries.forEach((t, i) => {
      const colour = !test ? baseColour(t) : test(t.repo) ? new THREE.Color(BLUE.white) : new THREE.Color(BLUE.deep);
      this.towers.setColorAt(i, colour);
    });
    this.towers.instanceColor.needsUpdate = true;
  }
}

// A camera stop outside the ring, a little to the side, looking at the top of a tower.
export function towerView(tower, distance = 170) {
  const out = new THREE.Vector2(tower.x - CENTRE.x, tower.y - CENTRE.y).normalize();
  const side = new THREE.Vector2(-out.y, out.x);
  const x = tower.x + out.x * distance + side.x * 60;
  const y = tower.y + out.y * distance + side.y * 60;
  const top = ALTITUDE + tower.height;
  return [x, top + 60, -y, tower.x, top + 10, -tower.y];
}

// The stops of chapters 02 to 05, worked out from where the districts and towers stand.
export function universeStops(universe) {
  const c = CENTRE;
  const stops = {
    domains: [c.x + 1250, 820, -(c.y - 1050), c.x, ALTITUDE - 40, -c.y],
    universe: [c.x + 640, 560, -(c.y - 600), c.x, ALTITUDE + 40, -c.y],
    flagships: [c.x - 760, 700, -(c.y + 1350), c.x, ALTITUDE + 60, -c.y], // far enough back to frame the whole ring
    engineering: [c.x + 1000, 1250, -(c.y - 1450), c.x, ALTITUDE, -c.y],
  };
  // Every flagship section shares the one overview, so the camera stays put through chapter 04
  // and the flagship on screen lights up instead.
  for (const tower of universe.entries.filter((t) => t.repo.featured)) stops[`feature-${tower.repo.name}`] = stops.flagships;
  return stops;
}
