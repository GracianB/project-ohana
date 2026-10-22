import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {ROSTER} from "../characters/roster.js";
import {ABILITY_DEFS} from "../systems/ability-catalog.js";
import {YOMI_FORMS,YOMI_FAMILY_STARS,yomiMood,yomiCacheKey} from "../characters/art/yomi.js";
import {YOMI_PING_HOPS,YOMI_SCAN_RADIUS} from "../systems/abilities.js";
import {YOMI_EVO_ACTS,yomiEvoBeat,YOMI_FLASH_AT} from "../systems/evo-cine/yomi.js";

const art=fs.readFileSync("characters/art/yomi.js","utf8");
const cine=fs.readFileSync("systems/evo-cine/yomi.js","utf8");
const evo=fs.readFileSync("systems/evo-cinema.js","utf8");

test("Yomi IA: roster, nombres y habilidades con identidad de IA",()=>{
 const y=ROSTER.find(r=>r.id==="yomi");
 assert.deepEqual(y.forms.map(f=>f.name),["Yomi Bit","Yomi","Yomi Red","Yomi Oráculo","Yomi Constelación"]);
 assert.equal(y.role,"IA");
 assert.deepEqual(y.abilities,["ofuda","sleeve","maw"]);
 assert.equal(ABILITY_DEFS.ofuda.name,"Ping curioso");
 assert.equal(ABILITY_DEFS.sleeve.name,"Escáner");
 assert.equal(ABILITY_DEFS.maw.name,"Síntesis");
 for(let i=1;i<5;i++)assert.ok(y.forms[i].hp>y.forms[i-1].hp);
});
test("Yomi IA: cinco formas crecen y la final lleva diez estrellas familiares",()=>{
 assert.equal(YOMI_FORMS.length,5);
 for(let i=1;i<5;i++)assert.ok(YOMI_FORMS[i].top<YOMI_FORMS[i-1].top,"crece "+i);
 assert.equal(YOMI_FAMILY_STARS.length,10);
 assert.equal(new Set(YOMI_FAMILY_STARS).size,10);
});
test("Yomi IA: J rebota más y K escanea más lejos al evolucionar",()=>{
 for(let i=1;i<5;i++){assert.ok(YOMI_PING_HOPS[i]>=YOMI_PING_HOPS[i-1]);assert.ok(YOMI_SCAN_RADIUS[i]>YOMI_SCAN_RADIUS[i-1]);}
});
test("Yomi IA: la pantalla expresa estados distintos",()=>{
 const moods=new Set(["idle","hurt","dead","victory","attack"].map(state=>yomiMood({state})));
 for(let s=0;s<4;s++)moods.add(yomiMood({state:"cast",castSlot:s}));
 assert.ok(moods.size>=8);
 assert.equal(yomiCacheKey({t:100,reduceMotion:true}),yomiCacheKey({t:900,reduceMotion:true}));
});
test("Yomi IA: metamorfosis propia de cuatro actos, un destello y enrutada en partida",()=>{
 assert.deepEqual(YOMI_EVO_ACTS.map(a=>a.id),["question","read","compile","awaken"]);
 assert.ok(yomiEvoBeat(YOMI_FLASH_AT).flash>.99);
 assert.equal(yomiEvoBeat(YOMI_FLASH_AT,1,2,true).flash,0);
 assert.match(evo,/def\.id === "yomi"\) mod\.drawEvoCine/);
 for(const src of [art,cine])assert.doesNotMatch(src,/create(Linear|Radial)Gradient|Math\.random/);
});
