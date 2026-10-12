import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {KINETIC_IDENTITIES,KINETIC_STAGES,kineticSignature,drawKineticSignature}
 from "../characters/kinetic-stagecraft.js";

const heroes=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
const poseFor=stage=>{
 const p={state:"idle",speed:0,vy:0,air:false,land:0,turnPulse:0,brake:0,impact:0,atk:0};
 switch(stage){
  case "landing":p.state="idle";p.land=.92;break;
  case "turn":p.state="run";p.speed=.75;p.turnPulse=.86;break;
  case "brake":p.state="run";p.speed=.6;p.brake=.9;break;
  case "attack":p.state="attack";p.impact=.85;p.atk=.53;break;
  case "air":p.state="jump";p.air=true;p.vy=-.85;break;
  case "run":p.state="run";p.speed=.86;break;
 }
 return p;
};
function mockCtx(){
 const calls=[],saved=[],props={globalAlpha:.9};
 const ctx=new Proxy(props,{
  get(obj,key){
   if(key==="save")return()=>{saved.push({...obj});calls.push(["save"]);};
   if(key==="restore")return()=>{Object.assign(obj,saved.pop());calls.push(["restore"]);};
   if(key in obj)return obj[key];
   return(...args)=>{calls.push([key,...args.map(x=>typeof x==="number"?Math.round(x*10000)/10000:x)]);};
  },
  set(obj,key,val){obj[key]=val;return true;}
 });
 return {ctx,calls};
}
test("V312: every canonical hero has a different kinetic language",()=>{
 assert.deepEqual(Object.keys(KINETIC_IDENTITIES).sort(),heroes.slice().sort());
 assert.deepEqual([...KINETIC_STAGES],["landing","turn","brake","attack","air","run"]);
 assert.equal(new Set(Object.values(KINETIC_IDENTITIES).map(v=>v.type)).size,10);
 for(const id of heroes){
  const identity=KINETIC_IDENTITIES[id];
  assert.ok(Object.isFrozen(identity)&&Object.isFrozen(identity.colors));
  assert.equal(identity.colors.length,3);
  assert.match(identity.colors.join(","),/#[0-9A-F]{6}/i);
  assert.ok(identity.phrase.length>=12);
  assert.equal(ROSTER.some(p=>p.id===id),true);
 }
});
test("V312: 10 heroes x 5 evolutionary forms x 6 real motion events = 300 drawable states",()=>{
 const signatures=[];
 for(const id of heroes)for(let evo=0;evo<5;evo++)for(const stage of KINETIC_STAGES){
  const p={id,evo,x:100,y:100,w:24,h:32,health:120,vx:3,vy:-1,facing:1,grounded:true};
  const pose=poseFor(stage),old=JSON.stringify({p,pose});
  const signature=kineticSignature(p,pose),{ctx,calls}=mockCtx();
  assert.ok(signature,id+"/"+evo+"/"+stage);
  assert.equal(signature.stage,stage);
  assert.equal(signature.form,evo);assert.equal(signature.hero,id);
  assert.equal(signature.count,2+evo);
  assert.ok(signature.alpha<=.55&&signature.alpha>0);
  assert.equal(drawKineticSignature(ctx,p,34+evo*10,pose,82),true);
  assert.ok(calls.length>8,"no real vector geometry for "+id+"/"+stage);
  assert.equal(calls.filter(c=>c[0]==="save").length,calls.filter(c=>c[0]==="restore").length);
  assert.equal(ctx.globalAlpha,.9,"canvas alpha must be restored");
  assert.equal(JSON.stringify({p,pose}),old,"no gameplay mutation");
  assert.ok(Object.isFrozen(signature));
  signatures.push(id+"/"+evo+"/"+stage);
 }
 assert.equal(signatures.length,300);
 assert.equal(new Set(signatures).size,300);
});
test("V312: full reduced-motion matrix stays unchanged with time and drops ornaments",()=>{
 for(const id of heroes)for(let evo=0;evo<5;evo++)for(const stage of KINETIC_STAGES){
  const p={id,evo},pose=poseFor(stage);
  const data=kineticSignature(p,pose,true);
  assert.equal(data.count,2);
  assert.ok(data.alpha<=kineticSignature(p,pose,false).alpha);
  const render=t=>{const {ctx,calls}=mockCtx();drawKineticSignature(ctx,p,48,pose,t,true);return calls;};
  assert.deepEqual(render(7),render(10007),id+"/"+evo+"/"+stage);
 }
});
test("V312: only combat/movement events trigger, and all parameters remain bounded",()=>{
 assert.equal(kineticSignature({id:"unknown"},{state:"attack",impact:1}),null);
 assert.equal(kineticSignature({id:"dragon",dead:true},poseFor("attack")),null);
 assert.equal(kineticSignature({id:"dragon"},{state:"idle",land:0,air:false}),null);
 assert.equal(kineticSignature({id:"dragon"},{state:"run",speed:0}),null);
 assert.equal(kineticSignature({id:"dragon"},{state:"dead",impact:0}),null);
 for(const id of heroes){
  const p={id,evo:400};
  const signature=kineticSignature(p,{state:"attack",atk:Infinity,impact:1e99});
  assert.equal(signature,null,"untrusted numeric values should not trigger effects");
  const {ctx}=mockCtx();
  assert.equal(drawKineticSignature(ctx,p,0,poseFor("landing"),30),false);
  assert.equal(drawKineticSignature(ctx,p,Infinity,poseFor("landing"),30),false);
 }
});
test("V312: motion overlays are integrated into actual player and remote rendering, not combat code",()=>{
 const draw=fs.readFileSync("characters/draw.js","utf8");
 const game=fs.readFileSync("game.js","utf8");
 const peer=fs.readFileSync("systems/online-coop.js","utf8");
 assert.match(draw,/import \{ drawKineticSignature \} from "\.\/kinetic-stagecraft\.js"/);
 assert.match(draw,/drawKineticSignature\(ctx,p,H,pose,t,reduceMotion\)/);
 assert.match(game,/drawCharacter\(ctx, game\.player, game\.cam, t, \{reduceMotion:game\.reduceMotion\}\)/);
 assert.match(peer,/drawCharacter\(ctx, player, game\.cam, t, \{reduceMotion:game\.reduceMotion\}\)/);
 const src=fs.readFileSync("characters/kinetic-stagecraft.js","utf8");
 assert.doesNotMatch(src,/Math\.random|setTimeout\(|requestAnimationFrame\(|fetch\(|\.hp\s*[-+]?=|\.vx\s*=/);
});
