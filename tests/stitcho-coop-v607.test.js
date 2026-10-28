import test from 'node:test';
import assert from 'node:assert/strict';
import {captureCombatFrame,validCombatFrame,applyCombatFrame,advanceMirroredEnemies} from '../systems/coop-combat-mirror.js';
import {damageEnemy} from '../systems/mutations.js';

const boss=()=>({spawnIndex:997,kind:'cangrejo',miniBoss:true,_stitchoBoss:true,x:13280,y:950,w:180,h:184,hp:720,max:720,vx:0,vy:0,
 damageTakenScale:0,damageWindowRemaining:0,_glitch:{phase:'warn',clock:38,attack:2,tier:2,aim:-1,exposed:false,warnMax:55,targetX:13050,targetY:1080,
 chargeStartX:13280,chargeEndX:12800,elapsed:0,attacksExecuted:4,dropCount:5,dropGap:140,dropTop:480}});
const game=enemy=>({roomId:'w1-stitcho',enemies:[enemy],projectiles:[],coopRoomVisit:1});

test('the guest sees the same committed Glitch charge and capacitor positions without running its attack clock',()=>{
 const hostBoss=boss(),guestBoss=boss(),host=game(hostBoss),guest=game(guestBoss);
 const frame=captureCombatFrame(host,1,'stitcho-v607');assert.equal(validCombatFrame(frame),true);
 guestBoss._glitch={phase:'intro',clock:100};assert.equal(applyCombatFrame(guest,frame),true);
 const a=hostBoss._glitch,b=guestBoss._glitch;
 assert.deepEqual(b,a);
 const drops=s=>Array.from({length:s.dropCount},(_,i)=>({x:s.targetX+(i-(s.dropCount-1)/2)*s.dropGap,y:s.dropTop}));
 assert.deepEqual(drops(b),drops(a));
 for(let i=0;i<15;i++)advanceMirroredEnemies(guest,80);
 assert.equal(b.clock,38);assert.equal(b.phase,'warn');assert.equal(b.attacksExecuted,4);
 assert.deepEqual(guest.projectiles,[],'movement prediction cannot create a Glitch attack');
 assert.equal(applyCombatFrame(guest,frame),false,'a stale warning must not reset guest state');
});

test('Glitch mirrored openings share a bounded damage budget and close with the next host warning',()=>{
 const hostBoss=boss(),guestBoss=boss(),host=game(hostBoss),guest=game(guestBoss);
 Object.assign(hostBoss,{damageTakenScale:1,damageWindowRemaining:45});hostBoss._glitch.phase='rest';
 assert.equal(applyCombatFrame(guest,captureCombatFrame(host,1,'stitcho-v607')),true);
 assert.equal(damageEnemy(guestBoss,500),true);assert.equal(guestBoss.hp,675);assert.equal(guestBoss.damageWindowRemaining,0);
 assert.equal(damageEnemy(guestBoss,100),false,'an exhausted opening cannot accept more local damage');
 Object.assign(hostBoss,{hp:675,damageTakenScale:0,damageWindowRemaining:0});hostBoss._glitch.phase='warn';
 assert.equal(applyCombatFrame(guest,captureCombatFrame(host,2,'stitcho-v607')),true);
 assert.equal(guestBoss._glitch.phase,'warn');assert.equal(damageEnemy(guestBoss,100),false);
});

test('capacitor snapshot fields stay finite and bounded before the guest renderer consumes them',()=>{
 const original=captureCombatFrame(game(boss()),1,'stitcho-v607');
 for(const invalid of [{dropCount:1e6},{dropCount:2.5},{dropCount:true},{dropGap:-1},{dropGap:Infinity},{dropTop:20001}]){
  const frame=structuredClone(original);Object.assign(frame.enemies[0].chapterMind.state,invalid);
  assert.equal(validCombatFrame(frame),false,JSON.stringify(invalid));
 }
 assert.ok(JSON.stringify(original).length<=11200);
});
