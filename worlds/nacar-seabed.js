import {drawOceanPassage} from './michi-adventure-art.js';
import {pearlOpen,nacarDiscovered,nacarDiscoveryAvailable,nacarBossPattern,activeNacarRoute,nacarRouteAvailable,NACAR_ATTACK_NAMES} from '../systems/nacar-chapter.js';
import {drawSeaStar} from '../characters/art/nacar.js';
const TAU=Math.PI*2,oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
function drawGrotto(c,g,cam,t,W,H){
 const grotto=g.roomDef.grotto;
 if(!grotto)return;
 const {w,h}=grotto,x=grotto.x-cam.x,y=grotto.y-cam.y;
 if(x+w<0||x>W||y+h<0||y>H)return;
 const restored=nacarDiscovered(g,'vault-light');
 c.save();
 c.beginPath();c.rect(x,y,w,h);c.clip();
 const water=c.createLinearGradient(x,y,x,y+h);
 water.addColorStop(0,'#0a203c');
 water.addColorStop(.6,restored?'#275871':'#18364b');
 water.addColorStop(1,'#10243d');
 c.fillStyle=water;c.fillRect(x,y,w,h);
 // Carved ammonite fossils sit behind the physical cave surfaces.
 for(let i=0;i<4;i++){
  const cx=x+176+i*310,cy=y+110+(i%2)*89;
  c.strokeStyle=restored?'#7cb7bb5c':'#5f819949';c.lineWidth=3;
  c.beginPath();
  for(let j=0;j<=32;j++){
   const angle=j/32*TAU*2.6,r=2+j*2.05;
   const px=cx+Math.cos(angle)*r,py=cy+Math.sin(angle)*r*.8;
   if(j===0)c.moveTo(px,py);else c.lineTo(px,py);
  }
  c.stroke();
 }
 for(let i=0;i<17;i++){
  const px=x+25+i*74,depth=28+(i*53)%103;
  c.fillStyle=i%2?'#28475e':'#1f394e';
  c.beginPath();c.moveTo(px-27,y);c.lineTo(px+30,y);c.lineTo(px+5,y+depth);c.closePath();c.fill();
  const cy=y+h-48-(i*43)%120;
  const bright=restored?'#cceea4':'#93b6c9';
  const flank=12+(i*9)%16;
  const low=y+h;
  const glass=c.createLinearGradient(px,cy,px,low);
  glass.addColorStop(0,i%2?'#a294cb':'#78adb8');
  glass.addColorStop(1,i%2?'#4e526e':'#34586e');
  c.fillStyle=glass;
  c.beginPath();c.moveTo(px-flank,low);c.lineTo(px-flank*.8,cy+11);c.lineTo(px+3,cy-7);
  c.lineTo(px+flank,cy+10);c.lineTo(px+flank*.85,low);c.closePath();c.fill();
  c.fillStyle=i%2?'#cfade374':'#b6e3da78';
  c.beginPath();c.moveTo(px+3,cy-7);c.lineTo(px-flank*.8,cy+11);
  c.lineTo(px-2,low);c.lineTo(px+5,cy+21);c.closePath();c.fill();
  if(restored){
   const bloom=c.createRadialGradient(px+3,cy+2,1,px+3,cy+2,47);
   bloom.addColorStop(0,'#dfffb475');bloom.addColorStop(1,'#a8ecc000');
   c.fillStyle=bloom;c.fillRect(px-44,cy-45,94,94);
  }
  oval(c,px+3,cy+2,2.5,5,bright);
  for(let j=0;j<4;j++){
   const phase=(i*.37+j*.19+t*.0015)%1;
   oval(c,px+Math.sin(phase*TAU+j)*21,y+h-phase*h,1.5,2,restored?'#b6e7b377':'#87bfd44d');
  }
 }
 c.restore();
}

function drawOceanRuins(c,cam,W,H,t){
 const complexes=[
  {x:2030,y:1520,r:74,columns:4,base:'#2b7180',cap:'#6abaab'},
  {x:6850,y:1090,r:109,columns:4,base:'#36597b',cap:'#827dae'},
  {x:9500,y:1770,r:126,columns:5,base:'#373b61',cap:'#9a7ea7'},
 ];
 for(const {x:worldX,y:worldY,r,columns,base,cap} of complexes){
  const x=worldX-cam.x,y=worldY-cam.y;
  if(x< -600||x>W+600||y< -240||y>H+450)continue;
  for(let i=0;i<columns;i++){
   const px=x+(i-(columns-1)/2)*r*.92,top=y-r*(1.5+(i%2)*.38);
   c.fillStyle=base;c.fillRect(px-10,top+20,20,y-top-20);
   c.fillStyle=cap;c.fillRect(px-19,top+19,38,5);
   c.strokeStyle=base;c.lineWidth=9;c.beginPath();c.arc(px+r*.45,top+20,r*.45,Math.PI,TAU);c.stroke();
   for(let j=0;j<4;j++){
    const drift=Math.sin(i+j+t*.012)*8;
    oval(c,px+drift,top+42+j*27,2.4,4,'#a9e2d656');
   }
  }
 }
}

const OCEAN_PALETTES=[
 {at:0,top:[15,63,76],middle:[22,92,97],bottom:[7,29,47]},
 {at:3500,top:[16,47,67],middle:[29,69,86],bottom:[10,24,45]},
 {at:6720,top:[26,40,71],middle:[44,63,103],bottom:[14,19,43]},
 {at:10350,top:[30,25,56],middle:[44,46,88],bottom:[12,13,36]},
];

function oceanColor(x,key){
 const next=OCEAN_PALETTES.findIndex(p=>p.at>x);
 if(next<1){
  const p=OCEAN_PALETTES[next<0?OCEAN_PALETTES.length-1:0];
  return 'rgb('+p[key].join(',')+')';
 }
 const a=OCEAN_PALETTES[next-1],b=OCEAN_PALETTES[next];
 const mix=(x-a.at)/(b.at-a.at);
 return 'rgb('+a[key].map((v,i)=>Math.round(v+(b[key][i]-v)*mix)).join(',')+')';
}

function drawBlueDepth(c,cam,t,W,H){
 const light=Math.max(.29,1-(cam.y||0)/2300);
 for(let layer=0;layer<3;layer++){
  const parallax=[.07,.16,.28][layer],amp=44+layer*55;
  c.fillStyle=['#659bb416','#5392b91e','#143e5b66'][layer];
  c.beginPath();
  c.moveTo(0,H);
  for(let x=-40;x<=W+40;x+=40){
   const drift=x+cam.x*parallax;
   const y=H*(.51+layer*.13)+Math.sin(drift*.006+layer)*amp*.54+
    Math.sin(drift*.015+layer*6)*amp*.27-cam.y*.035*(layer+1);
   c.lineTo(x,y);
  }
  c.lineTo(W+40,H);c.closePath();c.fill();
 }
 c.save();
 c.globalAlpha=light*.58;
 for(let i=0;i<5;i++){
  const x=(i*269+96-cam.x*.19+t*.28)%(W+380);
  const px=x<0?x+W+380:x;
  const ray=c.createLinearGradient(px,0,px+105,H*.89);
  ray.addColorStop(0,'#b3fff42b');
  ray.addColorStop(.55,'#9feff311');
  ray.addColorStop(1,'#95d6ec00');
  c.fillStyle=ray;
  c.beginPath();c.moveTo(px-33,0);c.lineTo(px+21,0);c.lineTo(px+369,H);c.lineTo(px+105,H);c.fill();
 }
 c.restore();
}

export function drawNacarSeabed(c,g,cam,t,W,H){
 if(!g.roomDef?.nacarChapter)return false;t=g.reduceMotion?0:t;c.save();
 const location=cam.x+W*.46;
 const sky=c.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,oceanColor(location,'top'));
 sky.addColorStop(.46,oceanColor(location,'middle'));
 sky.addColorStop(1,oceanColor(location,'bottom'));
 c.fillStyle=sky;c.fillRect(0,0,W,H);
 drawBlueDepth(c,cam,t,W,H);
 for(let i=0;i<12;i++){const x=i*1050-cam.x*.35,y=H*.72+Math.sin(i*3)*100-cam.y*.08;c.strokeStyle='#17364c';c.lineWidth=65;c.beginPath();c.ellipse(x,y,170,310,-.12,Math.PI,TAU);c.stroke();}
 for(let i=0;i<25;i++){const x=((i*79.3-cam.x*.18+t*.12)%(W+60)+W+60)%(W+60)-30,y=((i*117.9-cam.y*.08-t*.25)%(H+60)+H+60)%(H+60)-30;oval(c,x,y,1.4,2.3,i%4?'#a5dacc44':'#ffe2af66');}
 for(let i=0;i<15;i++){const x=((i*183+t*.23-cam.x*.22)%(W+160)+W+160)%(W+160)-80,y=90+(i*113)%Math.max(100,H-150);c.fillStyle='#5f9caa66';c.beginPath();c.moveTo(x+8,y);c.quadraticCurveTo(x,y-5,x-8,y);c.lineTo(x-14,y-4);c.lineTo(x-14,y+4);c.lineTo(x-8,y);c.quadraticCurveTo(x,y+6,x+8,y);c.fill();}
 // World-anchored kelp and coral lie behind the actual collision platforms.
 for(let i=0;i<34;i++){const x=160+i*330-cam.x,y=1850-cam.y;if(x< -170||x>W+170)continue;for(let b=0;b<4;b++){const xx=x+b*21,h=60+(i*37+b*43)%210,sway=Math.sin(t*.018+i+b)*12;c.strokeStyle=b%2?'#347b7c':'#295c6d';c.lineWidth=7+b;c.beginPath();c.moveTo(xx,y);c.bezierCurveTo(xx-30,y-h*.3,xx+35,y-h*.6,xx+sway,y-h);c.stroke();}if(i%3===0){c.strokeStyle='#bd9db066';c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(x-20,y-70);c.moveTo(x-12,y-40);c.lineTo(x-54,y-65);c.moveTo(x-20,y-70);c.lineTo(x+8,y-95);c.stroke();}}
 // The wreck is a landmark, not a doorway: swim around and over its ribs.
 const wx=4550-cam.x,wy=1780-cam.y;if(wx> -900&&wx<W+900){c.fillStyle='#26394b';c.beginPath();c.moveTo(wx-650,wy-210);c.quadraticCurveTo(wx,wy+210,wx+650,wy-180);c.lineTo(wx+550,wy+20);c.lineTo(wx-550,wy+20);c.fill();for(let i=-4;i<=4;i++){c.strokeStyle='#486777';c.lineWidth=15;c.beginPath();c.moveTo(wx+i*110,wy+15);c.quadraticCurveTo(wx+i*140,wy-80,wx+i*135,wy-130-Math.abs(i)*16);c.stroke();}}
 drawOceanRuins(c,cam,W,H,t);
 drawGrotto(c,g,cam,t,W,H);
 c.restore();return true;
}
function drawDiscovery(c,g,d,cam,t){
 const x=d.x-cam.x,y=d.y-cam.y,width=g.viewW||1600,height=g.viewH||900;
 if(x< -140||x>width+140||y< -100||y>height+100)return;
 const found=nacarDiscovered(g,d.id);
 const active=nacarDiscoveryAvailable(g,d);
 if(d.kind==='shortcut'){
  if(active)drawOceanPassage(c,x,y+35,t,d.name.toUpperCase());
  return;
 }
 const color=found?'#83b6b6':active?'#ffe3b1':'#597c92';
 c.save();
 c.translate(x,y);
 oval(c,0,12,23,9,'#274956');
 c.fillStyle=color;
 if(d.id==='bell'){
  c.beginPath();c.moveTo(-14,7);c.quadraticCurveTo(-9,2,-8,-11);
  c.quadraticCurveTo(0,-22,8,-11);c.quadraticCurveTo(9,2,14,7);c.fill();
  oval(c,0,11,3,4,color);
 }else if(d.id==='log'){
  c.fillRect(-12,-12,24,20);c.fillStyle='#6e6163';c.fillRect(-1,-12,2,20);
  for(const i of [-6,0,6])c.fillRect(-8,i,6,1);
 }else if(d.kind==='refuge'){
  for(let i=-2;i<=2;i++)oval(c,i*6,-5-Math.cos(i)*7,4,10,color);
  oval(c,0,-16,3,3,'#fbf4dc');
 }else if(d.id==='route-tide'){
  c.fillRect(-14,-12,28,20);
  c.strokeStyle='#367e81';c.beginPath();c.moveTo(-9,3);c.quadraticCurveTo(3,-13,10,-3);c.stroke();
 }else if(d.id==='conch'){
  for(let i=0;i<6;i++)oval(c,10-i*4,3-i*2,4+i,3+i,color);
  oval(c,-9,-7,5,6,'#687a82');
 }else{
  c.fillRect(-10,-17,20,22);oval(c,0,-7,4,8,'#fff4c8');
 }
 if(active&&!found)oval(c,0,-25+Math.sin(t*.04)*3,2,3,'#f7ebd1');
 c.textAlign='center';
 c.font='600 11px sans-serif';
 c.fillStyle=color;
 c.fillText(d.name.toUpperCase(),0,33);
 c.restore();
}

function drawSwimRoutes(c,g,cam,t){
 const active=activeNacarRoute(g);
 c.save();
 c.textAlign='center';
 c.font='600 12px sans-serif';
 for(const route of g.roomDef.swimRoutes||[]){
  if(!nacarRouteAvailable(g,route))continue;
  const x=route.x-cam.x,y=route.y-cam.y;
  const gold=nacarDiscovered(g,'course-'+route.id+'-gold');
  const complete=nacarDiscovered(g,'course-'+route.id);
  if(x>=-130&&x<=(g.viewW||1600)+130){
   oval(c,x,y,18,20,gold?'#ebc981':complete?'#90cfbf':'#54849c');
   oval(c,x,y,11,14,'#153b51');
   oval(c,x,y,4,6,'#d5e7c8');
   c.fillStyle='#d9eee4';
   c.fillText(route.name.toUpperCase(),x,y+36);
   if(complete){
    const best=g.nacarTimes?.[route.id];
    c.fillText((gold?'ORO':'COMPLETADA')+(best?' · '+(best/60).toFixed(1)+' s':''),x,y-29);
   }
  }
 }
 if(active){
  const {run,route}=active;
  for(let i=run.ring;i<Math.min(route.rings.length,run.ring+2);i++){
   const [worldX,worldY]=route.rings[i],x=worldX-cam.x,y=worldY-cam.y;
   const next=i===run.ring;
   c.lineWidth=next?4:2;
   c.strokeStyle=next?'#fff0b6':'#93cfc780';
   c.beginPath();
   c.ellipse(x,y,44,44,0,0,TAU);c.stroke();
   if(next){
    c.fillStyle='#fff0b6';c.fillText(String(i+1),x,y+4);
    for(let j=0;j<4;j++){
     const angle=(j/4+t*.003)*TAU;
     oval(c,x+Math.cos(angle)*44,y+Math.sin(angle)*44,3,3,'#fff3ce');
    }
   }
  }
  const seconds=Math.max(0,(route.limit-(g.world1.tick-run.started))/60);
  const x=(g.viewW||1600)/2;
  c.fillStyle='#102b3de8';c.fillRect(x-110,104,220,28);
  c.fillStyle='#f6edd0';c.fillText((run.ring+1)+' / '+route.rings.length+'  ·  '+seconds.toFixed(1)+' s',x,122);
 }
 c.restore();
}

export function drawNacarChapter(c,g,cam,t){if(!g.roomDef?.nacarChapter)return false;t=g.reduceMotion?0:t;c.save();
 for(const s of g.world1?.stations||[]){const x=s.x-cam.x,y=s.y-cam.y;if(x< -120||x>(g.viewW||1600)+120)continue;const open=pearlOpen(g.world1.tick,s);oval(c,x,y+12,30,15,'#376d7c');c.fillStyle=s.done?'#bceade':open?'#ead6bc':'#5d8097';c.beginPath();c.arc(x,y,18,Math.PI,0);c.quadraticCurveTo(x+13,y+15,x,y+12);c.quadraticCurveTo(x-13,y+15,x-18,y);c.fill();oval(c,x,y-2,7,8,s.done?'#fff5d0':open?'#edf9e4':'#7296a4');c.textAlign='center';c.font='600 12px sans-serif';c.fillStyle='#cbe7de';c.fillText(s.done?'ESCUCHADA':open?'E · ESCUCHAR':'RESPIRA…',x,y-35);}
 for(const valve of g.roomDef.tides){
  const x=valve.x-cam.x,y=valve.y-cam.y;
  const up=g._nacarCurrents?.[valve.id];
  const direction=up?-1:1;
  const area=valve.area;
  if(area.x-cam.x>g.viewW+60||area.x+area.w<cam.x-60)continue;
  const water=c.createLinearGradient(area.x-cam.x,0,area.x+area.w-cam.x,0);
  water.addColorStop(0,'#b1f5e200');
  water.addColorStop(.5,up?'#9ef2d927':'#b3b4fb27');
  water.addColorStop(1,'#b1f5e200');
  c.fillStyle=water;
  c.fillRect(area.x-cam.x,area.y-cam.y,area.w,area.h);
  c.strokeStyle=up?'#a7ffdc76':'#d5c3ff79';c.lineWidth=2;
  for(let i=0;i<5;i++){
   const xx=area.x+area.w/2-cam.x;
   const yy=area.y+((i*263+direction*t*1.5)%area.h+area.h)%area.h-cam.y;
   c.beginPath();c.moveTo(xx-9,yy-direction*5);c.lineTo(xx,yy+direction*5);c.lineTo(xx+9,yy-direction*5);c.stroke();
  }
  oval(c,x,y,22,22,'#264758');
  c.strokeStyle='#b4d4bc';c.lineWidth=2;c.beginPath();c.arc(x,y,15,0,TAU);c.stroke();
  c.beginPath();
  c.moveTo(x,y-direction*9);c.lineTo(x,y+direction*10);
  c.moveTo(x-7,y+direction*3);c.lineTo(x,y+direction*10);c.lineTo(x+7,y+direction*3);
  c.stroke();
  c.textAlign='center';c.font='600 11px sans-serif';c.fillStyle='#deead7';
  c.fillText('E · INVERTIR CORRIENTE',x,y-31);
 }
 if(!g.onlineAdventure)drawSwimRoutes(c,g,cam,t);
 if(!g.onlineAdventure)for(const discovery of g.roomDef.discoveries||[])drawDiscovery(c,g,discovery,cam,t);
 if(!g.onlineAdventure)for(const exit of g.roomDef.oceanExits||[]){
  const x=exit.x-cam.x;
  if(x>=-120&&x<=(g.viewW||1600)+120)drawOceanPassage(c,x,exit.y-cam.y+35,t,'REGRESO A MICHI');
 }
 for(let i=0;i<10;i++)drawSeaStar(c,700+i*960-cam.x,1838-cam.y,10,0,i%2?'#d9b6bf':'#bddfc6');
 c.restore();return true;}
function drawAnemoneTrajectories(c,e,cam){
 const {attack,clock}=e._nacarBoss;
 const urgency=1-Math.max(0,Math.min(1,clock/65));
 c.save();
 c.globalAlpha=.36+urgency*.52;
 for(const shot of nacarBossPattern(e)){
  const x=shot.x-cam.x,y=shot.y-cam.y;
  const distance=attack===3?1640:attack===1?360:186;
  const count=attack===3?22:5;
  for(let i=1;i<=count;i++){
   const step=distance*i/count;
   oval(c,x+Math.cos(shot.angle)*step,y+Math.sin(shot.angle)*step,3+urgency*2,4,'#ffd1c1');
  }
  if(attack===3)oval(c,x,y,6,7,'#ffe0b4');
 }
 c.restore();
}

const BOSS_PALETTES=[
 ['#63899a','#b8c4aa','#ffe6bb','#244354'],
 ['#7c719c','#c9aac6','#fcd5c3','#322d50'],
 ['#755578','#ed9eab','#ffddb4','#462c4f'],
];

export function drawNacarBoss(c,e,cam,t,reduced){
 const b=e._nacarBoss;
 if(!b)return;
 const x=e.x+e.w/2-cam.x,y=e.y+e.h/2-cam.y,clock=reduced?0:t;
 const vulnerable=b.phase==='rest'&&e.damageWindowRemaining>0;
 const [root,rim,tip,inner]=BOSS_PALETTES[Math.max(0,Math.min(2,(b.tier||1)-1))];
 if(b.phase==='warn')drawAnemoneTrajectories(c,e,cam);
 c.save();
 c.translate(x,y);
 oval(c,0,8,78,78,inner+'66');
 // Long sensory tendrils behind the smaller protective petals.
 for(let i=0;i<16;i++){
  const angle=i*TAU/16;
  const wave=Math.sin(clock*.031+i*.64);
  const reach=(vulnerable?65:87)+(i%3)*6+wave*6;
  c.save();c.rotate(angle);
  c.lineCap='round';
  c.strokeStyle=inner;c.lineWidth=13;
  c.beginPath();c.moveTo(21,0);c.quadraticCurveTo(reach*.63,13+wave*9,reach,8);c.stroke();
  c.strokeStyle=i%2?rim:root;c.lineWidth=7;
  c.beginPath();c.moveTo(28,0);c.quadraticCurveTo(reach*.65,10+wave*9,reach,7);c.stroke();
  oval(c,reach,7,5,3.2,tip);
  c.restore();
 }
 const spread=vulnerable?49:37;
 for(let i=0;i<12;i++){
  c.save();c.rotate(i*TAU/12);
  c.fillStyle=i%2?root:rim;
  c.beginPath();c.moveTo(12,-8);
  c.bezierCurveTo(spread*.68,-19,spread+11,-10,spread+8,0);
  c.bezierCurveTo(spread+4,13,spread*.65,16,12,8);
  c.closePath();c.fill();
  c.strokeStyle=tip;c.lineWidth=1;
  c.beginPath();c.moveTo(spread*.53,-2);c.quadraticCurveTo(spread*.8,-5,spread+4,0);c.stroke();
  c.restore();
 }
 oval(c,0,0,vulnerable?27:19,vulnerable?24:16,inner);
 oval(c,0,1,vulnerable?16:7,vulnerable?13:4,vulnerable?'#fff4c7':'#9bb6b6');
 if(vulnerable){
  oval(c,0,-2,7,6,'#fffdf1');
  for(let i=0;i<5;i++){
   const angle=i*TAU/5;
   oval(c,Math.cos(angle)*19,Math.sin(angle)*17,2,2.8,tip);
  }
 }
 c.fillStyle='#142b40';c.fillRect(-65,-124,130,8);
 c.fillStyle=tip;c.fillRect(-65,-124,130*Math.max(0,e.hp/e.max),8);
 c.textAlign='center';c.fillStyle='#faead5';c.font='600 12px sans-serif';
 c.fillText('ANÉMONA DEL SILENCIO',0,-135);
 c.font='600 11px sans-serif';
 const instruction=vulnerable?'AHORA · NÚCLEO ABIERTO':b.phase==='rest'?'EL NÚCLEO SE CIERRA':b.phase==='warn'?NACAR_ATTACK_NAMES[b.attack].toUpperCase():'CORRIENTE HOSTIL';
 c.fillText(instruction,0,128);
 c.restore();
}

const oceanStoneNoise=i=>{
 const n=Math.sin(i*71.73+20.15)*43532.48;
 return n-Math.floor(n);
};

/** Every contact edge stays aligned to the rectangles used by swimming and projectiles. */
export function drawNacarTerrain(c,platforms,cam,W,H){
 let visible=0;
 c.save();
 for(const p of platforms){
  const x=p.x-cam.x,y=p.y-cam.y,w=p.w,h=p.h;
  if(x+w<0||x>W||y+h<0||y>H)continue;
  visible++;
  const vertical=h>w*2;
  const grotto=p.x>=9000&&p.y<750;
  const sand=p.y>1700&&!vertical;
  const top=sand?'#8b9288':grotto?'#6ba4a4':'#6e9c9b';
  const face=sand?'#3f646e':grotto?'#294f66':'#31586e';
  const shade=sand?'#233e55':grotto?'#182f4a':'#213a52';
  c.save();
  c.beginPath();c.rect(x,y,w,h);c.clip();
  const body=c.createLinearGradient(0,y,0,y+h);
  body.addColorStop(0,face);body.addColorStop(1,shade);
  c.fillStyle=body;c.fillRect(x,y,w,h);
  const from=Math.max(0,Math.floor((-x-44)/32));
  const until=Math.min(Math.ceil(w/32),Math.ceil((W-x+44)/32));
  if(!vertical){
   c.fillStyle=top;c.beginPath();c.moveTo(x+from*32,y);
   for(let k=from;k<=until;k++)c.lineTo(x+k*32,y);
   for(let k=until;k>=from;k--)c.lineTo(x+k*32,y+3+oceanStoneNoise(p.x+k)*6);
   c.closePath();c.fill();
   for(let k=from;k<until;k++){
    const noise=oceanStoneNoise(p.x+k*3),px=x+12+k*32;
    oval(c,px,y+18+noise*Math.min(28,h/3),2+noise*6,1.6+noise*1.8,'#a7bcc33c');
    if(k%3===1){
     c.fillStyle='#192e4659';c.beginPath();
     c.moveTo(px-22,y+h);c.lineTo(px+8,y+12+noise*15);c.lineTo(px+38,y+h);c.closePath();c.fill();
    }
   }
  }else{
   c.fillStyle=top;
   c.fillRect(x,y,3,h);c.fillRect(x+w-3,y,3,h);
   const first=Math.max(0,Math.floor((-y-40)/44));
   const last=Math.min(Math.ceil(h/44),Math.ceil((H-y+40)/44));
   for(let j=first;j<last;j++){
    const n=oceanStoneNoise(p.x+j),yy=y+j*44+17;
    c.fillStyle='#a9bfce34';c.beginPath();
    c.moveTo(x,yy+10);c.lineTo(x+w*(.27+n*.5),yy);c.lineTo(x+w,yy+14);c.lineTo(x+w*.7,yy+8);c.closePath();c.fill();
    oval(c,x+w*.47,yy+13,3,2,'#b7ddd34b');
   }
  }
  c.restore();
 }
 c.restore();
 return {visible,culled:platforms.length-visible,total:platforms.length};
}
