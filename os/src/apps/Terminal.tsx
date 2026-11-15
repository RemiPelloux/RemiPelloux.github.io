// The terminal: type a command, Tab to complete, ↑ ↓ for history, Ctrl+L to clear. Output lines can be
// clickable: links open in a new tab, suggested commands run when clicked.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useOs } from "../state/store";
import { loadRepos } from "../data/repos";
import { commonPrefix, complete, find, HOME, parse, pretty, type Context, type Line } from "../terminal/engine";
import "../terminal/commands";
import "../terminal/eggs";
import type { AppProps } from "./registry";

const HISTORY_KEY = "riviera-os-history";
const MAX_LINES = 400;

const WELCOME: Line[] = [
  { text: "RIVIERA.OS v1.0 — riviera@antibes", kind: "accent" },
  { text: "Type `help` to see what this computer can do. Tab completes, ↑ ↓ walk the history.", kind: "dim" },
];

function loadHistory(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-100)));
  } catch {
    /* storage blocked: history lasts until the window closes */
  }
}

const asLines = (value: string | Line | Array<string | Line>): Line[] => (Array.isArray(value) ? value : [value]).map((v) => (typeof v === "string" ? { text: v } : v));

export default function Terminal({ win }: AppProps) {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState(win.props.command ?? "");
  const [cwd, setCwd] = useState(HOME);
  const history = useRef<string[]>(loadHistory());
  const cursor = useRef<number>(history.current.length);
  const field = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const prompt = `riviera@antibes:${pretty(cwd)}$`;

  // Braces matter: scrollTo() returns a promise in recent browsers, and React would call it as a cleanup.
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  // The 3D keyboard and other apps can type into the terminal through this event.
  useEffect(() => {
    const type = (event: Event) => {
      const text = (event as CustomEvent<string>).detail;
      if (useOs.getState().focused === win.id) setInput((value) => value + text);
    };
    window.addEventListener("riviera:type", type);
    return () => window.removeEventListener("riviera:type", type);
  }, [win.id]);

  async function run(raw: string) {
    const print = (value: string | Line | Array<string | Line>) => setLines((current) => [...current, ...asLines(value)].slice(-MAX_LINES));
    print({ text: `${prompt} ${raw}`, kind: "cmd" });
    const text = raw.trim();
    if (!text) return;
    history.current = [...history.current.filter((h) => h !== text), text];
    cursor.current = history.current.length;
    saveHistory(history.current);
    const [name, ...args] = parse(text);
    const command = find(name.toLowerCase());
    if (!command) return print({ text: `${name}: command not found. Type \`help\`.`, kind: "err" });
    const os = useOs.getState();
    const context: Context = {
      args,
      raw: text,
      cwd,
      print,
      clear: () => setLines([]),
      setCwd,
      open: (app, options) => os.open(app, options),
      repos: loadRepos,
      closeTerminal: () => os.close(win.id),
      history: () => history.current,
    };
    try {
      await command.run(context);
    } catch (error) {
      print({ text: `${name}: ${(error as Error).message}`, kind: "err" });
    }
    useOs.getState().unlock("first-command", "Achievement: Hello, terminal");
  }

  async function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const raw = input;
      setInput("");
      await run(raw);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const step = event.key === "ArrowUp" ? -1 : 1;
      cursor.current = Math.max(0, Math.min(history.current.length, cursor.current + step));
      setInput(history.current[cursor.current] ?? "");
    } else if (event.key === "Tab") {
      event.preventDefault();
      const options = await complete(input, cwd);
      if (options.length === 1) setInput(input.replace(/\S*$/, options[0]) + (options[0].endsWith("/") ? "" : " "));
      else if (options.length > 1) {
        setInput(input.replace(/\S*$/, commonPrefix(options)));
        setLines((current) => [...current, { text: options.join("   "), kind: "dim" }]);
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    } else if (event.key === "Escape") {
      event.preventDefault(); // Escape clears the line instead of closing the window
      setInput("");
    }
  }

  return (
    <div className="terminal" onPointerUp={() => !window.getSelection()?.toString() && field.current?.focus()}>
      <div className="term-screen" ref={screen} role="log" aria-live="polite">
        {lines.map((line, i) => (
          <p key={i} className={`tl ${line.kind ?? "out"}`}>
            {line.href ? <a href={line.href} target="_blank" rel="noopener">{line.text}</a> : line.run ? <button type="button" className="tl-run" onClick={() => run(line.run!)}>{line.text}</button> : line.text}
          </p>
        ))}
        <label className="term-input">
          <span className="prompt">{prompt}</span>
          <input ref={field} data-autofocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" autoCapitalize="off" aria-label="Terminal command" />
        </label>
      </div>
    </div>
  );
}
