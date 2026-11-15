// Small pieces shared by the About, Skills, Contact and Settings windows: opening another app, an
// external link that always opens in a new tab, arrow-key navigation for tab lists, and copy buttons.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useOs } from "../state/store";
import { APPS } from "./registry";
import type { AppId } from "./ids";

export function openApp(app: AppId) {
  useOs.getState().open(app, { title: APPS[app].title, size: APPS[app].size });
}

export function openProject(name: string) {
  useOs.getState().open("project", { title: name, props: { name }, size: APPS.project.size });
}

export function Ext({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const NEXT: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

// Roving focus for a tablist: arrows move and select, Home and End jump. Tabs are found by role so
// the caller keeps its own markup.
export function tabKeys(count: number, index: number, select: (next: number) => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    let next = index;
    if (event.key in NEXT) next = (index + NEXT[event.key] + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    select(next);
    const tabs = event.currentTarget.querySelectorAll<HTMLElement>("[role='tab']");
    tabs[next]?.focus();
  };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // insecure context or permission refused: the button says so
  }
}

// A copy button that confirms for two seconds, announced to screen readers.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    setState((await copyText(text)) ? "done" : "fail");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button type="button" className={`btn btn-small copy ${state}`} onClick={copy} aria-label={`Copy ${label}`}>
      <span aria-live="polite">{state === "done" ? "Copied ✓" : state === "fail" ? "Copy failed" : "Copy"}</span>
    </button>
  );
}

// "RP" in a 3x5 pixel font on a 13x9 tile: a portrait-free badge for About and Contact.
const LETTERS = ["111 101 111 110 101", "111 101 111 100 100"];

function letterPixels(rows: string, offsetX: number) {
  return rows.split(" ").flatMap((row, y) => [...row].map((on, x) => (on === "1" ? <rect key={`${offsetX}-${x}-${y}`} x={offsetX + x} y={2 + y} width="1" height="1" /> : null)));
}

export function Badge({ className = "badge" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 13 9" shapeRendering="crispEdges" role="img" aria-label="Pixel badge with the initials RP">
      <rect width="13" height="9" fill="#2b1f8f" />
      <rect x="0" y="0" width="13" height="1" fill="#8f7bff" />
      <rect x="0" y="8" width="13" height="1" fill="#4b6cd6" />
      <g fill="#7cf0b0">{letterPixels(LETTERS[0], 2)}</g>
      <g fill="#e9e6ff">{letterPixels(LETTERS[1], 8)}</g>
    </svg>
  );
}
