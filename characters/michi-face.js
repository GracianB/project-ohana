// Flat vector face rig: readable at gameplay scale, no gradients or added particles.
export function drawMichiFace(a,p,{x=0,y=-50,size=1,fur='#56657d',kind='kitten'}={}){
 const{c,shape,stroke,oval}=a,baby=kind==='kitten',ghost=kind==='ghost',lynx=kind==='lynx',glider=kind==='glider';
 c.save();c.translate(x+p.look*1.4+(p.inspect||0),y+p.breath+(p.groom||0)*2);
 c.rotate(p.state==='hurt'?.1:p.state==='victory'?-.08:Math.sin(p.t*.028)*.02+p.ear*.65);c.scale(size,size);
 const ink=ghost?'#678b9d':'#202b40',coat=ghost?'#d5f5e8':baby?'#6d7b92':fur,ear=lynx?-41:glider?-35:-31;
 shape(coat,()=>{
  c.moveTo(-24,-3);c.quadraticCurveTo(-29,-14,-23,ear);
  c.quadraticCurveTo(-17,ear+3,-9,-18);c.quadraticCurveTo(0,-24,12,-17);
  c.quadraticCurveTo(22,ear-1,27,ear+2);c.lineTo(26,-4);
  c.bezierCurveTo(35,5,26,20,11,23);c.quadraticCurveTo(-8,29,-24,12);c.quadraticCurveTo(-29,5,-24,-3);
 },ink);
 for(const side of[-1,1])shape(ghost?'#b8c8e0':'#c793a4',()=>{c.moveTo(side*22,ear+7);c.quadraticCurveTo(side*17,ear+11,side*14,-13);c.lineTo(side*23,-8);},null);
 // Pale cheek planes and an asymmetric forehead blaze make the same face legible.
 const cream=ghost?'#f1ffe9':baby?'#e0d9ce':'#b8c3bf';
 shape(cream,()=>{c.moveTo(-23,3);c.quadraticCurveTo(-13,-1,-3,7);c.quadraticCurveTo(3,1,15,5);c.quadraticCurveTo(24,5,26,11);c.quadraticCurveTo(13,29,-5,21);c.quadraticCurveTo(-20,21,-23,3);},null);
 shape(ghost?'#f1ffe9':baby?'#c4c9d1':'#96a9b7',()=>{c.moveTo(-9,-19);c.quadraticCurveTo(-1,-31,4,-19);c.quadraticCurveTo(11,-26,17,-19);c.lineTo(7,-10);c.lineTo(1,-7);c.lineTo(-2,-14);},null);
 if(lynx)for(const side of[-1,1]){stroke('#b6d5ca',1.4,()=>{c.moveTo(side*24,-34);c.lineTo(side*28,-47);c.moveTo(side*24,-34);c.lineTo(side*19,-43);});shape('#7d9ca8',()=>{c.moveTo(side*24,1);c.lineTo(side*34,12);c.lineTo(side*22,10);},null);}
 if(glider){for(const side of[-1,1]){oval(side*8,-23,6,4,'#bda27f');oval(side*8,-23,4.5,2.6,'#81939f');}stroke('#e4c7a0',1,()=>{c.moveTo(-2,-23);c.lineTo(2,-23);});}
 const blink=p.state==='dead'||(!p.still&&Math.sin(p.t*.041)>.994),happy=p.friend>.5||p.state==='victory';
 for(const side of[-1,1]){
  const ex=side*11,ey=-1+side*.6,rx=baby?8.5:ghost?8:7.5,ry=baby?8.5:ghost?6:6.5;
  if(blink)stroke(ink,1.7,()=>{c.moveTo(ex-6,ey);c.quadraticCurveTo(ex,ey+3,ex+6,ey);});
  else{
   oval(ex,ey,rx+1,ry+1,ghost?'#809bb1':'#334052',side*.04);
   oval(ex,ey,rx,ry,'#ecd48b',side*.04);oval(ex,ey+2,rx-1,ry*.48,'#cda277');
   oval(ex+p.look*1.6,ey+(p.lookY||0),1.5,4,ghost?'#455c80':'#1c283c');
   oval(ex+2,ey-3,baby?2:1.5,baby?2.3:1.7,'#fff4dc');oval(ex-2,ey+3,1,1,'#ecdfbd');
   stroke(ink,1.4,()=>{c.moveTo(ex-rx,ey-ry*.6);c.quadraticCurveTo(ex,ey-ry-2,ex+rx,ey-ry*.5);});
  }
  if(p.threat>.3)stroke(ink,1.7,()=>{c.moveTo(ex-5,ey-10-side*2);c.lineTo(ex+5,ey-10+side*2);});
  else stroke(ghost?'#8cacae':'#8d9bae',1,()=>{c.moveTo(ex-5,ey-12);c.quadraticCurveTo(ex,ey-15,ex+5,ey-12);});
 }
 if(baby||ghost)for(const side of[-1,1])oval(side*19,10,3.8,2,baby?'#d7a3ae':'#b5ded4');
 shape(ghost?'#a58db3':'#bb8593',()=>{c.moveTo(-2,6);c.quadraticCurveTo(2,4,6,6);c.lineTo(2,10);c.closePath();},null);
 stroke(ink,1,()=>{c.moveTo(2,10);c.lineTo(2,13);c.quadraticCurveTo(happy?7:8,happy?19:16,14,11);c.moveTo(2,13);c.quadraticCurveTo(-3,16,-7,12);});
 for(const side of[-1,1])for(let k=0;k<2;k++)stroke(ghost?'#7ea5ad':'#c1c9cd',.8,()=>{c.moveTo(side*19,10+k*4);c.quadraticCurveTo(side*25,8+k*5,side*(31+k*2),7+k*7);});
 if(ghost){shape('#fcffe8',()=>{c.moveTo(9,14);c.lineTo(13,13);c.lineTo(11,18);},null);if(p.gesture>.6)oval(6,16,2,3.2,'#df9cb8');}
 // One worn ear-ring and a tiny healed notch keep the rebel's identity.
 stroke('#d2ba8c',1.4,()=>c.arc(-23,-17,2.8,0,Math.PI*2));
 if(!baby)stroke(ghost?'#acc8ce':'#bc929f',1,()=>{c.moveTo(20,-8);c.lineTo(17,-1);});
 c.restore();
}
