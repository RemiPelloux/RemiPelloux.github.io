// Compact: Lite mode on a narrow screen. Windows then open full screen, one at a time in view.
import { useSyncExternalStore } from "react";
import { useOs } from "../state/store";

const query = typeof window !== "undefined" ? window.matchMedia("(max-width: 760px)") : null;

export function useNarrow() {
  return useSyncExternalStore(
    (notify) => {
      query?.addEventListener("change", notify);
      return () => query?.removeEventListener("change", notify);
    },
    () => Boolean(query?.matches),
  );
}

export function useCompact() {
  const narrow = useNarrow();
  return useOs((s) => s.mode === "lite") && narrow;
}
