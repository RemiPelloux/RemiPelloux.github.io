// The 3D workstation: the room and the computer in a canvas, seen from the chair. The OS is real HTML
// pinned over the CRT's glass on every frame, so its text stays sharp, selectable and accessible.
// The camera sits on the glass's axis, a little above the desk because the CRT tilts back, and uses a
// lens shift (not a rotation) to frame the desk under the screen: the glass stays an exact rectangle.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { SCREEN, useOs } from "../state/store";
import { Computer } from "./Computer";
import { Room } from "./Room";
import { Props } from "./Props";
import { Shiba } from "./Shiba";
import { Access, Tooltip } from "./Access";
import { calm, useScene } from "./focus";
import { GLASS } from "./layout";
import { glassTransform } from "./pin";
import "./scene.css";

const FOV = 32;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
// How much of the viewport the glass takes: big with the desk around it, bigger while working on it.
// The width share is smaller so narrow 16:10 windows still show the tower and the props on the left.
const FILL = { overview: { height: 0.42, width: 0.33 }, focus: { height: 0.84, width: 0.8 } };
const LIFT = { overview: 0.12, focus: 0 }; // where the glass centre sits, in NDC above the middle
const SWAY = { x: 0.045, y: 0.022 }; // metres of camera travel at the edges of the viewport

function distanceFor(aspect: number, fill: { height: number; width: number }) {
  return Math.max(GLASS.height / (fill.height * 2 * TAN), GLASS.width / (fill.width * 2 * TAN * aspect));
}

const seatQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(GLASS.right, GLASS.up, GLASS.normal));
const look = new THREE.Matrix4();
const glanceQuat = new THREE.Quaternion();
const target = new THREE.Vector3();
const aim = new THREE.Vector2();

interface RigState {
  distance: number;
  lift: number;
  glance: number;
  sway: THREE.Vector2;
  onScreen: boolean;
  last: string;
}

// The seat: on the glass's axis, plus the sway; the lens shift keeps the glass where it belongs on screen.
function seat(cam: THREE.PerspectiveCamera, s: RigState, aspect: number) {
  cam.position.copy(GLASS.centre).addScaledVector(GLASS.normal, s.distance).addScaledVector(GLASS.right, s.sway.x).addScaledVector(GLASS.up, s.sway.y);
  cam.quaternion.copy(seatQuat);
  cam.updateProjectionMatrix();
  const keep = 1 - s.glance;
  cam.projectionMatrix.elements[8] = (-s.sway.x / (s.distance * TAN * aspect)) * keep;
  cam.projectionMatrix.elements[9] = -(s.lift + s.sway.y / (s.distance * TAN)) * keep;
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
}

// A glance turns the camera toward a prop and drifts it a little closer, then eases back to the seat.
function glance(cam: THREE.PerspectiveCamera, s: RigState, dt: number) {
  const g = useScene.getState().glance;
  const active = Boolean(g && performance.now() < g.until) && !calm;
  s.glance = THREE.MathUtils.damp(s.glance, active ? 1 : 0, 4.5, dt);
  if (!g || s.glance < 0.0005) {
    if (g && !active) useScene.setState({ glance: null });
    s.glance = active ? s.glance : 0;
    return;
  }
  target.fromArray(g.look);
  cam.position.lerp(target, g.amount * s.glance);
  glanceQuat.setFromRotationMatrix(look.lookAt(cam.position, target, GLASS.up));
  cam.quaternion.slerp(glanceQuat, s.glance);
}

function Rig({ overlay }: { overlay: RefObject<HTMLDivElement | null> }) {
  const { camera, size, pointer } = useThree();
  const state = useRef<RigState>({ distance: 0, lift: LIFT.overview, glance: 0, sway: new THREE.Vector2(), onScreen: false, last: "" });

  useFrame((_, delta) => {
    const s = state.current;
    const cam = camera as THREE.PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    const aspect = size.width / size.height;
    const zoomed = useOs.getState().zoomed;
    const wanted = distanceFor(aspect, zoomed ? FILL.focus : FILL.overview);
    s.distance = s.distance === 0 || calm ? wanted : THREE.MathUtils.damp(s.distance, wanted, 3, dt);
    s.lift = calm ? (zoomed ? LIFT.focus : LIFT.overview) : THREE.MathUtils.damp(s.lift, zoomed ? LIFT.focus : LIFT.overview, 3, dt);
    const still = calm || s.onScreen || s.glance > 0;
    aim.set(still ? 0 : pointer.x * SWAY.x, still ? 0 : pointer.y * SWAY.y);
    s.sway.lerp(aim, Math.min(1, dt * 3.5));
    seat(cam, s, aspect);
    glance(cam, s, dt);
    cam.updateMatrixWorld();

    const style = glassTransform(cam, size.width, size.height);
    if (style !== s.last && overlay.current) {
      overlay.current.style.transform = style;
      s.last = style;
    }
    const box = overlay.current?.getBoundingClientRect();
    const x = ((pointer.x + 1) / 2) * size.width;
    const y = ((1 - pointer.y) / 2) * size.height;
    s.onScreen = Boolean(box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom);
  });
  return null;
}

export default function Workstation({ children }: { children: ReactNode }) {
  const theme = useOs((s) => s.theme);
  const overlay = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="workstation">
      <Canvas
        className="scene"
        shadows
        dpr={dpr}
        camera={{ fov: FOV, near: 0.05, far: 30 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => useOs.getState().setZoomed(false)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <AdaptiveDpr pixelated={false} />
        <color attach="background" args={[theme === "day" ? "#cdbb9c" : "#120d1c"]} />
        <Room theme={theme} />
        <Computer />
        <Props theme={theme} />
        <Shiba />
        <Rig overlay={overlay} />
      </Canvas>
      <div className="screen-glass" ref={overlay} style={{ width: SCREEN.width, height: SCREEN.height }} onPointerDown={() => useOs.getState().setZoomed(true)}>
        {children}
        <div className="crt-fx" aria-hidden="true" />
      </div>
      <Tooltip />
      <Access />
    </div>
  );
}
