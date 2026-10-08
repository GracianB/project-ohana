// OHANA V70 · Budgets are limits, not targets. Shared by browser E2E and release gate.
// More gameplay, Dino and multiplayer require room to grow without blind source shrinking.
export const JS_WARN_BYTES = 2_400_000; // review before further growth
export const JS_HARD_BYTES = 3_000_000; // 2x former 1.5 MB cap
export const CSS_HARD_BYTES = 500_000;
export const FIRST_CONTENTFUL_PAINT_MS = 4_000;
export const SIMULATION_STEP_BUDGET_MS = 1_000;
