const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function localMapBounds(g,viewW,viewH){
 const w=viewW<600?148:240,h=viewW<600?78:108;
 const spanX=Math.min(g.worldW,2400),spanY=Math.min(g.worldH,1100),p=g.player;
 return {w,h,x:viewW-w-14,y:Math.max(128,viewH-h-(viewW<600?184:112)),spanX,spanY,
  left:clamp(p.x+p.w/2-spanX/2,0,g.worldW-spanX),top:clamp(p.y-spanY*.65,0,g.worldH-spanY)};
}
export function drawLocalMap(ctx,g,viewW=1280,viewH=720){
 const r=g.roomDef,p=g.player;if(!r||!p||viewH<420)return;
 const {w,h,x,y,left,top,spanX,spanY}=localMapBounds(g,viewW,viewH);
 const sx=(w-20)/spanX,sy=(h-32)/spanY,px=v=>x+10+(v-left)*sx,py=v=>y+24+(v-top)*sy;
 const seen=new Set(g.explored?.[r.id]||[]),sectors=r.sectors.filter(s=>seen.has(s.id));
 const visible=v=>sectors.some(s=>v>=s.x&&v<=s.x+s.w);
 const pieces=q=>sectors.map(s=>{const a=Math.max(q.x,s.x,left),z=Math.min(q.x+q.w,s.x+s.w,left+spanX);return z>a?{x:a,w:z-a}:null;}).filter(Boolean);
 ctx.save();ctx.fillStyle='#102f3de8';ctx.strokeStyle='#b0d9c85c';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();
 ctx.fillStyle='#e4f3df';ctx.font='600 10px sans-serif';ctx.textAlign='left';ctx.fillText(`${r.short.toUpperCase()} · M MAPA`,x+10,y+15);
 ctx.save();ctx.beginPath();ctx.rect(x+8,y+22,w-16,h-27);ctx.clip();ctx.fillStyle='#a0c8b8';
 for(const q of g.platforms||[])for(const piece of pieces(q))ctx.fillRect(px(piece.x),py(q.y),Math.max(1,piece.w*sx),q.h>40?Math.max(4,q.h*sy):2);
 for(const z of r.hazards||[])for(const piece of pieces(z)){ctx.fillStyle=z.type==='death'?'#ff7667':'#72e5ff';ctx.fillRect(px(piece.x),py(z.y),Math.max(2,piece.w*sx),Math.max(4,z.h*sy));}
 for(const c of r.checkpoints||[])if(visible(c.x)){ctx.fillStyle=g.checkpoints?.[r.id]===c.id?'#b9ffcf':'#e2c58d';ctx.fillRect(px(c.x)-1,py(c.y)-7,2,7);ctx.fillRect(px(c.x),py(c.y)-7,4,3);}
 const album=g.roomAlbums?.[r.id],home=r.checkpoints?.[0];if(album?.found.length===100&&!album.relic&&home){ctx.fillStyle='#ffb8d4';ctx.beginPath();ctx.arc(px(home.x),py(home.y)-10,4,0,Math.PI*2);ctx.fill();}
 const exits=[{x:10,y:1134,d:r.doors.left},{x:r.width-12,y:1134,d:r.doors.right},r.upExit?{x:r.upExit.x+r.upExit.w/2,y:15,d:r.doors.up}:null];
 for(const e of exits)if(e?.d&&visible(e.x)){ctx.fillStyle='#fff0ad';ctx.beginPath();ctx.arc(px(e.x),py(e.y),3,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#c9eaff55';ctx.strokeRect(px(g.cam.x),py(g.cam.y),(g.viewW||viewW)*sx,(g.viewH||viewH)*sy);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px(p.x+p.w/2),py(p.y+p.h/2),3,0,Math.PI*2);ctx.fill();ctx.restore();ctx.restore();
}
