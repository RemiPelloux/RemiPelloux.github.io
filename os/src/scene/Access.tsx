// The HTML around the canvas: the tooltip that names the prop under the pointer, and the same props as
// a list of real buttons for keyboards and screen readers. The list is hidden until it gets focus.
import { act, PROPS } from "./actions";
import { useScene, type PropId } from "./focus";

const ORDER: PropId[] = ["map", "shiba", "pi", "motorcycle", "coffee", "keyboard", "door", "stickers"];

export function Tooltip() {
  const hover = useScene((s) => s.hover);
  if (!hover) return null;
  return (
    <div className="scene-tip" role="presentation" style={{ transform: `translate(${hover.x + 14}px, ${hover.y + 16}px)` }}>
      {hover.label}
    </div>
  );
}

export function Access() {
  return (
    <nav className="scene-access" aria-label="Things on the desk">
      <p>On the desk</p>
      <ul>
        {ORDER.map((id) => (
          <li key={id}>
            <button type="button" onClick={() => act(id)}>
              {PROPS[id].label}
              <span className="scene-access-hint">{PROPS[id].hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
