// Runs one command line: records it, finds the command and gives it its context.
import { useOs } from "@/state/store";
import { loadRepos } from "@/data/repos";
import { find, parse, type Context, type Line } from "./engine";
import type { History } from "./history";

export type Print = (lines: string | Line | Array<string | Line>) => void;

export interface Session {
  print: Print;
  clear: () => void;
  cwd: string;
  setCwd: (path: string) => void;
  history: History;
  windowId: string;
}

function contextFor(session: Session, args: string[], raw: string): Context {
  const os = useOs.getState();
  return {
    args,
    raw,
    cwd: session.cwd,
    print: session.print,
    clear: session.clear,
    setCwd: session.setCwd,
    open: (app, options) => void os.open(app, options),
    repos: loadRepos,
    closeTerminal: () => os.close(session.windowId),
    history: () => session.history.entries,
  };
}

export async function execute(raw: string, session: Session) {
  const text = raw.trim();
  if (!text) return;
  session.history.push(text);
  const [name, ...args] = parse(text);
  const command = find(name.toLowerCase());
  if (!command) return session.print({ text: `${name}: command not found. Type \`help\`.`, kind: "err" });
  try {
    await command.run(contextFor(session, args, text));
  } catch (error) {
    session.print({ text: `${name}: ${(error as Error).message}`, kind: "err" });
  }
  useOs.getState().unlock("first-command", "Achievement: Hello, terminal");
}
