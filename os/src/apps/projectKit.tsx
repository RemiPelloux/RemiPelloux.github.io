// Small pieces shared by the Projects explorer, the project window and the lab bench. Kept apart so the
// explorer does not pull the project window's lazy chunk in with it.
import { useEffect, useState } from "react";
import { loadRepos, statusOf, STATUS_LABEL, type Repo, type Status } from "@/data/repos";
import { useOs } from "@/state/store";
import { APPS } from "./registry";

export function openProject(name: string) {
  useOs.getState().open("project", { title: name, props: { name }, size: APPS.project.size });
}

// Dates in the catalogue are plain "YYYY-MM-DD" days: read them in UTC so no timezone shifts the day.
const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso: string | null) => (iso ? DAY.format(new Date(iso)) : "—");

// null while the catalogue loads; loadRepos() caches, so every window shares one fetch.
export function useRepos(): Repo[] | null {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  useEffect(() => {
    let live = true;
    void loadRepos().then((list) => live && setRepos(list));
    return () => {
      live = false;
    };
  }, []);
  return repos;
}

export function StatusLed({ status }: { status: Status }) {
  return (
    <span className={`led led-${status}`} title={STATUS_LABEL[status]}>
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </span>
  );
}

export { statusOf };
