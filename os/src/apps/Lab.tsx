// The lab bench, opened from the Raspberry Pi on the desk: the hardware hacks and experiments, laid out
// as pages of a lab notebook. Each entry is a real public repository; its description, language and
// dates come from the GitHub snapshot. Only the "subject" line is ours, and it restates the description.
import { useEffect } from "react";
import { statusOf, STATUS_LABEL, type Repo } from "@/data/repos";
import { useOs } from "@/state/store";
import { formatDate, openProject, StatusLed, useRepos } from "./projectKit";
import type { AppProps } from "./registry";
import "./projects.css";

// The order of the notebook, and what each experiment was plugged into.
const BENCH: Array<{ name: string; subject: string }> = [
  { name: "HackoogleMini", subject: "Google Home Mini (gen 1)" },
  { name: "android-hid-kb", subject: "Rooted Android phone → USB keyboard" },
  { name: "GalaxyCrash", subject: "Samsung Galaxy devices" },
  { name: "delonghi-coffee-api", subject: "DeLonghi coffee machine (ECAM)" },
  { name: "OpenPlod", subject: "Plaud Note Pro over Bluetooth" },
  { name: "lumasync", subject: "Philips Hue lights" },
  { name: "DrosoSimBetter", subject: "Drosophila suzukii simulation" },
  { name: "Multi-Threaded-Prime-Number-Calculation", subject: "CPU threads" },
];

function Entry({ repo, subject, index }: { repo: Repo; subject: string; index: number }) {
  const status = statusOf(repo);
  const label = `EXP-${String(index + 1).padStart(2, "0")}`;
  return (
    <li>
      <button type="button" className="lab-card" onClick={() => openProject(repo.name)} aria-label={`${label} ${repo.name}, ${STATUS_LABEL[status]}. Open project.`}>
        <span className="lab-top">
          <span className="lab-id">{label}</span>
          <span className="lab-state"><StatusLed status={status} />{STATUS_LABEL[status]}</span>
        </span>
        <strong className="lab-name">{repo.name}</strong>
        <span className="lab-subject">Subject: {subject}</span>
        <span className="lab-desc">{repo.description}</span>
        <span className="lab-foot">
          <span>{repo.language ?? "—"}</span>
          <span>last push {formatDate(repo.pushed)}</span>
        </span>
      </button>
    </li>
  );
}

export default function Lab(_: AppProps) {
  const repos = useRepos();
  useEffect(() => useOs.getState().unlock("pi", "Achievement: Tinkerer"), []);
  if (!repos) return <div className="app-pad loading">Powering up the bench…</div>;
  // Only experiments that exist in the snapshot: a renamed or hidden repo simply drops out.
  const entries = BENCH.flatMap((b) => {
    const repo = repos.find((r) => r.name === b.name && !r.private);
    return repo ? [{ repo, subject: b.subject }] : [];
  });
  return (
    <div className="lab">
      <header className="lab-head">
        <p className="lab-kicker">~/lab · bench notebook</p>
        <h1>Hardware hacks &amp; experiments</h1>
        <p>Phones, smart speakers and home devices, reverse-engineered protocols, small simulations. Pick an entry to open the project.</p>
      </header>
      <ol className="lab-grid">
        {entries.map((e, i) => <Entry key={e.repo.name} repo={e.repo} subject={e.subject} index={i} />)}
      </ol>
      <p className="lab-legend">
        <span><StatusLed status="active" /> pushed in the last 90 days</span>
        <span><StatusLed status="maintained" /> older</span>
      </p>
    </div>
  );
}
