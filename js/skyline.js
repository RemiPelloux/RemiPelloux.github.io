// Draws the contribution year as a 3D skyline: one bar per day, height from the count.
// Oblique projection: weeks run left to right, days come toward the viewer.
// While it is on screen, a wave rolls across the bars every few seconds.

const DAYS = 7;
const DEPTH_RATIO = 0.5; // how far a day row drops down the screen, in column widths
const BASE_SKEW = 0.55; // how far a day row shifts left, in column widths
const TILT_RANGE = 0.35; // extra skew from the pointer
const INSET = 0.14; // gap around each bar, as a share of the cell
const MAX_HEIGHT_COLS = 7; // tallest bar, in column widths
const HEADROOM_COLS = 1.2; // room above the tallest bar for the wave
const STRETCH_BELOW_PX = 900; // narrower canvases get taller bars, so a phone still shows a skyline
const MAX_STRETCH = 2.4;
const FLOOR_PX = 1.5;
const FRONT_SHADE = 0.22;
const SIDE_SHADE = 0.42;
const RISE_MS = 700;
const RISE_STAGGER_MS = 16;
const WAVE_EVERY_MS = 5200;
const WAVE_CROSSING_MS = 1700;
const WAVE_WIDTH_WEEKS = 2.6;
const WAVE_GAIN = 0.22; // extra height at the crest, as a share of the bar
const WAVE_LIFT_COLS = 0.35; // extra height at the crest for every bar, in column widths
const TOKENS = ["--l0", "--l1", "--l2", "--l3", "--l4", "--accent"];
const CORNERS = [[INSET, INSET], [1 - INSET, INSET], [1 - INSET, 1 - INSET], [INSET, 1 - INSET]];
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;

export class Skyline {
  constructor(canvas, counts, levels) {
    Object.assign(this, { canvas, counts, levels, tiltAmount: 0, selected: -1, boxes: [], colors: null });
    this.context = canvas.getContext("2d");
    this.weeks = Math.ceil(counts.length / DAYS);
    this.peak = Math.max(...counts);
    this.born = performance.now();
    this.order = this.paintOrder();
    this.visible = false;
    this.looping = false;
    this.frame = this.frame.bind(this);
    new IntersectionObserver(([entry]) => this.onVisible(entry.isIntersecting)).observe(canvas);
  }

  // Back row first, and left to right inside a row.
  paintOrder() {
    const order = [];
    for (let day = 0; day < DAYS; day += 1) {
      for (let week = 0; week < this.weeks; week += 1) {
        if (week * DAYS + day < this.counts.length) order.push(week * DAYS + day);
      }
    }
    return order;
  }

  onVisible(visible) {
    this.visible = visible;
    if (visible) this.draw();
  }

  measure() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth;
    const col = width / (this.weeks + DAYS * (BASE_SKEW + TILT_RANGE));
    const rise = col * Math.min(MAX_STRETCH, Math.max(1, STRETCH_BELOW_PX / width));
    const height = rise * (MAX_HEIGHT_COLS + HEADROOM_COLS) + col * (DAYS * DEPTH_RATIO + 0.5);
    const pixels = [Math.round(width * ratio), Math.round(height * ratio)];
    if (this.canvas.width !== pixels[0] || this.canvas.height !== pixels[1]) {
      [this.canvas.width, this.canvas.height] = pixels;
      this.canvas.style.height = `${height}px`;
    }
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.context.clearRect(0, 0, width, height);
    return {
      col,
      rise,
      skew: BASE_SKEW + this.tiltAmount * TILT_RANGE,
      originX: DAYS * col * (BASE_SKEW + TILT_RANGE),
      originY: rise * (MAX_HEIGHT_COLS + HEADROOM_COLS),
    };
  }

  // 0 away from the wave, 1 at its crest.
  wave(week, now) {
    const since = (now - this.born - RISE_MS) % WAVE_EVERY_MS;
    if (since < 0 || since > WAVE_CROSSING_MS || still.matches) return 0;
    const crest = (since / WAVE_CROSSING_MS) * (this.weeks + WAVE_WIDTH_WEEKS * 4) - WAVE_WIDTH_WEEKS * 2;
    return Math.exp(-(((week - crest) / WAVE_WIDTH_WEEKS) ** 2));
  }

  barHeight(index, rise, now) {
    const week = Math.floor(index / DAYS);
    const age = (now - this.born - week * RISE_STAGGER_MS) / RISE_MS;
    const grown = age >= 1 ? 1 : Math.max(0, easeOutBack(Math.max(0, age)));
    const full = Math.sqrt(this.counts[index] / this.peak) * MAX_HEIGHT_COLS * rise;
    const crest = this.wave(week, now);
    return Math.max(FLOOR_PX, full * grown * (1 + WAVE_GAIN * crest) + WAVE_LIFT_COLS * rise * crest * grown);
  }

  face(points, color, shade) {
    const { context } = this;
    context.beginPath();
    points.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    if (!shade) return;
    context.fillStyle = `rgba(0, 0, 0, ${shade})`;
    context.fill();
  }

  drawBar(view, index, now) {
    const week = Math.floor(index / DAYS);
    const day = index % DAYS;
    const h = this.barHeight(index, view.rise, now);
    const [a, b, c, d] = CORNERS.map(([dx, dy]) => [
      view.originX + (week + dx) * view.col - (day + dy) * view.col * view.skew,
      view.originY + (day + dy) * view.col * DEPTH_RATIO,
    ]);
    const up = ([x, y]) => [x, y - h];
    const color = this.colors[index === this.selected ? 5 : this.levels[index]];
    this.face([d, c, up(c), up(d)], color, FRONT_SHADE);
    this.face([c, b, up(b), up(c)], color, SIDE_SHADE);
    this.face([a, b, c, d].map(up), color, 0);
    this.boxes[index] = { left: d[0], right: b[0], top: a[1] - h, bottom: d[1] };
  }

  readColors() {
    const style = getComputedStyle(document.documentElement);
    this.colors = TOKENS.map((token) => style.getPropertyValue(token).trim());
  }

  draw(now = performance.now()) {
    if (!this.colors) this.readColors();
    const view = this.measure();
    for (const index of this.order) this.drawBar(view, index, now);
    if (this.looping || still.matches) return;
    this.looping = true;
    requestAnimationFrame(this.frame);
  }

  // Runs only while the canvas is on screen.
  frame(now) {
    this.looping = false;
    if (this.visible && this.canvas.isConnected) this.draw(now);
  }

  // Front-most bar under the point, or -1.
  hit(x, y) {
    for (let i = this.order.length - 1; i >= 0; i -= 1) {
      const box = this.boxes[this.order[i]];
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return this.order[i];
    }
    return -1;
  }

  select(index) {
    this.selected = index;
    this.draw();
  }

  tilt(amount) {
    this.tiltAmount = amount;
    this.draw();
  }

  retheme() {
    this.colors = null;
    this.draw();
  }

  replay(instant) {
    this.born = performance.now() - (instant ? RISE_MS * DAYS * DAYS : 0);
    this.draw();
  }
}
