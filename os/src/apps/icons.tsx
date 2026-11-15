// Pixel-style icons for the desktop, the dock and the title bars. Drawn on a 24-unit grid.
import type { ReactNode } from "react";
import type { AppId } from "./ids";

const svg = (body: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" shapeRendering="crispEdges">{body}</svg>
);

export const ICONS: Record<AppId | "github" | "folder" | "lock", ReactNode> = {
  terminal: svg(<><rect x="2" y="4" width="20" height="16" fill="#0b1630" stroke="currentColor" strokeWidth="1.5" /><path d="M6 9l3 3-3 3" fill="none" stroke="#7cf0b0" strokeWidth="2" /><path d="M11 15h6" stroke="#7cf0b0" strokeWidth="2" /></>),
  projects: svg(<><path d="M2 6h8l2 2h10v12H2z" fill="#3d6fd6" stroke="currentColor" strokeWidth="1.5" /><path d="M9 12l-2 2 2 2M15 12l2 2-2 2M12.5 11l-1.5 6" fill="none" stroke="#fff" strokeWidth="1.4" /></>),
  project: svg(<><rect x="4" y="2" width="16" height="20" fill="#e9e3d2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#3d6fd6" strokeWidth="1.5" /></>),
  about: svg(<><circle cx="12" cy="12" r="9.5" fill="#3d6fd6" stroke="currentColor" strokeWidth="1.5" /><path d="M12 10.5v6.5" stroke="#fff" strokeWidth="2.2" /><circle cx="12" cy="7.3" r="1.4" fill="#fff" /></>),
  skills: svg(<><path d="M12 2l9 5v10l-9 5-9-5V7z" fill="#7a4fd6" stroke="currentColor" strokeWidth="1.5" /><path d="M3 7l9 5 9-5M12 12v10" fill="none" stroke="#d9c8ff" strokeWidth="1.3" /></>),
  contact: svg(<><rect x="2" y="5" width="20" height="14" fill="#e9e3d2" stroke="currentColor" strokeWidth="1.5" /><path d="M2.8 6l9.2 7 9.2-7" fill="none" stroke="#3d6fd6" strokeWidth="1.6" /></>),
  map: svg(<><path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" fill="#e05a7a" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="10" r="2.6" fill="#fff" /></>),
  settings: svg(<><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4M4.6 4.6l2.8 2.8M16.6 16.6l2.8 2.8M4.6 19.4l2.8-2.8M16.6 7.4l2.8-2.8" stroke="currentColor" strokeWidth="2" /></>),
  lab: svg(<><rect x="3" y="5" width="18" height="14" rx="1" fill="#2f8f4e" stroke="currentColor" strokeWidth="1.5" /><rect x="7" y="9" width="6" height="6" fill="#1b1b1b" /><path d="M16 8h3M16 11h3M16 14h3M5 19v2M9 19v2M13 19v2M17 19v2" stroke="#e8d27a" strokeWidth="1.3" /></>),
  achievements: svg(<><path d="M7 3h10v5a5 5 0 01-10 0z" fill="#f2c14e" stroke="currentColor" strokeWidth="1.5" /><path d="M12 13v4M8 21h8M9 17h6v4H9z" stroke="currentColor" strokeWidth="1.5" fill="#f2c14e" /></>),
  coffee: svg(<><path d="M4 9h12v7a4 4 0 01-4 4H8a4 4 0 01-4-4z" fill="#f4efe4" stroke="currentColor" strokeWidth="1.5" /><path d="M16 11h2a2 2 0 010 4h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></>),
  shiba: svg(<><path d="M4 4l4 4h8l4-4v10a8 8 0 01-16 0z" fill="#d9822b" stroke="currentColor" strokeWidth="1.5" /><path d="M7 15c1.5 3 8.5 3 10 0" fill="#f6e7c8" /><circle cx="9" cy="12" r="1" fill="#1a1a18" /><circle cx="15" cy="12" r="1" fill="#1a1a18" /></>),
  github: svg(<path fill="currentColor" d="M12 1.5a10.5 10.5 0 00-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 015.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.5 10.5 0 0012 1.5z" />),
  folder: svg(<path d="M2 5h8l2 2h10v13H2z" fill="#f2c14e" stroke="currentColor" strokeWidth="1.5" />),
  lock: svg(<><rect x="5" y="10" width="14" height="11" fill="#7a4fd6" stroke="currentColor" strokeWidth="1.5" /><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" /></>),
};
