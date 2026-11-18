// One authored landmark: the family ribbons belong to this tree, not tiled scenery.
const TAU=Math.PI*2;
const stroke=(c,color,w,fn)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,a,b,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
// Three small leaf groups are generated locally. Branches, wind and ribbons remain separate.
const canopies=new Map();
function paintCanopy(c,index){
 for(let l=0;l<3;l++){
  c.save();c.rotate((l-1)*.67);
  const glaze=c.createLinearGradient(-40,-27,40,14);glaze.addColorStop(0,['#b9a5bd','#a6b7aa','#b8bbc9'][index]);glaze.addColorStop(1,['#6d7c90','#7f9992','#887e9e'][index]);
  c.fillStyle=glaze;c.beginPath();c.moveTo(-40,2);c.bezierCurveTo(-22,-34,28,-30,43,0);c.bezierCurveTo(14,22,-15,21,-40,2);c.fill();
  stroke(c,'#d6d7bb55',1,()=>{c.moveTo(-30,2);c.quadraticCurveTo(0,-6,32,0);});c.restore();
 }
}
function drawCanopy(c,index){
 if(typeof OffscreenCanvas==='undefined'){paintCanopy(c,index);return;}
 let stamp=canopies.get(index);
 if(!stamp){stamp=new OffscreenCanvas(144,112);const q=stamp.getContext('2d');q.translate(72,60);paintCanopy(q,index);canopies.set(index,stamp);}
 c.drawImage(stamp,-72,-60);
}
export function drawMichiMemoryTree(c,g,cam,t,W,H,zone){
 if(zone!=='court'&&zone!=='return')return;
 const time=g.reduceMotion?0:t,anchor=zone==='court'?4360:12600;
 const x=W*.5+(anchor-(cam.x||0)-W*.5)*.26,y=H*.91-(cam.y||0)*.06,s=Math.min(1.15,H/810);
 if(x< -550*s||x>W+550*s)return;
 const lit=(g.world1?.stations||[]).filter(q=>q.done).length;
 c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';
 // Bent heartwood, with a hollow shaped like a sheltered place rather than a door.
 const wood=c.createLinearGradient(-90,-450,70,0);wood.addColorStop(0,'#58636d');wood.addColorStop(.4,'#3e485f');wood.addColorStop(1,'#222d46');
 c.fillStyle=wood;c.beginPath();c.moveTo(-89,38);c.bezierCurveTo(10,-71,-99,-220,-17,-407);c.lineTo(23,-430);c.bezierCurveTo(-9,-249,77,-113,87,40);c.bezierCurveTo(24,15,-38,25,-89,38);c.fill();
 stroke(c,'#879289',2,()=>{c.moveTo(-35,-346);c.bezierCurveTo(-61,-210,24,-121,7,13);c.moveTo(20,-340);c.bezierCurveTo(-7,-206,40,-134,47,-22);});
 for(let j=0;j<7;j++)stroke(c,j%2?'#647b7b':'#313b54',1,()=>{const xx=-22+j*8;c.moveTo(xx,8);c.quadraticCurveTo(xx-22,-104,xx-11,-192-j*11);});
 for(const side of[-1,1])for(let j=0;j<4;j++){
  const reach=side*(145+j*58),yy=-264-j*38;
  stroke(c,'#4f5b69',20-j*3,()=>{c.moveTo(0,yy+36);c.bezierCurveTo(side*87,yy-3,reach*.75,yy-72,reach,yy-45);});
  stroke(c,'#87968b',1.3,()=>{c.moveTo(side*29,yy+6);c.quadraticCurveTo(reach*.65,yy-68,reach,yy-46);});
  for(let k=0;k<4;k++){
   const bx=reach+(k-1.5)*35,by=yy-60+(k%2)*18+Math.sin(time*.012+j+k)*2;
   c.save();c.translate(bx,by);c.rotate((j%2?1:-1)*.24);drawCanopy(c,(j+k)%3);c.restore();
   for(let petal=0;petal<3;petal++)oval(c,bx+petal*6-5,by+2-petal%2*5,3,4,j%2?'#dfb7c7':'#c2cdb7');
  }
 }
 const ribbons=['#e8b89c','#a4c7d5','#efcf81','#d5a7bc','#b7d9bd','#d7a185','#aeb4d0','#e6c995','#d4ada1','#b7b1d6'];
 for(let j=0;j<10;j++){
  const xx=(j-4.5)*46,yy=-365-Math.sin(j*.4)*42,wind=Math.sin(time*.014+j)*5;
  stroke(c,ribbons[j],3,()=>{c.moveTo(xx,yy);c.bezierCurveTo(xx-6+wind,yy+18,xx+wind,yy+39,xx+wind*.5,yy+54+j%3*11);});
  if(j%2===0){const index=j/2,on=!!g.world1?.stations?.[index]?.done;
   oval(c,xx,yy+66,8,13,on?'#f2d2a6':'#596d7c');
   stroke(c,on?'#e9d4ad':'#98a89d',1,()=>{c.moveTo(xx-8,yy+56);c.lineTo(xx+8,yy+56);c.moveTo(xx,yy+55);c.lineTo(xx,yy+77);});
  }
 }
 // A restrained, earned halo warms the hollow as the five real lights return.
 if(lit){const halo=c.createRadialGradient(0,-80,8,0,-80,91);halo.addColorStop(0,'rgba(245,214,169,'+(lit*.025)+')');halo.addColorStop(1,'rgba(245,214,169,0)');c.fillStyle=halo;c.fillRect(-100,-180,200,200);}
 c.restore();
}
