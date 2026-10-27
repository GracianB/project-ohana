import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
// Only chapter owners may be borrowed; returning to the lobby hero is always
// possible at a camp. No arbitrary roster menu, teleport or healing reset.
export function adventureCamp(roomId,x,y,progress){
 const room=WORLD1_ROOMS[roomId];if(!room||(!room.hero&&roomId!=='w1-final')||!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(Math.abs(y-1134)>210)return false;
 return x<=720||(room.seal?.stations||[]).some(s=>(progress?.stations?.[roomId]||[]).includes(s.id)&&(Math.abs(x-s.x)<180||Math.abs(x-(s.target?.x??s.x))<180));
}
export function adventureRoleAllowed(player,roomId,hero){
 const owner=WORLD1_ROOMS[roomId]?.hero;return !!WORLD1_ROOMS[roomId]&&(!!owner&&hero===owner||(!!owner||roomId==='w1-final')&&hero===(player.homeCharacterId||player.characterId));
}
