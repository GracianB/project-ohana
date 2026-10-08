// OHANA V94 · The Queen announces intention, not just a red flash.
// Pure presentation: cannot modify boss AI, RNG, hitboxes, attack damage or cooldowns.
export const QUEEN_V94_ATTACKS = Object.freeze({
  charge:Object.freeze({label:"EMBESTIDA",hint:"SALTA",color:"#ffae8f"}),
  slam:Object.freeze({label:"IMPACTO",hint:"ALÉJATE",color:"#ffe3a0"}),
  swoop:Object.freeze({label:"PICADO",hint:"CAMBIA DE LADO",color:"#a4edff"}),
  spit:Object.freeze({label:"SALVA",hint:"ESQUIVA",color:"#f9c3f4"}),
});
const TAU=Math.PI*2;
const bound=(v,lo,hi)=>Math.max(lo,Math.min(hi,
  typeof v==="number"&&Number.isFinite(v)?v:lo));
export function bossWindupProgress(boss={}){
 if(!boss.telegraph||boss.dying||boss.introT>0)return 0;
 if(boss.mode==="chain")return bound(1-bound(boss.chainDelay,0,3)/3,0,1);
 return bound(boss.wind/Math.max(1,bound(boss.windMax,1,300)),0,1);
}
export function bossAttackCue(kind){
 return QUEEN_V94_ATTACKS[kind]||null;
}
// Glyph + progress clock outside Queen's mirrored character transform. This
// leaves labels upright when she changes direction mid-windup.
export function drawQueenV94Warning(ctx,boss={}){
 const cue=bossAttackCue(boss.teleKind);
 if(!cue||!boss.telegraph||boss.dying||boss.introT>0)return;
 const k=bossWindupProgress(boss);
 const r=25,y=-128;
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
 // High-contrast dark plate stays legible over volcano lava and pastel worlds.
 ctx.fillStyle="rgba(15,9,24,.78)";
 ctx.beginPath();ctx.arc(0,y,r+9,0,TAU);ctx.fill();
 ctx.strokeStyle="rgba(255,255,255,.44)";ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,y,r,-Math.PI/2,-Math.PI/2+TAU);ctx.stroke();
 ctx.strokeStyle=cue.color;ctx.lineWidth=4.2;
 ctx.beginPath();ctx.arc(0,y,r,-Math.PI/2,-Math.PI/2+TAU*Math.max(.015,k));ctx.stroke();
 ctx.strokeStyle="#fff9ee";ctx.lineWidth=2.6;
 if(boss.teleKind==="charge"){
   ctx.beginPath();ctx.moveTo(-11,y-8);ctx.lineTo(1,y);
   ctx.lineTo(-11,y+8);ctx.moveTo(0,y-8);ctx.lineTo(12,y);
   ctx.lineTo(0,y+8);ctx.stroke();
 }else if(boss.teleKind==="slam"){
   ctx.beginPath();ctx.moveTo(0,y-12);ctx.lineTo(0,y+9);
   ctx.moveTo(-8,y+2);ctx.lineTo(0,y+10);ctx.lineTo(8,y+2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(-12,y+13);ctx.lineTo(12,y+13);ctx.stroke();
 }else if(boss.teleKind==="swoop"){
   ctx.beginPath();ctx.moveTo(-12,y-6);
   ctx.quadraticCurveTo(4,y-15,10,y+7);
   ctx.moveTo(2,y+2);ctx.lineTo(10,y+8);ctx.lineTo(13,y-4);ctx.stroke();
 }else{
   for(let i=-1;i<=1;i++){
     ctx.beginPath();ctx.moveTo(-10,y+i*7);
     ctx.lineTo(11,y+i*7+i*3);ctx.stroke();
   }
 }
 // Stable labels, no oscillation, strobes, random particles or CPU-heavy text glow.
 ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.font="800 11px Outfit, system-ui, sans-serif";
 ctx.lineWidth=3.5;ctx.strokeStyle="rgba(12,9,21,.95)";
 ctx.strokeText(cue.label,0,y-r-21);
 ctx.fillStyle="#fff8e5";ctx.fillText(cue.label,0,y-r-21);
 ctx.font="700 9px Outfit, system-ui, sans-serif";
 ctx.strokeText(cue.hint,0,y+r+17);ctx.fillText(cue.hint,0,y+r+17);
 ctx.restore();
}
