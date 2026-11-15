// The places on the Antibes chart, in world metres (x east, y north, as in world.json).
import type { AppId } from "@/apps/ids";

export interface Place {
  id: string;
  name: string;
  at: [number, number];
  story: string;
  apps?: Array<{ app: AppId; label: string }>;
  edge?: string; // set for places off the chart: the pin sits on the edge with this hint
}

export const PLACES: Place[] = [
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
export const GLINT: [number, number] = [1300, -2600];

export const SECRET_PLACE: Place = {
  id: "secret",
  name: "Message in a bottle",
  at: GLINT,
  story: "A bottle, bobbing off the Cap. The note inside reads: “If you found this, you look at maps the way I read source code: every corner. Say hi — R.”",
};
