import test from 'node:test';
import assert from 'node:assert/strict';
import {drawDinoCreature} from '../systems/dino-chapter-art-v613.js';
import {drawDragonCreature} from '../systems/dragon-chapter-art-v611.js';
import {chapterThreatState,drawChapterThreatCue} from '../systems/chapter-threat-cues.js';
import {updateDragonChapter} from '../systems/dragon-chapter.js';

// A real Canvas command recorder, not a no-op proxy. Rejects nonfinite pixel
// coordinates and verifies that every renderer restores its Canvas state.
function trace(draw){
 const ops=[];
 const gradient=()=>({addColorStop(...a){ops.push(['colorStop',...a]);}});
 const ctx=new Proxy({},{
  get(_t,prop){
   if(prop==='createLinearGradient'||prop==='createRadialGradient')
    return (...a)=>{ops.push([prop,...a]);return gradient();};
   if(prop==='measureText')return ()=>({width:55});
   if(typeof prop==='symbol')return undefined;
   return (...a)=>{
    for(const v of a)if(typeof v==='number')assert.ok(Number.isFinite(v),'nonfinite '+String(prop));
    ops.push([prop,...a]);
   };
  },
  set(_t,prop,val){
   ops.push(['set',prop,val&&typeof val==='object'?'[Canvas value]':val]);
   return true;
  }
 });
 draw(ctx);
 assert.equal(ops.filter(x=>x[0]==='save').length,ops.filter(x=>x[0]==='restore').length,
  'Canvas save/restore must balance');
 return JSON.stringify(ops);
}

const cases=[
 ['dino','cucaracho','pursuer'], ['dino','rana','jumper'],
 ['dino','cangrejo','shield'], ['dino','libelula','flyer'], ['dino','abeja','shooter'],
 ['dragon','escoria','pursuer'], ['dragon','rana','jumper'],
 ['dragon','planta','shield'], ['dragon','murcielago','flyer'], ['dragon','brasita','shooter']
];
function makeEnemy(hero,kind,role){
 return {x:400,y:540,w:52,h:44,hp:60,max:60,roomId:'w1-'+hero,kind,campaignRole:role,
   facing:1,invuln:0,stun:0,_alertT:0,_campaign:{wind:0,active:0,aim:1}};
}
function paint(hero,e,t,reduced){
 return trace(ctx=>(hero==='dino'?drawDinoCreature:drawDragonCreature)(
   ctx,e,{x:100,y:0},t,reduced));
}

test('10 real fossil/volcanic species: warning/active cues draw finite, role-specific marks',()=>{
 for(const [hero,kind,role] of cases){
  const e=makeEnemy(hero,kind,role);
  const before=JSON.stringify(e);
  const idle=paint(hero,e,20,true);
  e._campaign.wind=12;
  const wind=paint(hero,e,20,true);
  e._campaign.wind=0;e._campaign.active=18;
  const active=paint(hero,e,20,true);
  assert.notEqual(wind,idle,hero+' '+kind+' warn must be visible');
  assert.notEqual(active,idle,hero+' '+kind+' attack must be visible');
  assert.match(wind,/setLineDash/,hero+' '+kind+' has a dashed preparation cue');
  assert.match(active,/setLineDash/,hero+' '+kind+' attack cue clears its dash');
  assert.equal(e.hp,60);
  assert.equal(e.max,60);
  e._campaign.wind=0;e._campaign.active=0;
  assert.equal(JSON.stringify(e),before,'drawing must not mutate enemy state');
 }
});

test('both worlds keep all 10 creature rigs completely static when reduceMotion=true',()=>{
 for(const [hero,kind,role] of cases){
  const e=makeEnemy(hero,kind,role);
  e._campaign.wind=10;
  const before=JSON.stringify(e);
  assert.equal(paint(hero,e,0,true),paint(hero,e,237,true),
    hero+' '+kind+' should not flap, bob, sway or rotate in reduced motion');
  assert.equal(JSON.stringify(e),before,'drawing is render-only');
 }
 for(const [hero,kind,role] of cases.filter(c=>c[1]==='murcielago'||c[1]==='libelula')){
  const e=makeEnemy(hero,kind,role);
  assert.notEqual(paint(hero,e,0,false),paint(hero,e,37,false),
    hero+' '+kind+' normal wing animation must remain alive');
 }
});

test('role symbols are truly different, both themes work, and no cue appears while idle',()=>{
 const e=makeEnemy('dragon','escoria','pursuer');
 const palette=['volcanic','fossil'];
 for(const theme of palette){
  e._campaign.wind=0;
  e._campaign.active=0;
  const empty=trace(ctx=>assert.equal(drawChapterThreatCue(ctx,e,12,false,theme),false));
  assert.equal(empty,'[]');
  const symbols=new Set();
  for(const role of ['pursuer','shield','shooter','jumper','flyer']){
   e.campaignRole=role;e._campaign.wind=16;
   const state=chapterThreatState(e);
   assert.equal(state.role,role);
   symbols.add(trace(ctx=>assert.equal(drawChapterThreatCue(ctx,e,18,true,theme),true)));
  }
  assert.equal(symbols.size,5,'each combat role needs a different silhouette');
 }
 e._campaign.aim=-1;
 assert.equal(chapterThreatState(e).direction,-1);
});

test('Dragon cannot auto-ignite a brazier merely by sprinting nearby',()=>{
 let saves=0;
 const persisted=[];
 const first={id:0,x:2000,y:1134,kind:'brazier',done:false};
 const other=[4400,6800,9200].map((x,i)=>({id:i+1,x,y:1134,kind:'brazier',done:false}));
 const g={
  roomDef:{id:'w1-dragon',growthChapter:'dragon'},roomId:'w1-dragon',
  player:{id:'dragon',x:1970,y:1070,w:32,h:64,vx:12,vy:0,state:'idle',xp:0,grounded:true},
  world1:{tick:40,stations:[first,...other],calderaHeat:0},
  world1Stations:{'w1-kilo':[0]},
  score:0,nums:{add(){}},fx:{emit(){}},save(){saves++;persisted.push(structuredClone(this.world1Stations));}
 };
 updateDragonChapter(g);
 assert.equal(first.done,false,'speed alone is not a fire action');
 assert.equal(g.score,0);
 assert.equal(saves,0);

 g.player.state='cast';
 updateDragonChapter(g);
 assert.equal(first.done,true,'real fire cast lights nearby brazier');
 assert.equal(g.score,150);
 assert.equal(g.player.xp,55,'earned station advances canonical XP floor');
 assert.equal(saves,1);
 assert.deepEqual(persisted[0],{'w1-kilo':[0],'w1-dragon':[0]},
  'the same save must retain other chapters and first earned brazier');
 updateDragonChapter(g);
 assert.equal(g.score,150,'station cannot pay twice');
 assert.equal(saves,1,'save exactly once per station');

 g.player.state='idle';
 g.player.x=4370;
 other[0].flameUntil=45; // actual authorized ignition window, not run speed
 updateDragonChapter(g);
 assert.equal(other[0].done,true);
 assert.equal(g.score,300);
 assert.equal(saves,2);
 assert.deepEqual(persisted[1]['w1-dragon'],[0,1],
  'Continue must recover both earned braziers in canonical id order');

 // The real J dispatcher timestamps a breath. It need not set state='cast'.
 g.t=201;g.player.state='idle';g.player.x=6770;
 g.player._cast={id:'breath',slot:0,t:200};
 updateDragonChapter(g);
 assert.equal(other[1].done,true,'real J breath must light its own station');
 assert.equal(g.score,450);
 assert.equal(saves,3);
 assert.deepEqual(persisted[2]['w1-dragon'],[0,1,2],
  'time-stamped J breath must also survive a save and Continue');

 g.t=300;g.player.x=9170;
 g.player._cast={id:'breath',slot:0,t:200};
 updateDragonChapter(g);
 assert.equal(other[2].done,false,'an expired fire cast must not light a new station');
});
