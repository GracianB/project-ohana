// V700 · Pulso OHANA. Michi's rescued jellyfish grow REAL walkable coral.
// Station completion already persists in OHANA 636 saves: no extra rewards,
// progress keys or changes to the physical kits of the other nine heroes.
export const MICHI_PULSE_COLORS=Object.freeze(['#8bf9db','#a5eaff','#edaaff','#ffe2ad','#b4ffe7']);
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const isMichi=g=>g?.roomDef?.id==='w1-cat'&&g?.world1?.room==='w1-cat'&&g?.roomDef?.hero==='cat';
function doneJellies(g){
 if(!isMichi(g))return [];
 return (g.world1.stations||[]).filter(s=>s?.kind==='jelly'&&s.done&&finite(s.x)&&finite(s.y)&&Number.isInteger(s.id));
}
export function michiPulseSnapshot(g){
 const done=doneJellies(g);
 return {state:done.length?'resonant':'normal',level:done.length,total:5,
  ledges:(g?.platforms||[]).filter(p=>!!p?._ohanaPulse).length};
}
const overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&Math.abs(a.y-b.y)<22;
// The awakened jelly itself is a solid bridge (cat-chapter.js). The
// new ledges rise from that bridge, creating an OPTIONAL new path.
export function planMichiPulseLedges(g){
 const done=doneJellies(g),worldW=finite(g?.worldW)?g.worldW:14400;
 const base=(g?.platforms||[]).filter(p=>p&&!p._ohanaPulse),planned=[];
 for(const s of done)for(const [index,o] of [{x:95,y:-112,w:124},{x:244,y:-180,w:136}].entries()){
  const p={x:Math.round(s.x+o.x),y:Math.round(s.y+o.y),w:o.w,h:18,
   _ohanaPulse:'cat:'+s.id+':'+index,
   _ohanaPulseColor:MICHI_PULSE_COLORS[s.id%MICHI_PULSE_COLORS.length]};
  if(p.x<0||p.x+p.w>worldW||p.y<100||p.y+p.h>1130)continue;
  if([...base,...planned].some(q=>overlap(q,p)))continue;
  planned.push(p);
 }
 return planned;
}
export function syncMichiPulse(g){
 if(!isMichi(g)||!Array.isArray(g.platforms))return null;
 const w=g.world1,done=doneJellies(g),key=done.map(s=>s.id).sort((a,b)=>a-b).join(',');
 if(w._ohanaPulseKey!==key){
  const previous=w._ohanaPulseKey;
  const lastCount=Number.isInteger(w._ohanaPulseCount)?w._ohanaPulseCount:done.length;
  const fresh=planMichiPulseLedges(g);
  g.platforms=g.platforms.filter(p=>!p._ohanaPulse).concat(fresh);
  w._ohanaPulseKey=key;w._ohanaPulseCount=done.length;
  if(previous!==undefined&&done.length>lastCount){
   w._ohanaPulseFlash=g.reduceMotion?8:34;
   const last=done.at(-1),col=MICHI_PULSE_COLORS[last.id%5];
   g.fx?.emit?.(last.x,last.y,{color:col,count:g.reduceMotion?5:16,size:3,life:26,star:true});
   g.nums?.add?.(last.x,last.y-85,'PULSO OHANA · EL BOSQUE DESPIERTA',col,true);
  }
 }
 if(w._ohanaPulseFlash>0)w._ohanaPulseFlash--;
 return michiPulseSnapshot(g);
}
export function drawMichiPulse(ctx,g,cam,t=0,reduced=false){
 if(!isMichi(g))return false;
 const ledges=(g.platforms||[]).filter(p=>p._ohanaPulse);
 const w=g.viewW||1280,h=g.viewH||720;
 ctx.save();
 for(const p of ledges){
  const x=p.x-(cam?.x||0),y=p.y-(cam?.y||0);
  if(x>w+90||x+p.w<-90||y>h+90||y<-90)continue;
  const phase=reduced?0:Math.sin(t*.028+p.x*.031)*2.5,col=p._ohanaPulseColor||'#a6f9e7';
  ctx.globalAlpha=.20;ctx.fillStyle=col;ctx.fillRect(x-6,y-5,p.w+12,29);
  ctx.globalAlpha=.95;ctx.fillStyle='#244a5b';ctx.fillRect(x,y,p.w,p.h);
  ctx.fillStyle=col;ctx.fillRect(x,y,p.w,5);
  ctx.strokeStyle='#eaffef';ctx.lineWidth=1;ctx.globalAlpha=.75;
  ctx.beginPath();ctx.moveTo(x+6,y+4);ctx.lineTo(x+p.w-6,y+4);ctx.stroke();
  for(let i=0;i<5;i++){
   const fx=x+(i+.5)*p.w/5,fy=y-8-(i%2)*5+phase;
   ctx.globalAlpha=.52;ctx.fillStyle=col;ctx.beginPath();
   ctx.arc(fx,fy,1.5+(i%2),0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();return ledges.length>0;
}
