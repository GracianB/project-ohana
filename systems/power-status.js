// Presentation only: useAbility remains the authority that spends resources.
import {ABILITY_DEFS} from './ability-catalog.js';
import {POWER_LEVELS,powerAbility} from './evolution-attacks.js';
import {finisherCharge} from './finisher.js';
import {kiloComboStatus} from './kilo-combo.js';
export function powerStatus(g,index,supreme=null){
 const p=g?.player;
 if(!p||p.dead||!Number.isInteger(index)||index<0||index>5)return null;
 const def=powerAbility(p,index,ABILITY_DEFS,supreme);if(!def)return null;
 const now=(Number(g.t)||0)*1000/60,left=Math.max(0,(Number(p.cds?.[def.id||p.abilities?.[index]])||0)-now);
 const need=POWER_LEVELS[index],base={def,left};
 const state=(kind,short,label,pct=0)=>({...base,kind,short,label,pct,available:kind==='ready'||kind==='rhythm'||kind==='flight'});
 if((Number(p.evo)||0)<need)return state('locked','Forma '+(need+1),'Se desbloquea en la forma '+(need+1)+'. '+(g.roomId==='w1-kilo'?'Completa las notas de los hibiscos para evolucionar; los cromos no dan XP.':'Recoge cristales de XP.'));
 if(index===1&&p.id==='kilo'&&p.evo>=4&&p._kiloFlightMode==='solar'&&p._kiloFlightT>0)return state('flight','Vuelo · K bajar','Vuelo solar activo. Mover/saltar/bajar dirige; J dispara en esa dirección. K desciende y recibir daño corta el vuelo.',100);
 const rhythm=index===5&&p.id==='kilo'&&g._evolutionAttacks?.moves?.some(m=>m.id==='kilo'&&m.index===5);
 if(rhythm)return state('rhythm','A compás','Pulsa P siguiendo las tres señales de ritmo.',100);
 if(index===5&&finisherCharge(p)<100)return state('charge',Math.floor(finisherCharge(p))+'/100','Carga P haciendo daño: '+Math.floor(finisherCharge(p))+'/100.',finisherCharge(p));
 const combo=p.id==='kilo'&&index===4?kiloComboStatus(g):null;
 if(combo&&!combo.ready){
  const next=['H','J','H'][combo.step],steps=[
   'Empieza acertando H a un enemigo. Después acierta J y H, en ese orden, en cuatro segundos.',
   'H acertado. Ahora acierta J a un enemigo y termina con H. Pulsar al aire no cuenta.',
   'H y J acertados. Termina con otro golpe H a un enemigo para preparar I.'
  ];
  return state('combo',combo.step+'/3 · ahora '+next,steps[combo.step],combo.step/3*100);
 }
 if(left>0){
  const seconds=Math.max(.1,Math.ceil(left/100)/10).toFixed(1),dur=Number(p.cdDur?.[def.id||p.abilities?.[index]])||def.cd;
  return state('cooldown',seconds+' s','Recargando · quedan '+seconds+' s.',Math.max(0,Math.min(100,100-left/dur*100)));
 }
 return state('ready',combo?'Listo · '+Math.ceil(combo.remaining/60)+' s':'Listo',combo?'I preparado durante '+Math.ceil(combo.remaining/60)+' s.':'Poder listo.',100);
}
