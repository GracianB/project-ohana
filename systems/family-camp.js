import {WORLD1_CHAPTER_PLANS} from './world1-rooms.js';
import {drawFamilyIslands,pairedScene} from "./family-islands.js";
import {ROSTER} from '../characters/roster.js';
import {drawCharacter} from '../characters/draw.js';
import {CAMP_HEROES,campNearest,campViewport,campPresentation} from './family-camp-model.js';
import {menuPaintAllowedInDocument} from './menu-visibility.js';
import {reducedMotion} from './cinema-kit.js';
import {heroHeightTarget} from '../characters/visual-size.js';
import {MICHI_VISUAL_H} from '../characters/art/cat.js';
import {CHISPIN_VISUAL_H} from '../characters/art/chispin.js';
import {STITCHO_VISUAL_H} from '../characters/art/stitcho.js';
import {KILO_VISUAL_H} from '../characters/art/kilo.js';
import {CUERNO_VISUAL_H} from '../characters/art/cuerno.js';
import {CUERNO_V373_HEIGHT} from '../characters/art/cuerno-v373.js';
import {FRITA_VISUAL_H} from '../characters/art/frita.js';
import {ABILITY_DEFS} from './ability-catalog.js';
import {createWorld1Select,refreshWorld1Select,world1SelectKey,world1SelectPointer,drawWorld1Select} from './world1-select.js';
import {readWorld1Seals} from './world1-progress.js';
import {countsByHero,loadWorld1Collect} from './world1-collect.js';
const TAU=Math.PI*2;
export function campActor(def,evo=1,pose='idle',height=92){
 const f=def.forms[evo];
 const base=heroHeightTarget(def.id,evo);
 return {id:def.id,evo,color:f.color||def.color,w:f.w,h:f.h,x:-f.w/2,y:-f.h,facing:1,grounded:pose!=='jump',vx:pose==='run'?4:0,vy:pose==='jump'?-3:0,health:f.hp,maxHealth:f.hp,visualScale:height/base,invuln:0,melee:0,_poseOverride:pose,_introForceCanvas:true,_duetActor:true};
}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function line(c,x,y,x2,y2,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function label(c,text,x,y,size=15,color='#fff5cb'){c.font=`600 ${size}px Outfit,sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}
function island(c,t,reduce){drawFamilyIslands(c,t,reduce);}

function prop(c,id,x,y,t,active,reduce){
 const type=CAMP_HEROES[id].prop,phase=reduce?0:t;
 if(id==='stitcho'&&active){c.save();c.translate(x+45,y-65+(reduce?0:Math.sin(t*3)*6));ellipse(c,0,0,24,8,'#718da7');ellipse(c,0,-7,13,10,'#a8e1df');ellipse(c,0,4,18,3,'#334967');for(let i=-1;i<=1;i++)ellipse(c,i*12,1,3,2,i===Math.floor(t*3)%3-1?'#ffdda0':'#a3d6b5');c.restore();return;}
 c.save();c.translate(x,y);
 if(type==='rainbow'){for(let i=0;i<4;i++){c.strokeStyle=['#edb8d0','#ead69b','#b4d7ba','#b1c8e4'][i];c.lineWidth=5;c.beginPath();c.arc(40,-20,25+i*5,Math.PI,TAU);c.stroke();}}
 else if(type==='moon'){ellipse(c,30,-38,13,13,'#fff0be');ellipse(c,35,-43,12,12,'#95d1cf');}
 else if(type==='rock'){ellipse(c,30,0,22,12,'#83918a');line(c,26,-10,31,2,'#596d67',2);}
 else if(type==='kite'){line(c,40,0,60+Math.sin(phase)*5,-95,'#fff3cf',1);c.fillStyle='#e9c299';c.beginPath();c.moveTo(60,-120);c.lineTo(78,-100);c.lineTo(60,-70);c.lineTo(42,-100);c.closePath();c.fill();}
 else if(type==='lantern'){line(c,33,-60,33,-40,'#776a74',2);ellipse(c,33,-25,13,18,'#edb9b4');ellipse(c,33,-25,5,10,'#fff1b6');}
 else if(type==='cheese'){c.fillStyle='#f9dc88';c.fillRect(32,-8,36,9);line(c,32,-4,active?-20:27,-30,'#f9dc88',3);}
 else if(type==='salt'){c.fillStyle='#fff0ce';c.fillRect(30,-24,16,24);c.fillStyle='#b0c1c1';c.fillRect(28,-27,20,6);}
 else if(type==='spark'){for(let i=0;i<3;i++){ellipse(c,30+i*14,-18-Math.sin(phase*3+i)*5,4,4,'#fff2a0');}}
 else if(type==='music'){label(c,'♪',40,-30+Math.sin(phase)*3,30,'#fff0bd');}
 else if(type==='fire'){ellipse(c,35,-35,8,14,'#f4b27e');}
 c.restore();
}
export function mountFamilyCamp({select,onBegin,document:doc=globalThis.document}={}){
 const menu=doc.getElementById('char-select');if(!menu||doc.getElementById('family-camp'))return;
 menu.classList.add('camp-on');menu.dataset.selectorMode='family-camp';
 const host=doc.createElement('section');host.id='family-camp';host.setAttribute('aria-label','Campamento de la familia');
 host.innerHTML=`<div class="camp-scene"><div class="camp-scene-heading"><span>ANTES DE SALVAR EL MUNDO…</span><strong>Un ratito con la familia.</strong></div><canvas id="camp-canvas" tabindex="0" role="img" aria-label="Cinco islas de la familia. Flechas o WASD mueven la luciérnaga; acércate a un personaje o elígelo en los botones inferiores."></canvas><p class="camp-instructions">Mueve la luciérnaga · toca un personaje · descubre sus travesuras</p><div class="camp-mystery" aria-label="La U revela un compañero sorpresa"><span aria-hidden="true">?</span><p>Una ayuda inesperada.<small>Tu compañero se revela al pulsar U.</small></p></div></div><aside class="camp-dossier"><p class="camp-eyebrow">TU COMPAÑERO DE AVENTURA</p><h2 id="camp-name"></h2><p id="camp-role"></p><div class="camp-album-art"><canvas id="camp-portrait" width="300" height="240" role="img"></canvas><span id="camp-form-name"></span></div><div class="camp-forms" role="group" aria-label="Explorar las cinco formas">${[0,1,2,3,4].map(n=>`<button type="button" data-camp-form="${n}" aria-label="Ver forma ${n+1}">${n+1}</button>`).join('')}</div><p id="camp-route"></p><dl id="camp-stats"></dl><div class="camp-talk" aria-live="polite"><p id="camp-line"></p></div><div class="camp-film-controls"><button type="button" id="camp-film">Ver su travesura</button><button type="button" id="camp-film-stop" hidden>Terminar escena</button></div><button type="button" id="camp-start">¡Vámonos de aventura! ↗</button></aside>`;
 menu.querySelector('.hero-stage').before(host);
const powers=doc.createElement('p');powers.id='camp-powers';host.querySelector('#camp-route').after(powers);
 let selected=menu.dataset.hero||'kilo',form=0,film=null,last=0,time=0,raf=0,view={scale:1,x:0};
 let cursor={x:CAMP_HEROES[selected].x,y:CAMP_HEROES[selected].y+40},target={...cursor};const keys=new Set();let walkSelectionLatched=false;
 const canvas=host.querySelector('#camp-canvas'),ctx=canvas.getContext('2d');
 // V468: selección del Mundo 1 — una carta-portal por héroe enlazada a SU sala (sin islas en pareja).
 const w1opts=()=>{let counts={};try{const g={};loadWorld1Collect(g);counts=countsByHero(g);}catch(_){}return {seals:readWorld1Seals(),counts};};
 let w1sel=null;try{w1sel=createWorld1Select({...w1opts(),start:selected});}catch(_){w1sel=null;}
 if(w1sel){host.querySelector('.camp-scene-heading span').textContent='CRÓNICAS DE OHANA';host.querySelector('.camp-scene-heading strong').textContent='Diez historias. Un destino.';host.querySelector('.camp-instructions').textContent='Elige un capítulo · cada héroe comienza como bebé · reúne diez sellos';menu.dataset.selectorMode='world1-rooms';host.dataset.world='1';const caption=menu.querySelector('.family-grid-caption');if(caption)caption.textContent='ACCESO DIRECTO A LOS CAPÍTULOS';canvas.setAttribute('aria-label','Mundo 1: diez salas, una por héroe, y el Corazón de Ohana. Flechas para elegir, Intro para entrar.');}
 const w1enter=(r)=>{if(!r)return;if(r.card?.hero&&r.card.hero!==selected)selectHero(r.card.hero);if(r.action==='enter'){globalThis.__ohanaWorld1Start=r.room;onBegin();}else if(r.action==='locked'&&r.message)$('camp-line').textContent=r.message;};
 if(w1sel){
  canvas.addEventListener('pointerdown',e=>{const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;canvas.focus({preventScroll:true});e.stopImmediatePropagation();const m=world1SelectPointer(w1sel,x,y,false);if(!m)return;const again=m.card.final||m.card.hero===selected;w1enter(again?world1SelectPointer(w1sel,x,y,true):m);},true);
  canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();world1SelectPointer(w1sel,e.clientX-b.left,e.clientY-b.top,false);});
  canvas.addEventListener('keydown',e=>{const r=world1SelectKey(w1sel,e.key);if(!r||r.action==='back')return;e.preventDefault();e.stopImmediatePropagation();w1enter(r);},true);
  addEventListener('focus',()=>{try{refreshWorld1Select(w1sel,w1opts());}catch(_){}});
 }const portrait=host.querySelector('#camp-portrait'),pc=portrait.getContext('2d');
 const scenery=doc.createElement('canvas');scenery.width=1400;scenery.height=660;island(scenery.getContext('2d'),0,true);
 const idleActors=new Map();
 const $=id=>host.querySelector('#'+id);
 function update(){const def=ROSTER.find(r=>r.id===selected),data=CAMP_HEROES[selected],f=def.forms[form];
 $('camp-start').textContent=w1sel?'Entrar en su capítulo →':'¡Vámonos de aventura! ↗';
 $('camp-name').textContent=def.name;$('camp-role').textContent=w1sel?'Su capítulo · comienza como bebé':data.role;$('camp-route').textContent=w1sel?(WORLD1_CHAPTER_PLANS[selected]?.identity+' · '+WORLD1_CHAPTER_PLANS[selected]?.mobility):'Tu camino: '+data.route+'.';$('camp-form-name').textContent=def.evoNames[form];
 portrait.setAttribute('aria-label',def.evoNames[form]+' · personaje real');
 $('camp-stats').innerHTML=`<div><dt>Vida</dt><dd>${f.hp}</dd></div><div><dt>Velocidad</dt><dd>${f.speed}</dd></div><div><dt>Salto</dt><dd>${f.jump}</dd></div>`;
 $('camp-powers').textContent=def.abilities.map((id,i)=>['J','K','L'][i]+' · '+(ABILITY_DEFS[id]?.name||id)).join(' / ');
 for(const b of host.querySelectorAll('[data-camp-form]'))b.setAttribute('aria-pressed',String(Number(b.dataset.campForm)===form));
 $('camp-line').textContent=data.lines[0];host.dataset.hero=selected;host.dataset.form=String(form);
 }
 function choose(id,walk=false){if(!CAMP_HEROES[id])return;selected=id;form=0;film=null;$('camp-film-stop').hidden=true;$('camp-film').hidden=false;
 // Keep keyboard focus and the Canvas portal selection in sync with the HTML hero cards.
 // V468 replaced paired islands with eleven cards; the old selector index could
 // still point at Dino after the player clicked Kilo, breaking ArrowRight.
 if(w1sel){const cardIndex=w1sel.cards.findIndex(card=>card.hero===id);if(cardIndex>=0){w1sel.index=cardIndex;w1sel.hover=-1;}}
 if(!walk){
  // Direct card/pointer selections must also relocate the firefly. Otherwise
  // the next arrow key starts from a stale character across the archipelago.
  cursor={x:CAMP_HEROES[id].x,y:CAMP_HEROES[id].y+40};
  target={...cursor};
  walkSelectionLatched=false;
 }update();}
 const selectHero=(id,walk=false)=>{choose(id,walk);select(id);};
 addEventListener('ohana-title-hero',e=>{if(e.detail.id!==selected)choose(e.detail.id);});
 host.querySelector('.camp-forms').addEventListener('click',e=>{const b=e.target.closest('[data-camp-form]');if(b){form=Number(b.dataset.campForm);update();}});
 $('camp-film').onclick=()=>{film={id:selected,start:time};$('camp-film-stop').hidden=false;$('camp-film').hidden=true;};
 $('camp-film-stop').onclick=()=>{film=null;$('camp-film-stop').hidden=true;$('camp-film').hidden=false;$('camp-line').textContent=CAMP_HEROES[selected].lines[0];};
 $('camp-start').onclick=()=>w1sel?w1enter(world1SelectKey(w1sel,'Enter')):onBegin();
 function position(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/view.scale+view.x,y:(e.clientY-r.top)/view.scale};}
 canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});const p=position(e),id=campNearest(p.x,p.y+35,100);if(id)selectHero(id);else target={x:Math.max(140,Math.min(1230,p.x)),y:Math.max(190,Math.min(540,p.y))};});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();e.stopPropagation();if(!keys.size)walkSelectionLatched=false;keys.add(e.key.toLowerCase());}});
 canvas.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)target={...cursor};});canvas.addEventListener('blur',()=>{keys.clear();walkSelectionLatched=false;target={...cursor};});
 function paint(now){raf=0;if(!menuPaintAllowedInDocument(doc)){last=0;return;}if(last&&now-last<50){raf=requestAnimationFrame(paint);return;}
 const dt=last?Math.min(.08,(now-last)/1000):0;last=now;time+=dt;const reduce=reducedMotion(),width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
 if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 const desired=campViewport(width,height,selected);view.scale=desired.scale;view.x=reduce?desired.x:view.x+(desired.x-view.x)*Math.min(1,dt*5);
 if(keys.size&&!walkSelectionLatched){const dx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),dy=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0);target={x:Math.max(140,Math.min(1230,cursor.x+dx*200)),y:Math.max(190,Math.min(540,cursor.y+dy*200))};}
 const distance=Math.hypot(target.x-cursor.x,target.y-cursor.y),step=Math.min(distance,dt*250);if(distance){cursor.x+=(target.x-cursor.x)/distance*step;cursor.y+=(target.y-cursor.y)/distance*step;}
 const near=campNearest(cursor.x,cursor.y-35,72);
 if(near&&near!==selected&&!walkSelectionLatched&&(keys.size>0||distance<20)){
  selectHero(near,true);
  if(keys.size){walkSelectionLatched=true;target={...cursor};}
 }
 if(w1sel){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);drawWorld1Select(ctx,width,height,reduce?0:time*60,w1sel,{reduceMotion:reduce,drawActor:(c,hero,x,y,sc)=>{const d=ROSTER.find(r=>r.id===hero);if(!d)throw Error('hero');c.save();c.translate(x,y);drawCharacter(c,campActor(d,1,'idle',Math.max(30,sc*40*1.6)),{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});c.restore();}});}
 else{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.scale(view.scale,view.scale);ctx.translate(-view.x,0);ctx.drawImage(scenery,0,0);
 for(const def of ROSTER){const p=CAMP_HEROES[def.id],hot=def.id===selected,beat=film?.id===def.id?campPresentation(def.id,time-film.start):null;
 ellipse(ctx,p.x,p.y+4,hot?50:35,12,hot?'#fff5c066':'#425f5029');
 const pair=film?pairedScene(def.id,selected,time-film.start):null;
 const pose=pair?.pose||beat?.pose||'idle';let x=p.x+(reduce?0:pair?.dx||0),y=p.y+(reduce?0:pair?.dy||0);
 if(beat&&!reduce){const phase=(time-film.start)%4;if(pose==='run')x+=Math.sin(phase*Math.PI/2)*30;if(pose==='jump')y-=Math.sin(phase*Math.PI/4)*35;}
 prop(ctx,def.id,x,y,time,!!beat||!!pair,reduce);
 if(hot||pair){ctx.save();ctx.translate(x,y);const actor=campActor(def,hot?form:1,pose,94);if(def.id==='kilo'){actor._kiloPerformance=pair?.performance||{kind:'dance',time};if(reduce)actor._kiloPerformance={...actor._kiloPerformance,time:3.5};}drawCharacter(ctx,actor,{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});ctx.restore();}
 else {
  let cached=idleActors.get(def.id);
  if(!cached){const image=doc.createElement('canvas');image.width=220;image.height=190;cached={image,at:-Infinity,reduce};idleActors.set(def.id,cached);}
  if(time-cached.at>.35||cached.reduce!==reduce){const c=cached.image.getContext('2d');c.clearRect(0,0,220,190);c.save();c.translate(110,155);drawCharacter(c,campActor(def,1,'idle',84),{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});c.restore();cached.at=time;cached.reduce=reduce;}
  ctx.drawImage(cached.image,x-110,y-155);
 }
 label(ctx,def.name,p.x,p.y+32,hot?19:16,hot?'#4d3e46':'#475e5c');if(hot){label(ctx,'▼',p.x,p.y-110,18,'#fff5c2');}
 }
 ellipse(ctx,cursor.x,cursor.y,reduce?8:8+Math.sin(time*6),8,'#fff4b9');ellipse(ctx,cursor.x-10,cursor.y-4,7,3,'#f3f9e6aa');ellipse(ctx,cursor.x+10,cursor.y-4,7,3,'#f3f9e6aa');
}
 const def=ROSTER.find(r=>r.id===selected);pc.clearRect(0,0,300,240);ellipse(pc,150,206,65,12,'#ae9de32b');pc.save();pc.translate(150,207);const portraitActor=campActor(def,form,film?campPresentation(selected,time-film.start).pose:'idle',140);if(def.id==='kilo')portraitActor._kiloPerformance=reduce?{kind:'relic',time:3.5}:film?pairedScene('kilo',selected,time-film.start)?.performance:{kind:'dance',time};drawCharacter(pc,portraitActor,{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});pc.restore();
 if(film){const beat=campPresentation(selected,time-film.start);if($('camp-line').textContent!==beat.line)$('camp-line').textContent=beat.line;if(beat.done)$('camp-film-stop').click();}
 raf=requestAnimationFrame(paint);
 }
 function wake(){if(!raf&&menuPaintAllowedInDocument(doc))raf=requestAnimationFrame(paint);}
 const observer=new MutationObserver(()=>{if(!menuPaintAllowedInDocument(doc)){keys.clear();last=0;}wake();});observer.observe(doc.body,{attributes:true,attributeFilter:['class']});doc.addEventListener('visibilitychange',wake);update();wake();
 return {choose:selectHero,destroy(){observer.disconnect();cancelAnimationFrame(raf);host.remove();}};
}
