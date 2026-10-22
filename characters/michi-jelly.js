// OHANA V461 · Michicornio dream genome + living-jelly anatomy kit.
// Pure Canvas 2D: no gradients, no images, no RNG at draw time. A run seed
// picks ONE curated dream palette and per-tentacle rhythm; seed 0 is canonical.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=u=>{const x=clamp(u,0,1);return x*x*(3-2*x);};

// Every palette is hand-tuned so that ANY seed reads as a finished design.
export const MICHI_DREAM_PALETTES=Object.freeze([
 Object.freeze({id:'luna',  name:'Luna de nácar',  glow:'#bfe9ff',glow2:'#e7c9ff',bell:'#eef6ff',deep:'#b7c6f2',rim:'#fffaff',gonad:'#f3b2e2',bead:'#fff3c4',arm:'#dcc6ff',tip:'#fff8df',ink:'#4a3d6e',spot:'#fff9d6'}),
 Object.freeze({id:'aurora',name:'Aurora boreal', glow:'#9ff5e3',glow2:'#ffc2ea',bell:'#ebfffb',deep:'#a9dfe6',rim:'#f7fffd',gonad:'#ff9fd2',bead:'#d9fff4',arm:'#b9f1ea',tip:'#fffbe9',ink:'#3a4a6a',spot:'#c8fff0'}),
 Object.freeze({id:'coral', name:'Coral del alba', glow:'#ffd3bd',glow2:'#ffb5d2',bell:'#fff3ef',deep:'#f2c1cf',rim:'#fffaf6',gonad:'#ff9db4',bead:'#ffe9c6',arm:'#ffcfdc',tip:'#fff6e4',ink:'#5a3a5c',spot:'#fff0c9'}),
 Object.freeze({id:'abismo',name:'Abismo estelar', glow:'#8fd6ff',glow2:'#b9a4ff',bell:'#e7efff',deep:'#9fb0ee',rim:'#f4f6ff',gonad:'#c79bff',bead:'#c9f2ff',arm:'#b6c2ff',tip:'#eefcff',ink:'#33335e',spot:'#bff3ff'}),
 Object.freeze({id:'eclipse',name:'Oro de eclipse',glow:'#ffe7a8',glow2:'#e9c6ff',bell:'#fff9ef',deep:'#e6cfa8',rim:'#fffdf4',gonad:'#f5b779',bead:'#fff1b5',arm:'#f2dcb4',tip:'#fffbe8',ink:'#4d3b5c',spot:'#fff2b0'})
]);
export const MICHI_CINE_MOTIFS=Object.freeze(['marea','capullo','constelacion','aurora']);

function hash(seed){let h=2166136261^(seed>>>0);h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^h>>>16)>>>0;}
export function michiRng(seed){let a=hash(seed)||0x9e3779b9;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}

const CANON_SPOTS=Object.freeze([[-.52,.42,.07],[-.18,.22,.05],[.26,.30,.06],[.55,.5,.05],[.02,.55,.045],[-.35,.68,.04],[.38,.72,.04]]);
const cache=new Map();
export function michiGenome(seed){
 const key=Number.isFinite(Number(seed))?(Number(seed)>>>0):0;
 if(cache.has(key))return cache.get(key);
 let g;
 if(!key){
  g={seed:0,palette:MICHI_DREAM_PALETTES[0],paletteIndex:0,
   phases:Array.from({length:9},(_,i)=>i*.93),lengths:Array.from({length:9},(_,i)=>1+((i*37)%5-2)*.025),
   spots:CANON_SPOTS,motif:0,tailCurl:0,pulseRate:1,pulsePhase:0,moteSeeds:Array.from({length:10},(_,i)=>(i*.618)%1),freckles:1};
 }else{
  const r=michiRng(key);
  const paletteIndex=Math.floor(r()*MICHI_DREAM_PALETTES.length);
  const phases=Array.from({length:9},()=>r()*TAU);
  const lengths=Array.from({length:9},()=>.9+r()*.2);
  // Blue-noise spots inside the bell: never clumped, never touching the rim.
  const spots=[];for(let n=0;n<60&&spots.length<7;n++){
   const x=r()*1.3-.65,y=.18+r()*.6,rad=.035+r()*.04;
   if(x*x/.45+(y-.45)**2/.2>1)continue;
   if(spots.every(s=>Math.hypot(s[0]-x,s[1]-y)>.24))spots.push([x,y,rad]);
  }
  while(spots.length<5)spots.push(CANON_SPOTS[spots.length]);
  g={seed:key,palette:MICHI_DREAM_PALETTES[paletteIndex],paletteIndex,phases,lengths,spots,
   motif:Math.floor(r()*MICHI_CINE_MOTIFS.length),tailCurl:r()*1.6-.8,pulseRate:.88+r()*.24,
   pulsePhase:r(),moteSeeds:Array.from({length:10},()=>r()),freckles:r()<.5?0:1};
 }
 g=Object.freeze(g);
 if(cache.size>63)cache.delete(cache.keys().next().value);
 cache.set(key,g);return g;
}

// Real jellyfish rhythm: fast contraction (28 %), slow elastic recovery.
export function jellyPulse(t,genome,still=false){
 if(still)return {c:0,u:0,thrust:0};
 const rate=(genome?.pulseRate||1)*.0105,u=((t*rate+(genome?.pulsePhase||0))%1+1)%1;
 const c=u<.28?smooth(u/.28):1-smooth((u-.28)/.72);
 return {c,u,thrust:u<.28?1-u/.28:0};
}

// Tapered ribbon along a polyline; widths per point. One fill, no gradient.
export function ribbon(ctx,pts,widths,fill,edge,edgeWidth=1){
 const n=pts.length;if(n<2)return;
 const L=[],Rt=[];
 for(let i=0;i<n;i++){
  const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];
  let dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  const w=widths[i]*.5;L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);Rt.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);
 }
 ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);
 for(let i=1;i<n;i++){const m=[(L[i-1][0]+L[i][0])/2,(L[i-1][1]+L[i][1])/2];ctx.quadraticCurveTo(L[i-1][0],L[i-1][1],m[0],m[1]);}
 ctx.lineTo(L[n-1][0],L[n-1][1]);
 const tip=pts[n-1];ctx.quadraticCurveTo(tip[0]+(tip[0]-pts[n-2][0])*.6,tip[1]+(tip[1]-pts[n-2][1])*.6,Rt[n-1][0],Rt[n-1][1]);
 for(let i=n-2;i>=0;i--){const m=[(Rt[i+1][0]+Rt[i][0])/2,(Rt[i+1][1]+Rt[i][1])/2];ctx.quadraticCurveTo(Rt[i+1][0],Rt[i+1][1],m[0],m[1]);}
 ctx.lineTo(Rt[0][0],Rt[0][1]);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}
 if(edge){ctx.strokeStyle=edge;ctx.lineWidth=edgeWidth;ctx.lineJoin='round';ctx.stroke();}
}

// A swimming tentacle: travelling wave from root to tip, root stays fixed.
export function tentaclePoints(o){
 const {x,y,len,phase=0,t=0,amp=6,sway=0,lift=0,curl=0,dir=Math.PI/2,segs=11,still=false,speed=1}=o;
 const pts=[];const cx=Math.cos(dir),cy=Math.sin(dir);
 for(let k=0;k<=segs;k++){
  const s=k/segs,wave=still?Math.sin(phase+s*2.2)*amp*.25*s:Math.sin(t*.075*speed-s*5.4+phase)*amp*Math.min(1,s*1.8)*(.45+.6*s);
  const along=len*s*(1-lift*.22*s);
  const side=wave+sway*s*s+curl*len*.28*s*s*s;
  pts.push([x+cx*along-cy*side,y+cy*along+cx*side]);
 }
 return pts;
}
export function drawTentacle(ctx,o){
 const pts=tentaclePoints(o),n=pts.length,w=o.width||4;
 const widths=pts.map((_,i)=>Math.max(.5,w*(1-i/(n-1)*.84)));
 ctx.save();ctx.globalAlpha*=o.alpha??1;
 ribbon(ctx,pts,widths,o.fill,o.edge,o.edgeWidth||1);
 if(o.core){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<n;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.strokeStyle=o.core;ctx.lineWidth=Math.max(.6,w*.22);ctx.lineCap='round';ctx.globalAlpha*=.75;ctx.stroke();}
 ctx.restore();
 if(o.beads){ctx.save();ctx.globalAlpha*=(o.alpha??1)*(o.beadAlpha??.9);ctx.fillStyle=o.beads;
  for(let i=2;i<n;i+=3){ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],Math.max(.7,widths[i]*.32),0,TAU);ctx.fill();}ctx.restore();}
 return pts[n-1];
}

// Soft glow without gradients: three nested translucent ellipses.
export function halo(ctx,x,y,rx,ry,color,strength=1){
 ctx.save();ctx.fillStyle=color;
 for(const [k,a] of [[1.32,.035],[1.16,.05],[1.03,.07]]){ctx.globalAlpha=a*strength;ctx.beginPath();ctx.ellipse(x,y,rx*k,ry*k,0,0,TAU);ctx.fill();}
 ctx.restore();
}

// Rising bioluminescent motes; deterministic from clock + genome.
export function motes(ctx,t,genome,{x=0,y=0,spread=40,height=90,count=7,color='#fff',size=1.6,strength=1,still=false}={}){
 ctx.save();ctx.fillStyle=color;
 for(let i=0;i<count;i++){
  const s=genome.moteSeeds[i%genome.moteSeeds.length];
  const u=still?(s*.8+.1):((t*.0042*(1+s*.7)+s)%1);
  const px=x+(s-.5)*spread*2+(still?0:Math.sin(t*.031+i*1.7)*spread*.18);
  const py=y-u*height;
  ctx.globalAlpha=Math.sin(Math.PI*u)*.85*strength;
  const r=size*(.7+s*.6);
  ctx.beginPath();ctx.moveTo(px,py-r*1.6);ctx.lineTo(px+r*.7,py);ctx.lineTo(px,py+r*1.6);ctx.lineTo(px-r*.7,py);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}

// Moon-jelly (Aurelia) bell seen from the side: translucent umbrella,
// subumbrella, four horseshoe gonads, radial canals, scalloped rim and
// marginal fringe. Returns rim anchor points for the tentacles.
export function drawJellyBell(ctx,o){
 const {x=0,y=0,w=42,h=60,pal,t=0,c=0,still=false,ink,spots=[],alpha=.78,glow=1,lobes=8,flash=0}=o;
 const sx=1-.1*c,sy=1+.075*c,W=w*sx,H=h*sy,rim=y,top=y-H;
 const ripple=k=>still?0:Math.sin(t*.09+k*1.3)*1.3*(1-c*.4);
 const dome=()=>{
  ctx.beginPath();ctx.moveTo(x-W,rim);
  ctx.bezierCurveTo(x-W*1.04,rim-H*.62,x-W*.62,top,x,top);
  ctx.bezierCurveTo(x+W*.62,top,x+W*1.04,rim-H*.62,x+W,rim);
  for(let k=lobes;k>0;k--){const x1=x-W+2*W*(k-.5)/lobes,x0=x-W+2*W*(k-1)/lobes;ctx.quadraticCurveTo(x1,rim+5.5+ripple(k)+c*1.5,x0,rim);}
  ctx.closePath();
 };
 halo(ctx,x,rim-H*.48,W*1.08,H*.72,pal.glow,glow);
 ctx.save();
 // Umbrella body, translucent so tentacles and arms read through it.
 dome();ctx.globalAlpha=alpha;ctx.fillStyle=pal.bell;ctx.fill();
 ctx.globalAlpha=1;
 // Subumbrella cavity.
 ctx.beginPath();ctx.ellipse(x,rim-H*.14,W*.8,H*.3,0,Math.PI,TAU);ctx.globalAlpha=.3;ctx.fillStyle=pal.deep;ctx.fill();
 // Inner luminous mesoglea: keeps the face area bright and readable.
 ctx.globalAlpha=.55;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(x,rim-H*.42,W*.66,H*.4,0,0,TAU);ctx.fill();
 ctx.globalAlpha=.35;ctx.fillStyle=pal.glow;ctx.beginPath();ctx.ellipse(x,top+H*.3,W*.5,H*.22,0,0,TAU);ctx.fill();
 // Four horseshoe gonads crown the bell (moon-jelly signature), above any face.
 ctx.globalAlpha=.85;ctx.strokeStyle=pal.gonad;ctx.lineWidth=Math.max(1.8,W*.07);ctx.lineCap='round';
 for(let k=0;k<4;k++){const gx=x+(k-1.5)*W*.27,gy=top+H*(k===1||k===2?.2:.27),gr=W*.085;
  ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI*.2,Math.PI*1.8,false);ctx.stroke();}
 // Radial canals run down the sides of the umbrella, leaving the face clear.
 ctx.globalAlpha=.42;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.1;
 for(const k of [-4,-3,-2,2,3,4]){ctx.beginPath();ctx.moveTo(x+k*W*.07,top+H*.12);ctx.quadraticCurveTo(x+k*W*.2,rim-H*.55,x+k*W*.235,rim-1);ctx.stroke();}
 // Bioluminescent freckles brighten on each contraction.
 ctx.fillStyle=pal.spot;
 for(const [u,v,r] of spots){const px=x+u*W*.92,py=top+v*H*.9;if(Math.abs(u)<.45&&v>.32)continue;ctx.globalAlpha=.5+.45*c;ctx.beginPath();ctx.arc(px,py,Math.max(1,r*W*.8),0,TAU);ctx.fill();}
 // Outline + bright scalloped margin.
 dome();ctx.globalAlpha=.9;ctx.strokeStyle=ink;ctx.lineWidth=2.2;ctx.stroke();
 ctx.globalAlpha=.95;ctx.strokeStyle=pal.rim;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(x-W*.92,rim-2.5);ctx.quadraticCurveTo(x,rim+3+c*2,x+W*.92,rim-2.5);ctx.stroke();
 // Specular crescent.
 ctx.globalAlpha=.85;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.6;
 ctx.beginPath();ctx.ellipse(x-W*.18,top+H*.36,W*.55,H*.28,-.25,Math.PI*1.08,Math.PI*1.52);ctx.stroke();
 ctx.fillStyle='#ffffff';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x-W*.5,top+H*.42,1.8,0,TAU);ctx.fill();
 // Marginal fringe: short hairs that ripple with the swim.
 ctx.globalAlpha=.55;ctx.strokeStyle=pal.glow;ctx.lineWidth=1;
 for(let k=0;k<=14;k++){const fx=x-W*.95+k*W*1.9/14,wave=still?0:Math.sin(t*.12+k*.9)*2;
  ctx.beginPath();ctx.moveTo(fx,rim+1.5);ctx.quadraticCurveTo(fx+wave,rim+5,fx+wave*1.6,rim+8+c*1.5);ctx.stroke();}
 if(flash>0){dome();ctx.globalAlpha=flash*.35;ctx.fillStyle='#ff9ab8';ctx.fill();}
 ctx.restore();
 return {W,H,rim,top,anchors:Array.from({length:9},(_,i)=>[x-W*.86+i*W*1.72/8,rim+2])};
}
