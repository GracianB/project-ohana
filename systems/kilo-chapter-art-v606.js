// Claro de Kilo: the grove's creatures, its living drummer and musical shrines.
// Presentation only. The pose reads the existing warning/strike/recovery state;
// these drawings never change collision, AI, XP or objective completion.
const TAU=Math.PI*2,INK='#243f40',CREAM='#fff1ce';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
function fill(c,color,draw,width=2){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.8){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}
function leaf(c,x,y,length,width,angle,color,vein=true){c.save();c.translate(x,y);c.rotate(angle);fill(c,color,()=>{c.moveTo(0,0);c.bezierCurveTo(-width*.8,-length*.3,-width*.6,-length*.77,0,-length);c.bezierCurveTo(width*.75,-length*.72,width*.8,-length*.25,0,0);},1.4);if(vein)stroke(c,'#cfdfaa',.9,()=>{c.moveTo(0,-3);c.quadraticCurveTo(-2,-length*.45,0,-length*.87);});c.restore();}
function eye(c,x,y,r,aim=1,{hurt=false,blink=false,angry=false}={}){
 if(hurt||blink){stroke(c,INK,2.2,()=>{c.moveTo(x-r,y);c.quadraticCurveTo(x,y+(hurt?2:3),x+r,y);});return;}
 ellipse(c,x,y,r,r*1.1,'#fff7df',0,1.6);ellipse(c,x+aim*r*.2,y+r*.1,r*.49,r*.67,'#264b47',0,0);
 ellipse(c,x+aim*r*.24,y+r*.13,r*.23,r*.43,'#132d35',0,0);ellipse(c,x-r*.2,y-r*.35,r*.2,r*.2,'#fff',0,0);
 if(angry)stroke(c,INK,2,()=>{c.moveTo(x-r*1.1,y-r*1.15);c.quadraticCurveTo(x,y-r*1.3,x+r,y-r*.65);});
}
function rootLimb(c,x,y,ex,ey,tx,ty,color,width){stroke(c,INK,width+3.5,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});stroke(c,color,width,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});stroke(c,'#b8c794',1.2,()=>{c.moveTo(x-2,y-1);c.quadraticCurveTo(ex-3,ey-2,tx-2,ty-2);});}
function petal(c,x,y,r,color,turn=0){c.save();c.translate(x,y);c.rotate(turn);fill(c,color,()=>{c.moveTo(0,0);c.bezierCurveTo(-r*.9,-r*.3,-r*.7,-r*1.5,0,-r);c.bezierCurveTo(r*.8,-r*1.65,r*.95,-r*.2,0,0);},1.1);stroke(c,'#fff1d2',.8,()=>{c.moveTo(0,-2);c.quadraticCurveTo(-r*.12,-r*.6,0,-r*.82);});c.restore();}
function flower(c,x,y,r,color='#f1aa9d',turn=0){for(let k=0;k<5;k++)petal(c,x,y,r,color,turn+k*TAU/5);ellipse(c,x,y,r*.21,r*.21,'#e9bc66',0,.8);}
function drumHand(c,side,phase,lift,beat,evolved,pattern=0,aim=1,round=1,time=0,reduced=false){
 const raised=phase==='warn',strike=phase==='strike'||phase==='attack',rest=phase==='rest';
 let x=side*(raised?76:71),y=raised?-114-lift*52:strike?-77+beat*10:rest?-68:-91;
 if(raised&&pattern===1){x=side*(side===aim?91:61);y=side===aim?-100-lift*6:-117-lift*17;}
 if(raised&&pattern===2)y=side===aim?-137-lift*40:-110-lift*16;
 rootLimb(c,side*43,-106,side*(raised?83:93),raised?-129:-71,x,y,'#739474',12);
 ellipse(c,x,y,12,11,'#8ca57d',side*.25,2);
 for(let k=-1;k<=1;k++)stroke(c,'#4a745b',1.2,()=>{c.moveTo(x+k*4,y-4);c.quadraticCurveTo(x+k*4+side*2,y+3,x+k*4,y+7);});
 c.save();c.translate(x,y);
 const angle=side*(raised?-.34:strike?.48:.12);
 c.rotate(angle);
 // Mallet swing motion trail during strike
 if(strike&&!reduced){
  c.save();c.globalAlpha=.45;
  stroke(c,round===2?'#ffd54f':'#fff1ce',6,()=>{c.moveTo(-side*18,-50);c.quadraticCurveTo(-side*12,-38,0,-38);});
  stroke(c,round===2?'#ff9800':'#e6b87d',3,()=>{c.moveTo(-side*26,-52);c.quadraticCurveTo(-side*18,-36,0,-36);});
  c.restore();
 }
 stroke(c,INK,7,()=>{c.moveTo(0,8);c.lineTo(0,-34);});stroke(c,'#d4b27a',4,()=>{c.moveTo(-1,7);c.lineTo(-1,-34);});
 // Mallet head with bronze collar & carved sound-wood
 ellipse(c,0,-38,evolved?20:17,evolved?14:12,gradient(c,-20,-50,30,22,'#fff0ca','#c38a57'),side*.1,2);
 stroke(c,'#ffd54f',1.4,()=>{c.moveTo(-6,-38);c.lineTo(6,-38);});
 for(let k=-1;k<=1;k++)stroke(c,'#91694e',1,()=>{c.moveTo(k*6-3,-47);c.quadraticCurveTo(k*6+5,-37,k*6-2,-30);});
 if(round===2&&!reduced){
  c.save();c.globalAlpha=.8;
  const sparkY=-38+Math.sin(time*.15+side)*5;
  ellipse(c,side*12,sparkY,2.2,2.2,'#ffea00',0,0);
  ellipse(c,-side*8,-38-Math.cos(time*.12)*4,1.8,1.8,'#ff9100',0,0);
  c.restore();
 }
 c.restore();
}
export function drawKiloGuardian(c,e,cam,t,reduced=false){
 const b=e?._drummer;if(!b)return false;
 const time=reduced?0:t,phase=b.phase||'waiting',warn=phase==='warn',strike=phase==='strike'||phase==='attack',rest=phase==='rest';
 const lift=warn?clamp(1-(b.timer||0)/(b.warnMax||60),0,1):0,beat=reduced?0:Math.sin(time*.16),breath=reduced?0:Math.sin(time*.04),aim=b.aim||1;
 const scale=Math.max(100,e.h||176)/204,walking=phase==='step',stride=walking&&!reduced?Math.sin(time*.18):0;
 const round=b.round||1;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
 const hit=(e.flash||0)>0;if(hit&&!reduced){c.translate(-aim*3,1);c.rotate(-aim*.018);}
 // Planted root contact shadow
 ellipse(c,0,1,68,9,'#183f3d24',0,0);
 if(walking)c.translate(0,-Math.abs(stride)*1.8);
 for(const side of [-1,1]){
  const step=strike&&b.pattern===1?beat*5*side:stride*6*side;
  rootLimb(c,side*28,-43,side*46,-21,side*(45+step),-4,'#68896b',17);
  fill(c,'#78936f',()=>{c.moveTo(side*26,-9);c.quadraticCurveTo(side*40,-20,side*55,-12);c.quadraticCurveTo(side*72,-11,side*74,-3);c.quadraticCurveTo(side*53,4,side*31,-1);},2.3);
  for(let k=0;k<3;k++)stroke(c,'#d3d5a6',1.3,()=>{c.moveTo(side*(40+k*10),-10);c.quadraticCurveTo(side*(43+k*11),-7,side*(41+k*12),-2);});
 }
 if(e.evolved)for(const side of [-1,1])for(let k=0;k<4;k++)leaf(c,side*42,-112-k*10,43+k*3,13,side*(.62+k*.18),'#56866e');

 // Phase 2 Radiant Solar Halo & Corona behind the drum
 if(round===2){
  c.save();
  const pulse=reduced?1:1+Math.sin(time*.08)*.08;
  c.globalAlpha=warn?.6:strike?.75:.45;
  stroke(c,'#ffb74d',4*pulse,()=>c.ellipse(0,-115,74*pulse,26*pulse,0,0,TAU));
  stroke(c,'#ffe082',2*pulse,()=>c.ellipse(0,-115,82*pulse,30*pulse,0,0,TAU));
  if(!reduced){
   c.strokeStyle='#ffcc80';c.lineWidth=1.8;
   for(let k=0;k<10;k++){
    const a=k*TAU/10+time*.02;
    const r1=82*pulse,r2=96*pulse;
    c.beginPath();c.moveTo(Math.cos(a)*r1,(Math.sin(a)*r1)*.35-115);
    c.lineTo(Math.cos(a)*r2,(Math.sin(a)*r2)*.35-115);c.stroke();
   }
  }
  c.restore();
 }

 // Arms articulate at shoulder, elbow and gripping hand
 drumHand(c,-1,phase,lift,beat,e.evolved,b.pattern||0,aim,round,time,reduced);
 c.save();c.translate(0,strike?4:breath*.9);if(strike)c.scale(1.025,.975);if(warn&&b.pattern===1)c.rotate(aim*lift*.065);

 // Taiko belly: curved wooden staves with woodgrain and glowing sacred petroglyphs
 fill(c,gradient(c,-55,-118,108,96,'#dfa46f','#a96d4e','#744d45'),()=>{c.moveTo(-49,-116);c.bezierCurveTo(-66,-94,-60,-52,-45,-30);c.quadraticCurveTo(0,-16,45,-30);c.bezierCurveTo(61,-50,67,-97,49,-116);},3);
 for(let k=-4;k<=4;k++){
  const x=k*11;
  stroke(c,k%2?'#795644':'#d59a65',1.4,()=>{c.moveTo(x,-111);c.bezierCurveTo(x*1.18,-85,x*.96,-57,x*.84,-30);});
  if(k%2===0)stroke(c,'#edbf83',.8,()=>{c.moveTo(x+3,-105);c.bezierCurveTo(x-3,-84,x+7,-60,x,-39);});
 }
 // Sacred Polynesian petroglyph wave engraving on front drum staves
 const glyphAlpha=warn?.9:strike?1:round===2?.75:.5;
 c.save();c.globalAlpha=glyphAlpha;
 stroke(c,round===2?'#ffe082':'#f5ce8c',1.8,()=>{
  c.moveTo(-18,-76);c.quadraticCurveTo(0,-90,18,-76);
  c.quadraticCurveTo(24,-66,16,-58);c.quadraticCurveTo(0,-52,-14,-62);
  c.quadraticCurveTo(-18,-70,-10,-74);c.quadraticCurveTo(0,-78,10,-72);
 });
 stroke(c,'#dfa46f',1,()=>{
  c.moveTo(-28,-86);c.quadraticCurveTo(0,-98,28,-86);
  c.moveTo(-24,-48);c.quadraticCurveTo(0,-38,24,-48);
 });
 c.restore();

 // Rim hoops with golden bronze studs
 for(const yy of [-108,-32]){
  stroke(c,INK,8,()=>c.ellipse(0,yy,51,12,0,0,TAU));stroke(c,'#dcc38e',5.5,()=>c.ellipse(0,yy,51,12,0,0,TAU));
  stroke(c,'#fff0be',1,()=>c.ellipse(0,yy-2,49,10,0,Math.PI,TAU));
  for(let k=-4;k<=4;k++)ellipse(c,k*11,yy,2,2,'#ffd54f',0,.6);
 }
 // Sacred rope zigzag & hanging woven raffia tassels
 for(let k=-4;k<4;k++){
  const x=k*11;
  stroke(c,'#f0dab0',1.5,()=>{c.moveTo(x,-104);c.lineTo(x+10,-39);c.lineTo(x+11,-104);});
  ellipse(c,x+5,-105,2,2,'#705648',0,.7);
 }
 for(let k=-3;k<=3;k++){
  const x=k*13,sway=reduced?0:Math.sin(time*.1+k)*2;
  fill(c,'#fff8e1',()=>{c.moveTo(x-3,-36);c.lineTo(x+3,-36);c.lineTo(x+sway,-22);},1);
  stroke(c,'#e6c875',.8,()=>{c.moveTo(x,-36);c.lineTo(x+sway*.8,-24);});
 }

 // Taiko membrane with concentric resonance grain & center emblem
 ellipse(c,0,-116,50,17,gradient(c,-40,-130,75,24,'#fff2cd',warn?'#f5ce8c':'#d9c492'),0,2.3);
 stroke(c,'#ad8e68',1.4,()=>c.ellipse(0,-116,37,11,0,0,TAU));
 stroke(c,'#c4a87a',1,()=>c.ellipse(0,-116,22,7,0,0,TAU));
 // Central spiral sound emblem
 stroke(c,round===2?'#ffb300':'#ad8e68',1.5,()=>{
  c.moveTo(-7,-116);c.quadraticCurveTo(0,-120,7,-116);c.quadraticCurveTo(0,-112,-4,-116);
 });

 // Living wood and fern mask
 fill(c,gradient(c,-40,-176,83,69,'#d1bf8d','#9d815e','#6a6650'),()=>{c.moveTo(-30,-174);c.bezierCurveTo(-48,-160,-42,-128,-29,-115);c.quadraticCurveTo(0,-101,29,-115);c.bezierCurveTo(43,-129,48,-160,30,-174);c.quadraticCurveTo(0,-188,-30,-174);},2.8);
 for(const side of [-1,1]){
  leaf(c,side*31,-142,34,14,side*1.2,'#6b9874');
  fill(c,'#537c64',()=>{c.moveTo(side*4,-158);c.quadraticCurveTo(side*22,-172,side*37,-157);c.lineTo(side*29,-137);c.quadraticCurveTo(side*16,-136,side*7,-142);},1.7);
  if(rest){
   // Dazed spirit expression during recovery window
   stroke(c,'#264b47',1.8,()=>{
    c.moveTo(side*17-3,-148);c.quadraticCurveTo(side*17,-152,side*17+3,-148);
    c.quadraticCurveTo(side*17+3,-144,side*17-1,-144);c.quadraticCurveTo(side*17-3,-148,side*17,-150);
   });
   ellipse(c,side*27,-160,2,3,'#80deea',side*.2,0.8);
  }else{
   eye(c,side*17,-148,9,aim,{hurt:hit,blink:!reduced&&!warn&&!strike&&(time+side*7)%210<6,angry:warn||strike});
   if(round===2&&!hit)ellipse(c,side*17+aim*2,-147,2.2,2.2,'#ffd54f',0,0);
  }
  ellipse(c,side*27,-130,7,3.5,'#d79d7f',side*.1,0);
  stroke(c,'#5e6953',1.2,()=>{c.moveTo(side*30,-163);c.quadraticCurveTo(side*32,-150,side*33,-141);});
  stroke(c,'#efe1ad',1.2,()=>{c.moveTo(side*9,-170);c.quadraticCurveTo(side*17,-176,side*24,-170);});
 }
 fill(c,'#c4b27d',()=>{c.moveTo(-6,-145);c.quadraticCurveTo(-9,-130,0,-130);c.quadraticCurveTo(9,-130,6,-145);},1.2);
 stroke(c,INK,2.4,()=>{c.moveTo(-10,-119);c.quadraticCurveTo(0,rest?-111:strike?-126:-116,10,-119);});
 if(rest){
  stroke(c,CREAM,1.2,()=>{c.moveTo(-7,-117);c.quadraticCurveTo(0,-114,7,-117);});
  if(!reduced){
   const puff=Math.sin(time*.12)*3;
   if(puff>0)ellipse(c,0,-110,6+puff,3.5+puff*.5,'#ffffff88',0,0);
  }
 }

 // Mask crown of tropical foliage & flowers
 for(let k=-3;k<=3;k++)leaf(c,k*8,-174+(Math.abs(k))*2,25+(3-Math.abs(k))*4,9,k*.22,['#779d70','#a4b77f','#547c62'][(k+3)%3]);
 flower(c,-24,-180,9,'#eaa292',-.3);flower(c,26,-178,7,'#f0c380',.2);
 if(e.evolved||round===2){flower(c,0,-201,14,round===2?'#ff8a65':'#f0b893');for(const side of [-1,1])leaf(c,side*38,-176,51,14,side*.78,'#77a084');}

 // Vulnerable Damage Window Indicator (Glowing Mint Aura)
 if(rest){
  c.save();c.globalAlpha=reduced?.6:.5+.25*Math.sin(time*.18);
  stroke(c,'#69f0ae',3,()=>c.ellipse(0,-116,58,20,0,0,TAU));
  stroke(c,'#b9f6ca',1.5,()=>c.ellipse(0,-116,64,23,0,0,TAU));
  c.restore();
 }
 c.restore();

 drumHand(c,1,phase,lift,beat,e.evolved,b.pattern||0,aim,round,time,reduced);

 // Warning and strike shockwave pulses
 if(warn||strike){
  c.save();c.globalAlpha=warn?.35+lift*.3:.55;
  stroke(c,round===2?'#ffb300':'#ffeab2',warn?3:2.4,()=>c.ellipse(0,-115,56+(strike?8:0),18+(strike?5:0),0,0,TAU));
  if(strike)for(let k=0;k<3;k++)stroke(c,round===2?'#ffe082':'#fff0c6',2-k*.4,()=>c.ellipse(0,-115,66+k*14,22+k*5,0,.1,Math.PI-.1));
  c.restore();
 }
 if(strike){
  c.save();
  for(let k=0;k<3;k++){
   const r=65+k*24;c.globalAlpha=(1-k*.28)*.7;
   stroke(c,round===2?'#ffa726':'#ffe082',2.5-k*.5,()=>c.ellipse(0,0,r,r*.22,0,0,TAU));
  }
  c.restore();
 }
 c.restore();return true;
}
function beetle(c,s){
 const {time,step,wind,active,hurt,aim,reduced}=s;
 // 6 articulated scurrying legs with joint spines and claw tips
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const legSwing=step*(k%2?-1:1)*3.5;
  const jointX=side*(14+k*5),jointY=-24+k*6;
  const kneeX=side*(28+k*3)+legSwing,kneeY=jointY-3+legSwing*.5;
  const footX=side*(34+k*4)+legSwing*1.2,footY=-1+Math.abs(legSwing)*2;
  rootLimb(c,jointX,jointY,kneeX,kneeY,footX,footY,'#50694e',3.6);
  stroke(c,'#243f40',1.5,()=>{c.moveTo(footX,footY);c.lineTo(footX+side*3,footY-3);});
  ellipse(c,kneeX,kneeY,2.2,2.2,'#8da778',0,0.8);
 }
 // Carapace & Elytra: Jewel-toned emerald & bronze chitin with metallic specular sheen
 ellipse(c,-5,-29,24,27,gradient(c,-29,-56,48,54,'#a5b979','#55794c','#2a483a'),-.12,2.5);
 fill(c,gradient(c,-26,-52,30,48,'#66bb6a','#2e7d32','#1b5e20'),()=>{
  c.moveTo(-7,-54);c.bezierCurveTo(-32,-49,-30,-18,-12,-8);c.quadraticCurveTo(-4,-22,-7,-54);
 },2);
 fill(c,gradient(c,-6,-53,32,48,'#81c784','#388e3c','#255d28'),()=>{
  c.moveTo(-5,-54);c.bezierCurveTo(19,-52,23,-25,4,-10);c.quadraticCurveTo(-6,-24,-5,-54);
 },2);
 // Specular highlight arcs
 stroke(c,'#c8e6c9',1.8,()=>{c.moveTo(-16,-48);c.bezierCurveTo(-26,-40,-25,-22,-16,-18);});
 stroke(c,'#ffffff',1,()=>{c.moveTo(-14,-46);c.bezierCurveTo(-22,-39,-22,-25,-15,-20);});
 // Bioluminescent golden dot runes on elytra
 for(const side of [-1,1])for(let k=0;k<3;k++){
  ellipse(c,-6+side*(8+k*3),-42+k*11,1.8,2.5,'#ffd54f',-.2,0);
  ellipse(c,-6+side*(8+k*3),-42+k*11,0.9,1.2,'#fff9c4',-.2,0);
 }
 // Head & Pronotum
 ellipse(c,13,-38,13,13,gradient(c,0,-50,26,24,'#81c784','#43a047','#1b5e20'),.12,2);
 eye(c,14,-40,5.5,aim,{hurt,angry:wind||active});
 // Twitching golden sensory antennae
 for(const side of [-1,1]){
  const antTwitch=reduced?0:Math.sin(time*.25+side)*3;
  stroke(c,INK,2.2,()=>{
   c.moveTo(15,-48);c.bezierCurveTo(20+side*4,-60+antTwitch,28+side*5,-64+antTwitch,30+side*5,-58+antTwitch);
  });
  ellipse(c,30+side*5,-58+antTwitch,2.6,2.6,'#ffd54f',0,1);
 }
 // Rhino beetle Horn: Proud upward-curving polished horn with golden fork tips
 fill(c,gradient(c,20,-58,26,35,'#ffd54f','#c4943f','#5d4037'),()=>{
  c.moveTo(22,-36);c.quadraticCurveTo(34,-44,38,-56);
  c.lineTo(40,-53);c.quadraticCurveTo(36,-38,25,-30);
 },1.8);
 stroke(c,'#ffe082',1.5,()=>{c.moveTo(37,-55);c.lineTo(41,-57);});
 if(wind||active){
  stroke(c,'#ffe082',2.2,()=>{c.moveTo(-24,-55);c.quadraticCurveTo(-9,-67,9,-57);});
  if(!reduced){
   ellipse(c,-24,-2,4,2.5,'#dfc999',0,0);
   ellipse(c,-32,-3,3,2,'#c7b280',0,0);
  }
 }
}
function crab(c,s){
 const {step,wind,active,hurt,aim,reduced,time}=s;
 // 6 articulated coral legs with sharp walking claws
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const stride=step*(k%2?-1:1)*3.5;
  const jointX=side*(12+k*4),jointY=-22+k*3;
  const kneeX=side*(26+k*3),kneeY=-13+stride;
  const footX=side*(33+k*4),footY=-1-Math.max(0,stride);
  rootLimb(c,jointX,jointY,kneeX,kneeY,footX,footY,'#8d5b4c',3.8);
  stroke(c,'#ffccbc',1.4,()=>{c.moveTo(footX,footY);c.lineTo(footX+side*3,footY-2);});
 }
 // Volcanic basalt & coral carapace
 fill(c,gradient(c,-26,-46,53,38,'#ffab91','#bf5f45','#5d2d24'),()=>{
  c.moveTo(-24,-31);c.bezierCurveTo(-33,-52,24,-54,28,-32);c.quadraticCurveTo(30,-12,0,-10);c.quadraticCurveTo(-23,-12,-24,-31);
 },2.5);
 fill(c,'#a64a35',()=>{c.moveTo(-22,-34);c.quadraticCurveTo(0,-53,23,-34);c.quadraticCurveTo(0,-26,-22,-34);},1.4);
 // Glowing turquoise / cyan bioluminescent volcanic runes
 for(let k=-2;k<=2;k++){
  stroke(c,'#80deea',1.6,()=>{c.moveTo(k*7,-41+Math.abs(k)*2);c.quadraticCurveTo(k*8,-33,k*8+2,-28);});
  ellipse(c,k*8+2,-28,1.4,1.4,'#e0f7fa',0,0);
 }
 // Articulated periscope stalk eyes that swivel
 for(const side of [-1,1]){
  const stalkSway=reduced?0:Math.sin(time*.12+side)*1.5;
  rootLimb(c,side*17,-26,side*31,-31-(wind?4:0),side*34,-41,'#8d5b4c',5.5);
  stroke(c,INK,4.5,()=>{c.moveTo(side*10,-36);c.quadraticCurveTo(side*10+stalkSway,-44,side*11,-53);});
  stroke(c,'#ffab91',2.4,()=>{c.moveTo(side*10,-36);c.quadraticCurveTo(side*10+stalkSway,-44,side*11,-53);});
  eye(c,side*11,-54,5.2,aim,{hurt,angry:wind});
  ellipse(c,side*11+aim*1.2,-54,1.2,1.2,'#00e5ff',0,0);
 }
 // Massive Guardian Coral Claw (The Shield)
 const clawX=wind?35:active?43:36,clawY=wind?-43:-32;
 ellipse(c,-35,-39,9.5,9.5,'#bf5f45',-.2,2);
 stroke(c,'#ffd54f',1.4,()=>{c.moveTo(-38,-42);c.lineTo(-32,-36);});
 fill(c,gradient(c,clawX-17,clawY-20,38,44,'#ff8a65','#c85a3c','#6e271a'),()=>{
  c.moveTo(clawX-13,clawY+14);c.bezierCurveTo(clawX-25,clawY-12,clawX-5,clawY-27,clawX+10,clawY-18);
  c.quadraticCurveTo(clawX+3,clawY-13,clawX+2,clawY-4);c.quadraticCurveTo(clawX+13,clawY-3,clawX+19,clawY-12);
  c.bezierCurveTo(clawX+25,clawY+3,clawX+10,clawY+22,clawX-13,clawY+14);
 },2.4);
 stroke(c,'#ffe082',2,()=>{
  c.moveTo(clawX-12,clawY+6);c.bezierCurveTo(clawX-20,clawY-6,clawX-9,clawY-16,clawX-2,clawY-16);
 });
 for(let k=0;k<3;k++){
  stroke(c,'#fff8e1',1.4,()=>{
   c.moveTo(clawX-10+k*5,clawY-k*3);c.lineTo(clawX-8+k*5,clawY-k*3-4);
  });
 }
 ellipse(c,clawX-7,clawY+10,3.5,3.5,'#8d5b4c',0,1);
 stroke(c,'#80deea',1.6,()=>c.ellipse(clawX-7,clawY+10,2,2,0,0,TAU));
 stroke(c,INK,1.5,()=>{c.moveTo(-5,-22);c.quadraticCurveTo(0,-19,6,-22);});
 if(s.wind||s.active){
  c.save();c.globalAlpha=.5;
  stroke(c,'#80deea',2.5,()=>c.ellipse(clawX+4,clawY,18,22,0,-1.2,1.2));
  c.restore();
 }
}
function frog(c,s){
 const {step,wind,active,hurt,aim,reduced,time}=s,down=wind?6:0;
 for(const side of [-1,1]){
  ellipse(c,side*22,-18+down,14,14,gradient(c,side*12,-30,20,20,'#76ff03','#00e5ff','#00695c'),side*.45,2);
  rootLimb(c,side*23,-16+down,side*(active?35:31),-8,side*(active?40:30),-2,'#00bfa5',5.5);
  for(let k=0;k<3;k++){
   stroke(c,'#76ff03',1.8,()=>{c.moveTo(side*(active?39:30),-2);c.lineTo(side*(active?45:36)+k*2,0-k);});
   ellipse(c,side*(active?45:36)+k*2,0-k,1.6,1.6,'#ffd54f',0,0.8);
  }
 }
 ellipse(c,0,-30+down,24,22,gradient(c,-24,-52,48,44,'#ccff90','#00e5ff','#004d40'),0,2.4);
 ellipse(c,2,-27+down,16,14,'#b2ff59',0,1.2);
 for(let k=0;k<4;k++)ellipse(c,-15+k*10,-24+down+(k%2)*4,3.2,2.4,'#102027',.2,0);
 for(let k=0;k<3;k++)ellipse(c,-11+k*11,-33+down,2.6,2.2,'#102027',-.2,0);
 for(let k=0;k<3;k++)ellipse(c,-13+k*12,-16+down,2.2,1.8,'#102027',.1,0);
 fill(c,gradient(c,-24,-65+down,48,42,'#76ff03','#00bfa5','#004d40'),()=>{
  c.moveTo(-25,-42+down);c.bezierCurveTo(-31,-64+down,-11,-66+down,-6,-52+down);
  c.quadraticCurveTo(0,-57+down,6,-52+down);
  c.bezierCurveTo(17,-67+down,32,-60+down,25,-40+down);
  c.quadraticCurveTo(0,-23+down,-25,-42+down);
 },2.2);
 for(const side of [-1,1]){
  eye(c,side*14,-51+down,7.2,aim,{hurt,angry:wind||active});
  stroke(c,'#ffd54f',1.2,()=>c.ellipse(side*14,-51+down,4,4.5,0,0,TAU));
 }
 const croakPuff=(!reduced&&!active)?(wind?8:Math.max(0,Math.sin(time*0.1))*5):0;
 if(croakPuff>0.4){
  c.save();c.globalAlpha=0.85;
  ellipse(c,0,-21+down+croakPuff*0.5,9+croakPuff,7+croakPuff,gradient(c,-10,-28,20,20,'#e0f7fa','#80deea','#26c6da'),0,1.4);
  stroke(c,'#ffffff',1,()=>c.ellipse(0,-21+down+croakPuff*0.5,6+croakPuff*.6,4+croakPuff*.4,0,0,Math.PI));
  c.restore();
 }
 stroke(c,'#004d40',2,()=>{c.moveTo(-15,-37+down);c.quadraticCurveTo(0,-30+down,16,-37+down);});
 for(const side of [-1,1])ellipse(c,side*21,-37+down,3.2,2.2,'#ffd54f',0,0);
}
function plant(c,s){
 const {time,wind,active,hurt,aim,reduced}=s,sway=reduced?0:Math.sin(time*.045)*3.5;
 ellipse(c,0,-2,24,6,'#4e684d',0,1.8);
 for(const side of [-1,1])leaf(c,side*6,-7,36,14,side*(1.05+(wind?.15:0)),'#388e3c');
 rootLimb(c,0,-6,sway-6,-26,sway,-44,'#2e7d32',9);
 for(const side of [-1,1])leaf(c,sway,-25,27,12,side*.95,'#66bb6a');
 c.save();c.translate(sway,-49);c.rotate(active?.22:wind?-.15:0);
 for(let k=0;k<5;k++)petal(c,0,0,20,k%2?'#ad1457':'#d81b60',k*TAU/5);
 for(let k=0;k<5;k++)petal(c,0,0,13,k%2?'#f06292':'#ff80ab',k*TAU/5+.3);
 fill(c,gradient(c,-23,-25,47,40,'#c8e6c9','#43a047','#1b5e20'),()=>{
  c.moveTo(-23,-4);c.bezierCurveTo(-31,-30,19,-33,25,-8);c.quadraticCurveTo(30,15,7,17);c.quadraticCurveTo(-15,18,-23,-4);
 },2.4);
 for(const side of [-1,1])eye(c,side*10,-11,5,aim,{hurt,angry:wind||active});
 const jawGap=active?24:wind?18:8;
 fill(c,'#880e4f',()=>{
  c.moveTo(-13,3);c.quadraticCurveTo(0,jawGap,14,3);c.quadraticCurveTo(0,-2,-13,3);
 },1.2);
 for(const side of [-1,1]){
  fill(c,'#fffde7',()=>{c.moveTo(side*7,3);c.lineTo(side*5,3+jawGap*.4);c.lineTo(side*2,3);},.8);
  fill(c,'#fffde7',()=>{c.moveTo(side*6,jawGap-2);c.lineTo(side*4,jawGap-jawGap*.4);c.lineTo(side*1,jawGap-2);},.8);
 }
 const pollenGlow=wind||active;
 ellipse(c,0,jawGap*.35,pollenGlow?6:4,pollenGlow?6:4,'#ffd54f',0,1.2);
 ellipse(c,0,jawGap*.35,2.5,2.5,'#ffffff',0,0);
 if(wind&&!reduced){
  ellipse(c,19,6,5,5,'#ffe082',0,1.4);
  ellipse(c,18,4,2.2,1.5,'#fff9c4',0,0);
  ellipse(c,23,-4,2,2,'#ffb300',0,0);
 }
 if(active&&!reduced){
  for(let k=0;k<3;k++)ellipse(c,20+k*8,4-k*3,4-k,4-k,'#ffd54f',0,0);
 }
 c.restore();
}
function flyer(c,s,wasp){
 const {time,wind,active,hurt,aim,reduced}=s,flutter=reduced?0:Math.sin(time*.65),w=wasp?23:27;
 for(const side of [-1,1]){
  c.save();c.translate(-3,-40);c.rotate(side*(.32+flutter*.25));
  ellipse(c,side*20,-12,w,11,wasp?'#e0f7fa':'#b2dfdb',side*.3,1.4);
  ellipse(c,side*15,2,w*.75,8,wasp?'#e8f5e9':'#c8e6c9',-side*.2,1.2);
  stroke(c,wasp?'#26c6da':'#4db6ac',1.2,()=>{
   c.moveTo(0,0);c.quadraticCurveTo(side*16,-4,side*(w+12),-14);
   c.moveTo(side*12,-8);c.lineTo(side*18,-20);
   c.moveTo(side*18,-12);c.lineTo(side*22,-2);
  });
  c.restore();
 }
 c.save();c.rotate(active?-.25:wind?.14:0);
 ellipse(c,-10,-25,13,21,gradient(c,-20,-45,28,38,wasp?'#ffb300':'#aed581',wasp?'#ff6f00':'#558b2f'),-.28,2.2);
 if(wasp){
  for(let k=0;k<4;k++)stroke(c,'#212121',4.2,()=>{
   c.moveTo(-19,-35+k*7);c.quadraticCurveTo(-9,-29+k*7,0,-32+k*7);
  });
  fill(c,'#ffd54f',()=>{
   c.moveTo(-16,-9);c.quadraticCurveTo(-11,5,-5,10);c.quadraticCurveTo(-2,-1,-5,-10);
  },1.4);
  ellipse(c,-5,9,2,2,'#ffea00',0,0);
 }else{
  for(let k=0;k<3;k++)ellipse(c,-10+k%2*6,-34+k*9,2.8,3.2,'#dce775',.2,.8);
  stroke(c,'#66bb6a',2.5,()=>{c.moveTo(21,-47);c.quadraticCurveTo(32,-43,35,-48);});
  ellipse(c,35,-48,2.4,2.4,'#cddc39',0,.8);
 }
 ellipse(c,1,-40,10,12,wasp?'#e65100':'#2e7d32',-.2,2.2);
 ellipse(c,11,-48,14,14,wasp?'#ffa000':'#66bb6a',.15,2.2);
 eye(c,15,-49,6.5,aim,{hurt,angry:wind||active});
 stroke(c,'#ffd54f',1,()=>c.ellipse(15,-49,4,4.5,0,0,TAU));
 for(const side of [-1,1]){
  stroke(c,INK,1.6,()=>{
   c.moveTo(6+side*5,-59);c.quadraticCurveTo(11+side*9,-74,20+side*9,-67);
  });
  ellipse(c,20+side*9,-67,2.5,2.2,wasp?'#ffd54f':'#cddc39',0,.8);
  for(let k=0;k<2;k++)stroke(c,wasp?'#5d4037':'#33691e',2,()=>{
   c.moveTo(-1,-35+k*6);c.quadraticCurveTo(13,-28+k*7,10+(wind?6:0),-20+k*7);
  });
 }
 c.restore();
}
/** Authored five-species cast, reading only existing campaign combat state. */
export function drawKiloCreature(c,e,cam,t,reduced=false){
 if(e?.roomId!=='w1-kilo'||!e.campaignRole||e.miniBoss||e.boss)return false;
 const kinds=['cucaracho','cangrejo','rana','planta','phosquito','avispa'];if(!kinds.includes(e.kind))return false;
 const a=e._campaign||{},time=reduced?0:t,wind=(a.wind||0)>0||!!e.telegraph,active=(a.active||0)>0,hurt=(e.flash||0)>0||(e.invuln||0)>0||(e.stun||0)>5;
 const scale=Math.max(52,Math.min(108,e.h||58))/72,aim=Math.sign(e.vx)||a.aim||1;
 const s={time,wind,active,hurt,aim:1,reduced,step:Math.abs(e.vx||0)>.3&&!reduced?Math.sin(time*.19+(e.spawnIndex||0)):0};
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale*aim,scale);c.lineJoin='round';c.lineCap='round';
 if(e.dying)c.globalAlpha=clamp(e.dying/28,0,1);
 if(hurt)c.rotate(-.12);else if(wind&&e.kind!=='rana'){c.translate(-2,1.5);c.scale(1.04,.97);}else if(active&&e.kind==='cucaracho')c.rotate(.12);
 if(e.kind==='cucaracho')beetle(c,s);else if(e.kind==='cangrejo')crab(c,s);else if(e.kind==='rana')frog(c,s);else if(e.kind==='planta')plant(c,s);else flyer(c,s,e.kind==='avispa');
 if(e.campaignRole==='shield'&&e.kind!=='cangrejo'){
  fill(c,gradient(c,9,-47,30,44,'#dfd1a0','#b49662','#71856a'),()=>{c.moveTo(18,-46);c.quadraticCurveTo(43,-48,42,-22);c.quadraticCurveTo(36,-6,22,-4);c.quadraticCurveTo(12,-21,18,-46);},2);
  stroke(c,'#6b7959',1.4,()=>{c.moveTo(26,-41);c.quadraticCurveTo(35,-24,26,-9);});
  leaf(c,28,-17,15,5,-.2,'#69936d');
 }
 if(e.campaignRole==='captain')flower(c,4,-66,7,'#e3b57d');
 // A grounded contact shadow and a committed pose communicate the warning.
 if(a.recover>0){c.save();c.globalAlpha=.85;stroke(c,'#a8e9c3',1.7,()=>{c.moveTo(-12,-74);c.lineTo(-7,-67);c.lineTo(0,-75);c.lineTo(7,-67);c.lineTo(12,-74);});c.restore();}
 if(wind){c.save();c.globalAlpha=.35;ellipse(c,0,2,e.kind==='rana'?32:25,3.3,'#ffe0a5',0,0);c.restore();}
 c.restore();
 if(e._alertT>0){
  const ax=e.x+e.w/2-cam.x,ay=e.y-cam.y-14;
  c.save();c.fillStyle='#ffe57f';c.strokeStyle='#243e41';c.lineWidth=2.5;c.font='bold 14px sans-serif';c.textAlign='center';
  c.strokeText('!',ax,ay);c.fillText('!',ax,ay);c.restore();
 }
 if(e.hp<e.max&&e.hp>0){const x=e.x-cam.x,y=e.y-cam.y-9;c.save();c.fillStyle='#244644';c.beginPath();c.roundRect(x,y,e.w,4,2);c.fill();c.fillStyle='#e9d6a3';c.beginPath();c.roundRect(x,y,e.w*clamp(e.hp/e.max,0,1),4,2);c.fill();c.restore();}
 return true;
}
export const KILO_RESONATOR_NAMES=Object.freeze(['Caracola del arroyo','Bambú del viento','Arpa del dosel','Hibisco del compás']);
/** A physical instrument anchored to its platform, never a floating token. */
export function drawKiloResonator(c,s,cam,t,{reduced=false,progress,active=false,label,caption}={}){
 const n=clamp(s.note??s.id,0,3),done=!!s.done,x=s.x-cam.x,y=s.y-cam.y,time=reduced?0:t,wind=reduced?0:Math.sin(time*.025+n)*.025;
 const fillProgress=clamp(progress??((s.hold||0)/45),0,1),bright=done||active||fillProgress>0;
 c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';
 ellipse(c,0,0,54,10,'#234b3e24',0,0);
 // A low living-wood cradle ties all four treasures to the same garden.
 fill(c,gradient(c,-45,-19,80,25,'#baaa7b','#7e916b'),()=>{c.moveTo(-47,-3);c.quadraticCurveTo(-40,-20,-19,-17);c.quadraticCurveTo(4,-27,24,-16);c.quadraticCurveTo(43,-16,48,-2);c.quadraticCurveTo(0,8,-47,-3);},2);
 for(const side of [-1,1]){leaf(c,side*28,-7,29,11,side*1.1,done?'#87b993':'#648c6d');leaf(c,side*39,-2,23,8,side*1.25,'#a4ba83');}
 c.save();c.rotate(wind);
 if(n===0){
  // A pearlescent conch is an actual spiral shell with a scalloped mouth.
  fill(c,gradient(c,-43,-103,78,80,'#fff0d8','#e3b79b','#bc837b'),()=>{c.moveTo(-26,-21);c.bezierCurveTo(-47,-42,-33,-91,-1,-100);c.bezierCurveTo(28,-111,51,-78,32,-53);c.quadraticCurveTo(24,-41,6,-38);c.lineTo(21,-18);c.quadraticCurveTo(-3,-4,-26,-21);},2.4);
  stroke(c,'#a97571',2.2,()=>{c.moveTo(15,-54);c.bezierCurveTo(-7,-45,-24,-65,-11,-82);c.bezierCurveTo(0,-95,22,-78,10,-65);c.bezierCurveTo(3,-57,-5,-66,1,-72);});
  fill(c,'#956d73',()=>{c.moveTo(-19,-25);c.quadraticCurveTo(-5,-37,13,-22);c.quadraticCurveTo(0,-11,-19,-25);},1.3);
  for(let k=0;k<5;k++)stroke(c,'#fbe8cb',1.2,()=>{c.moveTo(-29+k*8,-29+k%2*3);c.quadraticCurveTo(-30+k*7,-45,-21+k*9,-51);});
 }else if(n===1){
  // Five graduated tubes, lashings and a gently moving bamboo striker.
  rootLimb(c,-30,-12,-27,-55,-31,-97,'#76916b',6);rootLimb(c,30,-12,27,-55,31,-97,'#76916b',6);
  stroke(c,'#b9c792',5,()=>{c.moveTo(-34,-95);c.quadraticCurveTo(0,-110,34,-95);});
  for(let k=0;k<5;k++){
   const xx=-24+k*12,top=-85+(k%2)*3,bottom=-28-Math.abs(k-2)*8;
   stroke(c,'#9e8566',1.1,()=>{c.moveTo(xx,-97);c.lineTo(xx,top);});
   fill(c,gradient(c,xx-5,top,10,55,'#e4dca2','#b2bd7e','#77946b'),()=>{c.moveTo(xx-5,top);c.lineTo(xx-5,bottom);c.quadraticCurveTo(xx,bottom+5,xx+5,bottom);c.lineTo(xx+5,top);},1.4);
   for(let yy=top+15;yy<bottom;yy+=17)stroke(c,'#6f8e64',1,()=>{c.moveTo(xx-5,yy);c.quadraticCurveTo(xx,yy+2,xx+5,yy);});
   ellipse(c,xx,top,5,2.3,'#71845e',0,1);
  }
  const sway=reduced?0:Math.sin(time*.04)*3;stroke(c,'#be9c70',2.5,()=>{c.moveTo(0,-98);c.lineTo(sway,-41);});ellipse(c,sway,-37,6,5,'#d7c697',0,1.3);
 }else if(n===2){
  // An asymmetrical branch harp with a carved seed soundbox and real strings.
  fill(c,gradient(c,-34,-104,75,91,'#d9bb83','#a48362','#6e7053'),()=>{c.moveTo(-28,-15);c.bezierCurveTo(-42,-38,-29,-92,-12,-107);c.quadraticCurveTo(19,-105,35,-80);c.lineTo(25,-74);c.quadraticCurveTo(4,-96,-6,-89);c.lineTo(-10,-33);c.quadraticCurveTo(12,-35,27,-20);c.quadraticCurveTo(-2,-3,-28,-15);},2.4);
  for(let k=0;k<5;k++)stroke(c,bright?'#f9e7a8':'#d5c796',1.2,()=>{const xx=-7+k*7;c.moveTo(xx,-89+k*3);c.lineTo(xx-4,-31+k);});
  leaf(c,-16,-89,31,10,-.64,'#8dab7b');leaf(c,28,-75,24,10,.8,'#6c9676');
  ellipse(c,-10,-22,10,4,'#5f6950',-.15,1.2);
 }else{
  // A hibiscus held by a braided stem: broad petals, veins and gold stamen.
  rootLimb(c,0,-10,-10,-49,0,-71,'#5d916a',8);
  for(const side of [-1,1])leaf(c,0,-33,43,15,side*.95,'#78a67a');
  flower(c,0,-76,29,done?'#fff0d8':'#e8a199',wind);
  stroke(c,'#d6ad62',3,()=>{c.moveTo(0,-76);c.quadraticCurveTo(10,-80,20,-95);});
  for(let k=0;k<4;k++)ellipse(c,18+k*1.9,-94+k*.8,2.2,2.2,'#f8dd95',0,.5);
 }
 c.restore();
 if(bright){
  c.save();c.globalAlpha=done?.8:.45;
  for(let k=0;k<3;k++){
   const xx=-17+k*17,yy=-119-(reduced?0:Math.sin(time*.04+k)*3);
   ellipse(c,xx,yy,2,2,CREAM,0,0);
  }
  c.restore();
 }
 if(fillProgress>0&&!done){stroke(c,'#21473e',6,()=>c.ellipse(0,-4,49,9,0,0,TAU));stroke(c,'#f7dca2',3,()=>c.ellipse(0,-4,49,9,0,-Math.PI/2,-Math.PI/2+TAU*fillProgress));}
 const title=label||KILO_RESONATOR_NAMES[n];
 c.textAlign='center';c.textBaseline='middle';c.font='600 12px Outfit,sans-serif';
 // Paper banners are short, readable and rooted in the scene's material.
 const titleW=clamp(c.measureText(title).width+22,90,192);
 fill(c,done?'#e0e9c5':'#fff0d7',()=>c.roundRect(-titleW/2,-151,titleW,23,6),1.2);
 c.fillStyle='#2a4c43';c.fillText((done?'✓ ':'')+title,0,-139.5,titleW-8);
 if(caption){c.font='500 10px Outfit,sans-serif';c.lineWidth=3;c.strokeStyle='#f8edd8';c.strokeText(caption,0,18,220);c.fillStyle='#29483f';c.fillText(caption,0,18,220);}
 c.restore();return true;
}
