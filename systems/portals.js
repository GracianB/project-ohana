/**
 * Ohana Portales — catapultas y agujeros negros (feel premium).
 * API: spawnFromRoom, update, draw, tryUse, consume, armArrival, abortTrip, spawnPoint
 * Extra: arrivalKick, getOverlay, isBusy, playerVisual
 * No toca enemies / roster / worlds / rain / death-fx.
 */

import { ROOMS } from "./map.js";
import { showNotification } from "./notify.js";
import { traversalProfile, traversalNodeSnapshot } from "./traversal-nodes.js";

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
    roomId: def.roomId || "",
    x: def.x,
    y: def.y,
    w,
    h,
    dest: def.dest,
    label: def.label || def.dest || "?",
    needEvo: def.needEvo,
    armAng: type === "catapult" ? -0.42 : 0,
    armVel: 0,
    swallow: 0, // destello al tragar (BH)
    sparkT: 0
  };
}

/** Partículas orbitales locales (BH). */
function unit(seed) {
  const x = Math.sin(Number(seed) * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function spawnOrbitals(portal, n, seedBase = 0) {
  const out = [];
  const r = Math.min(portal.w, portal.h) * 0.48;
  for (let i = 0; i < n; i++) {
    out.push({
      portal,
      seed: seedBase + i * 17.17,
      cycle: 0,
      a: unit(seedBase + i * 17.17 + 1) * Math.PI * 2,
      r: r * (0.4 + unit(seedBase + i * 17.17 + 2) * 0.85),
      speed: 0.05 + unit(seedBase + i * 17.17 + 3) * 0.08,
      size: 1.6 + unit(seedBase + i * 17.17 + 4) * 2.8,
      life: 50 + unit(seedBase + i * 17.17 + 5) * 90,
      max: 100,
      z: unit(seedBase + i * 17.17 + 6)
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
    this._simT = 0;
    this.trailTicks = 0; // estela post-aterrizaje
    this.trailType = null; // "catapult" | "blackhole" | "water"
    this.trailColor = null; // override (ej. cyan agua en reef)
    this._landingType = null;
    this._groundGrace = 0; // auto-fire catapult: grounded este frame o el anterior
    this._arrivePreferDest = null; // al aterrizar, preferir pad que vuelve al origen
  }

  spawnFromRoom(room) {
    const roomId = room?.id || "";
    this.items = ((room && room.portals) || []).map((def) => makePortal({ ...def, roomId }));
    this.near = null;
    this.prompt = "";
    this.charge = null;
    this.orbitals = [];
    this._visual = { scale: 1, alpha: 1 };
    this.trailTicks = 0;
    this.trailType = null;
    this.trailColor = null;
    this._groundGrace = 0;
    this._simT = 0;
    // Orbitals deterministas: misma sala + mismo portal = misma distribución visual.
    this.items.forEach((p, i) => {
      if (p.type === "blackhole") {
        const seedBase = p.x * 0.13 + p.y * 0.17 + p.w * 0.19 + i * 101;
        this.orbitals.push(...spawnOrbitals(p, 22, seedBase));
      }
    });
  }

  landingPad() {
    if (!this.items.length) return null;
    if (this._arrivePreferDest) {
      const match = this.items.find((it) => it.dest === this._arrivePreferDest);
      if (match) return match;
    }
    return this.items[0];
  }

  /** Evita reentrada inmediata al aterrizar. Marca trailTicks para estela. */
  armArrival() {
    this.cooldown = 110;
    this.pending = null;
    this.near = null;
    this.charge = null;
    this._visual = { scale: 1, alpha: 1 };
    this._overlay = null;
    this._kick = null;
    this.trailType = this._landingType || this.trailType || "catapult";
    this.trailTicks = this.trailType === "blackhole" ? 18 : 16;
    this.trailColor = null;
    this._landingType = null;
    this._arrivePreferDest = null;
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
    this.trailTicks = 0;
    this.trailType = null;
    this.trailColor = null;
    this._landingType = null;
    this._arrivePreferDest = null;
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
      const mid = pad.x + pad.w / 2;
      const side = mid < 800 ? 1 : -1;
      return { x: pad.x + (side > 0 ? pad.w + 48 : -w - 48), y: pad.y + pad.h / 2 - h / 2 };
    }
    const midC = pad.x + pad.w / 2;
    const facing = midC < 800 ? 1 : -1;
    return { x: pad.x + pad.w / 2 - w / 2 + facing * 24, y: pad.y - h - 12 };
  }

  /** Impulso sugerido al aterrizar (game.js aplica vx/vy). */
  arrivalKick() {
    const k = this._kick;
    this._kick = null;
    return k;
  }

  /** Tint del fade/charge: { alpha, color:"r,g,b", vignette? }. */
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
    this._simT = (Number.isFinite(Number(this._simT)) ? Number(this._simT) : 0) + 1;
    if (this.cooldown > 0) this.cooldown--;
    if (this._lockNotifyCD > 0) this._lockNotifyCD--;
    this.near = null;
    this.prompt = "";

    const reduce = !!(game && game.reduceMotion);
    if (this.trailTicks > 0) {
      this._emitLandingTrail(game, reduce);
      this.trailTicks--;
      if (this.trailTicks <= 0) {
        this.trailType = null;
        this.trailColor = null;
      }
    }
    const p = game && game.player;
    if (!p || p.dead) {
      if (this.charge || this.pending) {
        this.charge = null;
        this.pending = null;
        this._visual = { scale: 1, alpha: 1 };
        this._overlay = null;
        this.cooldown = Math.max(this.cooldown, 40);
      }
      if (this.trailTicks > 0) {
        this.trailTicks = 0;
        this.trailType = null;
        this.trailColor = null;
      }
      this._tickOrbitals(reduce);
      this._springArms(null, reduce);
      return;
    }

    if (this.charge) {
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
    const groundedOk = !!(p.grounded || this._groundGrace > 0);
    if (p.grounded) this._groundGrace = 1;
    else if (this._groundGrace > 0) this._groundGrace--;
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
        const pullR = pr * 1.6;
        if (d < pullR && d > 2 && this.cooldown <= 0) {
          if (d < closestDist) {
            closestDist = d;
            closestBH = portal;
          }
          const locked = isDestLocked(portal.dest, evo);
          if (!locked) {
            const profile = traversalProfile(portal.roomId, portal.dest, portal.type);
            const pullScale = Number(profile.pull) || 1;
            const twist = Number(profile.twist) || 0;
            const strength = (1 - d / pullR) * (reduce ? 0.12 : 0.28) * pullScale;
            const nx = (cx - px) / Math.max(d, 1);
            const ny = (cy - py) / Math.max(d, 1);
            p.vx += nx * strength + (-ny) * strength * 0.16 * twist;
            p.vy += ny * strength * 0.85 + nx * strength * 0.08 * twist;
            if (!reduce && game.fx && unit(this._simT + portal.x * 0.07 + portal.y * 0.11) < 0.18) {
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
            this.prompt = "◉ VÓRTICE · " + traversalProfile(portal.roomId, portal.dest, portal.type).label + " · bloqueado · Forma " + (need + 1);
            this._maybeLockNotify(portal, need);
          } else {
            this.prompt = "◉ VÓRTICE · " + traversalProfile(portal.roomId, portal.dest, portal.type).label + " · entra para viajar";
            if (this.cooldown <= 0) this._beginCharge(portal, "blackhole", reduce);
          }
          break;
        }
      } else {
        const pad = catapultPad(portal);
        if (overlaps(p, pad)) {
          this.near = portal;
          const locked = isDestLocked(portal.dest, evo);
          if (locked) {
            const need = destNeedEvo(portal.dest);
            this.prompt = "⚔ CATAPULTA · " + portal.label + " · bloqueada · Forma " + (need + 1);
            this._maybeLockNotify(portal, need);
          } else {
            this.prompt = "E · " + traversalProfile(portal.roomId, portal.dest, portal.type).label + " → " + portal.label;
          }
          break;
        }
      }
    }

    this._tickOrbitals(reduce);
    this._springArms(null, reduce);

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
          ? 14
          : 28 + Math.floor(unit(this._simT + portal.x * 0.17 + portal.y * 0.23) * 18) // 28–45
        : reduce
          ? 10
          : 20 + Math.floor(unit(this._simT + portal.x * 0.29 + portal.y * 0.31) * 17); // 20–36
    this.charge = { portal, type, t: 0, max, snapped: false, freezeLeft: 0 };
    this._visual = { scale: 1, alpha: 1 };
    this._overlay = {
      alpha: 0.08,
      color: type === "blackhole" ? "90,40,160" : "255,160,60",
      vignette: 0.1
    };
    if (type === "catapult") {
      portal.armVel = -0.28; // tensar fuerte
      portal.sparkT = max + 4;
    } else {
      portal.swallow = 0;
    }
  }

  _tickCharge(game, reduce) {
    const c = this.charge;
    if (!c) return;
    const p = game.player;
    const portal = c.portal;
    c.t++;
    if (c.t > c.max + 30) {
      this._overlay = this._overlay || {
        alpha: 0.75,
        color: c.type === "blackhole" ? "90,40,160" : "255,160,60",
        vignette: 0.45
      };
      this._kick = this._kick || this._makeKick(portal, c.type);
      if (c.type === "blackhole") portal.swallow = 22;
      this._queue(portal, game && game.roomId);
      this.charge = null;
      this._visual = { scale: 1, alpha: 1 };
      return;
    }
    const k = Math.min(1, c.t / Math.max(1, c.max)); // 0→1
    this.near = portal;

    if (game) {
      const shakeCap = reduce ? 4 : 14;
      const shakeTarget = reduce
        ? 1.2 + k * 2.5
        : c.type === "blackhole"
          ? 2.5 + k * 11
          : 2 + k * 12;
      game.shake = Math.min(shakeCap, Math.max(game.shake || 0, shakeTarget));
    }

    if (c.type === "blackhole") {
      this._tickBlackholeCharge(game, reduce, c, portal, p, k);
    } else {
      this._tickCatapultCharge(game, reduce, c, portal, p, k);
    }
  }

  _tickBlackholeCharge(game, reduce, c, portal, p, k) {
    this.prompt = "◉ Absorbiendo…";
    const cx = portal.x + portal.w / 2;
    const cy = portal.y + portal.h / 2;
    const px = p.x + p.w / 2;
    const py = p.y + p.h / 2;
    const pull = 0.1 + k * 0.2;
    const lerp = 0.14 + k * 0.22;
    p.vx += (cx - px) * pull;
    p.vy += (cy - py) * pull;
    p.x += (cx - p.w / 2 - p.x) * lerp;
    p.y += (cy - p.h / 2 - p.y) * lerp;
    this._visual = {
      scale: Math.max(0.08, 1 - k * 0.95),
      alpha: Math.max(0.04, 1 - k * 0.98)
    };
    const pulse = 0.5 + Math.sin(c.t * 0.45) * 0.5;
    this._overlay = {
      alpha: Math.min(0.88, 0.12 + k * 0.62 + pulse * 0.1 * k),
      color: "90,40,160",
      vignette: 0.15 + k * 0.55
    };
    if (game.fx) {
      const dens = reduce ? (c.t % 3 === 0) : true;
      if (dens) {
        const ang = c.t * 0.55;
        const rad = (1 - k) * 36 + 6;
        const sx = cx + Math.cos(ang) * rad;
        const sy = cy + Math.sin(ang) * rad * 0.55;
        game.fx.emit(sx, sy, {
          color: k > 0.6 ? "#e8d0ff" : "#a070ff",
          count: reduce ? 1 : 2 + (k > 0.5 ? 2 : 0),
          size: 2 + k * 2.5,
          up: 0.4,
          speed: 1.6 + k * 2.2,
          life: 12 + k * 10
        });
        if (!reduce && c.t % 2 === 0) {
          game.fx.emit(px, py, {
            color: "#c9a0ff",
            count: 2,
            size: 1.8,
            up: 0.8,
            speed: 2.4,
            life: 10
          });
        }
      }
    }
    if (!reduce) {
      for (const o of this.orbitals) {
        if (o.portal === portal) o.a += o.speed * (0.4 + k * 1.6);
      }
    }
    if (c.t >= c.max) {
      portal.swallow = 24;
      this._overlay = { alpha: 0.92, color: "90,40,160", vignette: 0.7 };
      this._kick = this._makeKick(portal, "blackhole");
      this._queue(portal, game && game.roomId);
      this.charge = null;
      this._visual = { scale: 0.12, alpha: 0.06 };
      if (game) {
        game.flash = Math.max(game.flash || 0, reduce ? 8 : 14);
        game.shake = Math.min(reduce ? 5 : 16, (game.shake || 0) + (reduce ? 3 : 8));
      }
      if (game && game.fx) {
        game.fx.emit(cx, cy, {
          color: "#e0c0ff",
          count: reduce ? 12 : 40,
          size: 6,
          up: 1.8,
          speed: 4,
          life: 24,
          star: true
        });
        game.fx.emit(cx, cy, {
          color: "#fff",
          count: reduce ? 4 : 14,
          size: 3,
          up: 2.2,
          speed: 5,
          life: 16
        });
      }
    }
  }

  _tickCatapultCharge(game, reduce, c, portal, p, k) {
    this.prompt = "⚔ ¡Lanzando!";
    const tx = portal.x + portal.w * 0.55 - p.w / 2;
    const ty = portal.y - p.h - 2;
    p.x += (tx - p.x) * 0.3;
    p.y += (ty - p.y) * 0.3;
    p.vx *= 0.4;
    p.vy = Math.min(p.vy, 0);

    if (c.snapped) {
      this._overlay = {
        alpha: 0.82,
        color: "255,160,60",
        vignette: 0.65
      };
      this._visual = { scale: 1.08, alpha: 1 };
      portal.armAng += (0.55 - portal.armAng) * 0.45;
      if (c.freezeLeft > 0) {
        c.freezeLeft--;
        if (c.freezeLeft > 0) return;
      }
      this._kick = this._makeKick(portal, "catapult");
      this._queue(portal, game && game.roomId);
      this.charge = null;
      return;
    }

    portal.armAng += portal.armVel;
    portal.armVel *= 0.9;
    const target = -1.05 - k * 0.35; // más atrás al final
    portal.armAng += (target - portal.armAng) * (0.18 + k * 0.12);
    portal.armVel -= 0.01 + k * 0.02;
    this._visual = { scale: 1 + k * 0.1, alpha: 1 };
    this._overlay = {
      alpha: Math.min(0.78, 0.06 + k * k * 0.58),
      color: "255,160,60",
      vignette: 0.1 + k * 0.5
    };
    if (game && game.fx) {
      const every = reduce ? 3 : 1;
      if (c.t % every === 0) {
        const stoneX = portal.x + portal.w * 0.72;
        const stoneY = portal.y - 8 - k * 6;
        game.fx.emit(stoneX, stoneY, {
          color: k > 0.7 ? "#ffe8a0" : "#ffc078",
          count: reduce ? 1 : 2 + (k > 0.55 ? 2 : 0),
          size: 2 + k * 2,
          up: 1.6 + k,
          speed: 2.2 + k * 2,
          life: 12 + k * 8
        });
        if (!reduce) {
          game.fx.emit(p.x + p.w * 0.3, p.y + p.h * 0.6, {
            color: "#ffb060",
            count: 1,
            size: 1.8,
            up: 0.6,
            speed: 1.2,
            life: 10
          });
        }
      }
      if (!reduce && k > 0.75 && c.t % 2 === 0) {
        game.fx.emit(portal.x + portal.w * 0.5, portal.y + 4, {
          color: "#fff0c8",
          count: 3,
          size: 2.5,
          up: 2.2,
          speed: 3.2,
          life: 14,
          star: true
        });
      }
    }
    if (c.t >= c.max) {
      c.snapped = true;
      c.freezeLeft = reduce ? 1 : 2;
      portal.armVel = 0.62;
      portal.armAng = -0.05;
      portal.sparkT = 16;
      this._overlay = { alpha: 0.88, color: "255,160,60", vignette: 0.7 };
      this._visual = { scale: 1.12, alpha: 1 };
      if (game) {
        game.flash = Math.max(game.flash || 0, reduce ? 7 : 13);
        game.shake = Math.min(reduce ? 5 : 16, (game.shake || 0) + (reduce ? 3 : 9));
      }
      if (game && game.fx) {
        const bx = p.x + p.w / 2;
        const by = p.y + p.h / 2;
        game.fx.emit(bx, by, {
          color: "#ffe0a0",
          count: reduce ? 10 : 32,
          size: 4.5,
          up: 2.8,
          speed: 5,
          life: 20
        });
        game.fx.emit(bx, by, {
          color: "#fff",
          count: reduce ? 4 : 12,
          size: 2.8,
          up: 3.2,
          speed: 4.5,
          life: 14,
          star: true
        });
      }
    }
  }

  _makeKick(portal, type) {
    this._landingType = type === "blackhole" ? "blackhole" : "catapult";
    const profile = traversalProfile(portal?.roomId, portal?.dest, type);
    const mid = portal.x + portal.w / 2;
    const fallbackFacing = mid < 800 ? 1 : -1;
    const facing = Math.sign(profile.vx || 0) || fallbackFacing;
    return {
      vx: Number(profile.vx) || fallbackFacing * (type === "blackhole" ? 2.4 : 5.5),
      vy: Number(profile.vy) || (type === "blackhole" ? -3.2 : -7.5),
      facing,
      type: profile.kind === "vortex" ? "blackhole" : "catapult",
      nodeLabel: profile.label,
      color: profile.color,
    };
  }

  _queue(portal, fromRoomId) {
    if (!portal || !portal.dest) {
      this._visual = { scale: 1, alpha: 1 };
      this._overlay = null;
      this.cooldown = Math.max(this.cooldown, 40);
      return;
    }
    this._arrivePreferDest = fromRoomId || null;
    this.pending = {
      dest: portal.dest,
      from: "portal",
      type: portal.type,
      label: portal.label,
      node: traversalNodeSnapshot(fromRoomId || portal.roomId, portal),
      fromRoom: fromRoomId || null,
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
      const profile = traversalProfile(o.portal?.roomId, o.portal?.dest, o.portal?.type);
      const twist = Number(profile.twist) || 1;
      o.a += o.speed * step * Math.sign(twist || 1) * Math.max(0.65, Math.min(1.65, Math.abs(twist)));
      o.life -= step;
      if (o.life <= 0) {
        o.life = o.max;
        o.cycle = (o.cycle || 0) + 1;
        const seed = o.seed + o.cycle * 37.31;
        o.a = unit(seed + 1) * Math.PI * 2;
        o.r = Math.min(o.portal.w, o.portal.h) * (0.35 + unit(seed + 2) * 0.55) * 0.5;
      }
    }
  }

  _springArms(_focus, reduce) {
    for (const portal of this.items) {
      if (portal.type !== "catapult") continue;
      if (this.charge && this.charge.portal === portal) continue;
      const idle = -0.35 + Math.sin(this._simT / 12.6) * 0.08;
      const k = reduce ? 0.08 : 0.14;
      portal.armVel += (idle - portal.armAng) * k;
      portal.armVel *= 0.86;
      portal.armAng += portal.armVel;
    }
  }

  /** Estela de partículas al aterrizar (ámbar / púrpura / cyan agua en reef). Respeta reduceMotion. */
  _emitLandingTrail(game, reduce) {
    if (!game || !game.fx || !game.player || game.player.dead) return;
    if (reduce && this.trailTicks % 3 !== 0) return;
    const p = game.player;
    const isBH = this.trailType === "blackhole";
    const isWater =
      this.trailType === "water" ||
      !!this.trailColor ||
      game.roomId === "reef";
    const color = isWater
      ? this.trailColor || "#5ecfff"
      : isBH
        ? "#c9a0ff"
        : "#ffc078";
    const colorHi = isWater ? "#a8efff" : isBH ? "#e8d0ff" : "#ffe8a0";
    const steps = reduce ? 1 : 3;
    for (let i = 0; i < steps; i++) {
      const k = (i + 1) / (steps + 1);
      const seed = this._simT * 17.31 + this.trailTicks * 7.19 + i * 31.7;
      const px = p.x + p.w / 2 - (p.vx || 0) * k * 4;
      const py = p.y + p.h / 2 - (p.vy || 0) * k * 4;
      game.fx.emit(px, py, {
        color: i % 2 ? colorHi : color,
        count: reduce ? 1 : 2,
        size: reduce ? 1.8 : 2.4,
        up: 0.35 + unit(seed + 1) * 0.5,
        speed: 0.9 + unit(seed + 2) * 0.8,
        life: reduce ? 8 : 12 + Math.floor(unit(seed + 3) * 6),
        gravity: 0.03
      });
    }
    if (!reduce && this.trailTicks % 4 === 0) {
      game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, {
        color: "#fff",
        count: 1,
        size: 1.6,
        up: 0.7,
        speed: 1.4,
        life: 10,
        star: true
      });
    }
  }

  draw(ctx, cam, t, opt) {
    if (!ctx || !cam) return;
    const skipCatapult = !!(opt && opt.skipCatapult);
    for (const portal of this.items) {
      if (portal.type === "blackhole") drawBlackhole(ctx, cam, t, portal, this.orbitals, this.charge);
      else if (!skipCatapult) drawCatapult(ctx, cam, t, portal, this.charge);
      if (this.near === portal && this.prompt) {
        drawNearPrompt(ctx, cam, portal, this.prompt, t);
      }
    }
  }
}

/* ─── Visuales ─────────────────────────────────────────── */

function drawCatapult(ctx, cam, t, portal, charge) {
  const x = portal.x - cam.x;
  const y = portal.y - cam.y;
  const charging = charge && charge.portal === portal;
  const ck = charging ? Math.min(1, charge.t / Math.max(1, charge.max)) : 0;
  const ang = (portal.armAng != null ? portal.armAng : -0.42) + Math.sin(t / 16) * 0.04;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(x + portal.w / 2, y + portal.h + 2, portal.w * 0.38, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const left = x + 14;
  const right = x + portal.w - 14;
  const foot = y + portal.h - 2;
  const top = y + 16;
  ctx.strokeStyle = "#4a2c16";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(left, foot); ctx.lineTo(left + 10, top);
  ctx.moveTo(left + 22, foot); ctx.lineTo(left + 10, top);
  ctx.moveTo(right, foot); ctx.lineTo(right - 10, top);
  ctx.moveTo(right - 22, foot); ctx.lineTo(right - 10, top);
  ctx.stroke();
  ctx.strokeStyle = "#8a5a32";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.arc(left + 10, top, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e6c48a";
  ctx.beginPath();
  ctx.arc(left + 10, top, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(left + 10, top);
  ctx.rotate(ang);
  ctx.fillStyle = "#6b3e1c";
  ctx.fillRect(0, -4, portal.w * 0.55, 8);
  ctx.fillStyle = "#c4894a";
  ctx.fillRect(0, -4, portal.w * 0.55, 2.5);
  const bx = portal.w * 0.52;
  ctx.strokeStyle = "#d8c4a0";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(bx - 8, 0);
  ctx.quadraticCurveTo(bx, 14 + ck * 6, bx + 10, 0);
  ctx.stroke();
  ctx.fillStyle = charging ? "#ffd27a" : "#c46a3a";
  ctx.beginPath();
  ctx.ellipse(bx, 8 + ck * 4, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (charging) {
    ctx.strokeStyle = "rgba(255,220,140," + (0.35 + ck * 0.5) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, 6, 12 + ck * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const profile = traversalProfile(portal.roomId, portal.dest, portal.type);
  const previewA = charging ? 0.62 : 0.28 + (0.5 + Math.sin(t / 12) * 0.5) * 0.12;
  ctx.globalAlpha = previewA;
  ctx.strokeStyle = profile.color || "#ffc078";
  ctx.lineWidth = charging ? 2.4 : 1.5;
  ctx.setLineDash(charging ? [8,5] : [5,7]);
  ctx.beginPath();
  const sx = x + portal.w * 0.56;
  const sy = y - 8;
  const dir = Math.sign(Number(profile.vx) || 1) || 1;
  const powerX = Math.min(150, Math.abs(Number(profile.vx) || 5.5) * 18);
  const rise = Math.min(120, Math.abs(Number(profile.vy) || 7.5) * 11);
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + dir * powerX * 0.52, sy - rise, sx + dir * powerX, sy - rise * 0.44);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  ctx.font = "800 11px Outfit, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = profile.color || "#ffe8c8";
  ctx.fillText(profile.label || portal.label || "Catapulta", x + portal.w / 2, y - 6);
  ctx.restore();
}

function drawBlackhole(ctx, cam, t, portal, orbitals, charge) {
  const cx = portal.x + portal.w / 2 - cam.x;
  const cy = portal.y + portal.h / 2 - cam.y;
  const r = Math.min(portal.w, portal.h) * 0.48;
  const charging = charge && charge.portal === portal;
  const ck = charging ? Math.min(1, charge.t / Math.max(1, charge.max)) : 0;
  const profile = traversalProfile(portal.roomId, portal.dest, portal.type);
  const twist = Number(profile.twist) || 1;
  const spin = (t / (16 - ck * 10)) * Math.sign(twist || 1) * Math.max(0.7, Math.min(1.6, Math.abs(twist))); // ruta define dirección
  const swallow = portal.swallow || 0;
  const pulse = 0.55 + Math.sin(t / 7) * 0.2 + (charging ? 0.3 + ck * 0.35 : 0) + swallow * 0.04;

  ctx.save();

  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.55);
  g.addColorStop(0, "rgba(30,5,50,.98)");
  g.addColorStop(0.35, "rgba(100,40,180," + (0.5 + pulse * 0.2) + ")");
  g.addColorStop(0.7, "rgba(60,20,120,.25)");
  g.addColorStop(1, "rgba(20,0,40,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    const shrink = charging ? ck * 0.12 * i : 0;
    const rr = r * (0.48 + i * 0.2 - shrink);
    const a = 0.28 + Math.sin(t / 8 + i * 1.1) * 0.14 + (charging ? 0.18 + ck * 0.25 : 0);
    ctx.strokeStyle = "rgba(" + (150 + i * 28) + "," + (70 + i * 35) + ",255," + Math.min(0.95, a) + ")";
    ctx.lineWidth = (2.8 - i * 0.45) * (1 + ck * 0.35);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr, rr * (0.38 + i * 0.02), spin * (1 + ck * 1.8) + i * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (orbitals) {
    for (const o of orbitals) {
      if (o.portal !== portal) continue;
      const pullR = charging ? o.r * (1 - ck * 0.55) : o.r;
      const ox = cx + Math.cos(o.a) * pullR;
      const oy = cy + Math.sin(o.a) * pullR * 0.42;
      const lifeA = Math.min(1, o.life / 20) * (0.5 + o.z * 0.5) * (charging ? 1.15 : 1);
      ctx.globalAlpha = Math.min(1, lifeA);
      ctx.fillStyle = o.z > 0.5 ? "#f0e0ff" : "#b080ff";
      ctx.beginPath();
      ctx.arc(ox, oy, o.size * (charging ? 1.25 : 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-spin * 1.4);
  ctx.strokeStyle = "rgba(255,236,255," + (0.35 + pulse * 0.25) + ")";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0.2, Math.PI * 1.15);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120,200,255,.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, Math.PI * 1.4, Math.PI * 1.9);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = spin * 2 + i * 1.25;
    ctx.strokeStyle = "rgba(210,170,255,.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.36);
    ctx.lineTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.12);
    ctx.stroke();
  }
  ctx.restore();

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

  if (swallow > 0) {
    const sa = swallow / 18;
    ctx.globalAlpha = sa * 0.85;
    ctx.fillStyle = "#f0e0ff";
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.6 + (1 - sa) * 1.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.font = "800 12px Outfit, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#e8d6ff";
  ctx.fillStyle = profile.color || "#e8d6ff";
  ctx.fillText("◉ " + profile.label, cx, cy - r - 12);
  ctx.restore();
}

/** Label grande encima del pad cuando el player está near (HUD #prompt es ~12px). */
function drawNearPrompt(ctx, cam, portal, text, t) {
  if (!text) return;
  const isBH = portal.type === "blackhole";
  let ax, ay;
  if (isBH) {
    const r = Math.min(portal.w, portal.h) * 0.48;
    ax = portal.x + portal.w / 2 - cam.x;
    ay = portal.y + portal.h / 2 - cam.y - r - 28;
  } else {
    ax = portal.x + portal.w / 2 - cam.x;
    ay = portal.y - cam.y - 28;
  }
  const bob = Math.sin((t || 0) / 10) * 2;
  const icon = isBH ? "◉" : "⚔";
  const body = String(text).replace(/^[◉⚔]\s*/, "");
  const fill = isBH ? "#f0e0ff" : "#ffe8c8";
  const glow = isBH ? "rgba(160,80,255,.85)" : "rgba(255,180,60,.85)";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.font = "900 18px Outfit, system-ui, sans-serif";
  ctx.shadowColor = glow;
  ctx.shadowBlur = 14;
  ctx.fillStyle = "rgba(0,0,0,.6)";
  ctx.fillText(icon + " " + body, ax + 1.5, ay + bob + 1.5);
  ctx.fillStyle = fill;
  ctx.fillText(icon + " " + body, ax, ay + bob);
  ctx.shadowBlur = 0;
  const tw = Math.min(220, 28 + body.length * 7.2);
  ctx.strokeStyle = isBH ? "rgba(200,150,255,.55)" : "rgba(255,200,120,.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax - tw / 2, ay + bob + 4);
  ctx.lineTo(ax + tw / 2, ay + bob + 4);
  ctx.stroke();
  ctx.restore();
}

export const portals = new Portals();
