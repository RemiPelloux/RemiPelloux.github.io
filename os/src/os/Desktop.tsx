// The desktop: wallpaper, the welcome banner, the icons, the windows, the taskbar, the launcher and the
// achievement toasts. Rendered inside the CRT in 3D, and full screen in Lite.
import { Suspense, useEffect, useState } from "react";
import { useOs, type WindowState } from "@/state/store";
import { APPS, DESKTOP } from "@/apps/registry";
import { ICONS } from "@/apps/icons";
import { loadRepos } from "@/data/repos";
import { MenuBar } from "./MenuBar";
import { Window } from "./Window";
import { Launcher } from "./Launcher";
import { Toast } from "./Toast";
import { Boundary } from "./Boundary";

function openApp(app: (typeof DESKTOP)[number]) {
  useOs.getState().open(app, { title: APPS[app].title, size: APPS[app].size });
}

function Icons() {
  return (
    <ul className="icons" aria-label="Applications">
      {DESKTOP.map((app) => (
        <li key={app}>
          <button type="button" className="icon-btn" onClick={() => openApp(app)}>
            <span className="icon-art">{ICONS[app]}</span>
            <span className="icon-label">{APPS[app].title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function usePublicCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => void loadRepos().then((repos) => setCount(repos.filter((r) => !r.private).length)), []);
  return count;
}

function Tasks() {
  const { windows, focused, focus, minimize } = useOs();
  return (
    <ul className="tasks" aria-label="Open windows">
      {windows.map((w) => {
        const shown = w.id === focused && !w.minimized;
        return (
          <li key={w.id}>
            <button type="button" className={shown ? "on" : ""} onClick={() => (shown ? minimize(w.id) : focus(w.id))}>
              <span aria-hidden="true">{ICONS[w.app]}</span>{w.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Taskbar() {
  const count = usePublicCount();
  return (
    <footer className="taskbar">
      <button type="button" className="start" onClick={() => window.dispatchEvent(new Event("riviera:launcher"))} aria-label="Open the launcher">
        <span className="start-logo" aria-hidden="true">R</span> RIVIERA.OS
      </button>
      <Tasks />
      <p className="status">
        <a href="https://github.com/RemiPelloux" target="_blank" rel="noopener">GitHub {count !== null ? `· ${count} public repos` : ""}</a>
        <span>Antibes</span>
        <span className="online">● Online</span>
      </p>
    </footer>
  );
}

function AppWindow({ win }: { win: WindowState }) {
  const App = APPS[win.app].component;
  return (
    <Window win={win} icon={ICONS[win.app]}>
      <Boundary>
        <Suspense fallback={<p className="app-pad loading">Loading…</p>}>
          <App win={win} />
        </Suspense>
      </Boundary>
    </Window>
  );
}

function Welcome() {
  return (
    <header className="welcome">
      <h1>Welcome to <em>RIVIERA.OS</em></h1>
      <p className="welcome-role">Rémi Pelloux · Developer · AI builder · Founder</p>
      <p className="welcome-text">I design, build and ship AI systems, developer tools, products and games, from Antibes. This is my computer: open anything.</p>
    </header>
  );
}

export function Desktop() {
  const windows = useOs((s) => s.windows);
  return (
    <div className="desktop">
      <MenuBar />
      <main className="wallpaper">
        <Welcome />
        <Icons />
        {windows.map((win) => <AppWindow key={win.id} win={win} />)}
      </main>
      <Taskbar />
      <Launcher />
      <Toast />
    </div>
  );
}
