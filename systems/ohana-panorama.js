// Scenic canvas art shared by the welcome stage. Cached by its caller.
const TAU=Math.PI*2;
function palm(c,x,y,h,lean){
 c.strokeStyle='#473b30';c.lineWidth=h*.08;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-lean,y-h*.5,x+lean,y-h);c.stroke();
 for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6,dx=Math.cos(a)*h*.52,dy=Math.sin(a)*h*.23;
  c.fillStyle=i%2?'#367862':'#245d51';c.beginPath();c.moveTo(x+lean,y-h);c.quadraticCurveTo(x+lean+dx*.6,y-h+dy-15,x+lean+dx,y-h+dy+18);c.quadraticCurveTo(x+lean+dx*.4,y-h+dy+5,x+lean,y-h);c.fill();}
}
export function drawOhanaCoast(c,W,H,floor){
 const sea=c.createLinearGradient(0,H*.47,0,floor);sea.addColorStop(0,'#2e7481');sea.addColorStop(.55,'#2e9b9d');sea.addColorStop(1,'#a6c8a4');
 c.fillStyle=sea;c.fillRect(0,H*.47,W,Math.max(0,floor-H*.47));
 for(let layer=0;layer<3;layer++){
  const x=W*(.13+layer*.15),y=H*(.49+layer*.035),w=W*(.3-layer*.035),h=H*(.16-layer*.025);
  c.fillStyle=['#416e77','#37616a','#254e52'][layer];c.beginPath();c.moveTo(x-w*.5,y);c.lineTo(x-w*.32,y-h*.5);c.lineTo(x-w*.1,y-h);c.lineTo(x+w*.12,y-h*.7);c.lineTo(x+w*.3,y-h*.83);c.lineTo(x+w*.5,y);c.closePath();c.fill();
  c.strokeStyle='#a4ddd4';c.lineWidth=Math.max(2,W*.003);c.beginPath();c.moveTo(x+w*.12,y-h*.65);c.quadraticCurveTo(x+w*.08,y-h*.3,x+w*.17,y);c.stroke();
 }
 c.strokeStyle='#d2ead08a';c.lineWidth=1;
 for(let i=0;i<32;i++){const x=((i*137)%997)/997*W,y=H*.52+(i%9)*(floor-H*.52)/10;c.beginPath();c.moveTo(x,y);c.lineTo(x+14+i%4*12,y);c.stroke();}
 c.fillStyle='#d6bd82';c.beginPath();c.moveTo(0,floor-14);c.bezierCurveTo(W*.3,floor-60,W*.65,floor+16,W,floor-28);c.lineTo(W,H);c.lineTo(0,H);c.fill();
 c.fillStyle='#315d43';c.beginPath();c.moveTo(0,floor);c.bezierCurveTo(W*.3,floor-28,W*.65,floor+40,W,floor-4);c.lineTo(W,H);c.lineTo(0,H);c.fill();
 palm(c,W*.025,floor+18,Math.min(H*.33,W*.2),W*.018);
 palm(c,W*.98,floor+16,Math.min(H*.29,W*.18),-W*.014);
 for(let i=0;i<24;i++){const x=W*(i+.5)/24,y=floor+22+(i%3)*13;c.fillStyle=i%2?'#f4b7a1':'#e8d39b';c.beginPath();c.arc(x,y,2+i%3,0,TAU);c.fill();}
}
export function drawEnemyIslet(c,x,y,r,t,reduced){
 c.save();
 c.fillStyle='#b7dfd04d';c.beginPath();c.ellipse(x,y+r*.72,r*1.16,r*.17,0,0,TAU);c.fill();
 const cliff=c.createLinearGradient(x,y,x,y+r*.7);cliff.addColorStop(0,'#655970');cliff.addColorStop(1,'#273f51');c.fillStyle=cliff;
 c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.75,y+r*.47);c.lineTo(x-r*.24,y+r*.7);c.lineTo(x+r*.62,y+r*.52);c.lineTo(x+r,y);c.closePath();c.fill();
 c.strokeStyle='#9b8790';c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(x-r*.75+i*r*.35,y+4);c.lineTo(x-r*.54+i*r*.24,y+r*.48);c.stroke();}
 c.fillStyle='#a3ac77';c.beginPath();c.ellipse(x,y,r,r*.25,0,0,TAU);c.fill();
 c.fillStyle='#42566a';for(let i=0;i<3;i++){const bx=x+r*(.35+i*.17);c.beginPath();c.moveTo(bx,y-4);c.lineTo(bx-r*.1,y-r*(.3+i*.12));c.lineTo(bx+r*.13,y-4);c.fill();}
 c.strokeStyle='#e5c597';c.lineWidth=2;c.beginPath();c.moveTo(x-r*.78,y-3);c.lineTo(x-r*.78,y-r*.65);c.stroke();
 c.fillStyle='#9c5667';c.beginPath();c.moveTo(x-r*.78,y-r*.65);c.lineTo(x-r*.35,y-r*.59+(reduced?0:Math.sin(t*2)*3));c.lineTo(x-r*.78,y-r*.4);c.fill();
 c.restore();
}
