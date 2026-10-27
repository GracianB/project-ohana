// V604 · A co-op consent card, not a network-interrupting full-screen modal.
export function travelDialogView(snapshot,localId,now=Date.now()){
 const vote=snapshot?.mode==='adventure'?snapshot.travel:null;
 if(!vote||vote.status!=='pending'||now>=vote.createdAt+25000||!vote.players?.includes(localId))return null;
 const waiting=vote.accepted.includes(localId);
 const players=(snapshot.players||[]).map(p=>({
  name:p.name||'Compañero',hero:p.characterId||'Héroe',
  form:Math.max(1,Math.min(5,(Number(p.evolution)||0)+1)),
  health:Number.isFinite(p.health)?Math.max(0,Math.round(p.health)):null,
  xp:Math.max(0,Math.round(Number(p.experience)||0))
 }));
 return {id:vote.id,from:vote.from,to:vote.to,waiting,
  leftSeconds:Math.max(0,Math.ceil((vote.createdAt+25000-now)/1000)),players};
}
let panel=null;
export function renderTravelDialog(snapshot,localId,onAccept,onReject,now=Date.now()){
 if(typeof document==='undefined')return;
 const view=travelDialogView(snapshot,localId,now);
 if(!view){if(panel){panel.hidden=true;document.body.classList.remove('coop-travel-pending');}return;}
 if(!panel){
  panel=document.createElement('section');panel.id='ohana-coop-travel-v604';
  panel.className='ohana-travel-v604';panel.setAttribute('role','region');
  panel.setAttribute('aria-label','Confirmar cambio de sala');
  panel.innerHTML='<div class="travel-head"><span>OHANA · AVENTURA CONJUNTA</span><strong></strong></div><p class="travel-copy"></p><div class="travel-stats"></div><div class="travel-actions"><button type="button" class="travel-yes">Aceptar y avanzar</button><button type="button" class="travel-no">Cancelar</button></div><p class="travel-countdown" aria-live="polite"></p>';
  document.body.append(panel);
 }
 panel.hidden=false;document.body.classList.add('coop-travel-pending');
 panel.querySelector('.travel-head strong').textContent=view.to.replace('w1-','').toUpperCase();
 panel.querySelector('.travel-copy').textContent=view.waiting?'Has solicitado avanzar. Esperando a tu compañero.':'Tu compañero quiere cruzar a la siguiente sala. ¿Avanzamos juntos?';
 const stats=panel.querySelector('.travel-stats');stats.replaceChildren();
 for(const p of view.players){const badge=document.createElement('span');badge.textContent=p.name+' · '+p.hero+' · forma '+p.form+'/5 · '+p.xp+' XP'+(p.health==null?'':' · '+p.health+' PV');stats.append(badge);}
 panel.querySelector('.travel-countdown').textContent='La propuesta caduca en '+view.leftSeconds+' segundos.';
 const yes=panel.querySelector('.travel-yes');yes.hidden=view.waiting;yes.onclick=()=>onAccept?.(view.id);
 const no=panel.querySelector('.travel-no');no.textContent=view.waiting?'Retirar propuesta':'Permanecer aquí';no.onclick=()=>onReject?.(view.id);
}
