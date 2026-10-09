// OHANA V104 · Laboratory and Mountain: twenty short illustrated discoveries.
// Only embellishes the original pickups 41–60. No save format or physics changes.
export const V104_MEMORIES=Object.freeze([
 ["lab-0","spark","La chispa dibuja su nombre con electricidad."],
 ["lab-1","button","El botón prohibido te hace una reverencia."],
 ["lab-2","robot","El robot estornuda tres píxeles de alegría."],
 ["lab-3","flask","Una probeta fabrica una nube azul."],
 ["lab-4","satellite","El satélite miniatura saluda desde su órbita."],
 ["lab-5","sock","El calcetín espacial vuelve de su misión."],
 ["lab-6","lightning","Un rayo de bolsillo ilumina el laboratorio."],
 ["lab-7","alien","Al otro lado de la señal, alguien dice hola."],
 ["lab-8","chispin","Chispín enciende una idea imposible."],
 ["lab-9","friendship","La ciencia descubre dos corazones que laten juntos."],
 ["ridge-0","feather","La pluma encuentra una corriente hacia el cielo."],
 ["ridge-1","wind","El viento te lleva una canción de la montaña."],
 ["ridge-2","cloud","Una nube regala una almohada de algodón."],
 ["ridge-3","peak","La montaña responde con una melodía."],
 ["ridge-4","footprint","Una huella gigante se dibuja en la nieve."],
 ["ridge-5","thunder","Un trueno diminuto se presenta muy serio."],
 ["ridge-6","aurora","La aurora pinta una sonrisa de colores."],
 ["ridge-7","jump","Un salto llega un poquito más cerca de las estrellas."],
 ["ridge-8","cuerno","Cuerno deja una estela brillante de amistad."],
 ["ridge-9","summit","Desde la cumbre se ve todo OHANA."]
].map(([id,kind,story],index)=>Object.freeze({id,kind,story,index,room:id.split("-")[0]})));
const map=new Map(V104_MEMORIES.map(x=>[x.id,x]));
export const V104_SCENE_TICKS=135;
export const v104Memory=id=>map.get(id)||null;
const tau=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function path(c,pts,close=false){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();c.stroke();}
function arc(c,x,y,r,a=0,b=tau){c.beginPath();c.arc(x,y,r,a,b);c.stroke();}
function ellipse(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,tau);c.stroke();}
function star(c,x=0,y=0,r=16){const points=[];for(let i=0;i<10;i++){const a=i*tau/10-Math.PI/2,v=i%2?r*.45:r;points.push([x+Math.cos(a)*v,y+Math.sin(a)*v]);}path(c,points,true);}
function heart(c,x=0,y=0){c.save();c.translate(x,y);c.beginPath();c.moveTo(0,14);c.bezierCurveTo(-27,-3,-16,-18,0,-8);c.bezierCurveTo(16,-18,27,-3,0,14);c.stroke();c.restore();}
function waves(c,t,y=12){for(let j=0;j<2;j++){const pts=[];for(let x=-30;x<=30;x+=4)pts.push([x,y+j*10+Math.sin(x/7+t*.08)*3]);path(c,pts);}}
function drawMotif(c,type,t){
 const a=Math.sin(t*.09)*4;
 switch(type){
 case "spark":star(c,0,0,25);for(let i=0;i<4;i++){let ang=i*Math.PI/2;path(c,[[Math.cos(ang)*31,Math.sin(ang)*31],[Math.cos(ang)*41,Math.sin(ang)*41]]);}break;
 case "button":ellipse(c,0,9,26,12);ellipse(c,0,1,24,12);arc(c,0,-2,9);path(c,[[-26,1],[-26,10]]);break;
 case "robot":path(c,[[-22,-17],[22,-17],[22,22],[-22,22]],true);arc(c,-10,-1,5);arc(c,10,-1,5);path(c,[[-12,14],[12,14]]);path(c,[[0,-17],[0,-29]]);arc(c,0,-31,3);break;
 case "flask":path(c,[[-8,-27],[8,-27],[8,-12],[22,17],[18,25],[-18,25],[-22,17],[-8,-12],[-8,-27]]);waves(c,t,8);break;
 case "satellite":path(c,[[-10,-12],[10,-12],[10,12],[-10,12]],true);path(c,[[-14,-9],[-33,-16],[-33,16],[-14,9]],true);path(c,[[14,-9],[33,-16],[33,16],[14,9]],true);arc(c,0,0,4);break;
 case "sock":path(c,[[-8,-29],[13,-29],[13,1],[26,6],[26,19],[13,26],[-16,26],[-25,14],[-18,4],[-8,4]],true);path(c,[[-8,-17],[13,-17]]);break;
 case "lightning":path(c,[[4,-32],[-18,2],[-1,2],[-7,30],[21,-8],[4,-8],[4,-32]]);break;
 case "alien":ellipse(c,0,0,23,28);ellipse(c,-10,-2,7,12);ellipse(c,10,-2,7,12);arc(c,0,17,5,0,Math.PI);break;
 case "chispin":arc(c,0,5,20);star(c,0,-25,12);arc(c,-8,0,3);arc(c,8,0,3);path(c,[[-8,15],[0,18],[8,15]]);break;
 case "friendship":heart(c,-12,2);heart(c,12,2);path(c,[[-34,21],[-5,27],[34,21]]);break;
 case "feather":path(c,[[-20,27],[-9,-19],[14,-30],[21,-9],[-20,27]]);path(c,[[-20,27],[14,-30]]);break;
 case "wind":waves(c,t,-16);waves(c,t+10,8);break;
 case "cloud":ellipse(c,-11,8,16,13);ellipse(c,5,-3,21,18);ellipse(c,20,11,16,12);path(c,[[-26,20],[28,20]]);break;
 case "peak":path(c,[[-34,23],[-10,-18],[1,-3],[13,-28],[35,23]],true);path(c,[[-16,-8],[-8,-2],[1,-3]]);arc(c,24,-22,5);break;
 case "footprint":ellipse(c,0,14,13,20);for(let i=-2;i<=2;i++)arc(c,i*9,-15+(i%2)*2,4);break;
 case "thunder":path(c,[[-28,-10],[-11,-24],[3,-19],[15,-32],[29,-14],[12,8],[-3,7],[-28,-10]]);path(c,[[3,-5],[-6,15],[8,12],[0,30]]);break;
 case "aurora":for(let j=0;j<3;j++){const pts=[];for(let x=-32;x<=32;x+=4)pts.push([x,-18+j*14+Math.sin(x*.1+j+t*.025)*8]);path(c,pts);}break;
 case "jump":path(c,[[-25,27],[0,-26],[25,27]]);star(c,0,-30,8);path(c,[[-24,-4],[-10,-14],[0,-5]]);break;
 case "cuerno":path(c,[[-22,18],[0,-31],[19,18]]);path(c,[[0,-31],[-6,18]]);star(c,22,-15,9);break;
 case "summit":path(c,[[-32,25],[0,-31],[32,25]],true);path(c,[[0,-31],[0,10]]);heart(c,0,9);break;
 default:star(c);
 }
}
class MemoryV104Director{
 constructor(){this.room="";this.events=[];this.total=0;}
 clear(){this.room="";this.events=[];}
 onRoom(room){if(room!==this.room){this.room=room;this.events=[];}}
 collect(item,t=0){
  const scene=v104Memory(item?.id);
  if(!scene||!Number.isFinite(item?.x)||!Number.isFinite(item?.y))return null;
  this.onRoom(scene.room);this.total++;
  this.events=this.events.filter(e=>e.id!==scene.id).slice(-1);
  this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});
  return scene;
 }
 draw(ctx,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
  if(!ctx)return;
  this.onRoom(room);
  this.events=this.events.filter(e=>t>=e.at&&t-e.at<V104_SCENE_TICKS);
  for(const e of this.events){
   const scene=v104Memory(e.id);if(!scene)continue;
   const x=e.x-(cam?.x||0),y=e.y-(cam?.y||0)-37;
   if(x< -96||x>w+96||y< -96||y>h+96)continue;
   const age=t-e.at,alpha=clamp(Math.min(age/17,(V104_SCENE_TICKS-age)/28),0,1);
   ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
   ctx.fillStyle="rgba(8,23,41,.82)";ctx.strokeStyle=scene.room==="lab"?"#a2fcff":"#ecdcff";
   ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";
   if(!reduceMotion)ctx.translate(0,Math.sin(age*.08+scene.index)*3);
   ctx.beginPath();ctx.arc(0,0,46,0,tau);ctx.fill();ctx.stroke();
   drawMotif(ctx,scene.kind,reduceMotion?0:age);ctx.restore();
  }
 }
 snapshot(t){return {room:this.room,total:this.total,active:this.events.filter(e=>t>=e.at&&t-e.at<V104_SCENE_TICKS).map(e=>e.id)};}
}
export const V104Memories=new MemoryV104Director();
