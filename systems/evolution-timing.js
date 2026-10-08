export function evolutionTiming({ reduced = false, finalForm = false } = {}) {
  if (reduced) {
    return finalForm
      ? { dark:0.08, oldIn:0, charge:0.10, flip:0.22, flash:0.44, reveal:0.48, out:1.18, end:1.46 }
      : { dark:0.08, oldIn:0, charge:0.03, flip:0.12, flash:0.22, reveal:0.22, out:0.88, end:1.12 };
  }
  if (finalForm) {
    return {
      dark: 0.34,
      oldIn: 0.18,
      charge: 1.05,
      flip: 1.72,
      flash: 2.78,
      reveal: 3.10,
      out: 5.80,
      end: 6.45,
    };
  }
  return {
    dark: 0.12,
    oldIn: 0.05,
    charge: 0.28,
    flip: 0.46,
    flash: 0.62,
    reveal: 0.62,
    out: 1.48,
    end: 1.78,
  };
}
