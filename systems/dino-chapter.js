// Dino campaign landing mechanics. Air height is observed, never granted by J/K.
export function dinoLanding(g,s){
 const w=g.world1,p=g.player;if(!g.roomDef?.dinoChapter)return true;
 const height=s.y-(w.dinoPeak??s.y),enough=height>=(s.dropHeight||40);
 if(!enough){if(!s.warnAt||w.tick-s.warnAt>90){s.warnAt=w.tick;g.nums?.add?.(s.x,s.y-80,'SUBE MÁS · USA LA CORNISA','#fff0bd',true);}return false;}
 w.dinoLandings=(w.dinoLandings||0)+1;w.dinoImpact={x:s.x,t:32,height};
 // A deliberate impact opens nearby formations, without bypassing boss armour.
 for(const e of g.enemies||[])if(!e.miniBoss&&!e.boss&&e.hp>0&&Math.abs(e.x+e.w/2-s.x)<280){e.stun=Math.max(e.stun||0,25);e._shieldFacing=0;e._guardBreak=Math.max(e._guardBreak||0,45);if(e._campaign){e._campaign.active=Math.max(e._campaign.active||0,45);e._campaign.wind=0;}}
 g.fx?.emit?.(s.x,s.y-8,{color:'#deedbc',count:g.reduceMotion?4:16,size:5,up:4,life:28});return true;
}
export function trackDinoAir(g){
 if(!g.roomDef?.dinoChapter)return;const w=g.world1,p=g.player,foot=p.y+p.h;
 if(!p.grounded)w.dinoPeak=Math.min(w.dinoPeak??foot,foot);else w.dinoPeak=foot;
 if(w.dinoImpact?.t>0)w.dinoImpact.t--;
}
export function dinoChapterAbility(g,p,index){
 if(!g.roomDef?.dinoChapter||p?.id!=='dino'||index!==1||p.grounded)return;
 p.vy=Math.max(13,p.vy||0);p.vx*=.45;p.buffer=0;g.world1.dinoDives=(g.world1.dinoDives||0)+1;
 g.nums?.add?.(p.x+p.w/2,p.y-30,'↓ CAÍDA DE COLOSO','#e5f3bc',true);
}
export function drawDinoPlate(ctx,s,cam,done,t,reduce){
 const x=s.x-cam.x,y=s.y-cam.y;ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#547764';ctx.fillStyle=done?'#dae9b1':'#b9c4a4';ctx.beginPath();ctx.ellipse(x,y-6,65,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.strokeStyle=done?'#6a9463':'#768577';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<45;i++){const a=i*.23,r=1+i*.65,xx=x+Math.cos(a)*r,yy=y-8+Math.sin(a)*r*.27;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();
 ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#365849';ctx.fillText(done?'FÓSIL '+((s.order??s.id)+1)+' DESPIERTO ✓':'↓ FÓSIL '+((s.order??s.id)+1)+' · '+(s.dropHeight>=160?'CORNISA ALTA':s.dropHeight>=110?'SALTO ALTO':s.dropHeight>=70?'SALTO COMPLETO':'SALTA Y CAE'),x,y-48);
 if(!done){const bob=reduce?0:Math.sin(t*.06)*4;ctx.strokeStyle='#f4f1c9';ctx.beginPath();ctx.moveTo(x,y-112+bob);ctx.lineTo(x,y-76+bob);ctx.moveTo(x-9,y-87+bob);ctx.lineTo(x,y-76+bob);ctx.lineTo(x+9,y-87+bob);ctx.stroke();}ctx.restore();
}
export function drawDinoImpact(ctx,g,cam){
 const f=g.world1?.dinoImpact;if(!g.roomDef?.dinoChapter||!f?.t)return;ctx.save();ctx.globalAlpha=f.t/32;ctx.strokeStyle='#eff3c8';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x-cam.x,1131-cam.y,35+(32-f.t)*7,8+(32-f.t)*.4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
