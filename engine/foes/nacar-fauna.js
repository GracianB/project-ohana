const TAU=Math.PI*2;

function ellipse(ctx,x,y,rx,ry,color,angle=0){
 ctx.fillStyle=color;
 ctx.beginPath();
 ctx.ellipse(x,y,rx,ry,angle,0,TAU);
 ctx.fill();
}

function shape(ctx,color,vertices){
 ctx.fillStyle=color;
 ctx.beginPath();
 ctx.moveTo(...vertices[0]);
 for(const vertex of vertices.slice(1))ctx.lineTo(...vertex);
 ctx.closePath();
 ctx.fill();
}

function eye(ctx,x,y,color='#fff2c8'){
 ellipse(ctx,x,y,3.8,4.8,color);
 ellipse(ctx,x+1,y,1.8,2.9,'#162944');
}

function lanternFish(ctx,t,warning){
 const flick=Math.sin(t*.15)*5;
 shape(ctx,'#436c8e',[[-11,-3],[-23,-13+flick],[-20,-1],[-24,10+flick],[-10,6]]);
 ellipse(ctx,0,0,18,11,'#4e849a');
 ellipse(ctx,4,4,13,5,'#8bbcbb');
 shape(ctx,'#6799a8',[[-10,-7],[-3,-17],[5,-9]]);
 ellipse(ctx,-2,5,5,3,'#456782',-.36);
 ctx.strokeStyle='#557584';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(6,-8);ctx.quadraticCurveTo(16,-21,22,-12);ctx.stroke();
 ellipse(ctx,22,-11,warning?5:3.2,warning?5:3.2,warning?'#ffdb9c':'#caefc5');
 eye(ctx,9,-3);
}

function crystalJelly(ctx,t,warning){
 const hue=warning?'#e6b4c6':'#aaaad9';
 for(let i=-2;i<=2;i++){
  const x=i*6,sway=Math.sin(t*.086+i)*4;
  ctx.strokeStyle=i%2?'#a6d1d1':'#ddbadd';ctx.lineWidth=i%2?2:3;
  ctx.beginPath();ctx.moveTo(x,2);ctx.quadraticCurveTo(x+sway,13,x-sway,23);ctx.stroke();
  ellipse(ctx,x-sway,23,1.6,2.4,'#f5dcb9');
 }
 ctx.fillStyle=hue;ctx.beginPath();ctx.moveTo(-18,4);
 ctx.bezierCurveTo(-16,-11,-8,-21,0,-21);
 ctx.bezierCurveTo(11,-21,15,-9,18,4);
 ctx.quadraticCurveTo(0,11,-18,4);ctx.fill();
 shape(ctx,'#e5ecf1a0',[[-10,-9],[-3,-17],[1,-13],[-5,-4]]);
 for(const x of [-8,7])eye(ctx,x,-1);
}

function hermit(ctx,t,warning){
 const scuttle=Math.sin(t*.17)*2;
 for(const side of [-1,1]){
  ctx.strokeStyle='#9c776f';ctx.lineWidth=3;
  for(let j=0;j<3;j++){
   ctx.beginPath();ctx.moveTo(side*8,7);
   ctx.lineTo(side*(14+j*2),13+j*2);ctx.lineTo(side*(17+j*2),18+j*2+scuttle);ctx.stroke();
  }
  ellipse(ctx,side*17,warning?1:6,5,7,'#d9a18b',side*.42);
 }
 ellipse(ctx,-4,-1,17,15,'#735e80',-.35);
 ellipse(ctx,-5,-2,13,12,'#b592a3');
 ctx.strokeStyle='#624f72';ctx.lineWidth=2;
 ctx.beginPath();
 for(let i=0;i<=24;i++){
  const r=i*.43,a=i*.29;
  const x=-5+Math.cos(a)*r,y=-2+Math.sin(a)*r;
  if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
 }
 ctx.stroke();
 ellipse(ctx,12,3,8,7,'#d0a48d');eye(ctx,15,0);
}

function coralEel(ctx,t,warning){
 const bend=Math.sin(t*.125)*5;
 ctx.lineCap='round';ctx.strokeStyle='#284b61';ctx.lineWidth=12;
 ctx.beginPath();ctx.moveTo(-27,bend+7);ctx.bezierCurveTo(-17,-16,1,15,17,-3);ctx.stroke();
 ctx.strokeStyle='#6ebaa6';ctx.lineWidth=7;
 ctx.beginPath();ctx.moveTo(-27,bend+7);ctx.bezierCurveTo(-17,-16,1,15,17,-3);ctx.stroke();
 for(let i=0;i<5;i++)ellipse(ctx,-15+i*6,-2+Math.sin(i*.55)*5,1.8,2.7,'#c5e3b7');
 ellipse(ctx,16,-4,10,8,warning?'#a2c79d':'#73baae');
 eye(ctx,19,-6);
}

function sentryPolyp(ctx,t,warning){
 const sway=Math.sin(t*.08)*3;
 ellipse(ctx,-4,13,16,9,'#5b627e');
 for(let i=0;i<6;i++){
  const x=-16+i*6,y=-15+Math.sin(i*.65)*6;
  ctx.strokeStyle=i%2?'#b888a8':'#9b86b8';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(x*.5,14);ctx.quadraticCurveTo(x+5,1,x+sway,y);ctx.stroke();
  ellipse(ctx,x+sway,y,3.2,3.9,'#dabbce');
 }
 ellipse(ctx,7,-3,13,11,'#846a99');
 ellipse(ctx,9,-4,6,5,warning?'#ffdba7':'#503a69');
 ellipse(ctx,10,-5,2.25,2.25,warning?'#fff3c0':'#bfa0c3');
}

const PAINTERS={lantern:lanternFish,crystal:crystalJelly,hermit,eel:coralEel,polyp:sentryPolyp};

export function drawNacarFauna(ctx,enemy,t,reduced){
 const paint=PAINTERS[enemy.roomPersona?.nacarSpecies];
 if(!paint)return false;
 ctx.save();
 ctx.scale((enemy.facing<0?-1:1)*Math.min(1.7,enemy.w/54),Math.min(1.6,enemy.h/56));
 paint(ctx,reduced?0:t,!!enemy.telegraph);
 ctx.restore();
 return true;
}
