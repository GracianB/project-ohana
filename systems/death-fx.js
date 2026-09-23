/**
 * Death carry-away FX — cinematic hooded reaper lifts the fallen player, then caller respawns.
 * Internal state only (deathGhost / souls / wisps / orbit). NEVER touches game.ghosts (dash afterimages).
 *
 * Phases (~294 frames / ~4.9s @60fps; ~105 if prefers-reduced-motion ≈ 1.75s):
 *   Appear → Claim (largo, fantasma grande) → Lift-off → Ascend → Apex → Dissolve → onDone
 * Ghost: silueta grande alto-contraste; vignette NO tapa el centro.
 *
 * API: DeathFx.start(player, onDone, opts?), update(game), draw(ctx,cam,t),
 *      isPlaying(), cancel(), playerAlpha()
 */
const PARTICLE_CAP = 72;
const WISP_CAP = 16;
const ORBIT_CAP = 12;
const WISP_INTERVAL = 3;
const DURATION_FULL = 294;
const DURATION_REDUCED = 105;

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
function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** High-contrast palettes — void = near-white cyan, hurt = near-white rose; both read on dark/light. */
const PALETTES = {
  void: {
    sheet: [235, 252, 255],
    sheetDeep: [40, 130, 210],
    hood: [0, 4, 14],
    eye: [120, 255, 255],
    glow: [90, 220, 255],
    soul: [180, 245, 255],
    tether: [140, 235, 255],
    vignette: [2, 12, 40],
    flash: [210, 250, 255],
  },
  hurt: {
    sheet: [255, 240, 248],
    sheetDeep: [210, 55, 120],
    hood: [18, 0, 10],
    eye: [255, 130, 200],
    glow: [255, 110, 180],
    soul: [255, 185, 220],
    tether: [255, 150, 200],
    vignette: [48, 2, 22],
    flash: [255, 210, 230],
  },
};

function rgba(rgb, a) {
  return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
}

/** Phase end fractions of total duration (shared by full + reduced). */
const PHASE = {
  // Claim largo y legible (~1.6s @294f) — el fantasma debe verse centrado
  appear: 0.08,
  claim: 0.40,
  liftoff: 0.52,
  ascend: 0.74,
  apex: 0.86,
  dissolve: 1.0,
};

export const DeathFx = {
  playing: false,
  player: null,
  onDone: null,
  doneCalled: false,
  frame: 0,
  duration: DURATION_FULL,
  reduce: false,
  reason: "hurt",
  palette: PALETTES.hurt,
  deathGhost: null,
  souls: null,
  wisps: null,
  orbit: null,
  _shakeOnce: false,
  _claimSparkBurst: false,
  _flashOnce: false,
  _appearBurst: false,
  _liftoffBurst: false,
  _apexBurst: false,
  _playerAlpha: 1,
  _ripple: 0,
  _tetherThick: 1,
  _hemBillow: 0,
  _orbitActive: false,
  _apexPulse: 0,

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
    this.orbit = null;
    this.player = null;
    this.onDone = null;
    this.doneCalled = true;
    this.frame = 0;
    this._playerAlpha = 1;
    this._orbitActive = false;
    this._apexPulse = 0;
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
    this.duration = this.reduce ? DURATION_REDUCED : DURATION_FULL;
    this._shakeOnce = false;
    this._claimSparkBurst = false;
    this._flashOnce = false;
    this._appearBurst = false;
    this._liftoffBurst = false;
    this._apexBurst = false;
    this._playerAlpha = 1;
    this._ripple = 0;
    this._tetherThick = 1;
    this._hemBillow = 0;
    this._orbitActive = false;
    this._apexPulse = 0;

    const side = (player.facing || 1) >= 0 ? -1 : 1;
    // ~2.0× prior 42×56 — reads large / near full-figure on 720p canvas
    const gw = 84;
    const gh = 112;
    this.deathGhost = {
      x: player.x + side * (player.w * 0.55 + 28),
      y: player.y + player.h * 0.05 - 36,
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
      armWrap: 0,
    };
    this.deathGhost.spawnX = this.deathGhost.x;
    this.deathGhost.spawnY = this.deathGhost.y;

    // Preallocated pools — recycled, no heavy per-frame alloc
    this.souls = [];
    this.wisps = [];
    this.orbit = [];
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
    for (let i = 0; i < ORBIT_CAP; i++) {
      this.orbit.push({
        alive: false, ang: 0, rad: 0, elev: 0, speed: 0, r: 2, tw: 0, life: 0, max: 1,
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
    slot.max = 32 + Math.random() * 44;
    slot.r = 1.2 + Math.random() * 2.4;
    slot.tw = Math.random() * Math.PI * 2;
    slot.pull = towardGhost ? 0.032 + Math.random() * 0.038 : 0.01;
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
    slot.max = 16 + Math.random() * 10;
    slot.alpha = 0.38;
  },

  _spawnOrbit(count) {
    if (!this.orbit || this.reduce) return;
    let spawned = 0;
    for (let i = 0; i < this.orbit.length && spawned < count; i++) {
      const o = this.orbit[i];
      if (o.alive) continue;
      o.alive = true;
      o.ang = Math.random() * Math.PI * 2;
      o.rad = 18 + Math.random() * 22;
      o.elev = (Math.random() - 0.5) * 28;
      o.speed = 0.045 + Math.random() * 0.05;
      o.r = 1.4 + Math.random() * 2.2;
      o.tw = Math.random() * Math.PI * 2;
      o.life = 0;
      o.max = 40 + Math.random() * 50;
      spawned++;
    }
  },

  update(game) {
    if (!this.playing || !this.deathGhost) return;
    const p = this.player || (game && game.player);
    const g = this.deathGhost;
    const previousProgress = clamp01(this.frame / this.duration);
    this.frame++;
    const progress = clamp01(this.frame / this.duration);
    g.phase = progress;

    if (!this._shakeOnce && game && previousProgress < PHASE.appear && progress >= PHASE.appear) {
      this._shakeOnce = true;
      const kick = this.reduce ? 3 : (this.reason === "void" ? 7 : 6);
      game.shake = Math.max(game.shake || 0, kick, 1);
    }

    const liftMax = this.reduce ? 110 : 220;

    // ── 1. Appear 0–12% — materialize, mote burst, ground ripple ──
    if (progress < PHASE.appear) {
      // Steep early fade so silhouette is readable within ~8–10 frames
      const a = easeOutCubic(smoothstep(progress / PHASE.appear));
      g.form = a;
      g.alpha = Math.max(a, progress > 0.02 ? 0.55 : a);
      g.lean = 0;
      g.armWrap = 0;
      g.eyeGlow = 0.35 + a * 0.25;
      g.lift = 0;
      this._ripple = a;
      this._tetherThick = 0.4;
      this._hemBillow = 0.2 * a;
      this._playerAlpha = 1;
      this._orbitActive = false;
      this._apexPulse = 0;
      if (!this._appearBurst && a > 0.35) {
        this._appearBurst = true;
        if (!this.reduce) {
          const cx = g.x + g.w * 0.5;
          const cy = g.y + g.h * 0.45;
          for (let i = 0; i < 18; i++) this._spawnSoul(cx, cy, false, true);
        } else {
          const cx = g.x + g.w * 0.5;
          const cy = g.y + g.h * 0.45;
          for (let i = 0; i < 6; i++) this._spawnSoul(cx, cy, false, true);
        }
      }
    }
    // ── 2. Approach / Claim 12–28% — lean in, sheet arms wrap, tether thickens ──
    else if (progress < PHASE.claim) {
      const c = smoothstep((progress - PHASE.appear) / (PHASE.claim - PHASE.appear));
      g.form = 1;
      g.alpha = 1;
      g.lean = c * 0.62;
      g.armWrap = c;
      g.eyeGlow = 0.6 + c * 0.3;
      g.lift = 0;
      this._ripple = Math.max(0, 1 - c * 1.3);
      this._tetherThick = lerp(0.4, 1.35, c);
      this._hemBillow = 0.35 + c * 0.25;
      this._playerAlpha = lerp(1, 0.78, c);
      this._orbitActive = false;
      if (p) {
        if (!this._claimSparkBurst) {
          this._claimSparkBurst = true;
          if (this.reason === "hurt") {
            for (let i = 0; i < 2; i++) {
              this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.4, true, false);
            }
          }
        }
        // Soft settle toward ghost — feet still grounded
        p.y = g.grabY - c * 4;
        const tx = p.x + (g.facing > 0 ? -g.w * 0.15 : p.w - g.w * 0.85);
        g.x += (tx - g.x) * 0.07;
        g.y += ((p.y - g.h * 0.28) - g.y) * 0.08;
        if (!this.reduce) {
          this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.35, true, false);
          // A brief claim-only double emission makes the tether feel audible.
          if ((this.frame % 3) === 0) {
            this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.48, true, false);
          }
        }
      }
    }
    // ── 3. Lift-off 28–40% — first tug upward, feet leave ground ──
    else if (progress < PHASE.liftoff) {
      const u = smoothstep((progress - PHASE.claim) / (PHASE.liftoff - PHASE.claim));
      g.form = 1;
      g.alpha = 1;
      g.lean = lerp(0.62, 0.4, u);
      g.armWrap = lerp(1, 0.75, u);
      g.eyeGlow = 0.9 + Math.sin(this.frame * 0.2) * 0.1;
      g.lift = easeOutCubic(u) * (this.reduce ? 28 : 48);
      this._ripple = 0;
      this._tetherThick = lerp(1.35, 1.1, u);
      this._hemBillow = 0.6 + u * 0.3;
      this._playerAlpha = lerp(0.78, 0.62, u);
      this._orbitActive = false;
      this._apexPulse = 0;
      if (p) {
        p.y = g.grabY - g.lift;
        const sway = Math.sin(this.frame * 0.12) * 2.5 * u;
        p.x += sway * 0.15;
        g.y = p.y - 12 - Math.sin(this.frame * 0.15) * 2;
        g.x += Math.sin(this.frame * 0.08) * 0.35;
        if (!this._liftoffBurst && u > 0.25) {
          this._liftoffBurst = true;
          const n = this.reduce ? 4 : 10;
          for (let i = 0; i < n; i++) {
            this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.85, false, true);
          }
        }
        if (!this.reduce && (this.frame % 2) === 0) {
          this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.5, true, false);
        }
      }
    }
    // ── 4. Ascend 40–72% — long float with sway, billowing hem, soul trail, local wisps ──
    else if (progress < PHASE.ascend) {
      const u = (progress - PHASE.liftoff) / (PHASE.ascend - PHASE.liftoff);
      const ease = this.reduce ? smoothstep(u) : easeInOutCubic(u);
      g.form = 1;
      g.alpha = 1;
      g.lean = lerp(0.4, 0.18, u);
      g.armWrap = lerp(0.75, 0.35, u);
      g.eyeGlow = 0.85 + Math.sin(this.frame * 0.16) * 0.14;
      const baseLift = this.reduce ? 48 : 48;
      g.lift = baseLift + ease * (liftMax - baseLift);
      this._ripple = 0;
      this._tetherThick = 1.0 + Math.sin(this.frame * 0.11) * 0.15;
      this._hemBillow = 0.85 + Math.sin(this.frame * 0.09) * 0.2;
      this._playerAlpha = lerp(0.62, 0.38, ease);
      this._orbitActive = false;
      this._apexPulse = 0;

      if (p) {
        const sway = Math.sin(this.frame * 0.075) * (this.reduce ? 3 : 6.5);
        p.y = g.grabY - g.lift;
        const targetX = g.spawnX + (g.facing > 0 ? g.w * 0.2 : -p.w * 0.1) + sway * 0.45;
        p.x += (targetX - p.x) * 0.08;
      }
      g.y = (p ? p.y : g.grabY) - 28 - Math.sin(this.frame * 0.1) * 4.5;
      g.x += Math.sin(this.frame * 0.055) * 0.55;
      // Soft pull toward screen center so lift/void deaths don't leave ghost off-canvas
      if (game && game.cam) {
        const vw = (typeof document !== "undefined" && document.getElementById("game"))
          ? document.getElementById("game").width : 960;
        const vh = (typeof document !== "undefined" && document.getElementById("game"))
          ? document.getElementById("game").height : 540;
        const wantX = game.cam.x + vw * 0.5 - g.w * 0.5;
        const wantY = game.cam.y + vh * 0.42 - g.h * 0.5;
        const pull = this.reduce ? 0.04 : 0.06;
        g.x += (wantX - g.x) * pull * ease;
        g.y += (wantY - g.y) * pull * ease;
      }

      if (!this.reduce && p) {
        // Dense soul trail upward
        if ((this.frame % 2) === 0) {
          this._spawnSoul(
            p.x + p.w * 0.5 + (Math.random() - 0.5) * 10,
            p.y + p.h * 0.55 + (Math.random() - 0.5) * 6,
            true,
            false
          );
        }
        // Occasional trailing mote below feet
        if ((this.frame % 5) === 0) {
          this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.9, false, false);
        }
        if ((this.frame % WISP_INTERVAL) === 0) this._spawnWisp(p);
      } else if (this.reduce && p && (this.frame % 4) === 0) {
        this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.45, true, false);
      }
    }
    // ── 5. Apex linger 72–85% — epic hover, brighter eyes, orbiting particles ──
    else if (progress < PHASE.apex) {
      const u = smoothstep((progress - PHASE.ascend) / (PHASE.apex - PHASE.ascend));
      g.form = 1;
      g.alpha = 1;
      g.lean = 0.15;
      g.armWrap = 0.3;
      g.eyeGlow = 1.18 + Math.sin(this.frame * 0.22) * 0.16 + u * 0.18;
      g.lift = liftMax + Math.sin(this.frame * 0.12) * (this.reduce ? 2 : 5);
      this._ripple = 0;
      this._tetherThick = 0.85;
      this._hemBillow = 0.7 + Math.sin(this.frame * 0.14) * 0.15;
      this._playerAlpha = lerp(0.38, 0.28, u);
      this._orbitActive = !this.reduce;
      this._apexPulse = this.reduce ? 0 : 0.55 + Math.sin(this.frame * 0.16) * 0.3;

      if (!this._apexBurst) {
        this._apexBurst = true;
        this._spawnOrbit(this.reduce ? 0 : ORBIT_CAP);
        if (!this.reduce && p) {
          for (let i = 0; i < 8; i++) {
            this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.4, true, true);
          }
        }
      }

      if (p) {
        const hover = Math.sin(this.frame * 0.14) * 2.5;
        p.y = g.grabY - g.lift + hover * 0.3;
        p.x += Math.sin(this.frame * 0.09) * 0.2;
      }
      g.y = (p ? p.y : g.grabY) - 30 - Math.sin(this.frame * 0.13) * 3;
      g.x += Math.sin(this.frame * 0.07) * 0.3;
      if (game && game.cam) {
        const canvasEl = (typeof document !== "undefined") ? document.getElementById("game") : null;
        const vw = canvasEl ? canvasEl.width : 960;
        const vh = canvasEl ? canvasEl.height : 540;
        const wantX = game.cam.x + vw * 0.5 - g.w * 0.5;
        const wantY = game.cam.y + vh * 0.4 - g.h * 0.5;
        g.x += (wantX - g.x) * 0.08;
        g.y += (wantY - g.y) * 0.08;
      }

      if (!this.reduce && p && (this.frame % 3) === 0) {
        this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.4, true, false);
      }
    }
    // ── 6. Dissolve 85–100% — player → motes into ghost, ghost rises+fades, flash, onDone ──
    else {
      const d = (progress - PHASE.apex) / (PHASE.dissolve - PHASE.apex);
      const di = easeInCubic(d);
      g.form = 1;
      g.lean = 0.12;
      g.armWrap = Math.max(0, 0.3 * (1 - di));
      g.eyeGlow = 1.2 - di * 0.55;
      g.alpha = 1 - easeInCubic(Math.max(0, (d - 0.28) / 0.72));
      this._playerAlpha = Math.max(0, 0.28 * (1 - di * 1.2));
      this._tetherThick = Math.max(0.15, 0.85 * (1 - di));
      this._hemBillow = 0.5 * (1 - di);
      g.lift = liftMax + di * (this.reduce ? 50 : 95);
      this._orbitActive = !this.reduce && d < 0.55;
      this._apexPulse = 0;

      if (p) {
        p.y = g.grabY - g.lift;
        const hx = g.x + g.w * 0.5 - p.w * 0.5;
        const hy = g.y + g.h * 0.42 - p.h * 0.35;
        p.x = lerp(p.x, hx, 0.1 + di * 0.28);
        p.y = lerp(p.y, hy, di * 0.22);
        if (d < 0.75) {
          const burstRate = this.reduce ? ((this.frame % 3) === 0) : true;
          if (burstRate) {
            this._spawnSoul(p.x + p.w * 0.5, p.y + p.h * 0.4, true, !this.reduce);
          }
        }
      }
      g.y = (p ? p.y : g.grabY) - 14 - di * 28 - Math.sin(this.frame * 0.14) * 2;
      g.x += Math.sin(this.frame * 0.08) * 0.25;

      if (!this._flashOnce && d > 0.5 && game) {
        this._flashOnce = true;
        game.flash = Math.max(game.flash || 0, this.reduce ? 5 : 9);
      }
    }

    if (p) {
      p.vx = 0;
      p.vy = 0;
      p.dead = true;
    }

    // Soul particle simulation
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

    // Local wisps (NOT game.ghosts)
    if (this.wisps) {
      for (let i = 0; i < this.wisps.length; i++) {
        const w = this.wisps[i];
        if (!w.alive) continue;
        w.life++;
        w.y -= 0.4;
        w.alpha = (1 - w.life / w.max) * 0.34;
        if (w.life >= w.max) w.alive = false;
      }
    }

    // Apex orbit particles around ghost
    if (this.orbit) {
      for (let i = 0; i < this.orbit.length; i++) {
        const o = this.orbit[i];
        if (!o.alive) continue;
        o.life++;
        o.ang += o.speed;
        o.tw += 0.2;
        if (!this._orbitActive || o.life >= o.max) o.alive = false;
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
    this.orbit = null;
    this.player = null;
    this.onDone = null;
    this.frame = 0;
    this._playerAlpha = 1;
    this._orbitActive = false;
    this._apexPulse = 0;
    if (cb) cb();
  },

  _drawGhost(ctx, g, pal, alpha, frame, cx, cy) {
    const form = g.form;
    if (form < 0.02) return;

    const wobble = this.reduce ? 0 : Math.sin(frame * 0.14) * 1.5;
    const leanX = g.lean * (g.facing || 1) * 10;
    const billow = this._hemBillow || 0;

    ctx.save();
    ctx.globalAlpha = alpha * form;
    ctx.translate(cx + g.w / 2 + leanX, cy + g.h / 2 + wobble);
    ctx.scale(g.facing || 1, 1);
    ctx.scale(1 + g.lean * 0.06, 1 - g.lean * 0.04);
    ctx.translate(-g.w / 2, -g.h / 2);

    const w = g.w;
    const h = g.h;
    const hem = this.reduce ? 0.35 : 1;

    // Outer aura
    ctx.globalAlpha = alpha * 0.48 * form;
    ctx.fillStyle = rgba(pal.glow, 0.75);
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

    // Main sheet + ragged animated hem (billow scales wave amplitude)
    ctx.globalAlpha = alpha * 0.96 * form;
    const sheetGrad = ctx.createLinearGradient(0, 0, 0, h);
    sheetGrad.addColorStop(0, rgba(pal.sheet, 1));
    sheetGrad.addColorStop(0.45, rgba(pal.sheet, 0.92));
    sheetGrad.addColorStop(1, rgba(pal.sheetDeep, 0.7));
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
    const amp = hem * (3.5 + billow * 4.5);
    for (let i = 0; i < waves.length; i++) {
      const wx = waves[i][0] * w;
      const dip = waves[i][1];
      const wave = Math.sin(frame * 0.16 + i * 0.9) * (amp + dip * 2.5 * (0.6 + billow));
      ctx.lineTo(wx, hemY - dip * 5 + wave);
    }
    ctx.quadraticCurveTo(w * 0.1, h * 0.72, w * 0.1, h * 0.48);
    ctx.quadraticCurveTo(w * 0.05, h * 0.18, w * 0.5, 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = alpha * form;
    ctx.strokeStyle = rgba(pal.glow, 1);
    ctx.lineWidth = 3.0;
    ctx.stroke();
    // Dark rim — readable on bright world backgrounds
    ctx.globalAlpha = alpha * 0.7 * form;
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 3.6;
    ctx.stroke();

    // Subtle apex sheet flare, kept inside the silhouette for readability.
    if (!this.reduce && g.phase >= PHASE.ascend && g.phase < PHASE.apex) {
      const apexT = smoothstep((g.phase - PHASE.ascend) / (PHASE.apex - PHASE.ascend));
      ctx.globalAlpha = alpha * (0.06 + apexT * 0.06) * form;
      ctx.fillStyle = rgba(pal.flash, 0.7);
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.38, w * 0.42, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hood void — near-black for max contrast against bright sheet
    ctx.globalAlpha = alpha * form;
    ctx.fillStyle = rgba(pal.hood, 0.97);
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.3, w * 0.32, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba([0, 0, 0], 0.82);
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.32, w * 0.22, h * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twin eye glow
    const eyeA = alpha * form * (0.88 + g.eyeGlow * 0.22);
    const er = 3.2 + g.eyeGlow * 2.2;
    const eyeY = h * 0.33;
    const eyes = [w * 0.38, w * 0.62];
    for (let e = 0; e < 2; e++) {
      const ex = eyes[e];
      ctx.globalAlpha = eyeA * 0.35;
      const eg = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, er * 3.2);
      eg.addColorStop(0, rgba(pal.eye, 1));
      eg.addColorStop(1, rgba(pal.eye, 0));
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, eyeY, er * 3.2, 0, Math.PI * 2);
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

    // Soft arm wrap during claim / lift-off (driven by armWrap)
    const wrap = g.armWrap != null ? g.armWrap : (g.lean > 0.05 ? g.lean : 0);
    if (wrap > 0.05) {
      ctx.globalAlpha = alpha * 0.38 * wrap * form;
      ctx.strokeStyle = rgba(pal.sheet, 0.85);
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 0.48);
      ctx.quadraticCurveTo(w * 1.08, h * 0.55, w * 0.92, h * 0.72);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.48);
      ctx.quadraticCurveTo(-0.08 * w, h * 0.55, w * 0.08, h * 0.72);
      ctx.stroke();
      // Inner wrap glow
      ctx.globalAlpha = alpha * 0.2 * wrap * form;
      ctx.strokeStyle = rgba(pal.glow, 0.7);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(w * 0.72, h * 0.5);
      ctx.quadraticCurveTo(w * 1.0, h * 0.58, w * 0.88, h * 0.68);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.5);
      ctx.quadraticCurveTo(0, h * 0.58, w * 0.12, h * 0.68);
      ctx.stroke();
    }

    ctx.restore();
  },

  draw(ctx, cam, t) {
    if (!this.playing || !this.deathGhost) return;
    const g = this.deathGhost;
    const p = this.player;
    const pal = this.palette;
    const vw = ctx.canvas ? ctx.canvas.width : 960;
    const vh = ctx.canvas ? ctx.canvas.height : 540;
    const progress = g.phase;
    // Keep pulse near 1 — prior 0.55 base made the silhouette almost invisible
    const pulse = 0.94 + Math.sin((t || this.frame) * 0.14) * 0.06;
    const alpha = Math.min(1, g.alpha * pulse);

    // Screen-space position; bias to center on ascend/apex/void so ghost never leaves canvas
    let cx = g.x - cam.x;
    let cy = g.y - cam.y;
    const preferX = vw * 0.5 - g.w * 0.5;
    const preferY = vh * 0.4 - g.h * 0.5;
    let bias = 0;
    if (progress >= PHASE.ascend) bias = 0.55;
    else if (progress >= PHASE.liftoff) bias = 0.28;
    else if (this.reason === "void") bias = 0.4;
    if (bias > 0) {
      cx = lerp(cx, preferX, bias);
      cy = lerp(cy, preferY, bias);
    }
    const margin = 6;
    cx = Math.max(margin, Math.min(cx, vw - g.w - margin));
    cy = Math.max(margin, Math.min(cy, vh - g.h - margin));

    ctx.save();

    // Vignette UNDER ghost: soft edge darken + large clear hole on silhouette
    if (!this.reduce && alpha > 0.05) {
      const gx = cx + g.w * 0.5;
      const gy = cy + g.h * 0.42;
      // Intentionally low — void used to crush contrast at ~0.32–0.38
      const vigA = (this.reason === "void" ? 0.16 : 0.12) * alpha * Math.min(1, progress * 1.5);
      const clearR = Math.max(g.h * 1.05, Math.min(vw, vh) * 0.28);
      const vg = ctx.createRadialGradient(gx, gy, clearR, gx, gy, Math.max(vw, vh) * 0.78);
      vg.addColorStop(0, rgba(pal.vignette, 0));
      vg.addColorStop(0.6, rgba(pal.vignette, vigA * 0.3));
      vg.addColorStop(1, rgba(pal.vignette, vigA));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, vw, vh);
    }

    // Appear ripple
    if (this._ripple > 0.02) {
      const rx = cx + g.w * 0.5;
      const ry = cy + g.h * 0.85;
      const rr = 12 + this._ripple * 52;
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
      if (this._ripple > 0.5) {
        ctx.globalAlpha = this._ripple * 0.12;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rr * 1.25, rr * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
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

    // Orbit particles around ghost (apex)
    if (this.orbit && this._orbitActive) {
      const ox = cx + g.w * 0.5;
      const oy = cy + g.h * 0.42;
      for (let i = 0; i < this.orbit.length; i++) {
        const o = this.orbit[i];
        if (!o.alive) continue;
        const lifeA = 1 - o.life / o.max;
        const px = ox + Math.cos(o.ang) * o.rad;
        const py = oy + Math.sin(o.ang) * o.rad * 0.55 + o.elev;
        const tw = 0.6 + Math.sin(o.tw) * 0.4;
        ctx.globalAlpha = lifeA * tw * alpha * 0.9;
        const og = ctx.createRadialGradient(px, py, 0, px, py, o.r * 2.4);
        og.addColorStop(0, rgba(pal.eye, 1));
        og.addColorStop(1, rgba(pal.glow, 0));
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(px, py, o.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = lifeA * alpha;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(px, py, o.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Apex halo / pulse ring — one restrained cue to make the linger feel special.
    if (!this.reduce && progress >= PHASE.ascend && progress < PHASE.apex) {
      const apexT = smoothstep((progress - PHASE.ascend) / (PHASE.apex - PHASE.ascend));
      const apexPulse = this._apexPulse || 0;
      const hx = cx + g.w * 0.5;
      const hy = cy + g.h * 0.42;
      const ringR = 28 + apexT * 10 + apexPulse * 4;
      ctx.globalAlpha = alpha * (0.07 + apexPulse * 0.05);
      ctx.strokeStyle = rgba(pal.flash, 0.75);
      ctx.lineWidth = 1.2 + apexPulse * 0.9;
      ctx.beginPath();
      ctx.ellipse(hx, hy, ringR, ringR * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha * (0.05 + apexPulse * 0.04);
      const halo = ctx.createRadialGradient(hx, hy, 4, hx, hy, ringR * 0.9);
      halo.addColorStop(0, rgba(pal.flash, 0.42));
      halo.addColorStop(1, rgba(pal.glow, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(hx, hy, ringR * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing tether (thickens during claim)
    if (p && progress > PHASE.appear * 0.85 && this._playerAlpha > 0.02) {
      const px = p.x + p.w / 2 - cam.x;
      const py = p.y + p.h * 0.35 - cam.y;
      const gx = cx + g.w * 0.5 + g.lean * g.facing * 6;
      const gy = cy + g.h * 0.5;
      const midX = (gx + px) * 0.5 + Math.sin(this.frame * 0.13) * 10;
      const midY = Math.min(gy, py) - 22 - Math.sin(this.frame * 0.09) * 6;
      const thickBase = (this.reason === "void" ? 2.4 : 2.1) * (this._tetherThick || 1);
      const thick = thickBase + Math.sin(this.frame * 0.2) * 0.7;
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
        const beads = progress > PHASE.liftoff ? 5 : 3;
        ctx.globalAlpha = tAlpha;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let k = 0; k < beads; k++) {
          const u = ((this.frame * 0.035 + k / beads) % 1);
          const ox = (1 - u) * (1 - u) * gx + 2 * (1 - u) * u * midX + u * u * px;
          const oy = (1 - u) * (1 - u) * gy + 2 * (1 - u) * u * midY + u * u * py;
          ctx.beginPath();
          ctx.arc(ox, oy, 1.5 + (this._tetherThick > 1.1 ? 0.4 : 0), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Under-glow
    ctx.globalAlpha = alpha * 0.55 * g.form;
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

    // Escala cinema: fantasma más grande y centrado en claim (silueta inconfundible)
    let drawCx = cx, drawCy = cy;
    let scaleBoost = 1;
    if (progress < PHASE.claim) {
      const claimT = progress < PHASE.appear
        ? smoothstep(progress / PHASE.appear) * 0.35
        : 0.35 + 0.65 * smoothstep((progress - PHASE.appear) / (PHASE.claim - PHASE.appear));
      scaleBoost = 1 + claimT * 0.55;
    } else if (progress < PHASE.liftoff) {
      scaleBoost = 1.55;
    } else {
      scaleBoost = 1.35;
    }
    if (scaleBoost !== 1) {
      const gx = cx + g.w * 0.5;
      const gy = cy + g.h * 0.5;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(scaleBoost, scaleBoost);
      ctx.translate(-gx, -gy);
      this._drawGhost(ctx, g, pal, alpha, this.frame, drawCx, drawCy);
      ctx.restore();
    } else {
      this._drawGhost(ctx, g, pal, alpha, this.frame, drawCx, drawCy);
    }

    // Etiqueta CLAIM legible en fase de captura
    if (progress >= PHASE.appear && progress < PHASE.liftoff && !this.reduce) {
      const claimU = progress < PHASE.claim
        ? smoothstep((progress - PHASE.appear) / Math.max(0.001, PHASE.claim - PHASE.appear))
        : 1;
      const labelA = alpha * (progress < PHASE.claim ? claimU : Math.max(0, 1 - (progress - PHASE.claim) / (PHASE.liftoff - PHASE.claim)));
      if (labelA > 0.05) {
        const lx = cx + g.w * 0.5;
        const ly = cy - 18 * scaleBoost;
        ctx.save();
        ctx.globalAlpha = labelA;
        ctx.font = "800 18px Fredoka, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(pal.flash, 1);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 4;
        const label = this.reason === "void" ? "VACÍO…" : "TE RECLAMA…";
        ctx.strokeText(label, lx, ly);
        ctx.fillText(label, lx, ly);
        ctx.restore();
      }
    }

    // Dissolve flash bloom
    if (progress > PHASE.apex && !this.reduce) {
      const d = (progress - PHASE.apex) / (PHASE.dissolve - PHASE.apex);
      ctx.globalAlpha = Math.sin(Math.min(1, d * 1.4) * Math.PI) * 0.55 * alpha;
      const hx = cx + g.w * 0.5;
      const hy = cy + g.h * 0.42;
      const br = 10 + d * 48;
      const burst = ctx.createRadialGradient(hx, hy, 0, hx, hy, br);
      burst.addColorStop(0, rgba(pal.flash, 0.85));
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
