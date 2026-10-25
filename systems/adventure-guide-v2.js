import {WORLD1_ROOMS,WORLD1_ORDER,WORLD1_THEMES} from './world1-rooms.js';
import {world1NextObjective} from './world1-play.js';
import {kiloComboStatus} from './kilo-combo.js';
import {finisherCharge} from './finisher.js';
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
 const platforms=r.plats.map(p=>`<rect x="${p[0]/r.width*1000}" y="${p[1]/1260*210}" width="${Math.max(1,p[2]/r.width*1000)}" height="${p[3]>40?8:3}" fill="${p[3]>40?'#8cbfa9':'#d4e8c9'}"/>`).join('');
 const stations=(r.seal?.stations||[]).map(s=>`<circle cx="${s.x/r.width*1000}" cy="${(s.y-35)/1260*210}" r="5" fill="#ffd598"/>`).join('');
 const trials=(r.expedition?.nodes||[]).map(s=>`<circle cx="${s.x/r.width*1000}" cy="${s.y/1260*210}" r="6" fill="#c5a6ee"/>`).join('');
 const you=current?`<circle cx="${(g.player.x+g.player.w/2)/r.width*1000}" cy="${(g.player.y+g.player.h/2)/1260*210}" r="6" fill="white" stroke="#143543" stroke-width="2"/>`:'';
 return `<h3>${r.name}</h3><p>${sealed?'Sello recuperado · exploración libre':current?'Tu capítulo actual · '+progress+'% del recorrido':'Cada historia tiene su héroe y sus herramientas'}</p>
 <svg style="width:100%;height:auto" viewBox="0 0 1000 220" role="img" aria-label="Terreno, objetivos dorados, descubrimientos violetas y tu posición blanca"><rect width="1000" height="220" fill="#102b40"/>${platforms}${stations}${trials}${you}</svg>
 <p>● Dorado: objetivo de crecimiento · ● Violeta: descubrimiento del acto II · ● Blanco: tú</p>
 ${goal?`<h4>Ahora: ${goal.label}</h4><p>${goal.action}</p>`:''}
 ${r.expedition?`<h4>Acto I · Despertar y guardián</h4><p>${r.hint}</p><h4>Acto II · ${r.expedition.name}</h4><p>${r.expedition.verb}. Tres descubrimientos para llevar la canción hasta el santuario final.</p>`:''}
 ${r.hero?`<h4>Recuerdos: ${n}/100</h4><p>${rewardCopy(n)}</p><h4>Combinación de ${WORLD1_THEMES[r.hero].short}</h4><p><strong>${COMBO_GUIDES[r.hero][0]}</strong><br>${COMBO_GUIDES[r.hero][1]}</p><p>I: movimiento especial desde la cuarta forma. P: requiere quinta forma y 100 de carga ganada causando daño. U: compañero con recuperación propia.</p>`:''}`;
}
export function chapterAtlasHTML(g){
 const cards=[...WORLD1_ORDER.map(h=>'w1-'+h),'w1-final'].map(id=>{const r=WORLD1_ROOMS[id],i=WORLD1_ORDER.indexOf(r.hero),done=g.world1Seals?.includes(r.hero),open=i===0||done||g.world1Seals?.includes(WORLD1_ORDER[i-1])||id==='w1-final'&&g.world1Seals?.length===10;
  return `<button type="button" class="wm-node ${id===g.roomId?'here selected':''}" data-room="${id}" aria-pressed="${id===g.roomId}" style="position:static;transform:none;width:auto;min-height:75px;border:1px solid;border-color:${r.color};padding:12px;border-radius:12px;background:#183347;color:#f6e7ca;text-align:left"><strong>${r.short}</strong><br><small style="white-space:normal;background:none;color:#b7d8cc">${done?'Canción recuperada':open?'Capítulo abierto':'Aún por despertar'}${r.hero?' · '+(g.world1Collect?.rooms?.[r.hero]?.found.length||0)+'/100':''}</small></button>`;}).join('');
 return `<div class="v2-atlas"><div class="wm-scroll" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:9px">${cards}</div><section class="wm-detail" aria-live="polite" style="display:block;padding:16px;border-radius:14px;background:#183347;color:#f5e8ce">${chapterMapDetail(g.roomId,g)}</section></div>`;
}
export function drawAdventureGuide(c,g,W,H,powers=[]){
 if(!g.roomDef?.world1||!g.player||g.world1Cine||g.relicScene)return;
 const p=g.player,guide=COMBO_GUIDES[p.id],small=W<600;
 c.save();c.textAlign='center';c.textBaseline='middle';
 if(guide){
  const w=Math.min(W-28,small?330:440),x=(W-w)/2,y=H-(small?226:218),kilo=p.id==='kilo'?kiloComboStatus(g):null;
  c.fillStyle='#112c3eed';c.strokeStyle='#afcbbd77';c.lineWidth=1;c.beginPath();c.roundRect(x,y,w,51,11);c.fill();c.stroke();
  c.fillStyle='#f4e8c6';c.font=`bold ${small?10:12}px sans-serif`;
  const line=kilo&&p.evo>=3?(kilo.ready?'REMATE PREPARADO · PULSA I':`ACIERTOS PARA I: ${'●'.repeat(kilo.step)}${'○'.repeat(3-kilo.step)} · H o J`):'PLAN: '+guide[0];
  c.fillText(line,W/2,y+17,w-15);c.font=`${small?10:11}px sans-serif`;c.fillStyle='#bdddd2';
  c.fillText(`I ${p.evo<3?'en forma 4':p.id==='kilo'?'tres aciertos':'sin secuencia'} · P ${Math.floor(finisherCharge(p))}/100 carga · U compañero`,W/2,y+36,w-15);
 }
 const active=powers.find(q=>q.id==='star')||powers[0];
 if(active){
  const x=W/2,w=Math.min(480,W-28),y=H*.15;c.fillStyle='#122b43ed';c.strokeStyle=active.id==='star'?'#ffe8a2':'#a7d6cf';c.lineWidth=2;c.beginPath();c.roundRect(x-w/2,y,w,68,14);c.fill();c.stroke();
  c.fillStyle='#fff1bd';c.font='bold 15px sans-serif';c.fillText(active.name+' · '+(active.duration?active.seconds+' s':active.left+' golpes'),x,y+20,w-20);
  c.font='12px sans-serif';c.fillText(active.desc,x,y+42,w-20);
  if(active.duration){c.fillStyle='#ffe7a0';c.fillRect(x-w/2+12,y+58,(w-24)*Math.min(1,active.left/active.duration),3);}
 }
 c.restore();
}
