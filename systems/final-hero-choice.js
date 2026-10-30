import {ROSTER} from '../characters/roster.js';
import {markAt} from '../characters/signature.js';
import {drawFamilyActor} from './family-actor.js';
import {KEEPSAKES} from './keepsakes.js';

let live=null;
const bounds=new Map();
function portraitBounds(hero){
 if(bounds.has(hero))return bounds.get(hero);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});drawFamilyActor(ctx,hero,256,400,1,73,{form:4},true);
 const data=ctx.getImageData(0,0,512,512).data;let left=512,top=512,right=0,bottom=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(data[(y*512+x)*4+3]>20){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const value={left:left-264,right:right-248,top:top-408,bottom:bottom-392};bounds.set(hero,value);return value;
}
export function closeFinalHeroChoice(g,{cancel=true}={}){
 if(!live||live.game!==g)return false;
 const old=live;live=null;cancelAnimationFrame(old.raf);old.host.remove();g.finalHeroChoiceOpen=false;g.resetInput?.();
 if(cancel)old.request.cancel?.();
 if(document.body.classList.contains('playing'))document.getElementById('game')?.focus({preventScroll:true});
 return true;
}
export function openFinalHeroChoice(g,request){
 if(g.onlineAdventure||g.player?.dead||g.roomId!=='w1-final'||live)return false;
 const heroes=ROSTER.filter(hero=>g.world1Seals?.includes(hero.id));if(!heroes.length)return false;
 const host=document.createElement('section');host.id='final-hero-choice';host.className='final-hero-choice';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','final-choice-title');
 // E can open this dialog on pointerdown. Its later native click may be
 // retargeted to the new confirm button beneath that finger. Only accept a
 // pointer click that began inside this dialog; keyboard/AT clicks stay native.
 const pointerIntent=new Set();
 host.addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(button&&host.contains(button))pointerIntent.add(button);},true);
 host.addEventListener('pointercancel',()=>pointerIntent.clear(),true);
 host.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const pointerClick=event.detail>0||!!event.pointerType,deliberate=pointerIntent.has(button);pointerIntent.delete(button);
  if(pointerClick&&!deliberate){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 const title=request.quimera?'La familia frente a Quimera':KEEPSAKES[request.target]?.guardian||'El guardián del núcleo';
 host.innerHTML='<div class="fr-choice-panel"><p class="fr-choice-eyebrow">EL CORAZÓN DE OHANA</p><h2 id="final-choice-title">¿Quién entra en combate?</h2><p class="fr-choice-target"></p><div class="fr-choice-heroes" role="group" aria-label="Héroes que han recuperado su sello"></div><p class="fr-choice-health">Elige tus habilidades y tu estrategia. Cambiar de héroe conserva tu proporción de vida.</p><p class="fr-choice-status" role="status"></p><footer><button type="button" class="fr-choice-back">Seguir explorando</button><button type="button" class="fr-choice-confirm"></button></footer></div>';
 host.querySelector('.fr-choice-target').textContent=title;
 const grid=host.querySelector('.fr-choice-heroes'),cards=[];
 let selected=heroes.some(h=>h.id===request.selected)?request.selected:heroes[0].id;
 const status=host.querySelector('.fr-choice-status'),confirm=host.querySelector('.fr-choice-confirm');
 for(const def of heroes){
  const card=document.createElement('button'),f=def.forms[4];card.type='button';card.className='fr-hero';card.dataset.hero=def.id;card.style.setProperty('--fr-color',KEEPSAKES[def.id].color);
  card.innerHTML='<canvas width="300" height="220" aria-hidden="true"></canvas><strong></strong><span class="fr-hero-role"></span><span class="fr-hero-stats"></span>';
  card.querySelector('strong').textContent=def.name;card.querySelector('.fr-hero-role').textContent=def.identity?.title||def.evoNames[4];
  card.querySelector('.fr-hero-stats').textContent=`Vida ${f.hp} · Vel. ${f.speed} · H ${markAt(def.id,4).dmg}`;
  card.addEventListener('click',()=>{selected=def.id;sync();});grid.append(card);cards.push({card,hero:def.id,canvas:card.querySelector('canvas')});
 }
 function sync(){
  for(const {card,hero}of cards){card.setAttribute('aria-pressed',String(hero===selected));card.classList.toggle('selected',hero===selected);}
  const def=heroes.find(h=>h.id===selected);confirm.textContent=(request.quimera?'Desafiar a Quimera con ':'Invocar con ')+def.name;
  status.textContent=def.identity?.strength||def.evoNames[4];
 }
 host.querySelector('.fr-choice-back').onclick=()=>closeFinalHeroChoice(g);
 confirm.onclick=()=>{if(request.choose?.(selected)===true)closeFinalHeroChoice(g,{cancel:false});else status.textContent='El núcleo ya no está preparado. Vuelve al suelo de los espejos.';};
 host.addEventListener('keydown',event=>{
  if(event.key==='Tab'){
   const buttons=[...host.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 document.body.append(host);g.finalHeroChoiceOpen=true;g.resetInput?.();
 live={game:g,request,host,raf:0};const owner=live;
 let previous=0;
 function paint(now){
  if(live!==owner)return;
  if(!g.running||g.roomId!=='w1-final'||g.player?.dead){closeFinalHeroChoice(g);return;}
  if(now-previous>=75){
   previous=now;
   for(const {canvas,hero}of cards){
    const c=canvas.getContext('2d'),b=portraitBounds(hero),scale=Math.min(276/(b.right-b.left),194/(b.bottom-b.top));
    c.clearRect(0,0,300,220);c.save();c.translate(150-(b.left+b.right)*scale/2,208-b.bottom*scale);c.scale(scale,scale);
    drawFamilyActor(c,hero,0,0,1,g.reduceMotion?0:now*.06,{form:4},!!g.reduceMotion);c.restore();
   }
  }
  owner.raf=requestAnimationFrame(paint);
 }
 sync();owner.raf=requestAnimationFrame(paint);cards.find(({hero})=>hero===selected)?.card.focus({preventScroll:true});
 return true;
}
