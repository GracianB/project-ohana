// OHANA · Michi's living field manual.
// All illustrations use the actual production Canvas rig, not screenshots.
// A single animated preview keeps the help panel performant on small devices.
import catArt from '../characters/art/cat.js';
import {MICHI_BIOLUM_FORMS} from '../characters/michi-lumina.js';
import {R} from '../characters/rig.js';

export const MICHI_FIELD_NOTES=Object.freeze([
 Object.freeze({
   title:'01 · El primer latido',subtitle:'Michi · Cachorro Rebelde',
   description:'Pequeño y descarado: pelaje de carbón, oreja mellada y un pañuelo rojo que nunca se quita.',
   secret:'Camina despacio: el bosque se ilumina al acercarte, incluso antes de ver el siguiente salto.',
   gesture:'Oreja mellada · ojos ámbar · pañuelo rojo',tone:'#adfff1'
 }),
 Object.freeze({
   title:'02 · Dueño de los tejados',subtitle:'Michi · Alas de Asfalto',
   description:'El cuerpo se alarga y se alza sobre dos patas. Dos membranas rasgadas se articulan desde sus hombros; el pañuelo flamea entre ellas.',
   secret:'Mantén el salto para ascender. Al tocar tierra, el impulso vuelve a estar disponible.',
   gesture:'Alas oscuras · cola en gancho · vuelo',tone:'#98f8ff'
 }),
 Object.freeze({
   title:'03 · La pantera despierta',subtitle:'Michi · Pantera del Eclipse',
   description:'Una pantera baja y musculosa, con colmillos de sable, tres colas y enormes garras delanteras. Sus hombros preparan cada zarpazo.',
   secret:'Aprovecha los cambios de altura y vigila los brillos propios de cada enemigo.',
   gesture:'Cuatro patas · tres colas · colmillos de sable',tone:'#f6a7ff'
 }),
 Object.freeze({
   title:'04 · El filo de la sombra',subtitle:'Michi · Lince Espectral',
   description:'Un lince erguido sobre patas digitígradas. Sus penachos y dos colas cortan la silueta; las medias lunas de sus brazos siguen cada golpe.',
   secret:'No confundas el resplandor con una plataforma: sigue mirando sus contornos reales.',
   gesture:'Penachos · dos colas · garras de media luna',tone:'#ffe8ad'
 }),
 Object.freeze({
   title:'05 · El soberano de los nueve ecos',subtitle:'Michi · Leyenda de Nueve Colas',
   description:'Una gran bestia felina: melena angular, corona quebrada, alas y nueve colas que se abren en abanico. La cicatriz y el pañuelo revelan al cachorro que fue.',
   secret:'Puedes sostener el salto para volar, soltar para planear y pulsar abajo para descender.',
   gesture:'Nueve colas · alas · tachuelas doradas',tone:'#9effcd'
 })
]);

export function clampMichiForm(index){
 const n=Number(index);
 return Number.isFinite(n)?Math.max(0,Math.min(4,Math.trunc(n))):0;
}

// The drawing function is exported separately for isolated geometry/performance QA.
export function drawMichiFieldPortrait(ctx,form,time=0,{reduceMotion=false,width=280,height=238}={}){
 const index=clampMichiForm(form);
 const w=Math.max(80,Number.isFinite(width)?width:280);
 const h=Math.max(80,Number.isFinite(height)?height:238);
 const t=reduceMotion?0:(Number.isFinite(time)?time:0);
 ctx.save();
 ctx.clearRect(0,0,w,h);
 const bg=ctx.createRadialGradient(w*.5,h*.49,0,w*.5,h*.49,w*.65);
 bg.addColorStop(0,'#254e56');bg.addColorStop(.54,'#132f43');bg.addColorStop(1,'#081928');
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // A soft cartographic horizon, never a simulated physical surface.
 ctx.strokeStyle='rgba(162,238,223,.14)';ctx.lineWidth=1;
 for(let j=0;j<3;j++){
  ctx.beginPath();ctx.ellipse(w/2,h*.80,45+j*40,6+j*7,0,0,Math.PI*2);ctx.stroke();
 }
 for(let i=0;i<19;i++){
  const x=14+((i*47)%Math.round(w-28)),y=14+((i*61)%Math.round(h-28));
  const phase=reduceMotion?0:Math.sin(t*.036+i)*.3;
  ctx.globalAlpha=.28+(i%4)*.11+phase*.1;
  ctx.fillStyle=i%3===0?'#fff2c2':i%3===1?'#b0eeff':'#a5ffe6';
  ctx.beginPath();ctx.arc(x,y,i%5===0?1.6:.85,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 const f=index===4?1.08:index===3?1.45:index===2?1.24:index===1?1.18:1.45;
 const originY=index===4?h*.81:index===3?h*.76:index===1?h*.83:h*.83;
 ctx.translate(w*.5,originY);
 ctx.scale(f,f);
 // Production rig: identical anatomy, moves, eyes and spells as the game.
 catArt.draw(ctx,{
   form:index,state:'idle',t,phase:t*.28,atk:0,cast:0,
   castSlot:-1,michiSeed:7,look:{x:0,y:0},reduceMotion
 },R);
 ctx.restore();
}

export function mountMichiFieldManual(page,options={}){
 if(!page?.ownerDocument)return()=>{};
 const document=page.ownerDocument;
 const section=document.createElement('section');
 section.id='michi-field-manual';section.className='michi-field-manual';
 section.setAttribute('aria-label','Atlas vivo de las cinco evoluciones de Michi');
 const heading=document.createElement('div');heading.className='mfm-heading';
 const eyebrow=document.createElement('span');eyebrow.className='fg-eyebrow';
 eyebrow.textContent='BESTIARIO VIVO · CINCO METAMORFOSIS';
 const title=document.createElement('h5');title.textContent='Cinco vidas de leyenda. La misma actitud rebelde.';
 heading.append(eyebrow,title);
 const tabs=document.createElement('div');tabs.className='mfm-forms';
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Elige una forma para verla');
 const buttons=MICHI_FIELD_NOTES.map((note,i)=>{
  const b=document.createElement('button');b.type='button';b.className='mfm-form';
  b.dataset.michiForm=String(i);
  b.textContent=String(i+1).padStart(2,'0');
  b.title=note.subtitle;b.setAttribute('aria-label','Forma '+(i+1)+': '+note.subtitle);
  b.setAttribute('aria-pressed',i===0?'true':'false');
  b.style.setProperty('--mfm-color',note.tone);tabs.append(b);return b;
 });
 const content=document.createElement('div');content.className='mfm-content';
 const stage=document.createElement('div');stage.className='mfm-stage';
 const canvas=document.createElement('canvas');canvas.width=280;canvas.height=238;
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Forma 1: gatito rebelde con pañuelo rojo');
 stage.append(canvas);
 const caption=document.createElement('p');caption.className='mfm-caption';
 caption.textContent='Arte del juego en tiempo real · No es una imagen estática';
 stage.append(caption);
 const copy=document.createElement('div');copy.className='mfm-copy';
 const chapter=document.createElement('span');chapter.className='mfm-chapter';
 const subtitle=document.createElement('h6'),description=document.createElement('p');
 const gesture=document.createElement('p');gesture.className='mfm-gesture';
 const secret=document.createElement('p');secret.className='mfm-secret';
 copy.append(chapter,subtitle,description,gesture,secret);
 content.append(stage,copy);
 section.append(heading,tabs,content);
 const anchor=page.querySelector('.fg-mission');
 if(anchor)anchor.after(section);else page.append(section);
 let selected=0,animation=0,last=-Infinity,dead=false;
 const reduced=()=>options.reduceMotion?.()??!!globalThis.matchMedia?.('(prefers-reduced-motion:reduce)')?.matches;
 const live=()=>!dead&&section.isConnected&&section.closest('#help')?.classList.contains('open')&&!document.hidden;
 const context=canvas.getContext('2d');
 function paint(at=0){
  if(!context)return;
  drawMichiFieldPortrait(context,selected,at,{reduceMotion:reduced(),width:canvas.width,height:canvas.height});
 }
 function frame(now){
  animation=0;
  if(!live())return;
  if(!reduced()&&now-last>=65){last=now;paint(now/16.667);}
  if(!reduced())animation=globalThis.requestAnimationFrame(frame);
 }
 function select(index,focus=false){
  selected=clampMichiForm(index);
  const note=MICHI_FIELD_NOTES[selected],meta=MICHI_BIOLUM_FORMS[selected];
  for(let i=0;i<buttons.length;i++)buttons[i].setAttribute('aria-pressed',String(i===selected));
  section.style.setProperty('--mfm-color',note.tone);
  chapter.textContent=note.title;subtitle.textContent=note.subtitle;
  description.textContent=note.description;
  gesture.textContent=note.gesture;
  secret.textContent='💡 '+note.secret;
  canvas.setAttribute('aria-label',note.subtitle+'; '+note.gesture+'; radio de luz '+meta.radius);
  paint(reduced()?0:120);
  if(focus)buttons[selected]?.focus();
 }
 function click(event){const button=event.target.closest('button[data-michi-form]');if(button&&tabs.contains(button))select(Number(button.dataset.michiForm));}
 function keys(event){
  const button=event.target.closest('button[data-michi-form]');
  if(!button||!tabs.contains(button))return;
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  select(event.key==='Home'?0:event.key==='End'?4:(selected+(event.key==='ArrowRight'?1:-1)+5)%5,true);
 }
 function refresh(){
  if(!live())return;
  if(reduced()){globalThis.cancelAnimationFrame(animation);animation=0;paint(0);}
  else if(!animation)animation=globalThis.requestAnimationFrame(frame);
 }
 tabs.addEventListener('click',click);tabs.addEventListener('keydown',keys);
 const observer=new MutationObserver(refresh);
 observer.observe(section.closest('#help')||section,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',refresh);
 const motion=globalThis.matchMedia?.('(prefers-reduced-motion:reduce)');
 motion?.addEventListener?.('change',refresh);
 select(0);
 refresh();
 return ()=>{
  dead=true;globalThis.cancelAnimationFrame(animation);observer.disconnect();
  tabs.removeEventListener('click',click);tabs.removeEventListener('keydown',keys);
  document.removeEventListener('visibilitychange',refresh);
  motion?.removeEventListener?.('change',refresh);
  section.remove();
 };
}
