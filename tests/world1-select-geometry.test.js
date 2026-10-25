import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld1Select,world1SelectCardRects,world1SelectPointer,world1SelectKey} from '../systems/world1-select.js';

test('V514 circular portal geometry drives real pointer hit tests at desktop size',()=>{
 const sel=createWorld1Select({start:'kilo'});
 const rects=world1SelectCardRects(sel,1120,620);
 assert.equal(rects.length,11);
 assert.equal(sel.cards.length,11);
 for(const hero of ['kilo','stitcho','dino','pizza','yomi']){
   const idx=sel.cards.findIndex(card=>card.hero===hero);
   const r=rects[idx];
   assert.ok(r&&r.w>0&&r.h>0);
   const choice=world1SelectPointer(sel,r.x+r.w/2,r.y+r.h/2,false);
   assert.equal(choice?.card?.hero,hero,'real Canvas center must select '+hero);
   assert.equal(sel.index,idx);
 }
});

test('V514 button selection, Canvas selection and next ArrowRight share one cursor',()=>{
 const sel=createWorld1Select({start:'kilo'});
 world1SelectCardRects(sel,1120,620);
 const dino=sel.cards.findIndex(c=>c.hero==='dino'),r=sel.rects[dino];
 assert.equal(world1SelectPointer(sel,r.x+r.w/2,r.y+r.h/2,false).card.hero,'dino');
 // The HTML hero-button handler changes the same selector's index to Kilo.
 sel.index=0;
 assert.equal(world1SelectKey(sel,'ArrowRight').card.hero,'stitcho');
});
