// OHANA V106 · last twenty illustrated memories (Caldera and Final Nest).
// Original 100 collectible IDs. No additional rewards, network or storage.
export const V106_MOMENTS=Object.freeze([
 ["volcano-0","ember","Una brasa se vuelve luciérnaga para alumbrarte."],
 ["volcano-1","sneeze","Un dragón estornuda estrellas en vez de fuego."],
 ["volcano-2","candy","La roca abre un corazón de caramelo volcánico."],
 ["volcano-3","drum","La montaña descubre que puede tocar el tambor."],
 ["volcano-4","tickle","La lava hace cosquillas y aprende a reír."],
 ["volcano-5","egg","Un huevo pequeñito se atreve a brillar."],
 ["volcano-6","ash","Las cenizas vuelan como una lluvia de estrellas."],
 ["volcano-7","leap","Una chispa da un salto mayor que la montaña."],
 ["volcano-8","campfire","Una fogata hace sitio a toda la familia."],
 ["volcano-9","bravery","El fuego crea una corona de valor compartido."],
 ["boss-0","valor","Una pequeña estrella se enfrenta a una gran sombra."],
 ["boss-1","scale","La escama perdida de la Reina recuerda la luz."],
 ["boss-2","heartbeat","Una pulsación enciende el corazón del Nido."],
 ["boss-3","laughter","Una carcajada vuelve pequeño al miedo."],
 ["boss-4","footprint","La huella de la Reina cambia de sombra a flor."],
 ["boss-5","nest-star","Una estrella escondida encuentra su cielo."],
 ["boss-6","shelter","Bajo dos alas pequeñas todos caben."],
 ["boss-7","fearless","Un corazón atraviesa la noche sin apagarse."],
 ["boss-8","echo","El último eco abre una puerta a la mañana."],
 ["boss-9","together","Cien recuerdos. Diez mundos. Una sola familia."]
].map(([id,kind,story],index)=>Object.freeze({id,kind,story,index,room:id.split("-")[0]})));
const SCENES=new Map(V106_MOMENTS.map(scene=>[scene.id,scene]));
export const V106_LIFE=156;
export function v106Moment(id){return SCENES.get(id)||null;}
const TAU=Math.PI*2;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
function path(c,points,close=false){c.beginPath();for(let i=0;i<points.length;i++){const [x,y]=points[i];i?c.lineTo(x,y):c.moveTo(x,y);}if(close)c.closePath();c.stroke();}
function ring(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
function ellipse(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.stroke();}
function star(c,x=0,y=0,r=15,n=5){const pts=[];for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,k=i%2?.39:1;pts.push([x+Math.cos(a)*r*k,y+Math.sin(a)*r*k]);}path(c,pts,true);}
function heart(c,x=0,y=0,s=1){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(0,18);c.bezierCurveTo(-31,-7,-17,-26,0,-8);c.bezierCurveTo(17,-26,31,-7,0,18);c.stroke();c.restore();}
function flame(c,x=0,y=0,size=1){c.save();c.translate(x,y);c.scale(size,size);c.beginPath();c.moveTo(0,-25);c.bezierCurveTo(29,-8,22,22,0,26);c.bezierCurveTo(-24,21,-24,-3,-10,-14);c.quadraticCurveTo(-10,3,0,-25);c.stroke();c.restore();}
function rays(c,n,r1,r2,t=0){for(let i=0;i<n;i++){const a=i*TAU/n+t*.01;path(c,[[Math.cos(a)*r1,Math.sin(a)*r1],[Math.cos(a)*r2,Math.sin(a)*r2]]);}}
function crown(c){path(c,[[-28,14],[-26,-16],[-12,-4],[0,-25],[12,-4],[26,-16],[28,14]],true);path(c,[[-26,14],[26,14]]);star(c,0,-5,7);}
function drawIcon(c,kind,t){
 const sway=Math.sin(t*.075)*4;
 switch(kind){
 case "ember":flame(c,0,3,.95);ring(c,-21,19,4);rays(c,6,27,33,t);break;
 case "sneeze":ellipse(c,0,2,23,20);path(c,[[-22,-9],[-34,-17],[-20,5]]);ring(c,-7,-3,3);ring(c,10,-3,3);for(let i=0;i<3;i++)star(c,15+i*9,-26+i*8,5);break;
 case "candy":path(c,[[-25,16],[-21,-15],[-5,-27],[24,-18],[28,16]],true);heart(c,0,0,.7);break;
 case "drum":ellipse(c,0,-11,25,9);path(c,[[-25,-11],[-19,23],[19,23],[25,-11]]);ellipse(c,0,23,19,5);path(c,[[-27,-28],[-9,-9]]);path(c,[[27,-28],[9,-9]]);break;
 case "tickle":for(let i=0;i<3;i++){const x=-20+i*20;flame(c,x,8,.4);ring(c,x,-18,4);}rays(c,5,31,35,t);break;
 case "egg":ellipse(c,0,2,19,27);path(c,[[-14,16],[-7,7],[0,16],[8,7],[16,16]]);star(c,0,-6,7);break;
 case "ash":for(let i=0;i<12;i++){const x=((i*23)%60)-30,y=((i*19)%53)-27;star(c,x+Math.sin(t*.04+i)*3,y,3+i%3,4);}break;
 case "leap":path(c,[[-29,22],[-17,7],[-3,-6],[15,-17],[29,-18]]);star(c,23,-21,11);for(let i=0;i<4;i++)ring(c,-24+i*10,26-i*8,2);break;
 case "campfire":path(c,[[-29,25],[27,13]]);path(c,[[-27,14],[29,25]]);flame(c,0,-8,.78);ring(c,-26,-21,3);ring(c,25,-25,3);break;
 case "bravery":crown(c);flame(c,0,0,.38);rays(c,8,31,36,t);break;
 case "valor":star(c,0,0,24);path(c,[[25,-28],[34,-20],[31,-3]]);rays(c,6,29,35,t);break;
 case "scale":path(c,[[-20,-26],[16,-22],[27,8],[0,27],[-25,8]],true);path(c,[[-20,7],[0,-5],[25,7]]);heart(c,0,11,.35);break;
 case "heartbeat":heart(c,0,0,1.15);path(c,[[-34,0],[-19,0],[-10,-10],[0,11],[9,-9],[18,0],[34,0]]);break;
 case "laughter":ellipse(c,0,0,24,23);ring(c,-9,-7,3);ring(c,10,-7,3);c.beginPath();c.arc(0,3,14,0,Math.PI);c.stroke();rays(c,7,31,35,t);break;
 case "footprint":ellipse(c,0,11,12,16);for(let i=-2;i<=2;i++)ring(c,i*9,-15-Math.abs(i)*2,4);star(c,0,10,7);break;
 case "nest-star":ellipse(c,0,17,28,11);for(let i=0;i<3;i++)path(c,[[-27,13+i*6],[0,18+i*5],[27,13+i*6]]);star(c,0,-14,17);break;
 case "shelter":heart(c,0,13,.65);path(c,[[-8,10],[-31,-17],[-18,-23],[0,0],[18,-23],[31,-17],[8,10]]);ring(c,-12,18,4);ring(c,12,18,4);break;
 case "fearless":heart(c,0,0,1.2);rays(c,9,30,36,t);star(c,0,-2,8);break;
 case "echo":for(let i=0;i<3;i++){c.beginPath();c.arc(-7,0,8+i*10,-1,1);c.stroke();}path(c,[[-23,-27],[-23,27]]);star(c,18,0,7);break;
 case "together":heart(c,0,2,1.15);for(let i=0;i<10;i++){const a=i*TAU/10+t*.002;star(c,Math.cos(a)*37,Math.sin(a)*37,5,4);}crown(c);break;
 }
}
export class V106MemoryDirector{
 constructor(){this.events=[];this.room="";this.triggered=0;}
 clear(){this.events=[];this.room="";}
 onRoom(room){if(room!==this.room){this.room=room;this.events=[];}}
 collect(item,t=0){
  const scene=v106Moment(item?.id);
  if(!scene||!Number.isFinite(item.x)||!Number.isFinite(item.y))return null;
  this.onRoom(scene.room);
  this.events=this.events.filter(e=>e.id!==scene.id).slice(-1);
  this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});
  this.triggered++;return scene;
 }
 draw(c,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
  if(!c)return;this.onRoom(room);
  this.events=this.events.filter(e=>t>=e.at&&t-e.at<V106_LIFE);
  for(const ev of this.events){
   const scene=v106Moment(ev.id),age=t-ev.at,x=ev.x-(cam?.x||0),y=ev.y-(cam?.y||0)-36;
   if(!scene||x<-100||x>w+100||y<-100||y>h+100)continue;
   c.save();c.translate(x,y);
   const fade=clamp(Math.min(age/14,(V106_LIFE-age)/30),0,1);
   c.globalAlpha=fade;
   c.fillStyle="rgba(9,18,37,.86)";
   c.strokeStyle=scene.room==="volcano"?"#ffd18b":"#ffaccf";
   c.lineWidth=2.2;c.lineJoin="round";c.lineCap="round";
   if(!reduceMotion)c.translate(0,Math.sin(age*.08+scene.index)*3);
   c.beginPath();c.arc(0,0,52,0,TAU);c.fill();c.stroke();
   if(!reduceMotion)rays(c,scene.kind==="together"?10:6,55,62,age);
   drawIcon(c,scene.kind,reduceMotion?0:age);
   c.restore();
  }
 }
 snapshot(t=0){return {room:this.room,active:this.events.filter(e=>t>=e.at&&t-e.at<V106_LIFE).map(e=>e.id),triggered:this.triggered};}
}
export const V106Memories=new V106MemoryDirector();
