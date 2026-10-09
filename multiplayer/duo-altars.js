// OHANA Contest · Cooperative two-plate rituals for all ten worlds.
// Shared with Netlify: success is verified using BOTH players' server positions.
// This module is deterministic and performs no rendering or network requests.
export const DUO_HOLD_MS=1200;
export const DUO_RADIUS=86;
export const DUO_ALTARS=Object.freeze({
 hub:Object.freeze({name:"Pacto del Claro",color:"#ffe7a5",pads:[400,740]}),
 beach:Object.freeze({name:"Marea de Dos",color:"#94f2e3",pads:[350,700]}),
 jungle:Object.freeze({name:"Raíces Gemelas",color:"#a9f6af",pads:[300,610]}),
 cave:Object.freeze({name:"Eco Compartido",color:"#b9c8ff",pads:[360,790]}),
 lab:Object.freeze({name:"Circuito Binario",color:"#ffe09b",pads:[400,800]}),
 ridge:Object.freeze({name:"Juramento del Viento",color:"#e8f7ff",pads:[330,710]}),
 space:Object.freeze({name:"Órbita Gemela",color:"#b5c7ff",pads:[310,700]}),
 reef:Object.freeze({name:"Latidos del Arrecife",color:"#94eee1",pads:[380,790]}),
 volcano:Object.freeze({name:"Brasas Hermanas",color:"#ffb789",pads:[370,840]}),
 boss:Object.freeze({name:"Valor de Familia",color:"#ffc5e3",pads:[350,820]}),
});
// Room personality: instructions intentionally require BOTH players, no specific hero.
export const DUO_CUES=Object.freeze({
 hub:"Dos promesas en el mismo claro",
 beach:"Dos mareas que laten juntas",
 jungle:"Dos raíces, un mismo árbol",
 cave:"Dos ecos despiertan el cristal",
 lab:"Dos circuitos, una sola chispa",
 ridge:"Dos valientes frente al viento",
 space:"Dos estrellas comparten órbita",
 reef:"Dos corazones bajo las olas",
 volcano:"Dos brasas hacen un hogar",
 boss:"Dos héroes mantienen la esperanza",
});
export function duoRitualProgress(room,now=Date.now()){
 const charge=room?.duoChannel;
 if(!charge?.roomId||!DUO_ALTARS[charge.roomId]||room?.duoAltars?.[charge.roomId])return null;
 const elapsed=Math.max(0,Math.min(DUO_HOLD_MS,Number(now)-Number(charge.startedAt)));
 if(!duoPlateState(room.players,charge.roomId,now)?.ready)return null;
 return Object.freeze({
  roomId:charge.roomId,elapsedMs:elapsed,durationMs:DUO_HOLD_MS,
  ratio:elapsed/DUO_HOLD_MS,startedAt:charge.startedAt,
 });
}
const finite=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const same=(player,pad)=>Math.abs(finite(player?.x,-9999)-pad)<=DUO_RADIUS&&Math.abs(finite(player?.y,-9999)-1070)<=150;
export function duoPlateState(players=[],roomId="beach",now=Date.now(),freshMs=2200){
 const altar=DUO_ALTARS[roomId];if(!altar)return null;
 const live=players.filter(p=>p&&p.connected&&Number(p.health)>0&&p.worldRoomId===roomId&&Number(now)-finite(p.lastSeenAt,-1e9)>=0&&Number(now)-finite(p.lastSeenAt,-1e9)<=freshMs);
 const a=live.find(p=>same(p,altar.pads[0])),b=live.find(p=>p!==a&&same(p,altar.pads[1]));
 const alternateA=live.find(p=>same(p,altar.pads[1])),alternateB=live.find(p=>p!==alternateA&&same(p,altar.pads[0]));
 return Object.freeze({roomId,ready:!!((a&&b)||(alternateA&&alternateB)),
  occupied:altar.pads.map(x=>live.some(p=>same(p,x))),altar});
}
export function progressDuoRitual(room,roomId,now){
 const current=room.duoAltars||(room.duoAltars={});
 if(current[roomId])return Object.freeze({status:"already",completed:true});
 const state=duoPlateState(room.players,roomId,now);
 if(!state?.ready){
  delete room.duoChannel;
  return Object.freeze({status:"waiting",completed:false});
 }
 const existing=room.duoChannel;
 if(!existing||existing.roomId!==roomId||existing.startedAt>now){
  room.duoChannel={roomId,startedAt:now};
  return Object.freeze({status:"charging",completed:false,progress:0});
 }
 const elapsed=Math.max(0,now-existing.startedAt);
 if(elapsed<DUO_HOLD_MS)return Object.freeze({status:"charging",completed:false,progress:elapsed/DUO_HOLD_MS});
 current[roomId]=now;
 room.duoChannel=null;
 return Object.freeze({status:"lit",completed:true,roomId,altar:state.altar});
}
