// A line of place names that drifts sideways and speeds up with the scroll.

const DRIFT_PX_PER_MS = 0.045;
const SCROLL_GAIN = 0.9; // extra pixels of travel per pixel scrolled
const COPIES = 2;
const still = window.matchMedia("(prefers-reduced-motion: reduce)");
let track = null;
let offset = 0;
let lastTime = 0;
let lastScroll = 0;
let running = false;

function frame(time) {
  running = Boolean(track?.isConnected);
  if (!running) return;
  const scroll = window.scrollY;
  offset += (time - lastTime) * DRIFT_PX_PER_MS + Math.abs(scroll - lastScroll) * SCROLL_GAIN;
  lastTime = time;
  lastScroll = scroll;
  const loop = track.scrollWidth / COPIES;
  track.style.transform = `translateX(${-(offset % loop)}px)`;
  requestAnimationFrame(frame);
}

export function mountMarquee() {
  track = document.querySelector("[data-marquee]");
  if (!track || still.matches) return;
  if (track.children.length < COPIES) track.append(track.firstElementChild.cloneNode(true));
  lastTime = performance.now();
  lastScroll = window.scrollY;
  if (!running) requestAnimationFrame(frame);
}
