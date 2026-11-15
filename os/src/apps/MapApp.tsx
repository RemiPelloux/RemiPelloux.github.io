// The Antibes map: a nautical chart drawn from OpenStreetMap data (pre-simplified in data/antibes.ts),
// with drag, wheel and keyboard pan and zoom, pins for real places, a list of places as an alternative
// to the chart, and one unlabelled glint at sea for the curious.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useOs } from "@/state/store";
import { CREDIT, toSvg } from "@/data/antibes";
import type { AppProps } from "./registry";
import { Card, Chart, Compass, Pins, PlaceList, ScaleBar, Toolbar } from "./map/parts";
import { SECRET_PLACE, type Place } from "./map/places";
import { useMapView } from "./map/useMapView";
import "./map.css";

const PLACE_ZOOM = 0.35; // a place picked from the list is shown at least this close

function usePlaces(map: ReturnType<typeof useMapView>) {
  const [selected, setSelected] = useState<Place | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const goTo = (place: Place) => {
    const [x, y] = toSvg(...place.at);
    map.update((v) => ({ cx: x, cy: y, z: Math.max(v.z, PLACE_ZOOM) }));
    setSelected(place);
    setListOpen(false);
  };
  const findBottle = () => {
    useOs.getState().unlock("map-secret", "Achievement: Treasure hunter");
    setSelected(SECRET_PLACE);
  };
  const close = () => (setSelected(null), setListOpen(false));
  return { selected, setSelected, listOpen, toggleList: () => setListOpen((o) => !o), goTo, findBottle, close };
}

export default function MapApp(_: AppProps) {
  const stage = useRef<HTMLDivElement>(null);
  const map = useMapView(stage);
  const places = usePlaces(map);
  useEffect(() => useOs.getState().unlock("map-explorer", "Achievement: Local guide"), []);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const inCard = (event.target as HTMLElement).closest("aside");
    const used = event.key === "Escape" && (places.selected || places.listOpen) ? (places.close(), true) : !inCard && map.key(event);
    if (used) (event.preventDefault(), event.stopPropagation());
  };
  return (
    <div className="map-app" onKeyDown={onKeyDown}>
      <Toolbar listOpen={places.listOpen} toggleList={places.toggleList} zoom={(f) => map.zoomAt(f)} reset={map.reset} />
      <div ref={stage} className="map-stage" tabIndex={0} role="region" aria-label="Chart of Antibes. Arrow keys pan, plus and minus zoom, 0 resets. Tab moves through the places." {...map.drag}>
        {map.size.w > 0 && <Chart view={map.view} size={map.size} />}
        <Pins view={map.view} size={map.size} selected={places.selected} onPick={places.setSelected} onGlint={places.findBottle} />
        <Compass />
        <ScaleBar z={map.view.z} />
        <p className="map-credit">{CREDIT}</p>
        {places.listOpen && <PlaceList onPick={places.goTo} />}
        {places.selected && <Card place={places.selected} onClose={() => places.setSelected(null)} />}
      </div>
    </div>
  );
}
