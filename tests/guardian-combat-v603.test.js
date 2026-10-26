import test from'node:test';import assert from'node:assert/strict';
import{updateFinalGauntlet,updateGauntletGuardian,resolveGuardianProjectileContact}from'../systems/final-gauntlet.js';import{damageEnemy}from'../systems/mutations.js';import{KEEPSAKES,KEEPSAKE_ORDER}from'../systems/keepsakes.js';import{guardianRhythm}from'../systems/guardian-techniques.js';import{combatDifficulty}from'../systems/combat-difficulty.js';
function fixture(hero='kilo',difficulty='normal'){
 const old=globalThis.localStorage;globalThis.localStorage={getItem:k=>k==='ohana-difficulty'?difficulty:null};
 const g={roomId:'w1-final',world1Seals:[...KEEPSAKE_ORDER],keepsakeStorage:{getItem:()=>JSON.stringify(KEEPSAKE_ORDER.slice(0,KEEPSAKE_ORDER.indexOf(hero)))},player:{x:8600,y:1074,w:50,h:60,vx:0,grounded:true},projectiles:[],enemies:[]};updateFinalGauntlet(g);const e=g.finalGauntlet.guardian,b=e[KEEPSAKES[hero].key];
 return{g,e,b,tick:()=>updateGauntletGuardian(e,g,()=>{}),restore:()=>{globalThis.localStorage=old;}};
}
function until(f,predicate,limit=1500){for(let n=0;n<limit;n++){if(predicate())return;f.tick();}assert.fail('state transition timeout');}
test('V603: easy, normal and hard change guardian health, warning and recovery independently',()=>{
 const out=[];for(const difficulty of ['easy','normal','hard']){const f=fixture('kilo',difficulty);try{until(f,()=>f.b.phase==='warn');out.push({hp:f.e.max,warn:f.b.clock,...guardianRhythm(combatDifficulty(difficulty))});}finally{f.restore();}}
 assert.ok(out[0].hp<out[1].hp&&out[1].hp<out[2].hp);assert.ok(out[0].warn>out[1].warn&&out[1].warn>out[2].warn);assert.ok(out[0].rest>out[1].rest&&out[1].rest>out[2].rest);
});
test('V603: spending an opening closes armour and starts a full readable warning',()=>{
 const f=fixture();try{until(f,()=>f.b.phase==='rest');const hp=f.e.hp;damageEnemy(f.e,100000);assert.ok(f.e.hp<hp);assert.equal(f.e.damageWindowRemaining,0);f.tick();assert.equal(f.b.phase,'warn');assert.equal(f.b.clock,60);assert.equal(f.e.damageTakenScale,0);const after=f.e.hp;damageEnemy(f.e,100000);assert.equal(f.e.hp,after);}finally{f.restore();}
});
test('V603: every guardian commits three distinct techniques without tracking during warnings',()=>{
 for(const hero of KEEPSAKE_ORDER){const f=fixture(hero);try{const names=new Set();for(let round=0;round<3;round++){until(f,()=>f.b.phase==='warn');names.add(f.b.technique.name);const frozen=JSON.stringify({target:f.b.target,marks:f.b.marks,beams:f.b.beamYs,path:f.b.chargePath});f.g.player.x+=120;f.g.player.y-=50;for(let k=0;k<20;k++)f.tick();assert.equal(JSON.stringify({target:f.b.target,marks:f.b.marks,beams:f.b.beamYs,path:f.b.chargePath}),frozen,'no tracking after commitment: '+hero);until(f,()=>f.b.phase==='attack');until(f,()=>f.b.phase==='rest');}assert.equal(names.size,3,hero+' has three authored moves');}finally{f.restore();}}
});
test('V603: charge corridor predicts the real final position, including arena limits',()=>{
 const f=fixture('cuerno');try{until(f,()=>f.b.phase==='warn');const path={...f.b.chargePath};until(f,()=>f.b.phase==='attack');until(f,()=>f.b.phase==='rest');assert.ok(Math.abs(f.e.x+f.e.w/2-path.to)<.01);}finally{f.restore();}
});
test('V603: distant camping draws the guardian closer only before warning commitment',()=>{
 const f=fixture();try{until(f,()=>f.b.phase==='rest');const from=f.e.x;for(let i=0;i<25;i++)f.tick();assert.ok(f.e.x<from);until(f,()=>f.b.phase==='warn');const x=f.e.x;f.g.player.x+=1500;for(let i=0;i<20;i++)f.tick();assert.equal(f.e.x,x);}finally{f.restore();}
});
test('V603: beams remain visible and dangerous for their duration through an invulnerable graze',()=>{
 for(const kind of ['prism','lightning','geysers','ember']){const p={invuln:20,health:100},pr={gauntlet:kind,life:28,dmg:25};const hurt=n=>{p.health-=n;p.invuln=50;};assert.equal(resolveGuardianProjectileContact(pr,p,hurt),true);assert.equal(pr.life,28);assert.equal(p.health,100);p.invuln=0;resolveGuardianProjectileContact(pr,p,hurt);assert.equal(p.health,75);assert.equal(pr.life,28);resolveGuardianProjectileContact(pr,p,hurt);assert.equal(p.health,75,'no repeated damage through immunity');}
 const pr={gauntlet:'orb',life:100,dmg:20};resolveGuardianProjectileContact(pr,{invuln:3},()=>assert.fail());assert.equal(pr.life,0);assert.equal(resolveGuardianProjectileContact({life:20},{invuln:0},()=>assert.fail()),false,'legacy contact remains owned by the game');
});

test('V603: a guardian waits to enter the phone camera before starting its opening',()=>{
 const f=fixture();try{f.g.cam={x:8400,y:457};f.g.viewW=390;for(let k=0;k<300;k++)f.tick();assert.equal(f.b.phase,'idle');assert.equal(f.g.projectiles.length,0);f.g.cam.x=9100;until(f,()=>f.b.phase==='rest');assert.ok(f.e.damageWindowRemaining>0);}finally{f.restore();}
});
