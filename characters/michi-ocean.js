// OHANA · Medusaluna, Mareas de los Cinco Sueños.
// Original deterministic Canvas 2D artwork. The legacy hero ID is "cat" only
// in data/protocols; these five creatures deliberately have no feline anatomy.
// All ornamentation is vector geometry: no raster assets, gradients or RNG.
// Coordinates: feet near y=0, head ~-80; safe in every existing portrait cache.
const TAU=Math.PI*2;
const P=Math.PI;
const cap=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:a));
const wave=(t,p=0)=>Math.sin(t+p);
function shape(c,fill,edge,width,draw){
 c.beginPath();draw();c.closePath();c.fillStyle=fill;c.fill();
 if(edge){c.lineWidth=width||1;c.strokeStyle=edge;c.stroke();}
}
function el(c,x,y,rx,ry,color,edge=null,w=1,angle=0){
 shape(c,color,edge,w,()=>c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),angle,0,TAU));
}
function line(c,x,y,xx,yy,color,width=1.5){
 c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function curved(c,a,b,d,color,width=2,edge=null){
 // a=start, b=quadratic control, d=end; strokes are the same on desktop/mobile.
 c.save();c.lineCap='round';c.lineJoin='round';
 c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(b[0],b[1],d[0],d[1]);
 if(edge){c.strokeStyle=edge;c.lineWidth=width+2;c.stroke();}
 c.strokeStyle=color;c.lineWidth=width;c.stroke();c.restore();
}
function star(c,x,y,r,color='#fff8ce',alpha=1){
 c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineCap='round';
 c.lineWidth=Math.max(.75,r*.19);c.beginPath();
 c.moveTo(x-r,y);c.quadraticCurveTo(x,y-r*.15,x,y-r*1.42);
 c.quadraticCurveTo(x,y-r*.15,x+r,y);
 c.quadraticCurveTo(x,y+r*.15,x,y+r*1.42);
 c.quadraticCurveTo(x,y+r*.15,x-r,y);c.stroke();
 c.restore();
}
function aura(c,x,y,r,color){
 c.save();c.globalAlpha*=.3;el(c,x,y,r,r*.96,color);
 c.globalAlpha*=.47;el(c,x,y,r*.72,r*.68,'#ecfbff');
 c.restore();
}
function ring(c,x,y,rx,ry,color,width=1.6,angle=0){
 c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function pearl(c,x,y,r=3){
 el(c,x,y,r,r,'#fffcdf','#b4a7dd',.9);
 el(c,x-r*.27,y-r*.32,r*.25,r*.31,'#ffffff');
}
function bubbles(c,t,form,reduced){
 const count=6+form;
 c.save();c.lineWidth=.8;
 for(let i=0;i<count;i++){
  const phase=(i*31%17)/17;
  const motion=reduced?0:((t*.0016*(1+i%3)+phase)%1);
  const x=(i%2?-1:1)*(33+(i*17%42))+Math.sin(i*2.4+motion*4)*3;
  const y=-11-(i*13%104)-motion*12;
  c.globalAlpha=(.18+(i%3)*.1)*(reduced?.85:1);
  ring(c,x,y,2+i%3,3+i%3,i%2?'#d9fff2':'#e6d7ff',.9);
 }
 c.restore();
}
function face(c,x,y,s=1,mood='idle'){
 const blink=mood==='hurt'||mood==='dead';
 c.save();c.translate(x,y);c.scale(s,s);
 for(let side of[-1,1]){
  const xx=side*12;
  el(c,xx,0,7,blink?1.2:8,'#222c55');
  if(!blink){el(c,xx-2,-3,2.35,3.4,'#ffffff');el(c,xx+2,2,1.1,1.3,'#9ee9ff');}
  el(c,side*21,8,5.8,2.6,'#f4a5ca');
 }
 c.beginPath();c.strokeStyle='#665486';c.lineWidth=1.45;c.lineCap='round';
 if(mood==='attack'||mood==='cast'){c.ellipse(0,11,3.4,5,0,0,P);c.stroke();}
 else{c.arc(0,6,4.6,.1,P-.1);c.stroke();}
 c.restore();
}
function tide(c,t,form,state,reduced){
 aura(c,0,-51,47+form*9,form>2?'#a8c1fc':'#95f5ee');
 bubbles(c,t,form,reduced);
 if(form===4){
  c.save();c.globalAlpha=.6;ring(c,0,-100,65,22,'#c8c9ff',1.2,-.18);
  ring(c,0,-100,73,29,'#8ef2ed',.7,-.18);c.restore();
 }
 if(state==='run'||state==='glide'){
  c.save();c.globalAlpha=.55;
  for(let i=0;i<4;i++){
   const y=-21-i*14;curved(c,[-42-i*4,y],[-63-i*5,y-6],[-72-i*5,y+3],
    i%2?'#93f5f0':'#fce5b4',1.2);
  }c.restore();
 }
}
function egg(c,t,st,reduced){
 const pulse=reduced?0:Math.sin(t*.052)*.035;
 c.save();c.scale(1+pulse,1-pulse);
 // The shell sits in a six-petal anemone cradle with no cat features.
 for(let j=0;j<6;j++){
  let a=(j-2.5)*.33;
  c.save();c.rotate(a*.36);
  shape(c,j%2?'#c8a9ed':'#a2ebde','#fff4de',1,()=>{
   c.moveTo(-3,-10);c.quadraticCurveTo(-31-Math.abs(j-2.5)*2,-29,-25-Math.abs(j-2.5),-47);
   c.quadraticCurveTo(-6,-37,4,-7);
  });c.restore();
 }
 // A band of scalloped opalescent plates creates depth on the shell.
 shape(c,'#e7baf9','#fffef5',2.1,()=>{
  c.moveTo(0,-74);c.bezierCurveTo(-19,-71,-31,-48,-27,-29);
  c.bezierCurveTo(-24,-8,-11,-3,0,-3);c.bezierCurveTo(16,-3,30,-13,28,-32);
  c.bezierCurveTo(26,-54,16,-73,0,-74);
 });
 shape(c,'#b9f1e6',null,0,()=>{
  c.moveTo(-25,-31);c.quadraticCurveTo(-19,-2,0,-5);
  c.quadraticCurveTo(18,-3,26,-30);
  c.quadraticCurveTo(5,-16,-7,-24);c.quadraticCurveTo(-15,-28,-25,-31);
 });
 // Iridescent carved currents across the shell distinguish this creature
 // even when rendered as a thumbnail. Every rib belongs to the egg, not FX.
 for(let i=0;i<12;i++){
  let y=-19-i*3.7;
  curved(c,[-20+Math.sin(i*.6)*3,y],[-7-Math.cos(i)*2,y-3],[13+Math.sin(i*.6+1)*4,y-1],
   i%3===0?'#fef8e2':i%3===1?'#d8f9fb':'#f1d5ff',.6);
 }
 c.save();c.globalAlpha=.52;
 el(c,-11,-51,9,15,'#fffef9',null,0,-.25);
 el(c,13,-23,7,9,'#f8effe');c.restore();
 // Moonlight is visible through the shell; the egg is alive.
 el(c,0,-36,17,19,'#ffe5ee','#d6a8e4',.9);
 face(c,0,-36,.61,st);
 c.beginPath();c.strokeStyle='#9474c4';c.lineWidth=1.8;
 c.moveTo(-21,-41);c.lineTo(-13,-45);c.lineTo(-8,-37);
 c.moveTo(18,-51);c.lineTo(11,-45);c.lineTo(17,-40);c.stroke();
 pearl(c,-18,-14,3);pearl(c,19,-18,2.7);
 for(let i=0;i<7;i++){
  let a=i*TAU/7;star(c,Math.cos(a)*38,-40+Math.sin(a)*39,1.6+i%3*.5,'#fff4dc',.65);
 }
 c.restore();
}
function seahorse(c,t,st,reduced){
 const roll=reduced?0:Math.sin(t*.044)*4;
 // Detached ornament is behind the silhouette, body and tail are continuous.
 for(let side of[-1,1]){
  c.save();c.globalAlpha=.65;
  shape(c,side===1?'#9edcfa':'#cbc3f7','#f4fffa',1.1,()=>{
   c.moveTo(side*11,-66);c.quadraticCurveTo(side*47,-85,side*39,-46);
   c.quadraticCurveTo(side*57,-26,side*15,-25);
   c.quadraticCurveTo(side*22,-48,side*11,-66);
  });
  for(let j=1;j<4;j++)line(c,side*15,-52,side*(21+j*5),-39+j*5,'#effcff',.9);
  c.restore();
 }
 // The curled tail is drawn from one continuous swimming spiral.
 c.save();c.lineCap='round';
 c.beginPath();c.moveTo(-5,-52);c.bezierCurveTo(17,-47,24,-35,23,-19);
 c.bezierCurveTo(24,7,-25,14,-24,-8);c.bezierCurveTo(-23,-25,3+roll,-23,6,-10);
 c.strokeStyle='#538fc0';c.lineWidth=16;c.stroke();
 c.strokeStyle='#a5efe5';c.lineWidth=11;c.stroke();
 c.strokeStyle='#f7ffdf';c.lineWidth=2;c.stroke();c.restore();
 shape(c,'#9ce2e7','#6b92bd',2,()=>{
  c.moveTo(-7,-83);c.bezierCurveTo(-28,-75,-26,-43,-15,-31);
  c.quadraticCurveTo(-4,-17,18,-28);c.quadraticCurveTo(31,-45,12,-65);
  c.quadraticCurveTo(14,-84,-7,-83);
 });
 // Armoured pearly ventral plates.
 for(let i=0;i<6;i++){
  let y=-71+i*7,x=-16+i*2.1;
  el(c,x,y,4,2.4,i%2?'#fff5d8':'#f8d9fa','#e8c4e7',.7,-.24);
 }
 // Seahorse head: crest, pointed snout and expressive cheek.
 shape(c,'#f8d7e9','#698fb7',1.7,()=>{
  c.moveTo(-10,-77);c.quadraticCurveTo(-23,-88,-15,-97);
  c.quadraticCurveTo(-6,-108,8,-99);c.quadraticCurveTo(17,-91,12,-83);
  c.quadraticCurveTo(25,-79,37,-78);c.quadraticCurveTo(45,-74,35,-69);
  c.quadraticCurveTo(24,-65,10,-72);c.quadraticCurveTo(4,-80,-10,-77);
 });
 for(let i=0;i<4;i++){
  const a=i*.7;
  shape(c,i%2?'#fff7c8':'#c6b9f9','#9da4c9',.7,()=>{
   c.moveTo(-14+i*6,-94+i*1.8);c.quadraticCurveTo(-22+i*6,-111-i*2,-8+i*6,-100-i);
   c.lineTo(-14+i*6,-94+i*1.8);
  });
 }
 face(c,-4,-85,.62,st);
 el(c,34,-70,4.3,2.1,'#fff1d0');
 // Fin ray detail follows the tail.
 for(let i=0;i<7;i++)star(c,12+Math.cos(i*.9)*14,-20+i*2.2,1.5,'#ffffde',.8);
 pearl(c,9+roll*.2,-21,2.2);
}
const SEA_PALETTES=Object.freeze([
 ['#b9ffff','#b9d3f7','#ffbadb'],['#ffe6cb','#c9b1ef','#f5b2dc'],
 ['#dcf8ff','#9bd6f5','#ffd9ab'],['#fde5ff','#d0b1f8','#8df5e8'],
 ['#f5fbd0','#a8eac9','#ecb3df'],['#ffe3ed','#b2c4f3','#9bf5e1']
]);
function tentacles(c,n,y,length,t,royal,reduced){
 for(let i=0;i<n;i++){
  const lane=i-(n-1)/2;
  const x=lane*(royal?9:8),phase=t*.034+i*1.1;
  const drift=reduced?0:Math.sin(phase)*10;
  const end=x+lane*4+drift;
  curved(c,[x,y],[x+lane*3+drift*.5,y+length*.52],[end,y+length],
   i%3===0?'#ffe7ae':i%3===1?'#a4f8f3':'#f0b7fa',royal?4.4:3.1,'#7369b5');
  if(i%2===0){
   curved(c,[x,y+7],[x+Math.sin(phase)*8,y+length*.45],[end+2,y+length*.92],
    '#f6f7f7',.8);
  }
  pearl(c,end,y+length,royal?2.9:2.1);
 }
}
function bell(c,w,h,y,swatch,t,reduced,royal){
 const beat=reduced?0:Math.sin(t*.089);
 shape(c,swatch[1],'#e6f9ff',2.2,()=>{
  c.moveTo(-w,y);c.bezierCurveTo(-w*1.07,y-h*.72,-w*.52,y-h,w*.02,y-h);
  c.bezierCurveTo(w*.56,y-h,w*1.08,y-h*.66,w,y);
  for(let j=4;j>=0;j--){
   let x=-w+j*w*.5;
   c.quadraticCurveTo(x+w*.12,y+5+beat*2,x-w*.5,y+1);
  }
 });
 // Shadowed glass skirt and a separate top translucent opal.
 c.save();c.globalAlpha=.43;el(c,0,y-h*.72,w*.66,h*.12,swatch[0]);c.restore();
 c.save();c.globalAlpha=.55;el(c,0,y-4,w*.83,4.2,swatch[2]);c.restore();
 for(let i=-3;i<=3;i++){
  let x=i*w*.22;
  curved(c,[x,y-6],[x*.6,y-h*.48],[x*.33,y-h*.8],
    i%2?'#fff8ed':'#e9feff',1.1);
  el(c,x,y-h*.27,2.5,3,i%2?'#ffe9ab':'#d3fbff');
 }
 for(let i=0;i<4;i++){
  let x=(i-1.5)*w*.35;
  pearl(c,x,y+2,2.2);
 }
}
function jelly(c,t,royal=false,st='idle',swatch=SEA_PALETTES[0],reduced=false){
 const y=royal?-69:-60,w=royal?55:40,h=royal?69:49;
 const breath=reduced?0:Math.sin(t*.079)*2.3;
 c.save();c.translate(0,breath);
 if(royal){
  // A cosmic manta-like mantle expands horizontally behind the huge bell.
  for(const side of[-1,1]){
   c.save();c.globalAlpha=.53;
   shape(c,side===1?'#bcd6ff':'#d9bafa','#f6e8ff',1.2,()=>{
    c.moveTo(side*31,y-25);c.quadraticCurveTo(side*69,y-94,side*82,y-25);
    c.quadraticCurveTo(side*73,y+4,side*33,y-2);
   });
   for(let i=1;i<=3;i++)line(c,side*37,y-21,side*(48+i*8),y-38+i*5,'#fbf6ff',.7);
   c.restore();
  }
 }else{
  // Dream jelly: two transparent, rippling coral fins behind the bell,
  // like an opaline butterfly under water rather than a smaller queen.
  const finLift=reduced?0:Math.sin(t*.063)*5;
  for(const side of [-1,1]){
   c.save();c.globalAlpha=.62;
   shape(c,side>0?'#aaf8ed':'#c6c1fa','#fff9e9',1.1,()=>{
    c.moveTo(side*25,y-22);
    c.quadraticCurveTo(side*(60+finLift),y-59,side*67,y-13);
    c.quadraticCurveTo(side*58,y+12,side*26,y-5);
   });
   for(let i=1;i<=3;i++){
    curved(c,[side*32,y-18],[side*(42+i*2),y-36+i*8],
      [side*(45+i*5),y-24+i*7],'#fffced',.7);
   }
   c.restore();
  }
 }
 tentacles(c,royal?11:7,y+2,royal?66:51,t,royal,reduced);
 // Layered oral arms give the jelly a living, translucent under-body.
 for(let side of[-1,1]){
  c.save();c.globalAlpha=.7;
  shape(c,side===1?'#f1c6ec':'#b5eefa',null,0,()=>{
   c.moveTo(side*10,y-2);c.quadraticCurveTo(side*29,y+23,side*7,y+42);
   c.quadraticCurveTo(side*2,y+23,side*10,y-2);
  });c.restore();
 }
 bell(c,w,h,y,swatch,t,reduced,royal);
 // A living moon/pulse light stays inside the cap (not a floating sticker).
 c.save();c.globalAlpha=.56;
 el(c,0,y-h*.61,royal?17:11,royal?16:12,'#fff7da');
 c.restore();
 face(c,0,y-h*.39,royal?1.05:.83,st);
 if(royal){
  // Five coral towers, one shining lunar halo and cosmic keeper pearls.
  ring(c,0,y-h-18,32,9,'#fff3cc',2,-.12);
  for(let i=0;i<5;i++){
   const xx=(i-2)*13,yy=y-h-8-(i===2?20:i===1||i===3?12:4);
   shape(c,i%2?'#caadff':'#fff2bc','#ffffe9',1,()=>{
    c.moveTo(xx-5,y-h+2);c.lineTo(xx-2,yy);c.quadraticCurveTo(xx,yy-4,xx+2,yy);
    c.lineTo(xx+5,y-h+2);
   });
   pearl(c,xx,yy,2.7);
  }
  for(let i=0;i<8;i++){
   const a=i*TAU/8+(reduced?0:t*.006);
   star(c,Math.cos(a)*83,-85+Math.sin(a)*53,2.1+i%2*.6,i%2?'#c4ffff':'#fff2c5',.8);
  }
  el(c,0,y-h*.19,14,8,'#f3d1ff','#fffff3',1.1);
  star(c,0,y-h*.19,6,'#fff7ba');
  // Each moon medallion is cut into the royal mantle. These five tiny
  // lunar phases are intentionally independent of her eleven arms.
  for(let i=-2;i<=2;i++){
   const xx=i*19,yy=y-h*.67+Math.abs(i)*5.2;
   c.save();c.globalAlpha=.76;
   shape(c,i%2?'#fff0b3':'#e0faff','#f5f8ff',.65,()=>{
    c.moveTo(xx,yy-4.8);c.arc(xx,yy,4.8,-Math.PI/2,Math.PI/2);
    c.quadraticCurveTo(xx+2.2+i*.3,yy,xx,yy-4.8);
   });c.restore();
  }
 }else{
  // The Onírica form wears three pearls and a delicate wave diadem.
  for(let i=-1;i<=1;i++){
   const yy=y-h*.83+Math.abs(i)*4;
   pearl(c,i*17,yy,2.9);
   star(c,i*18,yy-11,1.9,'#fcf9d8');
  }
 }
 c.restore();
}
function starfish(c,t,st,reduced){
 const turn=reduced?0:Math.sin(t*.018)*.085;
 c.save();c.translate(0,-52);c.rotate(turn);
 // Soft animated petal silhouette. Five rounded, dimensional arms.
 const rays=10,points=[],outer=49,inner=24;
 for(let i=0;i<rays;i++){
  let a=-P/2+i*P/5,rad=i%2===0?outer:inner;
  points.push([Math.cos(a)*rad,Math.sin(a)*rad]);
 }
 shape(c,'#f8b7d8','#9169b9',2.8,()=>{
  c.moveTo((points[9][0]+points[0][0])/2,(points[9][1]+points[0][1])/2);
  for(let i=0;i<10;i++){
   const p=points[i],n=points[(i+1)%10];
   c.quadraticCurveTo(p[0],p[1],(p[0]+n[0])/2,(p[1]+n[1])/2);
  }
 });
 // Celestial five-spoke shell: inside each arm is a constellation.
 el(c,0,0,30,30,'#ffdbdf','#fff3ec',1);
 for(let arm=0;arm<5;arm++){
  let a=-P/2+arm*TAU/5;
  let x=Math.cos(a),y=Math.sin(a);
  curved(c,[x*11,y*11],[x*23,y*23],[x*39,y*39],
   '#fff7d1',2,'#e3b0cf');
  for(let j=0;j<3;j++){
   const d=19+j*8;el(c,x*d,y*d,2.1-j*.24,2.1-j*.24,
    j%2?'#b6f8ed':'#fffce7');
  }
  star(c,x*41,y*41,2,'#fff9d8');
 }
 ring(c,0,0,23,23,'#ffffff',1.1);
 // Five tiny moons around the central character face.
 for(let i=0;i<5;i++){
  let a=i*TAU/5-P/2;
  pearl(c,Math.cos(a)*21,Math.sin(a)*21,1.6);
 }
 face(c,0,0,.80,st);star(c,0,-19,3.5,'#fff9cc');
 // Twin satellites, separate enough to read at high zoom but not as limbs.
 c.save();c.globalAlpha=.8;
 for(let i=0;i<2;i++){
  let a=t*(reduced?0:.016)+(i?P:0);
  pearl(c,Math.cos(a)*68,Math.sin(a)*43,4-i*.7);
 }c.restore();
 c.restore();
}
function energy(c,form,state,t,reduced,power,attack){
 if(!['cast','attack','victory'].includes(state))return;
 const k=state==='attack'?cap(attack):state==='cast'?.8:1;
 const r=41+form*9,angle=reduced?0:t*.045+power*.61;
 c.save();c.globalAlpha=.38+k*.42;c.strokeStyle=form===4?'#ffe5a9':'#a2f6f2';
 c.lineWidth=state==='attack'?3.2:1.8;
 // Each action has its own language: radiating star, spiral, moon arcs.
 if(form===3){
  for(let i=0;i<5;i++){
   const a=-P/2+i*TAU/5+angle*.12;
   line(c,Math.cos(a)*38,-53+Math.sin(a)*38,
    Math.cos(a)*(50+k*19),-53+Math.sin(a)*(50+k*19),
    '#fff2ca',2.1);
  }
 }else if(form===1){
  for(let i=0;i<5;i++){
   let a=i*TAU/5+angle;
   pearl(c,Math.cos(a)*r,-48+Math.sin(a)*r*.7,2.5);
   star(c,Math.cos(a)*(r+7),-48+Math.sin(a)*(r*.7+8),2.5,'#dffff0');
  }
 }else{
  for(let i=0;i<6;i++){
   const a=i*TAU/6+angle;
   star(c,Math.cos(a)*r,-55+Math.sin(a)*r*.72,2.5+k*1.6,
    i%2?'#f9d8ff':'#fff4bf');
  }
 }
 if(form===4&&state==='victory'){
  c.globalAlpha=.55;
  ring(c,0,-93,77,29,'#fff4cc',2);
 }
 c.restore();
}
export const MEDUSALUNA_FORMS=Object.freeze([
 'Huevo de Nácar','Caballito de Sueños','Medusa Onírica',
 'Estrella Astral','Medusa de las Mil Lunas'
]);
// A compact, accessible palette also powers the camp catalogue.
export const MEDUSALUNA_TINTS=Object.freeze([
 '#f5d7f7','#a0e9ed','#b1d4f7','#ffc4d9','#e9d2ff'
]);
export function drawMedusaluna(c,pose={},form=0){
 const f=Math.round(cap(Number(form),0,4));
 const reduced=!!pose.reduceMotion, t=reduced?0:(Number.isFinite(pose.t)?pose.t:0);
 const state=pose.state||'idle',power=Math.round(cap(Number(pose.michiPowerIndex??pose.castSlot??0),0,5));
 const active=state==='run'||state==='jump'||state==='glide';
 const sway=reduced?0:Math.sin(t*(active?.075:.038))*(active?2.5:1.5);
 const seed=Number.isFinite(pose.michiSeed)?Math.floor(pose.michiSeed):0;
 const index=Math.imul((seed^0x452d9f3b),2654435761)>>>0;
 const palette=SEA_PALETTES[index%SEA_PALETTES.length];
 c.save();c.lineJoin='round';c.lineCap='round';
 c.translate(0,sway);
 const tilt={idle:0,run:.048,jump:-.09,fall:.085,glide:-.035,
  wall:.12,attack:-.07,cast:.05,hurt:-.17,victory:-.10,dead:.64};
 const attackPhase=state==='attack'?(reduced?.5:cap(Number(pose.atk),0,1))*.20:0;
 c.rotate((tilt[state]??0)+(state==='cast'?.025*(power+1):0)+attackPhase);
 if(state==='jump')c.scale(.94,1.055);
 else if(state==='fall')c.scale(1.035,.94);
 tide(c,t,f,state,reduced);
 if(f===0)egg(c,t,state,reduced);
 else if(f===1)seahorse(c,t,state,reduced);
 else if(f===2)jelly(c,t,false,state,palette,reduced);
 else if(f===3)starfish(c,t,state,reduced);
 else jelly(c,t,true,state,palette,reduced);
 // Only the current action adds its authored FX; no stacked generic HUD particles.
 energy(c,f,state,t,reduced,power,Number(pose.atk)||.5);
 c.restore();
}
