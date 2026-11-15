// What each prop does when clicked, or when its button in the accessible list is pressed. The 3D side
// only animates (it watches useScene.pulses); the OS side opens windows and unlocks achievements.
import { APPS } from "@/apps/registry";
import type { AppId } from "@/apps/ids";
import { useOs } from "@/state/store";
import { useScene, type PropId } from "./focus";
import { SPOT } from "./layout";

export const PROPS: Record<PropId, { label: string; hint: string }> = {
  map: { label: "Wall map", hint: "Open the map of Antibes" },
  shiba: { label: "Shiba", hint: "Pet the Shiba" },
  pi: { label: "Raspberry Pi", hint: "Open the lab bench" },
  motorcycle: { label: "Motorcycle", hint: "Rev the motorcycle" },
  coffee: { label: "Coffee", hint: "Sip the coffee" },
  keyboard: { label: "Keyboard", hint: "Type on the keyboard" },
  door: { label: "Tiny door", hint: "Knock on the tiny door" },
  stickers: { label: "Stickers", hint: "Open the projects" },
};

const os = () => useOs.getState();
const openApp = (app: AppId, title = APPS[app].title, size = APPS[app].size) => os().open(app, { title, size });

// The Shiba's day: a pet makes it happy, ten pets give it the zoomies, then it settles and dozes off.
let settle: number | undefined;
let doze: number | undefined;

function petShiba() {
  const pets = os().shiba.pets + 1;
  const zoomies = pets % 10 === 0;
  os().setShiba({ pets, mood: zoomies ? "zoomies" : "happy" });
  os().unlock("shiba-pet", "Achievement: Good boy");
  if (pets >= 10) os().unlock("shiba-zoomies", "Achievement: Zoomies");
  window.clearTimeout(settle);
  window.clearTimeout(doze);
  settle = window.setTimeout(() => os().setShiba({ mood: "awake" }), zoomies ? 3600 : 2600);
  doze = window.setTimeout(() => os().setShiba({ mood: "asleep" }), 45000);
}

const WORDS = ["whoami", "help", "ls ~/projects", "neofetch", "cat about.txt", "map"];
let typing = false;

// Opens the terminal, then types a command one letter at a time; each letter presses a key in 3D.
function typeSomething() {
  openApp("terminal");
  os().unlock("keyboard", "Achievement: Keyboard warrior");
  if (typing) return;
  typing = true;
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  // The terminal is a lazy chunk the first time: give it a moment to mount and listen.
  [...word].forEach((char, i) =>
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("riviera:type", { detail: char }));
      useScene.getState().pulse("keyboard");
      if (i === word.length - 1) typing = false;
    }, 700 + i * 95),
  );
}

const HANDLERS: Record<PropId, () => void> = {
  map: () => {
    useScene.getState().lookAt(SPOT.map, 0.4, 900);
    window.setTimeout(() => openApp("map"), 350);
    os().unlock("map-explorer", "Achievement: Local guide");
  },
  shiba: petShiba,
  pi: () => {
    openApp("lab");
    os().unlock("pi", "Achievement: Tinkerer");
  },
  motorcycle: () => {
    useScene.getState().lookAt(SPOT.motorcycle, 0.2, 700);
    os().unlock("vroom", "Achievement: Vroom");
  },
  coffee: () => {
    if (os().theme === "night") openApp("coffee", "coffee.exe", [420, 360]);
  },
  keyboard: typeSomething,
  door: () => {
    useScene.getState().lookAt(SPOT.door, 0.3, 1100);
    os().unlock("mouse-door", "Achievement: Tiny tenant");
  },
  stickers: () => openApp("projects"),
};

export function act(id: PropId) {
  os().setZoomed(false);
  // The keyboard pulses once per letter it types, not once per click.
  if (id !== "keyboard") useScene.getState().pulse(id);
  HANDLERS[id]();
}
