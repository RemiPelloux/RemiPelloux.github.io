// Loads the Antibes world: OpenStreetMap features and a heightmap, both built offline.

export const RELIEF = 1.4; // vertical exaggeration, so the Cap's plateau reads from the sea

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function readHeights(image, step) {
  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [image.width, image.height];
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, image.width, image.height).data;
  const heights = new Float32Array(image.width * image.height);
  for (let i = 0; i < heights.length; i += 1) heights[i] = pixels[i * 4] * step;
  return heights;
}

// Bilinear height in metres at a world point, 0 at sea and outside the map.
function sampler(world) {
  const [minX, minY, maxX, maxY] = world.bounds;
  const [columns, rows] = world.grid;
  const at = (i, j) => world.heights[Math.min(rows - 1, j) * columns + Math.min(columns - 1, i)];
  return (x, y) => {
    const fx = ((x - minX) / (maxX - minX)) * (columns - 1);
    const fy = ((maxY - y) / (maxY - minY)) * (rows - 1);
    if (fx < 0 || fy < 0 || fx > columns - 1 || fy > rows - 1) return 0;
    const [i, j] = [Math.floor(fx), Math.floor(fy)];
    const [u, v] = [fx - i, fy - j];
    const top = at(i, j) * (1 - u) + at(i + 1, j) * u;
    const bottom = at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u;
    return (top * (1 - v) + bottom * v) * RELIEF;
  };
}

export async function loadWorld(base) {
  const [world, image] = await Promise.all([
    fetch(`${base}world.json`).then((response) => response.json()),
    loadImage(`${base}height.png`),
  ]);
  world.heights = readHeights(image, world.heightStep);
  world.heightAt = sampler(world);
  return world;
}
