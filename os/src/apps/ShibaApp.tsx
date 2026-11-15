// The Shiba's status window. Its mood and pet count live in the store, so the Shiba on the desk,
// the terminal and this window share one dog.
import { useState } from "react";
import type { AppProps } from "./registry";
import { useOs } from "@/state/store";
import "./apps.css";

type Mood = "asleep" | "awake" | "happy" | "zoomies";
const ZOOMIES_AT = 10;

// A 14 x 11 face: o fur, c cream, e eye, n nose, t tongue (drawn only when happy).
const FACE = [
  ".o..........o.",
  ".oo........oo.",
  ".oco......oco.",
  ".occoooooocco.",
  "oooooooooooooo",
  "oooeooooooeooo",
  "occccoooocccco",
  "occcccnnccccco",
  ".occcccccccco.",
  "..occcttccco..",
  "...oooooooo...",
];
const COLOR: Record<string, string> = { o: "#d9822b", c: "#f6e7c8", e: "#1b1840", n: "#1b1840", t: "#ff7a9c" };

// One cell of the face. The tongue only shows when the dog is happy.
function pixel({ ch: raw, x, y }: { ch: string; x: number; y: number }, mood: Mood) {
  const ch = raw === "t" && mood !== "happy" && mood !== "zoomies" ? "c" : raw;
  // Closed eyes: a thin line in the lower half of the pixel.
  if (ch === "e" && mood === "asleep") return <rect key={`${x}-${y}`} x={x} y={y + 0.6} width="1" height="0.3" fill={COLOR.e} />;
  return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLOR[ch]} />;
}

function ShibaArt({ mood }: { mood: Mood }) {
  const pixels = FACE.flatMap((row, y) => [...row].map((ch, x) => (ch === "." ? null : pixel({ ch, x, y }, mood))));
  return (
    <div className={`shiba-art inset ${mood}`}>
      <svg viewBox="0 0 14 11" shapeRendering="crispEdges" role="img" aria-label={`Pixel-art Shiba, ${mood}`}>{pixels}</svg>
      {mood === "asleep" && <p className="zzz" aria-hidden="true">z z Z</p>}
    </div>
  );
}

const THOUGHTS = [
  "The yachts at Port Vauban are big. My bed is bigger.",
  "I smell socca from the old town. Investigating.",
  "Walk to Fort Carré and back? I will allow it.",
  "Mistral wind today. My ears approve.",
  "Picasso painted in Antibes. I paint the screen with my nose.",
  "Nobody commits while I nap. That is the rule.",
  "Sunset on the ramparts, then dinner. That is the roadmap.",
  "Juan-les-Pins sand: excellent for digging, terrible for keyboards.",
];

const randomThought = (not?: string) => {
  const pool = THOUGHTS.filter((t) => t !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

function pet() {
  const os = useOs.getState();
  const pets = os.shiba.pets + 1;
  const zoomies = pets >= ZOOMIES_AT;
  os.setShiba({ pets, mood: zoomies ? "zoomies" : "happy" });
  os.unlock("shiba-pet", "Achievement: Good boy");
  if (zoomies) os.unlock("shiba-zoomies", "Achievement: Zoomies");
}

const MOOD_TEXT: Record<Mood, string> = { asleep: "Asleep", awake: "Awake", happy: "Happy", zoomies: "Zoomies!" };

export default function ShibaApp(_: AppProps) {
  const { mood, pets } = useOs((s) => s.shiba);
  const [thought, setThought] = useState(() => randomThought());
  const toggleSleep = () => useOs.getState().setShiba({ mood: mood === "asleep" ? "awake" : "asleep" });
  return (
    <div className="shiba-app">
      <ShibaArt mood={mood} />
      <div>
        <h3 className="app-h">Shiba</h3>
        <p className="app-lead" aria-live="polite">
          Mood: <span className={`mood ${mood}`}>{MOOD_TEXT[mood]}</span> · Pets: <b>{pets}</b>
        </p>
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={pet}>Pet</button>
          <button type="button" className="btn ghost" onClick={toggleSleep}>{mood === "asleep" ? "Wake up" : "Nap time"}</button>
          <button type="button" className="btn ghost" onClick={() => setThought((t) => randomThought(t))} disabled={mood === "asleep"}>
            What's on its mind?
          </button>
        </div>
        <p className="thought" aria-live="polite">{mood === "asleep" ? "Zzz… dreaming of socca." : thought}</p>
      </div>
    </div>
  );
}
