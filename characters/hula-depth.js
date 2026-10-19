// Draw the far semicircle before the body, the near semicircle afterwards.
export function drawHulaDepth(ctx,p,H,t,front=false,reduceMotion=false){
 const age=t-(p._cast?.t??-9999);
 if(p.id!=='kilo'||p.dead||p._cast?.id!=='hula'||age<0||age>=96)return;
 const time=reduceMotion?0:age, sway=Math.sin(time*.16)*H*.035;
 ctx.save();ctx.lineWidth=Math.max(2,H*.028);ctx.strokeStyle=front?'#ffcf75':'#b67b83';
 ctx.beginPath();ctx.ellipse(sway,-H*.39,H*.43,H*.12,Math.sin(time*.08)*.12,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();ctx.restore();
}
