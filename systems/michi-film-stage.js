import {drawFamilyActor} from './family-actor.js';
import {drawSanctuaryLantern,drawMichiSanctuaryBackdrop} from '../worlds/michi-sanctuary-art.js';
import {drawGardenBench,drawGardenPassage} from '../worlds/michi-garden-props.js';
import {drawMichiMothGuardian} from '../worlds/michi-moth-guardian.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export const MICHI_FILM_FAMILY=Object.freeze(['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']);
const COLORS=['#e7b496','#91bcd2','#efd080','#d7a5c1','#aed2b3','#d69a83','#b6bad8','#e6c891','#cca69c','#b5add5'];
export function michiFilmFrame(shot,tick=0,reduced=false){
 const duration=Math.max(1,Number.isFinite(shot?.dur)?shot.dur:260),p=reduced?.68:clamp(tick/duration),q=ease(p);
 return {p,q,enter:reduced?1:ease(p/.20),leave:reduced?0:ease((p-.90)/.10),zoom:reduced?1:1+q*(shot?.close?.07:.025),pan:reduced?0:(q-.5)*.018,clock:reduced?0:p*duration,stage:shot?.staging||'first-light'};
}
const oval=(c,x,y,a,b,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
const line=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
function seed(i){const x=Math.sin(i*127.1+31)*43758.5;return x-Math.floor(x);}
function spark(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x+r*.15,y-r*.1,x+r*.7,y);c.quadraticCurveTo(x+r*.1,y+r*.15,x,y+r);c.quadraticCurveTo(x-r*.15,y+r*.1,x-r*.7,y);c.quadraticCurveTo(x-r*.1,y-r*.15,x,y-r);c.fill();}
function cat(c,s,x,y,height,clock,pose,reduced){drawFamilyActor(c,'cat',x,y,height*.64/60,clock,{form:s.form,pose},reduced);}
function guardian(c,x,y,height,clock,rest,reduced){c.save();c.translate(x,y);c.scale(height/150,height/150);drawMichiMothGuardian(c,{x:-40,y:-140,w:80,h:140,_astralCat:{phase:rest?'rest':'intro'}},{x:0,y:0},clock,reduced,drawSanctuaryLantern);c.restore();}
function thread(c,x,y,tx,ty,p,col){
 const end=clamp(p);line(c,col,1.3,()=>{c.moveTo(x,y);c.bezierCurveTo(x+(tx-x)*.22,y-45,x+(tx-x)*.76,ty+30,x+(tx-x)*end,y+(ty-y)*end);});
}
function family(c,s,f,W,H,foot,reduced){
 const compact=W<650,height=Math.min(compact?63:106,W*(compact?.15:.073));
 MICHI_FILM_FAMILY.forEach((id,i)=>{
  const enter=reduced?1:ease((f.p-i*.032)/.35),x=compact?W*(.12+i%5*.19):W*(.06+i*.098),y=compact?foot-(i<5?H*.17:0):foot;
  c.save();c.globalAlpha=enter;const px=x+(reduced?0:(1-enter)*(i%2?30:-30));
  drawFamilyActor(c,id,px,y,height*(id==='cat'?.64:1)/60,f.clock+i*8,{form:0,pose:f.p>.55?'victory':'idle'},reduced);
  if(f.p>.45)thread(c,px,y+5,W*.5,foot+22,ease((f.p-.45)/.4),COLORS[i]+'77');c.restore();
  oval(c,x,y+10,3.5,3.5,COLORS[i]);
 });
}
export function drawMichiFilmStage(c,g,s,f,W,H,reduced){
 const foot=H<500?Math.max(H*.60,H-132)-24:H<700?H*.62:H*.68,small=W<650,base=Math.min(H*.34,W*.40,210),clock=f.clock,stage=f.stage;
 const zoneId=stage.startsWith('boat')?'return':['watcher','open-lantern','release'].includes(stage)?'arena':stage==='family'?'canopy':'court';
 const zone=g.roomDef?.michiSanctuary?.zones?.find(z=>z.id===zoneId);
 const scene=zone?{...g,player:{...g.player,x:zone.x+zone.w*.4,y:zone.floor-24,w:24,h:24}}:g;
 const cam={x:zone?zone.x+zone.w*.4-W*.5:0,y:0};
 c.save();c.translate(W*.5,foot);c.scale(f.zoom,f.zoom);c.translate(-W*.5-W*f.pan,-foot);
 if(!drawMichiSanctuaryBackdrop(c,scene,cam,clock,W,H)){c.fillStyle='#26364f';c.fillRect(0,0,W,H);}
 c.fillStyle=stage.startsWith('boat')?'#384c65':'#23364d';c.fillRect(0,foot,W,H-foot);c.fillStyle='#9aa996';c.fillRect(0,foot,W,3);
 if(stage==='arrival'){
  drawGardenBench(c,W*.69,foot,clock,false);
  const x=W*(.10+ease(f.p/.66)*.52),moving=f.p<.68;
  cat(c,s,x,foot,base,clock,moving?([1,4].includes(s.form)?'glide':'run'):'idle',reduced);
  if(f.p>.6){c.globalAlpha=ease((f.p-.6)/.3);spark(c,W*.72,foot-32,5,'#f5d9aa');c.globalAlpha=1;}
 }else if(stage==='bench-close'){
  drawGardenBench(c,W*.70,foot,clock,true);cat(c,s,W*.40,foot,Math.min(base*1.3,W*.46),clock,f.p>.4&&f.p<.8?'cast':'idle',reduced);
  thread(c,W*.71,foot-35,W*.48,foot-base*.45,ease((f.p-.25)/.5),'#edc6ab');
  for(let i=0;i<6;i++){const q=clamp((f.p-.25)*1.8-i*.045);spark(c,W*(.71-q*.20),foot-36-Math.sin(q*Math.PI)*55,i%2?2:3,'#e3c1b5');}
 }else if(stage==='first-light'||stage==='seal'){
  const lit=stage==='seal'?5:Math.floor(f.p*5.9);
  for(let i=0;i<5;i++){const x=W*(.15+i*.175),y=foot-35-Math.sin(i*.7)*H*.12;drawSanctuaryLantern(c,x,y,i<lit,clock,small,reduced);if(i<lit)thread(c,x,y,W*.5,foot-base*.5,.8,'#efcf9d44');}
  cat(c,s,W*.5,foot,base,clock,f.p>.5?'victory':'idle',reduced);
 }else if(stage==='watcher'){
  cat(c,s,W*.27,foot,base*.82,clock,'idle',reduced);c.save();c.globalAlpha=.18+f.enter*.82;guardian(c,W*.72,foot,base*1.22,clock,false,reduced);c.restore();
  for(let i=0;i<12;i++){const x=W*(.63+seed(i)*.25),y=foot-H*(.12+seed(i+20)*.43);spark(c,x,y,1.3+i%3*.4,'#dbbc9b');}
 }else if(stage==='open-lantern'||stage==='release'){
  const victory=stage==='release',x=W*(.32+(victory?f.q*.10:0));guardian(c,W*.70,foot,base*1.10,clock,victory||f.p>.55,reduced);cat(c,s,x,foot,base*.95,clock,victory&&f.p>.5?'victory':f.p>.3?'cast':'idle',reduced);
  if(victory){const p=ease((f.p-.2)/.6),sx=W*.7,tx=W*.43,yy=foot-base*.44;thread(c,sx,yy,tx,yy+15,p,'#e8d4a8');oval(c,sx+(tx-sx)*p,yy-Math.sin(p*Math.PI)*40,6,8,'#f7e4bb');}
 }else if(stage==='voices'){
  cat(c,s,W*.5,foot,base,clock,'idle',reduced);
  for(let i=0;i<3;i++){const a=i*TAU/3+clock*.009,x=W*.5+Math.cos(a)*base*.65,y=foot-base*.65+Math.sin(a)*base*.2;drawSanctuaryLantern(c,x,y,true,clock,true,reduced);}
 }else if(stage==='constellation'){
  cat(c,s,W*.5,foot,base,clock,'cast',reduced);
  for(let i=0;i<100;i++){
   const a=i*2.399,spread=1-f.q*.55,x=W*.5+Math.cos(a+clock*.002)*W*(.06+seed(i)*.42)*spread,y=foot-base*.55+Math.sin(a)*H*.27*spread;
   c.globalAlpha=.25+seed(i+40)*.55;spark(c,x,y,i%10?1.3:2.8,COLORS[Math.floor(i/10)]);
  }c.globalAlpha=1;
 }else if(stage==='family')family(c,s,f,W,H,foot,reduced);
 else if(stage==='home-path'){
  cat(c,s,W*.28,foot,base,clock,'idle',reduced);
  for(let i=0;i<100;i++){const u=i/99,x=W*(.2+u*.65),y=foot+4-Math.sin(u*Math.PI*.65)*H*.27;const lit=reduced?1:clamp((f.p-u*.4)*3);c.globalAlpha=lit*.75;spark(c,x,y,i%10?1.4:3,COLORS[Math.floor(i/10)]);}c.globalAlpha=1;
  drawSanctuaryLantern(c,W*.83,foot-H*.24,true,clock,small,reduced);
 }else if(stage.startsWith('boat')){
  const depart=stage==='boat-home',board=stage!=='boat-wait',bx=W*(depart?.58+f.q*.27:.72),by=foot+8+(reduced?0:Math.sin(clock*.025)*2),boatScale=Math.min(2,W/230,H/280);
  if(!board){cat(c,s,W*(.15+f.q*.26),foot,base*.88,clock,f.p<.8?'run':'idle',reduced);}
  c.save();c.translate(bx,by);c.scale(boatScale,boatScale);drawGardenPassage(c,{kind:'boat'},0,0,true,clock);
  const h=52;if(board)drawFamilyActor(c,'cat',-21,-8,h*.64/60,clock,{form:s.form,pose:depart?'victory':'idle'},reduced);
  drawFamilyActor(c,'cuerno',22,-8,h*.8/60,clock,{form:0,pose:depart?'victory':'idle'},reduced);c.restore();
  for(let i=0;i<9;i++){const xx=bx-i*22;line(c,'#c9d7bd55',1,()=>{c.moveTo(xx,by+22+i%2*5);c.lineTo(xx-12-i*2,by+22+i%2*5);});}
  if(depart){c.globalAlpha=f.leave*.45;c.fillStyle='#f4ddba';c.fillRect(0,0,W,H);c.globalAlpha=1;}
 }
 c.restore();
 // A quiet iris at each cut, never a flash or a time-dependent reduced-motion overlay.
 if(!reduced){c.fillStyle='rgba(10,16,32,'+((1-f.enter)*.8+f.leave*.65)+')';c.fillRect(0,0,W,H);}
}
