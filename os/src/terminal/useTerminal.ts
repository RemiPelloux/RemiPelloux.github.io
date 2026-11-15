// A terminal session: its lines, the line being typed, the folder, the history, and the key handling.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useOs, type WindowState } from "@/state/store";
import { HOME, pretty, type Line } from "./engine";
import { History } from "./history";
import { onTerminalKey } from "./keys";
import { execute, type Print } from "./run";

const MAX_LINES = 400;

export const WELCOME: Line[] = [
  { text: "RIVIERA.OS v1.0 — riviera@antibes", kind: "accent" },
  { text: "Type `help` to see what this computer can do. Tab completes, ↑ ↓ walk the history.", kind: "dim" },
];

const asLines = (value: Parameters<Print>[0]): Line[] => (Array.isArray(value) ? value : [value]).map((v) => (typeof v === "string" ? { text: v } : v));

// The 3D keyboard and other apps type into the focused terminal through the "riviera:type" event.
function useTypedText(windowId: string, setInput: (update: (value: string) => string) => void) {
  useEffect(() => {
    const type = (event: Event) => useOs.getState().focused === windowId && setInput((value) => value + (event as CustomEvent<string>).detail);
    window.addEventListener("riviera:type", type);
    return () => window.removeEventListener("riviera:type", type);
  }, [windowId, setInput]);
}

export function useTerminal(win: WindowState) {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState(win.props.command ?? "");
  const [cwd, setCwd] = useState(HOME);
  const history = useRef(new History()).current;
  const prompt = `riviera@antibes:${pretty(cwd)}$`;
  const print: Print = (value) => setLines((current) => [...current, ...asLines(value)].slice(-MAX_LINES));
  const clear = () => setLines([]);
  useTypedText(win.id, setInput);
  const submit = (raw: string) => {
    print({ text: `${prompt} ${raw}`, kind: "cmd" });
    void execute(raw, { print, clear, cwd, setCwd, history, windowId: win.id });
  };
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => onTerminalKey(event, { input, setInput, cwd, history, submit, print, clear });
  return { lines, input, setInput, prompt, submit, onKey };
}
