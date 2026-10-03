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

export function hitsSolid(body, platforms, previous) {
  for (const plat of platforms || []) {
    if (plat.h <= 24) continue;
    if (aabb(body, plat)) return plat;
    if (previous) {
      const start = { x: previous.x, y: previous.y, w: body.w, h: body.h };
      if (aabb(start, plat) || sweptAabb(start, body, plat)) return plat;
    }
  }
  return null;
}

function sweepAxis(start, size, delta, min, max) {
  if (delta === 0) return start + size > min && start < max ? [-Infinity, Infinity] : null;
  if (delta > 0) return [(min - start - size) / delta, (max - start) / delta];
  return [(max - start) / delta, (min - start - size) / delta];
}

function sweptAabb(start, end, target) {
  const x = sweepAxis(start.x, start.w, end.x - start.x, target.x, target.x + target.w);
  const y = sweepAxis(start.y, start.h, end.y - start.y, target.y, target.y + target.h);
  if (!x || !y) return false;
  const entry = Math.max(x[0], y[0]);
  const exit = Math.min(x[1], y[1]);
  return entry <= exit && entry >= 0 && entry <= 1 && exit >= 0;
}

export function resolveBody(body, platforms, opts) {
  const o = opts || {};
  const prevX = o.prevX != null ? o.prevX : body.x;
  const prevY = o.prevY != null ? o.prevY : body.y;
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
    const crossedLeft = prevX + body.w <= plat.x + 1 && body.x + body.w > plat.x;
    const crossedRight = prevX >= plat.x + plat.w - 1 && body.x < plat.x + plat.w;
    const sweptTop = Math.min(prevY, body.y);
    const sweptBottom = Math.max(prevY + body.h, body.y + body.h);
    const yBand = body.y + body.h > plat.y + 6 && body.y < plat.y + plat.h - 6;
    const crossedVertically = sweptBottom > plat.y + 6 && sweptTop < plat.y + plat.h - 6;
    if ((yBand || crossedVertically) && (overlapX(body, plat, 0) || crossedLeft || crossedRight)) {
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
    const sweptLeft = Math.min(prevX, body.x);
    const sweptRight = Math.max(prevX + body.w, body.x + body.w);
    const sweptX = sweptRight > plat.x + 2 && sweptLeft < plat.x + plat.w - 2;
    const crossedTop = (body.vy || 0) >= 0 && prevY + body.h <= plat.y + 4 && body.y + body.h >= plat.y;
    if (crossedTop && sweptX) {
      body.y = plat.y - body.h;
      body.vy = Math.min(0, body.vy || 0);
      grounded = true;
      hitY = 1;
      continue;
    }
    const crossedBottom = (body.vy || 0) < 0 && prevY >= plat.y + plat.h - 4 && body.y <= plat.y + plat.h;
    if (crossedBottom && sweptX) {
      body.y = plat.y + plat.h;
      body.vy = 0;
      hitY = -1;
      continue;
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
