
const KEY = "ohana-look-v2";

export const PAINT_WORLD = 2.2;
export const PAINT_BODY = 2;

export function getLook() {
  try { return localStorage.getItem(KEY) === "paint" ? "paint" : "vector"; }
  catch (e) { return "vector"; }
}

export function setLook(value) {
  const next = value === "paint" ? "paint" : "vector";
  try { localStorage.setItem(KEY, next); }
  catch (e) {}
  return next;
}

export function isPaint() {
  return getLook() === "paint";
}

/** Ajusta el cuerpo al tamaño pintado. Llamar justo después de applyForm. */
export function paintFit(p) {
  if (!p || getLook() !== "paint") return;
  const f = p.forms && p.forms[Number(p.evo) || 0];
  if (!f) return;
  p.jumpPower = f.jump * Math.sqrt(PAINT_WORLD);
  p.speed = f.speed * 1.35;
  if (p.evoTween) {
    p.evoToW = f.w * PAINT_BODY;
    p.evoToH = f.h * PAINT_BODY;
  } else {
    p.w = f.w * PAINT_BODY;
    p.h = f.h * PAINT_BODY;
  }
}