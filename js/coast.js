// Reads the latitude and longitude under the pointer on the coast map.
// The map is drawn on a plain grid, so the position is a linear conversion.
import { locale, t } from "./i18n.js";

const WEST_EDGE_DEG = 6.97; // longitude at x = 0
const NORTH_EDGE_DEG = 43.78; // latitude at y = 0
const UNITS_PER_DEG_LON = 1000;
const UNITS_PER_DEG_LAT = 1379; // a degree of latitude is longer than one of longitude here
const VIEW_WIDTH = 500;

function onMove(event) {
  const map = event.target.closest?.("[data-coast]");
  const readout = document.querySelector("[data-coast-read]");
  if (!map || !readout) return;
  const box = map.getBoundingClientRect();
  const scale = VIEW_WIDTH / box.width;
  const lon = WEST_EDGE_DEG + ((event.clientX - box.left) * scale) / UNITS_PER_DEG_LON;
  const lat = NORTH_EDGE_DEG - ((event.clientY - box.top) * scale) / UNITS_PER_DEG_LAT;
  const format = new Intl.NumberFormat(locale(), { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  readout.textContent = t(`Pointer: ${format.format(lat)}° N, ${format.format(lon)}° E`, `Pointeur : ${format.format(lat)}° N, ${format.format(lon)}° E`);
}

document.addEventListener("pointermove", onMove, { passive: true });
