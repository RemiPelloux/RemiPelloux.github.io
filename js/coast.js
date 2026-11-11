// Reads the latitude and longitude under the pointer on a map.
// Each map is drawn on a plain grid and carries its own scale in data-coast:
// west edge, north edge, units per degree of longitude, units per degree of latitude, view width.
import { locale, t } from "./i18n.js";

function position(map, event) {
  const [west, north, perLon, perLat, viewWidth] = map.dataset.coast.split(",").map(Number);
  const box = map.getBoundingClientRect();
  const scale = viewWidth / box.width;
  return {
    lon: west + ((event.clientX - box.left) * scale) / perLon,
    lat: north - ((event.clientY - box.top) * scale) / perLat,
  };
}

function onMove(event) {
  const map = event.target.closest?.("[data-coast]");
  const readout = map?.parentElement.querySelector("[data-coast-read]");
  if (!readout) return;
  const { lon, lat } = position(map, event);
  const format = new Intl.NumberFormat(locale(), { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const side = lon >= 0 ? "E" : t("W", "O");
  const text = `${format.format(lat)}° N, ${format.format(Math.abs(lon))}° ${side}`;
  readout.textContent = t(`Pointer: ${text}`, `Pointeur : ${text}`);
}

document.addEventListener("pointermove", onMove, { passive: true });
