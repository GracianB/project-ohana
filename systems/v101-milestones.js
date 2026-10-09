// OHANA V101 · Los sellos de cada mundo. Presentation and pure rewards metadata.
// No extra collectibles: completing an existing 10/10 chapter unlocks its unique ceremony.
export const WORLD_MILESTONES = Object.freeze([
  { id:"hub", name:"Claro Ohana", seal:"✿", title:"EL CLARO FLORECE", verse:"Diez recuerdos. Diez maneras de comenzar juntos.", epilogue:"La primera luz de la familia ya no se apagará.", color:"#ffe49c" },
  { id:"beach", name:"Costa Hoku", seal:"❋", title:"EL MAR TE RECUERDA", verse:"Las olas han aprendido los nombres de la familia.", epilogue:"Una marea de estrellas celebra tu aventura.", color:"#82e4ec" },
  { id:"jungle", name:"Jungla Alta", seal:"❦", title:"LA JUNGLA DESPIERTA", verse:"Hasta las hojas se han puesto a bailar.", epilogue:"Las raíces guardan tu huella para siempre.", color:"#a7e884" },
  { id:"cave", name:"Cueva Azul", seal:"◇", title:"EL ECO RESPONDE", verse:"Has llenado de historias el silencio.", epilogue:"Diez destellos encienden la oscuridad.", color:"#adceff" },
  { id:"lab", name:"Alien Lab", seal:"✧", title:"¡EXPERIMENTO LOGRADO!", verse:"Resultado: amistad imposible de medir.", epilogue:"El universo acaba de descubrir una nueva fórmula.", color:"#7beaff" },
  { id:"ridge", name:"Cumbre", seal:"✵", title:"LA CUMBRE CANTA", verse:"Tu valentía resuena entre todas las montañas.", epilogue:"Hasta el viento lleva ahora tu canción.", color:"#e6d3ff" },
  { id:"space", name:"Órbita", seal:"✶", title:"UNA GALAXIA DESPIERTA", verse:"Diez estrellas, un mismo cielo.", epilogue:"En algún lugar del cosmos han pedido un deseo.", color:"#b7b3ff" },
  { id:"reef", name:"Arrecife Abismo", seal:"❈", title:"FIESTA BAJO EL MAR", verse:"El arrecife entero celebra contigo.", epilogue:"Ningún tesoro brillaba tanto como este momento.", color:"#65ebdf" },
  { id:"volcano", name:"Caldera", seal:"♨", title:"EL FUEGO ABRAZA", verse:"Has encontrado un corazón cálido entre las brasas.", epilogue:"La montaña enciende diez pequeñas luces por ti.", color:"#ffc083" },
  { id:"boss", name:"Nido Final", seal:"♥", title:"EL NIDO TIENE CORAZÓN", verse:"Ni siquiera la Reina puede borrar estos recuerdos.", epilogue:"La familia es más fuerte que el miedo.", color:"#ff91b5" },
].map(entry=>Object.freeze(entry)));

export const V101_COMPLETION_REWARD = Object.freeze({ score:250, heal:25, xp:8 });
const ENDINGS = new Map(WORLD_MILESTONES.map(entry=>[entry.id,entry]));
export function worldMilestone(roomId, previousCount, isNew=true) {
  if(!ENDINGS.has(roomId) || !isNew || previousCount !== 9) return null;
  return ENDINGS.get(roomId);
}
export function chapterSeal(roomId, count) {
  const end = ENDINGS.get(roomId);
  return end && count === 10 ? end.seal : null;
}
export function worldEnding(roomId) { return ENDINGS.get(roomId) || null; }

class WorldCelebration {
  constructor(){ this.active=null; this.timer=null; this.element=null; this.replays=0; }
  mount(){
    if(typeof document==="undefined")return;
    this.element=document.getElementById("festival-milestone");
    this.element?.querySelector(".festival-milestone-close")?.addEventListener("click",()=>this.close());
    this.element?.querySelector(".festival-milestone-album")?.addEventListener("click",()=>{
      const roomId=this.active?.id;
      this.close();
      if(roomId) document.dispatchEvent(new CustomEvent("ohana-open-album", {detail:{roomId}}));
    });
  }
  show(roomId,opts={}){
    const ending=worldEnding(roomId);
    if(!ending)return false;
    if(typeof document!=="undefined" && !this.element)this.mount();
    this.active=ending;
    const replay=opts.replay===true, all=opts.all===true;
    if(replay)this.replays++;
    const el=this.element;
    if(!el)return true; // Node test / headless no DOM.
    clearTimeout(this.timer);
    el.style.setProperty("--festival-milestone-color",ending.color);
    const text=(selector,value)=>{const node=el.querySelector(selector);if(node)node.textContent=value;};
    text(".festival-milestone-kicker",all?"CIEN RECUERDOS · UNA FAMILIA":replay?"UN RECUERDO PARA REVIVIR":"MUNDO COMPLETADO · 10 DE 10");
    text(".festival-milestone-seal",all?"✺":ending.seal);
    text(".festival-milestone-name",all?"OHANA, PARA SIEMPRE":ending.title);
    text(".festival-milestone-verse",all?"Has reunido los cien recuerdos. Diez mundos te recuerdan.":ending.verse);
    text(".festival-milestone-world",ending.name+" · Sello "+ending.seal);
    text(".festival-milestone-epilogue",all?"Nadie se queda atrás. Nunca.":ending.epilogue);
    text(".festival-milestone-reward",all?"La colección completa ya es tuya.":replay?"Este sello ya es tuyo.":"BONUS · +250 PUNTOS · +25 VIDA · +8 XP");
    const stars=el.querySelector(".festival-milestone-stars");
    if(stars)stars.textContent="✦  ✧  ✦  ✧  ✦  ✧  ✦  ✧  ✦  ✧";
    el.classList.add("show");
    el.setAttribute("aria-hidden","false");
    el.dataset.roomId=roomId;
    this.timer=setTimeout(()=>this.close(),all?10500:replay?7800:8800);
    return true;
  }
  close(){
    clearTimeout(this.timer);this.timer=null;
    if(this.element){this.element.classList.remove("show");this.element.setAttribute("aria-hidden","true");}
    this.active=null;
  }
  snapshot(){return {active:this.active?.id || null,replays:this.replays,shown:!!this.element?.classList.contains("show")};}
}
export const FestivalMoment=new WorldCelebration();
