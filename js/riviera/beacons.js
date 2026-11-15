// The Garoupe lighthouse on the Cap's plateau, with a turning beam, and the light at the end of the port.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE } from "./palette.js";

// Phare de la Garoupe, 43.5641 N 7.1338 E, in world metres from the map origin.
export const GAROUPE = { x: 912, y: -490 };
const TOWER_HEIGHT = 29;
const BEAM_LENGTH = 1100;
const TURN_SECONDS = 9;

function tower(height) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.2, height, 10), new THREE.MeshLambertMaterial({ color: BLUE.white }));
  body.position.y = height / 2;
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 8), new THREE.MeshBasicMaterial({ color: BLUE.white }));
  lamp.position.y = height + 2;
  return group.add(body, lamp);
}

const beamShader = {
  vertexShader: "#include <common>\n#include <logdepthbuf_pars_vertex>\nvarying float vAlong;\nvoid main() { vAlong = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n#include <logdepthbuf_vertex>\n}",
  fragmentShader: "#include <logdepthbuf_pars_fragment>\nuniform vec3 color; varying float vAlong;\nvoid main() {\n#include <logdepthbuf_fragment>\ngl_FragColor = vec4(color, 0.16 * pow(vAlong, 2.2)); }",
};

function beam() {
  const geometry = new THREE.ConeGeometry(45, BEAM_LENGTH, 24, 1, true).translate(0, -BEAM_LENGTH / 2, 0).rotateZ(Math.PI / 2);
  const material = new THREE.ShaderMaterial({ ...beamShader, uniforms: { color: { value: new THREE.Color(BLUE.foam) } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const pivot = new THREE.Group();
  const left = new THREE.Mesh(geometry, material);
  const right = left.clone();
  right.rotation.y = Math.PI;
  return pivot.add(left, right);
}

// A soft glow around the lamp, so the lighthouse reads from kilometres out at sea.
function halo(size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgb(244 249 255 / 1)");
  gradient.addColorStop(0.25, "rgb(169 205 242 / 0.5)");
  gradient.addColorStop(1, "rgb(169 205 242 / 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(size);
  return sprite;
}

export function makeBeacons(world) {
  const group = new THREE.Group();
  const garoupe = tower(TOWER_HEIGHT);
  garoupe.position.set(GAROUPE.x, world.heightAt(GAROUPE.x, GAROUPE.y), -GAROUPE.y);
  const sweep = beam();
  sweep.position.y = TOWER_HEIGHT + 2;
  const glow = halo(90);
  glow.position.y = TOWER_HEIGHT + 2;
  garoupe.add(sweep, glow);
  group.add(garoupe);
  const portLight = world.named.find((place) => place.k === "lighthouse" && place.p[1] > 2000);
  if (portLight) {
    const small = tower(12);
    small.position.set(portLight.p[0], 1, -portLight.p[1]);
    group.add(small);
  }
  group.userData.turn = (seconds) => (sweep.rotation.y = (seconds / TURN_SECONDS) * Math.PI * 2);
  return group;
}
