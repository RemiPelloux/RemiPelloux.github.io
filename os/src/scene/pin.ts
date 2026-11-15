// Pins the HTML OS onto the CRT glass. When the glass faces the camera (the usual case) its corners form
// an axis-aligned rectangle and a translate + scale is enough, which keeps text crisp. While the camera
// glances away (wall map, tiny door) the glass is seen at an angle, so the OS follows it with a full
// projective matrix3d computed from the four corners.
import * as THREE from "three";
import { SCREEN } from "../state/store";
import { GLASS } from "./layout";

const points = GLASS.corners.map(() => new THREE.Vector3());

type M3 = number[]; // 3x3, row-major

function adj(m: M3): M3 {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function mul(a: M3, b: M3): M3 {
  const out: M3 = [];
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]);
  return out;
}

// The projective basis that sends (1,0,0), (0,1,0), (0,0,1), (1,1,1) to four points.
function basis(p: number[]): M3 {
  const m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1];
  const a = adj(m);
  const v = [a[0] * p[6] + a[1] * p[7] + a[2], a[3] * p[6] + a[4] * p[7] + a[5], a[6] * p[6] + a[7] * p[7] + a[8]];
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

function matrix3d(dst: number[]) {
  const { width: w, height: h } = SCREEN;
  const t = mul(basis(dst), adj(basis([0, 0, w, 0, w, h, 0, h])));
  const n = t.map((x) => x / t[8]);
  return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, 1].map((x) => x.toPrecision(8)).join(",")})`;
}

// The CSS transform that lays the 900 x 675 OS over the glass, for this camera and canvas size.
export function glassTransform(camera: THREE.Camera, width: number, height: number) {
  const px: number[] = [];
  GLASS.corners.forEach((corner, i) => {
    points[i].copy(corner).project(camera);
    px.push(((points[i].x + 1) / 2) * width, ((1 - points[i].y) / 2) * height);
  });
  const [x0, y0, x1, y1, x2, y2, x3, y3] = px;
  const square = Math.abs(y0 - y1) < 0.3 && Math.abs(x1 - x2) < 0.3 && Math.abs(y2 - y3) < 0.3 && Math.abs(x3 - x0) < 0.3;
  if (square) return `translate(${x0.toFixed(2)}px, ${y0.toFixed(2)}px) scale(${((x1 - x0) / SCREEN.width).toFixed(5)})`;
  return matrix3d(px);
}
