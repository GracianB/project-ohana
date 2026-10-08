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

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  if (f === 0) { drawLivingHorn(ctx,pose,R,pose.t||0); return; }
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
