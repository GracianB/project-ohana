import {CHISPIN_CHAPTERS} from './chispin-storm.js';
const SECTORS=Object.freeze([
 {id:'chispin-0',short:'DÁRSENA',name:'Dársena de la chispa',x:13,y:52,desc:'Recupera la primera descarga y encuentra el camino sobre los restos flotantes.'},
 {id:'chispin-1',short:'PUENTES',name:'Puentes electrostáticos',x:36,y:32,desc:'Impúlsate en los muelles eléctricos y rescata dos fragmentos para el segundo pararrayos.'},
 {id:'chispin-2',short:'TORRE',name:'Torre de las nubes',x:62,y:52,desc:'Cinco fragmentos permiten activar la tercera señal. Pulsa J junto a las barreras para silenciarlas.'},
 {id:'chispin-3',short:'SANTUARIO',name:'Santuario de la Tormenta',x:85,y:32,desc:'Un jefe propio de 520 PV, con tres fases y cuatro ataques. Esquiva la zona marcada antes del impacto.'}
]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CHISPIN_ATLAS_SECTORS=SECTORS;
export function chispinAtlasDetail(id,g){
 const s=SECTORS.find(v=>v.id===id)||SECTORS[0],i=SECTORS.indexOf(s),done=!!g.chispinStorm?.defeated;
 return '<div><span class="wm-detail-kicker">'+(done?'CAPÍTULO COMPLETADO':i<=Math.floor((g.player?.x||0)/1050)?'ZONA ALCANZADA':'POR EXPLORAR')+
 '</span><h3>'+esc(s.name)+'</h3><p>'+esc(s.desc)+'</p></div>'+
 '<ul aria-label="Progreso de Chispín"><li><span>Recuerdos personales</span><small>'+
 (g.heroCollection?.collected?.size||0)+'/100</small></li><li><span>Fragmentos de energía</span><small>'+
 (g.chispinStorm?.shards||0)+'/8</small></li></ul>';
}
export function renderChispinAtlasHTML(g){
 const s=g.chispinStorm||{},current=Math.max(0,Math.min(3,Math.floor((g.player?.x||0)/1050))),chapter=s.defeated?4:s.complete?3:Math.min(s.index||0,2);
 const drawings=SECTORS.map((p,i)=>{
  const x=p.x*10,y=p.y*5.6,c=['#ffe59e','#a1e7fb','#b8beff','#d9b9fd'][i];
  return '<g transform="translate('+x+' '+y+')"><path d="M-112 20Q-70-55-25-39Q35-120 105-35L135 30Q35 76-112 20Z" stroke="#fff5d6" stroke-width="4" fill="'+c+'"/>'+
  '<path d="M-58 22l22-94 27 38 35-77 9 87" fill="none" stroke="#20517c" stroke-width="10"/></g>';
 }).join('');
 const nodes=SECTORS.map((p,i)=>{
  const here=current===i;
  return '<button type="button" class="wm-node '+(here?'here selected':'')+'" data-room="'+p.id+'" style="--x:'+p.x+'%;--y:'+p.y+'%" aria-pressed="'+here+'"'+(here?' aria-current="location"':'')+
  ' aria-label="'+esc(p.name)+'"><span class="wm-marker"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2L8 21h11L13 38l19-23H20Z" stroke="currentColor" stroke-width="3" fill="none"/></svg></span><b>'+esc(p.short)+'</b><small>'+ (here?'ESTÁS AQUÍ':i<current?'EXPLORADO':'POR DESCUBRIR')+'</small></button>';
 }).join('');
 return '<div class="world-map-v40 stitcho-atlas chispin-atlas"><div class="wm-summary"><span>ISLAS DEL RELÁMPAGO · '+esc(CHISPIN_CHAPTERS[chapter])+
 '</span><strong>'+(g.heroCollection?.collected?.size||0)+' <small>/ 100 recuerdos</small></strong></div>'+
 '<div class="wm-scroll" tabindex="0" aria-label="Mapa interactivo de las Islas del Relámpago"><div class="wm-board">'+
 '<svg class="wm-chart" viewBox="0 0 1000 560" aria-hidden="true"><rect width="1000" height="560" fill="#173d74"/>'+
 '<path d="M130 292L360 179 620 292 850 179" fill="none" stroke="#fff0a7" stroke-width="5" stroke-dasharray="11 10"/>'+
 drawings+'<text x="500" y="491" text-anchor="middle" fill="#e0ecfd" font-size="18" letter-spacing="6">MAR DEL TRUENO</text></svg>'+
 nodes+'<span class="wm-north" aria-hidden="true">N\n↑</span></div></div>'+
 '<div class="wm-legend"><span><i class="door"></i>Ruta</span><span><i class="vortex"></i>Raíles</span><span><i class="drop"></i>Trampas eléctricas</span></div>'+
 '<section class="wm-detail" aria-live="polite">'+chispinAtlasDetail(SECTORS[current].id,g)+'</section></div>';
}
