// Physical controller shared by the isolated Kilo acceptance run and the
// uninterrupted campaign. It reads authored targets and live combat state;
// all movement, attacks, flight and instrument actions use ordinary keys.
const controllers=new WeakMap();
export async function advanceKiloEncounterControls(page,s,step,i=0){
 if(s.roomId!=='w1-kilo')return null;
 let pilot=controllers.get(page);
 if(!pilot||i<pilot.iteration){
  pilot={iteration:i,flightStartedAt:-9999,stations:await page.evaluate(async()=>
   (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-kilo'].seal.stations)};
  controllers.set(page,pilot);
 }
 pilot.iteration=i;
 const stations=pilot.stations,cast=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=cast.find(e=>e.guardian&&e.hp>0),b=boss?.guardian,p=s.player;
 const press=k=>page.keyboard.press(k),hold=k=>page.keyboard.down(k),release=k=>page.keyboard.up(k);
 let flightStartedAt=pilot.flightStartedAt;
  const station=stations[s.world1.done],cx=p.x+p.w/2,cy=p.y+p.h/2;
  const near=cast.filter(e=>!e.miniBoss&&e.hp>0&&Math.hypot(e.x+e.w/2-cx,e.y+e.h/2-cy)<365).sort((a,b)=>Math.abs(a.x-cx)-Math.abs(b.x-cx))[0];
  const bossFight=!station&&boss&&Math.abs(boss.x+boss.w/2-cx)<850;
  let target=station?.x??(boss?boss.x-220:13980),jump=false,air=false;
  if(near&&Math.abs(near.x+near.w/2-cx)<170&&!bossFight){
   const dir=Math.sign(near.x+near.w/2-cx)||1;
   target=near.x+near.w/2-dir*(near.role==='shield'?30:95);
   if((near.role==='jumper'||near.role==='shield')&&p.grounded&&i%4===0)jump=true;
   if(near.role==='flyer'&&s.evo>=1&&s.kiloFlight.remaining<=0&&i-flightStartedAt>100){await press('k');flightStartedAt=i;}
  }
  if(station?.note===2&&Math.abs(cx-station.x)<500){
   target=station.x;const dy=(station.y-55)-cy;
   if(s.evo>=1&&s.kiloFlight.remaining<=0&&dy<-55&&i-flightStartedAt>24){await press('k');flightStartedAt=i;}
   if(s.kiloFlight.remaining>0){air=true;if(dy<-20)await hold('w');if(dy>20)await hold('s');}
   else if(dy<-45&&(p.grounded||p.vy>0&&p.jumps<p.maxJumps))jump=true;
  }
  if(bossFight){
   const center=boss.x+boss.w/2,side=cx<center?-1:1;
   if(b.phase==='rest')target=center+side*135;
   else if(b.phase==='warn'||b.phase==='strike'){
    target=center+side*(b.pattern===1?315:265);
    if(b.pattern===0&&(b.phase==='strike'||b.timer<18)&&p.grounded)jump=true;
    if(b.pattern===1&&b.phase==='warn'&&b.timer<14&&p.grounded)jump=true;
    if(b.pattern===2&&b.phase==='strike'&&p.grounded&&i%3===0)jump=true;
   }else target=center+side*285;
  }
  const dx=target-cx,dir=dx>0?'d':'a';
  if(Math.abs(dx)>22)await hold(dir);
  // Face a real target before casting, without moving its position by a hook.
  const aim=near&&!bossFight?near.x+near.w/2:bossFight?boss.x+boss.w/2:station?.x;
  if(Math.abs(dx)<=22&&aim!=null){await hold(aim>=cx?'d':'a');s=await step(1);await release('d');await release('a');}
  if(near&&(!bossFight||b.phase==='rest')){
   await press('h');await press('j');if(i%9===0)await press('u');
   if(s.evo>=2&&i%13===0)await press('l');
  }
  if(station&&Math.hypot(cx-station.x,cy-(station.y-55))<165){
   if(station.note===0)await press('e');
   else if(station.note===2){if(!p.grounded)await press('j');}
   else{await press('j');if(station.note===3&&s.kiloCombo.ready)await press('i');}
  }
  if(bossFight&&b.phase==='rest'){
   await press('h');await press('j');if(i%8===0)await press('u');if(s.evo>=2)await press('l');
   if(s.kiloCombo.ready)await press('i');if(s.finisherCharge>=100)await press('p');
  }
  if(!air&&!jump&&p.grounded&&p.y+p.h<1080&&station?.note!==2)await hold('s');
  if(jump)await hold('w');
  s=await step(bossFight?10:Math.abs(dx)>22?Math.min(20,Math.max(4,Math.floor(Math.abs(dx)/7))):28);
  for(const k of ['d','a','w','s'])await release(k);
  if(jump)s=await step(1);
 pilot.flightStartedAt=flightStartedAt;
 return s;
}
