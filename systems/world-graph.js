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

export const WORLD_EDGES = Object.freeze([
  // Main route / physical doors
  Object.freeze({a:"lab",b:"cave",type:"door",route:"main"}),
  Object.freeze({a:"cave",b:"hub",type:"door",route:"main"}),
  Object.freeze({a:"hub",b:"beach",type:"door",route:"main"}),
  Object.freeze({a:"beach",b:"jungle",type:"door",route:"main",needEvo:2}),
  Object.freeze({a:"jungle",b:"volcano",type:"drop",route:"main",needEvo:3,directed:true}),
  Object.freeze({a:"volcano",b:"boss",type:"door",route:"climax",needEvo:3}),
  Object.freeze({a:"hub",b:"ridge",type:"door",route:"upper"}),
  Object.freeze({a:"ridge",b:"space",type:"door",route:"upper",needEvo:1}),
  Object.freeze({a:"beach",b:"reef",type:"drop",route:"lower",directed:true}),
  Object.freeze({a:"ridge",b:"hub",type:"drop",route:"return",directed:true}),
  Object.freeze({a:"space",b:"hub",type:"drop",route:"return",directed:true}),

  // Traversal network
  Object.freeze({a:"hub",b:"beach",type:"catapult",route:"shortcut",directed:true}),
  Object.freeze({a:"beach",b:"hub",type:"catapult",route:"shortcut",directed:true}),
  Object.freeze({a:"reef",b:"beach",type:"catapult",route:"shortcut",directed:true}),
  Object.freeze({a:"jungle",b:"volcano",type:"vortex",route:"shortcut",directed:true,needEvo:3}),
  Object.freeze({a:"volcano",b:"jungle",type:"vortex",route:"shortcut",directed:true}),
  Object.freeze({a:"space",b:"reef",type:"vortex",route:"secret",directed:true}),
  Object.freeze({a:"reef",b:"space",type:"vortex",route:"secret",directed:true,needEvo:1}),
]);

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
  return '<div class="world-map-v40"><div class="wm-summary"><span>CUADERNO DE VIAJE</span><strong>'+state.nodes.filter(n=>n.visited).length+' <small>/ 10 lugares</small></strong></div><div class="wm-scroll" tabindex="0" aria-label="Mapa de Isla Hoku. Puedes desplazarte para explorar sus rutas."><div class="wm-board"><svg class="wm-chart" viewBox="0 0 1000 560" aria-hidden="true"><defs><marker id="wm-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 8 5 0 10" fill="none" stroke="currentColor" stroke-width="2"/></marker></defs><path class="wm-shore" d="M35 235Q60 175 185 200L315 185Q375 215 448 201Q535 220 608 210Q735 180 864 209Q910 250 883 302L866 367Q953 380 978 425L930 487Q845 505 795 467L737 461Q642 510 601 458Q554 410 620 363L662 306Q570 334 470 300Q350 335 259 303Q119 326 35 286Z"/><path class="wm-highland" d="M274 86Q293 26 380 40Q448 9 583 40Q640 74 606 126Q520 161 454 122Q376 171 305 139Z"/><path class="wm-contour" d="M50 250Q180 211 300 236T600 251T871 242M75 275Q200 244 316 267T620 284M300 98Q440 66 587 85M654 411Q750 444 912 426"/><g class="wm-routes">'+lines+'</g><text x="480" y="390" class="wm-sea-label">MAR DE HOKU</text><path class="wm-waves" d="M220 395q8-8 16 0t16 0m-12 14q8-8 16 0t16 0M465 460q8-8 16 0t16 0"/></svg>'+nodes+'<span class="wm-north" aria-hidden="true">N<br>↑</span></div></div><div class="wm-legend"><span><i class="door"></i>Camino</span><span><i class="drop"></i>Descenso</span><span><i class="catapult"></i>Catapulta</span><span><i class="vortex"></i>Vórtice</span></div><section class="wm-detail" aria-live="polite">'+worldMapDetailHTML(current,current,visited,evo)+'</section></div>';
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
