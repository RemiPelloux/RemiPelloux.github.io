// Every application: its title, icon, default window size and component. Components load lazily, so
// the first screen only downloads the shell. `hidden` apps are left off the desktop and the dock.
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { WindowState } from "@/state/store";
import type { AppId } from "./ids";

export interface AppProps {
  win: WindowState;
}

export interface AppEntry {
  title: string;
  size: [number, number];
  hidden?: boolean;
  component: LazyExoticComponent<ComponentType<AppProps>>;
}

export const APPS: Record<AppId, AppEntry> = {
  projects: { title: "Projects", size: [680, 470], component: lazy(() => import("./Projects")) },
  terminal: { title: "Terminal", size: [600, 380], component: lazy(() => import("./Terminal")) },
  about: { title: "About Rémi", size: [560, 450], component: lazy(() => import("./About")) },
  skills: { title: "Tech explorer", size: [620, 450], component: lazy(() => import("./Skills")) },
  map: { title: "Antibes", size: [660, 480], component: lazy(() => import("./MapApp")) },
  contact: { title: "Contact", size: [460, 380], component: lazy(() => import("./Contact")) },
  settings: { title: "Settings", size: [480, 420], component: lazy(() => import("./Settings")) },
  lab: { title: "Lab bench", size: [620, 460], component: lazy(() => import("./Lab")) },
  project: { title: "Project", size: [600, 470], hidden: true, component: lazy(() => import("./Project")) },
  achievements: { title: "Achievements", size: [460, 440], hidden: true, component: lazy(() => import("./Achievements")) },
  coffee: { title: "coffee.exe", size: [420, 360], hidden: true, component: lazy(() => import("./Coffee")) },
  shiba: { title: "Shiba", size: [420, 380], hidden: true, component: lazy(() => import("./ShibaApp")) },
};

// The order on the desktop and in the dock.
export const DESKTOP: AppId[] = ["projects", "terminal", "about", "skills", "map", "contact", "lab", "settings"];
