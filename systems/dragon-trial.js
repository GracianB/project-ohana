// OHANA V87 · Three Dragon Embers.
// Optional single-player/coop-safe collection: no locked door, enemy stats,
// network protocol changes or cross-player authoritative progression.
export const DRAGON_EMBERS=Object.freeze([
 Object.freeze({x:290,y:913,title:"ALIENTO",color:"#ffbe7e"}),
 Object.freeze({x:1580,y:937,title:"BATIDA",color:"#ff8a65"}),
 Object.freeze({x:2010,y:572,title:"ASCENSO",color:"#ffe29b"}),
]);
const TAU=Math.PI*2;
const finite=n=>Number.isFinite(Number(n))?Number(n):0;
export function newDragonTrial(){
 return {lit:[false,false,false],count:0,completed:false};
}
export function dragonTrialSnapshot(state){
 const lit=Array.isArray(state?.lit)?state.lit.slice(0,3):[false,false,false];
 return Object.freeze({lit:lit.map(Boolean),count:lit.filter(Boolean).length,completed:lit.every(Boolean)});
}
export function updateDragonTrial(game){
 if(!game||game.roomId!=="volcano"||!game.player||game.player.dead)return null;
 const state=game.dragonTrial||(game.dragonTrial=newDragonTrial());
 const p=game.player;
 const cx=finite(p.x)+finite(p.w)*.5,cy=finite(p.y)+finite(p.h)*.55;
 for(let i=0;i<DRAGON_EMBERS.length;i++){
  const ember=DRAGON_EMBERS[i];
  if(state.lit[i]||Math.hypot(cx-ember.x,cy-ember.y)>68)continue;
  state.lit[i]=true;
  state.count=state.lit.filter(Boolean).length;
  state.completed=state.count===DRAGON_EMBERS.length;
  return Object.freeze({index:i,count:state.count,complete:state.completed,ember});
 }
 return null;
}
export function drawDragonTrial(ctx,game,cam,t=0,reduce=false){
 if(!ctx||game?.roomId!=="volcano")return;
 const state=game.dragonTrial||newDragonTrial();
 const ox=finite(cam?.x),oy=finite(cam?.y);
 ctx.save();
 // The dragon's ancient silhouette is carved into the back wall.
 const cx=1115-ox,cy=595-oy;
 ctx.globalAlpha=.14;ctx.strokeStyle="#ffc078";ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(cx,cy+60);
 ctx.bezierCurveTo(cx-80,cy-20,cx-150,cy-175,cx-380,cy-182);
 ctx.bezierCurveTo(cx-290,cy-30,cx-200,cy+12,cx-75,cy+76);
 ctx.moveTo(cx,cy+60);
 ctx.bezierCurveTo(cx+80,cy-20,cx+150,cy-175,cx+380,cy-182);
 ctx.bezierCurveTo(cx+290,cy-30,cx+200,cy+12,cx+75,cy+76);
 ctx.stroke();
 ctx.beginPath();ctx.moveTo(cx-24,cy+62);
 ctx.quadraticCurveTo(cx,cy-42,cx+24,cy+62);
 ctx.moveTo(cx-6,cy+32);ctx.lineTo(cx,cy-62);ctx.lineTo(cx+6,cy+32);
 ctx.stroke();
 ctx.globalAlpha=1;
 for(let i=0;i<DRAGON_EMBERS.length;i++){
  const s=DRAGON_EMBERS[i],x=s.x-ox,y=s.y-oy;
  if(x< -110||x>2600||y< -180||y>1550)continue;
  const lit=!!state.lit[i],pulse=reduce?0.5:.5+.5*Math.sin(t*.07+i*2);
  ctx.save();ctx.translate(x,y);
  const glow=ctx.createRadialGradient(0,0,2,0,0,68);
  glow.addColorStop(0,lit?"rgba(255,249,210,.54)":"rgba(255,132,66,.20)");
  glow.addColorStop(1,"rgba(255,120,50,0)");
  ctx.fillStyle=glow;ctx.fillRect(-68,-68,136,136);
  ctx.strokeStyle=lit?"#ffe6ac":"#ffa66d";
  ctx.globalAlpha=lit?.90:.48+.18*pulse;
  ctx.lineWidth=lit?4:2;
  ctx.beginPath();ctx.moveTo(0,-28);
  ctx.bezierCurveTo(-15,-16,-19,-3,0,20);
  ctx.bezierCurveTo(16,-5,14,-18,0,-28);
  ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(9,-2);ctx.lineTo(0,12);ctx.lineTo(-9,-2);ctx.closePath();
  if(lit){ctx.fillStyle=s.color;ctx.fill();}else ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle="#fff1d5";
  ctx.font="800 12px Outfit, sans-serif";ctx.textAlign="center";
  ctx.fillText(lit?"✦ "+s.title:s.title,0,42);
  ctx.restore();
 }
 ctx.restore();
}
