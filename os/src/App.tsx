// Picks the 3D workstation or the Lite desktop. Lite is automatic without WebGL 2, on small or touch
// screens and when data saving is on; the visitor can switch at any time, and the choice is kept.
import { lazy, Suspense, useEffect } from "react";
import { storedMode, useOs, type Mode } from "./state/store";
import { Desktop } from "./os/Desktop";

const Workstation = lazy(() => import("./scene/Workstation"));

function webgl2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export function initialMode(): Mode {
  if (!webgl2()) return "lite";
  const saved = storedMode();
  if (saved === "3d" || saved === "lite") return saved;
  const small = window.innerWidth < 900 || window.innerHeight < 560 || window.matchMedia("(pointer: coarse)").matches;
  const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return small || saving ? "lite" : "3d";
}

export function App() {
  const mode = useOs((s) => s.mode);
  const theme = useOs((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  }, [theme, mode]);

  if (mode === "lite") return <div className="lite"><Desktop /></div>;
  return (
    <Suspense fallback={<div className="lite"><Desktop /></div>}>
      <Workstation>
        <Desktop />
      </Workstation>
    </Suspense>
  );
}
