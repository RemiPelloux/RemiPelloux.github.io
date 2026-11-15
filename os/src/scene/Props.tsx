// The things on the desk: the lava lamp, the books, the boot floppies, the coffee, the ivy, the
// Raspberry Pi in its clear case and the motorcycle on the tower. Clickable ones sit in a Hoverable.
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Theme } from "@/state/store";
import { Hoverable } from "./Hoverable";
import { calm, usePulse } from "./focus";
import { DESK_Y, SPOT } from "./layout";
import { Motorcycle, RaspberryPi } from "./Gadgets";
import { label, spine, FONT } from "./textures";

const BOOKS: Array<[string, string, string]> = [
  ["AI AGENTS", "#2c3e75", "#f1e6c8"],
  ["SYSTEM DESIGN", "#3d2b5e", "#f1e6c8"],
  ["GAME DESIGN", "#28524a", "#f1e6c8"],
  ["TRADING", "#5e2b2b", "#f1e6c8"],
  ["CÔTE D'AZUR", "#1f3a5e", "#f1e6c8"],
];

// The violet lamp: blobs rise and fall slowly inside the glass; still when motion is reduced.
function useBlobs() {
  const blobs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (calm || !blobs.current) return;
    blobs.current.children.forEach((blob, i) => (blob.position.y = 0.1 + 0.07 * Math.sin(clock.elapsedTime * 0.35 + i * 2.1)));
  });
  return blobs;
}

function LampMetal({ y, args }: { y: number; args: [number, number, number, number] }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color="#1d1a22" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function LavaLamp({ theme }: { theme: Theme }) {
  const [x, , z] = SPOT.lava;
  const blobs = useBlobs();
  return (
    <group position={[x, DESK_Y, z]}>
      <LampMetal y={0.03} args={[0.045, 0.06, 0.06, 20]} />
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.028, 0.045, 0.16, 20]} />
        <meshStandardMaterial color="#b05cff" emissive="#8f3cff" emissiveIntensity={theme === "night" ? 1.4 : 0.5} transparent opacity={0.55} />
      </mesh>
      <group ref={blobs} position={[0, 0.04, 0]}>
        {[0.018, 0.013, 0.01].map((r, i) => (
          <mesh key={r} position={[(i - 1) * 0.008, 0.1, 0]}>
            <sphereGeometry args={[r, 12, 10]} />
            <meshBasicMaterial color="#ff9cf2" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <LampMetal y={0.235} args={[0.012, 0.028, 0.03, 16]} />
      {theme === "night" && <pointLight position={[0, 0.16, 0.05]} intensity={1.6} distance={1.1} color="#a855ff" />}
    </group>
  );
}

function Books() {
  const [x, , z] = SPOT.books;
  return (
    <group position={[x, DESK_Y, z]} rotation={[0, 0.25, 0]}>
      {BOOKS.map(([title, cloth, ink], i) => (
        <mesh key={title} position={[(i % 2) * 0.006, 0.014 + i * 0.029, 0]} rotation={[0, (i % 3) * 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.028, 0.2]} />
          <meshStandardMaterial attach="material-0" color={cloth} />
          <meshStandardMaterial attach="material-1" color={cloth} />
          <meshStandardMaterial attach="material-2" color={cloth} />
          <meshStandardMaterial attach="material-3" color="#efe6cf" />
          <meshStandardMaterial attach="material-4" map={spine(title, cloth, ink)} />
          <meshStandardMaterial attach="material-5" color="#efe6cf" />
        </mesh>
      ))}
    </group>
  );
}

const floppyLabel = () =>
  label({ key: "floppy", w: 256, h: 160 }, (ctx, w, h) => {
    ctx.fillStyle = "#f4efe2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2a2140";
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText("RIVIERA.OS", 16, 56);
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText("Boot Disk  v1.0", 16, 104);
    ctx.fillStyle = "#7a4fd6";
    ctx.fillText("</>", w - 70, h - 22);
  });

function Floppies() {
  const [x, , z] = SPOT.floppies;
  return (
    <group position={[x, DESK_Y, z]} rotation={[0, -0.35, 0]}>
      {["#1d1a2a", "#2b2140", "#5a3fb0"].map((colour, i) => (
        <group key={colour} position={[i * 0.012, 0.003 + i * 0.004, -i * 0.01]} rotation={[0, i * 0.12, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.003, 0.094]} />
            <meshStandardMaterial color={colour} roughness={0.5} />
          </mesh>
          {i === 2 && (
            <mesh position={[0, 0.0016, 0.012]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.07, 0.044]} />
              <meshStandardMaterial map={floppyLabel()} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

const mugFace = () =>
  label({ key: "mug-face", w: 256, h: 128 }, (ctx, w, h) => {
    ctx.fillStyle = "#f4efe4";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d9822b";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 + 6, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6e7c8";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 + 18, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a18";
    [[-12, 0], [12, 0]].forEach(([dx]) => ctx.fillRect(w / 2 + dx - 3, h / 2 - 2, 6, 6));
  });

// The coffee: a click sends up a few puffs of steam (and, at night, opens coffee.exe).
const STEAM_FADE = 0.45; // per second
const STEAM_RISE = 0.12; // metres

function useSteam() {
  const steam = useRef<THREE.Group>(null);
  const puff = useRef(0);
  usePulse("coffee", () => (puff.current = 1));
  useFrame((_, dt) => {
    if (!steam.current) return;
    puff.current = Math.max(0, puff.current - dt * STEAM_FADE);
    steam.current.children.forEach((s, i) => {
      const t = (1 - puff.current + i * 0.25) % 1;
      s.position.y = 0.1 + t * STEAM_RISE;
      (s as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>).material.opacity = puff.current > 0 ? 0.35 * (1 - t) : 0;
    });
  });
  return steam;
}

function Mug() {
  return (
    <>
      <mesh position={[0, 0.004, 0]} receiveShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.008, 28]} />
        <meshStandardMaterial color="#b98a5a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.032, 0.085, 28]} />
        <meshStandardMaterial map={mugFace()} roughness={0.35} />
      </mesh>
      <mesh position={[0.04, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.02, 0.006, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#f4efe4" />
      </mesh>
      <mesh position={[0, 0.091, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.031, 24]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
    </>
  );
}

function Coffee() {
  const [x, , z] = SPOT.mug;
  const steam = useSteam();
  return (
    <Hoverable id="coffee" position={[x, DESK_Y, z]}>
      <Mug />
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.01, 0.1, 0]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </Hoverable>
  );
}

function Ivy() {
  const [x, , z] = SPOT.plant;
  // Leaves spiral up from the pot and a few trail over its rim, like ivy.
  const leaves = Array.from({ length: 34 }, (_, i) => {
    const a = i * 2.4;
    const r = 0.025 + (i % 5) * 0.012;
    const trailing = i % 4 === 0;
    return [Math.cos(a) * r * (trailing ? 1.8 : 1), trailing ? 0.1 - (i % 3) * 0.03 : 0.13 + (i % 7) * 0.018, Math.sin(a) * r * (trailing ? 1.8 : 1)] as const;
  });
  return (
    <group position={[x, DESK_Y, z]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.045, 0.12, 20]} />
        <meshStandardMaterial color="#b0603a" roughness={0.8} />
      </mesh>
      {leaves.map(([lx, ly, lz], i) => (
        <mesh key={i} position={[lx, ly, lz]} rotation={[i, i * 0.7, 0]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.019, 8, 6]} />
          <meshStandardMaterial color={i % 3 ? "#3f7a3a" : "#5c9a4a"} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function Props({ theme }: { theme: Theme }) {
  return (
    <group>
      <LavaLamp theme={theme} />
      <Books />
      <Floppies />
      <Coffee />
      <Ivy />
      <RaspberryPi theme={theme} />
      <Motorcycle />
    </group>
  );
}
