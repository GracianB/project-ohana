const TAU = Math.PI * 2;

const clamp = (v, a = 0, b = 1) =>
  Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));

const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);

export function experienceRank(combo = 0, crit = false) {
  if (crit || combo >= 13) return "RÁFAGA";
  if (combo >= 8) return "DOMINIO";
  if (combo >= 4) return "FLOW";
  if (combo >= 2) return "RITMO";
  return "READY";
}

export class ExperienceDirector {
  constructor() {
    this.impulses = [];
    this.maxImpulses = 40;

    this.state = {
      anticipation: 0,
      impact: 0,
      shock: 0,
      dash: 0,
      hurt: 0,
      land: 0,
      room: 0,
      roomT: 0,
      evo: 0,
      evoT: 0,
      boss: 0,
      bossT: 0,
      flow: 0,
      flowT: 0,
      color: "#7ee7ff",
      dir: 1,
      crit: false,
      roomName: "",
      bossPhase: 0,
      finalEvo: false,
      message: "",
    };

    this.lastCombo = 0;
    this.lastBossPhase = 0;
    this.lastRoom = "";
    this.mounted = false;

    this.ui = null;
    this.uiTitle = null;
    this.uiNote = null;
    this.uiBar = null;
  }

  reset() {
    this.impulses.length = 0;

    Object.assign(this.state, {
      anticipation: 0,
      impact: 0,
      shock: 0,
      dash: 0,
      hurt: 0,
      land: 0,
      room: 0,
      roomT: 0,
      evo: 0,
      evoT: 0,
      boss: 0,
      bossT: 0,
      flow: 0,
      flowT: 0,
      color: "#7ee7ff",
      dir: 1,
      crit: false,
      roomName: "",
      bossPhase: 0,
      finalEvo: false,
      message: "",
    });

    this.lastCombo = 0;
    this.lastBossPhase = 0;
    this.lastRoom = "";

    this.updateUI(null);
  }

  mount() {
    if (typeof document === "undefined") return;

    if (!this.ui) {
      const root = document.getElementById("experience-ribbon") ||
        document.createElement("div");

      root.id = "experience-ribbon";
      root.setAttribute("aria-hidden", "true");
      root.innerHTML = `
        <span class="exp-kicker">MOMENTUM</span>
        <strong class="exp-title">READY</strong>
        <span class="exp-note"></span>
        <span class="exp-meter"><i></i></span>
      `;

      if (!root.parentNode) document.body.appendChild(root);

      this.ui = root;
      this.uiTitle = root.querySelector(".exp-title");
      this.uiNote = root.querySelector(".exp-note");
      this.uiBar = root.querySelector(".exp-meter i");
      this.mounted = true;
    }
  }

  pulse(kind, power = 1, color = this.state.color, dir = this.state.dir) {
    this.impulses.push({
      kind,
      power: clamp(power, 0, 2),
      color: color || "#fff",
      dir: dir >= 0 ? 1 : -1,
      life: kind === "evo" ? 48 : kind === "boss" ? 42 : 24,
      max: kind === "evo" ? 48 : kind === "boss" ? 42 : 24,
    });

    if (this.impulses.length > this.maxImpulses) {
      this.impulses.splice(0, this.impulses.length - this.maxImpulses);
    }
  }

  attack(player, def = {}) {
    this.state.anticipation = Math.max(
      this.state.anticipation,
      def?.kind === "heavy" ? 1 : 0.7
    );
    this.state.color = def?.color || player?.color || "#7ee7ff";
    this.state.dir = player?.facing >= 0 ? 1 : -1;
  }

  hit(player, enemy, data = {}) {
    const crit = !!data.crit;
    const boss = !!(data.boss || enemy?.boss);

    this.state.impact = Math.max(
      this.state.impact,
      clamp((Number(data.damage) || 1) / 28, 0.5, crit ? 1.35 : 1)
    );

    this.state.shock = Math.max(
      this.state.shock,
      boss ? 1.15 : crit ? 1.05 : 0.78
    );

    this.state.flow = Math.max(this.state.flow, crit ? 1 : 0.72);
    this.state.flowT = Math.max(this.state.flowT, crit ? 54 : 34);
    this.state.color = crit
      ? "#fff0a4"
      : player?.color || enemy?.color || "#7ee7ff";
    this.state.dir = player?.facing >= 0 ? 1 : -1;
    this.state.crit = crit;

    this.pulse(
      crit ? "crit" : boss ? "boss-hit" : "hit",
      boss ? 1.25 : crit ? 1.15 : 0.9,
      this.state.color,
      this.state.dir
    );
  }

  hurt(player, amount = 0) {
    const power = clamp((Number(amount) || 1) / 30, 0.45, 1);

    this.state.hurt = Math.max(this.state.hurt, power);
    this.state.shock = Math.max(this.state.shock, 0.72);
    this.state.flow = 0;
    this.state.flowT = 0;

    this.pulse(
      "hurt",
      power,
      "#ff6476",
      player?.facing >= 0 ? -1 : 1
    );
  }

  dash(player) {
    this.state.dash = 1;
    this.state.color = player?.color || "#7ee7ff";
    this.state.dir = player?.facing >= 0 ? 1 : -1;

    this.pulse(
      "dash",
      1,
      this.state.color,
      this.state.dir
    );
  }

  land(player, speed = 8) {
    const power = clamp((Number(speed) - 7) / 8, 0.25, 1);

    if (power < 0.3) return;

    this.state.land = Math.max(this.state.land, power);
    this.pulse(
      "land",
      power,
      player?.color || "#fff",
      player?.facing >= 0 ? 1 : -1
    );
  }

  room(id, name, isBoss = false) {
    this.lastRoom = String(id || "");
    this.state.room = 1;
    this.state.roomT = isBoss ? 100 : 72;
    this.state.roomName = String(name || id || "").toUpperCase();

    if (isBoss) {
      this.state.boss = 1;
      this.state.bossT = 72;
      this.pulse("boss", 1, "#ff5a68");
    }
  }

  evolution(player, finalForm = false) {
    this.state.evo = 1;
    this.state.evoT = finalForm ? 110 : 72;
    this.state.finalEvo = !!finalForm;
    this.state.color = player?.color || "#ffe66a";
    this.state.shock = Math.max(this.state.shock, finalForm ? 1.3 : 1);

    this.pulse(
      "evo",
      finalForm ? 1.5 : 1,
      this.state.color,
      player?.facing >= 0 ? 1 : -1
    );
  }

  update(game) {
    const reduced = !!game?.reduceMotion;

    this.state.anticipation *= 0.74;
    this.state.impact *= 0.84;
    this.state.shock *= 0.82;
    this.state.dash *= 0.88;
    this.state.hurt *= 0.91;
    this.state.land *= 0.86;
    this.state.flow *= 0.965;

    if (this.state.roomT > 0) {
      this.state.roomT--;
      this.state.room = clamp(this.state.roomT / 72);
    } else {
      this.state.room = 0;
    }

    if (this.state.evoT > 0) {
      this.state.evoT--;
      this.state.evo = clamp(
        this.state.evoT / (this.state.finalEvo ? 110 : 72)
      );
    } else {
      this.state.evo = 0;
    }

    if (this.state.bossT > 0) {
      this.state.bossT--;
      this.state.boss = clamp(this.state.bossT / 72);
    } else {
      this.state.boss *= 0.94;
    }

    if (this.state.flowT > 0) {
      this.state.flowT--;
    } else {
      this.state.flow = Math.min(this.state.flow, 0.25);
    }

    const combo = Math.max(0, Number(game?.combo) || 0);

    if (combo > this.lastCombo) {
      this.state.flow = Math.max(
        this.state.flow,
        clamp(combo / 14, 0.3, 1)
      );
      this.state.flowT = Math.max(this.state.flowT, 36);
    }

    this.lastCombo = combo;

    const boss = game?.boss || game?.enemies?.find?.((e) => e?.boss);

    if (boss) {
      const phase = Math.max(1, Math.min(3, Number(boss.phase) || 1));

      if (this.lastBossPhase && phase !== this.lastBossPhase) {
        this.state.boss = 1;
        this.state.bossT = 84;
        this.state.color = phase === 3 ? "#ff1846" : "#ff5a68";
        this.pulse(
          "boss",
          phase === 3 ? 1.5 : 1.15,
          this.state.color
        );
      }

      this.lastBossPhase = phase;
    } else {
      this.lastBossPhase = 0;
    }

    for (const item of this.impulses) item.life--;
    this.impulses = this.impulses.filter((item) => item.life > 0);

    if (typeof document !== "undefined") {
      document.body.dataset.experience =
        experienceRank(combo, this.state.crit);

      document.body.dataset.experienceMotion =
        reduced ? "reduced" : "full";

      document.body.classList.toggle(
        "experience-intense",
        combo >= 4 || !!boss
      );
    }

    this.updateUI(game);
  }

  updateUI(game) {
    if (typeof document === "undefined") return;

    this.mount();
    if (!this.ui) return;

    const combo = Math.max(0, Number(game?.combo) || 0);
    const boss = game?.boss || game?.enemies?.find?.((e) => e?.boss);
    // Room arrivals are narrated exclusively by MessageManager.
    // ExperienceDirector is visual/combat feedback, not a second narrator.
    const visible =
      combo >= 2 ||
      !!boss ||
      this.state.evoT > 0;

    this.ui.classList.toggle("show", visible);
    this.ui.setAttribute("aria-hidden", visible ? "false" : "true");

    const rank = experienceRank(combo, this.state.crit);

    if (this.uiTitle) {
      this.uiTitle.textContent = boss
        ? "FASE " + (Number(boss.phase) || 1)
        : rank;
    }

    if (this.uiNote) {
      this.uiNote.textContent =
        boss
          ? "REINA DEL NIDO"
          : combo >= 2
            ? "COMBO ×" + combo
            : "READY";
    }

    if (this.uiBar) {
      const value = Math.max(
        0,
        Math.min(
          100,
          combo * 7 +
          this.state.flow * 35 +
          this.state.impact * 18
        )
      );

      this.uiBar.style.width = value + "%";
    }
  }

  zoomPulse(game) {
    if (game?.reduceMotion) return 1;

    const boost =
      this.state.impact * 0.022 +
      this.state.shock * 0.012 +
      this.state.land * 0.008 +
      this.state.evo * (this.state.finalEvo ? 0.025 : 0.014);

    return clamp(1 + boost, 1, 1.065);
  }

  render(ctx, game, width, height, time = 0) {
    if (!ctx) return;

    const reduced = !!game?.reduceMotion;
    const W = Math.max(320, Number(width) || ctx.canvas?.width || 1280);
    const H = Math.max(240, Number(height) || ctx.canvas?.height || 720);

    const impact = this.state.impact;
    const shock = this.state.shock;
    const dash = this.state.dash;
    const hurt = this.state.hurt;
    const land = this.state.land;
    const evo = this.state.evo;
    const boss = this.state.boss;
    const dir = this.state.dir || 1;

    ctx.save();

    // ----------------------------------------------------------
    // VELOCITY TUNNEL
    // ----------------------------------------------------------

    if (!reduced && dash > 0.035) {
      const a = clamp(dash * 0.55);

      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = this.state.color || "#7ee7ff";
      ctx.lineWidth = 1.5;

      const count = 15;

      for (let i = 0; i < count; i++) {
        const y =
          (H * ((i * 0.137 + 0.08 + time * 0.002) % 1));

        const spread =
          W * (0.08 + ((i * 17) % 11) / 40);

        const startX =
          dir > 0 ? W - spread : spread;

        const endX =
          dir > 0 ? startX + W * (0.12 + i / 120)
                  : startX - W * (0.12 + i / 120);

        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    // ----------------------------------------------------------
    // IMPACT CORE
    // ----------------------------------------------------------

    if (impact > 0.035 || shock > 0.035) {
      const ix =
        W * 0.5 +
        dir * Math.min(170, W * 0.14);

      const iy = H * 0.48;

      const power =
        clamp(Math.max(impact, shock));

      const radius =
        16 + easeOut(1 - power) * 72;

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = power * 0.42;
      ctx.strokeStyle = this.state.color || "#fff";
      ctx.lineWidth = 2 + power * 3;

      ctx.beginPath();
      ctx.arc(ix, iy, radius, 0, TAU);
      ctx.stroke();

      ctx.globalAlpha = power * 0.28;

      for (let i = 0; i < 10; i++) {
        const angle =
          (TAU * i) / 10 +
          time * 0.025;

        const inner = radius * 0.65;
        const outer =
          radius * (1.25 + (i & 1) * 0.45);

        ctx.beginPath();
        ctx.moveTo(
          ix + Math.cos(angle) * inner,
          iy + Math.sin(angle) * inner
        );
        ctx.lineTo(
          ix + Math.cos(angle) * outer,
          iy + Math.sin(angle) * outer
        );
        ctx.stroke();
      }

      if (this.state.crit && !reduced && impact > 0.12) {
        ctx.globalAlpha = Math.min(0.95, impact);
        ctx.fillStyle = "#fff0a4";
        ctx.font = "900 15px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("CRÍTICO", ix, iy - radius - 18);
      }
    }

    // ----------------------------------------------------------
    // LANDING SHOCKWAVE
    // ----------------------------------------------------------

    if (land > 0.035) {
      const k = 1 - land;
      const r =
        24 + (1 - k) * Math.min(110, W * 0.12);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = land * 0.42;
      ctx.strokeStyle = this.state.color || "#fff";
      ctx.lineWidth = 2 + land * 2;

      ctx.beginPath();
      ctx.ellipse(
        W * 0.5,
        H * 0.74,
        r,
        Math.max(8, r * 0.16),
        0,
        0,
        TAU
      );
      ctx.stroke();
    }

    // ----------------------------------------------------------
    // EVOLUTION RADIANCE
    // ----------------------------------------------------------

    if (evo > 0.03) {
      const k =
        1 - clamp(evo);

      const radius =
        Math.max(W, H) * (0.08 + (1 - k) * 0.5);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = evo * 0.38;
      ctx.strokeStyle =
        this.state.color || "#ffe66a";

      ctx.lineWidth =
        this.state.finalEvo ? 5 : 3;

      for (let i = 0; i < (this.state.finalEvo ? 3 : 2); i++) {
        ctx.beginPath();
        ctx.arc(
          W / 2,
          H / 2,
          radius * (0.72 + i * 0.18),
          0,
          TAU
        );
        ctx.stroke();
      }
    }

    // ----------------------------------------------------------
    // BOSS CINEMATIC LETTERBOX
    // ----------------------------------------------------------

    if (boss > 0.035 || game?.boss) {
      const bossPresence = Math.max(
        boss,
        game?.boss ? 0.24 : 0
      );

      const bars =
        18 + bossPresence * 26;

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = clamp(
        0.76 + bossPresence * 0.15
      );
      ctx.fillStyle = "rgba(3,6,12,.88)";

      ctx.fillRect(0, 0, W, bars);
      ctx.fillRect(0, H - bars, W, bars);

      ctx.globalAlpha = 0.24 + bossPresence * 0.26;
      ctx.strokeStyle =
        Number(game?.boss?.phase) === 3
          ? "#ff1846"
          : "#ff6b72";

      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(W * 0.16, bars);
      ctx.lineTo(W * 0.84, bars);
      ctx.moveTo(W * 0.16, H - bars);
      ctx.lineTo(W * 0.84, H - bars);
      ctx.stroke();
    }

    // ----------------------------------------------------------
    // HURT / DANGER VIGNETTE
    // ----------------------------------------------------------

    if (hurt > 0.035 && !this.state.evo) {
      const g = ctx.createRadialGradient(
        W / 2,
        H / 2,
        H * 0.2,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.72
      );

      g.addColorStop(0, "rgba(255,40,70,0)");
      g.addColorStop(
        1,
        "rgba(180,0,30," +
          (0.12 + hurt * 0.32) +
          ")"
      );

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ----------------------------------------------------------
    // ROOM ARRIVAL PULSE
    // ----------------------------------------------------------
    // La llegada sigue teniendo feedback visual, pero sin texto.
    // El texto pertenece a MessageManager.
    if (this.state.roomT > 0.03 && !reduced) {
      const k = clamp(this.state.roomT / 72);
      ctx.save();
      ctx.globalAlpha = 0.16 * easeOut(1 - k);
      ctx.strokeStyle = this.state.color || "#7ee7ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.27, H * 0.18, W * 0.46, H * 0.42);
      ctx.restore();
    }

    // ----------------------------------------------------------
    // FREE IMPULSE PARTICLES
    // ----------------------------------------------------------

    for (const item of this.impulses) {
      const u = 1 - item.life / item.max;
      const fade = clamp(1 - u);
      const k = easeOut(u);

      if (item.kind === "hit" ||
          item.kind === "crit" ||
          item.kind === "boss-hit") {
        const cx =
          W * 0.5 +
          item.dir * Math.min(150, W * 0.12);

        const cy = H * 0.48;

        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha =
          fade *
          (item.kind === "crit" ? 0.65 : 0.42);

        ctx.strokeStyle = item.color;
        ctx.lineWidth =
          item.kind === "crit" ? 3 : 2;

        const rad =
          18 + k * (item.kind === "boss-hit" ? 90 : 58);

        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, TAU);
        ctx.stroke();
      }

      if (item.kind === "dash" && !reduced) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade * 0.3;
        ctx.strokeStyle = item.color;

        for (let i = 0; i < 6; i++) {
          const y =
            H * (0.28 + i * 0.08);

          const x =
            item.dir > 0
              ? W * 0.65
              : W * 0.35;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - item.dir * W * (0.12 + k * 0.14),
            y
          );
          ctx.stroke();
        }
      }

      if (item.kind === "hurt") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = fade * 0.17;
        ctx.fillStyle = item.color;
        ctx.fillRect(0, 0, W, H);
      }

      if (item.kind === "evo") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade * 0.35;
        ctx.strokeStyle = item.color;
        ctx.lineWidth =
          this.state.finalEvo ? 4 : 2;

        const radius =
          40 + k * Math.max(W, H) * 0.48;

        ctx.beginPath();
        ctx.arc(W / 2, H / 2, radius, 0, TAU);
        ctx.stroke();
      }

      if (item.kind === "boss") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade * 0.24;
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;

        const cx = W / 2;
        const cy = H * 0.5;

        for (let i = 0; i < 8; i++) {
          const a =
            i * TAU / 8 +
            time * 0.01;

          const r0 = 50 + k * 40;
          const r1 = r0 + 30 + k * 90;

          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(a) * r0,
            cy + Math.sin(a) * r0
          );
          ctx.lineTo(
            cx + Math.cos(a) * r1,
            cy + Math.sin(a) * r1
          );
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
}
