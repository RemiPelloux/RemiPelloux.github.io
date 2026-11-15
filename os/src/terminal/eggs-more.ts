// The longer Easter eggs: neofetch, the Matrix, a harmless "hack", and a few jokes every developer
// expects a terminal to get. All hidden from `help`. Nothing here touches the network.
import { useOs } from "@/state/store";
import { register, type Context, type Line } from "./engine";

const sleep = (ms: number) => new Promise((done) => window.setTimeout(done, ms));
const LOADED_AT = Date.now(); // the "boot" time neofetch reports uptime from

// Prints lines one by one, so the output feels typed out rather than dumped.
async function slowly(print: Context["print"], lines: Array<string | Line>, ms = 90) {
  for (const line of lines) {
    print(line);
    await sleep(ms);
  }
}

const LOGO = [
  "     \\   |   /     ",
  "   --  .---.  --   ",
  "      (     )      ",
  "   --  '---'  --   ",
  "     /   |   \\     ",
  "  ~~~~~~~~~~~~~~~  ",
  " ~ R I V I E R A ~ ",
  "  ~~~~~~~~~~~~~~~  ",
];

function uptime() {
  const seconds = Math.floor((Date.now() - LOADED_AT) / 1000);
  const [h, m, s] = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
}

async function publicRepos(repos: Context["repos"]) {
  try {
    return `${(await repos()).filter((repo) => !repo.private).length} public`;
  } catch {
    return "offline";
  }
}

async function neofetch({ print, repos }: Context) {
  const os = useOs.getState();
  const info = [
    "guest@riviera",
    "─────────────",
    "OS: RIVIERA.OS v1.0",
    "Host: CRT-17",
    "Kernel: React 19 + Vite",
    "Shell: rsh",
    `Theme: ${os.theme}`,
    `Mode: ${os.mode === "3d" ? "3D workstation" : "Lite"}`,
    `Uptime: ${uptime()}`,
    `Repos: ${await publicRepos(repos)}`,
    "Location: Antibes, FR",
  ];
  const rows = Math.max(LOGO.length, info.length);
  const text = Array.from({ length: rows }, (_, i) => `${LOGO[i] ?? " ".repeat(LOGO[0].length)}  ${info[i] ?? ""}`).join("\n");
  print({ text, kind: "accent" });
}

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789";
const rainLine = (width: number) => Array.from({ length: width }, () => (Math.random() < 0.3 ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");

async function matrix({ print }: Context) {
  useOs.getState().unlock("matrix", "Achievement: Follow the white rabbit");
  await slowly(print, Array.from({ length: 8 }, () => ({ text: rainLine(42), kind: "ok" as const })), 70);
  await slowly(print, [{ text: "Wake up, guest…", kind: "ok" }, { text: "The Matrix has you.", kind: "ok" }, { text: "Follow the white rabbit. 🐇", kind: "dim" }], 600);
}

const bar = (percent: number) => `[${"#".repeat(percent / 10).padEnd(10, ".")}] ${String(percent).padStart(3)}%`;

async function hack({ print }: Context) {
  const steps = ["Reticulating splines", "Bypassing the mainframe", "Downloading more RAM", "Reversing the polarity", "Compiling the Riviera"];
  await slowly(print, steps.map((step, i) => ({ text: `${step.padEnd(26, ".")} ${bar((i + 1) * 20)}`, kind: "ok" as const })), 380);
  print([{ text: "ACCESS GRANTED — to your own browser tab.", kind: "accent" }, { text: "You were the admin all along. 😉", kind: "dim" }]);
}

function rm({ args, print }: Context) {
  const flags = args.filter((a) => a.startsWith("-")).join("");
  if (args.some((a) => a === "/" || a === "/*")) {
    useOs.getState().setShiba({ mood: "awake" });
    if (args.includes("--no-preserve-root")) return print({ text: "rm: --no-preserve-root ignored. The Shiba preserves root personally.", kind: "err" });
    return print([{ text: "rm: refusing to delete the Riviera. The sea was here first.", kind: "err" }, { text: "(The Shiba woke up and is now watching you.)", kind: "dim" }]);
  }
  print({ text: args.length ? `rm: cannot remove '${args.filter((a) => !a.startsWith("-")).join(" ") || flags}': guests can look, not touch.` : "rm: missing operand. Bold of you, though.", kind: "err" });
}

async function ping({ args, print }: Context) {
  const host = (args[0] ?? "").toLowerCase();
  if (!host) return print({ text: "usage: ping <host>  — try `ping antibes`", kind: "dim" });
  if (host !== "antibes") return print({ text: `ping: ${host}: this computer has no network. Antibes is local, though.`, kind: "err" });
  print("PING antibes.riviera (43.58°N 7.12°E): 56 data bytes");
  const times = [0.3, 0.2, 0.4, 0.2].map((t, i) => `64 bytes from antibes.riviera: icmp_seq=${i + 1} ttl=64 time=${t} ms`);
  await slowly(print, times, 450);
  print([{ text: "--- antibes ping statistics ---", kind: "dim" }, { text: "4 packets transmitted, 4 received, 0% packet loss. The sea is calm.", kind: "ok" }]);
}

const FORTUNES = [
  "It works on my machine. Ship the machine.",
  "The best code is the code you never had to write.",
  "A good commit message is a letter to your future self.",
  "Weekend forecast: sun on the Riviera, rain in the CI.",
  "There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
  "Slow is smooth, smooth is fast. Same for code reviews and coastal roads.",
  "Every bug is a feature that hasn't found its audience.",
  "Write the test first. Then go for a swim.",
];

// Wraps text into lines of at most `width` characters for the speech bubble.
function wrap(text: string, width: number) {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && (lines[last] + " " + word).length <= width) lines[last] += " " + word;
    else lines.push(word.slice(0, width));
  }
  return lines;
}

function shibasay({ args, print }: Context) {
  const lines = wrap(args.join(" ") || "wan!", 32);
  const width = Math.max(...lines.map((l) => l.length));
  const body = lines.map((l, i) => {
    const [a, b] = lines.length === 1 ? ["<", ">"] : i === 0 ? ["/", "\\"] : i === lines.length - 1 ? ["\\", "/"] : ["|", "|"];
    return `${a} ${l.padEnd(width)} ${b}`;
  });
  const dog = ["      \\    /\\_/\\", "       \\  ( o.o )", "           > ^ <"];
  print({ text: [` ${"_".repeat(width + 2)}`, ...body, ` ${"‾".repeat(width + 2)}`, ...dog].join("\n"), kind: "accent" });
}

const QUIT = { text: "You exited vim. Few can say that.", kind: "ok" as const };

register(
  { name: "neofetch", summary: "System info", hidden: true, run: neofetch },
  { name: "matrix", summary: "There is no spoon", hidden: true, run: matrix },
  { name: "hack", summary: "Hack the planet", hidden: true, complete: () => ["the"], run: hack },
  { name: "rm", summary: "Remove files", hidden: true, run: rm },
  { name: "ping", summary: "Ping a host", hidden: true, complete: () => ["antibes"], run: ping },
  {
    name: "vim",
    summary: "The editor",
    hidden: true,
    aliases: ["vi"],
    run: ({ print }) => print([{ text: '~\n~\n~\n"untitled" [New File]', kind: "dim" }, "You are now in vim. Nobody has ever left.", { text: "Hint: :q", kind: "dim", run: ":q" }]),
  },
  { name: ":q", summary: "Quit vim", hidden: true, aliases: [":q!", ":wq", ":x"], run: ({ print }) => print(QUIT) },
  { name: "nano", summary: "The friendly editor", hidden: true, run: ({ print }) => print("nano: too approachable for this terminal. (^X to exit — see? easy.)") },
  { name: "emacs", summary: "The operating system", hidden: true, run: ({ print }) => print("emacs: this computer already has an operating system.") },
  { name: "fortune", summary: "A fortune", hidden: true, run: ({ print }) => print({ text: FORTUNES[Math.floor(Math.random() * FORTUNES.length)], kind: "accent" }) },
  { name: "shibasay", summary: "The Shiba speaks", usage: "shibasay <text>", hidden: true, aliases: ["cowsay"], run: shibasay },
  {
    name: "weather",
    summary: "The forecast",
    hidden: true,
    complete: () => ["antibes"],
    run: ({ args, print }) =>
      print([
        { text: `Forecast for ${args[0] ? args.join(" ") : "Antibes"} — offline, so this is a guess:`, kind: "dim" },
        { text: "  \\  /   Sunny. Light sea breeze. Sea calm.\n -( )-   Confidence: Riviera-level optimism.\n  /  \\", kind: "accent" },
      ]),
  },
);
