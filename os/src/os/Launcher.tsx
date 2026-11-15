// The launcher: Ctrl+K (or the RIVIERA.OS button) opens a box to type an app or a project name.
// Arrow keys move, Enter opens, Escape closes. Nobody has to know a terminal command.
import { useEffect, useMemo, useRef, useState } from "react";
import { useOs } from "../state/store";
import { APPS } from "../apps/registry";
import type { AppId } from "../apps/ids";
import { ICONS } from "../apps/icons";
import { loadRepos, type Repo } from "../data/repos";

interface Entry {
  label: string;
  hint: string;
  app: AppId;
  props?: Record<string, string>;
}

export function Launcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [repos, setRepos] = useState<Repo[]>([]);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") (event.preventDefault(), toggle());
    };
    window.addEventListener("riviera:launcher", toggle);
    window.addEventListener("keydown", key);
    loadRepos().then(setRepos);
    return () => (window.removeEventListener("riviera:launcher", toggle), window.removeEventListener("keydown", key));
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    field.current?.focus();
  }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const apps = (Object.keys(APPS) as AppId[]).filter((id) => !APPS[id].hidden).map((id) => ({ label: APPS[id].title, hint: "App", app: id }));
    const projects = repos.map((r) => ({ label: r.name, hint: r.private ? "Private project" : "Project", app: "project" as AppId, props: { name: r.name } }));
    const q = query.trim().toLowerCase();
    return [...apps, ...projects].filter((e) => !q || e.label.toLowerCase().includes(q)).slice(0, 9);
  }, [query, repos]);

  if (!open) return null;
  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    useOs.getState().open(entry.app, { title: entry.app === "project" ? entry.label : APPS[entry.app].title, props: entry.props, size: APPS[entry.app].size });
    setOpen(false);
  };
  return (
    <div className="launcher-backdrop" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="launcher" role="dialog" aria-label="Launcher">
        <input
          ref={field}
          value={query}
          placeholder="Open an app or a project…"
          aria-label="Search apps and projects"
          onChange={(e) => (setQuery(e.target.value), setIndex(0))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setIndex((i) => Math.min(entries.length - 1, i + 1)));
            else if (e.key === "ArrowUp") (e.preventDefault(), setIndex((i) => Math.max(0, i - 1)));
            else if (e.key === "Enter") go(entries[index]);
            else if (e.key === "Escape") (e.preventDefault(), setOpen(false));
          }}
        />
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
      </div>
    </div>
  );
}
