// ARCHIPIÉLAGO DEL CAOS — Stitcho's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero runtime image requests, zero heavy layout thrash.
// Atmospheric parallax: electric aurora sea, cosmic moons, alien starship wreckage,
// crackling energy spires, plasma conduits and the ancient Glitch Temple.
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=260)=>x>=-pad&&x<=w+pad;

function island(ctx,x,base,scale,col){
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-180*scale,base);
 ctx.bezierCurveTo(x-140*scale,base-68*scale,x-95*scale,base-90*scale,x-48*scale,base-75*scale);
 ctx.bezierCurveTo(x-8*scale,base-140*scale,x+68*scale,base-145*scale,x+108*scale,base-82*scale);
 ctx.lineTo(x+188*scale,base);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#a6efff45';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(x-130*scale,base-12);ctx.quadraticCurveTo(x,base-44*scale,x+125*scale,base-13);ctx.stroke();
}

function crystal(ctx,x,y,size,t,reduced){
 const bob=reduced?0:Math.sin(t*.045+x*.03)*5;
 ctx.save();ctx.translate(x,y+bob);
 ctx.fillStyle='#80f0ff';ctx.strokeStyle='#e9feff';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.5,-size*.2);ctx.lineTo(0,size);ctx.lineTo(-size*.5,-size*.2);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#dfffff99';ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.stroke();
 if(!reduced){
  ctx.fillStyle='#ffffff';ctx.globalAlpha=.4+.3*Math.sin(t*.1+x);
  ctx.beginPath();ctx.arc(0,0,size*.28,0,TAU);ctx.fill();
 }
 ctx.restore();
}

function wreck(ctx,x,y,phase,reduced){
 ctx.save();ctx.translate(x,y);ctx.rotate(-.13);
 // Main hull plating
 ctx.fillStyle='#1c3358';ctx.strokeStyle='#8cd4ff';ctx.lineWidth=3.5;
 ctx.beginPath();ctx.moveTo(-95,0);ctx.quadraticCurveTo(-60,-58,0,-70);
 ctx.quadraticCurveTo(80,-38,108,0);ctx.lineTo(62,18);ctx.lineTo(-72,21);ctx.closePath();ctx.fill();ctx.stroke();
 // Cockpit dome with alien glow
 ctx.fillStyle='#0f203a';ctx.beginPath();ctx.ellipse(8,-44,52,22,0,Math.PI,TAU);ctx.fill();
 ctx.strokeStyle='#7fe9ff';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='rgba(98,243,255,0.22)';ctx.beginPath();ctx.ellipse(8,-44,46,18,0,Math.PI,TAU);ctx.fill();
 // Broken wing / thruster unit
 ctx.fillStyle='#142744';ctx.beginPath();ctx.moveTo(-92,-6);ctx.lineTo(-135,-32);ctx.lineTo(-118,-45);ctx.lineTo(-78,-25);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#67b5eb';ctx.lineWidth=2;ctx.stroke();
 // Plasma thruster exhaust leak
 if(!reduced){
  ctx.fillStyle='rgba(128,240,255,0.45)';ctx.beginPath();
  const flicker=Math.sin(phase*.15)*4;
  ctx.ellipse(-132,-38,12+flicker,6,0.3,0,TAU);ctx.fill();
 }
 // Circuit vents
 for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#9de5ff':'#c49bff';ctx.fillRect(-56+i*24,-24,12,6);}
 // Communication antenna & glitch spikes
 ctx.strokeStyle='#e3c0ff';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-32,-58);ctx.lineTo(-54,-112);ctx.moveTo(38,-56);ctx.lineTo(58,-118);ctx.stroke();
 crystal(ctx,0,2,14,phase,reduced);
 ctx.restore();
}

function temple(ctx,x,y,t,reduced,tier){
 ctx.save();ctx.translate(x,y);
 // Heavy monolith foundation
 ctx.fillStyle='#10233d';ctx.strokeStyle='#82e4f6';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(-148,5);ctx.lineTo(-112,-235);ctx.lineTo(-44,-270);
 ctx.lineTo(32,-270);ctx.lineTo(128,-230);ctx.lineTo(152,5);ctx.closePath();ctx.fill();ctx.stroke();
 // Hexagonal core portal
 ctx.fillStyle=tier>=3?'#f99ee3':tier>=2?'#b7a5ff':'#62daf0';
 ctx.beginPath();ctx.ellipse(0,-158,68,94,0,0,TAU);ctx.fill();
 ctx.fillStyle='#081d38';ctx.beginPath();ctx.ellipse(0,-158,44,66,0,0,TAU);ctx.fill();
 // Temple energy conduits
 ctx.strokeStyle='#9fe8ff';ctx.lineWidth=3.5;
 for(let i=0;i<4;i++){const xx=-122+i*81;ctx.beginPath();ctx.moveTo(xx,-42);ctx.lineTo(xx,-106-i%2*38);ctx.stroke();}
 // Pulsing concentric containment fields
 if(!reduced){
  ctx.globalAlpha=.45+.28*Math.sin(t*.09);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.2;
  for(let r=1;r<4;r++){ctx.beginPath();ctx.arc(0,-158,44+r*20,t*.014+r*.9,t*.014+r*.9+1.35);ctx.stroke();}
 }
 ctx.restore();
}

export function drawStitchoArchipelago(ctx,cam,t,width,height,{reducedMotion=false,tier=1,progress=0}={}){
 const W=Math.max(1,width),H=Math.max(1,height),cX=Number(cam?.x)||0,cY=Number(cam?.y)||0;
 const reduced=!!reducedMotion,time=reduced?0:t;
 ctx.save();

 // Deep cosmic dusk: indigo into rich petrol nightfall
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#05152f');sky.addColorStop(.52,'#133f62');sky.addColorStop(1,'#2c5d80');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

 // Undulating atmospheric aurora ribbons
 ctx.strokeStyle='#79e5f122';ctx.lineWidth=50;
 for(let i=0;i<3;i++){
  const y=75+i*54+Math.sin(time*.008+i)*13;
  ctx.beginPath();ctx.moveTo(-80,y+i*14);ctx.bezierCurveTo(W*.22,y-48,W*.68,y+68,W+80,y-14);ctx.stroke();
 }
 ctx.strokeStyle='#ba9bff18';ctx.lineWidth=34;
 ctx.beginPath();ctx.moveTo(-50,110);ctx.bezierCurveTo(W*.35,60,W*.65,160,W+60,95);ctx.stroke();

 // Three distant planetary moons with glowing halos
 for(let i=0;i<3;i++){
  const px=W*(.14+i*.32)-cX*.014,py=105+(i%2)*72,r=20+i*11;
  ctx.fillStyle=['#c8eaff','#b9aedf','#7ee0ec'][i];
  ctx.globalAlpha=[.58,.26,.32][i];
  ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.fill();
  // Moon ring on the largest planet
  if(i===0){
   ctx.strokeStyle='#d5f3ff44';ctx.lineWidth=3;
   ctx.beginPath();ctx.ellipse(px,py,r*1.8,r*0.42,-0.35,0,TAU);ctx.stroke();
  }
 }
 ctx.globalAlpha=1;

 // Distant ocean horizon and twilight water gradient
 const horizon=H*.69-cY*.018;
 const sea=ctx.createLinearGradient(0,horizon,0,H);
 sea.addColorStop(0,'#2c6988');sea.addColorStop(.5,'#184568');sea.addColorStop(1,'#071a38');
 ctx.fillStyle=sea;ctx.fillRect(0,horizon,W,H-horizon);

 // Three layers of parallax island silhouettes
 for(let layer=0;layer<3;layer++){
  for(let i=-1;i<Math.ceil(W/350)+2;i++){
   const x=i*350-wrap(cX*(.055+layer*.04),350);
   island(ctx,x,H*(.62+layer*.055)-cY*.017,.65+layer*.17,
     ['#15314e','#173f5c','#184b6a'][layer]);
  }
 }

 // Ambient phosphorescent ocean foam
 for(let i=0;i<48;i++){
  const x=wrap(i*163+time*(reduced?0:.12)-cX*.16,W+150)-75;
  const y=horizon+14+(i*79)%Math.max(20,H-horizon-24);
  ctx.strokeStyle=i%3?'#a8f5ef36':'#ccfeff64';ctx.lineWidth=i%3?1:2;
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+13,y-4,x+36,y);ctx.stroke();
 }

 // Placed world landmarks with culling
 const landmarks=[
  {x:480,type:'wreck',y:720},
  {x:1420,type:'spire',y:675},
  {x:2150,type:'spire',y:680},
  {x:2990,type:'spire',y:635},
  {x:3560,type:'temple',y:1134}
 ];
 for(const l of landmarks){
  const x=l.x-cX,y=l.y-cY;if(!visible(x,W,340)||y<-500||y>H+400)continue;
  if(l.type==='wreck')wreck(ctx,x,y,time,reduced);
  else if(l.type==='temple')temple(ctx,x,y,time,reduced,tier);
  else{
   // Energy transmission spire
   ctx.fillStyle='#102e47';ctx.strokeStyle='#8de4f4';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(x-55,y+15);ctx.lineTo(-27+x,y-158);
   ctx.lineTo(x+8,y-232);ctx.lineTo(x+44,y-158);ctx.lineTo(x+62,y+15);ctx.closePath();
   ctx.fill();ctx.stroke();
   crystal(ctx,x+8,y-242,22,time,reduced);
  }
 }

 // Plasma conduit docks communicating the chapter's horizontal route
 for(const xx of [200,890,1730,2480,3310,3980]){
  const x=xx-cX,y=1134-cY;if(!visible(x,W,90))continue;
  ctx.strokeStyle='#7cd4eb';ctx.lineWidth=5;ctx.beginPath();
  ctx.moveTo(x-36,y);ctx.lineTo(x-36,y-54);ctx.lineTo(x+36,y-54);ctx.lineTo(x+36,y);ctx.stroke();
  ctx.fillStyle=progress>0?'#b0f8ee':'#9b84d2';ctx.fillRect(x-42,y-59,84,7);
 }

 ctx.restore();
}
