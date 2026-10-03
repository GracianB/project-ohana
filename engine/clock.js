export const STEP_MS = 1000 / 60;

export function createFixedClock({ stepMs = STEP_MS, maxSteps = 5 } = {}) {
  let previous = null;
  let accumulated = 0;
  return {
    reset() { previous = null; accumulated = 0; },
    advance(now, update) {
      if (!Number.isFinite(now)) return 0;
      if (previous === null) { previous = now; return 0; }
      const elapsed = Math.max(0, now - previous);
      previous = now;
      accumulated += Math.min(elapsed, stepMs * maxSteps);
      let steps = 0;
      while (accumulated + 1e-7 >= stepMs && steps < maxSteps) {
        accumulated = Math.max(0, accumulated - stepMs);
        update();
        steps++;
      }
      return steps;
    }
  };
}
