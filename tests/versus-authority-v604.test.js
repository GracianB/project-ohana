import test from'node:test';import assert from'node:assert/strict';import{createRoomService}from'../netlify/lib/room-service.mjs';import{LocalRoomStore}from'../tools/local-multiplayer-server.mjs';
async function team(arena='w1-dragon'){
 let now=100000,serial=0;const store=new LocalRoomStore(),service=createRoomService(store,{now:()=>now,makeCode:()=> 'QWERTY',makeCredential:()=> 'token-'+(++serial)});const h=await service.create('versus',arena),g=await service.join(h.roomId);await service.choose(h.roomId,h.identity,'dino');await service.choose(h.roomId,g.identity,'chispin');await service.ready(h.roomId,h.identity);const state=await service.ready(h.roomId,g.identity);return{service,h,g,state,advance:n=>now+=n};
}
test('V604 VS starts with five real species, one guardian, own baby stats and authenticated epoch',async()=>{
 const t=await team();assert.equal(t.state.mode,'versus');assert.equal(t.state.versus.arenaId,'w1-dragon');assert.equal(new Set(t.state.versus.foes.map(f=>f.kind)).size,5);assert.equal(t.state.versus.boss.miniBoss,true);assert.deepEqual(t.state.versus.actors.map(a=>[a.characterId,a.evo,a.xp,a.hp]),[['dino',0,0,140],['chispin',0,0,56]]);await assert.rejects(t.service.poll(t.h.roomId,{playerId:t.h.identity.playerId,token:t.h.identity.token}),e=>e.code==='STALE_SESSION');
});
test('V604 VS ignores client claims and accepts bounded controls without granting health, XP or position',async()=>{
 const t=await team();await assert.rejects(t.service.move(t.h.roomId,t.h.identity,{mode:'engine',sequence:1,positionX:10000,health:99999,experience:99999}),e=>e.code==='AUTHORITATIVE_CONTROLS_REQUIRED');const first=t.state.versus.actors[0];await t.service.move(t.h.roomId,t.h.identity,{sequence:1,actionId:'input:1',x:1,health:9999,experience:9999,positionX:10500});t.advance(100);const state=await t.service.poll(t.h.roomId,t.h.identity),a=state.versus.actors[0];assert.ok(a.x>first.x&&a.x<first.x+100);assert.equal(a.xp,0);assert.equal(a.hp,first.hp);await assert.rejects(t.service.signal(t.h.roomId,t.h.identity,{sequence:2,actionId:'claim:1',signalKind:'state',payload:{state:'won'}}),e=>e.code==='AUTHORITATIVE_CONTROLS_REQUIRED');
});
test('V604 VS real actions award a defeat once; cooldown and receipt replay cannot duplicate XP',async()=>{
 const t=await team('w1-kilo');let seq=0,s=t.state;const action=async()=>{const n=++seq;return t.service.action(t.h.roomId,t.h.identity,{sequence:n,actionId:'cast:'+n,slot:0},'ability');};
 // Ordinary inputs approach and attack the server creature; no entity is moved or damaged by the test.
 let sawKill=false;for(let i=0;i<500&&!sawKill;i++){
  const a=s.versus.actors[0],target=s.versus.foes.filter(e=>e.hp>0&&e.campaignRole!=='flyer').sort((x,y)=>Math.abs(x.x-a.x)-Math.abs(y.x-a.x))[0];
  const dx=target.x-a.x;await t.service.move(t.h.roomId,t.h.identity,{sequence:++seq,actionId:'input:'+seq,x:Math.abs(dx)>130?Math.sign(dx):0});if(Math.abs(dx)<900)await action();t.advance(100);s=await t.service.poll(t.h.roomId,t.h.identity);sawKill=s.versus.fighters[t.h.identity.playerId].enemyKills>0;
 }
 assert.equal(sawKill,true);const xp=s.versus.fighters[t.h.identity.playerId].xp;const n=++seq,body={sequence:n,actionId:'last:'+n,slot:0};const one=await t.service.action(t.h.roomId,t.h.identity,body,'ability');const replay=await t.service.action(t.h.roomId,t.h.identity,body,'ability');assert.equal(replay.replayed,true);assert.equal(replay.versus.fighters[t.h.identity.playerId].xp,one.versus.fighters[t.h.identity.playerId].xp);assert.ok(xp>=35);assert.ok(s.versus.actors.every(a=>a.evo>=0&&a.evo<=4));
});
test('V604 VS disconnection pauses simulation and rotated sessions preserve the match',async()=>{
 const t=await team();await t.service.move(t.h.roomId,t.h.identity,{sequence:1,actionId:'input:1',x:1});t.advance(100);const before=await t.service.disconnect(t.h.roomId,t.g.identity);t.advance(1000);const paused=await t.service.poll(t.h.roomId,t.h.identity);assert.equal(paused.versus.tick,before.versus.tick);const resumed=await t.service.join(t.h.roomId,t.g.identity);assert.notEqual(resumed.identity.token,t.g.identity.token);assert.equal(resumed.versus.round,1);assert.equal(resumed.versus.actors[0].hp,before.versus.actors[0].hp);await assert.rejects(t.service.poll(t.h.roomId,t.g.identity),e=>e.code==='INVALID_SESSION');
});
test('V604 VS ordinary controls can finish three eliminations with server-owned evolution and a stable result',async()=>{
 const t=await team('w1-kilo');let s=t.state,seq=0;const forms=new Set([0]);
 for(let i=0;i<2400&&s.versus.phase!=='complete';i++){
  const a=s.versus.actors[0],rival=s.versus.actors[1];forms.add(a.evo);const creatures=s.versus.foes.filter(e=>e.hp>0&&e.campaignRole!=='flyer');const target=a.xp<190||rival.hp<=0?creatures.sort((x,y)=>Math.abs(x.x-a.x)-Math.abs(y.x-a.x))[0]:rival;
  const dx=(target?.x||rival.x)-a.x,x=Math.abs(dx)>110?Math.sign(dx):0;
  await t.service.move(t.h.roomId,t.h.identity,{sequence:++seq,actionId:'pilot:'+seq,x});
  for(const [kind,slot]of [['attack',null],['ability',0],['ability',a.evo>=2?2:1]]){if(s.versus.phase==='complete')break;const n=++seq;s=await t.service.action(t.h.roomId,t.h.identity,{sequence:n,actionId:'pilot:'+n,slot,x},kind);}
  t.advance(80);s=await t.service.poll(t.h.roomId,t.h.identity);if(i%8===0)await t.service.poll(t.h.roomId,t.g.identity);
 }
 assert.equal(s.versus.phase,'complete');assert.equal(s.versus.winner,t.h.identity.playerId);assert.equal(s.versus.fighters[t.h.identity.playerId].kills,3);assert.ok(forms.size>=3);const xp=s.versus.actors[0].xp;const saved=await t.service.poll(t.h.roomId,t.g.identity);assert.equal(saved.versus.winner,s.versus.winner);assert.equal(saved.versus.actors[0].xp,xp);const stopped=await t.service.action(t.h.roomId,t.h.identity,{sequence:++seq,actionId:'after-win',slot:0},'ability');assert.equal(stopped.actionResult.finished,true);assert.equal(stopped.versus.actors[0].xp,xp);
});
