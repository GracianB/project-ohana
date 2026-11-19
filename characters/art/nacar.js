// Five jellyfish anatomies. Sea stars belong to her attacks, never her body.
const TAU=Math.PI*2;
export const NACAR_FORMS=Object.freeze([
 {name:'Gota de Luna',rx:17,ry:18,top:-57,tendrils:4,length:20,frills:0,hue:'#bdeee8'},
 {name:'Medusa de Nácar',rx:31,ry:16,top:-70,tendrils:8,length:39,frills:7,hue:'#9de3ef'},
 {name:'Medusa Brújula',rx:24,ry:32,top:-100,tendrils:6,length:49,frills:4,hue:'#a0edcc'},
 {name:'Medusa Aurora',rx:41,ry:25,top:-111,tendrils:14,length:55,frills:11,hue:'#d9bcf0'},
 {name:'Reina Abisal',rx:48,ry:30,top:-128,tendrils:18,length:66,frills:13,hue:'#b3eeea'}
].map(Object.freeze));
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fill();};
export function drawSeaStar(c,x,y,size=10,t=0,col='#f6cfaa'){
 c.save();c.translate(x,y);c.rotate(t);c.fillStyle=col;c.strokeStyle='#593d65';c.lineWidth=1.2;c.lineJoin='round';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=size*(i%2?.48:1);c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();oval(c,-size*.2,-size*.04,1.2,1.8,'#323b58');oval(c,size*.2,-size*.04,1.2,1.8,'#323b58');c.restore();
}
const SWIM_BEATS=[.095,.071,.105,.052,.064];
const BELL_LIGHTS=['#e8f9d8','#adfff2','#c8ffe0','#f9dcff','#ffe5b3'];

function drawBellMarkings(c,form,d,t,lit){
 c.save();
 c.lineCap='round';
 c.lineWidth=form===4?1.9:1.2;
 c.strokeStyle=BELL_LIGHTS[form];
 c.globalAlpha=lit;
 const width=d.rx,height=d.ry;
 if(form===0){
  // One curved sheen, like light on the lip of a droplet.
  c.beginPath();c.moveTo(-width*.6,-height*.24);c.quadraticCurveTo(-width*.37,-height*.79,width*.12,-height*.77);c.stroke();
  oval(c,width*.49,-height*.42,1.4,1.9,BELL_LIGHTS[form]);
 }else if(form===1){
  // The broad bell spreads light along the rim as it contracts.
  for(let i=-3;i<=3;i++)oval(c,i*width*.245,height*.38,1.3,1.7,BELL_LIGHTS[form]);
  c.beginPath();c.moveTo(-width*.79,-height*.19);c.quadraticCurveTo(0,-height*.88,width*.78,-height*.22);c.stroke();
 }else if(form===2){
  // The compass medusa has a thin radial marking, not an extra limb.
  for(const side of [-1,1]){
   c.beginPath();c.moveTo(0,-height*.86);c.quadraticCurveTo(side*width*.19,-height*.54,side*width*.62,-height*.35);
   c.lineTo(side*width*.42,-height*.51);c.stroke();
  }
  oval(c,0,-height*.73,1.8,2.9,'#efffc8');
 }else{
  const bands=form===3?3:4;
  for(let i=0;i<bands;i++){
   const extent=width*(.45+i*.11),y=-height*(.73-i*.15);
   c.globalAlpha=lit*(1-i*.13);
   c.beginPath();c.moveTo(-extent,y+3);
   c.bezierCurveTo(-extent*.42,y-7,extent*.45,y+5,extent,y-1);c.stroke();
  }
  if(form===4){
   for(let i=-3;i<=3;i++)oval(c,i*width*.24,height*.39,1.6,1.8+(Math.sin(t*.05+i)+1)*.52,'#ffeab2');
  }
 }
 c.restore();
}

function draw(c,p={}){
 const f=Math.max(0,Math.min(4,Math.round(Number(p.form)||0))),d=NACAR_FORMS[f],reduced=!!p.reduceMotion,t=reduced?0:Number(p.t)||0,run=p.state==='run',hurt=p.state==='hurt',attack=p.state==='attack',victory=p.state==='victory';
 const vertical=Math.max(-1,Math.min(1,Number(p.vy)||0));
 const swim=Math.max(Math.abs(vertical),Number(p.speed)||0);
 const pulse=reduced?0:Math.sin(t*SWIM_BEATS[f]+f)*(.036+swim*.048);
 const drift=reduced?0:Math.sin(t*.025)*2;
 const cy=d.top+d.ry+2,hem=cy+d.ry*.55,spread=1+(attack?.1:0);
 c.save();c.translate(0,drift);
 c.rotate(reduced?0:Math.sin(t*.02)*.025+(run?.055:0)+vertical*(f===2?.17:.095));
 // Long trailing threads lie behind the bell and the expressive face.
 for(let i=0;i<d.tendrils;i++){
  const k=d.tendrils===1?0:i/(d.tendrils-1)*2-1,x=k*d.rx*.8,tip=hem+d.length*(.68+.32*Math.cos(k*1.7)),sway=reduced?0:Math.sin(t*.035+i*.8)*(4+f*1.4)+vertical*(4+f*1.5);
  c.strokeStyle=i%3?'#9edcd0aa':'#e9cced';c.lineWidth=(i%3?1.4:3.6)+(f===4?.5:0);c.lineCap='round';c.beginPath();c.moveTo(x,hem-3);c.bezierCurveTo(x-sway,hem+d.length*.3,x+sway*1.5,tip-10,x+sway,tip);c.stroke();
  if(i%3===0){oval(c,x+sway,tip,2,3,'#f5dfb5');if(!reduced&&i%2===0)oval(c,x+sway+Math.sin(t*.04+i)*3,tip+7,1,1,'#c4f4eb88');}
 }
 // Oral arms are translucent ribbons, wider than the sensory tentacles.
 for(const side of[-1,1]){c.fillStyle=f>=3?'#b9a9df99':'#c8efdf99';c.beginPath();const x=side*d.rx*.35;c.moveTo(x,hem-4);c.bezierCurveTo(x+side*16,hem+12,x-side*12,hem+d.length*.65,x+side*8,hem+d.length*.92);c.bezierCurveTo(x-side*8,hem+d.length*.63,x+side*6,hem+17,x-5*side,hem);c.closePath();c.fill();}
 if(f===3){for(let i=0;i<2;i++){oval(c,0,d.top-8-i*11,14-i*4,6,'#aa9ed6');oval(c,-3,d.top-10-i*11,4,2,'#f6d8ed');}}
 if(f===4){for(let i=-2;i<=2;i++){c.strokeStyle='#c7e6d7';c.lineWidth=2;c.beginPath();c.moveTo(i*12,d.top+15);c.quadraticCurveTo(i*20,d.top-5,i*16,d.top-15-Math.abs(i)*3);c.stroke();oval(c,i*16,d.top-15-Math.abs(i)*3,3,4,'#ffe0a6');}}
 // A living scalloped bell, with separate inner membrane and radial organs.
 c.save();c.translate(0,cy);c.scale(spread*(1+pulse),1-pulse);c.fillStyle=hurt?'#efd0cb':d.hue;c.strokeStyle='#365267';c.lineWidth=2.3;c.beginPath();c.moveTo(-d.rx,d.ry*.5);c.bezierCurveTo(-d.rx*1.05,-d.ry*.8,-d.rx*.45,-d.ry,0,-d.ry);c.bezierCurveTo(d.rx*.65,-d.ry,d.rx*1.05,-d.ry*.45,d.rx,d.ry*.5);
 const count=d.frills||4;for(let i=count;i>0;i--){const xx=-d.rx+2*d.rx*(i-1)/count,prev=-d.rx+2*d.rx*i/count;c.quadraticCurveTo((xx+prev)/2,d.ry*.85,xx,d.ry*.5);}c.closePath();c.fill();c.stroke();
 oval(c,-d.rx*.24,-d.ry*.35,d.rx*.45,d.ry*.48,'#f1fff555');
 for(let i=0;i<(f===0?3:5);i++){const a=Math.PI+(i+1)*Math.PI/6;c.strokeStyle='#648d9c44';c.lineWidth=1;c.beginPath();c.moveTo(0,d.ry*.35);c.quadraticCurveTo(Math.cos(a)*d.rx*.4,-d.ry*.1,Math.cos(a)*d.rx*.87,Math.sin(a)*d.ry*.8);c.stroke();}
 if(f===2){for(const side of[-1,1]){c.fillStyle='#a0c8bb';c.beginPath();c.moveTo(side*13,-22);c.quadraticCurveTo(side*36,-12,side*34,5);c.quadraticCurveTo(side*25,0,side*19,13);c.fill();}}
 drawBellMarkings(c,f,d,t,reduced?.6:.57+swim*.28);
 // Four soft horseshoe organs distinguish a jellyfish from a floating cat.
 for(let i=0;i<4;i++){const a=i*Math.PI/2;c.strokeStyle='#c68ba177';c.lineWidth=2;c.beginPath();c.arc(Math.cos(a)*d.rx*.2,Math.sin(a)*d.ry*.18-2,3+f*.5,.5,Math.PI*1.9);c.stroke();}
 const eyeX=d.rx*.3,eyeY=d.ry*.1,blink=hurt||!reduced&&Math.sin(t*.023)> .993;
 for(const side of[-1,1]){if(blink){c.strokeStyle='#355165';c.lineWidth=2;c.beginPath();c.moveTo(side*eyeX-3,eyeY);c.quadraticCurveTo(side*eyeX,eyeY+2,side*eyeX+3,eyeY);c.stroke();}else{oval(c,side*eyeX,eyeY,4+f*.4,5+f*.3,'#f5f7e8');oval(c,side*eyeX+(run?1:0),eyeY+.5,2.2+f*.2,3.5,'#33475f');oval(c,side*eyeX-1,eyeY-1.5,1.1,1.3,'#fff');}oval(c,side*d.rx*.5,eyeY+6,3.5,1.7,'#dfadc0aa');}
 c.strokeStyle='#56717c';c.lineWidth=1.2;c.beginPath();c.arc(0,eyeY+4,victory?4:2.6,.2,Math.PI-.2);c.stroke();
 for(let i=0;i<count;i++)oval(c,-d.rx+(i+.5)*2*d.rx/count,d.ry*.58,1.5,1.8,'#ffedc4');
 c.restore();c.restore();
}
export default {id:'nacar',draw,cacheKey:p=>'jelly:'+Math.floor((p.reduceMotion?0:p.t||0)/2)};
