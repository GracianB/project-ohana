// Astillero de Stitcho: criaturas del astillero, drones mecánicos y fauna bio-alienígena.
// Arte vectorial en Canvas de alta calidad (mismo nivel de acabado que Claro de Kilo V606).
// Solo presentación: lee el estado real de combate (wind, active, hurt, aim) sin tocar física.
const TAU=Math.PI*2,INK='#122332',CYAN='#67ddff',PURPLE='#b38cff';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

function fill(c,color,draw,width=1.8){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.6){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}

function roundRect(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function eye(c,x,y,r,aim=1,{hurt=false,angry=false,glow='#67ddff'}={}){
 if(hurt){stroke(c,INK,2,()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);});return;}
 ellipse(c,x,y,r,r*1.05,'#fff9e6',0,1.4);
 ellipse(c,x+aim*r*.22,y,r*.52,r*.68,glow,0,0);
 ellipse(c,x+aim*r*.26,y,r*.25,r*.44,'#091a28',0,0);
 ellipse(c,x-r*.18,y-r*.3,r*.22,r*.22,'#ffffff',0,0);
 if(angry)stroke(c,INK,1.8,()=>{c.moveTo(x-r*1.1,y-r*1.1);c.lineTo(x+r,y-r*.6);});
}

function limb(c,x,y,ex,ey,tx,ty,col,w=3.2){
 stroke(c,INK,w+2.8,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});
 stroke(c,col,w,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});
}

// ─ Escarabajo del muelle (cucaracho): blindaje de chatarra espacial cobalto, circuitos cian y mandíbulas hidráulicas
function drawScrapBeetle(c,s){
 const {step,wind,active,hurt,aim,reduced,time}=s;
 // 6 patas hidráulicas industriales con amortiguadores y garras de agarre
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const a=step*(k%2?-1:1)*3.8,x=side*(11+k*5),yy=-18+k*5;
  const kx=side*(26+k*3)+a,ky=yy+4-a*.5;
  const fx=side*(32+k*4)+a*1.2,fy=-1+Math.abs(a)*2.5;
  limb(c,x,yy,kx,ky,fx,fy,'#1e3d54',3.6);
  stroke(c,CYAN,1.5,()=>{c.moveTo(fx,fy);c.lineTo(fx+side*3,fy-3);});
  ellipse(c,kx,ky,2.4,2.4,'#85d5f2',0,0.8);
 }
 // Caparazón cobalto segmentado con remaches de titanio
 fill(c,gradient(c,-25,-50,50,44,'#9ee5ff','#3b80aa','#122b3e'),()=>{
  c.moveTo(-23,-26);c.bezierCurveTo(-29,-50,23,-52,27,-27);c.quadraticCurveTo(25,-8,0,-6);c.quadraticCurveTo(-21,-8,-23,-26);
 },2.4);
 for(let i=-2;i<=2;i++){
  stroke(c,'#ffb300',2,()=>{c.moveTo(i*8-4,-14+Math.abs(i)*2);c.lineTo(i*8,-8+Math.abs(i)*2);});
 }
 // Placas y circuitos de chatarra luminosa cian
 stroke(c,CYAN,1.8,()=>{c.moveTo(-16,-35);c.lineTo(-4,-43);c.lineTo(8,-37);c.lineTo(19,-41);});
 stroke(c,'#ffffff',1,()=>{c.moveTo(-12,-25);c.lineTo(0,-30);c.lineTo(15,-23);});
 for(let k=-2;k<=2;k++){ellipse(c,k*9,-46+Math.abs(k)*3,1.4,1.4,'#e0f7fa',0,0);}
 // Cabeza y mandíbulas de cizalla industrial
 ellipse(c,15,-29,12,12,'#1e3d54',0,2);
 eye(c,16,-31,5.5,aim,{hurt,angry:wind||active,glow:active?'#ff5252':CYAN});
 for(const side of [-1,1]){
  const antTwitch=reduced?0:Math.sin(time*.25+side)*3;
  stroke(c,INK,2.2,()=>{c.moveTo(18,-37);c.quadraticCurveTo(25+side*3,-48+antTwitch,30+side*4,-44+antTwitch);});
  ellipse(c,30+side*4,-44+antTwitch,2.6,2.6,wind?'#ff5252':CYAN,0,1);
 }
 stroke(c,CYAN,2,()=>{c.moveTo(25,-25);c.lineTo(34,-27);c.moveTo(25,-22);c.lineTo(32,-20);});
 if(active)stroke(c,'#e0f8ff',2.5,()=>{c.moveTo(-18,-48);c.quadraticCurveTo(0,-58,20,-48);});
}

// ─ Tejedora de cables (arana): cuerpo bio-mecánico, 8 patas de cable de alta tensión
function drawCableSpider(c,s){
 const {step,wind,active,hurt,aim,reduced,time}=s;
 for(const side of [-1,1])for(let k=0;k<4;k++){
  const stride=step*(k%2?-1:1)*3.2,bx=side*(6+k*4),by=-14+k*2;
  const kx=bx+side*(15+k*3)+stride,ky=-27-(side<0?2:0);
  const fx=bx+side*(26+k*4)+stride*1.2,fy=-1-Math.max(0,-stride);
  limb(c,bx,by,kx,ky,fx,fy,k%2?'#4a148c':'#1a237e',3.2);
  ellipse(c,kx,ky,2,2,'#ffab40',0,0.8);
  stroke(c,PURPLE,1.4,()=>{c.moveTo(fx,fy);c.lineTo(fx+side*3,fy-3);});
 }
 // Abdomen alienígena púrpura/cobalto con matriz de neón
 fill(c,gradient(c,-21,-40,42,34,'#e1bee7','#7b1fa2','#1a0033'),()=>{
  c.moveTo(-19,-23);c.bezierCurveTo(-28,-40,-9,-46,0,-38);c.bezierCurveTo(9,-46,28,-40,19,-23);c.quadraticCurveTo(0,-12,-19,-23);
 },2.4);
 stroke(c,PURPLE,2.2,()=>{c.moveTo(0,-40);c.lineTo(0,-16);c.moveTo(-11,-28);c.lineTo(11,-28);});
 stroke(c,'#ffffff',1,()=>{c.moveTo(-6,-28);c.lineTo(6,-28);});
 for(const [nx,ny] of [[0,-40],[0,-16],[-11,-28],[11,-28],[0,-28]]){
  ellipse(c,nx,ny,1.8,1.8,'#ea80fc',0,0);
 }
 ellipse(c,4,-19,10,9,'#121b2d',0,2);
 eye(c,7,-21,3.8,aim,{hurt,angry:wind||active,glow:'#ff4081'});
 eye(c,2,-19,2.8,aim,{hurt,angry:wind||active,glow:'#00e5ff'});
 eye(c,6,-15,2.2,aim,{hurt,angry:wind||active,glow:'#ffd600'});
 stroke(c,PURPLE,2,()=>{c.moveTo(9,-12);c.lineTo(15,-6);c.moveTo(3,-12);c.lineTo(-1,-6);});
 if(active)stroke(c,'#ff80ab',2.5,()=>{c.moveTo(15,-6);c.lineTo(12,-1);c.moveTo(-1,-6);c.lineTo(2,-1);});
 if(wind||active){
  c.save();c.globalAlpha=0.6;
  stroke(c,'#ea80fc',2,()=>{c.moveTo(14,-22);c.quadraticCurveTo(24,-14,18,-4);});
  c.restore();
 }
}

// ─ Chispa del astillero (phosquito): dron esferoidal bio-eléctrico de plasma
function drawPlasmaFlyer(c,s){
 const {time,wind,active,hurt,aim,reduced}=s;
 const flap=reduced?0:Math.sin(time*.45)*10;
 for(const side of [-1,1]){
  c.save();c.translate(side*4,-25);c.rotate(side*.4+flap*.04*side);
  fill(c,'rgba(103,221,255,0.48)',()=>{c.ellipse(side*13,-6,18,7,side*-.3,0,TAU);},1.4);
  stroke(c,'#ffffff',1.2,()=>{c.moveTo(0,0);c.lineTo(side*24,-8);c.moveTo(side*10,-4);c.lineTo(side*14,-12);});
  c.restore();
 }
 fill(c,gradient(c,-13,-28,26,26,'#e0f7fa','#00e5ff','#004d40'),()=>c.ellipse(0,-15,12,14,0,0,TAU),2.4);
 stroke(c,CYAN,2.2,()=>c.ellipse(0,-15,16,7,flap*.02,0,TAU));
 stroke(c,'#b388ff',1.5,()=>c.ellipse(0,-15,8,17,0.3,0,TAU));
 eye(c,aim*3,-16,5,aim,{hurt,angry:wind||active,glow:active?'#ff1744':'#fff59d'});
 stroke(c,'#26415e',2.8,()=>{c.moveTo(0,-3);c.lineTo(-aim*4,7);});
 stroke(c,CYAN,active?3.5:2,()=>{c.moveTo(-aim*4,7);c.lineTo(-aim*9,14);});
 if(!reduced&&(wind||active)){
  ellipse(c,-aim*9,14,2.5,2.5,'#ffffff',0,0);
 }
}

// ─ Dron de inspección (ufo): vigilante esférico con lente escáner y cono de detección
function drawUfoDrone(c,s){
 const {time,wind,active,hurt,aim,reduced}=s;
 const bob=reduced?0:Math.sin(time*.12)*3.5;
 c.translate(0,bob);
 if(wind){
  c.save();
  const scanBeam=c.createLinearGradient(aim*12,-16,aim*220,12);
  scanBeam.addColorStop(0,'rgba(255,82,82,0.65)');
  scanBeam.addColorStop(1,'rgba(255,82,82,0)');
  c.fillStyle=scanBeam;
  c.beginPath();c.moveTo(aim*12,-18);c.lineTo(aim*240,-45);c.lineTo(aim*240,45);c.closePath();c.fill();
  c.strokeStyle='#ff5252';c.lineWidth=1.5;
  c.beginPath();c.moveTo(aim*12,-16);c.lineTo(aim*240,-16);c.stroke();
  c.restore();
 }
 fill(c,gradient(c,-25,-32,50,28,'#b2ebf2','#376b88','#102636'),()=>{
  c.ellipse(0,-16,25,10,0,0,TAU);
 },2.4);
 fill(c,gradient(c,-13,-38,26,22,'#ffffff','#80deea','#195875'),()=>{
  c.arc(0,-18,13,Math.PI,0);
 },1.8);
 for(let i=-2;i<=2;i++){
  const lx=i*9,ly=-14+Math.abs(i)*1.6;
  const strobe=((time*5+i)%6<2);
  ellipse(c,lx,ly,2.2,2.2,strobe?CYAN:'#102a3a',0,0.8);
 }
 eye(c,aim*4,-17,6,aim,{hurt,angry:wind||active,glow:active?'#ff1744':wind?'#ff9100':CYAN});
 stroke(c,'#264c63',2.2,()=>{c.moveTo(0,-31);c.lineTo(0,-40);});
 ellipse(c,0,-41,3,3,wind?'#ff5252':CYAN,0,1);
 stroke(c,'#1a3647',3,()=>{c.moveTo(-8,-8);c.lineTo(-8,-2);c.moveTo(8,-8);c.lineTo(8,-2);});
}

// ─ Vigía nocturno (murcielago): murciélago alienígena con alas de radar
function drawAcrobatBat(c,s){
 const {time,step,wind,active,hurt,aim,reduced}=s;
 const flap=reduced?0:Math.sin(time*.22)*13;
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-18);
  const rot=side*(.26+flap*.035);
  c.rotate(rot);
  fill(c,'#1a102f',()=>{
   c.moveTo(0,0);c.lineTo(side*30,-15);c.quadraticCurveTo(side*24,5,side*17,9);c.quadraticCurveTo(side*11,6,0,0);
  },2.2);
  stroke(c,PURPLE,1.6,()=>{
   c.moveTo(0,0);c.lineTo(side*22,-11);
   c.moveTo(0,0);c.lineTo(side*15,5);
   c.moveTo(side*12,-6);c.lineTo(side*18,0);
  });
  c.restore();
 }
 fill(c,gradient(c,-11,-30,22,26,'#9575cd','#4527a0','#120036'),()=>c.ellipse(0,-14,9,12,0,0,TAU),2.2);
 for(const side of [-1,1]){
  fill(c,'#5e35b1',()=>{c.moveTo(side*2,-23);c.lineTo(side*8,-37);c.lineTo(side*9,-21);},1.5);
  stroke(c,CYAN,1.2,()=>{c.moveTo(side*4,-25);c.lineTo(side*7,-33);});
  if(!reduced){
   stroke(c,'rgba(103,221,255,0.4)',1,()=>c.ellipse(side*8,-38,3,2,0,0,TAU));
  }
 }
 eye(c,-3.5,-14,3.2,aim,{hurt,angry:wind||active,glow:'#ffd54f'});
 eye(c,3.5,-14,3.2,aim,{hurt,angry:wind||active,glow:'#ffd54f'});
 stroke(c,'#283593',2,()=>{c.moveTo(-4,-3);c.lineTo(-4,2);c.moveTo(4,-3);c.lineTo(4,2);});
 if(active)stroke(c,'#ffd54f',2,()=>{c.moveTo(-3,-8);c.lineTo(0,-5);c.lineTo(3,-8);});
}

const DRAW_MAP={
 cucaracho:drawScrapBeetle,
 arana:drawCableSpider,
 phosquito:drawPlasmaFlyer,
 ufo:drawUfoDrone,
 murcielago:drawAcrobatBat
};

export function drawStitchoCreature(c,e,cam,t,reduced=false){
 if(e.roomId!=='w1-stitcho'||!e.roomPersona?.stitchoEncounter||e.boss||e.miniBoss)return false;
 const drawFn=DRAW_MAP[e.kind];
 if(!drawFn)return false;
 const a=e._campaign||{},time=reduced?0:t,phase=time*.19+(e.spawnIndex||0),run=Math.abs(e.vx||0)>.4;
 const wind=(a.wind||0)>0,active=(a.active||0)>0,hurt=e.invuln>0||e.stun>5;
 const step=run?Math.sin(phase):0,aim=a.aim||Math.sign(e.vx)||1;
 const flying=e.campaignRole==='flyer'||e.campaignRole==='gunner';
 const height=Math.max(50,Math.min(96,e.h||56)),scale=height/56;

 c.save();
 c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);
 c.scale(scale*aim,scale);
 c.globalAlpha=e.dying?Math.max(0,Math.min(1,e.dying/28)):1;
 c.lineJoin='round';c.lineCap='round';

 if(flying)c.translate(0,reduced?0:Math.sin(time*.1)*3);
 else if(run)c.translate(0,-Math.abs(step)*2);

 if(wind){c.translate(-aim*2,2);c.scale(1.05,.95);}
 else if(active)c.rotate(aim*.08);
 else if(hurt)c.rotate(-aim*.14);

 drawFn(c,{time,step,wind,active,hurt,aim});

 c.restore();
 if(e._alertT>0){
  const ax=e.x+e.w/2-cam.x,ay=e.y-cam.y-14;
  c.save();c.fillStyle='#7ee7ff';c.strokeStyle='#10233d';c.lineWidth=2.5;c.font='bold 14px sans-serif';c.textAlign='center';
  c.strokeText('!',ax,ay);c.fillText('!',ax,ay);c.restore();
 }
 return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES Y TALLERES DEL ASTILLERO DE STITCH
// ─────────────────────────────────────────────────────────────────────────────

export function drawStitchoPart(c, partId, x, y, { carried=false, t=0, reduced=false }={}){
  const time = reduced ? 0 : t;
  const bob = carried ? (reduced ? 0 : Math.sin(time * 0.15) * 2) : (reduced ? 0 : Math.sin(time * 0.05 + Number(partId) * 2) * 4);
  c.save();
  c.translate(x, y + bob);
  c.lineJoin = 'round'; c.lineCap = 'round';

  if (carried) {
    c.save();
    const aura = c.createRadialGradient(0, 4, 2, 0, 4, 24);
    aura.addColorStop(0, 'rgba(103,221,255,0.4)');
    aura.addColorStop(1, 'rgba(103,221,255,0)');
    c.fillStyle = aura;
    c.beginPath(); c.ellipse(0, 6, 22, 12, 0, 0, TAU); c.fill();
    c.restore();
  } else {
    c.save();
    c.translate(0, 32 - bob);
    fill(c, '#142738', () => {
      c.moveTo(-28, 0); c.lineTo(-20, -10); c.lineTo(20, -10); c.lineTo(28, 0);
    }, 2);
    stroke(c, CYAN, 1.8, () => { c.moveTo(-16, -7); c.lineTo(16, -7); });
    ellipse(c, 0, -7, 4, 2, '#ffffff', 0, 0);
    const beam = c.createLinearGradient(0, -7, 0, -38);
    beam.addColorStop(0, 'rgba(103,221,255,0.35)');
    beam.addColorStop(1, 'rgba(103,221,255,0)');
    c.fillStyle = beam;
    c.beginPath(); c.moveTo(-14, -7); c.lineTo(14, -7); c.lineTo(8, -38); c.lineTo(-8, -38); c.closePath(); c.fill();
    c.restore();
  }

  const id = Number(partId) || 0;
  if (id === 0) {
    // ─ MÓDULO 0: Turborreactor de Hiperimpulso
    fill(c, gradient(c, -24, -14, 48, 28, '#4f7d9c', '#214258', '#132838'), () => {
      roundRect(c, -22, -13, 44, 26, 6);
    }, 2.4);
    stroke(c, '#e09848', 2.2, () => {
      c.moveTo(-12, -13); c.lineTo(-12, 13);
      c.moveTo(12, -13); c.lineTo(12, 13);
    });
    for (const side of [-1, 1]) {
      const tx = side * 14;
      fill(c, '#102230', () => c.ellipse(tx, 0, 6, 10, 0, 0, TAU), 1.6);
      const spin = time * 0.25 * side;
      stroke(c, CYAN, 1.6, () => {
        c.moveTo(tx - Math.cos(spin) * 5, -Math.sin(spin) * 8);
        c.lineTo(tx + Math.cos(spin) * 5, Math.sin(spin) * 8);
        c.moveTo(tx - Math.sin(spin) * 5, Math.cos(spin) * 8);
        c.lineTo(tx + Math.sin(spin) * 5, -Math.cos(spin) * 8);
      });
    }
    fill(c, '#eaffff', () => c.ellipse(0, 0, 5, 5, 0, 0, TAU), 0);
    ellipse(c, 0, 0, 7, 7, 'rgba(103,221,255,0.6)', 0, 0);
    stroke(c, CYAN, 1.6, () => { c.moveTo(-5, 0); c.lineTo(5, 0); });
    for (const side of [-1, 1]) {
      fill(c, '#1b3244', () => {
        c.moveTo(side * 8, 13); c.lineTo(side * 12, 18); c.lineTo(side * 4, 18);
      }, 1.2);
      if (!reduced) {
        stroke(c, '#8ceeff', 2, () => { c.moveTo(side * 8, 18); c.lineTo(side * 8, 22 + Math.sin(time * 0.4 + side) * 3); });
      }
    }
  } else if (id === 1) {
    // ─ MÓDULO 1: Batería de Plasma y Contención
    for (const side of [-1, 1]) {
      fill(c, gradient(c, -16, side * 14 - 4, 32, 8, '#709eb8', '#2b4d63', '#152936'), () => {
        roundRect(c, -15, side * 14 - 3, 30, 7, 3);
      }, 2);
      ellipse(c, -9, side * 14, 1.5, 1.5, '#d6effa', 0, 0.8);
      ellipse(c, 9, side * 14, 1.5, 1.5, '#d6effa', 0, 0.8);
    }
    fill(c, '#f0c036', () => { c.rect(-13, -11, 26, 4); }, 1);
    stroke(c, INK, 1.2, () => {
      c.moveTo(-7, -11); c.lineTo(-4, -7);
      c.moveTo(1, -11); c.lineTo(4, -7);
      c.moveTo(9, -11); c.lineTo(12, -7);
    });
    fill(c, 'rgba(215,245,255,0.22)', () => { roundRect(c, -13, -7, 26, 18, 2); }, 2);
    const p1 = Math.sin(time * 0.18) * 6, p2 = Math.cos(time * 0.18) * 6;
    stroke(c, PURPLE, 2.4, () => {
      c.moveTo(0, -6);
      c.bezierCurveTo(p1, -2, -p1, 4, 0, 10);
    });
    stroke(c, CYAN, 2.2, () => {
      c.moveTo(0, -6);
      c.bezierCurveTo(-p2, -2, p2, 4, 0, 10);
    });
    ellipse(c, 0, 2, 4, 5, '#ffffff', 0, 0);
    ellipse(c, 0, 2, 8, 9, 'rgba(179,140,255,0.4)', 0, 0);
  } else {
    // ─ MÓDULO 2: Giroscopio Hiperespacial Cuádrilatero
    const r1 = time * 0.04, r2 = -time * 0.05, r3 = time * 0.07;
    c.save();
    c.rotate(r1);
    stroke(c, INK, 3.4, () => c.ellipse(0, 0, 19, 10, 0, 0, TAU));
    stroke(c, '#ffd76a', 2.2, () => c.ellipse(0, 0, 19, 10, 0, 0, TAU));
    c.restore();

    c.save();
    c.rotate(r2);
    stroke(c, INK, 3.2, () => c.ellipse(0, 0, 14, 8, Math.PI / 3, 0, TAU));
    stroke(c, '#f0b848', 2, () => c.ellipse(0, 0, 14, 8, Math.PI / 3, 0, TAU));
    c.restore();

    c.save();
    c.rotate(r3);
    stroke(c, INK, 2.8, () => c.ellipse(0, 0, 9, 6, -Math.PI / 4, 0, TAU));
    stroke(c, '#ffa63d', 1.8, () => c.ellipse(0, 0, 9, 6, -Math.PI / 4, 0, TAU));
    c.restore();

    fill(c, '#ffffff', () => {
      c.moveTo(0, -8); c.lineTo(2.5, -2.5); c.lineTo(8, 0); c.lineTo(2.5, 2.5);
      c.lineTo(0, 8); c.lineTo(-2.5, 2.5); c.lineTo(-8, 0); c.lineTo(-2.5, -2.5);
    }, 1.4);
    ellipse(c, 0, 0, 11, 11, 'rgba(103,221,255,0.5)', 0, 0);
    if (!reduced) {
      const beamPulse = (Math.sin(time * 0.12) + 1) * 0.5;
      stroke(c, 'rgba(103,221,255,' + (0.3 + beamPulse * 0.4) + ')', 1.4, () => {
        c.moveTo(-18, 0); c.lineTo(-10, 0);
        c.moveTo(10, 0); c.lineTo(18, 0);
        c.moveTo(0, -18); c.lineTo(0, -10);
        c.moveTo(0, 10); c.lineTo(0, 18);
      });
    }
  }

  c.restore();
}

const WORKSHOP_INFO = [
  { name: 'TALLER I · REACTOR DE IMPULSO', hint: 'INSTALA EL TURBORREACTOR', color: CYAN },
  { name: 'TALLER II · BATERÍA DE PLASMA', hint: 'CONECTA LA CELDA DE PLASMA', color: PURPLE },
  { name: 'TALLER III · NAVEGACIÓN', hint: 'CALIBRA EL GIROSCOPIO ASTRAL', color: '#ffd260' }
];

export function drawStitchoWorkshopBench(c, s, tx, ty, done, t=0, reduced=false){
  const time = reduced ? 0 : t;
  const id = Number(s.id) || 0;
  const info = WORKSHOP_INFO[id % WORKSHOP_INFO.length];

  c.save();
  c.translate(tx, ty);
  c.lineJoin = 'round'; c.lineCap = 'round';

  fill(c, gradient(c, -58, -18, 116, 20, '#365870', '#183144', '#0d1d29'), () => {
    c.moveTo(-56, 0); c.lineTo(-46, -18); c.lineTo(46, -18); c.lineTo(56, 0);
  }, 2.4);

  fill(c, '#f0c036', () => { c.rect(-42, -16, 84, 6); }, 1.2);
  stroke(c, INK, 1.4, () => {
    for (let k = -36; k <= 36; k += 12) {
      c.moveTo(k, -16); c.lineTo(k + 6, -10);
    }
  });

  fill(c, gradient(c, -38, -36, 76, 20, '#507691', '#28475c', '#142a38'), () => {
    c.moveTo(-38, -18); c.lineTo(-32, -36); c.lineTo(32, -36); c.lineTo(38, -18);
  }, 2);

  for (const side of [-1, 1]) {
    const clampAngle = done ? 0 : side * 0.25;
    c.save();
    c.translate(side * 28, -24);
    c.rotate(clampAngle);
    fill(c, '#1b3346', () => {
      c.moveTo(0, 0); c.lineTo(side * 12, -8); c.lineTo(side * 10, -22); c.lineTo(side * 2, -20);
    }, 1.8);
    ellipse(c, 0, 0, 3, 3, '#86b7d4', 0, 1.2);
    c.restore();
  }

  if (done) {
    drawStitchoPart(c, id, 0, -38, { carried: false, t, reduced: true });
    c.save();
    c.translate(-30, -56);
    fill(c, '#1f3c52', () => {
      c.moveTo(0, 0); c.lineTo(16, -14); c.lineTo(26, 8);
    }, 2);
    if (!reduced) {
      const sparkCount = (time % 5 < 3) ? 4 : 2;
      stroke(c, '#e0f9ff', 2.2, () => { c.moveTo(26, 8); c.lineTo(20, 18); });
      for (let k = 0; k < sparkCount; k++) {
        const sx = 20 + Math.sin(time * 0.4 + k * 2) * 10;
        const sy = 18 + Math.cos(time * 0.5 + k * 1.5) * 8;
        ellipse(c, sx, sy, 1.4, 1.4, (k % 2 === 0 ? CYAN : '#ffffff'), 0, 0);
      }
    }
    c.restore();
  }

  const panelY = -78;
  stroke(c, '#1b3447', 3, () => { c.moveTo(0, -36); c.lineTo(0, panelY + 18); });
  ellipse(c, 0, panelY + 18, 4, 3, CYAN, 0, 1.2);

  fill(c, done ? 'rgba(16, 48, 42, 0.88)' : 'rgba(12, 32, 48, 0.88)', () => {
    roundRect(c, -68, panelY - 26, 136, 40, 6);
  }, 2);
  stroke(c, done ? '#68f0b0' : CYAN, 1.6, () => {
    roundRect(c, -68, panelY - 26, 136, 40, 6);
  });
  stroke(c, '#ffffff', 1.8, () => {
    c.moveTo(-62, panelY - 22); c.lineTo(-65, panelY - 22); c.lineTo(-65, panelY - 18);
    c.moveTo(62, panelY - 22); c.lineTo(65, panelY - 22); c.lineTo(65, panelY - 18);
    c.moveTo(-62, panelY + 10); c.lineTo(-65, panelY + 10); c.lineTo(-65, panelY + 6);
    c.moveTo(62, panelY + 10); c.lineTo(65, panelY + 10); c.lineTo(65, panelY + 6);
  });

  c.textAlign = 'center';
  c.font = '900 11px Outfit, sans-serif';
  c.fillStyle = done ? '#9effd6' : '#cff5ff';
  c.fillText(info.name, 0, panelY - 10);

  c.font = '800 10px Outfit, sans-serif';
  if (done) {
    c.fillStyle = '#68f0b0';
    c.fillText('SISTEMA CALIBRADO ✓ · 100%', 0, panelY + 6);
  } else {
    c.fillStyle = info.color;
    c.fillText(info.hint, 0, panelY + 6);
  }

  c.restore();
}

export function drawStitchoPartStation(c, s, cam, t=0, reduced=false, carry=null){
  const x = s.x - cam.x, y = s.y - cam.y;
  const tx = s.target.x - cam.x, ty = s.target.y - cam.y;

  if (!s.done && carry !== s.id) {
    drawStitchoPart(c, s.id, x, y - 10, { carried: false, t, reduced });
    c.save();
    c.textAlign = 'center';
    c.font = '800 11px Outfit, sans-serif';
    c.fillStyle = '#102738';
    c.fillText('J / E · RECOGER MÓDULO ' + (s.id + 1), x, y - 56);
    c.restore();
  }

  drawStitchoWorkshopBench(c, s, tx, ty, s.done, t, reduced);
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUCERO ESTELAR ESCARLATA Y RAÍL DE MANTENIMIENTO
// ─────────────────────────────────────────────────────────────────────────────

export function drawStitchoStarCruiser(c, shipX, shipY, parts=0, t=0, reduced=false){
  const time = reduced ? 0 : t;
  const restored = parts >= 3;
  const bob = restored ? (reduced ? 0 : Math.sin(time * 0.08) * 3) : 0;

  c.save();
  c.translate(shipX, shipY - 48 + bob);
  c.lineJoin = 'round'; c.lineCap = 'round';

  for (const side of [-1, 1]) {
    fill(c, '#1a3346', () => {
      c.moveTo(side * 78, 16); c.lineTo(side * 88, 38); c.lineTo(side * 102, 38); c.lineTo(side * 92, 16);
    }, 2);
    ellipse(c, side * 95, 38, 12, 3, '#0c1b26', 0, 1.4);
    stroke(c, '#9ac2db', 3, () => { c.moveTo(side * 82, 20); c.lineTo(side * 89, 36); });
  }

  for (const side of [-1, 1]) {
    fill(c, gradient(c, side * 60, -12, side * 85, 34, '#cc1f32', '#851220', '#4a0a12'), () => {
      c.moveTo(side * 50, -4);
      c.lineTo(side * 142, 6);
      c.lineTo(side * 132, 24);
      c.lineTo(side * 40, 18);
    }, 2.4);

    fill(c, '#f5faff', () => {
      c.moveTo(side * 75, 0); c.lineTo(side * 115, 6); c.lineTo(side * 105, 14); c.lineTo(side * 70, 8);
    }, 1.2);

    const wingGlow = (time * 0.15 + side) % 2 < 1;
    ellipse(c, side * 138, 14, 3, 3, restored ? (wingGlow ? CYAN : '#14364a') : '#ff4d66', 0, 1);
  }

  for (const side of [-1, 1]) {
    const ex = side * 54, ey = 14;
    fill(c, gradient(c, ex - 12, ey - 10, 24, 20, '#4b6e85', '#203947', '#0f1d26'), () => {
      roundRect(c, ex - 10, ey - 8, 20, 18, 4);
    }, 2);
    ellipse(c, ex, ey + 10, 8, 4, parts >= 1 ? CYAN : '#162b3a', 0, 1.6);

    if (restored && !reduced) {
      c.save();
      const flameLen = 42 + Math.sin(time * 0.4 + side * 2) * 12;
      fill(c, gradient(c, ex - 14, ey + 10, 28, flameLen, 'rgba(179,140,255,0.85)', 'rgba(103,221,255,0.4)', 'rgba(103,221,255,0)'), () => {
        c.moveTo(ex - 8, ey + 10);
        c.quadraticCurveTo(ex - 12, ey + flameLen * 0.6, ex, ey + flameLen);
        c.quadraticCurveTo(ex + 12, ey + flameLen * 0.6, ex + 8, ey + flameLen);
        c.lineTo(ex + 8, ey + 10);
      }, 0);
      fill(c, gradient(c, ex - 6, ey + 10, 12, flameLen * 0.65, '#ffffff', CYAN, 'rgba(103,221,255,0)'), () => {
        c.moveTo(ex - 4, ey + 10);
        c.lineTo(ex, ey + flameLen * 0.65);
        c.lineTo(ex + 4, ey + 10);
      }, 0);
      c.restore();
    }
  }

  fill(c, gradient(c, -86, -32, 172, 60, '#ff475a', '#d91e32', '#7a0a18'), () => {
    c.moveTo(0, -32);
    c.bezierCurveTo(58, -30, 94, -8, 86, 20);
    c.quadraticCurveTo(46, 26, 0, 26);
    c.quadraticCurveTo(-46, 26, -86, 20);
    c.bezierCurveTo(-94, -8, -58, -30, 0, -32);
  }, 2.8);

  stroke(c, '#ff7a8a', 2, () => {
    c.moveTo(0, -30); c.lineTo(0, 22);
  });

  fill(c, gradient(c, -38, -44, 76, 32, '#8fe9ff', '#276885', '#102d3d'), () => {
    c.moveTo(-32, -10);
    c.bezierCurveTo(-30, -36, 30, -36, 32, -10);
    c.quadraticCurveTo(0, -4, -32, -10);
  }, 2.4);
  stroke(c, '#ffffff', 2.2, () => {
    c.moveTo(-16, -30); c.lineTo(-8, -14);
    c.moveTo(4, -32); c.lineTo(16, -14);
  });
  fill(c, 'rgba(103,221,255,0.7)', () => {
    c.ellipse(0, -14, 8, 4, 0, 0, TAU);
  }, 0);

  const sockets = [
    { x: -44, y: 8, label: 'REACTOR' },
    { x: 0, y: 12, label: 'PLASMA' },
    { x: 44, y: 8, label: 'NAV' }
  ];

  for (let i = 0; i < 3; i++) {
    const s = sockets[i], inst = parts > i;
    fill(c, inst ? '#11293a' : '#0a1721', () => c.ellipse(s.x, s.y, 14, 9, 0, 0, TAU), 1.6);
    if (inst) {
      ellipse(c, s.x, s.y, 10, 6, [CYAN, PURPLE, '#ffd260'][i], 0, 0);
      ellipse(c, s.x, s.y, 4, 2, '#ffffff', 0, 0);
      stroke(c, '#cff6ff', 1.4, () => c.ellipse(s.x, s.y, 13, 8, 0, 0, TAU));
    } else {
      stroke(c, '#ff5972', 1.5, () => {
        c.moveTo(s.x - 6, s.y - 2); c.lineTo(s.x - 2, s.y + 4);
        c.moveTo(s.x + 2, s.y - 3); c.lineTo(s.x + 6, s.y + 3);
      });
    }
  }

  const bannerY = -66;
  fill(c, restored ? 'rgba(10,36,46,0.92)' : 'rgba(12,25,38,0.92)', () => {
    roundRect(c, -120, bannerY - 18, 240, 36, 6);
  }, 2);
  stroke(c, restored ? '#67ddff' : '#4d7591', 1.8, () => {
    roundRect(c, -120, bannerY - 18, 240, 36, 6);
  });

  c.textAlign = 'center';
  c.font = '900 12px Outfit, sans-serif';
  c.fillStyle = restored ? '#a8f5ff' : '#e0f4ff';
  c.fillText(
    restored
      ? '¡CRUCERO ESTELAR RESTAURADO!'
      : 'CRUCERO DE STITCH · MÓDULOS ' + parts + '/3',
    0, bannerY - 2
  );

  c.font = '800 10px Outfit, sans-serif';
  c.fillStyle = restored ? '#6ef5b8' : '#7ec3eb';
  c.fillText(
    restored
      ? 'HIPERMOTOR ACTIVO · VENCE AL NÚCLEO EN LA BAHÍA'
      : 'RECUPERA LOS 3 MÓDULOS EN LOS TALLERES',
    0, bannerY + 11
  );

  c.restore();
}

export function drawStitchoMaintenanceRail(c, rail, done, t=0, rolling=false, reduced=false){
  const time = reduced ? 0 : t;
  const left = rail.left, right = rail.right, y = rail.y, w = right - left;

  c.save();
  c.lineJoin = 'round'; c.lineCap = 'round';

  fill(c, '#102230', () => {
    c.rect(left - 30, y - 6, w + 60, 8);
  }, 1.8);

  for (let rx = left - 20; rx <= right + 20; rx += 24) {
    fill(c, '#1d384d', () => c.rect(rx - 4, y - 8, 8, 12), 1.2);
    ellipse(c, rx, y - 2, 2, 2, '#4d7b99', 0, 0);
  }

  const railColor = done ? '#68f0b0' : CYAN;
  for (const dy of [-5, 1]) {
    stroke(c, INK, 3.8, () => { c.moveTo(left - 26, y + dy); c.lineTo(right + 26, y + dy); });
    stroke(c, railColor, 2.4, () => { c.moveTo(left - 26, y + dy); c.lineTo(right + 26, y + dy); });
  }

  if (!reduced) {
    const shift = (time * 1.5) % 36;
    for (let cx = left + shift; cx < right; cx += 36) {
      stroke(c, done ? '#9effd6' : '#d2f6ff', 2, () => {
        c.moveTo(cx - 5, y - 6); c.lineTo(cx, y - 2); c.lineTo(cx - 5, y + 2);
      });
    }
  }

  const archX = left - 18;
  fill(c, gradient(c, archX - 16, y - 84, 32, 84, '#38617d', '#1d394d', '#0f2230'), () => {
    c.moveTo(archX - 14, y);
    c.lineTo(archX - 14, y - 76);
    c.lineTo(archX + 14, y - 76);
    c.lineTo(archX + 14, y);
    c.lineTo(archX + 6, y);
    c.lineTo(archX + 6, y - 64);
    c.lineTo(archX - 6, y - 64);
    c.lineTo(archX - 6, y);
    c.closePath();
  }, 2.2);

  fill(c, done ? 'rgba(12,42,36,0.92)' : 'rgba(10,28,44,0.92)', () => {
    roundRect(c, archX - 60, y - 116, 150, 36, 6);
  }, 2);
  stroke(c, done ? '#68f0b0' : CYAN, 1.8, () => {
    roundRect(c, archX - 60, y - 116, 150, 36, 6);
  });

  c.textAlign = 'center';
  c.font = '900 11px Outfit, sans-serif';
  c.fillStyle = done ? '#9effd6' : '#cff5ff';
  c.fillText(done ? 'CIRCUITO DE RAÍL ACTIVO ✓' : 'RAÍL DE MANTENIMIENTO', archX + 15, y - 100);

  c.font = '800 10px Outfit, sans-serif';
  c.fillStyle = done ? '#68f0b0' : '#8cedff';
  c.fillText(done ? 'Tracción y velocidad en línea' : 'PULSA K · RUEDA HACIA LA DERECHA', archX + 15, y - 87);

  const beaconX = right + 18;
  fill(c, '#183447', () => {
    c.moveTo(beaconX - 10, y); c.lineTo(beaconX - 6, y - 44); c.lineTo(beaconX + 6, y - 44); c.lineTo(beaconX + 10, y);
  }, 2);
  ellipse(c, beaconX, y - 46, 7, 7, done ? '#68f0b0' : '#ffd766', 0, 1.4);
  ellipse(c, beaconX, y - 46, 3, 3, '#ffffff', 0, 0);

  if (rolling && !reduced) {
    for (let k = 0; k < 5; k++) {
      const sx = left + ((time * 7 + k * 67) % w);
      stroke(c, '#ffffff', 1.8, () => {
        c.moveTo(sx, y - 4); c.lineTo(sx + (Math.sin(k) * 6), y - 10);
      });
      ellipse(c, sx, y - 4, 2, 2, CYAN, 0, 0);
    }
  }

  c.restore();
}
