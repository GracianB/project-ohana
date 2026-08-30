export const ROSTER = [
  {
    id: "lilo",
    name: "Lilo",
    color: "#e23b3b",
    speed: 4.4, jumpPower: 13.2, maxJumps: 1, health: 110, w: 28, h: 42,
    abilities: ["ukulele", "hula", "ohana"],
    evoNames: ["Lilo", "Guardiana Ohana", "Alma de Kauai"],
    forms: [
      { name: "Lilo", color: "#e23b3b", speed: 4.4, jump: 13.2, jumps: 1, hp: 110, w: 28, h: 42 },
      { name: "Guardiana Ohana", color: "#ff5a7a", speed: 5.1, jump: 14.4, jumps: 2, hp: 150, w: 34, h: 50 },
      { name: "Alma de Kauai", color: "#ffd36a", speed: 5.8, jump: 15.6, jumps: 2, hp: 200, w: 40, h: 56 }
    ]
  },
  {
    id: "stitch",
    name: "Stitch",
    color: "#3b6cff",
    speed: 5.4, jumpPower: 12.4, maxJumps: 2, health: 130, w: 36, h: 32,
    abilities: ["dash", "claws", "exp626"],
    evoNames: ["Stitch", "Berserk 626", "Experiment MAX"],
    forms: [
      { name: "Stitch", color: "#3d9bff", speed: 5.4, jump: 12.4, jumps: 2, hp: 130, w: 36, h: 32 },
      { name: "Berserk 626", color: "#1c4bff", speed: 6.4, jump: 13.6, jumps: 2, hp: 175, w: 44, h: 38 },
      { name: "Experiment MAX", color: "#6af", speed: 7.2, jump: 15.0, jumps: 3, hp: 230, w: 54, h: 46 }
    ]
  },
  {
    id: "pikachu",
    name: "Pikachu",
    color: "#f5d000",
    speed: 6.2, jumpPower: 14.2, maxJumps: 2, health: 80, w: 30, h: 28,
    abilities: ["shock", "quick", "thunder"],
    evoNames: ["Pikachu", "Raichu", "Tormenta"],
    forms: [
      { name: "Pikachu", color: "#ffe44a", speed: 6.2, jump: 14.2, jumps: 2, hp: 80, w: 30, h: 28 },
      { name: "Raichu", color: "#e08a20", speed: 6.8, jump: 15.0, jumps: 2, hp: 120, w: 38, h: 36 },
      { name: "Tormenta", color: "#fff36a", speed: 7.6, jump: 16.2, jumps: 3, hp: 160, w: 44, h: 42 }
    ]
  },
  {
    id: "dragon",
    name: "Mushu",
    color: "#e23a1c",
    speed: 3.8, jumpPower: 11.5, maxJumps: 1, glide: true, health: 180, w: 52, h: 44,
    abilities: ["breath", "wing", "rage"],
    evoNames: ["Mushu", "Guardia Imperial", "Gran Dragon Rojo"],
    forms: [
      { name: "Mushu", color: "#e23a1c", speed: 3.8, jump: 11.5, jumps: 1, hp: 180, w: 40, h: 36, glide: true },
      { name: "Guardia Imperial", color: "#d61f12", speed: 4.6, jump: 13.0, jumps: 2, hp: 240, w: 58, h: 50, glide: true },
      { name: "Gran Dragon Rojo", color: "#8b1208", speed: 5.2, jump: 14.4, jumps: 2, hp: 320, w: 72, h: 60, glide: true }
    ]
  },
  {
    id: "cat",
    name: "Kawaii Cat",
    color: "#ff8ad4",
    speed: 5.8, jumpPower: 12.8, maxJumps: 3, health: 90, w: 26, h: 26,
    abilities: ["claw", "catdash", "lives"],
    evoNames: ["Gatito", "Neko Shadow", "Nueve Vidas"],
    forms: [
      { name: "Gatito", color: "#ffb6e4", speed: 5.8, jump: 12.8, jumps: 3, hp: 90, w: 26, h: 26 },
      { name: "Neko Shadow", color: "#ff5cb8", speed: 6.8, jump: 14.0, jumps: 3, hp: 130, w: 32, h: 32 },
      { name: "Nueve Vidas", color: "#fff", speed: 7.6, jump: 15.4, jumps: 4, hp: 170, w: 36, h: 36 }
    ]
  }
];

export function applyForm(p) {
  const f = (p.forms && p.forms[p.evo]) || null;
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
  p.evoBurst = 90;
  try {
    window.dispatchEvent(new CustomEvent("ohana-evolve", {
      detail: { name: p.name, evo: p.evo, color: p.color, id: p.id }
    }));
  } catch (_) {}
}
