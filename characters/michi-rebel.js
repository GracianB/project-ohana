// Michi's street-cat identity. Pose-only Canvas art; never mutates the actor.
const TAU=Math.PI*2;
const finite=(v,d=0)=>Number.isFinite(v)?v:d;
const limit=v=>Math.max(0,Math.min(1,finite(v)));
export function drawRebelCat(c,p={}){
 const f=Math.max(0,Math.min(4,Math.round(finite(Number(p.form))))),st=p.state||'idle';
 const still=p.reduceMotion||st==='dead',t=still?0:finite(p.t),phase=still?0:finite(p.phase);
 const atk=still?.5:limit(p.atk),cast=still?.5:limit(p.cast);
 const power=Math.max(0,Math.min(5,Math.trunc(finite(p.michiPowerIndex,finite(p.castSlot)))));
 const run=st==='run'?Math.sin(phase*2):0,air=['jump','fall','glide'].includes(st);
 const ink='#101521',fur=['#424c61','#394459','#343d53','#30384e','#292f45'][f];
 const accent=['#fa5b57','#ff705d','#aa91ff','#65e8d0','#f7ce75'][f];
 const line=(color,w,fn)=>{c.beginPath();fn();c.strokeStyle=color;c.lineWidth=w;c.stroke();};
 const shape=(color,fn)=>{c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=1.7;c.stroke();};
 const oval=(x,y,rx,ry,color,rot=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fillStyle=color;c.fill();};
 c.save();c.lineCap='round';c.lineJoin='round';
 const welcome=st==='idle'&&!still?p.michiWelcome||{}:{};
 const inspect=limit(welcome.inspect),groom=limit(welcome.groom);
 const bob=st==='jump'?-5:st==='fall'?3:st==='glide'?-3:st==='wall'?-2:st==='hurt'?5:st==='victory'?-7:Math.sin(t*.07)*.8;
 c.translate(st==='attack'?atk*9:0,bob);c.rotate(st==='dead'?.65:st==='hurt'?-.16:st==='wall'?-.13:st==='cast'?(power-2)*.025:run*.035);
 c.scale(f===0?.83:1+f*.035,st==='fall'?.94:st==='jump'?1.05:1);
 // A thick, hooked tail is readable even at gameplay scale.
 const tail=Math.sin(t*.06)*4+(st==='cast'?power*2:0);
 line(ink,10,()=>{c.moveTo(-14,-22);c.bezierCurveTo(-43,-15,-52,-47,-38,-55+tail);});
 line(fur,6.5,()=>{c.moveTo(-14,-22);c.bezierCurveTo(-43,-15,-52,-47,-38,-55+tail);});
 line(accent,3,()=>{c.moveTo(-41,-47+tail*.4);c.quadraticCurveTo(-43,-53+tail,-38,-55+tail);});
 // Flight forms keep actual wings; the final cat earns a broad nine-tail fan.
 if(f===1||f===4)for(const side of [-1,1]){
  const spread=st==='glide'?10:Math.sin(t*.12+side)*3;
  shape('#55566e',()=>{c.moveTo(side*12,-43);c.quadraticCurveTo(side*38,-78-spread,side*61,-73-spread);c.lineTo(side*48,-50);c.lineTo(side*35,-52);c.lineTo(side*27,-35);});
  line(accent,1.1,()=>{c.moveTo(side*16,-44);c.lineTo(side*52,-66-spread);});
 }
 if(f===4)for(let i=0;i<8;i++){
  const a=(i-3.5)*.21,x=Math.sin(a)*67,y=-45-Math.cos(a)*31;
  line(ink,7,()=>{c.moveTo(-6,-24);c.quadraticCurveTo(x*1.2,-27,x,y+Math.sin(t*.05+i)*2);});
  line('#55516a',4,()=>{c.moveTo(-6,-24);c.quadraticCurveTo(x*1.2,-27,x,y+Math.sin(t*.05+i)*2);});
 }
 // Compact shoulders, asymmetric vest and separate paws.
 shape(fur,()=>{c.moveTo(-17,-48);c.quadraticCurveTo(-26,-30,-19,-13);c.quadraticCurveTo(0,-5,20,-16);c.lineTo(17,-47);});
 shape('#202736',()=>{c.moveTo(-17,-47);c.lineTo(-4,-35);c.lineTo(6,-47);c.lineTo(20,-40);c.lineTo(20,-20);c.lineTo(3,-17);c.lineTo(-4,-29);c.lineTo(-13,-17);c.lineTo(-23,-24);});
 line('#7d8a9f',1,()=>{c.moveTo(4,-34);c.lineTo(12,-22);});
 for(const side of [-1,1]){
  const step=run*side*5,py=air?-7:Math.min(0,step),px=side*12+run*side*3;
  shape(fur,()=>{c.moveTo(side*7,-22);c.lineTo(px-6,-9+py);c.quadraticCurveTo(px-10,2+py,px+5,py);c.quadraticCurveTo(px+10,-4+py,side*17,-24);});
  for(let k=0;k<3;k++)line('#a5acb9',.7,()=>{c.moveTo(px-3+k*3,-3+py);c.lineTo(px-3+k*3,-1+py);});
 }
 const reach=st==='attack'?atk*20:st==='cast'?9+power*2:st==='victory'?7:0;
 for(const side of [-1,1]){
  const x=side*(20+(side>0?reach:0)),y=-26-(st==='victory'?22:st==='cast'?power*2:0)+run*side*3;
  line(ink,10,()=>{c.moveTo(side*16,-42);c.lineTo(x,y);});line(fur,7,()=>{c.moveTo(side*16,-42);c.lineTo(x,y);});
  oval(x,y,6,5,'#67758b');
  if(st==='attack'&&side>0)for(let i=0;i<3;i++)line('#e7f6ef',1.3,()=>{c.moveTo(x+3,y-3+i*3);c.lineTo(x+10,y-7+i*3);});
 }
 c.save();c.translate(1+finite(p.look?.x)*1.5+inspect*3,-51+groom*3);c.rotate(st==='victory'?-.1:st==='hurt'?.12:Math.sin(t*.035)*.025);
 // One notched ear, one sharp ear, a swept forelock: no circular mascot head.
 shape(fur,()=>{c.moveTo(-22,-9);c.lineTo(-25,-33);c.lineTo(-16,-28);c.lineTo(-13,-33);c.lineTo(-5,-20);c.quadraticCurveTo(5,-23,14,-18);c.lineTo(27,-34);c.lineTo(25,-7);c.quadraticCurveTo(29,10,12,17);c.quadraticCurveTo(-7,24,-23,9);c.lineTo(-28,4);c.lineTo(-22,1);});
 shape('#b76f83',()=>{c.moveTo(-21,-25);c.lineTo(-12,-15);c.lineTo(-20,-13);});
 shape('#b76f83',()=>{c.moveTo(22,-26);c.lineTo(16,-15);c.lineTo(23,-12);});
 shape('#77869a',()=>{c.moveTo(-16,-18);c.lineTo(-7,-30);c.lineTo(-5,-24);c.lineTo(6,-29);c.lineTo(3,-22);c.lineTo(16,-22);c.lineTo(5,-12);c.lineTo(-3,-15);c.lineTo(-7,-8);});
 // Narrow amber eyes with slits and a low brow give the cat its attitude.
 const blink=still?false:Math.sin(t*.043)>.994;
 for(const side of [-1,1]){
  const x=side*11,y=-2+side;
  if(blink||st==='dead')line('#e6bb70',2,()=>{c.moveTo(x-5,y);c.lineTo(x+5,y+side);});
  else{
   oval(x,y,6.8,4.6,'#ecd48b',side*.12);oval(x+finite(p.look?.x)*1.1,y,1.5,4,ink);oval(x+2,y-2,1,1,'#fffbe4');
   line(ink,2.5,()=>{c.moveTo(x-7,y-4-side);c.lineTo(x+6,y-3+side);});
  }
 }
 oval(1,8,10,6,'#a0a6b2');shape('#232b3c',()=>{c.moveTo(-3,5);c.lineTo(4,5);c.lineTo(1,9);});
 line(ink,1.3,()=>{c.moveTo(1,10);c.quadraticCurveTo(7,15,12,9);});
 if(st==='victory')shape('#fff4df',()=>{c.moveTo(7,12);c.lineTo(10,11);c.lineTo(8,16);});
 for(const side of [-1,1])for(let i=0;i<2;i++)line('#abb4c5',.9,()=>{c.moveTo(side*16,7+i*4);c.lineTo(side*29,4+i*7);});
 line('#df9b91',1.3,()=>{c.moveTo(17,-9);c.lineTo(14,4);});
 // Silver piercing and a red bandana remain the signature across all forms.
 c.beginPath();c.arc(-23,-18,3,0,TAU);c.strokeStyle='#e6d9b5';c.lineWidth=1.7;c.stroke();
 c.restore();
 shape('#ce474d',()=>{c.moveTo(-18,-39);c.quadraticCurveTo(0,-32,19,-40);c.lineTo(7,-27);c.lineTo(-2,-19);c.lineTo(-9,-31);c.lineTo(-24,-27);});
 line('#fa8a73',1.2,()=>{c.moveTo(-11,-35);c.lineTo(1,-29);});
 if(f>=2)for(let i=0;i<f;i++){oval(-15+i*7,-36,1.4,1.4,'#e6d9b5');}
 if(st==='cast'){
  c.save();c.translate(32+power*2,-37-power*2);c.rotate(cast*2);
  line(accent,2,()=>{for(let i=0;i<=3+power;i++){const a=i*TAU/(3+power),r=9+cast*8;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();});c.restore();
 }
 c.restore();
}
