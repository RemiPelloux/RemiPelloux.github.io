// System settings. Theme and mode live in the store (which saves them), so the menu bar, the
// terminal and this window always agree.
import { useState } from "react";
import type { AppProps } from "./registry";
import { useOs, write, type Mode, type Theme } from "../state/store";
import "./apps.css";

interface Choice<T> {
  value: T;
  label: string;
  note: string;
}

const THEMES: Choice<Theme>[] = [
  { value: "day", label: "Day", note: "Blue Riviera sky, shutters open." },
  { value: "night", label: "Night", note: "Lights down, late-night coding." },
];

const MODES: Choice<Mode>[] = [
  { value: "3d", label: "3D workstation", note: "The desk, the room and the computer, in WebGL." },
  { value: "lite", label: "Lite 2D", note: "Just the desktop. Lighter on batteries and old machines." },
];

function Radios<T extends string>({ legend, name, choices, value, onPick }: { legend: string; name: string; choices: Choice<T>[]; value: T; onPick: (v: T) => void }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {choices.map((c) => (
        <label key={c.value} className="radio">
          <input type="radio" name={name} value={c.value} checked={value === c.value} onChange={() => onPick(c.value)} />
          <span>{c.label}<small>{c.note}</small></span>
        </label>
      ))}
    </fieldset>
  );
}

function pickTheme(theme: Theme) {
  const os = useOs.getState();
  os.setTheme(theme);
  if (theme === "night") os.unlock("night-owl", "Achievement: Night owl");
}

function pickMode(mode: Mode) {
  const os = useOs.getState();
  os.setMode(mode);
  if (mode === "lite") os.unlock("lite", "Achievement: Travel light");
}

// Two clicks: the first arms the button, so a stray click never wipes progress.
function ResetAchievements() {
  const count = useOs((s) => s.achievements.length);
  const [armed, setArmed] = useState(false);
  const reset = () => {
    if (!armed) return setArmed(true);
    useOs.setState({ achievements: [] });
    write("riviera-os-achievements", "[]");
    setArmed(false);
  };
  return (
    <fieldset>
      <legend>Achievements</legend>
      <p>{count ? `${count} unlocked on this browser.` : "None unlocked yet."}</p>
      <div className="btn-row">
        <button type="button" className={`btn btn-small${armed ? " danger" : " ghost"}`} onClick={reset} onBlur={() => setArmed(false)} disabled={!count}>
          {armed ? "Click again to reset" : "Reset achievements"}
        </button>
      </div>
    </fieldset>
  );
}

export default function Settings(_: AppProps) {
  const theme = useOs((s) => s.theme);
  const mode = useOs((s) => s.mode);
  return (
    <form className="app-pad settings" onSubmit={(e) => e.preventDefault()}>
      <Radios legend="Appearance" name="theme" choices={THEMES} value={theme} onPick={pickTheme} />
      <Radios legend="Experience" name="mode" choices={MODES} value={mode} onPick={pickMode} />
      <fieldset>
        <legend>Motion</legend>
        <p>If your system asks for reduced motion, RIVIERA.OS respects it automatically and turns animations off.</p>
      </fieldset>
      <fieldset>
        <legend>Language</legend>
        <p>English. The classic site is also available in French.</p>
      </fieldset>
      <ResetAchievements />
      <fieldset>
        <legend>About this computer</legend>
        <dl className="sysinfo">
          <dt>System</dt><dd>RIVIERA.OS v1.0</dd>
          <dt>Built with</dt><dd>React, Three.js, React Three Fiber</dd>
          <dt>Made by</dt><dd>Rémi Pelloux</dd>
        </dl>
        <div className="btn-row">
          <a className="btn ghost btn-small" href="/?lite">Leave for the classic site</a>
        </div>
      </fieldset>
    </form>
  );
}
