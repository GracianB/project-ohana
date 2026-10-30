import {drawExpeditionArtifact,drawExpeditionSupport} from './expedition-art-v630.js';
// Act II uses the fully earned kit. It extends physical space, not enemy HP or
// the time spent waiting. Its three independent discoveries survive retries.
const FLOOR=1134;
export const EXPEDITION_WIDTH=14400;
export const EXPEDITIONS=Object.freeze({
 kilo:{name:'Jardines sobre las nubes',verb:'Vuela con K y toca J junto a cada carillón',kind:'bell',ys:[760,590,430]},
 stitcho:{name:'El corazón nocturno del astillero',verb:'Sube por los andamios y conecta cada batería con J',kind:'cell',ys:[1054,854,674]},
 chispin:{name:'Torres de la tormenta',verb:'Alcanza los conductores y conéctalos con J',kind:'conductor',ys:[1014,854,694]},
 cat:{name:'El sueño de las tres lunas',verb:'Salta y toca las lunas en el aire',kind:'moon',ys:[894,734,574]},
 cuerno:{name:'La carrera de los cometas',verb:'Cruza los arcos corriendo: conserva velocidad',kind:'arch',ys:[1094,1094,1094]},
 dragon:{name:'Las chimeneas del cielo',verb:'Sube en las térmicas y enciende los nidos con J',kind:'nest',ys:[774,594,414]},
 dino:{name:'Los tres corazones de la montaña',verb:'Salta sobre las placas y cae con fuerza; K acelera la caída',kind:'plate',ys:[1134,1134,1134]},
 frita:{name:'El mercado de los globos',verb:'Salta desde los fuelles y recoge las especias en el aire',kind:'spice',ys:[754,694,634]},
 pizza:{name:'La cena de los fareros',verb:'Recoge el pedido en cada horno y entrégalo al farero',kind:'supper',ys:[1094,1094,1094]},
 yomi:{name:'El archivo de las voces',verb:'Lee la ventana AHORA y pulsa J junto al archivo',kind:'archive',ys:[1054,894,734]}
});
export function authorExpedition(hero,room){
 const def=EXPEDITIONS[hero];if(!def)return room;
 const old=room.width,extra=EXPEDITION_WIDTH-old;
 room.width=EXPEDITION_WIDTH;room.plats.push([old,FLOOR,extra,126]);
 const nodes=[10200,11750,13300].map((x,i)=>({id:`${room.id}-v2-trial-${i}`,x,y:def.ys[i],kind:def.kind}));
 // Recovery floor stays continuous; genuine ascending ledges make the upper
 // route legible. No one-way shelf may cover a floor mechanism.
 for(const node of nodes){
  if(!['arch','plate','supper','spice'].includes(def.kind)){
   for(let rise=100;rise<FLOOR-node.y+90;rise+=100)room.plats.push([node.x-430+(Math.round(rise/100)%2)*140,FLOOR-rise,200,20]);
   room.plats.push([node.x-100,node.y+50,200,20]);
  }else if(def.kind==='plate')for(let k=1;k<=3;k++)room.plats.push([node.x-480+k*100,FLOOR-k*75,145,20]);
  else if(def.kind==='spice')room.plats.push([node.x-420,FLOOR-110,200,20]);
 }
 const cast=room.foes.find(f=>f[4]?.role)?.[2]||'cucaracho';
 for(let i=0;i<3;i++)for(let k=0;k<2;k++){
  const x=9750+i*1550+k*340,role=k?'shooter':hero==='dino'?'shield':hero==='cuerno'?'jumper':'pursuer';
  room.foes.push([x,FLOOR-40,cast,false,{role,chapterHP:150+i*25,anchorFloor:FLOOR,name:def.name,variant:i+k,expedition:true}]);
 }
 room.seal.altar={x:EXPEDITION_WIDTH-480,y:FLOOR};
 for(let i=0;i<3;i++){
  const x=9600+i*1600;room.sectors.push({id:room.id+'-act2-'+i,name:[def.name,'La ruta superior','El regreso del héroe'][i],x,w:1600,role:i===1?'platform':'explore'});
  room.checkpoints.push({id:room.id+'-act2-'+i,x:x+100,y:FLOOR,sector:6+i});
 }
 room.expedition={...def,nodes};return room;
}
export function expeditionUnlocked(g){return !!g.world1?.sealed||!!g.world1?.stations?.every(s=>s.kind==='oven'||s.done)&&g.player?.evo>=4&&!!g.clearedEncounters?.[g.roomId]?.some(id=>String(id).startsWith('w1-'))&&!g.enemies?.some(e=>e.miniBoss&&e.hp>0&&!e.dying);}
export const EXPEDITION_KEY='ohana-expeditions-v2';
function expeditionStorage(g){return g.expeditionStorage||globalThis.localStorage;}
function readProgress(g){
 const storage=expeditionStorage(g);let data={},legacy={};
 try{data=JSON.parse(storage?.getItem(EXPEDITION_KEY)||'{}');legacy=JSON.parse(storage?.getItem('ohana')||'{}')?.secrets||{};}catch{}
 const out={};for(const hero of Object.keys(EXPEDITIONS)){
  const room='w1-'+hero,accepted=new Set([...(Array.isArray(data?.[room])?data[room]:[]),...(Array.isArray(legacy?.[room])?legacy[room]:[])]);
  out[room]=[0,1,2].map(i=>room+'-v2-trial-'+i).filter(id=>accepted.has(id));
 }
 return out;
}
function persistProgress(g,progress){try{expeditionStorage(g)?.setItem(EXPEDITION_KEY,JSON.stringify(progress));}catch{}}
export function enterExpedition(g){
 const r=g.roomDef;if(!r?.expedition){g.expedition=null;return;}
 const progress=readProgress(g),saved=new Set([...(g.secrets?.[r.id]||[]),...(progress[r.id]||[])]);
 progress[r.id]=r.expedition.nodes.filter(n=>saved.has(n.id)).map(n=>n.id);persistProgress(g,progress);
 g.secrets||={};g.secrets[r.id]=[...new Set([...(g.secrets[r.id]||[]),...progress[r.id]])];
 g.expedition={hero:r.hero,tick:0,done:r.expedition.nodes.filter(n=>saved.has(n.id)).map(n=>n.id),carry:null,until:0,wasGrounded:!!g.player?.grounded,fall:0};
}
export function expeditionReady(g){return !g.roomDef?.expedition||g.expedition?.done.length===3;}
function complete(g,n){
 const a=g.expedition;if(a.done.includes(n.id))return false;
 const progress=readProgress(g);if(progress[g.roomId]?.includes(n.id)){a.done.push(n.id);return false;}
 a.done.push(n.id);progress[g.roomId]=[...(progress[g.roomId]||[]),n.id];persistProgress(g,progress);g.secrets||={};g.secrets[g.roomId]||=[];if(!g.secrets[g.roomId].includes(n.id))g.secrets[g.roomId].push(n.id);
 g.score=(g.score||0)+200;g.onWorld1Beat?.('chime',g.player.id,a.done.length);
 g.nums?.add?.(n.x,n.y-65,'DESCUBRIMIENTO '+a.done.length+'/3',g.roomDef.color,true);
 g.fx?.emit?.(n.x,n.y,{color:g.roomDef.color,count:g.reduceMotion?5:20,size:4,life:32,up:2});g.save?.();return true;
}
const distance=(p,n)=>Math.hypot(p.x+p.w/2-n.x,p.y+p.h/2-n.y);
export function expeditionWindow(g,index){return ((g.expedition?.tick||0)+index*53)%210<65;}
export function expeditionAbility(g,p,index){
 if(index!==0||!g.expedition||!expeditionUnlocked(g))return;
 for(const [i,n] of g.roomDef.expedition.nodes.entries())if(!g.expedition.done.includes(n.id)&&distance(p,n)<165){
  if(['bell','cell','conductor','nest'].includes(n.kind)||n.kind==='archive'&&expeditionWindow(g,i))complete(g,n);
 }
}
export function updateExpedition(g){
 const a=g.expedition,p=g.player,r=g.roomDef;if(!a||!p||p.dead)return;
 a.tick++;if(!expeditionUnlocked(g))return;
 for(const n of r.expedition.nodes){
  if(a.done.includes(n.id))continue;
  const dx=Math.abs(p.x+p.w/2-n.x),foot=p.y+p.h;
  if(n.kind==='arch'&&dx<70&&p.grounded&&Math.abs(p.vx)>p.speed*.65)complete(g,n);
  if(['moon','spice'].includes(n.kind)&&!p.grounded&&distance(p,n)<65)complete(g,n);
  if(n.kind==='plate'&&dx<75&&p.grounded&&!a.wasGrounded&&a.fall>7)complete(g,n);
  if(n.kind==='nest'&&!p.grounded&&Math.abs(p.x+p.w/2-(n.x-190))<100&&foot>n.y-80){p.vy=Math.max(-12,(p.vy||0)-.9);}
  if(n.kind==='spice'&&p.grounded&&Math.abs(p.x+p.w/2-(n.x-230))<65){p.vy=-24;p.grounded=false;p.jumps=0;}
  if(n.kind==='supper'){
   if(a.carry!==n.id&&Math.abs(p.x+p.w/2-(n.x-700))<65&&Math.abs(foot-FLOOR)<80){a.carry=n.id;a.until=a.tick+2400;g.onWorld1Beat?.('station','pizza');}
   if(a.carry===n.id&&a.tick>a.until)a.carry=null;
   if(a.carry===n.id&&dx<65&&Math.abs(foot-FLOOR)<80){a.carry=null;complete(g,n);}
  }
 }
 if(!p.grounded)a.fall=Math.max(a.fall||0,p.vy||0);else a.fall=0;
 a.wasGrounded=!!p.grounded;
}
export function expeditionObjective(g){
 if(!g.expedition||!expeditionUnlocked(g)||expeditionReady(g))return null;
 const n=g.roomDef.expedition.nodes.find(n=>!g.expedition.done.includes(n.id));if(!n)return null;
 const source=n.kind==='supper'&&g.expedition.carry!==n.id;
 return {x:source?n.x-700:n.x,y:source?FLOOR:n.y,label:`Acto II · ${g.roomDef.expedition.name} · ${g.expedition.done.length}/3`,action:source?'Recoge la cena en el horno encendido':g.roomDef.expedition.verb};
}
export function drawExpedition(c,g,cam,t){
 if(!g.roomDef?.expedition)return;
 const active=expeditionUnlocked(g),a=g.expedition,def=g.roomDef.expedition,hero=g.roomDef.hero;
 c.save();c.lineCap='round';c.lineJoin='round';
 for(const [i,n] of def.nodes.entries()){
  const x=n.x-cam.x,y=n.y-cam.y;if(x<-750||x>(g.viewW||1440)+150)continue;
  const done=!!a?.done.includes(n.id),windowOpen=expeditionWindow(g,i),col=done?'#b7f0c0':active?'#ffe7a0':'#a9bac8';
  if(n.kind==='nest'){
   const vx=x-190,base=FLOOR-cam.y,height=FLOOR-n.y+80;
   drawExpeditionSupport(c,hero,vx,base,{t,reduced:!!g.reduceMotion});
   for(let k=0;k<4;k++){
    const u=g.reduceMotion?(k+.5)/4:(t*.004+k/4)%1;
    c.save();c.globalAlpha=.45*(1-u);c.strokeStyle='#ffe1ad';c.lineWidth=2;
    c.beginPath();c.moveTo(vx-32,base-30-u*height);c.bezierCurveTo(vx-10,base-48-u*height,vx+10,base-12-u*height,vx+32,base-30-u*height);c.stroke();c.restore();
   }
  }
  if(n.kind==='spice')drawExpeditionSupport(c,hero,x-230,FLOOR-cam.y,{t,reduced:!!g.reduceMotion});
  if(n.kind==='supper')drawExpeditionSupport(c,hero,x-700,FLOOR-cam.y,{t,reduced:!!g.reduceMotion,source:true});
  drawExpeditionArtifact(c,hero,x,y,n.kind==='arch'?100:92,{index:i,active,done,windowOpen,t,reduced:!!g.reduceMotion});
  c.textAlign='center';c.font='bold 13px Outfit,sans-serif';c.fillStyle=col;
  const label=done?'RESONANCIA '+(i+1)+'/3':!active?'VENCE AL GUARDIÁN':n.kind==='archive'?(windowOpen?'AHORA · J':'ESPERA LA VOZ'):n.kind==='arch'?'CRUZA CORRIENDO':n.kind==='plate'?'CAÍDA POTENTE':n.kind==='moon'?'SALTA HACIA LA LUNA':n.kind==='spice'?'FUELLE → ESPECIA':n.kind==='supper'?'CENA DEL FARERO':'ACÉRCATE · J';
  c.fillText(label,x,y-(n.kind==='arch'?135:98));
 }
 if(a?.carry){const p=g.player;drawExpeditionArtifact(c,'pizza',p.x+p.w/2-cam.x,p.y-cam.y-20,38,{active:true,t,reduced:!!g.reduceMotion});}
 c.restore();
}
