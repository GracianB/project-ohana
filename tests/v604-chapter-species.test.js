import test from 'node:test';import assert from 'node:assert/strict';
import {CHAPTER_SPECIES,speciesArtVariant,drawChapterSpecies,drawChapterSpeciesCue} from '../systems/chapter-species-v604.js';
test('V604: all 18 world species are uniquely illustrated, with three deterministic variants',()=>{
 assert.equal(CHAPTER_SPECIES.length,18);assert.equal(new Set(CHAPTER_SPECIES).size,18);
 for(const kind of CHAPTER_SPECIES){assert.equal(speciesArtVariant(kind,0),1);assert.equal(speciesArtVariant(kind,1),2);assert.equal(speciesArtVariant(kind,2),3);}
});
test('V604: species art is bounded, playable and does not mutate combat actors',()=>{
 const tally={fill:0,stroke:0};const c={save(){},restore(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},bezierCurveTo(){},quadraticCurveTo(){},ellipse(){},arc(){},fill(){tally.fill++},stroke(){tally.stroke++}};
 for(const kind of CHAPTER_SPECIES)for(const role of ['shield','gunner','jumper','flyer','captain']){
   const e={kind,campaignRole:role,spawnIndex:2,elite:true,telegraph:true,_campaign:{wind:22},sleep:0,stun:0};
   const before=JSON.stringify(e);
   assert.equal(drawChapterSpecies(c,e,{time:42,step:.4,wind:true},{light:'#eee0bd',dark:'#485e68'}),true);
   assert.equal(drawChapterSpeciesCue(c,e,42),true);
   assert.equal(JSON.stringify(e),before);
 }
 assert.ok(tally.fill>450&&tally.stroke>450);
});
test('V604: sleeping and stunned creatures never paint a false attack cue',()=>{
 const e={kind:'medusa',telegraph:true,sleep:10,stun:0};
 assert.equal(drawChapterSpeciesCue({},e,10),false);
 e.sleep=0;e.stun=20;assert.equal(drawChapterSpeciesCue({},e,10),false);
});
