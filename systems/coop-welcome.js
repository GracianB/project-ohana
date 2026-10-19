// The lobby has already introduced and selected both heroes. A title modal
// must not freeze a live original-engine session or its RTC signaling ticks.
export function shouldSkipCoopWelcome(search,rawSession,replay=false){
 if(replay||new URLSearchParams(search).get('online')!=='1')return false;
 try{const s=typeof rawSession==='string'?JSON.parse(rawSession):rawSession;return s?.originalEngine===true&&typeof(s.characterId||s.selectedCharacterId)==='string';}catch{return false;}
}
