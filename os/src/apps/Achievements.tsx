// Achievements: what you found, and hints for what you did not. Locked cards show the hint only,
// never the trigger, so the hunt stays a hunt.
import type { AppProps } from "./registry";
import { ACHIEVEMENTS } from "../data/achievements";
import { useOs } from "../state/store";
import "./apps.css";

export default function Achievements(_: AppProps) {
  const unlocked = useOs((s) => s.achievements);
  const done = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).length;
  const total = ACHIEVEMENTS.length;
  return (
    <div className="app-pad">
      <h3 className="app-h">Achievements</h3>
      <div className="progress">
        <span className="bar inset" role="progressbar" aria-label="Achievements unlocked" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <i style={{ width: `${(done / total) * 100}%` }} />
        </span>
        <span>{done} / {total}</span>
      </div>
      <ul className="trophies">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.includes(a.id);
          return (
            <li key={a.id} className={`trophy${got ? "" : " locked"}`}>
              <span className="medal" aria-hidden="true">{got ? "★" : "?"}</span>
              <div>
                <b>{a.title}<span className="sr-only">{got ? ", unlocked" : ", locked"}</span></b>
                <span>{got ? a.description : `Hint: ${a.hint}`}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
