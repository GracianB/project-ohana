// Remate I illustrations. Their origin, facing and phase come from combat.
const TAU=2*Math.PI;
const colors={
 kilo:['#ef9ccc','#ffdc92'],stitcho:['#6059f2','#8ff7ff'],chispin:['#f49b58','#fffa9e'],
 cat:['#b352a5','#ffc7f2'],dragon:['#d43f40','#ffc06d'],dino:['#678b54','#dcfa9c'],
 frita:['#c16a36','#ffdc80'],pizza:['#c65343','#ffe29a'],yomi:['#a9527c','#ffcb8c'],
 ia:['#497cbb','#8ff9e9'],cuerno:['#9a87df','#fff2c9'],nacar:['#4a93c2','#a3fff2']
};

// Eight ornaments per remate, drawn in origin, body, edge, tip, wake, hit
// and recovery space. Coordinates are authored in hundredths of the attack radius.
const details={
 kilo:[
  [-18,4,-7,-12,4,1,-8,9,-18,4], [19,32,31,48,40,42], [33,-27,41,-38,47,-31],
  [37,6,49,-3,53,9,45,16,37,6], [73,-28,79,-42,84,-28,79,-19,73,-28],
  [-26,27,-20,19,-13,23], [0,-33,8,-15,21,-15,11,-3,16,13,0,5,-16,13,-11,-3,-21,-15,-8,-15,0,-33],
  [5,13,14,18,24,13,34,17,44,10]
 ],
 stitcho:[
  [-19,-8,-6,-8,-1,0,-6,8,-19,8], [12,30,28,44,42,45], [33,-17,48,-18,59,-8],
  [42,10,59,14,72,5], [75,-34,86,-25,82,-15], [-33,14,-21,14,-12,3],
  [-17,-12,-5,-22,12,-17,20,-2,10,13,-9,15,-17,-12], [0,-3,12,4,24,-3,37,4,48,-1]
 ],
 chispin:[
  [-19,4,-9,-7,-5,3,5,-6], [13,38,20,30,24,40], [25,18,39,-1,48,7,64,-14],
  [48,28,57,20,63,26], [83,-43,94,-58,96,-43], [-27,18,-15,11,-12,21,-3,8],
  [-21,13,-8,-19,1,-5,19,-24,7,4,21,1,5,27,-3,10,-21,13], [17,22,25,14,34,17,45,11]
 ],
 cat:[
  [-17,3,-10,-11,0,-9,4,-1,-4,7,-17,3], [22,35,31,35,40,32], [31,17,49,11,63,0],
  [30,-6,48,-14,62,-23], [73,-33,87,-52,91,-63], [-31,22,-22,20,-13,13],
  [-21,9,-8,3,-10,-17,-1,-18,4,-3,10,-16,19,-9,14,8,4,16,-21,9], [2,29,14,27,27,21]
 ],
 dragon:[
  [-21,-6,-10,-14,-4,-2,6,-10,1,4,-10,9], [22,34,34,44,46,45], [15,-20,29,0,43,11],
  [43,22,55,26,67,37], [71,36,87,42,95,50], [-27,-10,-18,-3,-11,10],
  [-21,10,-14,-9,-6,-3,0,-23,11,-6,20,-15,18,9,4,19,-21,10], [14,29,24,37,38,39,50,44]
 ],
 dino:[
  [-22,10,-17,-2,-8,-6,1,-2,4,10], [10,44,21,47,31,43], [43,23,52,7,58,22],
  [66,31,75,22,82,28], [85,-25,89,-39,92,-26], [-35,25,-25,24,-22,18,-10,18],
  [-21,13,-16,-7,-8,1,1,-20,10,-3,18,-12,24,9,12,20,-21,13], [11,33,22,30,33,35,47,31]
 ],
 frita:[
  [-20,15,-16,4,-8,7,-4,15,-20,15], [2,48,18,53,30,48], [29,41,43,40,54,36],
  [42,21,47,14,54,17,50,25,42,21], [77,12,87,8,94,4], [-32,28,-24,34,-12,32],
  [-21,0,-12,-4,-9,-17,2,-14,6,-2,16,-8,22,8,11,18,-9,16,-21,0], [14,46,30,51,50,46]
 ],
 pizza:[
  [-25,-17,-31,0,-25,17], [-39,-18,-44,0,-39,18], [-22,-15,1,0,-22,15],
  [-13,-9,-6,-6,-11,-1,-16,-4,-13,-9], [40,-6,51,0,40,6], [-56,-8,-47,0,-56,8],
  [-23,-12,22,0,-23,12,-17,0,-23,-12], [-36,25,-25,18,-16,18]
 ],
 yomi:[
  [-19,-2,-10,-13,-3,-2,-9,7,-19,-2], [14,24,25,12,40,7], [34,-10,46,-18,56,-19],
  [56,-32,65,-39,71,-33,62,-25,56,-32], [82,-26,91,-28,98,-24], [-25,23,-20,15,-14,21,-19,29,-25,23],
  [-14,-18,13,-16,16,15,-14,19,-14,-18,-4,-7,8,-7,-6,4,8,3,-3,12], [10,26,20,21,31,16,44,15]
 ],
 ia:[
  [-22,3,-11,-8,0,3,-11,14,-22,3], [16,18,29,18,37,28,52,28], [36,-4,47,-17,67,-17],
  [47,12,56,4,71,4,77,-4], [83,-11,96,0,83,11], [-35,-7,-24,-7,-17,-15,-9,-15],
  [-22,0,0,-23,23,0,0,22,-22,0,-11,0,-2,-9,6,0,14,0], [4,17,18,17,25,25,39,25]
 ],
 cuerno:[
  [-21,4,-12,-11,-1,4,-12,13,-21,4], [3,21,17,23,30,19], [29,-11,48,-10,69,-15],
  [32,13,51,10,72,3], [78,-16,97,-25,88,-11], [-26,21,-17,18,-8,14],
  [-23,10,-6,-5,1,-19,9,-5,22,-11,12,4,20,15,4,13,-7,20,-23,10], [7,25,20,22,36,17,47,14]
 ],
 nacar:[
  [-18,5,-18,-4,-11,-9,-4,-6,0,3,-6,10,-18,5], [5,39,18,39,33,28], [33,12,44,-5,49,-22],
  [57,-33,63,-40,71,-38,72,-33,67,-27,60,-27,57,-33], [78,-52,85,-62,94,-59,94,-48,85,-44,78,-52],
  [-28,27,-26,20,-17,16,-11,22,-13,29,-22,32,-28,27],
  [-24,2,-17,-15,0,-20,17,-14,24,0,17,15,0,21,-16,16,-24,2], [9,33,16,32,27,25,38,22]
 ],
};

// Origin offset and rotation for each of the eight strokes.
// Local axes follow the direction of the attack, including left-facing moves.
const entrances={
 kilo:[[-8,10,-28],[-14,24,-26],[-10,-14,32],[-17,9,18],[-20,-19,38],[-11,13,-24],[0,14,-32],[-10,7,22]],
 stitcho:[[-21,0,-10],[-22,20,31],[-17,-11,-26],[-19,15,32],[-26,-12,27],[-14,4,-16],[8,-7,44],[-20,2,-5]],
 chispin:[[-25,9,-24],[-12,17,14],[-29,16,-13],[-20,13,25],[-34,27,-19],[-16,11,12],[9,-20,24],[-19,12,-14]],
 cat:[[-6,16,-31],[-18,9,-18],[-26,12,10],[-31,6,19],[-36,23,29],[-8,16,-21],[-2,18,-22],[-13,9,15]],
 dragon:[[-6,-17,34],[-15,-23,-30],[-22,-19,20],[-29,-23,-22],[-32,-28,-14],[-16,-15,35],[4,-22,-37],[-17,-13,-28]],
 dino:[[-12,15,-8],[-10,24,-8],[-16,24,18],[-20,22,-12],[-24,31,11],[-18,21,-10],[3,25,13],[-19,25,12]],
 frita:[[-10,18,-16],[-19,9,-9],[-21,11,7],[-10,23,44],[-29,19,-16],[-19,10,17],[0,19,40],[-23,8,9]],
 pizza:[[-9,0,-23],[-9,3,12],[-12,-5,-21],[-8,8,61],[-20,0,-4],[-21,5,19],[11,0,-18],[-15,13,-34]],
 yomi:[[-11,13,21],[-22,19,-17],[-27,12,12],[-13,-20,49],[-33,20,15],[-10,18,-27],[0,15,24],[-23,13,-15]],
 ia:[[-19,0,16],[-24,10,-8],[-28,0,8],[-18,-9,12],[-35,0,5],[-16,0,-8],[12,0,45],[-22,10,7]],
 cuerno:[[-5,14,24],[-24,11,-15],[-30,14,16],[-26,-9,-14],[-33,15,24],[-18,12,18],[0,-14,35],[-23,11,-16]],
 nacar:[[-8,23,-17],[-21,25,-16],[-16,28,22],[-22,30,-36],[-24,34,18],[-9,16,-25],[0,25,-27],[-18,23,19]],
};
const layerDelay=[0,0,.08,.16,.24,0,0,0];
const clamp=t=>Number.isFinite(t)?Math.min(1,Math.max(0,t)):0;

function ornament(ctx,id,layer,progress,width){
 const points=details[id][layer];
 const delay=layerDelay[layer];
 const phase=clamp((progress-delay)/(1-delay));
 const eased=1-(1-phase)**3;
 const [dx,dy,degrees]=entrances[id][layer];
 ctx.save();
 ctx.translate(dx*(1-eased)/100,dy*(1-eased)/100);
 ctx.rotate(degrees*(1-eased)*Math.PI/180);
 const segments=(points.length-2)/2;
 const visible=segments*(.32+.68*eased);
 ctx.beginPath();
 ctx.moveTo(points[0]/100,points[1]/100);
 for(let segment=0;segment<Math.ceil(visible);segment++){
  const i=segment*2,part=Math.min(1,visible-segment);
  ctx.lineTo((points[i]+(points[i+2]-points[i])*part)/100,
   (points[i+1]+(points[i+3]-points[i+1])*part)/100);
 }
 const color=colors[id][1];
 ctx.strokeStyle='#160f28';ctx.lineWidth=width*2.5;ctx.stroke();
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
 ctx.restore();
}

export function drawRemateDetail(ctx,id,layer,{x,y,r,face=1,alpha=1,progress=1,reduced=false}){
 if(!details[id]?.[layer]||!(r>0)||!Number.isFinite(x+y+r+face+alpha)||alpha<=0)return;
 ctx.save();ctx.translate(x,y);ctx.scale(face*r,r);
 ctx.strokeStyle=colors[id][1];ctx.globalAlpha=alpha;
 ctx.lineCap='round';ctx.lineJoin='round';
 ornament(ctx,id,layer,reduced?1:progress,1.6/r);ctx.restore();
}

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

export function drawRemateSilhouette(ctx,id,{x,y,r,face=1,progress=1,stage='active',reduced=false}){
 const palette=colors[id];if(!palette||!(r>0)||!Number.isFinite(x+y+r+face))return;
 const k=clamp(progress);
 const width=r*(reduced?1:stage==='windup'?.47+k*.22:1);
 const height=r*(id==='dino'?.83:1);
 ctx.save();
 ctx.translate(x,y);ctx.scale(face*width,height);
 ctx.fillStyle=palette[0];ctx.strokeStyle=palette[1];ctx.lineJoin='round';ctx.lineCap='round';
 ctx.lineWidth=2.05/r;
 ctx.beginPath();
 drawSilhouette(ctx,id);
 ctx.globalAlpha=stage==='windup'?(reduced?.19:.12+k*.12):.32;
 ctx.fill();
 ctx.globalAlpha=stage==='windup'?.58:.93;ctx.stroke();
 ctx.strokeStyle=palette[1];ctx.lineWidth=1.5/r;
 if(stage==='windup'){
  ctx.globalAlpha=.72;ornament(ctx,id,0,reduced?1:k,1.5/r);
 }else for(const layer of [1,2,3,4]){
  ctx.globalAlpha=layer===4?.94:.75;
  ornament(ctx,id,layer,reduced?1:k,1.5/r);
 }
 ctx.restore();
}

export function drawReturningSlice(ctx,x,y,b,reduced){
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(b.vy,b.vx));
 drawRemateSilhouette(ctx,'pizza',{x:0,y:0,r:21,reduced,progress:b.age/8});
 ctx.strokeStyle='#ffcf93';ctx.lineWidth=2.7;
 ctx.beginPath();ctx.moveTo(-12,-9);ctx.quadraticCurveTo(-17,0,-12,9);ctx.stroke();
 ctx.fillStyle='#cf6153';
 for(const [dx,dy] of [[-7,-4],[-5,5],[4,-1]]){
  ctx.beginPath();ctx.arc(dx,dy,2.15,0,TAU);ctx.fill();
 }
 drawRemateDetail(ctx,'pizza',b.returning?7:0,{x:0,y:0,r:21,reduced,progress:b.returning?(b.age-19)/8:b.age/8});
 if(b.returning){
  ctx.strokeStyle='#fff3ca';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-23,-7);ctx.lineTo(-17,0);ctx.lineTo(-23,7);ctx.stroke();
 }
 ctx.restore();
}
