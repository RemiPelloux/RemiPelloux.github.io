// The menu bar across the top of the screen: menus that open with a click or the keyboard, the sky and
// 3D/Lite switches, and the clock in Antibes.
import { useEffect, useRef, useState } from "react";
import { useOs } from "../state/store";
import { APPS } from "../apps/registry";
import type { AppId } from "../apps/ids";
import { GITHUB } from "../data/repos";

interface Item {
  label: string;
  app?: AppId;
  props?: Record<string, string>;
  href?: string;
  action?: () => void;
}

const FLAGSHIPS = ["OpenVision", "OpenPlod", "Modelly", "Containust", "HackoogleMini"];

function menus(): Array<{ name: string; items: Item[] }> {
  const os = useOs.getState();
  return [
    { name: "RIVIERA.OS", items: [{ label: "About this computer", app: "about" }, { label: "Settings…", app: "settings" }, { label: "Achievements", app: "achievements" }, { label: "Leave for the classic site", href: "/?lite" }] },
    { name: "View", items: [{ label: os.theme === "day" ? "Night mode" : "Day mode", action: () => os.setTheme(os.theme === "day" ? "night" : "day") }, { label: os.mode === "3d" ? "Lite mode (no 3D)" : "3D workstation", action: () => os.setMode(os.mode === "3d" ? "lite" : "3d") }] },
    { name: "Projects", items: [{ label: "All projects…", app: "projects" }, ...FLAGSHIPS.map((name) => ({ label: name, app: "project" as AppId, props: { name } })), { label: "GitHub profile ↗", href: GITHUB }] },
    { name: "Tools", items: [{ label: "Terminal", app: "terminal" }, { label: "Tech explorer", app: "skills" }, { label: "Lab bench", app: "lab" }, { label: "Antibes map", app: "map" }] },
    { name: "Help", items: [{ label: "Launcher  (Ctrl K)", action: () => window.dispatchEvent(new Event("riviera:launcher")) }, { label: "Terminal help", app: "terminal", props: { command: "help" } }, { label: "Contact", app: "contact" }] },
  ];
}

export function runItem(item: Item) {
  const os = useOs.getState();
  if (item.href) window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self", "noopener");
  else if (item.action) item.action();
  else if (item.app) os.open(item.app, { title: item.app === "project" ? item.props?.name : APPS[item.app].title, props: item.props, size: APPS[item.app].size });
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(timer);
  }, []);
  return <time className="clock">{now.toLocaleString("en-GB", { timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time>;
}

export function MenuBar() {
  const [open, setOpen] = useState<string | null>(null);
  const { theme, mode, setTheme, setMode } = useOs();
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const away = (event: PointerEvent) => !bar.current?.contains(event.target as Node) && setOpen(null);
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, []);

  const pick = (item: Item) => {
    setOpen(null);
    runItem(item);
  };

  return (
    <nav className="menubar" ref={bar} aria-label="Menu bar">
      <ul className="menus" role="menubar">
        {menus().map((menu) => (
          <li key={menu.name} className={menu.name === "RIVIERA.OS" ? "brand" : ""}>
            <button type="button" aria-haspopup="menu" aria-expanded={open === menu.name} onClick={() => setOpen(open === menu.name ? null : menu.name)} onPointerEnter={() => open && setOpen(menu.name)}>
              {menu.name}
            </button>
            {open === menu.name && (
              <ul className="menu" role="menu" onKeyDown={(e) => e.key === "Escape" && (e.preventDefault(), setOpen(null))}>
                {menu.items.map((item, i) => (
                  <li key={item.label} role="none">
                    <button type="button" role="menuitem" autoFocus={i === 0} onClick={() => pick(item)}>{item.label}</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="tray">
        <button type="button" className="tray-btn" onClick={() => setTheme(theme === "day" ? "night" : "day")} aria-label={theme === "day" ? "Switch to night" : "Switch to day"} title="Day / night">{theme === "day" ? "☀" : "☾"}</button>
        <button type="button" className="tray-btn" onClick={() => setMode(mode === "3d" ? "lite" : "3d")} aria-label={mode === "3d" ? "Switch to Lite mode" : "Switch to 3D"} title="3D / Lite">{mode === "3d" ? "3D" : "2D"}</button>
        <Clock />
      </div>
    </nav>
  );
}
