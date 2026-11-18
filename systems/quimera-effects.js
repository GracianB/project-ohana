import {drawQuimeraEnergy} from './quimera-energy.js';
// All luminous material is clipped to the collision footprint supplied by combat.
// Decorative particles never enlarge the painted damage area.
import {WORLD1_FLOOR as FLOOR} from './world1-rooms.js';
const TAU=Math.PI*2;
export function drawQuimeraProjectiles(c,b,cam,t,reduce,bounds,isActive){
 c.save();c.lineCap='round';c.lineJoin='round';
 const path=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const ellipse=(x,y,rx,ry,fill)=>path(fill,()=>c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU));
 c.globalAlpha=1;
 for(const s of b.shots||[]){
  const box=bounds(s),x=s.x-(cam.x||0),y=s.y-(cam.y||0),xx=box.x-(cam.x||0),yy=box.y-(cam.y||0),col=s.col||'#8cddd8',active=isActive(s),age=reduce?19:(s.age||0),r=s.r||20;
  if(s.hit||s.life<=0)continue;
  if(s.delay>0){
   const yy=(s.k==='meteor'?FLOOR-4:s.y)-(cam.y||0),g=c.createRadialGradient(x,yy,0,x,yy,s.r||30);g.addColorStop(0,col);g.addColorStop(1,'#adbbd200');{c.globalAlpha=.45;c.fillStyle=g;c.beginPath();c.ellipse(x,yy,s.r||30,s.k==='meteor'?7:15,0,0,Math.PI*2);c.fill();}continue;
  }
  c.save();c.beginPath();
  const column=['bolt','geyser','beam'].includes(s.k);
  if(column)c.rect(xx,yy,box.w,box.h);else c.ellipse(x,y,box.w/2,box.h/2,0,0,TAU);
  c.clip();
  if(column){drawQuimeraEnergy(c,s,box,cam,active,reduce);c.restore();continue;}
  // Round shots retain a quiet contact field; energy lanes have no filled slabs.
  c.globalAlpha=active?.12:.08;c.fillStyle=col;c.fillRect(xx,yy,box.w,box.h);c.globalAlpha=1;
  c.save();c.translate(x,y);
  const g=c.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#ffffff');g.addColorStop(.25,col);g.addColorStop(1,'#142b4a');
  const direction=Math.sign(s.vx)||1;
  if(s.k==='orb'){
   // A pointed plasma lance, with a braided electrical interior.
   c.save();c.rotate(Math.atan2(s.vy||0,s.vx||1));
   path(g,()=>{c.moveTo(r,0);c.quadraticCurveTo(-r*.2,-r*.8,-r,-r*.65);c.lineTo(-r*.6,0);c.lineTo(-r,r*.65);c.quadraticCurveTo(-r*.2,r*.8,r,0);});
   path('#dfead6',()=>{c.moveTo(r*.7,0);c.quadraticCurveTo(0,-r*.35,-r*.45,0);c.quadraticCurveTo(0,r*.3,r*.7,0);});c.restore();
  }else if(s.k==='ring'||s.k==='wave'){
   // A travelling crest rolls over a foam lip, rather than a disc.
   c.save();c.scale(direction,1);
   path(g,()=>{c.moveTo(-r,r);c.bezierCurveTo(-r,-r*.2,-r*.2,-r, r*.6,-r*.8);c.quadraticCurveTo(r*.2,-r*.65,r*.1,-r*.2);c.quadraticCurveTo(r*.8,-r*.4,r,r);});
   for(let i=0;i<4;i++)ellipse(-r*.5+i*r*.35,r*.6+Math.sin(age*.2+i)*2,2.3,1.4,'#fffce4');c.restore();
  }else if(s.k==='fire'||s.k==='meteor'){
   c.save();c.rotate(Math.atan2(s.vy||0,s.vx||1));
   path(g,()=>{c.moveTo(r*.9,0);c.quadraticCurveTo(r*.5,-r,-r,-r*.6);c.lineTo(-r*.4,-r*.15);c.lineTo(-r,0);c.lineTo(-r*.3,r*.2);c.lineTo(-r,r*.75);c.quadraticCurveTo(r*.5,r,r*.9,0);});
   path('#fff4c8',()=>{c.moveTo(r*.65,0);c.quadraticCurveTo(0,-r*.35,-r*.4,0);c.quadraticCurveTo(0,r*.45,r*.65,0);});
   for(let i=0;i<3;i++)ellipse(-r*.8+(age*2+i*11)%(r*1.5),Math.sin(i*11+age*.1)*r*.7,1.3,1.3,'#fff9ce');c.restore();
  }else if(s.k==='jelly'){
   c.save();
   path(g,()=>{c.moveTo(-r,1);c.quadraticCurveTo(-r*.8,-r,r*.1,-r);c.quadraticCurveTo(r,-r*.7,r,1);c.quadraticCurveTo(0,-r*.15,-r,1);});
   for(let i=-2;i<=2;i++){const k=reduce?0:Math.sin(age*.13+i)*3;path(col,()=>{const xx=i*r*.32;c.moveTo(xx-1.5,0);c.bezierCurveTo(xx+k-2,r*.3,xx-k-1,r*.65,xx,r);c.bezierCurveTo(xx-k+2,r*.65,xx+k+2,r*.3,xx+1.5,0);});}
   for(const side of[-1,1])ellipse(side*5,-5,1.8,2.5,'#ecffeb');c.restore();
  }else if(s.k==='wheel'){
   // An incandescent saw-like corona with a dark negative-space centre.
   c.save();c.rotate(reduce?0:age*.15);
   path(g,()=>{for(let i=0;i<24;i++){const a=i*TAU/24,rr=i%2?r*.73:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}});
   ellipse(0,0,r*.5,r*.5,'#171b30');for(let i=0;i<6;i++){const a=i*TAU/6;ellipse(Math.cos(a)*r*.62,Math.sin(a)*r*.62,2.5,2.5,'#e6d6b2');}c.restore();
  }else if(s.k==='node'){
   c.save();c.rotate(reduce?0:age*.025);
   path(g,()=>{c.moveTo(0,-r);c.quadraticCurveTo(3,-4,r,0);c.quadraticCurveTo(3,4,0,r);c.quadraticCurveTo(-3,4,-r,0);c.quadraticCurveTo(-3,-4,0,-r);});
   ellipse(0,0,3,5,'#f1ffe5');c.restore();
  }else if(s.k==='echo'){
   c.save();c.scale(direction,1);
   path(g,()=>{c.moveTo(22,-7);c.quadraticCurveTo(18,-27,3,-24);c.lineTo(-6,-34);c.lineTo(-11,-21);c.quadraticCurveTo(-23,-16,-20,4);c.quadraticCurveTo(-29,19,-26,35);c.quadraticCurveTo(-4,23,12,24);c.quadraticCurveTo(1,9,22,-7);});
   ellipse(5,-10,1.8,2.5,'#dce9d1');ellipse(13,-11,1.5,2,'#dce9d1');c.restore();
  }else ellipse(0,0,r*.75,r*.75,g);
  c.restore();c.restore();
 }
 drawQuimeraImpacts(c,b,cam,reduce);
 c.restore();
}

export function drawQuimeraCast(c,e,cam,t=0,reduce=false){
 const b=e._fusion;if(!b||!['warn','attack','charge','leap'].includes(b.mode)||!b.attack)return;
 const col={ola:'#f3cd99',plasma:'#8adfe8',rayos:'#f4e9a5',medusas:'#bcb1ee',embestida:'#cce5c3',aliento:'#ffad72',terremoto:'#b4d390',geiseres:'#f1d58e',ruedas:'#f2ba8b',red:'#a5bafa'}[b.attack];
 const k=b.mode==='warn'?Math.max(0,Math.min(1,1-b.clock/(b.warnMax||72))):Math.max(0,(b.clock||0)/30),time=reduce?0:t;
 const dir=e.facing||-1,x=e.x+e.w/2-(cam.x||0),foot=e.y+e.h-(cam.y||0);
 c.save();c.lineCap='round';c.strokeStyle=col;c.fillStyle=col;
 // Intent gathers into the emitting organ, then recoils outward on release.
 const organ=b.attack==='aliento'?{x:x+dir*42,y:foot-218}:['ola','terremoto','geiseres'].includes(b.attack)?{x:x+dir*70,y:foot-55}:b.attack==='rayos'?{x,y:foot-310}:{x,y:foot-163};
 c.globalAlpha=.15+k*.5;
 for(let i=0;i<5;i++){
  const angle=i*TAU/5+time*.014,rad=14+(1-k)*35;
  c.beginPath();c.ellipse(organ.x+Math.cos(angle)*rad,organ.y+Math.sin(angle)*rad*.65,1.5,3,angle,0,TAU);c.fill();
 }
 c.restore();
}


function drawQuimeraImpacts(c,b,cam,reduce){
 for(const fx of b.fx||[]){
  const p=Math.max(0,Math.min(1,fx.age/28)),x=fx.x-(cam.x||0),y=fx.y-(cam.y||0),r=fx.r||22;
  c.save();c.translate(x,y);c.globalAlpha=(1-p)*.7;c.fillStyle=fx.col||'#a5e1d8';c.strokeStyle=fx.col||'#a5e1d8';
  if(fx.kind==='ground'){
   c.globalAlpha=(1-p)*.12;c.beginPath();c.ellipse(0,0,r*(.5+p*2),5+p*6,0,0,TAU);c.fill();c.globalAlpha=(1-p)*.7;
  }
  for(let i=0;i<7;i++){
   const a=i*TAU/7+(fx.id||0)*.7,d=reduce?r*.5:r*(.2+p*1.7),size=(1-p)*3;
   const xx=Math.cos(a)*d,yy=Math.sin(a)*d*(fx.kind==='ground'?.35:1)+(reduce?0:p*p*12);
   c.beginPath();c.moveTo(xx,yy-size*2);c.lineTo(xx+size,yy);c.lineTo(xx,yy+size*2);c.lineTo(xx-size,yy);c.closePath();c.fill();
  }
  c.restore();
 }
}
