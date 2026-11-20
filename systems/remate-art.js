// Remate I illustrations. Their origin, facing and phase come from combat.
const TAU=2*Math.PI;
const colors={
 kilo:['#ef9ccc','#ffdc92'],stitcho:['#6059f2','#8ff7ff'],chispin:['#f49b58','#fffa9e'],
 cat:['#b352a5','#ffc7f2'],dragon:['#d43f40','#ffc06d'],dino:['#678b54','#dcfa9c'],
 frita:['#c16a36','#ffdc80'],pizza:['#c65343','#ffe29a'],yomi:['#a9527c','#ffcb8c'],
 ia:['#497cbb','#8ff9e9'],cuerno:['#9a87df','#fff2c9'],nacar:['#4a93c2','#a3fff2']
};

function drawSilhouette(c,id){
 switch(id){
 case 'kilo':
  for(let i=0;i<5;i++){
   const a=-1.34+i*.48,x=Math.cos(a)*.83,y=Math.sin(a)*.79;
   c.moveTo(x*.5,y*.5);c.quadraticCurveTo(x-.1,y-.32,x+.12,y);
   c.quadraticCurveTo(x+.14,y+.23,x*.5,y*.5);
  }
  break;
 case 'stitcho':
  c.ellipse(.21,0,.7,.55,-.29,-1.16,2.05);
  c.moveTo(.95,0);c.quadraticCurveTo(.39,.46,-.06,.1);
  c.lineTo(.1,-.11);c.quadraticCurveTo(.52,.23,.95,0);
  break;
 case 'chispin':
  c.moveTo(-.06,.5);c.lineTo(.31,-.24);c.lineTo(.48,.05);c.lineTo(.94,-.64);
  c.lineTo(.7,.03);c.lineTo(.56,-.09);c.lineTo(.31,.43);c.lineTo(.21,.16);c.closePath();
  break;
 case 'cat':
  for(const gap of [-.19,0,.19]){
   c.moveTo(-.07,.33+gap);c.quadraticCurveTo(.61,.4+gap,.93,-.48+gap);
   c.quadraticCurveTo(.69,.04+gap,-.07,.33+gap);
  }
  break;
 case 'dragon':
  c.moveTo(-.17,-.46);c.bezierCurveTo(.21,-.39,.17,.34,.96,.48);
  c.quadraticCurveTo(.47,.6,.34,.26);
  c.quadraticCurveTo(.06,.34,-.17,-.46);
  break;
 case 'dino':
  c.moveTo(-.21,.38);c.lineTo(.05,.06);c.lineTo(.32,.34);c.lineTo(.53,-.17);
  c.lineTo(.74,.16);c.lineTo(.89,-.42);c.lineTo(.95,.36);c.lineTo(.57,.62);
  c.lineTo(.44,.47);c.lineTo(.14,.59);c.closePath();
  break;
 case 'frita':
  c.moveTo(-.36,.36);c.quadraticCurveTo(.3,.67,.95,.24);
  c.quadraticCurveTo(.72,.66,.13,.64);c.quadraticCurveTo(-.22,.59,-.36,.36);
  for(const [x,y] of [[.3,.19],[.61,.02],[.81,-.18]]){
   c.moveTo(x,y);c.lineTo(x+.1,y-.17);c.lineTo(x+.17,y-.07);c.lineTo(x+.08,y+.03);c.closePath();
  }
  break;
 case 'nacar':
  c.moveTo(-.26,.43);c.bezierCurveTo(.23,.55,.39,-.7,.88,-.49);
  c.quadraticCurveTo(.65,-.39,.61,-.09);
  c.bezierCurveTo(.49,.39,.04,.69,-.26,.43);
  for(const [x,y,r] of [[.08,.31,.09],[.43,-.24,.08],[.69,-.62,.09]]){
   c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);
  }
  break;
 case 'yomi':
  c.moveTo(-.17,.41);c.quadraticCurveTo(.29,-.47,.93,-.27);
  c.quadraticCurveTo(.45,-.13,-.17,.41);
  c.moveTo(.47,-.28);c.lineTo(.71,-.5);c.lineTo(.86,-.35);c.lineTo(.63,-.09);c.closePath();
  break;
 case 'ia':
  c.moveTo(-.16,0);c.lineTo(.39,-.56);c.lineTo(.96,0);c.lineTo(.39,.56);c.closePath();
  c.moveTo(.02,0);c.lineTo(.32,0);c.lineTo(.46,-.25);c.lineTo(.75,-.25);
  break;
 case 'cuerno':
  for(let i=0;i<3;i++){
   const gap=(i-1)*.17;
   c.moveTo(-.22,gap+.05);c.quadraticCurveTo(.48,gap+.11,.98,gap-.17);
   c.quadraticCurveTo(.58,gap+.21,-.22,gap+.05);
  }
  break;
 case 'pizza':
  c.moveTo(-.55,-.48);c.quadraticCurveTo(-.78,0,-.55,.48);
  c.quadraticCurveTo(.02,.42,.88,0);c.quadraticCurveTo(.03,-.42,-.55,-.48);
  break;
 }
}

export function drawRemateSilhouette(ctx,id,{x,y,r,face=1,progress=0,stage='active',reduced=false}){
 const palette=colors[id];if(!palette||!(r>0))return;
 const k=Math.min(1,Math.max(0,progress));
 const width=r*(reduced?1:stage==='windup'?.47+k*.22:1);
 const height=r*(id==='dino'?.83:1);
 ctx.save();
 ctx.translate(x,y);ctx.scale(face*width,height);
 ctx.fillStyle=palette[0];ctx.strokeStyle=palette[1];ctx.lineJoin='round';ctx.lineCap='round';
 ctx.lineWidth=2.05/r;
 ctx.beginPath();
 drawSilhouette(ctx,id);
 ctx.globalAlpha=stage==='windup'?.12+k*.12:.32;
 ctx.fill();
 ctx.globalAlpha=stage==='windup'?.58:.93;ctx.stroke();
 ctx.restore();
}

export function drawReturningSlice(ctx,x,y,b,reduced){
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(b.vy,b.vx));
 drawRemateSilhouette(ctx,'pizza',{x:0,y:0,r:21,reduced});
 ctx.strokeStyle='#ffcf93';ctx.lineWidth=2.7;
 ctx.beginPath();ctx.moveTo(-12,-9);ctx.quadraticCurveTo(-17,0,-12,9);ctx.stroke();
 ctx.fillStyle='#cf6153';
 for(const [dx,dy] of [[-7,-4],[-5,5],[4,-1]]){
  ctx.beginPath();ctx.arc(dx,dy,2.15,0,TAU);ctx.fill();
 }
 if(b.returning){
  ctx.strokeStyle='#fff3ca';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-23,-7);ctx.lineTo(-17,0);ctx.lineTo(-23,7);ctx.stroke();
 }
 ctx.restore();
}
