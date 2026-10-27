// Cooperative engine progress is separate from the solo profile. The host
// remains combat authority; either authenticated teammate can solve a puzzle.
import {WORLD1_ROOMS,WORLD1_ORDER} from '../systems/world1-rooms.js';
const empty=()=>({stations:{},secrets:{},encounters:{},seals:[]});
const ids=(values,allowed)=>Array.isArray(values)?[...new Set(values.filter(id=>allowed(id)))]:[];
const union=(a=[],b=[])=>[...new Set([...a,...b])];
export function adventureRoomProgress(game){
 const roomId=game?.roomId,r=WORLD1_ROOMS[roomId];if(!r?.hero)return null;
 return {roomId,stations:(game.world1?.stations||[]).filter(s=>s.done&&s.kind!=='oven').map(s=>s.id),
 secrets:game.secrets?.[roomId]||[],encounters:game.clearedEncounters?.[roomId]||[],sealed:!!game.world1?.sealed};
}
export function mergeAdventureProgress(previous,payload,{roomId,host=false}={}){
 const r=WORLD1_ROOMS[roomId];
 if(!r?.hero||payload?.roomId!==roomId)return previous||empty();
 const next=structuredClone(previous||empty()),stations=new Set(r.seal.stations.filter(s=>s.kind!=='oven').map(s=>s.id));
 const stationIds=ids(payload.stations,id=>stations.has(id));
 const secretIds=ids(payload.secrets,id=>typeof id==='string'&&id.length<=96&&id.startsWith(roomId+'-')&&/^[\w-]+$/.test(id)).slice(0,64);
 // Encounter receipts are host-only, as are the guardian and final seal.
 const encounterIds=host?ids(payload.encounters,id=>typeof id==='string'&&id.length<=96&&id.startsWith(roomId+'-')&&/^[\w-]+$/.test(id)).slice(0,64):[];
 next.stations[roomId]=union(next.stations[roomId],stationIds);
 next.secrets[roomId]=union(next.secrets[roomId],secretIds).slice(0,64);
 next.encounters[roomId]=union(next.encounters[roomId],encounterIds).slice(0,64);
 const discoveries=r.expedition?.nodes||[];
 if(host&&payload.sealed===true&&next.stations[roomId].length===stations.size&&discoveries.every(n=>next.secrets[roomId].includes(n.id))&&next.encounters[roomId].length>0)
  next.seals=WORLD1_ORDER.filter(h=>next.seals.includes(h)||h===r.hero);
 return next;
}
export function applyAdventureProgress(game,progress){
 if(!game?.onlineAdventure||!progress)return false;
 const r=WORLD1_ROOMS[game.roomId],w=game.world1;
 game.world1Stations||={};game.secrets||={};game.clearedEncounters||={};
 for(const hero of WORLD1_ORDER){const room='w1-'+hero;
  game.world1Stations[room]=union(game.world1Stations[room],progress.stations?.[room]);
  game.secrets[room]=union(game.secrets[room],progress.secrets?.[room]);
  game.clearedEncounters[room]=union(game.clearedEncounters[room],progress.encounters?.[room]);
 }
 game.world1Seals=WORLD1_ORDER.filter(h=>(game.world1Seals||[]).includes(h)||(progress.seals||[]).includes(h));
 if(!r?.hero||w?.room!==game.roomId){if(w?.statuesLit)w.statuesLit=(r.statues||[]).map(s=>game.world1Seals.includes(s.hero));return game.roomId==='w1-final';}
 const completed=new Set(game.world1Stations[game.roomId]);
 for(const s of w.stations)if(completed.has(s.id)){s.done=true;s._scored=true;s.hold=0;}
 if(['prismas','cadena'].includes(w.kind))w.order=w.stations.filter(s=>s.done).length;
 if(game.expedition)game.expedition.done=(r.expedition?.nodes||[]).filter(n=>game.secrets[game.roomId].includes(n.id)).map(n=>n.id);

 if(game.world1Seals.includes(r.hero)&&!w.sealed){w.sealed=true;game.onWorld1Beat?.('seal',r.hero);}
 return true;
}
export function createAdventureStorage(){
 const entries=new Map();return {getItem:key=>entries.get(String(key))??null,setItem:(key,value)=>entries.set(String(key),String(value)),removeItem:key=>entries.delete(String(key))};
}
