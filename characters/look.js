// Qué elenco se ve: "vector" (los de antes) o "paint" (los retratos).
const KEY = "ohana-look";

export function getLook() {
  try { return localStorage.getItem(KEY) === "paint" ? "paint" : "vector"; }
  catch (e) { return "vector"; }
}

export function setLook(value) {
  try { localStorage.setItem(KEY, value === "paint" ? "paint" : "vector"); }
  catch (e) {}
}
