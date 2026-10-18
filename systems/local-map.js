// Camera-relative cartography: the full 7,200-unit room is too small to read
// on a 260px thumbnail. The detail lens tracks real collidable geometry.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
export function localMapView(g,viewW=1280){
 const r=g?.roomDef,p=g?.player;if(!r||!p||!r.width)return null;
 const cx=p.x+p.w/2,span=Math.min(r.width,viewW<600?1360:2000);
 const start=clamp(cx-span*.44,0,Math.max(0,r.width-span));
 const sector=r.sectors?.find(s=>cx>=s.x&&cx<s.x+s.w)||r.sectors?.at(-1);
 const known=new Set(g.explored?.[r.id]||[]);
 const next=(r.checkpoints||[]).filter(c=>c.x>cx+45).sort((a,b)=>a.x-b.x)[0]||null;
 return {room:r.id,start,end:start+span,span,cx,progress:clamp(cx/r.width,0,1),
  sector,known,nextCheckpoint:next,remaining:next?Math.max(0,Math.round(next.x-cx)):null};
}
export function drawLocalMap(ctx,g,viewW=1280,viewH=720){
 if(!ctx)return;
 const v=localMapView(g,viewW);if(!v)return;
 const r=g.roomDef,p=g.player,small=viewW<600;
 const w=small?176:298,h=small?98:140,x=viewW-w-14,y=Math.max(12,viewH-h-(small?132:18));
 const left=x+12,right=x+w-12,top=y+34,bottom=y+h-24,plotH=bottom-top;
 const sx=(right-left)/v.span,py=n=>top+4+clamp(n/Math.max(1,r.height),0,1)*(plotH-8),px=n=>left+(n-v.start)*sx;
 const seen=x=>r.sectors?.some(s=>x>=s.x&&x<s.x+s.w&&v.known.has(s.id))||false;
 const overlap=(a,b)=>b>v.start&&a<v.end;
 ctx.save();
 // Three-layer instrument panel: etched rim, faint chart lines, live world data.
 ctx.fillStyle='#071a2bee';ctx.strokeStyle='#9ddac17d';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.roundRect(x,y,w,h,13);ctx.fill();ctx.stroke();
 ctx.fillStyle='#eef7e7';ctx.textBaseline='middle';ctx.textAlign='left';
 ctx.font=small?'700 10px sans-serif':'700 12px sans-serif';
 const heading=(r.short||r.name||r.id).toUpperCase();
 ctx.fillText(heading,x+12,y+16);
 ctx.fillStyle='#a6cdd2';ctx.textAlign='right';ctx.font=small?'9px sans-serif':'10px sans-serif';
 ctx.fillText('SECTOR '+(r.sectors?.indexOf(v.sector)+1||1)+'/'+(r.sectors?.length||1),x+w-12,y+16);
 ctx.fillStyle='#173c4a';ctx.fillRect(left,y+28,right-left,2);
 ctx.fillStyle=r.color||'#a6edce';ctx.fillRect(left,y+28,(right-left)*v.progress,2);
 ctx.beginPath();ctx.rect(left,top,right-left,plotH);ctx.clip();
 ctx.fillStyle='#0c2635';ctx.fillRect(left,top,right-left,plotH);
 for(const s of r.sectors||[]){
  if(!overlap(s.x,s.x+s.w))continue;
  const x0=clamp(px(s.x),left,right),x1=clamp(px(s.x+s.w),left,right);
  ctx.fillStyle=v.known.has(s.id)?'#224252':'#0b1e2c';ctx.fillRect(x0,top,x1-x0,plotH);
  ctx.fillStyle=v.known.has(s.id)?'#e5e2c933':'#7f899b15';
  ctx.fillRect(x0,top,1,plotH);
 }
 // Genuine drop mouths come from the same world data as collision and respawn.
 for(const z of r.hazards||[]){
  if(!overlap(z.x,z.x+z.w)||!seen(z.x+z.w/2))continue;
  ctx.fillStyle=z.type==='death'?'#ff645e88':'#60d8ec88';
  ctx.fillRect(px(z.x),py(z.y),Math.max(2,z.w*sx),Math.max(4,z.h*(plotH-8)/r.height));
  ctx.strokeStyle=z.type==='death'?'#ff9b78':'#97e7f3';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(px(z.x),py(z.y));ctx.lineTo(px(z.x+z.w),py(z.y));ctx.stroke();
 }
 for(const q of g.platforms||[]){
  if(!overlap(q.x,q.x+q.w)||!seen(q.x+q.w/2))continue;
  ctx.fillStyle=q.h>40?'#8bbfa2':'#b5dccc';
  ctx.fillRect(px(q.x),py(q.y),Math.max(1.5,q.w*sx),q.h>40?3:2);
 }
 for(const c of r.checkpoints||[]){
  if(!overlap(c.x,c.x)||!seen(c.x))continue;
  const xx=px(c.x),yy=py(c.y)-4;
  ctx.fillStyle=g.checkpoints?.[r.id]===c.id?'#a6ffd0':'#eacb8b';
  ctx.beginPath();ctx.moveTo(xx,yy-5);ctx.lineTo(xx+4,yy);ctx.lineTo(xx,yy+5);ctx.lineTo(xx-4,yy);ctx.closePath();ctx.fill();
 }
 for(const e of [{x:14,y:1134,d:r.doors?.left},{x:r.width-14,y:1134,d:r.doors?.right},
  r.upExit?{x:r.upExit.x+r.upExit.w/2,y:r.upExit.y||18,d:r.upExit.dest}:null,
  ...(r.portals||[]).map(z=>({x:z.x+z.w/2,y:z.y,d:z.dest}))]){
  if(!e?.d||!overlap(e.x,e.x)||!seen(e.x))continue;
  ctx.strokeStyle='#fff1a9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(e.x),py(e.y),4,0,Math.PI*2);ctx.stroke();
 }
 // What the camera is actually showing, not an arbitrary rectangle on the full island.
 const camX=clamp(px(g.cam?.x||0),left,right),camEnd=clamp(px((g.cam?.x||0)+viewW),left,right);
 ctx.strokeStyle='#e1f4ef88';ctx.lineWidth=1;ctx.strokeRect(camX,top+1,Math.max(0,camEnd-camX),plotH-2);
 ctx.fillStyle='#ffffff';ctx.strokeStyle='#1c4b55';ctx.lineWidth=2;
 const hx=clamp(px(v.cx),left,right),hy=py(p.y+p.h/2);
 ctx.beginPath();ctx.arc(hx,hy,small?3:4,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.restore();
 ctx.save();ctx.textBaseline='middle';ctx.fillStyle='#b4d8d6';ctx.textAlign='left';
 ctx.font=small?'9px sans-serif':'10px sans-serif';
 ctx.fillText(Math.round(v.progress*100)+'% RUTA',x+12,y+h-11);
 ctx.textAlign='right';
 ctx.fillText(v.remaining==null?'FIN DE RUTA':'CONTROL '+v.remaining+' u',x+w-12,y+h-11);
 ctx.restore();
}
