import test from 'node:test';import assert from 'node:assert/strict';
import {gauntletPresentation,gauntletAccessibleText,gauntletHudLayout} from '../systems/final-gauntlet.js';
const fixture=()=>({finalGauntlet:{phase:'fight',hero:'cuerno',found:['kilo'],guardian:{hp:450,max:740,damageWindowRemaining:195,_prismBeast:{phase:'rest'}}}});
const measure={font:'12px sans-serif',measureText(text){return {width:text.length*(Number(this.font.match(/(\d+)px/)?.[1])||12)*.58};}};
test('the guardian cannot advertise an opening after its damage budget closes',()=>{
 const g=fixture();assert.equal(gauntletPresentation(g).open,true);assert.match(gauntletAccessibleText(g),/APERTURA/);g.finalGauntlet.guardian.damageWindowRemaining=0;assert.equal(gauntletPresentation(g).open,false);assert.doesNotMatch(gauntletAccessibleText(g),/ATACA AHORA/);
 g.finalGauntlet.guardian._prismBeast={phase:'warn',technique:{name:'Galope del alba',cue:'Sal de todo el corredor antes de que empiece la carga.'}};const text=gauntletAccessibleText(g);assert.match(text,/Galope del alba/);assert.match(text,/corredor/);assert.match(text,/AVISO/);
 g.finalGauntlet.phase='released';assert.match(gauntletAccessibleText(g),/recuperar Primer pincel/);g._pendingWorld1Cine={id:'keepsakeRescue'};assert.equal(gauntletAccessibleText(g),'');
});
test('guardian instructions wrap at real font sizes across phone, desktop and landscape',()=>{
 const g=fixture();g.finalGauntlet.guardian._prismBeast={phase:'warn',technique:{name:'Galope del alba',cue:'La franja muestra todo el recorrido de una carga larga y rápida: sal de su corredor antes de que comience.'}};const p=gauntletPresentation(g);
 for(const [W,H]of [[390,844],[1440,900],[844,390]]){
  const L=gauntletHudLayout(measure,p,W,H);assert.ok(L.x>=0&&L.x+L.w<=W);assert.ok(L.y>=0&&L.y+L.h<=H);assert.ok(L.bodySize>=11);measure.font=`${L.bodySize}px Outfit`;
  assert.ok(L.cue.every(line=>measure.measureText(line).width<=L.w-28));assert.equal(L.cue.join(' '),p.cue);if(W===390){assert.ok(L.cue.length>=3);assert.ok(L.y>=190,'phone HUD clears player cards and action buttons');}
 }
});

import {drawGauntletWorld} from '../systems/final-gauntlet.js';
test('charge warning covers its entire committed travel and prism shows both real beam heights',()=>{
 const rectangles=[],c=new Proxy({fillRect(...r){rectangles.push(r);}}, {get(target,key){return key in target?target[key]:()=>{};}}),g=fixture(),v=g.finalGauntlet,e=v.guardian;v.object={x:9360,y:1119};e.x=9270;e.y=910;e.w=184;e.h=224;e._prismBeast={phase:'warn',chargePath:{from:9362,to:10058,y:1134}};
 drawGauntletWorld(c,g,{x:9000,y:400});const corridor=rectangles.find(r=>r[1]===604&&r[3]===130);assert.ok(corridor,'the visible warning marks the damaging body corridor');assert.ok(corridor[0]<=9362-9000-e.w*.65);assert.ok(corridor[0]+corridor[2]+1e-8>=10058-9000+e.w*.65,'charge destination cannot extend past its warning');
 rectangles.length=0;v.hero='yomi';e._spiritGuide={phase:'warn',beamYs:[1000,865],target:{y:1000}};drawGauntletWorld(c,g,{x:9000,y:400});const beams=rectangles.filter(r=>r[3]===30&&r[2]>1000);assert.deepEqual(beams.map(r=>r[1]),[585,450]);
});
