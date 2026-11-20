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
 ctx.strokeStyle=layer===6?'#fff7df':color;ctx.lineWidth=width*(layer===6?1.4:1);ctx.stroke();
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

// J, K, L, I and P profiles, in attack-local coordinates. Each entry is
// the crest of a filled ribbon; the low edge folds back to its origin.
const castCrests={
 kilo:[
  [0,3,19,-23,37,1,64,-16], [0,0,20,14,42,10,62,-4], [0,12,27,-28,54,-35,77,4],
  [0,15,22,-25,55,-36,71,-11], [0,11,23,-17,54,-40,81,-23],
 ],
 stitcho:[
  [0,-5,14,3,40,10,75,-7], [0,9,19,-26,30,-18,58,-39], [0,16,24,30,63,27,81,-8],
  [0,19,15,-3,50,-29,82,-14], [0,4,19,-36,64,-48,98,-21],
 ],
 chispin:[
  [0,4,27,9,35,-29,77,-22], [0,7,15,-18,19,-44,49,-37], [0,2,21,-35,58,3,64,-40],
  [0,21,42,-4,57,-1,93,-39], [0,13,31,-9,62,-52,103,-57],
 ],
 cat:[
  [0,6,20,26,37,-32,67,-40], [0,7,27,12,29,-21,49,-28], [0,18,24,-5,37,-41,65,-32],
  [0,26,43,19,67,-24,84,-51], [0,18,40,-5,63,-56,89,-35],
 ],
 dragon:[
  [0,-4,13,-19,47,3,83,-20], [0,11,27,33,47,19,63,-4], [0,8,26,-16,59,24,104,10],
  [0,-19,24,-19,43,20,83,33], [0,-2,23,-22,65,-58,112,-42],
 ],
 dino:[
  [0,3,19,-7,35,-21,68,-9], [0,12,17,24,51,29,57,16], [0,21,28,20,43,-21,79,12],
  [0,22,16,5,52,24,78,-27], [0,29,25,-18,67,-14,95,-44],
 ],
 frita:[
  [0,5,18,-17,49,26,67,-1], [0,8,18,23,42,22,59,6], [0,16,20,-26,57,-9,70,-37],
  [0,16,22,24,59,19,84,-12], [0,27,37,8,65,-39,92,-19],
 ],
 pizza:[
  [0,-8,19,-25,42,8,70,0], [0,2,17,31,39,23,56,-4], [0,5,31,-35,67,-26,83,2],
  [0,-11,17,-18,42,-9,70,1], [0,5,18,-28,76,-35,92,-7],
 ],
 yomi:[
  [0,1,16,-24,49,0,72,-16], [0,10,19,12,30,-24,60,-17], [0,20,26,-13,39,-31,75,-22],
  [0,17,19,-15,50,-8,79,-28], [0,27,28,-14,56,-53,91,-35],
 ],
 ia:[
  [0,2,28,2,38,-26,70,-26], [0,10,17,10,26,-17,56,-19], [0,14,28,-36,50,-6,81,-23],
  [0,1,19,-30,63,-19,82,0], [0,29,30,-7,58,-8,105,-31],
 ],
 cuerno:[
  [0,11,17,8,36,-17,74,-21], [0,13,20,18,41,7,65,-8], [0,9,24,15,65,-21,101,-24],
  [0,14,22,11,53,-11,88,-27], [0,25,20,-9,48,-36,95,-51],
 ],
 nacar:[
  [0,11,21,-25,48,-3,69,-27], [0,16,18,22,32,0,56,-29], [0,19,18,-11,58,-26,78,-18],
  [0,25,31,26,44,-35,77,-38], [0,21,20,-39,59,-52,96,-57],
 ],
};
// Each attack gets a large, hand-drawn emblem and an inset. Coordinates
// are local to the cast; the | separates the filled contour from its inset.
const crestEmblems={
 kilo:[
  '11,4 18,-6 23,-4 34,-15 39,-6 26,2 48,-3 43,5 24,8 14,14 | 16,8 28,4 35,-4',
  '6,6 18,0 27,2 39,-2 55,1 47,8 28,10 17,7 | 13,6 25,5 33,7 47,3',
  '17,-1 27,-9 39,-10 52,-21 63,-16 59,-6 42,1 37,9 25,10 | 25,4 36,1 46,-6 58,-13',
  '22,5 31,-15 42,-14 44,-26 57,-31 66,-17 58,-4 43,9 | 30,3 44,-5 51,-20',
  '23,3 15,-8 30,-12 29,-24 44,-22 51,-36 62,-26 77,-26 73,-12 82,-7 66,4 43,8 | 34,-5 39,-17 53,-24 66,-17 66,-7 51,1 34,-5',
 ],
 stitcho:[
  '9,1 21,-9 39,-10 48,-17 69,-8 55,3 35,6 25,13 | 25,-2 41,-4 52,-8 59,-7',
  '10,6 16,-7 28,-16 44,-13 47,-3 34,8 22,11 | 19,3 28,-8 38,-8 33,-2',
  '12,11 25,1 34,4 49,-8 67,-9 78,0 65,13 46,20 25,19 | 22,13 37,13 56,5 71,0',
  '21,8 27,-8 46,-22 62,-21 79,-12 62,-2 52,-7 44,7 31,12 | 32,4 42,-9 55,-15 64,-13',
  '17,0 28,-19 55,-23 72,-38 93,-25 84,-13 63,-8 54,6 32,11 | 31,-3 44,-13 67,-19 80,-27',
 ],
 chispin:[
  '10,8 26,-12 33,-5 47,-19 65,-18 48,1 35,-1 23,12 | 25,3 36,-11 42,-8 53,-14',
  '8,5 17,-9 21,-20 33,-20 29,-9 39,-10 30,2 18,10 | 15,4 23,-4 25,-13',
  '14,8 28,-11 46,-7 54,-26 70,-22 60,-8 47,6 37,2 23,16 | 25,6 36,-2 49,0 61,-19',
  '18,17 42,-1 36,-12 58,-18 86,-35 72,-11 58,-3 62,5 35,17 | 35,11 51,1 47,-8 70,-22',
  '17,13 37,-7 26,-15 53,-25 52,-37 90,-47 78,-28 65,-20 69,-10 40,4 37,20 | 32,10 46,-4 47,-15 61,-22 71,-37',
 ],
 cat:[
  '10,7 23,2 40,-17 56,-19 48,-6 33,5 19,11 | 21,6 34,-2 46,-13',
  '9,3 20,-6 26,-17 32,-9 40,-16 42,-6 49,1 40,9 20,11 | 20,2 25,-1 29,2 34,-2 39,0',
  '13,9 25,10 42,1 44,-15 60,-21 62,-8 58,7 42,17 26,18 | 23,13 39,11 51,3 55,-10',
  '17,17 35,10 53,-7 62,-23 81,-33 73,-9 61,4 52,9 60,-7 46,5 36,15 | 30,12 47,0 62,-15 70,-24',
  '22,14 27,-10 42,-28 65,-38 86,-37 67,-27 55,-14 48,6 35,19 | 32,9 41,-9 52,-21 67,-30',
 ],
 dragon:[
  '10,5 23,-11 29,-7 41,-15 52,-25 56,-14 73,-16 65,-5 51,4 26,9 | 22,2 34,-2 45,-9 57,-10',
  '10,6 19,-2 25,5 34,-1 39,6 52,2 57,10 42,15 28,14 17,10 | 17,8 30,9 40,10 49,7',
  '17,3 26,-15 41,-5 53,-16 61,-5 85,-11 101,-4 88,1 80,12 57,15 43,8 32,14 | 28,5 40,0 57,6 72,3 88,-5',
  '14,-9 34,-8 53,9 63,8 81,26 65,29 48,23 37,9 24,7 | 28,-2 44,8 54,17 67,21',
  '18,3 30,-20 54,-26 67,-44 102,-52 91,-32 75,-19 65,-17 56,0 37,9 | 33,-1 49,-14 68,-24 83,-37',
 ],
 dino:[
  '10,6 23,-9 46,-13 54,1 39,9 21,12 | 20,5 31,-3 44,-6 48,0',
  '9,8 18,-1 29,-4 44,0 54,13 42,17 23,16 | 17,9 28,3 38,6 46,11',
  '14,12 30,-1 41,0 49,-14 60,-9 64,2 76,2 72,13 52,18 30,17 | 25,12 38,6 50,7 54,-4',
  '12,18 26,0 42,6 51,-10 65,-8 77,-25 79,-8 68,10 46,17 32,12 | 25,13 42,10 55,2 67,-9',
  '16,16 28,-7 41,-3 54,-22 65,-19 81,-36 94,-33 88,-11 70,-4 58,6 37,9 | 30,8 48,0 66,-12 82,-22',
 ],
 frita:[
  '10,4 20,-8 31,-10 39,-3 51,-5 64,2 52,8 26,11 | 20,4 29,-4 36,-3 45,2',
  '9,8 18,-1 29,3 41,-2 56,5 46,13 28,15 18,13 | 18,8 26,8 37,5 47,7',
  '12,9 27,-2 32,-15 44,-12 50,-25 61,-22 62,-9 70,-11 66,3 48,8 31,16 | 26,9 37,3 45,-4 54,-9',
  '15,11 28,5 45,8 64,-2 77,-9 81,-2 70,10 52,16 28,17 | 27,13 46,13 60,7 73,0',
  '15,15 22,1 40,-3 51,-27 61,-31 69,-17 83,-24 91,-14 81,4 64,11 41,16 | 28,10 49,4 59,-18 67,-9 77,-12',
 ],
 pizza:[
  '14,1 21,-12 30,-13 67,-2 36,9 26,13 | 24,-6 28,2 35,4 45,0 34,-4 24,-6',
  '10,7 17,-2 31,-3 50,5 52,10 39,16 24,14 | 18,7 28,3 38,5 43,10',
  '16,4 23,-14 43,-19 57,-10 80,-7 75,1 61,7 43,0 31,10 | 25,3 34,-6 45,-10 58,-4 71,-3',
  '17,-2 24,-14 33,-15 72,-1 67,6 32,10 22,7 | 26,-6 31,1 45,0 52,-1 40,-5',
  '17,0 31,-15 36,-28 54,-28 67,-20 85,-20 92,-5 81,5 65,0 52,10 34,7 | 30,-2 44,-13 56,-15 72,-11 79,-7',
 ],
 yomi:[
  '13,4 20,-15 33,-17 59,-9 63,-2 45,3 37,11 21,9 | 24,2 33,-9 43,-6 33,-2 47,-2',
  '11,6 19,-4 31,-5 35,-15 43,-9 52,-10 51,2 33,6 28,12 | 21,5 32,1 39,-6 46,-4',
  '14,11 28,-2 33,-16 45,-17 52,-29 66,-25 69,-11 54,0 41,3 26,14 | 28,7 40,-3 49,-6 57,-18',
  '14,11 29,-14 48,-14 57,-23 75,-21 78,-11 62,-7 53,5 33,16 | 28,8 42,-5 54,-6 63,-13',
  '13,15 24,3 36,-17 48,-17 60,-36 76,-34 90,-20 77,-9 59,-11 48,6 31,19 | 24,12 42,-5 48,-4 61,-19 75,-22',
 ],
 ia:[
  '12,4 22,-5 37,-5 44,-15 64,-15 70,-8 56,3 43,1 34,9 20,9 | 20,4 32,4 44,-5 55,-5 60,-9',
  '10,6 18,-4 29,-4 37,-10 51,-10 55,-3 45,6 34,5 24,12 | 19,6 31,1 41,1 48,-4',
  '13,8 30,-13 46,-18 53,-11 73,-19 82,-10 68,3 51,4 40,12 22,13 | 26,7 39,-5 49,-5 58,-3 73,-11',
  '18,4 30,-14 47,-25 66,-16 83,0 67,10 49,5 31,12 | 30,4 44,-12 52,-15 63,-8 74,0',
  '16,19 31,4 38,-7 62,-12 75,-31 99,-29 91,-11 77,3 58,4 49,16 31,23 | 30,15 46,4 66,-3 80,-18 89,-21',
 ],
 cuerno:[
  '10,3 22,-9 34,-11 60,-19 76,-15 61,-5 46,5 25,7 | 25,1 42,-5 53,-11 65,-14',
  '9,7 18,0 32,1 41,-9 61,-7 56,1 44,8 25,12 | 19,7 32,6 42,0 54,-5',
  '11,8 27,1 43,-10 59,-10 81,-24 103,-21 88,-10 64,-9 47,2 28,11 | 25,7 45,-4 60,-6 78,-18 94,-20',
  '16,9 28,7 43,-4 56,-5 75,-21 90,-22 81,-10 61,2 47,5 30,13 | 30,9 45,0 59,-1 69,-12 81,-17',
  '16,18 32,-4 48,-14 56,-29 77,-38 97,-43 88,-28 76,-24 66,-10 42,-4 31,14 | 30,9 45,-7 61,-18 68,-28 83,-35',
 ],
 nacar:[
  '10,5 17,-9 27,-15 42,-13 51,-4 64,-9 67,-2 54,6 39,2 30,9 17,10 | 19,4 28,-6 38,-5 43,0',
  '8,10 20,1 30,5 37,-8 49,-12 55,-3 46,9 32,14 17,15 | 19,10 29,9 37,2 45,-3',
  '13,12 27,6 31,-10 47,-18 63,-17 78,-26 80,-13 68,-7 57,-9 45,0 33,16 | 24,12 36,1 42,-8 56,-11 70,-16',
  '15,16 30,10 38,-10 51,-23 68,-35 78,-29 70,-15 58,-11 51,1 34,18 | 27,14 42,3 49,-9 61,-18 71,-28',
  '17,18 32,1 37,-18 55,-34 73,-40 97,-46 92,-32 77,-27 66,-10 50,-4 37,15 | 33,10 43,-9 57,-22 76,-31 85,-39',
 ],
};
function parseEmblem(pattern){
 return pattern.split('|').map(path=>path.trim().split(/\s+/).map(point=>point.split(',').map(Number)));
}
for(const id of Object.keys(crestEmblems))crestEmblems[id]=crestEmblems[id].map(parseEmblem);

function drawAttackEmblem(ctx,id,profile,phase,insetLight,shade,glint){
 const [outline,inset]=crestEmblems[id][profile];
 ctx.save();ctx.globalAlpha*=phase;
 ctx.beginPath();
 traceEmblem(ctx,outline);
 ctx.closePath();
 ctx.fillStyle=shade;ctx.fill();
 ctx.strokeStyle='#160f28';ctx.lineWidth=3.8;ctx.stroke();
 ctx.strokeStyle=glint;ctx.lineWidth=1.3;ctx.stroke();
 ctx.beginPath();traceEmblem(ctx,inset);
 ctx.globalAlpha*=insetLight*.82;ctx.lineWidth=1.55;ctx.stroke();
 ctx.restore();
}
function traceEmblem(ctx,points){
 ctx.moveTo(...points[0]);
 for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);
}

const castStages={
 0:{profile:0,life:18,depth:8,reach:1,travel:19,drop:-4},
 1:{profile:1,life:26,depth:12,reach:.78,travel:6,drop:9},
 2:{profile:2,life:32,depth:14,reach:.94,travel:10,drop:-7},
 4:{profile:3,life:26,depth:13,reach:1,travel:24,drop:-10},
 5:{profile:4,life:46,depth:18,reach:1.12,travel:4,drop:-21},
};

// Ten beats, from ignition to the last visible echo. Each row controls:
// reach, height, advance, lift, body, rim, crease, material, emblem, inset.
// Scores are percentages of the locally authored attack geometry.
const castScores={
 0:[
  [44,77,9,5,46,72,50,27,36,37],
  [64,88,16,9,65,86,56,52,68,51],
  [85,96,29,14,81,96,62,68,89,76],
  [99,100,41,20,87,100,76,86,100,92],
  [107,98,55,26,83,96,84,97,98,100],
  [113,94,69,30,74,88,88,89,90,95],
  [117,89,79,28,63,78,79,76,81,82],
  [120,83,88,24,49,66,64,58,68,72],
  [122,77,94,19,35,51,48,39,53,54],
  [124,70,100,13,18,33,32,23,30,36],
 ],
 1:[
  [60,51,3,10,53,65,44,38,48,41],
  [72,60,6,21,67,82,59,56,63,57],
  [85,72,11,36,79,92,73,72,82,69],
  [97,84,17,46,88,100,84,90,94,83],
  [105,91,25,58,95,97,93,98,100,93],
  [109,89,34,65,90,94,100,91,93,100],
  [108,84,43,74,78,84,91,86,83,92],
  [104,76,55,82,63,77,79,73,72,83],
  [96,68,66,90,43,65,60,55,55,67],
  [86,59,79,100,22,44,41,33,33,47],
 ],
 2:[
  [41,81,3,6,39,72,36,33,29,49],
  [53,93,8,14,49,83,52,48,45,61],
  [69,103,15,27,67,92,66,67,62,77],
  [86,111,25,39,80,96,81,79,82,91],
  [103,115,39,53,90,100,92,93,96,97],
  [114,110,53,64,85,97,100,100,100,100],
  [119,103,65,76,76,92,95,91,91,92],
  [122,96,76,85,60,83,81,78,79,79],
  [124,88,88,93,45,65,64,59,62,63],
  [125,81,100,100,25,46,44,40,39,45],
 ],
 4:[
  [47,68,2,4,42,65,37,30,31,32],
  [61,81,7,10,58,79,49,43,45,48],
  [77,93,15,19,71,90,63,61,68,67],
  [92,104,27,33,84,97,81,76,86,83],
  [104,113,44,49,93,100,96,94,99,96],
  [111,116,61,66,96,99,100,100,100,100],
  [115,113,75,79,85,92,93,92,94,92],
  [119,107,86,89,70,82,76,77,81,81],
  [122,100,94,95,52,68,58,60,66,64],
  [124,93,100,100,29,48,40,39,41,45],
 ],
 5:[
  [40,57,3,2,34,58,29,31,24,29],
  [52,70,7,8,47,69,40,43,37,43],
  [67,84,14,18,60,82,52,57,52,56],
  [83,98,22,34,74,91,69,72,74,72],
  [97,111,34,52,87,98,83,89,92,89],
  [107,119,48,70,97,100,96,98,100,98],
  [114,123,61,82,100,99,100,100,98,100],
  [119,122,74,91,88,92,93,90,89,92],
  [123,116,86,97,69,80,77,71,72,76],
  [126,108,100,100,40,58,54,49,50,58],
 ],
};

const castMaterials={
 // Petal, plasma, charge, claws, fire, fossil, oil, crust, paper, light, crystal, water.
 kilo:   [104,93,86,80,103,108,97,117,107,102],
 stitcho:[111,96,119,101,88,118,113,93,102,113],
 chispin:[112,92,125,108,83,119,97,110,99,109],
 cat:    [108,108,112,122,91,111,115,103,103,109],
 dragon: [111,111,108,110,112,107,88,112,111,96],
 dino:   [108,119,91,73,116,97,108,99,116,95],
 frita:  [108,86,105,65,111,103,108,118,111,106],
 pizza:  [103,91,121,88,110,108,92,116,114,97],
 yomi:   [102,112,90,115,94,115,101,109,103,118],
 ia:     [108,101,113,117,96,118,115,95,106,116],
 cuerno: [113,94,108,114,91,120,111,112,103,115],
 nacar:  [106,114,102,126,91,113,116,118,103,114],
};

const castTimelines=Object.fromEntries(Object.entries(castMaterials).map(([id,material])=>[
 id,Object.freeze(Object.fromEntries(Object.entries(castScores).map(([slot,score])=>[
  slot,Object.freeze(score.map(beat=>Object.freeze(beat.map((value,track)=>value*material[track]/10000)))),
 ]))),
]));

export function attackCastTimeline(id,slot){
 return Object.hasOwn(castTimelines,id)?castTimelines[id][slot]:undefined;
}

// Surface marks sit above the crease. They are reused along J/K/L/I/P's
// individual curves so the material reads as part of the strike.
function drawCrestMark(ctx,id,x,y){
 ctx.beginPath();
 switch(id){
  case 'kilo':
   ctx.moveTo(x-4,y+1);ctx.quadraticCurveTo(x,y-6,x+5,y-2);
   ctx.quadraticCurveTo(x+5,y+1,x-4,y+1);ctx.closePath();break;
  case 'stitcho':
   ctx.moveTo(x-5,y+1);ctx.lineTo(x-3,y-3);ctx.lineTo(x+5,y-3);ctx.lineTo(x+2,y+1);ctx.closePath();break;
  case 'chispin':
   ctx.moveTo(x-4,y+1);ctx.lineTo(x+1,y-5);ctx.lineTo(x,y-1);ctx.lineTo(x+5,y-4);break;
  case 'cat':
   for(const gap of [-3,0,3]){
    ctx.moveTo(x+gap-2,y+1);ctx.quadraticCurveTo(x+gap,y-1,x+gap+2,y-5);
   }
   break;
  case 'dragon':
   ctx.moveTo(x-5,y-2);ctx.quadraticCurveTo(x,y-7,x+5,y-2);
   ctx.quadraticCurveTo(x,y+4,x-5,y-2);ctx.closePath();break;
  case 'dino':
   ctx.moveTo(x-5,y);ctx.lineTo(x+1,y-6);ctx.lineTo(x+5,y-3);ctx.lineTo(x+2,y+2);ctx.closePath();break;
  case 'frita':
   ctx.moveTo(x-4,y);ctx.quadraticCurveTo(x+1,y-6,x+5,y-4);
   ctx.quadraticCurveTo(x+4,y+2,x-4,y);ctx.closePath();break;
  case 'pizza':
   ctx.arc(x,y-2,2.5,0,TAU);break;
  case 'yomi':
   ctx.moveTo(x-5,y-1);ctx.lineTo(x-2,y-5);ctx.lineTo(x+5,y-3);ctx.lineTo(x+2,y+1);ctx.closePath();break;
  case 'ia':
   ctx.moveTo(x-6,y-1);ctx.lineTo(x-2,y-1);ctx.lineTo(x+1,y-4);ctx.lineTo(x+5,y-4);break;
  case 'cuerno':
   ctx.moveTo(x,y-6);ctx.lineTo(x+1,y-3);ctx.lineTo(x+5,y-2);ctx.lineTo(x+1,y-1);
   ctx.lineTo(x,y+2);ctx.lineTo(x-1,y-1);ctx.lineTo(x-5,y-2);ctx.lineTo(x-1,y-3);ctx.closePath();break;
  case 'nacar':
   ctx.arc(x-1,y-1,2.7,0,TAU);
   ctx.moveTo(x+6,y-4);ctx.arc(x+4.5,y-4,1.5,0,TAU);break;
 }
 ctx.stroke();
}

export function drawAttackCrest(ctx,id,slot,{x,y,face=1,age,reduced=false}){
 const style=castStages[slot],points=castCrests[id]?.[style?.profile];
 if(!points||!Number.isFinite(x+y+age+face)||age<0||age>=style.life)return;
 const time=age/style.life;
 const beats=attackCastTimeline(id,slot);
 const position=Math.min(9,time*10);
 const beat=Math.floor(position),mix=position-beat;
 const from=beats[beat],to=beats[Math.min(9,beat+1)];
 const value=track=>from[track]+(to[track]-from[track])*mix;
 const fade=Math.min(1,(1-time)*3);
 const [x0,y0,x1,y1,x2,y2,tipX,tipY]=points,depth=style.depth;
 const [shade,glint]=colors[id];
 ctx.save();ctx.translate(x,y);
 ctx.scale(face*style.reach*(reduced?1:value(0)),reduced?1:value(1));
 ctx.globalAlpha=value(4)*fade*.85;

 ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x1,y1,x2,y2,tipX,tipY);
 ctx.bezierCurveTo(x2,y2+depth,x1,y1+depth,x0,y0);ctx.closePath();
 ctx.fillStyle=shade;ctx.fill();
 ctx.strokeStyle='#160f28';ctx.lineWidth=3.6;ctx.stroke();
 ctx.globalAlpha=value(5)*fade*.82;
 ctx.strokeStyle=glint;ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x1,y1,x2,y2,tipX,tipY);ctx.stroke();
 ctx.save();ctx.globalAlpha=value(6)*fade*.71;ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(x0+(x1-x0)*.7,y0+(y1-y0)*.3+depth*.35);
 ctx.quadraticCurveTo(x2,y2+depth*.66,tipX,tipY);ctx.stroke();
 const markX=(x0+3*x1+3*x2+tipX)/8;
 const markY=(y0+3*y1+3*y2+tipY)/8+depth*.2;
 ctx.globalAlpha=value(7)*fade*.78;
 drawCrestMark(ctx,id,markX,markY);
 ctx.restore();
 ctx.translate(style.travel*(reduced?0:value(2)),style.drop*(reduced?0:value(3)));
 ctx.globalAlpha=fade;
 drawAttackEmblem(ctx,id,style.profile,value(8)*.85,value(9),shade,glint);
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
 drawRemateDetail(ctx,'pizza',b.returning?7:0,{x:0,y:0,r:21,reduced,alpha:b.returning&&!b.connected?.42:1,progress:b.returning?(b.age-19)/8:b.age/8});
 if(b.returning){
  ctx.strokeStyle='#fff3ca';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-23,-7);ctx.lineTo(-17,0);ctx.lineTo(-23,7);ctx.stroke();
 }
 ctx.restore();
}
