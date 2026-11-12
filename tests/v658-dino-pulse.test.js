import test from 'node:test';
import assert from 'node:assert/strict';
import {planDinoTectonicLedges,syncDinoTectonicPulse} from '../systems/dino-chapter.js';

const game=()=>({roomDef:{id:'w1-dino',hero:'dino',dinoChapter:true},world1:{room:'w1-dino',stations:[{id:0,x:900,y:1050,done:false},{id:1,x:1800,y:1040,done:false}]},worldW:9600,platforms:[{x:0,y:1134,w:8000,h:100}],reduceMotion:true});
test('V658 platforms exist only after earned fossil stations and are real colliders',()=>{
 const g=game();assert.equal(syncDinoTectonicPulse(g).ledges,0);
 g.world1.stations[0].done=true;
 const snapshot=syncDinoTectonicPulse(g);
 assert.ok(snapshot.ledges>0);
 assert.ok(g.platforms.some(p=>p._dinoTectonic&&p.w>0&&p.h>0));
 assert.equal(g.world1.stations[1].done,false);
 assert.equal(syncDinoTectonicPulse(g).ledges,snapshot.ledges,'idempotent rebuild');
});
test('V658 save and death restore reproduce deterministic solid geometry without rewards',()=>{
 const g=game();g.world1.stations[0].done=true;
 const expected=planDinoTectonicLedges(g);
 syncDinoTectonicPulse(g);
 const restored=game();restored.world1.stations[0].done=true;
 syncDinoTectonicPulse(restored);
 assert.deepEqual(restored.platforms.filter(p=>p._dinoTectonic),expected);
 assert.equal(restored.world1.stations[1].done,false);
 assert.equal(restored.score,undefined);
});
test('V658 does not construct ledges for unrelated heroes, invalid geometry or boss arena',()=>{
 const g=game();g.world1.stations[0].done=true;g.world1.stations.push({id:2,x:NaN,y:100,done:true},{id:3,x:8300,y:1000,done:true});
 assert.ok(planDinoTectonicLedges(g).every(p=>Number.isFinite(p.x)&&p.x+p.w<8260));
 g.roomDef.id='w1-cat';assert.equal(syncDinoTectonicPulse(g),null);
});
