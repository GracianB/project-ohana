// Four real traversable Stitcho districts, not an invented ten-island network.
import {STITCHO_ACTS} from './stitcho-trail.js';
const DISTRICTS=Object.freeze([
 {id:'stitcho-0',name:'Playa de chatarra',short:'PLAYA',x:14,y:55,
 note:'Rescata el motor de la nave y activa la baliza Chispa. La primera grieta se cruza sobre las plataformas.'},
 {id:'stitcho-1',name:'Puentes de resonancia',short:'PUENTES',x:38,y:34,
 note:'Recoge dos fragmentos y activa ECO. Tras la señal aparece Kirin, guardián opcional blanco y dorado; no es Chispín. Los raíles y el trampolín permiten esquivarlo.'},
 {id:'stitcho-2',name:'Circuitos cruzados',short:'CIRCUITOS',x:62,y:55,
 note:'Busca cuatro fragmentos y utiliza J cerca de los arcos para cortar la electricidad. Atento al ciclo de aviso.'},
 {id:'stitcho-3',name:'Templo del Núcleo',short:'NÚCLEO',x:85,y:34,
 note:'Al activar las tres balizas aparece el Núcleo Glitch: 480 HP, tres fases, cuatro patrones, pausas para contraatacar.'}
]);
export const STITCHO_DISTRICTS=DISTRICTS;
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function stitchoAtlasDetail(id,g){
 const d=DISTRICTS.find(x=>x.id===id)||DISTRICTS[0];
 const s=g.stitchoTrail||{},completed=s.cleared;
 const phase=DISTRICTS.indexOf(d),visited=!!g.explored?.hub?.includes('hub-stitcho-'+phase);
 const status=completed?'CAPÍTULO COMPLETADO':visited?'SECTOR EXPLORADO':'POR DESCUBRIR';
 const activities=[
  'Baliza Chispa · primer fragmento','Baliza Eco · ascensores móviles',
  'Baliza Estrella · barreras eléctricas','Núcleo Glitch · combate final'
 ];
 return '<div><span class="wm-detail-kicker">'+status+'</span><h3>'+esc(d.name)+'</h3><p>'+esc(d.note)+'</p></div>'+
 '<ul aria-label="Objetivos del sector"><li><span>'+esc(activities[phase])+'</span></li><li><span>Recuerdos individuales</span><small>'+Number(g.heroCollection?.collected?.size||0)+'/100</small></li>'+
 '<li><span>Fragmentos energéticos</span><small>'+Number(s.shards||0)+'/8</small></li></ul>';
}
export function renderStitchoAtlasHTML(g){
 const s=g.stitchoTrail||{},current=Math.min(3,Math.max(0,Math.floor((g.player?.x||0)/1050))),scene=s.cleared?4:s.complete?3:Math.min(s.index||0,2);
 const paths=DISTRICTS.map((d,i)=>{
  const x=d.x*10,y=d.y*5.6;
  const colors=['#81e6ec','#9cc5ff','#bf9be0','#f2aadd'];
  return '<g transform="translate('+x+' '+y+')"><path d="M-100 21Q-75-42-26-32Q0-80 58-35Q106-45 120 21Q82 70 10 49Q-67 70-100 21Z" fill="'+colors[i]+'" stroke="#f4efff" stroke-width="4"/>'+
  '<path d="M-75 28q30-18 60-4t66-5" fill="none" stroke="#20617b" stroke-width="7"/>'+
  (i===3?'<path d="M-34 18v-84h68v84m-60-61h52M0-83v-18" fill="none" stroke="#15374b" stroke-width="10"/>':
  '<path d="M-18 18v-41m-38 48h78m-51-50q26-46 54 0" fill="none" stroke="#31577f" stroke-width="6"/>')+'</g>';
 }).join('');
 const nodes=DISTRICTS.map((d,i)=>{
  const here=current===i,visited=!!g.explored?.hub?.includes('hub-stitcho-'+i);
  const status=here?'ESTÁS AQUÍ':visited?'EXPLORADO':i<=scene?'ACCESIBLE':'POR DESCUBRIR';
  return '<button type="button" class="wm-node '+(here?'here selected ':'')+(visited?'seen':'')+
    '" data-room="'+d.id+'" style="--x:'+d.x+'%;--y:'+d.y+'%" aria-pressed="'+here+'"'+(here?' aria-current="location"':'')+
    ' aria-label="'+esc(d.name)+', '+status.toLowerCase()+'"><span class="wm-marker"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l9 15-9 21-9-21Z" stroke="currentColor" stroke-width="3" fill="none"/>'+
    '<path d="M6 26l14 12 14-12" stroke="currentColor" fill="none"/></svg></span><b>'+esc(d.short)+'</b><small>'+status+'</small></button>';
 }).join('');
 return '<div class="world-map-v40 stitcho-atlas"><div class="wm-summary"><span>ARCHIPIÉLAGO DEL CAOS · '+esc(STITCHO_ACTS[scene])+'</span><strong>'+
 (g.heroCollection?.collected?.size||0)+' <small>/ 100 recuerdos</small></strong></div>'+
 '<div class="wm-scroll" tabindex="0" aria-label="Mapa interactivo de los cuatro sectores de Stitcho"><div class="wm-board">'+
 '<svg class="wm-chart" viewBox="0 0 1000 560" aria-hidden="true"><defs><linearGradient id="stitchoSea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#13345a"/><stop offset="1" stop-color="#22618a"/></linearGradient></defs><rect width="1000" height="560" fill="url(#stitchoSea)"/>'+
 '<path d="M140 308L380 190 620 308 850 190" fill="none" stroke="#9decff" stroke-width="5" stroke-dasharray="12 10"/>'+
 paths+'<text x="500" y="490" text-anchor="middle" fill="#c3ebff" font-size="18" letter-spacing="7">MAR DEL CAOS</text></svg>'+
 nodes+'<span class="wm-north" aria-hidden="true">N\n↑</span></div></div>'+
 '<div class="wm-legend"><span><i class="door"></i>Ruta</span><span><i class="vortex"></i>Plataformas móviles</span><span><i class="drop"></i>Electricidad</span></div>'+
 '<section class="wm-detail" aria-live="polite">'+stitchoAtlasDetail(DISTRICTS[current].id,g)+'</section></div>';
}
