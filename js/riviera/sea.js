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

void main() {
  #include <logdepthbuf_fragment>
  float s = shoreAt(vWorld);
  vec3 water = mix(deep, mid, smoothstep(0.02, 0.35, s));
  water = mix(water, shallow, smoothstep(0.3, 0.9, s) * 0.45);
  water = mix(water, lagoon, smoothstep(0.9, 1.0, s) * 0.15);
  vec3 toEye = cameraPosition - vWorld;
  float distanceToEye = length(toEye);
  float grazing = pow(1.0 - clamp(toEye.y / distanceToEye, 0.0, 1.0), 4.0);
  vec2 p = vWorld.xz * 0.035;
  float ripple = sin(p.x * 3.1 + time * 0.5) * sin(p.y * 2.3 - time * 0.4) + 0.5 * sin((p.x - p.y) * 5.7 + time * 0.9);
  float glint = smoothstep(1.25, 1.45, ripple) * grazing;
  vec3 color = mix(water, sky, grazing * 0.5) + glint * 0.25 * sky;
  // The moon's path on the water: the view reflected off a slightly rippled surface.
  vec2 q = vWorld.xz * 0.11;
  float nx = sin(q.x * 1.7 + q.y * 0.6 + time * 0.7) + 0.6 * sin(q.x * 4.3 - q.y * 2.9 - time * 1.1) + 0.35 * sin(q.y * 9.1 + q.x * 3.3 + time * 1.7);
  float nz = sin(q.y * 1.9 - q.x * 0.8 - time * 0.6) + 0.6 * sin(q.y * 4.7 + q.x * 2.1 + time * 0.9) + 0.35 * sin(q.x * 8.7 - q.y * 3.7 - time * 1.5);
  vec3 normal = normalize(vec3(nx * 0.045, 1.0, nz * 0.045));
  float path = pow(max(dot(reflect(-toEye / distanceToEye, normal), normalize(moonDir)), 0.0), 380.0);
  color += vec3(0.85, 0.92, 1.0) * path * 0.9 * smoothstep(250.0, 1800.0, distanceToEye);
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
