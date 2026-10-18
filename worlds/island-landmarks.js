const TAU=Math.PI*2;
const PALETTES={hub:['#537e60','#294f49','#b7d599'],beach:['#789f78','#375d5c','#e8d5a4'],jungle:['#3d7658','#204b48','#8eb873'],cave:['#6f9aaf','#304e69','#c6dfe4'],lab:['#608d99','#314659','#a6e0df'],ridge:['#8faba8','#516c77','#e0e5ce'],space:['#817b9c','#454c70','#b1c4de'],reef:['#61a5a7','#376c81','#b3d8bf'],volcano:['#946b64','#4d4757','#c59b7d'],boss:['#826e71','#453f52','#b8af9c']};
// Landmarks belong to world coordinates, so camera movement reveals a place.
export function drawIslandLandmarks(ctx,g,cam,t){
 const r=g.roomDef;if(!r)return;const [light,dark,leaf]=PALETTES[r.id]||PALETTES.hub;
 const floor=1134;
 ctx.save();ctx.lineCap='round';
 for(const sector of r.sectors){
  const x=sector.x+sector.w*.63-cam.x,y=floor-cam.y;
  if(x<-700||x>(g.viewW||1600)+700)continue;
  const tall=sector.role==='secret'?390:310;
  // Weathered cliff formations keep vertical routes grounded in the island.
  ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(x-220,y+8);ctx.bezierCurveTo(x-160,y-50,x-190,y-155,x-100,y-190);ctx.bezierCurveTo(x-40,y-160,x+30,y-240,x+80,y-200);ctx.bezierCurveTo(x+130,y-150,x+100,y-50,x+220,y+8);ctx.closePath();ctx.fill();
  ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x-200,y);ctx.bezierCurveTo(x-150,y-40,x-150,y-143,x-95,y-165);ctx.quadraticCurveTo(x-35,y-140,x+12,y-186);ctx.lineTo(x+18,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=leaf+'45';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-115+i*52,y-130-i*13);ctx.quadraticCurveTo(x-150+i*55,y-65,x-120+i*65,y);ctx.stroke();}
  if(['hub','jungle','beach'].includes(r.id)){
   const tx=x+60,ty=y-tall;ctx.strokeStyle=dark;ctx.lineWidth=27;ctx.beginPath();ctx.moveTo(tx-30,y);ctx.bezierCurveTo(tx+5,y-80,tx-24,ty+80,tx,ty);ctx.stroke();
   ctx.strokeStyle=light;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx-30,y);ctx.bezierCurveTo(tx-5,y-80,tx-35,ty+80,tx-7,ty);ctx.stroke();
   for(let i=0;i<5;i++){const px=tx+(i-2)*44,py=ty-16+Math.abs(i-2)*17;ctx.fillStyle=i%2?light:leaf;ctx.beginPath();ctx.ellipse(px,py,65,31,(i-2)*.16,0,TAU);ctx.fill();}
   if(r.id!=='beach')for(let i=0;i<4;i++){ctx.strokeStyle=leaf+'aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx-85+i*50,ty);ctx.bezierCurveTo(tx-75+i*50,ty+90,tx-100+i*50,ty+110,tx-82+i*50,ty+160);ctx.stroke();}
  }else if(r.id==='reef'||r.id==='cave'){
   for(let i=0;i<5;i++){const px=x-80+i*45,py=y-185;ctx.strokeStyle=leaf;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-45-i%3*22);ctx.moveTo(px,py-20);ctx.lineTo(px-14,py-38);ctx.moveTo(px,py-30);ctx.lineTo(px+16,py-52);ctx.stroke();}
  }else{
   for(let i=0;i<3;i++){ctx.fillStyle=i%2?light:dark;ctx.beginPath();ctx.moveTo(x-90+i*70,y-170);ctx.lineTo(x-70+i*70,y-260-i%2*30);ctx.lineTo(x-40+i*70,y-170);ctx.closePath();ctx.fill();}
  }
  if(['hub','beach','jungle','reef'].includes(r.id)){
   const wx=x-120;ctx.save();ctx.globalAlpha=.4;const water=ctx.createLinearGradient(0,y-160,0,y);water.addColorStop(0,'#c8f2e9');water.addColorStop(1,'#79c9da33');ctx.fillStyle=water;ctx.beginPath();ctx.moveTo(wx,y-160);ctx.bezierCurveTo(wx-5,y-80,wx+28,y-55,wx+22,y);ctx.lineTo(wx+55,y);ctx.bezierCurveTo(wx+44,y-80,wx+12,y-80,wx+18,y-160);ctx.closePath();ctx.fill();ctx.strokeStyle='#e0faf1';ctx.lineWidth=1;for(let i=0;i<5;i++){const yy=y-150+((t*.7+i*29)%145);ctx.beginPath();ctx.moveTo(wx+8,yy);ctx.lineTo(wx+20,yy+12);ctx.stroke();}ctx.restore();
  }
 }
 ctx.restore();
}
