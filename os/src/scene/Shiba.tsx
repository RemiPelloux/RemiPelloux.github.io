// The Shiba in a dark hoodie, sitting by the tower. Built from blocks like the portfolio's own Shiba.
// Its mood comes from the store: asleep (breathing, eyes shut, Zzz), awake (head tilt, blinks),
// happy (tail wag, little hops) and zoomies (spins on the spot). A click pets it (see actions.ts).
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useOs } from "@/state/store";
import { Hoverable } from "./Hoverable";
import { calm } from "./focus";
import { DESK_Y, SPOT } from "./layout";
import { label, MONO } from "./textures";

const C = { fur: "#d9822b", cream: "#f6e7c8", dark: "#1a1a18", hood: "#23263a", hoodDark: "#1a1c2b", accent: "#8f7bff" };
type Block = [number, number, number, number, number, number, keyof typeof C];

// [x, y, z, width, height, depth, colour] in centimetres, the dog facing +z.
const BODY: Block[] = [
  [0, 6, 0, 11, 11, 9, "hood"], [0, 1.5, 3.5, 10, 3, 4, "hoodDark"], [-3, 1, 5.2, 3, 2, 3, "cream"], [3, 1, 5.2, 3, 2, 3, "cream"],
  [-6, 7, 1, 2.5, 7, 3, "hood"], [6, 7, 1, 2.5, 7, 3, "hood"], [0, 11.5, -1.5, 9, 3, 6, "hood"],
];
const HEAD: Block[] = [
  [0, 0, 0, 9, 7.5, 8, "fur"], [0, -1.6, 4.3, 5, 3.4, 2.4, "cream"], [0, -0.6, 5.6, 1.6, 1.2, 0.8, "dark"],
  [-3, 5, -0.5, 2.6, 3, 2, "fur"], [3, 5, -0.5, 2.6, 3, 2, "fur"], [-3, 4.8, 0.5, 1.2, 1.8, 0.4, "cream"], [3, 4.8, 0.5, 1.2, 1.8, 0.4, "cream"],
  [-3.4, -1.4, 3.9, 1.6, 1.4, 0.4, "cream"], [3.4, -1.4, 3.9, 1.6, 1.4, 0.4, "cream"],
];
const TAIL: Block[] = [[0, 0, 0, 3, 3, 5, "fur"], [0, 2.2, 1.4, 2.6, 2.6, 2.6, "cream"]];

function Blocks({ blocks }: { blocks: Block[] }) {
  const materials = useMemo(() => Object.fromEntries(Object.entries(C).map(([k, v]) => [k, new THREE.MeshStandardMaterial({ color: v, roughness: 0.75 })])), []);
  return (
    <>
      {blocks.map(([x, y, z, w, h, d, c], i) => (
        <mesh key={i} position={[x / 100, y / 100, z / 100]} material={materials[c]} castShadow>
          <boxGeometry args={[w / 100, h / 100, d / 100]} />
        </mesh>
      ))}
    </>
  );
}

const zzz = () =>
  label({ key: "zzz", w: 128, h: 128 }, (ctx) => {
    ctx.fillStyle = "#e9e6ff";
    ctx.font = `700 64px ${MONO}`;
    ctx.fillText("z", 40, 90);
  });

interface Parts {
  root: THREE.Group;
  head: THREE.Group;
  tail: THREE.Group;
  eyes: THREE.Group;
  zs: THREE.Group;
}

// One frame of the Shiba's life, from its mood and the clock.
function animate(p: Parts, mood: string, t: number) {
  const asleep = mood === "asleep";
  p.root.scale.y = 1 + (asleep ? Math.sin(t * 1.6) * 0.025 : 0);
  p.root.position.y = mood === "happy" ? Math.abs(Math.sin(t * 7)) * 0.012 : 0;
  p.root.rotation.y = mood === "zoomies" ? t * 9 : THREE.MathUtils.damp(p.root.rotation.y % (Math.PI * 2), 0, 6, 1 / 60);
  p.head.rotation.z = mood === "awake" ? Math.sin(t * 0.8) * 0.18 : 0;
  p.head.rotation.x = asleep ? 0.35 : 0;
  p.tail.rotation.y = Math.sin(t * (mood === "happy" || mood === "zoomies" ? 18 : 2)) * (asleep ? 0.05 : 0.5);
  const blink = !asleep && Math.sin(t * 1.3) > 0.985;
  p.eyes.scale.y = asleep || blink ? 0.15 : 1;
  p.zs.visible = asleep;
  p.zs.children.forEach((z, i) => {
    const k = (t * 0.35 + i / 3) % 1;
    z.position.set(0.04 + k * 0.05, 0.2 + k * 0.1, 0);
    ((z as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - k;
  });
}

// The refs to the moving parts, and the frame loop that animates them from the current mood.
function useShibaParts() {
  const mood = useOs((s) => s.shiba.mood);
  const refs = { root: useRef<THREE.Group>(null), head: useRef<THREE.Group>(null), tail: useRef<THREE.Group>(null), eyes: useRef<THREE.Group>(null), zs: useRef<THREE.Group>(null) };
  useFrame(({ clock }) => {
    const parts = Object.fromEntries(Object.entries(refs).map(([k, r]) => [k, r.current])) as unknown as Parts;
    if (Object.values(parts).some((part) => !part)) return;
    animate(parts, mood, calm ? 0 : clock.elapsedTime);
  });
  return refs;
}

const hoodLogo = () =>
  label({ key: "hood-logo", w: 128, h: 80 }, (ctx) => {
    ctx.fillStyle = C.accent;
    ctx.font = `700 48px ${MONO}`;
    ctx.fillText("</>", 14, 58);
  });

function Head({ eyes }: { eyes: RefObject<THREE.Group | null> }) {
  return (
    <>
      <Blocks blocks={HEAD} />
      <group ref={eyes} position={[0, 0.014, 0.0415]}>
        {[-0.022, 0.022].map((ex) => (
          <mesh key={ex} position={[ex, 0, 0]}>
            <boxGeometry args={[0.016, 0.016, 0.004]} />
            <meshBasicMaterial color={C.dark} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Zzz({ group }: { group: RefObject<THREE.Group | null> }) {
  const material = useMemo(() => new THREE.MeshBasicMaterial({ map: zzz(), transparent: true, depthWrite: false }), []);
  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={material}>
          <planeGeometry args={[0.03, 0.03]} />
        </mesh>
      ))}
    </group>
  );
}

export function Shiba() {
  const [x, , z] = SPOT.shiba;
  const refs = useShibaParts();
  return (
    <Hoverable id="shiba" position={[x, DESK_Y, z]} rotation={[0, -0.55, 0]}>
      <group ref={refs.root} scale={1.25}>
        <Blocks blocks={BODY} />
        <mesh position={[0, 0.07, 0.0455]}>
          <planeGeometry args={[0.04, 0.025]} />
          <meshBasicMaterial map={hoodLogo()} transparent toneMapped={false} />
        </mesh>
        <group ref={refs.head} position={[0, 0.155, 0.01]}>
          <Head eyes={refs.eyes} />
        </group>
        <group ref={refs.tail} position={[0, 0.06, -0.06]} rotation={[-0.9, 0, 0]}>
          <Blocks blocks={TAIL} />
        </group>
        <Zzz group={refs.zs} />
      </group>
    </Hoverable>
  );
}
