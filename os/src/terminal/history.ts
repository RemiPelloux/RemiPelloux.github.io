// The command history: newest last, no duplicates, kept for the browser session.
const KEY = "riviera-os-history";
const KEPT = 100;

function load(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function save(entries: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entries.slice(-KEPT)));
  } catch {
    /* storage blocked: the history lasts until the window closes */
  }
}

export class History {
  entries = load();
  cursor = this.entries.length;

  push(command: string) {
    this.entries = [...this.entries.filter((entry) => entry !== command), command];
    this.cursor = this.entries.length;
    save(this.entries);
  }

  // Walks the history: -1 is older, +1 is newer; past the newest gives an empty line.
  step(direction: -1 | 1): string {
    this.cursor = Math.max(0, Math.min(this.entries.length, this.cursor + direction));
    return this.entries[this.cursor] ?? "";
  }
}
