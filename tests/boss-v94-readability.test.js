import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 QUEEN_V94_ATTACKS,bossAttackCue,bossWindupProgress,drawQueenV94Warning
} from "../systems/boss-v94-readability.js";
import {createBossNido} from "../systems/boss-nido.js";

function ctxSpy(){
 const events=[],state={stack:0,globalAlpha:1};
 const ctx=new Proxy(state,{get(o,k){
  if(k==="save")return()=>{o.stack++;events.push(["save"]);};
  if(k==="restore")return()=>{o.stack--;events.push(["restore"]);};
  if(k in o)return o[k];
  return(...xs)=>{
   for(const x of xs)if(typeof x==="number")
    assert.ok(Number.isFinite(x),"Canvas "+k+" got nonfinite number");
   events.push([k,...xs]);
  };
 },set(o,k,v){o[k]=v;return true;}});
 return {ctx,state,events};
}
test("V94 four boss attacks have distinctive named counters and accessible labels",()=>{
 assert.deepEqual(Object.keys(QUEEN_V94_ATTACKS).sort(),
  ["charge","slam","spit","swoop"].sort());
 assert.deepEqual(new Set(Object.values(QUEEN_V94_ATTACKS).map(x=>x.color)).size,4);
 for(const name of Object.keys(QUEEN_V94_ATTACKS)){
  const cue=bossAttackCue(name);
  assert.ok(cue.label.length>3&&cue.hint.length>3);
  assert.ok(Object.isFrozen(cue));
 }
 assert.equal(bossAttackCue("unknown"),null);
 assert.equal(bossAttackCue(""),null);
});
test("V94 countdown increases toward release instead of shrinking",()=>{
 const boss=createBossNido();
 boss.introT=0;boss.telegraph=true;boss.mode="windup";boss.teleKind="charge";
 boss.windMax=28;boss.wind=0;
 assert.equal(bossWindupProgress(boss),0);
 boss.wind=14;assert.equal(bossWindupProgress(boss),.5);
 boss.wind=28;assert.equal(bossWindupProgress(boss),1);
 boss.wind=999;assert.equal(bossWindupProgress(boss),1);
 boss.wind=-5;assert.equal(bossWindupProgress(boss),0);
 boss.telegraph=false;assert.equal(bossWindupProgress(boss),0);
 boss.telegraph=true;boss.introT=15;assert.equal(bossWindupProgress(boss),0);
 boss.introT=0;boss.dying=10;assert.equal(bossWindupProgress(boss),0);
 boss.dying=0;boss.mode="chain";boss.chainDelay=2;
 assert.ok(bossWindupProgress(boss)>0&&bossWindupProgress(boss)<1);
});
test("V94 tells are bounded, unmirrored, nonstrobing and Canvas state-safe",()=>{
 const fingerprints=[];
 for(const kind of Object.keys(QUEEN_V94_ATTACKS)){
  const e={telegraph:true,teleKind:kind,mode:"windup",wind:18,windMax:28,introT:0,dying:0};
  const a=ctxSpy(),b=ctxSpy();
  drawQueenV94Warning(a.ctx,e);
  drawQueenV94Warning(b.ctx,{...e,facing:-1});
  assert.equal(a.state.stack,0);
  assert.ok(a.events.length>10);
  assert.ok(a.events.length<100);
  assert.deepEqual(a.events,b.events,"A mirrored boss must not mirror readable text");
  assert.ok(a.events.some(x=>x[0]==="fillText"&&x[1]===bossAttackCue(kind).label));
  fingerprints.push(JSON.stringify(a.events.filter(x=>["moveTo","quadraticCurveTo","lineTo"].includes(x[0]))));
 }
 assert.equal(new Set(fingerprints).size,4,"Four warning glyphs need four silhouettes");
});
test("V94 no boss warning during intro, death or recovery",()=>{
 for(const e of [
  {telegraph:false,teleKind:"charge"},
  {telegraph:true,teleKind:"charge",dying:12},
  {telegraph:true,teleKind:"charge",introT:21},
  {telegraph:true,teleKind:"unknown"},
 ]){
  const spy=ctxSpy();
  drawQueenV94Warning(spy.ctx,e);
  assert.equal(spy.events.length,0);
 }
});
test("V94 offline release includes boss warning, keeps Cuerno and Dino intact",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const art=fs.readFileSync("engine/boss-art.js","utf8");
 const enemies=fs.readFileSync("engine/enemies.js","utf8");
 const game=fs.readFileSync("game.js","utf8");
 const version=sw.match(/const VERSION = "(ohana-[0-9]+)"/)?.[1];
 assert.ok(version && Number(version.slice(6))>=294);
 assert.ok(html.includes(version));
 assert.match(sw,/systems\/boss-v94-readability\.js\?v=/);
 assert.match(art,/const prog = bossWindupProgress\(e\)/);
 assert.match(enemies,/drawQueenV94Warning\(ctx, e\)/);
 assert.match(game,/voiceCue\.hint/);
 assert.match(sw,/cuerno-v93-metamorphosis/);
 assert.match(sw,/dino-stagecraft/);
 assert.match(sw,/cuerno-v92-resonance/);
});
