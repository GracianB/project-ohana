// Localised spectral footprints replace aim wires, perimeter dots and arrows.
import{WORLD1_FLOOR as F,WORLD1_ARENA as A}from'./world1-rooms.js';
const TAU=Math.PI*2;
export function drawQuimeraIntent(c,e,cam,t,col,reduce){
 const baseAlpha=c.globalAlpha;
 const b=e._fusion;if(!b||b.mode!=='warn'||!b.attack)return;
 const ox=cam.x||0,oy=cam.y||0,T=reduce?0:t,p=Math.max(0,Math.min(1,1-b.clock/(b.warnMax||72))),ex=e.x+e.w/2,aim=b.aim||-1;
 c.save();
 const bloom=(x,y,rx,ry,alpha=.5)=>{x-=ox;y-=oy;const g=c.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,col);g.addColorStop(1,'#9db6d400');c.globalAlpha=baseAlpha*(alpha);c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
 const petal=(x,y,size,alpha=1)=>{c.save();c.globalAlpha=baseAlpha*(alpha);c.fillStyle=col;c.beginPath();c.moveTo(x,y-size);c.quadraticCurveTo(x+size,y,x,y+size);c.quadraticCurveTo(x-size,y,x,y-size);c.fill();c.restore();};
 for(let i=0;i<3;i++)petal(ex-ox-10+i*10,e.y-oy-22,3,p>i/3?.75:.15);
 if(b.attack==='rayos')for(const x of b.marks||[]){bloom(x,F-3,34,8,.5+p*.3);for(let i=-1;i<=1;i++)petal(x-ox+i*11,F-oy-12,3+p*3,.25+p*.5);}
 if(b.attack==='geiseres')for(const x of b.marks||[]){bloom(x,F-3,34,8,.5+p*.3);for(let i=0;i<4;i++){const rise=reduce?i*7:(T*.6+i*11)%35;c.save();c.globalAlpha=baseAlpha*(.15+p*.35);c.fillStyle=col;c.beginPath();c.ellipse(x-ox+Math.sin(i*7)*15,F-oy-8-rise,2+i%2,3,0,0,TAU);c.fill();c.restore();}}
 if(b.attack==='medusas')for(const x of b.marks||[]){bloom(x,F-3,20,6,.45);bloom(x,F-440,14,11,.35+p*.4);c.save();c.globalAlpha=baseAlpha*(.18+p*.25);c.fillStyle=col;c.beginPath();c.moveTo(x-ox-9,F-oy-435);c.quadraticCurveTo(x-ox,F-oy-462,x-ox+9,F-oy-435);c.quadraticCurveTo(x-ox,F-oy-441,x-ox-9,F-oy-435);c.fill();c.restore();}
 if(b.attack==='terremoto')bloom((b.leapTarget??e.x)+e.w/2,F-3,e.w*.6,14,.45+p*.3);
 if(['embestida','ola','ruedas'].includes(b.attack)){
  const end=b.attack==='embestida'?((b.chargeTarget??e.x+aim*900)+e.w/2):ex+aim*1050;
  const dirs=b.attack==='ola'?[-1,1]:[aim];for(const d of dirs){const distance=b.attack==='embestida'?Math.abs(end-ex):Math.min(1050,d>0?A.right-ex:ex-A.left);for(let i=0;i<7;i++){const k=(i+.3+Math.sin(T*.04)*.1)/7;bloom(ex+d*distance*k,F-5,20,5,.12+p*.13);if(b.attack==='embestida')petal(ex+d*distance*k-ox,F-oy-7,2+p*2,.2+p*.2);}}
 }
 if(b.attack==='red')for(const m of b.marks||[])bloom(m.x,m.y,17,17,.4+p*.25);
 if(b.attack==='plasma'){const q=b.target||{x:ex+aim*800,y:F-30};bloom(q.x,q.y,25,19,.3+p*.35);c.save();c.translate(q.x-ox,q.y-oy);c.rotate(Math.atan2(q.y-(F-160),q.x-ex));for(const side of[-1,1])petal(-12,side*14,3,.35+p*.4);c.restore();}
 if(b.attack==='aliento')bloom(ex+aim*65,F-210,23,18,.3+p*.35);
 c.restore();
}
