// OHANA V100.2 · Cien descubrimientos jugables, diez por cada sala.
// Motivos y títulos escritos a mano. Motor limitado a la sala actual y 10 sprites.
import { addPlayerXp, healPlayer, addScore, addCombo } from "./mutations.js";
import { showObjectiveMessage } from "./notify.js";

export const FESTIVAL_ROOMS = Object.freeze([{"id":"hub","name":"Claro Ohana","color":"#ffe49c","story":"El claro guarda abrazos que brillan.","titles":["El primer abrazo","Ukelele perdido","Polen dormilón","Risa en el césped","La seta cantante","Un guiño de Kilo","La flor testaruda","El picnic secreto","La hoja que baila","La promesa Ohana"]},{"id":"beach","name":"Costa Hoku","color":"#82e4ec","story":"La costa tiene más historias que granos de arena.","titles":["Concha cantante","Castillo torcido","La ola traviesa","Cangrejo tímido","Botella sin mensaje","Barquito de papel","El pez bromista","Palmera de fiesta","Tesoro de Frita","El abrazo del mar"]},{"id":"jungle","name":"Jungla Alta","color":"#a7e884","story":"Entre lianas, alguien se ríe.","titles":["La liana risueña","Rana directora","Mariposa ninja","Un plátano rebelde","La hoja gigante","Rugido de bolsillo","El nido vacío","Musgo saltarín","El escondite Stitcho","Coro de la jungla"]},{"id":"cave","name":"Cueva Azul","color":"#adceff","story":"Las piedras también tienen secretos.","titles":["Eco de gato","Cristal del bostezo","Murciélago poeta","Piedra con ojos","La gota valiente","El túnel musical","La luna en una roca","Huella invisible","Michi encontró luz","El corazón de la cueva"]},{"id":"lab","name":"Alien Lab","color":"#7beaff","story":"Ni los científicos pueden explicar estas tonterías.","titles":["Chispa experimental","Botón prohibido","Robot con hipo","La probeta azul","Satélite miniatura","Calcetín espacial","Rayo de bolsillo","El mensaje alien","Chispín hace ciencia","Experimento amistad"]},{"id":"ridge","name":"Cumbre","color":"#e6d3ff","story":"El viento se llevó unas risas y las dejó aquí.","titles":["Pluma imposible","El viento juguetón","Nube almohada","Pico musical","Huella del gigante","Trueno pequeñito","Aurora tímida","Un salto eterno","Saludo de Cuerno","La cima compartida"]},{"id":"space","name":"Órbita","color":"#b7b3ff","story":"Hasta las estrellas hacen travesuras.","titles":["Estrella de bolsillo","Cometa risueño","Luna de queso","Un planeta bebé","Satélite mareado","Constelación Yomi","Astronauta de papel","Nebulosa de caramelo","Deseo en órbita","La galaxia Ohana"]},{"id":"reef","name":"Arrecife Abismo","color":"#65ebdf","story":"El fondo del mar tiene su propio carnaval.","titles":["Burbuja traviesa","La perla del pez","Pulpo pianista","Coral de colores","Medusa bailarina","Tesoro de Pizza","Caballito curioso","La anémona amable","Marea de confeti","El festival submarino"]},{"id":"volcano","name":"Caldera","color":"#ffc083","story":"Hasta el fuego puede contar un chiste.","titles":["Brasa amigable","Dragón estornuda","Roca de caramelo","Chimenea musical","Lava de mentira","El huevo valiente","Ceniza de colores","Salto de magma","Fogata en familia","La llama del valor"]},{"id":"boss","name":"Nido Final","color":"#ff91b5","story":"La valentía es más fuerte cuando se comparte.","titles":["Valor de bolsillo","Escama caída","Un latido de luz","Risa contra el miedo","Huella de la Reina","Estrella del Nido","El refugio pequeño","Corazón sin miedo","El último eco","Todos juntos"]}]);
export const FESTIVAL_KINDS = Object.freeze(["star","heart","leaf","shield","note","ring","diamond","wing","spark","crown"]);
export const FESTIVAL_TOTAL = 100;
export const FESTIVAL_KEY = "ohana-festival-v1002";
export const FESTIVAL_DESCRIPTIONS = Object.freeze(["Una chispa nueva para tu aventura.","El mundo te cuida un poquito.","Una pista para crecer sin dejar de jugar.","Respira: aquí estás a salvo unos instantes.","¡Eso merece un pequeño baile!","Un eco brillante despierta.","Encontraste una pequeña fortuna.","Un golpe de suerte te hace avanzar.","Guarda este recuerdo con una sonrisa.","¡Has completado una parte de la familia!"]);
export const FESTIVAL_CATALOG = Object.freeze(FESTIVAL_ROOMS.flatMap((room) =>
  room.titles.map((title, slot) => Object.freeze({
    id:room.id+"-"+slot, room:room.id, roomName:room.name, slot, title,
    description:FESTIVAL_DESCRIPTIONS[slot],
    color:room.color, kind:FESTIVAL_KINDS[slot],
  }))
));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function festivalProgress(ids){
  const unique=new Set(Array.isArray(ids)?ids:[]);
  const byRoom=Object.fromEntries(FESTIVAL_ROOMS.map(r=>[r.id,0]));
  for(const item of FESTIVAL_CATALOG) if(unique.has(item.id))byRoom[item.room]++;
  return {found:Object.values(byRoom).reduce((a,b)=>a+b,0),total:FESTIVAL_TOTAL,byRoom};
}
export function festivalPlacements(room,platforms=[]){
  const usable=platforms.filter(p=>p&&p.w>=90&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.y>160&&p.h>0)
    .sort((a,b)=>a.x-b.x||a.y-b.y);
  if(!usable.length)return [];
  return FESTIVAL_CATALOG.filter(item=>item.room===room).map((item,i)=>{
    const p=usable[Math.min(usable.length-1,Math.floor((i+.4)*usable.length/10))];
    // Two different fractions avoid stacking on short bridges or ground.
    const fraction=.16+((i*7)%11)/15;
    return {...item,x:p.x+clamp(fraction,.12,.86)*p.w,y:p.y-34};
  });
}
export function festivalNear(player,item,radius=48){
  if(!player||!item)return false;
  const x=Number(player.x)+Number(player.w||0)/2;
  const y=Number(player.y)+Number(player.h||0)/2;
  return Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x-item.x,y-item.y)<radius;
}
function readAlbum(){
  try{
    if(typeof localStorage==="undefined")return [];
    const raw=JSON.parse(localStorage.getItem(FESTIVAL_KEY)||"[]");
    return Array.isArray(raw)?raw.filter(id=>typeof id==="string").slice(0,100):[];
  }catch(_){return [];}
}
function storeAlbum(ids){
  try{if(typeof localStorage!=="undefined")localStorage.setItem(FESTIVAL_KEY,JSON.stringify([...ids]));}catch(_){}
}
function safeText(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const fmt=n=>String(n).padStart(2,"0");
const shape=(ctx,kind,color)=>{
  ctx.fillStyle=color;ctx.strokeStyle="#fffbe5";ctx.lineWidth=1.8;ctx.lineJoin="round";
  ctx.beginPath();
  switch(kind){
    case "heart":
      ctx.moveTo(0,10);ctx.bezierCurveTo(-26,-6,-11,-18,0,-8);ctx.bezierCurveTo(11,-18,26,-6,0,10);break;
    case "shield":
      ctx.moveTo(0,-15);ctx.lineTo(14,-9);ctx.lineTo(11,7);ctx.lineTo(0,16);ctx.lineTo(-11,7);ctx.lineTo(-14,-9);break;
    case "diamond":
      ctx.moveTo(0,-17);ctx.lineTo(14,0);ctx.lineTo(0,17);ctx.lineTo(-14,0);break;
    case "crown":
      ctx.moveTo(-14,10);ctx.lineTo(-16,-9);ctx.lineTo(-7,-2);ctx.lineTo(0,-14);ctx.lineTo(8,-2);ctx.lineTo(16,-9);ctx.lineTo(14,10);break;
    case "ring": ctx.arc(0,0,11,0,Math.PI*2);break;
    case "note":ctx.moveTo(3,-12);ctx.lineTo(12,-15);ctx.lineTo(12,5);ctx.arc(7,9,5,0,Math.PI*2);break;
    case "wing":ctx.moveTo(-14,10);ctx.quadraticCurveTo(-19,-14,-2,-13);ctx.quadraticCurveTo(8,-13,14,10);ctx.quadraticCurveTo(0,3,-14,10);break;
    case "leaf":ctx.moveTo(-12,13);ctx.quadraticCurveTo(-21,-12,12,-15);ctx.quadraticCurveTo(18,6,-12,13);break;
    case "spark":
    case "star":
    default:
      for(let i=0;i<10;i++){
        const a=-Math.PI/2+i*Math.PI/5,r=i%2?6:kind==="spark"?19:16;
        const x=Math.cos(a)*r,y=Math.sin(a)*r;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }break;
  }
  ctx.closePath();ctx.fill();ctx.stroke();
};
class FestivalDirector{
  constructor(){
    this.claimed=new Set(readAlbum().filter(id=>FESTIVAL_CATALOG.some(x=>x.id===id)));
    this.items=[];this.lastRoom="";this.tickN=0;this.toastT=0;this.album=null;this.button=null;
    this.focusBefore=null;this.justCollected=null;this.lastEventT=-10000;
  }
  mount(){
    if(typeof document==="undefined"||this.album)return;
    this.button=document.getElementById("btn-festival");
    this.button?.addEventListener("click",()=>this.open());
    document.getElementById("btn-festival-title")?.addEventListener("click",()=>this.open());
    this.album=document.getElementById("festival-album");
    this.album?.querySelector(".festival-close")?.addEventListener("click",()=>this.close());
    this.album?.addEventListener("click",e=>{if(e.target===this.album)this.close();});
    addEventListener("keydown",e=>{
      if(this.isOpen()&&e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();this.close();return;}
      if(e.key?.toLowerCase()!=="b"||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
      if(document.activeElement?.matches("input,textarea,select,[contenteditable]"))return;
      if(document.querySelector("#ohana-intro.show,#start-intro.show,#help.open,#map-overlay.open,#pause-overlay.open,#win-cinema.show"))return;
      e.preventDefault();e.stopImmediatePropagation();this.isOpen()?this.close():this.open();
    },true);
    this.setCounter();
  }
  isOpen(){return !!this.album?.classList.contains("open");}
  setCounter(){
    const n=this.claimed.size;
    if(this.button){this.button.textContent="✦ Álbum "+n+"/100";this.button.setAttribute("aria-label","Abrir álbum de "+n+" de 100 descubrimientos. Tecla B");}
    const label=document.getElementById("festival-title-count");
    if(label)label.textContent=n+" / 100";
  }
  open(){
    this.mount();
    if(!this.album)return;
    this.focusBefore=document.activeElement;
    const progress=festivalProgress([...this.claimed]);
    const roomHTML=FESTIVAL_ROOMS.map((room,ri)=>{
      const n=progress.byRoom[room.id];
      return '<section class="festival-chapter" style="--festival-accent:'+room.color+'"><h3><span>'+safeText(room.name)+'</span><small>'+n+'/10</small></h3><p>'+safeText(room.story)+'</p><ol>'+room.titles.map((title,i)=>{
        const unlocked=this.claimed.has(room.id+"-"+i);
        return '<li class="'+(unlocked?"found":"locked")+'"><span class="festival-slot">'+fmt(ri*10+i+1)+'</span><span>'+(unlocked?safeText(title):"Por descubrir")+'</span><span aria-hidden="true">'+(unlocked?"✦":"◇")+'</span></li>';
      }).join("")+'</ol></section>';
    }).join("");
    const body=this.album.querySelector(".festival-contents");
    if(body)body.innerHTML=roomHTML;
    const total=this.album.querySelector(".festival-count");
    if(total)total.textContent=progress.found+" / 100";
    const bar=this.album.querySelector(".festival-progress i");
    if(bar)bar.style.width=progress.found+"%";
    this.album.classList.add("open");this.album.setAttribute("aria-hidden","false");
    this.album.querySelector(".festival-close")?.focus({preventScroll:true});
  }
  close(){
    if(!this.album)return;
    this.album.classList.remove("open");this.album.setAttribute("aria-hidden","true");
    if(this.focusBefore?.isConnected)this.focusBefore.focus({preventScroll:true});
  }
  reset(){this.items=[];this.lastRoom="";this.tickN=0;this.toastT=0;this.justCollected=null;this.setCounter();}
  onEnterRoom(game){
    if(!game)return;
    this.lastRoom=game.roomId;
    this.items=festivalPlacements(game.roomId,game.platforms).filter(it=>!this.claimed.has(it.id));
    this.setCounter();
  }
  take(item,game){
    if(this.claimed.has(item.id))return false;
    this.claimed.add(item.id);storeAlbum(this.claimed);
    const p=game.player;
    const i=item.slot;
    addScore(game,[22,25,30,26,40,32,70,45,35,100][i]);
    if(i===1||i===6)healPlayer(p,i===1?12:8);
    if(i===2||i===5||i===8)addPlayerXp(p,i===8?2:1);
    if(i===3)p.invuln=Math.max(Number(p.invuln)||0,90);
    if(i===4){addCombo(game,1);game.comboT=Math.max(Number(game.comboT)||0,180);}
    if(i===7&&p.grounded)p.vy=Math.min(Number(p.vy)||0,-4);
    const sparks=game.reduceMotion?3:i===9?24:12;
    game.fx?.emit?.(item.x,item.y,{color:item.color,count:sparks,size:i===9?5:3,up:1.6,speed:i===9?4.1:2.3,life:24,star:true});
    game.nums?.add?.(item.x,item.y-30,"✦ "+(this.claimed.size)+"/100",item.color);
    this.toastT=170;
    this.justCollected=item;
    this.setCounter();
    if(i===9){
      healPlayer(p,12);
      game.fx?.emit?.(p.x+p.w/2,p.y,{color:"#fff1b5",count:game.reduceMotion?5:24,size:4,up:2.2,life:26,star:true});
      showObjectiveMessage("¡COLECCIÓN DEL MUNDO!",item.roomName+" · has encontrado sus diez recuerdos.");
    }
    if(this.claimed.size===100){
      showObjectiveMessage("¡LA FAMILIA COMPLETA!","100 recuerdos descubiertos. Nadie se queda atrás.");
    }
    if(typeof document!=="undefined"){
      const toast=document.getElementById("festival-toast");
      if(toast){
        const icon=toast.querySelector(".festival-toast-icon"),title=toast.querySelector("strong"),desc=toast.querySelector("span:last-child");
        if(icon)icon.textContent=["✦","♥","♧","◆","♫","◌","◇","➶","✶","♛"][i];
        if(title)title.textContent=item.title;
        if(desc)desc.textContent=item.description+" · "+this.claimed.size+"/100";
        toast.style.setProperty("--festival-accent",item.color);
        toast.classList.add("show");
      }
    }
    return true;
  }
  update(game,t){
    if(!game?.player||game.player.dead||game.finale||game.won)return;
    this.tickN=t;
    if(this.lastRoom!==game.roomId)this.onEnterRoom(game);
    if(this.toastT>0&&--this.toastT===0){
      document.getElementById("festival-toast")?.classList.remove("show");
    }
    // Every fourth tick is enough for collectibles with 42px proximity.
    if(t%4!==0||!this.items.length)return;
    for(let i=0;i<this.items.length;i++){
      const item=this.items[i];
      if(festivalNear(game.player,item,50)){
        this.take(item,game);this.items.splice(i,1);break;
      }
    }
  }
  draw(ctx,cam,t,game){
    if(!ctx||!this.items.length||game?.finale||game?.won)return;
    const W=game?.viewW||1280,H=game?.viewH||720;
    for(const item of this.items){
      const x=item.x-(cam?.x||0),y=item.y-(cam?.y||0);
      if(x< -45||x>W+45||y< -45||y>H+45)continue;
      const bob=game.reduceMotion?0:Math.sin(t*.045+item.slot*1.4)*4;
      ctx.save();ctx.translate(x,y+bob);
      const glow=ctx.createRadialGradient(0,0,3,0,0,26);
      glow.addColorStop(0,item.color+"aa");glow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=glow;ctx.fillRect(-28,-28,56,56);
      ctx.globalAlpha=.9;shape(ctx,item.kind,item.color);
      ctx.fillStyle="#fff6db";ctx.font="700 9px Outfit, sans-serif";ctx.textAlign="center";
      ctx.fillText(String(item.slot+1),0,32);
      ctx.restore();
    }
  }
  snapshot(){
    const p=festivalProgress([...this.claimed]);
    return {...p,room:this.lastRoom,remaining:this.items.length,items:this.items.map(i=>({id:i.id,x:i.x,y:i.y}))};
  }
}
export const Festival=new FestivalDirector();
