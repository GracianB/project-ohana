// Pilot assistance uses real held jump input to traverse authored banks.
// It never moves the actor, grants forms, changes enemies, or clears objectives.
export async function advanceTerrainControls(page,frames){
 const data=await page.evaluate(async()=>{
  const e=window.__OHANA_E2E,s=e.state(),route=e.roomTraversal?.();
  // Recent authors replace the terrain after composition. Read their actual
  // solid banks rather than the old composition's decorative terrace list.
  const room=(await import('/systems/world1-rooms.js')).WORLD1_ROOMS[s.roomId];
  return {s,route:room?{
   ...route,
   terraces:room.plats.filter(p=>p[3]>40).map(([x,y,w,h])=>({x,y,w,h})),
   // Actual lethal gaps must be traversed by jumping; the old pilot only
   // checked ledges, then held D straight into a missing floor segment.
   pits:(room.hazards||[]).filter(h=>h.type==='death').map(h=>({x:h.x,w:h.w}))
  }:route};
 });
 const p=data.s.player,axis=data.s.input.axisX,terraces=data.route?.terraces||[],pits=data.route?.pits||[];
 const advancing=p?.grounded&&!data.s.input.jump&&!data.s.input.down&&Math.abs(axis)>.2;
 const bankAhead=advancing&&terraces.some(t=>{
  const foot=p.y+p.h,edge=axis>0?p.x+p.w:p.x,dist=axis>0?t.x-edge:edge-(t.x+t.w);
  return t.y<foot-15&&dist>-4&&dist<Math.min(125,Math.max(75,frames*7+15));
 });
 const pitAhead=advancing&&pits.some(h=>{
  const edge=axis>0?p.x+p.w:p.x;
  const dist=axis>0?h.x-edge:edge-(h.x+h.w);
  // Trigger before a single simulation step can take the actor across
  // the lip. The 180–190 px author-designed gaps remain fully lethal.
  return dist>=-4&&dist<Math.min(205,Math.max(120,frames*12+30));
 });
 // Some 260–300 px authored gaps require a *second earned jump* in the
 // baby form. Use the real jump key near the first arc's apex while in the
 // gap, never inject vertical velocity or grant extra jumps.
 const midairSecond=!!p&&!p.grounded&&!data.s.input.jump&&Math.abs(axis)>.2&&
  Number(p.jumps)<Number(p.maxJumps)&&Number(p.vy)>=-1.5&&
  pits.some(h=>{
   const center=p.x+p.w/2;
   return center>h.x-10&&center<h.x+h.w+25;
  });
 const ahead=bankAhead||pitAhead||midairSecond;
 if(!ahead){await page.evaluate(n=>window.__OHANA_E2E.step(n),frames);return;}
 await page.keyboard.down('w');const held=Math.min(16,frames);await page.evaluate(n=>window.__OHANA_E2E.step(n),held);await page.keyboard.up('w');
 if(frames>held)await page.evaluate(n=>window.__OHANA_E2E.step(n),frames-held);
}
