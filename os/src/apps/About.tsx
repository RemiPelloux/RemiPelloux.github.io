// About Rémi: four pages behind a sidebar. Every fact here is already on the classic site (index,
// CV, security page); nothing is added for the OS.
import { useState, type ReactNode } from "react";
import type { AppProps } from "./registry";
import { Badge, Ext, openApp, openProject, SideTabs } from "./kit";
import "./apps.css";

const LINKEDIN = "https://www.linkedin.com/in/remipelloux/";
const GITHUB = "https://github.com/RemiPelloux";

function Profile() {
  return (
    <div className="app-text">
      <h3 className="app-h">Rémi Pelloux</h3>
      <p className="app-lead">CTO and co-founder of OpenPro, in Nice.</p>
      <h4 className="app-h3">In short</h4>
      <p>I build AI developer tools that run on your own models, desktop apps that keep your data on your machine, and systems software in Rust.</p>
      <p>Born in Antibes, studied in Sophia Antipolis. Before OpenPro: security, R&amp;D and full-stack work for clients including <strong>Dassault Aviation, DGA, Thales and Decathlon</strong>. One CVE in Symfony so far.</p>
      <dl className="facts">
        <div className="inset"><dt>Based in</dt><dd>Nice, born in Antibes</dd></div>
        <div className="inset"><dt>Now</dt><dd>CTO, OpenPro, since Feb. 2023</dd></div>
        <div className="inset"><dt>Shipping software</dt><dd>10 years</dd></div>
        <div className="inset"><dt>Speaks</dt><dd>French, English, Italian</dd></div>
      </dl>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => openApp("projects")}>Open Projects</button>
        <button type="button" className="btn ghost" onClick={() => openApp("map")}>Map of Antibes</button>
      </div>
    </div>
  );
}

const PATH: Array<{ years: string; role: string; what: string; now?: boolean }> = [
  { years: "2023 to now", role: "CTO and co-founder, OpenPro", what: "A French professional network with video CVs, AI matching and the Mia assistant, on web, iOS and Android. Nice, remote.", now: true },
  { years: "2024 to 2025", role: "Security and full-stack lead, SaaS Office", what: "A vulnerability management tool in Python and a framework that simulates attacks on network, DNS and cloud. Valbonne." },
  { years: "2023 to 2024", role: "Lead developer R&D, MOABI", what: "Software energy dependence research, a C backend migration, Symfony 5.3 to 6.4 and security audits for Dassault Aviation, DGA, Thales and Decathlon. On site in Rennes and Hengelo." },
  { years: "2020 to 2023", role: "Lead full-stack developer, Therascience", what: "Internal tools for logistics and CRM, APIs, monitoring and e-commerce interfaces. Monaco." },
  { years: "2019 to 2020", role: "CTO, Votre-marketing.fr and AdWatch", what: "Internal CRMs, business applications and paid campaigns. Sophia Antipolis." },
  { years: "2016 to 2019", role: "Web development trainer", what: "HTML, CSS, JavaScript, PHP, Symfony, Node.js and Python for Pôle Emploi, Orsys and SoftTeam, across France." },
];

function Path() {
  return (
    <div className="app-text">
      <h3 className="app-h">Path</h3>
      <p className="app-lead">Ten years, from the classroom to the CTO chair, mostly on the Côte d'Azur.</p>
      <ol className="timeline" aria-label="Work history, most recent first">
        {PATH.map((step) => (
          <li key={step.years + step.role} className={step.now ? "now" : undefined}>
            <span className="tl-years">{step.years}</span>
            <span className="tl-role">{step.role}</span>
            <span className="tl-what">{step.what}</span>
          </li>
        ))}
      </ol>
      <p className="muted">Master's degree in computer science, SophiaTech, Sophia Antipolis. Bachelor's degree, Université de Nice.</p>
      <div className="btn-row">
        <Ext href="/cv/" className="btn ghost">Full CV</Ext>
      </div>
    </div>
  );
}

function HowIWork() {
  return (
    <div className="app-text">
      <h3 className="app-h">How I work</h3>
      <h4 className="app-h3">Small code, even when agents write it</h4>
      <p>The <strong>Pelloux Guidelines</strong> are my ten rules for AI coding agents, with hard limits. An audit with no dependencies checks them in the agent loop, before each commit and in CI.</p>
      <div className="rules">
        <div className="inset"><b>400</b><span>lines a file</span></div>
        <div className="inset"><b>25</b><span>lines a function</span></div>
        <div className="inset"><b>3</b><span>parameters</span></div>
      </div>
      <h4 className="app-h3">Local first</h4>
      <p>Your data stays on your machine: OpenVision needs no account and sends no telemetry, OpenPlod keeps recordings in a vault on your own disk, and the models can be ones you host yourself.</p>
      <h4 className="app-h3">Report before publishing</h4>
      <p>I look for vulnerabilities in other people's software and report them to the maintainers first. CVE-2026-45753: a javascript: URI survived Symfony's HtmlSanitizer. Reported, fixed, advisory published on 28 May 2026.</p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => openProject("pelloux-guidelines")}>Pelloux Guidelines</button>
        <button type="button" className="btn ghost" onClick={() => openApp("skills")}>Tech explorer</button>
        <Ext href="/security/" className="btn ghost">Security page</Ext>
      </div>
    </div>
  );
}

const LINKS = [
  { href: LINKEDIN, name: "LinkedIn", note: "the fastest way to reach me" },
  { href: GITHUB, name: "GitHub", note: "github.com/RemiPelloux" },
  { href: "https://github.com/sponsors/RemiPelloux", name: "GitHub Sponsors", note: "support the open-source work" },
  { href: "/?lite", name: "The classic site", note: "the same story, as a web page" },
];

function Elsewhere() {
  return (
    <div className="app-text">
      <h3 className="app-h">Elsewhere</h3>
      <p className="app-lead">LinkedIn is the fastest way. I read every message that is not a sales pitch.</p>
      <ul className="links">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Ext href={link.href}><span>{link.name}</span><small>{link.note}</small></Ext>
          </li>
        ))}
      </ul>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => openApp("contact")}>Open Contact</button>
      </div>
    </div>
  );
}

const PAGES: Array<{ id: string; label: string; body: () => ReactNode }> = [
  { id: "profile", label: "Profile", body: Profile },
  { id: "path", label: "Path", body: Path },
  { id: "work", label: "How I work", body: HowIWork },
  { id: "elsewhere", label: "Elsewhere", body: Elsewhere },
];

export default function About({ win }: AppProps) {
  const [index, setIndex] = useState(0);
  const page = PAGES[index];
  const id = (part: string) => `${win.id}-${part}`;
  return (
    <div className="split">
      <nav className="side" aria-label="About sections">
        <div className="badge-wrap">
          <Badge />
          <span className="badge-name">Rémi Pelloux</span>
          <span className="badge-role">CTO · OpenPro</span>
        </div>
        <SideTabs label="About Rémi" tabs={PAGES.map((p) => ({ key: p.id, label: p.label }))} index={index} setIndex={setIndex} idOf={id} />
      </nav>
      <div className="panel" role="tabpanel" id={id("panel")} aria-labelledby={id(`tab-${index}`)} tabIndex={0}>
        <page.body />
      </div>
    </div>
  );
}
