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

function atlasIslands(state){return state.nodes.map((n,i)=>{const x=n.x*10,y=n.y*5.6,col=ROOMS[n.id].color||'#b4ceac';let d='';for(let j=0;j<=16;j++){const a=j/16*Math.PI*2,k=1+Math.sin(j*2.1+i)*.13;d+=(j?'L':'M')+(x+Math.cos(a)*(n.id==='hub'?72:60)*k)+' '+(y+Math.sin(a)*43*k);}return '<g opacity="'+(n.visited?1:.46)+'"><path d="'+d+'Z" fill="'+col+'" stroke="#ead7ab" stroke-width="5"/><path d="M'+(x-32)+' '+(y-10)+'q30-28 60 0" fill="none" stroke="#365e5c33" stroke-width="3"/></g>';}).join('');}
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
