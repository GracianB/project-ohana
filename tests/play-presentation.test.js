import test from 'node:test';
import assert from 'node:assert/strict';
import {renderWorldGraphHTML,worldMapDetailHTML,WORLD_NODES} from '../systems/world-graph.js';
import {CombatFX} from '../systems/combat-fx.js';

test('atlas exposes ten real locations as keyboard-operable buttons with a current location',()=>{
 const html=renderWorldGraphHTML('hub',{hub:true},0);
 assert.equal((html.match(/<button /g)||[]).length,10);
 assert.equal((html.match(/aria-current="location"/g)||[]).length,1);
 for(const id of Object.keys(WORLD_NODES))assert.ok(html.includes('data-room="'+id+'"'));
 assert.match(html,/viewBox="0 0 1000 560"/);
 assert.match(html,/aria-live="polite"/);
});
test('atlas details distinguish outgoing routes and actual entry requirements',()=>{
 const caldera=worldMapDetailHTML('volcano','hub',{hub:true},0);
 assert.match(caldera,/forma 4/i);assert.match(caldera,/Nido Final/);assert.match(caldera,/Jungla Alta/);
 const lab=worldMapDetailHTML('lab','lab',{lab:true},1);
 assert.match(lab,/Estás aquí/);assert.match(lab,/Cueva Azul/);assert.doesNotMatch(lab,/Costa Hoku/);
 const fallback=worldMapDetailHTML('<script>','hub',{hub:true},0);
 assert.match(fallback,/Claro Ohana/);assert.doesNotMatch(fallback,/<script>/);
});
test('reduced-motion impact marks stay at the strike and retain their geometry while fading',()=>{
 const fx=new CombatFX();fx.add(100,80,'#fff',{tier:3});
 const points=[];let saves=0,restores=0;
 const ctx={save(){saves++;},restore(){restores++;},beginPath(){},closePath(){},stroke(){},
   moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);}};
 fx.render(ctx,{x:20,y:10},true);const first=points.splice(0);
 fx.update();fx.render(ctx,{x:20,y:10},true);
 assert.deepEqual(points,first);assert.equal(first[1][0],80);assert.equal(first[0][1],70);
 assert.equal(saves,restores);
});
