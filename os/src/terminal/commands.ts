// The everyday commands. Every app on the desktop has a command, and every command that shows
// something also offers the window that shows it better. Easter eggs live in eggs.ts.
import { useOs } from "@/state/store";
import { APPS } from "@/apps/registry";
import type { AppId } from "@/apps/ids";
import { CATEGORIES, GITHUB, loadRepos, STATUS_LABEL, statusOf } from "@/data/repos";
import { commands, FILES, HOME, listing, pretty, register, resolve, type Line } from "./engine";

const LINKEDIN = "https://www.linkedin.com/in/remipelloux/";

const pad = (text: string, width: number) => text + " ".repeat(Math.max(1, width - text.length));

const ABOUT: Array<string | Line> = [
  { text: "Rémi Pelloux", kind: "accent" },
  "CTO and co-founder of OpenPro, a French professional network with AI matching. Based in Nice.",
  "Born in Antibes. Studied at Sophia Antipolis, a few kilometres inland.",
  "I build AI developer tools that run on your own models, desktop apps that keep your data on",
  "your machine, and systems software in Rust.",
  "Before OpenPro: security, R&D and full-stack work for Dassault Aviation, DGA, Thales and Decathlon.",
  "One CVE in Symfony so far: CVE-2026-45753.",
  { text: "→ open about    (the full story, in a window)", kind: "dim", run: "open about" },
];

const SKILLS: Array<string | Line> = [
  { text: "Languages   TypeScript · Python · Rust · PHP · Java · C", kind: "out" },
  { text: "AI          agents, MCP servers, local models, routing between providers" },
  { text: "Native      Tauri, Electron, Flutter, Android, Bluetooth" },
  { text: "Systems     container runtimes, Linux, reverse engineering, firmware" },
  { text: "Web         React, Laravel, Symfony, Node" },
  { text: "Security    disclosure, exploit research, Burp tooling" },
  { text: "→ open skills   (the tech explorer)", kind: "dim", run: "open skills" },
];

// `open` accepts an app (`open map`) or a repository (`open OpenPlod`).
async function openTarget(target: string, open: (app: AppId, o?: object) => void, print: (l: Line | string) => void) {
  const app = (Object.keys(APPS) as AppId[]).find((id) => id === target.toLowerCase() || APPS[id].title.toLowerCase() === target.toLowerCase());
  if (app && app !== "project") {
    open(app, { title: APPS[app].title, size: APPS[app].size });
    print({ text: `Opening ${APPS[app].title}…`, kind: "ok" });
    return;
  }
  const repo = (await loadRepos()).find((r) => r.name.toLowerCase() === target.toLowerCase());
  if (!repo) {
    print({ text: `open: nothing called "${target}". Try \`ls projects\` or \`help\`.`, kind: "err" });
    return;
  }
  open("project", { title: repo.name, props: { name: repo.name }, size: APPS.project.size });
  print({ text: `Opening ${repo.name}${repo.private ? " (private repository)" : ""}…`, kind: "ok" });
}

register(
  {
    name: "help",
    summary: "List the commands",
    run: ({ print }) => {
      print({ text: "Commands (Tab completes, ↑ ↓ walk the history):", kind: "accent" });
      for (const c of commands().filter((c) => !c.hidden).sort((a, b) => a.name.localeCompare(b.name))) print({ text: `  ${pad(c.usage ?? c.name, 24)}${c.summary}`, run: c.usage ? undefined : c.name });
      print({ text: "Some commands are not listed. Curiosity is rewarded.", kind: "dim" });
    },
  },
  { name: "about", summary: "Who I am", run: ({ print }) => print(ABOUT) },
  { name: "skills", summary: "What I work with", run: ({ print }) => print(SKILLS) },
  {
    name: "ls",
    summary: "List a folder",
    usage: "ls [-a] [folder]",
    run: async ({ args, cwd, print }) => {
      const all = args.includes("-a");
      const path = resolve(cwd, args.find((a) => !a.startsWith("-")) ?? ".");
      const items = await listing(path);
      if (!items) return print({ text: `ls: ${pretty(path)}: no such folder`, kind: "err" });
      const shown = items.filter((item) => all || !item.startsWith("."));
      print(shown.length ? shown.join("   ") : "(empty)");
    },
  },
  {
    name: "cd",
    summary: "Change folder",
    usage: "cd <folder>",
    run: async ({ args, cwd, setCwd, print }) => {
      const path = resolve(cwd, args[0] ?? "~");
      if (!(await listing(path))) return print({ text: `cd: ${args[0]}: no such folder`, kind: "err" });
      setCwd(path);
    },
  },
  { name: "pwd", summary: "Where am I", run: ({ cwd, print }) => print(cwd) },
  {
    name: "cat",
    summary: "Read a file",
    usage: "cat <file>",
    run: async ({ args, cwd, print, open }) => {
      const path = resolve(cwd, args[0] ?? "");
      const file = path.split("/").pop() ?? "";
      if (file === "about.md") return print(ABOUT);
      if (file === "skills.md") return print(SKILLS);
      if (file === "contact.txt") return print([`LinkedIn  ${LINKEDIN}`, `GitHub    ${GITHUB}`]);
      if (file === "antibes.map") return open("map", { title: APPS.map.title, size: APPS.map.size });
      if (file === "todo.txt") return print(["[x] Build", "[x] Endure", "[ ] Become"]);
      if (file === ".coffee_recipe") return print({ text: "Recipe protected. Only root can make coffee here.", kind: "err" });
      const repoMatch = path.match(/\/projects\/([^/]+)\/(README\.md|source\.url)$/);
      if (repoMatch) {
        const repo = (await loadRepos()).find((r) => r.name === repoMatch[1]);
        if (!repo) return print({ text: `cat: ${args[0]}: no such file`, kind: "err" });
        if (repoMatch[2] === "source.url") return print({ text: repo.url ?? "private", href: repo.url ?? undefined });
        return print([{ text: `# ${repo.name}`, kind: "accent" }, repo.description || "No description yet.", `${CATEGORIES[repo.category] ?? repo.category} · ${repo.language ?? "—"} · ${STATUS_LABEL[statusOf(repo)]}${repo.stars !== null ? ` · ★ ${repo.stars}` : ""}`]);
      }
      print({ text: `cat: ${args[0] ?? ""}: no such file`, kind: "err" });
    },
  },
  {
    name: "projects",
    summary: "My repositories, ranked",
    run: async ({ print }) => {
      const repos = await loadRepos();
      print({ text: `${repos.filter((r) => !r.private).length} public, ${repos.filter((r) => r.private).length} private. Click a name, or \`open <name>\`.`, kind: "accent" });
      for (const repo of repos.slice(0, 14)) print({ text: `  ${pad(repo.name, 22)}${pad(repo.private ? "private" : `★ ${repo.stars}`, 10)}${(repo.description || "").slice(0, 52)}`, run: `open ${repo.name}` });
      print({ text: "→ open projects   (the explorer, with filters)", kind: "dim", run: "open projects" });
    },
  },
  {
    name: "open",
    summary: "Open an app or a project",
    usage: "open <app|project>",
    complete: async (partial) => [...(Object.keys(APPS) as AppId[]).filter((id) => !APPS[id].hidden), ...(await loadRepos()).map((r) => r.name)].filter((n) => n.toLowerCase().startsWith(partial.toLowerCase())),
    run: async ({ args, open, print }) => (args[0] ? openTarget(args.join(" "), open, print) : print({ text: "usage: open <app|project>", kind: "err" })),
  },
  {
    name: "github",
    summary: "My GitHub profile",
    run: ({ print }) => print([{ text: GITHUB, href: GITHUB }, { text: "→ open projects", kind: "dim", run: "open projects" }]),
  },
  { name: "map", summary: "The Antibes map", run: ({ open, print }) => (open("map", { title: APPS.map.title, size: APPS.map.size }), print({ text: "Unfolding the map of Antibes…", kind: "ok" })) },
  {
    name: "contact",
    summary: "How to reach me",
    run: ({ print }) => print([{ text: `LinkedIn  ${LINKEDIN}`, href: LINKEDIN }, { text: `GitHub    ${GITHUB}`, href: GITHUB }, { text: "LinkedIn is the fastest way to reach me.", kind: "dim" }]),
  },
  { name: "clear", summary: "Clear the screen", aliases: ["cls"], run: ({ clear }) => clear() },
  { name: "history", summary: "What you typed", run: ({ history, print }) => print(history().map((h, i) => `${String(i + 1).padStart(4)}  ${h}`)) },
  { name: "whoami", summary: "Who are you", run: ({ print }) => print("guest — welcome to my computer. Make yourself at home.") },
  { name: "date", summary: "The date in Antibes", run: ({ print }) => print(new Date().toLocaleString("en-GB", { timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short" })) },
  { name: "echo", summary: "Say something", usage: "echo <text>", run: ({ args, print }) => print(args.join(" ")) },
  {
    name: "theme",
    summary: "Day or night",
    usage: "theme <day|night>",
    complete: (p) => ["day", "night"].filter((t) => t.startsWith(p)),
    run: ({ args, print }) => {
      const os = useOs.getState();
      const next = args[0] === "day" || args[0] === "night" ? args[0] : os.theme === "day" ? "night" : "day";
      os.setTheme(next);
      print({ text: next === "day" ? "Opening the shutters. Bonjour la Riviera." : "Lights down. Late-night coding mode.", kind: "ok" });
    },
  },
  { name: "lite", summary: "Switch to the lightweight 2D desktop", run: ({ print }) => (useOs.getState().setMode("lite"), print({ text: "Lite mode on.", kind: "ok" })) },
  { name: "3d", summary: "Back to the 3D workstation", run: ({ print }) => (useOs.getState().setMode("3d"), print({ text: "3D mode on.", kind: "ok" })) },
  { name: "exit", summary: "Close the terminal", run: ({ closeTerminal }) => closeTerminal() },
);

export { FILES, HOME };
