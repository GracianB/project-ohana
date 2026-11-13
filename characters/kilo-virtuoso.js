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
 if(f===0)return;
 c.save();c.lineCap='round';c.lineJoin='round';
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
 c.restore();
}
