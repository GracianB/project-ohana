// Qué versión se ve: "vector" (Normal) o "paint" (Realista).
const KEY = "ohana-look";

export function getLook() {
  try { return localStorage.getItem(KEY) === "paint" ? "paint" : "vector"; }
  catch (e) { return "vector"; }
}

export function setLook(value) {
  try { localStorage.setItem(KEY, value === "paint" ? "paint" : "vector"); }
  catch (e) {}
}
