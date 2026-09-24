// Cerebro compartido. No mueve al bicho: solo dice qué quiere hacer.
// patrol: no te ha visto. chase: te vio y se acerca.
// strike: está a rango. hover: volador que espera ponerse encima.
// hold: de suelo, tú estás en otro piso y no salta al vacío.

export function sense(e, player) {
  const ex = (e.x || 0) + (e.w || 0) / 2;
  const ey = (e.y || 0) + (e.h || 0) / 2;
  if (!player || player.dead) return { dx: 0, dy: 1, dist: 9999, see: false, near: false, over: false };
  const dx = player.x + (player.w || 0) / 2 - ex;
  const dy = player.y + (player.h || 0) / 2 - ey;
  const dist = Math.hypot(dx, dy) || 0.001;
  const sight = e.sight || 320;
  const see = dist < sight && Math.abs(dy) < 200;
  return {
    dx, dy, dist, see,
    near: dist < 110 && Math.abs(dy) < 80,
    over: Math.abs(dx) < 72 && dy > 36,
  };
}

const FLY = new Set(["mosquito", "phosquito", "gaviota", "murcielago", "libelula", "abeja", "avispa", "brasita", "ufo"]);
const GROUND = new Set(["cangrejo", "escoria", "planta", "arana"]);

export function think(e, s, pack) {
  if (s.see) e.aggro = 100;
  else if (pack) e.aggro = Math.max(e.aggro || 0, 40);
  else e.aggro = Math.max(0, (e.aggro || 0) - 1);
  if (!(e.aggro > 0)) return "patrol";
  if (GROUND.has(e.kind) && Math.abs(s.dy) > 86) return "hold";
  if (FLY.has(e.kind)) return (s.over || s.near) ? "strike" : "hover";
  return s.near ? "strike" : "chase";
}
