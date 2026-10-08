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

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  if (f === 0) { drawLivingHorn(ctx,pose,R,pose.t||0); return; }
  if (f === 1) { drawFirstBody(ctx,pose,R,pose.t||0); return; }
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
