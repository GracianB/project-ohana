// ============================================================================
// OHANA · BOSS SPECTACLE FX
// Presentación pura de la Reina del Nido. No modifica daño, hitbox, IA ni física.
// Todo es determinista: el renderer usa fase, modo, tiempo y semillas estables.
// ============================================================================

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const BOSS_PHASE_PROFILES = Object.freeze({
  1: Object.freeze({
    id: 1, name: "TERRITORIO", kicker: "LA REINA DESPIERTA",
    color: "#ff5149", glow: "#ffb24a", dark: "#4a101c",
    aura: 0.22, scale: 1, speed: 1, tremor: 0.7,
  }),
  2: Object.freeze({
    id: 2, name: "ASCENSO", kicker: "EL NIDO SE ROMPE",
    color: "#ff3f67", glow: "#ffd05a", dark: "#5a0920",
    aura: 0.34, scale: 1.08, speed: 1.25, tremor: 1.2,
  }),
  3: Object.freeze({
    id: 3, name: "APOCALIPSIS", kicker: "NO QUEDA NIDO",
    color: "#ff1846", glow: "#fff06a", dark: "#26030e",
    aura: 0.48, scale: 1.16, speed: 1.55, tremor: 1.9,
  }),
});

export const BOSS_ATTACK_PROFILES = Object.freeze({
  charge: Object.freeze({ color: "#ff4038", icon: ">>>", shape: "lane", width: 170, intensity: 1 }),
  swoop: Object.freeze({ color: "#ff5a9a", icon: "V", shape: "cone", width: 220, intensity: 1.2 }),
  slam: Object.freeze({ color: "#ff9a3a", icon: "!", shape: "quake", width: 190, intensity: 1.35 }),
  spit: Object.freeze({ color: "#ff5270", icon: "•••", shape: "fan", width: 150, intensity: 0.95 }),
});

export function bossPhaseProfile(phase = 1) {
  return BOSS_PHASE_PROFILES[clamp(Number(phase) || 1, 1, 3)];
}

export function bossAttackProfile(kind = "charge") {
  return BOSS_ATTACK_PROFILES[kind] || BOSS_ATTACK_PROFILES.charge;
}

function pathPolygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

export class BossFX {
  constructor() {
    this.items = [];
    this.maxItems = 64;
    this.banner = null;
  }

  clear() {
    this.items.length = 0;
    this.banner = null;
  }

  add(type, data = {}) {
    const max = Math.max(10, Number(data.life) || (type === "phase" ? 76 : 24));
    this.items.push({ type, ...data, life: max, max });
    if (this.items.length > this.maxItems) this.items.splice(0, this.items.length - this.maxItems);
  }

  phaseTransition(x, y, phase) {
    const p = bossPhaseProfile(phase);
    this.add("phase", { x, y, phase, color: p.color, glow: p.glow, life: 86 });
    this.banner = { phase, life: 92, max: 92 };
  }

  attackRelease(x, y, kind, phase, dir = 1) {
    const p = bossAttackProfile(kind);
    this.add("release", { x, y, kind, phase, dir, color: p.color, life: phase >= 3 ? 28 : 22 });
  }

  landing(x, y, phase, radius = 110) {
    const p = bossPhaseProfile(phase);
    this.add("landing", { x, y, phase, color: p.glow, radius, life: phase >= 3 ? 30 : 24 });
  }

  spawn(x, y, phase) {
    const p = bossPhaseProfile(phase);
    this.add("spawn", { x, y, phase, color: p.glow, life: 30 });
  }

  intro(x, y) {
    this.add("intro", { x, y, color: "#ffd37a", life: 54 });
  }

  update() {
    for (const item of this.items) item.life--;
    this.items = this.items.filter((item) => item.life > 0);
    if (this.banner) {
      this.banner.life--;
      if (this.banner.life <= 0) this.banner = null;
    }
  }

  render(ctx, cam, t = 0, viewport = {}, boss = null) {
    if (!ctx) return;
    const vx = Number(viewport.width) || ctx.canvas?.width || 1280;
    const vy = Number(viewport.height) || ctx.canvas?.height || 720;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (boss && !boss.dying && !boss.fell) this.renderBossState(ctx, boss, cam, t);
    for (const item of this.items) this.renderItem(ctx, item, cam, t);
    ctx.restore();

    if (this.banner) this.renderBanner(ctx, this.banner, vx, vy);
  }

  renderBossState(ctx, e, cam, t) {
    const p = bossPhaseProfile(e.phase);
    const x = e.x + e.w / 2 - cam.x;
    const y = e.y + e.h / 2 - cam.y;
    const pulse = 1 + Math.sin(t * 0.18 * p.speed) * 0.06;

    // Aura por fases, cada una con geometría distinta.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = p.aura;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = e.phase === 3 ? 3.5 : 2.4;

    if (e.phase === 1) {
      ctx.beginPath();
      ctx.ellipse(x, y + e.h * 0.36, e.w * (0.72 + pulse * 0.08), 9, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = p.aura * 0.45;
      ctx.beginPath();
      ctx.arc(x, y + 10, e.w * (0.72 + pulse * 0.15), Math.PI, TAU);
      ctx.stroke();
    } else if (e.phase === 2) {
      for (let i = 0; i < 3; i++) {
        const r = e.w * (0.65 + i * 0.17 + pulse * 0.06);
        ctx.globalAlpha = p.aura * (0.8 - i * 0.2);
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI * (1.08 + i * 0.05), Math.PI * (1.92 - i * 0.05));
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const a = t * 0.04 * p.speed + i * TAU / 8;
        const r = e.w * (0.8 + (i % 2) * 0.18);
        ctx.globalAlpha = p.aura * (0.95 - (i % 3) * 0.18);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6);
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.stroke();
      }
    }

    // Telegráfico grande y específico por ataque.
    if (e.telegraph && e.teleKind) this.renderTelegraph(ctx, e, x, y, t);
    ctx.restore();
  }

  renderTelegraph(ctx, e, x, y, t) {
    const p = bossAttackProfile(e.teleKind);
    const phase = bossPhaseProfile(e.phase);
    const windK = e.windMax ? clamp(e.wind / e.windMax, 0, 1) : 0;
    const urgency = 0.45 + windK * 0.55;
    const pulse = 1 + Math.sin(t * (0.42 + e.phase * 0.06)) * 0.12;
    ctx.globalAlpha = 0.3 + urgency * 0.5;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2 + e.phase * 0.8;

    if (p.shape === "lane") {
      const dir = e.facing || 1;
      for (let i = 0; i < 3; i++) {
        const yy = y + (i - 1) * (10 + e.phase * 3);
        const len = p.width * (0.55 + windK * 0.65) * (i === 1 ? 1 : 0.72);
        ctx.beginPath();
        ctx.moveTo(x + dir * 24, yy);
        ctx.lineTo(x + dir * (24 + len), yy);
        ctx.stroke();
      }
      ctx.globalAlpha *= 0.6;
      ctx.beginPath();
      ctx.arc(x + dir * p.width * 0.85, y, 10 + windK * 12, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (p.shape === "cone") {
      const dir = e.facing || 1;
      const r = 40 + p.width * (0.3 + windK * 0.65);
      ctx.beginPath();
      ctx.moveTo(x + dir * 16, y);
      ctx.lineTo(x + dir * r, y - r * 0.45);
      ctx.moveTo(x + dir * 16, y);
      ctx.lineTo(x + dir * r, y + r * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + dir * 16, y, 14 + windK * 18, -0.7, 0.7);
      ctx.stroke();
    } else if (p.shape === "quake") {
      const r = 32 + windK * p.width * 0.7;
      ctx.beginPath();
      ctx.ellipse(x, y + e.h * 0.38, r, 11 + e.phase * 2, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha *= 0.55;
      for (let i = 0; i < 5; i++) {
        const sx = x + (i - 2) * r * 0.34;
        const sy = y + e.h * 0.38;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + ((i & 1) ? 8 : -8), sy + 16 + windK * 16);
        ctx.stroke();
      }
    } else {
      const dir = e.facing || 1;
      const r = 30 + windK * p.width * 0.55;
      for (let i = -2; i <= 2; i++) {
        const a = i * (0.12 + e.phase * 0.03);
        ctx.beginPath();
        ctx.moveTo(x + dir * 18, y);
        ctx.lineTo(x + dir * (r * Math.cos(a)), y + r * Math.sin(a));
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.3 + windK * 0.55;
    ctx.strokeStyle = phase.glow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, (e.w * 0.8 + windK * 18) * pulse, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = phase.glow;
    ctx.globalAlpha = 0.65 + windK * 0.3;
    ctx.font = "900 " + (9 + e.phase * 2) + "px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.icon, x, y - e.h * 0.76 - windK * 8);
  }

  renderItem(ctx, item, cam, t) {
    const x = item.x - cam.x;
    const y = item.y - cam.y;
    const u = 1 - item.life / item.max;
    const fadeIn = clamp(u * 4, 0, 1);
    const fadeOut = clamp(item.life / Math.max(1, item.max * 0.35), 0, 1);
    const alpha = fadeIn * fadeOut;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    if (item.type === "phase") {
      const p = bossPhaseProfile(item.phase);
      const radius = 24 + u * 190;
      ctx.globalAlpha = alpha * 0.48;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3.5 + (1 - u) * 4;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.stroke();
      ctx.globalAlpha = alpha * 0.26;
      ctx.beginPath(); ctx.arc(x, y, radius * 0.56, 0, TAU); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * TAU / 12 + u * 0.3;
        const inner = radius * 0.35;
        const outer = radius * (0.72 + (i % 2) * 0.25);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
        ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
        ctx.stroke();
      }
    } else if (item.type === "release") {
      const p = bossAttackProfile(item.kind);
      const dir = item.dir || 1;
      const radius = 12 + u * (28 + p.intensity * 20);
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = item.color || p.color;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.stroke();
      const rays = item.phase >= 3 ? 12 : 8;
      for (let i = 0; i < rays; i++) {
        const a = i * TAU / rays;
        const inner = radius * 0.65;
        const outer = radius * (1.1 + (i % 2) * 0.35);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
        ctx.lineTo(x + dir * (Math.cos(a) * outer + 12), y + Math.sin(a) * outer);
        ctx.stroke();
      }
    } else if (item.type === "landing") {
      const r = item.radius * (0.35 + u * 1.25);
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(x, y, r, 10 + u * 18, 0, 0, TAU); ctx.stroke();
      ctx.globalAlpha = alpha * 0.55;
      for (let i = 0; i < 7; i++) {
        const xx = x + (i - 3) * r * 0.28;
        ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx + (i % 2 ? 9 : -9), y + 24 + u * 30); ctx.stroke();
      }
    } else if (item.type === "spawn") {
      const r = 10 + u * 46;
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 - u * 0.8;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5);
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(x, y, 8 + u * 12, 0, TAU); ctx.stroke();
    } else {
      const r = 26 + u * 80;
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = item.color || "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    }

    ctx.restore();
  }

  renderBanner(ctx, b, W, H) {
    const p = bossPhaseProfile(b.phase);
    const u = 1 - b.life / b.max;
    const inK = clamp(u * 5, 0, 1);
    const outK = clamp(b.life / 24, 0, 1);
    const alpha = inK * outK;
    const y = H * 0.22;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(5,8,16,.75)";
    ctx.fillRect(W * 0.26, y - 34, W * 0.48, 82);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(W * 0.26, y - 34, W * 0.48, 82);
    ctx.font = "700 " + Math.round(Math.min(16, W * 0.018)) + "px Outfit,sans-serif";
    ctx.fillStyle = p.glow;
    ctx.fillText(p.kicker, W / 2, y - 17);
    ctx.font = "900 " + Math.round(Math.min(38, W * 0.04)) + "px Fredoka,system-ui,sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.lineWidth = 6;
    ctx.strokeText("FASE " + b.phase + " · " + p.name, W / 2, y + 15);
    ctx.fillText("FASE " + b.phase + " · " + p.name, W / 2, y + 15);
    ctx.restore();
  }
}
