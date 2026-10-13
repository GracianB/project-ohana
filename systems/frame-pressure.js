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


// Start mobile devices with very limited resources at DPR 1. Runtime frame
// pressure can still override this for every platform. Never guess based only
// on screen size: a modern phone should keep its sharper authored drawings.
export function initialCanvasPressure({width=1280,height=720,touch=false,memoryGB=null,cores=null}={}) {
 const handheld=touch && Math.min(width,height)<=600;
 if(!handheld)return false;
 const memory=Number(memoryGB),cpus=Number(cores);
 const lowMemory=memory>0 && memory<=2;
 const lowCpu=cpus>0 && cpus<=2;
 return lowMemory||lowCpu;
}

// Recovery requires sustained fast frames and a long minimum cooldown.
// Pauses and background transitions cannot be treated as healthy frames.
export function createResolutionRecovery({cooldownMs=12000,stableFrames=240,fastFrameMs=21}={}) {
 let previous=null,lastReduction=-Infinity,stable=0;
 return {
   reducedAt(now) {lastReduction=now;previous=null;stable=0;},
   observe(now) {
     if(!Number.isFinite(now))return false;
     if(previous===null){previous=now;return false;}
     const dt=now-previous;previous=now;
     if(dt<=0||dt>160){stable=0;return false;}
     stable=dt<=fastFrameMs ? stable+1 : Math.max(0,stable-5);
     if(now-lastReduction>=cooldownMs&&stable>=stableFrames){
       stable=0;previous=null;return true;
     }
     return false;
   },
   pause() {previous=null;stable=0;},
   snapshot(){return {stable,lastReduction};}
 };
}
