import {WORLD1_ORDER,WORLD1_ROOMS,WORLD1_THEMES} from './world1-rooms.js';
import {drawLivingRealm} from '../worlds/living-realms.js';
import {drawOhanaGarden} from '../worlds/ohana-garden.js';
import {COMBO_GUIDES} from './adventure-guide-v2.js';
import {combatRules} from './combat-coach.js';
const TALES={
 kilo:['Donde canta el bosque','Sigue las copas, deja que el claro respire y busca altura. La música convierte la distancia en tu aliada.','Caracola: E o J. Bambú: tres J. Arpa del dosel: gana altura y toca J en el aire. Hibisco: prepara I con tres J sobre él o combatiendo, y remata con I. Cada instrumento despierta una forma.'],
 stitcho:['La noche tiene paredes','Una ciudad vertical espera a quien se atreva a abandonar el suelo. Cambia de pared antes de que te rodeen.','Abre con plasma J; usa la bola K para atravesar el grupo y la zarpa H al salir.'],
 chispin:['El cielo entre dos chispas','Las tormentas no se cruzan en línea recta. Reúne a tus rivales, descarga y cambia de altura.','J encadena blancos cercanos: posiciónate antes de disparar. No esperes dentro del grupo.'],
 cat:['Los tejados guardan secretos','Hay una ruta a plena vista y otra que sólo ve una gata. Busca el flanco y escapa antes de la respuesta.','Hada: mantén salto para ganar altura con sus alas durante 1,5 segundos; aterriza para recuperar el aleteo. Eclipse: mantén salto para volar, suelta para planear y pulsa abajo para descender. J dispara y K abre espacio. Medusa y Conejornio conservan sus saltos.'],
 cuerno:['A toda luz','El arcoíris es un camino, no un adorno. Tu velocidad permite atravesar huecos que otros defenderían de frente.','Lanza J, galopa con K y vuelve por el flanco. Aprovecha el recorrido, no te quedes intercambiando golpes.'],
 dragon:['Un horizonte de brasas','La tierra es sólo el principio. Dibuja una ruta sobre las amenazas y elige dónde volver a caer.','Fuego J para preparar el terreno; altura antes del picado I y espacio para la salida.'],
 dino:['El valle que recuerda tus pasos','Aquí el peso tiene una voz. Domina las plataformas y cae donde puedas romper la formación.','Salta, descarga K y remata con H mientras el enemigo se recupera. Tu fuerza necesita una buena entrada.'],
 frita:['La fuga más crujiente','En esta carrera el suelo también juega. Deja trampas, cambia de carril y dispara desde un ángulo nuevo.','El derrape I sirve para recolocarte. No confundas ir deprisa con correr hacia el ataque.'],
 pizza:['Una ciudad recién salida del horno','Calles, balcones y un reparto imposible. Controla los accesos y convierte cada rebote en una salida.','J abre a distancia, K controla el paso y H remata cerca. Guarda una ruta de escape.'],
 yomi:['El archivo de lo imposible','Este mundo responde a lo que observas. Lee al enemigo antes de gastar tus herramientas y construye tu respuesta.','J analiza, K contiene y L aprovecha los blancos analizados. La ventaja es preparar la secuencia.']
};
export function guideChapter(id){const r=WORLD1_ROOMS['w1-'+id],t=TALES[id];return r&&t?{id,name:r.name,hero:WORLD1_THEMES[id].short,color:r.color,title:t[0],story:t[1],tactic:t[2],combo:COMBO_GUIDES[id]}:null;}
const doc=globalThis.document;
if(doc){
 const help=doc.querySelector('#help .panel');
 if(help){
 const guide=doc.createElement('section');guide.id='field-guide';guide.setAttribute('aria-label','Libro de viaje');
 guide.innerHTML=`<header><span class="fg-eyebrow">EL LIBRO DE LAS DIEZ VOCES</span><h3>Conoce el mundo. Juega a tu manera.</h3></header><div class="fg-tabs" role="group" aria-label="Capítulos y modos">${WORLD1_ORDER.map(id=>`<button type="button" data-guide="${id}" aria-pressed="false">${WORLD1_THEMES[id].short}</button>`).join('')}<button type="button" data-guide="heart" aria-pressed="false">El Corazón</button><button type="button" data-guide="together" aria-pressed="false">Jugar juntos</button></div><article id="guide-page" aria-live="polite" aria-atomic="true"></article><details class="fg-comfort"><summary tabindex="0">A tu gusto · comodidad y lectura</summary><div>${[['readable','Texto más grande'],['contrast','Contraste reforzado'],['quiet','Avisos sin animación'],['controls','Ocultar recordatorio de teclas']].map(([key,label])=>`<label><input type="checkbox" data-comfort="${key}"> ${label}</label>`).join('')}</div><button type="button" id="comfort-reset">Restablecer preferencias</button></details>`;
 help.querySelector('#btn-close-help').before(guide);
 let sceneHero="kilo",sceneFrame=0,lastPaint=-Infinity;
 function paintScene(now=0){
  sceneFrame=0;if(sceneHero==="together"||sceneHero==="heart")return;if(!help.closest("#help").classList.contains("open")||doc.hidden)return;
  if(now-lastPaint>=80){const canvas=guide.querySelector(".fg-landscape");if(canvas){const c=canvas.getContext("2d"),reduce=matchMedia("(prefers-reduced-motion:reduce)").matches,t=reduce?0:now/1000;
   if(sceneHero==="kilo")drawOhanaGarden(c,{x:t*9,y:0},t*60,640,220);else drawLivingRealm(c,sceneHero,{x:t*9,y:0},640,220,t*60,{reduceMotion:reduce});
  }lastPaint=now;}if(!matchMedia("(prefers-reduced-motion:reduce)").matches)sceneFrame=requestAnimationFrame(paintScene);
 }
 const resume=()=>{if(!sceneFrame&&!doc.hidden&&help.closest("#help").classList.contains("open"))sceneFrame=requestAnimationFrame(paintScene);};
 new MutationObserver(()=>{if(help.closest("#help").classList.contains("open")){const camp=doc.getElementById("family-camp"),hero=doc.body.classList.contains("playing")?doc.getElementById("hud")?.dataset.hero:camp?.dataset.final==="true"?"heart":camp?.dataset.hero;if(hero&&(TALES[hero]||hero==="heart"))show(hero);}resume();}).observe(help.closest("#help"),{attributes:true,attributeFilter:["class"]});doc.addEventListener("visibilitychange",resume);
 function show(id){sceneHero=id;const page=guide.querySelector('#guide-page'),c=guideChapter(id);
 page.innerHTML=id==='heart'?`<span class="fg-eyebrow">EL RITUAL DE LAS DIEZ VOCES</span><h4>Tus objetos despiertan al guardián</h4><p>Cada capítulo entrega un único sello: completa sus pruebas principales, vence al guardián y descubre sus tres resonancias. Los cien recuerdos del álbum son opcionales.</p><ol><li>En el Corazón, reúne los tres objetos del suelo junto al núcleo iluminado. Su energía conserva el color y las formas de tu sala.</li><li>Elige qué héroe invoca al guardián evolucionado. Puedes cambiar de estrategia antes de cada duelo, conservando tu proporción de vida.</li><li>Vence al guardián y recoge el recuerdo que custodiaba. Su núcleo conserva los objetos como trofeos.</li><li>Con diez recuerdos a salvo, elige tu héroe para enfrentarte a las cuatro fases de Quimera.</li></ol><p>Puedes cancelar la elección y seguir explorando. Pulsa E junto al núcleo para volver a elegir. Durante el combate no se cambia de héroe.</p>`:c?`<span class="fg-eyebrow">${c.hero} · ${c.name}</span><h4>${c.title}</h4><canvas class="fg-landscape" width="640" height="220" role="img" aria-label="Paisaje animado de ${c.name}"></canvas><p>${c.story}</p><div class="fg-mission"><b>Tu estrategia</b><p>${c.tactic}</p></div><h5>Prueba esta combinación</h5><p class="fg-combo">${c.combo[0]}</p><p>${c.combo[1]}</p><footer>Empiezas como bebé. Combate y explora para evolucionar. Los 100 recuerdos son opcionales: 25 brújula, 50 imán, 100 celebración. ${id==='kilo'?'Después del Tambor, los tres carillones del Acto II completan su sello.':'Sus pruebas, el guardián y tres descubrimientos completan un único sello.'}</footer>`:`<span class="fg-eyebrow">DOS FORMAS DE COMPARTIR OHANA</span><h4>Compañeros… o rivales.</h4><div class="fg-mission"><b>Aventura cooperativa</b><p>Recorred la campaña en la misma sala. Un jugador propone cruzar; el otro acepta antes de viajar. Coordinad vuestros poderes y revisad los resultados del capítulo juntos.</p></div><div class="fg-mission"><b>Versus</b><p>Elegid héroe y escenario. Combatid entre vosotros; los enemigos y el guardián permiten crecer durante el duelo. El resultado muestra las estadísticas y os devuelve a la elección.</p></div><footer>El servidor público está pausado. Las partidas entre dispositivos requieren un servidor activo; el multijugador se está verificando con el servidor local. U invoca un compañero del juego: no conecta a otra persona.</footer>`;
 if(c){
  const details=doc.createElement('details');details.className='fg-combat-rules';
  const summary=doc.createElement('summary');summary.textContent='Enlaces y poderes, paso a paso';details.append(summary);
  for(const rule of combatRules(id)){const heading=doc.createElement('h5'),text=doc.createElement('p');heading.textContent=rule.title;text.textContent=rule.text;details.append(heading,text);}
  page.querySelector('footer').before(details);
 }
 guide.style.setProperty('--chapter-color',c?.color||'#a5dfd2');lastPaint=-Infinity;resume();
 for(const b of guide.querySelectorAll('[data-guide]'))b.setAttribute('aria-pressed',String(b.dataset.guide===id));
 }
 guide.addEventListener('click',e=>{const b=e.target.closest('[data-guide]');if(b)show(b.dataset.guide);});
 guide.addEventListener('keydown',e=>{const b=e.target.closest('[data-guide]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const bs=[...guide.querySelectorAll('[data-guide]')],i=bs.indexOf(b);e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?bs.length-1:(i+(e.key==='ArrowRight'?1:-1)+bs.length)%bs.length;bs[next].focus();show(bs[next].dataset.guide);});
 const inputs=[...guide.querySelectorAll('[data-comfort]')];
 function apply(){for(const i of inputs)doc.body.classList.toggle('comfort-'+i.dataset.comfort,i.checked);}
 try{const saved=JSON.parse(localStorage.getItem('ohana-comfort')||'{}');for(const i of inputs)i.checked=saved[i.dataset.comfort]===true;}catch{}
 apply();guide.addEventListener('change',()=>{apply();try{localStorage.setItem('ohana-comfort',JSON.stringify(Object.fromEntries(inputs.map(i=>[i.dataset.comfort,i.checked]))));}catch{}});
 guide.querySelector('#comfort-reset').onclick=()=>{inputs.forEach(i=>i.checked=false);apply();try{localStorage.removeItem('ohana-comfort');}catch{}};
 show('kilo');
 const menu=doc.getElementById('char-select');
 function addChapterGuide(){const dossier=doc.querySelector('.camp-dossier');if(!dossier||doc.getElementById('camp-guide'))return;
  const b=doc.createElement('button');b.id='camp-guide';b.type='button';b.textContent='Abrir su libro de viaje ↗';
  b.onclick=()=>{show(doc.getElementById('family-camp')?.dataset.final==='true'?'heart':doc.getElementById('family-camp')?.dataset.hero||'kilo');doc.getElementById('btn-help')?.click();guide.scrollIntoView({block:'start',behavior:'instant'});requestAnimationFrame(()=>{if(doc.getElementById('help')?.classList.contains('open'))guide.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});});};
  dossier.querySelector('#camp-start').before(b);
 }
 if(menu){const observer=new MutationObserver(addChapterGuide);observer.observe(menu,{childList:true,subtree:true});addChapterGuide();}
 matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',resume);
 }
 // One tooltip for every power: delegated listeners survive form changes.
 const bar=doc.getElementById('ability-bar');if(bar){const detail=doc.createElement('div');detail.id='power-inspector';detail.setAttribute('role','tooltip');detail.hidden=true;bar.before(detail);
 function inspect(e){const slot=e.target.closest('.ability-slot');if(!slot)return;detail.textContent=slot.title||slot.getAttribute('aria-label');detail.hidden=false;slot.setAttribute('aria-describedby',detail.id);}
 function clear(){detail.hidden=true;for(const b of bar.querySelectorAll('[aria-describedby="power-inspector"]'))b.removeAttribute('aria-describedby');}
 bar.addEventListener('focusin',inspect);bar.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')inspect(e);});bar.addEventListener('focusout',clear);bar.addEventListener('pointerleave',clear);doc.addEventListener('keydown',e=>{if(e.key==='Escape')clear();});
 }
}
