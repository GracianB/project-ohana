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

const SKINS=[
 {dark:'#23566a',body:'#64c4ca',light:'#defcf1',rim:'#a4f5db',light2:'#ffd58d',beat:.103},
 {dark:'#1c587e',body:'#65cbd8',light:'#ddfff9',rim:'#97f3fe',light2:'#fff0b8',beat:.074},
 {dark:'#245464',body:'#76cdb1',light:'#def8be',rim:'#a5f4cc',light2:'#f5d792',beat:.113},
 {dark:'#423e77',body:'#ba86cf',light:'#ffd7ef',rim:'#c3b9ff',light2:'#92ffe3',beat:.053},
 {dark:'#2d456b',body:'#697ab2',light:'#c6d4fc',rim:'#b4f5e4',light2:'#ffe1a2',beat:.061},
];

const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
function glass(c,d,s,hurt){
 if(!c.createLinearGradient)return hurt?'#dec4cc':s.body;
 const shade=c.createLinearGradient(-d.rx*.35,-d.ry,d.rx*.4,d.ry*.67);
 shade.addColorStop(0,s.light);shade.addColorStop(.48,hurt?'#e7a9ae':s.body);shade.addColorStop(1,s.dark);
 return shade;
}

// Each bell has its own profile: droplet, shallow umbrella, pointed compass,
// lateral fins and a scalloped crown with a low central hood.
function bellPath(c,f,w,h){
 c.beginPath();c.moveTo(-w,h*.48);
 if(f===0){
  c.bezierCurveTo(-w*1.12,-h*.35,-w*.2,-h*.66,-w*.13,-h);
  c.bezierCurveTo(w*.22,-h*.82,w*1.18,-h*.3,w,h*.48);
 }else if(f===1){
  c.bezierCurveTo(-w*.92,-h*.8,-w*.47,-h*1.12,0,-h);
  c.bezierCurveTo(w*.51,-h*.98,w*.96,-h*.63,w,h*.48);
 }else if(f===2){
  c.quadraticCurveTo(-w*.78,-h*.51,0,-h);
  c.quadraticCurveTo(w*.74,-h*.64,w,h*.48);
 }else if(f===3){
  c.quadraticCurveTo(-w*1.02,-h*.17,-w*1.07,-h*.54);
  c.bezierCurveTo(-w*.82,-h*.4,-w*.58,-h*.94,0,-h);
  c.bezierCurveTo(w*.58,-h*.94,w*.82,-h*.4,w*1.07,-h*.54);
  c.quadraticCurveTo(w*1.02,-h*.17,w,h*.48);
 }else{
  c.bezierCurveTo(-w*1.03,-h*.45,-w*.76,-h*.89,-w*.44,-h*.82);
  c.quadraticCurveTo(-w*.18,-h*.74,0,-h);
  c.quadraticCurveTo(w*.18,-h*.74,w*.44,-h*.82);
  c.bezierCurveTo(w*.76,-h*.89,w*1.03,-h*.45,w,h*.48);
 }
 const scallops=[3,8,4,9,11][f];
 for(let i=scallops;i>0;i--){
  const a=-w+2*w*i/scallops,b=a-2*w/scallops;
  c.quadraticCurveTo((a+b)/2,h*(f===2?.73:.85),b,h*.48);
 }
 c.closePath();
}

function ribbons(c,d,s,f,t,hem,drag,squeeze){
 const spread=[.65,.85,.62,1.0,1.03][f];
 c.lineCap='round';
 for(let i=0;i<d.tendrils;i++){
  const k=2*i/(d.tendrils-1)-1;
  const start=k*d.rx*.8;
  const length=d.length*(.69+.29*Math.cos(k*1.6))*(1-squeeze*.18);
  const sway=Math.sin(t*.049+i*.95)*(2.2+f*.75)+drag;
  const tip=start*spread+sway;
  c.strokeStyle=i%3===0?s.rim:s.body+'98';c.lineWidth=i%3===0?2.6:1.15;
  c.beginPath();c.moveTo(start,hem-3);
  c.bezierCurveTo(start+sway*.12,hem+length*.37,tip-sway*.44,hem+length*.78,tip,hem+length);
  c.stroke();
  if(i%3===0)oval(c,tip,hem+length,1.35+f*.12,2.6,s.light2);
 }
 for(const side of [-1,1]){
  const x=side*d.rx*[.25,.3,.42,.56,.49][f];
  const length=d.length*(f===3?.92:.8);
  const width=[4,8,6,13,14][f];
  const tail=x+side*(f===2?16:8)+drag*.65;
  c.fillStyle=s.body+'ad';c.beginPath();c.moveTo(x-width,hem-2);
  c.bezierCurveTo(x+side*12,hem+length*.25,tail-side*15,hem+length*.64,tail,hem+length);
  c.bezierCurveTo(tail+side*8,hem+length*.64,x+width*.5,hem+length*.22,x+width,hem-2);
  c.closePath();c.fill();
  c.strokeStyle=s.rim;c.lineWidth=1.15;c.beginPath();c.moveTo(x,hem+2);
  c.quadraticCurveTo(x+side*8,hem+length*.36,tail,hem+length*.94);c.stroke();
 }
}

function crest(c,f,d,s,t){
 if(f<2)return;
 if(f===2){
  c.fillStyle=s.dark;c.beginPath();c.moveTo(-8,d.top+9);
  c.lineTo(0,d.top-6);c.lineTo(8,d.top+9);c.fill();
  oval(c,0,d.top+2,2.8,3.7,s.light2);
  return;
 }
 const count=f===4?7:3;
 for(let i=0;i<count;i++){
  const u=2*i/(count-1)-1;
  const tipX=u*d.rx*.83;
  const tipY=d.top-(f===4?7:3)-(1-Math.abs(u))*(f===4?14:7);
  c.strokeStyle=s.rim;c.lineWidth=f===4?2.2:1.5;
  c.beginPath();c.moveTo(u*d.rx*.65,d.top+15);
  c.quadraticCurveTo(tipX+Math.sin(t*.037+i)*2,d.top+4,tipX,tipY);c.stroke();
  oval(c,tipX,tipY,f===4?3.2:2.2,f===4?4.5:3.3,s.light2);
 }
}

function trim(c,d,s,f,t,cast){
 c.save();
 c.lineCap='round';
 c.lineWidth=1.4;
 for(let i=0;i<4+f*2;i++){
  const u=2*i/(3+f*2)-1;
  const x=u*d.rx*.86;
  const glow=.67+.28*Math.sin(i*.75-t*.073);
  c.globalAlpha=cast?1:glow;
  oval(c,x,d.ry*.47,1.5+f*.16,1.8+f*.14,i%3?s.rim:s.light2);
 }
 c.globalAlpha=.69;
 c.strokeStyle=s.light;
 c.beginPath();c.moveTo(-d.rx*.69,-d.ry*.23);
 c.quadraticCurveTo(-d.rx*.38,-d.ry*.82,d.rx*(f===0?.25:.61),-d.ry*.54);c.stroke();
 if(f>=2){
  for(const side of [-1,1]){
   c.strokeStyle=s.light2;c.beginPath();c.moveTo(0,-d.ry*.81);
   c.quadraticCurveTo(side*d.rx*.52,-d.ry*.53,side*d.rx*.78,d.ry*.08);c.stroke();
  }
 }
 if(f>=3){
  c.strokeStyle=s.rim;c.beginPath();c.moveTo(-d.rx*.78,d.ry*.24);
  c.bezierCurveTo(-d.rx*.18,-d.ry*.45,d.rx*.3,d.ry*.25,d.rx*.79,-d.ry*.24);c.stroke();
 }
 c.restore();
}

function face(c,p,d,s,f,t){
 const x=d.rx*.29,y=d.ry*.08;
 const hurt=p.state==='hurt'||p.hurt>0.6;
 const attack=p.state==='attack'||p.state==='cast';
 const glad=p.state==='victory'||p.nacarWelcome?.greet>.3;
 const blink=hurt||p.blink>.65||(!p.reduceMotion&&Math.sin(t*.027+f)>.997);
 const gaze=clamp((p.look?.x||0)*2+(attack?1:0),-2.4,2.4);
 for(const side of [-1,1]){
  const ex=side*x;
  if(blink||glad){
   c.strokeStyle=s.dark;c.lineWidth=1.8;
   c.beginPath();c.moveTo(ex-3,y);
   c.quadraticCurveTo(ex,y+(glad?-4:3),ex+3,y);c.stroke();
  }else{
   oval(c,ex,y,4+f*.39,5.8+f*.4,'#fff8e9');
   oval(c,ex+gaze,y+.35,2.7+f*.23,4+f*.3,'#192f49');
   oval(c,ex+gaze-.9,y-1.6,1.14,1.3,s.light);
  }
  oval(c,side*d.rx*.51,y+5.7,3.1+f*.28,1.6,'#eea5b78c');
 }
 c.strokeStyle=s.dark;c.lineWidth=1.35;
 c.beginPath();c.arc(0,y+4,attack?3.7:2.7,hurt?3.22:.18,hurt?6.15:Math.PI-.18);c.stroke();
}

function castLights(c,p,d,s,cy,t){
 const strength=clamp(p.cast,0,1);
 if(strength<.12||p.castSlot<0||p.castSlot>2)return;
 c.save();
 c.globalAlpha*=.42+strength*.48;
 if(p.castSlot===0){
  for(let i=0;i<3;i++){
   const offset=Math.sin(t*.12+i)*2;
   c.strokeStyle=i===0?s.light:s.rim;c.lineWidth=1.25;
   c.beginPath();c.arc(d.rx*.78+5+i*6,cy-5-i*4+offset,2+i*1.2,0,TAU);c.stroke();
  }
 }else if(p.castSlot===1){
  c.strokeStyle=s.rim;c.lineWidth=1.7;
  c.beginPath();c.ellipse(0,cy+4,d.rx*(1.05+strength*.2),d.ry*.78,0,.12,Math.PI-.12);c.stroke();
 }else{
  for(let i=0;i<3;i++)drawSeaStar(c,(i-1)*d.rx*.56,cy+d.ry*.82+(i%2)*4,2.6+strength,0,s.light2);
 }
 c.restore();
}

function draw(c,p={}){
 const f=Math.round(clamp(p.form,0,4)),d=NACAR_FORMS[f],s=SKINS[f];
 const reduced=!!p.reduceMotion,t=reduced?0:clamp(p.t,0,1e8);
 const vertical=clamp(p.vy,-1,1),speed=clamp(p.speed,0,1.4);
 const stroke=Math.max(Math.abs(vertical),speed);
 const cast=p.state==='attack'||p.state==='cast'||p.castSlot>=0&&p.cast>0.2;
 const hurt=p.state==='hurt',cheer=p.state==='victory';
 const contraction=reduced?0:Math.sin(t*s.beat+f)*(.052+stroke*.07);
 const welcome=reduced?0:clamp(p.nacarWelcome?.float,0,1);
 const cy=d.top+d.ry+2,hem=cy+d.ry*.55;
 c.save();
 c.translate(0,reduced?0:Math.sin(t*.027+f)*2.1-welcome*4);
 c.rotate(reduced?0:vertical*(f===2?.2:.13)+speed*.075+Math.sin(t*.024)*.028);
 ribbons(c,d,s,f,t,hem,reduced?0:vertical*(4+f*1.6)-speed*4,contraction);
 crest(c,f,d,s,t);
 castLights(c,p,d,s,cy,t);
 c.save();
 c.translate(0,cy);c.scale(1+contraction+(cast?.08:0),1-contraction);
 bellPath(c,f,d.rx,d.ry);
 c.fillStyle=glass(c,d,s,hurt);c.fill();
 c.strokeStyle=s.dark;c.lineWidth=2.5;c.stroke();
 oval(c,0,d.ry*.35,d.rx*.85,d.ry*.24,s.dark+'74');
 oval(c,-d.rx*.23,-d.ry*.38,d.rx*.39,d.ry*.30,s.light+'39',-.2);
 for(let i=0;i<4;i++){
  const a=i*TAU/4;
  c.strokeStyle=s.light2+'92';c.lineWidth=1.5;
  c.beginPath();c.arc(Math.cos(a)*d.rx*.18,Math.sin(a)*d.ry*.18-4,2.6+f*.5,.35,5.7);c.stroke();
 }
 trim(c,d,s,f,t,cast||cheer);
 face(c,p,d,s,f,t);
 c.restore();c.restore();
}

export default {id:'nacar',draw,cacheKey:p=>'jelly:'+Math.floor((p.reduceMotion?0:p.t||0)/2)};
