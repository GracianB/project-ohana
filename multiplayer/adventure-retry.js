import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {findRoster} from '../characters/roster.js';
export const retryEpoch=room=>room?.adventureRetry?.epoch||0;
export function retrySpawn(room,slot){
 const id=room.players[0]?.worldRoomId;
 if(id==='w1-final')return{x:8600+slot*100,floor:1134};
 const authored=WORLD1_ROOMS[id],done=new Set(room.adventureProgress?.stations?.[id]||[]);
 const checkpoint=authored?.seal?.stations.filter(s=>s.kind!=='oven'&&done.has(s.id)).at(-1);
 return{x:checkpoint?(checkpoint.target?.x||checkpoint.x)+slot*80:420+slot*100,floor:1134};
}
export function startAdventureRetry(room,by){
 const previous=room.adventureRetry;
 room.adventureRetry={epoch:retryEpoch(room)+1,status:'down',roomId:by.worldRoomId,ready:[]};
 room.travel=null;room.travelClosed={id:previous?.id||'retry',reason:'defeat'};room.duoChannel=null;
 for(const p of room.players)p.health=0;
 if(room.combat){room.combat.events=[];room.combat.lastEvent=null;}
 return room.adventureRetry;
}
export function finishAdventureRetry(room){
 const retry=room.adventureRetry;
 if(retry?.status!=='down'||room.players.length!==2||room.players.some(p=>!p.connected||!retry.ready.includes(p.id)))return false;
 for(const p of room.players){const f=findRoster(p.characterId).forms[Math.max(0,Math.min(4,p.evolution||0))],spawn=retrySpawn(room,p.slot);Object.assign(p,{health:f.hp,maxHealth:f.hp,x:spawn.x,y:spawn.floor-f.h,pose:{vx:0,vy:0,grounded:true,melee:0,dash:0}});}
 if(room.adventureFinale){const f=room.adventureFinale;room.adventureFinale={found:[...f.found],phase:f.found.length===10?'complete':'dormant',hero:null,guardian:null,boss:null,cue:null,seen:[...(f.seen||[])],finished:[...(f.finished||[])],shots:[],director:null,won:false,complete:false,revision:f.revision+1};}
 retry.status='active';return true;
}
