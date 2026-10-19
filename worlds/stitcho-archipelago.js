// ARCHIPIÉLAGO DEL CAOS · a distinct lightweight procedural stage backdrop.
// No runtime image requests. Stable, authored parallax: electric sea, cliffs,
// floating island silhouettes, crash site, pulse towers and the final temple.
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=240)=>x>=-pad&&x<=w+pad;
function island(ctx,x,base,scale,col){
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-175*scale,base);
 ctx.bezierCurveTo(x-135*scale,base-65*scale,x-95*scale,base-85*scale,x-48*scale,base-72*scale);
 ctx.bezierCurveTo(x-8*scale,base-135*scale,x+65*scale,base-140*scale,x+104*scale,base-78*scale);
 ctx.lineTo(x+181*scale,base);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#a6efff45';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(x-125*scale,base-12);ctx.quadraticCurveTo(x,base-42*scale,x+120*scale,base-13);ctx.stroke();
}
function crystal(ctx,x,y,size,t,reduced){
 const bob=reduced?0:Math.sin(t*.045+x*.03)*5;
 ctx.save();ctx.translate(x,y+bob);ctx.fillStyle='#80f0ff';ctx.strokeStyle='#e9feff';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.5,-size*.2);ctx.lineTo(0,size);ctx.lineTo(-size*.5,-size*.2);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#dfffff88';ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.stroke();ctx.restore();
}
function wreck(ctx,x,y,phase){
 ctx.save();ctx.translate(x,y);ctx.rotate(-.14);
 ctx.fillStyle='#233c67';ctx.strokeStyle='#a0d5ff';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-88,0);ctx.quadraticCurveTo(-55,-52,0,-65);
 ctx.quadraticCurveTo(73,-35,100,0);ctx.lineTo(57,17);ctx.lineTo(-68,20);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#122441';ctx.beginPath();ctx.ellipse(6,-40,50,20,0,Math.PI,TAU);ctx.fill();
 for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#9de5ff':'#b8abff';ctx.fillRect(-53+i*24,-22,11,6);}
 ctx.strokeStyle='#e3c0ff';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-30,-55);ctx.lineTo(-50,-105);ctx.moveTo(35,-53);ctx.lineTo(53,-112);ctx.stroke();
 crystal(ctx,0,3,13,phase,false);ctx.restore();
}
function temple(ctx,x,y,t,reduced,tier){
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#142944';ctx.strokeStyle='#85eafa';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(-140,5);ctx.lineTo(-105,-225);ctx.lineTo(-40,-260);
 ctx.lineTo(28,-260);ctx.lineTo(120,-220);ctx.lineTo(143,5);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=tier>=3?'#f9a1e5':tier>=2?'#b9aaff':'#68d7ed';
 ctx.beginPath();ctx.ellipse(0,-152,62,88,0,0,TAU);ctx.fill();
 ctx.fillStyle='#0b2343';ctx.beginPath();ctx.ellipse(0,-152,40,61,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#a9eaff';ctx.lineWidth=3;
 for(let i=0;i<4;i++){const xx=-118+i*77;ctx.beginPath();ctx.moveTo(xx,-40);ctx.lineTo(xx,-100-i%2*35);ctx.stroke();}
 if(!reduced){ctx.globalAlpha=.4+.25*Math.sin(t*.09);ctx.strokeStyle='#fff5fd';ctx.lineWidth=2;
  for(let r=1;r<4;r++){ctx.beginPath();ctx.arc(0,-153,40+r*19,t*.014+r*.9,t*.014+r*.9+1.25);ctx.stroke();}}
 ctx.restore();
}
export function drawStitchoArchipelago(ctx,cam,t,width,height,{reducedMotion=false,tier=1,progress=0}={}){
 const W=Math.max(1,width),H=Math.max(1,height),cX=Number(cam?.x)||0,cY=Number(cam?.y)||0;
 const reduced=!!reducedMotion,time=reduced?0:t;
 ctx.save();
 // Indigo to petrol nightfall, never a generic Hoku beach recolor.
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#071c3b');sky.addColorStop(.56,'#17466a');sky.addColorStop(1,'#32678b');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Atmospheric aurora ribbons and three distant planetary moons.
 ctx.strokeStyle='#79e5f120';ctx.lineWidth=55;
 for(let i=0;i<3;i++){const y=80+i*52+Math.sin(time*.008+i)*12;
 ctx.beginPath();ctx.moveTo(-70,y+i*13);ctx.bezierCurveTo(W*.2,y-44,W*.7,y+65,W+80,y-12);ctx.stroke();}
 for(let i=0;i<3;i++){const px=W*(.15+i*.31)-cX*.015,py=110+(i%2)*70;
 ctx.fillStyle=['#c4e8ff','#b5acdb','#80dbe6'][i];ctx.globalAlpha=[.6,.28,.35][i];
 ctx.beginPath();ctx.arc(px,py,19+i*10,0,TAU);ctx.fill();}
 ctx.globalAlpha=1;
 // Ocean/horizon and foam, limited to viewport.
 const horizon=H*.70-cY*.018;
 const sea=ctx.createLinearGradient(0,horizon,0,H);
 sea.addColorStop(0,'#317394');sea.addColorStop(1,'#081f42');
 ctx.fillStyle=sea;ctx.fillRect(0,horizon,W,H-horizon);
 for(let layer=0;layer<3;layer++){
  for(let i=-1;i<Math.ceil(W/350)+2;i++){
   const x=i*350-wrap(cX*(.055+layer*.04),350);
   island(ctx,x,H*(.62+layer*.055)-cY*.017,.65+layer*.17,
     ['#173554','#174362','#194f70'][layer]);
  }
 }
 for(let i=0;i<45;i++){
  const x=wrap(i*167+time*(reduced?0:.12)-cX*.16,W+150)-75;
  const y=horizon+14+(i*79)%Math.max(20,H-horizon-25);
  ctx.strokeStyle=i%3?'#a8f5ef36':'#ccfeff64';ctx.lineWidth=i%3?1:2;
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+12,y-4,x+34,y);ctx.stroke();
 }
 // Placed world landmarks, all camera-relative with strict culling.
 const landmarks=[
  {x:500,type:'wreck',y:720},{x:1400,type:'spire',y:675},
  {x:2140,type:'spire',y:680},{x:2980,type:'spire',y:635},
  {x:3530,type:'temple',y:1134}
 ];
 for(const l of landmarks){
  const x=l.x-cX,y=l.y-cY;if(!visible(x,W,320)||y<-500||y>H+400)continue;
  if(l.type==='wreck')wreck(ctx,x,y,time);
  else if(l.type==='temple')temple(ctx,x,y,time,reduced,tier);
  else{
   ctx.fillStyle='#123550';ctx.strokeStyle='#92e3f3';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(x-53,y+15);ctx.lineTo(x-26,y-155);
   ctx.lineTo(x+8,y-228);ctx.lineTo(x+42,y-155);ctx.lineTo(x+60,y+15);ctx.closePath();
   ctx.fill();ctx.stroke();crystal(ctx,x+8,y-237,20,time,reduced);
  }
 }
 // Physical dock details communicate the chapter's horizontal route.
 for(const xx of [200,890,1730,2480,3310,3980]){
  const x=xx-cX,y=1134-cY;if(!visible(x,W,80))continue;
  ctx.strokeStyle='#7ed6ed';ctx.lineWidth=5;ctx.beginPath();
  ctx.moveTo(x-35,y);ctx.lineTo(x-35,y-52);ctx.lineTo(x+35,y-52);ctx.lineTo(x+35,y);ctx.stroke();
  ctx.fillStyle=progress>0?'#adf6ed':'#9b85d1';ctx.fillRect(x-40,y-57,80,7);
 }
 ctx.restore();
}
