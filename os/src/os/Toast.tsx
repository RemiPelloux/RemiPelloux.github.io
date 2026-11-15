// A short note when an achievement unlocks. Clicking it opens the achievements.
import { useEffect, useState } from "react";
import { useOs } from "../state/store";
import { APPS } from "../apps/registry";

const SHOW_MS = 3600;

export function Toast() {
  const toast = useOs((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const timer = setTimeout(() => setShown(null), SHOW_MS);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!shown) return null;
  return (
    <button type="button" className="toast" role="status" onClick={() => useOs.getState().open("achievements", { title: APPS.achievements.title, size: APPS.achievements.size })}>
      <span aria-hidden="true">🏆</span> {shown.text}
    </button>
  );
}
