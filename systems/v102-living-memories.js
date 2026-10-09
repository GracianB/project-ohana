// OHANA V102 · Twenty illustrated micro-moments, two rooms, no additional pickups.
// Each moment is anchored to a *real* collected object. No global pause or blocking UI.
const authored = [
  ["hub-0","abrazo","♥","Dos brazos, un abrazo que empieza la aventura."],
  ["hub-1","ukelele","♫","Un ukelele diminuto responde con tres notas."],
  ["hub-2","siesta","☾","El polen se acurruca bajo una luna pequeñita."],
  ["hub-3","carcajada","✺","La hierba tiembla de risa."],
  ["hub-4","seta","♬","La seta canta su solo de bienvenida."],
  ["hub-5","guiño","✧","Una estrella guiña un ojo como Kilo."],
  ["hub-6","flor","✿","La flor crece contra todo pronóstico."],
  ["hub-7","picnic","◇","Una manta aparece para toda la familia."],
  ["hub-8","hoja","❧","Una hoja gira en el aire como si bailara."],
  ["hub-9","promesa","∞","Una promesa se ilumina entre dos manos."],
  ["beach-0","concha","◖","La concha escucha y devuelve una canción."],
  ["beach-1","castillo","♜","El castillo de arena se pone una corona."],
  ["beach-2","ola","≈","Tres olas saludan desde la orilla."],
  ["beach-3","cangrejo","⌁","Dos pinzas tímidas hacen una reverencia."],
  ["beach-4","botella","✉","Una carta encuentra su camino al corazón."],
  ["beach-5","barquito","⌁","Un barco de papel vence su primera ola."],
  ["beach-6","pez","◡","Un pez hace burbujas de risa."],
  ["beach-7","palmera","✳","La palmera se peina con el viento."],
  ["beach-8","tesoro","◆","Una caja se abre y libera una chispa."],
  ["beach-9","abrazo-mar","♡","El océano dibuja un enorme abrazo."]
].map(([id,kind,glyph,story],idx)=>Object.freeze({id,kind,glyph,story,index:idx,room:id.split("-")[0]}));

export const LIVING_MEMORIES = Object.freeze(authored);
const BY_ID=new Map(LIVING_MEMORIES.map(x=>[x.id,x]));
export const MEMORY_TICKS=145;
export function memoryMoment(id) {return BY_ID.get(id)||null;}
export function livingMemoryCount(ids=[]){return [...new Set(ids)].filter(id=>BY_ID.has(id)).length;}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TAU=Math.PI*2;

function line(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function ellipse(ctx,x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.stroke();}
function circle(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
function petal(ctx,ang,dist,size){ctx.save();ctx.rotate(ang);ellipse(ctx,0,-dist,size*.63,size);ctx.restore();}
function rays(ctx,n,r1,r2,t){for(let i=0;i<n;i++){const a=TAU*i/n+t*.01;line(ctx,Math.cos(a)*r1,Math.sin(a)*r1,Math.cos(a)*r2,Math.sin(a)*r2);}}
function heart(ctx,scale=1){ctx.save();ctx.scale(scale,scale);ctx.beginPath();ctx.moveTo(0,13);ctx.bezierCurveTo(-28,-5,-14,-17,0,-7);ctx.bezierCurveTo(14,-17,28,-5,0,13);ctx.stroke();ctx.restore();}
function star(ctx,r=15){ctx.beginPath();for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,d=i%2?r*.4:r;let x=Math.cos(a)*d,y=Math.sin(a)*d;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();}
function wave(ctx,y,t,width=65){ctx.beginPath();for(let x=-width/2;x<=width/2;x+=3){const py=y+Math.sin(x*.15+t*.08)*3;if(x===-width/2)ctx.moveTo(x,py);else ctx.lineTo(x,py);}ctx.stroke();}
function drawMotif(ctx,kind,t){
 const p=t/30,wobble=Math.sin(p)*3;
 switch(kind){
 case "abrazo":heart(ctx,1.1);ctx.beginPath();ctx.arc(-24,10,14,-1.5,1.5);ctx.arc(24,10,14,1.7,4.6);ctx.stroke();break;
 case "ukelele":ellipse(ctx,-5,8,14,16);ellipse(ctx,-5,8,5,7);line(ctx,4,-3,24,-24);for(let i=0;i<3;i++)line(ctx,-10+i*5,1,19+i*2,-20);break;
 case "siesta":ctx.beginPath();ctx.arc(0,-2,18,.3,Math.PI*1.7);ctx.stroke();for(let i=0;i<3;i++)circle(ctx,-21+i*18,21,2);break;
 case "carcajada":ellipse(ctx,0,0,22,18);ctx.beginPath();ctx.arc(0,1,11,0,Math.PI);ctx.stroke();circle(ctx,-10,-6,2);circle(ctx,10,-6,2);rays(ctx,6,27,33,p);break;
 case "seta":ctx.beginPath();ctx.moveTo(-22,3);ctx.quadraticCurveTo(0,-38,22,3);ctx.closePath();ctx.stroke();ctx.strokeRect(-8,2,16,18);circle(ctx,-8,-6,3);circle(ctx,8,-9,3);break;
 case "guiño":star(ctx,23);line(ctx,-10,0,-2,0);circle(ctx,8,0,2);break;
 case "flor":for(let i=0;i<7;i++)petal(ctx,TAU*i/7,13,11);circle(ctx,0,0,7);line(ctx,0,24,0,38);break;
 case "picnic":ctx.beginPath();ctx.moveTo(-29,12);ctx.lineTo(29,12);ctx.lineTo(18,24);ctx.lineTo(-18,24);ctx.closePath();ctx.stroke();line(ctx,-15,12,-9,23);line(ctx,0,12,0,24);line(ctx,15,12,9,23);circle(ctx,0,6,7);break;
 case "hoja":ctx.beginPath();ctx.moveTo(-20,18);ctx.quadraticCurveTo(-26,-23,19,-18);ctx.quadraticCurveTo(28,18,-20,18);ctx.stroke();line(ctx,-20,18,19,-18);break;
 case "promesa":heart(ctx,.9);circle(ctx,-23,0,8);circle(ctx,23,0,8);line(ctx,-29,13,-12,13);line(ctx,12,13,29,13);break;
 case "concha":ctx.beginPath();ctx.moveTo(-22,16);ctx.quadraticCurveTo(-28,-12,0,-22);ctx.quadraticCurveTo(28,-12,22,16);ctx.closePath();ctx.stroke();for(let i=-2;i<=2;i++)line(ctx,0,-19,i*9,15);break;
 case "castillo":ctx.strokeRect(-20,-8,40,31);ctx.strokeRect(-10,-21,20,15);for(let x=-23;x<=23;x+=12)ctx.strokeRect(x,-24,7,8);ctx.beginPath();ctx.arc(0,23,6,Math.PI,TAU);ctx.stroke();break;
 case "ola":for(let i=0;i<3;i++)wave(ctx,i*11-13,t,60-i*8);break;
 case "cangrejo":ellipse(ctx,0,5,19,12);circle(ctx,-9,-12,4);circle(ctx,9,-12,4);line(ctx,-19,0,-28,-9);line(ctx,19,0,28,-9);line(ctx,-16,14,-23,22);line(ctx,16,14,23,22);break;
 case "botella":ctx.strokeRect(-12,-10,24,32);ctx.strokeRect(-5,-23,10,13);line(ctx,-9,4,9,4);line(ctx,-9,9,0,17);line(ctx,0,17,9,9);break;
 case "barquito":ctx.beginPath();ctx.moveTo(-30,10);ctx.lineTo(30,10);ctx.lineTo(20,24);ctx.lineTo(-20,24);ctx.closePath();ctx.stroke();line(ctx,0,10,0,-26);line(ctx,0,-26,21,7);line(ctx,0,-26,-17,7);break;
 case "pez":ctx.beginPath();ctx.ellipse(0,0,20,12,0,0,TAU);ctx.moveTo(-17,0);ctx.lineTo(-29,-14);ctx.lineTo(-29,14);ctx.closePath();ctx.stroke();circle(ctx,10,-3,2);for(let i=0;i<3;i++)circle(ctx,23+i*8,-15-i*9,2+i);break;
 case "palmera":line(ctx,0,27,4,-15);for(let i=0;i<5;i++){const a=-Math.PI+i*Math.PI/4;line(ctx,4,-15,4+Math.cos(a)*28,-15+Math.sin(a)*16);}line(ctx,4,27,-5,27);break;
 case "tesoro":ctx.strokeRect(-23,0,46,23);ctx.beginPath();ctx.moveTo(-23,0);ctx.quadraticCurveTo(0,-24,23,0);ctx.stroke();star(ctx,8);break;
 case "abrazo-mar":heart(ctx,1.2);wave(ctx,18,t,74);wave(ctx,28,t+9,65);break;
 default:star(ctx);
 }
}
export class LivingMemoryDirector {
 constructor(){this.events=[];this.room="";this.totalTriggered=0;}
 clear(){this.events=[];this.room="";}
 onRoom(room){if(this.room!==room){this.events=[];this.room=room;}}
 collect(item,t=0){
   const scene=memoryMoment(item?.id);
   if(!scene||!Number.isFinite(item?.x)||!Number.isFinite(item?.y))return null;
   this.onRoom(scene.room);
   this.events=this.events.filter(e=>e.id!==scene.id).slice(-2);
   this.events.push({id:scene.id,x:item.x,y:item.y,at:Number.isFinite(t)?t:0});
   this.totalTriggered++;
   return scene;
 }
 active(t){return this.events.filter(e=>t>=e.at&&t-e.at<MEMORY_TICKS);}
 draw(ctx,cam,t,{room="",reduceMotion=false,w=1280,h=720}={}){
   if(!ctx)return;
   this.onRoom(room);
   this.events=this.active(t);
   for(const event of this.events){
     const scene=memoryMoment(event.id);if(!scene)continue;
     const age=Math.max(0,t-event.at),k=clamp(age/18,0,1);
     const fade=clamp((MEMORY_TICKS-age)/35,0,1),alpha=k*fade;
     const x=event.x-(cam?.x||0),y=event.y-(cam?.y||0)-clamp(age*.14,0,13);
     if(x<-95||x>w+95||y<-95||y>h+95)continue;
     ctx.save();ctx.translate(x,y);
     ctx.globalAlpha=alpha*.95;
     const width=reduceMotion?1.8:2.1;
     ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
     ctx.strokeStyle=scene.room==="hub"?"#fff0ad":"#9ef5f2";
     ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=reduceMotion?0:8;
     const offset=reduceMotion?0:Math.sin(age*.08+scene.index)*3;
     ctx.translate(0,offset-36);
     const spin=reduceMotion?0:Math.sin(age*.024+scene.index)*.075;
     ctx.rotate(spin);
     ctx.fillStyle="rgba(5,22,39,.82)";ctx.beginPath();ctx.arc(0,0,47,0,TAU);ctx.fill();
     circle(ctx,0,0,43);rays(ctx,8,49,54,reduceMotion?0:age);
     drawMotif(ctx,scene.kind,reduceMotion?0:age);
     ctx.restore();
   }
 }
 snapshot(t){return {total:this.totalTriggered,active:this.active(t).map(e=>e.id),room:this.room};}
}
export const LivingMemories=new LivingMemoryDirector();
