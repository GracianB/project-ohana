// Metamorfosis de Yomi, guardiana del santuario. Todas las capas son Canvas
// determinista y conservan el mismo tiempo y los mismos puntos de salto.
import {ROSTER} from '../../characters/roster.js';
import {drawEvolutionActor} from './real-actor.js';
export const EVO_CINE_DURATION = 4.0;
export const YOMI_EVO_ACTS = Object.freeze([
 Object.freeze({id:'question',start:0,end:.9}),
 Object.freeze({id:'read',start:.9,end:1.8}),
 Object.freeze({id:'compile',start:1.8,end:2.9}),
 Object.freeze({id:'awaken',start:2.9,end:4})
]);
export const YOMI_FLASH_AT = 2.35;
const TAU = Math.PI * 2, LIGHT = "#fff0c6", CORAL = "#f4878c", GOLD = "#ffd491", BG = "#211833";
const FORM_NAMES = ROSTER.find(r => r.id === 'yomi').forms.map(f => f.name);
const STARS = ["#eb554a","#5ad1ff","#ffe14a","#c9a8ff","#ff6a2a","#4cbf56","#f0b43a","#e0402a","#f2c1ff","#4ff0c8"];
const LINES = ["Una llama en el silencio", "Los sellos guardan el camino", "La luz cambia de manos", "El farol siempre vuelve a casa"];
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number(v) || 0));
const sm = v => { const k = cl(v); return k * k * (3 - 2 * k); };
const hn = i => { const x = Math.sin(i * 127.1 + 3.3) * 43758.5453; return x - Math.floor(x); };
const formName = f => FORM_NAMES[Math.max(0, Math.min(4, (f | 0) - 1))];

export function evoCinePhase(t) {
  t = Number(t) || 0;
  for (const a of YOMI_EVO_ACTS) if (t >= a.start && t < a.end) return a.id;
  return "awaken";
}
export function yomiEvoBeat(t = 0, from = 1, to = 2, reduced = false) {
 const time = cl(t, 0, EVO_CINE_DURATION), act = YOMI_EVO_ACTS.find(a => time < a.end) || YOMI_EVO_ACTS[3];
 return Object.freeze({ act: act.id, progress: sm((time - act.start) / (act.end - act.start)), time,
  from: cl(from, 1, 5), to: cl(to, 1, 5), reduced: !!reduced,
  runes: sm((time - .7) / 1.1), cocoon: sm((time - 1.8) / .4) * (1 - sm((time - YOMI_FLASH_AT) / .25)),
  flash: reduced ? 0 : Math.max(0, 1 - Math.abs(time - YOMI_FLASH_AT) / .18),
  reveal: sm((time - 2.4) / .6), nodes: cl(to, 1, 5) >= 5 ? 10 : cl(to, 1, 5) * 2 });
}
function paperSeal(ctx,x,y,s,angle,col){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 ctx.fillStyle=col;ctx.strokeStyle='#9c496b';ctx.lineWidth=Math.max(1,s*.12);
 ctx.beginPath();ctx.moveTo(-s*.42,-s*.76);ctx.lineTo(s*.42,-s*.76);
 ctx.lineTo(s*.42,s*.65);ctx.lineTo(0,s*.8);ctx.lineTo(-s*.42,s*.65);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-s*.22,-s*.24);ctx.lineTo(s*.22,-s*.24);
 ctx.moveTo(0,-s*.47);ctx.lineTo(0,s*.47);
 ctx.moveTo(-s*.19,s*.25);ctx.quadraticCurveTo(0,-s*.16,s*.18,s*.25);ctx.stroke();ctx.restore();
}

function shrine(ctx,w,h,cx,cy,K,T){
 ctx.fillStyle=BG;ctx.fillRect(0,0,w,h);
 // Horizon and the paper lanterns of a low shrine.
 ctx.fillStyle='#33203f';ctx.fillRect(0,cy+8*K,w,h);
 ctx.strokeStyle='#8c4763';ctx.lineWidth=7*K;
 for(const side of [-1,1]){
  const x=cx+side*155*K;
  ctx.beginPath();ctx.moveTo(x+side*7*K,cy+8*K);ctx.lineTo(x,cy-111*K);ctx.stroke();
 }
 ctx.lineWidth=5*K;ctx.beginPath();ctx.moveTo(cx-177*K,cy-110*K);
 ctx.quadraticCurveTo(cx,cy-119*K,cx+177*K,cy-110*K);ctx.stroke();
 ctx.strokeStyle='#a65269';ctx.lineWidth=2*K;ctx.beginPath();ctx.moveTo(cx-174*K,cy-116*K);
 ctx.quadraticCurveTo(cx,cy-125*K,cx+174*K,cy-116*K);ctx.stroke();
 for(let i=0;i<20;i++){
  const phase=hn(i+33),x=hn(i)*w,y=hn(i+50)*h*.72;
  ctx.globalAlpha=.16+.32*Math.abs(Math.sin(T*.8+i));
  ctx.fillStyle=i%3?GOLD:CORAL;ctx.beginPath();ctx.arc(x,y,K*(.65+phase*1.3),0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.strokeStyle='#67405c';ctx.lineWidth=1.1*K;
 for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy+8*K,(55+i*42)*K,(7+i*6)*K,0,0,TAU);ctx.stroke();}
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2, opts = {}) {
 const reduced = !!opts.reducedMotion, b = yomiEvoBeat(reduced ? 3.6 : t, fromForm, toForm, reduced);
 const K = h / 300, cx = w / 2, cy = h * .7, to = b.to | 0, T = reduced ? 0 : b.time;
 ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
 shrine(ctx,w,h,cx,cy,K,T);
 const fromS = 1.9 * K, toS = 2.3 * K;
 if (b.act === 'question') {
  const k=b.progress,x=cx+37*K,y=cy-70*K-k*12*K;
  drawEvolutionActor(ctx,'yomi',cx,cy,fromS,b.from,T,{reducedMotion:reduced,state:'idle'});
  ctx.globalAlpha=Math.sin(k*Math.PI)*.85;ctx.fillStyle=GOLD;
  ctx.beginPath();ctx.moveTo(x,y-14*K);
  ctx.quadraticCurveTo(x+11*K,y+2*K,x,y+6*K);
  ctx.quadraticCurveTo(x-8*K,y+1*K,x,y-14*K);ctx.fill();ctx.globalAlpha=1;
 } else if (b.act === 'read') {
  drawEvolutionActor(ctx,'yomi',cx,cy,fromS,b.from,T,{reducedMotion:reduced,state:'idle'});
  for(let i=0;i<12;i++){
   const a=i*TAU/12+T*.45,r=(155-65*b.progress)*K;
   ctx.globalAlpha=.38+.51*b.progress;
   paperSeal(ctx,cx+Math.cos(a)*r,cy-58*K+Math.sin(a)*r*.6,9*K,a*.32,i%2?LIGHT:GOLD);
  }
  ctx.globalAlpha=1;
 } else if (b.act === 'compile') {
  const k=b.progress,R=(88-18*Math.sin(k*Math.PI))*K;
  if(b.time<YOMI_FLASH_AT)drawEvolutionActor(ctx,'yomi',cx,cy,fromS,b.from,T,{reducedMotion:reduced,state:'idle'});
  else drawEvolutionActor(ctx,'yomi',cx,cy,toS*(.85+.15*b.reveal),to,T,{reducedMotion:reduced,state:'victory'});
  ctx.save();ctx.translate(cx,cy-61*K);
  ctx.globalAlpha=.48+.35*b.cocoon;
  for(const side of [-1,1]){
   ctx.fillStyle=side>0?'#dc788a':'#9b587b';
   ctx.beginPath();ctx.moveTo(side*R,-72*K);
   ctx.bezierCurveTo(side*(R*.82),-15*K,side*R*.24,37*K,side*R*.92,70*K);
   ctx.quadraticCurveTo(side*(R+20*K),27*K,side*(R+6*K),-61*K);ctx.closePath();ctx.fill();
  }
  ctx.restore();
  if(b.flash>0){ctx.globalAlpha=.34*b.flash;ctx.fillStyle=LIGHT;ctx.fillRect(0,0,w,h);}
  ctx.globalAlpha=1;
 } else {
  // ACT 4 · awakening: the new form with family stars linked around it.
  const k = b.progress, bob = reduced ? 0 : Math.sin(T * 3) * 3 * K;
  const n = b.nodes, pts = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * TAU / n + T * .2; pts.push([cx + Math.cos(a) * 140 * K, cy - 60 * K + Math.sin(a) * 70 * K]); }
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5 * K; ctx.globalAlpha = .6 * k; ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
  pts.forEach(([x, y], i) => { ctx.globalAlpha = k; ctx.fillStyle = STARS[i % 10]; ctx.beginPath(); ctx.arc(x, y, 4 * K, 0, TAU); ctx.fill(); });
  ctx.globalAlpha = 1;
  drawEvolutionActor(ctx, 'yomi', cx, cy + bob, toS, to, T, {reducedMotion:reduced,state:'victory'});
  ctx.globalAlpha = sm(k * 2); ctx.textAlign = "center"; ctx.lineWidth = 6 * K; ctx.strokeStyle = BG;
  ctx.font = `900 ${Math.round(30 * K)}px sans-serif`; ctx.strokeText("¡" + formName(to) + "!", cx, h * .14); ctx.fillStyle = LIGHT; ctx.fillText("¡" + formName(to) + "!", cx, h * .14);
  ctx.font = `700 ${Math.round(14 * K)}px sans-serif`; ctx.lineWidth = 4 * K; ctx.strokeText("Forma " + b.from + " → " + to, cx, h * .14 + 22 * K); ctx.fillStyle = GOLD; ctx.fillText("Forma " + b.from + " → " + to, cx, h * .14 + 22 * K);
  ctx.globalAlpha = 1;
 }
 const li = YOMI_EVO_ACTS.findIndex(a => a.id === b.act);
 ctx.globalAlpha = .85; ctx.textAlign = "center"; ctx.fillStyle = "#ffdfbe"; ctx.font = `600 ${Math.round(13 * K)}px serif`;
 ctx.fillText(LINES[li], cx, h * .93); ctx.globalAlpha = 1;
 ctx.restore();
}
