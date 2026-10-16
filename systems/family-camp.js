import {ROSTER} from '../characters/roster.js';
import {drawCharacter} from '../characters/draw.js';
import {CAMP_HEROES,campNearest,campViewport,campPresentation} from './family-camp-model.js';
import {menuPaintAllowedInDocument} from './menu-visibility.js';
import {reducedMotion} from './cinema-kit.js';
import {CALIBRATED_HEIGHT} from '../characters/visual-size.js';
import {MICHI_VISUAL_H} from '../characters/art/cat.js';
import {CHISPIN_VISUAL_H} from '../characters/art/chispin.js';
import {STITCHO_VISUAL_H} from '../characters/art/stitcho.js';
import {KILO_VISUAL_H} from '../characters/art/kilo.js';
import {CUERNO_VISUAL_H} from '../characters/art/cuerno.js';
import {CUERNO_V373_HEIGHT} from '../characters/art/cuerno-v373.js';
import {FRITA_VISUAL_H} from '../characters/art/frita.js';
import {ABILITY_DEFS} from './ability-catalog.js';
const TAU=Math.PI*2;
export function campActor(def,evo=1,pose='idle',height=92){
 const f=def.forms[evo];
 let base=['dino','dragon','pizza','yomi'].includes(def.id)?CALIBRATED_HEIGHT[evo]:({kilo:KILO_VISUAL_H,stitcho:STITCHO_VISUAL_H,chispin:CHISPIN_VISUAL_H,cat:MICHI_VISUAL_H,frita:FRITA_VISUAL_H}[def.id]?.[evo]||80);
 if(def.id==='cuerno')base=CUERNO_V373_HEIGHT[evo]*CUERNO_VISUAL_H[evo]/100;
 return {id:def.id,evo,color:f.color||def.color,w:f.w,h:f.h,x:-f.w/2,y:-f.h,facing:1,grounded:pose!=='jump',vx:pose==='run'?4:0,vy:pose==='jump'?-3:0,health:f.hp,maxHealth:f.hp,visualScale:height/base,invuln:0,melee:0,_poseOverride:pose,_introForceCanvas:true,_duetActor:true};
}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function line(c,x,y,x2,y2,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function label(c,text,x,y,size=15,color='#fff5cb'){c.font=`600 ${size}px Outfit,sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}
function island(c,t,reduce){
 c.fillStyle='#244e67';c.fillRect(0,0,1400,660);
 for(let i=0;i<12;i++){const y=35+i*53;line(c,0,y,1400,y,'#80d2dc13',2);}
 ellipse(c,700,366,665,267,'#143e4a');ellipse(c,700,350,660,259,'#e3c897');ellipse(c,700,334,639,239,'#f3ddb1');
 ellipse(c,710,327,575,208,'#9dbe8a');ellipse(c,710,336,545,186,'#b4c78c');
 // A path links ten little stages; the family shares one place.
 c.strokeStyle='#efd8ae';c.lineWidth=55;c.lineCap='round';c.beginPath();c.moveTo(235,325);c.bezierCurveTo(430,165,840,180,1120,325);c.bezierCurveTo(1290,590,280,620,235,325);c.stroke();
 ellipse(c,923,267,137,70,'#74b8bb');ellipse(c,923,257,120,55,'#95d1cf');
 for(const x of [115,1260]){line(c,x,300,x+18,125,'#816047',15);for(let j=0;j<5;j++){c.strokeStyle=j%2?'#4d8c79':'#659e7e';c.lineWidth=16;c.beginPath();c.moveTo(x+18,130);c.quadraticCurveTo(x-115+j*47,65,x-100+j*49,160);c.stroke();}}
 for(const [x,y,col] of [[370,215,'#b4809b'],[1060,455,'#d6ad78']]){c.fillStyle=col;c.beginPath();c.moveTo(x-52,y);c.lineTo(x,y-64);c.lineTo(x+52,y);c.closePath();c.fill();c.fillStyle='#405d60';c.fillRect(x-10,y-30,20,30);}
 // Picnic, stepping stones, wind chimes, a little campfire.
 c.fillStyle='#e6a694';c.fillRect(530,445,95,42);for(let i=0;i<4;i++)line(c,535+i*23,445,535+i*23,487,'#f3d8b5',5);
 for(let i=0;i<4;i++)ellipse(c,845+i*45,307,17,8,'#d6d5ba');
 line(c,201,269,250,269,'#987451',4);for(let i=0;i<4;i++){line(c,205+i*13,269,205+i*13,287+i%2*8,'#fff0c5',2);}
 ellipse(c,1085,343,26,10,'#8e7d65');for(let i=0;i<3;i++)ellipse(c,1074+i*10,332-(reduce?0:Math.sin(t*3+i)*3),7,14,'#ffc780');
 // Enemy silhouettes stay on their own distant island.
 ellipse(c,1300,52,75,30,'#c2b49a');for(let i=0;i<3;i++){ellipse(c,1260+i*35,40,12,9,'#7f5474');ellipse(c,1256+i*35,37,2,2,'#fff6dc');ellipse(c,1264+i*35,37,2,2,'#fff6dc');}label(c,'¿QUÉ TRAMAN?',1300,17,11,'#c3e2e6');
 for(let i=0;i<18;i++){const x=150+(i*137)%1110,y=190+(i*59)%360;ellipse(c,x,y,3,3,i%2?'#fff5c7':'#e7a6b4');}
}
function prop(c,id,x,y,t,active,reduce){
 const type=CAMP_HEROES[id].prop,phase=reduce?0:t;
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
 host.innerHTML=`<div class="camp-scene"><div class="camp-scene-heading"><span>ANTES DE SALVAR EL MUNDO…</span><strong>Un ratito con la familia.</strong></div><canvas id="camp-canvas" tabindex="0" role="img" aria-label="Isla viva. Flechas o WASD mueven la luciérnaga; acércate a un personaje o elígelo en los botones inferiores."></canvas><p class="camp-instructions">Mueve la luciérnaga · toca un personaje · descubre sus travesuras</p><div class="camp-mystery" aria-label="La U revela un compañero sorpresa"><span aria-hidden="true">?</span><p>Una ayuda inesperada.<small>Tu compañero se revela al pulsar U.</small></p></div></div><aside class="camp-dossier"><p class="camp-eyebrow">TU COMPAÑERO DE AVENTURA</p><h2 id="camp-name"></h2><p id="camp-role"></p><div class="camp-album-art"><canvas id="camp-portrait" width="300" height="240" role="img"></canvas><span id="camp-form-name"></span></div><div class="camp-forms" role="group" aria-label="Explorar las cinco formas">${[0,1,2,3,4].map(n=>`<button type="button" data-camp-form="${n}" aria-label="Ver forma ${n+1}">${n+1}</button>`).join('')}</div><p id="camp-route"></p><dl id="camp-stats"></dl><div class="camp-talk" aria-live="polite"><p id="camp-line"></p></div><div class="camp-film-controls"><button type="button" id="camp-film">Ver su travesura</button><button type="button" id="camp-film-stop" hidden>Terminar escena</button></div><button type="button" id="camp-start">¡Vámonos de aventura! ↗</button></aside>`;
 menu.querySelector('.hero-stage').before(host);
const powers=doc.createElement('p');powers.id='camp-powers';host.querySelector('#camp-route').after(powers);
 let selected=menu.dataset.hero||'kilo',form=0,film=null,last=0,time=0,raf=0,view={scale:1,x:0};
 let cursor={x:CAMP_HEROES[selected].x,y:CAMP_HEROES[selected].y+40},target={...cursor};const keys=new Set();
 const canvas=host.querySelector('#camp-canvas'),ctx=canvas.getContext('2d');const portrait=host.querySelector('#camp-portrait'),pc=portrait.getContext('2d');
 const scenery=doc.createElement('canvas');scenery.width=1400;scenery.height=660;island(scenery.getContext('2d'),0,true);
 const idleActors=new Map();
 const $=id=>host.querySelector('#'+id);
 function update(){const def=ROSTER.find(r=>r.id===selected),data=CAMP_HEROES[selected],f=def.forms[form];
 $('camp-name').textContent=def.name;$('camp-role').textContent=data.role;$('camp-route').textContent='Tu camino: '+data.route+'.';$('camp-form-name').textContent=def.evoNames[form];
 portrait.setAttribute('aria-label',def.evoNames[form]+' · personaje real');
 $('camp-stats').innerHTML=`<div><dt>Vida</dt><dd>${f.hp}</dd></div><div><dt>Velocidad</dt><dd>${f.speed}</dd></div><div><dt>Salto</dt><dd>${f.jump}</dd></div>`;
 $('camp-powers').textContent=def.abilities.map((id,i)=>['J','K','L'][i]+' · '+(ABILITY_DEFS[id]?.name||id)).join(' / ');
 for(const b of host.querySelectorAll('[data-camp-form]'))b.setAttribute('aria-pressed',String(Number(b.dataset.campForm)===form));
 $('camp-line').textContent=data.lines[0];host.dataset.hero=selected;host.dataset.form=String(form);
 }
 function choose(id,walk=false){if(!CAMP_HEROES[id])return;selected=id;form=0;film=null;$('camp-film-stop').hidden=true;$('camp-film').hidden=false;if(!walk)target={x:CAMP_HEROES[id].x,y:CAMP_HEROES[id].y+40};update();}
 const selectHero=(id,walk=false)=>{choose(id,walk);select(id);};
 addEventListener('ohana-title-hero',e=>{if(e.detail.id!==selected)choose(e.detail.id);});
 host.querySelector('.camp-forms').addEventListener('click',e=>{const b=e.target.closest('[data-camp-form]');if(b){form=Number(b.dataset.campForm);update();}});
 $('camp-film').onclick=()=>{film={id:selected,start:time};$('camp-film-stop').hidden=false;$('camp-film').hidden=true;};
 $('camp-film-stop').onclick=()=>{film=null;$('camp-film-stop').hidden=true;$('camp-film').hidden=false;$('camp-line').textContent=CAMP_HEROES[selected].lines[0];};
 $('camp-start').onclick=()=>onBegin();
 function position(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/view.scale+view.x,y:(e.clientY-r.top)/view.scale};}
 canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});const p=position(e),id=campNearest(p.x,p.y+35,100);if(id)selectHero(id);else target={x:Math.max(140,Math.min(1230,p.x)),y:Math.max(190,Math.min(540,p.y))};});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();e.stopPropagation();keys.add(e.key.toLowerCase());}});
 canvas.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)target={...cursor};});canvas.addEventListener('blur',()=>keys.clear());
 function paint(now){raf=0;if(!menuPaintAllowedInDocument(doc)){last=0;return;}if(last&&now-last<50){raf=requestAnimationFrame(paint);return;}
 const dt=last?Math.min(.08,(now-last)/1000):0;last=now;time+=dt;const reduce=reducedMotion(),width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
 if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 const desired=campViewport(width,height,selected);view.scale=desired.scale;view.x=reduce?desired.x:view.x+(desired.x-view.x)*Math.min(1,dt*5);
 if(keys.size){const dx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),dy=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0);target={x:Math.max(140,Math.min(1230,cursor.x+dx*200)),y:Math.max(190,Math.min(540,cursor.y+dy*200))};}
 const distance=Math.hypot(target.x-cursor.x,target.y-cursor.y),step=Math.min(distance,dt*250);if(distance){cursor.x+=(target.x-cursor.x)/distance*step;cursor.y+=(target.y-cursor.y)/distance*step;}
 const near=campNearest(cursor.x,cursor.y-35,72);if(near&&near!==selected&&(keys.size>0||distance<20))selectHero(near,true);
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.scale(view.scale,view.scale);ctx.translate(-view.x,0);ctx.drawImage(scenery,0,0);
 for(const def of ROSTER){const p=CAMP_HEROES[def.id],hot=def.id===selected,beat=film?.id===def.id?campPresentation(def.id,time-film.start):null;
 ellipse(ctx,p.x,p.y+4,hot?50:35,12,hot?'#fff5c066':'#425f5029');
 const pose=beat?.pose||'idle';let x=p.x,y=p.y;
 if(beat&&!reduce){const phase=(time-film.start)%4;if(pose==='run')x+=Math.sin(phase*Math.PI/2)*30;if(pose==='jump')y-=Math.sin(phase*Math.PI/4)*35;}
 prop(ctx,def.id,x,y,time,!!beat,reduce);
 if(hot){ctx.save();ctx.translate(x,y);drawCharacter(ctx,campActor(def,1,pose,94),{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});ctx.restore();}
 else {
  let cached=idleActors.get(def.id);
  if(!cached){const image=doc.createElement('canvas');image.width=220;image.height=190;cached={image,at:-Infinity,reduce};idleActors.set(def.id,cached);}
  if(time-cached.at>.35||cached.reduce!==reduce){const c=cached.image.getContext('2d');c.clearRect(0,0,220,190);c.save();c.translate(110,155);drawCharacter(c,campActor(def,1,'idle',84),{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});c.restore();cached.at=time;cached.reduce=reduce;}
  ctx.drawImage(cached.image,x-110,y-155);
 }
 label(ctx,def.name,p.x,p.y+32,hot?19:16,hot?'#4d3e46':'#475e5c');if(hot){label(ctx,'▼',p.x,p.y-110,18,'#fff5c2');}
 }
 ellipse(ctx,cursor.x,cursor.y,reduce?8:8+Math.sin(time*6),8,'#fff4b9');ellipse(ctx,cursor.x-10,cursor.y-4,7,3,'#f3f9e6aa');ellipse(ctx,cursor.x+10,cursor.y-4,7,3,'#f3f9e6aa');
 const def=ROSTER.find(r=>r.id===selected);pc.clearRect(0,0,300,240);ellipse(pc,150,206,65,12,'#ae9de32b');pc.save();pc.translate(150,207);drawCharacter(pc,campActor(def,form,film?campPresentation(selected,time-film.start).pose:'idle',140),{x:0,y:0},reduce?0:Math.floor(time*60),{reduceMotion:reduce});pc.restore();
 if(film){const beat=campPresentation(selected,time-film.start);if($('camp-line').textContent!==beat.line)$('camp-line').textContent=beat.line;if(beat.done)$('camp-film-stop').click();}
 raf=requestAnimationFrame(paint);
 }
 function wake(){if(!raf&&menuPaintAllowedInDocument(doc))raf=requestAnimationFrame(paint);}
 const observer=new MutationObserver(()=>{if(!menuPaintAllowedInDocument(doc)){keys.clear();last=0;}wake();});observer.observe(doc.body,{attributes:true,attributeFilter:['class']});doc.addEventListener('visibilitychange',wake);update();wake();
 return {choose:selectHero,destroy(){observer.disconnect();cancelAnimationFrame(raf);host.remove();}};
}
