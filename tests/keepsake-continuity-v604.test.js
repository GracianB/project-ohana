import test from'node:test';import assert from'node:assert/strict';
import{readKeepsakes,persistKeepsakes,KEEPSAKE_SAVE_KEY,KEEPSAKE_ORDER}from'../systems/keepsakes.js';import{createSaveStore,packSave,unpackSave}from'../systems/save.js';import{updateFinalGauntlet}from'../systems/final-gauntlet.js';
function storage(block=()=>false){const m=new Map();return{m,getItem:k=>m.get(k)||null,setItem:(k,v)=>{if(block(k))throw Error('write unavailable');m.set(k,v);},removeItem:k=>m.delete(k)};}
function fixture(s){const awards=[],g={roomId:'w1-final',world1Seals:[...KEEPSAKE_ORDER],keepsakeStorage:s,player:{id:'kilo',evo:4,x:8600,y:1074,w:50,h:60,health:200,maxHealth:200},enemies:[],projectiles:[],score:0};const store=createSaveStore(s);g.onGauntletAward=h=>{awards.push(h);g.score+=1000;};g.save=()=>store.write(g);return{g,awards,store};}
function collect(f){updateFinalGauntlet(f.g);const v=f.g.finalGauntlet;v.guardian.hp=0;updateFinalGauntlet(f.g);f.g.player.x=v.object.x-f.g.player.w/2;updateFinalGauntlet(f.g);}
test('V604: an unavailable profile write recovers the physical rescue and its score from the checkpoint',()=>{
 const s=storage(k=>k===KEEPSAKE_SAVE_KEY),f=fixture(s);collect(f);assert.deepEqual(f.awards,['kilo']);assert.equal(f.g.keepsakeSavePending,false);assert.equal(s.getItem(KEEPSAKE_SAVE_KEY),null);assert.deepEqual(f.store.readRaw().keepsakes,['kilo']);assert.deepEqual(readKeepsakes(s),['kilo']);const next=fixture(s);updateFinalGauntlet(next.g);assert.equal(next.g.finalGauntlet.hero,'stitcho');assert.equal(next.awards.length,0);assert.equal(f.store.read('kilo').score,1000);
});
test('V604: a failed checkpoint commit still recovers the staged rescue without double reward',()=>{
 const s=storage(k=>k===KEEPSAKE_SAVE_KEY||k==='ohana'),f=fixture(s);collect(f);assert.ok(s.getItem('ohana.tmp'));assert.deepEqual(readKeepsakes(s),['kilo']);assert.deepEqual(f.store.readRaw().keepsakes,['kilo']);const next=fixture(s);updateFinalGauntlet(next.g);assert.equal(next.g.finalGauntlet.hero,'stitcho');assert.equal(next.awards.length,0);
});
test('V604: a fully blocked store preserves earned session objects through a life retry and reports unsaved progress',()=>{
 const f=fixture(storage(()=>true));collect(f);assert.equal(f.g.keepsakeSavePending,true);assert.deepEqual(f.g.keepsakes,['kilo']);f.g.finalGauntlet=null;updateFinalGauntlet(f.g);assert.equal(f.g.finalGauntlet.hero,'stitcho');assert.deepEqual(f.awards,['kilo']);
});
test('V604: receipts are sanitized, legacy checkpoints stay readable and future schemas cannot unlock memories',()=>{
 const s=storage();s.m.set(KEEPSAKE_SAVE_KEY,'bad json');s.m.set('ohana',JSON.stringify({v:3,id:'kilo',keepsakes:['bogus','dino','dino']}));s.m.set('ohana.tmp',JSON.stringify({v:999,id:'kilo',keepsakes:KEEPSAKE_ORDER}));assert.deepEqual(readKeepsakes(s),['dino']);s.m.set('ohana.tmp',JSON.stringify({v:3,id:'kilo',keepsakes:['stitcho']}));assert.deepEqual(readKeepsakes(s),['stitcho','dino']);assert.deepEqual(unpackSave({v:2,id:'lilo'},'kilo').keepsakes,[]);assert.deepEqual(packSave({player:{id:'kilo'},keepsakes:['bogus','pizza'],finalGauntlet:{found:['kilo','pizza']}}).keepsakes,['kilo','pizza']);assert.equal(persistKeepsakes(['kilo'],null),false);
});
test('V604: writing a different hero checkpoint retains profile receipts from the last committed save',()=>{
 const s=storage(),store=createSaveStore(s);assert.equal(store.write({player:{id:'kilo'},keepsakes:['kilo','dino']}),true);assert.equal(store.write({player:{id:'cat'},keepsakes:[]}),true);assert.deepEqual(store.readRaw().keepsakes,['kilo','dino']);assert.deepEqual(readKeepsakes(s),['kilo','dino']);
});
