export const ROSTER = [
  {
    id: "lilo", name: "Kilo", color: "#e23b3d",
    speed: 3.6, jumpPower: 11.4, maxJumps: 1, health: 80, w: 20, h: 28,
    abilities: ["ukulele", "hula", "ohana"],
    evoNames: ["Kilo Bebé", "Kilo", "Kilo Ohana", "Super Kilo", "KILO GOD"],
    forms: [
      { name: "Kilo Bebé", color: "#ff8aa0", speed: 3.6, jump: 11.4, jumps: 1, hp: 80, w: 20, h: 28 },
      { name: "Kilo", color: "#e23b3d", speed: 4.0, jump: 12.2, jumps: 1, hp: 100, w: 26, h: 34 },
      { name: "Kilo Ohana", color: "#ff5a7a", speed: 4.5, jump: 13.0, jumps: 2, hp: 125, w: 32, h: 40 },
      { name: "Super Kilo", color: "#ffd36a", speed: 5.1, jump: 13.8, jumps: 2, hp: 155, w: 38, h: 46 },
      { name: "KILO GOD", color: "#fff1a8", speed: 5.8, jump: 14.8, jumps: 3, hp: 190, w: 44, h: 52 }
    ]
  },
  {
    id: "stitch", name: "Glitch", color: "#3b6cff",
    speed: 4.4, jumpPower: 11.0, maxJumps: 1, health: 90, w: 26, h: 24,
    abilities: ["dash", "claws", "exp626"],
    evoNames: ["Mini Glitch", "Glitch", "Glitch cabreado", "Ñam-626", "GLITCH GOD"],
    forms: [
      { name: "Mini Glitch", color: "#9ad4ff", speed: 4.4, jump: 11.0, jumps: 1, hp: 90, w: 26, h: 24 },
      { name: "Glitch", color: "#3d9bff", speed: 4.9, jump: 11.8, jumps: 2, hp: 110, w: 32, h: 30 },
      { name: "Glitch cabreado", color: "#1c4bff", speed: 5.5, jump: 12.6, jumps: 2, hp: 135, w: 38, h: 36 },
      { name: "Ñam-626", color: "#6af", speed: 6.2, jump: 13.5, jumps: 3, hp: 165, w: 44, h: 42 },
      { name: "GLITCH GOD", color: "#d6f4ff", speed: 7.0, jump: 14.5, jumps: 3, hp: 200, w: 50, h: 48 }
    ]
  },
  {
    id: "pikachu", name: "Pika", color: "#ffe44a",
    speed: 4.8, jumpPower: 12.2, maxJumps: 2, health: 78, w: 22, h: 24,
    abilities: ["shock", "quick", "thunder"],
    evoNames: ["Pichu", "Pika", "Chispa", "Rayo gordo", "PIKA GOD"],
    forms: [
      { name: "Pichu", color: "#fff36a", speed: 4.8, jump: 12.2, jumps: 2, hp: 78, w: 22, h: 24 },
      { name: "Pika", color: "#ffe44a", speed: 5.3, jump: 12.9, jumps: 2, hp: 95, w: 28, h: 30 },
      { name: "Chispa", color: "#e0891c", speed: 5.9, jump: 13.6, jumps: 3, hp: 115, w: 34, h: 36 },
      { name: "Rayo gordo", color: "#fff36a", speed: 6.5, jump: 14.4, jumps: 3, hp: 140, w: 40, h: 42 },
      { name: "PIKA GOD", color: "#fffde8", speed: 7.2, jump: 15.2, jumps: 3, hp: 170, w: 46, h: 48 }
    ]
  },
  {
    id: "cat", name: "Michi", color: "#ffb6e4",
    speed: 5.0, jumpPower: 12.0, maxJumps: 2, health: 72, w: 22, h: 22,
    abilities: ["claw", "catdash", "lives"],
    evoNames: ["Michito", "Michi", "Nube rosa", "Nueve vidas", "MICHI GOD"],
    forms: [
      { name: "Michito", color: "#ffd0ee", speed: 5.0, jump: 12.0, jumps: 2, hp: 72, w: 22, h: 22 },
      { name: "Michi", color: "#ffb6e4", speed: 5.5, jump: 12.7, jumps: 2, hp: 90, w: 28, h: 28 },
      { name: "Nube rosa", color: "#ff8ad4", speed: 6.1, jump: 13.4, jumps: 3, hp: 110, w: 34, h: 34 },
      { name: "Nueve vidas", color: "#f4f0ff", speed: 6.7, jump: 14.2, jumps: 3, hp: 135, w: 40, h: 40 },
      { name: "MICHI GOD", color: "#fff6ff", speed: 7.4, jump: 15.0, jumps: 3, hp: 165, w: 46, h: 46 }
    ]
  },
  {
    id: "dragon", name: "Dino", color: "#5ecf6a",
    speed: 4.5, jumpPower: 11.4, maxJumps: 2, health: 72, w: 12, h: 12,
    abilities: ["breath", "wing", "rage"],
    evoNames: ["Dino Bebé", "Dino", "Dino Pico", "Dino Rex", "DINO GOD"],
    forms: [
      // Bebé: agile/fragile hatchling — soft mint (no glide)
      { name: "Dino Bebé", color: "#9ae8b8", speed: 4.5, jump: 11.4, jumps: 2, hp: 72, w: 12, h: 12 },
      // Dino: biped runner — classic leaf green
      { name: "Dino", color: "#5ecf6a", speed: 4.2, jump: 11.0, jumps: 1, hp: 105, w: 16, h: 16 },
      // Pico: glass-cannon — teal, tall crest silhouette, frail
      { name: "Dino Pico", color: "#2ec4b6", speed: 5.4, jump: 13.2, jumps: 2, hp: 95, w: 18, h: 22, spikes: true },
      // Rex: tanky predator — clay/rust, slower & wider
      { name: "Dino Rex", color: "#c96b2a", speed: 3.5, jump: 10.6, jumps: 1, hp: 170, w: 24, h: 22 },
      // GOD: balanced mythic titan — lime-gold; compact, no form.glide
      { name: "DINO GOD", color: "#ffe66a", speed: 5.0, jump: 12.6, jumps: 2, hp: 175, w: 26, h: 28, aura: true }
    ]
    },
  {
    id: "frita", name: "Capitán Kétchup", color: "#f0b43a",
    speed: 4.6, jumpPower: 11.4, maxJumps: 2, health: 85, w: 18, h: 28,
    abilities: ["salt", "ketchup", "fryer"],
    evoNames: ["Palito", "Frita", "Capitán Kétchup", "Extra Crujiente", "KÉtchup GOD"],
    forms: [
      { name: "Palito", color: "#ffe08a", speed: 4.6, jump: 11.4, jumps: 2, hp: 85, w: 18, h: 28 },
      { name: "Frita", color: "#f0b43a", speed: 5.2, jump: 12.1, jumps: 3, hp: 105, w: 22, h: 32 },
      { name: "Capitán Kétchup", color: "#e23b3b", speed: 5.8, jump: 12.8, jumps: 3, hp: 125, w: 26, h: 36 },
      { name: "Extra Crujiente", color: "#ffd36a", speed: 6.5, jump: 13.6, jumps: 4, hp: 150, w: 30, h: 42 },
      { name: "KÉtchup GOD", color: "#fff1a0", speed: 7.2, jump: 14.5, jumps: 4, hp: 180, w: 34, h: 48 }
    ]
  }
];

function clearEvoTween(p) {
  p.evoTween = 0;
  p.evoFromW = p.evoFromH = p.evoToW = p.evoToH = undefined;
}

export function applyForm(p, opts = {}) {
  const evo = Number(p.evo || 0);
  p.evo = evo;
  const f = (p.forms && p.forms[evo]) || null;
  if (!f) return;

  const prevW = p.w;
  const prevH = p.h;
  const hadSize = Number.isFinite(prevW) && Number.isFinite(prevH) && prevW > 0 && prevH > 0;

  p.name = f.name;
  p.color = f.color;
  p.speed = f.speed;
  p.jumpPower = f.jump;
  p.maxJumps = f.jumps;
  p.maxHealth = f.hp;
  p.health = f.hp;
  p.glide = !!f.glide;

  if (opts.silent || evo === 0 || !hadSize) {
    p.w = f.w;
    p.h = f.h;
    clearEvoTween(p);
  } else {
    p.evoFromW = prevW;
    p.evoFromH = prevH;
    p.evoToW = f.w;
    p.evoToH = f.h;
    p.w = prevW;
    p.h = prevH;
    p.evoTween = 1;
  }

  if (opts.silent || evo === 0) return;
  p.evoBurst = 90;
  try {
    window.dispatchEvent(new CustomEvent("ohana-evolve", {
      detail: { name: p.name, evo: p.evo, color: p.color, id: p.id }
    }));
  } catch (_) {}
}

/** Ease remaining fraction of evo size tween (~0.6s at 60fps). */
export function tickEvoTween(p, dtFrames = 1) {
  if (!p || !p.evoTween) return;
  const oldH = p.h;
  p.evoTween = Math.max(0, p.evoTween - (dtFrames / 36));
  const u = 1 - p.evoTween;
  const s = u * u * (3 - 2 * u); // smoothstep
  const toW = p.evoToW;
  const toH = p.evoToH;
  const fromW = p.evoFromW;
  const fromH = p.evoFromH;
  p.w = fromW + (toW - fromW) * s;
  p.h = fromH + (toH - fromH) * s;
  if (p.h > oldH) p.y -= (p.h - oldH);
  if (p.evoTween <= 0) {
    p.w = toW;
    p.h = toH;
    clearEvoTween(p);
  }
}
