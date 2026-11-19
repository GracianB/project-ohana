// Saved, explicit interactions. No XP grants and no replacement of the chosen form.
const secrets=g=>g.secrets?.['w1-cat']||[];
const key=id=>'w1-cat-garden-'+id;
export const gardenHas=(g,id)=>secrets(g).includes(key(id));
const garden=g=>g.roomDef?.michiSanctuary?.garden;
function remember(g,id){g.secrets||={};const list=g.secrets['w1-cat']||=[];if(!list.includes(key(id)))list.push(key(id));g.save?.();}
export function nearestGardenInteraction(g){
 const r=garden(g),p=g.player;if(!r||!p||p.dead)return null;
 return [...r.mechanisms,...r.moments.map(q=>({...q,kind:'moment',label:q.title,action:'E · escuchar este recuerdo'}))]
  .filter(q=>q.kind!=='ocean'||(!g.onlineAdventure&&gardenHas(g,'tide')))
  .filter(q=>Math.abs(p.x+p.w/2-q.x)<77&&Math.abs(p.y+p.h-q.floor)<85)
  .sort((a,b)=>Math.abs(p.x+p.w/2-a.x)-Math.abs(p.x+p.w/2-b.x))[0]||null;
}
export function gardenInteractionPrompt(g){const q=nearestGardenInteraction(g);return q?q.action+' · '+q.label:null;}
function syncBridge(g){
 const r=garden(g);if(!r||!gardenHas(g,'rain')||!Array.isArray(g.platforms))return;
 if(!g.platforms.some(p=>p.michiGardenBridge))g.platforms.push({...r.bridge,michiGardenBridge:true});
}
export function interactMichiGarden(g){
 const q=nearestGardenInteraction(g);if(!q)return false;
 if(q.kind==='ocean')return g.loadRoom?.('w1-nacar','ocean-link')===true;
 if(g._michiGardenUse>0||q.kind==='bell'&&g._michiGardenHush>0)return true;
 g._michiGardenUse=35;
 if(q.kind==='moment'){
  remember(g,q.id);g._michiGardenMoment={id:q.id,title:q.title,text:q.text,age:0};
 }else if(q.kind==='bridge'){
  remember(g,'rain');syncBridge(g);
  g._michiGardenMoment={id:'rain',title:'EL JARDÍN TE ESCUCHA',text:'El agua encuentra las raíces. El camino que cuidas permanece abierto, también cuando regreses.',age:0};
 }else if(q.kind==='bell'){
  for(const e of g.enemies||[])if(e.hp>0&&!e._astralCat&&e.roomPersona?.michiSanctuary&&Math.hypot(e.x-q.x,e.y-q.floor)<600)e.stun=Math.max(e.stun||0,180);
  g._michiGardenHush=180;remember(g,'hush');
 }else if(q.kind==='wind'){remember(g,'wind');}
 else if(q.kind==='chime'){const pattern=g.roomDef.michiSanctuary.adventure.chimes,step=g._michiChime||0,correct=q.note===pattern[step];g._michiChime=correct?step+1:0;const complete=g._michiChime>=3;if(complete){remember(g,'hollow');g._michiChime=0;}g._michiGardenMoment={title:complete?'EL ESCONDITE RESPONDE':correct?'CASCABEL '+g._michiChime+'/3':'ESCUCHA EL ORDEN',text:complete?'El espejo de las raíces reconoce la canción.':correct?'Una nota encaja. Busca la siguiente.':'Estrella, luna, hoja. Si te equivocas, puedes empezar sin perder nada.',age:0};}
 else if(q.kind==='guard'){if(!(g._michiLampCooldown>0)){g._michiLampGuard=180;g._michiLampCooldown=360;g._michiGardenMoment={title:'FAROL DE REFUGIO',text:'Un golpe queda protegido durante tres segundos. La luz necesita seis segundos para volver.',age:0};}}

 else if(q.kind==='rescue'){remember(g,'tide');g._michiGardenMoment={title:'NÁCAR · LA AMIGA DE LA MAREA',text:'Una medusa que lleva estrellas de mar a la batalla. Si quieres acompañarme, la corriente te espera a la derecha.',age:0};}
 else if(q.kind==='race'){g._michiRace={active:true,t:0};g._michiGardenMoment={title:'SIGUE A LAS LUCIÉRNAGAS',text:'Cruza el laberinto hasta el farol del este. Es un juego opcional: puedes repetirlo sin perder nada.',age:0};}
 g.fx?.emit?.(q.x,q.floor-38,{color:'#f3d39c',count:g.reduceMotion?3:10,size:2,life:26});
 return true;
}
export function updateMichiGarden(g){
 if(!garden(g)||!g.player)return;
 g._michiGardenUse=Math.max(0,(g._michiGardenUse||0)-1);
 g._michiGardenHush=Math.max(0,(g._michiGardenHush||0)-1);
 if(g._michiGardenMoment&&++g._michiGardenMoment.age>420)g._michiGardenMoment=null;
 g._michiLampGuard=Math.max(0,(g._michiLampGuard||0)-1);g._michiLampCooldown=Math.max(0,(g._michiLampCooldown||0)-1);
 syncBridge(g);
 const p=g.player,w=garden(g).wind;
 // Deliberate airborne entry: the current assists a jump, never steals ground control.
 if(gardenHas(g,'wind')&&!p.dead&&!p.grounded&&p.x+p.w>w.x&&p.x<w.x+w.w&&p.y+p.h>w.y&&p.y<w.y+w.h)p.vy=Math.min(p.vy,-4.8);
}

export function absorbMichiGardenHit(g,damage){if(!(damage>0)||!garden(g)||!(g._michiLampGuard>0))return false;g._michiLampGuard=0;g._michiGardenMoment={title:'EL FAROL TE PROTEGE',text:'Escudo consumido. Busca la siguiente apertura de la Polilla.',age:0};return true;}
