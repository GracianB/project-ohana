// Curated native Dino art only: no targets, damage, hit sets or callbacks.
const kinds=new Set(['dinoColossus','dinoFossil','dinoFossilMark','dinoFossilBlast','dinoSpit','dinoSplat','dinoWarning','meteor','quake']);
const scalars=['x','y','ox','oy','vx','vy','r','R','radius','rot','age','evo','warmup','pulseRadius','nextPulse','pulseGlow','delay','bounces','maxD','speed'];
const valid=n=>Number.isFinite(n)&&Math.abs(n)<=20000;
export function readDinoEffects(list){
 if(!Array.isArray(list)||list.length>16)return null;const out=[];
 for(const f of list){if(!f||!kinds.has(f.kind)||!Number.isFinite(f.life)||f.life<=0||f.life>280)return null;
 const origin=f.kind==='quake'?['ox','oy']:['x','y'];if(!origin.every(k=>valid(f[k])))return null;
 const v={kind:f.kind,life:f.life,max:Math.max(1,Math.min(280,Number(f.max)||f.life))};
 for(const k of scalars)if(f[k]!==undefined){if(!valid(f[k]))return null;v[k]=f[k];}
 if(['vx','vy'].some(k=>v[k]!==undefined&&Math.abs(v[k])>60))return null;
 for(const k of ['r','R','radius','pulseRadius'])if(v[k]!==undefined&&(v[k]<0||v[k]>1000))return null;
 v.evo=Math.max(0,Math.min(4,Math.floor(Number(v.evo)||0)));v.color=/^#[0-9a-f]{6}$/i.test(f.color)?f.color:'#c8f04a';v.dino=f.kind==='meteor';
 if(f.kind==='dinoSpit'){v.trail=(Array.isArray(f.trail)?f.trail:[]).slice(-6).map(b=>({x:b.x,y:b.y}));if(v.trail.some(b=>![b.x,b.y].every(valid)))return null;}
 if(f.kind==='quake'){if(!Number.isFinite(f.speed)||f.speed<=0||f.speed>30||!Number.isFinite(f.maxD)||f.maxD<0||f.maxD>1000)return null;if(!Array.isArray(f.fronts)||f.fronts.length>2||!Array.isArray(f.spikes)||f.spikes.length>64)return null;
 v.fronts=f.fronts.map(b=>({x:b.x,y:b.y,dir:b.dir,on:b.on===true}));if(v.fronts.some(b=>![b.x,b.y].every(valid)||![-1,1].includes(b.dir)||Math.abs(b.x-f.ox)>f.maxD+f.speed))return null;
 v.spikes=f.spikes.slice(-24).map(b=>({x:b.x,y:b.y,h:b.h,lean:b.lean,life:b.life}));if(v.spikes.some(b=>![b.x,b.y,b.h,b.lean,b.life].every(valid)||b.h<0||b.h>300||b.life<0||b.life>26))return null;
 }out.push(v);
 }return out;
}
export function advanceDinoEffects(list,move=true){for(const f of list||[]){f.life--;if(Number.isFinite(f.age))f.age++;if(f.warmup>0)f.warmup--;if(f.pulseGlow>0)f.pulseGlow--;if(f.nextPulse>0)f.nextPulse--;if(move&&['dinoSpit','dinoFossil','meteor'].includes(f.kind)){f.x+=f.vx||0;f.y+=f.vy||0;}if(move&&f.kind==='quake')for(const b of f.fronts||[])if(b.on&&Math.abs(b.x-f.ox)<f.maxD)b.x+=b.dir*f.speed;if(f.spikes)f.spikes=f.spikes.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);}return (list||[]).filter(f=>f.life>0);}
