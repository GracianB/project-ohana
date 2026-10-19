import test from 'node:test';import assert from 'node:assert/strict';
import {initGroveGuardian,updateGroveGuardian,GROVE_GUARDIAN} from '../systems/grove-guardian.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {pairedScene} from '../systems/family-islands.js';
const fixture=()=>{const e={x:3290,y:1086,w:30,h:30,hp:30,roomPersona:{special:true,name:'Tambor del Claro'}};initGroveGuardian(e);return {e,g:{player:{x:3150,y:1086,w:32,h:48},cam:{x:2800,y:600},viewW:1100,viewH:700,projectiles:[],enemies:[e],platforms:[],worldW:4200,worldH:1260,nums:{add(){}}}};};
test('Claro miniboss is a unique larger guardian with stable save identity and safe floor',()=>{const {e}=fixture();assert.equal(e.hp,360);assert.equal(e.max,360);assert.equal(e.w,100);assert.equal(e.y+e.h,1134);assert.equal(e._encounterSaveId,'hub-tambor-v1');assert.equal(e.miniBoss,true);});
test('Guardian introduces itself, telegraphs three distinct attacks, rests, and escalates below half health',()=>{
 const {e,g}=fixture(),patterns=new Set();let warnings=0,rest=0;for(let i=0;i<900;i++){updateGroveGuardian(e,g,()=>{});if(e._drummer.phase==='warn'){patterns.add(e._drummer.pattern);warnings++;}if(e._drummer.phase==='rest')rest++;assert.equal(e.y+e.h,1134);assert.ok(e.x>=GROVE_GUARDIAN.left&&e.x+e.w<=GROVE_GUARDIAN.right);}
 assert.deepEqual([...patterns].sort(),[0,1,2]);assert.ok(warnings>100&&rest>100);assert.ok(g.projectiles.length>=3);assert.ok(g.projectiles.every(p=>p.owner==='enemy'&&p.dmg===14));e.hp=170;updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.round,2);
});
test('Guardian cannot start attacks outside camera, respects sleep, and strong stagger interrupts its warning',()=>{
 const {e,g}=fixture();g.cam.x=0;for(let i=0;i<250;i++)updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'waiting');assert.equal(g.projectiles.length,0);
 g.cam.x=2800;e._drummer.phase='warn';e._drummer.timer=40;e.stun=30;updateGroveGuardian(e,g,()=>{});assert.equal(e._drummer.phase,'rest');e.sleep=20;const timer=e._drummer.timer;updateGroveGuardian(e,g,()=>{});assert.equal(e.sleep,19);assert.equal(e._drummer.timer,timer);
});
test('H invulnerability expires on both campaign enemies and the miniboss, allowing follow-up hits',()=>{
 const {e,g}=fixture();e.invuln=8;for(let i=0;i<8;i++)updateGroveGuardian(e,g,()=>{});assert.equal(e.invuln,0);
 const common={x:100,y:1080,w:30,h:30,hp:100,vx:0,vy:0,campaignRole:'pursuer',invuln:8};for(let i=0;i<8;i++)updateCampaignEnemy(common,g,()=>{});assert.equal(common.invuln,0);
});
test('Kilo selection has four authored acts, shared Stitcho reactions and finite choreography',()=>{const kinds=[];for(const t of [1,5,8,11]){const k=pairedScene('kilo','kilo',t),s=pairedScene('stitcho','kilo',t);kinds.push(k.performance.kind);assert.ok(Number.isFinite(k.dx+s.dy));}assert.deepEqual(kinds,['entrance','dance','relic','family']);});
import {shouldSkipCoopWelcome} from '../systems/coop-welcome.js';
test('Live lobby sessions bypass automatic title welcome; solo, invalid sessions and voluntary replay keep it',()=>{
 const s=JSON.stringify({originalEngine:true,characterId:'kilo'});assert.equal(shouldSkipCoopWelcome('?online=1',s),true);assert.equal(shouldSkipCoopWelcome('?online=1',s,true),false);assert.equal(shouldSkipCoopWelcome('',s),false);assert.equal(shouldSkipCoopWelcome('?online=1','{bad'),false);assert.equal(shouldSkipCoopWelcome('?online=1','{}'),false);assert.equal(shouldSkipCoopWelcome('?online=1',null),false);
});
import {WELCOME_STORIES,welcomeStoryAt,nextWelcomeLine} from '../systems/welcome-story.js';
test('Next dialogue visits all 33 lines exactly once despite fractional scene durations',()=>{
 let at=0;for(const line of WELCOME_STORIES.flatMap(s=>s.lines)){assert.equal(welcomeStoryAt(at).line?.text,line.text);at=nextWelcomeLine(at);}assert.equal(welcomeStoryAt(at).complete,true);
});
import {onlineCoop} from '../systems/online-coop.js';
test('Paused/background network heartbeat reuses paced poll without advancing or polling active gameplay',()=>{
 const c=new onlineCoop.constructor();let polls=0,repairs=0;c.enabled=true;c.lastGameTick=100;c.poll=()=>polls++;c.repairDirect=()=>repairs++;const g={player:{x:10}};
 assert.equal(c.networkHeartbeat(g,1000),false);assert.equal(polls,0);assert.equal(c.networkHeartbeat(g,2600),true);assert.equal(polls,1);assert.equal(g.player.x,10);c.enabled=false;assert.equal(c.networkHeartbeat(g,6000),false);assert.equal(polls,1);
});
