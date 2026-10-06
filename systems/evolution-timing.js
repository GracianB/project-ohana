export function evolutionTiming({ reduced = false, finalForm = false } = {}) {
  const k = finalForm ? 1 : 1;
  if (reduced) {
    return {
      dark: 0.08,
      oldIn: 0,
      charge: 0.03,
      flip: 0.12,
      flash: 0.22,
      reveal: 0.22,
      out: 0.88,
      end: 1.12,
    };
  }
  return {
    dark: 0.12 * k,
    oldIn: 0.05 * k,
    charge: 0.28 * k,
    flip: 0.46 * k,
    flash: 0.62 * k,
    reveal: 0.62 * k,
    out: 1.48 * k,
    end: 1.78 * k,
  };
}
