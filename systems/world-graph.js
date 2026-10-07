// PROJECT OHANA V40 · WORLD GRAPH 2.0
// One canonical spatial graph for doors, drops, catapults and vortices.

export const WORLD_NODES = Object.freeze({
  lab:     Object.freeze({id:"lab",name:"Alien Lab",short:"LAB",x:8,y:46,hero:"chispin",tier:2}),
  cave:    Object.freeze({id:"cave",name:"Cueva Azul",short:"CUEVA",x:27,y:46,hero:"cat",tier:1}),
  ridge:   Object.freeze({id:"ridge",name:"Cumbre",short:"CUMBRE",x:35,y:17,hero:"cuerno",tier:1}),
  hub:     Object.freeze({id:"hub",name:"Claro Ohana",short:"CLARO",x:48,y:47,hero:"kilo",tier:0}),
  space:   Object.freeze({id:"space",name:"Órbita",short:"ÓRBITA",x:57,y:16,hero:"yomi",tier:2}),
  beach:   Object.freeze({id:"beach",name:"Costa Hoku",short:"COSTA",x:67,y:47,hero:"frita",tier:0}),
  reef:    Object.freeze({id:"reef",name:"Arrecife Abismo",short:"ARRECIFE",x:70,y:77,hero:"pizza",tier:1}),
  jungle:  Object.freeze({id:"jungle",name:"Jungla Alta",short:"JUNGLA",x:84,y:47,hero:"stitcho",tier:3}),
  volcano: Object.freeze({id:"volcano",name:"Caldera",short:"CALDERA",x:85,y:77,hero:"dragon",tier:4}),
  boss:    Object.freeze({id:"boss",name:"Nido Final",short:"NIDO",x:96,y:77,hero:"dino",tier:4}),
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
    ...n,current:n.id===current,visited:!!visited[n.id],locked:n.tier>Number(evo)+1 && !visited[n.id]
  }));
  const edges=WORLD_EDGES.map((e)=>Object.freeze({...e,locked:isEdgeLocked(e,evo)}));
  return Object.freeze({nodes:Object.freeze(nodes),edges:Object.freeze(edges)});
}

function esc(s){return String(s).replace(/[&<>"']/g,(ch)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}

export function renderWorldGraphHTML(current,visited={},evo=0){
  const state=worldGraphSnapshot(current,visited,evo);
  const lines=state.edges.map((e)=>{
    const a=WORLD_NODES[e.a],b=WORLD_NODES[e.b];
    if(!a||!b)return "";
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
    const angle=Math.atan2(dy,dx)*180/Math.PI;
    const style=EDGE_STYLE[e.type]||EDGE_STYLE.door;
    return '<span class="wm-edge wm-'+esc(e.type)+(e.locked?' locked':'')+'" style="--x:'+a.x+'%;--y:'+a.y+'%;--len:'+len+'%;--ang:'+angle+'deg;--edge:'+style.color+'" title="'+style.label+'"></span>';
  }).join("");
  const nodes=state.nodes.map((n)=>{
    const cls=['wm-node',n.current?'here':'',n.visited?'seen':'',n.locked?'lock':''].filter(Boolean).join(' ');
    return '<div class="'+cls+'" data-room="'+esc(n.id)+'" data-hero="'+esc(n.hero)+'" style="--x:'+n.x+'%;--y:'+n.y+'%"><b>'+esc(n.short)+'</b><small>'+esc(n.hero.toUpperCase())+'</small></div>';
  }).join("");
  return '<div class="world-map-v40" role="img" aria-label="Mapa avanzado de Isla Hoku"><div class="wm-grid"></div>'+lines+nodes+
    '<div class="wm-legend"><span><i class="door"></i>Ruta</span><span><i class="drop"></i>Caída</span><span><i class="catapult"></i>Catapulta</span><span><i class="vortex"></i>Vórtice</span></div></div>';
}
