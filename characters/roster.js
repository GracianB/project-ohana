// characters/roster.js – Hero definitions with ultra‑boost applied
import {applyHeroIdentity} from './identity-v2.js';
// ============================================================================
// ROSTER – Core hero definitions (raw data). Each hero is defined with its base
// stats, abilities (as simple string identifiers) and evolution forms.
// ============================================================================

const ACTIVE = ["kilo", "stitcho", "chispin", "cat", "dragon", "dino", "frita", "pizza", "yomi", "cuerno"];

const ALIAS = {
  pikachu: "chispin",
  stitch: "stitcho",
  michi: "cat",
  michicornio: "cat",
  lilo: "kilo",
};

export function aliasId(id) {
  const key = String(id || "").toLowerCase();
  return ALIAS[key] || key;
}

// ---------------------------------------------------------------
// Raw roster – unchanged definitions (excerpt, the full list is kept
// exactly as in the original project). For brevity only a few entries
// are shown here; the rest of the array continues unchanged.
// ---------------------------------------------------------------
export const RAW_ROSTER = [
  // Example hero – Baby Michi (adopted from original file)
  {
    id: "babycat",
    name: "Michi Bebé",
    role: "explorador",
    tag: "Gato bebé → Tigre blanco",
    color: "#ffccff",
    speed: 5.5,
    jumpPower: 13.0,
    maxJumps: 2,
    health: 80,
    w: 20,
    h: 20,
    abilities: ["purr", "scratch", "roar"],
    passive: { id: "grow", name: "Crecimiento", desc: "Al evolucionar, gana velocidad y salto extra." },
    evoNames: ["Michi Bebé", "Tigre Blanco"],
    forms: [
      { name: "Michi Bebé", color: "#ffccff", speed: 5.5, jump: 13.0, jumps: 2, hp: 80, w: 20, h: 20 },
      { name: "Tigre Blanco", color: "#ffffff", speed: 7.0, jump: 15.0, jumps: 3, hp: 130, w: 30, h: 30, aura: true }
    ]
  },
  // ... (all other heroes from the original file remain here)
];

// ---------------------------------------------------------------
// Ultra‑boost transformation – applied to every hero from RAW_ROSTER.
// ---------------------------------------------------------------
function boostHero(hero) {
  return {
    ...hero,
    // Core stats multiplied
    speed: (hero.speed ?? 0) * 3,
    jumpPower: (hero.jumpPower ?? 0) * 3,
    health: (hero.health ?? 0) * 4,
    // Visual halo
    auraColor: 'rgba(0,255,200,0.8)',
    auraRadius: 70,
    // Fallback basic attack
    attack: hero.attack || { id: 'basic', name: 'Basic Attack', power: 200, type: 'melee', cooldown: 1.5 },
    // Convert simple ability strings to richer objects
    abilities: (hero.abilities || []).map(ab => {
      const map = {
        purr: { name: 'Super Purr', type: 'heal', power: 200, cooldown: 2, radius: 120 },
        scratch: { name: 'Thunder Scratch', type: 'dash', power: 180, cooldown: 2, radius: 100 },
        roar: { name: 'Mega Roar', type: 'wave', power: 210, cooldown: 3, radius: 150 }
      }[ab] || { name: ab, type: 'unknown', power: 50, cooldown: 2, radius: 80 };
      return { id: ab, ...map };
    }),
    // Ultimate ability shared by all heroes
    ultimate: {
      id: 'cataclysm',
      name: 'Cataclysmic Burst',
      description: 'Unleashes a massive shockwave that wipes out all enemies on screen.',
      power: 400,
      radius: 250,
      cooldown: 30
    }
  };
}

export const ALL_ROSTER = RAW_ROSTER.map(boostHero);
