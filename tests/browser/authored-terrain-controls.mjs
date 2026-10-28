// Pilot assistance uses real held jump input to traverse authored banks.
// It never moves the actor, grants forms, changes enemies, or clears objectives.
export async function advanceTerrainControls(page,frames){
 const data=await page.evaluate(async()=>{
  const e=window.__OHANA_E2E,s=e.state(),route=e.roomTraversal?.();
  // Recent authors replace the terrain after composition. Read their actual
  // solid banks rather than the old composition's decorative terrace list.
  const room=(await import('/systems/world1-rooms.js')).WORLD1_ROOMS[s.roomId];
  return {s,route:room?{...route,terraces:room.plats.filter(p=>p[3]>40).map(([x,y,w,h])=>({x,y,w,h}))}:route};
 });
 const p=data.s.player,axis=data.s.input.axisX,terraces=data.route?.terraces||[];
 const ahead=p?.grounded&&!data.s.input.jump&&!data.s.input.down&&Math.abs(axis)>.2&&terraces.some(t=>{
  const foot=p.y+p.h,edge=axis>0?p.x+p.w:p.x,dist=axis>0?t.x-edge:edge-(t.x+t.w);
  return t.y<foot-15&&dist>-4&&dist<Math.min(125,Math.max(75,frames*7+15));
 });
 if(!ahead){await page.evaluate(n=>window.__OHANA_E2E.step(n),frames);return;}
 await page.keyboard.down('w');const held=Math.min(16,frames);await page.evaluate(n=>window.__OHANA_E2E.step(n),held);await page.keyboard.up('w');
 if(frames>held)await page.evaluate(n=>window.__OHANA_E2E.step(n),frames-held);
}
