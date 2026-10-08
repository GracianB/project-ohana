// Cuerno V59 · born as a sentient unicorn horn; a unicorn body emerges later.
const COAT = ["#fff6ea", "#ffe9f6", "#f7e7ff", "#e7f4ff", "#fff8d8"];
const HORN = ["#f2c1ff", "#ffb0e0", "#ffe14a", "#9ad7ff", "#fff"];
const MANE = ["#ffb7d8", "#d9a6ff", "#8fd0ff", "#ffe14a", "#fff"];

function horn(ctx, len, color, wobble) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 1; i <= 8; i++) {
    const k = i / 8;
    const side = i % 2 ? 1 : -1;
    ctx.lineTo(side * (2.4 + k * 3.2) + wobble, -k * len);
  }
  ctx.strokeStyle = "#fff6ea";
  ctx.lineWidth = 5.2;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(wobble * 0.3, -len, 3.2 + len * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// F0 Cuernín: the HORN is alive. No horse body, legs or oversized round head.
function drawLivingHorn(ctx,pose,R,t){
  const TAU=Math.PI*2;
  const moving=pose.state==="run",air=!!pose.air;
  const k=moving?Math.sin(pose.phase||t*.15):Math.sin(t*.06);
  const tilt=(moving?-.13:0)+k*.10+(air?-.09:0);
  const bounce=(pose.bounce||0)+(moving?Math.abs(k)*-2:Math.sin(t*.07)*1.3);
  ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
  const aura=.5+.5*Math.sin(t*.085);
  ctx.globalAlpha=.19+.09*aura;ctx.fillStyle="#ffe3f5";
  ctx.beginPath();ctx.ellipse(0,-35,17,31,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
  // One tapered pearl cone, rather than a unicorn already fully formed.
  ctx.fillStyle="#fff7e9";ctx.strokeStyle="#694c82";ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(-13,-17);ctx.bezierCurveTo(-12,-30,-6,-49,1,-65);
  ctx.bezierCurveTo(10,-49,12,-30,13,-17);
  ctx.quadraticCurveTo(0,-8,-13,-17);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.moveTo(-12,-17);ctx.lineTo(1,-65);ctx.lineTo(13,-17);ctx.closePath();ctx.clip();
  ctx.strokeStyle="#e6a6ea";ctx.lineWidth=3;
  for(let i=0;i<5;i++){
    const y=-20-i*8,w=10-i*1.45;
    ctx.beginPath();ctx.moveTo(-w,y-2);ctx.quadraticCurveTo(0,y+3,w,y-5);ctx.stroke();
  }
  ctx.restore();
  // Embryonic pearl below the horn is a collar, not a quadruped.
  R.ellipse(ctx,0,-17,11,7.2,"#f6bedf");
  R.celShade(ctx,0,-17,11,7.2,"#f6bedf",.12);
  ctx.fillStyle="#fff2d5";ctx.beginPath();ctx.arc(0,-65,3.2,0,TAU);ctx.fill();
  const mood=pose.state==="hurt"||pose.state==="dead"?"closed":pose.state==="attack"?"happy":"normal";
  R.eye(ctx,-5,-24,3.5,pose,{iris:"#623d85",mood});
  R.eye(ctx,6,-24,3.5,pose,{iris:"#623d85",mood});
  R.mouth(ctx,.5,-16,3.4,pose.state==="attack"?"happy":"smile");
  // The newborn hops by magic. When it runs, its own tip pulls it forward.
  if(moving||air){
    ctx.strokeStyle="#ffe3a3";ctx.lineWidth=1.8;ctx.globalAlpha=.65;
    for(let i=0;i<3;i++){
      const y=-10+i*4;
      ctx.beginPath();ctx.moveTo(-13-i*4,y);ctx.lineTo(-21-i*5,y+1);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(pose.state==="cast"||pose.state==="victory"){
    R.sparkle(ctx,0,-66,4+2*aura,"#ffdc9b");
  }
  ctx.restore();
}

// F1 Destello: the pearl horn grows a neck, ears, a muzzle and TWO tentative hooves.
// Its back half is still a ribbon of light: a newborn creature, not a tiny horse.
function drawFirstBody(ctx,pose,R,t){
  const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air;
  const beat=Math.sin(pose.phase||t*.14),lift=(pose.bounce||0)+(run?-2*Math.abs(beat):Math.sin(t*.07)*1.5);
  const hurt=pose.state==="hurt"||pose.state==="dead";
  const flourish=pose.flourish>0?Math.sin(Math.PI*pose.flourish):0;
  const shy=pose.flourishN%3===0?flourish:0;
  const proud=pose.flourishN%3===2?flourish:0;
  const sway=Math.sin(t*.08)*2+(run?beat*3:0);
  ctx.save();ctx.translate(0,lift);ctx.rotate((air?-.10:0)+(run?-.055*beat:0)-shy*.09);
  // A liquid rainbow tail flows from the unfinished hindquarters.
  ctx.fillStyle="#ce9cf1";ctx.strokeStyle="#654977";ctx.lineWidth=2.1;
  ctx.beginPath();ctx.moveTo(-13,-28);ctx.quadraticCurveTo(-34,-35,-34-sway,-19);
  ctx.quadraticCurveTo(-41-sway,-9,-31-sway,-7);ctx.quadraticCurveTo(-25,-13,-18,-14);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fbd4ea";ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(-21,-25);ctx.quadraticCurveTo(-36-sway,-22,-33-sway,-10);ctx.stroke();
  // Two sprouting hooves move independently; the body cannot gallop yet.
  for(const [x,flip] of [[-9,-1],[12,1]]){
    const step=run?beat*flip*7:air?flip*5:flourish*flip*2;
    ctx.save();ctx.translate(x,-17);ctx.rotate(step*.055);
    R.limb(ctx,0,0,step*.22,7,step*.36,14,4.6,"#f6e3f3",{hand:false});
    R.ellipse(ctx,step*.36,14,5.4,3.2,flip===1?"#d8b4e7":"#e4c2ed");
    ctx.strokeStyle="#694a80";ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(step*.36-4,14);ctx.lineTo(step*.36+4,14);ctx.stroke();ctx.restore();
  }
  // A curled foal seed grows from the collar of Cuernín; distinct from F0's cone.
  ctx.fillStyle="#ffe8f5";ctx.strokeStyle="#624d80";ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(-16,-27);
  ctx.bezierCurveTo(-20,-43,-8,-50,3,-46);
  ctx.bezierCurveTo(12,-43,16,-30,15,-24);
  ctx.quadraticCurveTo(0,-14,-16,-27);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#dbaae5";ctx.beginPath();ctx.ellipse(-3,-29,8,6,.1,0,TAU);ctx.fill();
  // Neck is a continuous tapered shape joining the new head to the body.
  ctx.fillStyle="#fff2ed";ctx.strokeStyle="#694a80";ctx.lineWidth=2.7;
  ctx.beginPath();ctx.moveTo(1,-34);ctx.quadraticCurveTo(-9,-51,-3,-61);
  ctx.quadraticCurveTo(8,-71,18,-56);ctx.lineTo(21,-37);
  ctx.quadraticCurveTo(14,-34,1,-34);ctx.closePath();ctx.fill();ctx.stroke();
  // Soft peach ear buds and a tiny mane (not an adult unicorn crest).
  for(const [x,side] of [[-3,-1],[16,1]]){
    ctx.fillStyle="#fae1ef";ctx.beginPath();ctx.moveTo(x,-56);
    ctx.quadraticCurveTo(x+side*7,-78,x+side*11,-63);
    ctx.quadraticCurveTo(x+side*9,-56,x,-56);ctx.fill();ctx.stroke();
    ctx.fillStyle="#dfa3bf";ctx.beginPath();ctx.ellipse(x+side*6,-64,2.2,5,side*.23,0,TAU);ctx.fill();
  }
  ctx.fillStyle="#d9abeb";for(let i=0;i<3;i++){
    ctx.beginPath();ctx.ellipse(-5-i*2,-53+i*7,3.5,5.5,-.35,0,TAU);ctx.fill();
  }
  // The original horn remains its soul, now anchored to the forehead.
  ctx.save();ctx.translate(7,-62);ctx.rotate(.10+proud*.13+(run?beat*.04:0));
  horn(ctx,26+2*proud,"#f4abd8",Math.sin(t*.11)*.36);ctx.restore();
  // The muzzle finally begins to appear, with its own expression.
  R.ellipse(ctx,14,-42,9.3,6.9,"#ffe5ec");
  R.blush(ctx,18,-46,2.3,"#f8a6c5");
  const mood=hurt?"closed":pose.state==="attack"?"angry":pose.state==="victory"?"happy":"normal";
  R.eye(ctx,1,-50,4.3,pose,{iris:"#7852a2",mood});
  R.eye(ctx,12,-49,3.8,pose,{iris:"#7852a2",mood});
  R.mouth(ctx,15,-39,3.4,mood==="happy"?"happy":shy>0.25?"o":"smile");
  if(proud>.1||pose.state==="cast")R.sparkle(ctx,12,-89,2+4*Math.max(proud,.3),"#ffe8a7");
  // Jump gathers the unfinished limbs; speed produces tiny pearl beats.
  if(run||air){
    ctx.globalAlpha=.46;ctx.strokeStyle="#ffe0b0";ctx.lineWidth=1.8;
    for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-20-i*7,-7+i*5);ctx.lineTo(-31-i*8,-7+i*5);ctx.stroke();}
  }
  ctx.restore();
}

// F2 Potro Iris: first complete juvenile unicorn, never the old ball or a tiny adult.
function drawRainbowFoal(ctx,pose,R,t){
  const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump";
  const phase=Number(pose.phase)||0,beat=Math.sin(phase);
  const flourish=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.flourish)||0)));
  const hurt=pose.state==="hurt"||pose.state==="dead";
  const cast=pose.state==="cast"||pose.state==="attack";
  const spring=(Number(pose.bounce)||0)+(run?-2.3*Math.abs(Math.sin(phase*2)):Math.sin(t*.082)*1.35);
  const ink="#645478",coat="#f9efff",pearl="#e7d9ff";
  ctx.save();ctx.translate(0,spring);
  ctx.rotate((air?-.10:0)+(run?-.045*beat:0)+(cast?-.055:0));
  // Four flowing tail ribbons retain Destello's original light language.
  const ribbons=["#faadd9","#fbd27e","#91d7ff","#d2b2ff"];
  for(let i=0;i<4;i++){
    const sway=Math.sin(t*.105+i*.68)*2.2+(run?beat*4:0);
    ctx.strokeStyle=ribbons[i];ctx.lineWidth=4.2-i*.32;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-29,-39+i);
    ctx.bezierCurveTo(-42,-45+i*2,-48-sway,-24+i*3,-51-sway,-23+i*4);ctx.stroke();
  }
  // Each hoof has its own phase, joint and airy tuck.
  function leg(x,clock,far){
    const stride=run?Math.sin(phase+clock):0,reach=stride*(far?6:7.6);
    const tuck=air?(far?8:10):0;
    const kneeX=x+reach*.43+(far?-2:2),kneeY=-14+tuck*.48;
    const hoofX=x+reach+(far?-2:2),hoofY=2-tuck;
    R.limb(ctx,x,-26,kneeX,kneeY,hoofX,hoofY,far?4.4:5.1,far?"#dac6ec":"#f8e4f9",{hand:false});
    ctx.fillStyle=far?"#ad95c7":"#bb9dcc";ctx.strokeStyle=ink;ctx.lineWidth=1.35;
    ctx.beginPath();ctx.moveTo(hoofX-4.5,hoofY-3);
    ctx.quadraticCurveTo(hoofX+1.5,hoofY-4.8,hoofX+5,hoofY-2);
    ctx.lineTo(hoofX+5,hoofY+2);ctx.lineTo(hoofX-4.5,hoofY+2);
    ctx.closePath();ctx.fill();ctx.stroke();
  }
  leg(-23,Math.PI*.55,true);leg(8,Math.PI*1.5,true);
  // A young foal's short barrel, raised back and developing chest.
  ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.6;
  ctx.beginPath();ctx.moveTo(-30,-40);
  ctx.bezierCurveTo(-29,-49,-12,-51,-2,-46);
  ctx.bezierCurveTo(13,-48,21,-39,17,-30);
  ctx.bezierCurveTo(10,-22,-8,-22,-21,-26);
  ctx.quadraticCurveTo(-33,-29,-30,-40);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=pearl;ctx.globalAlpha=.63;ctx.beginPath();
  ctx.ellipse(-10,-30,16,5.5,-.13,0,TAU);ctx.fill();ctx.globalAlpha=1;
  // Iris stripes belong to its coat, unlike the adult's constellation.
  for(let i=0;i<3;i++){
    ctx.strokeStyle=["#f1a7d5","#f5d081","#8bceea"][i];ctx.lineWidth=2.1;
    ctx.beginPath();ctx.moveTo(-24+i*4,-40+i*1.3);
    ctx.quadraticCurveTo(-19+i*4,-36+i*1.2,-14+i*4,-39+i*1.2);ctx.stroke();
  }
  ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(3,-33);
  ctx.bezierCurveTo(5,-43,7,-55,12,-65);
  ctx.bezierCurveTo(19,-73,25,-65,26,-57);
  ctx.bezierCurveTo(24,-46,19,-37,15,-31);
  ctx.quadraticCurveTo(11,-28,3,-33);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=0;i<5;i++){
    const flutter=Math.sin(t*.13+i*.83)*2+(run?beat*2.8:0);
    ctx.strokeStyle=["#ffc0e0","#ffd98a","#a1e6db","#9dcbff","#d1aeff"][i];
    ctx.lineWidth=3.3-i*.19;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(9+i*.7,-64+i*4);
    ctx.bezierCurveTo(0-i*1.5,-68+i*4,-4+flutter-i,-59+i*5,-9+flutter-i,-64+i*5);ctx.stroke();
  }
  leg(-16,Math.PI*.04,false);leg(15,Math.PI*1.04,false);
  // A foal's ears, soft cheek, single side eye and nascent equine muzzle.
  for(const side of [-1,1]){
    const x=22+side*6;
    ctx.fillStyle="#ffecfa";ctx.strokeStyle=ink;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(x-3,-68);
    ctx.quadraticCurveTo(x+side*3,-84,x+side*7,-70);
    ctx.quadraticCurveTo(x+2,-65,x-3,-68);ctx.fill();ctx.stroke();
  }
  ctx.fillStyle="#fff5fb";ctx.strokeStyle=ink;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(27,-62,11.6,10,-.12,0,TAU);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(31,-61);
  ctx.bezierCurveTo(40,-63,43,-56,42,-52);
  ctx.quadraticCurveTo(36,-47,29,-53);ctx.closePath();ctx.fill();ctx.stroke();
  R.blush(ctx,34,-56,2.3,"#ffc8e6");
  const mood=hurt?"closed":cast?"angry":pose.state==="victory"?"happy":"normal";
  R.eye(ctx,26,-64,4.4,pose,{iris:"#8862b9",mood});
  R.mouth(ctx,36,-51,3.4,pose.state==="victory"?"happy":cast?"grin":"smile");
  ctx.fillStyle="#8b72a0";ctx.beginPath();ctx.arc(40,-56,1.25,0,TAU);ctx.fill();
  ctx.save();ctx.translate(24,-71);ctx.rotate((cast?-.12:0)+Math.sin(t*.085)*.018);
  horn(ctx,29,"#dab3ff",Math.sin(t*.11)*.29);ctx.restore();
  if(cast||pose.state==="victory"||flourish>.2)
    R.sparkle(ctx,25,-106,3.1+2.4*Math.max(flourish,.18),"#ffe0a5");
  if(run&&Number(pose.speed)>.25){
    ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle="#ffdbb9";ctx.lineWidth=1.4;
    for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-42-i*8,-14-i*8);ctx.lineTo(-51-i*8,-13-i*8);ctx.stroke();}
    ctx.restore();
  }
  ctx.restore();
}

// F3 Unicornio Estelar: true adult anatomy, separate four-beat gallop and a living mane.
// Every appendage attaches to a horse-shaped torso; no old round ball is reused.
function drawStellarUnicorn(ctx,pose,R,t){
  const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air;
  const phase=Number(pose.phase)||0,speed=Math.max(0,Math.min(1.4,Number(pose.speed)||0));
  const gallop=run?Math.sin(phase):0,flight=air?1:0;
  const bounce=(Number(pose.bounce)||0)+(run?-2.7*Math.abs(Math.sin(phase*2)):Math.sin(t*.07)*1.1);
  const rear=-24,front=13,coat="#e7f4ff",ink="#475075",shade="#b6d2f3",gold="#ffe49e";
  const flare=Math.max(0,Math.min(1,Number(pose.flourish)||0));
  const flourish=Math.sin(Math.PI*flare);
  const angry=pose.state==="attack"||pose.state==="cast";
  ctx.save();ctx.translate(0,bounce);ctx.rotate((air?-.075:0)+(run?-.025*gallop:0));
  // Seven fine strands describe a moving comet-tail, not a cloud of particles.
  for(let i=0;i<5;i++){
    const sw=Math.sin(t*.105+i*.65)*3+(run?gallop*5:0);
    ctx.save();ctx.globalAlpha=.88-i*.10;
    ctx.strokeStyle=["#b8ddff","#d6b4f4","#ffb9d4","#ffe6a1","#b3f0e7"][i];
    ctx.lineWidth=3.7-i*.25;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-34,-45+i*.9);
    ctx.bezierCurveTo(-53-sw*.4,-43+i*3,-51-sw,-27+i*3,-61-sw,-30+i*4);
    ctx.stroke();ctx.restore();
  }
  // Hooves and knees follow four distinct gallop timings. Rear legs paint behind the torso.
  function limb(x,clock,back){
    const beat=run?Math.sin(phase+clock):0,reach=run?beat*(back?7.5:10):0;
    const tuck=flight*(back?8:12);
    const bend=4+Math.max(0,-beat)*5;
    const kneeX=x+reach*.42+(back?-3:4),kneeY=-18+tuck*.45;
    const hoofX=x+reach+(back?-3:3),hoofY=5-tuck;
    R.limb(ctx,x,-32,kneeX,kneeY,hoofX,hoofY,back?5.6:6.2,back?"#b6cee9":"#d2e4fc",{hand:false});
    ctx.fillStyle=back?"#8c9ac0":"#9eb1d2";ctx.strokeStyle=ink;ctx.lineWidth=1.7;
    ctx.beginPath();ctx.moveTo(hoofX-5.5,hoofY-3);
    ctx.quadraticCurveTo(hoofX+1,hoofY-6-bend*.05,hoofX+6,hoofY-2);
    ctx.lineTo(hoofX+6,hoofY+3);ctx.lineTo(hoofX-5.5,hoofY+3);
    ctx.closePath();ctx.fill();ctx.stroke();
  }
  limb(rear-5,Math.PI*.77,true);
  limb(front-2,Math.PI*1.74,true);
  // Genuine long barrel, raised hindquarters, pronounced shoulder and chest.
  ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-37,-46);
  ctx.bezierCurveTo(-29,-58,-12,-56,5,-49);
  ctx.bezierCurveTo(19,-51,27,-41,22,-31);
  ctx.bezierCurveTo(16,-20,5,-22,-5,-23);
  ctx.bezierCurveTo(-18,-19,-35,-27,-37,-46);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.globalAlpha=.52;ctx.fillStyle=shade;ctx.beginPath();
  ctx.ellipse(-12,-32,20,7,-.13,0,TAU);ctx.fill();ctx.restore();
  // Breast and rising S-curve neck are continuous and physically joined to the body.
  ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(4,-35);
  ctx.bezierCurveTo(3,-52,9,-70,13,-78);
  ctx.bezierCurveTo(19,-88,30,-80,32,-69);
  ctx.bezierCurveTo(29,-56,26,-44,21,-35);
  ctx.quadraticCurveTo(13,-28,4,-35);ctx.closePath();ctx.fill();ctx.stroke();
  // A constellation on the flank: discreet embroidered stars in motion.
  ctx.fillStyle="#8ba8dc";
  for(const [x,y] of [[-24,-43],[-14,-39],[-5,-44]]){
    ctx.beginPath();ctx.arc(x,y,1.4,0,TAU);ctx.fill();
  }
  ctx.strokeStyle="#a1bde5";ctx.lineWidth=1.2;ctx.beginPath();
  ctx.moveTo(-24,-43);ctx.lineTo(-14,-39);ctx.lineTo(-5,-44);ctx.stroke();
  // The far-side and near-side legs overlap the torso in separate depth layers.
  limb(rear+5,Math.PI*.02,false);
  limb(front+6,Math.PI*1.02,false);
  // Flowing ribbon mane has its own wave and never covers the expressive face.
  for(let i=0;i<5;i++){
    const drag=Math.sin(t*.11+i*.74)*3+(run?gallop*3:0);
    ctx.strokeStyle=["#b1e7ff","#e0c0fb","#ffb4d5","#ffe3a3","#c5d8ff"][i];
    ctx.lineWidth=5.3-i*.24;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(9+i*.8,-78+i*4);
    ctx.bezierCurveTo(1-i*2,-82+i*5,-7-i*2+drag,-68+i*6,-18-i*2+drag,-75+i*5);
    ctx.stroke();
  }
  // Ears and cheeks establish a grown unicorn, not a floating round face.
  for(const side of [-1,1]){
    const x=20+side*8;
    ctx.fillStyle="#ecf4ff";ctx.strokeStyle=ink;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(x-4,-76);ctx.quadraticCurveTo(x+side*4,-94,x+side*9,-78);
    ctx.quadraticCurveTo(x+3,-73,x-4,-76);ctx.fill();ctx.stroke();
  }
  ctx.fillStyle="#ecf4ff";ctx.strokeStyle=ink;ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(30,-72,14,13,-.17,0,TAU);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(33,-70);ctx.bezierCurveTo(43,-73,47,-65,46,-59);
  ctx.quadraticCurveTo(41,-52,31,-56);ctx.closePath();ctx.fill();ctx.stroke();
  R.blush(ctx,37,-65,2.6,"#f2afcf");
  const mood=pose.state==="hurt"||pose.state==="dead"?"closed":angry?"angry":pose.state==="victory"?"happy":"normal";
  R.eye(ctx,29,-73,5,pose,{iris:"#5667ad",mood});
  R.mouth(ctx,40,-56,4.2,pose.state==="victory"?"happy":angry?"grin":"smile");
  ctx.fillStyle="#7c7ca3";ctx.beginPath();ctx.arc(43,-64,1.8,0,TAU);ctx.fill();
  // A faceted spiral horn grows directly from the brow; the pearl core survives.
  ctx.save();ctx.translate(25,-83);
  ctx.rotate(-.06+(angry?-.12*Math.sin(Math.PI*(Number(pose.cast)||Number(pose.atk)||0)):0));
  horn(ctx,37,"#9ad7ff",Math.sin(t*.12)*.48);
  ctx.restore();
  if(angry||pose.state==="victory"){
    R.sparkle(ctx,25,-124,5+2*Math.sin(t*.07),"#ffdfa2");
  }
  // Local speed signature. Never add world-position movement or change hitboxes.
  if(run&&speed>.23){
    ctx.save();ctx.strokeStyle=gold;ctx.lineWidth=1.8;ctx.globalAlpha=.35+.25*speed;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-47-i*9,-25-i*9);ctx.lineTo(-61-i*9,-24-i*9);ctx.stroke();}
    ctx.restore();
  }
  if(flourish>.05){
    ctx.save();ctx.globalAlpha=.38*flourish;ctx.strokeStyle="#f8d0ff";ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(25,-121,9+18*flourish,-.6,2.7);ctx.stroke();ctx.restore();
  }
  ctx.restore();
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  if (f === 0) { drawLivingHorn(ctx,pose,R,pose.t||0); return; }
  if (f === 1) { drawFirstBody(ctx,pose,R,pose.t||0); return; }
  if (f === 2) { drawRainbowFoal(ctx,pose,R,pose.t||0); return; }
  if (f === 3) { drawStellarUnicorn(ctx,pose,R,pose.t||0); return; }
  const t = pose.t || 0;
  const final = f === 4;
  const run = pose.state === "run";
  const air = pose.air;
  const punta = pose.move === "punta";
  const bob = (pose.bounce || 0) + Math.sin(t * 0.08) * 1.4 + (run ? -Math.abs(Math.cos(pose.phase || 0)) * 3 : pose.breath || 0);
  const step = run ? Math.sin(pose.phase || 0) : air ? 0.4 : 0;
  const coat = COAT[f];
  const hornC = HORN[f];
  const mane = MANE[f];
  const len = 18 + f * 8;

  ctx.save();
  ctx.translate(0, bob);
  if (final) R.halo(ctx, 0, -48, 24, t, "#fff6c8");

  const leg = (x, phase) => {
    ctx.save();
    ctx.translate(x, -4);
    ctx.rotate(phase * 0.5);
    R.limb(ctx, 0, 0, 0, 12, 4.2, R.darken(coat, 0.08));
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, 13, 5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  leg(-11, step);
  leg(-4, -step);
  leg(7, step);
  leg(13, -step);

  R.ellipse(ctx, 0, -24, 20 + f * 1.1, 15 + f * 0.7, coat);
  R.celShade(ctx, 0, -24, 20 + f, 15 + f * 0.6, coat, 0.16);
  R.blush(ctx, -11, -22, 3.6, "#ffb7d5");
  R.blush(ctx, 12, -22, 3.6, "#ffb7d5");

  ctx.fillStyle = mane;
  for (let i = 0; i < 4; i++) {
    const sway = Math.sin(t * 0.1 + i) * 2;
    ctx.beginPath();
    ctx.ellipse(-8 + i * 5, -34 + (i % 2), 6, 4.2, -0.4 + sway * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  const mood = pose.state === "hurt" || pose.state === "dead" ? "closed" : pose.state === "attack" ? "happy" : "normal";
  R.eye(ctx, -6, -26, 4.1, pose, { iris: "#5a3a78", mood });
  R.eye(ctx, 8, -26, 4.3, pose, { iris: "#5a3a78", mood });
  R.mouth(ctx, 2, -16, 5, mood === "happy" ? "happy" : "smile");

  ctx.save();
  ctx.translate(1, -36 - f);
  ctx.rotate(-0.12 + (pose.state === "attack" ? (pose.atk || 0) * 0.45 : 0));
  horn(ctx, len, hornC, Math.sin(t * 0.12) * 0.7);
  ctx.restore();

  if (pose.state === "cast" || final || punta) R.sparkle(ctx, 10, -36 - len, punta ? 6 + f : 3 + f, hornC);
  if (punta) {
    ctx.globalAlpha = 0.7 + Math.sin(t * 0.7) * 0.2;
    ctx.strokeStyle = "#fff6c8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 2, 16 + f * 2, 3.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (f >= 2) R.star(ctx, 18, -16, 3.4, mane);
  ctx.restore();
}

export default { id: "cuerno", draw };
