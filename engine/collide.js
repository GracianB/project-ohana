// Colisión AABB contra plataformas.
// h <= 24: suelo de un sentido (se pisa desde arriba, se atraviesa al subir).
// h > 24: bloque sólido (arriba, abajo y lados).

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function validPlatform(p) {
  return p && [p.x,p.y,p.w,p.h].every(Number.isFinite) && p.w > 0 && p.h > 0;
}

function overlapX(body, plat, inset) {
  const m = inset || 0;
  return body.x + body.w > plat.x + m && body.x < plat.x + plat.w - m;
}

export function hitsSolid(body, platforms, previous) {
  for (const plat of platforms || []) {
    if (!validPlatform(plat) || plat.h <= 24) continue;
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
    if (!validPlatform(plat)) continue;
    const thin = plat.h <= 24;
    if (thin && o.solidsOnly) continue;
    if (thin) {
      if (o.drop || (o.dropThroughY != null && plat.y <= o.dropThroughY)) continue;
      if ((body.vy || 0) < 0) continue;
      // A one-way ledge can only catch a player whose PREVIOUS feet
      // were above the surface. Never snap a player climbing from below.
      const previousFeet = prevY + body.h;
      const currentFeet = body.y + body.h;
      if (previousFeet > plat.y + 2 || currentFeet < plat.y - 1) continue;
      if (!overlapX(body, plat, 1)) continue;
      if (currentFeet >= plat.y - 1) {
        body.y = plat.y - body.h;
        body.vy = Math.min(0, body.vy || 0);
        grounded = true;
        hitY = 1;
      }
      continue;
    }
    // Test overlap at the instant a face is crossed. Combining independent
    // swept X/Y ranges invents collisions on diagonal near misses.
    const dx = body.x - prevX;
    const dy = body.y - prevY;
    const crossing = (distance, delta) => delta === 0 ? null : distance / delta;
    const inStep = time => time !== null && time >= 0 && time <= 1;
    const leftTime = crossing(plat.x - body.w - prevX, dx);
    const rightTime = crossing(plat.x + plat.w - prevX, dx);
    const sideTime = dx > 0 ? leftTime : rightTime;
    const sideY = prevY + dy * sideTime;
    const sideHit = inStep(sideTime) && sideY + body.h > plat.y + 6 && sideY < plat.y + plat.h - 6;
    const topTime = crossing(plat.y - body.h - prevY, dy);
    const bottomTime = crossing(plat.y + plat.h - prevY, dy);
    const verticalTime = dy >= 0 ? topTime : bottomTime;
    const verticalX = prevX + dx * verticalTime;
    const verticalHit = inStep(verticalTime) && verticalX + body.w > plat.x + 2 && verticalX < plat.x + plat.w - 2;
    if (sideHit && (!verticalHit || sideTime < verticalTime)) {
      body.x = dx > 0 ? plat.x - body.w : plat.x + plat.w;
      if (dx * (body.vx || 0) > 0) body.vx = 0;
      hitX = dx > 0 ? -1 : 1;
    }
    if (verticalHit && (!sideHit || verticalTime <= sideTime)) {
      body.y = dy >= 0 ? plat.y - body.h : plat.y + plat.h;
      body.vy = 0;
      grounded = dy >= 0;
      hitY = dy >= 0 ? 1 : -1;
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
