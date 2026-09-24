// Qué versión se ve: "vector" (Normal) o "paint" (Realista).
const KEY = "ohana-look";

// La sala de líneas es para un muñeco chico. En Realista el mundo y el cuerpo crecen juntos.
export const PAINT_WORLD = 2.2;
export const PAINT_BODY = 2;

export function getLook() {
  try { return localStorage.getItem(KEY) === "paint" ? "paint" : "vector"; }
  catch (e) { return "vector"; }
}

export function setLook(value) {
  try { localStorage.setItem(KEY, value === "paint" ? "paint" : "vector"); }
  catch (e) {}
}

/** Ajusta el cuerpo al tamaño pintado. Llamar justo después de applyForm. */
export function paintFit(p) {
  if (!p || getLook() !== "paint") return;
  const f = p.forms && p.forms[Number(p.evo) || 0];
  if (!f) return;
  const jump = f.jump * Math.sqrt(PAINT_WORLD);
  const speed = f.speed * 1.35;
  p.jumpPower = jump;
  p.speed = speed;
  if (p.evoTween) {
    p.evoToW = f.w * PAINT_BODY;
    p.evoToH = f.h * PAINT_BODY;
  } else {
    p.w = f.w * PAINT_BODY;
    p.h = f.h * PAINT_BODY;
  }
}
