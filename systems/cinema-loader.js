// OHANA V367: rare scenes are decoded on demand, never at first paint.
// Keep the authored event routes and original drawing functions intact.
const boundFlags={
  "ohana-evolve":"__ohanaEvoCinema",
  "ohana-win":"__ohanaWinBound",
  "ohana-supreme":"__ohanaSupremeCinema"
};
export function installLazyCinema(eventName,modulePath,handler){
  let loading=null;
  const pending=[];
  const launch=event=>{
    // A visual test or another module may preload the original cinema.
    // In that case its native event listener handles the same event.
    if(window[boundFlags[eventName]]){
      removeEventListener(eventName,launch);
      return;
    }
    pending.push(event?.detail||{});
    if(loading)return;
    loading=import(modulePath).then(mod=>{
      const play=handler(mod);
      if(typeof play!=="function")throw new TypeError("Missing cinema handler for "+eventName);
      removeEventListener(eventName,launch);
      for(const detail of pending.splice(0))play(detail);
    }).catch(error=>{
      // Failed import must leave a retry path, including an offline recovery.
      loading=null;
      pending.length=0;
      console.error("[OHANA] cinematic import/play",eventName,error);
    });
  };
  addEventListener(eventName,launch);
}
installLazyCinema("ohana-evolve","./evo-cinema.js",mod=>mod.playEvolution);
installLazyCinema("ohana-win","./ending.js",mod=>mod.showEnding);
installLazyCinema("ohana-supreme","./supreme-cinema.js",mod=>mod.supremeCinema.play);
