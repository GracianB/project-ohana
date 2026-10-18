import {ROOMS} from "./map.js";
// PROJECT OHANA V40 · WORLD GRAPH 2.0
// One canonical spatial graph for doors, drops, catapults and vortices.

export const WORLD_NODES = Object.freeze({
  lab:     Object.freeze({id:"lab",name:"Alien Lab",short:"LAB",x:8,y:46,hero:"chispin",needEvo:1}),
  cave:    Object.freeze({id:"cave",name:"Cueva Azul",short:"CUEVA",x:27,y:46,hero:"cat",needEvo:0}),
  ridge:   Object.freeze({id:"ridge",name:"Cumbre",short:"CUMBRE",x:35,y:17,hero:"cuerno",needEvo:0}),
  hub:     Object.freeze({id:"hub",name:"Claro Ohana",short:"CLARO",x:48,y:47,hero:"kilo",needEvo:0}),
  space:   Object.freeze({id:"space",name:"Órbita",short:"ÓRBITA",x:57,y:16,hero:"yomi",needEvo:1}),
  beach:   Object.freeze({id:"beach",name:"Costa Hoku",short:"COSTA",x:67,y:47,hero:"frita",needEvo:0}),
  reef:    Object.freeze({id:"reef",name:"Arrecife Abismo",short:"ARRECIFE",x:70,y:77,hero:"pizza",needEvo:0}),
  jungle:  Object.freeze({id:"jungle",name:"Jungla Alta",short:"JUNGLA",x:82,y:47,hero:"stitcho",needEvo:2}),
  volcano: Object.freeze({id:"volcano",name:"Caldera",short:"CALDERA",x:82,y:77,hero:"dragon",needEvo:3}),
  boss:    Object.freeze({id:"boss",name:"Nido Final",short:"NIDO",x:93,y:77,hero:"dino",needEvo:3}),
});

export const WORLD_EDGES=Object.freeze(buildEdges());
function buildEdges(){
 const result=[],seen=new Set();
 for(const r of Object.values(ROOMS)){
  for(const [dir,dest] of Object.entries(r.doors)){
   if(!dest)continue;const type=dir==='down'?'drop':'door',directed=type==='drop';
   const key=type+':'+(directed?r.id+'>'+dest:[r.id,dest].sort().join(':'));if(seen.has(key))continue;seen.add(key);
   result.push(Object.freeze({a:r.id,b:dest,type,route:dest==='boss'?'climax':dir==='up'?'upper':'main',needEvo:Math.max(r.needEvo||0,ROOMS[dest].needEvo||0),...(directed?{directed:true}:{})}));
  }
  for(const p of r.portals||[])result.push(Object.freeze({a:r.id,b:p.dest,type:p.type==='blackhole'?'vortex':'catapult',route:p.type==='blackhole'?'secret':'shortcut',directed:true,needEvo:ROOMS[p.dest].needEvo||0}));
 }return result;
}

export const EDGE_STYLE = Object.freeze({
  door:      Object.freeze({label:"PUERTA",glyph:"—",color:"#7ee7ff"}),
  drop:      Object.freeze({label:"CAÍDA",glyph:"↓",color:"#6ee8ff"}),
  catapult:  Object.freeze({label:"CATAPULTA",glyph:"↗",color:"#ffc078"}),
  vortex:    Object.freeze({label:"VÓRTICE",glyph:"◉",color:"#c9a0ff"}),
});

export function nodeFor(id=""){ return WORLD_NODES[String(id)]||null; }
export function edgesFor(id=""){ return WORLD_EDGES.filter((e)=>e.a===id||(!e.directed&&e.b===id)||e.b===id); }
export function isEdgeLocked(edge,evo=0){ return edge.needEvo!=null && Number(evo)<edge.needEvo; }

export function worldGraphSnapshot(current,visited={},evo=0){
  const nodes=Object.values(WORLD_NODES).map((n)=>Object.freeze({
    ...n,current:n.id===current,visited:!!visited[n.id],locked:Number(n.needEvo||0)>Number(evo) && !visited[n.id]
  }));
  const edges=WORLD_EDGES.map((e)=>Object.freeze({...e,locked:isEdgeLocked(e,evo)}));
  return Object.freeze({nodes:Object.freeze(nodes),edges:Object.freeze(edges)});
}

function esc(s){return String(s).replace(/[&<>"']/g,(ch)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}

const ROOM_NOTES = Object.freeze({
  hub:"El corazón de la isla. Empieza por la costa o explora la cueva al oeste.",
  beach:"Salta entre las plataformas de la costa. El descenso central lleva al arrecife.",
  cave:"Sigue el brillo azul hacia el laboratorio. Necesitas la segunda forma para entrar.",
  lab:"Un laboratorio escondido entre cristales. Busca el paraguas si empieza a llover.",
  ridge:"La ruta de las alturas. Desde aquí puedes alcanzar la órbita o bajar al claro.",
  space:"Plataformas entre estrellas. Un vórtice conecta este lugar con el arrecife.",
  reef:"Explora bajo el agua. La catapulta te devuelve a la costa.",
  jungle:"Avanza por las copas y busca el descenso hacia la caldera.",
  volcano:"Sigue las tres brasas del Dragón. El camino del este termina en el Nido.",
  boss:"El último desafío. Entra preparado: la Reina no dejará que te marches a mitad del combate."
});
const MARKS = Object.freeze({
  hub:'<path d="M12 33V19m0 6-7-6m7 1 8-7"/><path d="M4 17Q0 9 9 9Q8 1 17 4Q24 0 27 10Q36 12 30 20Q20 26 12 20Q7 25 4 17Z"/>',
  beach:'<path d="M3 29q5-7 10 0t10 0t10 0M18 28V10m0 3Q7 0 3 13q8-3 15 0Zm0 0Q25 1 34 12q-9-2-16 1Z"/>',
  cave:'<path d="M3 32 8 13 19 4 31 16l4 16ZM12 32V23q6-15 13 0v9"/>',
  lab:'<path d="M13 4h12m-9 0v12L5 29q-2 5 5 5h19q6 0 3-5L22 16V4M11 24h16"/><circle cx="19" cy="27" r="2"/>',
  ridge:'<path d="M1 33 13 9l7 13 5-18 13 29ZM9 17l4 3 4-3m4-1 4 3 4-3"/>',
  space:'<circle cx="19" cy="19" r="9"/><ellipse cx="19" cy="19" rx="19" ry="5" transform="rotate(-30 19 19)"/><path d="m29 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
  reef:'<path d="M18 35V11m0 12-9-8V7m9 22 10-9V10M9 13 3 9m25 9 7-4M12 35h15"/>',
  jungle:'<path d="M5 33V21m0 4 12-13m-3 21V15M1 21Q-2 9 9 13q4-11 12-5 8 0 7 12Q15 29 5 21ZM26 34V23m-6 0 6-12 9 12Z"/>',
  volcano:'<path d="m1 34 12-21 12 0 12 21ZM13 13l6 6 6-6M16 8q-4-5 0-7m7 7q5-4 1-7M8 29l6-3 5 4 5-3 5 3"/>',
  boss:'<path d="M3 13 10 19 19 6 28 19 35 13l-4 20H7ZM8 27h22"/><circle cx="14" cy="26" r="1"/><circle cx="24" cy="26" r="1"/>'
});

export function worldMapDetailHTML(id,current,visited={},evo=0){
  const node=WORLD_NODES[id]||WORLD_NODES[current]||WORLD_NODES.hub;
  const locked=Number(node.needEvo)>Number(evo)&&!visited[node.id];
  const routes=WORLD_EDGES.filter(e=>e.a===node.id||(!e.directed&&e.b===node.id));
  const seen=new Set();
  const exits=routes.map(e=>{
    const dest=WORLD_NODES[e.a===node.id?e.b:e.a];
    const key=dest.id+e.type;if(seen.has(key))return '';seen.add(key);
    const required=Math.max(e.needEvo||0,dest.needEvo||0);
    const blocked=Number(evo)<required;
    return '<li><span>'+esc(dest.name)+'</span><small>'+esc(EDGE_STYLE[e.type].label.toLowerCase())+(blocked?' · forma '+(required+1):'')+'</small></li>';
  }).join('');
  return '<div><span class="wm-detail-kicker">'+(node.id===current?'Estás aquí':locked?'Forma '+(node.needEvo+1)+' para entrar':visited[node.id]?'Lugar descubierto':'Por descubrir')+'</span><h3>'+esc(node.name)+'</h3><p>'+esc(ROOM_NOTES[node.id])+'</p></div><ul aria-label="Caminos desde '+esc(node.name)+'">'+exits+'</ul>';
}

// Each island is authored by biome. Silhouettes vary and retain the same world
// graph coordinates and click targets, rather than ten identical ovals.
const ATLAS_LANDMARKS=Object.freeze({
 hub:'<path d="M-35 17v-34m-13 24q0-31 23-22t20 25m14 16v-44m-12 10q15-21 30 5" stroke="#2a664f" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="-35" cy="-19" r="14" fill="#3d9470"/><circle cx="14" cy="-27" r="17" fill="#3d9470"/>',
 beach:'<path d="M-24 28Q-6 7 17 23M-9 25Q-10 0 0-24M0-24q-22-8-29 5m29-5q21-10 31 2m-31-2q-10-14-3-20" fill="none" stroke="#557c5b" stroke-width="5"/><path d="M-44 31q14-8 29 0t30 0t30 0" fill="none" stroke="#f9f6dc" stroke-width="4"/>',
 jungle:'<path d="M-42 28V-8M-12 30V-19M24 28V-8" stroke="#3c6952" stroke-width="8"/><circle cx="-42" cy="-12" r="17" fill="#207d57"/><circle cx="-12" cy="-27" r="22" fill="#348a55"/><circle cx="24" cy="-12" r="20" fill="#217352"/><path d="M-47 14q26-15 54 0t40 0" stroke="#d1f2a4" fill="none" stroke-width="3"/>',
 cave:'<path d="M-42 29L-30-25l17 20L0-41l20 39 17-22 9 53" stroke="#5e79af" stroke-width="5" fill="#4f6da0"/><path d="M-19 27L-12 0l12 27m7 0 9-40 10 40" fill="#9adfff" stroke="#e9f6ff" stroke-width="2"/>',
 lab:'<path d="M-39 25v-28h78v28M-29-3V-25H28V-3M0-25v-21" fill="#46848b" stroke="#2c566b" stroke-width="4"/><path d="M-18 3h36v21h-36ZM-30-13h13m16 0h13m16 0h9" fill="#aaf8ee" stroke="#28566b" stroke-width="3"/><circle cy="-47" r="5" fill="#bff7f8"/>',
 ridge:'<path d="M-50 30-25-24l14 19 17-41 40 76" fill="#799ab7" stroke="#e8f8ff" stroke-width="4"/><path d="M-36 1-25-24l14 19 17-41 24 39-24-10-15 14-9-10Z" fill="#e3f5fa"/>',
 space:'<circle cy="-4" r="30" fill="#8277ae" stroke="#e2d0ff" stroke-width="4"/><ellipse cy="-3" rx="43" ry="15" transform="rotate(-19)" stroke="#d2a9fc" stroke-width="5" fill="none"/><circle cx="-10" cy="-8" r="6" fill="#5c588b"/><circle cx="18" cy="8" r="8" fill="#5c588b"/><path d="M30-39l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#fff2ca"/>',
 reef:'<path d="M-44 28Q-36-15-24 16M-34 2l-18-15m27 13 18-20M-1 29V-16m0 23 18-17m-18 1-13-18M25 29q-12-23 3-39t18-13" stroke="#a94d8e" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-10" cy="20" r="8" fill="#f7b9c9"/><circle cx="33" cy="14" r="5" fill="#ffd29b"/>',
 volcano:'<path d="M-50 32-20-12-10-10 1-40 16-9 29-13 52 32Z" fill="#6b4854" stroke="#f4c3a1" stroke-width="4"/><path d="M-7-18 1-40 10-19 4-10 11 10 1 32-4 7Z" fill="#ff914c"/><path d="M-4-46q-8-10 0-15m14 15q10-10 1-16" fill="none" stroke="#ffc08b" stroke-width="4"/>',
 boss:'<path d="M-45 22Q-15-12 0 8Q20-17 46 22" fill="none" stroke="#885a7e" stroke-width="12"/><path d="M-34-10-18 0 0-30 20 0 36-11 31 29H-30Z" fill="#95627f" stroke="#f4d7df" stroke-width="5"/><circle cy="10" r="11" fill="#fff2be"/>'
});
function atlasIslands(state){
 return state.nodes.map((n,i)=>{
  const x=n.x*10,y=n.y*5.6,col=ROOMS[n.id].color||'#b4ceac',rx=n.id==='hub'?78:62,ry=n.id==='hub'?47:41;
  let edge='';
  for(let j=0;j<=32;j++){
   const a=j/32*Math.PI*2;
   const wave=1+Math.sin(j*1.9+i*1.7)*.12+Math.cos(j*.83+i*2.6)*.10;
   edge+=(j?'L':'M')+(Math.cos(a)*rx*wave).toFixed(1)+' '+(Math.sin(a)*ry*wave).toFixed(1);
  }
  return '<g transform="translate('+x+' '+y+')" opacity="'+(n.visited?1:.51)+'">'+
   '<path d="'+edge+'Z" fill="#274a54" stroke="#325968" stroke-width="12"/>'+
   '<path d="'+edge+'Z" fill="'+col+'" stroke="#f3e4bd" stroke-width="4"/>'+
   '<path d="M-34 35q24-10 60 0" fill="none" stroke="#f4f4dd66" stroke-width="3"/>'+
   ATLAS_LANDMARKS[n.id]+'</g>';
 }).join('');
}
export function renderWorldGraphHTML(current,visited={},evo=0){
  const state=worldGraphSnapshot(current,visited,evo);
  const lines=state.edges.map((e,index)=>{
    const a=WORLD_NODES[e.a],b=WORLD_NODES[e.b];
    const shortcut=e.type==='catapult'||e.type==='vortex';
    const ax=a.x*10,ay=a.y*5.6,bx=b.x*10,by=b.y*5.6;
    const curve=shortcut?45+(index%3)*12:0;
    const d=curve?'M'+ax+' '+ay+' Q'+((ax+bx)/2)+' '+((ay+by)/2-curve)+' '+bx+' '+by:'M'+ax+' '+ay+' L'+bx+' '+by;
    return '<path class="wm-edge wm-'+e.type+(e.locked?' locked':'')+'" d="'+d+'"'+(e.directed?' marker-end="url(#wm-arrow)"':'')+'/>';
  }).join('');
  const nodes=state.nodes.map(n=>'<button type="button" class="wm-node '+(n.current?'here selected ':'')+(n.visited?'seen ':'')+(n.locked?'lock':'')+'" data-room="'+n.id+'" data-hero="'+n.hero+'" style="--x:'+n.x+'%;--y:'+n.y+'%" aria-pressed="'+n.current+'"'+(n.current?' aria-current="location"':'')+' aria-label="'+esc(n.name)+(n.current?', estás aquí':n.locked?', requiere forma '+(n.needEvo+1):n.visited?', descubierto':', por descubrir')+'"><span class="wm-marker"><svg viewBox="0 0 40 40" aria-hidden="true">'+MARKS[n.id]+'</svg></span><b>'+esc(n.short)+'</b><small>'+(n.current?'ESTÁS AQUÍ':n.locked?'FORMA '+(n.needEvo+1):n.visited?'EXPLORADO':'POR DESCUBRIR')+'</small></button>').join('');
  return '<div class="world-map-v40"><div class="wm-summary"><span>CUADERNO DE VIAJE</span><strong>'+state.nodes.filter(n=>n.visited).length+' <small>/ 10 lugares</small></strong></div><div class="wm-scroll" tabindex="0" aria-label="Mapa de Isla Hoku. Puedes desplazarte para explorar sus rutas."><div class="wm-board"><svg class="wm-chart" viewBox="0 0 1000 560" aria-hidden="true"><defs><marker id="wm-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 8 5 0 10" fill="none" stroke="currentColor" stroke-width="2"/></marker></defs>'+atlasIslands(state)+'<g class="wm-routes">'+lines+'</g><text x="480" y="390" class="wm-sea-label">MAR DE HOKU</text><path class="wm-waves" d="M220 395q8-8 16 0t16 0m-12 14q8-8 16 0t16 0M465 460q8-8 16 0t16 0"/></svg>'+nodes+'<span class="wm-north" aria-hidden="true">N<br>↑</span></div></div><div class="wm-legend"><span><i class="door"></i>Camino</span><span><i class="drop"></i>Descenso</span><span><i class="catapult"></i>Catapulta</span><span><i class="vortex"></i>Vórtice</span></div><section class="wm-detail" aria-live="polite">'+worldMapDetailHTML(current,current,visited,evo)+'</section></div>';
}


export function drawWorldMinimap(ctx,current,visited={},evo=0,viewW=1280,viewH=720){
  if(!ctx)return;
  if(viewW<760)return;
  const state=worldGraphSnapshot(current,visited,evo);
  const w=174,h=100;
  const ox=viewW-w-18,oy=viewH-h-18;
  ctx.save();
  ctx.fillStyle="rgba(11,30,40,.82)";
  ctx.strokeStyle="rgba(192,221,203,.24)";
  ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(ox,oy,w,h,14);ctx.fill();ctx.stroke();

  const px=(n)=>ox+12+n.x/100*(w-24);
  const py=(n)=>oy+12+n.y/100*(h-24);

  for(const e of state.edges){
    if(e.type==="vortex"||e.type==="catapult")continue;
    const a=WORLD_NODES[e.a],b=WORLD_NODES[e.b];if(!a||!b)continue;
    const style=EDGE_STYLE[e.type]||EDGE_STYLE.door;
    ctx.globalAlpha=e.locked ? 0.18 : ((e.type==="vortex" || e.type==="catapult") ? 0.55 : 0.28);
    ctx.strokeStyle=style.color;
    ctx.lineWidth=e.route==="main"?2:1.2;
    if(e.type==="vortex")ctx.setLineDash([3,4]);
    else if(e.type==="catapult")ctx.setLineDash([7,4]);
    else if(e.type==="drop")ctx.setLineDash([2,3]);
    else ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(px(a),py(a));ctx.lineTo(px(b),py(b));ctx.stroke();
  }
  ctx.setLineDash([]);

  for(const n of state.nodes){
    const x=px(n),y=py(n);
    ctx.globalAlpha=n.locked?.28:1;
    ctx.fillStyle=n.current?"#7ee7ff":n.visited?"#7fe39c":"#1c2a38";
    ctx.strokeStyle=n.current?"#eaffff":n.visited?"#b8f0c4":"rgba(255,255,255,.18)";
    ctx.lineWidth=n.current?2:1;
    ctx.beginPath();ctx.arc(x,y,n.current?5.8:4.2,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.globalAlpha=1;
  ctx.restore();
}
