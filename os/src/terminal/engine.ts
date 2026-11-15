// The terminal's engine: parsing, the command table, completion and a small virtual file system.
// Commands are plain objects registered by name, so new ones (eggs.ts) plug in without touching this.
import { useOs } from "@/state/store";
import type { AppId } from "@/apps/ids";
import { loadRepos, type Repo } from "@/data/repos";

export type LineKind = "out" | "err" | "ok" | "dim" | "accent" | "cmd";

export interface Line {
  text: string;
  kind?: LineKind;
  href?: string; // opens in a new tab when clicked
  run?: string; // a command to run when clicked
}

export interface Context {
  args: string[];
  raw: string;
  cwd: string;
  print: (lines: string | Line | Array<string | Line>) => void;
  clear: () => void;
  setCwd: (path: string) => void;
  open: (app: AppId, options?: Parameters<ReturnType<typeof useOs.getState>["open"]>[1]) => void;
  repos: () => Promise<Repo[]>;
  closeTerminal: () => void;
  history: () => string[];
}

export interface Command {
  name: string;
  summary: string;
  usage?: string;
  hidden?: boolean; // left out of `help`: found by curiosity
  aliases?: string[];
  complete?: (partial: string) => Promise<string[]> | string[];
  run: (ctx: Context) => void | Promise<void>;
}

const table = new Map<string, Command>();

export function register(...commands: Command[]) {
  for (const command of commands) {
    table.set(command.name, command);
    for (const alias of command.aliases ?? []) table.set(alias, command);
  }
}

export function commands(): Command[] {
  return [...new Set(table.values())];
}

export function find(name: string): Command | undefined {
  return table.get(name);
}

// Splits a line into words, keeping "quoted strings" together.
export function parse(line: string): string[] {
  const words: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  for (const match of line.matchAll(pattern)) words.push(match[1] ?? match[2] ?? match[3]);
  return words;
}

// The virtual file system: the home folder, and a folder per repository.
export const HOME = "/home/remi";
export const FILES: Record<string, string[]> = {
  [HOME]: ["projects/", "about.md", "skills.md", "contact.txt", "antibes.map", ".secrets/"],
  [`${HOME}/.secrets`]: [".coffee_recipe", ".konami", "todo.txt"],
};

export function resolve(cwd: string, target = "~"): string {
  if (target === "~" || target === "") return HOME;
  const parts = (target.startsWith("/") ? target : target.startsWith("~") ? HOME + target.slice(1) : `${cwd}/${target}`).split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return `/${out.join("/")}`;
}

export const pretty = (path: string) => (path.startsWith(HOME) ? `~${path.slice(HOME.length)}` : path);

export async function listing(path: string): Promise<string[] | null> {
  if (path === `${HOME}/projects`) return (await loadRepos()).map((repo) => `${repo.name}/`);
  if (path.startsWith(`${HOME}/projects/`)) {
    const name = path.slice(`${HOME}/projects/`.length);
    const repo = (await loadRepos()).find((r) => r.name.toLowerCase() === name.toLowerCase());
    return repo ? ["README.md", ...(repo.private ? [] : ["source.url"])] : null;
  }
  return FILES[path] ?? null;
}

// Completion for the word under the cursor: a command name first, then its own arguments.
export async function complete(line: string, cwd: string): Promise<string[]> {
  const words = parse(line);
  const typing = line.endsWith(" ") ? "" : words.pop() ?? "";
  if (words.length === 0) {
    return commands().filter((c) => !c.hidden).map((c) => c.name).filter((name) => name.startsWith(typing)).sort();
  }
  const command = find(words[0]);
  const options = command?.complete ? await command.complete(typing) : (await listing(resolve(cwd, typing.includes("/") ? typing.slice(0, typing.lastIndexOf("/")) : "."))) ?? [];
  const prefix = typing.includes("/") ? typing.slice(0, typing.lastIndexOf("/") + 1) : "";
  return options
    .map((option) => (option.startsWith(prefix) || command?.complete ? option : prefix + option))
    .filter((option) => option.toLowerCase().startsWith(typing.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

// The longest common start of several completions, for Tab with more than one match.
export function commonPrefix(options: string[]): string {
  if (options.length === 0) return "";
  let prefix = options[0];
  for (const option of options) while (!option.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
  return prefix;
}
