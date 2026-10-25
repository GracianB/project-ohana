// V2: real hero trade-offs, not a difficulty label or a cosmetic card.
// Collision boxes, number of jumps, ability IDs and persisted evolution IDs
// are deliberately unchanged. Kilo retains its approved V1 curves.
export const HERO_IDENTITY = Object.freeze({
  kilo:    { title:'Directora del compás', strength:'Control, apoyo y vuelo musical', weakness:'Necesita ritmo y preparación', melee:1, cooldown:1 },
  stitcho: { title:'Acróbata del plasma', strength:'Movilidad, paredes y cuatro saltos', weakness:'Resiste poco los choques', melee:1.05, cooldown:.92, speed:[4.6,5.2,6,6.8,8], hp:[86,104,126,154,195], jump:[12,12.8,13.6,14.5,16] },
  chispin: { title:'Asalto eléctrico', strength:'La mayor cadencia de ataques', weakness:'La vida más baja; esquiva o cae', melee:.78, cooldown:.76, speed:[5.5,6.2,7,8,9.2], hp:[56,70,88,110,138], jump:[12.2,12.9,13.6,14.4,15.8] },
  cat:     { title:'Cazadora lunar', strength:'Salto alto y control de grupos', weakness:'Frágil a corta distancia', melee:1.12, cooldown:1, speed:[4.8,5.4,6,6.7,7.6], hp:[62,78,96,122,155], jump:[13,13.8,14.5,15.4,17] },
  cuerno:  { title:'Velocista de la aurora', strength:'El más veloz, alcanza lugares altos', weakness:'Golpe ligero; gana por posición', melee:.65, cooldown:.9, speed:[6.4,7.3,8.4,9.6,11], hp:[60,76,94,116,145], jump:[14.6,15.4,16.2,17.4,18.6] },
  dragon:  { title:'Artillería del cielo', strength:'Fuego potente y control aéreo', weakness:'Lento en tierra', melee:1.18, cooldown:1.2, speed:[3.5,3.9,4.4,4.9,5.7], hp:[104,132,166,212,275], jump:[11.4,12,13,13.4,14.8] },
  dino:    { title:'Coloso rompeguardias', strength:'El mayor aguante y golpe H', weakness:'El más lento; compromete cada ataque', melee:1.48, cooldown:1.24, speed:[3,3.35,3.75,4.2,4.8], hp:[140,180,225,285,360], jump:[11,11.6,12.2,12.6,14] },
  frita:   { title:'Especialista del aire', strength:'Impulso, derrape y corrección aérea', weakness:'Poca vida; depende del movimiento', melee:.9, cooldown:.85, speed:[5,5.7,6.5,7.4,8.5], hp:[70,88,108,136,172], jump:[11.4,12.1,12.8,13.6,15] },
  pizza:   { title:'Defensa elástica', strength:'Aguanta golpes, rebota y controla el suelo', weakness:'Carrera lenta, necesita anticipar', melee:1.2, cooldown:1.08, speed:[3.7,4.2,4.8,5.4,6.2], hp:[110,138,174,218,275], jump:[11.8,12.4,13.1,13.6,15.2] },
  yomi:    { title:'Estratega de datos', strength:'Analiza, contiene y sintetiza', weakness:'Menos velocidad; exige leer ventanas', melee:.75, cooldown:.88, speed:[3.4,3.8,4.2,4.7,5.3], hp:[74,92,114,143,180], jump:[12,12.6,13.2,13.8,14.8] },
});
export function applyHeroIdentity(roster) {
  for (const hero of roster) {
    const identity=HERO_IDENTITY[hero.id];
    if (!identity) continue;
    hero.identity=identity;
    // On future imports the source array may already be enriched. Reapplying
    // only assigns absolute authored values, so it never stacks modifiers.
    if (!identity.speed) continue;
    for (let i=0;i<hero.forms.length&&i<5;i++) {
      hero.forms[i].speed=identity.speed[i];
      hero.forms[i].hp=identity.hp[i];
      hero.forms[i].jump=identity.jump[i];
    }
    hero.speed=identity.speed[0];
    hero.health=identity.hp[0];
    hero.jumpPower=identity.jump[0];
  }
  return roster;
}
export function heroMeleeMultiplier(id) { return HERO_IDENTITY[id]?.melee ?? 1; }
