// A window: title bar to drag, buttons to minimise, maximise and close, a corner to resize.
// Focus moves into the window when it opens and back to the desktop when it closes.
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { SCREEN, useOs, type WindowState } from "@/state/store";
import { useCompact } from "./compact";

const MIN = { w: 300, h: 200 };

interface Props {
  win: WindowState;
  icon: ReactNode;
  children: ReactNode;
}

// Pointer drags in screen pixels, converted to OS pixels by the screen's current scale.
function drag(event: ReactPointerEvent, onMove: (dx: number, dy: number) => void) {
  const target = event.currentTarget as HTMLElement;
  const scale = target.getBoundingClientRect().width / target.offsetWidth || 1;
  const start = { x: event.clientX, y: event.clientY };
  target.setPointerCapture(event.pointerId);
  const move = (e: PointerEvent) => onMove((e.clientX - start.x) / scale, (e.clientY - start.y) / scale);
  const up = () => {
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", up);
  };
  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", up);
}

// Apps load lazily: wait a few frames for the content, then focus its first control.
const FOCUS_FRAMES = 60;

function useFocusOnOpen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let frames = 0;
    let handle = 0;
    const tryFocus = () => {
      const body = ref.current?.querySelector(".window-body");
      const first = body?.querySelector<HTMLElement>("[data-autofocus]") ?? body?.querySelector<HTMLElement>("input, button, a, [tabindex='0']");
      if (first) first.focus({ preventScroll: true });
      else if ((frames += 1) < FOCUS_FRAMES) handle = requestAnimationFrame(tryFocus);
      else ref.current?.focus({ preventScroll: true });
    };
    handle = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(handle);
  }, [ref]);
}

const clamp = (value: number, low: number, high: number) => Math.round(Math.min(high, Math.max(low, value)));

// Dragging the title bar moves the window, keeping its title bar on the screen; the grip resizes it.
function useWindowPointer(win: WindowState, locked: boolean) {
  const { focus, move, resize } = useOs.getState();
  const startMove = (event: ReactPointerEvent) => {
    if (locked || (event.target as HTMLElement).closest("button")) return;
    focus(win.id);
    const origin = { x: win.x, y: win.y };
    drag(event, (dx, dy) => move(win.id, clamp(origin.x + dx, -win.w + 120, SCREEN.width - 80), clamp(origin.y + dy, SCREEN.top, SCREEN.height - SCREEN.bottom - 30)));
  };
  const startResize = (event: ReactPointerEvent) => {
    event.stopPropagation();
    const origin = { w: win.w, h: win.h };
    drag(event, (dx, dy) => resize(win.id, Math.round(Math.max(MIN.w, origin.w + dx)), Math.round(Math.max(MIN.h, origin.h + dy))));
  };
  return { startMove, startResize };
}

interface TitleBarProps {
  win: WindowState;
  icon: ReactNode;
  compact: boolean;
  onPointerDown: (event: ReactPointerEvent) => void;
}

function TitleBar({ win, icon, compact, onPointerDown }: TitleBarProps) {
  const { close, toggleMaximize, minimize } = useOs.getState();
  return (
    <header className="titlebar" onPointerDown={onPointerDown} onDoubleClick={() => !compact && toggleMaximize(win.id)}>
      <span className="title-icon" aria-hidden="true">{icon}</span>
      <h2>{win.title}</h2>
      <div className="wbtns">
        <button type="button" className="wbtn" aria-label="Minimise" onClick={() => minimize(win.id)}>_</button>
        {!compact && <button type="button" className="wbtn" aria-label={win.maximized ? "Restore" : "Maximise"} onClick={() => toggleMaximize(win.id)}>{win.maximized ? "❐" : "□"}</button>}
        <button type="button" className="wbtn close" aria-label="Close" onClick={() => close(win.id)}>×</button>
      </div>
    </header>
  );
}

export function Window({ win, icon, children }: Props) {
  const active = useOs((s) => s.focused === win.id);
  const compact = useCompact();
  const ref = useRef<HTMLElement>(null);
  const full = win.maximized || compact;
  const pointer = useWindowPointer(win, full);
  useFocusOnOpen(ref);
  const style = full ? { zIndex: win.z } : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };
  const { focus, close } = useOs.getState();
  return (
    <section ref={ref} className={`window${active ? " active" : ""}${full ? " full" : ""}`} style={style} hidden={win.minimized} role="dialog" aria-label={win.title} tabIndex={-1} onPointerDown={() => !active && focus(win.id)} onKeyDown={(event) => event.key === "Escape" && !event.defaultPrevented && close(win.id)}>
      <TitleBar win={win} icon={icon} compact={compact} onPointerDown={pointer.startMove} />
      <div className="window-body">{children}</div>
      {!full && <span className="grip" aria-hidden="true" onPointerDown={pointer.startResize} />}
    </section>
  );
}
