// Medusaluna · five original marine silhouettes. The legacy gameplay id remains "cat"
// so existing save games, network packets and hero-room associations stay compatible.
// Canvas only: no image files, random state, or gameplay mutations.
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
function path(ctx, color, stroke, width, fn) {
  ctx.beginPath(); fn(); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  if (stroke) { ctx.lineWidth = width || 1.5; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function oval(ctx, x, y, rx, ry, color, stroke, width = 1) {
  path(ctx, color, stroke, width, () => ctx.ellipse(x, y, rx, ry, 0, 0, TAU));
}
function glow(ctx, x, y, radius, inner, outer = 'rgba(110,190,255,0)') {
  const g = ctx.createRadialGradient(x, y, 2, x, y, radius);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  oval(ctx, x, y, radius, radius, g);
}
function sparkle(ctx, x, y, r, color = '#fff9ed') {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(.8, r * .2);
  ctx.beginPath(); ctx.moveTo(x-r, y); ctx.quadraticCurveTo(x, y-r*.15, x, y-r*1.5);
  ctx.quadraticCurveTo(x, y-r*.15, x+r, y); ctx.quadraticCurveTo(x, y+r*.15, x, y+r*1.5);
  ctx.quadraticCurveTo(x, y+r*.15, x-r, y); ctx.stroke(); ctx.restore();
}
function eyes(ctx, x, y, scale = 1, blush = '#f1a3bf', blink = false) {
  for (const side of [-1, 1]) {
    oval(ctx, x+side*11*scale, y, 6.1*scale, (blink ? 1.1 : 8)*scale, '#232b52');
    if (!blink) {
      oval(ctx, x+side*11*scale-2*scale, y-3*scale, 2.2*scale, 3*scale, '#ffffff');
      oval(ctx, x+side*11*scale+2*scale, y+2*scale, 1.1*scale, 1.4*scale, '#8fd8ff');
    }
    oval(ctx, x+side*19*scale, y+9*scale, 5*scale, 2.2*scale, blush);
  }
  ctx.beginPath(); ctx.strokeStyle='#5c4c79'; ctx.lineWidth = 1.5*scale; ctx.lineCap = 'round';
  ctx.arc(x, y+8*scale, 4*scale, .15, Math.PI-.15); ctx.stroke();
}
function ribbon(ctx, pts, width, fill, edge = '#8e64c4') {
  const [sx, sy, cx, cy, ex, ey] = pts;
  ctx.save();ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx,cy,ex,ey);
  ctx.lineWidth=width+2;ctx.strokeStyle=edge;ctx.stroke();
  ctx.lineWidth=width;ctx.strokeStyle=fill;ctx.stroke();
  ctx.lineWidth=Math.max(.8,width*.19);ctx.strokeStyle='#fff7ef';ctx.stroke();ctx.restore();
}
function bell(ctx, w, h, y, colors, beat) {
  const grad=ctx.createLinearGradient(0,y-h,0,y+8);
  grad.addColorStop(0,colors[0]);grad.addColorStop(.48,colors[1]);grad.addColorStop(1,colors[2]);
  path(ctx,grad,'#f8eaff',1.6,()=>{
    ctx.moveTo(-w,y);
    ctx.bezierCurveTo(-w*1.08,y-h*.58,-w*.53,y-h,w*.03,y-h);
    ctx.bezierCurveTo(w*.58,y-h,w*1.06,y-h*.64,w,y);
    ctx.quadraticCurveTo(w*.7,y+6+beat*2,w*.45,y+2);
    ctx.quadraticCurveTo(w*.22,y+7+beat*2,0,y+2);
    ctx.quadraticCurveTo(-w*.24,y+7+beat*2,-w*.47,y+2);
    ctx.quadraticCurveTo(-w*.72,y+6+beat*2,-w,y);
  });
  ctx.save();ctx.globalAlpha=.45;
  oval(ctx,0,y-h*.69,w*.55,h*.16,'#fffaff');ctx.restore();
  for(let n=-2;n<=2;n++) {
    oval(ctx,n*w*.3,y-h*.26,2.6,3.6,n%2?'#fff0b0':'#b7faff');
  }
}
function tentacles(ctx, count, startY, length, t, strong = false) {
  for(let i=0;i<count;i++){
    const lane=i-(count-1)/2, sway=Math.sin(t*.043+i*1.27)*5;
    const x=lane*(strong?10:7), phase=t*.028+i*1.3;
    ribbon(ctx,[x,startY,x+lane*4+Math.sin(phase)*13,startY+length*.5,x+sway+lane*6,startY+length],
      strong?(i%3===0?5:3.2):(i%2?3.2:2.2),
      i%3===0?'#ffe9ab':i%3===1?'#99ebfa':'#efb4f9',strong?'#6948b3':'#9c6bc9');
    oval(ctx,x+sway+lane*6,startY+length,2.7,3.5,i%2?'#fff4cd':'#a8ffff');
  }
}
function egg(ctx, t) {
  const pulse=Math.sin(t*.055)*.04;
  glow(ctx,0,-32,55,'rgba(255,219,250,.32)');
  for(let i=0;i<6;i++){
    const x=(i-2.5)*8, sway=Math.sin(t*.035+i)*2;
    ribbon(ctx,[x,-5,x+sway*2,-16,x+sway*3,-8-(i%3)*3],2.8,
      i%2?'#89ead8':'#fac6d9','#6b84b4');
  }
  const shell=ctx.createLinearGradient(-28,-62,28,-3);
  shell.addColorStop(0,'#fff9dd');shell.addColorStop(.35,'#f7daff');shell.addColorStop(.72,'#a9e5f6');shell.addColorStop(1,'#dcb1fc');
  ctx.save();ctx.scale(1+pulse,1-pulse);
  path(ctx,shell,'#fff9ef',2,()=>{
    ctx.moveTo(0,-65);ctx.bezierCurveTo(-14,-66,-26,-51,-25,-32);
    ctx.bezierCurveTo(-24,-11,-12,-5,0,-5);ctx.bezierCurveTo(18,-5,27,-15,25,-32);
    ctx.bezierCurveTo(22,-53,13,-65,0,-65);
  });
  ctx.save();ctx.globalAlpha=.38;
  oval(ctx,-12,-43,8,13,'#ffffff');ctx.restore();
  glow(ctx,0,-32,17,'rgba(255,252,213,.75)','rgba(247,190,255,0)');
  ctx.beginPath();ctx.moveTo(-13,-30);ctx.quadraticCurveTo(-3,-38,1,-28);
  ctx.quadraticCurveTo(7,-35,14,-27);ctx.strokeStyle='#956bc7';ctx.lineWidth=1.4;ctx.stroke();
  eyes(ctx,0,-27,.62,'#edb1cf');sparkle(ctx,11,-50,4);
  ctx.restore();
}
function seahorse(ctx,t,state) {
  const sw=Math.sin(t*.09),tail=Math.sin(t*.045)*3;
  glow(ctx,0,-45,64,'rgba(108,217,246,.26)');
  // Veiled translucent dorsal fins behind the connected body.
  for(const side of [-1,1]){
    ctx.save();ctx.globalAlpha=.67;
    path(ctx,side<0?'#b5b6ff':'#a3fff0','#c6eaff',1.1,()=>{
      ctx.moveTo(side*14,-38);ctx.quadraticCurveTo(side*51+sw*4,-64,side*39,-25);
      ctx.quadraticCurveTo(side*37,-18,side*14,-30);
    });ctx.restore();
  }
  // Curl is a single uninterrupted spiral, not a detached ring.
  ribbon(ctx,[-3,-30,34+tail,-4,8,-5],13,'#85d9e9','#4583b3');
  ribbon(ctx,[8,-5,-16,-9,-5,-20],8,'#c8f8e8','#4583b3');
  const body=ctx.createLinearGradient(-22,-85,24,-15);
  body.addColorStop(0,'#ffe8cf');body.addColorStop(.52,'#f6bddb');body.addColorStop(1,'#75dbdc');
  path(ctx,body,'#6286b6',2,()=>{
    ctx.moveTo(-8,-75);ctx.bezierCurveTo(-25,-69,-24,-44,-16,-25);
    ctx.quadraticCurveTo(-7,-10,14,-25);ctx.quadraticCurveTo(30,-41,18,-54);
    ctx.quadraticCurveTo(13,-62,15,-70);ctx.quadraticCurveTo(12,-83,-8,-75);
  });
  for(let i=0;i<5;i++)oval(ctx,-15+i*2,-62+i*8,2.5,2.2,'#fffcdd');
  path(ctx,'#ffebd1','#658cb8',1.6,()=>{
    ctx.moveTo(-6,-72);ctx.quadraticCurveTo(-22,-80,-17,-93);
    ctx.quadraticCurveTo(-11,-104,3,-95);ctx.quadraticCurveTo(15,-91,14,-79);
    ctx.quadraticCurveTo(25,-73,33,-73);ctx.quadraticCurveTo(43,-69,34,-63);
    ctx.quadraticCurveTo(24,-58,12,-64);ctx.quadraticCurveTo(6,-73,-6,-72);
  });
  for(let i=0;i<3;i++)sparkle(ctx,-13+i*8,-96-i%2*5,2.7,'#fff5c8');
  eyes(ctx,-2,-83,.69,'#efa6b6',state==='hurt');
  oval(ctx,27,-64,4,2,'#ffccab');
}
function jelly(ctx,t,royal=false,state='idle'){
  const beat=Math.sin(t*.09),isRoyal=!!royal;
  const y=isRoyal?-63:-55,w=isRoyal?49:36,h=isRoyal?60:43;
  glow(ctx,0,y-h*.6,isRoyal?84:68,isRoyal?'rgba(171,133,255,.27)':'rgba(117,236,248,.29)');
  ctx.save();ctx.translate(0,beat*2);
  tentacles(ctx,isRoyal?11:7,y+1,isRoyal?57:45,t,isRoyal);
  if(isRoyal){
    for(let side of [-1,1]){
      ctx.save();ctx.globalAlpha=.48;
      path(ctx,'#b4d7ff','#e8e3ff',1.2,()=>{
        ctx.moveTo(side*31,y-17);ctx.quadraticCurveTo(side*78,y-61,side*68,y-9);
        ctx.quadraticCurveTo(side*58,y+13,side*31,y-17);
      });ctx.restore();
    }
  }
  bell(ctx,w,h,y,isRoyal?['#e8d1ff','#b9d2ff','#9d84e6']:['#e6faff','#afeced','#ffbddd'],beat);
  eyes(ctx,0,y-h*.48,isRoyal?1:.82,'#ffaecf',state==='hurt');
  if(isRoyal){
    // Halo, regal crown and cosmic lanterns are part of the creature, not feline ears.
    ctx.save();ctx.strokeStyle='#ffe4a3';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,y-h-16,33,9,-.14,0,TAU);ctx.stroke();ctx.restore();
    for(let i=0;i<5;i++){
      let x=(i-2)*12,cy=y-h-11-Math.cos((i-2)*.55)*13;
      sparkle(ctx,x,cy,3.8+i%2*1.5,i%2?'#f9e6fd':'#fff0ab');
    }
    for(let side of [-1,1])for(let i=0;i<3;i++){
      const a=t*.025+side*1.5+i*2.1;
      sparkle(ctx,side*62+Math.cos(a)*13,y-35+i*13+Math.sin(a)*8,2.4,'#c5faff');
    }
  }else for(let i=0;i<4;i++){
    sparkle(ctx,Math.sin(t*.021+i*2)*49,y-25+i*13,2.1,'#e9ffff');
  }
  ctx.restore();
}
function starfish(ctx,t,state) {
  glow(ctx,0,-47,74,'rgba(255,167,214,.33)');
  // A 5-armed soft sea star, with five continuous rounded tips.
  ctx.save();ctx.translate(0,-45);ctx.rotate(Math.sin(t*.02)*.065);
  const points=[],inn=22,out=46;
  for(let i=0;i<10;i++){
    const angle=-Math.PI/2+i*Math.PI/5,r=i%2===0?out:inn;
    points.push([Math.cos(angle)*r,Math.sin(angle)*r]);
  }
  const grad=ctx.createRadialGradient(-10,-12,4,0,0,58);
  grad.addColorStop(0,'#fff6d9');grad.addColorStop(.48,'#ffc5d8');grad.addColorStop(1,'#c77ce3');
  path(ctx,grad,'#8a68b5',2,()=>{
    const p=points;
    ctx.moveTo((p[9][0]+p[0][0])/2,(p[9][1]+p[0][1])/2);
    for(let i=0;i<10;i++)ctx.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[(i+1)%10][0])/2,(p[i][1]+p[(i+1)%10][1])/2);
  });
  for(let i=0;i<5;i++){
    let a=-Math.PI/2+i*TAU/5;
    ribbon(ctx,[Math.cos(a)*11,Math.sin(a)*11,Math.cos(a)*23,Math.sin(a)*23,Math.cos(a)*35,Math.sin(a)*35],
      1.6,'#fff8e0','#e9afe3');
    oval(ctx,Math.cos(a)*27,Math.sin(a)*27,2.3,2.3,'#fff4ba');
  }
  eyes(ctx,0,-3,.84,'#eda6c4',state==='hurt');sparkle(ctx,0,-25,4,'#fffdeb');
  ctx.restore();
}
export const MEDUSALUNA_FORMS = Object.freeze([
  'Huevo de Nácar','Caballito de Sueños','Medusa Onírica','Estrella Astral','Medusa de las Mil Lunas'
]);
export function drawMedusaluna(ctx, pose = {}, form = 0) {
  const f = Math.round(clamp(Number(form),0,4));
  const t = pose.reduceMotion ? 0 : (Number.isFinite(pose.t) ? pose.t : 0);
  const state = pose.state || 'idle', active = state==='run'||state==='jump'||state==='glide';
  const power = Math.round(clamp(Number(pose.michiPowerIndex ?? pose.castSlot ?? 0),0,5));
  const bob = pose.reduceMotion?0:Math.sin(t*(active?.09:.045))*(active?2.6:1.4);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  ctx.translate(0,bob);
  // Every physical state and every magic slot has an individually readable pose.
  const acting={idle:0,run:.046,jump:-.085,fall:.082,glide:-.04,wall:.13,attack:-.06,cast:.064,hurt:-.15,victory:-.1,dead:.67};
  ctx.rotate((acting[state] ?? 0) + (state==='cast'?(power+1)*.027:0) + (state==='attack'?clamp(pose.atk,0,1)*.19:0));
  if(state==='jump')ctx.scale(.93,1.07);
  else if(state==='fall')ctx.scale(1.06,.94);
  if(f===0)egg(ctx,t);
  else if(f===1)seahorse(ctx,t,state);
  else if(f===2)jelly(ctx,t,false,state);
  else if(f===3)starfish(ctx,t,state);
  else jelly(ctx,t,true,state);
  // Subtle deterministic ocean dust provides a textured, animated silhouette.
  ctx.save();ctx.globalAlpha*=.25;
  for(let i=0;i<22;i++){
    const angle=i*2.399963+t*.004, radius=24+(i%7)*6+f*2;
    sparkle(ctx,Math.cos(angle)*radius, -44+Math.sin(angle)*radius*.72,1.1+(i%3)*.22,i%2?'#c9ffff':'#fff1f9');
  }
  ctx.restore();
  if(state==='cast'||state==='attack'||state==='victory'){
    const force=pose.reduceMotion?.5:clamp(Number(pose.cast)||Number(pose.atk)||.5,0,1);
    for(let i=0;i<5;i++){
      let a=(i/5)*TAU+t*.055+(state==='cast'?power*.19:0);
      sparkle(ctx,Math.cos(a)*(32+f*7),-43-Math.sin(a)*(30+f*3),2+force*2,
        i%2?'#b7ffff':'#fff2c3');
    }
  }
  ctx.restore();
}