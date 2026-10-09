// OHANA V103 · Jungle and Cave each have ten visual memory responses.
// No objects are added. Drawings are lightweight, brief and non-blocking.
const entries=[
 ["jungle-0","liana","La liana hace una pirueta para saludarte."],
 ["jungle-1","rana","La rana dirige una orquesta invisible."],
 ["jungle-2","mariposa","La mariposa entrena una acrobacia imposible."],
 ["jungle-3","platano","Un plátano se escapa dando saltitos."],
 ["jungle-4","hoja","Una hoja se convierte en un paraguas de familia."],
 ["jungle-5","rugido","El rugido cabe en una burbuja diminuta."],
 ["jungle-6","nido","El nido vacío guarda la promesa de un regreso."],
 ["jungle-7","musgo","El musgo tiene muelles que nadie había visto."],
 ["jungle-8","stitcho","Dos ojitos aparecen detrás de una liana."],
 ["jungle-9","coro","Toda la jungla responde cantando."],
 ["cave-0","miau","La cueva devuelve un miau con eco."],
 ["cave-1","cristal","El cristal bosteza con luz azul."],
 ["cave-2","murcielago","Un murciélago recita versos del techo."],
 ["cave-3","piedra","La roca te mira con cara de sorpresa."],
 ["cave-4","gota","Una gota salta hacia su mayor aventura."],
 ["cave-5","tunel","El túnel se transforma en un pequeño xilófono."],
 ["cave-6","luna","Un fragmento de luna ilumina la piedra."],
 ["cave-7","huella","Aparece una huella que nadie recuerda haber dejado."],
 ["cave-8","michi","Una lucecita dibuja una sonrisa de Michi."],
 ["cave-9","corazon","El corazón de la cueva responde con un latido."]
].map(([id,kind,story],index)=>Object.freeze({id,kind,story,index,room:id.split("-")[0]}));
export const V103_LIVING_MOMENTS=Object.freeze(entries);
const LOOKUP=new Map(entries.map(s=>[s.id,s]));
export const MOMENT_LIFE=125;
export function v103Moment(id){return LOOKUP.get(id)||null;}
const tau=Math.PI*2;
function path(ctx,coords){ctx.beginPath();coords.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function ring(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.stroke();}
function ellipse(ctx,x,y,w,h){ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,tau);ctx.stroke();}
function star(ctx,x,y){ctx.save();ctx.translate(x,y);for(let i=0;i<8;i++){const a=i*Math.PI/4;path(ctx,[[Math.cos(a)*10,Math.sin(a)*10],[Math.cos(a)*15,Math.sin(a)*15]]);}ctx.restore();}
function wave(ctx,y,t){ctx.beginPath();for(let x=-29;x<30;x+=3){if(x===-29)ctx.moveTo(x,y);else ctx.lineTo(x,y+Math.sin(x/8+t*.08)*3);}ctx.stroke();}
function drawMark(ctx,kind,t){
 const a=Math.sin(t*.08)*3;
 switch(kind){
 case "liana":ctx.beginPath();ctx.moveTo(-20,-30);ctx.bezierCurveTo(33,-25,-33,10,15,27);ctx.stroke();ring(ctx,15,26,6);break;
 case "rana":ellipse(ctx,0,9,22,17);ring(ctx,-12,-7,7);ring(ctx,12,-7,7);ring(ctx,-12,-7,2);ring(ctx,12,-7,2);path(ctx,[[-9,17],[0,20],[9,17]]);break;
 case "mariposa":for(const x of [-1,1]){ctx.beginPath();ctx.ellipse(x*12,-9,12,18,x*.35,0,tau);ctx.stroke();ctx.beginPath();ctx.ellipse(x*10,12,10,13,x*.3,0,tau);ctx.stroke();}path(ctx,[[0,-24],[0,24]]);break;
 case "platano":ctx.beginPath();ctx.arc(-5,-7,31,.12,1.55);ctx.arc(4,-13,24,1.65,.3,true);ctx.stroke();path(ctx,[[-14,12],[-18,21],[-9,24]]);break;
 case "hoja":ctx.beginPath();ctx.moveTo(-24,18);ctx.quadraticCurveTo(-36,-25,21,-22);ctx.quadraticCurveTo(34,15,-24,18);ctx.stroke();path(ctx,[[-24,18],[21,-22]]);break;
 case "rugido":for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-5,0,8+i*11,-.7,.7);ctx.stroke();}ring(ctx,-9,0,5);break;
 case "nido":for(let i=0;i<4;i++)wave(ctx,7+i*5,t+i*4);ellipse(ctx,-7,1,8,11);ellipse(ctx,10,1,8,11);break;
 case "musgo":for(let i=-2;i<3;i++){path(ctx,[[i*11,24],[i*11+a,5],[i*11+2*a,-12]]);ring(ctx,i*11+2*a,-12,5);}break;
 case "stitcho":ellipse(ctx,-11,0,8,12);ellipse(ctx,11,0,8,12);ring(ctx,-11,0,3);ring(ctx,11,0,3);path(ctx,[[-28,-20],[-5,-27],[13,-20]]);break;
 case "coro":for(let i=-2;i<=2;i++){ring(ctx,i*13,12,5);path(ctx,[[i*13,5],[i*13+a,-14+(i%2)*7]]);}star(ctx,0,-28);break;
 case "miau":ring(ctx,0,5,19);path(ctx,[[-16,-10],[-18,-24],[-6,-17],[6,-17],[18,-24],[16,-10]]);ring(ctx,-7,2,2);ring(ctx,7,2,2);path(ctx,[[-5,12],[0,15],[5,12]]);break;
 case "cristal":path(ctx,[[0,-30],[22,-8],[14,25],[-14,25],[-22,-8],[0,-30]]);path(ctx,[[-22,-8],[22,-8],[0,25],[0,-30]]);break;
 case "murcielago":ctx.beginPath();ctx.moveTo(0,-2);ctx.bezierCurveTo(-28,-32,-38,3,-18,16);ctx.quadraticCurveTo(-11,4,0,13);ctx.quadraticCurveTo(11,4,18,16);ctx.bezierCurveTo(38,3,28,-32,0,-2);ctx.stroke();ring(ctx,0,-3,5);break;
 case "piedra":ctx.beginPath();ctx.moveTo(-26,22);ctx.lineTo(-22,-14);ctx.lineTo(-6,-25);ctx.lineTo(24,-13);ctx.lineTo(29,22);ctx.closePath();ctx.stroke();ring(ctx,-8,1,4);ring(ctx,12,1,4);path(ctx,[[-7,13],[5,16],[17,13]]);break;
 case "gota":ctx.beginPath();ctx.moveTo(0,-27);ctx.bezierCurveTo(-26,8,-25,25,0,26);ctx.bezierCurveTo(25,25,26,8,0,-27);ctx.stroke();ring(ctx,-7,9,2);ring(ctx,7,9,2);break;
 case "tunel":for(let i=0;i<5;i++)path(ctx,[[-28+i*10,18],[-28+i*10,-8+(i%2)*6]]);ctx.beginPath();ctx.arc(0,15,31,Math.PI,2*Math.PI);ctx.stroke();break;
 case "luna":ctx.beginPath();ctx.arc(0,-5,23,.3,Math.PI*1.7);ctx.arc(10,-10,17,Math.PI*1.6,.45,true);ctx.stroke();star(ctx,-24,-22);break;
 case "huella":ellipse(ctx,0,14,13,18);for(let i=-2;i<=2;i++)ring(ctx,i*8,-14-Math.abs(i)*3,4);break;
 case "michi":ctx.beginPath();ctx.arc(0,5,19,0,tau);ctx.stroke();path(ctx,[[-16,-10],[-19,-24],[-6,-18],[6,-18],[19,-24],[16,-10]]);path(ctx,[[-10,5],[-3,7],[3,7],[10,5]]);star(ctx,24,-26);break;
 case "corazon":ctx.beginPath();ctx.moveTo(0,25);ctx.bezierCurveTo(-40,1,-22,-22,0,-7);ctx.bezierCurveTo(22,-22,40,1,0,25);ctx.stroke();for(let i=0;i<2;i++)ring(ctx,0,0,8+i*21);break;
 }
}
export class V103MemoryDirector{
 constructor(){this.room="";this.events=[];this.triggered=0;}
 clear(){this.room="";this.events=[];}
 onRoom(room){if(room!==this.room){this.events=[];this.room=room;}}
 collect(item,t=0){
  const scene=v103Moment(item?.id);
  if(!scene||!Number.isFinite(item?.x)||!Number.isFinite(item?.y))return null;
  this.onRoom(scene.room);
  this.events=this.events.filter(x=>x.id!==scene.id).slice(-1);
  this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});this.triggered++;
  return scene;
 }
 draw(ctx,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
  if(!ctx)return;
  this.onRoom(room);
  this.events=this.events.filter(e=>t>=e.at&&t-e.at<MOMENT_LIFE);
  for(const e of this.events){
   const s=v103Moment(e.id),age=t-e.at,x=e.x-(cam?.x||0),y=e.y-(cam?.y||0)-33;
   if(!s||x< -90||x>w+90||y< -90||y>h+90)continue;
   const fade=Math.min(1,age/12,(MOMENT_LIFE-age)/25);
   ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.max(0,fade);
   ctx.strokeStyle=s.room==="jungle"?"#ceffaf":"#b3d8ff";ctx.lineWidth=2.2;ctx.lineJoin="round";
   ctx.lineCap="round";ctx.fillStyle="rgba(8,26,42,.78)";
   if(!reduceMotion)ctx.translate(0,Math.sin(age*.09+s.index)*3);
   ctx.beginPath();ctx.arc(0,0,46,0,tau);ctx.fill();ctx.stroke();
   drawMark(ctx,s.kind,reduceMotion?0:age);
   ctx.restore();
  }
 }
 snapshot(t=0){return {room:this.room,active:this.events.filter(x=>t>=x.at&&t-x.at<MOMENT_LIFE).map(x=>x.id),triggered:this.triggered};}
}
export const V103Memories=new V103MemoryDirector();
