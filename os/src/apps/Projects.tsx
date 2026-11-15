// The Projects explorer: a file manager over Rémi's GitHub. Folders on the left, filters and views on
// top, every repository as an icon or a row. Double-click (or tap on a touch screen) or Enter opens
// the project window. Data comes only from loadRepos(): the daily GitHub snapshot plus the private list.
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CATEGORIES, rank, statusOf, STATUS_LABEL, type Repo, type Status } from "../data/repos";
import { ICONS } from "./icons";
import { formatDate, openProject, StatusLed, useRepos } from "./projectKit";
import type { AppProps } from "./registry";
import "./projects.css";

type Sort = "ranked" | "stars" | "pushed" | "name";
type View = "icons" | "details";

interface Filters {
  folder: string; // "all", "flagships" or a category key ("private" included)
  query: string;
  language: string;
  status: Status | "";
  sort: Sort;
}

const INITIAL: Filters = { folder: "all", query: "", language: "", status: "", sort: "ranked" };

const SORTS: Record<Sort, { label: string; compare: (a: Repo, b: Repo) => number }> = {
  ranked: { label: "Ranked", compare: rank },
  stars: { label: "Stars", compare: (a, b) => (b.stars ?? -1) - (a.stars ?? -1) || rank(a, b) },
  pushed: { label: "Recently pushed", compare: (a, b) => (b.pushed ?? "").localeCompare(a.pushed ?? "") },
  name: { label: "Name", compare: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) },
};

const STATUSES: Status[] = ["active", "maintained", "archived", "private"];

// Touch screens have no comfortable double-click, so a single tap opens there.
const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

function inFolder(repo: Repo, folder: string) {
  if (folder === "all") return true;
  if (folder === "flagships") return repo.featured;
  return repo.category === folder;
}

function matches(repo: Repo, f: Filters) {
  const q = f.query.trim().toLowerCase();
  const text = `${repo.name} ${repo.description} ${repo.language ?? ""} ${repo.topics.join(" ")}`.toLowerCase();
  return inFolder(repo, f.folder) && (!q || text.includes(q)) && (!f.language || repo.language === f.language) && (!f.status || statusOf(repo) === f.status);
}

function folderList(repos: Repo[]) {
  const keys = ["all", "flagships", ...Object.keys(CATEGORIES)];
  const label = (key: string) => (key === "all" ? "All projects" : key === "flagships" ? "Flagships" : CATEGORIES[key]);
  return keys.map((id) => ({ id, label: label(id), count: repos.filter((r) => inFolder(r, id)).length })).filter((f) => f.count > 0 || f.id === "all");
}

// Number of icons per row, read from the layout so arrow keys follow what the visitor sees.
function columnsOf(container: HTMLElement | null) {
  const items = container ? Array.from(container.querySelectorAll<HTMLElement>("[data-name]")) : [];
  if (items.length === 0) return 1;
  return Math.max(1, items.filter((el) => el.offsetTop === items[0].offsetTop).length);
}

// Arrow keys, Home/End, Enter and type-ahead (typing "ga" jumps to GalaxyCrash).
function useKeyNav(list: Repo[], current: number, select: (name: string) => void, view: View) {
  const box = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const go = (index: number) => {
    const repo = list[Math.max(0, Math.min(list.length - 1, index))];
    if (!repo) return;
    select(repo.name);
    box.current?.querySelector(`[data-name="${CSS.escape(repo.name)}"]`)?.scrollIntoView({ block: "nearest" });
  };
  const typeAhead = (key: string) => {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + key.toLowerCase(), at: now };
    const start = typed.current.text.length === 1 ? current + 1 : current;
    const order = [...list.slice(start), ...list.slice(0, start)];
    const hit = order.find((r) => r.name.toLowerCase().startsWith(typed.current.text));
    if (hit) go(list.indexOf(hit));
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const cols = view === "icons" ? columnsOf(box.current) : 1;
    const moves: Record<string, number> = { ArrowDown: cols, ArrowUp: -cols, ArrowRight: view === "icons" ? 1 : 0, ArrowLeft: view === "icons" ? -1 : 0, PageDown: cols * 5, PageUp: -cols * 5 };
    if (event.key in moves) go(current + moves[event.key]);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(list.length - 1);
    else if (event.key === "Enter" && list[current]) openProject(list[current].name);
    else if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) typeAhead(event.key);
    else return;
    event.preventDefault();
  };
  return { box, onKeyDown };
}

function Sidebar({ folders, folder, pick }: { folders: ReturnType<typeof folderList>; folder: string; pick: (id: string) => void }) {
  return (
    <nav className="px-side" aria-label="Folders">
      <ul>
        {folders.map((f) => (
          <li key={f.id}>
            <button type="button" aria-pressed={folder === f.id} onClick={() => pick(f.id)}>
              <span className="px-ficon" aria-hidden="true">{f.id === "private" ? ICONS.lock : ICONS.folder}</span>
              <span className="px-flabel">{f.label}</span>
              <span className="px-fcount">{f.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface ToolbarProps {
  filters: Filters;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  folders: ReturnType<typeof folderList>;
  languages: string[];
  view: View;
  setView: (view: View) => void;
}

function Toolbar({ filters, set, folders, languages, view, setView }: ToolbarProps) {
  return (
    <div className="px-toolbar" role="toolbar" aria-label="Filters">
      <label className="px-field px-search">
        <span className="sr-only">Search projects</span>
        <input type="search" placeholder="Search name, topic, language…" value={filters.query} onChange={(e) => set("query", e.target.value)} data-autofocus />
      </label>
      <label className="px-field px-folder-select">
        <span>Folder</span>
        <select value={filters.folder} onChange={(e) => set("folder", e.target.value)}>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.label} ({f.count})</option>)}
        </select>
      </label>
      <label className="px-field">
        <span>Language</span>
        <select value={filters.language} onChange={(e) => set("language", e.target.value)}>
          <option value="">Any</option>
          {languages.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className="px-field">
        <span>Status</span>
        <select value={filters.status} onChange={(e) => set("status", e.target.value as Status | "")}>
          <option value="">Any</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </label>
      <label className="px-field">
        <span>Sort</span>
        <select value={filters.sort} onChange={(e) => set("sort", e.target.value as Sort)}>
          {(Object.keys(SORTS) as Sort[]).map((s) => <option key={s} value={s}>{SORTS[s].label}</option>)}
        </select>
      </label>
      <div className="px-views" role="group" aria-label="View">
        <button type="button" aria-pressed={view === "icons"} onClick={() => setView("icons")} title="Icons">▦<span className="sr-only">Icons</span></button>
        <button type="button" aria-pressed={view === "details"} onClick={() => setView("details")} title="Details">☰<span className="sr-only">Details</span></button>
      </div>
    </div>
  );
}

interface ListingProps {
  list: Repo[];
  selected: string | undefined;
  select: (name: string) => void;
  sortBy: (sort: Sort) => void;
  sort: Sort;
}

const itemId = (name: string) => `px-item-${name.replace(/[^\w-]/g, "_")}`;

// Click selects, double-click opens; on touch a tap opens straight away.
function itemHandlers(repo: Repo, select: (name: string) => void) {
  return {
    onClick: () => (coarse ? openProject(repo.name) : select(repo.name)),
    onDoubleClick: () => openProject(repo.name),
  };
}

function RepoIcon({ repo }: { repo: Repo }) {
  return (
    <span className="px-art" aria-hidden="true">
      {repo.private ? ICONS.lock : ICONS.folder}
      {repo.featured && <span className="px-star">★</span>}
    </span>
  );
}

function IconGrid({ list, selected, select }: ListingProps) {
  return list.map((repo) => (
    <div key={repo.name} id={itemId(repo.name)} data-name={repo.name} role="option" aria-selected={repo.name === selected} className="px-icon" title={repo.description} {...itemHandlers(repo, select)}>
      <RepoIcon repo={repo} />
      <span className="px-iname">{repo.name}</span>
      <span className="px-imeta">{repo.private ? "Private" : repo.language ?? "—"}</span>
    </div>
  ));
}

const COLUMNS: Array<{ label: string; sort?: Sort; className: string }> = [
  { label: "Name", sort: "name", className: "c-name" },
  { label: "Language", className: "c-lang" },
  { label: "Stars", sort: "stars", className: "c-stars" },
  { label: "Updated", sort: "pushed", className: "c-date" },
  { label: "Status", className: "c-status" },
];

function DetailsHead({ sort, sortBy }: Pick<ListingProps, "sort" | "sortBy">) {
  return (
    <div role="row" className="px-row px-head">
      {COLUMNS.map((c) => (
        <span key={c.label} role="columnheader" className={c.className} aria-sort={c.sort && c.sort === sort ? (c.sort === "name" ? "ascending" : "descending") : undefined}>
          {c.sort ? <button type="button" tabIndex={-1} onClick={() => sortBy(c.sort === sort ? "ranked" : c.sort!)}>{c.label}{c.sort === sort ? " ▾" : ""}</button> : c.label}
        </span>
      ))}
    </div>
  );
}

function DetailsRows({ list, selected, select }: ListingProps) {
  return list.map((repo) => {
    const status = statusOf(repo);
    return (
      <div key={repo.name} id={itemId(repo.name)} data-name={repo.name} role="row" aria-selected={repo.name === selected} className="px-row" title={repo.description} {...itemHandlers(repo, select)}>
        <span role="gridcell" className="c-name"><RepoIcon repo={repo} />{repo.name}</span>
        <span role="gridcell" className="c-lang">{repo.language ?? "—"}</span>
        <span role="gridcell" className="c-stars">{repo.stars === null ? "—" : `★ ${repo.stars}`}</span>
        <span role="gridcell" className="c-date">{formatDate(repo.pushed)}</span>
        <span role="gridcell" className="c-status"><StatusLed status={status} />{STATUS_LABEL[status]}</span>
      </div>
    );
  });
}

function StatusBar({ repos, shown, current }: { repos: Repo[]; shown: number; current?: Repo }) {
  const priv = repos.filter((r) => r.private).length;
  return (
    <footer className="px-status">
      <span>{repos.length - priv} public · {priv} private</span>
      <span>{shown} shown</span>
      <span className="px-status-sel" aria-live="polite">{current ? `${current.name}${current.private ? "" : ` · updated ${formatDate(current.pushed)}`}` : ""}</span>
    </footer>
  );
}

function useExplorer(repos: Repo[]) {
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [view, setView] = useState<View>("icons");
  const [picked, setPicked] = useState<string>();
  const list = useMemo(() => repos.filter((r) => matches(r, filters)).sort(SORTS[filters.sort].compare), [repos, filters]);
  // The selection follows the filters: if the picked repo is filtered out, the first one takes over.
  const current = list.find((r) => r.name === picked) ?? list[0];
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  return { filters, setFilters, set, view, setView, list, current, select: setPicked };
}

function Explorer({ repos }: { repos: Repo[] }) {
  const x = useExplorer(repos);
  const folders = useMemo(() => folderList(repos), [repos]);
  const languages = useMemo(() => [...new Set(repos.map((r) => r.language).filter((l): l is string => !!l))].sort(), [repos]);
  const index = x.current ? x.list.indexOf(x.current) : -1;
  const { box, onKeyDown } = useKeyNav(x.list, index, x.select, x.view);
  const props: ListingProps = { list: x.list, selected: x.current?.name, select: x.select, sort: x.filters.sort, sortBy: (s) => x.set("sort", s) };
  const listing = {
    ref: box,
    tabIndex: 0,
    onKeyDown,
    "aria-activedescendant": x.current ? itemId(x.current.name) : undefined,
    "aria-label": `Projects, ${x.list.length} items. Enter opens the selected project.`,
  };
  return (
    <div className="px">
      <Toolbar filters={x.filters} set={x.set} folders={folders} languages={languages} view={x.view} setView={x.setView} />
      <div className="px-main">
        <Sidebar folders={folders} folder={x.filters.folder} pick={(id) => x.set("folder", id)} />
        <div className="px-pane">
          {x.list.length === 0 ? (
            <div className="px-empty">
              <p>No project matches these filters.</p>
              <button type="button" className="px-btn" onClick={() => x.setFilters(INITIAL)}>Clear filters</button>
            </div>
          ) : x.view === "icons" ? (
            <div className="px-grid" role="listbox" {...listing}><IconGrid {...props} /></div>
          ) : (
            <div className="px-details" role="grid" aria-readonly="true" {...listing}>
              <DetailsHead {...props} />
              <DetailsRows {...props} />
            </div>
          )}
        </div>
      </div>
      <StatusBar repos={repos} shown={x.list.length} current={x.current} />
    </div>
  );
}

export default function Projects(_: AppProps) {
  const repos = useRepos();
  if (!repos) return <div className="app-pad loading">Reading ~/projects…</div>;
  if (repos.length === 0) return <div className="app-pad">The project list could not be loaded. Try again in a moment.</div>;
  return <Explorer repos={repos} />;
}
