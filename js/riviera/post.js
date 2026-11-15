// The finishing passes: bloom on everything that emits light (windows, towers, the lighthouse, the moon),
// then a cinema pass with a soft vignette and a touch of lens fringing at the edges. No film grain: it read as noise.
import * as THREE from "/vendor/three/three.module.min.js";
import { EffectComposer } from "/vendor/three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "/vendor/three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/vendor/three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "/vendor/three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "/vendor/three/addons/postprocessing/OutputPass.js";

const BLOOM = { strength: 0.75, radius: 0.55, threshold: 0.62 };

const CinemaShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec2 centred = vUv - 0.5;
      float edge = dot(centred, centred);
      vec2 shift = centred * edge * 0.012;
      vec3 colour = vec3(texture2D(tDiffuse, vUv + shift).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - shift).b);
      colour *= 1.0 - smoothstep(0.22, 0.8, edge) * 0.3; // a soft vignette, not a dark frame
      if (any(isnan(colour)) || any(isinf(colour))) colour = vec3(0.0); // never let a bad pixel reach the screen
      gl_FragColor = vec4(colour, 1.0);
    }`,
};

// The bloom's bright-pass drops any NaN or infinite pixel: one bad pixel would otherwise be blurred
// through every bloom level into a black square that flickers in and out.
function sanitiseBloom(bloom) {
  const material = bloom.materialHighPassFilter;
  material.fragmentShader = material.fragmentShader.replace(
    "vec4 texel = texture2D( tDiffuse, vUv );",
    "vec4 texel = texture2D( tDiffuse, vUv );\n\t\t\tif ( any( isnan( texel ) ) || any( isinf( texel ) ) ) texel = vec4( 0.0 );\n\t\t\ttexel = min( texel, vec4( 32.0 ) );",
  );
  material.needsUpdate = true;
}

// The scene renders into a multisampled half-float target: anti-aliasing happens there, once,
// instead of on the screen buffer that the passes overwrite anyway.
function sceneTarget(renderer) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  return new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: 4 });
}

export function makePost(renderer, scene, camera) {
  const composer = new EffectComposer(renderer, sceneTarget(renderer));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
  sanitiseBloom(bloom);
  const cinema = new ShaderPass(CinemaShader);
  composer.addPass(bloom);
  composer.addPass(cinema);
  composer.addPass(new OutputPass());
  return {
    resize: (width, height) => composer.setSize(width, height),
    setPixelRatio: (ratio) => composer.setPixelRatio(ratio),
    setBloom: (strength, threshold) => Object.assign(bloom, { strength, threshold }),
    render: () => composer.render(),
  };
}
