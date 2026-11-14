// Umbrales absolutos de XP para pasar a la forma siguiente.
// Índice = forma actual. GOD (4) no tiene siguiente.
export const XP_NEED = [0, 55, 140, 260, 420];

// An explicit Atlas choice replays an earned chapter from the chosen form.
// Historical objectives are not newly earned XP; later objectives still reward
// their XP difference, and combat/exploration XP remains untouched.
export function selectedStartingForm(game) {
 const c=game?._startFormChoice;
 return c&&c.hero===game.player?.id&&c.room===game.roomDef?.id?c:null;
}
export function applyChapterXpFloor(game,floor) {
 const p=game?.player;if(!p)return floor;
 const c=selectedStartingForm(game);
 if(c){
  if(game.world1?.sealed){c.baselineFloor=XP_NEED[4];c.lastFloor=XP_NEED[4];return floor;}
  if(c.baselineFloor==null){c.baselineFloor=floor;c.lastFloor=floor;}
  if(c.baselineFloor>0){
   p.xp=Math.max(0,Number(p.xp)||0)+Math.max(0,floor-c.lastFloor);
   c.lastFloor=Math.max(c.lastFloor,floor);return floor;
  }
 }
 p.xp=Math.max(Number(p.xp)||0,floor);return floor;
}
export function cleanStartingFormChoice(raw,hero,room) {
 if(!raw||raw.hero!==hero||raw.room!==room||room!=='w1-'+hero||
  !XP_NEED.includes(raw.baselineFloor)||!XP_NEED.includes(raw.lastFloor)||raw.lastFloor<raw.baselineFloor)return null;
 return {hero,room,baselineFloor:raw.baselineFloor,lastFloor:raw.lastFloor};
}
