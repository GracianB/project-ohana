// OHANA V94 · Small readable enemy-intent markers. Visual only.
// No RNG, game-state mutation, expensive glows or flashing under reduced motion.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const TAU=Math.PI*2;
const cx=e=>(Number(e?.x)||0)+(Number(e?.w)||0)*.5;
const cy=e=>(Number(e?.y)||0)+(Number(e?.h)||0)*.5;
export const MAX_ENCOUNTER_MARKERS=3;
export function selectEncounterSignals(enemies=[],player=null,cam={},view={},max=MAX_ENCOUNTER_MARKERS){
 if(!player||player.dead)return [];
 const w=Number(view.width)||1280,h=Number(view.height)||720;
 const px=cx(player),py=cy(player),chosen=[];
 for(const e of enemies){
  if(!e||e.boss||e.dying||!(Number(e.hp)>0)||!(e.telegraph||e.aiAttackPermit===true))continue;
  const x=cx(e)-(Number(cam.x)||0),y=(Number(e.y)||0)-(Number(cam.y)||0);
  if(x<-28||x>w+28||y<-70||y>h+30)continue;
  const dx=cx(e)-px,dy=cy(e)-py,d2=dx*dx+dy*dy;
  if(d2>560*560)continue;
  const priority=(e.telegraph?1000000:0)+clamp(e.aiThreat,0,1)*15000-d2*.02;
  const selected={enemy:e,priority};
  let at=chosen.findIndex(other=>selected.priority>other.priority);
  if(at<0)at=chosen.length;
  if(at<max)chosen.splice(at,0,selected);
  if(chosen.length>max)chosen.pop();
 }
 return chosen;
}
export function drawEncounterSignals(ctx,enemies,player,cam,t,view,reduce=false){
 if(!ctx)return 0;
 const selected=selectEncounterSignals(enemies,player,cam,view);
 for(const {enemy:e} of selected){
  const x=cx(e)-(Number(cam?.x)||0),y=(Number(e.y)||0)-(Number(cam?.y)||0)-15;
  const warning=!!e.telegraph;
  const pulse=reduce?1:(.86+.14*Math.sin((Number(t)||0)*.09));
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=(warning?.94:.68)*pulse;
  ctx.fillStyle="rgba(22,27,35,.82)";ctx.strokeStyle=warning?"#ffcb77":(e.aiEcoColor||"#c3ecff");
  ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle=warning?"#fff2ce":"#d5f0ff";ctx.lineWidth=2.2;ctx.lineCap="round";
  ctx.beginPath();
  if(warning){ctx.moveTo(0,-6);ctx.lineTo(0,1);ctx.moveTo(0,5);ctx.lineTo(0,6);}
  else {ctx.moveTo(-5,2);ctx.lineTo(0,-5);ctx.lineTo(5,2);}
  ctx.stroke();ctx.restore();
 }
 return selected.length;
}
