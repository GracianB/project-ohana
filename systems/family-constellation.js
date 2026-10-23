import {FAMILY_STARS,constellationProgress} from './family-constellation-story.js';
import {readFamilyMemory,rememberFamilyLight} from './family-memory.js';
import {makeDummy,drawDummy,baseHeight,reducedMotion} from './cinema-kit.js';

export function installFamilyConstellation(){
 const layer=document.getElementById('family-constellation');if(!layer)return;
 const menu=document.getElementById('btn-family-memory');
 let memory=null,selected=null,frame=0,last=0,actor=null,opener=null;
 const portrait=layer.querySelector('canvas'),ctx=portrait.getContext('2d');
 const nav=layer.querySelector('.constellation-stars');
 const status=layer.querySelector('.constellation-progress');
 const close=()=>{layer.classList.remove('open');layer.setAttribute('aria-hidden','true');cancelAnimationFrame(frame);opener?.focus({preventScroll:true});};
 function refresh(){memory=readFamilyMemory()||memory;if(menu)menu.hidden=!memory;}
 function draw(now=0){
  if(!layer.classList.contains('open'))return;
  const gentle=reducedMotion();
  if(!last||now-last>42){
   last=now;const W=portrait.width,H=portrait.height;ctx.clearRect(0,0,W,H);
   const glow=ctx.createRadialGradient(W/2,H/2,2,W/2,H/2,W*.48);glow.addColorStop(0,selected.color+'55');glow.addColorStop(1,selected.color+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
   actor.grounded=true;actor.vx=0;actor.vy=0;actor._poseOverride='idle';
   drawDummy(ctx,actor,W/2,H*.83,H*.62/baseHeight(selected.id,4),gentle?60:now*.06);
  }
  if(!gentle)frame=requestAnimationFrame(draw);
 }
 function choose(star,remember=true){
  selected=star;actor=makeDummy(star.id,4,star.color);layer.style.setProperty('--star-color',star.color);
  if(remember)memory=rememberFamilyLight(star.id,memory);
  layer.querySelector('.constellation-name').textContent=star.name;
  layer.querySelector('.constellation-gift').textContent=star.gift;
  layer.querySelector('.constellation-voice').textContent=star.line;
  for(const b of nav.querySelectorAll('button')){b.setAttribute('aria-pressed',String(b.dataset.hero===star.id));b.dataset.lit=String(memory.lights.includes(b.dataset.hero));}
  const progress=constellationProgress(memory.lights);status.textContent=`${progress.count} / 10 voces recuperadas`;
  layer.classList.toggle('all-lit',progress.complete);
  layer.querySelector('.constellation-last-title').textContent=progress.title;
  layer.querySelector('.constellation-last-copy').textContent=progress.complete?'No eras una voz fuera de esta historia. Fuiste quien las reunió. Este lugar también es tuyo.':'Escucha a cada héroe para reunir su luz. Puedes irte y volver cuando quieras.';
  cancelAnimationFrame(frame);last=0;draw();
 }
 for(const [i,star] of FAMILY_STARS.entries()){
  const b=document.createElement('button');b.type='button';b.dataset.hero=star.id;
  b.style.setProperty('--x',String(50+38*Math.cos(-Math.PI/2+i*Math.PI/5))+'%');
  b.style.setProperty('--y',String(50+38*Math.sin(-Math.PI/2+i*Math.PI/5))+'%');
  b.style.setProperty('--light',star.color);b.textContent=star.name;b.setAttribute('aria-label','Escuchar a '+star.name);
  b.onclick=()=>choose(star);nav.appendChild(b);
 }
 function open(button){
  refresh();if(!memory)return;opener=button;
  layer.classList.add('open');layer.setAttribute('aria-hidden','false');
  dispatchEvent(new CustomEvent('ohana-constellation-open'));
  choose(FAMILY_STARS.find(s=>s.id===memory.hero)||FAMILY_STARS[0],false);
  layer.querySelector('.constellation-close').focus({preventScroll:true});
 }
 layer.querySelector('.constellation-close').onclick=close;
 layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
 document.addEventListener('click',e=>{const button=e.target.closest?.('[data-open-constellation]');if(button)open(button);});
 addEventListener('ohana-family-memory',e=>{memory=e.detail||memory;refresh();});
 addEventListener('storage',refresh);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else if(layer.classList.contains('open')){last=0;draw();}});
 refresh();
}
