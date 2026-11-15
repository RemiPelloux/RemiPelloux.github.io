// The terminal window: the scrollback, then the prompt. Output lines can be clickable: links open in a
// new tab, suggested commands run when clicked. The session itself lives in useTerminal.
import { useEffect, useRef } from "react";
import type { Line } from "@/terminal/engine";
import { useTerminal } from "@/terminal/useTerminal";
import "@/terminal/commands";
import "@/terminal/eggs";
import type { AppProps } from "./registry";

function OutputLine({ line, run }: { line: Line; run: (command: string) => void }) {
  const body = line.href ? (
    <a href={line.href} target="_blank" rel="noopener">{line.text}</a>
  ) : line.run ? (
    <button type="button" className="tl-run" onClick={() => run(line.run!)}>{line.text}</button>
  ) : (
    line.text
  );
  return <p className={`tl ${line.kind ?? "out"}`}>{body}</p>;
}

export default function Terminal({ win }: AppProps) {
  const { lines, input, setInput, prompt, submit, onKey } = useTerminal(win);
  const field = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  // Braces matter: scrollTo() returns a promise in recent browsers, and React would call it as a cleanup.
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);
  return (
    <div className="terminal" onPointerUp={() => !window.getSelection()?.toString() && field.current?.focus()}>
      <div className="term-screen" ref={screen} role="log" aria-live="polite">
        {lines.map((line, i) => <OutputLine key={i} line={line} run={submit} />)}
        <label className="term-input">
          <span className="prompt">{prompt}</span>
          <input ref={field} data-autofocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" autoCapitalize="off" aria-label="Terminal command" />
        </label>
      </div>
    </div>
  );
}
