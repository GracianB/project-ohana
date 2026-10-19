// Low-cost Canvas sky for Chispín. All geometry is authored/vector, culled,
// responsive to camera and respectful of reduced-motion preference.
const TAU=Math.PI*2;
export function drawChispinIsles(ctx,cam,t,w,h,options={}){
 const W=Math.max(1,w),H=Math.max(1,h),ox=cam?.x||0,oy=cam?.y||0;
 const time=options.reducedMotion?0:t;
 ctx.save();
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#061b43');sky.addColorStop(.56,'#24558d');sky.addColorStop(1,'#58a2c7');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Aurora streamers, each parallax layer drifts at a different speed.
 for(let i=0;i<5;i++){
  const yy=100+i*66+Math.sin(time*.004+i)*13;
  ctx.strokeStyle=['#9de7ff30','#fde89f32','#b7baff24'][i%3];
  ctx.lineWidth=28-i*3;ctx.beginPath();ctx.moveTo(-100,yy);
  ctx.bezierCurveTo(W*.3,yy-82,W*.65,yy+86,W+100,yy-55);ctx.stroke();
 }
 for(let layer=0;layer<3;layer++){
  const speed=.06+layer*.065;
  const span=365;
  const scroll=((ox*speed)%span+span)%span;
  for(let i=-1;i<Math.ceil(W/span)+2;i++){
   const x=i*span-scroll,y=H*(.64+layer*.064)-oy*.02;
   ctx.fillStyle=['#123763','#194771','#265e87'][layer];
   ctx.beginPath();ctx.moveTo(x-170,y+75);
   ctx.quadraticCurveTo(x-140,y-64,x-70,y-58);
   ctx.quadraticCurveTo(x-8,y-129,x+95,y-56);
   ctx.quadraticCurveTo(x+149,y-32,x+172,y+75);ctx.closePath();ctx.fill();
  }
 }
 // A distant metallic cloud sea, never an asset stretched across the stage.
 const horizon=H*.73-oy*.012;
 const ocean=ctx.createLinearGradient(0,horizon,0,H);
 ocean.addColorStop(0,'#4d9bc7');ocean.addColorStop(1,'#0c335c');
 ctx.fillStyle=ocean;ctx.fillRect(0,horizon,W,H-horizon);
 for(let i=0;i<34;i++){
  const x=((i*197-ox*.17+time*.11)%(W+180)+W+180)%(W+180)-90;
  const y=horizon+12+(i*61)%Math.max(30,H-horizon-19);
  ctx.strokeStyle=i%2?'#fff3ba60':'#c6fbff40';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+20,y-7,x+48,y);ctx.stroke();
 }
 const landmarks=[
  {x:390,y:1134,type:'dock'}, {x:1300,y:1134,type:'coil'},
  {x:2260,y:1134,type:'coil'},{x:2890,y:1134,type:'spire'},
  {x:3550,y:1134,type:'temple'}
 ];
 for(const place of landmarks){
  const x=place.x-ox,y=place.y-oy;if(x<-280||x>W+280||y<-490||y>H+250)continue;
  ctx.save();ctx.translate(x,y);
  if(place.type==='dock'){
   ctx.fillStyle='#123d67';ctx.strokeStyle='#c7edff';ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(-120,0);ctx.lineTo(-100,-90);ctx.lineTo(-40,-160);ctx.lineTo(110,-90);ctx.lineTo(125,0);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#ffeeb2';ctx.fillRect(-42,-170,90,12);
  }else if(place.type==='coil'){
   ctx.strokeStyle='#a6dcf7';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-42,0);
   ctx.lineTo(-20,-155);ctx.lineTo(20,-155);ctx.lineTo(40,0);ctx.stroke();
   ctx.strokeStyle='#ffe9a9';ctx.lineWidth=4;
   for(let ring=0;ring<5;ring++){ctx.beginPath();ctx.ellipse(0,-35-ring*22,45-ring*5,9,0,0,TAU);ctx.stroke();}
  }else if(place.type==='spire'){
   ctx.fillStyle='#16466d';ctx.strokeStyle='#c7edff';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(-80,0);ctx.lineTo(-32,-210);ctx.lineTo(0,-340);
   ctx.lineTo(36,-210);ctx.lineTo(80,0);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#ffe89b';ctx.beginPath();ctx.arc(0,-340,18,0,TAU);ctx.fill();
  }else{
   ctx.fillStyle='#113660';ctx.strokeStyle='#fbebbc';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(-160,0);ctx.lineTo(-100,-240);
   ctx.lineTo(0,-290);ctx.lineTo(105,-240);ctx.lineTo(165,0);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#fce38a';ctx.beginPath();ctx.ellipse(0,-165,58,78,0,0,TAU);ctx.fill();
   ctx.fillStyle='#153f67';ctx.beginPath();ctx.ellipse(0,-165,38,52,0,0,TAU);ctx.fill();
   if(!options.reducedMotion){ctx.strokeStyle='#e5c8ff';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,-165,85,time*.018,time*.018+Math.PI);ctx.stroke();}
  }
  ctx.restore();
 }
 // Animated distant lightning only. No photosensitivity-inducing full-frame flash.
 if(!options.reducedMotion&&Math.floor(time/180)%4===2){
  ctx.strokeStyle='#fff3b54d';ctx.lineWidth=3;
  const x=W*.75,y=110;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-35,y+48);
  ctx.lineTo(x-8,y+45);ctx.lineTo(x-52,y+106);ctx.stroke();
 }
 ctx.restore();
}
