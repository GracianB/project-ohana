// Physical E2E terrain assistance. Only presses the real W key and advances
// the real engine; never touches health, position, velocity, forms or objectives.
// Wide authored chasms need observations DURING a simulated step batch: a fast
// runner can cross the entire approach between two 14-frame snapshots.
export function planTerrainJump(data, requestedFrames) {
 const p=data?.s?.player, axis=data?.s?.input?.axisX||0;
 const terraces=data?.route?.terraces||[],pits=data?.route?.pits||[];
 const direction=axis>0?1:axis<0?-1:0;
 const edge=p?(direction>0?p.x+p.w:p.x):0;
 const pitDistance=h=>direction>0?h.x-edge:edge-(h.x+h.w);
 const nearPit=!!p&&direction!==0&&pits.some(h=>{
  const dist=pitDistance(h);
  return dist>-h.w-90&&dist<Math.max(240,Math.abs(p.vx||0)*20);
 });
 // Reinspect input/velocity every four frames at a chasm: this catches the
 // lip, leap apex and earned second-jump window without any engine mutation.
 const frames=nearPit?Math.min(4,requestedFrames):requestedFrames;
 const advancing=!!p&&p.grounded&&!data.s.input.jump&&!data.s.input.down&&direction!==0;
 const bankAhead=advancing&&terraces.some(t=>{
  const foot=p.y+p.h,dist=direction>0?t.x-edge:edge-(t.x+t.w);
  return t.y<foot-15&&dist>-4&&dist<Math.min(125,Math.max(75,frames*7+15));
 });
 const pitAhead=advancing&&pits.some(h=>{
  const dist=pitDistance(h),speed=Math.max(3,Math.abs(Number(p.vx)||0));
  const lead=Math.max(75,Math.min(118,frames*speed*.75+34));
  return dist>=-4&&dist<lead;
 });
 // Never synthesize an extra jump: only press W if the actual player's
 // remaining jumps permit it. The second press is timed around the apex.
 const midairSecond=!!p&&!p.grounded&&!data.s.input.jump&&direction!==0&&
  Number(p.jumps)<Number(p.maxJumps)&&Number(p.vy)>=-1.5&&
  pits.some(h=>{const center=p.x+p.w/2;return center>h.x-10&&center<h.x+h.w+25;});
 return {frames,jump:!!(bankAhead||pitAhead||midairSecond),nearPit,
  reason:bankAhead?'bank':pitAhead?'pit-lip':midairSecond?'earned-air-jump':'none'};
}

export async function advanceTerrainControls(page,requestedFrames){
 let remaining=Math.max(0,Math.floor(requestedFrames));
 while(remaining>0){
  const data=await page.evaluate(async()=>{
   const e=window.__OHANA_E2E,s=e.state(),route=e.roomTraversal?.();
   const room=(await import('/systems/world1-rooms.js')).WORLD1_ROOMS[s.roomId];
   return {s,route:room?{
    ...route,
    terraces:room.plats.filter(p=>p[3]>40).map(([x,y,w,h])=>({x,y,w,h})),
    pits:(room.hazards||[]).filter(h=>h.type==='death').map(h=>({x:h.x,w:h.w}))
   }:route};
  });
  const intent=planTerrainJump(data,remaining),n=intent.frames;
  if(intent.jump)await page.keyboard.down('w');
  try{await page.evaluate(frames=>window.__OHANA_E2E.step(frames),n);}
  finally{if(intent.jump)await page.keyboard.up('w');}
  remaining-=n;
 }
}
