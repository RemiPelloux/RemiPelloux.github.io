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

// The painted rooftops are dark navy; used as they are, roofs vanish into the night ground. This keeps
// only their detail: the image is evened out around a light grey, and the material colour sets the tone.
const DETAIL_MEAN = 0.82;
const DETAIL_CONTRAST = 0.6;

function detailOf(image) {
  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [image.width, image.height];
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += data[i] + data[i + 1] + data[i + 2];
  const mean = sum / (data.length * 0.75) / 255;
  for (let i = 0; i < data.length; i += 4) {
    const grey = (data[i] + data[i + 1] + data[i + 2]) / 765;
    const value = Math.min(1, Math.max(0, DETAIL_MEAN + (grey - mean) * (DETAIL_CONTRAST / Math.max(0.05, mean))));
    data[i] = data[i + 1] = data[i + 2] = value * 255;
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

// Resolves to { images, textures }, keyed by name. Images feed the canvas-painted ground.
export async function loadTextures(renderer) {
  const images = Object.fromEntries(await Promise.all(NAMES.map(async (name) => [name, await loadImage(name)])));
  const textures = Object.fromEntries(NAMES.map((name) => [name, toTexture(images[name], renderer)]));
  textures.sky.wrapT = THREE.ClampToEdgeWrapping;
  textures.roof = toTexture(detailOf(images.roof), renderer);
  return { images, textures };
}
