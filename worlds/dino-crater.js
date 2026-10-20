// VALLE DE LOS GIGANTES — Dino's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets.
// 8 atmospheric parallax layers: prehistoric amber sky, giant dinosaur silhouettes,
// fossilized ribcage arches, amber drip stalactites, ancient cycad ferns,
// floating spore particles, ancient stone monoliths and the Guardian constellation.
const TAU=Math.PI*2;
const wrap=(v,lim)=>((v%lim)+lim)%lim;

// ── Helper: single monolith column ───────────────────────────────────────────
function _monolith(ctx,cx,cy,w,h,col){
 ctx.fillStyle=col;
 ctx.beginPath();
 ctx.moveTo(cx-w*.55,cy);
 ctx.lineTo(cx-w*.38,cy-h);
 ctx.lineTo(cx+w*.38,cy-h);
 ctx.lineTo(cx+w*.55,cy);
 ctx.closePath();ctx.fill();
 // Horizontal strata lines
 ctx.strokeStyle='rgba(255,200,100,0.18)';ctx.lineWidth=1.5;
 for(let i=1;i<4;i++){
  const ly=cy-h*(i*.22);
  ctx.beginPath();ctx.moveTo(cx-w*.4,ly);ctx.lineTo(cx+w*.4,ly);ctx.stroke();
 }
}

// ── Helper: ribcage arch of a fossilised giant dinosaur ──────────────────────
function _ribcage(ctx,cx,cy,scale){
 const ribs=6;
 ctx.lineCap='round';
 for(let r=0;r<ribs;r++){
  const rx=cx+r*34*scale;
  const rh=(70+r*6)*scale;
  ctx.lineWidth=(7-r)*scale*.8+2;
  ctx.strokeStyle=`rgba(32,18,6,${0.85-r*.08})`;
  ctx.beginPath();
  ctx.moveTo(rx,cy);
  ctx.quadraticCurveTo(rx+20*scale,cy-rh,rx+46*scale,cy-rh*.28);
  ctx.stroke();
 }
 // Spine column
 ctx.lineWidth=10*scale;ctx.strokeStyle='rgba(28,14,4,0.9)';
 ctx.beginPath();ctx.moveTo(cx,cy-10*scale);ctx.lineTo(cx+ribs*34*scale,cy-10*scale);ctx.stroke();
}

// ── Helper: T-Rex background silhouette ──────────────────────────────────────
function _dinoSilhouette(ctx,cx,cy,scale,col){
 ctx.fillStyle=col;
 ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);
 // Body
 ctx.beginPath();ctx.ellipse(0,-22,38,26,0.15,0,TAU);ctx.fill();
 // Head
 ctx.beginPath();
 ctx.moveTo(30,-30);ctx.lineTo(60,-22);ctx.lineTo(72,-6);ctx.lineTo(56,8);ctx.lineTo(34,2);ctx.lineTo(24,-14);
 ctx.closePath();ctx.fill();
 // Dorsal spines
 for(let i=-2;i<=2;i++){
  ctx.beginPath();ctx.moveTo(i*14,-42);ctx.lineTo(i*14-6,-62-Math.abs(i)*4);ctx.lineTo(i*14+6,-62-Math.abs(i)*4);ctx.closePath();ctx.fill();
 }
 // Tail
 ctx.beginPath();ctx.moveTo(-36,-18);ctx.lineTo(-68,-10);ctx.lineTo(-60,6);ctx.lineTo(-34,2);ctx.closePath();ctx.fill();
 // Tiny arms
 ctx.strokeStyle=col;ctx.lineWidth=6;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(18,-14);ctx.lineTo(36,2);ctx.stroke();
 // Legs
 ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-14,36);ctx.stroke();
 ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(18,36);ctx.stroke();
 ctx.restore();
}

// ── Helper: cycad palm / prehistoric fern ────────────────────────────────────
function _cycad(ctx,cx,cy,h,windOff){
 ctx.strokeStyle='rgba(20,14,6,0.92)';ctx.fillStyle='rgba(20,14,6,0.92)';ctx.lineCap='round';
 // Trunk
 ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx+windOff*.3,cy-h*.5,cx+windOff,cy-h);ctx.stroke();
 // Fronds
 ctx.lineWidth=3;
 for(let f=-4;f<=4;f++){
  const fx=cx+windOff+f*28,fy=cy-h+Math.abs(f)*14;
  ctx.beginPath();ctx.moveTo(cx+windOff,cy-h);ctx.quadraticCurveTo((cx+windOff+fx)*.5,fy-22,fx,fy);ctx.stroke();
 }
}

// ── Helper: amber drip stalactite ─────────────────────────────────────────────
function _stalactite(ctx,cx,cy,len,col){
 const grad=ctx.createLinearGradient(cx,cy,cx,cy+len);
 grad.addColorStop(0,col);grad.addColorStop(1,'rgba(255,179,0,0)');
 ctx.fillStyle=grad;
 ctx.beginPath();ctx.moveTo(cx-10,cy);ctx.lineTo(cx+10,cy);ctx.lineTo(cx,cy+len);ctx.closePath();ctx.fill();
}

// ── Helper: GUARDIÁN ANTIGUO constellation ───────────────────────────────────
const GUARDIAN_STARS=[
 {x:.10,y:.10},{x:.17,y:.06},{x:.24,y:.09},{x:.30,y:.16},
 {x:.25,y:.22},{x:.18,y:.25},{x:.12,y:.19},{x:.35,y:.13},{x:.42,y:.08}
];

export function drawDinoCraterBackdrop(ctx,cam,t,viewportW,viewportH,reduceMotion=false){
 const w=viewportW||1100,h=viewportH||700;
 ctx.save();

 // ── Layer 0: Deep prehistoric amber sky gradient ──
 const skyGrad=ctx.createLinearGradient(0,0,0,h);
 skyGrad.addColorStop(0,'#1a0e04');
 skyGrad.addColorStop(0.25,'#3b1e08');
 skyGrad.addColorStop(0.55,'#7a3c0e');
 skyGrad.addColorStop(0.82,'#bf6c1a');
 skyGrad.addColorStop(1,'#e8902a');
 ctx.fillStyle=skyGrad;ctx.fillRect(0,0,w,h);

 // ── Layer 1: Amber moon ──
 const moonX=wrap(w*.76-(cam.x*.014),w*2);
 const moonY=h*.19;
 const moonG=ctx.createRadialGradient(moonX,moonY,8,moonX,moonY,58);
 moonG.addColorStop(0,'#fff4cc');moonG.addColorStop(.45,'#f0c050');
 moonG.addColorStop(.82,'#c8780a');moonG.addColorStop(1,'rgba(200,100,0,0)');
 ctx.fillStyle=moonG;
 ctx.beginPath();ctx.arc(moonX,moonY,58,0,TAU);ctx.fill();

 // ── Layer 2: GUARDIÁN ANTIGUO constellation ──
 ctx.save();
 ctx.strokeStyle='rgba(255,230,150,0.38)';ctx.lineWidth=1.3;
 ctx.beginPath();
 for(let i=0;i<GUARDIAN_STARS.length;i++){
  const sx=wrap(GUARDIAN_STARS[i].x*w*1.4-cam.x*.018,w*1.3);
  const sy=GUARDIAN_STARS[i].y*h;
  i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
 }
 ctx.stroke();
 for(const st of GUARDIAN_STARS){
  const sx=wrap(st.x*w*1.4-cam.x*.018,w*1.3);
  const sy=st.y*h;
  const pulse=reduceMotion?1:(1+Math.sin(t*.09+st.x*18)*.32);
  ctx.fillStyle='#fffbe6';
  ctx.beginPath();ctx.arc(sx,sy,2.6*pulse,0,TAU);ctx.fill();
 }
 ctx.restore();

 // ── Layer 3: Distant stone monolith ridge (far parallax) ──
 ctx.save();
 ctx.fillStyle='rgba(44,22,8,0.82)';
 ctx.beginPath();ctx.moveTo(0,h);
 const monoOff=wrap(-(cam.x*.05),420);
 for(let mx=-420;mx<w+420;mx+=210){
  const bx=mx+monoOff;
  const bh=h*(.38+Math.sin(mx*.007)*.06);
  ctx.lineTo(bx,h-bh);
  _monolith(ctx,bx+60,h-bh+10,45,h*(.12+Math.sin(mx*.015)*.04),'rgba(44,22,8,0.82)');
  ctx.lineTo(bx+120,h-bh*.85);
  ctx.lineTo(bx+210,h-bh+5);
 }
 ctx.lineTo(w,h);ctx.closePath();ctx.fill();
 ctx.restore();

 // ── Layer 4: T-Rex silhouettes (mid parallax) ──
 ctx.save();
 const dinoOff=wrap(-(cam.x*.11),w+600);
 const dinoData=[
  {ox:80, scale:.42},{ox:380,scale:.35},{ox:660,scale:.48}
 ];
 for(const d of dinoData){
  const dx=wrap(d.ox+dinoOff,w+600)-200;
  _dinoSilhouette(ctx,dx,h*.68,d.scale,'rgba(28,14,4,0.80)');
 }
 ctx.restore();

 // ── Layer 5: Giant ribcage arches (near-mid parallax) ──
 ctx.save();
 const ribOff=wrap(-(cam.x*.19),w+700);
 for(let rx=-200;rx<w+700;rx+=560){
  _ribcage(ctx,rx+ribOff,h*.82,1.1);
 }
 ctx.restore();

 // ── Layer 6: Amber stalactites from top (cave ceiling) ──
 ctx.save();
 const stalOff=wrap(-(cam.x*.22),w+500);
 for(let i=0;i<12;i++){
  const sx=((i*137+stalOff)%(w+500));
  const slen=60+i*14;
  _stalactite(ctx,sx,0,slen,'rgba(220,140,20,0.55)');
 }
 ctx.restore();

 // ── Layer 7: Cycad palms / ferns (near parallax) ──
 ctx.save();
 const fernOff=wrap(-(cam.x*.32),w+400);
 const windSway=reduceMotion?0:Math.sin(t*.04)*7;
 for(let i=0;i<5;i++){
  const fx=((i*220+fernOff)%(w+400))-60;
  _cycad(ctx,fx,h*.88+10,90+i*20,windSway+i*3);
 }
 ctx.restore();

 // ── Layer 8: Floating golden spore particles ──
 if(!reduceMotion){
  ctx.save();
  for(let i=0;i<28;i++){
   const px=wrap(i*137.5+t*18-cam.x*.28,w+120)-60;
   const py=wrap(i*79.3+Math.sin(t*.06+i)*30,h*.78);
   const sz=1.2+(i%4)*.6;
   ctx.fillStyle=`rgba(255,210,100,${0.45+Math.sin(i+t*.07)*.2})`;
   ctx.beginPath();ctx.arc(px,py,sz,0,TAU);ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
