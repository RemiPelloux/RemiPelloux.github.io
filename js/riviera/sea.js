// The Mediterranean: deep blue offshore, turquoise in the shallows, the sky reflected at grazing angles.
// The surface only shimmers; it does not roll. With reduced motion it is still.
import * as THREE from "/vendor/three/three.module.min.js";
import { BLUE, MOON } from "./palette.js";

const SIZE = 400000; // past the real horizon from the highest camera stop

const vertexShader = `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
  #include <logdepthbuf_vertex>
}`;

const fragmentShader = `
uniform vec3 deep, mid, shallow, lagoon, sky, fogColor, moonDir;
uniform float fogNear, fogFar, time;
uniform sampler2D shore;
uniform vec4 bounds;
varying vec3 vWorld;
#include <logdepthbuf_pars_fragment>

float shoreAt(vec3 p) {
  vec2 uv = vec2((p.x - bounds.x) / (bounds.z - bounds.x), (-p.z - bounds.y) / (bounds.w - bounds.y));
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  return texture2D(shore, uv).r;
}

// Value noise on a hash with no sin(): sin() of large world coordinates loses float precision on the
// GPU and makes the waves jitter from frame to frame. This one stays stable far from the origin.
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
// Three octaves of swell. Each octave fades out once its waves get smaller than a pixel on screen
// (footprint: how much of p one pixel covers), so distant water cannot shimmer or sparkle.
float swell(vec2 p, float footprint) {
  float t = time * 0.18;
  float a = 1.0 - smoothstep(0.35, 0.9, footprint);
  float b = 1.0 - smoothstep(0.35, 0.9, footprint * 2.3);
  float c = 1.0 - smoothstep(0.35, 0.9, footprint * 5.1);
  return noise(p + vec2(t, t * 0.6)) * 0.55 * a + noise(p * 2.3 - vec2(t * 1.3, -t)) * 0.3 * b + noise(p * 5.1 + vec2(-t * 1.7, t * 1.2)) * 0.15 * c;
}

void main() {
  #include <logdepthbuf_fragment>
  float s = shoreAt(vWorld);
  vec3 water = mix(deep, mid, smoothstep(0.02, 0.35, s));
  water = mix(water, shallow, smoothstep(0.3, 0.9, s) * 0.45);
  water = mix(water, lagoon, smoothstep(0.9, 1.0, s) * 0.15);
  vec3 toEye = cameraPosition - vWorld;
  float distanceToEye = length(toEye);
  vec3 view = toEye / distanceToEye;
  // Waves fade out with distance, so far water stays calm instead of shimmering.
  float detail = 1.0 - smoothstep(600.0, 7000.0, distanceToEye);
  vec2 p = vWorld.xz * 0.028;
  float footprint = max(length(fwidth(p)), 1e-4);
  float e = 0.15;
  vec2 slope = vec2(swell(p + vec2(e, 0.0), footprint) - swell(p - vec2(e, 0.0), footprint), swell(p + vec2(0.0, e), footprint) - swell(p - vec2(0.0, e), footprint)) / (2.0 * e);
  vec3 normal = normalize(vec3(-slope.x * 0.22 * detail, 1.0, -slope.y * 0.22 * detail));
  float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(normal, view), 0.0), 5.0);
  vec3 reflected = reflect(-view, normal);
  vec3 skyColour = mix(sky, mid * 0.6, smoothstep(0.0, 0.5, reflected.y));
  vec3 color = mix(water, skyColour, clamp(fresnel, 0.0, 0.85));
  // The path of the moon or the sun on the water: a soft glow with a sharper glint inside it.
  float facing = max(dot(reflected, normalize(moonDir)), 0.0);
  color += vec3(0.85, 0.92, 1.0) * (pow(facing, 380.0) * 1.6 + pow(facing, 60.0) * 0.12);
  float fog = smoothstep(fogNear, fogFar, distanceToEye);
  gl_FragColor = vec4(mix(color, fogColor, fog), 1.0);
  #include <colorspace_fragment>
}`;

export function makeSea(world, shore, fog) {
  const [minX, minY, maxX, maxY] = world.bounds;
  const color = (hex) => new THREE.Color(hex);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      deep: { value: color(BLUE.abyss) },
      mid: { value: color(BLUE.sea) },
      shallow: { value: color(BLUE.shallow) },
      lagoon: { value: color(BLUE.lagoon) },
      sky: { value: color(BLUE.horizon) },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
      time: { value: 0 },
      moonDir: { value: new THREE.Vector3(...MOON) },
      shore: { value: shore },
      bounds: { value: new THREE.Vector4(minX, minY, maxX, maxY) },
    },
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), material);
  sea.rotateX(-Math.PI / 2);
  return sea;
}
