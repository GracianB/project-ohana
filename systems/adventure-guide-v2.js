import {WORLD1_ROOMS,WORLD1_ORDER,WORLD1_THEMES} from './world1-rooms.js';
import {world1NextObjective} from './world1-play.js';
import {combatCoach} from './combat-coach.js';
export const COMBO_GUIDES=Object.freeze({
 kilo:['H o J → H o J → H o J → I','Acierta tres lanzamientos H o J; los rebotes de una misma nota cuentan una vez. I conserva su carga.'],
 stitcho:['J plasma → K bola → H zarpa','Abre a distancia, cruza por otro ángulo y golpea de cerca. I da un rebote acrobático.'],
 chispin:['J cadena → L tormenta → I carrera','J enlaza blancos. Coloca la tormenta y sal del grupo antes de su respuesta.'],
 cat:['K ronroneo → J zarpa → I ascenso','Controla al grupo, alcanza al vigía y aprovecha el salto ofensivo de I.'],
 cuerno:['J arcoíris → K galope → H flanco','Tu velocidad es la ventaja. Evita el escudo frontal y golpea por detrás.'],
 dragon:['J fuego → ganar altura → I picado','Prepara la zona con fuego. El picado es para entrar desde arriba, no para quedarte quieto.'],
 dino:['Salto → K caída → H mordisco','Gana altura, rompe la formación al caer y remata durante su aturdimiento.'],
 frita:['I derrape → cambiar altura → J','Deja aceite, usa el impulso para recolocarte y dispara desde un ángulo seguro.'],
 pizza:['J distancia → K queso → H cerca','Despeja el reparto desde lejos, controla la calle y usa tus rebotes para salir.'],
 yomi:['J analizar → K contener → L síntesis','J marca enemigos. K permite leer la respuesta. L aprovecha tus blancos analizados.']
});
function rewardCopy(n){return n>=100?'Celebración y firma permanente conseguidas':n>=50?'Imán activo · alcanza recuerdos cercanos':n>=25?'Brújula activa · recuerdos en el mapa':'25 recuerdos: brújula · 50: imán · 100: celebración y firma';}
export function chapterMapDetail(id,g){
 const r=WORLD1_ROOMS[id];if(!r)return '';
 const current=id===g.roomId,album=g.world1Collect?.rooms?.[r.hero],n=album?.found.length||0,sealed=g.world1Seals?.includes(r.hero),goal=current?world1NextObjective(g):null;
 const progress=current?Math.round((g.player.x+g.player.w/2)/r.width*100):0;
 const currentProgress=r.fusionBoss?(g.world1Won?'Campaña completada · la familia ha vuelto a casa':`Recuerdos personales a salvo: ${g.finalGauntlet?.found?.length||0}/10`):'Tu capítulo actual · '+progress+'% del recorrido';
 const platforms=r.plats.map(p=>`<rect x="${p[0]/r.width*1000}" y="${p[1]/1260*210}" width="${Math.max(1,p[2]/r.width*1000)}" height="${p[3]>40?8:3}" fill="${p[3]>40?'#8cbfa9':'#d4e8c9'}"/>`).join('');
 const stations=(r.seal?.stations||[]).map(s=>`<circle cx="${s.x/r.width*1000}" cy="${(s.y-35)/1260*210}" r="5" fill="#ffd598"/>`).join('');
 const trials=(r.expedition?.nodes||[]).map(s=>`<circle cx="${s.x/r.width*1000}" cy="${s.y/1260*210}" r="6" fill="#c5a6ee"/>`).join('');
 const destination=goal?`<circle class="wm-current-objective" cx="${goal.x/r.width*1000}" cy="${goal.y/1260*210}" r="8" fill="#ffb479" stroke="#fff1ce" stroke-width="2"><title>${goal.label}</title></circle>`:'';
 const you=current?`<circle cx="${(g.player.x+g.player.w/2)/r.width*1000}" cy="${(g.player.y+g.player.h/2)/1260*210}" r="6" fill="white" stroke="#143543" stroke-width="2"/>`:'';
 return `<h3>${r.name}</h3><p>${sealed?'Sello recuperado · exploración libre':current?currentProgress:'Cada historia tiene su héroe y sus herramientas'}</p>
 <svg style="width:100%;height:auto" viewBox="0 0 1000 220" role="img" aria-label="Terreno, destino actual ámbar, objetivos dorados${r.expedition?', descubrimientos violetas':''} y tu posición blanca"><rect width="1000" height="220" fill="#102b40"/>${platforms}${stations}${trials}${destination}${you}</svg>
 <p>${r.fusionBoss?'● Ámbar: destino actual · ● Blanco: tú':`● Dorado: ${r.kiloEncounterVersion?'instrumento':'crecimiento'}${r.expedition?' · ● Violeta: descubrimiento':''} · ● Ámbar: destino actual · ● Blanco: tú`}</p>
 ${goal?`<h4>Ahora: ${goal.label}</h4><p>${goal.action}</p>`:''}
 ${r.expedition?`<h4>Acto I · Despertar y guardián</h4><p>${r.hint}</p><h4>Acto II · ${r.expedition.name}</h4><p>${r.expedition.verb}. Tres descubrimientos para llevar la canción hasta el santuario final.</p>`:''}
 ${r.kiloEncounterVersion?`<h4>Cuatro instrumentos · un guardián</h4><p>Cada voz recuperada despierta una forma. La XP se conserva mientras completas su aprendizaje.</p><ol>${r.seal.stations.map(s=>`<li><strong>${s.name}</strong> · ${s.action}. ${s.lesson}</li>`).join('')}</ol><p>El gran Tambor protege el final del Claro. Salta sus ondas, sal del destino de su carga y busca los huecos entre semillas. Ataca cuando recupera el compás. Los carillones del cielo y los recuerdos son opcionales.</p>`:''}
 ${r.hero?`<h4>Recuerdos: ${n}/100</h4><p>${rewardCopy(n)}</p><h4>Combinación de ${WORLD1_THEMES[r.hero].short}</h4><p><strong>${COMBO_GUIDES[r.hero][0]}</strong><br>${COMBO_GUIDES[r.hero][1]}</p><p>I: movimiento especial desde la cuarta forma. P: requiere quinta forma y 100 de carga ganada causando daño. U: compañero con recuperación propia.</p>`:''}`;
}
export function chapterAtlasHTML(g){
 const cards=[...WORLD1_ORDER.map(h=>'w1-'+h),'w1-final'].map(id=>{
  const r=WORLD1_ROOMS[id],i=WORLD1_ORDER.indexOf(r.hero),done=g.world1Seals?.includes(r.hero),open=i===0||done||g.world1Seals?.includes(WORLD1_ORDER[i-1])||id==='w1-final'&&g.world1Seals?.length===10;
  const isHere=id===g.roomId;
  const col=r.color||'#ffd36a';
  const bg=isHere?`linear-gradient(135deg, ${col}38, rgba(20,38,58,.94))`:`linear-gradient(135deg, ${col}18, rgba(14,26,40,.88))`;
  const shadow=isHere?`0 0 16px ${col}88, inset 0 0 10px ${col}44`:`0 3px 10px rgba(0,0,0,.35)`;
  return `<button type="button" class="wm-node ${isHere?'here selected':''}" data-room="${id}" aria-pressed="${isHere}" style="position:static;transform:none;width:auto;min-height:72px;border:2px solid ${col};box-shadow:${shadow};padding:10px 12px;border-radius:12px;background:${bg};color:#f6e7ca;text-align:left;cursor:pointer"><strong style="color:${col};font-size:13px;text-shadow:0 0 8px ${col}55">${r.short}</strong><br><small style="white-space:normal;background:none;color:#d5e5e0;font-size:11px">${done?'✦ Canción recuperada':open?'Capítulo abierto':'Aún por despertar'}${r.hero?' · '+(g.world1Collect?.rooms?.[r.hero]?.found.length||0)+'/100':''}</small></button>`;
 }).join('');
 return `<div class="v2-atlas"><div class="wm-scroll" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">${cards}</div><section class="wm-detail" aria-live="polite" style="display:block;padding:16px;border-radius:14px;background:#142738;border:1px solid rgba(255,255,255,.12);color:#f5e8ce">${chapterMapDetail(g.roomId,g)}</section></div>`;
}
export function drawAdventureGuide(c,g,W,H,powers=[]){
 // Clean, unobstructed playfield: in-game HUD already displays active powers and objectives.
 // Intrusive canvas overlay cartels that block player sightline are removed.
 return;
}
