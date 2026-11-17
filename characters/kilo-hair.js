// Hair stays in the head's original transform. No hitbox, joint or combat changes.
const TAU=Math.PI*2,finite=x=>Number.isFinite(x)?x:0;
const line=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,a,b,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
export function drawKiloHairBack(c,R,p,f,hr,r){
 const t=p.reduceMotion?0:finite(p.t),lag=p.reduceMotion?0:finite(r.hairLag),sway=p.reduceMotion?0:finite(p.sway);
 const bx=-hr*.64,by=-hr*.43,len=hr*[.58,1.9,2.5,3.1,3.7][f],wind=p.reduceMotion?0:Math.sin(t*.048)*hr*.10+lag*hr*.38+sway*hr*.2;
 c.save();c.lineCap='round';c.lineJoin='round';
 if(f===0){
  line(c,'#201c2d',hr*.24,()=>{c.moveTo(-hr*.08,-hr*.82);c.bezierCurveTo(-hr*.45,-hr*1.5,hr*.35,-hr*1.6,hr*.18,-hr*1.10);});
  line(c,'#74607c',hr*.045,()=>{c.moveTo(-hr*.08,-hr*.95);c.bezierCurveTo(-hr*.24,-hr*1.34,hr*.22,-hr*1.42,hr*.18,-hr*1.14);});c.restore();return;
 }
 // Three tapered locks retain their own delayed curves rather than one solid ponytail.
 for(let j=0;j<3;j++){
  const off=(j-1)*hr*.22,tip=bx+wind+off*.5,yy=by+len*(.88+j*.055),width=hr*(.31-j*.035),wave=p.reduceMotion?0:Math.sin(t*.052-j*.65)*hr*.10;
  c.fillStyle=['#211e2e','#302535','#423146'][j];c.strokeStyle='#201c2d';c.lineWidth=hr*.065;
  c.beginPath();c.moveTo(bx+off+width,by-hr*.22);c.bezierCurveTo(bx-hr*.6+off,by+len*.1,tip-hr*.5+wave,by+len*.7,tip,yy);
  c.quadraticCurveTo(tip+hr*.21,yy+hr*.14,tip+hr*.28,yy-hr*.16);c.bezierCurveTo(tip+width+wave,by+len*.64,bx+off+width*1.5,by+len*.2,bx+off+width,by-hr*.22);c.fill();c.stroke();
  line(c,j===1?'#80647d':'#65516f',hr*.045,()=>{c.moveTo(bx+off,by+hr*.1);c.bezierCurveTo(bx-hr*.2+off,by+len*.35,tip-hr*.18+wave,by+len*.7,tip+hr*.09,yy-hr*.13);});
 }
 if(f===3){
  for(let j=0;j<7;j++){const k=j/7,x=bx+wind*k+Math.sin(j*Math.PI)*hr*.08,y=by+len*(.15+k*.68);oval(c,x,y,hr*.20,hr*.15,j%2?'#49354e':'#332a40');line(c,'#92738c',hr*.03,()=>{c.moveTo(x-hr*.13,y-hr*.07);c.quadraticCurveTo(x,y+hr*.08,x+hr*.13,y-hr*.07);});}
 }
 const tie=['','#da8d9a','#7bb69f','#dec08b','#e4d6b3'][f];oval(c,bx+hr*.1,by+hr*.08,hr*.29,hr*.10,tie);
 if(f>=2){for(let j=0;j<3;j++)oval(c,bx+hr*.11-j*hr*.12,by+hr*.24+j*hr*.13,hr*.055,hr*.08,tie);}
 c.restore();
}
export function drawKiloHairFront(c,R,p,f,hr,r){
 const t=p.reduceMotion?0:finite(p.t),wind=p.reduceMotion?0:Math.sin(t*.043)*hr*.025+finite(r.hairLag)*hr*.05;
 c.save();c.lineCap='round';
 // Hand-shaped fringe follows the hairline and leaves both eyes unobscured.
 for(let j=0;j<4;j++){
  const x=(-.72+j*.29)*hr;c.fillStyle=j%2?'#3d2f46':'#302535';c.beginPath();c.moveTo(x,-hr*(.65+Math.sin(j)*.10));c.quadraticCurveTo(x+hr*.34,-hr*.9,x+hr*.35,-hr*.28+wind);c.quadraticCurveTo(x+hr*.17,-hr*.02,x+hr*.09,-hr*.12);c.quadraticCurveTo(x+hr*.17,-hr*.48,x,-hr*.65);c.fill();
  line(c,j===1?'#9b7b90':'#6a5578',hr*.037,()=>{c.moveTo(x+hr*.10,-hr*.64);c.quadraticCurveTo(x+hr*.26,-hr*.61,x+hr*.23,-hr*.25+wind);});
 }
 if(f>=1){line(c,'#8b7087',hr*.035,()=>{c.moveTo(-hr*.87,-hr*.19);c.quadraticCurveTo(-hr*.91,hr*.19,-hr*.71,hr*.42);});}
 c.restore();
}
