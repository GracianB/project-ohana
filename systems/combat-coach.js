// Presentation of the actual combat state. This never executes an attack,
// spends charge or grants combo progress.
import {powerStatus} from './power-status.js';
import {kiloComboStatus} from './kilo-combo.js';
import {extraAbility} from './evolution-attacks.js';

export function combatRules(hero){
  const special=extraAbility(hero,4),finale=extraAbility(hero,5);
  if(!special||!finale)return [];
  return [
    {title:'Enlaces · variedad en tres segundos',text:'Alterna ataques distintos: por ejemplo J y después K, cuando estén disponibles. La franja muestra tus últimas acciones y el tiempo del enlace. La variedad puede aumentar el daño hasta un 18 %; repetir una sola tecla no añade variedad.'},
    {title:'I · '+special.name+' · forma 4',text:special.desc},
    {title:'P · '+finale.name+' · forma 5',text:'Necesitas 100 de carga, ganada causando daño. '+finale.desc},
    {title:'U · compañero sorpresa',text:'Invoca una ayuda del juego que presta su poder. Tiene su propia recuperación y está disponible desde bebé. U no conecta con otro jugador.'}
  ];
}

function slotCopy(key,status){
  if(!status)return '';
  if(status.kind==='locked')return key+' · '+status.short.toLowerCase();
  if(status.kind==='combo')return key+' · '+status.short;
  if(status.kind==='cooldown')return key+' · '+status.short;
  if(status.kind==='charge')return key+' · '+status.short;
  if(status.kind==='rhythm')return key+' · a compás';
  return key+' · listo';
}
export function combatCoach(g){
  const p=g?.player;if(!p||p.dead)return null;
  const now=Number(g.t)||0;
  const chain=(Array.isArray(p._combatChain)?p._combatChain:[])
    .filter(v=>Number.isFinite(v.t)&&now>=v.t&&now-v.t<=180&&['H','J','K','L','U','I','P'].includes(v.key)).slice(-5);
  const keys=chain.map(v=>v.key),distinct=new Set(keys).size;
  const remaining=chain.length?Math.max(0,180-(now-chain[0].t)):0;
  const finisher=powerStatus(g,4),ultimate=powerStatus(g,5);
  // The U slot supplies the chosen companion's exact cooldown.
  const footer=[slotCopy('I',finisher),slotCopy('P',ultimate),'U · compañero'].filter(Boolean).join('   ·   ');
  const kilo=p.id==='kilo'&&(Number(p.evo)||0)>=3?kiloComboStatus(g):null;
  if(kilo){
    const cooling=kilo.ready&&finisher?.kind==='cooldown';
    return {mode:'kilo',title:cooling?'I CARGADO · ESPERA '+finisher.short:kilo.ready?'REMATE LISTO · PULSA I':`ACIERTA H O J · ${'●'.repeat(kilo.step)}${'○'.repeat(3-kilo.step)}`,footer,progress:kilo.step/3,
      accessible:cooling?'La carga de I está preparada. Espera '+finisher.short+' de recuperación.':kilo.ready?'I preparado. Pulsa I para rematar.':'Para preparar I, acierta tres ataques H o J. Cada lanzamiento cuenta una vez y la carga se conserva.'};
  }
  const next=powerStatus(g,1),third=powerStatus(g,2),last=keys.at(-1);
  const nextKey=next?.kind==='ready'?'K':third?.kind==='ready'?'L':null;
  const title=distinct>=2?`ENLACE · ${keys.join(' → ')}`
    :last==='J'&&nextKey?'AHORA '+nextKey+' · COMPLETA EL ENLACE'
    :nextKey?'ENLAZA J → '+nextKey+' EN 3 SEGUNDOS':'H CERCA · J A DISTANCIA';
  const active=(Number(p._flowPowerT)||0)>0&&(Number(p._flowPower)||1)>1;
  const bonus=active?Math.round((Math.min(1.18,p._flowPower)-1)*100):0;
  const accessible=distinct>=2?`${distinct} ataques distintos: ${keys.join(', ')}.${bonus?' Daño extra activo: '+bonus+' por ciento.':''} Alterna ataques en tres segundos para enlazar.`
    :'Alterna ataques distintos en tres segundos para enlazar. H golpea de cerca y J ataca a distancia. Usa K desde la segunda forma.';
  return {mode:distinct>=2?'link':'learn',title,footer,progress:remaining/180,accessible};
}
