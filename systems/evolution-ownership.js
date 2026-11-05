// V637 · Owned evolutions are a persistent unlock ceiling, separate from the
// creature currently equipped. Legacy save v2/v3 has only `evo` and is
// migrated without giving away forms the player did not earn.
const owned = n => Number.isFinite(n) ? Math.max(0,Math.min(4,Math.floor(n))) : 0;
export function unlockedEvolution(save) {
 if (!save || typeof save !== 'object') return 0;
 return Math.max(owned(Number(save.evo)),owned(Number(save.maxEvo)));
}
export function mayEquipEvolution(player, form) {
 return !!player && player.id==='cat' && Number.isInteger(form)
   && form>=0 && form<=unlockedEvolution({evo:player.evo,maxEvo:player.maxUnlockedEvo});
}
export function equipOwnedEvolution(player, form, applyForm) {
 if(!mayEquipEvolution(player,form) || typeof applyForm!=='function')return false;
 const unlocked=unlockedEvolution({evo:player.evo,maxEvo:player.maxUnlockedEvo});
 if(player.evo===form){player.maxUnlockedEvo=unlocked;return true;}
 const feet=(Number(player.y)||0)+(Number(player.h)||0);
 const oldMax=Number(player.maxHealth)||1;
 const healthRatio=Math.max(0,Math.min(1,(Number(player.health)||0)/oldMax));
 const xp=player.xp;
 player.evo=form;
 applyForm(player,{silent:true});
 player.maxUnlockedEvo=unlocked;
 player.xp=xp; // switching a look must never grant or erase XP
 player.y=feet-(Number(player.h)||0);
 player.health=Math.min(player.maxHealth,Math.max(1,Math.round(player.maxHealth*healthRatio)));
 return true;
}
