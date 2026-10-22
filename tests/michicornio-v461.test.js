import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {michiGenome,jellyPulse,MICHI_DREAM_PALETTES,MICHI_CINE_MOTIFS,tentaclePoints} from '../characters/michi-jelly.js';
import cat from '../characters/art/cat.js';
import {drawEvoCine,michicornioEvoBeat,MICHI_BLOOM_AT,EVO_CINE_DURATION} from '../systems/evo-cine/michi.js';

// Recording Canvas mock: counts gradients, collects colours and draw ops.
function rec(){
 const log={grad:0,fills:new Set(),ops:0,text:[]};
 const o={globalAlpha:1,lineWidth:1};
 const c=new Proxy(o,{get(t,k){
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>{log.grad++;return{addColorStop(){}};};
  if(k==='fillText'||k==='strokeText')return s=>log.text.push(String(s));
  if(k==='measureText')return()=>({width:10});
  if(k in t)return t[k];
  return()=>{log.ops++;};
 },set(t,k,v){if(k==='fillStyle')log.fills.add(String(v));t[k]=v;return true;}});
 return {c,log};
}
const pose=(state,t,form,seed=0,reduceMotion=false)=>({state,t,phase:t*.2,form,cast:.5,atk:.5,castSlot:2,
 look:{x:.3,y:0},speed:1,flourish:0,michiSeed:seed,reduceMotion});
const STATES=['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead'];
const SEEDS=[0,1,7,42,99,1234,31337,2147483646];

test('V461 dream genome: deterministic, canonical seed 0, curated palettes only',()=>{
 assert.equal(michiGenome(0).paletteIndex,0);
 assert.equal(michiGenome(undefined),michiGenome(0));
 assert.deepEqual(michiGenome(42),michiGenome(42));
 const palettes=new Set(),motifs=new Set();
 for(let s=1;s<=400;s++){
  const g=michiGenome(s*7919);
  assert.ok(MICHI_DREAM_PALETTES.includes(g.palette),'palette must be curated');
  palettes.add(g.palette.id);motifs.add(MICHI_CINE_MOTIFS[g.motif]);
  assert.equal(g.phases.length,9);assert.equal(g.lengths.length,9);
  assert.ok(g.lengths.every(x=>x>=.9&&x<=1.1),'tentacle length out of quality band');
  assert.ok(g.spots.length>=5&&g.spots.length<=7);
  for(const [x,y,r] of g.spots){assert.ok(Math.abs(x)<=.66&&y>=.18&&y<=.78&&r>0&&r<.08);}
  assert.ok(Math.abs(g.tailCurl)<=.8&&g.pulseRate>=.88&&g.pulseRate<=1.12);
 }
 assert.equal(palettes.size,MICHI_DREAM_PALETTES.length,'every palette reachable');
 assert.equal(motifs.size,4,'every cinema motif reachable');
});

test('V461 jelly swim pulse: bounded, fast contraction, slow relaxation, frozen in reduced motion',()=>{
 const g=michiGenome(0);let peak=-1,rise=0,fall=0,prev=jellyPulse(0,g).c;
 for(let t=1;t<400;t++){const c=jellyPulse(t,g).c;assert.ok(c>=0&&c<=1);if(c>prev)rise++;else if(c<prev)fall++;if(c>peak)peak=c;prev=c;}
 assert.ok(peak>.98);assert.ok(fall>rise*1.8,'relaxation must be slower than contraction');
 assert.deepEqual(jellyPulse(123,g,true),{c:0,u:0,thrust:0});
 const a=tentaclePoints({x:0,y:0,len:50,t:10}),b=tentaclePoints({x:0,y:0,len:50,t:40});
 assert.deepEqual(a[0],b[0],'tentacle root stays attached');assert.notDeepEqual(a.at(-1),b.at(-1),'tentacle tip swims');
});

test('V461 five forms x eleven states x eight seeds render gradient-free and finite',()=>{
 for(const seed of SEEDS)for(let f=0;f<5;f++)for(const st of STATES)for(const reduced of [false,true]){
  const {c,log}=rec();
  assert.doesNotThrow(()=>cat.draw(c,pose(st,77,f,seed,reduced),{}),seed+'/'+f+'/'+st);
  assert.equal(log.grad,0,'no per-frame gradients F'+f+' '+st);
  assert.ok(log.ops>40,'form '+f+' must draw real anatomy');
 }
});

test('V461 randomness is visible but identity-safe: palette changes jelly forms, not the cat base',()=>{
 const colours=(seed,f)=>{const {c,log}=rec();cat.draw(c,pose('idle',60,f,seed),{});return [...log.fills].sort().join('|');};
 const jelly=new Set(SEEDS.slice(0,6).map(s=>colours(s,2)));
 assert.ok(jelly.size>=3,'seeds must visibly vary the Medusa Onírica');
 const base=(seed)=>{const {c,log}=rec();cat.draw(c,pose('idle',60,1,seed),{});return log.fills.has('#9b86cb')&&log.fills.has('#c4b1e6');};
 assert.ok(SEEDS.every(base),'lynx fur colours are canonical for every seed');
});

test('V461 reduced motion is clock independent for every form',()=>{
 for(let f=0;f<5;f++){
  const a=rec(),b=rec();
  cat.draw(a.c,pose('idle',5,f,42,true),{});cat.draw(b.c,pose('idle',505,f,42,true),{});
  assert.equal(a.log.ops,b.log.ops);assert.deepEqual([...a.log.fills],[...b.log.fills]);
 }
});

test('V461 metamorphosis cinema: cocoon, single soft bloom, seeded motif, readable card',()=>{
 assert.equal(EVO_CINE_DURATION,4);
 const b=michicornioEvoBeat(MICHI_BLOOM_AT,2,3,false,42);
 assert.ok(b.flash>.99&&b.act==='morph');
 assert.ok(michicornioEvoBeat(2.0,2,3).cocoon>.4&&michicornioEvoBeat(3.2,2,3).cocoon===0);
 assert.equal(michicornioEvoBeat(MICHI_BLOOM_AT,2,3,true).flash,0,'no flash in reduced motion');
 let flashing=0;for(let t=0;t<=4;t+=1/60)if(michicornioEvoBeat(t,1,2).flash>.5)flashing++;
 assert.ok(flashing<=14,'bloom must be one short pulse, not a strobe');
 const motifs=new Set(SEEDS.map(s=>michicornioEvoBeat(1,1,2,false,s).motif));assert.ok(motifs.size>=2);
 for(const seed of SEEDS)for(let from=1;from<5;from++){
  const {c,log}=rec();
  for(let t=0;t<=4;t+=.1)drawEvoCine(c,960,540,t,from,from+1,{seed});
  assert.equal(log.grad,0);
  assert.ok(log.text.some(s=>s.includes('Forma '+from+' → '+(from+1))));
 }
});

test('V461 game wiring: run seed, evolve detail, cache key and Michi-only cinema routing',()=>{
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 const cinema=readFileSync(new URL('../systems/evo-cinema.js',import.meta.url),'utf8');
 const draw=readFileSync(new URL('../characters/draw.js',import.meta.url),'utf8');
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.match(game,/game\.player\.michiSeed=michiRunSeed\(resume\)/);
 assert.match(game,/michiSeed: p\.michiSeed \|\| 0/);
 assert.match(game,/if\(e2eEnabled\)return 0;/);
 assert.match(cinema,/if \(def\.id === "cat"\) mod\.drawEvoCine\(/);
 assert.match(cinema,/else drawEvolutionPresentation\(/);
 assert.match(draw,/q\(pose\.michiSeed,1\)/);
 assert.match(sw,/"\.\/characters\/michi-jelly\.js\?v=" \+ VERSION/);
 for(const f of ['../characters/michi-jelly.js','../characters/art/cat.js','../systems/evo-cine/michi.js'])
  assert.doesNotMatch(readFileSync(new URL(f,import.meta.url),'utf8'),/Math\.random|create(Linear|Radial)Gradient/,f);
});
