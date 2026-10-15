import test from 'node:test';
import assert from 'node:assert/strict';
import {Floaters} from '../systems/floaters.js';
import {musicVolume,setMusicVolume} from '../engine/music.js';
test('V400 damage bursts combine only fresh matching hits without extending their life',()=>{
 const f=new Floaters();f.add(100,100,'12','#fff',false);f.update();f.add(102,100,'18','#fff',false);
 assert.equal(f.items.length,1);assert.equal(f.items[0].text,'30');assert.equal(f.items[0].life,39);
 f.add(100,100,'+HP','#fff');f.add(100,100,'KO','#fff',true);f.add(100,100,'8','#ff0');
 assert.equal(f.items.length,4);for(let i=0;i<7;i++)f.update();f.add(100,100,'2','#fff');assert.equal(f.items.length,5);
 for(let i=0;i<60;i++)f.update();assert.equal(f.items.length,0);
});
test('V400 stable damage layout separates labels, restores context and respects reduced motion',()=>{
 const f=new Floaters();f.add(100,100,'KO','#fff',true);f.add(100,100,'XP','#fff');f.update();
 const positions=[];let saves=0,restores=0;const ctx={save(){saves++},restore(){restores++},strokeText(){},fillText(text,x,y){positions.push({text,x,y})}};
 f.render(ctx,{x:20,y:10},true);assert.equal(positions[0].y,90);assert.ok(Math.abs(positions[0].y-positions[1].y)>=24);assert.equal(saves,restores);
 positions.length=0;f.render(ctx,{x:20,y:10},false);assert.ok(positions[0].y<90);
});
test('V400 music volume is bounded, silent at zero, and ignores corrupt input',()=>{
 const original=musicVolume();assert.equal(setMusicVolume(.35),.35);assert.equal(setMusicVolume(NaN),.35);assert.equal(setMusicVolume(-4),0);assert.equal(setMusicVolume(3),1);setMusicVolume(original);
});
