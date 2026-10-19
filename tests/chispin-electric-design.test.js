import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {createChispinRoom} from '../systems/chispin-room.js';
import {CHISPIN_SPRINGS,enterChispinStorm,updateChispinStorm,chispinStormAbility,CHISPIN_GATES}
 from '../systems/chispin-storm.js';
import {updateIslandSprings} from '../systems/island-springs.js';
import {enterChispinEnemies,updateChispinEnemies} from '../systems/chispin-enemies.js';
import {HERO_FINAL_OBJECTS,enterHeroCollection,takeHeroCollectionItem} from '../systems/hero-collections.js';
const fixture=()=>{
 const g={roomId:'lab',roomDef:createChispinRoom(ROOMS.lab),
  player:{id:'chispin',x:0,y:0,w:30,h:40,grounded:true,vy:0,
   jumpPower:12,jumps:1,health:65,maxHealth:100,invuln:0},
  personalAdventureSolo:true,t:1,score:0,
  platforms:[],enemies:[],projectiles:[],secrets:{lab:[]},
  clearedEncounters:{lab:[]},cam:{x:0},fx:{emit(){}},
  nums:{add(){}},save(){},spawnChispinBoss(){return true;}
 };
 enterChispinStorm(g);return g;
};
test('all three voltaic flowers sit over real ground and reach the elevated routes',()=>{
 const room=createChispinRoom(ROOMS.lab);
 for(const flower of CHISPIN_SPRINGS){
  assert.ok(room.plats.some(([x,y,w,h])=>h>40&&y===flower.y&&
   flower.x>=x+45&&flower.x<=x+w-45),'flower must be safe on solid ground');
  assert.ok(flower.power>=29,'strong enough to reach high platforms');
  assert.ok(flower.aimY<flower.y-400);
 }
});
test('electric flower launches a walking hero, cannot double trigger and rearms only after leaving',()=>{
 const g=fixture(),flower=CHISPIN_SPRINGS[1],s=g.chispinStorm;
 g.player.x=flower.x-15;g.player.y=flower.y-40;
 updateChispinStorm(g);
 assert.equal(g.player.vy,-flower.power);
 assert.equal(g.player.grounded,false);
 assert.equal(g.player._pmove,'spring');
 assert.equal(s.springArmed[1],false);
 assert.ok(s.springFlash[1]>0);
 g.player.grounded=true;g.player.vy=0;
 for(let i=0;i<50;i++){g.t++;updateChispinStorm(g);}
 assert.equal(g.player.vy,0,'not a permanent auto-jump while remaining on a pad');
 g.player.x+=200;g.t++;updateChispinStorm(g);
 assert.equal(s.springArmed[1],true);
 g.player.x=flower.x-15;g.t++;updateChispinStorm(g);
 assert.equal(g.player.vy,-flower.power,'later return launches again');
});
test('hundredth Storm Core relic upgrades an actual flower launch by fourteen percent',()=>{
 const g=fixture(),flower=CHISPIN_SPRINGS[0];
 g.player._heroHundredBonus='CORONA DE TORMENTA';
 g.player.x=flower.x-15;g.player.y=flower.y-40;
 updateChispinStorm(g);
 assert.ok(g.player.vy<=-flower.power*1.13);
});
test('DOWN explicitly suppresses the flower and authored scene suppresses generic flowers',()=>{
 const g=fixture(),flower=CHISPIN_SPRINGS[0];
 g.player.x=flower.x-15;g.player.y=flower.y-40;
 g.player._dropWasHeld=true;updateChispinStorm(g);
 assert.equal(g.player.vy,0);
 updateIslandSprings(g);
 assert.equal(g.islandSprings,null,'no duplicate automatic flower');
});
test('J K L in sequence chains electricity, heals and interrupts nearby Tempest Eye',()=>{
 const g=fixture(),p=g.player;
 const boss={x:1030,y:980,w:138,h:110,hp:520,stun:0,_chispinBoss:true};
 g.enemies=[boss];p.x=1010;p.y=1010;
 for(let i=0;i<3;i++){g.t+=5;assert.equal(chispinStormAbility(g,p,i),true);}
 assert.equal(g.chispinStorm.comboCount,1);
 assert.equal(p.health,73);assert.equal(boss.stun,29);
 assert.ok(g.chispinStorm.gateSilencedUntil.every(v=>v>g.t));
 assert.equal(g.score,350,'one-time native ability mastery + one chain payout');
 for(let i=0;i<3;i++)chispinStormAbility(g,p,i);
 assert.equal(g.chispinStorm.comboCount,1,'cooldown prevents a reward farm');
});
test('electric foes carry their own shield warning, flyer volleys and charged speed bursts',()=>{
 const g=fixture(),p=g.player;p.x=500;p.y=1000;
 const flyer={x:490,y:970,w:32,h:30,hp:30,spawnIndex:1,
  roomPersona:{name:'Mosquito de voltaje',role:'flyer'}};
 const shield={x:520,y:1010,w:40,h:40,hp:60,spawnIndex:2,
  roomPersona:{name:'Blindado aislante',role:'shield'}};
 g.enemies=[flyer,shield];enterChispinEnemies(g);
 assert.equal(flyer._chispinMob.role,'flyer');
 assert.equal(shield._chispinMob.role,'shield');
 g.t=300;let damage=0;updateChispinEnemies(g,()=>damage++);
 assert.ok(g.projectiles.some(q=>q.owner==='enemy'&&q.color==='#aeebff'));
 assert.equal(damage,1);
 assert.ok(g.enemies.every(e=>e._chispinMob.spent===1));
});
test('Stitcho hundredth item is a literal Galactic Heart, Chispin the Storm Core',()=>{
 assert.equal(HERO_FINAL_OBJECTS.stitcho,'Corazón Galáctico');
 assert.equal(HERO_FINAL_OBJECTS.chispin,'Núcleo de Tormenta');
 const g=fixture();enterHeroCollection(g);
 const altar=g.heroCollection.items[99];
 assert.equal(altar.final,true);
 assert.equal(altar.name,'Núcleo de Tormenta');
 assert.ok(altar.x<500&&altar.y>1000);
 assert.equal(takeHeroCollectionItem(g,99),false,'relic must genuinely be final');
 for(let i=0;i<99;i++)assert.equal(takeHeroCollectionItem(g,i),true);
 assert.equal(takeHeroCollectionItem(g,99),true);
 assert.equal(g.heroCollection.complete,true);
 assert.equal(g.player._heroHundredBonus,'CORONA DE TORMENTA');
});
