// Chispín — IA de pez, medusa, anguila y cangrejo (V372+).
// Post-pass: se llama DESPUÉS de los bloques base de game.js. No añade daño
// ni proyectiles nuevos; todo ataque lleva telegraph (e.telegraph=true).
export const CHISPIN_AI_IDS = ["pez", "medusa", "anguila", "cangrejo"];
const sgn = (v) => (v < 0 ? -1 : 1);

export function updateChispinFoeAI(e, game, t, aiTarget) {
  if (!e || !CHISPIN_AI_IDS.includes(e.kind) || game?.paused) return false;
  if (e.kind === "pez") pez(e, game, aiTarget);
  else if (e.kind === "medusa") medusa(e);
  else if (e.kind === "anguila") anguila(e);
  else cangrejo(e, aiTarget);
  return true;
}

// Pez: banco + aviso de 14f antes del dash + aturdido 24f al acabar.
function pez(e, game, target) {
  if (e.dashSwim === 18 && !e.dashWind && !e._dashArmed) {
    e._dashVx = e.vx; e.dashWind = 14; e.dashSwim = 0; e.vx *= 0.1;
  }
  if (e.dashWind > 0) {
    e.dashWind--; e.telegraph = true; e.vx *= 0.6;
    if (e.dashWind === 0) { e.telegraph = false; e._dashArmed = true; e.dashSwim = 18; e.vx = e._dashVx || sgn((target?.x ?? e.x) - e.x) * 4.4; }
    return;
  }
  if (e._dashArmed && e.dashSwim <= 0) { e._dashArmed = false; e.dazed = 24; }
  if (e.dazed > 0) { e.dazed--; e.vx *= 0.8; e.telegraph = false; return; }
  // banco: alinear con compañeros cercanos (máx 6 vecinos)
  const list = game?.enemies || [];
  let sx = 0, n = 0;
  for (let i = 0; i < list.length && n < 6; i++) {
    const o = list[i];
    if (o === e || o.kind !== "pez" || o.dead) continue;
    if (Math.abs(o.x - e.x) < 160 && Math.abs(o.y - e.y) < 90) { sx += o.vx; n++; }
  }
  if (n) e.vx += (sx / n - e.vx) * 0.05;
}

// Medusa: deriva vertical más marcada y anillo eléctrico visual durante el aviso.
function medusa(e) {
  e.baseY = (e.baseY ?? e.y);
  e.y += Math.sin((e.bob || 0) * 0.5) * 0.6;
  if (e.pulsezap > 8) e.ringT = (32 - e.pulsezap) / 24; // 0→1 crece el anillo
  else e.ringT = 0;
}

// Anguila: escondida en su grieta entre descargas, asoma al avisar.
function anguila(e) {
  const resting = !(e.pulsezap > 0) && (e.zapCd || 0) > 30;
  e.hidden = resting;
  e.peek = e.pulsezap > 0 ? Math.min(1, (e.peek || 0) + 0.15) : Math.max(0, (e.peek || 0) - 0.08);
  if (resting) e.vx *= 0.9;
  if (e.telegraph && e.aimDx != null) e.lineAim = Math.atan2(e.aimDy, e.aimDx);
  else e.lineAim = null;
}

// Cangrejo: anda de lado y para de frente con las pinzas.
function cangrejo(e, target) {
  if (!target) return;
  e.guardDir = sgn(target.x - e.x);
  e.sideStep = (e.sideStep || 0) + 1;
  if (!(e.clawWind > 0) && !(e.clawSnap > 0)) e.vx += Math.sin(e.sideStep * 0.08) * 0.12;
  e.guarding = !!e.claws && !(e.clawSnap > 0);
}

// Para el daño AL cangrejo: true si el golpe entra por delante y no desde arriba.
// Sugerencia: si devuelve true, golpe ×0.35 + chispa. (Cambia HP efectivo: decide Ohana.)
export function chispinFoeBlocks(e, hitX, fromAbove) {
  if (!e || e.kind !== "cangrejo" || !e.guarding || fromAbove) return false;
  return sgn(hitX - (e.x + (e.w || 0) / 2)) === e.guardDir;
}
