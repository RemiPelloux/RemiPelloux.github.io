// The scene's own little state, kept out of the OS store: where the camera glances, which prop the
// pointer is on (for the tooltip) and a counter per prop that its animation watches. The counters let
// a click in 3D and a press on the accessible button list play exactly the same animation.
import { useEffect, useRef } from "react";
import { create } from "zustand";

export type PropId = "map" | "shiba" | "pi" | "motorcycle" | "coffee" | "keyboard" | "door" | "stickers";

export interface Glance {
  look: [number, number, number]; // the point the camera turns toward
  amount: number; // 0..1, how far the camera travels from its seat toward the point
  until: number; // performance.now() when the camera starts drifting back
}

interface SceneState {
  glance: Glance | null;
  hover: { id: PropId; label: string; x: number; y: number } | null;
  pulses: Record<PropId, number>;
  lookAt: (look: Glance["look"], amount: number, ms: number) => void;
  setHover: (hover: SceneState["hover"]) => void;
  pulse: (id: PropId) => void;
}

const zero: Record<PropId, number> = { map: 0, shiba: 0, pi: 0, motorcycle: 0, coffee: 0, keyboard: 0, door: 0, stickers: 0 };

export const useScene = create<SceneState>((set, get) => ({
  glance: null,
  hover: null,
  pulses: zero,
  lookAt: (look, amount, ms) => set({ glance: { look, amount, until: performance.now() + ms } }),
  setHover: (hover) => {
    const now = get().hover;
    if (now?.id === hover?.id && now?.x === hover?.x && now?.y === hover?.y) return;
    set({ hover });
  },
  pulse: (id) => set({ pulses: { ...get().pulses, [id]: get().pulses[id] + 1 } }),
}));

// Reduced motion: the camera holds still and idle loops stop; one-shot feedback stays, but short.
export const calm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs `react` each time the prop's counter goes up (a click or its accessible button), never on mount.
export function usePulse(id: PropId, react: () => void) {
  const handler = useRef(react);
  handler.current = react;
  useEffect(() => useScene.subscribe((state, previous) => state.pulses[id] > previous.pulses[id] && handler.current()), [id]);
}
