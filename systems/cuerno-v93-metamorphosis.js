// OHANA V93 · Cuerno: four authored transitions, not one generic particle blast.
// Draw-only ritual. No physics, hitboxes, damage, per-frame allocations or RNG.
export const CUERNO_V93_COLORS = Object.freeze([
  "#ffc2dd", "#ffd8ad", "#fff3c8", "#bdf0d2",
  "#b5e9ff", "#c9caff", "#e6c2f8",
]);
export const CUERNO_V93_NAMES = Object.freeze([
  "", "Nace un rostro", "Cuatro pasos", "Aprende a volar", "Aurora del corazón",
]);
const TAU = Math.PI * 2;
const bound = (n, lo, hi) => Math.max(lo, Math.min(hi,
  typeof n === "number" && Number.isFinite(n) ? n : lo));
const ease = k => 1 - (1 - k) ** 3;
const progress = (t, a, b) => bound((t-a)/Math.max(.001,b-a),0,1);

/**
 * Absolute timings come from the same T as the real evolution sequence.
 * A reduced-motion scene keeps the *full* silhouette readable and never pulses.
 */
export function cuernoMetamorphosisCues(evo, time, T, reduced = false) {
  const form = bound(Math.floor(evo), 1, 4);
  const t = bound(time, 0, 3600);
  const reveal = Number.isFinite(T?.reveal) ? T.reveal : 1;
  const flash = Number.isFinite(T?.flash) ? T.flash : reveal;
  const out = Number.isFinite(T?.out) ? T.out : reveal+1;
  const charge = Number.isFinite(T?.charge) ? T.charge : 0;
  const entrance = ease(progress(t, charge, flash));
  const born = ease(progress(t, reveal, reveal + (reduced ? .05 : .48)));
  const exit = 1 - progress(t, out, out+.26);
  return Object.freeze({
    form, entrance, born, opacity: bound(Math.max(entrance*.42,born*.92)*exit,0,1),
    sway: reduced ? 0 : Math.sin(t*2.1)*.035,
    phase: reduced ? 0 : t*.45,
    name: CUERNO_V93_NAMES[form],
  });
}
function stroke(ctx, color, alpha, width) {
  ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=width;
}
function hoof(ctx, x, y, scale, color, alpha) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  stroke(ctx,color,alpha,2);
  for (const dx of [-4.5,4.5]) {
    ctx.beginPath();ctx.ellipse(dx,0,3.7,6,0,0,TAU);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(-5,6);ctx.quadraticCurveTo(0,12,5,6);ctx.stroke();
  ctx.restore();
}
function horn(ctx,x,y,s,c,alpha) {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  stroke(ctx,c,alpha,2);
  ctx.beginPath();ctx.moveTo(-6,7);
  ctx.bezierCurveTo(-8,-1,-1,-18,0,-26);
  ctx.bezierCurveTo(4,-14,11,-2,6,7);
  ctx.stroke();
  stroke(ctx,"#fff8e5",alpha*.76,1);
  for(let j=0;j<3;j++){
    const yy=-15+j*6;
    ctx.beginPath();ctx.moveTo(-3,yy);ctx.quadraticCurveTo(0,yy-4,4,yy-2);ctx.stroke();
  }
  ctx.restore();
}
function wing(ctx,x,y,s,dir,color,alpha) {
  ctx.save();ctx.translate(x,y);ctx.scale(dir*s,s);
  stroke(ctx,color,alpha,2.2);
  // Root and six individual feather contours, connected to the same shoulder.
  ctx.beginPath();ctx.moveTo(0,0);
  ctx.bezierCurveTo(18,-18,36,-43,62,-51);
  ctx.quadraticCurveTo(48,-15,14,8);ctx.stroke();
  for(let i=0;i<5;i++){
    ctx.beginPath();ctx.moveTo(12+i*7,-8-i*5);
    ctx.quadraticCurveTo(30+i*5,-21-i*6,38+i*5,-33-i*4);
    ctx.stroke();
  }
  ctx.restore();
}
/** The ritual paints BEHIND the hero. No globalCompositeOperation = lighter:
 * black Aurora remains black rather than washed into a generic white flash. */
export function drawCuernoMetamorphosis(ctx,opts={}) {
  const {evo=1,t=0,timing={},cx=0,cy=0,target=120,fade=1,reduce=false} = opts;
  if(![cx,cy,target,fade].every(n=>typeof n==="number"&&Number.isFinite(n))||target<=0)return;
  const cue=cuernoMetamorphosisCues(evo,t,timing,reduce);
  const alpha=cue.opacity*bound(fade,0,1);
  if(alpha<.005)return;
  const r=bound(target*.73,18,360);
  const pulse=cue.sway*r;
  const x=cx,y=cy-r*.07;
  ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
  if(cue.form===1){
    // The original independent horn becomes a face, without inventing legs.
    for(let i=0;i<3;i++){
      stroke(ctx,CUERNO_V93_COLORS[(i*2)%7],alpha*(.26+i*.12),1.9);
      ctx.beginPath();ctx.ellipse(x,y,r*(.26+i*.11),r*(.31+i*.10),
        cue.sway,0,TAU);ctx.stroke();
    }
    horn(ctx,x,y-r*.46,.78,CUERNO_V93_COLORS[6],alpha*.88);
    for(const dx of [-1,1]) {
      stroke(ctx,"#fff9e6",alpha*.67,1.7);
      ctx.beginPath();ctx.arc(x+dx*r*.26,y-r*.08,r*.025,0,TAU);ctx.stroke();
    }
  }else if(cue.form===2){
    // Exactly four new hoofprints, each paired with a tiny root of light.
    for(let i=0;i<4;i++){
      const px=x+(i%2 ? 1:-1)*r*(.24+(i>>1)*.28);
      const py=y+r*(.28+(i>>1)*.20);
      hoof(ctx,px,py,Math.max(.62,r/90),CUERNO_V93_COLORS[i*2],alpha*(.68+i*.08));
      stroke(ctx,"#fff9e6",alpha*.30,1.5);
      ctx.beginPath();ctx.moveTo(px,py-r*.09);ctx.lineTo(px,py-r*.22);ctx.stroke();
    }
    stroke(ctx,CUERNO_V93_COLORS[5],alpha*.48,2);
    ctx.beginPath();ctx.ellipse(x,y+r*.40,r*.67,r*.14,0,0,TAU);ctx.stroke();
  }else if(cue.form===3){
    // The shoulder-rooted wings emerge symmetrically behind the unicorn.
    const grow=.6+.4*cue.born;
    wing(ctx,x-r*.12,y+r*.10,grow*r/80,-1,CUERNO_V93_COLORS[4],alpha*.85);
    wing(ctx,x+r*.12,y+r*.10,grow*r/80, 1,CUERNO_V93_COLORS[5],alpha*.90);
    stroke(ctx,"#fff5db",alpha*.51,1.8);
    ctx.beginPath();ctx.ellipse(x,y+r*.18,r*.47,r*.11,0,0,TAU);ctx.stroke();
  }else{
    // Seven distinct aurora arches protect a dark, fully grown silhouette.
    for(let i=0;i<7;i++){
      const wide=r*(.66+i*.043),height=r*(.57+i*.065);
      stroke(ctx,CUERNO_V93_COLORS[i],alpha*(.26+i*.048),1.8);
      ctx.beginPath();ctx.moveTo(x-wide,y+r*.48);
      ctx.bezierCurveTo(x-wide*.87,y-height+pulse,x+wide*.87,y-height-pulse,
        x+wide,y+r*.48);ctx.stroke();
    }
    for(let i=0;i<7;i++){
      const a=-Math.PI/2+i*TAU/7+(reduce?0:cue.phase*.08);
      horn(ctx,x+Math.cos(a)*r*.48,y+Math.sin(a)*r*.38,
        .40,CUERNO_V93_COLORS[i],alpha*.85);
    }
    stroke(ctx,"#fff2c9",alpha*.65,2.4);
    ctx.beginPath();ctx.ellipse(x,y+r*.55,r*.72,r*.18,0,0,TAU);ctx.stroke();
  }
  ctx.restore();
}
