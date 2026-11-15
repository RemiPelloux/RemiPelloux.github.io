// Tech explorer: one tab per domain, each with the technologies I use there and the public
// repositories that show them. The last tab counts languages from the live repository catalog.
import { useEffect, useState } from "react";
import type { AppProps } from "./registry";
import { loadRepos, type Repo } from "../data/repos";
import { openProject, tabKeys } from "./kit";
import "./apps.css";

interface Domain {
  id: string;
  label: string;
  intro: string;
  techs: string[];
  projects: string[]; // public repository names; ones missing from the catalog are left out
}

const DOMAINS: Domain[] = [
  {
    id: "ai",
    label: "AI, agents & MCP",
    intro: "Tool-calling agents and MCP servers in production at OpenPro, and models you can host yourself.",
    techs: ["Tool-calling agents", "MCP servers", "RAG", "Provider fallback", "Claude", "Mistral & Voxtral", "Ollama", "OpenAI Agents SDK"],
    projects: ["Concerto", "kill-my-idea", "OpenAgents", "OpenPlod"],
  },
  {
    id: "devtools",
    label: "Developer tools",
    intro: "Tools that keep coding agents honest and fast: size rules, test impact analysis, a local IDE.",
    techs: ["Claude Code plugins", "Codex", "Cursor rules", "Git worktrees", "Electron", "Test impact analysis"],
    projects: ["pelloux-guidelines", "SmarttyTest", "OpenVision", "openterm", "gitverse"],
  },
  {
    id: "native",
    label: "Native & devices",
    intro: "Desktop apps that keep your data on your machine, and devices talked to directly.",
    techs: ["Tauri", "Electron", "Flutter", "Android", "Bluetooth", "Swift", "Kotlin"],
    projects: ["OpenPlod", "lumasync", "android-hid-kb", "delonghi-coffee-api"],
  },
  {
    id: "systems",
    label: "Systems, Rust & containers",
    intro: "Systems software in Rust, from a daemon-less container runtime to a package manager.",
    techs: ["Rust", "Linux namespaces", "cgroups v2", "OCI", "Docker", "Terraform", "AWS"],
    projects: ["Containust", "rjs", "openterm"],
  },
  {
    id: "security",
    label: "Security & reverse engineering",
    intro: "Spare-time vulnerability research, reported to maintainers first. One CVE in Symfony: CVE-2026-45753.",
    techs: ["Burp Suite", "IDA", "Ghidra", "nuclei", "adb", "Firmware reverse engineering", "Attack simulation"],
    projects: ["HackoogleMini", "GalaxyCrash", "php-upload-rce", "BurpHunterTK"],
  },
  {
    id: "web",
    label: "Web",
    intro: "A Laravel core with TypeScript and React at OpenPro, and plenty of the web before it.",
    techs: ["TypeScript", "React", "Next.js", "Laravel", "Symfony", "Node.js", "PostgreSQL", "Redis"],
    projects: ["RemiPelloux.github.io", "openpro-connector-sdk", "gitverse", "templateCardGame"],
  },
];

const LANGUAGES_TAB = DOMAINS.length;

function DomainPanel({ domain, repos }: { domain: Domain; repos: Repo[] }) {
  const known = new Map(repos.filter((r) => !r.private).map((r) => [r.name, r]));
  const shown = repos.length ? domain.projects.filter((name) => known.has(name)) : domain.projects;
  return (
    <div className="app-text">
      <h3 className="app-h">{domain.label}</h3>
      <p className="app-lead">{domain.intro}</p>
      <h4 className="app-h3">Technologies</h4>
      <ul className="techs">{domain.techs.map((t) => <li key={t}>{t}</li>)}</ul>
      <h4 className="app-h3">See it in a project</h4>
      <ul className="demo">
        {shown.map((name) => (
          <li key={name}>
            <button type="button" onClick={() => openProject(name)}>
              <b>{name}</b>
              <span>{known.get(name)?.description || "Open the project window."}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Public, non-fork repositories per primary language, as GitHub reports it.
function languageCounts(repos: Repo[]) {
  const counts = new Map<string, number>();
  for (const repo of repos) if (!repo.private && repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function LanguagesPanel({ repos, loaded }: { repos: Repo[]; loaded: boolean }) {
  const counts = languageCounts(repos);
  const max = counts[0]?.[1] ?? 1;
  const total = counts.reduce((sum, [, n]) => sum + n, 0);
  return (
    <div className="app-text">
      <h3 className="app-h">Languages</h3>
      <p className="app-lead">Public repositories by main language, straight from the GitHub catalog (forks left out).</p>
      {!loaded && <p className="loading">Counting repositories…</p>}
      {loaded && !counts.length && <p className="muted">The catalog could not be loaded. Try again later.</p>}
      <ul className="bars" aria-label="Public repositories per language">
        {counts.map(([language, n]) => (
          <li key={language}>
            <span>{language}</span>
            <span className="bar inset" aria-hidden="true"><i style={{ width: `${(n / max) * 100}%` }} /></span>
            <span className="n">{n}<span className="sr-only"> repositories</span></span>
          </li>
        ))}
      </ul>
      {total > 0 && <p className="muted">{total} public repositories with a detected language.</p>}
    </div>
  );
}

export default function Skills({ win }: AppProps) {
  const [index, setIndex] = useState(0);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    loadRepos().then((list) => live && (setRepos(list), setLoaded(true)));
    return () => void (live = false);
  }, []);
  const labels = [...DOMAINS.map((d) => d.label), "Languages"];
  const id = (part: string) => `${win.id}-${part}`;
  return (
    <div className="split">
      <nav className="side" aria-label="Domains">
        <div role="tablist" aria-orientation="vertical" aria-label="Technical domains" className="side-tabs" onKeyDown={tabKeys(labels.length, index, setIndex)}>
          {labels.map((label, i) => (
            <button key={label} type="button" role="tab" id={id(`tab-${i}`)} aria-selected={i === index} aria-controls={id("panel")} tabIndex={i === index ? 0 : -1} onClick={() => setIndex(i)}>
              {label}
            </button>
          ))}
        </div>
      </nav>
      <div className="panel" role="tabpanel" id={id("panel")} aria-labelledby={id(`tab-${index}`)} tabIndex={0}>
        {index === LANGUAGES_TAB ? <LanguagesPanel repos={repos} loaded={loaded} /> : <DomainPanel domain={DOMAINS[index]} repos={repos} />}
      </div>
    </div>
  );
}
