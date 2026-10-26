import test from'node:test';import assert from'node:assert/strict';
import{world1NextObjective}from'../systems/world1-play.js';
import{WORLD1_ROOMS,WORLD1_ARENA,WORLD1_ORDER}from'../systems/world1-rooms.js';
import{chapterMapDetail}from'../systems/adventure-guide-v2.js';
import{drawLocalMap}from'../systems/local-map.js';
import{world1Guidance}from'../systems/world1-guidance.js';
const fixture=()=>({roomId:'w1-final',roomDef:WORLD1_ROOMS['w1-final'],world1:{room:'w1-final'},world1Seals:[...WORLD1_ORDER],player:{id:'cuerno',x:7550,y:1090,w:32,h:44},platforms:[],cam:{x:7380,y:457},finalGauntlet:null});
const canvas=()=>{const texts=[];return {texts,ctx:new Proxy({fillText(text){texts.push(String(text));}},{get:(o,key)=>key in o?o[key]:(()=>{})})};};
test('final map follows entry, actual moving guardian, physical keepsake and Quimera in order',()=>{
 const g=fixture();let goal=world1NextObjective(g);assert.ok(goal.x>WORLD1_ARENA.start);assert.match(goal.label,/guardianes/);
 g.finalGauntlet={phase:'fight',hero:'cuerno',found:['kilo'],guardian:{x:10800,y:910,w:184,h:224,hp:740},object:{x:9360,y:1119}};
 goal=world1NextObjective(g);assert.equal(goal.x,10892);assert.match(goal.label,/Ciervo/);g.finalGauntlet.guardian.x=7600;assert.equal(world1NextObjective(g).x,7692,'target follows the real charge endpoint');
 g.finalGauntlet.guardian.hp=0;assert.equal(world1NextObjective(g).x,9360,'the kill frame already points toward the released object');g.finalGauntlet.phase='released';goal=world1NextObjective(g);assert.equal(goal.x,9360);assert.equal(goal.y,1119);assert.equal(goal.label,'Primer pincel');assert.match(world1Guidance(g.roomId,g).objective,/Primer pincel.*toca el objeto/);
 g.finalGauntlet.phase='complete';g.boss={x:10100,y:844,w:230,h:290,hp:2800};goal=world1NextObjective(g);assert.equal(goal.x,10215);assert.equal(goal.label,'Quimera Ohana');g.world1Won=true;assert.equal(world1NextObjective(g),null);
});
test('after an edge-of-arena victory the minimap points to the relic instead of ending the route',()=>{
 const g=fixture();g.finalGauntlet={phase:'released',hero:'cuerno',found:[],guardian:{hp:0},object:{x:9360,y:1119}};
 for(const [x,direction]of[[7550,'→'],[10900,'←']]){g.player.x=x;const c=canvas();drawLocalMap(c.ctx,g,390,844);assert.ok(c.texts.some(t=>t.startsWith('META '+direction)),c.texts.join(' / '));assert.ok(!c.texts.includes('FIN DE RUTA'));}
 const html=chapterMapDetail(g.roomId,g);assert.match(html,/class="wm-current-objective"/);assert.match(html,/<title>Primer pincel<\/title>/);assert.match(html,/Ahora: Primer pincel/);assert.match(html,/Ámbar: destino actual/);
});
test('ordinary chapters retain their authored growth destination',()=>{
 const g={roomId:'w1-kilo',roomDef:WORLD1_ROOMS['w1-kilo'],world1:{kind:'serenata',sealed:false,stations:[{id:0,note:0,x:1234,y:1034,done:false}]},player:{id:'kilo',x:100,y:1000,w:22,h:26},enemies:[]};
 const goal=world1NextObjective(g);assert.equal(goal.x,1234);assert.equal(goal.label,'Flor sin canción');assert.match(goal.action,/Nota 1\/4/);
});
