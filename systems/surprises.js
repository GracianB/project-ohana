// Sorpresas jugables: pez dorado, lluvia de estrellas, power-up secreto del hub.
import { showNotification } from "./notify.js";

const GOLD_ROOMS = { beach: true, reef: true };
const STAR_DURATION = 480; // ~8s @ 60fps
const STAR_DELAY_MIN = 90;
const STAR_DELAY_MAX = 180;
const AURA_SPARKLE_EVERY = 5;

function emitStars(game, x, y, count, color) {
  if (!game || !game.fx) return;
  const n = game.reduceMotion ? Math.max(2, Math.floor(count / 3)) : count;
  try {
    game.fx.emit(x, y, {
      color: color || "#ffe66a",
      count: n,
      size: 3.2,
      up: 1.6,
      speed: 2.8,
      life: 18,
      star: true,
    });
  } catch (_) {}
}

export const Surprises = {
  // Pez dorado: como máximo uno marcado por sala al spawnear
  _goldenMarked: false,
  _goldRoom: null,

  // Lluvia de estrellas (space)
  starDelay: 0,
  starLeft: 0,
  starActive: false,
  _skyPulse: 0,

  // Power-up secreto (hub, 1× por run)
  secret: null, // {x,y,r,taken,secret:true} | null
  flags: { secretHubTaken: false },

  reset() {
    this._goldenMarked = false;
    this._goldRoom = null;
    this.starDelay = 0;
    this.starLeft = 0;
    this.starActive = false;
    this._skyPulse = 0;
    this.secret = null;
    this.flags.secretHubTaken = false;
  },

  /** Tras makeFoe: marca pez dorado en beach/reef (1/12, máx. 1 por sala). */
  onMakeFoe(e, roomId) {
    if (!e || e.kind !== "pez") return;
    if (!GOLD_ROOMS[roomId]) return;
    if (this._goldRoom !== roomId) {
      this._goldRoom = roomId;
      this._goldenMarked = false;
    }
    if (this._goldenMarked) return;
    if (Math.random() >= 1 / 12) return;
    this._goldenMarked = true;
    e.golden = true;
    e.color = "#f0c040";
    const boost = Math.max(1, Math.round(e.hp * 0.3));
    e.hp += boost;
    e.max = Math.max(e.max || e.hp, e.hp);
  },

  /** Final de loadRoom: programa eventos de sala. */
  onEnterRoom(game) {
    if (!game) return;
    // Star rain: stop when leaving space
    if (game.roomId !== "space") {
      this.starDelay = 0;
      this.starLeft = 0;
      this.starActive = false;
      this._skyPulse = 0;
    } else {
      // ~70% chance per visit; delay 90–180 frames
      this.starActive = false;
      this.starLeft = 0;
      this._skyPulse = 0;
      if (Math.random() < 0.7) {
        this.starDelay =
          STAR_DELAY_MIN +
          Math.floor(Math.random() * (STAR_DELAY_MAX - STAR_DELAY_MIN + 1));
      } else {
        this.starDelay = 0;
      }
    }

    // Hub secret pickup — once per run
    if (game.roomId === "hub" && !this.flags.secretHubTaken) {
      // Esquina SE del claro, sobre el suelo (y=810), lejos de la catapulta
      this.secret = { x: 1480, y: 772, r: 14, taken: false, secret: true };
    } else {
      this.secret = null;
    }
  },

  /** Antes del heal genérico al matar. Pez dorado → bonus + aura cosmética. */
  onEnemyKilled(e, game) {
    if (!e || !e.golden || !game || !game.player) return;
    const p = game.player;
    p.health = Math.min(p.maxHealth, p.health + 25);
    game.score = (game.score || 0) + 80;
    p._surpriseAura = Math.max(p._surpriseAura || 0, 720);
    game.flash = Math.max(game.flash || 0, 10);
    game.shake = Math.max(game.shake || 0, 8);
    emitStars(game, e.x + (e.w || 0) / 2, e.y + (e.h || 0) / 2, 22, "#f0c040");
    emitStars(game, e.x + (e.w || 0) / 2, e.y, 10, "#ffe8a0");
    try {
      if (game.nums) game.nums.add(e.x, e.y - 10, "+HP", "#f0c040");
    } catch (_) {}
    try {
      showNotification("¡PEZ DORADO!", "Brillo temporal. +HP", "sala");
    } catch (_) {}
  },

  /** Bonus XP extra por orb mientras dura la lluvia de estrellas. */
  starOrbBonus() {
    return this.starActive && this.starLeft > 0 ? 2 : 0;
  },

  update(game, t) {
    if (!game || !game.player) return;
    const p = game.player;

    // --- Aura cosmética (trail sparkles) ---
    if ((p._surpriseAura || 0) > 0) {
      p._surpriseAura--;
      if (!game.reduceMotion && (t % AURA_SPARKLE_EVERY === 0) && game.fx) {
        try {
          game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, {
            color: "#f0c040",
            count: 1,
            size: 2.2,
            up: 0.6,
            speed: 0.9,
            life: 12,
            star: true,
            gravity: 0.01,
          });
        } catch (_) {}
      }
    }

    // --- Lluvia de estrellas (solo space) ---
    if (game.roomId === "space") {
      if (!this.starActive && this.starDelay > 0) {
        this.starDelay--;
        if (this.starDelay <= 0) {
          this.starActive = true;
          this.starLeft = STAR_DURATION;
          this._skyPulse = 0;
          try {
            showNotification(
              "LLUVIA DE ESTRELLAS",
              "Órbita brilla. Cristales +XP",
              "sala"
            );
          } catch (_) {}
        }
      }
      if (this.starActive && this.starLeft > 0) {
        this.starLeft--;
        this._skyPulse++;
        const roomW = game.worldW || 1600;
        const every = game.reduceMotion ? 8 : 3;
        if (this._skyPulse % every === 0 && game.fx) {
          const x = Math.random() * roomW;
          const y = -10 - Math.random() * 40;
          try {
            game.fx.emit(x, y, {
              color: Math.random() < 0.5 ? "#ffe66a" : "#c8e8ff",
              count: game.reduceMotion ? 1 : 2,
              size: 2.5 + Math.random() * 2,
              up: -0.2,
              speed: 0.4 + Math.random() * 0.6,
              life: 40 + (Math.random() * 20) | 0,
              star: true,
              gravity: 0.08 + Math.random() * 0.06,
              angle: Math.PI / 2 + (Math.random() - 0.5) * 0.3,
              spread: 0.15,
            });
          } catch (_) {}
        }
        if (this.starLeft <= 0) {
          this.starActive = false;
        }
      }
    } else if (this.starActive || this.starDelay > 0) {
      this.starActive = false;
      this.starDelay = 0;
      this.starLeft = 0;
    }

    // --- Power-up secreto (hub) ---
    const s = this.secret;
    if (s && !s.taken && game.roomId === "hub" && !p.dead) {
      const dx = p.x + p.w / 2 - s.x;
      const dy = p.y + p.h / 2 - s.y;
      if (Math.hypot(dx, dy) < 36) {
        s.taken = true;
        this.flags.secretHubTaken = true;
        game._secretHubTaken = true;
        p.invuln = Math.max(p.invuln || 0, 90);
        p.dash = 28;
        p.vx = 14 * (p.facing || 1);
        game.score = (game.score || 0) + 50;
        p._surpriseAura = Math.max(p._surpriseAura || 0, 360);
        game.flash = Math.max(game.flash || 0, 8);
        emitStars(game, s.x, s.y, 16, "#a8e0ff");
        emitStars(game, s.x, s.y, 8, "#ffffff");
        try {
          if (game.nums) game.nums.add(s.x, s.y, "+!", "#a8e0ff");
        } catch (_) {}
        try {
          showNotification("¡SORPRESA!", "Escudo corto + dash", "sala");
        } catch (_) {}
        this.secret = null;
      }
    }
  },

  draw(ctx, cam, t, game) {
    if (!ctx || !cam) return;

    // Cielo más brillante durante lluvia de estrellas
    if (this.starActive && this.starLeft > 0 && game && game.roomId === "space") {
      const a = 0.08 + 0.06 * Math.sin((this._skyPulse || 0) / 18);
      ctx.save();
      ctx.fillStyle = `rgba(200,220,255,${a})`;
      ctx.fillRect(0, 0, ctx.canvas ? ctx.canvas.width : 1280, ctx.canvas ? ctx.canvas.height : 720);
      ctx.restore();
    }

    // Cristal fantasma del hub
    const s = this.secret;
    if (s && !s.taken) {
      const p = game && game.player;
      const sx = s.x - cam.x;
      const sy = s.y - cam.y + Math.sin((t || 0) / 12) * 3;
      let near = 0;
      if (p) {
        const dist = Math.hypot(p.x + p.w / 2 - s.x, p.y + p.h / 2 - s.y);
        near = Math.max(0, 1 - dist / 220);
      }
      const pulse = 0.5 + 0.5 * Math.sin((t || 0) / 10);
      const alpha = 0.08 + near * 0.45 + pulse * 0.06;
      ctx.save();
      ctx.globalAlpha = alpha;
      // soft glow
      ctx.fillStyle = "rgba(160,220,255,.35)";
      ctx.beginPath();
      ctx.arc(sx, sy, 12 + near * 4, 0, Math.PI * 2);
      ctx.fill();
      // diamond crystal
      ctx.fillStyle = "#c8ecff";
      ctx.beginPath();
      ctx.moveTo(sx, sy - 10);
      ctx.lineTo(sx + 7, sy);
      ctx.lineTo(sx, sy + 10);
      ctx.lineTo(sx - 7, sy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.moveTo(sx, sy - 10);
      ctx.lineTo(sx + 3, sy - 2);
      ctx.lineTo(sx, sy + 2);
      ctx.lineTo(sx - 3, sy - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
};
