// Display type reacts to the pointer: letters near it thin out and lift.
// Applies to every [data-name] element: the masthead name and the closing link.
import { calm } from "./juice.js";

const REACH_PX = 320; // distance at which a letter stops reacting
const REST_WEIGHT = 600;
const NEAR_WEIGHT = 200;
const LIFT_PX = 10;

let letters = [];
let pointer = null;
let queued = false;

function split(element) {
  const text = element.textContent;
  element.setAttribute("aria-label", text);
  const spans = [...text].map((character, index) => {
    const span = document.createElement("span");
    span.textContent = character;
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", index);
    return span;
  });
  element.replaceChildren(...spans);
  return spans;
}

function paint() {
  queued = false;
  for (const letter of letters) {
    if (!letter.isConnected) continue;
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
  if (queued || !letters.length) return;
  queued = true;
  requestAnimationFrame(paint);
}

// Splitting again replays the rise animation, which is what a language change should do.
export function mountName() {
  if (calm()) return;
  letters = [...document.querySelectorAll("[data-name]")].flatMap(split);
}

window.addEventListener("pointermove", onMove, { passive: true });
document.addEventListener("langchange", mountName);
