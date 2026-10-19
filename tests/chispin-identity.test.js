import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,aliasId} from '../characters/roster.js';
import {getArt,hasArt} from '../characters/art/index.js';
import originalChispin from '../characters/art/pikachu.js';
import playableChispin from '../characters/art/chispin.js';
import whiteGold from '../characters/art/chispin-boss.js';
import {enterStitchoTrail,updateStitchoTrail} from '../systems/stitcho-trail.js';
import {WORLD_TWO_GUARDIAN,WORLD_TWO_GUARDIAN_ID,WORLD_TWO_ATTACKS,
 createWorldTwoGuardian,updateWorldTwoGuardian} from '../systems/world-two-guardian.js';

test('Chispín playable is the original spring-tail hero, with Trueno Gordo as fourth evolution',()=>{
 const chispin=ROSTER.find(x=>x.id==='chispin');
 assert.ok(chispin);
 assert.equal(chispin.evoNames.length,5);
 assert.equal(chispin.evoNames[3],'Trueno Gordo');
 assert.equal(chispin.forms[3].w,40,'the fourth evolution is wider and rounder');
 assert.equal(aliasId('pikachu'),'chispin');
 assert.equal(getArt('chispin'),originalChispin);
 assert.equal(getArt('pikachu'),originalChispin);
 assert.equal(playableChispin,originalChispin);
 assert.notEqual(whiteGold,playableChispin);
 assert.equal(whiteGold.id,'world-two-thunder-guardian');
 assert.equal(hasArt('world-two-thunder-guardian'),false,'boss cannot become a selectable hero');
 assert.equal(ROSTER.some(x=>x.id===whiteGold.id),false);
});
test('white-gold dragon-like creature is a persistent optional miniboss of Stitcho world 2',()=>{
 const saved=['stitcho-spark','stitcho-echo','stitcho-fragment-a','stitcho-fragment-b'];
 const g={roomId:'hub',personalAdventureSolo:true,
  player:{id:'stitcho',x:1800,y:1040,w:32,h:40,grounded:false,invuln:0},
  secrets:{hub:saved},clearedEncounters:{hub:[]},platforms:[],projectiles:[],cam:{x:1540},
  viewW:1200,t:0,save(){},nums:{add(){}},fx:{emit(){}},enemies:[]};
 let spawned=0;
 g.spawnWorldTwoGuardian=()=>{spawned++;g.enemies.push(createWorldTwoGuardian(
  (x,y,kind)=>({x,y,kind,w:24,h:24,hp:50,max:50}),()=>.5));return true;};
 enterStitchoTrail(g);
 assert.equal(g.stitchoTrail.index,2,'unlocked after the second world relay');
 updateStitchoTrail(g,()=>{});
 updateStitchoTrail(g,()=>{});
 assert.equal(spawned,1,'secret boss spawns once, without changing Glitch Core unlock');
 const e=g.enemies[0];
 assert.equal(e._encounterSaveId,WORLD_TWO_GUARDIAN_ID);
 assert.equal(e._worldTwoGuardian,true);
 assert.equal(e.miniBoss,true);assert.equal(e.max,WORLD_TWO_GUARDIAN.hp);
 assert.equal(WORLD_TWO_ATTACKS.length,3);
 const patterns=new Set();for(let i=0;i<1050;i++){
  g.t++;updateWorldTwoGuardian(e,g,()=>{});
  if(e._worldTwo.phase==='warn')patterns.add(e._worldTwo.attack);
  assert.ok(e.x>=WORLD_TWO_GUARDIAN.left);
  assert.ok(e.x+e.w<=WORLD_TWO_GUARDIAN.right);
 }
 assert.deepEqual([...patterns].sort(),[0,1,2]);
 e.hp=100;updateWorldTwoGuardian(e,g,()=>{});
 assert.equal(e._worldTwo.tier,2);
 g.clearedEncounters.hub.push(WORLD_TWO_GUARDIAN_ID);
 g.enemies=[];spawned=0;enterStitchoTrail(g);updateStitchoTrail(g,()=>{});
 assert.equal(spawned,0,'victory persists and boss never duplicates on reload');
});
test('optional World 2 guardian does not appear in the original co-op room',()=>{
 const g={roomId:'hub',personalAdventureSolo:false,player:{id:'stitcho',x:0,y:0},
  secrets:{hub:[]},platforms:[],clearedEncounters:{hub:[]}};
 enterStitchoTrail(g);
 assert.equal(g.stitchoTrail,null);
});
