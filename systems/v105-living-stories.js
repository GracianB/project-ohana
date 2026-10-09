// OHANA V105: 20 illustrated memories in Orbita and Arrecife.
// The existing 100 collectibles, save format and rewards remain unchanged.
// Deterministic Canvas. Max 2 scenes, no timers, no new network traffic.
export const V105_MOMENTS=Object.freeze([
 ["space-0","star","Una estrella cabe en tu bolsillo y todavía alumbra."],
 ["space-1","comet","El cometa se ríe mientras su cola se despeina."],
 ["space-2","cheese","Una luna de queso ofrece merienda para todos."],
 ["space-3","baby","Un planeta bebé ensaya su primera órbita."],
 ["space-4","satellite","El satélite se marea de tantas vueltas."],
 ["space-5","yomi","Yomi une las estrellas que estaban solas."],
 ["space-6","astronaut","Un astronauta de papel saluda a casa."],
 ["space-7","nebula","Una nebulosa sabe a caramelos espaciales."],
 ["space-8","wish","Un deseo atraviesa el cielo sin pedir permiso."],
 ["space-9","family","Una galaxia entera abraza a la familia Ohana."],
 ["reef-0","bubble","Una burbuja te sigue para contarte un secreto."],
 ["reef-1","pearl","La perla ilumina el camino de un pez perdido."],
 ["reef-2","octopus","El pulpo toca ocho notas a la vez."],
 ["reef-3","coral","Los corales crecen como un ramo de abrazos."],
 ["reef-4","jellyfish","Una medusa baila sin pisar a nadie."],
 ["reef-5","pizza","Un cofre esconde una porción de felicidad."],
 ["reef-6","seahorse","El caballito saluda con una gran reverencia."],
 ["reef-7","anemone","Una anémona abre los brazos a los viajeros."],
 ["reef-8","confetti","El agua se llena de pequeñas luces de carnaval."],
 ["reef-9","celebration","El arrecife prepara una fiesta para ti."]
].map(([id,kind,story],index)=>Object.freeze({id,kind,story,index,room:id.split("-")[0]})));
const BY_ID=new Map(V105_MOMENTS.map(s=>[s.id,s]));
export const V105_TICKS=128;
export function v105Moment(id){return BY_ID.get(id)||null;}
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function lines(c,pts,close=false){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();c.stroke();}
function ring(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
function oval(c,x,y,a,b,rot=0){c.beginPath();c.ellipse(x,y,a,b,rot,0,TAU);c.stroke();}
function star(c,x=0,y=0,r=18,n=5){const p=[];for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rad=i%2?r*.4:r;p.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad]);}lines(c,p,true);}
function heart(c,x=0,y=0,s=1){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(0,17);c.bezierCurveTo(-33,-3,-17,-22,0,-8);c.bezierCurveTo(17,-22,33,-3,0,17);c.stroke();c.restore();}
function wave(c,y,t){c.beginPath();for(let x=-30;x<=30;x+=3){const py=y+Math.sin((x+t*.6)*.17)*3;if(x===-30)c.moveTo(x,py);else c.lineTo(x,py);}c.stroke();}
function motif(c,kind,t){
 switch(kind){
 case "star":star(c,0,0,23);star(c,25,-22,6);ring(c,-25,20,3);break;
 case "comet":star(c,18,-14,15);for(let i=0;i<3;i++)wave(c,-14+i*12,t+i*7);break;
 case "cheese":ring(c,0,0,26);ring(c,-11,-8,5);ring(c,9,11,7);ring(c,12,-12,3);break;
 case "baby":ring(c,0,0,23);oval(c,0,5,35,10,-.2);ring(c,-8,-5,3);ring(c,8,-5,3);lines(c,[[-9,12],[0,16],[9,12]]);break;
 case "satellite":c.strokeRect(-9,-11,18,22);c.strokeRect(-33,-15,17,30);c.strokeRect(16,-15,17,30);lines(c,[[-16,0],[-9,0],[9,0],[16,0]]);ring(c,0,-19,5);break;
 case "yomi":for(let i=0;i<6;i++){let a=i*TAU/6;star(c,Math.cos(a)*25,Math.sin(a)*23,7,4);}lines(c,[[-25,0],[-12,-21],[12,-21],[25,0],[12,21],[-12,21]],true);ring(c,0,0,4);break;
 case "astronaut":ring(c,0,-10,19);c.strokeRect(-10,9,20,19);ring(c,-8,-13,3);ring(c,8,-13,3);lines(c,[[-10,14],[-24,19],[-29,11]]);lines(c,[[10,14],[24,19],[29,11]]);break;
 case "nebula":for(let i=0;i<4;i++)oval(c,Math.cos(i*1.5)*10,Math.sin(i*1.5)*8,22-i*3,10+i*2,i*.7);star(c,19,-22,7);break;
 case "wish":star(c,18,-14,17);lines(c,[[-30,25],[-14,9],[0,-3],[18,-14]]);for(let i=0;i<3;i++)ring(c,-25+i*10,20-i*7,2);break;
 case "family":for(let i=0;i<3;i++)oval(c,0,0,17+i*8,8+i*6,i*.65);heart(c,0,0,.65);for(let i=0;i<4;i++)star(c,Math.cos(i*TAU/4)*32,Math.sin(i*TAU/4)*26,5);break;
 case "bubble":ring(c,-4,2,22);ring(c,23,-24,8);ring(c,-26,23,5);ring(c,-12,-6,4);break;
 case "pearl":c.beginPath();c.moveTo(-29,10);c.quadraticCurveTo(0,-14,29,10);c.quadraticCurveTo(15,29,-29,10);c.stroke();ring(c,0,2,13);star(c,0,0,7);break;
 case "octopus":oval(c,0,-11,19,17);ring(c,-7,-15,3);ring(c,8,-15,3);for(let i=0;i<8;i++){const x=-22+i*6;c.beginPath();c.moveTo(-12+i*3,0);c.quadraticCurveTo(x+Math.sin(t*.1+i)*3,20,x,27-(i%3)*6);c.stroke();}break;
 case "coral":for(let i=-2;i<=2;i++){const x=i*9,y=-22+(i%3)*4;lines(c,[[x,25],[x,-4-(i%2)*8],[x+Math.sin(i)*8,y]]);ring(c,x+Math.sin(i)*8,y,4);}break;
 case "jellyfish":c.beginPath();c.moveTo(-25,2);c.quadraticCurveTo(0,-39,25,2);c.closePath();c.stroke();for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*9,2);c.quadraticCurveTo(i*9+Math.sin(t*.09+i)*5,15,i*9,27);c.stroke();}ring(c,-8,-2,3);ring(c,9,-2,3);break;
 case "pizza":c.strokeRect(-25,-2,50,29);c.beginPath();c.moveTo(-25,-2);c.quadraticCurveTo(0,-32,25,-2);c.stroke();lines(c,[[-20,11],[0,-11],[20,11]]);ring(c,0,10,5);break;
 case "seahorse":c.beginPath();c.moveTo(4,-26);c.quadraticCurveTo(27,-17,13,2);c.quadraticCurveTo(-18,2,5,22);c.quadraticCurveTo(20,31,21,15);c.stroke();lines(c,[[5,-26],[-13,-11],[9,-9]]);ring(c,10,-17,3);break;
 case "anemone":ring(c,0,17,13);for(let i=0;i<9;i++){const a=i*TAU/9;c.beginPath();c.moveTo(Math.cos(a)*8,Math.sin(a)*7+14);c.quadraticCurveTo(Math.cos(a)*23,Math.sin(a)*21+7,Math.cos(a)*29,Math.sin(a)*29-4);c.stroke();}break;
 case "confetti":for(let i=0;i<13;i++){const x=((i*17)%59)-29,y=((i*23)%55)-27;if(i%3===0)star(c,x,y,5,4);else if(i%3===1)ring(c,x,y,4);else lines(c,[[x-3,y-3],[x+3,y+3]]);}break;
 case "celebration":heart(c,0,3,.95);for(let i=0;i<7;i++){let a=i*TAU/7;star(c,Math.cos(a)*31,Math.sin(a)*27,5,4);}wave(c,26,t);break;
 default:star(c);
 }
}
export class V105MemoryDirector{
 constructor(){this.events=[];this.room="";this.triggered=0;}
 clear(){this.events=[];this.room="";}
 onRoom(room){if(this.room!==room){this.events=[];this.room=room;}}
 collect(item,t=0){
  const scene=v105Moment(item?.id);
  if(!scene||!Number.isFinite(item?.x)||!Number.isFinite(item?.y))return null;
  this.onRoom(scene.room);
  this.events=this.events.filter(e=>e.id!==scene.id).slice(-1);
  this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});
  this.triggered++;return scene;
 }
 draw(c,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
  if(!c)return;this.onRoom(room);
  this.events=this.events.filter(e=>t>=e.at&&t-e.at<V105_TICKS);
  for(const e of this.events){
   const scene=v105Moment(e.id),age=t-e.at,x=e.x-(cam?.x||0),y=e.y-(cam?.y||0)-33;
   if(!scene||x<-90||x>w+90||y<-90||y>h+90)continue;
   c.save();c.translate(x,y);
   c.globalAlpha=clamp(Math.min(age/14,(V105_TICKS-age)/25),0,1);
   c.lineWidth=2.1;c.lineCap="round";c.lineJoin="round";
   c.strokeStyle=scene.room==="space"?"#d0c5ff":"#8bf2e9";
   c.fillStyle="rgba(7,20,41,.83)";
   if(!reduceMotion)c.translate(0,Math.sin(age*.07+scene.index)*3);
   c.beginPath();c.arc(0,0,47,0,TAU);c.fill();c.stroke();
   if(!reduceMotion){c.beginPath();c.arc(0,0,51,-age*.012,2.5-age*.012);c.stroke();}
   motif(c,scene.kind,reduceMotion?0:age);
   c.restore();
  }
 }
 snapshot(t=0){return {room:this.room,active:this.events.filter(e=>t>=e.at&&t-e.at<V105_TICKS).map(e=>e.id),triggered:this.triggered};}
}
export const V105Memories=new V105MemoryDirector();
