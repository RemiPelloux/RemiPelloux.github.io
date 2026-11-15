// The Antibes map: a nautical chart drawn from OpenStreetMap data (pre-simplified in data/antibes.ts),
// with drag/wheel/keyboard pan and zoom, pins for real places, a list of places as an alternative to
// the chart, and one unlabelled glint at sea for the curious.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useOs } from "../state/store";
import { BEACHES, CREDIT, FORT, LAND, MAIN_ROADS, MARINAS, ROADS, SIZE, toSvg } from "../data/antibes";
import { openApp } from "./kit";
import type { AppId } from "./ids";
import type { AppProps } from "./registry";
import "./map.css";

interface Place {
  id: string;
  name: string;
  at: [number, number]; // world metres: x east, y north, as in world.json
  story: string;
  apps?: Array<{ app: AppId; label: string }>;
  edge?: string; // set for places off the chart: the pin sits on the edge with this hint
}

const PLACES: Place[] = [
  { id: "fort", name: "Fort Carré", at: [382, 2416], story: "A 16th-century star fort on the point above Port Vauban, later strengthened by Vauban. Its four bastions have watched the bay for more than four hundred years; Napoleon was briefly held here in 1794." },
  { id: "vauban", name: "Port Vauban", at: [300, 1900], story: "One of the largest marinas in the Mediterranean. Fishing boats and sailing dinghies share it with the superyachts moored along the quay below Fort Carré." },
  { id: "town", name: "Antibes", at: [97, 1425], story: "Antibes, founded by Greek sailors as Antipolis. Rémi was born here, between the ramparts and the sea.", apps: [{ app: "about", label: "About Rémi" }] },
  { id: "old-town", name: "Vieille ville", at: [359, 1414], story: "The old town behind the sea walls: narrow lanes, the cathedral and the covered Provençal market on Cours Masséna." },
  { id: "picasso", name: "Château Grimaldi · Musée Picasso", at: [467, 1354], story: "The Grimaldi castle on the ramparts. Picasso worked here in 1946, and it has housed the Musée Picasso since." },
  { id: "juan", name: "Juan-les-Pins", at: [-672, -96], story: "The seaside resort on the west side of the Cap, under the pines of the Pinède Gould, home of the Jazz à Juan festival since 1960." },
  { id: "garoupe", name: "Phare de la Garoupe", at: [912, -490], story: "The lighthouse on the Garoupe plateau, the high point of the Cap, next to the sailors' chapel of Notre-Dame de la Garoupe. On a clear day the view runs from the Alps to the Esterel." },
  { id: "cap", name: "Cap d'Antibes", at: [476, -1511], story: "The wooded peninsula south of town. A coastal path follows its rocky shore around the southern tip." },
  { id: "sophia", name: "Sophia Antipolis", at: [-1930, 2690], edge: "↖ about 8 km north-west", story: "Europe's big technology park, in the pines a few kilometres north-west of Antibes. Rémi studied there.", apps: [{ app: "projects", label: "Open projects" }, { app: "skills", label: "Tech explorer" }] },
];

// Off the tip of the Cap, in open water (checked against the coastline when the data was made).
const GLINT: [number, number] = [1300, -2600];
const SECRET = "A bottle, bobbing off the Cap. The note inside reads: “If you found this, you look at maps the way I read source code: every corner. Say hi — R.”";

interface View {
  cx: number; // centre, SVG metres
  cy: number;
  z: number; // pixels per metre
}

const MAX_ZOOM = 2.5;
const SCALES = [50, 100, 200, 250, 500, 1000, 2000];

const fitZoom = (w: number, h: number) => Math.min(w / SIZE.width, h / SIZE.height);
const homeView = (w: number, h: number): View => ({ cx: SIZE.width / 2, cy: SIZE.height / 2, z: fitZoom(w, h) });

// Keeps the centre on the chart and the zoom between "whole map" and street level.
function clampView(view: View, w: number, h: number): View {
  const z = Math.min(MAX_ZOOM, Math.max(fitZoom(w, h) * 0.8, view.z));
  return { z, cx: Math.min(SIZE.width, Math.max(0, view.cx)), cy: Math.min(SIZE.height, Math.max(0, view.cy)) };
}

// The longest round distance that fits in about 110 pixels.
function scaleBar(z: number) {
  const metres = [...SCALES].reverse().find((m) => m * z <= 110) ?? SCALES[0];
  return { metres, px: metres * z, label: metres >= 1000 ? `${metres / 1000} km` : `${metres} m` };
}

function useSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function Compass() {
  return (
    <svg className="map-compass" viewBox="-50 -50 100 100" aria-hidden="true">
      <circle r="44" className="ring" />
      <circle r="36" className="ring thin" />
      <path d="M0 -46 L7 -7 L0 0 Z" className="n" />
      <path d="M0 -46 L-7 -7 L0 0 Z" className="n dark" />
      <path d="M0 46 L7 7 L0 0 Z M46 0 L7 -7 L0 0 Z M-46 0 L-7 7 L0 0 Z" className="pt" />
      <path d="M0 46 L-7 7 L0 0 Z M46 0 L7 7 L0 0 Z M-46 0 L-7 -7 L0 0 Z" className="pt dark" />
      <text y="-30" textAnchor="middle">N</text>
    </svg>
  );
}

// Faint lines every 500 m: the chart's graticule, drawn in world units so it pans with the map.
function Grid() {
  const lines: string[] = [];
  for (let x = 0; x <= SIZE.width; x += 500) lines.push(`M${x} 0V${SIZE.height}`);
  for (let y = 0; y <= SIZE.height; y += 500) lines.push(`M0 ${y}H${SIZE.width}`);
  return <path d={lines.join("")} className="map-grid" />;
}

function Chart({ view, w, h }: { view: View; w: number; h: number }) {
  const box = `${view.cx - w / 2 / view.z} ${view.cy - h / 2 / view.z} ${w / view.z} ${h / view.z}`;
  return (
    <svg className="map-svg" viewBox={box} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width={SIZE.width} height={SIZE.height} className="map-sea" />
      <Grid />
      <path d={LAND} className="map-shoal" />
      <path d={LAND} className="map-land" />
      <path d={BEACHES} className="map-beach" />
      <path d={MARINAS} className="map-marina" />
      {view.z > 0.12 && <path d={ROADS} className="map-road" />}
      <path d={MAIN_ROADS} className="map-road main" />
      <path d={FORT} className="map-fort" />
    </svg>
  );
}

function Card({ place, onClose }: { place: Place; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), [place.id]);
  return (
    <aside className="map-card" ref={ref} tabIndex={-1} aria-labelledby={`map-card-${place.id}`}>
      <button type="button" className="map-x" onClick={onClose} aria-label="Close">×</button>
      <h3 id={`map-card-${place.id}`}>{place.name}</h3>
      {place.edge && <p className="map-edge">{place.edge}</p>}
      <p>{place.story}</p>
      {place.apps && (
        <div className="map-actions">
          {place.apps.map((link) => (
            <button key={link.app} type="button" className="map-btn" onClick={() => openApp(link.app)}>{link.label}</button>
          ))}
        </div>
      )}
    </aside>
  );
}

const SECRET_PLACE: Place = { id: "secret", name: "Message in a bottle", at: GLINT, story: SECRET };

const KEY_PAN: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export default function MapApp(_: AppProps) {
  const stage = useRef<HTMLDivElement>(null);
  const { w, h } = useSize(stage);
  const [view, setView] = useState<View>(() => homeView(640, 400));
  const [selected, setSelected] = useState<Place | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);
  const fitted = useRef(false);

  useEffect(() => useOs.getState().unlock("map-explorer", "Achievement: Local guide"), []);

  // Fit the whole chart once the real window size is known, then keep the view valid on resize.
  useEffect(() => {
    if (w === 0) return;
    if (!fitted.current) {
      fitted.current = true;
      return setView(homeView(w, h));
    }
    setView((v) => clampView(v, w, h));
  }, [w, h]);

  const update = useCallback((next: (v: View) => View) => setView((v) => clampView(next(v), w, h)), [w, h]);

  // Zooms by `factor` keeping the point under (px, py) — stage pixels — where it is.
  const zoomAt = useCallback(
    (factor: number, px = w / 2, py = h / 2) =>
      update((v) => {
        const z = Math.min(MAX_ZOOM, Math.max(fitZoom(w, h) * 0.8, v.z * factor));
        const mx = v.cx + (px - w / 2) / v.z;
        const my = v.cy + (py - h / 2) / v.z;
        return { z, cx: mx - (px - w / 2) / z, cy: my - (py - h / 2) / z };
      }),
    [update, w, h],
  );

  // React's wheel handler is passive, so the page would scroll too; a native listener can stop it.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoomAt]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, aside")) return; // pins and the card keep their clicks
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, view };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    update(() => ({ ...start.view, cx: start.view.cx - (event.clientX - start.x) / start.view.z, cy: start.view.cy - (event.clientY - start.y) / start.view.z }));
  };
  const endDrag = () => (drag.current = null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const pan = KEY_PAN[event.key];
    if (pan && !(event.target as HTMLElement).closest("aside")) update((v) => ({ ...v, cx: v.cx + (pan[0] * 80) / v.z, cy: v.cy + (pan[1] * 80) / v.z }));
    else if (event.key === "+" || event.key === "=") zoomAt(1.4);
    else if (event.key === "-" || event.key === "_") zoomAt(1 / 1.4);
    else if (event.key === "0") setView(homeView(w, h));
    else if (event.key === "Escape" && (selected || listOpen)) (setSelected(null), setListOpen(false));
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  // Selecting a place from the list also brings it into view.
  const goTo = (place: Place) => {
    const [x, y] = toSvg(...place.at);
    update((v) => ({ cx: x, cy: y, z: Math.max(v.z, 0.35) }));
    setSelected(place);
    setListOpen(false);
  };

  const findBottle = () => {
    useOs.getState().unlock("map-secret", "Achievement: Treasure hunter");
    setSelected(SECRET_PLACE);
  };

  const project = (at: [number, number]) => {
    const [x, y] = toSvg(...at);
    return { left: (x - view.cx) * view.z + w / 2, top: (y - view.cy) * view.z + h / 2 };
  };
  const bar = scaleBar(view.z);
  const labels = view.z >= 0.3;

  return (
    <div className="map-app" onKeyDown={onKeyDown}>
      <div className="map-tools" role="toolbar" aria-label="Map controls">
        <button type="button" className="map-btn" aria-expanded={listOpen} aria-controls="map-places" onClick={() => setListOpen((o) => !o)}>☰ Places</button>
        <span className="map-title">ANTIBES · 43°34′N 7°07′E</span>
        <button type="button" className="map-btn icon" onClick={() => zoomAt(1 / 1.4)} aria-label="Zoom out">−</button>
        <button type="button" className="map-btn icon" onClick={() => zoomAt(1.4)} aria-label="Zoom in">+</button>
        <button type="button" className="map-btn icon" onClick={() => setView(homeView(w, h))} aria-label="Show the whole map">⌂</button>
      </div>
      <div
        ref={stage}
        className="map-stage"
        tabIndex={0}
        role="region"
        aria-label="Chart of Antibes. Arrow keys pan, plus and minus zoom, 0 resets. Tab moves through the places."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {w > 0 && <Chart view={view} w={w} h={h} />}
        <button type="button" className="map-glint" style={project(GLINT)} onClick={findBottle} aria-label="Something glints in the water" />
        {PLACES.map((place) => (
          <button
            key={place.id}
            type="button"
            className={`map-pin${selected?.id === place.id ? " on" : ""}${labels ? " labelled" : ""}${place.edge ? " edge" : ""}`}
            style={project(place.at)}
            onClick={() => setSelected(place)}
            aria-label={place.name}
            aria-pressed={selected?.id === place.id}
          >
            <span className="dot" aria-hidden="true" />
            <span className="name" aria-hidden="true">{place.edge ? `↖ ${place.name}` : place.name}</span>
          </button>
        ))}
        <Compass />
        <div className="map-scale" aria-hidden="true">
          <span style={{ width: bar.px }} />
          {bar.label}
        </div>
        <p className="map-credit">{CREDIT}</p>
        {listOpen && (
          <nav id="map-places" className="map-list" aria-label="Places">
            <ul>
              {PLACES.map((place) => (
                <li key={place.id}>
                  <button type="button" onClick={() => goTo(place)}>{place.name}</button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {selected && <Card place={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
