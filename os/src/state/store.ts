// One store for the whole computer: open windows, the sky, 3D or Lite, the Shiba's mood and the
// achievements. The 3D scene and the OS both read and write it, so a click on the wall map and the
// `map` command open the same window.
import { create } from "zustand";
import type { AppId } from "@/apps/ids";

export type Theme = "day" | "night";
export type Mode = "3d" | "lite";

export interface WindowState {
  id: string;
  app: AppId;
  title: string;
  props: Record<string, string>;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  maximized: boolean;
  minimized: boolean;
}

export interface OpenOptions {
  title?: string;
  props?: Record<string, string>;
  size?: [number, number];
  at?: [number, number]; // where to place it, in OS pixels; centred and cascaded otherwise
}

interface OsState {
  windows: WindowState[];
  focused: string | null;
  topZ: number;
  theme: Theme;
  mode: Mode;
  achievements: string[];
  toast: { id: number; text: string } | null;
  shiba: { mood: "asleep" | "awake" | "happy" | "zoomies"; pets: number };
  zoomed: boolean; // the camera leans in to the screen while the visitor works on it
  setZoomed: (zoomed: boolean) => void;
  open: (app: AppId, options?: OpenOptions) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  toggleMaximize: (id: string) => void;
  minimize: (id: string) => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  unlock: (achievement: string, text: string) => void;
  setShiba: (shiba: Partial<OsState["shiba"]>) => void;
}

const KEYS = { theme: "riviera-os-theme", mode: "riviera-os-mode", achievements: "riviera-os-achievements" };

export function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private window: the choice lasts for this visit */
  }
}

// The screen the windows live on: 900 x 675 (4:3) inside the CRT, the viewport in Lite.
export const SCREEN = { width: 900, height: 675, top: 30, bottom: 34 };

const DEFAULT_SIZE: [number, number] = [620, 440];
let counter = 0;

function placement(count: number, size: [number, number]) {
  const offset = (count % 6) * 28;
  const x = Math.max(8, Math.round((SCREEN.width - size[0]) / 2) - 80 + offset);
  const y = Math.max(SCREEN.top + 8, Math.round((SCREEN.height - size[1]) / 2) - 50 + offset);
  return { x, y };
}

function initialTheme(): Theme {
  const saved = read(KEYS.theme);
  if (saved === "day" || saved === "night") return saved;
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "day" : "night";
}

export const useOs = create<OsState>((set, get) => ({
  windows: [],
  focused: null,
  topZ: 10,
  theme: initialTheme(),
  mode: "3d",
  achievements: JSON.parse(read(KEYS.achievements) || "[]") as string[],
  toast: null,
  shiba: { mood: "asleep", pets: 0 },
  zoomed: false,
  setZoomed: (zoomed) => get().zoomed !== zoomed && set({ zoomed }),

  // Opening an app that is already open with the same props focuses it instead.
  open(app, options = {}) {
    const props = options.props ?? {};
    const same = get().windows.find((w) => w.app === app && JSON.stringify(w.props) === JSON.stringify(props));
    if (same) {
      get().focus(same.id);
      if (same.minimized) set({ windows: get().windows.map((w) => (w.id === same.id ? { ...w, minimized: false } : w)) });
      return same.id;
    }
    const size = options.size ?? DEFAULT_SIZE;
    const id = `w${(counter += 1)}`;
    const z = get().topZ + 1;
    const at = options.at ? { x: options.at[0], y: options.at[1] } : placement(get().windows.length, size);
    const win: WindowState = { id, app, title: options.title ?? app, props, ...at, w: size[0], h: size[1], z, maximized: false, minimized: false };
    set({ windows: [...get().windows, win], focused: id, topZ: z });
    return id;
  },
  close: (id) => {
    const rest = get().windows.filter((w) => w.id !== id);
    const next = [...rest].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
    set({ windows: rest, focused: next?.id ?? null });
  },
  focus: (id) => {
    const z = get().topZ + 1;
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, z } : w)), focused: id, topZ: z });
  },
  move: (id, x, y) => set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) }),
  resize: (id, w, h) => set({ windows: get().windows.map((win) => (win.id === id ? { ...win, w, h } : win)) }),
  toggleMaximize: (id) => set({ windows: get().windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)) }),
  minimize: (id) => {
    const windows = get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w));
    const next = windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
    set({ windows, focused: next?.id ?? null });
  },
  setTheme: (theme) => {
    write(KEYS.theme, theme);
    set({ theme });
  },
  setMode: (mode) => {
    write(KEYS.mode, mode);
    set({ mode });
  },
  unlock: (achievement, text) => {
    if (get().achievements.includes(achievement)) return;
    const achievements = [...get().achievements, achievement];
    write(KEYS.achievements, JSON.stringify(achievements));
    set({ achievements, toast: { id: Date.now(), text } });
  },
  setShiba: (shiba) => set({ shiba: { ...get().shiba, ...shiba } }),
}));

export const storedMode = () => read(KEYS.mode);
