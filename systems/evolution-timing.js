export function evolutionTiming({ reduced = false, finalForm = false } = {}) {
  const k = finalForm ? 1.15 : 1;
  return reduced
    ? {
        dark: 0.18,
        oldIn: 0,
        charge: 0,
        flip: 0,
        flash: 0.20,
        reveal: 0.20,
        out: 1.05,
        end: 1.35,
      }
    : {
        dark: 0.34 * k,
        oldIn: 0.15 * k,
        charge: 0.55 * k,
        flip: 1.20 * k,
        flash: 1.85 * k,
        reveal: 1.85 * k,
        out: 3.20 * k,
        end: 3.80 * k,
      };
}
