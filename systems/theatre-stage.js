// Code-painted stage for the opening and the hero selection. Scenery is
// baked once per size/hero (three bounded plates), actors remain real rigs.
import {drawChapterVista} from '../worlds/chapter-vistas.js';
const TAU=Math.PI*2,plates=new WeakMap();
const themes={kilo:['#455d79','#f4d8a1','#719e86'],stitcho:['#172d54','#c8b4e2','#477d91'],chispin:['#3c527d','#f7dc9d','#7c9db0'],cat:['#414878','#dfbed6','#8395b0'],cuerno:['#285b61','#e5d6ac','#779e8a'],dragon:['#543c64','#efbe90','#996d79'],dino:['#4c645c','#e9d4a3','#889b78'],frita:['#71586c','#f6d6a2','#b49798'],pizza:['#465c79','#f4cdad','#aa8d89'],yomi:['#325571','#d8e3c5','#72a6ae']};
function path(c,fill,fn,stroke=null,w=1){c.beginPath();fn();c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function line(c,col,w,fn){c.beginPath();fn();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,col,a=0){c.beginPath();c.ellipse(x,y,rx,ry,a,0,TAU);c.fillStyle=col;c.fill();}
function glow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function terrace(c,x,y,w,H,col){
 const g=c.createLinearGradient(0,y,0,y+60);g.addColorStop(0,'#a7b6a7');g.addColorStop(.15,col);g.addColorStop(1,'#26394c');
 path(c,g,()=>{c.moveTo(x-w/2,y);c.quadraticCurveTo(x,y-16,x+w/2,y);c.lineTo(x+w/2,y+24);c.quadraticCurveTo(x,y+14,x-w/2,y+25);},'#cbd5b6',1.4);
 for(const side of [-1,1]){const xx=x+side*w*.37;path(c,'#344a58',()=>{c.moveTo(xx-6,y+24);c.lineTo(xx+8,y+21);c.lineTo(xx+13,H);c.lineTo(xx-14,H);});line(c,'#b2bba366',1,()=>{c.moveTo(xx+4,y+34);c.lineTo(xx+7,H);});}
 for(let k=0;k<6;k++)line(c,'#1a314955',1,()=>{const xx=x-w*.4+k*w*.15;c.moveTo(xx,y+4);c.lineTo(xx-5,y+17);});
}
function paint(c,W,H,hero,opening){
 const [sky,light,stone]=themes[hero]||themes.kilo;const floor=H*(opening?(W<760?.60:.80):.65),g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,sky);g.addColorStop(.6,'#8da5aa');g.addColorStop(1,'#d6c4a1');c.fillStyle=g;c.fillRect(0,0,W,H);
 glow(c,W*.67,H*.25,H*.6,light+'bb');
 // Layered cloud valleys and distant inhabited spires, never polygon mountains.
 for(let layer=0;layer<4;layer++){
  path(c,['#a0b4b366','#718f9c77','#57788c88','#45687c99'][layer],()=>{c.moveTo(-50,H);c.lineTo(-50,H*(.43+layer*.085));for(let i=0;i<7;i++){const x=i*W/5;c.bezierCurveTo(x-W*.09,H*(.23+layer*.09),x+W*.04,H*(.57+layer*.065),x+W*.2,H*(.4+layer*.09));}c.lineTo(W+50,H);});
 }
 for(let i=0;i<12;i++){const x=W*(.03+i*.09),base=H*(.5+(i%3)*.025),h=H*(.08+(i%4)*.02);c.fillStyle='#4e6f8399';c.fillRect(x,base-h,W*.018,h);path(c,'#b8c6b980',()=>{c.moveTo(x-W*.006,base-h);c.quadraticCurveTo(x+W*.009,base-h-H*.025,x+W*.025,base-h);});for(let j=0;j<3;j++)oval(c,x+W*.009,base-h*.8+j*h*.23,1.2,2.5,light);}
 // Real chapter landmark silhouettes live in the open arch behind the hero.
 c.save();c.globalAlpha=.8;drawChapterVista(c,{roomDef:{hero,composition:true}},{x:360,y:0},0,W,H);c.restore();
 // Observatory architecture: carved, weathered pillars frame the valley.
 const archX=W*(opening?.67:.5),archY=floor-H*.04,aw=W*(opening?.33:.36),ah=H*.65;
 for(const side of [-1,1]){
  const x=archX+side*aw*.5;
  const pg=c.createLinearGradient(x-24,0,x+25,0);pg.addColorStop(0,'#273e55');pg.addColorStop(.45,'#729395');pg.addColorStop(.7,'#a9b8a1');pg.addColorStop(1,'#3b596c');
  path(c,pg,()=>{c.moveTo(x-19,archY+60);c.bezierCurveTo(x-25,archY-ah*.3,x-15,archY-ah*.8,archX,archY-ah);c.bezierCurveTo(x+25,archY-ah*.7,x+22,archY-ah*.25,x+28,archY+60);},'#d9d2ac80',2);
  for(let k=0;k<11;k++){const yy=archY-k*ah*.065;line(c,'#1b35444d',1.4,()=>{c.moveTo(x-15,yy);c.lineTo(x+18,yy-3);});}
  for(let k=0;k<5;k++){const yy=archY-ah*.2-k*ah*.105;line(c,light+'bb',1,()=>{c.moveTo(x-5,yy);c.quadraticCurveTo(x+side*8,yy-12,x+4,yy-24);});}
 }
 // Rooted canopy and ornamental leaves, with visible midribs and branching.
 for(const side of [-1,1]){
  const rootX=side<0?-W*.035:W*1.02;
  path(c,'#223d4b',()=>{c.moveTo(rootX-24,H);c.bezierCurveTo(rootX+side*25,H*.55,rootX-side*85,H*.15,rootX-side*W*.27,-20);c.lineTo(rootX-side*W*.2,-30);c.bezierCurveTo(rootX-side*45,H*.32,rootX+38,H*.7,rootX+45,H);});
  for(let i=0;i<17;i++){const x=rootX-side*(W*.025+i*W*.012),y=H*.08+Math.sin(i*.25)*H*.17;line(c,'#678b82',2,()=>{c.moveTo(rootX-side*W*.02,H*.5);c.quadraticCurveTo(x+side*30,y+30,x,y);});
   c.save();c.translate(x,y);c.rotate(side*(.2+i*.045));path(c,i%3?stone:'#adc1a0',()=>{c.moveTo(-28,0);c.bezierCurveTo(-12,-15,20,-22,35,0);c.bezierCurveTo(10,18,-13,12,-28,0);});line(c,'#e3dfb580',.8,()=>{c.moveTo(-23,0);c.lineTo(28,0);});c.restore();}
 }
 if(opening){for(const [x,y,w] of (W<760?[[.2,.46,.36],[.77,.39,.32],[.3,.34,.32]]:[[.19,.66,.32],[.83,.52,.27],[.43,.49,.25]]))terrace(c,x*W,y*H,w*W,floor+H*.1,stone);}
 // Continuous foreground promenade, carved in perspective and rooted to ground.
 const fg=c.createLinearGradient(0,floor-25,0,H);fg.addColorStop(0,'#c8c5a8');fg.addColorStop(.06,'#788d87');fg.addColorStop(.13,'#334f62');fg.addColorStop(1,'#152638');
 path(c,fg,()=>{c.moveTo(-20,floor);c.bezierCurveTo(W*.25,floor-35,W*.7,floor-30,W+20,floor-4);c.lineTo(W+20,H+20);c.lineTo(-20,H+20);});
 line(c,'#f6e3b4',2,()=>{c.moveTo(0,floor);c.bezierCurveTo(W*.25,floor-35,W*.7,floor-30,W,floor-4);});
 for(let i=0;i<22;i++){const x=i*W/20;line(c,'#99aa9b33',1,()=>{c.moveTo(x,floor+8);c.lineTo(W*.5+(x-W*.5)*1.6,H);});}
 for(let i=0;i<55;i++){const x=((i*719)%997)/997*W,y=floor+8+((i*229)%991)/991*(H-floor);line(c,'#c9d1b51f',1,()=>{c.moveTo(x,y);c.lineTo(x+5+i%11,y-1);});}
 // Hanging lanterns, metal fittings and warm lenses, all baked once.
 for(const side of [-1,1]){const x=archX+side*aw*.38,y=H*.29;line(c,'#cfbd8d',2,()=>{c.moveTo(x,H*.08);c.lineTo(x,y);});glow(c,x,y+12,H*.10,light+'55');oval(c,x,y+12,8,17,'#2b4255');oval(c,x,y+12,5,13,light);line(c,'#f6e0a7',1,()=>{c.moveTo(x-8,y);c.lineTo(x+8,y);});}
}
export function drawTheatreStage(ctx,W,H,hero='kilo',t=0,{opening=false,reduceMotion=false}={}){
 let map=plates.get(ctx);if(!map)plates.set(ctx,map=new Map());const key=[Math.round(W),Math.round(H),hero,opening].join(':');let plate=map.get(key);
 if(!plate&&typeof OffscreenCanvas!=='undefined'){plate=new OffscreenCanvas(Math.ceil(W),Math.ceil(H));paint(plate.getContext('2d'),W,H,hero,opening);if(map.size>=3)map.delete(map.keys().next().value);map.set(key,plate);}
 if(plate)ctx.drawImage(plate,0,0,W,H);else paint(ctx,W,H,hero,opening);
 ctx.save();for(let i=0;i<13;i++){const at=reduceMotion?0:t;const x=((i*173+at*.11)%(W+80))-40,y=H*(.18+(i%5)*.11)+Math.sin(at*.012+i)*6;ctx.globalAlpha=.17;oval(ctx,x,y,3,1.2,i%3?'#fff0bf':'#b9f2d1',i*.7);}ctx.restore();
}
export function openingCastSpot(id,W,H,direction=null){
 const compact=W<760;
 const slots={kilo:[.50,.83],stitcho:[.66,.81],chispin:[.80,.84],cat:[.34,.81],cuerno:[.88,.94],dragon:[.22,.80],dino:[.12,.94],frita:[.58,.87],pizza:[.74,.87],yomi:[.42,.94]};
 const mobile={kilo:[.50,.59],stitcho:[.68,.56],chispin:[.84,.64],cat:[.32,.55],cuerno:[.18,.70],dragon:[.76,.53],dino:[.12,.69],frita:[.42,.60],pizza:[.58,.62],yomi:[.86,.70]};
 let [x,y]=(compact?mobile:slots)[id]||[.5,.6];
 const hero=direction?.hero,partner=direction?.partner;
 if(hero&&id===hero){x=compact?.62:.50;y=compact?.61:.85;}
 else if(partner&&id===partner){x=compact?.30:.66;y=compact?.65:.90;}
 const isHero=hero&&id===hero,isPartner=partner&&id===partner;
 return {x:x*W,foot:y*H,slotWidth:W*(isHero?(compact?.34:.22):isPartner?(compact?.26:.18):compact?.14:.11),row:y<.6?0:y<.7?1:2};
}
export function openingHeroHeight(id,base,direction=null){if(!direction?.hero)return base*.92;return base*(id===direction.hero?1.85:id===direction.partner?1.15:.62);}
