// The computer: a beige "RIVIERA CRT-17" tilted back on its swivel, the tower with its stickers, the
// keyboard and the mouse. The CRT's glass is a dark plane; the real OS is HTML laid over it (see pin.ts).
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Hoverable } from "./Hoverable";
import { calm, usePulse } from "./focus";
import { DESK_Y, GLASS, HEAD_PIVOT, SPOT, TILT } from "./layout";
import { stickerSheet } from "./stickers";
import { label, FONT, MONO } from "./textures";

export { DESK_Y, GLASS };

const BEIGE = "#d8cfb8";
const BEIGE_DARK = "#bdb39a";

const badge = () =>
  label({ key: "crt-badge", w: 256, h: 40 }, (ctx, w, h) => {
    ctx.fillStyle = "#6d6656";
    ctx.font = `800 22px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText("RIVIERA", 6, h / 2 + 1);
    ctx.font = `500 20px ${FONT}`;
    ctx.fillText("CRT-17", 112, h / 2 + 1);
    ctx.fillStyle = "#4fa3ff";
    ctx.fillRect(w - 40, 12, 30, 16);
  });

const note = () =>
  label({ key: "sticky", w: 256, h: 256 }, (ctx, w) => {
    ctx.fillStyle = "#ffe36e";
    ctx.fillRect(0, 0, w, w);
    ctx.fillStyle = "rgb(0 0 0 / 0.06)";
    ctx.fillRect(0, 0, w, 38);
    ctx.fillStyle = "#2b2a4a";
    ctx.font = `700 40px "Comic Sans MS", "Marker Felt", ${MONO}`;
    ["☑ Build", "☑ Endure", "☑ Become"].forEach((line, i) => ctx.fillText(line, 22, 94 + i * 62));
  });

function CrtBase() {
  return (
    <>
      <RoundedBox args={[0.3, 0.035, 0.24]} radius={0.012} position={[0, DESK_Y + 0.018, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, DESK_Y + 0.055, -0.02]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.04, 24]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
      </mesh>
    </>
  );
}

// The badge, the power light, the three knobs and the sticky note on the bezel.
function CrtFace() {
  return (
    <>
      <mesh position={[-0.15, 0.058, 0.2412]}>
        <planeGeometry args={[0.13, 0.0203]} />
        <meshBasicMaterial map={badge()} transparent toneMapped={false} color="#d8d2c2" />
      </mesh>
      <mesh position={[0.2, 0.058, 0.243]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.008, 16]} />
        <meshStandardMaterial color="#9ed36a" emissive="#7cf06a" emissiveIntensity={1.2} />
      </mesh>
      {[0.08, 0.105, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.058, 0.241]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.006, 12]} />
          <meshStandardMaterial color={BEIGE_DARK} />
        </mesh>
      ))}
      <mesh position={[0.232, 0.462, 0.2425]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[0.068, 0.068]} />
        <meshStandardMaterial map={note()} roughness={0.9} />
      </mesh>
    </>
  );
}

// The swivel base stays flat on the desk; the head (tube, bezel, glass) tilts back around the pivot.
function Crt() {
  return (
    <group>
      <CrtBase />
      <group position={[HEAD_PIVOT.x, HEAD_PIVOT.y, HEAD_PIVOT.z]} rotation={[-TILT, 0, 0]}>
        <RoundedBox args={[0.46, 0.4, 0.34]} radius={0.04} position={[0, 0.26, -0.08]} castShadow receiveShadow>
          <meshStandardMaterial color={BEIGE} roughness={0.62} />
        </RoundedBox>
        <RoundedBox args={[0.54, 0.47, 0.1]} radius={0.03} position={[0, 0.265, 0.19]} castShadow receiveShadow>
          <meshStandardMaterial color={BEIGE} roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, 0.265, 0.2415]}>
          <planeGeometry args={[0.44, 0.34]} />
          <meshStandardMaterial color="#2a2722" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.265, 0.2505]}>
          <planeGeometry args={[GLASS.width, GLASS.height]} />
          <meshBasicMaterial color="#0a0f24" />
        </mesh>
        <CrtFace />
      </group>
    </group>
  );
}

// The CD drive (tray, slot), the floppy slot and the power light.
function Drives() {
  return (
    <>
      <mesh position={[0, 0.385, 0.201]}>
        <boxGeometry args={[0.16, 0.036, 0.004]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[-0.01, 0.382, 0.2035]}>
        <boxGeometry args={[0.12, 0.003, 0.002]} />
        <meshStandardMaterial color="#5a5244" />
      </mesh>
      <mesh position={[0.01, 0.335, 0.2015]}>
        <boxGeometry args={[0.1, 0.008, 0.004]} />
        <meshStandardMaterial color="#2e2a24" />
      </mesh>
      <mesh position={[0.06, 0.31, 0.202]}>
        <sphereGeometry args={[0.005, 10, 8]} />
        <meshStandardMaterial color="#7cf06a" emissive="#7cf06a" emissiveIntensity={1.5} />
      </mesh>
    </>
  );
}

function Tower() {
  const [x, y, z] = SPOT.tower;
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[0.19, 0.44, 0.4]} radius={0.014} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BEIGE} roughness={0.6} />
      </RoundedBox>
      <Drives />
      <Hoverable id="stickers" position={[0, 0.16, 0.2015]}>
        <mesh>
          <planeGeometry args={[0.17, 0.2125]} />
          <meshStandardMaterial map={stickerSheet()} transparent roughness={0.5} alphaTest={0.02} />
        </mesh>
      </Hoverable>
    </group>
  );
}

// 15 x 5 keys as one instanced mesh, two of them in the accent colours.
const COLS = 15;
const ROWS = 5;
const KEYS = COLS * ROWS;
const PITCH = 0.028;
const TRAVEL = 0.006;

function keyAt(i: number, depth: number, m: THREE.Matrix4) {
  return m.makeTranslation(-0.196 + (i % COLS) * PITCH, 0.02 - depth * TRAVEL, -0.056 + Math.floor(i / COLS) * PITCH);
}

function keyColour(i: number) {
  if (i === 0) return new THREE.Color("#4f7bff");
  return new THREE.Color(i === COLS - 1 ? "#9b6bff" : "#e6dfcc");
}

function useKeys() {
  return useMemo(() => {
    const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.024, 0.012, 0.024), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }), KEYS);
    const m = new THREE.Matrix4();
    for (let i = 0; i < KEYS; i += 1) {
      keys.setMatrixAt(i, keyAt(i, 0, m));
      keys.setColorAt(i, keyColour(i));
    }
    keys.castShadow = true;
    return keys;
  }, []);
}

// A pulse presses a random key (never the top row's accents); it springs back over a few frames.
function useKeyPresses(keys: THREE.InstancedMesh) {
  const press = useRef(new Float32Array(KEYS));
  const m = useMemo(() => new THREE.Matrix4(), []);
  usePulse("keyboard", () => {
    press.current[COLS + Math.floor(Math.random() * COLS * (ROWS - 1))] = 1;
  });
  useFrame((_, delta) => {
    let moved = false;
    press.current.forEach((depth, i) => {
      if (depth <= 0) return;
      press.current[i] = Math.max(0, depth - delta * (calm ? 12 : 6));
      keys.setMatrixAt(i, keyAt(i, press.current[i] > 0.5 ? 1 : press.current[i] * 2, m));
      moved = true;
    });
    if (moved) keys.instanceMatrix.needsUpdate = true;
  });
}

function Keyboard() {
  const keys = useKeys();
  useKeyPresses(keys);
  return (
    <Hoverable id="keyboard" position={[0, DESK_Y, 0.42]} rotation={[0.06, 0, 0]}>
      <RoundedBox args={[0.46, 0.022, 0.17]} radius={0.008} position={[0, 0.011, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BEIGE} roughness={0.6} />
      </RoundedBox>
      <primitive object={keys} />
    </Hoverable>
  );
}

function Mouse() {
  return (
    <mesh position={[0.34, DESK_Y + 0.015, 0.47]} scale={[0.035, 0.018, 0.055]} castShadow>
      <sphereGeometry args={[1, 20, 12]} />
      <meshStandardMaterial color="#e6dfcc" roughness={0.45} />
    </mesh>
  );
}

export function Computer() {
  return (
    <group>
      <Crt />
      <Tower />
      <Keyboard />
      <Mouse />
    </group>
  );
}
