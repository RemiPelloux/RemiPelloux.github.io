// The painted textures: a facade, rooftops, the ground, Fort Carré's stone and the night sky.
// Generated once with an image model, made seamless, and served as small WebP files.
import * as THREE from "/vendor/three/three.module.min.js";

const NAMES = ["facade", "roof", "ground", "stone", "sky"];

function loadImage(name) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `/assets/riviera/tex/${name}.webp`;
  });
}

function toTexture(image, renderer) {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

// Resolves to { images, textures }, keyed by name. Images feed the canvas-painted ground.
export async function loadTextures(renderer) {
  const images = Object.fromEntries(await Promise.all(NAMES.map(async (name) => [name, await loadImage(name)])));
  const textures = Object.fromEntries(NAMES.map((name) => [name, toTexture(images[name], renderer)]));
  textures.sky.wrapT = THREE.ClampToEdgeWrapping;
  return { images, textures };
}
