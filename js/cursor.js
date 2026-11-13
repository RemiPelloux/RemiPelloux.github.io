// Over a work row with a preview, the project illustration floats next to the pointer.
// Mouse and trackpad only.

const EASE = 0.18; // share of the remaining distance covered each frame
const PREVIEW_OFFSET_PX = 28;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const preview = document.createElement("div");
const image = document.createElement("img");
const target = { x: 0, y: 0 };
const now = { x: 0, y: 0 };
let running = false;

function frame() {
  now.x += (target.x - now.x) * EASE;
  now.y += (target.y - now.y) * EASE;
  const flip = now.x > window.innerWidth / 2 ? "-100%" : "0";
  preview.style.transform = `translate(${now.x + PREVIEW_OFFSET_PX}px, ${now.y + PREVIEW_OFFSET_PX}px) translateX(${flip})`;
  const settled = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) < 0.2;
  running = !settled;
  if (running) requestAnimationFrame(frame);
}

function showPreview(row) {
  const source = row?.dataset.preview;
  preview.classList.toggle("show", Boolean(source));
  if (source && image.getAttribute("src") !== source) image.src = source;
}

function onMove(event) {
  target.x = event.clientX;
  target.y = event.clientY;
  showPreview(event.target.closest?.("[data-preview]"));
  if (running) return;
  running = true;
  requestAnimationFrame(frame);
}

function start() {
  preview.className = "preview";
  preview.setAttribute("aria-hidden", "true");
  image.alt = "";
  preview.append(image);
  document.body.append(preview);
  window.addEventListener("pointermove", onMove, { passive: true });
  // Scrolling moves the page under a still pointer, so the row it was on is gone.
  window.addEventListener("scroll", () => preview.classList.remove("show"), { passive: true });
}

if (fine.matches && !reduced.matches) start();
