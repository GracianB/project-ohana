import{ROSTER}from'../characters/roster.js';import{paintFit}from'../characters/look.js';import{drawCharacter}from'../characters/draw.js';
import{drawCampaignCreature}from'../systems/campaign-creature-art.js';import{drawChapterBossV2}from'../systems/chapter-boss-art-v2.js';import{drawGauntletProjectile,drawGauntletWorld}from'../systems/final-gauntlet.js';import{drawLivingRealm}from'../worlds/living-realms.js';import{drawOhanaGarden}from'../worlds/ohana-garden.js';import{drawTerrain}from'../worlds/terrain.js';import{KEEPSAKES}from'../systems/keepsakes.js';
import{WORLD1_ARENA,WORLD1_FLOOR}from'../systems/world1-rooms.js';
// V634 Versus client. The protocol is unchanged (same actions, same payloads);
// only how often controls are sent and how snapshots are drawn changed:
//  · held directions keep a second "move" in flight so the server never sees a
//    stale (>300 ms) input on slow links, which used to make heroes stutter;
//  · combat actions stay strictly serialized and are never dropped;
//  · actors, foes and shots are extrapolated from the last snapshot and eased,
//    and your own hero is predicted from your keys, so motion is 60 fps.
const canvas=document.querySelector('#arena'),c=canvas.getContext('2d',{alpha:false}),$=s=>document.querySelector(s),keys=new Set(),pending=[];
const LEFT=WORLD1_ARENA.left+550,RIGHT=WORLD1_ARENA.right-550,FLOOR=WORLD1_FLOOR,STEP=1000/60;
const MOVE_INTERVAL=120,IDLE_GAP=80,MAX_MOVES_IN_FLIGHT=1;
const reduceMQ=matchMedia('(prefers-reduced-motion: reduce)'),coarseMQ=matchMedia('(pointer: coarse)');
let session;try{session=JSON.parse(sessionStorage.getItem('ohana-coop-session')||'null');}catch{}
let snapshot=null,snapshotAt=0,sequence=0,stopped=false,lastEvent=0,lastEventAt=0,retries=0,frame=0,W=0,H=0,cam={x:8000,y:450};const models=new Map();
let inflight=0,actionInflight=false,epoch=0,lastSendAt=0,lastReplyAt=0,holdUntil=0,rejoining=false,netTimer=0;
const view=new Map(),stats={meX:0,renderHz:0,drawMs:0,dpr:1,netHz:0,inflight:0};window.__ohanaVersusStats=stats;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const axisX=()=>(keys.has('d')?1:0)-(keys.has('a')?1:0),axisY=()=>(keys.has('s')?1:0)-(keys.has('w')?1:0);
const moving=()=>keys.has('a')||keys.has('d')||keys.has('w')||keys.has('s');
const touchKeys={h:'H',j:'J',k:'K',l:'L',u:'U',i:'I',p:'P',shift:'D'};
function describe(s){const v=s.versus;if(!v)return;const me=v.actors.find(a=>a.id===session.identity.playerId);$('#arena-name').textContent='VERSUS · '+ROSTER.find(h=>h.id===v.arenaId.slice(3)).name;
 if(!$('#fighters').children.length)for(const a of v.actors){const card=document.createElement('article');card.className='fighter'+(a.id===me?.id?' is-you':'');card.dataset.id=a.id;card.innerHTML='<span class="score"></span><strong></strong><small class="form"></small><div class="life"><i></i></div><small class="stats"></small><div class="xp"><i></i></div>';$('#fighters').append(card);}
 for(const a of v.actors){const card=Array.from($('#fighters').children).find(n=>n.dataset.id===a.id),r=ROSTER.find(h=>h.id===a.characterId),f=v.fighters[a.id];card.querySelector('strong').textContent=r.name+(a.id===me?.id?' · Tú':'');card.querySelector('.score').textContent=f.kills+'/3';card.querySelector('.form').textContent=r.evoNames[a.evo];card.querySelector('.life i').style.width=(a.hp/a.maxHp*100)+'%';card.classList.toggle('low',a.hp>0&&a.hp/a.maxHp<.3);card.querySelector('.stats').textContent=`${Math.ceil(a.hp)}/${a.maxHp} PV · ${a.xp} XP · P ${Math.floor(a.charge)}%`;const thresholds=[0,85,190,320,480],from=thresholds[a.evo],to=thresholds[a.evo+1];card.querySelector('.xp i').style.width=(to?(a.xp-from)/(to-from)*100:100)+'%';}
 const b=v.boss,mind=b?.[KEEPSAKES[v.arenaId.slice(3)].key];$('#guardian').textContent=b?.hp>0?`${KEEPSAKES[v.arenaId.slice(3)].guardian} · +180 XP · ${Math.ceil(b.hp)} PV · ${mind?.phase==='rest'?'APERTURA: ATACA':mind?.technique?.name||'OBSERVA SU AVISO'}`:'El guardián regresará. Enemigos +35 XP · rival +150 XP';
 const e=v.events.at(-1);if(e&&e.id>lastEvent){lastEvent=e.id;lastEventAt=performance.now();$('#announcement').textContent=e.type==='action'?'':e.text;}
 // Cooldowns on the touch buttons (server ticks, purely visual).
 if(me)for(const btn of touchButtons){const key=touchKeys[btn.dataset.key];if(!key)continue;const left=Math.max(0,(me.cds?.[key]||0)-v.tick);btn.classList.toggle('cooling',left>0);btn.style.setProperty('--cd',left>0?String(Math.min(1,left/240)):'0');}
 if(v.phase==='complete'){const first=!stopped;stopped=true;releaseControls();$('#results').hidden=false;$('#results h1').textContent=v.winner===me.id?'¡Has ganado!':'Fin de la partida';$('#results p').textContent=v.actors.map(a=>ROSTER.find(h=>h.id===a.characterId).name+': '+v.fighters[a.id].kills+' eliminaciones').join(' · ');if(first)$('#return-lobby').focus({preventScroll:true});}
}
async function api(body){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),5000);try{const response=await fetch('/.netlify/functions/game',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',signal:ctl.signal,body:JSON.stringify({roomId:session.roomId,identity:session.identity,...body})});const d=await response.json();if(!response.ok){const e=Error(d.error?.message||'Conexión no disponible');e.code=d.error?.code;throw e;}return d.data;}finally{clearTimeout(t);}}
function accept(s){if(!snapshot||s.revision>=snapshot.revision){snapshot=s;snapshotAt=performance.now();sequence=Math.max(sequence,...s.players.filter(p=>p.isYou).map(p=>p.lastSequence));describe(s);}}
const replies=[];
async function send(body,isAction){
 const myEpoch=epoch;inflight++;if(isAction)actionInflight=true;lastSendAt=performance.now();
 try{const s=await api(body);if(myEpoch!==epoch)return;accept(s);retries=0;replies.push(performance.now());$('#connection').textContent=s.players.some(p=>!p.connected)?'Esperando al rival':'Conectado';}
 catch(e){
  if(myEpoch!==epoch)return;
  // A pipelined move overtaken by a newer one is harmless: the newer input won.
  if(e.code==='DUPLICATE_ACTION'&&body.action==='move')return;
  epoch++;keys.clear();pending.length=0;retries++;$('#connection').textContent='Reconectando…';holdUntil=performance.now()+Math.min(2000,80*(1+retries));
  if(['DISCONNECTED','INVALID_SESSION'].includes(e.code)&&!rejoining){rejoining=true;try{const resumed=await api({action:'join'});session.identity=resumed.identity;sessionStorage.setItem('ohana-coop-session',JSON.stringify(session));snapshot=resumed;snapshotAt=performance.now();}catch{}finally{rejoining=false;}}
  if(e.code==='STALE_SESSION'){stopped=true;$('#connection').textContent='Esta partida se abrió en otra pestaña. Vuelve al vestíbulo.';}
 }
 finally{inflight--;if(isAction)actionInflight=false;lastReplyAt=performance.now();pump();}
}
function controls(){return{x:axisX(),y:axisY(),jump:keys.has('w')};}
// Network scheduler: decides whether to send now; called on input and replies.
function pump(){
 clearTimeout(netTimer);if(stopped||!session)return;
 const now=performance.now();let wait=20;
 if(rejoining||now<holdUntil||actionInflight){wait=Math.max(20,holdUntil-now);}
 else if(pending.length){if(!inflight){const action=pending.shift(),seq=++sequence;void send({...action,...controls(),sequence:seq,actionId:session.identity.playerId+':versus:'+seq},true);}}
 else if(snapshot?.phase==='playing'){
  const held=moving();
  const due=!inflight?now-lastReplyAt>=(held?0:IDLE_GAP):held&&inflight<MAX_MOVES_IN_FLIGHT&&now-lastSendAt>=MOVE_INTERVAL;
  if(due){const seq=++sequence;void send({action:'move',sequence:seq,actionId:session.identity.playerId+':versus:'+seq,...controls()},false);}
 }
 else if(!inflight&&now-lastReplyAt>=IDLE_GAP)void send({action:'poll'},false);
 if(!stopped)netTimer=setTimeout(pump,wait);
}
function action(key){const map={h:{action:'attack'},j:{action:'ability',slot:0},k:{action:'ability',slot:1},l:{action:'ability',slot:2},u:{action:'ability',slot:3},i:{action:'ability',slot:4},p:{action:'ability',slot:5},shift:{action:'dodge'}};if(map[key]&&pending.length<6){pending.push(map[key]);pump();}}
const ARROWS={arrowleft:'a',arrowright:'d',arrowup:'w',arrowdown:'s',' ':'w'};
const keyOf=e=>{const k=e.key.toLowerCase();return ARROWS[k]||k;};
addEventListener('keydown',e=>{const k=keyOf(e);if(['w','a','s','d','h','j','k','l','u','i','p','shift'].includes(k)){e.preventDefault();const was=keys.has(k);keys.add(k);if(!e.repeat)action(k);if(!was)pump();}});
addEventListener('keyup',e=>{const k=keyOf(e);if(keys.delete(k))pump();});
function releaseControls(){keys.clear();pending.length=0;}
addEventListener('blur',releaseControls);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseControls();});
const touchButtons=[...document.querySelectorAll('[data-key]')];
for(const btn of touchButtons){const k=btn.dataset.key;btn.onpointerdown=e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);keys.add(k);btn.classList.add('held');action(k);pump();try{navigator.vibrate?.(8);}catch{}};btn.onpointerup=btn.onpointercancel=btn.onlostpointercapture=()=>{btn.classList.remove('held');if(keys.delete(k))pump();};btn.oncontextmenu=e=>e.preventDefault();}
function leaveMatch(){stopped=true;keys.clear();pending.length=0;if(session)navigator.sendBeacon('/.netlify/functions/game',new Blob([JSON.stringify({action:'disconnect',roomId:session.roomId,identity:session.identity})],{type:'application/json'}));sessionStorage.removeItem('ohana-coop-session');}
$('#leave').onclick=leaveMatch;$('#return-lobby').onclick=leaveMatch;
// ---- Smooth presentation -------------------------------------------------
function formOf(a){return ROSTER.find(h=>h.id===a.characterId)?.forms?.[a.evo]||{};}
// Where an entity should be now: last server state advanced by its velocity
// (and, for your own hero, by the keys you are holding right now).
function projected(a,isMe,ticks){
 let vx=a.vx||0,vy=a.vy||0,x=a.x,y=a.y;
 if(isMe&&a.hp>0&&!(a.stun>0)&&!(a.dash>0)&&!(a.flight>0)){const f=formOf(a);vx=axisX()*(f.speed||4)*(a.slow>0?.5:1);}
 const n=Math.min(ticks,isMe?14:9);
 x+=vx*n;
 if(!a.grounded&&!(a.flight>0)){y+=vy*n+.25*n*n;}else if(a.flight>0)y+=vy*n;
 if(a.h&&y+a.h>FLOOR)y=FLOOR-a.h;
 return{x:a.w?clamp(x,LEFT,RIGHT-a.w):x,y};
}
function eased(id,target,dt,tau){let v=view.get(id);if(!v||Math.abs(v.x-target.x)>260||Math.abs(v.y-target.y)>260){v={x:target.x,y:target.y};view.set(id,v);return v;}const k=1-Math.exp(-dt/tau);v.x+=(target.x-v.x)*k;v.y+=(target.y-v.y)*k;return v;}
function actor(a,tick){const r=ROSTER.find(h=>h.id===a.characterId);let p=models.get(a.id);if(!p){p={...r,id:r.id};models.set(a.id,p);}Object.assign(p,r.forms[a.evo],a,{id:r.id,health:a.hp,maxHealth:a.maxHp,invuln:a.invuln,melee:a.cast?.key==='H'&&tick-a.cast.tick<15?15:0});
 if(a._isMe&&a.hp>0&&!(a.stun>0)){const ix=axisX();if(ix){p.vx=ix*(r.forms[a.evo]?.speed||4);p.facing=ix;}}
 p._cast=a.cast?{slot:['J','K','L','U','I','P'].indexOf(a.cast.key),t:frame-(tick-a.cast.tick)}:null;p._poseOverride=a.hp<=0?'hurt':a.flash?'hurt':a.cast&&tick-a.cast.tick<20?'cast':a.grounded?(Math.abs(p.vx)>1?'run':'idle'):(a.vy<0?'jump':'fall');p._abilMove=a.dash>0&&r.id==='stitcho'?'roll':a.flight?'float':null;paintFit(p);drawCharacter(c,p,cam,frame,{reduceMotion:reduceMQ.matches});}
// Adaptive resolution keeps phones near 60 fps instead of dropping frames.
let dpr=Math.min(devicePixelRatio||1,1.5),slowFrames=0,fastFrames=0,lastFrameAt=0,frameCount=0,frameWindowAt=performance.now(),drawEMA=0;
function adapt(dt){if(dt>0&&dt<200){if(dt>21){slowFrames++;fastFrames=0;}else if(dt<18){fastFrames++;if(slowFrames>0)slowFrames--;}}
 const floor=coarseMQ.matches?.75:1,ceil=Math.min(devicePixelRatio||1,1.5);
 if(slowFrames>40&&dpr>floor){dpr=Math.max(floor,+(dpr-.25).toFixed(2));slowFrames=0;}
 if(fastFrames>360&&dpr<ceil){dpr=Math.min(ceil,+(dpr+.25).toFixed(2));fastFrames=0;}}
function draw(now){requestAnimationFrame(draw);const dt=lastFrameAt?now-lastFrameAt:16.7;lastFrameAt=now;frameCount++;if(now-frameWindowAt>=1000){stats.renderHz=Math.round(frameCount*1000/(now-frameWindowAt));frameCount=0;frameWindowAt=now;const cut=now-1000;while(replies.length&&replies[0]<cut)replies.shift();stats.netHz=replies.length;}
 adapt(dt);frame=Math.floor(now/STEP);const t0=performance.now();
 const rect=canvas.getBoundingClientRect();W=rect.width;H=rect.height;if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}stats.dpr=dpr;c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#12293e';c.fillRect(0,0,W,H);const v=snapshot?.versus;if(!v)return;
 const reduce=reduceMQ.matches,ticks=Math.max(0,(now-snapshotAt)/STEP),tick=v.tick+Math.floor(Math.min(ticks,14)),myId=session.identity.playerId;
 const me=v.actors.find(a=>a.id===myId);
 const shown=v.actors.map(a=>{const isMe=a.id===myId,pos=eased(a.id,projected(a,isMe,ticks),dt,isMe?45:70);return{...a,x:pos.x,y:pos.y,_isMe:isMe};});
 const meShown=shown.find(a=>a._isMe);stats.meX=meShown?meShown.x:0;
 const target=meShown?.hp>0?meShown:shown.find(a=>a.hp>0)||meShown;
 const want=Math.max(LEFT,Math.min(RIGHT-W,target.x+target.w/2-W/2));cam.x+=(want-cam.x)*(1-Math.exp(-dt/(reduce?40:110)));cam.y=FLOOR-H*.76;
 if(v.arenaId==='w1-kilo')drawOhanaGarden(c,cam,reduce?0:frame,W,H);else drawLivingRealm(c,v.arenaId.slice(3),cam,W,H,frame,{reduceMotion:reduce});drawTerrain(c,[{x:LEFT,y:FLOOR,w:RIGHT-LEFT,h:180}],{id:'grove',chapterHero:v.arenaId.slice(3),groundTop:'#d3ceab',ground:'#4c5960'},cam,frame,{width:W,height:H});
 v.foes.forEach((e,i)=>{if(e.hp<=0)return;const pos=eased('foe:'+(e.id??i),projected(e,false,ticks),dt,70),f={...e,x:pos.x,y:pos.y};drawCampaignCreature(c,f,cam,frame);c.fillStyle='#99d9b5';c.fillRect(f.x-cam.x,f.y-cam.y-12,f.w*f.hp/f.max,4);});
 if(v.boss?.hp>0){drawChapterBossV2(c,v.boss,cam,frame);drawGauntletWorld(c,{finalGauntlet:{phase:'fight',hero:v.arenaId.slice(3),guardian:v.boss,object:null,found:[]}},cam,frame);}
 for(const a of shown){c.save();if(!a.hp)c.globalAlpha=.3;actor(a,tick);c.restore();const dx=a.x-cam.x;
  if(a.hp>0&&dx>-a.w&&dx<W){// Ring under your hero so you never lose track of yourself.
   c.save();c.globalAlpha=.55;c.strokeStyle=a._isMe?'#fcdf97':'#efac9e';c.lineWidth=2;c.beginPath();c.ellipse(dx+a.w/2,FLOOR-cam.y+2,Math.max(18,a.w*.62),6,0,0,Math.PI*2);c.stroke();c.restore();}
  if(dx<0||dx>W){c.fillStyle=a._isMe?'#fcdf97':'#efac9e';c.font='700 15px Outfit';c.textAlign=dx<0?'left':'right';c.fillText((dx<0?'← ':'')+ROSTER.find(r=>r.id===a.characterId).name+(dx>W?' →':''),dx<0?15:W-15,H*.5);}}
 for(const a of shown)if(a.companion?.life>0&&a.hp>0){const f=ROSTER.find(r=>r.id===a.companion.id).forms[Math.min(3,a.evo)];actor({...a,_isMe:false,id:a.id+'-companion',characterId:a.companion.id,evo:Math.min(3,a.evo),x:a.x-a.facing*75,y:FLOOR-f.h,w:f.w,h:f.h,grounded:true,flight:0,dash:0,vx:0,vy:0,cast:null,flash:0,invuln:0},tick);}
 const n=Math.min(ticks,9);for(const p of v.shots)drawGauntletProjectile(c,{...p,x:p.x+(p.vx||0)*n,y:p.y+(p.vy||0)*n,gauntlet:p.gauntlet||'orb',gauntletHero:p.hero},cam,frame);
 if(performance.now()-lastEventAt>2600&&$('#announcement').textContent)$('#announcement').textContent='';
 const cost=performance.now()-t0;drawEMA=drawEMA?drawEMA*.9+cost*.1:cost;stats.drawMs=+drawEMA.toFixed(2);stats.inflight=inflight;
 document.body.classList.toggle('down',!!me&&me.hp<=0);
}
if(!(['localhost','127.0.0.1'].includes(location.hostname)||/^(?:[a-z0-9-]+--)?project-ohana-multiplayer\.netlify\.app$/i.test(location.hostname))){$('#connection').textContent='Multijugador en preparación. Puedes jugar la campaña individual.';}else if(!session){$('#connection').textContent='Entra en una sala desde el vestíbulo.';}else{pump();}requestAnimationFrame(draw);
