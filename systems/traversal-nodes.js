// PROJECT OHANA V40 · TRAVERSAL NODE PROFILES
// Catapults and vortices share one language but preserve room identity.

const PROFILES=Object.freeze({
  "hub>beach":Object.freeze({kind:"catapult",label:"Salto Costero",vx:7.2,vy:-8.6,color:"#ffc878",arc:"high"}),
  "beach>hub":Object.freeze({kind:"catapult",label:"Retorno Solar",vx:-6.4,vy:-7.8,color:"#ffd9a0",arc:"high"}),
  "reef>beach":Object.freeze({kind:"catapult",label:"Géiser de Coral",vx:5.8,vy:-9.1,color:"#76e8ff",arc:"vertical"}),
  "jungle>volcano":Object.freeze({kind:"vortex",label:"Raíz de Caldera",vx:2.6,vy:-4.4,color:"#ff9a52",pull:1.12,twist:1.35}),
  "volcano>jungle":Object.freeze({kind:"vortex",label:"Respiración Verde",vx:-2.8,vy:-4.0,color:"#a8f29a",pull:1.05,twist:-1.1}),
  "space>reef":Object.freeze({kind:"vortex",label:"Pozo Astral",vx:2.2,vy:-3.6,color:"#b690ff",pull:1.22,twist:1.75}),
  "reef>space":Object.freeze({kind:"vortex",label:"Ascenso Abisal",vx:-2.1,vy:-4.2,color:"#8adfff",pull:1.18,twist:-1.5}),
});

export function traversalKey(from="",to=""){return String(from)+">"+String(to);}
export function traversalProfile(from="",to="",kind=""){
  const p=PROFILES[traversalKey(from,to)];
  if(p)return p;
  if(kind==="blackhole"||kind==="vortex")return Object.freeze({kind:"vortex",label:"Vórtice Ohana",vx:2.4,vy:-3.2,color:"#c9a0ff",pull:1,twist:1});
  return Object.freeze({kind:"catapult",label:"Catapulta Ohana",vx:5.5,vy:-7.5,color:"#ffc078",arc:"high"});
}

export function traversalNodeSnapshot(from="",portal=null){
  if(!portal)return null;
  const profile=traversalProfile(from,portal.dest,portal.type);
  return Object.freeze({
    from:String(from),to:String(portal.dest||""),kind:profile.kind,label:profile.label,
    vx:profile.vx,vy:profile.vy,color:profile.color,
  });
}
