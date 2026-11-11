// A Schelling segregation model on a wrapped grid. Pure logic, no DOM.
// All randomness comes from one seeded stream, so a seed fixes the whole run.

export const COLS = 72;
export const ROWS = 32;
const EMPTY_SHARE = 0.12;
const TOLERANCE = 0.45; // an agent stays when at least this share of its neighbours match it
const EMPTY = 0;
const GROUPS = [1, 2];
const NEIGHBOURS = [-1, 0, 1].flatMap((dy) =>
  [-1, 0, 1].filter((dx) => dx || dy).map((dx) => [dx, dy]),
);

// mulberry32: a small, well-known 32-bit generator.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

export function createModel(seed) {
  const random = createRandom(seed);
  const grid = new Uint8Array(COLS * ROWS);
  for (let i = 0; i < grid.length; i += 1) {
    if (random() < EMPTY_SHARE) continue;
    grid[i] = GROUPS[Math.floor(random() * GROUPS.length)];
  }
  return { seed, random, grid, steps: 0, moved: 0, settled: false };
}

// Share of occupied neighbours in the same group. Null when there are none.
function likeShare(grid, index) {
  const x = index % COLS;
  const y = (index - x) / COLS;
  let same = 0;
  let occupied = 0;
  for (const [dx, dy] of NEIGHBOURS) {
    const other = grid[((y + dy + ROWS) % ROWS) * COLS + ((x + dx + COLS) % COLS)];
    if (other === EMPTY) continue;
    occupied += 1;
    if (other === grid[index]) same += 1;
  }
  return occupied ? same / occupied : null;
}

function shuffle(list, random) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}

function census(grid) {
  const unhappy = [];
  const empty = [];
  grid.forEach((group, index) => {
    if (group === EMPTY) empty.push(index);
    else if ((likeShare(grid, index) ?? 1) < TOLERANCE) unhappy.push(index);
  });
  return { unhappy, empty };
}

// One step: every unhappy agent moves to a random empty cell.
export function step(model) {
  if (model.settled) return;
  const { grid, random } = model;
  const { unhappy, empty } = census(grid);
  shuffle(unhappy, random);
  for (const from of unhappy) {
    const slot = Math.floor(random() * empty.length);
    grid[empty[slot]] = grid[from];
    grid[from] = EMPTY;
    empty[slot] = from;
  }
  model.moved = unhappy.length;
  model.settled = unhappy.length === 0;
  if (!model.settled) model.steps += 1;
}

// Mean share of like neighbours over all agents that have neighbours.
export function meanLikeShare(grid) {
  let sum = 0;
  let counted = 0;
  grid.forEach((group, index) => {
    if (group === EMPTY) return;
    const share = likeShare(grid, index);
    if (share === null) return;
    sum += share;
    counted += 1;
  });
  return counted ? sum / counted : 0;
}
