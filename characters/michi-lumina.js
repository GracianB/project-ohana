// OHANA · Michi Lumina. Canvas-only characters: one world, five biological silhouettes.
// No simulation mutations. All movement is derived from the deterministic pose clock.
import {drawMichiEye} from './michi-eyes.js';
import {drawMoonKitten} from './michi-kitten.js';

const TAU=Math.PI*2;
const num=(v,def=0)=>Number.isFinite(v)?v:def;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,num(v)));
const sin=(x)=>Math.sin(x);
const PAL=Object.freeze({
  moon:'#eafcff',mint:'#83ffe2',sea:'#6ee6fa',lilac:'#b1a0ff',
  blush:'#ffaad9',gold:'#ffeab0',deep:'#162c47',night:'#0b1833',
  jade:'#48c7ad',outline:'#295066'
});
export const MICHI_BIOLUM_FORMS=Object.freeze([
  {id:'kitten',name:'Michi · Cachorro Rebelde',glow:'#adfff1',radius:115},
  {id:'fae',name:'Michi · Alas de Asfalto',glow:'#98f8ff',radius:145},
  {id:'jelly',name:'Michi · Pantera Negra',glow:'#f6a7ff',radius:175},
  {id:'star',name:'Michi · Lince Hechicero',glow:'#ffe8ad',radius:190},
  {id:'capybara',name:'Michi · Espectro de Nueve Vidas',glow:'#9effcd',radius:240}
]);
const path=(c,col,trace,stroke='#3c4972',width=1.4)=>{
  c.beginPath();trace();c.closePath();c.fillStyle=col;c.fill();
  if(width){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}
};
const oval=(c,x,y,rx,ry,col,rot=0,stroke=null,width=1)=>{
  c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot,0,TAU);
  c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
};
const line=(c,col,w,fn)=>{c.beginPath();fn();c.lineWidth=w;c.strokeStyle=col;c.stroke();};
const sparkle=(c,x,y,r,color)=>{
  line(c,color,Math.max(.7,r*.27),()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);});
  oval(c,x,y,r*.19,r*.19,'#ffffff');
};
export function michiPerformance(p={}){
  const state=String(p.state||'idle'),reduced=!!p.reduceMotion||state==='dead';
  const t=reduced?0:num(p.t),phase=reduced?0:num(p.phase);
  const attack=clamp(p.atk),cast=clamp(p.cast);
  const slot=Number.isInteger(p.michiPowerIndex)?p.michiPowerIndex:Math.trunc(num(p.castSlot,-1));
  const run=state==='run'?sin(phase*2)*.9:0;
  const air=state==='jump'?-6:state==='fall'?5:state==='glide'?-3:0;
  const recoil=state==='hurt'?8:state==='dead'?24:0;
  const joy=state==='victory'?1:0;
  const lift=(reduced?0:sin(t*.092)*2.4)+air+recoil;
  const attackBite=state==='attack'?attack*15:0;
  const magic=state==='cast'?cast:0;
  const spin=state==='attack'?attack*TAU*.22:state==='wall'?-.18:state==='dead'?.68:0;
  return {state,t,run,air,lift,joy,magic,slot,attackBite,spin,
    squish:state==='fall'?.92:state==='jump'?1.09:state==='hurt'?.85:1,
    look:clamp(p.look?.x,-1,1),blink:reduced?0:(Math.sin(t*.041)>0.994?1:0),
    power:Math.max(0,Math.min(5,slot)),
    reduceMotion:reduced
  };
}

function biolumAura(c,r,form,opacity=1){
  const info=MICHI_BIOLUM_FORMS[Math.max(0,Math.min(4,form))];
  c.save();c.globalAlpha=.30*opacity;
  // Two distinct radii: the WORLD light cone grows to 240px; the drawn
  // character's soft halo must fit cached 240x230px portraits without clipping.
  const localRadius=Math.min(83,info.radius*.35);
  const g=c.createRadialGradient(0,-39,3,0,-39,localRadius);
  g.addColorStop(0,info.glow+'ba');g.addColorStop(.36,info.glow+'57');g.addColorStop(1,info.glow+'00');
  c.fillStyle=g;c.beginPath();c.ellipse(0,-39,localRadius,localRadius*.94,0,0,TAU);c.fill();
  c.globalAlpha=.76*opacity;
  for(let i=0;i<9;i++){
    const a=i*TAU/9+(!r.reduceMotion?r.t*.018:0);
    const radius=34+i%3*7,dx=Math.cos(a)*radius,dy=-38+Math.sin(a)*radius*.76;
    sparkle(c,dx,dy,1.0+(i%3)*.43,i%2?info.glow:PAL.gold);
  }
  c.restore();
}
function powerSigil(c,r,scale=1){
  if(r.state!=='cast'||r.magic<=0)return;
  const a=r.power*TAU/6,dx=Math.cos(a)*29*scale,dy=-57*scale+Math.sin(a)*14*scale;
  c.save();c.globalAlpha=.3+r.magic*.65;
  c.translate(dx,dy);c.rotate(a+r.magic*.6);
  const count=3+r.power,rad=(8+r.magic*12)*scale;
  line(c,MICHI_BIOLUM_FORMS[r.power%5].glow,1.5*scale,()=>{
    for(let i=0;i<=count;i++){
      const ang=i*TAU/count,rr=rad*(i%2?.85:1.12);
      i?c.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr):c.moveTo(Math.cos(ang)*rr,Math.sin(ang)*rr);
    }c.closePath();
  });
  sparkle(c,0,0,3*scale,PAL.moon);c.restore();
}
// F0: clearly a newborn kitten, cradled inside a living lantern of moonlight.
export function drawMichiLanternKitten(c,p={}){
  const r=michiPerformance(p);
  c.save();biolumAura(c,r,0);
  c.translate(0,r.lift*.42);c.scale(1+r.run*.035,r.squish);
  c.save();c.globalAlpha=.5;const g=c.createRadialGradient(0,-30,5,0,-30,45);
  g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#9efbe0aa');g.addColorStop(1,'#6de9d000');
  c.fillStyle=g;c.beginPath();c.arc(0,-30,45,0,TAU);c.fill();c.restore();
  drawMoonKitten(c,{...p,t:r.t,phase:r.reduceMotion?0:num(p.phase),reduceMotion:r.reduceMotion});
  // A translucent organic membrane gives the first form its "living light orb" identity.
  line(c,PAL.mint,1.8,()=>{c.ellipse(0,-31,29+r.magic*4,31+r.magic*6,0,.23*Math.PI,1.78*Math.PI);});
  for(let i=0;i<5;i++){const a=i*TAU/5+r.t*.018;oval(c,Math.cos(a)*32,-31+Math.sin(a)*29,1.7,2.2,i%2?PAL.blush:PAL.mint);}
  powerSigil(c,r,.65);c.restore();
}
// F3: five soft independently animated arms, bioluminescent aquamarine anatomy.
export function drawMichiTideStar(c,p={}){
  const r=michiPerformance(p),t=r.t,starR=42,move=r.state==='run'?r.run*.1:0;
  c.save();biolumAura(c,r,3);
  c.translate(r.attackBite*.4,r.lift-42);c.rotate(r.spin+(r.reduceMotion?0:sin(t*.033)*.065));
  c.scale(1+.06*r.magic,r.squish);
  const arms=[];
  for(let i=0;i<5;i++){
    const a=-Math.PI/2+i*TAU/5+(!r.reduceMotion?sin(t*.058+i*1.3)*.09:0)+move*(i%2?1:-1);
    const radius=starR+(r.state==='attack'?r.attackBite*.52:0)+(r.state==='cast'?r.magic*(r.power+i)%4:0);
    arms.push({a,tip:[Math.cos(a)*radius,Math.sin(a)*radius]});
  }
  function outline(color,thick){
    // A real sea star has pillowy, rounded arm tips, not five sharp polygon
    // vertices. Each tip bends independently with the gameplay pose.
    const cap=arms.map(({a,tip})=>{
      const len=Math.hypot(...tip),neck=len-8;
      return {tip,start:[Math.cos(a-.17)*neck,Math.sin(a-.17)*neck],
        end:[Math.cos(a+.17)*neck,Math.sin(a+.17)*neck]};
    });
    path(c,color,()=>{
      c.moveTo(...cap[0].start);
      for(let i=0;i<5;i++){
        const next=cap[(i+1)%5],mid=arms[i].a+TAU/10;
        c.quadraticCurveTo(...cap[i].tip,...cap[i].end);
        c.quadraticCurveTo(Math.cos(mid)*19,Math.sin(mid)*19,...next.start);
      }
    },PAL.outline,thick);
  }
  outline('#3aa6ba',6);outline('#85eddb',2.1);
  oval(c,0,4,22,20,'#d7fff1',0,'#66a8ad',1.7);
  // Five arms glow at different phases and point along the actor's movement.
  arms.forEach(({a},i)=>{
    const outer=29+(r.reduceMotion?0:sin(t*.07+i)*2),sx=Math.cos(a)*outer,sy=Math.sin(a)*outer;
    oval(c,sx,sy,4.5,5.2,i%2?PAL.blush:PAL.gold,a);
    sparkle(c,Math.cos(a)*39,Math.sin(a)*39,2.5,i%2?PAL.gold:PAL.moon);
    for(let k=0;k<3;k++){const q=17+k*5;oval(c,Math.cos(a)*q,Math.sin(a)*q,1.4,1.8,'#edfff5');}
  });
  drawMichiEye(c,-9,-4,6.8,{closed:!!r.blink,happy:r.joy>0,look:{x:r.look,y:0}});
  drawMichiEye(c,9,-4,6.8,{closed:!!r.blink,happy:r.joy>0,look:{x:r.look,y:0}});
  line(c,PAL.deep,1.6,()=>{c.moveTo(-4,9);c.quadraticCurveTo(0,13+r.joy*3,4,9);});
  oval(c,-16,6,4,2,PAL.blush);oval(c,16,6,4,2,PAL.blush);
  powerSigil(c,r,.9);c.restore();
}
// F4: unmistakable capybara proportions, ears/muzzle/legs, not a re-skinned feline.
export function drawMichiAstralCapybara(c,p={}){
  const r=michiPerformance(p),t=r.t;
  c.save();biolumAura(c,r,4);
  c.translate(r.attackBite*.6,r.lift);
  c.rotate(r.spin*.3);c.scale(1+r.run*.025,r.squish);
  const step=r.run*5,headBob=r.reduceMotion?0:sin(t*.045)*1.6;
  // Luminous lily pads follow the capybara's hooves.
  for(let i=0;i<3;i++){const x=-35+i*35;
    oval(c,x,-3,18+(i%2)*4,4,'#3c9e9080');line(c,'#a9ffda',1,()=>{c.moveTo(x-12,-4);c.quadraticCurveTo(x,-8,x+12,-4);});
  }
  // Three-dimensional broad barrel with layered luminous fur, anchored to 0-foot baseline.
  const coat=c.createLinearGradient(-48,-76,40,-12);
  coat.addColorStop(0,'#c7ffee');coat.addColorStop(.5,'#83d6b7');coat.addColorStop(1,'#437e80');
  oval(c,-9,-43,55,35,coat,-.06,PAL.outline,2.8);
  // Hind legs, forelegs and rounded paws, each follows its own gait phase.
  for(const [x,phase,back] of [[-42,1,true],[-13,-1,true],[22,-1,false],[42,1,false]]){
    const lift=r.state==='run'?Math.max(0,step*phase):r.air<0?-7:0;
    const pawY=-2-lift;
    path(c,back?'#65afaa':'#9ae4ca',()=>{c.moveTo(x-9,-37);c.quadraticCurveTo(x-13,-18,x-9,pawY-4);c.quadraticCurveTo(x-7,pawY+1,x+7,pawY);c.quadraticCurveTo(x+13,pawY-5,x+8,-35);},PAL.outline,1.4);
    for(let k=-1;k<=1;k++)line(c,'#dcfff5',.9,()=>{c.moveTo(x+k*4,pawY-1);c.lineTo(x+k*4+1,pawY+1);});
  }
  // Broad neck, barrel-shaped skull, tiny rounded ears and blunt square muzzle.
  oval(c,27,-55+headBob,32,27,'#97dfc5',.02,PAL.outline,2.3);
  oval(c,17,-78+headBob,6.3,8.4,'#77c7b3',-.16,PAL.outline,1.5);
  oval(c,45,-80+headBob,6,8.5,'#80d5c0',.12,PAL.outline,1.5);
  oval(c,17,-78+headBob,2.9,4.3,PAL.blush);
  oval(c,45,-80+headBob,2.8,4.3,PAL.blush);
  oval(c,45,-49+headBob,28,16,'#b5f0d7',-.05,PAL.outline,1.5);
  oval(c,62,-48+headBob,9,5,'#54847f');
  oval(c,55,-46+headBob,2.4,1.3,'#effff4');
  drawMichiEye(c,30,-61+headBob,7.2,{closed:!!r.blink,happy:r.joy>0,look:{x:r.look,y:0}});
  oval(c,9,-50+headBob,5,3,PAL.blush);
  line(c,PAL.outline,1.2,()=>{c.moveTo(62,-39+headBob);c.quadraticCurveTo(58,-34+headBob,53,-38+headBob);});
  // Distributed bioluminescent organ patterns, deliberately not a uniform neon outline.
  for(let i=0;i<17;i++){
    const x=-50+(i*37%88),y=-37-sin(i*2.35)*21,rad=1.7+(i%4)*.56;
    oval(c,x,y,rad,rad*(1.1+sin(i)*.15),i%4===0?'#fff3c5':i%3?'#d6fff0':'#93efff');
    if(i%5===0)sparkle(c,x,y,3.5,PAL.mint);
  }
  line(c,'#d4fff4',1.4,()=>{c.moveTo(-40,-49);c.bezierCurveTo(-29,-67,-8,-66,4,-61);});
  for(let i=0;i<4;i++){
    const x=-18+i*16,y=-69+sin(i)*3;
    oval(c,x,y,1.8,2.8,'#f7ffdf');
  }
  // Combat emits a six-gesture readable focus halo; the capybara remains cuddly.
  if(r.state==='attack')line(c,PAL.gold,2.5,()=>{c.moveTo(66,-53);c.quadraticCurveTo(90+r.attackBite,-73,103+r.attackBite,-45);});
  if(r.state==='victory'){sparkle(c,0,-100,7,PAL.gold);sparkle(c,55,-94,5,PAL.mint);}
  powerSigil(c,r,1.15);
  c.restore();
}
// The intermediate forms are fully alive, not a generic circular neon outline.
// These layers sit behind the original articulated seahorse/fairy and jelly rigs.
export function drawMichiLivingHalo(c,p={},form=0){
 const r=michiPerformance(p),t=r.t;
 c.save();biolumAura(c,r,form,.88);
 if(form===1){
   // Silk-veined wings bend around separate root and tip joints. The two
   // wings respond asymmetrically to run, glide, cast and airborne states.
   c.translate(0,-62);
   for(const side of [-1,1]){
     const flutter=r.reduceMotion?0:sin(t*.23+side*.72)*.11;
     const spread=1+(r.state==='glide'?.28:0)+(r.state==='cast'?r.magic*.1:0);
     c.save();c.scale(side*spread,1);c.rotate(flutter*side);
     const grad=c.createLinearGradient(2,-24,60,23);
     grad.addColorStop(0,'#d4fff7ce');grad.addColorStop(.47,'#7ceffff0');grad.addColorStop(1,'#ad9cff28');
     c.globalAlpha=.43+r.magic*.24;
     path(c,grad,()=>{
       c.moveTo(2,-7);c.bezierCurveTo(20,-33,42,-38,53,-27);
       c.bezierCurveTo(61,-6,34,4,4,12);c.quadraticCurveTo(12,0,2,-7);
     },'#baffed',1.5);
     c.globalAlpha=.58;
     for(let v=0;v<3;v++){
       line(c,v===0?'#ecffff':'#bdf7ed',.8,()=>{
         c.moveTo(4,-5);c.quadraticCurveTo(23+v*8,-22+v*12,46-v*4,-20+v*11);
       });
     }
     sparkle(c,45,-24,2.5,PAL.gold);c.restore();
   }
 }else if(form===2){
   // Seven slow, independently drifting tentacles with luminous nerve nodes.
   // This is a trailing glow behind the living bell, never a static texture.
   c.translate(0,-50);c.globalAlpha=.45+r.magic*.22;
   for(let i=0;i<7;i++){
     const lane=i-3,root=lane*6;
     const pulse=r.reduceMotion?0:sin(t*.068+i*1.27)*5;
     const trail=r.state==='run'?r.run*8:0;
     const end=root+lane*1.1+pulse+trail;
     const length=36+(i%3)*8;
     line(c,i%2?PAL.blush:PAL.sea,1.9+(i%2)*.8,()=>{
       c.moveTo(root,5);
       c.bezierCurveTo(root-6+pulse*.3,18,root+11+trail,33,end,length);
     });
     const nodeY=18+(i%3)*7;
     const nodeX=root+sin(t*.035+i*.94)*4;
     oval(c,nodeX,nodeY,2.4,3.4,i%3?PAL.lilac:PAL.mint);
     if(i%2===0)sparkle(c,end,length,1.9,PAL.moon);
   }
   oval(c,0,-17,31,8,'#acffed38');
 }
 // Orbiting plankton follows each new body without introducing randomness.
 c.globalAlpha=.44+r.magic*.26;
 for(let i=0;i<6;i++){
   const th=i*TAU/6+t*.016;
   const x=Math.cos(th)*(31+(form===2?8:0));
   const y=(form===1?-60:-64)+Math.sin(th)*(19+(r.reduceMotion?0:sin(t*.09))*2);
   oval(c,x,y,2.1+(i%3),2.6,form===1?PAL.sea:PAL.blush);
 }
 powerSigil(c,r,.8);c.restore();
}
