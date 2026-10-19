// Draw the far semicircle before the body, the near semicircle afterwards.
export function drawHulaDepth(ctx,p,H,t,front=false,reduceMotion=false){
 const age=t-(p._cast?.t??-9999);
 const duet=p._kiloDuetT>0&&p._kiloDuetAge>=30&&p._kiloDuetAge<108;
 const powerAge=t-(p._powerPerformance?.start??-9999),finale=p._powerPerformance?.index===5&&powerAge>=0&&powerAge<120;
 const aloha=p._cast?.id==='ohana'&&age>=0&&age<96;
 if(p.id!=='kilo'||p.dead||(!duet&&!finale&&!aloha&&(p._cast?.id!=='hula'||age<0||age>=96)))return;
 const time=reduceMotion?0:duet?p._kiloDuetAge:finale?powerAge:age, sway=Math.sin(time*.16)*H*.035;
 ctx.save();ctx.lineWidth=Math.max(2,H*.028);ctx.strokeStyle=front?(aloha||finale?'#fff0b0':'#ffcf75'):'#b67b83';
 ctx.beginPath();ctx.ellipse(sway,-H*.39,H*(aloha?.56:.43),H*.12,Math.sin(time*.08)*.12,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();ctx.restore();
}
