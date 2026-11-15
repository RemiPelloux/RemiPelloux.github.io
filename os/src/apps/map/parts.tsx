// The pieces of the chart: the SVG map, the compass, the pins, the scale, the toolbar, the list of
// places and the card that tells a place's story.
import { useEffect, useRef } from "react";
import { BEACHES, FORT, LAND, MAIN_ROADS, MARINAS, ROADS, SIZE, toSvg } from "@/data/antibes";
import { openApp } from "@/apps/kit";
import { onStage, scaleBar, type Size, type View } from "./view";
import { GLINT, PLACES, type Place } from "./places";

const GRID_M = 500;
const ROADS_FROM_ZOOM = 0.12;
const LABELS_FROM_ZOOM = 0.3;

export function Compass() {
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

// Faint lines every 500 m, in world units so they pan with the map.
function Grid() {
  const lines: string[] = [];
  for (let x = 0; x <= SIZE.width; x += GRID_M) lines.push(`M${x} 0V${SIZE.height}`);
  for (let y = 0; y <= SIZE.height; y += GRID_M) lines.push(`M0 ${y}H${SIZE.width}`);
  return <path d={lines.join("")} className="map-grid" />;
}

export function Chart({ view, size }: { view: View; size: Size }) {
  const box = `${view.cx - size.w / 2 / view.z} ${view.cy - size.h / 2 / view.z} ${size.w / view.z} ${size.h / view.z}`;
  return (
    <svg className="map-svg" viewBox={box} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width={SIZE.width} height={SIZE.height} className="map-sea" />
      <Grid />
      <path d={LAND} className="map-shoal" />
      <path d={LAND} className="map-land" />
      <path d={BEACHES} className="map-beach" />
      <path d={MARINAS} className="map-marina" />
      {view.z > ROADS_FROM_ZOOM && <path d={ROADS} className="map-road" />}
      <path d={MAIN_ROADS} className="map-road main" />
      <path d={FORT} className="map-fort" />
    </svg>
  );
}

export function ScaleBar({ z }: { z: number }) {
  const bar = scaleBar(z);
  return (
    <div className="map-scale" aria-hidden="true">
      <span style={{ width: bar.px }} />
      {bar.label}
    </div>
  );
}

interface PinsProps {
  view: View;
  size: Size;
  selected: Place | null;
  onPick: (place: Place) => void;
  onGlint: () => void;
}

export function Pins({ view, size, selected, onPick, onGlint }: PinsProps) {
  const at = (point: [number, number]) => onStage(toSvg(...point), view, size);
  const labelled = view.z >= LABELS_FROM_ZOOM ? " labelled" : "";
  return (
    <>
      <button type="button" className="map-glint" style={at(GLINT)} onClick={onGlint} aria-label="Something glints in the water" />
      {PLACES.map((place) => (
        <button key={place.id} type="button" className={`map-pin${selected?.id === place.id ? " on" : ""}${labelled}${place.edge ? " edge" : ""}`} style={at(place.at)} onClick={() => onPick(place)} aria-label={place.name} aria-pressed={selected?.id === place.id}>
          <span className="dot" aria-hidden="true" />
          <span className="name" aria-hidden="true">{place.edge ? `↖ ${place.name}` : place.name}</span>
        </button>
      ))}
    </>
  );
}

export function PlaceList({ onPick }: { onPick: (place: Place) => void }) {
  return (
    <nav id="map-places" className="map-list" aria-label="Places">
      <ul>
        {PLACES.map((place) => (
          <li key={place.id}>
            <button type="button" onClick={() => onPick(place)}>{place.name}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Card({ place, onClose }: { place: Place; onClose: () => void }) {
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
          {place.apps.map((link) => <button key={link.app} type="button" className="map-btn" onClick={() => openApp(link.app)}>{link.label}</button>)}
        </div>
      )}
    </aside>
  );
}

interface ToolbarProps {
  listOpen: boolean;
  toggleList: () => void;
  zoom: (factor: number) => void;
  reset: () => void;
}

export function Toolbar({ listOpen, toggleList, zoom, reset }: ToolbarProps) {
  return (
    <div className="map-tools" role="toolbar" aria-label="Map controls">
      <button type="button" className="map-btn" aria-expanded={listOpen} aria-controls="map-places" onClick={toggleList}>☰ Places</button>
      <span className="map-title">ANTIBES · 43°34′N 7°07′E</span>
      <button type="button" className="map-btn icon" onClick={() => zoom(1 / 1.4)} aria-label="Zoom out">−</button>
      <button type="button" className="map-btn icon" onClick={() => zoom(1.4)} aria-label="Zoom in">+</button>
      <button type="button" className="map-btn icon" onClick={reset} aria-label="Show the whole map">⌂</button>
    </div>
  );
}
