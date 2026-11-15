// Adaptive resolution: keeps the frame rate smooth on any machine. It watches a running average of
// the frame time and steps the render resolution down when frames run long, and back up when there is
// room again, with a pause after each step so it never hunts back and forth.
const SLOW_MS = 24; // under ~42 fps: step down
const FAST_MS = 14; // over ~70 fps: there is room to step up
const STEP_DOWN = 0.15;
const STEP_UP = 0.1;
const MIN_RATIO = 0.6;
const SETTLE_SECONDS = 2;
const SMOOTHING = 0.06;

export function makeQuality(renderer, post) {
  const best = Math.min(1.5, window.devicePixelRatio || 1);
  const state = { ratio: best, average: 16, wait: SETTLE_SECONDS };
  const apply = (ratio) => {
    state.ratio = Math.round(ratio * 100) / 100;
    renderer.setPixelRatio(state.ratio);
    post.setPixelRatio(state.ratio);
    state.wait = SETTLE_SECONDS;
  };
  apply(best);
  return function measure(delta) {
    state.average += (delta * 1000 - state.average) * SMOOTHING;
    state.wait -= delta;
    if (state.wait > 0 || document.hidden) return;
    if (state.average > SLOW_MS && state.ratio > MIN_RATIO) apply(Math.max(MIN_RATIO, state.ratio - STEP_DOWN));
    else if (state.average < FAST_MS && state.ratio < best) apply(Math.min(best, state.ratio + STEP_UP));
  };
}
