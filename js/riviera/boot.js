// Chapter 00: a short boot log while the world loads. Every number in it comes from the loaded data.
// A key press or a click skips it; with reduced motion it is not shown at all.

const LINE_MS = 330;
const HOLD_MS = 500;

const format = (n) => new Intl.NumberFormat("en-GB").format(n);

function lines(world) {
  const land = world.land.reduce((sum, part) => sum + part.o.length, 0);
  return [
    "riviera.exe --origin 43.5685N,7.1225E",
    `coastline ........ ${format(land / 2)} points`,
    `buildings ........ ${format(world.buildings.length)}`,
    `streets .......... ${format(world.roads.length)}`,
    "Fort Carré ....... 1550",
    "shiba ............ awake",
  ];
}

function wait(ms, skip) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    skip.then(() => (clearTimeout(timer), resolve()));
  });
}

function skipSignal(screen) {
  return new Promise((resolve) => {
    const done = () => resolve();
    window.addEventListener("keydown", done, { once: true });
    screen.addEventListener("click", done, { once: true });
  });
}

export async function runBoot(screen, world, calm) {
  if (calm) return screen.remove();
  const log = screen.querySelector("[data-log]");
  const skip = skipSignal(screen);
  for (const text of lines(world)) {
    const line = document.createElement("li");
    line.textContent = text;
    log.append(line);
    await wait(LINE_MS, skip);
  }
  await wait(HOLD_MS, skip);
  screen.classList.add("done");
  setTimeout(() => screen.remove(), 900);
}
