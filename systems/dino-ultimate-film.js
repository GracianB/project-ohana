// OHANA · Dino V77: five-act, canvas-only cinematic (no sprites, no randomness).
// Deterministic stage data is shared by browser captures and runtime.
const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const step=(x,a,b)=>clamp((x-a)/(b-a));
const ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
const alpha=(ctx,a,fn)=>{ctx.save();ctx.globalAlpha*=clamp(a);fn();ctx.restore();};

export const DINO_COLOSSUS_ACTS=Object.freeze([
 Object.freeze({name:"heartbeat",start:0,end:.18,caption:"UN LATIDO BAJO LA TIERRA"}),
 Object.freeze({name:"awaken",start:.18,end:.38,caption:"DESPIERTA EL COLOSO"}),
 Object.freeze({name:"rupture",start:.38,end:.59,caption:"EL MUNDO ESCUCHA"}),
 Object.freeze({name:"comets",start:.59,end:.83,caption:"COMETAS FÓSILES"}),
 Object.freeze({name:"heart",start:.83,end:1,caption:"EL MÁS GRANDE TAMBIÉN ABRAZA"}),
]);
export function dinoColossusStage(value){
 const k=clamp(value);
 const act=DINO_COLOSSUS_ACTS.find(a=>k<a.end)||DINO_COLOSSUS_ACTS[4];
 return Object.freeze({name:act.name,progress:step(k,act.start,act.end),caption:act.caption});
}
function ellipse(ctx,x,y,rx,ry,fill,opacity=1,stroke){
 ctx.save();ctx.globalAlpha*=opacity;
 ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
 if(fill){ctx.fillStyle=fill;ctx.fill();}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
 ctx.restore();
}
function ring(ctx,x,y,r,k,col,width=3){
 const p=clamp(k);
 ctx.save();ctx.globalAlpha=(1-p)*.74;ctx.strokeStyle=col;ctx.lineWidth=width*(1-p)+1;
 ctx.beginPath();ctx.ellipse(x,y,r*(.22+p*.88),r*(.10+p*.43),0,0,TAU);ctx.stroke();
 ctx.restore();
}
function fossil(ctx,x,y,r,rot,col,opacity){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha*=clamp(opacity);
 ctx.fillStyle="#4a6250";ctx.strokeStyle=col;ctx.lineWidth=2.5;
 ctx.beginPath();
 for(let i=0;i<7;i++){const a=i*TAU/7,rr=r*(.86+(i%3)*.08);
  if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
  else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
 }
 ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle="#fff3b3";ctx.lineWidth=1.6;ctx.beginPath();
 ctx.moveTo(-r*.40,-r*.25);ctx.lineTo(-r*.02,r*.18);ctx.lineTo(r*.35,-r*.03);ctx.stroke();
 ctx.restore();
}
function heart(ctx,x,y,r,col,opacity){
 ctx.save();ctx.globalAlpha*=clamp(opacity);ctx.translate(x,y);ctx.scale(r/30,r/30);
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,19);
 ctx.bezierCurveTo(-29,-3,-22,-21,-8,-17);
 ctx.bezierCurveTo(0,-14,0,-9,0,-8);
 ctx.bezierCurveTo(0,-9,0,-14,8,-17);
 ctx.bezierCurveTo(22,-21,29,-3,0,19);ctx.closePath();ctx.fill();
 ctx.restore();
}

export function drawDinoColossusFilm(ctx,k,t,x,y,size,color,reduceMotion=false){
 const p=clamp(k),s=size,ground=y+s*.47,quiet=!!reduceMotion;
 ctx.save();
 // ACT I: a tiny heartbeat from the earth, then Dino's glowing gaze.
 const beat=step(p,.02,.18);
 if(p<.27){
   ellipse(ctx,x,ground,s*(.05+.18*beat),s*(.018+.04*beat),"#d2ffa6",.11+.22*(1-step(p,.18,.28)));
   if(beat>.08)ring(ctx,x,ground,s*.33,beat,"#e8ffbd",2);
   const eyes=ease(step(p,.08,.19))*(1-step(p,.22,.35));
   for(const dir of [-1,1]){
     ellipse(ctx,x+dir*s*.10,y-s*.18,s*.037,s*.023,"#fff8c7",eyes);
     ellipse(ctx,x+dir*s*.105,y-s*.17,s*.009,s*.013,"#324738",eyes);
   }
 }
 // ACT II: stone ribs and giant protective halo rise around the actor.
 const rise=ease(step(p,.18,.40));
 if(rise>0){
   alpha(ctx,Math.min(rise,1-step(p,.78,.94)*.7),()=>{
     ctx.strokeStyle="#c6f89d";ctx.lineWidth=Math.max(2,s*.012);
     for(let i=0;i<5;i++){
       const u=i/4,dir=i%2?1:-1,xx=x+dir*s*(.22+.17*u);
       const hh=s*(.14+.27*(1-u))*rise;
       ctx.beginPath();ctx.moveTo(xx,ground);ctx.quadraticCurveTo(xx+dir*s*.1,ground-hh*.65,xx,ground-hh);ctx.stroke();
       ellipse(ctx,xx,ground-hh,s*.012,s*.016,i%2?"#fff1b6":"#b6ffab",.8);
     }
     ring(ctx,x,ground,s*.68,step(p,.20,.48),"#f4ffc4",3.1);
   });
 }
 // ACT III: two physical-looking fractures, not full-screen flashes.
 const fracture=step(p,.38,.62);
 if(fracture>0){
   for(const side of [-1,1]){
     alpha(ctx,.7*(1-step(p,.72,.91)),()=>{
       ctx.strokeStyle=side<0?"#a7eb98":"#ffe2a0";
       ctx.lineWidth=2.5+fracture*1.3;ctx.lineJoin="round";
       ctx.beginPath();ctx.moveTo(x,ground);
       for(let j=1;j<=6;j++){
         const u=j/6,spread=side*s*.85*fracture*u;
         ctx.lineTo(x+spread,ground+(j%2?4:-4)*fracture+s*.02*u);
       }
       ctx.stroke();
     });
   }
   ring(ctx,x,ground,s*.9,fracture,"#d6ff9a",4);
 }
 // ACT IV: five rock comets with staggered entrances, bounded on phones.
 const sky=ease(step(p,.52,.84));
 if(sky>0){
   for(let i=0;i<(quiet?3:5);i++){
     const progress=step(p,.55+i*.041,.78+i*.025);
     if(progress<=0||progress>=1)continue;
     const drift=(i-2)*s*.32;
     const xx=x+drift+Math.sin(i*2.37)*s*.07;
     const yy=y-s*.98+progress*s*1.43;
     ctx.save();ctx.globalAlpha=.65*(1-step(progress,.72,1));
     ctx.strokeStyle=i%2?"#f6dfa0":"#bbffa1";ctx.lineWidth=4;ctx.lineCap="round";
     ctx.beginPath();ctx.moveTo(xx-s*.13,yy-s*.22);ctx.lineTo(xx,yy);ctx.stroke();
     ctx.restore();
     fossil(ctx,xx,yy,Math.max(6,s*(.034+i*.002)),t*.28+i, i%2?"#fff0af":"#baffaa",.94);
   }
   const crown=step(p,.61,.83);
   ring(ctx,x,y-s*.19,s*.62,crown,"#e7ffae",3);
 }
 // ACT V: the joke lands with a tiny star and resolves into a heart.
 const ending=ease(step(p,.80,.94));
 if(ending>0){
   const bop=step(p,.79,.875);
   const starX=x+s*.10, starY=y-s*(.86-.58*bop);
   alpha(ctx,(1-step(p,.90,.985))*.86,()=>{
     ctx.fillStyle="#fff3b5";
     ctx.beginPath();
     for(let i=0;i<10;i++){
       const a=-Math.PI/2+i*TAU/10,rr=s*(i%2?.024:.045);
       const sx=starX+Math.cos(a)*rr,sy=starY+Math.sin(a)*rr;
       if(i===0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);
     }
     ctx.closePath();ctx.fill();
   });
   const heartSize=s*(.14+.10*Math.sin(Math.PI*ending));
   heart(ctx,x,y-s*.44,heartSize,"#fff2b7",ending*(1-step(p,.95,1)));
   ring(ctx,x,ground,s*.95,step(p,.84,1),"#d7ffa3",3.5);
 }
 ctx.restore();
}
