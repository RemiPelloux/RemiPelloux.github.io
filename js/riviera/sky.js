// Blue-hour sky: deep night overhead, a pale band on the horizon, brightest in the west where the sun went down.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, MOON } from "./palette.js";

const RADIUS = 250000;

const vertexShader = `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vDirection;
void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}`;

const fragmentShader = `
uniform vec3 zenith, middle, horizon, afterglow, moonDir;
varying vec3 vDirection;
#include <logdepthbuf_pars_fragment>
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  #include <logdepthbuf_fragment>
  vec3 direction = normalize(vDirection); // per pixel, so the moon stays round on the large sphere triangles
  float up = clamp(direction.y, 0.0, 1.0);
  vec3 color = mix(horizon, middle, smoothstep(0.0, 0.18, up));
  color = mix(color, zenith, smoothstep(0.18, 0.75, up));
  float west = pow(max(0.0, -direction.x * 0.8 + direction.z * 0.2), 3.0);
  color += afterglow * west * (1.0 - smoothstep(0.0, 0.25, up)) * 0.9;
  vec3 cell = floor(direction * 420.0);
  float star = step(0.9975, hash(cell)) * smoothstep(0.25, 0.6, up);
  color += vec3(star * 0.7);
  float moon = dot(direction, normalize(moonDir));
  color += vec3(0.95, 0.97, 1.0) * smoothstep(0.99955, 0.9997, moon) + afterglow * pow(max(moon, 0.0), 900.0) * 0.5;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;

export const HORIZON = new THREE.Color(BLUE.horizon);

export function makeSky() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      zenith: { value: new THREE.Color(BLUE.night) },
      middle: { value: new THREE.Color(BLUE.deep) },
      horizon: { value: HORIZON },
      afterglow: { value: new THREE.Color(BLUE.glow) },
      moonDir: { value: new THREE.Vector3(...MOON) },
    },
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 48, 24), material);
  sky.renderOrder = -1;
  return sky;
}

export function makeLights() {
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight(BLUE.glow, BLUE.deep, 1.0));
  const moon = new THREE.DirectionalLight(BLUE.foam, 0.8);
  moon.position.set(-4000, 3000, 1500);
  group.add(moon);
  return group;
}
