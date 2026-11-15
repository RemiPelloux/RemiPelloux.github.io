// Hidden commands and Easter eggs. Left out of `help` on purpose: they are found by curiosity, or by
// typing what a developer would type on any machine. The longer gags live in eggs-more.ts.
import { useOs } from "../state/store";
import { APPS } from "../apps/registry";
import { register } from "./engine";
import "./eggs-more";

register(
  {
    name: "sudo",
    summary: "Run as root",
    hidden: true,
    complete: () => ["make-me-a-coffee"],
    run: ({ args, print, open }) => {
      if (args.join(" ") === "make-me-a-coffee") {
        useOs.getState().unlock("coffee", "Achievement: Root barista");
        open("coffee", { title: "coffee.exe", size: [420, 360] });
        return print({ text: "[sudo] password for guest: ******** … accepted. Brewing.", kind: "ok" });
      }
      useOs.getState().unlock("sudo-fail", "Achievement: Nice try");
      print({ text: "guest is not in the sudoers file. This incident will be reported to the Shiba.", kind: "err" });
    },
  },
  {
    name: "shiba",
    summary: "Wake the Shiba",
    run: ({ print }) => {
      const os = useOs.getState();
      os.setShiba({ mood: "happy", pets: os.shiba.pets + 1 });
      os.unlock("shiba-cli", "Achievement: Command-line dog whisperer");
      print({ text: "  /\\_/\\\n ( o.o )  wan!\n  > ^ <", kind: "accent" });
    },
  },
  {
    name: "achievements",
    summary: "What you have found so far",
    run: ({ open, print }) => {
      open("achievements", { title: APPS.achievements.title, size: APPS.achievements.size });
      const os = useOs.getState();
      print({ text: `${os.achievements.length} unlocked. The rest are hiding in plain sight.`, kind: "ok" });
    },
  },
  {
    name: "coffee",
    summary: "Coffee",
    hidden: true,
    run: ({ print }) => print([{ text: "coffee: permission denied. Good coffee needs root.", kind: "err" }, { text: "Try: sudo make-me-a-coffee", kind: "dim", run: "sudo make-me-a-coffee" }]),
  },
  {
    name: "konami",
    summary: "The code",
    hidden: true,
    run: ({ print }) =>
      print([
        { text: "↑ ↑ ↓ ↓ ← → ← → B A", kind: "accent" },
        { text: "Typing it here won't do it. Press the keys, anywhere on this computer.", kind: "dim" },
      ]),
  },
);

// The Konami code, listened for on the whole page once the terminal has loaded this module. Arrow keys
// still reach the terminal (history) and other apps; we only watch, never prevent.
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const FLAG = "__rivieraKonami"; // module may be evaluated twice under hot reload: listen once

function onKonami() {
  const os = useOs.getState();
  os.unlock("konami", "Achievement: Old school");
  os.setShiba({ mood: "zoomies" });
  window.setTimeout(() => useOs.getState().shiba.mood === "zoomies" && useOs.getState().setShiba({ mood: "happy" }), 5000);
}

function listenForKonami() {
  const host = window as unknown as Record<string, boolean>;
  if (host[FLAG]) return;
  host[FLAG] = true;
  let progress = 0;
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    // A wrong key restarts the sequence, unless it can itself start one ("↑ ↑ ↑" still counts as "↑ ↑").
    progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? (progress === 2 ? 2 : 1) : 0;
    if (progress === KONAMI.length) (progress = 0), onKonami();
  });
}

if (typeof window !== "undefined") listenForKonami();
