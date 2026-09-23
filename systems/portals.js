/**
 * Ohana Portales — catapultas y agujeros negros (feel premium).
 * API: spawnFromRoom, update, draw, tryUse, consume, armArrival, abortTrip, spawnPoint
 * Extra: arrivalKick, getOverlay, isBusy, playerVisual
 * No toca enemies / roster / worlds / rain / death-fx.
 */

import { ROOMS } from "./map.js";
import { showNotification } from "./notify.js";

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Hitbox generosa para catapulta (E / pisar). */
function catapultPad(portal) {
  return {
    x: portal.x - 14,
    y: portal.y - 28,
    w: portal.w + 28,
    h: portal.h + 36
  };
}

function destNeedEvo(dest) {
  const r = ROOMS[dest];
  return r && r.needEvo != null ? r.needEvo : null;
}

function isDestLocked(dest, evo) {
  const need = destNeedEvo(dest);
  return need != null && (evo || 0) < need;
}

function makePortal(def) {
  const type = def.type === "blackhole" ? "blackhole" : "catapult";
  const w = def.w != null ? def.w : type === "blackhole" ? 72 : 96;
  const h = def.h != null ? def.h : type === "blackhole" ? 72 : 32;
  return {
    type,
    x: def.x,
    y: def.y,
    w,
    h,
    dest: def.dest,
    label: def.label || def.dest || "?",
    needEvo: def.needEvo,
    // anim state per portal
    armAng: type === "catapult" ? -0.42 : 0,
    armVel: 0,
    swallow: 0, // destello al tragar (BH)
    sparkT: 0
  };
}

/** Partículas orbitales locales (BH). */
function spawnOrbitals(portal, n) {
  const out = [];
  const cx = portal.x + portal.w / 2;
  const cy = portal.y + portal.h / 2;
  const r = Math.min(portal.w, portal.h) * 0.42;
  for (let i = 0; i < n; i++) {
    out.push({
      portal,
      a: Math.random() * Math.PI * 2,
      r: r * (0.45 + Math.random() * 0.7),
      speed: 0.04 + Math.random() * 0.06,
      size: 1.2 + Math.random() * 2.2,
      life: 40 + Math.random() * 80,
      max: 80,
      z: Math.random()
    });
  }
  return out;
}

export class Portals {
  constructor() {
    this.items = [];
    this.cooldown = 0;
    this.pending = null;
    this.near = null;
    this.prompt = "";
    this.charge = null; // { portal, type, t, max }
    this.orbitals = [];
    this._overlay = null; // { alpha, color } durante viaje
    this._kick = null; // { vx, vy, facing } post-aterrizaje
    this._visual = { scale: 1, alpha: 1 }; // flags para game.js
    this._lockNotifyCD = 0;
  }

  spawnFromRoom(room) {
    this.items = ((room && room.portals) || []).map(makePortal);
    this.near = null;
    this.prompt = "";
    this.charge = null;
    this.orbitals = [];
    this._visual = { scale: 1, alpha: 1 };
    // Orbitals por cada BH
    for (const p of this.items) {
      if (p.type === "blackhole") {
        this.orbitals.push(...spawnOrbitals(p, 14));
      }
    }
  }

  landingPad() {
    if (!this.items.length) return null;
    return this.items[0];
  }

  /** Evita reentrada inmediata al aterrizar. */
  armArrival() {
    this.cooldown = 110;
    this.pending = null;
    this.near = null;
    this.charge = null;
    this._visual = { scale: 1, alpha: 1 };
    this._overlay = null;
    this._kick = null;
  }

  /**
   * Abort de viaje fallido (loadRoom false tras consume).
   * Resetea visual/overlay/charge y empuja al player fuera del portal.
   */
  abortTrip(game) {
    const p = game && game.player;
    let pad = this.near;
    this.pending = null;
    this.charge = null;
    this._visual = { scale: 1, alpha: 1 };
    this._overlay = null;
    this._kick = null;
    this.cooldown = 90;
    this.prompt = "";
    this.near = null;
    if (!p) return;
    if (!pad) {
      pad =
        this.items.find((it) =>
          it.type === "blackhole" ? overlaps(p, it) : overlaps(p, catapultPad(it))
        ) || this.items[0];
    }
    if (!pad) return;
    const mid = pad.x + pad.w / 2;
    const px = p.x + p.w / 2;
    const side = px >= mid ? 1 : -1;
    p.x = side > 0 ? pad.x + pad.w + 40 : pad.x - p.w - 40;
    const ww = game.worldW || 1600;
    p.x = Math.max(24, Math.min(p.x, ww - p.w - 24));
    p.vx = 0;
    p.vy = 0;
    if (typeof game.snapToFloor === "function") game.snapToFloor(p);
  }

  /** Spawn desplazado para no solapar el portal. */
  spawnPoint(playerW, playerH) {
    const pad = this.landingPad();
    if (!pad) return null;
    const w = playerW || 24, h = playerH || 32;
    if (pad.type === "blackhole") {
      // Empuja hacia el lado opuesto al centro de la sala (+48px lateral)
      const mid = pad.x + pad.w / 2;
      const side = mid < 800 ? 1 : -1;
      return { x: pad.x + (side > 0 ? pad.w + 48 : -w - 48), y: pad.y + pad.h / 2 - h / 2 };
    }
    // Catapulta: encima de la base, offset mayor para no solapar hitbox
    const facing = pad.dest === "hub" ? 1 : -1;
    return { x: pad.x + pad.w / 2 - w / 2 + facing * 24, y: pad.y - h - 12 };
  }

  /** Impulso sugerido al aterrizar (game.js aplica vx/vy). */
  arrivalKick() {
    const k = this._kick;
    this._kick = null;
    return k;
  }

  /** Tint del fade (púrpura BH / ámbar catapulta). */
  getOverlay() {
    return this._overlay;
  }

  /** Alias pedido en spec. */
  overlayTint() {
    return this._overlay;
  }

  isBusy() {
    return !!(this.pending || this.charge);
  }

  /** Escala/alpha del player durante absorb / wind-up. */
  playerVisual() {
    return this._visual;
  }

  update(game) {
    if (this.cooldown > 0) this.cooldown--;
    if (this._lockNotifyCD > 0) this._lockNotifyCD--;
    this.near = null;
    this.prompt = "";

    const reduce = !!(game && game.reduceMotion);
    const p = game && game.player;
    if (!p || p.dead) {
      // Evitar soft-lock: charge/pending/visual no se limpian si el player muere mid-viaje
      if (this.charge || this.pending) {
        this.charge = null;
        this.pending = null;
        this._visual = { scale: 1, alpha: 1 };
        this._overlay = null;
        this.cooldown = Math.max(this.cooldown, 40);
      }
      this._tickOrbitals(reduce);
      this._springArms(null, reduce);
      return;
    }

    // Charge en curso: no buscar near nuevo
    if (this.charge) {
      // Safety delegate: _tickCharge fuerza queue si t > max+30
      this._tickCharge(game, reduce);
      this._tickOrbitals(reduce);
      this._springArms(this.charge ? this.charge.portal : null, reduce);
      return;
    }

    if (this.pending) {
      this._tickOrbitals(reduce);
      this._springArms(null, reduce);
      return;
    }

    const evo = p.evo || 0;
    let closestBH = null;
    let closestDist = Infinity;

    for (const portal of this.items) {
      const cx = portal.x + portal.w / 2;
      const cy = portal.y + portal.h / 2;
      const pr = Math.min(portal.w, portal.h) * 0.5;
      const px = p.x + p.w / 2;
      const py = p.y + p.h / 2;
      const d = Math.hypot(px - cx, py - cy);

      if (portal.type === "blackhole") {
        // Pull suave en radio ~1.6×
        const pullR = pr * 1.6;
        if (d < pullR && d > 2 && this.cooldown <= 0) {
          if (d < closestDist) {
            closestDist = d;
            closestBH = portal;
          }
          const locked = isDestLocked(portal.dest, evo);
          if (!locked) {
            const strength = (1 - d / pullR) * (reduce ? 0.12 : 0.28);
            p.vx += ((cx - px) / Math.max(d, 1)) * strength;
            p.vy += ((cy - py) / Math.max(d, 1)) * strength * 0.85;
            // Chispas de atracción ocasionales
            if (!reduce && game.fx && Math.random() < 0.18) {
              game.fx.emit(px, py, {
                color: "#c9a0ff",
                count: 1,
                size: 1.6,
                up: 0.3,
                speed: 0.8,
                life: 10
              });
            }
          }
        }

        if (overlaps(p, portal)) {
          this.near = portal;
          const locked = isDestLocked(portal.dest, evo);
          if (locked) {
            const need = destNeedEvo(portal.dest);
            this.prompt = "◉ Agujero · " + portal.label + " · Forma " + (need + 1);
            this._maybeLockNotify(portal, need);
          } else {
            this.prompt = "◉ Agujero · " + portal.label;
            if (this.cooldown <= 0) this._beginCharge(portal, "blackhole", reduce);
          }
          break;
        }
      } else {
        // Catapulta: hitbox generosa (E / pisar)
        const pad = catapultPad(portal);
        if (overlaps(p, pad)) {
          this.near = portal;
          const locked = isDestLocked(portal.dest, evo);
          if (locked) {
            const need = destNeedEvo(portal.dest);
            this.prompt = "⚔ Catapulta · Forma " + (need + 1);
            this._maybeLockNotify(portal, need);
          } else {
            this.prompt = "⚔ Catapulta → " + portal.label + " · E o párate encima";
            // Auto-lanzamiento al pisar (grounded); cooldown bloquea re-absorción
            if (this.cooldown <= 0 && p.grounded) {
              this._beginCharge(portal, "catapult", reduce);
            }
          }
          break;
        }
      }
    }

    // Idle spring brazos + orbitals
    this._tickOrbitals(reduce);
    this._springArms(null, reduce);

    // Decay swallow flash
    for (const portal of this.items) {
      if (portal.swallow > 0) portal.swallow--;
      if (portal.sparkT > 0) portal.sparkT--;
    }
  }

  _maybeLockNotify(portal, need) {
    if (this._lockNotifyCD > 0) return;
    this._lockNotifyCD = 90;
    try {
      showNotification("CERRADO", "Necesitas forma " + (need + 1) + " · " + (portal.label || ""));
    } catch (_) {}
  }

  _beginCharge(portal, type, reduce) {
    if (!portal || !portal.dest) return;
    const max =
      type === "blackhole"
        ? reduce
          ? 12
          : 18 + Math.floor(Math.random() * 11) // 18–28
        : reduce
          ? 6
          : 10 + Math.floor(Math.random() * 5); // 10–14
    this.charge = { portal, type, t: 0, max };
    this._visual = { scale: 1, alpha: 1 };
    if (type === "catapult") {
      portal.armVel = -0.18; // tensar
      portal.sparkT = max;
    }
  }

  _tickCharge(game, reduce) {
    const c = this.charge;
    if (!c) return;
    const p = game.player;
    const portal = c.portal;
    c.t++;
    // Abort de seguridad: charge colgado → forzar queue (no dejar player invisible)
    if (c.t > c.max + 30) {
      this._overlay = this._overlay || {
        alpha: 0.7,
        color: c.type === "blackhole" ? "90,40,160" : "255,160,60"
      };
      this._kick = this._kick || this._makeKick(portal, c.type);
      if (c.type === "blackhole") portal.swallow = 18;
      this._queue(portal);
      this.charge = null;
      this._visual = { scale: 1, alpha: 1 };
      return;
    }
    const k = Math.min(1, c.t / Math.max(1, c.max)); // 0→1

    this.near = portal;
    if (c.type === "blackhole") {
      this.prompt = "◉ Absorbiendo…";
      const cx = portal.x + portal.w / 2;
      const cy = portal.y + portal.h / 2;
      const px = p.x + p.w / 2;
      const py = p.y + p.h / 2;
      // Atracción fuerte durante absorb
      p.vx += (cx - px) * 0.08;
      p.vy += (cy - py) * 0.08;
      p.x += (cx - p.w / 2 - p.x) * 0.12;
      p.y += (cy - p.h / 2 - p.y) * 0.12;
      this._visual = {
        scale: Math.max(0.15, 1 - k * 0.9),
        alpha: Math.max(0.05, 1 - k * 0.95)
      };
      if (!reduce && game.fx && c.t % 2 === 0) {
        game.fx.emit(cx, cy, {
          color: "#a070ff",
          count: 2,
          size: 2.5,
          up: 0.6,
          speed: 2.2,
          life: 14
        });
      }
      if (c.t >= c.max) {
        portal.swallow = 18;
        this._overlay = { alpha: 0.85, color: "90,40,160" };
        this._kick = this._makeKick(portal, "blackhole");
        this._queue(portal);
        this.charge = null;
        this._visual = { scale: 0.2, alpha: 0.1 };
        if (game.fx) {
          game.fx.emit(cx, cy, {
            color: "#e0c0ff",
            count: reduce ? 10 : 28,
            size: 5,
            up: 1.6,
            speed: 3.5,
            life: 20,
            star: true
          });
        }
      }
    } else {
      // Catapulta wind-up
      this.prompt = "⚔ ¡Lanzando!";
      // Mantener al player sobre la base
      const tx = portal.x + portal.w * 0.55 - p.w / 2;
      const ty = portal.y - p.h - 2;
      p.x += (tx - p.x) * 0.25;
      p.y += (ty - p.y) * 0.25;
      p.vx *= 0.5;
      p.vy = Math.min(p.vy, 0);
      portal.armAng += portal.armVel;
      portal.armVel *= 0.92;
      // Tensar hacia atrás
      const target = -0.95;
      portal.armAng += (target - portal.armAng) * 0.2;
      this._visual = { scale: 1 + k * 0.06, alpha: 1 };
      if (!reduce && game.fx && c.t % 3 === 0) {
        game.fx.emit(portal.x + portal.w * 0.7, portal.y, {
          color: "#ffc078",
          count: 2,
          size: 2,
          up: 1.4,
          speed: 2,
          life: 12
        });
      }
      if (c.t >= c.max) {
        // Snap del brazo
        portal.armVel = 0.45;
        portal.armAng = -0.15;
        this._overlay = { alpha: 0.7, color: "255,160,60" };
        this._kick = this._makeKick(portal, "catapult");
        this._queue(portal);
        this.charge = null;
        if (game.fx) {
          game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, {
            color: "#ffe0a0",
            count: reduce ? 8 : 20,
            size: 3.5,
            up: 2.4,
            speed: 4,
            life: 16
          });
        }
      }
    }
  }

  _makeKick(portal, type) {
    // Facing hacia el centro de la sala destino aproximado
    const mid = portal.x + portal.w / 2;
    const facing = mid < 800 ? 1 : -1;
    if (type === "blackhole") {
      return { vx: facing * 2.4, vy: -3.2, facing };
    }
    return { vx: facing * 5.5, vy: -7.5, facing };
  }

  _queue(portal) {
    if (!portal || !portal.dest) {
      this._visual = { scale: 1, alpha: 1 };
      this._overlay = null;
      this.cooldown = Math.max(this.cooldown, 40);
      return;
    }
    this.pending = {
      dest: portal.dest,
      from: "portal",
      type: portal.type,
      label: portal.label,
      tint: portal.type === "blackhole" ? "90,40,160" : "255,160,60"
    };
    this.cooldown = 56;
  }

  /**
   * Catapulta: tecla E. Devuelve true si inició charge o bloqueó evolve (locked).
   * BH se auto-activa en update.
   */
  tryUse(player, game) {
    if (!player || player.dead || this.pending || this.charge || this.cooldown > 0) return false;
    const portal = this.near;
    if (!portal || portal.type !== "catapult") return false;
    const pad = catapultPad(portal);
    if (!overlaps(player, pad)) return false;

    const evo = player.evo || 0;
    if (isDestLocked(portal.dest, evo)) {
      const need = destNeedEvo(portal.dest);
      this._maybeLockNotify(portal, need);
      return true; // consumir E, no evolucionar
    }

    const reduce = !!(game && game.reduceMotion);
    this._beginCharge(portal, "catapult", reduce);
    return true;
  }

  /** Consume viaje pendiente (una vez). */
  consume() {
    const trip = this.pending;
    this.pending = null;
    return trip;
  }

  _tickOrbitals(reduce) {
    const step = reduce ? 0.5 : 1;
    for (const o of this.orbitals) {
      o.a += o.speed * step;
      o.life -= step;
      if (o.life <= 0) {
        o.life = o.max;
        o.a = Math.random() * Math.PI * 2;
        o.r = Math.min(o.portal.w, o.portal.h) * (0.35 + Math.random() * 0.55) * 0.5;
      }
    }
  }

  _springArms(_focus, reduce) {
    for (const portal of this.items) {
      if (portal.type !== "catapult") continue;
      if (this.charge && this.charge.portal === portal) continue;
      // Idle angular spring
      const idle = -0.35 + Math.sin((performance.now() || 0) / 420) * 0.08;
      const k = reduce ? 0.08 : 0.14;
      portal.armVel += (idle - portal.armAng) * k;
      portal.armVel *= 0.86;
      portal.armAng += portal.armVel;
    }
  }

  draw(ctx, cam, t) {
    if (!ctx || !cam) return;
    for (const portal of this.items) {
      if (portal.type === "blackhole") drawBlackhole(ctx, cam, t, portal, this.orbitals, this.charge);
      else drawCatapult(ctx, cam, t, portal, this.charge);
    }
  }
}

/* ─── Visuales ─────────────────────────────────────────── */

function drawCatapult(ctx, cam, t, portal, charge) {
  const x = portal.x - cam.x;
  const y = portal.y - cam.y;
  const charging = charge && charge.portal === portal;
  const pulse = 0.5 + Math.sin(t / 9) * 0.22 + (charging ? 0.25 : 0);

  ctx.save();
  // Sombra
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.ellipse(x + portal.w / 2, y + portal.h + 4, portal.w * 0.42, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base madera (plataforma + patas)
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(x + 6, y + 14, portal.w - 12, portal.h - 10);
  ctx.fillStyle = "#5c3a1e";
  ctx.fillRect(x + 4, y + 10, portal.w - 8, 10);
  // Vetas
  ctx.strokeStyle = "rgba(20,10,0,.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 10 + i * 28, y + 12);
    ctx.lineTo(x + 18 + i * 28, y + 18);
    ctx.stroke();
  }
  // Pivote
  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.arc(x + portal.w * 0.28, y + 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a06a";
  ctx.beginPath();
  ctx.arc(x + portal.w * 0.28, y + 12, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Brazo con spring
  const ang = portal.armAng != null ? portal.armAng : -0.35 + Math.sin(t / 14) * 0.08;
  ctx.save();
  ctx.translate(x + portal.w * 0.28, y + 12);
  ctx.rotate(ang);
  // Madera del brazo
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(0, -6, portal.w * 0.58, 12);
  ctx.fillStyle = "#a8723a";
  ctx.fillRect(2, -4, portal.w * 0.54, 4);
  // Cubo / piedra
  const bx = portal.w * 0.58;
  ctx.fillStyle = charging ? "#e8c898" : "#9a9aaa";
  ctx.fillRect(bx - 8, -11, 18, 18);
  ctx.fillStyle = charging ? "#fff0c8" : "#c8c8d0";
  ctx.fillRect(bx - 5, -8, 8, 6);
  // Glow ámbar en la piedra
  if (charging || portal.sparkT > 0) {
    ctx.shadowColor = "rgba(255,180,60,.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(255,200,100,.55)";
    ctx.beginPath();
    ctx.arc(bx + 1, -2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Glow perímetro
  ctx.shadowColor = "rgba(255,180,80," + pulse + ")";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "rgba(255,200,120," + (0.45 + pulse * 0.4) + ")";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 4, portal.w - 2, portal.h + 2);
  ctx.shadowBlur = 0;

  // Label
  ctx.font = "800 11px Outfit, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe8c8";
  ctx.fillText("⚔ " + (portal.label || "Catapulta"), x + portal.w / 2, y - 8);
  ctx.restore();
}

function drawBlackhole(ctx, cam, t, portal, orbitals, charge) {
  const cx = portal.x + portal.w / 2 - cam.x;
  const cy = portal.y + portal.h / 2 - cam.y;
  const r = Math.min(portal.w, portal.h) * 0.48;
  const spin = t / 16;
  const charging = charge && charge.portal === portal;
  const swallow = portal.swallow || 0;
  const pulse = 0.55 + Math.sin(t / 7) * 0.2 + (charging ? 0.3 : 0) + swallow * 0.04;

  ctx.save();

  // Halo exterior púrpura
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.55);
  g.addColorStop(0, "rgba(30,5,50,.98)");
  g.addColorStop(0.35, "rgba(100,40,180," + (0.5 + pulse * 0.2) + ")");
  g.addColorStop(0.7, "rgba(60,20,120,.25)");
  g.addColorStop(1, "rgba(20,0,40,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
  ctx.fill();

  // Anillos de acreción elípticos (3–4)
  for (let i = 0; i < 4; i++) {
    const rr = r * (0.48 + i * 0.2);
    const a = 0.28 + Math.sin(t / 8 + i * 1.1) * 0.14 + (charging ? 0.15 : 0);
    ctx.strokeStyle = "rgba(" + (150 + i * 28) + "," + (70 + i * 35) + ",255," + a + ")";
    ctx.lineWidth = 2.8 - i * 0.45;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr, rr * (0.38 + i * 0.02), spin + i * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Partículas orbitales
  if (orbitals) {
    for (const o of orbitals) {
      if (o.portal !== portal) continue;
      const ox = cx + Math.cos(o.a) * o.r;
      const oy = cy + Math.sin(o.a) * o.r * 0.42;
      const lifeA = Math.min(1, o.life / 20) * (0.45 + o.z * 0.55);
      ctx.globalAlpha = lifeA;
      ctx.fillStyle = o.z > 0.5 ? "#e8d0ff" : "#a070ff";
      ctx.beginPath();
      ctx.arc(ox, oy, o.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Núcleo
  const coreR = r * (0.32 + (charging ? 0.08 * (charge.t / charge.max) : 0));
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  core.addColorStop(0, "#000");
  core.addColorStop(0.6, "#0a0218");
  core.addColorStop(1, "#1a0830");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(210,170,255," + (0.55 + pulse * 0.3) + ")";
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Destello al tragar
  if (swallow > 0) {
    const sa = swallow / 18;
    ctx.globalAlpha = sa * 0.85;
    ctx.fillStyle = "#f0e0ff";
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.6 + (1 - sa) * 1.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Label
  ctx.font = "800 11px Outfit, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#e8d6ff";
  ctx.fillText("◉ " + (portal.label || "Agujero"), cx, cy - r - 12);
  ctx.restore();
}

export const portals = new Portals();
