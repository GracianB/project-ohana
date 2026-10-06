import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.addEventListener ||= (() => {});
globalThis.removeEventListener ||= (() => {});
globalThis.dispatchEvent ||= (() => true);
globalThis.window.addEventListener = globalThis.addEventListener;
globalThis.window.removeEventListener = globalThis.removeEventListener;
globalThis.window.dispatchEvent = globalThis.dispatchEvent;

const { EVOLUTION_CINEMA_PROFILES } = await import('../characters/evolution.js');
const { evolutionTiming } = await import('../systems/evolution-timing.js');
const { SUPREME_IDENTITY, supremeOf, useAbility, clearAbilityFx } = await import('../systems/abilities.js');

const CHARACTERS = ['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno'];

test('PR151.1: existen exactamente 10 perfiles cinematográficos', () => {
  assert.equal(Object.keys(EVOLUTION_CINEMA_PROFILES).length, 10);
  assert.deepEqual(Object.keys(EVOLUTION_CINEMA_PROFILES).sort(), [...CHARACTERS].sort());
});

test('PR151.2: cada perfil tiene cámara, paleta, motivo y lenguaje de revelado', () => {
  for (const id of CHARACTERS) {
    const p = EVOLUTION_CINEMA_PROFILES[id];
    for (const key of ['camera','bg','accent','motif','pulse','reveal','speed']) assert.ok(p[key] !== undefined, id + '/' + key);
    assert.ok(Number.isFinite(p.speed) && p.speed > 0, id + '/speed');
  }
});

test('PR151.3: los perfiles cinematográficos no comparten todos los motivos', () => {
  assert.equal(new Set(CHARACTERS.map((id) => EVOLUTION_CINEMA_PROFILES[id].motif)).size, 10);
});

test('PR151.4: la forma final conserva la secuencia temporal canónica', () => {
  const t = evolutionTiming({ finalForm: true });
  assert.deepEqual(t, { dark:0.22, oldIn:0.42, charge:0.82, flip:1.08, flash:1.22, reveal:1.22, out:3.28, end:3.82 });
});

test('PR151.5: reduced motion mantiene una salida más corta y completa', () => {
  const t = evolutionTiming({ finalForm: true, reduced: true });
  assert.ok(t.dark < 0.22);
  assert.ok(t.end < 1.2);
  assert.ok(t.end > t.reveal);
});

test('PR151.6: existen 10 identidades supreme y todas son únicas', () => {
  assert.equal(Object.keys(SUPREME_IDENTITY).length, 10);
  assert.deepEqual(Object.keys(SUPREME_IDENTITY).sort(), [...CHARACTERS].sort());
  assert.equal(new Set(CHARACTERS.map((id) => SUPREME_IDENTITY[id].kind)).size, 10);
});

test('PR151.7: cada personaje resuelve su supreme correcto', () => {
  for (const id of CHARACTERS) assert.equal(supremeOf(id).key, 'U');
  assert.equal(supremeOf('kilo').id, 'solar');
  assert.equal(supremeOf('cat').id, 'eclipse');
  assert.equal(supremeOf('yomi').id, 'devour');
});

test('PR151.8: las 10 supremes se pueden lanzar sin romper el contrato', () => {
  for (const id of CHARACTERS) {
    clearAbilityFx();
    const enemy = { x:180,y:260,w:30,h:34,hp:500,max:500,dying:false,invuln:0,vx:0,vy:0,stun:0,flash:0 };
    const player = { id, abilities:['a','b','c'], x:100,y:260,w:28,h:34,facing:1,evo:4,health:50,maxHealth:125,cds:{},cdDur:{},dead:false,xp:0,vx:0,vy:0,grounded:true };
    const game = { player,enemies:[enemy],projectiles:[],ghosts:[],platforms:[],worldW:1600,worldH:900,cam:{x:0,y:0},t:0,reduceMotion:true,shake:0,flash:0,score:0,nums:{add(){}},fx:{emit(){}},rng:()=>0.5 };
    assert.doesNotThrow(() => useAbility(game,3), id);
    assert.equal(game.lastAbilitySlot,3,id+'/slot');
    assert.equal(game.ult.identity,SUPREME_IDENTITY[id].kind,id+'/identity');
    assert.ok(game.player.cds[supremeOf(id).id] > 0,id+'/cooldown');
  }
  clearAbilityFx();
});

test('PR151.9: Yomi conserva el contrato de ejecución al 34% de vida', () => {
  clearAbilityFx();
  const enemy = { x:180,y:260,w:30,h:34,hp:20,max:100,dying:false,invuln:0,vx:0,vy:0,stun:0,flash:0 };
  const player = { id:'yomi',abilities:['a','b','c'],x:100,y:260,w:28,h:34,facing:1,evo:4,health:100,maxHealth:125,cds:{},cdDur:{},dead:false,xp:0 };
  const game = {player,enemies:[enemy],projectiles:[],ghosts:[],platforms:[],worldW:1600,worldH:900,cam:{x:0,y:0},t:0,reduceMotion:true,shake:0,flash:0,score:0,nums:{add(){}},fx:{emit(){}}};
  useAbility(game,3);
  assert.equal(enemy.hp,0);
  assert.ok(enemy.dying);
  clearAbilityFx();
});

test('PR151.10: los contratos de estado de Kilo/Frita/Cuerno se aplican en la supreme', () => {
  for (const [id, flag] of [['kilo','invuln'],['frita','_fryGodT'],['cuerno','xp']]) {
    clearAbilityFx();
    const enemy={x:180,y:260,w:30,h:34,hp:500,max:500,dying:false,invuln:0,vx:0,vy:0,stun:0,flash:0};
    const player={id,abilities:['a','b','c'],x:100,y:260,w:28,h:34,facing:1,evo:4,health:40,maxHealth:125,cds:{},cdDur:{},dead:false,xp:0};
    const game={player,enemies:[enemy],projectiles:[],ghosts:[],platforms:[],worldW:1600,worldH:900,cam:{x:0,y:0},t:0,reduceMotion:true,shake:0,flash:0,score:0,nums:{add(){}},fx:{emit(){}}};
    const xp0=player.xp;
    useAbility(game,3);
    if(flag==='invuln') assert.ok(player.invuln>=75);
    if(flag==='_fryGodT') assert.ok(player._fryGodT>=120);
    if(flag==='xp') assert.ok(player.xp>xp0);
  }
  clearAbilityFx();
});