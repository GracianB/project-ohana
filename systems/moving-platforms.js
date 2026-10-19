export function movePlatform(g,platform,motion){
 const t=(Number(g.t)||0)-(motion.start||0),period=Math.max(120,Number(motion.period)||360);
 const wave=(1-Math.cos(t/period*Math.PI*2+(motion.phase||0)))/2;
 const oldX=platform.x,oldY=platform.y,p=g.player;
 const rider=p&&!p.dead&&p.grounded&&!p._dropWasHeld&&p.x+p.w>oldX+1&&p.x<oldX+platform.w-1&&Math.abs(p.y+p.h-oldY)<4;
 platform.x=motion.x+(motion.axis==='x'?wave*motion.span:0);
 platform.y=motion.y-(motion.axis==='y'?wave*motion.span:0);
 if(rider){p.x+=platform.x-oldX;p.y+=platform.y-oldY;}
 return {dx:platform.x-oldX,dy:platform.y-oldY,rider:!!rider};
}
export function drawPlatformRail(ctx,p,m,cam){
 ctx.save();ctx.strokeStyle='#d8dfb85c';ctx.lineWidth=2;
 const x=m.x+p.w/2-cam.x,y=m.y+10-cam.y;
 ctx.fillStyle='#e5e0b4';for(const side of [0,1]){const px=x+(m.axis==='x'?side*m.span:0),py=y-(m.axis==='y'?side*m.span:0);ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();}ctx.restore();
}
