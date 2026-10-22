import {drawAlohaCamp} from '../worlds/ohana-garden.js';
export const FAMILY_ISLANDS=Object.freeze([
 {id:'aloha',name:'Bahía del compás',heroes:['kilo','stitcho'],x:250,y:260,rx:220,ry:128,color:'#83bfa0',sand:'#efd49e'},
 {id:'kitchen',name:'Puerto del banquete',heroes:['pizza','frita'],x:690,y:230,rx:200,ry:125,color:'#b7c18a',sand:'#f2c78c'},
 {id:'fossil',name:'Cráter de los gigantes',heroes:['dragon','dino'],x:1130,y:270,rx:210,ry:140,color:'#ae9b88',sand:'#b9a384'},
 {id:'moon',name:'Jardín de la luna',heroes:['cat','cuerno'],x:480,y:510,rx:220,ry:100,color:'#99b0bb',sand:'#d9d2bb'},
 {id:'storm',name:'Santuario del trueno',heroes:['chispin','yomi'],x:990,y:510,rx:230,ry:100,color:'#9b9eba',sand:'#d4bfd0'},
]);

const coast=(c,z,dy=0,scale=1)=>{
 const points=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2,k=1+Math.sin(i*1.7+z.x)*.07+Math.cos(i*2.3)*.035;return {x:z.x+Math.cos(a)*z.rx*k*scale,y:z.y+dy+Math.sin(a)*z.ry*k*scale};});
 c.beginPath();for(let i=0;i<points.length;i++){const p=points[i],next=points[(i+1)%points.length],x=(p.x+next.x)/2,y=(p.y+next.y)/2;if(!i)c.moveTo(x,y);else c.quadraticCurveTo(p.x,p.y,x,y);}const p=points[0],next=points[1];c.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);c.closePath();
};

function drawStitchoCampPod(c,z){
 c.save();
 c.translate(z.x+92,z.y-8);
 c.rotate(-0.16);
 // Scout capsule fuselage
 c.fillStyle='#1d385a';c.strokeStyle='#7be3f7';c.lineWidth=2.4;
 c.beginPath();c.moveTo(-32,10);c.quadraticCurveTo(-18,-24,14,-26);c.quadraticCurveTo(42,-14,48,10);c.closePath();c.fill();c.stroke();
 // Cockpit glass dome
 c.fillStyle='#0f2038';c.beginPath();c.ellipse(12,-16,20,10,0,Math.PI,Math.PI*2);c.fill();
 c.strokeStyle='#a6f5ff';c.lineWidth=1.5;c.stroke();
 c.fillStyle='rgba(98,243,255,0.32)';c.beginPath();c.ellipse(12,-16,16,7,0,Math.PI,Math.PI*2);c.fill();
 // Thruster fin & antenna
 c.strokeStyle='#c7aaff';c.lineWidth=2;
 c.beginPath();c.moveTo(-22,-14);c.lineTo(-34,-34);c.stroke();
 c.fillStyle='#9ff3ff';c.beginPath();c.arc(-34,-35,3.5,0,Math.PI*2);c.fill();
 // Ground energy crystal cluster on the sand
 c.fillStyle='#72ebff';c.strokeStyle='#ffffff';c.lineWidth=1;
 c.beginPath();c.moveTo(34,10);c.lineTo(40,-4);c.lineTo(45,10);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(46,12);c.lineTo(50,2);c.lineTo(54,12);c.closePath();c.fill();c.stroke();
 c.restore();
}

function drawChispinCampPod(c,z){
 c.save();
 c.translate(z.x+85,z.y-12);
 c.fillStyle='#2f2042';c.strokeStyle='#ffe45a';c.lineWidth=2.2;
 c.beginPath();c.moveTo(-22,10);c.lineTo(-12,-28);c.lineTo(12,-28);c.lineTo(22,10);c.closePath();c.fill();c.stroke();
 c.fillStyle='#d68a35';c.fillRect(-8,-26,16,20);
 c.strokeStyle='#ffd84a';c.lineWidth=1.5;
 for(let i=0;i<4;i++){c.beginPath();c.moveTo(-8,-24+i*5);c.lineTo(8,-24+i*5);c.stroke();}
 c.fillStyle='#ffe96b';c.beginPath();c.arc(0,-36,8,0,Math.PI*2);c.fill();
 c.strokeStyle='#ffffff';c.lineWidth=1.6;c.stroke();
 c.fillStyle='#ffd43f';c.strokeStyle='#ffffff';c.lineWidth=1;
 c.beginPath();c.moveTo(28,10);c.lineTo(34,-4);c.lineTo(38,10);c.closePath();c.fill();c.stroke();
 c.restore();
}

function drawMichiCampPod(c,z){
 c.save();
 c.translate(z.x+82,z.y-10);
 c.fillStyle='#231238';c.strokeStyle='#e5c2ff';c.lineWidth=2.2;
 c.beginPath();c.arc(0,0,24,Math.PI*0.3,Math.PI*1.7);
 c.quadraticCurveTo(-8,0,0,24*Math.sin(Math.PI*0.3));
 c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffb6e4';c.beginPath();c.arc(-18,12,9,0,Math.PI*2);c.fill();
 c.strokeStyle='#ffffff';c.lineWidth=1.2;c.stroke();
 c.fillStyle='#f0c4ff';c.strokeStyle='#ffffff';c.lineWidth=1;
 c.beginPath();c.moveTo(22,12);c.lineTo(28,-4);c.lineTo(34,12);c.closePath();c.fill();c.stroke();
 c.restore();
}

function drawDragonCampPod(c,z){
 c.save();
 c.translate(z.x+84,z.y-10);
 c.fillStyle='#230c08';c.strokeStyle='#ff6b3d';c.lineWidth=2.2;
 c.beginPath();c.arc(0,0,24,Math.PI*0.3,Math.PI*1.7);
 c.quadraticCurveTo(-8,0,0,24*Math.sin(Math.PI*0.3));
 c.closePath();c.fill();c.stroke();
 c.fillStyle='#ff5020';c.beginPath();c.arc(-18,10,9,0,Math.PI*2);c.fill();
 c.strokeStyle='#ffe885';c.lineWidth=1.2;c.stroke();
 c.fillStyle='#ffd862';c.strokeStyle='#ffffff';c.lineWidth=1;
 c.beginPath();c.moveTo(22,12);c.lineTo(28,-4);c.lineTo(34,12);c.closePath();c.fill();c.stroke();
 c.restore();
}

function drawDinoCampPod(c,z){
 c.save();
 c.translate(z.x-84,z.y-10);
 c.fillStyle='#1c1006';c.strokeStyle='#81c784';c.lineWidth=2.2;
 c.beginPath();c.arc(0,0,24,Math.PI*0.3,Math.PI*1.7);
 c.quadraticCurveTo(-8,0,0,24*Math.sin(Math.PI*0.3));
 c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffb74d';c.beginPath();c.arc(-18,10,9,0,Math.PI*2);c.fill();
 c.strokeStyle='#ffffff';c.lineWidth=1.2;c.stroke();
 c.restore();
}

// Pizza & Frita · PUERTO DEL BANQUETE: one harbour, two kitchens.
// Left: Pizza's brick wood-fired oven (tomato, mozzarella, basil). Right:
// Frita's navy diner kiosk with a ketchup-and-white awning and neon sign.
// Between them festoon lights, in front a pier with a bobbing fishing boat,
// tomato crates and basil pots. Flat colours only; motion is a deterministic
// function of t and stops entirely with reduced motion.
export const KITCHEN_HARBOR_PALETTE=Object.freeze({brick:'#a4462e',brick2:'#7e3222',mouth:'#1c0a08',fire:'#ff8a2a',fire2:'#ffd24a',basil:'#3f9a3a',tomato:'#e0452c',cream:'#fff4dc',navy:'#1f3a8a',navy2:'#14245a',ketchup:'#d8231c',neon:'#5fd0ff',wood:'#a8743e',wood2:'#7a5028',sea:'#2a7f96'});
function drawKitchenHarbor(c,z,t=0,reduce=false){
 const K=KITCHEN_HARBOR_PALETTE,T=reduce?0:t,TAU=Math.PI*2;
 // pier + boat on the sea-side (south-east)
 c.save();c.translate(z.x+96,z.y+96);
 c.fillStyle=K.wood2;c.fillRect(-6,-10,56,12);for(let i=0;i<4;i++){c.fillStyle=K.wood;c.fillRect(-4+i*14,-10,11,12);c.fillStyle=K.wood2;c.fillRect(i*14,2,4,16);}
 const bob=Math.sin(T*1.6)*2.4,roll=Math.sin(T*1.6+.8)*.05;
 c.save();c.translate(80,8+bob);c.rotate(roll);
 c.fillStyle=K.cream;c.beginPath();c.moveTo(-30,-6);c.lineTo(30,-6);c.lineTo(22,8);c.lineTo(-22,8);c.closePath();c.fill();
 c.fillStyle=K.ketchup;c.fillRect(-28,-6,56,4);c.fillStyle=K.navy;c.fillRect(-4,-30,3,24);
 c.fillStyle=K.cream;c.beginPath();c.moveTo(-1,-30);c.lineTo(16,-12);c.lineTo(-1,-12);c.closePath();c.fill();
 c.restore();
 c.strokeStyle='#bfeef0';c.globalAlpha=.5;c.lineWidth=1.5;for(let i=0;i<3;i++){const r=(T*12+i*14)%42;c.beginPath();c.ellipse(80,16,20+r,4+r*.15,0,0,TAU);c.globalAlpha=.5*(1-r/42);c.stroke();}
 c.globalAlpha=1;c.restore();
 // Pizza's wood-fired oven (north-west)
 const ox=z.x-112,oy=z.y-30;
 c.fillStyle=K.brick2;c.fillRect(ox-50,oy-6,100,12);
 c.fillStyle=K.brick;c.beginPath();c.arc(ox,oy-6,46,Math.PI,0);c.closePath();c.fill();
 c.strokeStyle=K.brick2;c.lineWidth=2;for(const r of [18,30,40]){c.beginPath();c.arc(ox,oy-6,r,Math.PI*1.08,Math.PI*1.92);c.stroke();}
 c.fillStyle=K.mouth;c.beginPath();c.arc(ox,oy-6,19,Math.PI,0);c.closePath();c.fill();
 const flick=.75+.25*Math.sin(T*9);
 for(let i=-2;i<=2;i++){c.fillStyle=i%2?K.fire:K.fire2;c.globalAlpha=flick;c.beginPath();c.moveTo(ox+i*6-5,oy-6);c.lineTo(ox+i*6+Math.sin(T*7+i)*1.5,oy-18-(2-Math.abs(i))*4*flick);c.lineTo(ox+i*6+5,oy-6);c.fill();}
 c.globalAlpha=.22*flick;c.fillStyle=K.fire2;c.beginPath();c.arc(ox,oy-10,30,0,TAU);c.fill();c.globalAlpha=1;
 c.fillStyle=K.brick2;c.fillRect(ox+18,oy-66,14,26);
 for(let i=0;i<4;i++){const life=reduce?.2+i*.2:((T*.35+i/4)%1);c.globalAlpha=(1-life)*.45;c.fillStyle='#e8e0d8';c.beginPath();c.arc(ox+25+Math.sin(life*5+i)*6,oy-72-life*44,5+life*10,0,TAU);c.fill();}
 c.globalAlpha=1;
 // basil pots + tomato crate by the oven
 for(const [px,py] of [[ox-62,oy+10],[ox+56,oy+12]]){c.fillStyle='#b8643a';c.fillRect(px-7,py-8,14,10);for(let k=-1;k<=1;k++){c.fillStyle=K.basil;c.beginPath();c.ellipse(px+k*4,py-12-Math.abs(k)*-2+Math.sin(T*1.2+k)*.6,4,6,k*.5,0,TAU);c.fill();}}
 c.fillStyle=K.wood;c.fillRect(z.x-170,z.y+30,30,16);for(let k=0;k<3;k++){c.fillStyle=K.tomato;c.beginPath();c.arc(z.x-164+k*9,z.y+28,5,0,TAU);c.fill();}
 // Frita's navy diner kiosk (north-east)
 const kx=z.x+112,ky=z.y-28;
 c.fillStyle=K.navy;c.fillRect(kx-38,ky-44,76,50);
 c.fillStyle=K.navy2;c.fillRect(kx-30,ky-34,60,20);
 c.fillStyle='#ffd36a';for(let i=0;i<5;i++)c.fillRect(kx-24+i*11,ky-30+((i*3)%4),4,14);
 for(let i=0;i<8;i++){c.fillStyle=i%2?K.cream:K.ketchup;c.beginPath();c.moveTo(kx-44+i*11,ky-46);c.lineTo(kx-33+i*11,ky-46);c.lineTo(kx-34+i*11,ky-36);c.quadraticCurveTo(kx-38.5+i*11,ky-32,kx-43+i*11,ky-36);c.closePath();c.fill();}
 const neon=Math.sin(T*5)>-.8?1:.35;
 c.globalAlpha=.25*neon;c.fillStyle=K.neon;c.beginPath();c.arc(kx,ky-62,16,0,TAU);c.fill();c.globalAlpha=neon;
 c.strokeStyle=K.neon;c.lineWidth=2.4;c.beginPath();c.moveTo(kx-6,ky-54);c.lineTo(kx-4,ky-70);c.lineTo(kx+7,ky-70);c.moveTo(kx-5,ky-62);c.lineTo(kx+4,ky-62);c.stroke();c.globalAlpha=1;
 c.fillStyle='#f4ece0';c.fillRect(kx-38,ky+6,76,5);for(let i=0;i<8;i++){c.fillStyle=i%2?K.ketchup:'#f4ece0';c.fillRect(kx-38+i*9.5,ky+6,9.5,5);}
 // festoon lights from chimney to kiosk sign
 c.strokeStyle='#4a3a38';c.lineWidth=1.2;c.beginPath();c.moveTo(ox+25,oy-60);c.quadraticCurveTo(z.x,z.y-40,kx-30,ky-50);c.stroke();
 for(let i=1;i<12;i++){const k=i/12,x=(1-k)*(1-k)*(ox+25)+2*k*(1-k)*z.x+k*k*(kx-30),y=(1-k)*(1-k)*(oy-60)+2*k*(1-k)*(z.y-40)+k*k*(ky-50);
  c.globalAlpha=.65+.35*Math.sin(T*3+i*1.9);c.fillStyle=[K.tomato,K.cream,K.basil,K.neon][i%4];c.beginPath();c.arc(x,y+3,3,0,TAU);c.fill();}
 c.globalAlpha=1;
}

function drawYomiCampPod(c,z){
 c.save();
 c.translate(z.x-84,z.y-10);
 c.fillStyle='#1e1438';c.strokeStyle='#ba68c8';c.lineWidth=2.2;
 c.beginPath();c.arc(0,0,22,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#ea80fc';c.beginPath();c.arc(0,-4,8,0,Math.PI*2);c.fill();
 c.restore();
}

function drawCuernoCampPod(c,z){
 c.save();
 c.translate(z.x-84,z.y-10);
 c.fillStyle='#061a22';c.strokeStyle='#80cbc4';c.lineWidth=2.2;
 c.beginPath();c.arc(0,0,22,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#80deea';c.beginPath();c.arc(0,-4,8,0,Math.PI*2);c.fill();
 c.restore();
}

export function drawFamilyIslands(c,t=0,reduce=false){
 c.fillStyle='#174762';c.fillRect(0,0,1400,660);
 const sea=c.createLinearGradient(0,0,1400,660);sea.addColorStop(0,'#236780');sea.addColorStop(1,'#10304c');c.fillStyle=sea;c.fillRect(0,0,1400,660);
 for(let i=0;i<80;i++){c.strokeStyle=i%3?'#9de7e314':'#a9e5e52a';c.lineWidth=2;c.beginPath();const x=(i*197)%1400,y=(i*83)%660;c.moveTo(x,y);c.quadraticCurveTo(x+18,y+4,x+38,y);c.stroke();}
 for(const z of FAMILY_ISLANDS){
  c.fillStyle='#78d7cd28';coast(c,z,12,1.09);c.fill();c.fillStyle='#173649';coast(c,z,30);c.fill();c.fillStyle=z.sand;coast(c,z,9);c.fill();c.fillStyle=z.color;coast(c,z,0,.91);c.fill();
  c.strokeStyle='#e3d6ad80';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(z.x-105,z.y+10);c.quadraticCurveTo(z.x,z.y-28,z.x+100,z.y+15);c.stroke();
  c.fillStyle='#e7f2d9';c.font='600 14px Outfit,sans-serif';c.textAlign='center';c.fillText(z.name,z.x,z.y+z.ry+22);
  if(z.id==='aloha'){
   drawAlohaCamp(c,z);
   drawStitchoCampPod(c,z);
  }else if(z.id==='kitchen'){
   drawKitchenHarbor(c,z,t,reduce);
  }else if(z.id==='fossil'){
   c.fillStyle='#655d65';c.beginPath();c.moveTo(z.x-65,z.y-50);c.lineTo(z.x-25,z.y-155);c.lineTo(z.x+30,z.y-155);c.lineTo(z.x+90,z.y-50);c.fill();c.strokeStyle='#f2a475';c.lineWidth=7;c.beginPath();c.moveTo(z.x-25,z.y-152);c.lineTo(z.x+5,z.y-130);c.lineTo(z.x+30,z.y-152);c.stroke();c.strokeStyle='#e5d5b2';c.lineWidth=10;c.beginPath();c.arc(z.x-120,z.y-25,38,Math.PI,0);c.stroke();
   drawDragonCampPod(c,z);
   drawDinoCampPod(c,z);
  }else if(z.id==='moon'){
   for(let j=0;j<4;j++){c.strokeStyle=['#edb8d0','#ead69b','#b4d7ba','#b1c8e4'][j];c.lineWidth=6;c.beginPath();c.arc(z.x,z.y-15,60+j*7,Math.PI,Math.PI*2);c.stroke();}
   c.fillStyle='#fff1bc';c.beginPath();c.arc(z.x-150,z.y-65,18,0,Math.PI*2);c.fill();
   drawMichiCampPod(c,z);
   drawCuernoCampPod(c,z);
  }else{
   c.strokeStyle='#66567f';c.lineWidth=10;c.beginPath();c.moveTo(z.x-75,z.y-35);c.lineTo(z.x-75,z.y-110);c.lineTo(z.x+75,z.y-110);c.lineTo(z.x+75,z.y-35);c.stroke();c.strokeStyle='#e9d19d';c.lineWidth=2;c.beginPath();c.moveTo(z.x-145,z.y-90);c.quadraticCurveTo(z.x,z.y-60,z.x+145,z.y-90);c.stroke();for(let j=0;j<7;j++){c.fillStyle=j%2?'#eab8c1':'#f0d49e';c.fillRect(z.x-140+j*45,z.y-83,12,18);}
   drawChispinCampPod(c,z);
   drawYomiCampPod(c,z);
  }
 }
}

export function islandForHero(id){return FAMILY_ISLANDS.find(z=>z.heroes.includes(id));}

export function pairedScene(id,selected,seconds){
 const island=islandForHero(selected);if(!island?.heroes.includes(id))return null;
 if(island.id==='aloha'){
  if(selected==='stitcho'){
   // Dedicated Stitcho protagonist choreography
   const isStitcho=id==='stitcho',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
   return {
    pose:act===0?'idle':act===1?(isStitcho?'run':'jump'):(isStitcho?'cast':'victory'),
    dx:act===1?Math.sin(seconds*Math.PI*1.4)*(isStitcho?14:-8):0,
    dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.4))*(isStitcho?16:10):0,
    performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
   };
  }
  // Canonical Kilo protagonist choreography
  const lead=id==='kilo',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(lead?'cast':'jump'):'victory',
   dx:act===1?Math.sin(seconds*Math.PI)*(lead?8:-12):0,
   dy:act===1&&!lead?-Math.abs(Math.sin(seconds*Math.PI))*18:0,
   ...(lead?{performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:act===2?2+seconds-7:seconds}}:{})
  };
 }
 if(island.id==='moon'&&selected==='cat'){
  const isMichi=id==='cat',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isMichi?'run':'jump'):(isMichi?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.3)*(isMichi?12:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.3))*(isMichi?18:8):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='storm'&&selected==='chispin'){
  const isChispin=id==='chispin',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isChispin?'run':'jump'):(isChispin?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.5)*(isChispin?15:-10):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.5))*(isChispin?14:12):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='fossil'&&selected==='dragon'){
  const isDragon=id==='dragon',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isDragon?'jump':'run'):(isDragon?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.2)*(isDragon?16:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.2))*(isDragon?20:6):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='fossil'&&selected==='dino'){
  const isDino=id==='dino',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isDino?'run':'jump'):(isDino?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.2)*(isDino?14:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.2))*(isDino?16:10):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='kitchen'&&selected==='frita'){
  const isFrita=id==='frita',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isFrita?'run':'jump'):(isFrita?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.4)*(isFrita?16:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.4))*(isFrita?14:8):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='kitchen'&&selected==='pizza'){
  const isPizza=id==='pizza',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isPizza?'run':'jump'):(isPizza?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.3)*(isPizza?14:-10):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.3))*(isPizza?16:10):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='storm'&&selected==='yomi'){
  const isYomi=id==='yomi',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isYomi?'run':'jump'):(isYomi?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.2)*(isYomi?12:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.2))*(isYomi?16:8):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 if(island.id==='moon'&&selected==='cuerno'){
  const isCuerno=id==='cuerno',act=seconds<3?0:seconds<7?1:seconds<10?2:3;
  return {
   pose:act===0?'idle':act===1?(isCuerno?'run':'jump'):(isCuerno?'cast':'victory'),
   dx:act===1?Math.sin(seconds*Math.PI*1.3)*(isCuerno?14:-8):0,
   dy:act===1?-Math.abs(Math.sin(seconds*Math.PI*1.3))*(isCuerno?18:8):0,
   performance:{kind:act===0?'entrance':act===1?'dance':act===2?'relic':'family',time:seconds}
  };
 }
 const phase=Math.min(2,Math.floor(seconds/4)),lead=id===island.heroes[0],wave=Math.sin(seconds*Math.PI);
 const poses={aloha:['cast','jump'],kitchen:['run','jump'],fossil:['jump','cast'],moon:['jump','cast'],storm:['cast','jump']};
 return {pose:phase===0?'idle':phase===2?'victory':poses[island.id][lead?0:1],dx:phase===1?wave*(lead?16:-16):0,dy:phase===1&&!lead?-Math.abs(wave)*22:0};
}
