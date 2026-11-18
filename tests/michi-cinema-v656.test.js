import test from 'node:test';import assert from 'node:assert/strict';
import {buildChapterFilm} from '../systems/chapter-cinema.js';import {michiFilmFrame,MICHI_FILM_FAMILY} from '../systems/michi-film-stage.js';
import {playWorld1Cine,updateWorld1Cine,skipMichiChapterFilm} from '../systems/world1-cine.js';
import {updateKiloPresence} from '../systems/kilo-presence.js';
const events=['roomEnter','chapterBossIntro','chapterBossVictory','awaken','chapterHundred','chapterExit'];
test('Michi has six staged stories with readable finite shots and ten unique family voices',()=>{
 assert.equal(MICHI_FILM_FAMILY.length,10);assert.equal(new Set(MICHI_FILM_FAMILY).size,10);
 for(const event of events){const shots=buildChapterFilm(event,'cat',{form:2});assert.ok(shots.length>=2);assert.ok(shots.every(s=>s.staging&&s.line&&s.form===2&&s.dur===260));}
 assert.deepEqual(buildChapterFilm('chapterExit','cat').map(s=>s.staging),['boat-wait','boat-board','boat-home']);assert.equal(buildChapterFilm('roomEnter','kilo'),null);
});
test('cinematic direction is finite and reduced motion is independent of clocks',()=>{
 for(const event of events)for(const shot of buildChapterFilm(event,'cat')){
  for(const tick of [-100,0,90,260,NaN,Infinity])for(const value of Object.values(michiFilmFrame(shot,tick)))if(typeof value==='number')assert.ok(Number.isFinite(value));
  assert.deepEqual(michiFilmFrame(shot,0,true),michiFilmFrame(shot,999,true));assert.notDeepEqual(michiFilmFrame(shot,0),michiFilmFrame(shot,130));
 }
});
test('native whole-scene skip uses normal completion once and never grants growth or progress',()=>{
 const ended=[],g={player:{id:'cat',evo:2,xp:47},secrets:{},resetInput(){this.resets=(this.resets||0)+1;},onWorld1CineEnd:id=>ended.push(id)};
 playWorld1Cine(g,'chapterHundred','cat');assert.equal(skipMichiChapterFilm(g),false);for(let i=0;i<21;i++)updateWorld1Cine(g);
 assert.equal(skipMichiChapterFilm(g),true);assert.equal(g.world1Cine,null);assert.equal(skipMichiChapterFilm(g),false);assert.deepEqual(ended,['chapterHundred']);assert.equal(g.player.evo,2);assert.equal(g.player.xp,47);assert.deepEqual(g.secrets,{});assert.ok(g.resets>=2);
 const other={};playWorld1Cine(other,'awaken','kilo');assert.equal(skipMichiChapterFilm(other),false);
});
test('Kilo attention reacts visually while preserving movement, direction and combat state',()=>{
 const g={player:{id:'kilo',x:0,y:0,w:20,h:30,facing:1,health:78,xp:90,vx:2,cds:{j:30}},enemies:[{x:90,y:0,w:20,h:30,hp:20}]},before=structuredClone(g.player);
 for(let i=0;i<20;i++)updateKiloPresence(g);assert.equal(g.player._kiloPresence.kind,'focus');assert.ok(g.player._kiloPresence.attention>.8);
 const{_kiloPresence,...body}=g.player;assert.deepEqual(body,before);g.enemies=[];g._evolutionAttacks={guest:{x:50,y:0,life:20}};updateKiloPresence(g);assert.equal(g.player._kiloPresence.kind,'friend');assert.equal(updateKiloPresence({player:{id:'cat'}}),false);
});
