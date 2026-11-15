// The stickers on the tower's front, painted on one transparent canvas so they cost a single draw call:
// </> RIVIERA.OS, a palm tree at sunset, a pixel invader, a polaroid of Antibes and a name tag.
import { canvasTexture, FONT, MONO, rounded } from "./textures";

type Ctx = CanvasRenderingContext2D;

// Where a sticker sits on the sheet and how much it is turned.
interface Spot {
  x: number;
  y: number;
  angle: number;
}

function tilted(ctx: Ctx, { x, y, angle }: Spot, draw: () => void) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowColor = "rgb(0 0 0 / 0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  draw();
  ctx.restore();
}

function riviera(ctx: Ctx) {
  rounded(ctx, { x: -150, y: -42, w: 300, h: 84 }, 16);
  ctx.fillStyle = "#16142a";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#4fa3ff";
  ctx.font = `700 40px ${MONO}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", -92, 2);
  ctx.fillStyle = "#f4efff";
  ctx.font = `800 32px ${FONT}`;
  ctx.fillText("RIVIERA.OS", 40, 2);
}

const PALM_R = 70;

// A sunset disc: warm sky over a band of sea.
function sunset(ctx: Ctx) {
  const sky = ctx.createLinearGradient(0, -PALM_R, 0, PALM_R);
  sky.addColorStop(0, "#ff7a59");
  sky.addColorStop(0.6, "#ffc46b");
  sky.addColorStop(0.61, "#2d6fb3");
  ctx.beginPath();
  ctx.arc(0, 0, PALM_R, 0, Math.PI * 2);
  ctx.fillStyle = sky;
  ctx.fill();
  ctx.shadowColor = "transparent";
}

function palmTree(ctx: Ctx) {
  ctx.strokeStyle = "#2a1b2e";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(8, 42);
  ctx.quadraticCurveTo(-4, 0, 6, -28);
  ctx.stroke();
  ctx.fillStyle = "#2a1b2e";
  for (const a of [-2.7, -2.0, -1.2, -0.4, 0.3]) {
    ctx.beginPath();
    ctx.ellipse(6 + Math.cos(a) * 22, -28 + Math.sin(a) * 12, 26, 6, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function palm(ctx: Ctx) {
  sunset(ctx);
  palmTree(ctx);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, 0, PALM_R, 0, Math.PI * 2);
  ctx.stroke();
}

const INVADER = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];

function invader(ctx: Ctx) {
  const cell = 12;
  rounded(ctx, { x: -78, y: -60, w: 156, h: 120 }, 12);
  ctx.fillStyle = "#101418";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#7cf06a";
  INVADER.forEach((row, y) => [...row].forEach((on, x) => on === "1" && ctx.fillRect(-66 + x * cell, -48 + y * cell, cell - 1, cell - 1)));
}

function polaroid(ctx: Ctx) {
  ctx.fillStyle = "#fbfaf5";
  ctx.fillRect(-80, -92, 160, 184);
  ctx.shadowColor = "transparent";
  const sea = ctx.createLinearGradient(0, -78, 0, 50);
  sea.addColorStop(0, "#8fd0ff");
  sea.addColorStop(0.5, "#ffe2b0");
  sea.addColorStop(0.52, "#2f7fc0");
  sea.addColorStop(1, "#1d5a96");
  ctx.fillStyle = sea;
  ctx.fillRect(-68, -80, 136, 132);
  ctx.fillStyle = "#e9d6ae"; // the old town and the fort on the shore
  ctx.fillRect(-68, -16, 70, 14);
  ctx.fillRect(-54, -30, 18, 16);
  ctx.fillRect(20, -22, 34, 20);
  ctx.fillStyle = "#c46a4a";
  ctx.fillRect(-60, -34, 8, 6);
  ctx.fillStyle = "#3a3340";
  ctx.font = `600 18px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("Antibes ☀", 0, 78);
}

function nameTag(ctx: Ctx) {
  rounded(ctx, { x: -120, y: -56, w: 240, h: 112 }, 14);
  ctx.fillStyle = "#e0413b";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `800 20px ${FONT}`;
  ctx.fillText("HELLO my name is", 0, -28);
  ctx.fillRect(-108, -14, 216, 62);
  ctx.fillStyle = "#1c1b26";
  ctx.font = `italic 700 34px "Comic Sans MS", "Marker Felt", ${FONT}`;
  ctx.fillText("Rémi Pelloux", 0, 28);
}

// 512 x 640: the lower front of the tower, 0.16 m x 0.2 m.
export function stickerSheet() {
  return canvasTexture({ key: "stickers", w: 512, h: 640 }, (ctx) => {
    tilted(ctx, { x: 256, y: 70, angle: -0.05 }, () => riviera(ctx));
    tilted(ctx, { x: 120, y: 230, angle: 0.12 }, () => palm(ctx));
    tilted(ctx, { x: 370, y: 250, angle: -0.1 }, () => polaroid(ctx));
    tilted(ctx, { x: 140, y: 420, angle: -0.08 }, () => invader(ctx));
    tilted(ctx, { x: 340, y: 560, angle: 0.06 }, () => nameTag(ctx));
  });
}
