// Living eclipse: fifty captive echoes, all driven by encounter/player state.
import{WORLD1_ORDER,WORLD1_THEMES}from'./world1-rooms.js';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const ECLIPSE_ECHOES=Object.freeze(Array.from({length:50},(_,i)=>Object.freeze({id:i,hero:WORLD1_ORDER[i%10],ring:Math.floor(i/10),seed:i*2.3999632297,scale:1+(i%3)*.23})));
export function eclipseLife({phase=1,time=0,reduce=false,player,cam={},x=0,y=0,radius=200,boss,arena}){
 const T=reduce?0:time,b=boss?._fusion||{},warning=b.mode==='warn'?clamp(1-(b.clock||0)/(b.warnMax||72),0,1):0;
 const focus=b.mode==='warn'&&b.target?b.target:null;
 const px=focus?focus.x-(cam.x||0):player?player.x+player.w/2-(cam.x||0):x,py=focus?focus.y-(cam.y||0):player?player.y+player.h*.4-(cam.y||0):y;
 const voice={ola:'kilo',plasma:'stitcho',rayos:'chispin',medusas:'cat',embestida:'cuerno',aliento:'dragon',terremoto:'dino',geiseres:'frita',ruedas:'pizza',red:'yomi'}[b.attack],color=WORLD1_THEMES[voice]?.color;
 const alive=!!boss&&boss.hp>0,blink=reduce?0:Math.max(0,1-Math.abs((T%680)-650)/11);
 return{T,warning,color,recover:b.mode==='rest',aid:Math.max(0,Math.min(1,(arena?.shieldBurst||0)/28)),intro:b.mode==='intro'?clamp(1-(b.clock||0)/(b.introMax||260),0,1):1,alive,blink,lookX:clamp((px-x)*.075,-radius*.18,radius*.18),lookY:clamp((py-y)*.035,-radius*.07,radius*.12),breath:reduce?0:Math.sin(T*(.012+phase*.004))*radius*.018,phase,awake:arena?.awakened?.length||0,release:b.mode==='attack'?clamp((b.clock||0)/30,0,1):0,special:b.mode==='special',freed:!!boss&&boss.hp<=0};
}
export function drawLivingEclipse(c,o){
 const {x,y,radius:r,player,cam={}}=o,p=eclipseLife(o),T=p.T;
 const color=p.freed?'#b7ddc2':p.color|| (p.phase>=3?'#a3bcd3':'#8fb9bd');
 c.save();c.translate(x,y);c.lineCap='round';
 // Slow coronal tissue reacts to preparation without strobing or camera motion.
 c.fillStyle=p.freed?'#abc8ad12':'#93cfc01b';c.beginPath();
 for(let i=0;i<=100;i++){
  const a=i*TAU/100,flow=Math.sin(a*7+T*.009)*7+Math.sin(a*13-T*.013)*4,rr=r+12+p.breath+flow+p.warning*(8+Math.sin(a*5)*5);
  const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr;i?c.lineTo(xx,yy):c.moveTo(xx,yy);
 }c.closePath();c.fill();
 c.globalAlpha=.65;
 // Short flame-shaped coronal streamers have independent follow-through.
 for(let i=0;i<64;i++){
  const a=i*TAU/64,rr=r+5+p.breath,length=8+Math.sin(i*17.1)*5+p.warning*13,lean=Math.sin(T*.011+i)*.045;
  c.save();c.rotate(a);c.fillStyle=i%3?'#8acbc91b':'#d4d7b32a';c.beginPath();c.moveTo(rr,-2.5);c.bezierCurveTo(rr+length*.7,-6,rr+length+5,lean*r,rr+length,4);c.quadraticCurveTo(rr+length*.3,2,rr,3);c.closePath();c.fill();c.restore();
 }
 c.globalAlpha=1;
 // Detached shell petals open with each phase instead of a continuous halo line.
 for(let i=0;i<4;i++){
  const angle=i*TAU/4+.4+(o.reduce?0:Math.sin(T*.004+i)*.035),lift=(p.phase-1)*6,rr=r+14+lift;
  c.save();c.rotate(angle);c.globalAlpha=.14+p.awake*.025;c.fillStyle=i%2?'#9295b3':'#b1bdad';c.beginPath();c.moveTo(rr,-18);c.bezierCurveTo(rr+14,-9,rr+11,14,rr,23);c.quadraticCurveTo(rr+4,0,rr,-18);c.closePath();c.fill();c.restore();
 }
 // Eyelids are cut from the eclipse's shadow; the pupil follows the actual hero.
 const eyeY=r*.08,open=p.alive?(1-p.blink)*(.42+p.phase*.08+p.warning*.18)*p.intro:p.freed?.5:.13;
 c.save();c.beginPath();c.ellipse(0,eyeY,r*.62,Math.max(1,r*.30*open),-.04,0,TAU);c.clip();
 // Deep sclera and a spherical, textured iris. Every fiber is a filled petal.
 c.fillStyle='#080f20';c.fillRect(-r,-r,r*2,r*2);
 const ix=p.lookX,iy=eyeY+p.lookY,ir=r*.30;
 const iris=c.createRadialGradient(ix-ir*.2,iy-ir*.22,1,ix,iy,ir);iris.addColorStop(0,p.freed||p.aid>0?'#c7d6b4':p.recover?'#bab698':'#b59b90');iris.addColorStop(.35,'#8c7c81');iris.addColorStop(.72,'#484e72');iris.addColorStop(1,'#152239');c.fillStyle=iris;c.beginPath();c.ellipse(ix,iy,ir,ir*1.05,0,0,TAU);c.fill();
 for(let i=0;i<48;i++){
  const a=i*TAU/48,inner=ir*.39,outer=ir*(.76+.18*Math.sin(i*31));
  c.globalAlpha=.13;c.fillStyle=i%3?'#d4b88c':'#8e96b9';c.beginPath();c.moveTo(ix+Math.cos(a)*inner,iy+Math.sin(a)*inner);c.quadraticCurveTo(ix+Math.cos(a+.07)*ir*.7,iy+Math.sin(a+.07)*ir*.7,ix+Math.cos(a)*outer,iy+Math.sin(a)*outer);c.lineTo(ix+Math.cos(a+.035)*outer,iy+Math.sin(a+.035)*outer);c.closePath();c.fill();
 }
 c.globalAlpha=1;c.fillStyle='#060b18';c.beginPath();c.ellipse(ix,iy,r*(p.special?.09:.045-p.warning*.018),r*.29,0,0,TAU);c.fill();
 // Two soft reflections and a translucent tear film follow the eye surface.
 c.fillStyle='#e5dfc477';c.beginPath();c.ellipse(ix-ir*.32,iy-ir*.41,ir*.13,ir*.2,-.3,0,TAU);c.fill();c.fillStyle='#c8cedc44';c.beginPath();c.ellipse(ix+ir*.38,iy+ir*.33,ir*.08,ir*.07,0,0,TAU);c.fill();c.restore();
 c.fillStyle='#66718c22';c.beginPath();c.moveTo(-r*.63,eyeY);c.quadraticCurveTo(0,eyeY-r*.5*open,r*.63,eyeY-r*.04);c.quadraticCurveTo(0,eyeY-r*.42*open,-r*.63,eyeY);c.closePath();c.fill();
 // Fifty independent presences, five for every character in the story.
 for(const q of ECLIPSE_ECHOES){
  const a=q.seed+T*(.0005+q.ring*.00008)*(q.id%2?1:-1),ring=r+45+q.ring*19;
  let ex=Math.cos(a)*ring,ey=Math.sin(a)*ring*.72;
  const px=player?player.x+player.w/2-(cam.x||0)-x:0,py=player?player.y-(cam.y||0)-y:0;
  const dist=Math.hypot(ex-px,ey-py),near=clamp(1-dist/220,0,1);
  // They lean toward a nearby player and escape outward when the prison breaks.
  ex+=(px-ex)*near*.12;ey+=(py-ey)*near*.12;
  if(p.freed){ex+=Math.cos(a)*60;ey-=35+q.ring*9;}
  const size=(2.8+near*2)*q.scale,col=WORLD1_THEMES[q.hero].color;
  c.save();c.translate(ex,ey+Math.sin(T*.022+q.seed)*2);c.rotate(Math.sin(T*.018+q.seed)*.12);
  c.globalAlpha=.20+near*.18+p.awake*.025;c.fillStyle=col;c.beginPath();c.moveTo(0,-size*2);c.bezierCurveTo(size*1.4,-size,size, size*.6,0,size);c.quadraticCurveTo(-size*.4,size*2,-size*.6,size*2.7);c.quadraticCurveTo(-size*1.7,0,0,-size*2);c.fill();
  // A pair of tiny eyes makes each mote read as a presence rather than confetti.
  if(size>3.2){c.fillStyle='#d8ead8';c.globalAlpha*=.7;c.fillRect(-size*.45,-size*.4,.7,1);c.fillRect(size*.3,-size*.4,.7,1);}
  c.restore();
 }
 // Corona gust on release: a transparent wave, never a damaging floor ring.
 if(p.release>0){c.globalAlpha=p.release*.15;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(0,0,r+15+(1-p.release)*80,r+15+(1-p.release)*80,0,0,TAU);c.stroke();}
 // Coronal auroras flow along the rim, leaving the eye and combat lane clear.
 for(let i=0;i<3;i++){
  const a=-Math.PI*.9+i*.52+Math.sin(T*.004+i)*.08,rr=r+36+i*14;
  c.globalAlpha=.06+p.awake*.012;c.fillStyle=['#8dd9cd','#a5a9d9','#d7ce9e'][i];c.beginPath();
  for(let k=0;k<=24;k++){const angle=a+k*.031,rad=rr+Math.sin(angle*5+T*.01)*4;const xx=Math.cos(angle)*rad,yy=Math.sin(angle)*rad;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}
  for(let k=24;k>=0;k--){const angle=a+k*.031,rad=rr+10+Math.sin(angle*5+T*.01)*4;c.lineTo(Math.cos(angle)*rad,Math.sin(angle)*rad);}c.closePath();c.fill();
 }
 c.restore();
}
