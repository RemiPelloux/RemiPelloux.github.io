// Keyboard for the explorer's list: arrows, Page Up/Down, Home/End, Enter and type-ahead
// (typing "ga" jumps to GalaxyCrash).
import { useRef, type KeyboardEvent, type RefObject } from "react";
import type { Repo } from "@/data/repos";
import { openProject } from "@/apps/projectKit";
import type { View } from "./model";

const TYPE_AHEAD_MS = 700;
const PAGE_ROWS = 5;

// Number of icons per row, read from the layout so arrow keys follow what the visitor sees.
function columnsOf(container: HTMLElement | null) {
  const items = container ? Array.from(container.querySelectorAll<HTMLElement>("[data-name]")) : [];
  if (items.length === 0) return 1;
  return Math.max(1, items.filter((el) => el.offsetTop === items[0].offsetTop).length);
}

interface Nav {
  list: Repo[];
  current: number;
  select: (name: string) => void;
  view: View;
}

function moves(view: View, cols: number): Record<string, number> {
  const side = view === "icons" ? 1 : 0;
  return { ArrowDown: cols, ArrowUp: -cols, ArrowRight: side, ArrowLeft: -side, PageDown: cols * PAGE_ROWS, PageUp: -cols * PAGE_ROWS };
}

function useTypeAhead(nav: Nav, go: (index: number) => void) {
  const typed = useRef({ text: "", at: 0 });
  return (key: string) => {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < TYPE_AHEAD_MS ? typed.current.text : "") + key.toLowerCase(), at: now };
    const start = typed.current.text.length === 1 ? nav.current + 1 : nav.current;
    const order = [...nav.list.slice(start), ...nav.list.slice(0, start)];
    const hit = order.find((r) => r.name.toLowerCase().startsWith(typed.current.text));
    if (hit) go(nav.list.indexOf(hit));
  };
}

export function useKeyNav(nav: Nav): { box: RefObject<HTMLDivElement | null>; onKeyDown: (event: KeyboardEvent) => void } {
  const box = useRef<HTMLDivElement>(null);
  const go = (index: number) => {
    const repo = nav.list[Math.max(0, Math.min(nav.list.length - 1, index))];
    if (!repo) return;
    nav.select(repo.name);
    box.current?.querySelector(`[data-name="${CSS.escape(repo.name)}"]`)?.scrollIntoView({ block: "nearest" });
  };
  const typeAhead = useTypeAhead(nav, go);
  const onKeyDown = (event: KeyboardEvent) => {
    const step = moves(nav.view, nav.view === "icons" ? columnsOf(box.current) : 1)[event.key];
    const jumps: Record<string, () => void> = { Home: () => go(0), End: () => go(nav.list.length - 1), Enter: () => nav.list[nav.current] && openProject(nav.list[nav.current].name) };
    const printable = event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey;
    if (step !== undefined) go(nav.current + step);
    else if (jumps[event.key]) jumps[event.key]();
    else if (printable) typeAhead(event.key);
    else return;
    event.preventDefault();
  };
  return { box, onKeyDown };
}
