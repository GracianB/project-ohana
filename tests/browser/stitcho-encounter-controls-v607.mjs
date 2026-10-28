// Read-only observation drives ordinary keys. No movement, health, XP, enemy,
// module, rail, guardian or seal setters are used by this controller.
const controllers=new WeakMap();
export async function advanceStitchoEncounterControls(page,s,step,i=0){
 if(s.roomId!=='w1-stitcho')return null;
 let pilot=controllers.get(page);
 if(!pilot||i<pilot.iteration){
  pilot=await page.evaluate(async()=>({stations:(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-stitcho'].seal.stations,rail:(await import('/systems/stitcho-chapter.js')).STITCHO_RAIL,railRun:false,iteration:0}));controllers.set(page,pilot);
 }
 pilot.iteration=i;
 const workshop=await page.evaluate(()=>window.__OHANA_E2E.stitchoChapterState());
 const cast=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
 const boss=cast.find(e=>e.stitchoBoss&&e.hp>0),b=boss?.stitchoBoss,p=s.player,cx=p.x+p.w/2,cy=p.y+p.h/2;
 const station=pilot.stations[s.world1.done],live=workshop.stations?.find(q=>q.id===station?.id);
 const near=cast.filter(e=>!e.miniBoss&&e.hp>0&&Math.hypot(e.x+e.w/2-cx,e.y+e.h/2-cy)<420).sort((a,b)=>Math.abs(a.x-cx)-Math.abs(b.x-cx))[0];
 const press=k=>page.keyboard.press(k),hold=k=>page.keyboard.down(k),release=k=>page.keyboard.up(k);
 const railLesson=s.world1.done===1&&!workshop.railDone,bossFight=!station&&boss&&Math.abs(boss.x+boss.w/2-cx)<950;
 const carrying=workshop.carry!=null,rail=pilot.rail;
 let target=carrying?pilot.stations.find(q=>q.id===workshop.carry)?.target.x:station?.x??(boss?boss.x-220:13980),jump=false,roll=false;
 if(railLesson){
  if(cx>rail.right+35&&!workshop.railDone)pilot.railRun=false;
  if(!pilot.railRun&&Math.abs(cx-(rail.left-45))<24&&p.grounded&&workshop.move!=='roll')pilot.railRun=true;
  target=pilot.railRun?rail.right+55:rail.left-45;
  roll=pilot.railRun&&p.grounded&&cx<rail.left&&workshop.move!=='roll';
 }
 if(near&&!bossFight&&!railLesson&&Math.abs(near.x+near.w/2-cx)<175){
  const dir=Math.sign(near.x+near.w/2-cx)||1;target=near.x+near.w/2-dir*(near.role==='shield'?25:100);
  if(p.grounded&&(near.role==='shield'||near.role==='jumper')&&i%3===0)jump=true;
 }
 if(station?.id===1&&!carrying&&Math.abs(cx-station.x)<400){
  target=station.x;
  if(p.y+p.h>station.y+22&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps))jump=true;
  if(!live?.released&&p.grounded&&Math.abs(cx-station.x)<150)jump=true;
 }
 if(station?.id===2&&!carrying&&!live?.released&&Math.abs(cx-station.x)<220){
  if(cx>station.x+90)target=station.x-170;
  else{target=station.x+110;roll=p.grounded&&cx<station.x-40&&workshop.move!=='roll';}
 }
 if(bossFight){
  const center=boss.x+boss.w/2,side=cx<center?-1:1;
  if(b.phase==='rest')target=center+side*125;
  else if(b.phase==='warn'||b.phase==='attack'){
   target=center+side*(b.attack===1?330:285);
   if(b.attack===0&&(b.phase==='attack'||b.clock<17)&&p.grounded)jump=true;
   if(b.attack===1&&b.phase==='warn'&&b.clock<13&&p.grounded)jump=true;
   if(b.attack===2&&b.phase==='warn'&&b.clock<20&&p.grounded&&workshop.move!=='roll')roll=true;
  }else target=center+side*300;
  target=Math.max(12620,Math.min(14050,target));
 }
 const dx=target-cx;if(Math.abs(dx)>20)await hold(dx>0?'d':'a');
 if(roll)await press('k');if(jump){await hold('w');s=await step(2);}
 const aim=near&&!bossFight?near.x+near.w/2:bossFight?boss.x+boss.w/2:station?.x;
 if(Math.abs(dx)<=20&&aim!=null){await hold(aim>=cx?'d':'a');s=await step(1);await release('d');await release('a');}
 if(near&&!bossFight){await press('h');await press('j');if(i%10===0)await press('u');if(s.evo>=2&&i%15===0&&!railLesson)await press('l');}
 if(station&&!carrying&&!live?.released&&Math.hypot(cx-station.x,cy-(station.y-40))<168){if(station.id===0||station.id===1&&!s.player.grounded)await press('j');}
 if(bossFight&&b.phase==='rest'){await press('h');await press('j');if(i%8===0)await press('u');await press('l');if(s.evo>=3)await press('i');if(s.finisherCharge>=100)await press('p');}
 if(!jump&&p.grounded&&p.y+p.h<1080&&(carrying||station?.id!==1))await hold('s');
 s=await step(bossFight?10:railLesson?10:Math.abs(dx)>20?Math.min(18,Math.max(3,Math.floor(Math.abs(dx)/8))):24);
 for(const k of ['d','a','w','s'])await release(k);if(jump)s=await step(1);return s;
}
