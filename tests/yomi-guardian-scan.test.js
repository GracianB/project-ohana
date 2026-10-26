import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {useAbility,updateAbilityFx,clearAbilityFx,YOMI_SCAN_RADIUS} from '../systems/abilities.js';

function fixture(evo=4){
 const def=ROSTER.find(h=>h.id==='yomi'),form=def.forms[evo];
 const p={...def,...form,id:'yomi',evo,x:9000,y:1074,w:50,h:60,health:form.hp,maxHealth:form.hp,facing:1,vx:0,vy:0,grounded:true,dead:false};
 return {player:p,t:0,roomId:'w1-final',enemies:[],projectiles:[],platforms:[],worldW:14000,worldH:1500,combo:0,fx:{emit(){}},nums:{add(){}}};
}
function shot(gauntlet,rect){return {gauntlet,...rect,vx:0,vy:0,owner:'enemy',dmg:25,life:100};}
function scan(g){
 assert.equal(useAbility(g,1),true,'ordinary K cast succeeds');
 for(let tick=0;tick<29;tick++){g.t++;updateAbilityFx(g);}
}

test('V603: real Yomi K erases a crossing beam with a distant origin and other persistent guardian volumes',()=>{
 clearAbilityFx();try{
  const g=fixture(1);g.projectiles=[
   shot('prism',{x:7550,y:1089,w:3700,h:30}),
   shot('lightning',{x:9008,y:634,w:34,h:470}),
   shot('geysers',{x:9008,y:834,w:34,h:260}),
   shot('ember',{x:8975,y:1098,w:100,h:22}),
  ];
  const originals=g.projectiles.map(pr=>[pr.x,pr.y,pr.w,pr.h]);
  scan(g);
  assert.ok(g.projectiles.every(pr=>pr.life===0));
  assert.deepEqual(g.projectiles.map(pr=>[pr.x,pr.y,pr.w,pr.h]),originals,'firewall cancels the existing volumes without moving or resizing them');
 }finally{clearAbilityFx();}
});

test('V603: huge guardian hazards cannot expand the scan beyond the current form radius',()=>{
 for(const evo of [1,4]){
  clearAbilityFx();try{
   const g=fixture(evo),R=YOMI_SCAN_RADIUS[evo],x=g.player.x+g.player.w/2,y=g.player.y+g.player.h/2;
   // Its origin is distant, its enormous width overlaps the whole arena, but
   // its nearest edge is still beyond the actual circle in vertical space.
   const above=shot('prism',{x:7550,y:y-R-51,w:20000,h:50});
   const beside=shot('lightning',{x:x+R+1,y:y-500,w:20000,h:1000});
   const reachable=shot('geysers',{x:x+R-2,y:y-8,w:34,h:16});
   g.projectiles=[above,beside,reachable];scan(g);
   assert.equal(above.life,100,'vertical gap remains outside the scan');
   assert.equal(beside.life,100,'hazard size does not inflate horizontal reach');
   assert.equal(reachable.life,0,'the same cast still reaches the existing form radius');
  }finally{clearAbilityFx();}
 }
});

test('V603: scanner preserves friendly volumes and the old point-based rule for ordinary shots',()=>{
 clearAbilityFx();try{
  const g=fixture(),x=g.player.x+g.player.w/2,y=g.player.y+g.player.h/2;
  const friendly={...shot('prism',{x:7550,y:1089,w:3700,h:30}),owner:'player'};
  const ordinary=shot('orb',{x:7550,y:1089,w:3700,h:30});
  const legacy={x,y,w:18,h:18,vx:0,vy:0,owner:'enemy',dmg:12,life:100};
  g.projectiles=[friendly,ordinary,legacy];scan(g);
  assert.equal(friendly.life,100);assert.equal(ordinary.life,100);
  assert.equal(legacy.life,0,'ordinary nearby projectiles remain blocked');
 }finally{clearAbilityFx();}
});
