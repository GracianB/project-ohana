import chispa from '../../characters/art/chispa.js';
import {R} from '../../characters/rig.js';
import {drawChispaCloud} from '../chispa-effects.js';
const unit=v=>Math.max(0,Math.min(1,v)),TAU=Math.PI*2;
const STORIES=['Una lucecita. Una nueva amistad.','Su cola aprende a guardar un pequeño trueno.','La nube ya sabe seguir sus travesuras.','Toda una tempestad. La misma cara de inocente.'];
function actor(ctx,form,x,foot,size,t,state,reduced,flourish=0){
 ctx.save();ctx.translate(x,foot);ctx.scale(size/100,size/100);
 chispa.draw(ctx,{form,state,t:reduced?40:t*60,phase:t*7,look:{x:.5,y:0},reduceMotion:reduced,castSlot:2,flourish,flourishN:0},R);ctx.restore();
}
function words(ctx,text,x,y,width,size){
 ctx.font=`500 ${size}px Outfit,sans-serif`;let line='',row=0;
 for(const word of text.split(' ')){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){ctx.fillText(line,x,y+row++*(size+7));line=word;}else line=next;}
 ctx.fillText(line,x,y+row*(size+7));
}
export function drawChispaEvolution(ctx,w,h,s,reduced=false){
 const t=s.t,k=unit((t-1.65)/.65),settled=t>=2.6,foot=h*.64,target=s.target*1.05;
 const motion=reduced?0:t;
 ctx.save();
 try{
  ctx.fillStyle='#152c40';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#223e50';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,h*.65);ctx.bezierCurveTo(w*.25,h*.5,w*.7,h*.83,w,h*.6);ctx.lineTo(w,h);ctx.fill();
  ctx.fillStyle='#2c50574d';ctx.beginPath();ctx.ellipse(w*.5,h*.65,w*.6,h*.21,-.1,0,TAU);ctx.fill();
  // A tiny runaway spark teases the old form, then becomes its cloud friend.
  const sparkX=w*.5+(reduced?0:Math.sin(Math.min(t,1.65)*4)*target*.29),sparkY=foot-target*(1.02+(reduced?0:Math.sin(t*3)*.08));
  if(t<2.3){
   ctx.save();ctx.globalAlpha*=1-k;ctx.fillStyle='#fff1b3';ctx.beginPath();ctx.ellipse(sparkX,sparkY,6,8,.3,0,TAU);ctx.fill();
   ctx.strokeStyle='#d5e8c4';ctx.lineWidth=2;for(let i=0;i<4;i++){const a=i*TAU/4+motion;ctx.beginPath();ctx.moveTo(sparkX+Math.cos(a)*12,sparkY+Math.sin(a)*12);ctx.lineTo(sparkX+Math.cos(a)*17,sparkY+Math.sin(a)*17);ctx.stroke();}ctx.restore();
  }
  const bounce=reduced?0:t<1.65?Math.sin(unit((t-1.05)/.6)*Math.PI)*target*.13:(1-k)*target*.09;
  ctx.fillStyle='#071e2c66';ctx.beginPath();ctx.ellipse(s.cx,foot+6,target*.32,target*.04,0,0,TAU);ctx.fill();
  ctx.save();ctx.globalAlpha*=1-k;actor(ctx,s.form-1,s.cx,foot-bounce,target*.78,t,t<1.1?'curious':'cast',reduced,t<1?.3:0);ctx.restore();
  ctx.save();ctx.globalAlpha*=k;actor(ctx,s.form,s.cx,foot,target,t,settled?'victory':'jump',reduced);ctx.restore();
  const cloudK=unit((t-1.65)/.75),cloudX=s.cx+target*.6,cloudY=foot-target*.75;
  if(cloudK>0){ctx.save();ctx.globalAlpha*=cloudK;drawChispaCloud(ctx,cloudX,cloudY,.28+cloudK*.18,settled?0:1,reduced?40:t*60,reduced);ctx.restore();}
  if(k>0&&k<1){ctx.strokeStyle='#ffe7a8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.cx-target*.2,foot-target*.5);ctx.lineTo(s.cx-target*.35,foot-target*.8);ctx.lineTo(s.cx-target*.12,foot-target*.75);ctx.lineTo(cloudX,cloudY);ctx.stroke();}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#b6d7cc';ctx.font='600 11px Outfit,sans-serif';ctx.fillText('UNA CHISPA LO CAMBIA TODO',s.cx,h*.13);
  ctx.fillStyle='#fff0c9';ctx.font=`600 ${Math.min(38,w*.072)}px Fredoka,sans-serif`;ctx.fillText(k>.5?s.title:s.previous,s.cx,h*.21,w-32);
  ctx.font='500 12px Outfit,sans-serif';ctx.fillStyle='#e5cc92';ctx.fillText(`Forma ${s.form} → ${s.form+1} de 5`,s.cx,h*.28);
  ctx.fillStyle='#e0e9da';words(ctx,t>=2.3?STORIES[s.form-1]:'¿Y si solo le doy un toquecito…?',s.cx,h*.79,Math.min(490,w-42),Math.min(16,w*.04));
  const gap=Math.min(36,w*.075);
  for(let i=0;i<5;i++){ctx.fillStyle=i<=s.form?'#e8cd87':'#4b6370';ctx.beginPath();ctx.arc(s.cx+(i-2)*gap,h*.71,i===s.form?5:3,0,TAU);ctx.fill();}
 }finally{ctx.restore();}
 return s;
}
