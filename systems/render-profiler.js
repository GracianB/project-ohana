// OHANA V366: fixed-memory render profiling. Local only, zero network calls.
// The simulation, inputs and WebRTC never depend on this diagnostic data.
const LIMIT = 120;
export function createRenderProfiler() {
  const frames = new Float32Array(LIMIT), renders = new Float32Array(LIMIT);
  let head=0, count=0, lastFrame=null, maxRender=0, total=0;
  function percentile(buffer, fraction) {
    if (!count) return 0;
    const values=Array.from(buffer.subarray(0,count)).sort((a,b)=>a-b);
    return Math.round(values[Math.min(count-1,Math.ceil(count*fraction)-1)]*10)/10;
  }
  return {
    sample(now, renderMs) {
      if (!Number.isFinite(now) || !Number.isFinite(renderMs) || renderMs<0) return;
      const dt=lastFrame===null ? 0 : now-lastFrame;
      lastFrame=now;
      // Ignore tab resumes/paused gaps to avoid misleading 0 FPS results.
      if (!(dt>0 && dt<160)) return;
      frames[head]=dt; renders[head]=renderMs;
      head=(head+1)%LIMIT;
      count=Math.min(LIMIT,count+1);
      total++;
      if (renderMs>maxRender) maxRender=renderMs;
    },
    snapshot({dpr=1,mode="quality"}={}) {
      if (!count) return {samples:0,fps:0,frameP95Ms:0,renderP50Ms:0,renderP95Ms:0,maxRenderMs:0,dpr,mode};
      let elapsed=0;
      for(let i=0;i<count;i++)elapsed+=frames[i];
      return {
        samples:count,totalFrames:total,
        fps:Math.round(1000*count/elapsed),
        frameP95Ms:percentile(frames,.95),
        renderP50Ms:percentile(renders,.5),
        renderP95Ms:percentile(renders,.95),
        maxRenderMs:Math.round(maxRender*10)/10,
        dpr,mode
      };
    },
    reset() {head=0;count=0;lastFrame=null;maxRender=0;total=0;}
  };
}
