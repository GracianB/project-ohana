// One identity per playable hero. These are proposed destinations, NOT unlocked levels.
// Keep this catalog separate from the ten shared Hoku rooms and five family islands.
// Only mark playable once a real scene, entry route, progression and browser E2E exist.
export const HERO_WORLDS = Object.freeze([
  {hero:'kilo', id:'kilo-bahia', name:'Bahía del Compás', biome:'tropical', motif:'ritmo y mareas', family:'aloha', phase:'development'},
  {hero:'stitcho', id:'stitcho-archipielago', name:'Archipiélago del Caos', biome:'alien', motif:'saltos e inventos', family:'aloha', phase:'planned'},
  {hero:'chispin', id:'chispin-tormenta', name:'Islas del Relámpago', biome:'storm', motif:'electricidad y circuitos', family:'storm', phase:'planned'},
  {hero:'cat', id:'michi-luna', name:'Jardines de la Luna', biome:'lunar', motif:'sueños y secretos', family:'moon', phase:'planned'},
  {hero:'dragon', id:'dragon-cenizas', name:'Cordillera de las Brasas', biome:'volcanic', motif:'vuelo y fuego', family:'fossil', phase:'planned'},
  {hero:'dino', id:'dino-fosiles', name:'Valle de los Gigantes', biome:'prehistoric', motif:'fuerza y fósiles', family:'fossil', phase:'planned'},
  {hero:'frita', id:'frita-mercado', name:'Mercado Dorado', biome:'harbor', motif:'recetas y persecuciones', family:'kitchen', phase:'planned'},
  {hero:'pizza', id:'pizza-horno', name:'Reino del Horno', biome:'culinary', motif:'hornos y plataformas móviles', family:'kitchen', phase:'planned'},
  {hero:'yomi', id:'yomi-astral', name:'Observatorio Astral', biome:'cosmic', motif:'gravedad y estrellas', family:'storm', phase:'planned'},
  {hero:'cuerno', id:'cuerno-prisma', name:'Bosque del Prisma', biome:'enchanted', motif:'luz y protección', family:'moon', phase:'planned'}
].map(world=>Object.freeze(world)));
export const heroWorld = hero => HERO_WORLDS.find(world=>world.hero===hero)||null;
export const worldById = id => HERO_WORLDS.find(world=>world.id===id)||null;
export const playableHeroWorlds = () => HERO_WORLDS.filter(world=>world.phase==='playable');
