// OHANA V100.2 · Cien descubrimientos jugables, diez por cada sala.
// Motivos y títulos escritos a mano. Motor limitado a la sala actual y 10 sprites.
import { addPlayerXp, healPlayer, addScore, addCombo } from "./mutations.js";
import { FestivalMoment, worldMilestone, chapterSeal, V101_COMPLETION_REWARD } from "./v101-milestones.js";
import { LivingMemories, memoryMoment } from "./v102-living-memories.js";
import { V103Memories } from "./v103-living-stories.js";
import { V104Memories } from "./v104-living-stories.js";
import { V105Memories } from "./v105-living-stories.js";
// Notifications are injected by game.js; module remains importable in Node tests.

export const FESTIVAL_ROOMS = Object.freeze([{"id":"hub","name":"Claro Ohana","color":"#ffe49c","story":"El claro guarda abrazos que brillan.","titles":["El primer abrazo","Ukelele perdido","Polen dormilón","Risa en el césped","La seta cantante","Un guiño de Kilo","La flor testaruda","El picnic secreto","La hoja que baila","La promesa Ohana"]},{"id":"beach","name":"Costa Hoku","color":"#82e4ec","story":"La costa tiene más historias que granos de arena.","titles":["Concha cantante","Castillo torcido","La ola traviesa","Cangrejo tímido","Botella sin mensaje","Barquito de papel","El pez bromista","Palmera de fiesta","Tesoro de Frita","El abrazo del mar"]},{"id":"jungle","name":"Jungla Alta","color":"#a7e884","story":"Entre lianas, alguien se ríe.","titles":["La liana risueña","Rana directora","Mariposa ninja","Un plátano rebelde","La hoja gigante","Rugido de bolsillo","El nido vacío","Musgo saltarín","El escondite Stitcho","Coro de la jungla"]},{"id":"cave","name":"Cueva Azul","color":"#adceff","story":"Las piedras también tienen secretos.","titles":["Eco de gato","Cristal del bostezo","Murciélago poeta","Piedra con ojos","La gota valiente","El túnel musical","La luna en una roca","Huella invisible","Michi encontró luz","El corazón de la cueva"]},{"id":"lab","name":"Alien Lab","color":"#7beaff","story":"Ni los científicos pueden explicar estas tonterías.","titles":["Chispa experimental","Botón prohibido","Robot con hipo","La probeta azul","Satélite miniatura","Calcetín espacial","Rayo de bolsillo","El mensaje alien","Chispín hace ciencia","Experimento amistad"]},{"id":"ridge","name":"Cumbre","color":"#e6d3ff","story":"El viento se llevó unas risas y las dejó aquí.","titles":["Pluma imposible","El viento juguetón","Nube almohada","Pico musical","Huella del gigante","Trueno pequeñito","Aurora tímida","Un salto eterno","Saludo de Cuerno","La cima compartida"]},{"id":"space","name":"Órbita","color":"#b7b3ff","story":"Hasta las estrellas hacen travesuras.","titles":["Estrella de bolsillo","Cometa risueño","Luna de queso","Un planeta bebé","Satélite mareado","Constelación Yomi","Astronauta de papel","Nebulosa de caramelo","Deseo en órbita","La galaxia Ohana"]},{"id":"reef","name":"Arrecife Abismo","color":"#65ebdf","story":"El fondo del mar tiene su propio carnaval.","titles":["Burbuja traviesa","La perla del pez","Pulpo pianista","Coral de colores","Medusa bailarina","Tesoro de Pizza","Caballito curioso","La anémona amable","Marea de confeti","El festival submarino"]},{"id":"volcano","name":"Caldera","color":"#ffc083","story":"Hasta el fuego puede contar un chiste.","titles":["Brasa amigable","Dragón estornuda","Roca de caramelo","Chimenea musical","Lava de mentira","El huevo valiente","Ceniza de colores","Salto de magma","Fogata en familia","La llama del valor"]},{"id":"boss","name":"Nido Final","color":"#ff91b5","story":"La valentía es más fuerte cuando se comparte.","titles":["Valor de bolsillo","Escama caída","Un latido de luz","Risa contra el miedo","Huella de la Reina","Estrella del Nido","El refugio pequeño","Corazón sin miedo","El último eco","Todos juntos"]}]);
export const FESTIVAL_STORIES = Object.freeze({"hub":["En el Claro nadie empieza solo.","Una guitarra diminuta suena entre hojas.","Ese polen quiere cinco minutos más.","Hasta la hierba tiene cosquillas.","No era una seta. Era la vocalista.","Kilo sabe guardar un secreto.","Esta flor nunca se rinde.","Hay sitio para diez en esta manta.","La hoja se apunta al baile.","La familia se cuida de verdad."],"beach":["La concha se cree sirena.","Lo construyó un cangrejo sin planos.","La ola quería darte los buenos días.","Tiene dos pinzas y cero valentía.","El mensaje era una sonrisa.","No sabe nadar, pero presume.","El pez aprendió a contar chistes.","Hoy la palmera se ha peinado.","Frita escondió algo que cruje.","El mar siempre devuelve un abrazo."],"jungle":["La liana quería jugar al escondite.","Esta rana dirige el coro.","Ni los ninjas la vieron venir.","El plátano decidió escapar.","Puede cobijar una familia entera.","Es un rugido tamaño bolsillo.","Alguien salió a explorar antes.","Este musgo tiene muelles.","Stitcho estaba justo detrás.","En la jungla cantan hasta las piedras."],"cave":["El eco respondió con un miau.","Un cristal quiere seguir durmiendo.","Recita poemas colgado del techo.","La roca lleva siglos observando.","Una gota no le teme al abismo.","Las paredes saben percusión.","Un pedacito de luna se quedó.","Michi pasó sin hacer ruido.","En la oscuridad nació un destello.","Hasta una cueva puede ser hogar."],"lab":["El invento funciona, más o menos.","El cartel decía: NO TOCAR.","El robot tiene hipo digital.","No es zumo, por si preguntabas.","Envía sonrisas a otra galaxia.","Misterio sin resolver: un calcetín.","Chispín lo guardaba para después.","Traducido del alien: hola familia.","La ciencia mejora con amigos.","El resultado fue cien por cien cariño."],"ridge":["Una pluma vuela contra el viento.","El aire te hace una reverencia.","Parece una almohada enorme.","La montaña conoce la melodía.","Alguien grandísimo pasó por aquí.","La tormenta hizo un sonido chiquito.","Una aurora se puso colorada.","Hasta el horizonte quiere saltar.","Cuerno dejó esta luz a propósito.","Desde aquí se ve toda la familia."],"space":["La estrella cabe en una mano.","Este cometa ríe al despegar.","Los astronautas pidieron merienda.","El planeta aún lleva pañales.","Da vueltas sin saber por qué.","Yomi recuerda una historia antigua.","Su casco es un dedal.","Huele a azúcar de las estrellas.","Pídelo sin decírselo a nadie.","Ninguna galaxia brilla en soledad."],"reef":["Una burbuja te sigue sonriendo.","Dentro había una canción.","El pulpo toca ocho teclas a la vez.","Cada coral tiene su carácter.","La medusa conoce tres pasos.","Pizza dejó una porción de alegría.","Este caballito lo pregunta todo.","Una anémona vino a saludarte.","El agua parece confeti.","Hay una fiesta incluso bajo el mar."],"volcano":["Una brasa aprendió a saludar.","El estornudo apagó una vela.","Parece lava, pero es dulce.","La montaña toca un tambor.","Esta lava solo quiere cosquillas.","Algo muy pequeño tiene valor.","Las cenizas parecen estrellas.","La roca pide un gran salto.","El fuego calienta el corazón.","El valor crece cuando se comparte."],"boss":["Llevas coraje incluso en miniatura.","La Reina también pierde escamas.","Una luz insiste en volver.","El miedo se hizo pequeñito.","Hasta una sombra deja huella.","El Nido esconde estrellas.","Un lugar seguro junto al peligro.","Tu corazón sabe ser valiente.","Escucha: algo nuevo comienza.","Nadie se queda atrás. Nunca."]});
export const FESTIVAL_KINDS = Object.freeze(["star","heart","leaf","shield","note","ring","diamond","wing","spark","crown"]);
export const FESTIVAL_TOTAL = 100;
export const FESTIVAL_KEY = "ohana-festival-v1002";
export const FESTIVAL_DESCRIPTIONS = Object.freeze(["Una chispa nueva para tu aventura.","El mundo te cuida un poquito.","Una pista para crecer sin dejar de jugar.","Respira: aquí estás a salvo unos instantes.","¡Eso merece un pequeño baile!","Un eco brillante despierta.","Encontraste una pequeña fortuna.","Un golpe de suerte te hace avanzar.","Guarda este recuerdo con una sonrisa.","¡Has completado una parte de la familia!"]);
export const FESTIVAL_CATALOG = Object.freeze(FESTIVAL_ROOMS.flatMap((room) =>
  room.titles.map((title, slot) => Object.freeze({
    id:room.id+"-"+slot, room:room.id, roomName:room.name, slot, title,
    description:FESTIVAL_STORIES[room.id][slot],
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
    this.runCollected=new Set();
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
    this.album?.addEventListener("click",e=>{
      if(e.target===this.album){this.close();return;}
      const chapterButton=e.target.closest?.("[data-festival-chapter]");
      if(chapterButton){this.activateChapter(chapterButton.dataset.festivalChapter);return;}
      const replay=e.target.closest?.("[data-festival-replay]");
      if(replay){const chapter=replay.dataset.festivalReplay;this.close();FestivalMoment.show(chapter,{replay:true});}
    });
    document.addEventListener("ohana-open-album",event=>this.open(event.detail?.roomId));
    addEventListener("keydown",e=>{
      if(this.isOpen()&&e.key==="Tab"){e.preventDefault();this.album.querySelector(".festival-close")?.focus();return;}
      if(this.isOpen()&&e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();this.close();return;}
      if(e.key?.toLowerCase()!=="b"||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
      if(document.activeElement?.matches("input,textarea,select,[contenteditable]"))return;
      if(document.querySelector("#ohana-intro.show,#start-intro.show,#help.open,#map-overlay.open,#pause-overlay.open,#win-cinema.show"))return;
      e.preventDefault();e.stopImmediatePropagation();this.isOpen()?this.close():this.open();
    },true);
    FestivalMoment.mount();
    this.setCounter();
  }
  isOpen(){return !!this.album?.classList.contains("open");}
  setCounter(){
    const n=this.claimed.size;
    const count=festivalProgress([...this.claimed]);
    const chapter=FESTIVAL_ROOMS.find(x=>x.id===this.lastRoom);
    if(this.button){this.button.textContent="✦ Álbum "+n+"/100";this.button.setAttribute("aria-label","Abrir álbum de "+n+" de 100 descubrimientos. Tecla B");}
    const inRoom=typeof document!=="undefined"?document.getElementById("festival-room-meter"):null;
    if(inRoom&&chapter){
      const n=count.byRoom[chapter.id];
      inRoom.textContent=n===10?"✦ "+chapterSeal(chapter.id,n)+" Sello conseguido · "+chapter.name:
        "✦ Recuerdos "+n+"/10 · "+chapter.name;
    }
    const label=typeof document!=="undefined"?document.getElementById("festival-title-count"):null;
    if(label)label.textContent=n+" / 100";
  }
  open(roomId){
    this.mount();
    if(!this.album)return;
    this.focusBefore=document.activeElement;
    const progress=festivalProgress([...this.claimed]);
    const roomHTML=FESTIVAL_ROOMS.map((room,ri)=>{
      const n=progress.byRoom[room.id];
      return '<section class="festival-chapter '+(n===10?'completed':'')+'" data-festival-room="'+room.id+'" style="--festival-accent:'+room.color+'"><h3><span>'+safeText(room.name)+'</span><small>'+(n===10?'✦ SELLO '+chapterSeal(room.id,n):n+'/10')+'</small></h3><p>'+safeText(room.story)+'</p><ol>'+room.titles.map((title,i)=>{
        const unlocked=this.claimed.has(room.id+"-"+i);
        return '<li class="'+(unlocked?"found":"locked")+'"><span class="festival-slot">'+fmt(ri*10+i+1)+'</span><span class="festival-item-copy"><b>'+(unlocked?safeText(title):"Por descubrir")+'</b>'+(unlocked?'<em>'+safeText(FESTIVAL_STORIES[room.id][i])+'</em>':'')+'</span><span aria-hidden="true">'+(unlocked?"✦":"◇")+'</span></li>';
      }).join("")+'</ol>'+(n===10?'<button class="festival-replay" type="button" data-festival-replay="'+room.id+'">✦ Revivir la celebración de este mundo</button>':'<p class="festival-chapter-goal">Encuentra los diez recuerdos para descubrir su sello secreto.</p>')+'</section>';
    }).join("");
    const body=this.album.querySelector(".festival-contents");
    if(body)body.innerHTML=roomHTML;
    const nav=this.album.querySelector(".festival-world-nav");
    if(nav) nav.innerHTML=FESTIVAL_ROOMS.map(room=>{
      const n=progress.byRoom[room.id];
      return '<button type="button" data-festival-chapter="'+room.id+'" style="--festival-accent:'+room.color+'" aria-pressed="false"><span class="festival-nav-mark">'+(n===10?chapterSeal(room.id,n):"✧")+'</span><span>'+safeText(room.name)+'</span><small>'+n+'/10</small></button>';
    }).join("");
    this.activateChapter(FESTIVAL_ROOMS.some(room=>room.id===roomId)?roomId:
      FESTIVAL_ROOMS.some(room=>room.id===this.lastRoom)?this.lastRoom:"hub");
    const total=this.album.querySelector(".festival-count");
    if(total)total.textContent=progress.found+" / 100";
    const bar=this.album.querySelector(".festival-progress i");
    if(bar)bar.style.width=progress.found+"%";
    this.album.classList.add("open");this.album.setAttribute("aria-hidden","false");
    this.album.querySelector(".festival-close")?.focus({preventScroll:true});
  }
  activateChapter(roomId){
    if(!FESTIVAL_ROOMS.some(room=>room.id===roomId))return;
    for(const section of this.album?.querySelectorAll(".festival-chapter")||[]){
      const active=section.dataset.festivalRoom===roomId;
      section.classList.toggle("active",active);
      section.setAttribute("aria-hidden",active?"false":"true");
    }
    for(const button of this.album?.querySelectorAll("[data-festival-chapter]")||[]){
      button.setAttribute("aria-pressed",String(button.dataset.festivalChapter===roomId));
    }
  }
  close(){
    if(!this.album)return;
    this.album.classList.remove("open");this.album.setAttribute("aria-hidden","true");
    if(this.focusBefore?.isConnected)this.focusBefore.focus({preventScroll:true});
  }
  reset(){this.items=[];this.runCollected.clear();this.lastRoom="";this.tickN=0;this.toastT=0;this.justCollected=null;FestivalMoment.close();LivingMemories.clear();V103Memories.clear();V104Memories.clear();V105Memories.clear();this.setCounter();}
  onEnterRoom(game){
    if(!game)return;
    this.lastRoom=game.roomId;
    LivingMemories.onRoom(game.roomId);
    V103Memories.onRoom(game.roomId);
    V104Memories.onRoom(game.roomId);
    V105Memories.onRoom(game.roomId);
    this.items=festivalPlacements(game.roomId,game.platforms).filter(it=>!this.runCollected.has(it.id));
    this.setCounter();
  }
  take(item,game){
    if(this.runCollected.has(item.id))return false;
    this.runCollected.add(item.id);
    const fresh=!this.claimed.has(item.id);
    const oldRoomCount=festivalProgress([...this.claimed]).byRoom[item.room];
    const milestone=worldMilestone(item.room,oldRoomCount,fresh);
    if(fresh){this.claimed.add(item.id);storeAlbum(this.claimed);}
    game.festivalSfx?.(item.slot===9?"objective":"pickup");
    if(milestone)game.festivalVibrate?.(45);
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
    const memoryScene=LivingMemories.collect(item,this.tickN)||V103Memories.collect(item,this.tickN)||V104Memories.collect(item,this.tickN)||V105Memories.collect(item,this.tickN);
    this.setCounter();
    if(milestone){
      healPlayer(p,V101_COMPLETION_REWARD.heal);
      addScore(game,V101_COMPLETION_REWARD.score);
      addPlayerXp(p,V101_COMPLETION_REWARD.xp);
      p.invuln=Math.max(Number(p.invuln)||0,180);
      game.festivalSfx?.("objective");
      game.fx?.emit?.(p.x+p.w/2,p.y,{color:item.color,count:game.reduceMotion?4:30,size:5,up:2.2,life:32,star:true});
      FestivalMoment.show(milestone.id,{all:this.claimed.size===100});
      // Online mode keeps collectibles local: no global boss pause or forged server reward.
    }
    if(typeof document!=="undefined"){
      const toast=document.getElementById("festival-toast");
      if(toast){
        const icon=toast.querySelector(".festival-toast-icon"),title=toast.querySelector("strong"),desc=toast.querySelector("span:last-child");
        if(icon)icon.textContent=["✦","♥","♧","◆","♫","◌","◇","➶","✶","♛"][i];
        if(title)title.textContent=fresh&&this.claimed.size===1?"¡TU PRIMER RECUERDO!":item.title;
        if(desc)desc.textContent=fresh&&this.claimed.size===1?item.title+" · Abre el álbum con B":(memoryScene?.story||item.description)+" · "+this.claimed.size+"/100";
        toast.style.setProperty("--festival-accent",item.color);
        toast.classList.toggle("show",!milestone);
      }
    }
    return true;
  }
  update(game,t){
    if(!game?.player||game.player.dead||game.finale||game.won)return;
    this.tickN=t;
    if(this.lastRoom!==game.roomId)this.onEnterRoom(game);
    if(this.toastT>0&&--this.toastT===0){
      if(typeof document!=="undefined")document.getElementById("festival-toast")?.classList.remove("show");
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
  draw(ctx,cam,t,game,view={}){
    if(!ctx||game?.finale||game?.won)return;
    const W=view.w||1280,H=view.h||720;
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
    LivingMemories.draw(ctx,cam,t,{room:game?.roomId||this.lastRoom,reduceMotion:!!game?.reduceMotion,w:W,h:H});
    V103Memories.draw(ctx,cam,t,{room:game?.roomId||this.lastRoom,reduceMotion:!!game?.reduceMotion,w:W,h:H});
    V104Memories.draw(ctx,cam,t,{room:game?.roomId||this.lastRoom,reduceMotion:!!game?.reduceMotion,w:W,h:H});
    V105Memories.draw(ctx,cam,t,{room:game?.roomId||this.lastRoom,reduceMotion:!!game?.reduceMotion,w:W,h:H});
  }
  snapshot(){
    const p=festivalProgress([...this.claimed]);
    return {...p,room:this.lastRoom,remaining:this.items.length,items:this.items.map(i=>({id:i.id,x:i.x,y:i.y}))};
  }
}
export const Festival=new FestivalDirector();
