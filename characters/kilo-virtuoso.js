// Musical performance follows action progress rather than a cosmetic clock.
// The existing articulated body remains the owner of all joints and cloth.
export function kiloVirtuosoRig(p={},form=0){
 const n=v=>Number.isFinite(v)?v:0,progress=Math.max(0,Math.min(1,n(p.state==='attack'?p.atk:p.cast))),beat=Math.sin(progress*Math.PI);
 const active=['attack','cast'].includes(p.state),air=['jump','glide','fall'].includes(p.state);
 return {active,beat,plant:active?beat*(2+form*.55):0,lean:active?Math.sin(progress*Math.PI*2)*.07:0,
  focus:active&&progress>.18&&progress<.82,air,trail:!p.reduceMotion&&air&&form>=2?1:0};
}
export function drawKiloVirtuoso(c,p,f,d,r){
 const a=kiloVirtuosoRig(p,f),sy=-d.ll-d.th;

 c.save();c.lineCap='round';c.lineJoin='round';
 drawKiloCouture(c,p,f,d,r);if(f===0){c.restore();return;}
 // A carved musician's clasp anchors two short silk streamers at the waist.
 // Their increasing length makes the bard/guardian/solar silhouettes distinct.
 const color=['','#f3bc83','#a0d9a8','#dfbd7b','#fff0a9'][f],time=p.reduceMotion?0:Number(p.t)||0;
 if(f>=2)for(const side of [-1,1]){
  const len=8+f*4,wave=p.reduceMotion?0:Math.sin(time*.08+side)*2;
  c.fillStyle=side>0?color:'#568f84';c.strokeStyle='#384c55';c.lineWidth=.8;
  c.beginPath();c.moveTo(side*9,sy+d.th*.68);c.quadraticCurveTo(side*(16+f)+wave,sy+d.th+6,side*(10+f)+wave,sy+d.th+len);c.lineTo(side*7,sy+d.th+len-4);c.quadraticCurveTo(side*12,sy+d.th+5,side*6,sy+d.th*.68);c.closePath();c.fill();c.stroke();
 }
 // Separate shoulder leaves and a resonator clasp stay attached to the torso.
 if(f>=2)for(const side of [-1,1]){
  c.fillStyle=f===4?'#e6cd84':'#85b992';c.strokeStyle='#38594d';c.lineWidth=.8;c.beginPath();c.moveTo(side*6,sy+4);c.quadraticCurveTo(side*17,sy-2,side*18,sy+9);c.quadraticCurveTo(side*10,sy+11,side*6,sy+4);c.fill();c.stroke();
 }
 c.fillStyle=color;c.strokeStyle='#78634b';c.lineWidth=1;c.beginPath();c.ellipse(0,sy+d.th*.69,3.4,4.6,0,0,Math.PI*2);c.fill();c.stroke();
 c.strokeStyle='#fff2cc';c.lineWidth=.8;c.beginPath();c.moveTo(0,sy+d.th*.69-3);c.lineTo(0,sy+d.th*.69+2);c.stroke();
 if(a.trail){c.globalAlpha=.36;c.strokeStyle=color;c.lineWidth=1.2;for(let i=0;i<2;i++){c.beginPath();c.moveTo(-12-i*5,-d.ll+5);c.quadraticCurveTo(-30-i*5,-d.ll-2,-35-i*6,-d.ll-13);c.stroke();}}
 if(a.active&&f>0&&Array.isArray(r.handF)){const [hx,hy]=r.handF;c.globalAlpha=.35+a.beat*.4;c.strokeStyle=color;c.lineWidth=.9;for(let i=0;i<3;i++){c.beginPath();c.moveTo(hx+4+i*3,hy-5);c.quadraticCurveTo(hx+8+i*3,hy-8-a.beat*3,hx+5+i*3,hy-12);c.stroke();}}
 c.restore();
}

// Sewn panels follow the same torso/hip transforms as the articulated dress.
function drawKiloCouture(c,p,f,d,r){
 const sy=-d.ll-d.th,hip=-d.ll,x=(r.hipX||0)*.4-.5,shift=-(p.sway||0)*3+(r.hipX||0)*.6+(r.skirt||0)*3;
 const hem=hip+d.ll*(f===4?.55:f>=3?.45:f===0?.35:.32)-(r.hemLift||0),top=f===0?10:8,w=(f===0?14:13+f*.8)+(r.flare||0)*7;
 const palettes=[['#f6d6d0','#c88699','#fff1d9'],['#cf736e','#f7dbb9','#fff3d9'],['#5f9a88','#b9d9b0','#f2e2b9'],['#703c56','#d0a976','#e5d9b1'],['#dce8d2','#c7ae75','#fff5d4']], [fabric,trim,light]=palettes[f];
 const line=(col,weight,fn)=>{c.strokeStyle=col;c.lineWidth=weight;c.beginPath();fn();c.stroke();};
 const bead=(xx,yy,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);c.fill();};
 c.save();
 // Clip woven panels to the moving garment, including the actual raised hem.
 c.beginPath();c.moveTo(x-top,sy);c.quadraticCurveTo(x-top-2,sy+(hem-sy)*.4,x-w+shift,hem);c.quadraticCurveTo(x+shift,hem+3+(r.flare||0),x+w+shift,hem);c.quadraticCurveTo(x+top+2,sy+(hem-sy)*.4,x+top,sy);c.closePath();c.clip();
 if(f===0){
  c.fillStyle='#ffe5d4';c.beginPath();c.moveTo(x-7,sy+7);c.lineTo(x,sy+7);c.lineTo(x,sy+14);c.quadraticCurveTo(x-4,sy+17,x-7,sy+13);c.fill();
  line(trim,.65,()=>{c.moveTo(x-6,sy+8);c.lineTo(x-6,sy+13);c.quadraticCurveTo(x-3,sy+15,x-1,sy+12);});
  for(let j=0;j<3;j++)bead(x+4,sy+5+j*4,.7,.8,light);
 }else{
  // Form-specific cuts: bias silk, leaf-weave, ceremonial brocade and pearl petals.
  const count=f===4?5:f===1?3:4;
  for(let j=0;j<count;j++){
   const k=j/(count-1),xx=x+(k-.5)*w*1.65,tip=xx+shift*(.5+k*.5);
   c.fillStyle=j%2?fabric:trim;c.globalAlpha=f===4?.72:.34;c.beginPath();c.moveTo(x+(k-.5)*top,sy+d.th*.22);c.bezierCurveTo(xx*.65+x*.35,hip-5,tip-3,hem-7,tip,hem+2);c.quadraticCurveTo(tip+4,hem-2,tip+6,hem-9);c.quadraticCurveTo(xx+5,hip-3,x+(k-.5)*top+3,sy+d.th*.22);c.fill();
   c.globalAlpha=1;line(f===4?light:trim,.65,()=>{c.moveTo(x+(k-.5)*top,sy+d.th*.25);c.quadraticCurveTo(xx+1,hip,tip,hem-3);});
  }
  const waist=sy+d.th*.57;c.fillStyle=fabric;c.fillRect(x-w,waist-1,w*2,3.3);
  line(light,.9,()=>{c.moveTo(x-w,waist);c.quadraticCurveTo(x,waist+2,x+w,waist);});
  for(let j=0;j<7;j++){
   const xx=x-w*.72+j*w*.24+shift*.7,yy=hem-4-Math.sin(j*.55)*1.2;
   line(trim,.8,()=>{c.moveTo(xx-1.6,yy);c.quadraticCurveTo(xx,yy-4,xx+1.6,yy);c.quadraticCurveTo(xx,yy+2,xx-1.6,yy);});
   if(f>=3)bead(xx,yy-3,.65,1,light);
  }
  if(f===2||f===3){
   for(let j=0;j<4;j++){const yy=sy+d.th*.3+j*3.1;line(light,.6,()=>{c.moveTo(x-3,yy);c.lineTo(x,yy-1.6);c.lineTo(x+3,yy);c.lineTo(x,yy+1.6);c.closePath();});}
  }
  if(f===4){for(let j=0;j<5;j++)bead(x+(j-2)*3.2,sy+5+Math.abs(j-2)*.8,1.2,2.2,j%2?trim:light);}
 }
 c.restore();
 // The yoke and clasp sit above the stitched fabric, still on the original torso.
 line(light,1,()=>{c.moveTo(x-7,sy+3);c.quadraticCurveTo(x,sy+12,x+7,sy+3);});
 if(f>0){bead(x,sy+9,2,2.7,trim);bead(x,sy+8.4,.7,1,light);}
}
