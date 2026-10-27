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
function drumHand(c,side,phase,lift,beat,evolved,pattern=0,aim=1){
 const raised=phase==='warn',strike=phase==='strike'||phase==='attack',rest=phase==='rest';
 let x=side*(raised?76:71),y=raised?-114-lift*52:strike?-77+beat*10:rest?-72:-91;
 if(raised&&pattern===1){x=side*(side===aim?91:61);y=side===aim?-100-lift*6:-117-lift*17;}
 if(raised&&pattern===2)y=side===aim?-137-lift*40:-110-lift*16;
 rootLimb(c,side*43,-106,side*(raised?83:93),raised?-129:-71,x,y,'#739474',12);
 ellipse(c,x,y,12,11,'#8ca57d',side*.25,2);
 for(let k=-1;k<=1;k++)stroke(c,'#4a745b',1.2,()=>{c.moveTo(x+k*4,y-4);c.quadraticCurveTo(x+k*4+side*2,y+3,x+k*4,y+7);});
 c.save();c.translate(x,y);c.rotate(side*(raised?-.34:strike?.45:.12));
 stroke(c,INK,7,()=>{c.moveTo(0,8);c.lineTo(0,-34);});stroke(c,'#d4b27a',4,()=>{c.moveTo(-1,7);c.lineTo(-1,-34);});
 ellipse(c,0,-38,evolved?19:16,evolved?13:11,gradient(c,-20,-50,30,22,'#fff0ca','#c38a57'),side*.1,2);
 for(let k=-1;k<=1;k++)stroke(c,'#91694e',1,()=>{c.moveTo(k*6-3,-47);c.quadraticCurveTo(k*6+5,-37,k*6-2,-30);});
 c.restore();
}
export function drawKiloGuardian(c,e,cam,t,reduced=false){
 const b=e?._drummer;if(!b)return false;
 const time=reduced?0:t,phase=b.phase||'waiting',warn=phase==='warn',strike=phase==='strike'||phase==='attack',rest=phase==='rest';
 const lift=warn?clamp(1-(b.timer||0)/(b.warnMax||60),0,1):0,beat=reduced?0:Math.sin(time*.16),breath=reduced?0:Math.sin(time*.04),aim=b.aim||1;
 const scale=Math.max(100,e.h||176)/204,walking=phase==='step',stride=walking&&!reduced?Math.sin(time*.18):0;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
 const hit=(e.flash||0)>0;if(hit&&!reduced){c.translate(-aim*3,1);c.rotate(-aim*.018);}
 // A planted, asymmetric root stance communicates weight before the first hit.
 ellipse(c,0,1,64,8,'#183f3d24',0,0);
 if(walking)c.translate(0,-Math.abs(stride)*1.8);
 for(const side of [-1,1]){
  const step=strike&&b.pattern===1?beat*5*side:stride*6*side;
  rootLimb(c,side*28,-43,side*46,-21,side*(45+step),-4,'#68896b',17);
  fill(c,'#78936f',()=>{c.moveTo(side*26,-9);c.quadraticCurveTo(side*40,-20,side*55,-12);c.quadraticCurveTo(side*72,-11,side*74,-3);c.quadraticCurveTo(side*53,4,side*31,-1);},2.3);
  for(let k=0;k<3;k++)stroke(c,'#d3d5a6',1.3,()=>{c.moveTo(side*(40+k*10),-10);c.quadraticCurveTo(side*(43+k*11),-7,side*(41+k*12),-2);});
 }
 if(e.evolved)for(const side of [-1,1])for(let k=0;k<4;k++)leaf(c,side*42,-112-k*10,43+k*3,13,side*(.62+k*.18),'#56866e');
 // Arms articulate at the shoulder, elbow and gripping hand.
 drumHand(c,-1,phase,lift,beat,e.evolved,b.pattern||0,aim);
 c.save();c.translate(0,strike?4:breath*.9);if(strike)c.scale(1.025,.975);if(warn&&b.pattern===1)c.rotate(aim*lift*.065);
 // Taiko belly: curved wooden staves with a real membrane and woven rope.
 fill(c,gradient(c,-55,-118,108,96,'#dfa46f','#a96d4e','#744d45'),()=>{c.moveTo(-49,-116);c.bezierCurveTo(-66,-94,-60,-52,-45,-30);c.quadraticCurveTo(0,-16,45,-30);c.bezierCurveTo(61,-50,67,-97,49,-116);},3);
 for(let k=-4;k<=4;k++){
  const x=k*11;
  stroke(c,k%2?'#795644':'#d59a65',1.4,()=>{c.moveTo(x,-111);c.bezierCurveTo(x*1.18,-85,x*.96,-57,x*.84,-30);});
  if(k%2===0)stroke(c,'#edbf83',.8,()=>{c.moveTo(x+3,-105);c.bezierCurveTo(x-3,-84,x+7,-60,x,-39);});
 }
 for(const yy of [-108,-32]){
  stroke(c,INK,8,()=>c.ellipse(0,yy,51,12,0,0,TAU));stroke(c,'#dcc38e',5.5,()=>c.ellipse(0,yy,51,12,0,0,TAU));
  stroke(c,'#fff0be',1,()=>c.ellipse(0,yy-2,49,10,0,Math.PI,TAU));
 }
 for(let k=-4;k<4;k++){
  const x=k*11;
  stroke(c,'#f0dab0',1.5,()=>{c.moveTo(x,-104);c.lineTo(x+10,-39);c.lineTo(x+11,-104);});
  ellipse(c,x+5,-105,2,2,'#705648',0,.7);
 }
 ellipse(c,0,-116,50,17,gradient(c,-40,-130,75,24,'#fff2cd',warn?'#f5ce8c':'#d9c492'),0,2.3);
 stroke(c,'#ad8e68',1.4,()=>c.ellipse(0,-116,37,11,0,0,TAU));
 // A broad wood-and-fern mask is the face. The drum is its body, not a face blob.
 fill(c,gradient(c,-40,-176,83,69,'#d1bf8d','#9d815e','#6a6650'),()=>{c.moveTo(-30,-174);c.bezierCurveTo(-48,-160,-42,-128,-29,-115);c.quadraticCurveTo(0,-101,29,-115);c.bezierCurveTo(43,-129,48,-160,30,-174);c.quadraticCurveTo(0,-188,-30,-174);},2.8);
 for(const side of [-1,1]){
  leaf(c,side*31,-142,34,14,side*1.2,'#6b9874');
  fill(c,'#537c64',()=>{c.moveTo(side*4,-158);c.quadraticCurveTo(side*22,-172,side*37,-157);c.lineTo(side*29,-137);c.quadraticCurveTo(side*16,-136,side*7,-142);},1.7);
  eye(c,side*17,-148,9,aim,{hurt:hit,blink:!reduced&&!warn&&!strike&&(time+side*7)%210<6,angry:warn||strike});
  ellipse(c,side*27,-130,7,3.5,'#d79d7f',side*.1,0);
  stroke(c,'#5e6953',1.2,()=>{c.moveTo(side*30,-163);c.quadraticCurveTo(side*32,-150,side*33,-141);});
  stroke(c,'#efe1ad',1.2,()=>{c.moveTo(side*9,-170);c.quadraticCurveTo(side*17,-176,side*24,-170);});
 }
 fill(c,'#c4b27d',()=>{c.moveTo(-6,-145);c.quadraticCurveTo(-9,-130,0,-130);c.quadraticCurveTo(9,-130,6,-145);},1.2);
 stroke(c,INK,2.4,()=>{c.moveTo(-10,-119);c.quadraticCurveTo(0,rest?-111:strike?-126:-116,10,-119);});
 if(rest){stroke(c,CREAM,1.2,()=>{c.moveTo(-7,-117);c.quadraticCurveTo(0,-114,7,-117);});}
 // The crown grows from the mask and stays behind the visible eyebrows and eyes.
 for(let k=-3;k<=3;k++)leaf(c,k*8,-174+(Math.abs(k))*2,25+(3-Math.abs(k))*4,9,k*.22,['#779d70','#a4b77f','#547c62'][(k+3)%3]);
 flower(c,-24,-180,9,'#eaa292',-.3);flower(c,26,-178,7,'#f0c380',.2);
 if(e.evolved){flower(c,0,-201,14,'#f0b893');for(const side of [-1,1])leaf(c,side*38,-176,51,14,side*.78,'#77a084');}
 c.restore();
 drumHand(c,1,phase,lift,beat,e.evolved,b.pattern||0,aim);
 // The warning belongs to the membrane and mallets, not lines through the level.
 if(warn||strike){
  c.save();c.globalAlpha=warn?.3+lift*.25:.35;
  stroke(c,'#ffeab2',warn?2.5:2,()=>c.ellipse(0,-115,55+(strike?7:0),18+(strike?4:0),0,0,TAU));
  if(strike)for(let k=0;k<2;k++)stroke(c,'#fff0c6',1.5,()=>c.ellipse(0,-115,65+k*12,22+k*4,0,.1,Math.PI-.1));
  c.restore();
 }
 c.restore();return true;
}
function beetle(c,s){
 const {time,step,wind,active,hurt,aim}=s;
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const a=step*(k%2?-1:1),x=side*(12+k*4),yy=-23+k*6;
  rootLimb(c,x,yy,side*(26+k*2),yy+5-a*2,side*(31+k*2),-1+Math.abs(a)*3,'#59735b',3.7);
 }
 ellipse(c,-5,-29,23,26,gradient(c,-28,-54,40,50,'#c1c78d','#79946a','#425e58'),-.12,2.5);
 fill(c,'#a6ba82',()=>{c.moveTo(-8,-53);c.bezierCurveTo(-31,-48,-28,-18,-11,-8);c.quadraticCurveTo(-4,-21,-8,-53);},1.7);
 fill(c,'#6d926d',()=>{c.moveTo(-6,-53);c.bezierCurveTo(17,-52,21,-25,3,-10);c.quadraticCurveTo(-7,-24,-6,-53);},1.7);
 stroke(c,'#e5dbac',1.4,()=>{c.moveTo(-15,-45);c.bezierCurveTo(-25,-39,-24,-24,-17,-20);});
 for(const side of [-1,1])for(let k=0;k<3;k++)ellipse(c,-6+side*(8+k*2),-41+k*10,1.7,2.6,'#d8d9a2',-.2,0);
 ellipse(c,13,-38,13,13,'#8da778',.12,2);
 eye(c,14,-40,5.5,aim,{hurt,angry:wind});
 for(const side of [-1,1]){
  stroke(c,INK,2,()=>{c.moveTo(15,-48);c.bezierCurveTo(20+side*4,-58-(wind?5:0),28+side*4,-60,29+side*4,-55);});
  ellipse(c,29+side*4,-55,2.2,2.2,'#d6c17a',0,1);
 }
 fill(c,'#d8bb7c',()=>{c.moveTo(24,-34);c.quadraticCurveTo(33,-38,35,-31);c.quadraticCurveTo(28,-28,25,-30);},1.3);
 if(active)stroke(c,'#edf1ca',2,()=>{c.moveTo(-23,-53);c.quadraticCurveTo(-9,-64,8,-55);});
}
function crab(c,s){
 const {step,wind,active,hurt,aim}=s;
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const stride=step*(k%2?-1:1)*3;
  rootLimb(c,side*(11+k*4),-22+k*3,side*(25+k*3),-13+stride,side*(31+k*4),-1-Math.max(0,stride),'#956956',3.6);
 }
 fill(c,gradient(c,-25,-43,51,36,'#e8b483','#b9785d','#845550'),()=>{c.moveTo(-23,-30);c.bezierCurveTo(-31,-50,22,-52,27,-31);c.quadraticCurveTo(29,-12,0,-10);c.quadraticCurveTo(-22,-12,-23,-30);},2.4);
 fill(c,'#d99b72',()=>{c.moveTo(-21,-33);c.quadraticCurveTo(0,-52,22,-33);c.quadraticCurveTo(0,-25,-21,-33);},1.3);
 for(let k=-2;k<=2;k++)stroke(c,'#efd0a0',1.1,()=>{c.moveTo(k*7,-40+Math.abs(k)*2);c.quadraticCurveTo(k*8,-32,k*8+2,-28);});
 for(const side of [-1,1]){
  rootLimb(c,side*17,-26,side*31,-31-(wind?4:0),side*34,-40,'#ac785e',5.5);
  stroke(c,INK,4,()=>{c.moveTo(side*10,-36);c.lineTo(side*11,-51);});stroke(c,'#c78b67',2.2,()=>{c.moveTo(side*10,-36);c.lineTo(side*11,-51);});
  eye(c,side*11,-53,5,aim,{hurt,angry:wind});
 }
 // The broad front claw is its shield. It is anatomical, with a hinge and
 // opposing fingers, rather than a generic plate floating over another species.
 const clawX=wind?34:active?42:35,clawY=wind?-41:-31;
 ellipse(c,-34,-39,9,9,'#c38a68',-.2,1.8);
 fill(c,gradient(c,clawX-16,clawY-19,35,42,'#e6b780','#bd805b','#8b5f50'),()=>{
  c.moveTo(clawX-12,clawY+13);c.bezierCurveTo(clawX-23,clawY-11,clawX-4,clawY-25,clawX+9,clawY-17);
  c.quadraticCurveTo(clawX+2,clawY-12,clawX+1,clawY-4);c.quadraticCurveTo(clawX+12,clawY-3,clawX+17,clawY-11);
  c.bezierCurveTo(clawX+23,clawY+3,clawX+9,clawY+21,clawX-12,clawY+13);
 },2.2);
 stroke(c,'#f1cf9a',1.5,()=>{c.moveTo(clawX-11,clawY+6);c.bezierCurveTo(clawX-18,clawY-5,clawX-8,clawY-15,clawX-2,clawY-15);});
 ellipse(c,clawX-7,clawY+10,3,3,'#a97557',0,.8);
 stroke(c,INK,1.5,()=>{c.moveTo(-5,-22);c.quadraticCurveTo(0,-19,6,-22);});
}
function frog(c,s){
 const {step,wind,active,hurt,aim}=s,down=wind?5:0;
 // Folded haunches become long springs during the committed leap.
 for(const side of [-1,1]){
  ellipse(c,side*21,-17+down,13,13,'#5c9975',side*.45,2);
  rootLimb(c,side*22,-15+down,side*(active?33:30),-8,side*(active?38:29),-2,'#79b18a',5.5);
  for(let k=0;k<3;k++)stroke(c,'#bad6a0',1.5,()=>{c.moveTo(side*(active?37:29),-2);c.lineTo(side*(active?43:35)+k*2,0-k);});
 }
 ellipse(c,0,-29+down,23,21,gradient(c,-23,-50,46,40,'#b8d6a0','#6ca882','#387969'),0,2.3);
 ellipse(c,2,-26+down,15,13,'#cbd9a3',0,1.2);
 fill(c,'#79b68c',()=>{c.moveTo(-24,-41+down);c.bezierCurveTo(-30,-62+down,-11,-64+down,-6,-51+down);c.quadraticCurveTo(0,-56+down,6,-51+down);c.bezierCurveTo(17,-65+down,31,-58+down,24,-39+down);c.quadraticCurveTo(0,-23+down,-24,-41+down);},2.2);
 for(const side of [-1,1])eye(c,side*14,-50+down,6.7,aim,{hurt,angry:wind});
 stroke(c,'#315f56',1.8,()=>{c.moveTo(-14,-36+down);c.quadraticCurveTo(0,-30+down,15,-36+down);});
 for(const side of [-1,1])ellipse(c,side*21,-36+down,3,2,'#d3c69a',0,0);
 for(let k=0;k<4;k++)ellipse(c,-15+k*9,-24+down+(k%2)*3,2,1.5,'#70a27b',.2,0);
}
function plant(c,s){
 const {time,wind,active,hurt,aim,reduced}=s,sway=reduced?0:Math.sin(time*.045)*3;
 ellipse(c,0,-2,22,5,'#5d785b',0,1.8);
 for(const side of [-1,1])leaf(c,side*5,-7,34,13,side*(1.05+(wind?.1:0)),'#6da47b');
 rootLimb(c,0,-6,sway-5,-25,sway,-42,'#628e67',8);
 for(const side of [-1,1])leaf(c,sway,-24,25,11,side*.95,'#91bc82');
 c.save();c.translate(sway,-47);c.rotate(active?.18:wind?-.12:0);
 for(let k=0;k<5;k++)petal(c,0,0,18,k%2?'#b78c80':'#d8ae91',k*TAU/5);
 fill(c,gradient(c,-22,-24,45,38,'#b1cb8e','#689773','#426f5c'),()=>{c.moveTo(-22,-4);c.bezierCurveTo(-30,-29,18,-32,24,-8);c.quadraticCurveTo(29,14,7,16);c.quadraticCurveTo(-14,17,-22,-4);},2.3);
 for(const side of [-1,1])eye(c,side*9,-10,4.8,aim,{hurt,angry:wind});
 fill(c,'#243f40',()=>{c.moveTo(-12,3);c.quadraticCurveTo(0,active?20:12,13,3);c.quadraticCurveTo(0,-1,-12,3);},1);
 for(const side of [-1,1])fill(c,'#f5e8c4',()=>{c.moveTo(side*6,3);c.lineTo(side*4,8);c.lineTo(side*1,3);},.6);
 if(wind){ellipse(c,18,5,5,5,'#e0be86',0,1.4);ellipse(c,17,3,2,1.2,'#fff4cc',0,0);}
 c.restore();
}
function flyer(c,s,wasp){
 const {time,wind,active,hurt,aim,reduced}=s,flutter=reduced?0:Math.sin(time*.45),w=wasp?20:25;
 // Four translucent lobes attach at the thorax; no unconnected wing stickers.
 for(const side of [-1,1]){
  c.save();c.translate(-3,-39);c.rotate(side*(.3+flutter*.2));
  ellipse(c,side*19,-11,w,10,wasp?'#d8e6d8':'#c2e8c9',side*.3,1.2);
  ellipse(c,side*14,1,w*.7,7,wasp?'#edf0dc':'#d4edbe',-side*.2,1.1);
  stroke(c,wasp?'#94b4ab':'#82b599',.9,()=>{c.moveTo(0,0);c.quadraticCurveTo(side*20,-3,side*(w+11),-13);});
  c.restore();
 }
 c.save();c.rotate(active?-.2:wind?.11:0);
 ellipse(c,-9,-25,12,19,gradient(c,-18,-43,25,35,wasp?'#f2cb75':'#b7d398',wasp?'#b98b4e':'#699f7e'),-.28,2);
 if(wasp)for(let k=0;k<3;k++)stroke(c,'#423c3e',4,()=>{c.moveTo(-18,-34+k*8);c.quadraticCurveTo(-8,-28+k*8,0,-31+k*8);});
 else {for(let k=0;k<3;k++)ellipse(c,-10+k%2*6,-34+k*9,2.5,3,'#ecf3bb',.2,.6);}
 ellipse(c,1,-39,9,11,wasp?'#a17e50':'#7bba91',-.2,2);
 ellipse(c,10,-47,13,13,wasp?'#e7bf72':'#b8daa2',.15,2);
 eye(c,14,-48,6,aim,{hurt,angry:wind});
 for(const side of [-1,1]){
  stroke(c,INK,1.5,()=>{c.moveTo(6+side*5,-58);c.quadraticCurveTo(11+side*9,-72,19+side*9,-66);});
  ellipse(c,19+side*9,-66,2.3,2.1,wasp?'#dbb46e':'#daf2ad',0,.7);
  for(let k=0;k<2;k++)stroke(c,wasp?'#6e6451':'#62937c',1.8,()=>{c.moveTo(-1,-34+k*6);c.quadraticCurveTo(12,-27+k*7,9+(wind?6:0),-19+k*7);});
 }
 if(wasp)fill(c,'#f1dfad',()=>{c.moveTo(-15,-10);c.quadraticCurveTo(-11,3,-5,8);c.quadraticCurveTo(-2,-1,-5,-11);},1.3);
 else {stroke(c,'#668f78',2.5,()=>{c.moveTo(21,-47);c.quadraticCurveTo(32,-43,35,-48);});ellipse(c,35,-48,2.2,2.2,'#e7ebba',0,.7);}
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
 if(wind){c.save();c.globalAlpha=.35;ellipse(c,0,2,e.kind==='rana'?32:25,3.3,'#ffe0a5',0,0);c.restore();}
 c.restore();
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
