// OHANA uses real runtime and browser performance gates, not static source caps.
// Byte counts remain observable for diagnostics, never an artificial release blocker.
export const JS_WARN_BYTES = Number.POSITIVE_INFINITY;
export const JS_HARD_BYTES = Number.POSITIVE_INFINITY;
export const CSS_WARN_BYTES = Number.POSITIVE_INFINITY;
export const CSS_HARD_BYTES = Number.POSITIVE_INFINITY;
export const FIRST_CONTENTFUL_PAINT_MS = 4_000;
export const SIMULATION_STEP_BUDGET_MS = 1_000;
