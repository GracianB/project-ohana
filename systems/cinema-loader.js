// OHANA V367 · Rare cinema events load their scenes only when first needed.
// The three destination modules retain their original event listeners and APIs.
// Hold the triggering event while importing, then pass it to the same function.
// No extra threads, polling, timers, network backends or scene replacements.
export function installLazyCinema(eventName, modulePath, handler) {
  let loading=null;
  const pending=[];
  const launch=event=>{
    pending.push(event?.detail||{});
    if(loading)return;
    loading=import(modulePath).then(mod=>{
      removeEventListener(eventName,launch);
      const play=handler(mod);
      if(typeof play!=="function")throw new TypeError("Missing cinema handler for "+eventName);
      for(const detail of pending.splice(0))play(detail);
    }).catch(error=>{
      loading=null;
      pending.length=0;
      console.error("[OHANA] cinematic module",eventName,error);
    });
  };
  addEventListener(eventName,launch);
}
installLazyCinema("ohana-evolve","./evo-cinema.js",mod=>mod.playEvolution);
installLazyCinema("ohana-win","./ending.js",mod=>mod.showEnding);
installLazyCinema("ohana-supreme","./supreme-cinema.js",mod=>mod.supremeCinema.play);
