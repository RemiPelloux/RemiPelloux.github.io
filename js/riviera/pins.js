// Glass cards pinned over the ten towers: the GitHub mark, the repository's name, its field and stars.
// Each opens the repository on GitHub in a new tab. They show once the towers have risen, and a card
// hides when it would cover a block of text or another card, tallest tower first.
import * as THREE from "/vendor/three/three.module.min.js";
import { DISTRICTS } from "./catalog.js";
import { lang } from "./lang.js";
import { ALTITUDE } from "./universe.js";

const GITHUB = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
const LIFT = 45; // metres above the tower top
const CARD = { width: 200, height: 62 }; // a card's footprint on screen, for the overlap test
const MARGIN = 12;

const field = (key) => DISTRICTS.find((d) => d.key === key)?.[lang()] ?? key;

function fill(pin) {
  const { repo } = pin.tower;
  pin.element.querySelector("small").textContent = `${field(repo.category)} · ★ ${repo.stars}`;
}

function element(tower) {
  const link = document.createElement("a");
  link.className = "pin";
  link.href = tower.repo.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.tabIndex = -1;
  link.innerHTML = `${GITHUB}<span><b></b><small></small></span>`;
  link.querySelector("b").textContent = tower.repo.name;
  return link;
}

// The card's box on screen when its stem points at (x, y): the card sits centred above the point.
const box = (x, y) => ({ left: x - CARD.width / 2, right: x + CARD.width / 2, top: y - CARD.height - 18, bottom: y });
const overlaps = (a, b) => a.left < b.right + MARGIN && a.right > b.left - MARGIN && a.top < b.bottom + MARGIN && a.bottom > b.top - MARGIN;

function show(pin, opacity, x, y) {
  const value = opacity.toFixed(2);
  if (value !== pin.opacity) {
    pin.element.style.opacity = pin.opacity = value;
    const live = opacity > 0.5;
    pin.element.style.pointerEvents = live ? "auto" : "none";
    pin.element.tabIndex = live ? 0 : -1;
  }
  if (opacity === 0) return;
  const transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  if (transform !== pin.transform) pin.element.style.transform = pin.transform = transform;
}

export function makePins(layer, universe) {
  const pins = [...universe.entries]
    .sort((a, b) => b.height - a.height)
    .map((tower) => ({ tower, point: new THREE.Vector3(tower.x, ALTITUDE + tower.height + LIFT, -tower.y), element: layer.appendChild(element(tower)) }));
  pins.forEach(fill);
  document.addEventListener("riviera:lang", () => pins.forEach(fill));
  const projected = new THREE.Vector3();
  // rise: how far the towers have risen (0 to 1); textBlocks: the story cards' rectangles.
  return function place(camera, size, textBlocks, rise) {
    const taken = textBlocks.filter((rect) => rect.width && rect.bottom > 0 && rect.top < size.y);
    const strength = Math.max(0, Math.min(1, (rise - 0.6) / 0.4));
    for (const pin of pins) {
      projected.copy(pin.point).project(camera);
      const [x, y] = [((projected.x + 1) / 2) * size.x, ((1 - projected.y) / 2) * size.y];
      const here = box(x, y);
      const onScreen = projected.z < 1 && here.left > 0 && here.right < size.x && here.top > 70 && here.bottom < size.y;
      const free = onScreen && strength > 0 && !taken.some((other) => overlaps(here, other));
      if (free) taken.push(here);
      show(pin, free ? strength : 0, x, y);
    }
  };
}
