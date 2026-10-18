const TAU=Math.PI*2;
const COLORS={hub:'#f4d98e',beach:'#95e4ed',jungle:'#b7ef94',cave:'#cbb5ff',lab:'#89e8d9',ridge:'#d5eeff',space:'#d4b8f8',reef:'#f0b5da',volcano:'#ffc495'};
function springs(g){
 if(g.roomId==='boss'||!COLORS[g.roomId]){g.islandSprings=null;return null;}
 if(g.islandSprings?.room!==g.roomId||g.islandSprings?.owner!==g.player){
  const platforms=(g.platforms||[]).filter(p=>p.h<=40&&p.y>600&&p.w>150).sort((a,b)=>a.x-b.x);
  const selected=platforms.filter((_,i)=>i===0||i===Math.floor(platforms.length/2));
  g.islandSprings={room:g.roomId,owner:g.player,wasAir:!g.player?.grounded,
   pads:selected.map(p=>({x:p.x+p.w*.5,y:p.y,cd:0,flash:0})),used:0};
 }
 return g.islandSprings;
}
export function updateIslandSprings(g){
 const p=g.player;if(!p)return;
 const s=springs(g);if(!s)return;
 for(const pad of s.pads){pad.cd=Math.max(0,pad.cd-1);pad.flash=Math.max(0,pad.flash-1);}
 if(p.dead){s.wasAir=false;return;}
 if(s.wasAir&&p.grounded){
  for(const pad of s.pads){
   if(pad.cd||Math.abs(p.x+p.w/2-pad.x)>28+p.w*.3||Math.abs(p.y+p.h-pad.y)>8)continue;
   p.vy=-Math.max(15,Number(p.jumpPower)||12);p.grounded=false;p.jumps=0;p._jumpHeld=false;
   pad.cd=45;pad.flash=22;s.used++;
   g.fx?.emit?.(pad.x,pad.y-5,{color:COLORS[g.roomId],count:g.reduceMotion?3:10,size:3,speed:2.5,up:2,life:20});
   g.nums?.add?.(pad.x,pad.y-35,'¡BOING!',COLORS[g.roomId],false);break;
  }
 }
 s.wasAir=!p.grounded;
}
export function islandSpringsSnapshot(g){
 const s=g.islandSprings;return s?{used:s.used,pads:s.pads.map(({x,y,cd})=>({x,y,cd}))}:null;
}
export function drawIslandSprings(ctx,g,cam,t){
 const s=g.islandSprings;if(!s||s.room!==g.roomId)return;
 ctx.save();try{for(const pad of s.pads){
  const x=pad.x-cam.x,y=pad.y-cam.y,color=COLORS[g.roomId],pulse=g.reduceMotion?0:Math.sin(t*.06)*1.5;
  ctx.globalAlpha=pad.cd ? .65 : 1;ctx.strokeStyle='#39584d';ctx.lineWidth=2;
  for(let i=0;i<5;i++){
   const a=-Math.PI+i*Math.PI/4;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*16,y-7+Math.sin(a)*8,14,6,a,0,TAU);ctx.fill();ctx.stroke();
  }
  ctx.fillStyle='#f7edbc';ctx.beginPath();ctx.ellipse(x,y-7,11,5,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle=color;ctx.globalAlpha=pad.cd ? .3 : .8;ctx.beginPath();ctx.moveTo(x-6,y-23+pulse);ctx.lineTo(x,y-29+pulse);ctx.lineTo(x+6,y-23+pulse);ctx.stroke();
  if(pad.flash>0){ctx.globalAlpha=pad.flash/22;ctx.beginPath();ctx.ellipse(x,y-5,18+(22-pad.flash)*2,7+(22-pad.flash)*.6,0,0,TAU);ctx.stroke();}
 }}finally{ctx.restore();}
}
