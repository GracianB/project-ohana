// Baby Michicornio: a continuous kitten silhouette with soft paws and a horn bud.
// Its coat and crescent grow into the fairy, medusa and moon-hare lineage.
const TAU=Math.PI*2,INK='#493b69',FUR='#e8dcf8',SHADE='#bca6d8',LIGHT='#fff8ef',ROSE='#edb7d8';
const n=(v,d=0)=>Number.isFinite(v)?v:d;
const unit=v=>Math.max(0,Math.min(1,n(v)));
function path(c,col,fn,w=1.5){c.beginPath();fn();c.closePath();c.fillStyle=col;c.fill();if(w){c.strokeStyle=INK;c.lineWidth=w;c.stroke();}}
function stroke(c,col,w,fn){c.beginPath();fn();c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function oval(c,x,y,rx,ry,col,rot=0,w=0){path(c,col,()=>c.ellipse(x,y,rx,ry,rot,0,TAU),w);}
function paw(c,x,y,hipX,hipY,far){
 path(c,far?SHADE:FUR,()=>{c.moveTo(hipX-4,hipY);c.quadraticCurveTo(hipX-9,hipY+12,x-5,y-5);c.bezierCurveTo(x-13,y-4,x-12,y+2,x-4,y+2);c.lineTo(x+8,y+2);c.bezierCurveTo(x+16,y+1,x+12,y-5,x+4,y-6);c.quadraticCurveTo(hipX+7,hipY+9,hipX+5,hipY);},1.2);
 if(!far){stroke(c,'#fff7f8',1.5,()=>{c.moveTo(x-7,y-3);c.quadraticCurveTo(x,y-6,x+6,y-3);});for(const dx of[3,7])stroke(c,'#a58bc4',.65,()=>{c.moveTo(x+dx,y-2);c.lineTo(x+dx,y+1);});}
}
export function drawMoonKitten(c,p={}){
 const reduced=!!p.reduceMotion,state=p.state||'idle',dead=state==='dead',t=reduced||dead?0:n(p.t),phase=reduced?0:n(p.phase,t*.27),run=state==='run',jump=state==='jump',fall=state==='fall',air=jump||fall||state==='glide',hurt=state==='hurt',victory=state==='victory';
 const k=state==='attack'?Math.sin(Math.PI*(reduced?.5:unit(n(p.atk,.5)))):0,spell=state==='cast'?Math.sin(Math.PI*(reduced?.5:unit(n(p.cast,.5)))):0;
 const step=run?Math.sin(phase):0,follow=run?Math.sin(phase-.65):0,breath=reduced?0:Math.sin(t*.07),stage=p.michiWelcome||{},inspect=unit(stage.inspect),groom=unit(stage.groom);
 const blink=dead||hurt||!reduced&&(t+19)%187<5,look=Math.max(-1,Math.min(1,n(p.look?.x,1))),headTilt=run?-follow*.045:hurt?-.14:victory?-.08:breath*.025+inspect*.09;
 c.save();c.lineCap='round';c.lineJoin='round';c.translate(k*2,run?-Math.max(0,step)*3.5:breath*.4);if(dead){c.translate(-1,-10);c.rotate(.5);}
 // The tail is one tapered plume rooted in the hip, with a soft moon-white tip.
 const lag=reduced?0:Math.sin(t*.06)*3-follow*4;
 path(c,SHADE,()=>{c.moveTo(-17,-18);c.bezierCurveTo(-44,-16,-47,-39+lag,-34,-40+lag);c.bezierCurveTo(-26,-40+lag,-25,-33+lag,-32,-31+lag);c.bezierCurveTo(-37,-34+lag,-33,-20,-17,-23);},1.35);
 path(c,LIGHT,()=>{c.moveTo(-37,-39+lag);c.bezierCurveTo(-28,-44+lag,-23,-33+lag,-32,-31+lag);c.quadraticCurveTo(-33,-37+lag,-37,-39+lag);},0);
 const backY=air?-9:-1-Math.max(0,Math.cos(phase))*run*5,frontY=jump?-15:fall?1:victory?-19:-1-Math.max(0,Math.cos(phase+.8))*run*4;
 paw(c,-13-step*5,backY,-17,-18,true);paw(c,14+step*5,frontY-1,10,-24,true);
 // Back, haunch, belly and chest meet without a row of ellipse-shaped joints.
 path(c,FUR,()=>{c.moveTo(-22,-15);c.bezierCurveTo(-30,-36,-10,-43,9,-31);c.bezierCurveTo(23,-34,27,-17,16,-9);c.bezierCurveTo(5,-1,-17,-3,-22,-15);});
 path(c,SHADE,()=>{c.moveTo(-23,-17);c.quadraticCurveTo(-9,-4,14,-11);c.quadraticCurveTo(3,2,-14,-6);c.quadraticCurveTo(-22,-9,-23,-17);},0);
 path(c,'#f6eeff',()=>{c.moveTo(-21,-28);c.quadraticCurveTo(-9,-40,6,-30);c.quadraticCurveTo(-8,-34,-21,-28);},0);
 paw(c,-11+step*7,backY,-17,-18,false);
 paw(c,16-step*6+k*16,(victory?-23:frontY)-spell*12-groom*7,11,-25,false);
 // A 3/4 face has cheek tufts and a curved jaw, rather than a round mask.
 c.save();c.translate(7+k*3,-42+(victory?-3:0));c.rotate(headTilt);
 for(const [side,x]of[[-1,-14],[1,12]]){
  const ear=hurt?-4:reduced?0:Math.sin(t*.08+side)*1.2;
  path(c,side<0?SHADE:FUR,()=>{c.moveTo(x-8,-7);c.bezierCurveTo(x-12,-19,x-9,-34+ear,x-4,-32+ear);c.quadraticCurveTo(x+5,-25,x+8,-12);c.lineTo(x+5,-4);});
  path(c,ROSE,()=>{c.moveTo(x-5,-12);c.quadraticCurveTo(x-8,-27+ear,x-4,-26+ear);c.quadraticCurveTo(x+1,-22,x+3,-12);},0);
 }
 path(c,FUR,()=>{c.moveTo(-23,-8);c.bezierCurveTo(-25,-25,5,-29,21,-16);c.quadraticCurveTo(29,-8,23,2);c.lineTo(27,6);c.lineTo(21,7);c.quadraticCurveTo(22,19,5,21);c.bezierCurveTo(-10,22,-22,16,-23,8);c.lineTo(-28,5);c.lineTo(-23,2);c.closePath();});
 path(c,'#f4edff',()=>{c.moveTo(-18,-10);c.quadraticCurveTo(-9,-25,10,-18);c.quadraticCurveTo(-1,-20,-8,-11);},0);
 path(c,LIGHT,()=>{c.moveTo(-12,8);c.quadraticCurveTo(-8,0,1,8);c.quadraticCurveTo(12,-1,19,8);c.quadraticCurveTo(22,20,3,20);c.quadraticCurveTo(-12,20,-12,8);},0);
 for(const [x,y,rx,ry]of[[-10,-.5,5.3,5.4],[10,-.5,6.3,6.1]]){
  if(blink)stroke(c,INK,1.15,()=>{c.moveTo(x-rx,y);c.quadraticCurveTo(x,y+2.1,x+rx,y);});
  else{
   c.save();c.beginPath();c.moveTo(x-rx,y);c.bezierCurveTo(x-rx*.7,y-ry,x+rx*.7,y-ry,x+rx,y-.4);c.bezierCurveTo(x+rx*.7,y+ry*.9,x-rx*.7,y+ry*.9,x-rx,y);c.closePath();c.clip();
   c.fillStyle='#f7edf2';c.fillRect(x-rx-1,y-ry-1,rx*2+2,ry*2+2);
   oval(c,x+look*.45,y-.1,rx,ry*1.15,'#ab8fac');oval(c,x+look*.5,y-.3,rx*.61,ry*.86,'#57425f');
   oval(c,x+look*.5-1.2,y-2,1.1,1.35,'#fff5e8');c.restore();
   stroke(c,INK,1.2,()=>{c.moveTo(x-rx,y);c.bezierCurveTo(x-rx*.7,y-ry,x+rx*.7,y-ry,x+rx,y-.4);});
   stroke(c,'#ad96bb',.75,()=>{c.moveTo(x-rx*.95,y+.3);c.quadraticCurveTo(x,y+ry*1.1,x+rx*.95,y);});
  }
 }
 oval(c,-17,9,3.5,1.9,ROSE);oval(c,17,9,3.5,1.9,ROSE);
 path(c,'#d999b8',()=>{c.moveTo(-1,10);c.quadraticCurveTo(3,7,7,10);c.lineTo(3,13);},.8);
 stroke(c,INK,1,()=>{c.moveTo(3,13);c.lineTo(3,15);c.quadraticCurveTo(-1,19,-4,15);c.moveTo(3,15);c.quadraticCurveTo(7,19,10,15);});
 if(k>.2||victory){oval(c,3,17,3.5,2.1,'#2a0f2e');oval(c,4,18,2,1,'#ff7fae');}
 for(const side of[-1,1])for(let i=0;i<2;i++)stroke(c,'#a98bbf',.6,()=>{c.moveTo(3+side*11,11+i*2);c.quadraticCurveTo(3+side*21,10+i*3,3+side*27,9+i*5);});
 // Fur tuft and tiny spiral horn are attached to the brow, not a floating crown.
 path(c,'#f4edff',()=>{c.moveTo(-6,-21);c.quadraticCurveTo(-3,-31,0,-25);c.quadraticCurveTo(4,-29,9,-22);},1);
 path(c,'#ffe4ab',()=>{c.moveTo(-1,-24);c.quadraticCurveTo(-2,-33,3,-37);c.quadraticCurveTo(7,-30,7,-24);},1);
 stroke(c,'#c19453',.8,()=>{c.moveTo(0,-29);c.quadraticCurveTo(3,-27,6,-29);});
 // The crescent is a birthmark, carried into every later form.
 path(c,'#e9c686',()=>{c.moveTo(3,-17);c.bezierCurveTo(-4,-18,-4,-10,3,-10);c.quadraticCurveTo(-1,-13,3,-17);},0);
 c.restore();c.restore();
}
