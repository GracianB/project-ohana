// Sorpresas jugables: pez dorado, lluvia de estrellas, GOD y power-ups de sala.
import { showNotification } from "./notify.js";
import { Rain } from "./rain.js";

const GOLD_ROOMS = { beach: true, reef: true };
const STAR_DURATION = 480; // ~8s @ 60fps
const STAR_DELAY_MIN = 90;
const STAR_DELAY_MAX = 180;
const AURA_SPARKLE_EVERY = 5;
const GOD_BURST_FRAMES = 140;
const UMBRELLA_BURST_FRAMES = 20;
const CROWN_CD_FRAMES = 90;
const HUB_LEAF_EVERY = 40;

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

function crownPosition(game, secret) {
  if (game.roomId === "hub" && secret && !secret.taken) {
    return { x: 120, y: 772 };
  }

  const orb = (game.orbs || []).find((o) => !o.taken);
  if (orb) return { x: orb.x, y: Math.max(100, orb.y - 34) };

  const elevated = (game.platforms || [])
    .filter((pl) => pl.h <= 40 && pl.y > 120 && pl.y < 780)
    .sort((a, b) => Math.abs(a.x + a.w / 2 - game.worldW / 2) - Math.abs(b.x + b.w / 2 - game.worldW / 2));
  if (elevated.length) {
    const pl = elevated[0];
    return { x: pl.x + pl.w / 2, y: pl.y - 28 };
  }
  return { x: (game.worldW || 1600) / 2, y: (game.worldH || 900) - 128 };
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
  fruit: null, // {x,y,r,taken,fruit:true} | null
  godCrown: null, // {x,y,r,taken,godCrown:true,roomId} | null
  godBurst: 0,
  godRings: [],
  _godPulse: 0,
  umbrellaBurst: 0,
  crownCdFlash: 0,
  hubLeafClock: 0,
  hubGlowDone: false,
  _hubStillFrames: 0,
  _hubLastX: null,
  _hubLastY: null,
  _hadUmbrella: false,
  _rainWasActive: false,
  flags: {
    secretHubTaken: false,
    godBurstDone: false,
    godCrownTaken: false,
    jungleFruitTaken: false,
    crownCdNotified: false,
  },

  reset() {
    this._goldenMarked = false;
    this._goldRoom = null;
    this.starDelay = 0;
    this.starLeft = 0;
    this.starActive = false;
    this._skyPulse = 0;
    this.secret = null;
    this.fruit = null;
    this.godCrown = null;
    this.godBurst = 0;
    this.godRings = [];
    this._godPulse = 0;
    this.umbrellaBurst = 0;
    this.crownCdFlash = 0;
    this.hubLeafClock = 0;
    this.hubGlowDone = false;
    this._hubStillFrames = 0;
    this._hubLastX = null;
    this._hubLastY = null;
    this._hadUmbrella = false;
    this._rainWasActive = false;
    this.flags.secretHubTaken = false;
    this.flags.godBurstDone = false;
    this.flags.godCrownTaken = false;
    this.flags.jungleFruitTaken = false;
    this.flags.crownCdNotified = false;
  },

  /** Celebración única al alcanzar GOD (forma 5). */
  onBecomeGod(game) {
    if (!game || !game.player || this.flags.godBurstDone) return;
    this.flags.godBurstDone = true;
    this.godBurst = GOD_BURST_FRAMES;
    this._godPulse = 0;
    this.godRings = [
      { r: 16, life: 75, maxLife: 75, maxR: 190, alpha: 0.82 },
      { r: 10, life: 110, maxLife: 110, maxR: 280, alpha: 0.66 },
      { r: 6, life: 145, maxLife: 145, maxR: 370, alpha: 0.5 },
    ];
    game.flash = Math.max(game.flash || 0, game.reduceMotion ? 5 : 10);
    game.shake = Math.max(game.shake || 0, game.reduceMotion ? 4 : 8);
    const p = game.player;
    emitStars(game, p.x + p.w / 2, p.y + p.h / 2, 28, "#ffe66a");
    try {
      showNotification("¡GOD!", "El cielo te celebra.", "sala");
    } catch (_) {}
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

    // Hub ambience: reset the quiet-player trigger for every visit.
    if (game.roomId === "hub") {
      this.hubGlowDone = false;
      this.hubLeafClock = 0;
      this._hubStillFrames = 0;
      this._hubLastX = null;
      this._hubLastY = null;
    } else {
      this._hubStillFrames = 0;
      this._hubLastX = null;
      this._hubLastY = null;
    }

    // Jungle fruit: a light chance on each entry, but only one pickup per run.
    this.fruit = null;
    if (game.roomId === "jungle" && !this.flags.jungleFruitTaken && Math.random() < 0.22) {
      this.fruit = { x: 520, y: 400, r: 12, taken: false, fruit: true };
    }

    // Corona estelar: una oportunidad por sala, pero una sola recogida por run.
    this.godCrown = null;
    this.crownCdFlash = 0;
    if (game.player && game.player.evo >= 4 && game.roomId !== "boss" && this.flags.godCrownTaken) {
      this.crownCdFlash = CROWN_CD_FRAMES;
      if (!this.flags.crownCdNotified) {
        this.flags.crownCdNotified = true;
        try { showNotification("CORONA", "Ya brillas esta partida.", "sala"); } catch (_) {}
      }
    } else if (game.player && game.player.evo >= 4 && game.roomId !== "boss" && Math.random() < 0.18) {
      const pos = crownPosition(game, this.secret);
      this.godCrown = { ...pos, r: 16, taken: false, godCrown: true, roomId: game.roomId };
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

    // --- Lluvia: transiciones y burst local al recoger el paraguas ---
    if (Rain.active && !this._rainWasActive && !Rain._grabNotify) {
      try { showNotification("¡LLUEVE!", "Busca el paraguas rojo en la Costa", "sala"); } catch (_) {}
    }
    if (Rain.hasUmbrella && !this._hadUmbrella) this.umbrellaBurst = UMBRELLA_BURST_FRAMES;
    this._hadUmbrella = !!Rain.hasUmbrella;
    this._rainWasActive = !!Rain.active;
    if (this.umbrellaBurst > 0) {
      this.umbrellaBurst--;
      const every = game.reduceMotion ? 4 : 2;
      if (this.umbrellaBurst % every === 0) {
        emitStars(game, p.x + p.w / 2, p.y + p.h / 2, game.reduceMotion ? 2 : 5, Math.random() < 0.5 ? "#ffe66a" : "#ffffff");
      }
    }

    // --- Ambiente suave del hub ---
    if (game.roomId === "hub") {
      this.hubLeafClock++;
      if (!game.reduceMotion && this.hubLeafClock >= HUB_LEAF_EVERY && game.fx) {
        this.hubLeafClock = 0;
        try {
          game.fx.emit(Math.random() * (game.worldW || 1600), 80 + Math.random() * 130, {
            color: Math.random() < 0.5 ? "#9bdc8a" : "#ffe79a",
            count: 1,
            size: 2.4,
            speed: 0.65,
            angle: Math.PI / 2,
            spread: 0.8,
            life: 80,
            gravity: 0.015,
            star: Math.random() < 0.35,
          });
        } catch (_) {}
      }
      const moved = Math.abs(p.vx || 0) > 0.05 || Math.abs(p.vy || 0) > 0.05
        || (this._hubLastX != null && Math.hypot(p.x - this._hubLastX, p.y - this._hubLastY) > 0.4);
      if (moved) this._hubStillFrames = 0;
      else this._hubStillFrames++;
      this._hubLastX = p.x;
      this._hubLastY = p.y;
      if (!game.reduceMotion && !this.hubGlowDone && this._hubStillFrames > 180) {
        this.hubGlowDone = true;
        emitStars(game, p.x + p.w / 2 + (Math.random() - 0.5) * 48, p.y + p.h, 14, "#ffe79a");
      }
    }

    if (this.crownCdFlash > 0) this.crownCdFlash--;

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

    // --- Burst GOD: estrellas locales + anillos expansivos ---
    if (this.godBurst > 0) {
      this.godBurst--;
      this._godPulse++;
      const every = game.reduceMotion ? 8 : 3;
      if (this._godPulse % every === 0) {
        emitStars(
          game,
          p.x + p.w / 2 + (Math.random() - 0.5) * 150,
          p.y + p.h / 2 + (Math.random() - 0.5) * 100,
          game.reduceMotion ? 2 : 6,
          Math.random() < 0.5 ? "#ffe66a" : "#ffffff"
        );
      }
      // Refuerzo leve y temporal; no bloquea el control ni la transición de sala.
      game.shake = Math.max(game.shake || 0, game.reduceMotion ? 2 : 5);
      if (this._godPulse < 18) game.flash = Math.max(game.flash || 0, game.reduceMotion ? 1 : 3);
    }
    for (const ring of this.godRings) {
      if (ring.life <= 0) continue;
      ring.life--;
      ring.r = Math.min(ring.maxR, ring.r + ring.maxR / ring.maxLife);
    }
    this.godRings = this.godRings.filter((ring) => ring.life > 0);

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

    // --- Fruto brillante de la jungla (1× por run) ---
    const fruit = this.fruit;
    if (fruit && !fruit.taken && game.roomId === "jungle" && !p.dead) {
      const dx = p.x + p.w / 2 - fruit.x;
      const dy = p.y + p.h / 2 - fruit.y;
      if (Math.hypot(dx, dy) < 36) {
        fruit.taken = true;
        this.flags.jungleFruitTaken = true;
        p.health = Math.min(p.maxHealth, p.health + 15);
        game.score = (game.score || 0) + 40;
        p._surpriseAura = Math.max(p._surpriseAura || 0, 240);
        game.flash = Math.max(game.flash || 0, 7);
        emitStars(game, fruit.x, fruit.y, 18, "#ff82c8");
        emitStars(game, fruit.x, fruit.y, 8, "#a8f06a");
        try {
          if (game.nums) game.nums.add(fruit.x, fruit.y, "+15", "#a8f06a");
          showNotification("FRUTO OCULTO", "Dulce de la Jungla.", "sala");
        } catch (_) {}
        this.fruit = null;
      }
    }

    // --- Corona estelar (GOD, 1× por run) ---
    const crown = this.godCrown;
    if (crown && !crown.taken && game.roomId === crown.roomId && p.evo >= 4 && !p.dead) {
      const dx = p.x + p.w / 2 - crown.x;
      const dy = p.y + p.h / 2 - crown.y;
      if (Math.hypot(dx, dy) < 40) {
        crown.taken = true;
        this.flags.godCrownTaken = true;
        p.invuln = Math.max(p.invuln || 0, 120);
        p.health = p.maxHealth;
        p.dash = 28;
        game.score = (game.score || 0) + 100;
        p._surpriseAura = Math.max(p._surpriseAura || 0, 600);
        game.flash = Math.max(game.flash || 0, 12);
        game.shake = Math.max(game.shake || 0, 8);
        emitStars(game, crown.x, crown.y, 30, "#f0c040");
        emitStars(game, crown.x, crown.y, 12, "#fff4b0");
        try {
          if (game.nums) game.nums.add(crown.x, crown.y, "+100", "#ffe66a");
        } catch (_) {}
        try {
          showNotification("CORONA ESTELAR", "Solo los GOD brillan así.", "sala");
        } catch (_) {}
        this.godCrown = null;
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

    // Anillos de energía del ascenso a GOD, centrados en el jugador.
    const p = game && game.player;
    if (p && this.godRings.length) {
      const rings = game.reduceMotion ? this.godRings.slice(-2) : this.godRings;
      const cx = p.x + p.w / 2 - cam.x;
      const cy = p.y + p.h / 2 - cam.y;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      rings.forEach((ring, i) => {
        const alpha = ring.alpha * Math.max(0, ring.life / ring.maxLife);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = i % 2 ? "#ffffff" : "#ffe66a";
        ctx.lineWidth = game.reduceMotion ? 2 : 3;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });
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

    // Fruto brillante: baya verde/rosa pulsante de la jungla.
    const fruit = this.fruit;
    if (fruit && !fruit.taken && game && game.roomId === "jungle") {
      const fx = fruit.x - cam.x;
      const fy = fruit.y - cam.y + Math.sin((t || 0) / 9) * 3;
      const pulse = 0.75 + 0.25 * Math.sin((t || 0) / 7);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 + pulse * 0.16;
      ctx.fillStyle = "#ff82c8";
      ctx.beginPath();
      ctx.arc(fx, fy, 18 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ff78b8";
      ctx.beginPath();
      ctx.arc(fx, fy + 2, 10 + pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9bea70";
      ctx.beginPath();
      ctx.ellipse(fx - 3, fy - 7, 6, 3.5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b9ff92";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7);
      ctx.lineTo(fx + 2, fy - 12);
      ctx.stroke();
      ctx.restore();
    }

    // Feedback visual breve: esta partida ya reclamó la corona.
    if (p && this.crownCdFlash > 0 && game && game.roomId !== "boss") {
      const cx = p.x + p.w / 2 - cam.x;
      const cy = p.y + p.h / 2 - cam.y;
      const fade = Math.min(1, this.crownCdFlash / 18, (CROWN_CD_FRAMES - this.crownCdFlash + 1) / 12);
      ctx.save();
      ctx.globalAlpha = 0.16 + fade * 0.38;
      ctx.strokeStyle = "#ffe66a";
      ctx.lineWidth = game.reduceMotion ? 2 : 2.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + Math.sin((t || 0) / 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Corona estelar: pickup dorado muy visible y flotante.
    const crown = this.godCrown;
    if (crown && !crown.taken && game) {
      const cx = crown.x - cam.x;
      const cy = crown.y - cam.y + Math.sin((t || 0) / 9) * 5;
      const pulse = 0.75 + 0.25 * Math.sin((t || 0) / 7);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.3 + pulse * 0.2;
      ctx.fillStyle = "#ffd84a";
      ctx.beginPath();
      ctx.arc(cx, cy, 25 + pulse * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "#fff8bb";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 18 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#f0c040";
      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 6);
      ctx.lineTo(cx - 10, cy + 9);
      ctx.lineTo(cx + 10, cy + 9);
      ctx.lineTo(cx + 16, cy - 6);
      ctx.lineTo(cx + 7, cy + 1);
      ctx.lineTo(cx, cy - 11);
      ctx.lineTo(cx - 7, cy + 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
