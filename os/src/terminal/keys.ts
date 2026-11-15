// What each key does in the terminal's input line. One small handler per key.
import type { KeyboardEvent } from "react";
import { commonPrefix, complete, type Line } from "./engine";
import type { History } from "./history";

export interface KeyState {
  input: string;
  setInput: (value: string) => void;
  cwd: string;
  history: History;
  submit: (raw: string) => void;
  print: (line: Line) => void;
  clear: () => void;
}

const LAST_WORD = /\S*$/;

async function completeWord(state: KeyState) {
  const options = await complete(state.input, state.cwd);
  if (options.length === 1) state.setInput(state.input.replace(LAST_WORD, options[0]) + (options[0].endsWith("/") ? "" : " "));
  if (options.length < 2) return;
  state.setInput(state.input.replace(LAST_WORD, commonPrefix(options)));
  state.print({ text: options.join("   "), kind: "dim" });
}

const HANDLERS: Record<string, (state: KeyState, event: KeyboardEvent) => void> = {
  Enter: (state) => (state.setInput(""), state.submit(state.input)),
  ArrowUp: (state) => state.setInput(state.history.step(-1)),
  ArrowDown: (state) => state.setInput(state.history.step(1)),
  Tab: (state) => void completeWord(state),
  // Escape clears the line instead of closing the window.
  Escape: (state) => state.setInput(""),
};

export function onTerminalKey(event: KeyboardEvent<HTMLInputElement>, state: KeyState) {
  if (event.key === "l" && event.ctrlKey) {
    event.preventDefault();
    return state.clear();
  }
  const handler = HANDLERS[event.key];
  if (!handler) return;
  if (event.key !== "Enter") event.preventDefault();
  handler(state, event);
}
