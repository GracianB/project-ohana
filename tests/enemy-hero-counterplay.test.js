import test from 'node:test';
import assert from 'node:assert/strict';
import {heroCounterplay} from '../systems/enemy-hero-counterplay.js';
import {directEnemyEncounter,enemyDirectorSnapshot} from '../systems/enemy-director.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
const e=(kind,index,x)=>({kind,spawnIndex:index,x,y:500,w:30,h:30,hp:100,max:100,aggro:0,vx:0,vy:0});
const p=(id,extra={})=>({id,x:300,y:500,w:32,h:38,vx:0,vy:0,grounded:true,...extra});
test('V2: falling Dino provokes physical flanks, not arbitrary damage buffs',()=>{
 const enemies=[e('cangrejo',0,450),e('ufo',1,490)];
 const hero=p('dino',{y:390,vy:7,grounded:false});
 const before=enemies.map(f=>[f.hp,f.max]);
 directEnemyEncounter(enemies,hero,'w1-dino',150);
 assert.equal(enemies[0].aiIntent,'FLANK');
 assert.equal(enemies[1].aiIntent,'RETREAT');
 assert.deepEqual(enemies.map(f=>[f.hp,f.max]),before);
});
test('V2: a fast Cuerno forces an ambusher to cut across the route',()=>{
 const enemies=[e('arana',0,450),e('cucaracho',1,510)];
 directEnemyEncounter(enemies,p('cuerno',{vx:8.4}),'w1-cuerno',160);
 assert.equal(enemies[0].aiIntent,'FLANK');
 assert.equal(enemies[0].aiHeroRead,'FAST_HERO');
 assert.notEqual(enemies[1].aiHeroRead,'FAST_HERO');
});
test('V2: clustered Chispin ranged foes spread only after a real J cast',()=>{
 const hero=p('chispin',{_cast:{slot:0,t:50}});
 const list=[e('ufo',0,420),e('medusa',1,440),e('rana',2,480)];
 directEnemyEncounter(list,hero,'w1-chispin',90);
 assert.equal(list[0].aiHeroRead,'CHAIN_SPREAD');
 assert.equal(list[0].aiIntent,'RETREAT');
 directEnemyEncounter(list,hero,'w1-chispin',150);
 assert.notEqual(list[0].aiHeroRead,'CHAIN_SPREAD');
});
test('V2: airborne dragon and Yomi ping have separate, finite readable responses',()=>{
 const air=[e('planta',0,460)];directEnemyEncounter(air,p('dragon',{grounded:false,vy:-4}),'w1-dragon',11);
 assert.equal(air[0].aiHeroRead,'AIR_TARGET');
 const ping=[e('planta',0,460)];directEnemyEncounter(ping,p('yomi',{_cast:{slot:0,t:13}}),'w1-yomi',16);
 assert.equal(ping[0].aiHeroRead,'YOMI_PING');
 assert.equal(enemyDirectorSnapshot(ping)[0].heroRead,'YOMI_PING');
});
test('V2: active windups are committed, unknown heroes never receive secret counters',()=>{
 const committed=e('cangrejo',0,460);committed.telegraph=true;
 assert.equal(heroCounterplay(committed,p('dino',{vy:9,grounded:false}),{role:'BRUISER',distance:100,committed:true}),null);
 assert.equal(heroCounterplay(e('ufo',0,470),p('other',{vx:12}),{role:'ARTILLERY',distance:100}),null);
 const troops=[committed,e('cangrejo',1,480)];
 const plan=directEnemyEncounter(troops,p('dino',{vy:9,grounded:false}),'w1-dino',40);
 assert.equal(plan.budget,2);
 assert.equal(committed.aiAttackPermit,true);
 assert.notEqual(committed.aiIntent,'FLANK');
});

test('V2: campaign combat actually consumes the hero-specific steering order',()=>{
 const heavy=p('dino',{y:390,vy:9,grounded:false});
 const foe=e('cangrejo',0,460);foe.campaignRole='pursuer';
 const g={player:heavy,roomId:'w1-dino',roomDef:{composition:true},
  cam:{x:0,y:0},viewW:1000,viewH:800,
  worldW:1600,worldH:1260,platforms:[],projectiles:[],enemies:[foe]};
 directEnemyEncounter(g.enemies,heavy,g.roomId,60);
 assert.equal(foe.aiIntent,'FLANK');
 const startingX=foe.x;
 updateCampaignEnemy(foe,g);
 assert.ok(Number.isFinite(foe.x));
 assert.notEqual(foe.x,startingX,'movement must consume the tactic in actual combat');
 assert.ok(foe._campaign.age===1,'the existing campaign brain remains authoritative');
});
