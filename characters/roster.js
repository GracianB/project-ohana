export const ROSTER = [
  {
    id: "lilo", name: "Lilo", color: "#e23b3b",
    speed: 3.6, jumpPower: 11.4, maxJumps: 1, health: 80, w: 20, h: 28,
    abilities: ["ukulele", "hula", "ohana"],
    evoNames: ["Lilo Bebé", "Lilo", "Guardiana Ohana", "Alma de Kauai", "Ohana GOD"],
    forms: [
      { name: "Lilo Bebé", color: "#ff8aa0", speed: 3.6, jump: 11.4, jumps: 1, hp: 80, w: 20, h: 28 },
      { name: "Lilo", color: "#e23b3b", speed: 4.4, jump: 13.2, jumps: 1, hp: 110, w: 28, h: 42 },
      { name: "Guardiana Ohana", color: "#ff5a7a", speed: 5.1, jump: 14.4, jumps: 2, hp: 150, w: 34, h: 50 },
      { name: "Alma de Kauai", color: "#ffd36a", speed: 5.8, jump: 15.6, jumps: 2, hp: 200, w: 40, h: 56 },
      { name: "Ohana GOD", color: "#fff1a8", speed: 7.2, jump: 17.2, jumps: 3, hp: 280, w: 46, h: 62 }
    ]
  },
  {
    id: "stitch", name: "Stitch", color: "#3b6cff",
    speed: 4.4, jumpPower: 11.0, maxJumps: 1, health: 90, w: 26, h: 24,
    abilities: ["dash", "claws", "exp626"],
    evoNames: ["626 Bebé", "Stitch", "Berserk 626", "Experiment MAX", "626 GOD"],
    forms: [
      { name: "626 Bebé", color: "#9ad4ff", speed: 4.4, jump: 11.0, jumps: 1, hp: 90, w: 26, h: 24 },
      { name: "Stitch", color: "#3d9bff", speed: 5.4, jump: 12.4, jumps: 2, hp: 130, w: 36, h: 32 },
      { name: "Berserk 626", color: "#1c4bff", speed: 6.4, jump: 13.6, jumps: 2, hp: 175, w: 44, h: 38 },
      { name: "Experiment MAX", color: "#6af", speed: 7.2, jump: 15.0, jumps: 3, hp: 230, w: 54, h: 46 },
      { name: "626 GOD", color: "#d6f4ff", speed: 8.2, jump: 16.4, jumps: 3, hp: 300, w: 60, h: 52 }
    ]
  },
  {
    id: "pikachu", name: "Pikachu", color: "#f5d000",
    speed: 5.2, jumpPower: 12.4, maxJumps: 1, health: 60, w: 22, h: 20,
    abilities: ["shock", "quick", "thunder"],
    evoNames: ["Pichu", "Pikachu", "Raichu", "Tormenta", "Rayo GOD"],
    forms: [
      { name: "Pichu", color: "#ffe98a", speed: 5.2, jump: 12.4, jumps: 1, hp: 60, w: 22, h: 20 },
      { name: "Pikachu", color: "#ffe44a", speed: 6.2, jump: 14.2, jumps: 2, hp: 80, w: 30, h: 28 },
      { name: "Raichu", color: "#e08a20", speed: 6.8, jump: 15.0, jumps: 2, hp: 120, w: 38, h: 36 },
      { name: "Tormenta", color: "#fff36a", speed: 7.6, jump: 16.2, jumps: 3, hp: 160, w: 44, h: 42 },
      { name: "Rayo GOD", color: "#fffde0", speed: 8.6, jump: 17.4, jumps: 3, hp: 220, w: 50, h: 48 }
    ]
  },
  {
    id: "dragon", name: "Mushu", color: "#e23a1c",
    speed: 3.2, jumpPower: 10.2, maxJumps: 1, glide: true, health: 120, w: 28, h: 24,
    abilities: ["breath", "wing", "rage"],
    evoNames: ["Cría", "Mushu", "Guardia Imperial", "Gran Dragon", "Dragon GOD"],
    forms: [
      { name: "Cría", color: "#ff7a4a", speed: 3.2, jump: 10.2, jumps: 1, hp: 120, w: 28, h: 24, glide: true },
      { name: "Mushu", color: "#e23a1c", speed: 3.8, jump: 11.5, jumps: 1, hp: 180, w: 40, h: 36, glide: true },
      { name: "Guardia Imperial", color: "#d61f12", speed: 4.6, jump: 13.0, jumps: 2, hp: 240, w: 58, h: 50, glide: true },
      { name: "Gran Dragon Rojo", color: "#8b1208", speed: 5.2, jump: 14.4, jumps: 2, hp: 320, w: 72, h: 60, glide: true },
      { name: "Dragon GOD", color: "#ffd36a", speed: 6.4, jump: 16.0, jumps: 3, hp: 400, w: 80, h: 68, glide: true }
    ]
  },
  {
    id: "cat", name: "Kawaii Cat", color: "#ff8ad4",
    speed: 4.8, jumpPower: 11.6, maxJumps: 2, health: 70, w: 20, h: 20,
    abilities: ["claw", "catdash", "lives"],
    evoNames: ["Gatito", "Cat", "Neko Shadow", "Nueve Vidas", "Neko GOD"],
    forms: [
      { name: "Gatito", color: "#ffd0ec", speed: 4.8, jump: 11.6, jumps: 2, hp: 70, w: 20, h: 20 },
      { name: "Cat", color: "#ffb6e4", speed: 5.8, jump: 12.8, jumps: 3, hp: 90, w: 26, h: 26 },
      { name: "Neko Shadow", color: "#ff5cb8", speed: 6.8, jump: 14.0, jumps: 3, hp: 130, w: 32, h: 32 },
      { name: "Nueve Vidas", color: "#fff", speed: 7.6, jump: 15.4, jumps: 4, hp: 170, w: 36, h: 36 },
      { name: "Neko GOD", color: "#fff6ff", speed: 8.4, jump: 16.8, jumps: 4, hp: 230, w: 42, h: 40 }
    ]
  }
];

export function applyForm(p, opts = {}) {
  const evo = Number(p.evo || 0);
  p.evo = evo;
  const f = (p.forms && p.forms[evo]) || null;
  if (!f) return;
  p.name = f.name;
  p.color = f.color;
  p.speed = f.speed;
  p.jumpPower = f.jump;
  p.maxJumps = f.jumps;
  p.maxHealth = f.hp;
  p.health = f.hp;
  p.w = f.w;
  p.h = f.h;
  if (f.glide) p.glide = true;
  if (opts.silent || evo === 0) return;
  p.evoBurst = 90;
  try {
    window.dispatchEvent(new CustomEvent("ohana-evolve", {
      detail: { name: p.name, evo: p.evo, color: p.color, id: p.id }
    }));
  } catch (_) {}
}
