import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {readDinoEffects,advanceDinoEffects,drawDinoPeerEffects} from "../systems/dino-coop-effects.js";
import {capturePeerEffects,applyPeerEffects,advancePeerEffects,captureFamilyDuetRelay} from "../systems/coop-peer-effects.js";

const art=[{kind:"dinoColossus",x:120,y:220,life:260,max:260,warmup:18,launchRadius:300,
  nextPulse:28,evo:4,color:"#c8f04a",dmg:888,launchDamage:450,actor:{id:"dino"},duet:{targets:new Set([1])}},
  {kind:"dinoFossil",x:240,y:80,vx:2,vy:11,life:120,rot:0,r:12,dmg:900,target:{hp:33}},
  {kind:"dinoFossilMark",x:240,y:280,life:34,max:34,dmg:900},
  {kind:"dinoSpit",x:170,y:205,life:46,vx:7,vy:0,radius:10,trail:[{x:160,y:205}],target:{hp:50},hit:new Set([1])}];

test("V378: sanitized Dino visuals never expose damage, enemy targets, actor or hit sets",()=>{
  const read=readDinoEffects(art);
  assert.equal(read.length,4);
  assert.equal(read[0].warmup,18);
  assert.equal(read[1].max,120,"native fossil without max stays valid");
  for(const x of read){
    for(const forbidden of ["dmg","launchDamage","actor","duet","target","hit","hitSet","enemies"])
      assert.equal(Object.hasOwn(x,forbidden),false,forbidden);
    assert.ok(Number.isFinite(x.x)&&Number.isFinite(x.y));
  }
  assert.equal(read[3].trail.length,1);
  assert.equal(readDinoEffects([{...art[0],launchRadius:2000}]),null);
  assert.equal(readDinoEffects([{...art[0],vx:Infinity}]),null);
  assert.equal(readDinoEffects(Array(13).fill(art[0])),null);
  assert.equal(readDinoEffects([{...art[0],kind:"dinoInstantDamage"}]),null);
  assert.equal(readDinoEffects([{...art[3],trail:[{x:NaN,y:0}]}]),null);
});
test("V378: host-to-guest packets reproduce the Colossus warning but never simulate damage",()=>{
  const host={roomId:"hub",player:{id:"dino"},dinoAbilityFx:art,
    enemies:[{x:240,y:280,hp:2000}],projectiles:[],slashes:[],bolts:[]};
  const peer={roomId:"hub",enemies:[],projectiles:[]};
  const frame=capturePeerEffects(host,1,"room:hub:1");
  assert.equal(frame.protocol,2);
  assert.equal(frame.dinoFx.length,4);
  assert.equal(JSON.stringify(frame).includes("launchDamage"),false);
  assert.equal(JSON.stringify(frame).includes("target"),false);
  assert.equal(applyPeerEffects(peer,frame),true);
  assert.equal(peer.coopPeerEffects.dinoFx.length,4);
  const x0=peer.coopPeerEffects.dinoFx[1].x;
  advancePeerEffects(peer);
  assert.equal(peer.coopPeerEffects.dinoFx[0].warmup,17);
  assert.equal(peer.coopPeerEffects.dinoFx[1].x,x0+2);
  assert.deepEqual(peer.enemies,[]);
  assert.equal(applyPeerEffects(peer,frame),false,"reject replay");
  assert.equal(applyPeerEffects({roomId:"reef"},frame),false,"reject wrong room");
  const malicious={...frame,frameNo:2,dinoFx:[{...art[0],vx:1e6}]};
  assert.equal(applyPeerEffects(peer,malicious),false,"reject unsafe payload");
});
test("V378: reliable U start contains at most one inert Colossus descriptor",()=>{
  const host={roomId:"hub",_familyDuet:{hero:"dino",age:1},dinoAbilityFx:[art[0]]};
  // readFamilyDuet may refuse incomplete choreography; it must still be safe.
  const relay=captureFamilyDuetRelay(host,1,"room:hub:1");
  if(relay){
    assert.ok(relay.dinoFx.length<=1);
    assert.equal(relay.dinoFx[0].dmg,undefined);
    assert.ok(JSON.stringify(relay).length<=1100);
  }
});
test("V378: Canvas signs are finite in reduced motion and do not change the game",()=>{
  for(const quiet of [false,true]){
    let n=0,saves=0,restores=0;const ctx=new Proxy({globalAlpha:1},
      {get(o,k){if(k in o)return o[k];return(...args)=>{
        if(k==="save")saves++;if(k==="restore")restores++;
        for(const a of args)if(typeof a==="number")assert.ok(Number.isFinite(a),k);
        n++;
      }},set(o,k,v){o[k]=v;return true;}});
    const list=readDinoEffects([...art,{kind:"dinoFossilBlast",x:240,y:240,life:12,max:12,r:50},
      {kind:"dinoSplat",x:140,y:240,life:12,max:12,radius:15}]);
    const original=JSON.stringify(list);
    drawDinoPeerEffects(ctx,list,{x:10,y:20},72,quiet);
    assert.equal(JSON.stringify(list),original);
    assert.equal(saves,restores);
    assert.ok(n>20);
  }
});
test("V378: multiplayer integrations stay visual-only and reset with room",()=>{
  const game=fs.readFileSync("game.js","utf8");
  const abilities=fs.readFileSync("systems/abilities.js","utf8");
  const coop=fs.readFileSync("systems/online-coop.js","utf8");
  assert.match(game,/game\.dinoAbilityFx=\[\]/);
  assert.match(abilities,/game\.dinoAbilityFx=captureDinoNativeFx\(p\)/);
  assert.match(coop,/drawDinoPeerEffects\(ctx,peerFx\.dinoFx,game\.cam,t,!!game\.reduceMotion\)/);
});
