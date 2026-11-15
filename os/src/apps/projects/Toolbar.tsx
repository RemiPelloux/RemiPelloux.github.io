// The explorer's toolbar: search, folder (on narrow windows), language, status, sort and the view toggle.
import type { ReactNode } from "react";
import { STATUS_LABEL, type Status } from "@/data/repos";
import { SORTS, STATUSES, type Filters, type Folder, type Sort, type View } from "./model";

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function Select({ label, value, onChange, children }: SelectProps) {
  return (
    <label className="px-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

function ViewToggle({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <div className="px-views" role="group" aria-label="View">
      <button type="button" aria-pressed={view === "icons"} onClick={() => setView("icons")} title="Icons">▦<span className="sr-only">Icons</span></button>
      <button type="button" aria-pressed={view === "details"} onClick={() => setView("details")} title="Details">☰<span className="sr-only">Details</span></button>
    </div>
  );
}

export interface ToolbarProps {
  filters: Filters;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  folders: Folder[];
  languages: string[];
  view: View;
  setView: (view: View) => void;
}

export function Toolbar({ filters, set, folders, languages, view, setView }: ToolbarProps) {
  return (
    <div className="px-toolbar" role="toolbar" aria-label="Filters">
      <label className="px-field px-search">
        <span className="sr-only">Search projects</span>
        <input type="search" placeholder="Search name, topic, language…" value={filters.query} onChange={(e) => set("query", e.target.value)} data-autofocus />
      </label>
      <div className="px-folder-select">
        <Select label="Folder" value={filters.folder} onChange={(v) => set("folder", v)}>{folders.map((f) => <option key={f.id} value={f.id}>{f.label} ({f.count})</option>)}</Select>
      </div>
      <Select label="Language" value={filters.language} onChange={(v) => set("language", v)}><option value="">Any</option>{languages.map((l) => <option key={l}>{l}</option>)}</Select>
      <Select label="Status" value={filters.status} onChange={(v) => set("status", v as Status | "")}><option value="">Any</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
      <Select label="Sort" value={filters.sort} onChange={(v) => set("sort", v as Sort)}>{(Object.keys(SORTS) as Sort[]).map((s) => <option key={s} value={s}>{SORTS[s].label}</option>)}</Select>
      <ViewToggle view={view} setView={setView} />
    </div>
  );
}
