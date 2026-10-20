// CORDILLERA DE LAS BRASAS — Dragón's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets, zero layout thrash.
// Atmospheric parallax: volcanic caverns, glowing magma rivers, obsidian spires,
// heat shimmers, floating embers, and the Celestial Dragon shrine.
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=260)=>x>=-pad&&x<=w+pad;

function basaltPillar(ctx,x,y,w,h,col,glowCol){
 ctx.save();
 ctx.fillStyle=col;
 ctx.strokeStyle=glowCol;
 ctx.lineWidth=1.5;
 ctx.beginPath();
 ctx.moveTo(x-w*0.5,y);
 ctx.lineTo(x-w*0.35,y-h);
 ctx.lineTo(x+w*0.35,y-h);
 ctx.lineTo(x+w*0.5,y);
 ctx.closePath();
 ctx.fill();ctx.stroke();
 // Vertical cooling crack
 ctx.beginPath();
 ctx.moveTo(x,y-h*0.1);
 ctx.lineTo(x-w*0.1,y-h*0.5);
 ctx.lineTo(x+w*0.08,y-h*0.85);
 ctx.stroke();
 ctx.restore();
}

function flameBeacon(ctx,x,y,scale,t,col,accent,reduced){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const flicker=reduced?0:Math.sin(t*0.08+x*0.03)*3;
 // Braised stone bowl
 ctx.fillStyle='#231210';ctx.strokeStyle='#ff6b3d';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.arc(0,10,22,0,Math.PI);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Burning flame tongues
 ctx.fillStyle=col;
 ctx.beginPath();
 ctx.moveTo(-16,10);
 ctx.quadraticCurveTo(-10,-15+flicker,0,-32+flicker*1.4);
 ctx.quadraticCurveTo(10,-15+flicker,16,10);
 ctx.closePath();ctx.fill();
 // Inner golden core
 ctx.fillStyle=accent;
 ctx.beginPath();
 ctx.moveTo(-9,10);
 ctx.quadraticCurveTo(-5,-6+flicker,0,-18+flicker);
 ctx.quadraticCurveTo(5,-6+flicker,9,10);
 ctx.closePath();ctx.fill();
 if(!reduced){
  ctx.fillStyle='rgba(255,200,80,0.35)';
  ctx.beginPath();ctx.arc(0,-12,18+Math.sin(t*0.15+x)*4,0,TAU);ctx.fill();
 }
 ctx.restore();
}

function dragonSanctuary(ctx,x,y,t,reduced){
 ctx.save();ctx.translate(x,y);
 // Shrine base arches in carved black stone
 ctx.fillStyle='#251310';ctx.strokeStyle='#ff7448';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-120,0);ctx.lineTo(-85,-155);ctx.lineTo(85,-155);ctx.lineTo(120,0);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Inner fire chamber
 ctx.fillStyle='#140705';ctx.beginPath();
 ctx.arc(0,-70,50,Math.PI,0);ctx.lineTo(50,0);ctx.lineTo(-50,0);ctx.closePath();
 ctx.fill();ctx.strokeStyle='#ffae63';ctx.lineWidth=2;ctx.stroke();
 // Dragon wing crest on roof
 ctx.fillStyle='#ff5028';ctx.strokeStyle='#ffd866';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(-60,-155);ctx.quadraticCurveTo(-100,-215,-15,-205);
 ctx.lineTo(0,-175);
 ctx.lineTo(15,-205);ctx.quadraticCurveTo(100,-215,60,-155);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Giant central brazier
 flameBeacon(ctx,0,-80,1.4,t,'#ff6428','#ffe97d',reduced);
 ctx.restore();
}

export function drawDragonCalderaBackdrop(ctx,cam,t=0,W=1600,H=1000,reduced=false){
 ctx.save();
 const ox=Number.isFinite(cam?.x)?cam.x:0,oy=Number.isFinite(cam?.y)?cam.y:0;
 
 // 1. Sky / Cavern gradient: deep black-obsidian into burning crimson and gold
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#150504');
 sky.addColorStop(0.38,'#2a0907');
 sky.addColorStop(0.72,'#5c160a');
 sky.addColorStop(1,'#9e2b0c');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

 // 2. Celestial Dragon Constellation in the high dome
 ctx.save();
 ctx.strokeStyle='rgba(255,210,120,0.22)';ctx.lineWidth=1.5;
 const cX=wrap(W*0.62-ox*0.03,W+300)-150,cY=H*0.18-oy*0.02;
 ctx.beginPath();
 ctx.arc(cX,cY,38,0,TAU);ctx.stroke();
 for(let i=0;i<7;i++){
  const sa=i*Math.PI*2/7;
  const sx=cX+Math.cos(sa)*38,sy=cY+Math.sin(sa)*38;
  ctx.fillStyle='#ffe89c';ctx.beginPath();ctx.arc(sx,sy,2.5,0,TAU);ctx.fill();
 }
 ctx.restore();

 // 3. Distant volcanic ridges (Parallax 0.08)
 ctx.fillStyle='#1c0806';
 ctx.beginPath();ctx.moveTo(0,H);
 for(let x=0;x<=W;x+=60){
  const wx=x+ox*0.08;
  const h=180+Math.sin(wx*0.0035)*75+Math.sin(wx*0.012)*35;
  ctx.lineTo(x,H*0.68-h-oy*0.04);
 }
 ctx.lineTo(W,H);ctx.closePath();ctx.fill();

 // Magma rivers on distant ridge
 ctx.strokeStyle='rgba(255,100,35,0.45)';ctx.lineWidth=2.5;
 ctx.beginPath();
 for(let x=0;x<=W;x+=80){
  const wx=x+ox*0.08;
  const y=H*0.68-(180+Math.sin(wx*0.0035)*75)-oy*0.04;
  ctx.moveTo(x,y);ctx.lineTo(x+15,y+28);
 }
 ctx.stroke();

 // 4. Midground Basalt spires and hanging volcanic crags (Parallax 0.18)
 ctx.fillStyle='#2b0f0b';
 ctx.beginPath();ctx.moveTo(0,H);
 for(let x=0;x<=W;x+=50){
  const wx=x+ox*0.18;
  const h=140+Math.sin(wx*0.006+1.2)*65+Math.cos(wx*0.015)*30;
  ctx.lineTo(x,H*0.78-h-oy*0.1);
 }
 ctx.lineTo(W,H);ctx.closePath();ctx.fill();

 // Hanging ceiling crags (stalactites)
 for(let i=0;i<12;i++){
  const bx=wrap(i*170-ox*0.16,W+240)-120;
  const by=-oy*0.08;
  const sw=35+((i*17)%25),sh=85+((i*31)%75);
  basaltPillar(ctx,bx,by,sw,sh,'#1e0907','#ff522040');
 }

 // 5. Standing Pillars & Fire Beacons along the stage (Parallax 0.35)
 const beaconXs=[420,1150,1880,2650,3380];
 for(let i=0;i<beaconXs.length;i++){
  const worldX=beaconXs[i];
  const sx=worldX-ox*0.65;
  const sy=H*0.84-oy*0.35;
  if(visible(sx,W)){
   basaltPillar(ctx,sx,sy+30,46,120,'#230c09','#ff6b35');
   flameBeacon(ctx,sx,sy-90,0.9,t,'#ff6428','#ffe97d',reduced);
  }
 }

 // 6. Dragon Sanctuary at the eastern summit
 const shrineSx=3780-ox;
 const shrineSy=1110-oy;
 if(visible(shrineSx,W,300)){
  dragonSanctuary(ctx,shrineSx,shrineSy,t,reduced);
 }

 // 7. Floating volcanic embers & smoke particles
 if(!reduced){
  ctx.save();
  for(let i=0;i<48;i++){
   const px=wrap(i*89-ox*0.45+Math.sin(t*0.03+i)*40,W+120)-60;
   const py=wrap(H*0.95-((t*1.2+i*55)%(H*1.1))-oy*0.4,H+80)-40;
   const pSize=1.5+((i*7)%3)*0.8;
   const pAlpha=0.35+Math.sin(t*0.06+i)*0.25;
   ctx.fillStyle=i%3===0?'#ffe57f':i%2===0?'#ff8038':'#ff4418';
   ctx.globalAlpha=Math.max(0.1,Math.min(0.85,pAlpha));
   ctx.beginPath();ctx.arc(px,py,pSize,0,TAU);ctx.fill();
  }
  ctx.restore();
 }

 // 8. Lower molten magma fog bank
 const lavaGlow=ctx.createLinearGradient(0,H-160,0,H);
 lavaGlow.addColorStop(0,'rgba(255,80,20,0)');
 lavaGlow.addColorStop(0.5,'rgba(255,100,25,0.18)');
 lavaGlow.addColorStop(1,'rgba(255,60,10,0.42)');
 ctx.fillStyle=lavaGlow;ctx.fillRect(0,H-160,W,160);

 ctx.restore();
}
