import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {useAbility,updateAbilityFx,clearAbilityFx,cuernoAuroraDomePose,drawCuernoAuroraDome} from "../systems/abilities.js";
const ability=fs.readFileSync("systems/abilities.js","utf8");
const art=fs.readFileSync("characters/art/cuerno.js","utf8");
const movie=fs.readFileSync("systems/supreme-cinema.js","utf8");
const shots=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
const hero=ROSTER.find(h=>h.id==="cuerno");
const ctx=()=>{const calls={save:0,restore:0,arcs:[],fillRects:0,gradients:0,alphas:[]};
 const p=new Proxy({},{
 get(o,key){if(key==="save")return()=>calls.save++;
 if(key==="restore")return()=>calls.restore++;
 if(key==="arc")return(x,y,r)=>calls.arcs.push(r);
 if(key==="fillRect")return()=>calls.fillRects++;
 if(key==="createLinearGradient")return()=>{calls.gradients++;return{addColorStop(){}}};
 if(key in o)return o[key];return()=>{};},
 set(o,key,value){o[key]=value;if(key==="globalAlpha")calls.alphas.push(value);return true;}});
 return {p,calls};
};
test("V72 Cuerno is innately fastest and highest jumper in all 5 forms",()=>{
 for(let evo=0;evo<5;evo++)for(const other of ROSTER.filter(h=>h.id!=="cuerno")){
  assert.ok(hero.forms[evo].speed>other.forms[evo].speed);
  assert.ok(hero.forms[evo].jump>other.forms[evo].jump);
 }
 assert.equal(hero.forms[4].speed,9.6);assert.equal(hero.forms[4].jump,18.6);
 assert.equal(hero.forms[4].jumps,4);
 assert.equal(hero.passive.id,"punta");
});
test("V72 panorama belongs to F4 U only, grows beyond the viewport diagonal",()=>{
 for(let evo=0;evo<4;evo++)assert.equal(cuernoAuroraDomePose({mode:"cuerno",evo,life:75,max:150},1280,720),null);
 assert.equal(cuernoAuroraDomePose({mode:"kilo",evo:4,life:75,max:150},1280,720),null);
 assert.equal(cuernoAuroraDomePose({mode:"cuerno",evo:4,life:0,max:150},1280,720),null);
 const early=cuernoAuroraDomePose({mode:"cuerno",evo:4,life:145,max:150},1280,720);
 const peak=cuernoAuroraDomePose({mode:"cuerno",evo:4,life:65,max:150},1280,720);
 assert.ok(peak.radius>Math.hypot(1280,720),"final U does not cover viewport corners");
 assert.ok(early.radius<peak.radius);
 assert.ok(peak.fade<=1&&peak.fade>0);
});
test("V72 F4 real Canvas paints exactly seven soft bands plus pearly rim",()=>{
 const {p,calls}=ctx();
 drawCuernoAuroraDome(p,{mode:"cuerno",evo:4,life:65,max:150,x:300,y:220},{x:0,y:0},30,{reduceMotion:true});
 assert.equal(calls.arcs.length,8);
 assert.ok(calls.arcs.every(r=>r>0));
 assert.equal(calls.save,calls.restore);
 assert.equal(calls.gradients,1);assert.equal(calls.fillRects,1);
 assert.ok(Math.max(...calls.alphas)<=.2,"U tint hides enemies");
 const alt=ctx();
 drawCuernoAuroraDome(alt.p,{mode:"cuerno",evo:3,life:65,max:150,x:300,y:220},{x:0,y:0},30,{reduceMotion:true});
 assert.equal(alt.calls.arcs.length,0);
 const slow=ctx();
 drawCuernoAuroraDome(slow.p,{mode:"cuerno",evo:4,life:65,max:150,x:300,y:220},{x:0,y:0},900,{reduceMotion:true});
 assert.deepEqual(slow.calls.arcs,calls.arcs,"reduced motion must be static");
});
test("V72 gameplay U snapshots F4 and protects boss, no physical stat mutation",()=>{
 clearAbilityFx();const normal={x:200,y:220,w:28,h:34,hp:160,maxHp:160,stun:0,invuln:0,dying:false};
 const boss={x:320,y:220,w:55,h:55,hp:3000,maxHp:3000,boss:true,stun:0};
 const p={id:"cuerno",name:"Cuerno",abilities:hero.abilities,evo:4,x:100,y:220,w:32,h:44,
 facing:1,speed:9.6,jumpPower:18.6,maxJumps:4,health:80,maxHealth:190,cds:{},cdDur:{},vx:0,vy:0,xp:0};
 const g={player:p,enemies:[normal,boss],projectiles:[],ghosts:[],platforms:[],cam:{x:0,y:0},
 worldW:1600,worldH:900,t:0,nums:{add(){}},fx:{emit(){}},reduceMotion:true,shake:0,flash:0};
 assert.equal(useAbility(g,3),true);
 assert.equal(p.speed,9.6);assert.equal(p.jumpPower,18.6);
 assert.ok(g.flash<=5);assert.ok(g.shake<=3);
 assert.ok(normal._auroraSleepT>0);
 assert.equal(boss._auroraSleepT,undefined);
 for(let i=0;i<150;i++){g.t++;updateAbilityFx(g);}
 assert.equal(normal.hp,0);assert.equal(boss.hp,3000);
 clearAbilityFx();
});
test("V72 final U lives in body, movie, browser and respects old tests",()=>{
 assert.match(ability,/evo: p\.id === "cuerno" \? evo : null/);
 assert.match(ability,/drawCuernoAuroraDome\(ctx,f,cam,t,g\)/);
 assert.match(ability,/if\(Number\(f\.evo\)===4&&!reduced\)/);
 assert.match(art,/if\(magic\?\.slot===3\)/);
 assert.match(movie,/el\.dataset\.cuernoFinal=def\.id==="cuerno"&&evo===4\?"aurora":""/);
 assert.match(shots,/09r-cuerno-aurora-final-u-canopy/);
 assert.doesNotMatch(ability.split("export function cuernoAuroraDomePose(")[1].split("const DRW =")[0],
  /Math\.random|new Image|setInterval|setTimeout|requestAnimationFrame/);
});
