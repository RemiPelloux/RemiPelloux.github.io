// Makes a prop clickable: a pointer cursor and a faint warm glow on hover, a tooltip, and a click that
// runs the same action as the prop's button in the accessible list.
import type { ThreeEvent } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { act, PROPS } from "./actions";
import { useScene, type PropId } from "./focus";

const GLOW = new THREE.Color("#ffb46b");
type Lit = THREE.MeshStandardMaterial & { userData: { base?: THREE.Color; baseIntensity?: number } };

// Lifts every standard material under the group toward a warm emissive; remembers the original to undo.
function glow(group: THREE.Object3D, on: boolean) {
  group.traverse((child) => {
    const material = (child as THREE.Mesh).material as Lit | undefined;
    if (!material || !("emissive" in material)) return;
    if (on && !material.userData.base) {
      material.userData.base = material.emissive.clone();
      material.userData.baseIntensity = material.emissiveIntensity;
      material.emissive.lerp(GLOW, 0.35);
      material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.35);
    } else if (!on && material.userData.base) {
      material.emissive.copy(material.userData.base);
      material.emissiveIntensity = material.userData.baseIntensity ?? 1;
      delete material.userData.base;
    }
  });
}

interface Props {
  id: PropId;
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Hoverable({ id, children, position, rotation }: Props) {
  const group = useRef<THREE.Group>(null);
  const setHover = useScene((s) => s.setHover);
  const track = (event: ThreeEvent<PointerEvent>) => setHover({ id, label: PROPS[id].label, x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });

  const over = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
    if (group.current) glow(group.current, true);
    track(event);
  };
  const out = () => {
    document.body.style.cursor = "";
    if (group.current) glow(group.current, false);
    setHover(null);
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    act(id);
  };

  return (
    <group ref={group} position={position} rotation={rotation} onPointerOver={over} onPointerOut={out} onPointerMove={track} onClick={click}>
      {children}
    </group>
  );
}
