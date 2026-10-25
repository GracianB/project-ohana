// Scenic Canvas painting for the workshop coast and cloud sanctuary. All
// coordinates are decorative; authored platforms alone own collision.
const TAU=Math.PI*2;
const gradients=new WeakMap();
function sky(c,W,H,kind){let m=gradients.get(c);if(!m)gradients.set(c,m=new Map());const key=kind+W+':'+H;
 if(!m.has(key)){const g=c.createLinearGradient(0,0,0,H);for(const [k,col] of (kind==='dock'?[[0,'#79c5e5'],[.5,'#d5eff0'],[1,'#efcfaa']]:[[0,'#68b4e2'],[.53,'#d6f3fa'],[1,'#f9e8c4']]))g.addColorStop(k,col);if(m.size>8)m.delete(m.keys().next().value);m.set(key,g);}c.fillStyle=m.get(key);c.fillRect(0,0,W,H);}
function oval(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function cloud(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.beginPath();c.moveTo(-90,15);c.bezierCurveTo(-115,-13,-66,-35,-45,-15);c.bezierCurveTo(-42,-66,35,-66,41,-22);c.bezierCurveTo(78,-45,111,-3,86,15);c.bezierCurveTo(42,34,-43,34,-90,15);c.fill();c.restore();}
function island(c,x,y,w,h,col){c.fillStyle=col;c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x-w*.8,y-h*.3,x-w*.5,y-h,x-w*.12,y-h);c.bezierCurveTo(x+w*.38,y-h,x+w*.6,y-h*.25,x+w,y);c.bezierCurveTo(x+w*.4,y+24,x-w*.5,y+30,x-w,y);c.fill();}
function boat(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);c.rotate(Math.sin(t*.009)*.025);
 c.fillStyle='#357485';c.beginPath();c.moveTo(-66,0);c.bezierCurveTo(-42,29,45,29,67,-2);c.closePath();c.fill();
 line(c,'#d8ebdc',3,()=>{c.moveTo(-58,-2);c.quadraticCurveTo(0,9,59,-4);});
 c.fillStyle='#e8e1b9';c.fillRect(-34,-39,64,35);c.fillStyle='#588ba0';for(let i=0;i<3;i++)c.fillRect(-25+i*17,-31,10,13);
 c.fillStyle='#d57d68';c.beginPath();c.moveTo(-45,-39);c.quadraticCurveTo(-5,-63,44,-40);c.closePath();c.fill();
 line(c,'#725d55',3,()=>{c.moveTo(19,-3);c.lineTo(19,-84);});c.fillStyle='#fff5d7';c.beginPath();c.moveTo(20,-82);c.quadraticCurveTo(61,-59,20,-45);c.fill();c.restore();}
function crane(c,x,y,t){c.save();c.translate(x,y);c.strokeStyle='#435d63';c.lineWidth=15;c.lineJoin='round';c.beginPath();c.moveTo(-70,0);c.lineTo(-70,-245);c.lineTo(130,-245);c.stroke();
 line(c,'#daa15e',8,()=>{c.moveTo(-70,-245);c.lineTo(130,-245);});
 line(c,'#8aa0a0',2,()=>{for(let i=0;i<5;i++){c.moveTo(-76,-45-i*37);c.lineTo(-63,-82-i*37);}c.moveTo(-70,-155);c.lineTo(100,-245);});
 const sway=Math.sin(t*.012)*9;line(c,'#677e81',2,()=>{c.moveTo(75,-245);c.lineTo(75+sway,-108);});
 c.fillStyle='#6b9aab';c.beginPath();c.ellipse(75+sway,-91,50,17,0,0,TAU);c.fill();c.strokeStyle='#34505e';c.lineWidth=2;c.stroke();oval(c,75+sway,-109,29,21,'#d2f8ef');
 for(let i=-1;i<=1;i++)oval(c,75+sway+i*24,-89,4,3,'#fff1b5');
 c.fillStyle='#c28b66';c.fillRect(-90,-27,55,27);c.strokeStyle='#614f4b';c.strokeRect(-90,-27,55,27);c.restore();}
function arch(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;
 for(const side of [-1,1]){c.fillRect(side*92-13,-186,26,186);c.fillStyle='#ecdbc1';c.fillRect(side*92-17,-18,34,18);c.fillRect(side*92-17,-190,34,15);c.fillStyle=col;
  for(let j=0;j<7;j++)line(c,'#789fba',1,()=>{c.moveTo(side*92-10,-30-j*21);c.lineTo(side*92+10,-30-j*21);});}
 line(c,'#d1c8ac',19,()=>{c.moveTo(-92,-178);c.bezierCurveTo(-85,-286,85,-286,92,-178);});
 line(c,'#fff8df',4,()=>{c.moveTo(-92,-184);c.bezierCurveTo(-79,-273,79,-273,92,-184);});
 c.fillStyle='#c4d8df';c.fillRect(-119,-7,238,7);c.restore();}
export function drawCraftedScene(c,g,cam,t,W,H){
 const hero=g.roomDef?.hero;if(!['stitcho','chispin'].includes(hero))return false;
 const dock=hero==='stitcho',time=g.reduceMotion?0:t,ground=1134-cam.y;
 c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';sky(c,W,H,dock?'dock':'storm');
 // Broad, softly layered sky instead of the old polygonal mountains.
 oval(c,W*.78,H*.22,64,64,'#fff6d549');oval(c,W*.78,H*.22,43,43,'#fffce8');
 for(let i=-1;i<7;i++){const x=i*340-(cam.x*.08+time*.05)%340;cloud(c,x,95+(i%3)*75,1.2+(i%2)*.55,'#ffffff8c');}
 const horizon=H*.66;
 if(dock){
  for(let layer=0;layer<3;layer++){const span=720,shift=cam.x*(.07+layer*.07),base=horizon+layer*40;c.globalAlpha=.55+layer*.12;
   for(let i=Math.floor(shift/span)-1;i<Math.ceil((shift+W)/span)+1;i++)island(c,i*span-shift,base,390,150-layer*28,['#96bfcb','#79a6b5','#648f9c'][layer]);}
  c.globalAlpha=1;c.fillStyle='#79b9c4';c.fillRect(0,horizon+95,W,H);
  for(let i=0;i<26;i++){const yy=horizon+102+i*12,xx=((i*153-cam.x*.2+time*.16)%(W+240)+W+240)%(W+240)-120;line(c,i%3?'#bddedc':'#f4dfba',1+(i%2),()=>{c.moveTo(xx,yy);c.quadraticCurveTo(xx+30,yy+3,xx+70+(i%4)*13,yy);});}
  for(let i=-1;i<4;i++)boat(c,i*520+250-cam.x*.22,horizon+100+(i%2)*44,.6+(i%2)*.18,time+i*40);
  for(let i=Math.floor(cam.x/1250)-1;i<Math.ceil((cam.x+W)/1250)+1;i++){const x=i*1250+640-cam.x;
   c.globalAlpha=.8;crane(c,x,ground-15,time+i*20);c.globalAlpha=1;
   // Organic warehouse roof, portholes and suspended repair gantries.
   c.fillStyle='#d7d6bd';c.beginPath();c.moveTo(x+165,ground-12);c.lineTo(x+165,ground-130);c.bezierCurveTo(x+190,ground-203,x+337,ground-203,x+370,ground-130);c.lineTo(x+370,ground-12);c.fill();
   line(c,'#537d87',9,()=>{c.moveTo(x+160,ground-132);c.bezierCurveTo(x+190,ground-210,x+340,ground-210,x+375,ground-132);});
   for(let k=0;k<4;k++){oval(c,x+199+k*42,ground-112,13,15,'#517e94');oval(c,x+195+k*42,ground-116,4,7,'#c5f1ef');}
   c.fillStyle='#678e96';c.fillRect(x+238,ground-73,62,61);line(c,'#c5d8c3',2,()=>{for(let k=0;k<5;k++){c.moveTo(x+240,ground-63+k*10);c.lineTo(x+298,ground-63+k*10);}});
  }
 }else{
  for(let i=-1;i<7;i++)cloud(c,i*390-cam.x*.16,horizon+45+(i%2)*30,2.2,'#eaf8f9');
  for(let i=Math.floor(cam.x*.26/700)-1;i<Math.ceil((cam.x*.26+W)/700)+1;i++){const x=i*700-cam.x*.26;
   island(c,x,horizon+65,180,65,'#8faebd');arch(c,x,horizon+38,.67,'#b0cad3');}
  // Long aqueducts, weathered arches and conductive copper in clear daylight.
  for(let i=Math.floor(cam.x/1350)-1;i<Math.ceil((cam.x+W)/1350)+1;i++){const x=i*1350+660-cam.x;
   arch(c,x,ground-12,1.05,'#a2bfcb');
   line(c,'#a88358',3,()=>{c.moveTo(x-120,ground-207);c.quadraticCurveTo(x,ground-165,x+120,ground-207);});
   for(let k=-2;k<=2;k++){const xx=x+k*37,yy=ground-189+Math.cos(k*.5)*16;oval(c,xx,yy,5,7,'#fff3ba');}
   c.fillStyle='#b6d2d8';c.fillRect(x+155,ground-100,102,88);c.fillStyle='#dfd6b8';c.beginPath();c.ellipse(x+206,ground-100,59,19,0,Math.PI,TAU);c.fill();
   for(let j=0;j<5;j++){line(c,'#8c9e9d',2,()=>{c.moveTo(x+168,ground-81+j*14);c.lineTo(x+244,ground-81+j*14);});}
   const sway=Math.sin(time*.018+i)*.04;c.save();c.translate(x+206,ground-123);c.rotate(sway);line(c,'#b18a57',4,()=>{c.moveTo(0,26);c.lineTo(0,-58);});c.strokeStyle='#f9e5ad';c.lineWidth=4;c.beginPath();c.ellipse(0,-32,34,15,0,0,TAU);c.stroke();c.restore();
  }
 }
 // Fine foreground plants and drifting seeds soften the mechanical structures.
 for(let x=Math.floor(cam.x/137)*137;x<cam.x+W+137;x+=137){const xx=x-cam.x;line(c,dock?'#5e9383':'#83a69d',2,()=>{c.moveTo(xx,ground);c.quadraticCurveTo(xx-3,ground-20,xx+7,ground-36);});oval(c,xx+4,ground-23,8,3,dock?'#92b9a3':'#bdd2ba');}
 for(let i=0;i<8;i++){const x=(i*179+time*.12-cam.x*.12)%(W+50);oval(c,x,H*.4+(i%4)*H*.1+Math.sin(time*.01+i)*4,2,1.5,'#fff7d5');}
 c.restore();return true;
}
