// OHANA V97 · Accessible events, not 60 live-region messages per second.
// Pure, deterministic reducer: sends discrete gameplay transitions only.
const ratio=(hp,max)=>Math.max(0,Math.min(1,(Number.isFinite(hp)?hp:0)/
 Math.max(1,Number.isFinite(max)?max:1)));
export function accessibleGameSnapshot(player={},boss=null){
 return Object.freeze({
  id:String(player?.id||""),
  evo:Math.max(0,Math.min(4,Math.floor(Number(player?.evo)||0))),
  health:ratio(player?.health,player?.maxHealth),
  bossPhase:boss?Math.max(1,Math.min(3,Math.floor(Number(boss.phase)||1))):0,
 });
}
export function advanceAccessibleGameState(previous,current){
 const state=current||accessibleGameSnapshot();
 // A new hero (or fresh session) gets one silent initialization.
 if(!previous || previous.id!==state.id || !state.id){
  return {state:{...state,lowHealth:state.health<=.25},message:""};
 }
 let message="";
 const wasLow=!!previous.lowHealth;
 const lowHealth=wasLow?state.health<.45:state.health<=.25;
 if(state.evo>previous.evo){
  message="Nueva evolución. Forma "+(state.evo+1)+" de 5.";
 }else if(state.bossPhase>previous.bossPhase){
  message=previous.bossPhase===0?"Reina del Nido. Comienza el enfrentamiento.":
   "La Reina del Nido cambia a la fase "+state.bossPhase+".";
 }else if(!wasLow&&lowHealth){
  message="Salud crítica. Busca una recuperación.";
 }else if(wasLow&&!lowHealth){
  message="Salud recuperada. Puedes continuar.";
 }
 return {state:{...state,lowHealth},message};
}
let session=null;
export function announceAccessibleGameState(doc,player,boss){
 const live=doc?.getElementById?.("a11y-game-announcements");
 if(!live)return "";
 const result=advanceAccessibleGameState(session,accessibleGameSnapshot(player,boss));
 session=result.state;
 if(result.message&&live.textContent!==result.message)live.textContent=result.message;
 return result.message;
}
export function resetAccessibleGameState(){session=null;}
