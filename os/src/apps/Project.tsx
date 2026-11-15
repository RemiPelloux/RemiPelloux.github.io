// One project's window: what it is, what it is built with, when it last moved, and where to read it.
// Private repositories show their description and a private badge only: no link, no stars, no dates.
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, statusOf, STATUS_LABEL, VISUALS, type Repo } from "@/data/repos";
import { useOs } from "@/state/store";
import { ICONS } from "./icons";
import { formatDate, StatusLed, useRepos } from "./projectKit";
import { APPS, type AppProps } from "./registry";
import "./projects.css";

// Module-level on purpose: the "Code tourist" achievement counts distinct projects per visit, across
// every project window, including ones already closed.
const opened = new Set<string>();
const TOURIST_AT = 5;

function useTourist(name: string | undefined) {
  useEffect(() => {
    if (!name) return;
    opened.add(name);
    if (opened.size >= TOURIST_AT) useOs.getState().unlock("explorer", "Achievement: Code tourist");
  }, [name]);
}

function Badges({ repo }: { repo: Repo }) {
  const status = statusOf(repo);
  return (
    <ul className="pj-badges" aria-label="Badges">
      {repo.featured && <li className="b-flag">★ Flagship</li>}
      {repo.private ? (
        <li className="b-private"><span aria-hidden="true">{ICONS.lock}</span>Private repository — source not public</li>
      ) : (
        <li className="b-status"><StatusLed status={status} />{STATUS_LABEL[status]}</li>
      )}
      {!repo.private && <li>{CATEGORIES[repo.category] ?? repo.category}</li>}
      {repo.language && <li className="b-lang">{repo.language}</li>}
    </ul>
  );
}

// The screenshot fades in once decoded; a broken image simply disappears.
function Shot({ src, name }: { src: string; name: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  if (state === "failed") return null;
  return (
    <figure className={`pj-shot ${state}`}>
      <img src={src} alt={`Screenshot of ${name}`} loading="lazy" decoding="async" onLoad={() => setState("ready")} onError={() => setState("failed")} />
    </figure>
  );
}

function Stack({ repo }: { repo: Repo }) {
  if (!repo.language && repo.topics.length === 0) return null;
  return (
    <section className="pj-sec">
      <h3>Stack</h3>
      <ul className="pj-tags">
        {repo.language && <li className="pj-lang">{repo.language}</li>}
        {repo.topics.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}

function Facts({ repo }: { repo: Repo }) {
  return (
    <section className="pj-sec">
      <h3>Facts</h3>
      <dl className="pj-facts">
        <div><dt>Stars</dt><dd>★ {repo.stars ?? 0}</dd></div>
        <div><dt>Created</dt><dd>{formatDate(repo.created)}</dd></div>
        <div><dt>Last push</dt><dd>{formatDate(repo.pushed)}</dd></div>
      </dl>
    </section>
  );
}

// Clipboard can be refused (insecure context, permissions): the command stays visible and selectable.
function CloneCommand({ name }: { name: string }) {
  const command = `git clone https://github.com/RemiPelloux/${name}.git`;
  const [note, setNote] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setNote("Copied to the clipboard ✓");
    } catch {
      field.current?.select();
      setNote("Copy blocked: the command is selected, press Ctrl+C");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(""), 2600);
  };
  return (
    <div className="pj-clone">
      <input ref={field} readOnly value={command} aria-label="git clone command" onFocus={(e) => e.target.select()} />
      <button type="button" className="px-btn" onClick={() => void copy()}>Copy git clone command</button>
      <span className="pj-note" role="status">{note}</span>
    </div>
  );
}

function Links({ repo }: { repo: Repo }) {
  const study = VISUALS[repo.name]?.caseStudy;
  return (
    <section className="pj-sec">
      <h3>Links</h3>
      <div className="pj-links">
        {repo.url && <a className="px-btn primary" href={repo.url} target="_blank" rel="noopener"><span aria-hidden="true">{ICONS.github}</span>View source on GitHub ↗</a>}
        {repo.homepage && <a className="px-btn" href={repo.homepage} target="_blank" rel="noopener">Homepage ↗</a>}
        {study && <a className="px-btn" href={study}>Read the case study</a>}
      </div>
      <CloneCommand name={repo.name} />
    </section>
  );
}

function PrivateNote() {
  return (
    <section className="pj-sec pj-private">
      <span aria-hidden="true">{ICONS.lock}</span>
      <p>This repository is private: its source, stars and history are not public.</p>
    </section>
  );
}

function ProjectView({ repo }: { repo: Repo }) {
  const shot = VISUALS[repo.name]?.shot;
  return (
    <article className="pj">
      <header className="pj-head">
        <span className="pj-icon" aria-hidden="true">{repo.private ? ICONS.lock : ICONS.folder}</span>
        <div>
          <h1>{repo.name}</h1>
          <p className="pj-desc">{repo.description || "No description on GitHub."}</p>
        </div>
      </header>
      <Badges repo={repo} />
      {shot && <Shot src={shot} name={repo.name} />}
      {repo.private ? <PrivateNote /> : (
        <>
          <Stack repo={repo} />
          <Facts repo={repo} />
          <Links repo={repo} />
        </>
      )}
    </article>
  );
}

export default function Project({ win }: AppProps) {
  const repos = useRepos();
  const repo = repos?.find((r) => r.name === win.props.name);
  useTourist(repo?.name);
  if (!repos) return <div className="app-pad loading">Opening {win.props.name ?? "project"}…</div>;
  if (!repo) {
    return (
      <div className="app-pad pj-missing">
        <p className="pj-404">404</p>
        <p>No project called <strong>{win.props.name || "(nothing)"}</strong> lives on this computer.</p>
        <button type="button" className="px-btn" onClick={() => useOs.getState().open("projects", { title: APPS.projects.title, size: APPS.projects.size })}>Browse all projects</button>
      </div>
    );
  }
  return <ProjectView repo={repo} />;
}
