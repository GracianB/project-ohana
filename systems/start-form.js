// Forma inicial elegida en el selector (0..N-1). Pure helpers + wiring contract.
export function formCount(def) {
  const n = Math.max(
    Array.isArray(def?.forms) ? def.forms.length : 0,
    Array.isArray(def?.evoNames) ? def.evoNames.length : 0,
    1
  );
  return n;
}

export function clampStartEvo(value, maxIndex = 4) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 0;
  const hi = Math.max(0, Math.floor(Number(maxIndex)) || 0);
  return Math.max(0, Math.min(hi, n));
}

export function startFormName(def, evo = 0) {
  const i = clampStartEvo(evo, formCount(def) - 1);
  return def?.evoNames?.[i] || def?.forms?.[i]?.name || "Forma inicial";
}

/** Detail shape for ohana-start: { id, evo }. */
export function startDetail(id, evo = 0, def = null) {
  const max = def ? formCount(def) - 1 : 4;
  return { id, evo: clampStartEvo(evo, max) };
}
