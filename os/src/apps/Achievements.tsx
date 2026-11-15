// Achievements: what you found, and hints for what you did not. Locked cards show the hint only,
// never the trigger, so the hunt stays a hunt.
import type { AppProps } from "./registry";
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";
import { useOs } from "@/state/store";
import "./apps.css";

function Trophy({ achievement, got }: { achievement: Achievement; got: boolean }) {
  return (
    <li className={`trophy${got ? "" : " locked"}`}>
      <span className="medal" aria-hidden="true">{got ? "★" : "?"}</span>
      <div>
        <b>{achievement.title}<span className="sr-only">{got ? ", unlocked" : ", locked"}</span></b>
        <span>{got ? achievement.description : `Hint: ${achievement.hint}`}</span>
      </div>
    </li>
  );
}

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
        {ACHIEVEMENTS.map((a) => <Trophy key={a.id} achievement={a} got={unlocked.includes(a.id)} />)}
      </ul>
    </div>
  );
}
