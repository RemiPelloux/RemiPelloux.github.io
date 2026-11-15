// The sky: a gradient from the sea horizon up, drifting clouds lit by the sun or the moon, the painted
// night sky behind them, and the moon and the sun. Blue hour by night, a clear Riviera day by day.
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
uniform vec3 zenith, middle, horizon, afterglow, moonDir, sunDir;
uniform sampler2D stars;
uniform float night; // 1 at night, 0 by day
uniform float time;
varying vec3 vDirection;
#include <logdepthbuf_pars_fragment>

// Stable value noise (no sin(), see sea.js) and five octaves of it for the clouds.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float sum = 0.0, amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += noise(p) * amplitude;
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return sum;
}

// How much cloud covers this direction: a layer high above, seen in perspective, drifting slowly,
// thinning toward the horizon so the sea line stays clean.
float clouds(vec3 direction) {
  if (direction.y <= 0.0) return 0.0;
  vec2 uv = direction.xz / (direction.y + 0.12) * 1.4 + vec2(time * 0.006, time * 0.0025);
  float shape = fbm(uv) * 0.75 + fbm(uv * 3.1 - vec2(time * 0.004, 0.0)) * 0.25;
  return smoothstep(0.5, 0.78, shape) * smoothstep(0.02, 0.22, direction.y);
}

void main() {
  #include <logdepthbuf_fragment>
  vec3 direction = normalize(vDirection); // per pixel, so the moon stays round on the large sphere triangles
  float up = clamp(direction.y, 0.0, 1.0);
  vec3 moonAt = normalize(moonDir);
  vec3 sunAt = normalize(sunDir);
  float sunUp = smoothstep(-0.04, 0.03, sunAt.y);
  float moonUp = smoothstep(-0.03, 0.02, moonAt.y);
  float sun = max(dot(direction, sunAt), 0.0);
  float moon = max(dot(direction, moonAt), 0.0);

  // The gradient, the last light in the west, and a wide glow around the sun near the horizon.
  vec3 color = mix(horizon, middle, smoothstep(0.0, 0.18, up));
  color = mix(color, zenith, smoothstep(0.18, 0.75, up));
  float west = pow(max(0.0, -direction.x * 0.8 + direction.z * 0.2), 3.0);
  color += afterglow * west * (1.0 - smoothstep(0.0, 0.25, up)) * 0.9 * night;
  color += vec3(1.0, 0.97, 0.92) * pow(sun, 6.0) * (1.0 - smoothstep(0.0, 0.35, up)) * 0.28 * sunUp;

  // Clouds: white with a bright edge toward the sun by day, dim and silvered near the moon at night.
  float cover = clouds(direction);
  vec3 dayCloud = mix(vec3(0.86, 0.91, 0.97), vec3(1.0), pow(sun, 4.0) * 0.6) * (0.82 + 0.18 * up);
  vec3 nightCloud = mix(middle * 1.35, vec3(0.55, 0.64, 0.78), pow(moon, 6.0) * 0.7 * moonUp);
  color = mix(color, mix(dayCloud, nightCloud, night), cover * mix(0.85, 0.7, night));

  // The painted night sky, mirrored four times around the horizon so it has no seam, behind the clouds.
  vec2 uv = vec2(atan(direction.x, -direction.z) / 6.2831853 * 4.0, clamp(up * 1.25, 0.0, 1.0));
  vec3 painted = texture2D(stars, uv).rgb;
  color = mix(color, max(color, painted * 1.1), smoothstep(0.04, 0.4, up) * night * (1.0 - cover));

  // The moon and the sun, dimmed when a cloud passes in front.
  float clear = 1.0 - cover * 0.75;
  color += (vec3(0.95, 0.97, 1.0) * smoothstep(0.99955, 0.9997, moon) + afterglow * pow(moon, 900.0) * 0.5) * moonUp * clear;
  color += vec3(1.0, 0.98, 0.93) * smoothstep(0.99925, 0.9995, sun) * 1.6 * sunUp * clear;
  color += vec3(1.0, 0.97, 0.9) * (pow(sun, 260.0) * 0.45 + pow(sun, 18.0) * 0.12) * sunUp;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;

export const HORIZON = new THREE.Color(BLUE.horizon);

export function makeSky(stars) {
  stars.wrapS = THREE.MirroredRepeatWrapping;
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
      sunDir: { value: new THREE.Vector3(0, -1, 0) }, // below the sea until the day comes
      stars: { value: stars },
      night: { value: 1 },
      time: { value: 0 },
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
