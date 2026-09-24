// ============================================================================
// RASGOS PASIVOS · uno por personaje (roster.passive.id)
// API llamada desde game.js:
//   update(game, input)   → antes de la gravedad (input = {left,right,jump,drop,jumpPressed,t})
//   afterMove(game, input)→ tras la colisión con plataformas
//   onHurt(game, amount)  → devuelve el daño final
//   onLethal(game)        → true si el golpe mortal se evita
//   onRoom(game)          → al entrar en sala
//   draw(ctx, game, t)    → capa de efectos (antes de proyectiles/jugador)
// También hace de puente con las entidades de habilidades (systems/abilities.js).
// ============================================================================
import { sfx } from "../engine/audio.js";
import { abilityPreMove, updateAbilityFx, drawAbilityFx, clearAbilityFx, hitEnemy } from "./abilities.js";

const TAU = Math.PI * 2;
const sparks = [];
const rings = [];
let lastP = null;

function cx(o) { return o.x + o.w / 2; }
function cy(o) { return o.y + o.h / 2; }
function evoOf(p) { return Number(p.evo) || 0; }
function pw(p) { return 1 + evoOf(p) * 0.35; }
function canHit(e) { return !!e && !e.dying && e.hp > 0 && !(e.invuln > 0); }
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function pid(p) { return (p.passive && p.passive.id) || PASSIVE_BY_ID[p.id] || null; }
const PASSIVE_BY_ID = { kilo: "float", lilo: "float", stitcho: "climb", stitch: "climb", chispin: "spark", pikachu: "spark", cat: "ninelives", dragon: "glide", dino: "pound", frita: "slide", pizza: "bounce", yomi: "hollow", cuerno: "punta" };

function reset(p) {
  sparks.length = 0;
  rings.length = 0;
  if (!p) return;
  p._move = null; p._gliding = false; p._pound = false; p._slideT = 0; p._runT = 0; p._climbT = 0; p._bounceT = 0;
}

// Pared trepable: lado de una plataforma (también ligeramente por debajo de un
// saliente fino) o borde de la sala sin puerta. dir = -1 pared a la derecha, 1 a la izquierda.
function findWall(game, p, input) {
  const W = game.worldW || 1600;
  if (input.right) {
    if (p.x >= W - p.w - 1.5) return { dir: -1, plat: null };
    for (const plat of game.platforms) {
      if (p.y + p.h > plat.y && p.y < plat.y + plat.h + 34 && p.x + p.w > plat.x - 6 && p.x + p.w < plat.x + 12) return { dir: -1, plat };
    }
  }
  if (input.left) {
    if (p.x <= 1.5) return { dir: 1, plat: null };
    for (const plat of game.platforms) {
      if (p.y + p.h > plat.y && p.y < plat.y + plat.h + 34 && p.x < plat.x + plat.w + 6 && p.x > plat.x + plat.w - 12) return { dir: 1, plat };
    }
  }
  return null;
}

export const Passives = {
  update(game, input) {
    const p = game.player;
    if (!p) return;
    if (p !== lastP) { lastP = p; reset(p); }
    abilityPreMove(game, input);
    const id = pid(p);
    const evo = evoOf(p);
    const dropPressed = !!input.drop && !p._dropPrev;
    p._dropPrev = !!input.drop;
    p._preVy = p.vy + 0.52;
    p._preBottom = p.y + p.h;
    p._pmove = null;
    p._gliding = false;

    if (id === "float") {
      p._flying = false;
      if (evo >= 4 && p._butterfly == null) p._butterfly = 70;
      if (!p.grounded) {
        if (evo >= 4 && input.jump && (p._butterfly || 0) > 0 && p.vy > -2.2) {
          p._butterfly--;
          p.vy = Math.max(-2.2, p.vy - 0.55);
          p._pmove = "float";
          p._flying = true;
          if ((input.t % 5) === 0) {
            const col = (input.t % 10) ? "#ffe27a" : "#ff8fcf";
            game.fx.emit(cx(p) - p.facing * 6, p.y + p.h * 0.55, { color: col, count: 2, size: 3, up: -0.4, speed: 1.1, life: 22, star: true });
          }
        } else if (input.jump && p.vy > 0) {
          p.vy = Math.min(p.vy, (evo >= 3 ? 1.0 : 1.4) - 0.52);
          p._pmove = "float";
          const col = (input.t % 14) ? "#ff9ab0" : "#7de87a";
          if ((input.t % 7) === 0) game.fx.emit(cx(p), p.y + p.h, { color: col, count: 1, size: 3, up: -0.2, speed: 0.8, life: 20, gravity: 0.03 });
        }
      } else if (evo >= 4) {
        p._butterfly = Math.min(70, (p._butterfly || 0) + 1);
      }
    } else if (id === "hollow") {
      if (!p.grounded && p.vy > 0.4) p.vy = Math.min(13, p.vy + 0.22);
      if (!p.grounded && input.jumpPressed && !(p._specter > 0)) {
        p._specter = 10;
        p.x += (p.facing || 1) * (28 + evoOf(p) * 6);
        p.vy = Math.min(p.vy, 1.2);
        p.invuln = Math.max(p.invuln || 0, 8);
        p._pmove = "hollow";
        game.fx.emit(cx(p), cy(p), { color: "#6a3cff", count: 8, size: 3, up: 0.4, life: 14 });
        game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 10, color: "#1a0828" });
      }
      if (p._specter > 0) p._specter--;
    } else if (id === "climb") {
      const w = !p.grounded || p._climbT > 0 ? findWall(game, p, input) : null;
      if (w && input.jump) {
        p._climbT = 6;
        p._climbPlat = w.plat;
        p._climbWall = w.dir;
        p.vy = -(3.2 + evo * 0.35) - 0.52;
        p.vx = -w.dir * 0.5;
        p.jumps = 0;
        p.buffer = 0;
        p._pmove = "climb";
        if (w.plat && p.y + p.h - w.plat.y < 12) { p.vy = -6.5; p.vx = -w.dir * 3.5; }
        if ((input.t % 6) === 0) game.fx.emit(w.dir === -1 ? p.x + p.w : p.x, p.y + p.h * 0.6, { color: "#bcd6ff", count: 2, size: 2, speed: 1, life: 12 });
      } else if (w && !input.jump && p.vy > 0) {
        p.vy = Math.min(p.vy, 1.2 - 0.52);
        p._pmove = "climb";
      } else if (p._climbT > 0) {
        p._climbT--;
        const away = p._climbWall;
        if (input.jumpPressed && ((away === 1 && input.right) || (away === -1 && input.left))) {
          p.vy = -p.jumpPower; p.vx = 8 * away; p._climbT = 0;
          game.fx.emit(cx(p), cy(p), { color: "#bcd6ff", count: 6, size: 2.5 });
        }
      }
    } else if (id === "spark") {
      const running = (input.left || input.right) && Math.abs(p.vx) >= p.speed * 0.9;
      if (running) p._runT = (p._runT || 0) + 1; else p._runT = Math.max(0, (p._runT || 0) - 4);
      if (p._runT >= 60) {
        if (running && Math.abs(p.vx) <= p.speed * 1.01) p.vx *= 1.35;
        p._pmove = "spark";
        if ((input.t % 3) === 0) sparks.push({ x: cx(p) - p.facing * p.w * 0.3, y: p.y + p.h - 6, life: 45, r: 12 + evo * 1.5, seed: Math.random() * 10 });
        if (p._runT === 60) { game.fx.emit(cx(p), cy(p), { color: "#ffe14a", count: 10, size: 3, star: true, speed: 3 }); game.nums.add(cx(p), p.y - 10, "¡ZAS!", "#ffe14a"); }
      }
    } else if (id === "glide") {
      if (!p.grounded) {
        if (input.jump && evo >= 4 && (p._fly || 0) > 0 && p.vy > -2) {
          p._fly--;
          p.vy = -1.2 - 0.52;
          p._gliding = true;
        } else if (input.jump && p.vy > 0.3) {
          p.vy = Math.min(p.vy, 1.1 - 0.52);
          p._gliding = true;
        }
        if (p._gliding && (input.t % 6) === 0) game.fx.emit(cx(p) - p.facing * 10, p.y + p.h * 0.7, { color: "#fff0d0", count: 1, size: 2, speed: 0.6, life: 14 });
      } else p._fly = 70;
    } else if (id === "pound") {
      if (!p.grounded && dropPressed && !p._pound) {
        p._pound = true;
        sfx("whoosh");
        p.vx *= 0.3;
        p.vy = -2;
        game.fx.emit(cx(p), cy(p), { color: "#c8f04a", count: 8, size: 3, speed: 2.4 });
      }
      if (p._pound) {
        p.vy = 16;
        p.vx *= 0.6;
        p._pmove = "pound";
        p.y += 2;
        armor(p, 3);
        if ((input.t % 2) === 0) game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 8, color: "#c8f04a" });
      }
    } else if (id === "slide") {
      if (p._slideCd > 0) p._slideCd--;
      if (p.grounded && dropPressed && (input.left || input.right) && Math.abs(p.vx) > p.speed * 0.7 && !(p._slideCd > 0) && !(p._slideT > 0)) {
        p._slideT = 30;
        sfx("slide");
        p._slideDir = p.facing;
        p._slideId = (p._slideId || 0) + 1;
        game.fx.emit(cx(p), p.y + p.h, { color: "#ffe8a0", count: 8, size: 3, speed: 2.4, up: 0.6 });
      }
      if (p._slideT > 0) {
        p._slideT--;
        const k = 0.45 + 0.55 * (p._slideT / 30);
        p.vx = p._slideDir * Math.max(9, p.speed * 2.1) * k;
        p.facing = p._slideDir;
        p._pmove = "slide";
        armor(p, 3);
        if ((input.t % 2) === 0) game.fx.emit(cx(p) - p._slideDir * p.w * 0.5, p.y + p.h, { color: "#e8d8a8", count: 2, size: 2.5, up: 0.8, speed: 1.4, life: 14 });
        if (p._slideT === 0) p._slideCd = 18;
      }
    } else if (id === "punta") {
      if (!p.grounded && (input.t % 6) === 0) {
        game.fx.emit(cx(p) + (p.facing || 1) * 6, p.y + 2, { color: "#ffe9a8", count: 1, size: 2.4, up: -0.4, life: 14, star: true });
      }
    }
  },

  afterMove(game, input) {
    const p = game.player;
    if (!p) return;
    const id = pid(p);
    const evo = evoOf(p);
    updateAbilityFx(game);

    if (id === "climb" && p._pmove === "climb" && p._climbPlat) {
      const plat = p._climbPlat;
      if (p.y + p.h > plat.y + 2) {
        if (p._climbWall === -1) p.x = plat.x - p.w + 3; else p.x = plat.x + plat.w - 3;
      }
    }

    if (id === "pound" && p._pound && p.grounded) {
      p._pound = false;
      sfx("pound");
      const R = 110 + evo * 20;
      const fx = cx(p), fy = p.y + p.h;
      for (const e of game.enemies) {
        if (!canHit(e)) continue;
        const d = Math.hypot(cx(e) - fx, (e.y + e.h) - fy);
        if (d < R + e.w / 2) {
          const dir = Math.sign(cx(e) - fx) || 1;
          hitEnemy(game, e, (22 + evo * 4) * pw(p) * (d < 40 ? 1.3 : 1), { kx: dir * 9, ky: -9, stun: 36, color: "#c8f04a", shake: 4 });
        }
      }
      rings.push({ x: fx, y: fy, R, life: 20, max: 20, color: "#c8f04a" });
      game.shake = Math.min(24, (game.shake || 0) + 12 + evo * 2);
      game.fx.emit(fx, fy, { color: "#d8c7a4", count: 10, size: 4, up: 2.2, speed: 4 });
      game.fx.emit(fx, fy, { color: "#c8f04a", count: 10, size: 3, up: 1.4, speed: 5, star: true });
      armor(p, 10);
    }
    if (id !== "pound" && p._pound) p._pound = false;

    if (id === "slide" && p._slideT > 0) {
      const box = { x: p.x - 6, y: p.y, w: p.w + 12, h: p.h };
      for (const e of game.enemies) {
        if (!canHit(e) || !aabb(box, e) || e._slideHit === p._slideId) continue;
        e._slideHit = p._slideId;
        hitEnemy(game, e, (16 + evo * 3) * pw(p), { kx: p._slideDir * 10, ky: -8, stun: 30, color: "#ffd36a" });
      }
    }

    if (id === "bounce" && p._preVy > 0.5 && !p.dead) {
      for (const e of game.enemies) {
        if (!canHit(e) || !aabb(p, e)) continue;
        if (p._preBottom > e.y + Math.min(e.h * 0.55, 20) + p._preVy) continue;
        hitEnemy(game, e, (18 + evo * 4) * pw(p), { ky: 3, stun: 30, color: "#ffd84a", shake: 6, crit: true });
        if (!e.boss) e.vy = Math.max(e.vy || 0, 3);
        p.y = e.y - p.h - 1;
        p.vy = -(input.jump ? p.jumpPower * 1.1 : p.jumpPower * 0.8);
        p.jumps = Math.min(p.jumps || 0, 1);
        p._bounceT = 14;
        sfx("bounce");
        p._jumpHeld = true;
        armor(p, 10);
        rings.push({ x: cx(p), y: p.y + p.h, R: 40, life: 12, max: 12, color: "#ffd84a", flat: true });
        game.fx.emit(cx(p), p.y + p.h, { color: "#ffd84a", count: 10, size: 3.5, up: 1, speed: 3, star: true });
        game.nums.add(cx(e), e.y - 6, "¡PLOF!", "#ffd84a");
        break;
      }
    }
    if (p._bounceT > 0) { p._bounceT--; p._pmove = "bounce"; }

    if (id === "punta" && p.grounded && p._preVy > 3.2 && !p.dead) {
      rings.push({ x: cx(p), y: p.y + p.h, R: 26, life: 10, max: 10, color: "#ffe9a8", flat: true });
      if (p.vy > -1) p.vy = -3.4;
      p._pmove = "punta";
      game.fx.emit(cx(p), p.y + 2, { color: "#fff6c8", count: 6, size: 2.5, up: 1.2, star: true });
    }

    // chispas de Chispín
    if (sparks.length) {
      for (const s of sparks) s.life--;
      for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
      for (const e of game.enemies) {
        if (!canHit(e) || (e._sparkT || 0) > game.t) continue;
        for (const s of sparks) {
          if (Math.abs(cx(e) - s.x) < s.r + e.w / 2 && Math.abs(cy(e) - s.y) < s.r + e.h / 2) {
            e._sparkT = game.t + 20;
            hitEnemy(game, e, (6 + evo * 1.5) * pw(p), { stun: 14, ky: -3, color: "#ffe14a", xp: 1, shake: 1 });
            break;
          }
        }
      }
    }
    for (const r of rings) r.life--;
    for (let i = rings.length - 1; i >= 0; i--) if (rings[i].life <= 0) rings.splice(i, 1);

    if (p._nineT > 0) {
      p._nineT--;
      if ((p._nineT % 5) === 0) game.fx.emit(cx(p), cy(p), { color: "#ffd0ee", count: 2, size: 2.5, up: 1, speed: 1.2, star: true, life: 18 });
    }
    if (p._armorT > 0) p._armorT--;
    p._move = p._abilMove || p._pmove || null;
  },

  onHurt(game, amount) {
    const p = game.player;
    if (p && p._armorT > 0) return 0;
    return amount;
  },

  onLethal(game) {
    const p = game.player;
    if (!p || pid(p) !== "ninelives" || p._nineUsed) return false;
    p._nineUsed = true;
    sfx("lives");
    p.health = 1;
    p.dead = false;
    p.invuln = 90;
    p._nineT = 90;
    game.flash = Math.max(game.flash || 0, 12);
    game.flashColor = "#ffb6e4";
    game.shake = Math.min(24, (game.shake || 0) + 10);
    game.nums.add(cx(p), p.y - 24, "¡NUEVE VIDAS!", "#ffb6e4", true);
    game.fx.emit(cx(p), cy(p), { color: "#ffb6e4", count: 10, size: 5, up: 2.4, speed: 4, star: true });
    game.fx.emit(cx(p), cy(p), { color: "#fff", count: 10, size: 3, up: 3, speed: 3, star: true });
    return true;
  },

  onRoom(game) {
    const p = game.player;
    clearAbilityFx();
    sparks.length = 0;
    rings.length = 0;
    if (!p) return;
    p._nineUsed = false;
    p._pound = false;
    p._slideT = 0;
    p._climbT = 0;
    p._runT = 0;
  },

  draw(ctx, game, t) {
    const p = game.player;
    if (!p) return;
    const cam = game.cam;
    ctx.save();
    // chispas
    for (const s of sparks) {
      const k = s.life / 45;
      const x = s.x - cam.x, y = s.y - cam.y;
      ctx.globalAlpha = k;
      ctx.strokeStyle = "#ffe14a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      const n = 3;
      for (let i = 0; i < n; i++) {
        const a = s.seed + i * 2.1 + t * 0.3;
        const r = s.r * (0.5 + 0.5 * k);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * r * 0.5 + (Math.random() - 0.5) * 3, y + Math.sin(a) * r * 0.5);
        ctx.lineTo(x + Math.cos(a + 0.4) * r, y + Math.sin(a + 0.4) * r);
      }
      ctx.stroke();
      ctx.fillStyle = "#fffbe0";
      ctx.beginPath(); ctx.arc(x, y, 2 + k * 1.5, 0, TAU); ctx.fill();
    }
    // ondas de choque (pisotón / rebote)
    for (const r of rings) {
      const k = 1 - r.life / r.max;
      const x = r.x - cam.x, y = r.y - cam.y;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.beginPath();
      ctx.ellipse(x, y, r.R * (0.2 + k * 0.8), r.R * (r.flat ? 0.18 : 0.32) * (0.2 + k * 0.8), 0, 0, TAU);
      ctx.stroke();
      if (!r.flat) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, r.R * k * 0.7, r.R * 0.22 * k * 0.7, 0, 0, TAU);
        ctx.stroke();
      }
    }
    // nueve vidas: halo + contador
    if (p._nineT > 0 && !p.dead) {
      const k = p._nineT / 90;
      const x = cx(p) - cam.x, y = p.y - cam.y - 10 - (1 - k) * 12;
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.strokeStyle = "#ffd0ee";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 16, 5, 0, 0, TAU); ctx.stroke();
      ctx.globalAlpha = Math.min(1, k * 2) * 0.35;
      ctx.fillStyle = "#ffb6e4";
      ctx.beginPath(); ctx.arc(cx(p) - cam.x, cy(p) - cam.y, Math.max(p.w, p.h) * (0.9 + Math.sin(t * 0.3) * 0.1), 0, TAU); ctx.fill();
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.font = "800 13px Outfit,sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#b03a80";
      ctx.lineWidth = 3;
      ctx.strokeText("1 PS", x, y - 10);
      ctx.fillText("1 PS", x, y - 10);
    }
    // pasivo disponible de Michi: pequeña marca de vida extra
    if (pid(p) === "ninelives" && !p._nineUsed && !p.dead) {
      const x = cx(p) - cam.x + p.facing * -(p.w * 0.5 + 6), y = p.y - cam.y + 2;
      ctx.globalAlpha = 0.55 + Math.sin(t * 0.08) * 0.2;
      ctx.fillStyle = "#ff8ad4";
      ctx.beginPath();
      ctx.moveTo(x, y + 3);
      ctx.bezierCurveTo(x - 5, y - 1, x - 3, y - 5, x, y - 2);
      ctx.bezierCurveTo(x + 3, y - 5, x + 5, y - 1, x, y + 3);
      ctx.fill();
    }
    // carrera eléctrica: aura
    if (p._move === "spark") {
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = "#ffe14a";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 2; i++) {
        const x0 = cx(p) - cam.x - p.facing * (p.w * 0.5 + 4 + i * 8), y0 = cy(p) - cam.y + (i - 0.5) * 10;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 - p.facing * 6, y0 - 4 + Math.random() * 3);
        ctx.lineTo(x0 - p.facing * 12, y0 + 3);
        ctx.lineTo(x0 - p.facing * 18, y0 - 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    drawAbilityFx(ctx, game, t);
  },
};

function armor(p, n) { p._armorT = Math.max(p._armorT || 0, n); }
