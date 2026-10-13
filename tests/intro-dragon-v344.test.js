import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dragonWelcomeBeat,DRAGON_WELCOME_BEATS,drawDragonWelcomeFX} from '../systems/intro-dragon-stage.js';
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from '../systems/intro-cast-fit.js';
import {poseFingerprint} from '../characters/draw.js';

test('V344 · Dragón tells five separate welcome beats, looping deterministically',()=>{
 const table=[
  [0.5,'idle'],[2.76,'inhale'],[3.52,'sneeze'],
  [3.86,'recoil'],[4.4,'proud'],[6.2,'idle']
 ];
 for(const [time,phase] of table){
   const beat=dragonWelcomeBeat(time);
   assert.equal(beat.phase,phase,'welcome beat '+time);
   assert.deepEqual(dragonWelcomeBeat(time+14),beat,'repeating cycle must be deterministic');
   for(const key of ['inhale','sneeze','recoil','proud','breath','wing','glow']){
     assert.ok(beat[key]>=0&&beat[key]<=1,`bounded ${key} at ${time}`);
   }
   assert.ok(beat.tail>=-1&&beat.tail<=1);
 }
 assert.equal(Object.keys(DRAGON_WELCOME_BEATS).length,4);
 for(const k of Object.keys(DRAGON_WELCOME_BEATS)){
   const points=DRAGON_WELCOME_BEATS[k];
   assert.ok(points.every(Number.isFinite)&&points.every((v,i)=>!i||v>points[i-1]));
 }
 assert.equal(dragonWelcomeBeat(3.52).sneeze>0.8,true);
 assert.equal(dragonWelcomeBeat(4.4).proud>0.8,true);
});

test('V344 · accessibility freezes fire flashes, still preserves the living Dragon',()=>{
 for(const time of [0,2.7,3.5,3.85,4.45,14,Infinity,NaN]){
   const beat=dragonWelcomeBeat(time,true);
   assert.equal(beat.phase,'idle');
   assert.equal(beat.sneeze,0);
   assert.equal(beat.recoil,0);
   assert.equal(beat.wing,0);
   assert.equal(beat.reduced,true);
   assert.ok(beat.glow<=.12);
 }
});

test('V344 · front and back stage FX have isolated Canvas state and visible geometry',()=>{
 const calls=[];
 const gradient={addColorStop(...args){calls.push(['stop',...args]);}};
 const ctx=new Proxy({},{
   get(obj,name){
     if(name in obj)return obj[name];
     if(name==='createRadialGradient')return (...args)=>{calls.push(['gradient',...args]);return gradient;};
     return (...args)=>{calls.push([name,...args]);};
   },
   set(obj,name,value){obj[name]=value;return true;}
 });
 for(const [time,layer] of [[0,'back'],[2.85,'front'],[3.52,'front'],[3.87,'front'],[4.4,'front']]){
   const before=calls.length;
   drawDragonWelcomeFX(ctx,200,400,112,time,dragonWelcomeBeat(time),layer);
   const chunk=calls.slice(before);
   assert.equal(chunk[0][0],'save');
   assert.equal(chunk.at(-1)[0],'restore');
   assert.ok(chunk.some(v=>v[0]==='stroke'||v[0]==='fill'));
   if(layer==='back'||dragonWelcomeBeat(time).inhale>.08||
      dragonWelcomeBeat(time).sneeze>.01||dragonWelcomeBeat(time).recoil>.06)
     assert.ok(chunk.some(v=>['arc','ellipse','gradient'].includes(v[0])));
   else assert.ok(chunk.some(v=>v[0]==='lineTo'),
     'the proud sparkle is deliberately a crisp line, not a circle');
   assert.ok(chunk.flat().filter(v=>typeof v==='number').every(Number.isFinite));
 }
 const before=calls.length;
 drawDragonWelcomeFX(ctx,200,400,112,3.5,dragonWelcomeBeat(3.5,true),'front');
 const staticChunk=calls.slice(before);
 assert.ok(!staticChunk.some(c=>c[0]==='gradient'),'reduced motion must not draw fireball');
 assert.ok(staticChunk.length<=2,'reduced motion should not emit fast moving embers');
});

test('V344 · render cache notices independently directed head, wing and tail',()=>{
 const p={state:'idle',move:null,form:0,breath:0,dragonWelcome:dragonWelcomeBeat(2.75)};
 const same=poseFingerprint(p),other=poseFingerprint({...p,dragonWelcome:dragonWelcomeBeat(3.52)});
 assert.notEqual(same,other);
 assert.equal(poseFingerprint(p),same);
 assert.notEqual(poseFingerprint({...p,dragonWelcome:dragonWelcomeBeat(4.4)}),other);
 assert.notEqual(poseFingerprint({...p,dragonWelcome:null}),same);
});

test('V344 · Dragon intro fits real silhouette without altering stage or gameplay',()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==='dragon').length,1);
 for(const width of [360,759,760,1280,1654,1920]){
   const pos=welcomeCastSpot('dragon',width,720,110);
   const fit=welcomeActorFit({width:103,height:108,centerOffsetX:-5},110*1.10,pos.slotWidth);
   assert.ok(fit.paintedWidth<=pos.slotWidth*.88+1e-6);
   assert.ok(fit.paintedHeight<=121+1e-6);
   assert.ok(Number.isFinite(fit.scale));
 }
 const intro=readFileSync(new URL('../systems/intro.js',import.meta.url),'utf8');
 const draw=readFileSync(new URL('../characters/draw.js',import.meta.url),'utf8');
 const art=readFileSync(new URL('../characters/art/dragon.js',import.meta.url),'utf8');
 assert.match(intro,/dragonWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/drawDragonWelcomeFX\(ctx,dragon\.x,dragon\.foot\+1,dragonHeight,t,dragonBeat,"back"\)/);
 assert.match(intro,/drawDragonWelcomeFX\(ctx,dragon\.x,dragon\.foot\+1,dragonHeight,t,dragonBeat,"front"\)/);
 assert.match(intro,/dragonWelcome:dragonBeat/);
 assert.match(intro,/p\._introDragon = id === "dragon"/);
 assert.match(draw,/pose\.dragonWelcome=p\._introDragon/);
 assert.match(draw,/p\._introForceCanvas\|\|/);
 assert.match(art,/const welcome=pose\.dragonWelcome;/);
 assert.match(art,/V316: secondary anatomy follows the existing rig/);
 assert.match(art,/function drawHead\(/);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});
