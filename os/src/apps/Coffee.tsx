// coffee.exe: a pretend brew in three steps. The timers drive the text and the CSS only decorates,
// so with reduced motion (animations off in os.css) the story still plays out in words.
import { useEffect, useState } from "react";
import type { AppProps } from "./registry";
import "./apps.css";

const STEPS = ["Grinding beans…", "Heating water…", "Brewing…"];
const STEP_MS = 1400;

const CUP_EMPTY = [
  "  _________  ",
  " |         |__",
  " |         |  |",
  " |         |__|",
  "  \\_______/   ",
].join("\n");

const CUP_FULL = [
  "  _________  ",
  " |~~~~~~~~~|__",
  " |#########|  |",
  " |#########|__|",
  "  \\_______/   ",
].join("\n");

function useBrew(run: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const timers = STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [run]);
  return step; // 0..2 = working on STEPS[step], 3 = ready
}

function BrewSteps({ step }: { step: number }) {
  return (
    <>
      <span className="brew-bar inset" role="progressbar" aria-label="Brewing" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={step}>
        <i style={{ width: `${(step / STEPS.length) * 100}%` }} />
      </span>
      <ol className="brew-steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i < step ? "done" : i === step ? "doing" : undefined}>
            {i < step ? "[x] " : "[ ] "}{label}
          </li>
        ))}
      </ol>
    </>
  );
}

export default function Coffee(_: AppProps) {
  const [run, setRun] = useState(0);
  const step = useBrew(run);
  const ready = step >= STEPS.length;
  return (
    <div className={`coffee${ready ? " ready" : ""}`}>
      <pre className="cup inset" aria-hidden="true">
        <span className="steam">{"   ) ) )"}</span>
        {ready ? CUP_FULL : CUP_EMPTY}
      </pre>
      <BrewSteps step={step} />
      <p className="coffee-msg" role="status">{ready ? "Your coffee is ready ☕ (virtual, sorry)" : ""}</p>
      <button type="button" className="btn" onClick={() => setRun((n) => n + 1)}>
        {ready ? "Brew another" : "Restart"}
      </button>
    </div>
  );
}
