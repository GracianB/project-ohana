import {gardenHas,nearestGardenInteraction} from '../systems/michi-garden-life.js';
const TAU=Math.PI*2;
const line=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
function leaf(c,x,y,s,angle,col){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=col;c.beginPath();c.moveTo(-s,0);c.bezierCurveTo(-s*.2,-s*.6,s*.6,-s*.4,s,0);c.bezierCurveTo(s*.4,s*.6,-s*.5,s*.5,-s,0);c.fill();c.restore();}
function spiral(c,x,y,t,col){line(c,col,1.4,()=>{for(let i=0;i<32;i++){const a=i*.26+t,r=3+i*.7;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.42;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}});}
export function drawGardenPassage(c,a,x,y,ready,t=0){
 const edge=ready?'#b1d9b9':'#647580';c.save();c.translate(x,y);
 if(a.kind==='well'){
  oval(c,0,-11,43,15,'#142934');oval(c,0,-12,32,9,'#080e20');
  line(c,'#708d8a',8,()=>{c.ellipse(0,-10,44,16,0,0,TAU);});
  for(const s of[-1,1])line(c,'#7e8274',4,()=>{c.moveTo(s*33,-17);c.lineTo(s*33,-100);});
  line(c,'#b1a081',5,()=>{c.moveTo(-40,-98);c.quadraticCurveTo(0,-114,40,-98);});
  line(c,'#a7b3a0',1.5,()=>{c.moveTo(0,-106);c.lineTo(0,-25);});oval(c,0,-29,12,6,edge);
 }else if(a.kind==='mirror'){
  const glass=c.createLinearGradient(-25,-130,25,-4);glass.addColorStop(0,ready?'#b394c9':'#3a4256');glass.addColorStop(.4,'#536f8b');glass.addColorStop(1,'#d3b7a166');
  oval(c,0,-67,30,61,glass);line(c,edge,5,()=>{c.ellipse(0,-67,35,65,0,0,TAU);});
  line(c,'#e4ceb1',1.3,()=>{c.ellipse(0,-67,29,59,0,0,TAU);c.moveTo(-25,-65);c.lineTo(25,-65);});
  for(const s of[-1,1])line(c,'#788f8c',3,()=>{c.moveTo(s*17,-7);c.quadraticCurveTo(s*38,0,s*36,9);});
  if(ready)spiral(c,0,-70,t*.012,'#d1efdb');
 }else if(a.kind==='wind'){
  line(c,'#79a596',4,()=>{c.moveTo(0,0);c.quadraticCurveTo(-14,-35,0,-78);});
  for(let k=0;k<9;k++){const a=k*TAU/9+(ready?t*.009:0);line(c,edge,1.2,()=>{c.moveTo(0,-81);c.lineTo(Math.cos(a)*32,-81+Math.sin(a)*32);});oval(c,Math.cos(a)*32,-81+Math.sin(a)*32,5,3,'#e6dfba');}
  oval(c,0,-81,8,8,'#e8be83');for(const s of[-1,1])leaf(c,s*15,-25,22,s*.6,'#759c86');
 }else if(a.kind==='boat'){
  c.fillStyle='#473c57';c.beginPath();c.moveTo(-54,-10);c.quadraticCurveTo(0,44,56,-10);c.quadraticCurveTo(0,4,-54,-10);c.fill();
  line(c,'#bca48c',3,()=>{c.moveTo(-53,-10);c.quadraticCurveTo(0,8,55,-10);c.moveTo(2,5);c.lineTo(2,-100);});
  c.fillStyle=ready?'#e1d7bc':'#75858a';c.beginPath();c.moveTo(8,-96);c.quadraticCurveTo(55,-75+Math.sin(t*.02)*5,40,-14);c.lineTo(8,-17);c.fill();
 }else{
  // Thorn thresholds and the guardian's winged seal have distinct silhouettes.
  for(const s of[-1,1]){
   line(c,a.kind==='moth'?'#8a8194':'#536b68',9,()=>{c.moveTo(s*42,0);c.bezierCurveTo(s*32,-47,s*60,-93,s*7,-120);});
   for(let j=0;j<4;j++)leaf(c,s*(40-j*5),-20-j*23,a.kind==='moth'?24:17,s*(.4+j*.1),a.kind==='moth'?'#af91a6':'#749586');
  }
  if(!ready)for(let j=0;j<3;j++)line(c,'#7b7072',3,()=>{c.moveTo(-32,-25-j*25);c.quadraticCurveTo(4,-42-j*25,31,-20-j*25);});
  if(ready)oval(c,0,-107,5,8,'#e9dab7');
 }
 c.restore();
}
export function drawGardenBench(c,x,y,t,remembered){
 c.save();c.translate(x,y);for(const side of[-1,1])line(c,'#58757b',5,()=>{c.moveTo(side*38,0);c.lineTo(side*32,-31);c.lineTo(side*36,-54);});
 for(let i=0;i<3;i++){c.fillStyle=i%2?'#978b8a':'#756f7d';c.fillRect(-49,-56+i*9,98,6);}
 c.fillStyle='#aa998f';c.fillRect(-54,-28,108,8);
 c.fillStyle='#ca7e9b';c.beginPath();c.moveTo(2,-31);c.quadraticCurveTo(20,-38,38,-30);c.lineTo(39,-12+Math.sin(t*.015)*2);c.lineTo(29,-15);c.lineTo(27,-28);c.lineTo(2,-26);c.fill();
 oval(c,-23,-36,8,8,remembered?'#f2d9a8':'#8e9d95');c.restore();
}
function card(c,m,W,H){
 const width=Math.min(510,W-32),x=(W-width)/2,y=H<500?Math.max(78,H*.23):H<700&&W<720?108:H-(W<720?370:174),scale=W<480?13:15;
 const chars=Math.floor((width-32)/(scale*.52)),words=m.text.split(' '),lines=[];let current='';
 for(const w of words){if((current+w).length>chars&&current){lines.push(current);current='';}current+=w+' ';}if(current)lines.push(current);
 const h=50+lines.length*19;c.fillStyle='rgba(13,24,42,.94)';c.fillRect(x,y,width,h);c.fillStyle='#c4a483';c.fillRect(x,y,3,h);
 c.textAlign='left';c.font='600 12px sans-serif';c.fillStyle='#eacaad';c.fillText(m.title,x+17,y+24,width-32);
 c.font=scale+'px sans-serif';c.fillStyle='#e4e3d4';lines.forEach((text,i)=>c.fillText(text,x+17,y+46+i*19,width-32));
}
export function drawMichiGarden(c,g,cam,t,W,H){
 const r=g.roomDef?.michiSanctuary?.garden;if(!r)return;const time=g.reduceMotion?0:t,cx=cam.x||0,cy=cam.y||0,near=nearestGardenInteraction(g);
 c.save();c.lineCap='round';
 if(gardenHas(g,'rain')){
  const b=r.bridge,x=b.x-cx,y=b.y-cy;
  if(x<W+80&&x+b.w> -80&&y> -90&&y<H+90){
   for(let k=0;k<4;k++)line(c,k%2?'#8aa58b':'#536e72',5-k*.5,()=>{c.moveTo(x-12,y+8+k*4);c.bezierCurveTo(x+b.w*.3,y-5+k*5,x+b.w*.7,y+22-k*2,x+b.w+12,y+7+k*4);});
   for(let j=0;j<10;j++)leaf(c,x+j*b.w/10,y+12,12,j%2?.5:-.5,'#8ab096');
  }
 }
 for(const q of r.mechanisms){
  const x=q.x-cx,y=q.floor-cy;if(x< -100||x>W+100||y< -80||y>H+160)continue;
  if(q.kind==='bridge'){
   line(c,'#8e9c8a',3,()=>{c.moveTo(x,y);c.lineTo(x,y-48);});
   c.save();c.translate(x,y-52);c.rotate(gardenHas(g,'rain')?time*.006:0);
   line(c,'#b8a080',4,()=>c.arc(0,0,24,0,TAU));for(let j=0;j<6;j++){const a=j*TAU/6;line(c,'#77938d',2.5,()=>{c.moveTo(0,0);c.lineTo(Math.cos(a)*23,Math.sin(a)*23);});}oval(c,0,0,5,5,'#e4cb9d');c.restore();
  }else if(q.kind==='bell'){
   for(const s of[-1,1])line(c,'#6c777d',4,()=>{c.moveTo(x+s*30,y);c.quadraticCurveTo(x+s*36,y-89,x,y-99);});
   c.fillStyle='#a99090';c.beginPath();c.moveTo(x-22,y-31);c.quadraticCurveTo(x-15,y-85,x,y-78);c.quadraticCurveTo(x+15,y-85,x+22,y-31);c.fill();oval(c,x,y-29,24,5,'#d1b894');
   if(g._michiGardenHush>0)for(let j=0;j<3;j++){c.globalAlpha=.15;line(c,'#f1d9ae',1.5,()=>c.arc(x,y-51,40+j*22+Math.sin(time*.03)*4,0,TAU));}c.globalAlpha=1;
  }else{
   drawGardenPassage(c,{kind:'wind'},x,y,gardenHas(g,'wind'),time);
  }
 }
 for(const q of r.moments){const x=q.x-cx,y=q.floor-cy;if(x< -120||x>W+120||y< -100||y>H+100)continue;
  if(q.id==='bench')drawGardenBench(c,x,y,time,gardenHas(g,q.id));
  else{line(c,'#7d8e88',3,()=>{c.moveTo(x-28,y);c.quadraticCurveTo(x-12,y-30,x+9,y-24);c.lineTo(x+23,y);});oval(c,x,y-32,9,10,gardenHas(g,q.id)?'#ecd3a5':'#759994');}
 }
 if(gardenHas(g,'wind')){
  const w=r.wind,x=w.x-cx,y=w.y-cy;if(x<W+60&&x+w.w> -60&&y<H){c.globalAlpha=.36;for(let j=0;j<5;j++)line(c,'#a5dcc5',1,()=>{const xx=x+25+j*42;c.moveTo(xx,y+w.h);c.bezierCurveTo(xx+22,y+w.h*.7,xx-22,y+w.h*.3,xx,y);});c.globalAlpha=1;}
 }
 // The companions are earned by listening, not anonymous decorative particles.
 const count=r.moments.filter(q=>gardenHas(g,q.id)).length,p=g.player;
 if(p)for(let j=0;j<count;j++){const a=time*.018+j*2.1,x=p.x+p.w/2-cx-28-j*13+Math.sin(a)*7,y=p.y-cy-13+Math.cos(a)*7;
  oval(c,x,y,4.5,6,'#f4d9b1');for(const s of[-1,1])leaf(c,x+s*5,y-1,4,s*.4,'#c5e5d1');
 }
 if(near){const x=Math.max(65,Math.min(W-65,near.x-cx)),y=near.floor-cy-105;oval(c,x,y,13,13,'#173342');c.fillStyle='#ead6ac';c.textAlign='center';c.font='600 12px sans-serif';c.fillText('E',x,y+4);}
 if(g._michiGardenMoment)card(c,g._michiGardenMoment,W,H);
 c.restore();
}
