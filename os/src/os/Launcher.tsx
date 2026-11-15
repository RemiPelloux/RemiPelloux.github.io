// The launcher: Ctrl+K (or the RIVIERA.OS button) opens a box to type an app or a project name.
// Arrow keys move, Enter opens, Escape closes. Nobody has to know a terminal command.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useOs } from "@/state/store";
import { APPS } from "@/apps/registry";
import type { AppId } from "@/apps/ids";
import { ICONS } from "@/apps/icons";
import { loadRepos, type Repo } from "@/data/repos";

const SHOWN = 9;

interface Entry {
  label: string;
  hint: string;
  app: AppId;
  props?: Record<string, string>;
}

// Opens on the "riviera:launcher" event and on Ctrl+K / Cmd+K, anywhere.
function useLauncherToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    const key = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") (event.preventDefault(), toggle());
    };
    window.addEventListener("riviera:launcher", toggle);
    window.addEventListener("keydown", key);
    return () => (window.removeEventListener("riviera:launcher", toggle), window.removeEventListener("keydown", key));
  }, []);
  return [open, setOpen] as const;
}

function useEntries(query: string): Entry[] {
  const [repos, setRepos] = useState<Repo[]>([]);
  useEffect(() => void loadRepos().then(setRepos), []);
  return useMemo(() => {
    const apps = (Object.keys(APPS) as AppId[]).filter((id) => !APPS[id].hidden).map((id) => ({ label: APPS[id].title, hint: "App", app: id }));
    const projects = repos.map((r) => ({ label: r.name, hint: r.private ? "Private project" : "Project", app: "project" as AppId, props: { name: r.name } }));
    const q = query.trim().toLowerCase();
    return [...apps, ...projects].filter((e) => !q || e.label.toLowerCase().includes(q)).slice(0, SHOWN);
  }, [query, repos]);
}

function openEntry(entry: Entry) {
  useOs.getState().open(entry.app, { title: entry.app === "project" ? entry.label : APPS[entry.app].title, props: entry.props, size: APPS[entry.app].size });
}

interface ResultsProps {
  entries: Entry[];
  index: number;
  setIndex: (i: number) => void;
  go: (entry: Entry) => void;
}

function Results({ entries, index, setIndex, go }: ResultsProps) {
  return (
    <ul role="listbox" aria-label="Results">
      {entries.map((entry, i) => (
        <li key={entry.app + entry.label} role="option" aria-selected={i === index}>
          <button type="button" onClick={() => go(entry)} onPointerEnter={() => setIndex(i)}>
            <span aria-hidden="true">{ICONS[entry.app]}</span>
            {entry.label}
            <small>{entry.hint}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Launcher() {
  const [open, setOpen] = useLauncherToggle();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const entries = useEntries(query);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) (setQuery(""), setIndex(0), field.current?.focus());
  }, [open]);
  if (!open) return null;
  const go = (entry: Entry | undefined) => entry && (openEntry(entry), setOpen(false));
  const onKey = (e: KeyboardEvent) => {
    const moves: Record<string, () => void> = { ArrowDown: () => setIndex((i) => Math.min(entries.length - 1, i + 1)), ArrowUp: () => setIndex((i) => Math.max(0, i - 1)), Enter: () => go(entries[index]), Escape: () => setOpen(false) };
    if (moves[e.key]) (e.preventDefault(), moves[e.key]());
  };
  return (
    <div className="launcher-backdrop" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="launcher" role="dialog" aria-label="Launcher">
        <input ref={field} value={query} placeholder="Open an app or a project…" aria-label="Search apps and projects" onChange={(e) => (setQuery(e.target.value), setIndex(0))} onKeyDown={onKey} />
        <Results entries={entries} index={index} setIndex={setIndex} go={go} />
      </div>
    </div>
  );
}
