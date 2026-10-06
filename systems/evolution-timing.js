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
        dark: 0.22 * k,
        oldIn: 0.10 * k,
        charge: 0.40 * k,
        flip: 0.82 * k,
        flash: 1.30 * k,
        reveal: 1.30 * k,
        out: 2.55 * k,
        end: 3.05 * k,
      };
}
