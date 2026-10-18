export function drawLocalMap(ctx,g,viewW=1280,viewH=720){
 const r=g.roomDef,p=g.player;if(!r||!p)return;
 const w=viewW<600?148:260,h=viewW<600?72:112,x=viewW-w-14,y=viewH-h-18;
 const sx=(w-20)/g.worldW,sy=(h-32)/g.worldH,px=v=>x+10+v*sx,py=v=>y+24+v*sy;
 const seen=new Set(g.explored?.[r.id]||[]),visible=v=>r.sectors.some(s=>v>=s.x&&v<=s.x+s.w&&seen.has(s.id));
 ctx.save();ctx.fillStyle='#102f3deb';ctx.strokeStyle='#b0d9c85c';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();
 ctx.fillStyle='#e4f3df';ctx.font='600 10px sans-serif';ctx.textAlign='left';ctx.fillText(`${r.short.toUpperCase()} · M MAPA`,x+10,y+15);
 ctx.fillStyle=r.color||'#abd8ad';for(const q of g.platforms||[])if(visible(q.x))ctx.fillRect(px(q.x),py(q.y),Math.max(1,q.w*sx),Math.max(1.5,q.h*sy));
 for(const z of r.hazards||[])if(visible(z.x)){ctx.fillStyle=z.type==='death'?'#ff7667':'#72e5ff';ctx.fillRect(px(z.x),py(z.y),Math.max(2,z.w*sx),Math.max(4,z.h*sy));}
 for(const c of r.checkpoints||[])if(visible(c.x)){ctx.fillStyle=g.checkpoints?.[r.id]===c.id?'#b9ffcf':'#e2c58d';ctx.fillRect(px(c.x)-2,py(c.y)-5,4,5);}
 const exits=[{x:10,y:1134,d:r.doors.left},{x:r.width-12,y:1134,d:r.doors.right},r.upExit?{x:r.upExit.x+r.upExit.w/2,y:15,d:r.doors.up}:null];
 for(const e of exits)if(e?.d&&visible(e.x)){ctx.fillStyle='#fff0ad';ctx.beginPath();ctx.arc(px(e.x),py(e.y),3,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#c9eaff66';ctx.strokeRect(px(g.cam.x),py(g.cam.y),Math.min(w-20,viewW*sx),Math.min(h-32,viewH*sy));
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px(p.x+p.w/2),py(p.y+p.h/2),3,0,Math.PI*2);ctx.fill();ctx.restore();
}
