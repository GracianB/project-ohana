// OHANA performance: predictable canvas cost and adaptive fallback.
// Never throttle player input, multiplayer networking or simulation itself.
export function canvasDpr(width,height,deviceDpr=1,reduced=false,pressure=false){
 const requested=Math.min(1.25,Math.max(1,Number(deviceDpr)||1));
 const area=Math.max(0,Number(width)||0)*Math.max(0,Number(height)||0);
 if(reduced||pressure||area>=1_200_000)return 1;
 if(area>=650_000)return Math.min(1.1,requested);
 return requested;
}
export function createFramePressureMonitor({windowFrames=48,lagThresholdMs=27,slowFramesToReduce=17}={}){
 let previous=null,seen=0,slow=0,lowered=false;
 return {
   observe(now){
     if(lowered||!Number.isFinite(now))return false;
     if(previous===null){previous=now;return false;}
     const duration=now-previous;previous=now;
     // Tab switches and breakpoint pauses are not sustained device pressure.
     if(duration<0||duration>160){seen=0;slow=0;return false;}
     seen++;
     if(duration>lagThresholdMs)slow++;
     if(seen<windowFrames)return false;
     lowered=slow>=slowFramesToReduce;
     seen=0;slow=0;
     return lowered;
   },
   snapshot(){return {lowered,seen,slow};},
   reset(){previous=null;seen=0;slow=0;lowered=false;}
 };
}
