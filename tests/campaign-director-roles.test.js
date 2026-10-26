import test from 'node:test';
import assert from 'node:assert/strict';
import {directEnemyEncounter,enemyCombatRole,enemyDirectorSnapshot,enemyRole,enemySteering} from '../systems/enemy-director.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {CHAPTER_ENCOUNTERS} from '../systems/chapter-encounters.js';

const foe=(kind,campaignRole,index=0,x=480)=>({
 kind,campaignRole,spawnIndex:index,x,y:500,w:46,h:58,hp:100,max:100,
 vx:0,vy:0,aggro:0,telegraph:false,
});
const hero=(id,extra={})=>({id,x:300,y:500,w:32,h:38,dead:false,grounded:true,vx:0,vy:0,...extra});

test('V603: chapter controllers have tactical roles independent of their construction species',()=>{
 const roles={pursuer:'BRUISER',shield:'BRUISER',shooter:'ARTILLERY',gunner:'ARTILLERY',captain:'ARTILLERY',jumper:'SKIRMISHER',flyer:'DIVER',burrower:'AMBUSHER'};
 const authored=new Set(Object.values(CHAPTER_ENCOUNTERS).flatMap(p=>p.groups.flatMap(([,r])=>r)));
 for(const role of authored)assert.ok(role in roles,'every authored controller has a known tactic');
 for(const [role,expected] of Object.entries(roles)){
  assert.equal(enemyCombatRole(foe('planta',role)),expected);
  assert.equal(enemyCombatRole(foe('cucaracho',role)),expected);
 }
 assert.equal(enemyCombatRole(foe('gaviota',undefined)),enemyRole('gaviota'));
 assert.equal(enemyCombatRole(foe('cucaracho','unknown')),enemyRole('cucaracho'));
 assert.equal(enemyCombatRole(foe('ufo','__proto__')),enemyRole('ufo'));
});

test('V603: the actual Kilo gunner spreads against lightning; the jumper can still flank a fast hero',()=>{
 // These two combinations are really authored in the final Kilo group.
 const gunner=foe('gaviota','gunner',0,440),jumper=foe('planta','jumper',1,480);
 const p=hero('chispin',{_cast:{slot:0,t:100}});
 directEnemyEncounter([gunner,jumper],p,'w1-kilo',110);
 assert.equal(gunner.aiRole,'ARTILLERY');assert.equal(gunner.aiHeroRead,'CHAIN_SPREAD');
 assert.equal(gunner.aiIntent,'RETREAT');assert.notEqual(jumper.aiHeroRead,'CHAIN_SPREAD');
 const startingX=gunner.x;
 updateCampaignEnemy(gunner,{player:p,roomId:'w1-kilo',roomDef:{composition:true},cam:{x:0,y:0},viewW:1000,viewH:800,worldW:1600,worldH:1260,platforms:[],projectiles:[],enemies:[gunner,jumper]});
 assert.ok(gunner.x>startingX,'the ranged controller physically creates space from Chispin');
 directEnemyEncounter([jumper],hero('cuerno',{vx:8.4}),'w1-kilo',130);
 assert.equal(jumper.aiHeroRead,'FAST_HERO');assert.equal(jumper.aiIntent,'FLANK');
});

test('V603: a carapace construction kind cannot suppress an authored marksman retreat',()=>{
 const ranged=foe('cucaracho','shooter'),guard=foe('ufo','shield',1,460);
 ranged.hp=20;guard.hp=20;
 directEnemyEncounter([ranged,guard],hero('kilo'),'w1-stitcho',150);
 assert.equal(ranged.aiIntent,'RETREAT');assert.notEqual(guard.aiIntent,'RETREAT');
 assert.equal(enemySteering(ranged,hero('kilo')).scale,.16);
 const legacy=foe('cucaracho',undefined);legacy.hp=20;
 directEnemyEncounter([legacy],hero('kilo'),'hub',150);
 assert.notEqual(legacy.aiIntent,'RETREAT','legacy carapaces retain their original behaviour');
});

test('V603: species pairs and snapshots use the controllers of both individual actors',()=>{
 const ranged=foe('gaviota','gunner',0,420),diver=foe('planta','flyer',1,540);
 const numeric=[ranged,diver].map(e=>[e.hp,e.max,e.w,e.h]);
 directEnemyEncounter([ranged,diver],hero('kilo'),'w1-kilo',144);
 assert.equal(ranged.aiSpeciesRelation,'FLUSH');assert.equal(diver.aiSpeciesRelation,'FLUSH');
 assert.deepEqual(enemyDirectorSnapshot([ranged,diver]).map(r=>r.role),['ARTILLERY','DIVER']);
 assert.deepEqual([ranged,diver].map(e=>[e.hp,e.max,e.w,e.h]),numeric,'coordination never changes stats or hitboxes');
});
