// The chart's view and every way to move it: fit on first size, wheel, drag and keys.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { clampView, homeView, PAN_PX, STEP, zoomAround, type Size, type View } from "./view";

const WHEEL_RATE = 0.0015;

function useSize(ref: RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

// Fits the whole chart once the real size is known, then keeps the view valid on resize.
function useFit(size: Size, setView: (update: (v: View) => View) => void) {
  const fitted = useRef(false);
  useEffect(() => {
    if (size.w === 0) return;
    const first = !fitted.current;
    fitted.current = true;
    setView((v) => (first ? homeView(size) : clampView(v, size)));
  }, [size, setView]);
}

// React's wheel handler is passive, so the page would scroll too; a native listener can stop it.
function useWheel(stage: RefObject<HTMLDivElement | null>, zoomAt: (factor: number, x?: number, y?: number) => void) {
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * WHEEL_RATE), event.clientX - rect.left, event.clientY - rect.top);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [stage, zoomAt]);
}

function useDrag(view: View, update: (next: (v: View) => View) => void) {
  const start = useRef<{ x: number; y: number; view: View } | null>(null);
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, aside")) return; // pins and the card keep their clicks
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX, y: event.clientY, view };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (s) update(() => ({ ...s.view, cx: s.view.cx - (event.clientX - s.x) / s.view.z, cy: s.view.cy - (event.clientY - s.y) / s.view.z }));
  };
  const end = () => (start.current = null);
  return { onPointerDown: down, onPointerMove: move, onPointerUp: end, onPointerCancel: end };
}

const KEY_PAN: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export function useMapView(stage: RefObject<HTMLDivElement | null>) {
  const size = useSize(stage);
  const [view, setView] = useState<View>(() => homeView({ w: 640, h: 400 }));
  useFit(size, setView);
  const update = useCallback((next: (v: View) => View) => setView((v) => clampView(next(v), size)), [size]);
  const zoomAt = useCallback((factor: number, x = size.w / 2, y = size.h / 2) => update((v) => zoomAround(v, factor, { x, y, size })), [update, size]);
  useWheel(stage, zoomAt);
  const reset = () => setView(homeView(size));
  // Arrows pan, + and − zoom, 0 resets. Returns false for keys the chart does not use.
  const key = (event: KeyboardEvent): boolean => {
    const pan = KEY_PAN[event.key];
    if (pan) update((v) => ({ ...v, cx: v.cx + (pan[0] * PAN_PX) / v.z, cy: v.cy + (pan[1] * PAN_PX) / v.z }));
    else if (event.key === "+" || event.key === "=") zoomAt(STEP);
    else if (event.key === "-" || event.key === "_") zoomAt(1 / STEP);
    else if (event.key === "0") reset();
    return Boolean(pan) || ["+", "=", "-", "_", "0"].includes(event.key);
  };
  return { size, view, update, zoomAt, reset, key, drag: useDrag(view, update) };
}
