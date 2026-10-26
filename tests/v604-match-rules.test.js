import test from 'node:test';import assert from 'node:assert/strict';
import {OHANA_MODES,DUEL_ARENAS,DUEL_XP,duelLevel,validDuelArena,createDuel,awardDuelEvent,duelHud,adjacentRoom,createTravelVote,castTravelVote,travelApproved,travelPrompt,TRAVEL_VOTE_TTL_MS} from '../multiplayer/match-rules-v604.js';
test('V604 VS: ten real Chapter arenas and 5 personal forms; all 4 reward sources',()=>{
 assert.equal(DUEL_ARENAS.length,10);assert.equal(new Set(DUEL_ARENAS).size,10);
 assert.equal(validDuelArena('w1-cat'),true);assert.equal(validDuelArena('w1-final'),false);
 assert.deepEqual([0,84,85,190,320,480,900].map(duelLevel),[0,0,1,2,3,4,4]);
 assert.equal(Object.keys(DUEL_XP).length,4);assert.equal(OHANA_MODES.VERSUS,'versus');
});
test('V604 VS: only authenticated confirmed eliminations count; no duplicate XP',()=>{
 const m=createDuel('w1-dino',['hero1','hero2']);const req={id:'ev-001',actor:'hero1',target:'hero2',kind:'opponent',confirmed:true};
 assert.equal(awardDuelEvent(m,{...req,confirmed:false}),m);
 const a=awardDuelEvent(m,req);assert.equal(a.fighters.hero1.kills,1);
 assert.equal(a.fighters.hero2.deaths,1);assert.equal(awardDuelEvent(a,req),a);
 const b=awardDuelEvent(a,{...req,id:'ev-002',kind:'elite'});
 const c=awardDuelEvent(b,{...req,id:'ev-003',kind:'miniBoss'});
 assert.equal(c.fighters.hero1.enemyKills,1);assert.equal(c.fighters.hero1.bossKills,1);
 assert.equal(duelHud(c,'hero1').xp,DUEL_XP.opponent+DUEL_XP.elite+DUEL_XP.miniBoss);
 assert.equal(m.fighters.hero1.xp,0);
});
test('V604 VS: three rival eliminations end the round once',()=>{
 let m=createDuel('w1-dragon',['a1','b1']);
 for(let i=0;i<3;i++)m=awardDuelEvent(m,{id:'hit-'+i,actor:'a1',target:'b1',kind:'opponent',confirmed:true});
 assert.equal(m.phase,'complete');assert.equal(m.winner,'a1');assert.equal(m.fighters.b1.deaths,3);
 assert.equal(awardDuelEvent(m,{id:'hit-4',actor:'b1',target:'a1',kind:'opponent',confirmed:true}),m);
});
test('V604 co-op: adjacent rooms only; both approvals, rejection and expiry',()=>{
 assert.equal(adjacentRoom('w1-kilo','w1-stitcho'),true);
 assert.equal(adjacentRoom('w1-kilo','w1-cat'),false);
 assert.throws(()=>createTravelVote({id:'t-1x',from:'w1-kilo',to:'w1-cat',by:'a1',players:['a1','b1']}),/DESTINATION/);
 const initial=createTravelVote({id:'t-1x',from:'w1-kilo',to:'w1-stitcho',by:'a1',players:['a1','b1'],now:100});
 assert.equal(initial.accepted.length,1);assert.equal(travelApproved(initial,'w1-kilo',['a1','b1']),false);
 assert.equal(travelPrompt(initial,'b1').canAccept,true);
 const ok=castTravelVote(initial,'b1',true,150);assert.equal(ok.status,'approved');
 assert.equal(travelApproved(ok,'w1-kilo',['a1','b1']),true);
 assert.equal(travelApproved(ok,'w1-stitcho',['a1','b1']),false);
 assert.equal(castTravelVote(initial,'b1',false,150).status,'rejected');
 assert.equal(castTravelVote(initial,'b1',true,100+TRAVEL_VOTE_TTL_MS).status,'expired');
});
