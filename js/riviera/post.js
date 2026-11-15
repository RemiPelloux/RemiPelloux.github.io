// The finishing passes: bloom on everything that emits light (windows, towers, the lighthouse, the moon),
// then a cinema pass with a soft vignette, faint film grain and a touch of lens fringing at the edges.
import * as THREE from "/vendor/three/three.module.min.js";
import { EffectComposer } from "/vendor/three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "/vendor/three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/vendor/three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "/vendor/three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "/vendor/three/addons/postprocessing/OutputPass.js";

const BLOOM = { strength: 0.75, radius: 0.55, threshold: 0.62 };

const CinemaShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.035 } },
  vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time, grain;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 centred = vUv - 0.5;
      float edge = dot(centred, centred);
      vec2 shift = centred * edge * 0.012;
      vec3 colour = vec3(texture2D(tDiffuse, vUv + shift).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - shift).b);
      colour *= 1.0 - smoothstep(0.18, 0.75, edge) * 0.55;
      colour += (hash(vUv * 900.0 + time) - 0.5) * grain;
      gl_FragColor = vec4(colour, 1.0);
    }`,
};

export function makePost(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
  const cinema = new ShaderPass(CinemaShader);
  composer.addPass(bloom);
  composer.addPass(cinema);
  composer.addPass(new OutputPass());
  return {
    resize: (width, height) => composer.setSize(width, height),
    render: (seconds) => {
      cinema.uniforms.time.value = seconds % 100;
      composer.render();
    },
  };
}
