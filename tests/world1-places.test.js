import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ORDER,WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterCampaignExploration,updateCampaignExploration} from '../systems/campaign-exploration.js';
import {OHANA_PLACES} from '../worlds/ohana-environments.js';
import {world1MusicProfile,musicPhrase,themeForRoom} from '../engine/music.js';
function game(r){return {roomDef:r,roomId:r.id,t:0,platforms:r.plats.map(([x,y,w,h])=>({x,y,w,h})),player:{x:0,y:WORLD1_FLOOR-42,w:32,h:42,grounded:true},secrets:{},nums:{add(){}},save(){}};}
test('World 1 exits never create the legacy return staircase, including saves that already earned its key',()=>{
 for(const hero of WORLD1_ORDER){
  const r=WORLD1_ROOMS['w1-'+hero],g=game(r);enterCampaignExploration(g);
  const before=g.platforms.map(p=>({...p}));g.secrets[r.id]=[r.id+'-shortcut'];g.player.x=r.width-200;
  for(let i=0;i<10;i++){g.t++;updateCampaignExploration(g);}
  assert.equal(g.platforms.length,before.length,hero);
  assert.ok(g.platforms.every(p=>!p._campaignReturn),hero);
  assert.equal(g.campaignExploration.shortcut,false);
 }
});
test('all ten rooms have distinct places, tactics and authored optional route profiles',()=>{
 assert.equal(new Set(Object.values(OHANA_PLACES).map(p=>p.kind)).size,10);
 const profiles=new Set();
 for(const hero of WORLD1_ORDER){
  const r=WORLD1_ROOMS['w1-'+hero],g=game(r);enterCampaignExploration(g);
  assert.ok(r.strategy.length>60);assert.equal(g.campaignExploration.branches.length,2);
  profiles.add(JSON.stringify([r.explorationStyle.offset,r.explorationStyle.steps]));
  assert.ok(g.platforms.every(p=>[p.x,p.y,p.w,p.h].every(Number.isFinite)));
 }
 assert.ok(profiles.size>=9);
});
test('optional routes preserve the real Frita launch corridors',()=>{
 const r=WORLD1_ROOMS['w1-frita'],g=game(r);enterCampaignExploration(g);
 for(const s of r.seal.stations)for(const p of g.platforms){
  if(p.h>40||p.y<=WORLD1_FLOOR-590||p.y>=WORLD1_FLOOR)continue;
  assert.ok(p.x+p.w<=s.x-94||p.x>=s.x+94,'vent '+s.id+' must stay clear');
 }
});
test('the ten rooms resolve to distinct finite authored scores; final fight keeps its own score',()=>{
 const motifs=new Set();
 for(const hero of WORLD1_ORDER){
  const profile=world1MusicProfile(hero);assert.equal(themeForRoom('w1-'+hero),profile.name);
  assert.ok(profile.bpm>=75&&profile.bpm<=135);
  const phrase=musicPhrase(profile.name);assert.ok(phrase.length>100);assert.ok(phrase.every(n=>n===null||Number.isFinite(n)));
  motifs.add(JSON.stringify(phrase));
 }
 assert.equal(motifs.size,10);assert.equal(themeForRoom('w1-final'),'jefe');
});

import {world1ChapterEntry} from '../systems/world1-progress.js';
test('chapters own their hero and reset only on new chapters, preserving retries and Continue',()=>{
 for(const hero of WORLD1_ORDER){
  const room='w1-'+hero;
  assert.deepEqual(world1ChapterEntry(room,{hero,previousRoom:room}),{hero,reset:false});
  assert.deepEqual(world1ChapterEntry(room,{hero,previousRoom:'menu',resume:true}),{hero,reset:false});
  assert.deepEqual(world1ChapterEntry(room,{hero,previousRoom:'other'}),{hero,reset:true});
  assert.equal(world1ChapterEntry(room,{hero:'wrong',previousRoom:room,resume:true}).reset,true);
 }
 assert.equal(world1ChapterEntry('w1-final',{hero:'yomi'}),null);
 assert.equal(world1ChapterEntry('hub',{hero:'kilo'}),null);
});
