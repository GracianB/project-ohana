/**
 * Death carry-away FX — cinematic hooded reaper lifts the fallen player, then caller respawns.
 * Internal state only (deathGhost / souls / wisps). NEVER touches game.ghosts (dash afterimages).
 *
 * Phases (~110 frames / ~1.8s @60fps; ~45 if prefers-reduced-motion):
 *   Appear → Claim → Ascend → Dissolve → onDone (respawn)
 *
 * API: DeathFx.start(player, onDone, opts?), update(game), draw(ctx,cam,t),
 *      isPlaying(), cancel(), playerAlpha()
 */
const PARTICLE_CAP = 40;
const WISP_CAP = 10;
const WISP_INTERVAL = 4;

function prefersReducedMotion() {
  try {
    return !!(typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (_) {
    return false;
  }
}

function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smoothstep(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}
function easeOutCubic(t) {
  t = clamp01(t);
  const u = 1 - t;
  return 1 - u * u * u;
}
function easeInCubic(t) {
  t = clamp01(t);
  return t * t * t;
}

/** Soft palette by death reason — void = abyss cyan, hurt = rose-cyan. */
const PALETTES = {
  void: {
    sheet: [200, 236, 255],
    sheetDeep: [90, 140, 180],
    hood: [12, 28, 48],
    eye: [140, 255, 255],
    glow: [120, 220, 255],
    soul: [160, 245, 255],
    tether: [170, 240, 255],
    vignette: [8, 40, 70],
    flash: [180, 240, 255],
  },
  hurt: {
    sheet: [230, 220, 245],
    sheetDeep: [140, 100, 150],
    hood: [28, 18, 40],
    eye: [255, 200, 230],
    glow: [255, 160, 200],
    soul: [255, 190, 210],
    tether: [255, 180, 210],
    vignette: [50, 10, 30],
    flash: [255, 220, 235],
  },
};

function rgba(rgb, a) {
  return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
}

export const DeathFx = {
  playing: false,
  player: null,
  onDone: null,
  doneCalled: false,
  frame: 0,
  duration: 110,
  reduce: false,
  reason: "hurt",
  palette: PALETTES.hurt,
  deathGhost: null,
  souls: null,
  wisps: null,
  _shakeOnce: false,
  _flashOnce: false,
  _appearBurst: false,
  _playerAlpha: 1,
  _ripple: 0,

  isPlaying() {
    return this.playing;
  },

  /** Alpha for faded drawCharacter while carry-away plays (game.js may use this). */
  playerAlpha() {
    return this.playing ? this._playerAlpha : 1;
  },

  /** Abort without calling onDone (e.g. manual R respawn). */
  cancel() {
    this.playing = false;
    this.deathGhost = null;
    this.souls = null;
    this.wisps = null;
    this.player = null;
    this.onDone = null;
    this.doneCalled = true;
    this.frame = 0;
    this._playerAlpha = 1;
  },

  /**
   * @param {object} player
   * @param {function} [onDone]
   * @param {{ reason?: 'void'|'hurt' }} [opts]
   */
  start(player, onDone, opts) {
    if (!player || this.playing) return;
    this.reduce = prefersReducedMotion();
    this.reason = (opts && opts.reason === "void") ? "void" : "hurt";
    this.palette = PALETTES[this.reason] || PALETTES.hurt;

    this.playing = true;
    this.player = player;
    this.onDone = typeof onDone === "function" ? onDone : null;
    this.doneCalled = false;
    this.frame = 0;
    this.duration = this.reduce ? 45 : 110;
    this._shakeOnce = false;
    this._flashOnce = false;
    this._appearBurst = false;
    this._playerAlpha = 1;
    this._ripple = 0;

    const side = (player.facing || 1) >= 0 ? -1 : 1;
    const gw = 42;
    const gh = 56;
    this.deathGhost = {
      x: player.x + side * (player.w * 0.55 + 18),
      y: player.y + player.h * 0.1 - 14,
      spawnX: 0,
      spawnY: 0,
      w: gw,
      h: gh,
      facing: -side,
      phase: 0,
      grabX: player.x,
      grabY: player.y,
      form: 0,
      lean: 0,
      eyeGlow: 0.4,
      alpha: 0,
      lift: 0,
    };
    this.deathGhost.spawnX = this.deathGhost.x;
    this.deathGhost.spawnY = this.deathGhost.y;

    // Preallocated pools — recycled, no heavy per-frame alloc
    this.souls = [];
    this.wisps = [];
    for (let i = 0; i < PARTICLE_CAP; i++) {
      this.souls.push({
        alive: false, x: 0, y: 0, vx: 0, vy: 0,
        life: 0, max: 1, r: 2, tw: 0, pull: 0,
      });
    }
    for (let i = 0; i < WISP_CAP; i++) {
      this.wisps.push({
        alive: false, x: 0, y: 0, w: 0, h: 0, life: 0, max: 1, alpha: 0,
      });
    }

    player.vx = 0;
    player.vy = 0;
    player.dead = true;
  },

  _spawnSoul(x, y, towardGhost, burst) {
    if (!this.souls) return;
    let slot = null;
    for (let i = 0; i < this.souls.length; i++) {
      if (!this.souls[i].alive) { slot = this.souls[i]; break; }
    }
    if (!slot) return;
    const ang = Math.random() * Math.PI * 2;
    const spd = burst ? (1.2 + Math.random() * 2.8) : (0.4 + Math.random() * 1.4);
    slot.alive = true;
    slot.x = x + (Math.random() - 0.5) * 10;
    slot.y = y + (Math.random() - 0.5) * 10;
    slot.vx = Math.cos(ang) * spd;
    slot.vy = Math.sin(ang) * spd * 0.6 - (burst ? 1.5 : 0.6);
    slot.life = 0;
    slot.max = 28 + Math.random() * 36;
    slot.r = 1.2 + Math.random() * 2.4;
    slot.tw = Math.random() * Math.PI * 2;
    slot.pull = towardGhost ? 0.035 + Math.random() * 0.04 : 0.01;
  },

  _spawnWisp(p) {
    if (!this.wisps || !p || this.reduce) return;
    let slot = null;
    for (let i = 0; i < this.wisps.length; i++) {
      if (!this.wisps[i].alive) { slot = this.wisps[i]; break; }
    }
    if (!slot) {
      let oldest = this.wisps[0];
      for (let i = 1; i < this.wisps.length; i++) {
        if (this.wisps[i].life > oldest.life) oldest = this.wisps[i];
      }
      slot = oldest;
    }
    slot.alive = true;
    slot.x = p.x;
    slot.y = p.y;
    slot.w = p.w;
    slot.h = p.h;
    slot.life = 0;
    slot.max = 14 + Math.random() * 8;
    slot.alpha = 0.35;
  },

  update(game) {
    if (!this.playing || !this.deathGhost) return;
    const p = this.player || (game && game.player);
    const g = this.deathGhost;
    this.frame++;
    const progress = clamp01(this.frame / this.duration);
    g.phase = progress;

    if (!this._shakeOnce && game) {
      this._shakeOnce = true;
      const kick = this.reduce ? 3 : (this.reason === "void" ? 7 : 6);
      game.shake = Math.max(game.shake || 0, kick);
    }

    // Appear 0–20%
    if (progress < 0.2) {
      const a = smoothstep(progress / 0.2);
      g.form = a;
      g.alpha = a;
      g.lean = 0;
      g.eyeGlow = 0.35 + a * 0.25;
      this._ripple = a;
      this._playerAlpha = 1;
      if (!this._appearBurst && a > 0.35) {
        this._appearBurst = true;
        if (!this.reduce) {
          const cx = g.x + g.w * 0.5;
          const cy = g.y + g.h * 0.45;
          for (let i = 0; i < 14; i++) this._spawnSoul(cx, cy, false, true);
        }
      }
    } else if (progress < 0.35) {
      // Claim 20–35%
      const c = smoothstep((progress - 0.2) / 0.15);
      g.form = 1;
      g.alpha = 1;
      g.lean = c * 0.55;
      g.eyeGlow = 0.6 + c * 0.25;
      this._ripple = Math.max(0, 1 - c * 1.2);
      this._playerAlpha = lerp(1, 0.72, c);
      if (p) {
        p.y = g.grabY - c * 10;
        const tx = p.x + (g.facing > 0 ? -g.w * 0.15 : p.w - g.w * 0.85);
        g.x += (tx - g.x) * 0.06;
        if (!this.reduce && (this.frame & 1) === 0) {
          this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.35, true, false);
        }
      }
    } else if (progress < 0.85) {
      // Ascend 35–85%
      const u = (progress - 0.35) / 0.5;
      const ease = this.reduce ? smoothstep(u) : easeOutCubic(u);
      g.form = 1;
      g.alpha = 1;
      g.lean = lerp(0.55, 0.2, u);
      g.eyeGlow = 0.85 + Math.sin(this.frame * 0.18) * 0.12;
      this._ripple = 0;
      this._playerAlpha = lerp(0.72, 0.4, ease);
      g.lift = ease * (this.reduce ? 90 : 170);

      if (p) {
        const sway = Math.sin(this.frame * 0.09) * 4;
        p.y = g.grabY - g.lift;
        const targetX = g.spawnX + (g.facing > 0 ? g.w * 0.2 : -p.w * 0.1) + sway * 0.4;
        p.x += (targetX - p.x) * 0.1;
      }
      g.y = (p ? p.y : g.grabY) - 12 - Math.sin(this.frame * 0.11) * 3.5;
      g.x += Math.sin(this.frame * 0.065) * 0.45;

      if (!this.reduce && p) {
        if ((this.frame % 2) === 0) {
          this._spawnSoul(
            p.x + p.w * 0.5 + (Math.random() - 0.5) * 8,
            p.y + p.h * 0.5,
            true,
            false
          );
        }
        if ((this.frame % WISP_INTERVAL) === 0) this._spawnWisp(p);
      }
    } else {
      // Dissolve 85–100%
      const d = (progress - 0.85) / 0.15;
      const di = easeInCubic(d);
      g.form = 1;
      g.lean = 0.15;
      g.eyeGlow = 1.1 - di * 0.4;
      g.alpha = 1 - easeInCubic(Math.max(0, (d - 0.35) / 0.65));
      this._playerAlpha = Math.max(0, 0.4 * (1 - di * 1.15));
      g.lift = (this.reduce ? 90 : 170) + di * (this.reduce ? 40 : 80);

      if (p) {
        p.y = g.grabY - g.lift;
        const hx = g.x + g.w * 0.5 - p.w * 0.5;
        const hy = g.y + g.h * 0.45 - p.h * 0.4;
        p.x = lerp(p.x, hx, 0.12 + di * 0.25);
        p.y = lerp(p.y, hy, di * 0.2);
        if (!this.reduce && d < 0.7) {
          this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.4, true, true);
        }
      }
      g.y = (p ? p.y : g.grabY) - 14 - di * 20 - Math.sin(this.frame * 0.14) * 2;
      g.x += Math.sin(this.frame * 0.08) * 0.3;

      if (!this._flashOnce && d > 0.55 && game) {
        this._flashOnce = true;
        game.flash = Math.max(game.flash || 0, this.reduce ? 5 : 8);
      }
    }

    if (p) {
      p.vx = 0;
      p.vy = 0;
      p.dead = true;
    }

    if (this.souls) {
      const hx = g.x + g.w * 0.5;
      const hy = g.y + g.h * 0.42;
      for (let i = 0; i < this.souls.length; i++) {
        const s = this.souls[i];
        if (!s.alive) continue;
        s.life++;
        s.tw += 0.25;
        const dx = hx - s.x;
        const dy = hy - s.y;
        s.vx += dx * s.pull;
        s.vy += dy * s.pull - 0.015;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.x += s.vx;
        s.y += s.vy;
        if (s.life >= s.max || (Math.abs(dx) < 4 && Math.abs(dy) < 4 && s.life > 8)) {
          s.alive = false;
        }
      }
    }

    if (this.wisps) {
      for (let i = 0; i < this.wisps.length; i++) {
        const w = this.wisps[i];
        if (!w.alive) continue;
        w.life++;
        w.y -= 0.35;
        w.alpha = (1 - w.life / w.max) * 0.32;
        if (w.life >= w.max) w.alive = false;
      }
    }

    if (this.frame >= this.duration) this._finish();
  },

  _finish() {
    if (this.doneCalled) return;
    this.doneCalled = true;
    const cb = this.onDone;
    this.playing = false;
    this.deathGhost = null;
    this.souls = null;
    this.wisps = null;
    this.player = null;
    this.onDone = null;
    this.frame = 0;
    this._playerAlpha = 1;
    if (cb) cb();
  },

  _drawGhost(ctx, g, pal, alpha, frame, cx, cy) {
    const form = g.form;
    if (form < 0.02) return;

    const wobble = this.reduce ? 0 : Math.sin(frame * 0.14) * 1.5;
    const leanX = g.lean * (g.facing || 1) * 10;

    ctx.save();
    ctx.globalAlpha = alpha * 0.9 * form;
    ctx.translate(cx + g.w / 2 + leanX, cy + g.h / 2 + wobble);
    ctx.scale(g.facing || 1, 1);
    ctx.scale(1 + g.lean * 0.06, 1 - g.lean * 0.04);
    ctx.translate(-g.w / 2, -g.h / 2);

    const w = g.w;
    const h = g.h;
    const hem = this.reduce ? 0 : 1;

    // Outer aura
    ctx.globalAlpha = alpha * 0.25 * form;
    ctx.fillStyle = rgba(pal.glow, 0.5);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.quadraticCurveTo(w * 1.05, h * 0.22, w * 0.95, h * 0.55);
    ctx.quadraticCurveTo(w * 0.98, h * 0.88, w * 0.78, h + 2);
    ctx.quadraticCurveTo(w * 0.55, h * 0.82, w * 0.5, h * 0.95);
    ctx.quadraticCurveTo(w * 0.45, h * 0.82, w * 0.22, h + 2);
    ctx.quadraticCurveTo(w * 0.02, h * 0.88, w * 0.05, h * 0.55);
    ctx.quadraticCurveTo(-0.05 * w, h * 0.22, w * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    // Main sheet + ragged animated hem
    ctx.globalAlpha = alpha * 0.82 * form;
    const sheetGrad = ctx.createLinearGradient(0, 0, 0, h);
    sheetGrad.addColorStop(0, rgba(pal.sheet, 0.88));
    sheetGrad.addColorStop(0.45, rgba(pal.sheet, 0.7));
    sheetGrad.addColorStop(1, rgba(pal.sheetDeep, 0.35));
    ctx.fillStyle = sheetGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2);
    ctx.quadraticCurveTo(w * 0.95, h * 0.18, w * 0.9, h * 0.48);
    ctx.quadraticCurveTo(w * 0.92, h * 0.72, w * 0.86, h * 0.82);
    const hemY = h - 2;
    const waves = [
      [0.78, 0], [0.7, 1], [0.62, 0], [0.54, 1],
      [0.5, 0], [0.46, 1], [0.38, 0], [0.3, 1], [0.22, 0],
    ];
    for (let i = 0; i < waves.length; i++) {
      const wx = waves[i][0] * w;
      const dip = waves[i][1];
      const wave = hem * Math.sin(frame * 0.16 + i * 0.9) * (3.5 + dip * 2.5);
      ctx.lineTo(wx, hemY - dip * 5 + wave);
    }
    ctx.quadraticCurveTo(w * 0.1, h * 0.72, w * 0.1, h * 0.48);
    ctx.quadraticCurveTo(w * 0.05, h * 0.18, w * 0.5, 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = alpha * 0.45 * form;
    ctx.strokeStyle = rgba(pal.glow, 0.85);
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Hood void
    ctx.globalAlpha = alpha * 0.9 * form;
    ctx.fillStyle = rgba(pal.hood, 0.75);
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.3, w * 0.3, h * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba([0, 0, 0], 0.45);
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.32, w * 0.2, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twin eye glow
    const eyeA = alpha * form * (0.7 + g.eyeGlow * 0.3);
    const er = 2.0 + g.eyeGlow * 1.4;
    const eyeY = h * 0.33;
    const eyes = [w * 0.38, w * 0.62];
    for (let e = 0; e < 2; e++) {
      const ex = eyes[e];
      ctx.globalAlpha = eyeA * 0.35;
      const eg = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, er * 3);
      eg.addColorStop(0, rgba(pal.eye, 1));
      eg.addColorStop(1, rgba(pal.eye, 0));
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, eyeY, er * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = eyeA;
      ctx.fillStyle = rgba(pal.eye, 1);
      ctx.beginPath();
      ctx.arc(ex, eyeY, er, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(ex - 0.5, eyeY - 0.5, er * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft arm wrap during claim+
    if (g.lean > 0.05) {
      ctx.globalAlpha = alpha * 0.35 * g.lean * form;
      ctx.strokeStyle = rgba(pal.sheet, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 0.48);
      ctx.quadraticCurveTo(w * 1.05, h * 0.55, w * 0.9, h * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.48);
      ctx.quadraticCurveTo(-0.05 * w, h * 0.55, w * 0.1, h * 0.7);
      ctx.stroke();
    }

    ctx.restore();
  },

  draw(ctx, cam, t) {
    if (!this.playing || !this.deathGhost) return;
    const g = this.deathGhost;
    const p = this.player;
    const pal = this.palette;
    const cx = g.x - cam.x;
    const cy = g.y - cam.y;
    const progress = g.phase;
    const pulse = 0.55 + Math.sin((t || this.frame) * 0.14) * 0.1;
    const alpha = g.alpha * pulse;

    ctx.save();

    // Soft radial vignette
    if (!this.reduce && alpha > 0.05) {
      const vw = ctx.canvas ? ctx.canvas.width : 960;
      const vh = ctx.canvas ? ctx.canvas.height : 540;
      const vigA = (this.reason === "void" ? 0.22 : 0.18) * alpha * Math.min(1, progress * 2);
      const vg = ctx.createRadialGradient(vw * 0.5, vh * 0.45, vh * 0.15, vw * 0.5, vh * 0.5, vw * 0.7);
      vg.addColorStop(0, rgba(pal.vignette, 0));
      vg.addColorStop(1, rgba(pal.vignette, vigA));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, vw, vh);
    }

    // Appear ripple
    if (this._ripple > 0.02) {
      const rx = cx + g.w * 0.5;
      const ry = cy + g.h * 0.85;
      const rr = 12 + this._ripple * 48;
      ctx.globalAlpha = this._ripple * 0.45;
      ctx.strokeStyle = rgba(pal.glow, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rr, rr * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = this._ripple * 0.2;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rr * 0.65, rr * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Afterimage wisps (local — NOT game.ghosts)
    if (this.wisps && p) {
      for (let i = 0; i < this.wisps.length; i++) {
        const wisp = this.wisps[i];
        if (!wisp.alive || wisp.alpha <= 0) continue;
        ctx.globalAlpha = wisp.alpha * alpha;
        ctx.fillStyle = rgba(pal.soul, 0.7);
        ctx.fillRect(wisp.x - cam.x, wisp.y - cam.y, wisp.w, wisp.h);
      }
    }

    // Soul motes
    if (this.souls) {
      for (let i = 0; i < this.souls.length; i++) {
        const s = this.souls[i];
        if (!s.alive) continue;
        const lifeA = 1 - s.life / s.max;
        const twinkle = 0.55 + Math.sin(s.tw) * 0.45;
        const sx = s.x - cam.x;
        const sy = s.y - cam.y;
        ctx.globalAlpha = lifeA * twinkle * alpha * 0.95;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 2.2);
        grd.addColorStop(0, rgba(pal.soul, 1));
        grd.addColorStop(1, rgba(pal.glow, 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = lifeA * alpha;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glowing tether
    if (p && progress > 0.12 && this._playerAlpha > 0.02) {
      const px = p.x + p.w / 2 - cam.x;
      const py = p.y + p.h * 0.35 - cam.y;
      const gx = cx + g.w * 0.5 + g.lean * g.facing * 6;
      const gy = cy + g.h * 0.5;
      const midX = (gx + px) * 0.5 + Math.sin(this.frame * 0.13) * 10;
      const midY = Math.min(gy, py) - 22 - Math.sin(this.frame * 0.09) * 6;
      const thick = (this.reason === "void" ? 2.4 : 2.1) + Math.sin(this.frame * 0.2) * 0.7;
      const tAlpha = alpha * (0.35 + this._playerAlpha * 0.4);

      ctx.lineCap = "round";
      ctx.globalAlpha = tAlpha * 0.35;
      ctx.strokeStyle = rgba(pal.tether, 0.55);
      ctx.lineWidth = thick + 4;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(midX, midY, px, py);
      ctx.stroke();

      ctx.globalAlpha = tAlpha * 0.85;
      ctx.strokeStyle = rgba(pal.tether, 0.95);
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(midX, midY, px, py);
      ctx.stroke();

      if (!this.reduce) {
        ctx.globalAlpha = tAlpha;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let k = 0; k < 3; k++) {
          const u = ((this.frame * 0.04 + k / 3) % 1);
          const ox = (1 - u) * (1 - u) * gx + 2 * (1 - u) * u * midX + u * u * px;
          const oy = (1 - u) * (1 - u) * gy + 2 * (1 - u) * u * midY + u * u * py;
          ctx.beginPath();
          ctx.arc(ox, oy, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Under-glow
    ctx.globalAlpha = alpha * 0.4 * g.form;
    const glow = ctx.createRadialGradient(
      cx + g.w / 2, cy + g.h * 0.55, 4,
      cx + g.w / 2, cy + g.h * 0.55, g.w * 1.1
    );
    glow.addColorStop(0, rgba(pal.glow, 0.75));
    glow.addColorStop(1, rgba(pal.glow, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx + g.w / 2, cy + g.h * 0.7, g.w * 0.85, g.h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    this._drawGhost(ctx, g, pal, alpha, this.frame, cx, cy);

    // Dissolve flash bloom
    if (progress > 0.85 && !this.reduce) {
      const d = (progress - 0.85) / 0.15;
      ctx.globalAlpha = (1 - d) * 0.5 * alpha;
      const hx = cx + g.w * 0.5;
      const hy = cy + g.h * 0.42;
      const br = 8 + d * 36;
      const burst = ctx.createRadialGradient(hx, hy, 0, hx, hy, br);
      burst.addColorStop(0, rgba(pal.flash, 0.8));
      burst.addColorStop(1, rgba(pal.glow, 0));
      ctx.fillStyle = burst;
      ctx.beginPath();
      ctx.arc(hx, hy, br, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};

export function start(player, onDone, opts) { return DeathFx.start(player, onDone, opts); }
export function update(game) { return DeathFx.update(game); }
export function draw(ctx, cam, t) { return DeathFx.draw(ctx, cam, t); }
export function isPlaying() { return DeathFx.isPlaying(); }
export function cancel() { return DeathFx.cancel(); }
export function playerAlpha() { return DeathFx.playerAlpha(); }
