// OHANA V104 · 20 original living memories of Alien Lab and Cumbre.
// Presentation only. Reuses the 100 original pickups and save key; never writes progress.
// World scoped, maximum two short scenes, culled off-screen, reduced-motion friendly.
const moments=[
 ["lab-0","chispa","Una chispa construye un sol diminuto sobre la mesa."],
 ["lab-1","boton","El botón prohibido pide disculpas con un guiño."],
 ["lab-2","robot","Un robot estornuda tres píxeles de alegría."],
 ["lab-3","probeta","La probeta mezcla amistad con una burbuja azul."],
 ["lab-4","satelite","Un satélite saluda a casa desde muy cerca."],
 ["lab-5","calcetin","El calcetín perdido vuelve de otra galaxia."],
 ["lab-6","rayo","Un relámpago cabe en una botella pequeña."],
 ["lab-7","alien","La traducción del mensaje dice: aquí cabemos todos."],
 ["lab-8","chispin","Chispín descubre la fórmula de una carcajada."],
 ["lab-9","amistad","Dos planetas crean una constelación de amigos."],
 ["ridge-0","pluma","La pluma remonta el viento para volver contigo."],
 ["ridge-1","viento","El viento hace una reverencia sobre la cumbre."],
 ["ridge-2","nube","Una nube se vuelve almohada para descansar."],
 ["ridge-3","pico","La montaña toca sus propias campanas."],
 ["ridge-4","huella","El gigante dejó una huella para encontrar el camino."],
 ["ridge-5","trueno","Un trueno minúsculo aprende a rugir bajito."],
 ["ridge-6","aurora","El cielo pinta una aurora que no necesita público."],
 ["ridge-7","salto","Una estela dibuja el salto que parecía imposible."],
 ["ridge-8","cuerno","Cuerno escribe un arcoíris sobre el horizonte."],
 ["ridge-9","cima","Dos manos levantan una bandera de toda la familia."]
].map(([id,kind,story],index)=>Object.freeze({id,kind,story,index,room:id.split("-")[0]}));
export const V104_MOMENTS=Object.freeze(moments);
const index=new Map(moments.map(scene=>[scene.id,scene]));
export const V104_LIFETIME=126;
export function v104Moment(id){return index.get(id)||null;}
const TAU=Math.PI*2;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function path(c,points,close=false){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 if(close)c.closePath();c.stroke();
}
function circle(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
function oval(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();}
function star(c,x=0,y=0,r=16){const v=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.43:r;v.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}path(c,v,true);}
function heart(c,x,y,r=15){
 c.beginPath();c.moveTo(x,y+r);c.bezierCurveTo(x-2*r,y-r*.2,x-r,y-r,x,y-r*.38);
 c.bezierCurveTo(x+r,y-r,x+2*r,y-r*.2,x,y+r);c.stroke();
}
function beam(c,x,y,angle,length=24){path(c,[[x,y],[x+Math.cos(angle)*length,y+Math.sin(angle)*length]]);}
function drawIcon(c,kind,t){
 const bob=Math.sin(t*.08)*3;
 switch(kind){
 case "chispa":star(c,0,0,22);for(let i=0;i<7;i++)beam(c,Math.cos(i*TAU/7)*25,Math.sin(i*TAU/7)*25,i*TAU/7,9);break;
 case "boton":oval(c,0,11,25,10);oval(c,0,0,25,13);circle(c,0,0,9);star(c,0,0,5);break;
 case "robot":c.strokeRect(-19,-16,38,38);path(c,[[0,-16],[0,-27]]);circle(c,0,-29,4);circle(c,-9,-4,4);circle(c,9,-4,4);path(c,[[-10,13],[0,16],[10,13]]);break;
 case "probeta":path(c,[[-9,-28],[9,-28],[9,-17],[16,20],[11,26],[-11,26],[-16,20],[-9,-17]],true);path(c,[[-13,5],[13,5]]);circle(c,3,-2,4);circle(c,-5,15,3);break;
 case "satelite":c.strokeRect(-9,-11,18,22);c.strokeRect(-35,-15,20,30);c.strokeRect(15,-15,20,30);path(c,[[-15,0],[-9,0],[9,0],[15,0]]);star(c,0,-20,7);break;
 case "calcetin":path(c,[[-9,-27],[14,-27],[12,1],[24,13],[18,23],[-17,23],[-26,13],[-17,1],[-9,-27]],true);path(c,[[-10,-15],[13,-15]]);circle(c,9,12,3);break;
 case "rayo":path(c,[[8,-29],[-13,1],[0,1],[-7,27],[23,-9],[7,-9],[8,-29]],true);circle(c,-25,18,4);circle(c,23,-22,4);break;
 case "alien":oval(c,0,-3,19,25);oval(c,-8,-8,5,9);oval(c,8,-8,5,9);path(c,[[-7,13],[0,16],[7,13]]);circle(c,-26,20,3);circle(c,27,17,3);break;
 case "chispin":circle(c,0,1,21);for(let i=0;i<7;i++)beam(c,Math.cos(i*TAU/7)*23,Math.sin(i*TAU/7)*23,i*TAU/7,7);circle(c,-7,-4,3);circle(c,8,-4,3);path(c,[[-10,10],[0,14],[10,10]]);break;
 case "amistad":circle(c,-14,4,15);circle(c,15,-3,13);heart(c,1,4,9);star(c,0,-28,9);break;
 case "pluma":c.beginPath();c.moveTo(-21,22);c.quadraticCurveTo(-31,-22,26,-24);c.quadraticCurveTo(27,23,-21,22);c.stroke();path(c,[[-24,29],[25,-24]]);break;
 case "viento":for(let i=0;i<3;i++){c.beginPath();c.moveTo(-29,-15+i*15);c.bezierCurveTo(-7,-25+i*15,8,-8+i*15,23,-15+i*15);c.stroke();}circle(c,25,18,4);break;
 case "nube":c.beginPath();c.moveTo(-28,16);c.bezierCurveTo(-34,-6,-19,-12,-12,-9);c.bezierCurveTo(-6,-31,16,-30,20,-10);c.bezierCurveTo(37,-7,36,15,20,17);c.closePath();c.stroke();path(c,[[-12,4],[-4,9],[4,4]]);break;
 case "pico":path(c,[[-30,24],[-8,-23],[2,-5],[13,-31],[32,24]],false);path(c,[[-17,-2],[-8,-23],[2,-5],[13,-31],[21,-4]]);circle(c,0,22,4);break;
 case "huella":oval(c,0,14,14,17);for(let i=-2;i<=2;i++)circle(c,i*9,-15-Math.abs(i)*3,4);break;
 case "trueno":path(c,[[9,-28],[-14,0],[0,0],[-9,29],[22,-6],[7,-6],[9,-28]],true);for(let i=0;i<2;i++)beam(c,-25+i*48,15,-Math.PI/2,10);break;
 case "aurora":for(let i=0;i<3;i++){c.beginPath();c.moveTo(-31,-15+i*10);c.bezierCurveTo(-10,-35+i*9,9,11+i*4,31,-19+i*10);c.stroke();}star(c,0,18,6);break;
 case "salto":path(c,[[-30,17],[-18,0],[-7,-9],[5,-17],[19,-21],[31,-19]]);circle(c,27,-23,5);for(let i=0;i<3;i++)star(c,-24+i*14,26-i*6,4);break;
 case "cuerno":path(c,[[-20,22],[-16,-8],[0,-28],[5,-8],[20,22]]);path(c,[[-25,12],[-11,-1],[0,6],[12,-1],[25,12]]);star(c,0,-29,6);break;
 case "cima":path(c,[[-34,23],[-8,-15],[2,4],[14,-25],[34,23]]);path(c,[[0,5],[0,-26],[19,-19],[0,-12]]);heart(c,22,-27,7);break;
 default:star(c);
 }
}
export class V104MemoryDirector {
 constructor(){this.room="";this.events=[];this.triggered=0;}
 clear(){this.room="";this.events=[];}
 onRoom(room){if(this.room!==room){this.room=room;this.events=[];}}
 collect(item,t=0){
  const scene=v104Moment(item?.id);
  if(!scene||!Number.isFinite(item?.x)||!Number.isFinite(item?.y))return null;
  this.onRoom(scene.room);
  this.events=this.events.filter(e=>e.id!==scene.id).slice(-1);
  this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});
  this.triggered++;return scene;
 }
 draw(c,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
  if(!c)return;this.onRoom(room);
  this.events=this.events.filter(e=>t>=e.at&&t-e.at<V104_LIFETIME);
  for(const e of this.events){
   const scene=v104Moment(e.id),age=t-e.at,x=e.x-(cam?.x||0),y=e.y-(cam?.y||0)-32;
   if(!scene||x< -88||x>w+88||y< -88||y>h+88)continue;
   c.save();
   c.translate(x,y);
   c.globalAlpha=clamp(Math.min(age/14,(V104_LIFETIME-age)/24),0,1);
   c.lineWidth=2.1;c.lineJoin="round";c.lineCap="round";
   c.strokeStyle=scene.room==="lab"?"#94f8ed":"#edd2ff";
   c.fillStyle="rgba(7,18,42,.83)";
   if(!reduceMotion)c.translate(0,Math.sin(age*.085+scene.index)*3);
   c.beginPath();c.arc(0,0,47,0,TAU);c.fill();c.stroke();
   if(!reduceMotion){c.beginPath();c.arc(0,0,52+Math.sin(age*.09)*2,-.25,2.2);c.stroke();}
   drawIcon(c,scene.kind,reduceMotion?0:age);
   c.restore();
  }
 }
 snapshot(t=0){return {room:this.room,active:this.events.filter(e=>t>=e.at&&t-e.at<V104_LIFETIME).map(e=>e.id),triggered:this.triggered};}
}
export const V104Memories=new V104MemoryDirector();
