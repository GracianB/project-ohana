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
 const sy=-d.ll-d.th,hip=-d.ll,x=(r.hipX||0)*.4-.5,shift=-(p.sway||0)*3+(r.skirt||0)*3,t=p.reduceMotion?0:Number(p.t)||0;
 const palettes=[['#fff4e2','#d77f9e'],['#fff2c9','#ed8b8e'],['#d5f1ae','#3f8c83'],['#ffe3a0','#508d91'],['#fff5c7','#cf9d4e']], [light,trim]=palettes[f];
 const line=(color,w,fn)=>{c.beginPath();fn();c.strokeStyle=color;c.lineWidth=w;c.stroke();};
 if(f===0){
  // Tiny stitched pocket and a sleeping seed on the baby's romper.
  c.fillStyle='#ffe8dc';c.beginPath();c.moveTo(x-9,sy+7);c.lineTo(x-2,sy+7);c.lineTo(x-2,sy+13);c.quadraticCurveTo(x-6,sy+17,x-9,sy+12);c.fill();
  line(trim,.65,()=>{c.moveTo(x-8,sy+8);c.lineTo(x-8,sy+12);c.lineTo(x-5,sy+14);c.lineTo(x-3,sy+12);});return;
 }
 // Distinct bolero, woven yoke, ceremonial embroidery and solar pleats.
 if(f===1){c.fillStyle='#f5d6b1';for(const side of[-1,1]){c.beginPath();c.moveTo(x+side*7,sy+2);c.quadraticCurveTo(x+side*16,sy-1,x+side*13,sy+11);c.lineTo(x+side*8,sy+7);c.fill();}}
 const hem=hip+d.ll*(f===4?.55:f===3?.45:.32),w=11+f;
 for(let i=0;i<7;i++){const k=i/6,xx=x+(k-.5)*w*2+shift*k,wave=p.reduceMotion?0:Math.sin(t*.075+i*.8)*(f===4?1.6:.8);
  line(i%2?trim:light,f===4?1.2:.9,()=>{c.moveTo(xx*.7+x*.3,sy+d.th*.62);c.quadraticCurveTo(xx+wave,hip,xx+wave,hem-2);});
  if(f>=3){c.fillStyle=light;c.beginPath();c.moveTo(xx,hem-6);c.lineTo(xx+1.5,hem-3);c.lineTo(xx,hem);c.lineTo(xx-1.5,hem-3);c.fill();}
 }
 line(light,1.4,()=>{c.moveTo(x-8,sy+5);c.quadraticCurveTo(x,sy+14,x+8,sy+5);});
 // Musical beadwork forms a narrow stitched border, never a body-sized aura.
 for(let i=0;i<5;i++){const xx=x-7+i*3.5,y=sy+d.th*.58+Math.abs(i-2)*.45;c.fillStyle=i%2?trim:light;c.beginPath();c.ellipse(xx,y,1.1,1.8,0,0,Math.PI*2);c.fill();}
 if(f===4){for(const side of[-1,1])line('#fff8e1',1,()=>{c.moveTo(x+side*8,sy+5);c.bezierCurveTo(x+side*19,sy+15,x+side*17,hip+8,x+side*12,hem+3);});}
}
