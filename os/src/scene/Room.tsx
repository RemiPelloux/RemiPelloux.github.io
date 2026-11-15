// The room around the computer: the wall with the map of Antibes, the window over the old town, the
// wall lamp, the tiny door, the desk and its mat, and the light. Night is a warm lamp with the screen's
// blue and a violet lava lamp; day is Riviera sun through the window.
import { ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Theme } from "../state/store";
import { Hoverable } from "./Hoverable";
import { calm, usePulse } from "./focus";
import { DESK_Y, SPOT, WALL_Z } from "./layout";
import { deskMat, mapPoster, windowView } from "./paintings";

const LIGHT = {
  night: { ambient: 0.55, sky: "#6a58c8", ground: "#2a1830", lamp: 9, wallLamp: 3.2, sun: 0, wall: "#3b3150", trim: "#2a2033" },
  day: { ambient: 1.0, sky: "#e4efff", ground: "#9a7a58", lamp: 2, wallLamp: 0.6, sun: 2.6, wall: "#dccdb4", trim: "#8a6a4c" },
};

function Desk() {
  return (
    <group>
      <mesh position={[0, DESK_Y - 0.03, 0.12]} receiveShadow castShadow>
        <boxGeometry args={[2.6, 0.06, 1.15]} />
        <meshStandardMaterial color="#4a2f1f" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, DESK_Y + 0.002, 0.43]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.05, 0.42]} />
        <meshStandardMaterial map={deskMat()} roughness={0.92} />
      </mesh>
    </group>
  );
}

function MapOnWall() {
  const [x, y, z] = SPOT.map;
  return (
    <Hoverable id="map" position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.66, 0.012]} />
        <meshStandardMaterial color="#5b4330" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[0.47, 0.63]} />
        <meshStandardMaterial map={mapPoster()} roughness={0.85} />
      </mesh>
      {/* the pins in the corners */}
      {[[-0.21, 0.29], [0.21, 0.29]].map(([px, py]) => (
        <mesh key={px} position={[px, py, 0.012]}>
          <sphereGeometry args={[0.009, 10, 8]} />
          <meshStandardMaterial color="#d9443c" />
        </mesh>
      ))}
    </Hoverable>
  );
}

function Window({ theme }: { theme: Theme }) {
  const [x, y, z] = SPOT.window;
  const look = LIGHT[theme];
  return (
    <group position={[x, y, z]}>
      <mesh>
        <planeGeometry args={[0.72, 0.86]} />
        <meshBasicMaterial map={windowView(theme)} toneMapped={false} />
      </mesh>
      {[[0, 0.44, 0.76, 0.04], [0, -0.44, 0.76, 0.04], [0, 0, 0.76, 0.025], [-0.37, 0, 0.04, 0.92], [0.37, 0, 0.04, 0.92], [0, 0, 0.025, 0.92]].map(([px, py, w, h], i) => (
        <mesh key={i} position={[px, py, 0.012]}>
          <boxGeometry args={[w, h, 0.03]} />
          <meshStandardMaterial color={look.trim} roughness={0.6} />
        </mesh>
      ))}
      {/* the sill */}
      <mesh position={[0, -0.48, 0.05]}>
        <boxGeometry args={[0.84, 0.03, 0.12]} />
        <meshStandardMaterial color={look.trim} />
      </mesh>
    </group>
  );
}

function WallLamp({ theme }: { theme: Theme }) {
  const [x, y, z] = SPOT.lamp;
  return (
    <group position={[x, y, z + 0.06]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.05, 0.62, 20, 1, true]} />
        <meshStandardMaterial color="#2a2522" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.56, 12]} />
        <meshBasicMaterial color={theme === "night" ? "#ffd9a0" : "#d8c9a8"} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.12, 0.1]} intensity={LIGHT[theme].wallLamp} distance={1.8} decay={1.6} color="#ffc98a" />
    </group>
  );
}

// The tiny door in the baseboard: a click opens it and a warm light spills out, then it closes.
function TinyDoor({ theme }: { theme: Theme }) {
  const [x, , z] = SPOT.door;
  const leaf = useRef<THREE.Group>(null);
  const open = useRef(0);
  const until = useRef(0);
  usePulse("door", () => (until.current = performance.now() + 2600));
  useFrame((_, dt) => {
    const wanted = performance.now() < until.current ? 1 : 0;
    open.current = calm ? wanted : THREE.MathUtils.damp(open.current, wanted, 5, dt);
    if (leaf.current) leaf.current.rotation.y = -open.current * 1.6;
  });
  return (
    <Hoverable id="door" position={[x, DESK_Y, z + 0.004]}>
      <mesh position={[0, 0.05, 0]}>
        <planeGeometry args={[0.07, 0.1]} />
        <meshBasicMaterial color={theme === "night" ? "#ffb35c" : "#c98a46"} toneMapped={false} />
      </mesh>
      <group ref={leaf} position={[-0.035, 0, 0.003]}>
        <mesh position={[0.035, 0.05, 0]}>
          <boxGeometry args={[0.07, 0.1, 0.006]} />
          <meshStandardMaterial color="#6b4528" />
        </mesh>
      </group>
    </Hoverable>
  );
}

export function Room({ theme }: { theme: Theme }) {
  const look = LIGHT[theme];
  return (
    <group>
      <hemisphereLight args={[look.sky, look.ground, look.ambient]} />
      <spotLight position={[-0.8, 1.95, 0.9]} angle={0.8} penumbra={0.85} intensity={look.lamp} color="#ffb877" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} target-position={[0, DESK_Y, 0.15]} />
      <pointLight position={[0, DESK_Y + 0.33, 0.5]} intensity={theme === "night" ? 0.9 : 0.15} distance={1.3} color="#6f8cff" />
      {look.sun > 0 && <directionalLight position={[2.5, 2.6, 1.2]} intensity={look.sun} color="#fff2dc" castShadow shadow-mapSize={[1024, 1024]} />}
      <mesh position={[0, 1.4, WALL_Z]} receiveShadow>
        <planeGeometry args={[7, 3.4]} />
        <meshStandardMaterial color={look.wall} roughness={0.95} />
      </mesh>
      <MapOnWall />
      <Window theme={theme} />
      <WallLamp theme={theme} />
      <TinyDoor theme={theme} />
      <Desk />
      <ContactShadows position={[0, DESK_Y + 0.003, 0.12]} scale={2.6} blur={2.2} opacity={0.5} far={0.6} resolution={512} frames={1} />
    </group>
  );
}
