import {FAMILY_STARS,constellationProgress,reunionDedication} from './family-constellation-story.js';
import {readFamilyMemory,rememberFamilyLight,migrateFamilyMemory} from './family-memory.js';
import {makeDummy,drawDummy,baseHeight,reducedMotion} from './cinema-kit.js';

export function installFamilyConstellation(){
 const layer=document.getElementById('family-constellation');if(!layer)return;
 const menu=document.getElementById('btn-family-memory');
 let memory=null,selected=null,frame=0,last=0,actor=null,opener=null,previousOverflow="";
 const portrait=layer.querySelector('canvas'),ctx=portrait.getContext('2d');
 const nav=layer.querySelector('.constellation-stars');
 const reunion=layer.querySelector(".constellation-reunion"),reunionButton=layer.querySelector(".constellation-reunion-open");
 const table=reunion.querySelector("canvas"),tableCtx=table.getContext("2d");
 const family=FAMILY_STARS.map(s=>makeDummy(s.id,4,s.color));
 const status=layer.querySelector('.constellation-progress');
 const close=()=>{layer.classList.remove('open');layer.setAttribute('aria-hidden','true');cancelAnimationFrame(frame);document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});};
 function refresh(){memory=readFamilyMemory()||memory;if(menu)menu.hidden=!memory;}
 function draw(now=0){
  if(!layer.classList.contains('open'))return;
  const gentle=reducedMotion();
  if(!last||now-last>42){
   last=now;if(!reunion.hidden)drawReunion(gentle?1000:now);const W=portrait.width,H=portrait.height;ctx.clearRect(0,0,W,H);
   const glow=ctx.createRadialGradient(W/2,H/2,2,W/2,H/2,W*.48);glow.addColorStop(0,selected.color+'55');glow.addColorStop(1,selected.color+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
   actor.grounded=true;actor.vx=0;actor.vy=0;actor._poseOverride='idle';
   drawDummy(ctx,actor,W/2,H*.83,H*.62/baseHeight(selected.id,4),gentle?60:now*.06);
  }
  if(!gentle)frame=requestAnimationFrame(draw);
 }
 function drawReunion(now){
  const c=tableCtx,W=table.width,H=table.height;c.clearRect(0,0,W,H);
  const halo=c.createRadialGradient(W/2,H*.5,10,W/2,H*.5,W*.55);
  halo.addColorStop(0,'#e6ad4938');halo.addColorStop(1,'#e6ad4900');c.fillStyle=halo;c.fillRect(0,0,W,H);
  // Paint back to front, retaining each hero's canonical engine art.
  const seats=FAMILY_STARS.map((s,i)=>{const a=Math.PI+i*Math.PI/9;return {s,i,x:W/2+W*.4*Math.cos(a),y:H*.49+H*.25*Math.sin(a)};}).sort((a,b)=>a.y-b.y);
  for(const {s,i,x,y} of seats){
   const a=family[i];a.grounded=true;a.vx=0;a.vy=0;a._poseOverride='idle';
   drawDummy(c,a,x,y,H*.21/baseHeight(s.id,4),now*.06);
   c.fillStyle=s.color;c.font='16px Outfit, sans-serif';c.textAlign='center';c.fillText(s.name,x,y+25);
  }
  c.fillStyle='#392c31';c.beginPath();c.ellipse(W/2,H*.68,W*.34,H*.13,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#d6ad70';c.lineWidth=2;c.stroke();
  for(let i=0;i<11;i++){
   const a=-Math.PI+i*Math.PI/9,x=i===10?W/2:W/2+W*.29*Math.cos(a),y=i===10?H*.79:H*.73+H*.07*Math.sin(a);
   c.shadowColor=i===10?'#fff6d3':FAMILY_STARS[i].color;c.shadowBlur=18;
   c.fillStyle=i===10?'#fff6d3':FAMILY_STARS[i].color;c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();
  }
  c.shadowBlur=0;c.fillStyle='#fff2c7';c.textAlign='center';c.font='26px Outfit, sans-serif';c.fillText('TU LUGAR',W/2,H*.88);
  c.font='18px Outfit, sans-serif';c.fillStyle='#b7c6db';c.fillText('No tienes que ganártelo otra vez.',W/2,H*.94);
 }
 reunionButton.onclick=()=>{
  if(!constellationProgress(memory?.lights).complete)return;
  const dedication=reunionDedication(memory.hero);
  reunion.hidden=false;reunion.style.setProperty('--reunion-color',dedication.color);
  reunion.querySelector('.reunion-hero').textContent=dedication.title;
  reunion.querySelector('.reunion-letter').textContent=dedication.line;
  reunion.querySelector('.reunion-promise').textContent=dedication.promise;
  reunionButton.textContent='Volver a nuestra mesa';
  cancelAnimationFrame(frame);last=0;draw();
  reunion.querySelector('h3').focus({preventScroll:true});
  reunion.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});
 };
 function choose(star,remember=true){
  selected=star;actor=makeDummy(star.id,4,star.color);layer.style.setProperty('--star-color',star.color);
  if(remember)memory=rememberFamilyLight(star.id,memory);
  layer.querySelector('.constellation-name').textContent=star.name;
  layer.querySelector('.constellation-gift').textContent=star.gift;
  layer.querySelector('.constellation-voice').textContent=star.line;
  for(const b of nav.querySelectorAll('button')){b.setAttribute('aria-pressed',String(b.dataset.constellationHero===star.id));b.dataset.lit=String(memory.lights.includes(b.dataset.constellationHero));}
  const progress=constellationProgress(memory.lights);status.textContent=`${progress.count} / 10 voces recuperadas`;
  layer.classList.toggle('all-lit',progress.complete);reunionButton.hidden=!progress.complete;
  layer.querySelector('.constellation-last-title').textContent=progress.title;
  layer.querySelector('.constellation-last-copy').textContent=progress.complete?'No eras una voz fuera de esta historia. Fuiste quien las reunió. Este lugar también es tuyo.':'Escucha a cada héroe para reunir su luz. Puedes irte y volver cuando quieras.';
  cancelAnimationFrame(frame);last=0;draw();
 }
 for(const [i,star] of FAMILY_STARS.entries()){
  const b=document.createElement('button');b.type='button';b.dataset.constellationHero=star.id;
  b.style.setProperty('--x',String(50+38*Math.cos(-Math.PI/2+i*Math.PI/5))+'%');
  b.style.setProperty('--y',String(50+38*Math.sin(-Math.PI/2+i*Math.PI/5))+'%');
  b.style.setProperty('--light',star.color);b.textContent=star.name;b.setAttribute('aria-label','Escuchar a '+star.name);
  b.onclick=()=>choose(star);nav.appendChild(b);
 }
 function open(button){
  refresh();if(!memory)return;opener=button;reunion.hidden=true;
  previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
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
 memory=migrateFamilyMemory()||memory;refresh();
}
