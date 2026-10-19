const TAU=Math.PI*2,cache=new Map();
function leaf(ctx,x,y,length,angle,color,width=.2){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(length*.28,-length*width,length*.8,-length*width,length,0);ctx.bezierCurveTo(length*.65,length*width*.5,length*.22,length*width,0,0);ctx.fill();ctx.strokeStyle='#c1c98244';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(length*.5,-length*.025,length*.92,0);ctx.stroke();ctx.restore();
}
function palm(ctx,x,y,size,lean=1){
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);
 ctx.strokeStyle='#3e343d';ctx.lineWidth=21;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-28*lean,-110,35*lean,-190,14*lean,-270);ctx.stroke();
 ctx.strokeStyle='#997d68';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-3,0);ctx.bezierCurveTo(-25*lean,-110,30*lean,-190,10*lean,-270);ctx.stroke();
 ctx.strokeStyle='#443e4166';ctx.lineWidth=2;for(let i=0;i<15;i++){const yy=-i*17,xx=14*lean*Math.sin(i*.3);ctx.beginPath();ctx.moveTo(xx-7,yy);ctx.lineTo(xx+9,yy-4);ctx.stroke();}
 const topX=14*lean,topY=-270;
 for(let f=0;f<9;f++){const angle=-Math.PI+(f/8)*Math.PI*2,len=105+(f%3)*18;
  ctx.strokeStyle='#48675b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(topX,topY);ctx.quadraticCurveTo(topX+Math.cos(angle)*len*.7,topY+Math.sin(angle)*len*.55-18,topX+Math.cos(angle)*len,topY+Math.sin(angle)*len*.55+22);ctx.stroke();
  for(let k=1;k<10;k++){const u=k/10,xx=topX+Math.cos(angle)*len*u,yy=topY+Math.sin(angle)*len*.55*u+22*u*u;
   leaf(ctx,xx,yy,(28+Math.sin(u*Math.PI)*28)*(1-u*.45),angle-.8,['#36594f','#688565','#8a9b6e'][f%3],.15);
   leaf(ctx,xx,yy,36*(1-u*.6),angle+.95,['#587c61','#7d936c'][f%2],.18);
  }
 }
 ctx.fillStyle='#9d7d55';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(topX-12+i*9,topY+9,7,9,i*.4,0,TAU);ctx.fill();}
 ctx.restore();
}
function cottage(ctx,x,y,scale){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineJoin='round';
 // Raised timber veranda, slatted walls and overlapping thatch.
 ctx.fillStyle='#514450';for(const xx of [-65,55])ctx.fillRect(xx,0,9,35);
 ctx.fillStyle='#8f6e65';ctx.fillRect(-80,-93,160,98);ctx.fillStyle='#b19079';ctx.fillRect(-77,-90,110,92);
 ctx.strokeStyle='#675459';ctx.lineWidth=1;for(let i=0;i<17;i++){ctx.beginPath();ctx.moveTo(-76+i*9,-88);ctx.lineTo(-76+i*9,2);ctx.stroke();}
 ctx.fillStyle='#443c4b';ctx.fillRect(-23,-58,42,61);ctx.fillStyle='#e6c38e';ctx.fillRect(38,-59,25,31);ctx.strokeStyle='#6b5358';ctx.lineWidth=3;ctx.strokeRect(37,-60,27,33);ctx.beginPath();ctx.moveTo(50,-58);ctx.lineTo(50,-29);ctx.stroke();
 ctx.fillStyle='#594b50';ctx.beginPath();ctx.moveTo(-112,-88);ctx.quadraticCurveTo(-62,-125,-4,-165);ctx.quadraticCurveTo(61,-126,116,-88);ctx.quadraticCurveTo(0,-64,-112,-88);ctx.fill();
 for(let row=0;row<9;row++){ctx.strokeStyle=['#b99a77','#cfb48b','#a1876a'][row%3];ctx.lineWidth=5;const half=12+row*11,yy=-156+row*8;ctx.beginPath();ctx.moveTo(-half,yy);ctx.quadraticCurveTo(0,yy+14,half,yy);ctx.stroke();}
 ctx.strokeStyle='#58484e';ctx.lineWidth=3;for(let i=0;i<19;i++){const xx=-99+i*11;ctx.beginPath();ctx.moveTo(xx,-94);ctx.lineTo(xx+4,-80+(i%3)*3);ctx.stroke();}
 ctx.fillStyle='#d6ab88';ctx.fillRect(-92,4,185,8);ctx.fillStyle='#716066';ctx.fillRect(-38,16,76,8);ctx.fillRect(-48,27,96,7);
 ctx.strokeStyle='#b09079';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-87,-30);ctx.lineTo(-87,6);ctx.moveTo(87,-30);ctx.lineTo(87,6);ctx.moveTo(-87,-17);ctx.lineTo(-31,-17);ctx.moveTo(28,-17);ctx.lineTo(87,-17);ctx.stroke();
 for(let i=0;i<8;i++)leaf(ctx,-83+i*24,6,23,-1.4+(i%3)*.3,i%2?'#bf7184':'#d994a0',.35);
 ctx.restore();
}
function paintTile(ctx){
 ctx.clearRect(0,0,1400,900);
 ctx.fillStyle='#567773';ctx.beginPath();ctx.moveTo(0,900);ctx.lineTo(0,710);ctx.bezierCurveTo(150,610,225,750,420,690);ctx.bezierCurveTo(620,570,790,740,980,660);ctx.bezierCurveTo(1110,600,1290,680,1400,710);ctx.lineTo(1400,900);ctx.fill();
 palm(ctx,160,825,.75,-1);palm(ctx,1140,840,.95,1);cottage(ctx,730,670,.8);
 for(let i=0;i<23;i++){const x=i*64,y=820+(i%4)*13;leaf(ctx,x,y,65+(i%3)*16,-2.6+(i%4)*.45,['#3b5d55','#587862','#7c8c68'][i%3],.3);leaf(ctx,x+5,y,45,-.8,'#75896a',.3);}
}
function bitmap(key,paint,w=1400,h=900){
 if(cache.has(key))return cache.get(key);
 const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):typeof document!=='undefined'?document.createElement('canvas'):null;
 if(!canvas)return null;canvas.width=w;canvas.height=h;paint(canvas.getContext('2d'));cache.set(key,canvas);return canvas;
}
export function drawOhanaGarden(ctx,cam,t,w,h){
 ctx.save();const scale=h/900,span=1400*scale,shift=((cam.x*.22)%span+span)%span;
 ctx.fillStyle='#fff0cf77';ctx.beginPath();ctx.arc(w*.75,h*.29,Math.min(w,h)*.065,0,TAU);ctx.fill();
 const tile=bitmap('garden',paintTile);
 for(let i=-1;i<=Math.ceil(w/span);i++){const x=i*span-shift,y=-cam.y*.12;if(tile)ctx.drawImage(tile,x,y,span,h);else {ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);paintTile(ctx);ctx.restore();}}
 // Soft light and drifting seed points move independently of the cached brushwork.
 ctx.fillStyle='#ffe6b466';for(let i=0;i<10;i++){const x=((i*193-cam.x*.11+t*.06)%(w+40)+w+40)%(w+40),y=h*.52+Math.sin(i*2.2)*h*.15;ctx.beginPath();ctx.arc(x,y,1.2,0,TAU);ctx.fill();}ctx.restore();
}
export function drawOhanaGardenLandmarks(ctx,g,cam){
 const tree=bitmap('palm',c=>palm(c,235,590,1.55,-1),500,620);
 for(const [i,s] of g.roomDef.sectors.entries()){const x=s.x+s.w*.6-cam.x,y=1134-cam.y;if(x<-500||x>(g.viewW||1600)+500)continue;ctx.save();ctx.globalAlpha=.9;
  if(tree)ctx.drawImage(tree,x-235,y-590);else palm(ctx,x,y,1.55,i%2?1:-1);ctx.restore();}
}
