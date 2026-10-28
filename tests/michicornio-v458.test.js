import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,aliasId} from '../characters/roster.js';
import {ART} from '../characters/art/index.js';
import {createMichiRoom,drawMichicornioPlatformTrim} from '../systems/michi-room.js';
import {MICHICORNIO_FOE_KINDS,drawMichicornioFoe} from '../systems/michicornio-foes.js';
import {createMichiBoss,updateMichiBoss,drawMichiBossBody,drawMichiBossSignals} from '../systems/michi-boss.js';
import {HERO_COLLECTIONS} from '../systems/hero-collections.js';

const ctx=()=>new Proxy({canvas:{height:960,width:1440},globalAlpha:1}, {
 get(o,k){if(k in o)return o[k];if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return ()=>{};},
 set(o,k,v){o[k]=v;return true;}
});

test('Michicornio visible name and evolved forms preserve canonical cat ID and old save aliases',()=>{
 const p=ROSTER.find(x=>x.id==='cat');
 assert.ok(p);assert.equal(p.name,'Michicornio');
 assert.deepEqual(p.evoNames,['Michicornio Bebé','Hada Felina','Medusa Onírica','Conejornio Lunar','Michicornio Eclipse']);
 assert.deepEqual(p.forms.map(f=>f.name),p.evoNames);
 for(const id of ['michi','michicornio','cat'])assert.equal(aliasId(id),'cat');
 assert.equal(ART.cat,ART.michi);assert.equal(ART.michi,ART.michicornio);
 assert.match(HERO_COLLECTIONS.cat.title,/Michicornio/);
 assert.equal(ROSTER.length,10);
 assert.ok(ROSTER.every(x=>x.forms.length===5));
});

test('five Michicornio silhouettes render without Canvas exceptions in animation, attack and reduced motion',()=>{
 const c=ctx(),forms=['idle','run','jump','attack','cast','hurt','victory','dead'];
 for(let evo=0;evo<5;evo++)for(const state of forms)for(const reduceMotion of [false,true]){
  assert.doesNotThrow(()=>ART.cat.draw(c,{form:evo,state,t:148,phase:1.8,cast:.48,castSlot:2,atk:.6,look:{x:1,y:0},reduceMotion},{HEAD:0}),evo+'/'+state+'/'+reduceMotion);
 }
});

test('solo Moon Sanctuary has recoverable connectors, original topology and five bespoke enemy families',()=>{
 const base={id:'hub',doors:{left:'beach',up:'cave'},portals:[],plats:[],foes:[],width:4200,height:1260};
 const room=createMichiRoom(base);
 assert.equal(room.id,'hub');assert.equal(base.name,undefined);
 assert.match(room.name,/Michicornio/);
 assert.equal(room.plats.length>=55,true,'need meaningful accessible ledges');
 assert.equal(room.foes.length,10);
 assert.deepEqual(new Set(room.foes.map(x=>x[4].michiKind)),new Set(MICHICORNIO_FOE_KINDS));
 assert.equal(room.sectors.length,4);
 assert.equal(room.checkpoints.length,4);
 assert.equal(room.doors.left,'beach');
 assert.equal(room.doors.up,null);
 assert.equal(room.hazards.length,2);
 const c=ctx();const count=drawMichicornioPlatformTrim(c,room.plats,{x:600,y:450},80,1200,true);
 assert.ok(count>0,'platform art needs visible physical ledges');
 for(const type of MICHICORNIO_FOE_KINDS){
  const enemy={x:200,y:620,w:44,h:44,spawnIndex:2,roomPersona:{michiKind:type},telegraph:true,hp:80};
  assert.equal(drawMichicornioFoe(c,enemy,{x:0,y:0},50,false),true,type);
  assert.equal(drawMichicornioFoe(c,enemy,{x:0,y:0},50,true),true,type);
 }
 assert.equal(drawMichicornioFoe(c,{x:0,y:0,w:40,h:40,roomPersona:{}},{x:0,y:0}),false);
});

test('Oráculo Medusaluna has three deterministic HP tiers, warning phase and nonlethal Canvas art',()=>{
 const makeFoe=()=>({x:3400,y:950,w:40,h:40,stun:0,sleep:0,invuln:0});
 const e=createMichiBoss(makeFoe);
 assert.equal(e.max,480);assert.equal(e._encounterSaveId,'hub-michi-boss-v1');
 const game={cam:{x:3000,y:0},viewW:1200,player:{x:3400,y:1030,w:30,h:45,dead:false},projectiles:[],fx:{emit(){}},nums:{add(){}}};
 const c=ctx();
 for(const [hp,tier] of [[480,1],[270,2],[90,3]]){
  e.hp=hp;updateMichiBoss(e,game,()=>{});
  assert.equal(e._astralCat.tier,tier);
  drawMichiBossBody(c,e,game.cam,112,false);
  drawMichiBossBody(c,e,game.cam,112,true);
 }
 e._astralCat.phase='warn';e._astralCat.clock=3;e._astralCat.attack=2;
 updateMichiBoss(e,game,()=>{});assert.equal(e.telegraph,true);
 drawMichiBossSignals(c,e,game.cam,120,false);
 drawMichiBossSignals(c,e,game.cam,120,true);
 assert.equal(e._michiBoss,true);
});
