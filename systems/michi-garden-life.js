// Saved, explicit interactions. No XP grants and no replacement of the chosen form.
const secrets=g=>g.secrets?.['w1-cat']||[];
const key=id=>'w1-cat-garden-'+id;
export const gardenHas=(g,id)=>secrets(g).includes(key(id));
const garden=g=>g.roomDef?.michiSanctuary?.garden;
function remember(g,id){g.secrets||={};const list=g.secrets['w1-cat']||=[];if(!list.includes(key(id)))list.push(key(id));g.save?.();}
export function nearestGardenInteraction(g){
 const r=garden(g),p=g.player;if(!r||!p||p.dead)return null;
 return [...r.mechanisms,...r.moments.map(q=>({...q,kind:'moment',label:q.title,action:'E · escuchar este recuerdo'}))]
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
 g.fx?.emit?.(q.x,q.floor-38,{color:'#f3d39c',count:g.reduceMotion?3:10,size:2,life:26});
 return true;
}
export function updateMichiGarden(g){
 if(!garden(g)||!g.player)return;
 g._michiGardenUse=Math.max(0,(g._michiGardenUse||0)-1);
 g._michiGardenHush=Math.max(0,(g._michiGardenHush||0)-1);
 if(g._michiGardenMoment&&++g._michiGardenMoment.age>420)g._michiGardenMoment=null;
 syncBridge(g);
 const p=g.player,w=garden(g).wind;
 // Deliberate airborne entry: the current assists a jump, never steals ground control.
 if(gardenHas(g,'wind')&&!p.dead&&!p.grounded&&p.x+p.w>w.x&&p.x<w.x+w.w&&p.y+p.h>w.y&&p.y<w.y+w.h)p.vy=Math.min(p.vy,-4.8);
}
