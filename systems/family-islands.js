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

export function drawFamilyIslands(c){
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
   c.fillStyle='#b77758';c.beginPath();c.arc(z.x,z.y-60,48,Math.PI,0);c.lineTo(z.x+48,z.y-26);c.lineTo(z.x-48,z.y-26);c.fill();c.fillStyle='#483d47';c.fillRect(z.x-22,z.y-60,44,34);c.fillStyle='#ffbd78';c.fillRect(z.x-14,z.y-47,28,17);c.fillStyle='#eee0aa';c.fillRect(z.x+105,z.y-75,50,45);c.fillStyle='#d48670';c.fillRect(z.x+98,z.y-83,65,12);
  }else if(z.id==='fossil'){
   c.fillStyle='#655d65';c.beginPath();c.moveTo(z.x-65,z.y-50);c.lineTo(z.x-25,z.y-155);c.lineTo(z.x+30,z.y-155);c.lineTo(z.x+90,z.y-50);c.fill();c.strokeStyle='#f2a475';c.lineWidth=7;c.beginPath();c.moveTo(z.x-25,z.y-152);c.lineTo(z.x+5,z.y-130);c.lineTo(z.x+30,z.y-152);c.stroke();c.strokeStyle='#e5d5b2';c.lineWidth=10;c.beginPath();c.arc(z.x-120,z.y-25,38,Math.PI,0);c.stroke();
   drawDragonCampPod(c,z);
  }else if(z.id==='moon'){
   for(let j=0;j<4;j++){c.strokeStyle=['#edb8d0','#ead69b','#b4d7ba','#b1c8e4'][j];c.lineWidth=6;c.beginPath();c.arc(z.x,z.y-15,60+j*7,Math.PI,Math.PI*2);c.stroke();}
   c.fillStyle='#fff1bc';c.beginPath();c.arc(z.x-150,z.y-65,18,0,Math.PI*2);c.fill();
   drawMichiCampPod(c,z);
  }else{
   c.strokeStyle='#66567f';c.lineWidth=10;c.beginPath();c.moveTo(z.x-75,z.y-35);c.lineTo(z.x-75,z.y-110);c.lineTo(z.x+75,z.y-110);c.lineTo(z.x+75,z.y-35);c.stroke();c.strokeStyle='#e9d19d';c.lineWidth=2;c.beginPath();c.moveTo(z.x-145,z.y-90);c.quadraticCurveTo(z.x,z.y-60,z.x+145,z.y-90);c.stroke();for(let j=0;j<7;j++){c.fillStyle=j%2?'#eab8c1':'#f0d49e';c.fillRect(z.x-140+j*45,z.y-83,12,18);}
   drawChispinCampPod(c,z);
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
 const phase=Math.min(2,Math.floor(seconds/4)),lead=id===island.heroes[0],wave=Math.sin(seconds*Math.PI);
 const poses={aloha:['cast','jump'],kitchen:['run','jump'],fossil:['jump','cast'],moon:['jump','cast'],storm:['cast','jump']};
 return {pose:phase===0?'idle':phase===2?'victory':poses[island.id][lead?0:1],dx:phase===1?wave*(lead?16:-16):0,dy:phase===1&&!lead?-Math.abs(wave)*22:0};
}
