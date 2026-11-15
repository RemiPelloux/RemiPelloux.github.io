// The two gadgets: the Raspberry Pi in its clear case (it opens the lab bench) and the motorcycle model
// on the tower (it revs).
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Theme } from "@/state/store";
import { Hoverable } from "./Hoverable";
import { calm, usePulse } from "./focus";
import { DESK_Y, SPOT } from "./layout";

const BLINK_S = 1.2;
const BLINK_HZ = 30;
const REV_S = 1.4;
const WHEEL_SPIN = 30; // radians per second at full rev
const SHAKE_HZ = 80;
const SHAKE_M = 0.0015;

// A click makes the Pi's status light flicker white for a moment.
function useLed() {
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const blink = useRef(0);
  usePulse("pi", () => (blink.current = BLINK_S));
  useFrame(({ clock }, dt) => {
    blink.current = Math.max(0, blink.current - dt);
    const on = blink.current > 0 && Math.sin(clock.elapsedTime * BLINK_HZ) > 0;
    led.current?.color.set(on ? "#ffffff" : "#ff4d6d");
  });
  return led;
}

function Board({ theme }: { theme: Theme }) {
  return (
    <>
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
    </>
  );
}

export function RaspberryPi({ theme }: { theme: Theme }) {
  const [x, , z] = SPOT.pi;
  const led = useLed();
  return (
    <Hoverable id="pi" position={[x, DESK_Y, z]} rotation={[0, -0.4, 0]}>
      <RoundedBox args={[0.1, 0.034, 0.07]} radius={0.006} position={[0, 0.017, 0]}>
        <meshPhysicalMaterial color="#cfe8ff" transmission={0.6} roughness={0.15} thickness={0.01} transparent opacity={0.45} />
      </RoundedBox>
      <Board theme={theme} />
      <mesh position={[0.04, 0.02, 0.025]}>
        <sphereGeometry args={[0.003, 8, 6]} />
        <meshBasicMaterial ref={led} color="#ff4d6d" toneMapped={false} />
      </mesh>
    </Hoverable>
  );
}

// A click revs the engine: the wheels spin and the bike shakes, both dying away.
function useRev() {
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const rev = useRef(0);
  usePulse("motorcycle", () => (rev.current = REV_S));
  useFrame(({ clock }, dt) => {
    rev.current = Math.max(0, rev.current - dt);
    const r = calm ? 0 : rev.current;
    wheels.current.forEach((wheel) => (wheel.rotation.z -= dt * WHEEL_SPIN * r));
    if (body.current) body.current.position.y = r > 0 ? Math.sin(clock.elapsedTime * SHAKE_HZ) * SHAKE_M * r : 0;
  });
  return { body, wheels };
}

function Frame() {
  return (
    <>
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
    </>
  );
}

export function Motorcycle() {
  const [x, y, z] = SPOT.motorcycle;
  const { body, wheels } = useRev();
  return (
    <Hoverable id="motorcycle" position={[x, y, z]} rotation={[0, -0.5, 0]}>
      <group ref={body}>
        {[-0.045, 0.045].map((wx, i) => (
          <mesh key={wx} ref={(m) => void (m && (wheels.current[i] = m))} position={[wx, 0.022, 0]} castShadow>
            <torusGeometry args={[0.018, 0.007, 8, 18]} />
            <meshStandardMaterial color="#141414" roughness={0.8} />
          </mesh>
        ))}
        <Frame />
      </group>
    </Hoverable>
  );
}
