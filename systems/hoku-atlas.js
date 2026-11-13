import {ROSTER} from '../characters/roster.js';
import {drawFamilyActor} from './family-actor.js';
import {saveStore,canonId} from './save.js';
import {readWorld1Seals} from './world1-progress.js';
import {world1SelectCards} from './world1-select.js';
import {readKeepsakes} from './keepsakes.js';
import {masteryOf} from './hero-mastery.js';
import {atlasEarnedForm,atlasProgress,atlasSelection,atlasGamepadIntent,ATLAS_MODES} from './hoku-atlas-model.js';
import {menuPaintAllowedInDocument} from './menu-visibility.js';
const TAU=Math.PI*2;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('gentle-motion');
const online=()=>ATLAS_MODES.map(m=>`<a class="atlas-mode" href="${m.href}"><span aria-hidden="true">${m.id==='versus'?'⚔':'✦'}</span><strong>${m.name}</strong><small>${m.text}</small><b aria-hidden="true">→</b></a>`).join('');
function oval(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
export function drawAtlasSky(c,w,h,t=0,hero='kilo',form=0,welcome=false){
 const time=reduced()?0:t,col=ROSTER.find(r=>r.id===hero)?.color||'#8bd7d1';
 c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#091b2e');bg.addColorStop(.6,'#152c43');bg.addColorStop(1,'#254551');c.fillStyle=bg;c.fillRect(0,0,w,h);
 const glow=c.createRadialGradient(w*.64,h*.42,0,w*.64,h*.42,w*.55);glow.addColorStop(0,col+'30');glow.addColorStop(1,col+'00');c.fillStyle=glow;c.fillRect(0,0,w,h);
 for(let i=0;i<66;i++){const x=((i*149+31)%997)/997*w,y=((i*83+17)%593)/593*h*.77;oval(c,x,y,i%9?1:1.8,i%9?1:1.8,i%7?'#c8e3e570':'#f7dab5');}
 const small=welcome&&w<=650,cx=w*(small?.73:welcome?.63:.52),cy=small?(w<350?105:195):h*.48,r=small?Math.min(w*.3,110):Math.min(w*.39,h*.37);
 c.strokeStyle='#c4ac7742';c.lineWidth=1;
 for(let i=0;i<3;i++){c.beginPath();c.ellipse(cx,cy,r*(.7+i*.22),r*(.7+i*.22),-.22,0,TAU);c.stroke();}
 for(let i=0;i<10;i++){const a=-1.5+i*TAU/10+time*.0015;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;oval(c,x,y,3,3,i%3?'#b9dcd6':'#f7d8a8');}
 // Floating strata, not mirror frames: silhouette, turf and a hanging root.
 const ix=cx,iy=small?(w<350?145:245):h*.78,iw=Math.min(w*.31,h*.32);
 c.fillStyle='#101f32';c.beginPath();c.moveTo(ix-iw,iy);c.lineTo(ix-iw*.55,iy+42);c.lineTo(ix-iw*.18,iy+86);c.lineTo(ix+iw*.32,iy+54);c.lineTo(ix+iw,iy);c.closePath();c.fill();
 oval(c,ix,iy,iw,20,'#536d6c');oval(c,ix,iy-5,iw*.96,14,'#839b86');oval(c,ix,iy-5,iw*.68,9,'#a5b89b');
 for(const side of[-1,1]){const x=cx+side*iw*1.35,y=h*.62+side*20;oval(c,x,y,iw*.36,8,'#587975');c.fillStyle='#162b3c';c.beginPath();c.moveTo(x-iw*.35,y+2);c.lineTo(x+iw*.3,y+2);c.lineTo(x-side*iw*.08,y+28);c.closePath();c.fill();}
 const size=small?Math.min(130,w*.38):Math.min(h*.46,w*(welcome?.32:.48));
 drawFamilyActor(c,hero,cx,iy-8,size/60,time*60,{form,pose:'idle',performance:hero==='kilo'?'dance':undefined},reduced());
 if(welcome&&w>650){drawFamilyActor(c,'stitcho',cx-iw*1.4,h*.62-6,Math.min(h*.19,100)/60,time*60,{form:0},reduced());drawFamilyActor(c,'chispin',cx+iw*1.35,h*.65-8,Math.min(h*.19,100)/60,time*60,{form:0},reduced());}
}
const pads=new WeakMap();
function pollGamepad(root){
 let pad;try{pad=[...navigator.getGamepads()].find(p=>p?.connected);}catch{return;}if(!pad)return;
 if(!root)return;const intent=atlasGamepadIntent(pad,pads.get(root));pads.set(root,intent.state);
 const dialog=root.querySelector('dialog[open]'),scope=dialog||root;
 const controls=[...scope.querySelectorAll('button:not([disabled]),a[href],summary')].filter(n=>n.getClientRects().length&&!n.closest('[hidden]')&&(!n.closest('dialog')||n.closest('dialog').open));
 if(intent.move&&controls.length){const i=controls.indexOf(document.activeElement);controls[(i+intent.move+controls.length)%controls.length].focus();}
 if(intent.confirm&&controls.includes(document.activeElement))document.activeElement.click();
 if(intent.back){if(dialog)dialog.close();else root.querySelector('.atlas-back')?.click();}
}
function animate(canvas,draw,allowed){let raf=0,last=-Infinity,start=performance.now();const tick=now=>{raf=0;if(document.hidden||!allowed())return;if(now-last>48){last=now;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);if(r.width&&r.height){const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);draw(c,r.width,r.height,(now-start)/1000);pollGamepad(canvas.closest('#ohana-intro,#hoku-atlas'));}}raf=requestAnimationFrame(tick);};const wake=()=>{if(!raf&&allowed()&&!document.hidden)raf=requestAnimationFrame(tick);};const observer=new MutationObserver(wake);observer.observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',wake);wake();return()=>{observer.disconnect();document.removeEventListener('visibilitychange',wake);cancelAnimationFrame(raf);};}
function trap(dialog,event){if(event.key!=='Tab')return;const items=[...dialog.querySelectorAll('button:not([disabled]),a[href],select')].filter(n=>n.getClientRects().length&&!n.closest('[hidden]'));if(!items.length)return;const i=items.indexOf(document.activeElement);event.preventDefault();items[(i+(event.shiftKey?-1:1)+items.length)%items.length].focus();}
export function mountAtlasWelcome(el,finish){
 if(el.dataset.atlasWelcome==='true')return;el.dataset.atlasWelcome='true';
 const saved=saveStore.read(),valid=saved&&ROSTER.some(r=>r.id===canonId(saved.id));
 el.className='show ready atlas-welcome';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Ohana · Atlas de Hoku');el.setAttribute('aria-hidden','false');
 document.body.classList.remove('intro-complete');document.body.classList.add('intro-playing');
 el.innerHTML=`<canvas class="atlas-welcome-sky" aria-hidden="true"></canvas><div class="atlas-welcome-copy"><a class="atlas-signature" href="https://gracianb.github.io/GracianB/" target="_blank" rel="noopener">GB <span>PLAY / OHANA</span></a><p class="atlas-eyebrow">DIEZ VOCES. UN MUNDO POR DESCUBRIR.</p><h1>OHA<span>NA</span><i>Un lugar al que volver.</i></h1><p class="atlas-welcome-lead">Elige tu héroe. Encuentra tu camino.<br>Que nadie se quede atrás.</p><div class="atlas-welcome-actions"><button class="atlas-primary oi-enter" type="button">Preparar aventura <span>→</span></button>${valid?'<button class="atlas-resume" type="button">Continuar tu historia <span>→</span></button>':''}<button class="atlas-online" type="button">2 jugadores <span>→</span></button></div><div class="atlas-welcome-minor"><button type="button" data-welcome="story">Ver la historia</button><button type="button" data-welcome="album">Colección</button><button type="button" data-welcome="settings">Ajustes</button></div><p class="atlas-edition">ISLA HOKU <span>✦</span> LA RUTA DE LOS DIEZ</p></div><dialog class="atlas-dialog atlas-modes"><button class="atlas-dialog-close" aria-label="Cerrar multijugador">×</button><p class="atlas-eyebrow">MEJOR EN COMPAÑÍA</p><h2>Dos formas de jugar juntos.</h2>${online()}<p class="atlas-muted">Crea una sala o entra con el código de tu amigo.</p></dialog>`;
 const stop=animate(el.querySelector('canvas'),(c,w,h,t)=>drawAtlasSky(c,w,h,t,'kilo',0,true),()=>el.isConnected&&el.classList.contains('show'));
 let done=false;const close=(action='play')=>{if(done)return;done=true;stop();removeEventListener('keydown',keys,true);finish();el.remove();dispatchEvent(new CustomEvent('ohana-atlas-open',{detail:{action}}));if(action==='resume')dispatchEvent(new Event('ohana-atlas-continue'));};
 const keys=e=>{if(el.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Enter'&&!e.target.closest('button,a')){e.preventDefault();e.stopImmediatePropagation();close();}else trap(el,e);};addEventListener('keydown',keys,true);
 el.querySelector('.oi-enter').onclick=()=>close();el.querySelector('.atlas-resume')?.addEventListener('click',()=>close('resume'));
 const modes=el.querySelector('dialog');el.querySelector('.atlas-online').onclick=()=>modes.showModal();el.querySelector('.atlas-dialog-close').onclick=()=>modes.close();
 for(const b of el.querySelectorAll('[data-welcome]'))b.onclick=()=>close(b.dataset.welcome);
 el.querySelector('.oi-enter').focus({preventScroll:true});
}
export function mountHokuAtlas({select,onBegin,onContinue,onStory,onHome,document:doc=globalThis.document}={}){
 const menu=doc.getElementById('char-select');if(!menu||doc.getElementById('hoku-atlas'))return;
 doc.body.classList.add('hoku-atlas-on');menu.dataset.selectorMode='hoku-atlas';
 const host=doc.createElement('section');host.id='hoku-atlas';host.setAttribute('aria-label','Prepara tu aventura en el Atlas de Hoku');
 host.innerHTML=`<header class="atlas-header"><button type="button" class="atlas-home" aria-label="Volver a la portada">OHANA <span>ATLAS DE HOKU</span></button><nav aria-label="Opciones del Atlas"><button type="button" data-atlas-dialog="online">2 jugadores →</button><button type="button" data-atlas-action="album">Colección</button><button type="button" data-atlas-dialog="settings" aria-label="Ajustes">⚙</button></nav></header><nav class="atlas-steps" aria-label="Preparar aventura"><button type="button" data-atlas-step="0"><span>01</span> Personaje</button><button type="button" data-atlas-step="1"><span>02</span> Destino</button><button type="button" data-atlas-step="2"><span>03</span> Forma</button></nav><div class="atlas-main"><section class="atlas-stage-wrap"><canvas id="atlas-stage" role="img" aria-label="Tu héroe en una isla del Atlas"></canvas><div class="atlas-stage-caption"><span id="atlas-stage-index">01 / 10</span><span>UNA HISTORIA QUE EMPIEZA CONTIGO</span></div></section><section class="atlas-choice"><p class="atlas-eyebrow" id="atlas-kicker"></p><h2 id="atlas-title"></h2><p id="atlas-description"></p><div id="atlas-characters" class="atlas-panel"></div><div id="atlas-destinations" class="atlas-panel" hidden></div><div id="atlas-forms" class="atlas-panel" hidden></div><details id="atlas-details"><summary>Conocer a este héroe <span>+</span></summary><p id="atlas-mastery"></p><p id="atlas-form-name"></p></details><p id="atlas-feedback" role="status" aria-live="polite"></p></section></div><footer class="atlas-confirm"><button class="atlas-back" type="button">← Atrás</button><div class="atlas-summary"><strong id="atlas-summary-hero"></strong><span id="atlas-summary-route"></span></div><button type="button" class="atlas-primary" id="atlas-next">Elegir destino <span>→</span></button></footer><dialog class="atlas-dialog" id="atlas-online-dialog"><button type="button" class="atlas-dialog-close" aria-label="Cerrar multijugador">×</button><p class="atlas-eyebrow">MEJOR EN COMPAÑÍA</p><h2>Compartid la aventura.</h2>${online()}<p class="atlas-muted">El vestíbulo online permite crear sala, entrar con código y elegir héroes.</p></dialog><dialog class="atlas-dialog" id="atlas-settings-dialog"><button type="button" class="atlas-dialog-close" aria-label="Cerrar ajustes">×</button><p class="atlas-eyebrow">A TU MANERA</p><h2>Ajusta el viaje.</h2><p>Dificultad</p><div id="atlas-difficulty"></div><button type="button" class="atlas-setting" id="atlas-sound">Activar / desactivar sonido</button><button type="button" class="atlas-setting" id="atlas-memory" hidden>La constelación familiar</button><button type="button" class="atlas-setting" id="atlas-story">Ver la historia de Ohana</button></dialog>`;
 menu.append(host);
 // Reuse the ten real buttons and their native selection contract, not Canvas hit targets.
 const chars=doc.getElementById('chars');host.querySelector('#atlas-characters').append(chars);host.querySelector('#atlas-difficulty').append(doc.getElementById('difficulty'));

 for(const button of chars.querySelectorAll('.char-card')){
  const id=button.dataset.id,portrait=button.querySelector('.portrait'),thumb=doc.createElement('canvas');thumb.width=150;thumb.height=120;
  portrait.replaceChildren(thumb);const c=thumb.getContext('2d');drawFamilyActor(c,id,75,110,1.42,73,{form:0},true);
  const label=doc.createElement('span');label.className='atlas-hero-label';label.textContent=ROSTER.find(r=>r.id===id).name;button.append(label);
 }
 const $=id=>host.querySelector('#'+id);let hero=menu.dataset.hero||'kilo',room='w1-'+hero,form=0,step=0,progress;
 const refresh=()=>{progress=atlasProgress(localStorage,saveStore.read(),readWorld1Seals());};refresh();
 const cards=()=>world1SelectCards({seals:progress.seals,keepsakes:readKeepsakes()});
 function drawDestinations(){
  $('atlas-destinations').innerHTML=cards().map((card,i)=>`<button type="button" class="atlas-destination ${card.room===room?'is-selected':''}" data-atlas-room="${card.room}" aria-pressed="${card.room===room}" ${card.unlocked?'':'aria-disabled="true"'}><span class="atlas-destination-number">${card.final?'✦':String(i+1).padStart(2,'0')}</span><span><strong>${card.roomName}</strong><small>${card.final?(card.unlocked?'Diez sellos reunidos':'Requiere los diez sellos'):card.sealed?'Sello recuperado':'Capítulo abierto'}</small></span><b aria-hidden="true">${card.final&&!card.unlocked?'◇':card.sealed?'✓':'→'}</b></button>`).join('');
 }
 function drawForms(){const d=ROSTER.find(r=>r.id===hero),max=atlasEarnedForm(hero,progress);$('atlas-forms').innerHTML=d.forms.map((f,i)=>`<button type="button" data-atlas-form="${i}" class="atlas-form ${i===form?'is-selected':''}" aria-pressed="${i===form}" ${i>max?'disabled':''}><span>${i>max?'◇':String(i+1).padStart(2,'0')}</span><strong>${f.name}</strong><small>${i>max?'Consíguela durante su aventura':i===0?'Tu primera forma':'Conseguida'}</small></button>`).join('');}
 function update(){
  refresh();$('atlas-memory').hidden=!localStorage.getItem('ohana-family-memory-v500');const def=ROSTER.find(r=>r.id===hero);form=Math.min(form,atlasEarnedForm(hero,progress));host.dataset.hero=hero;host.dataset.form=String(form);host.dataset.step=String(step);host.style.setProperty('--atlas-accent',def.color);
  for(const button of host.querySelectorAll('[data-atlas-step]')){const active=Number(button.dataset.atlasStep)===step;button.setAttribute('aria-current',active?'step':'false');button.classList.toggle('is-current',active);}
  $('atlas-characters').hidden=step!==0;$('atlas-destinations').hidden=step!==1;$('atlas-forms').hidden=step!==2;
  $('atlas-kicker').textContent=['LA FAMILIA','TU PRÓXIMA HISTORIA','LO QUE HAS CONSEGUIDO'][step];
  $('atlas-title').textContent=step===0?def.name:step===1?'Elige tu rumbo.':'Tu forma de jugar.';
  $('atlas-description').textContent=step===0?masteryOf(hero).desc:step===1?'Cada isla tiene su héroe y su propia manera de despertar.':'Selecciona una evolución conseguida. Las demás te esperan en la aventura.';
  $('atlas-stage-index').textContent=String(ROSTER.indexOf(def)+1).padStart(2,'0')+' / 10';$('atlas-stage').setAttribute('aria-label',def.name+' · '+def.forms[form].name+' · personaje animado real');
  $('atlas-summary-hero').textContent=def.name+' · '+def.forms[form].name;$('atlas-summary-route').textContent=cards().find(c=>c.room===room)?.roomName||'';
  $('atlas-next').innerHTML=(step===0?'Elegir destino':step===1?'Elegir forma':'Entrar en '+(cards().find(c=>c.room===room)?.roomName||'su capítulo'))+' <span>→</span>';
  $('atlas-mastery').textContent=masteryOf(hero).name+' · '+masteryOf(hero).desc;$('atlas-form-name').textContent=def.forms[form].name;
  $('atlas-details').hidden=step===1;drawDestinations();drawForms();
 }
 function choose(id){if(!ROSTER.some(r=>r.id===id))return;hero=id;room='w1-'+hero;form=0;select?.(id);update();}
 const external=e=>{if(e.detail?.id&&e.detail.id!==hero)choose(e.detail.id);};addEventListener('ohana-title-hero',external);
 function move(next){step=Math.max(0,Math.min(2,next));$('atlas-feedback').textContent='';update();$('atlas-title').tabIndex=-1;$('atlas-title').focus({preventScroll:true});host.scrollIntoView({block:'start'});}
 for(const b of host.querySelectorAll('[data-atlas-step]'))b.onclick=()=>move(Number(b.dataset.atlasStep));
 $('atlas-next').onclick=()=>{if(step<2)return move(step+1);const selection=atlasSelection(hero,room,form,progress);if(!selection.allowed){$('atlas-feedback').textContent='Reúne los diez sellos antes de entrar en el Corazón.';return;}globalThis.__ohanaWorld1Start=selection.room;globalThis.__ohanaStartHero=selection.hero;globalThis.__ohanaStartForm=selection.form;select?.(selection.hero);onBegin?.();};
 host.querySelector('.atlas-back').onclick=()=>step?move(step-1):onHome?.();host.querySelector('.atlas-home').onclick=()=>onHome?.();
 $('atlas-destinations').onclick=e=>{const button=e.target.closest('[data-atlas-room]');if(!button)return;if(button.getAttribute('aria-disabled')==='true'){$('atlas-feedback').textContent='El Corazón se abre al recuperar los diez sellos.';return;}room=button.dataset.atlasRoom;const owner=cards().find(c=>c.room===room)?.hero;if(owner&&owner!==hero){hero=owner;form=0;select?.(hero);}update();};
 $('atlas-forms').onclick=e=>{const b=e.target.closest('[data-atlas-form]');if(!b||b.disabled)return;form=Number(b.dataset.atlasForm);update();};
 for(const b of host.querySelectorAll('[data-atlas-dialog]'))b.onclick=()=>{const dialog=$('atlas-'+b.dataset.atlasDialog+'-dialog');dialog.showModal();};
 for(const b of host.querySelectorAll('.atlas-dialog-close'))b.onclick=()=>b.closest('dialog').close();
 host.querySelector('[data-atlas-action="album"]').onclick=()=>doc.getElementById('btn-festival-title')?.click();
 $('atlas-memory').onclick=()=>{$('atlas-settings-dialog').close();doc.getElementById('btn-family-memory')?.click();};
 $('atlas-sound').onclick=()=>doc.getElementById('btn-mute')?.click();$('atlas-story').onclick=()=>{$('atlas-settings-dialog').close();onStory?.();};
 const open=e=>{refresh();update();if(e.detail?.action==='story')onStory?.();else if(e.detail?.action==='settings')$('atlas-settings-dialog').showModal();else if(e.detail?.action==='album')doc.getElementById('btn-festival-title')?.click();else host.querySelector('#chars-grid .selected')?.focus({preventScroll:true});};addEventListener('ohana-atlas-open',open);addEventListener('ohana-atlas-continue',()=>onContinue?.());
 // Native buttons provide keyboard and assistive-technology activation. Arrows
 // navigate within a group; selecting never doubles as starting the adventure.
 host.addEventListener('keydown',e=>{
  if(e.target.closest('dialog'))return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();step?move(step-1):onHome?.();return;}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)){
   const group=e.target.closest('#chars-grid,#atlas-destinations,#atlas-forms,.atlas-steps');if(!group)return;
   const buttons=[...group.querySelectorAll('button:not([disabled])')],i=buttons.indexOf(e.target.closest('button'));if(i<0)return;
   const n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length;
   e.preventDefault();e.stopImmediatePropagation();buttons[n].focus();if(group.id==='chars-grid')buttons[n].click();
  }
 },true);
 const stop=animate($('atlas-stage'),(c,w,h,t)=>drawAtlasSky(c,w,h,t,hero,form),()=>menuPaintAllowedInDocument(doc));
 const observer=new MutationObserver(()=>{if(menuPaintAllowedInDocument(doc)){refresh();update();}});observer.observe(doc.body,{attributes:true,attributeFilter:['class']});update();
 return {choose,destroy(){stop();observer.disconnect();removeEventListener('ohana-title-hero',external);removeEventListener('ohana-atlas-open',open);host.remove();}};
}
