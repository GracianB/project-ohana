import test from 'node:test';import assert from 'node:assert/strict';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {damageEnemy} from '../systems/mutations.js';
const encounter=(pressure,active=0)=>{
 const e={x:100,y:1094,w:40,h:40,hp:100,vy:0,vx:0,campaignRole:'pursuer',roomPersona:{kiloPressure:pressure},_campaign:{age:0,wind:0,cd:100,active,aim:1}};
 const hits=[],g={player:{x:100,y:1094,w:40,h:40},cam:{x:0,y:600},viewW:1200,viewH:700,worldW:9600,worldH:1260,projectiles:[],platforms:[{x:0,y:1134,w:9600,h:126}]};
 updateCampaignEnemy(e,g,n=>hits.push(n));return hits;
};
test('Kilo note foes cannot be walked through harmlessly; other chapters retain their combat rules',()=>{
 assert.deepEqual(encounter(true),[8]);assert.deepEqual(encounter(false),[]);
 assert.deepEqual(encounter(true,10),[14]);assert.deepEqual(encounter(false,10),[12]);
});
test('authored window budget is shared by every hit and never makes negative damage or heals',()=>{
 const boss={hp:540,damageTakenScale:1,damageWindowRemaining:180};
 assert.equal(damageEnemy(boss,120),true);assert.equal(boss.hp,420);
 assert.equal(damageEnemy(boss,1000),true);assert.equal(boss.hp,360);assert.equal(boss.damageWindowRemaining,0);
 assert.equal(damageEnemy(boss,5),false);assert.equal(boss.hp,360);
 const normal={hp:540};damageEnemy(normal,250);assert.equal(normal.hp,290);
});
