// Where everything sits on the desk, in metres (x right, y up, z toward the visitor). One table so the
// camera, the props and the accessible buttons agree on positions.
import * as THREE from "three";

export const DESK_Y = 0.74;
export const WALL_Z = -0.45;

// The CRT tilts back on its swivel, and the camera sits on the glass's axis: the glass then projects as
// an exact rectangle, so the HTML OS can be pinned with a plain translate + scale and stays sharp.
export const TILT = 0.17;
export const HEAD_PIVOT = new THREE.Vector3(0, DESK_Y + 0.07, -0.02);
const GLASS_LOCAL = new THREE.Vector3(0, 0.265, 0.2505); // glass centre, relative to the pivot
const ROT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -TILT);

const width = 0.4;
const height = 0.3;
const centre = GLASS_LOCAL.clone().applyQuaternion(ROT).add(HEAD_PIVOT);
const right = new THREE.Vector3(1, 0, 0);
const up = new THREE.Vector3(0, 1, 0).applyQuaternion(ROT);
const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(ROT);
const corner = (sx: number, sy: number) => centre.clone().addScaledVector(right, (sx * width) / 2).addScaledVector(up, (sy * height) / 2);

// The visible glass, 4:3. The OS is pinned to these corners: top-left, top-right, bottom-right, bottom-left.
export const GLASS = {
  width,
  height,
  centre,
  right,
  up,
  normal,
  corners: [corner(-1, 1), corner(1, 1), corner(1, -1), corner(-1, -1)],
};

export const SPOT = {
  tower: [0.5, DESK_Y, -0.2],
  motorcycle: [0.5, DESK_Y + 0.44, -0.17],
  shiba: [0.5, DESK_Y, 0.2],
  lava: [-0.52, DESK_Y, -0.16],
  books: [-0.5, DESK_Y, -0.02],
  mug: [-0.33, DESK_Y, 0.3],
  pi: [0.29, DESK_Y, 0.25],
  floppies: [-0.5, DESK_Y, 0.42],
  plant: [-0.7, DESK_Y, -0.3],
  map: [-0.72, 1.24, WALL_Z + 0.012],
  window: [0.82, 1.5, WALL_Z + 0.004],
  door: [-0.33, DESK_Y, WALL_Z],
  lamp: [-0.12, 1.68, WALL_Z],
} satisfies Record<string, [number, number, number]>;
