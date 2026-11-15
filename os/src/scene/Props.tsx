// The things on the desk: the lava lamp, the books, the boot floppies, the coffee, the ivy, the
// Raspberry Pi in its clear case and the motorcycle on the tower. Clickable ones sit in a Hoverable.
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Theme } from "../state/store";
import { Hoverable } from "./Hoverable";
import { calm, usePulse } from "./focus";
import { DESK_Y, SPOT } from "./layout";
import { label, spine, FONT } from "./textures";

const BOOKS: Array<[string, string, string]> = [
  ["AI AGENTS", "#2c3e75", "#f1e6c8"],
  ["SYSTEM DESIGN", "#3d2b5e", "#f1e6c8"],
  ["GAME DESIGN", "#28524a", "#f1e6c8"],
  ["TRADING", "#5e2b2b", "#f1e6c8"],
  ["CÔTE D'AZUR", "#1f3a5e", "#f1e6c8"],
];

// The violet lamp: blobs rise and fall slowly inside the glass; still when motion is reduced.
function LavaLamp({ theme }: { theme: Theme }) {
  const [x, , z] = SPOT.lava;
  const blobs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (calm || !blobs.current) return;
    blobs.current.children.forEach((blob, i) => (blob.position.y = 0.1 + 0.07 * Math.sin(clock.elapsedTime * 0.35 + i * 2.1)));
  });
  return (
    <group position={[x, DESK_Y, z]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.06, 20]} />
        <meshStandardMaterial color="#1d1a22" metalness={0.6} roughness={0.3} />
      </mesh>
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
      <mesh position={[0, 0.235, 0]}>
        <cylinderGeometry args={[0.012, 0.028, 0.03, 16]} />
        <meshStandardMaterial color="#1d1a22" metalness={0.6} roughness={0.3} />
      </mesh>
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
  label("floppy", 256, 160, (ctx, w, h) => {
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
  label("mug-face", 256, 128, (ctx, w, h) => {
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
function Coffee() {
  const [x, , z] = SPOT.mug;
  const steam = useRef<THREE.Group>(null);
  const puff = useRef(0);
  usePulse("coffee", () => (puff.current = 1));
  useFrame((_, dt) => {
    if (!steam.current) return;
    puff.current = Math.max(0, puff.current - dt * 0.45);
    steam.current.children.forEach((s, i) => {
      const t = (1 - puff.current + i * 0.25) % 1;
      s.position.y = 0.1 + t * 0.12;
      (s as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>).material.opacity = puff.current > 0 ? 0.35 * (1 - t) : 0;
    });
  });
  return (
    <Hoverable id="coffee" position={[x, DESK_Y, z]}>
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

// The Raspberry Pi in a clear case, with a tiny screen; its light blinks when clicked.
function RaspberryPi({ theme }: { theme: Theme }) {
  const [x, , z] = SPOT.pi;
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const blink = useRef(0);
  usePulse("pi", () => (blink.current = 1.2));
  useFrame(({ clock }, dt) => {
    blink.current = Math.max(0, blink.current - dt);
    if (led.current) led.current.color.set(blink.current > 0 && Math.sin(clock.elapsedTime * 30) > 0 ? "#ffffff" : "#ff4d6d");
  });
  return (
    <Hoverable id="pi" position={[x, DESK_Y, z]} rotation={[0, -0.4, 0]}>
      <RoundedBox args={[0.1, 0.034, 0.07]} radius={0.006} position={[0, 0.017, 0]}>
        <meshPhysicalMaterial color="#cfe8ff" transmission={0.6} roughness={0.15} thickness={0.01} transparent opacity={0.45} />
      </RoundedBox>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.085, 0.003, 0.056]} />
        <meshStandardMaterial color="#2f8f4e" roughness={0.6} />
      </mesh>
      <mesh position={[-0.01, 0.017, 0]}>
        <boxGeometry args={[0.02, 0.006, 0.02]} />
        <meshStandardMaterial color="#1b1b1b" />
      </mesh>
      <mesh position={[0.018, 0.035, 0.03]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.04, 0.026]} />
        <meshBasicMaterial color={theme === "night" ? "#5fd0ff" : "#3fa0d8"} toneMapped={false} />
      </mesh>
      <mesh position={[0.04, 0.02, 0.025]}>
        <sphereGeometry args={[0.003, 8, 6]} />
        <meshBasicMaterial ref={led} color="#ff4d6d" toneMapped={false} />
      </mesh>
    </Hoverable>
  );
}

// The motorcycle model on the tower: a click spins the wheels, shakes it and puffs exhaust.
function Motorcycle() {
  const [x, y, z] = SPOT.motorcycle;
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const rev = useRef(0);
  usePulse("motorcycle", () => (rev.current = 1.4));
  useFrame(({ clock }, dt) => {
    rev.current = Math.max(0, rev.current - dt);
    const r = calm ? 0 : rev.current;
    wheels.current.forEach((w) => w && (w.rotation.z -= dt * 30 * r));
    if (body.current) body.current.position.y = r > 0 ? Math.sin(clock.elapsedTime * 80) * 0.0015 * r : 0;
  });
  return (
    <Hoverable id="motorcycle" position={[x, y, z]} rotation={[0, -0.5, 0]}>
      <group ref={body}>
        {[-0.045, 0.045].map((wx, i) => (
          <mesh key={wx} ref={(m) => void (m && (wheels.current[i] = m))} position={[wx, 0.022, 0]} castShadow>
            <torusGeometry args={[0.018, 0.007, 8, 18]} />
            <meshStandardMaterial color="#141414" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.045, 0]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[0.075, 0.022, 0.022]} />
          <meshStandardMaterial color="#2b2f38" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.012, 0.06, 0]} castShadow>
          <boxGeometry args={[0.035, 0.012, 0.03]} />
          <meshStandardMaterial color="#8f7bff" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.048, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.05, 6]} />
          <meshStandardMaterial color="#c9c9c9" metalness={0.9} />
        </mesh>
      </group>
    </Hoverable>
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
