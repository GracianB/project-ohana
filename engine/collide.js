// Colisión AABB contra plataformas.
// h <= 24: suelo de un sentido (se pisa desde arriba, se atraviesa al subir).
// h > 24: bloque sólido (arriba, abajo y lados).

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function overlapX(body, plat, inset) {
  const m = inset || 0;
  return body.x + body.w > plat.x + m && body.x < plat.x + plat.w - m;
}

export function hitsSolid(body, platforms) {
  for (const plat of platforms || []) {
    if (plat.h <= 24) continue;
    if (aabb(body, plat)) return plat;
  }
  return null;
}

export function resolveBody(body, platforms, opts) {
  const o = opts || {};
  const prevX = o.prevX != null ? o.prevX : body.x;
  const prevY = o.prevY != null ? o.prevY : body.y;
  const drop = !!o.drop;
  let grounded = false;
  let hitX = 0;
  let hitY = 0;
  for (const plat of platforms || []) {
    const thin = plat.h <= 24;
    if (thin && o.solidsOnly) continue;
    if (thin) {
      if (o.drop || (o.dropThroughY != null && plat.y <= o.dropThroughY)) continue;
      if ((body.vy || 0) < 0) continue;
      const wasAbove = prevY + body.h <= plat.y + 6;
      if (!wasAbove && body.y + body.h > plat.y + 10) continue;
      if (!overlapX(body, plat, 1)) continue;
      if (body.y + body.h >= plat.y - 1) {
        body.y = plat.y - body.h;
        body.vy = Math.min(0, body.vy || 0);
        grounded = true;
        hitY = 1;
      }
      continue;
    }
    const yBand = body.y + body.h > plat.y + 6 && body.y < plat.y + plat.h - 6;
    if (yBand && overlapX(body, plat, 0)) {
      const fromLeft = prevX + body.w <= plat.x + 1;
      const fromRight = prevX >= plat.x + plat.w - 1;
      if (fromLeft) {
        body.x = plat.x - body.w;
        if ((body.vx || 0) > 0) body.vx = 0;
        hitX = -1;
      } else if (fromRight) {
        body.x = plat.x + plat.w;
        if ((body.vx || 0) < 0) body.vx = 0;
        hitX = 1;
      }
    }
    if (!overlapX(body, plat, 2)) continue;
    if (body.y + body.h <= plat.y || body.y >= plat.y + plat.h) continue;
    const fromTop = prevY + body.h <= plat.y + 4 || ((body.vy || 0) >= 0 && body.y + body.h - plat.y < 18);
    const fromBot = prevY >= plat.y + plat.h - 4;
    if (fromTop && !fromBot) {
      body.y = plat.y - body.h;
      body.vy = Math.min(0, body.vy || 0);
      grounded = true;
      hitY = 1;
    } else if (fromBot) {
      body.y = plat.y + plat.h;
      if ((body.vy || 0) < 0) body.vy = 0;
      hitY = -1;
    }
  }
  return { grounded, hitX, hitY };
}
