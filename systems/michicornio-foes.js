// Michicornio V458 · Distinct procedural enemy bodies for the personal Moon Gardens.
// The base enemy kind still owns collisions/damage/AI, this renderer replaces only its silhouette.
// All motion derives from game time. Reduced-motion paints a stable pose.
const TAU=Math.PI*2;
const styles=Object.freeze({
 moth:{wing:'#dbc8ff',fill:'#7852b0',eye:'#fff4c0'},
 jelly:{wing:'#98e4f6',fill:'#9d79d2',eye:'#fff7cf'},
 thorn:{wing:'#ef9cd0',fill:'#5f397c',eye:'#ffddab'},
 lynx:{wing:'#a2b0e8',fill:'#2d254d',eye:'#ffdf96'},
 prism:{wing:'#ffdfa9',fill:'#6c4e9b',eye:'#f8fcff'}
});
export const MICHICORNIO_FOE_KINDS=Object.freeze(Object.keys(styles));
const orb=(c,x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();};
const line=(c,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();};
const crystal=(c,x,y,r,color)=>{c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.66,y);c.lineTo(x,y+r);c.lineTo(x-r*.66,y);c.closePath();c.fillStyle=color;c.fill();c.stroke();};
export function drawMichicornioFoe(ctx,e,cam,t=0,reduced=false){
 const kind=e?.roomPersona?.michiKind;if(!kind||!styles[kind]||e.dead)return false;
 const a=styles[kind],x=e.x+e.w/2-(cam?.x||0),y=e.y+e.h/2-(cam?.y||0);
 const s=Math.min(1.3,Math.max(.55,Math.min((e.w||35)/44,(e.h||35)/44)));
 const pulse=reduced?0:Math.sin(t*.075+(e.spawnIndex||0)*2),wing=reduced?0:Math.sin(t*.18);
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 ctx.globalAlpha=.18;orb(ctx,0,0,30+Math.abs(pulse)*4,27,a.wing);ctx.globalAlpha=1;
 if(kind==='moth'){
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);
   ctx.beginPath();ctx.moveTo(-1,-8);ctx.bezierCurveTo(8,-43+wing*7,42,-39+wing*5,30,-10);
   ctx.bezierCurveTo(48,4,25,18,4,6);ctx.closePath();ctx.fillStyle=a.wing;ctx.fill();line(ctx,'#544071',2);ctx.restore();
   orb(ctx,side*21,-11,5,8,'#f8dfff');
  }
  orb(ctx,0,1,10,19,a.fill);orb(ctx,0,-14,12,10,'#ebd7ff');
  orb(ctx,-5,-15,3,4,a.eye);orb(ctx,5,-15,3,4,a.eye);
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*5,-19);ctx.quadraticCurveTo(side*11,-31,side*14,-29);line(ctx,'#fff1bf',2);}
 }else if(kind==='jelly'){
  for(let i=0;i<5;i++){
   const xx=(i-2)*8,tip=xx+(reduced?0:Math.sin(t*.13+i)*6);
   ctx.beginPath();ctx.moveTo(xx,-1);ctx.bezierCurveTo(xx-10,10,xx+5,17,tip,25);
   line(ctx,i%2?'#d6c0ff':'#8becff',i===2?5:4);
  }
  ctx.beginPath();ctx.moveTo(-24,-3);ctx.bezierCurveTo(-25,-35,-12,-41,0,-42);
  ctx.bezierCurveTo(15,-41,26,-26,24,-3);ctx.quadraticCurveTo(0,7,-24,-3);ctx.closePath();
  const g=ctx.createLinearGradient(0,-42,0,5);g.addColorStop(0,'#f4fdff');g.addColorStop(.55,a.wing);g.addColorStop(1,a.fill);ctx.fillStyle=g;ctx.fill();line(ctx,'#4d4379',2);
  ctx.beginPath();ctx.moveTo(-3,-37);ctx.lineTo(0,-47);ctx.lineTo(3,-37);ctx.closePath();ctx.fillStyle='#ffe8a5';ctx.fill();
  orb(ctx,-8,-18,3,4,'#43345e');orb(ctx,8,-18,3,4,'#43345e');
 }else if(kind==='thorn'){
  for(let i=-2;i<=2;i++){
   ctx.save();ctx.rotate(i*.33);
   ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(i*4,-27,0,-44);ctx.quadraticCurveTo(10,-20,7,2);ctx.closePath();
   ctx.fillStyle=i%2?a.fill:a.wing;ctx.fill();ctx.restore();
  }
  orb(ctx,0,8,23,13,'#49375c');orb(ctx,0,5,14,8,'#b7a1d8');
  crystal(ctx,0,-11,10,a.eye);
  for(const side of [-1,1])orb(ctx,side*7,3,3,4,'#ffecbe');
 }else if(kind==='lynx'){
  ctx.beginPath();ctx.moveTo(-19,-12);ctx.quadraticCurveTo(-44,-18,-35,-38);line(ctx,'#cbb6f1',7);
  for(const side of [-1,1]){
   orb(ctx,side*12,19,9,6,'#8d7abc');
   ctx.beginPath();ctx.moveTo(side*8,-12);ctx.lineTo(side*22,-31);ctx.lineTo(side*27,-9);
   ctx.closePath();ctx.fillStyle=a.fill;ctx.fill();line(ctx,'#c7aee8',2);
  }
  orb(ctx,0,1,25,22,a.fill);orb(ctx,0,9,16,10,'#d8c8f7');
  for(const side of [-1,1]){orb(ctx,side*10,-4,6,7,a.eye);orb(ctx,side*10,-4,2.3,4,'#302a4c');}
  orb(ctx,0,10,3,3,'#eaa6c8');
 }else if(kind==='prism'){
  for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*TAU/6+(reduced?0:t*.008));crystal(ctx,0,-23,12,i%2?'#cbb5f5':'#f0d4ff');ctx.restore();}
  crystal(ctx,0,0,28,a.fill);crystal(ctx,0,0,16,a.wing);
  orb(ctx,-6,-3,3,4,a.eye);orb(ctx,6,-3,3,4,a.eye);
  crystal(ctx,0,-17,6,'#fff3ae');
 }
 // Same readable combat indicator for every enemy role.
 if(e.telegraph){
  ctx.globalAlpha=.8;ctx.strokeStyle='#fff0af';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.arc(0,-5,33+(reduced?0:Math.abs(pulse)*6),0,TAU);ctx.stroke();
  crystal(ctx,0,-38,6,'#fff4b8');
 }
 if((e.hurtFlash||e.flash||0)>0){ctx.globalAlpha=.24;orb(ctx,0,0,30,28,'#fff');}
 ctx.restore();return true;
}
