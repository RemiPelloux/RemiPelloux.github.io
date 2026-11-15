// The Projects explorer: a file manager over Rémi's GitHub. Folders on the left, filters and views on
// top, every repository as an icon or a row. Double-click (or tap on a touch screen) or Enter opens
// the project window. Data comes only from loadRepos(): the daily GitHub snapshot plus the private list.
import { useMemo, useState } from "react";
import { statusOf, STATUS_LABEL, type Repo } from "@/data/repos";
import { folderList, INITIAL, matches, SORTS, type Filters, type Folder, type Sort, type View } from "./projects/model";
import { useKeyNav } from "./projects/keyNav";
import { Toolbar } from "./projects/Toolbar";
import { ICONS } from "./icons";
import { formatDate, openProject, StatusLed, useRepos } from "./projectKit";
import type { AppProps } from "./registry";
import "./projects.css";

// Touch screens have no comfortable double-click, so a single tap opens there.
const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

function Sidebar({ folders, folder, pick }: { folders: Folder[]; folder: string; pick: (id: string) => void }) {
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
  const folders = useMemo(() => folderList(repos), [repos]);
  const languages = useMemo(() => [...new Set(repos.map((r) => r.language).filter((l): l is string => !!l))].sort(), [repos]);
  return { filters, setFilters, set, view, setView, list, current, select: setPicked, folders, languages };
}

type Explorer = ReturnType<typeof useExplorer>;

// The list itself: empty state, icon grid or details table, with keyboard navigation.
function Pane({ x }: { x: Explorer }) {
  const index = x.current ? x.list.indexOf(x.current) : -1;
  const { box, onKeyDown } = useKeyNav({ list: x.list, current: index, select: x.select, view: x.view });
  const props: ListingProps = { list: x.list, selected: x.current?.name, select: x.select, sort: x.filters.sort, sortBy: (s) => x.set("sort", s) };
  const listing = { ref: box, tabIndex: 0, onKeyDown, "aria-activedescendant": x.current ? itemId(x.current.name) : undefined, "aria-label": `Projects, ${x.list.length} items. Enter opens the selected project.` };
  if (x.list.length === 0) {
    return (
      <div className="px-empty">
        <p>No project matches these filters.</p>
        <button type="button" className="px-btn" onClick={() => x.setFilters(INITIAL)}>Clear filters</button>
      </div>
    );
  }
  if (x.view === "icons") return <div className="px-grid" role="listbox" {...listing}><IconGrid {...props} /></div>;
  return (
    <div className="px-details" role="grid" aria-readonly="true" {...listing}>
      <DetailsHead {...props} />
      <DetailsRows {...props} />
    </div>
  );
}

function Explorer({ repos }: { repos: Repo[] }) {
  const x = useExplorer(repos);
  return (
    <div className="px">
      <Toolbar filters={x.filters} set={x.set} folders={x.folders} languages={x.languages} view={x.view} setView={x.setView} />
      <div className="px-main">
        <Sidebar folders={x.folders} folder={x.filters.folder} pick={(id) => x.set("folder", id)} />
        <div className="px-pane"><Pane x={x} /></div>
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
