// Draws the contribution year as a 3D skyline: one bar per day, height from the count.
// Oblique projection: weeks run left to right, days come toward the viewer.

const DAYS = 7;
const DEPTH_RATIO = 0.5; // how far a day row drops down the screen, in column widths
const BASE_SKEW = 0.55; // how far a day row shifts left, in column widths
const TILT_RANGE = 0.35; // extra skew from the pointer
const INSET = 0.14; // gap around each bar, as a share of the cell
const MAX_HEIGHT_COLS = 7; // tallest bar, in column widths
const FLOOR_PX = 1.5;
const FRONT_SHADE = 0.22;
const SIDE_SHADE = 0.42;
const RISE_MS = 700;
const RISE_STAGGER_MS = 16;
const TOKENS = ["--l0", "--l1", "--l2", "--l3", "--l4", "--accent"];

const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;

export function createSkyline(canvas, counts, levels) {
  const context = canvas.getContext("2d");
  const weeks = Math.ceil(counts.length / DAYS);
  const peak = Math.max(...counts);
  const state = { tilt: 0, selected: -1, born: performance.now(), boxes: [], colors: [] };
  // Paint order: back row first, and left to right inside a row.
  const order = [];
  for (let day = 0; day < DAYS; day += 1) {
    for (let week = 0; week < weeks; week += 1) {
      if (week * DAYS + day < counts.length) order.push(week * DAYS + day);
    }
  }

  function measure() {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const skew = BASE_SKEW + state.tilt * TILT_RANGE;
    const col = width / (weeks + DAYS * (BASE_SKEW + TILT_RANGE));
    const height = col * (MAX_HEIGHT_COLS + DAYS * DEPTH_RATIO + 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { col, skew, originX: DAYS * col * (BASE_SKEW + TILT_RANGE), originY: col * (MAX_HEIGHT_COLS + 0.5) };
  }

  function barHeight(index, col, now) {
    const week = Math.floor(index / DAYS);
    const age = (now - state.born - week * RISE_STAGGER_MS) / RISE_MS;
    const rise = age >= 1 ? 1 : Math.max(0, easeOutBack(Math.max(0, age)));
    const full = Math.sqrt(counts[index] / peak) * MAX_HEIGHT_COLS * col;
    return Math.max(FLOOR_PX, full * rise);
  }

  // Corner of the ground grid at (week, day), in canvas pixels.
  function ground(view, week, day) {
    return [view.originX + week * view.col - day * view.col * view.skew, view.originY + day * view.col * DEPTH_RATIO];
  }

  function face(points, color, shade) {
    context.beginPath();
    points.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    if (!shade) return;
    context.fillStyle = `rgba(0, 0, 0, ${shade})`;
    context.fill();
  }

  function drawBar(view, index, now) {
    const week = Math.floor(index / DAYS);
    const day = index % DAYS;
    const h = barHeight(index, view.col, now);
    const [a, b, c, d] = [[INSET, INSET], [1 - INSET, INSET], [1 - INSET, 1 - INSET], [INSET, 1 - INSET]]
      .map(([dx, dy]) => ground(view, week + dx, day + dy));
    const up = ([x, y]) => [x, y - h];
    const color = index === state.selected ? state.colors[5] : state.colors[levels[index]];
    face([d, c, up(c), up(d)], color, FRONT_SHADE);
    face([c, b, up(b), up(c)], color, SIDE_SHADE);
    face([a, b, c, d].map(up), color, 0);
    state.boxes[index] = { left: d[0], right: b[0], top: a[1] - h, bottom: d[1] };
  }

  function draw(now = performance.now()) {
    const view = measure();
    const style = getComputedStyle(document.documentElement);
    state.colors = TOKENS.map((token) => style.getPropertyValue(token).trim());
    for (const index of order) drawBar(view, index, now);
    const rising = now - state.born < RISE_MS + weeks * RISE_STAGGER_MS;
    if (rising && canvas.isConnected) requestAnimationFrame(draw);
  }

  // Front-most bar under the point, or -1.
  function hit(x, y) {
    for (let i = order.length - 1; i >= 0; i -= 1) {
      const index = order[i];
      const box = state.boxes[index];
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return index;
    }
    return -1;
  }

  return {
    draw,
    hit,
    select(index) { state.selected = index; draw(); },
    tilt(amount) { state.tilt = amount; draw(); },
    replay(instant) { state.born = performance.now() - (instant ? RISE_MS * DAYS * DAYS : 0); draw(); },
  };
}
