// The name reacts to the pointer: letters near it thin out and lift.
import { calm, pop } from "./juice.js";

const REACH_PX = 320; // distance at which a letter stops reacting
const REST_WEIGHT = 600;
const NEAR_WEIGHT = 200;
const LIFT_PX = 10;
const WAVE_STAGGER_MS = 35;

let heading = null;
let letters = [];
let pointer = null;
let queued = false;

function split() {
  const text = heading.textContent;
  heading.setAttribute("aria-label", text);
  letters = [...text].map((character) => {
    const span = document.createElement("span");
    span.textContent = character;
    span.setAttribute("aria-hidden", "true");
    return span;
  });
  heading.replaceChildren(...letters);
}

function paint() {
  queued = false;
  if (!heading?.isConnected) return;
  for (const letter of letters) {
    const box = letter.getBoundingClientRect();
    const dx = pointer.x - (box.left + box.width / 2);
    const dy = pointer.y - (box.top + box.height / 2);
    const near = Math.max(0, 1 - Math.hypot(dx, dy) / REACH_PX);
    const weight = REST_WEIGHT + (NEAR_WEIGHT - REST_WEIGHT) * near;
    letter.style.fontWeight = Math.round(weight);
    letter.style.transform = `translateY(${-LIFT_PX * near}px)`;
  }
}

function onMove(event) {
  pointer = { x: event.clientX, y: event.clientY };
  if (queued) return;
  queued = true;
  requestAnimationFrame(paint);
}

function wave() {
  if (!heading?.isConnected) return;
  letters.forEach((letter, index) => setTimeout(() => pop(letter), index * WAVE_STAGGER_MS));
}

export function mountName() {
  heading = document.querySelector("[data-name]");
  if (!heading || calm()) return;
  split();
  heading.addEventListener("click", wave);
  wave();
}

window.addEventListener("pointermove", onMove, { passive: true });
document.addEventListener("langchange", wave);
