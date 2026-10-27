// Authored Canvas landscapes. No image loading, URLs or baked scene assets.
// Three independently scrolling, code-painted layers are cached as canvases;
// wind, water, machinery and atmosphere remain live. No gameplay state is read.
const TAU=Math.PI*2,TILE=1800,HEIGHT=900,cache=new Map();
let paper=null;
export const REALM_STYLES=Object.freeze({
 stitcho:{sky:['#09182e','#24495f','#85b5b7'],stone:'#335566',light:'#7ef6dc',leaf:'#318d86',mist:'#a7e1d2',theme:'tidal-workshop'},
 chispin:{sky:['#477fbe','#bbdfef','#fff0c8'],stone:'#819cb4',light:'#ffe4a1',leaf:'#78adba',mist:'#f5f4df',theme:'storm-aqueduct'},
 cat:{sky:['#39395f','#b09bbd','#f2d5d2'],stone:'#766984',light:'#ffe6df',leaf:'#af89ba',mist:'#e7c8dc',theme:'moon-garden'},
 cuerno:{sky:['#61aab6','#cbe8cd','#fff0c7'],stone:'#719c8e',light:'#ffeaba',leaf:'#5a9b87',mist:'#e3eed3',theme:'prism-forest'},
 dragon:{sky:['#4b426b','#d28a88','#ffcf9f'],stone:'#644b61',light:'#ffb574',leaf:'#885e73',mist:'#efbca1',theme:'ember-cordillera'},
 dino:{sky:['#649cab','#c6d7b0','#ffe6a8'],stone:'#668a7e',light:'#ffe9a4',leaf:'#467f65',mist:'#dce3b7',theme:'ancient-valley'},
 frita:{sky:['#7699b8','#efc8b0','#fff0c5'],stone:'#a47b76',light:'#ffe4a0',leaf:'#8f9b75',mist:'#f6dec0',theme:'steam-market'},
 pizza:{sky:['#5d9db8','#d9dcb5','#ffe2af'],stone:'#a1766a',light:'#ffe7b3',leaf:'#658c67',mist:'#f5d9b6',theme:'terraced-oven-city'},
 yomi:{sky:['#172d53','#776f9e','#e6bbba'],stone:'#5c668b',light:'#c4f0df',leaf:'#658f9a',mist:'#babbd5',theme:'celestial-archive'},
 final:{sky:['#304d77','#b29bae','#ffd5a0'],stone:'#738d91',light:'#ffe9ae',leaf:'#5e8e80',mist:'#e4cfb5',theme:'family-observatory'}
});
const noise=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const mod=(n,d)=>((n%d)+d)%d;
function tone(hex,n){return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+n)).toString(16).padStart(2,'0')).join('')+hex.slice(7);}

function path(c,color,fn,stroke=null,width=1){c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,color,width,fn){c.beginPath();fn();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);c.fillStyle=color;c.fill();}
function gradient(c,x,y,x2,y2,stops){const g=c.createLinearGradient(x,y,x2,y2);for(const [at,color] of stops)g.addColorStop(at,color);return g;}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function cloud(c,x,y,w,h,color){
 const fill=gradient(c,x,y-h*1.2,x,y+h*.4,[[0,tone(color,22)],[.48,color],[1,tone(color,-25)]]);
 path(c,fill,()=>{c.moveTo(x-w,y);c.bezierCurveTo(x-w*1.08,y-h*.55,x-w*.6,y-h*.95,x-w*.36,y-h*.48);c.bezierCurveTo(x-w*.4,y-h*1.6,x+w*.5,y-h*1.6,x+w*.46,y-h*.45);c.bezierCurveTo(x+w*.95,y-h*.9,x+w*1.2,y-h*.05,x+w*.75,y+h*.2);c.bezierCurveTo(x+w*.3,y+h*.5,x-w*.9,y+h*.45,x-w,y);});
 line(c,tone(color,34),.8,()=>{c.moveTo(x-w*.8,y-h*.14);c.bezierCurveTo(x-w*.7,y-h*.53,x-w*.5,y-h*.7,x-w*.37,y-h*.48);c.moveTo(x-w*.27,y-h*.62);c.bezierCurveTo(x-w*.11,y-h*1.12,x+w*.23,y-h*1.1,x+w*.35,y-h*.65);});
}
function ridge(c,y,h,color,seed){path(c,color,()=>{c.moveTo(-30,HEIGHT);c.lineTo(-30,y);for(let i=-1;i<9;i++){const x=i*225,peak=y-h*(.25+noise(mod(i,8),seed)*.8);c.bezierCurveTo(x+61,y-h*.15,x+117,peak,x+225,y-h*.08);}c.lineTo(TILE+30,HEIGHT);});}
function cliff(c,x,y,w,h,p){
 path(c,gradient(c,x-w,y,x+w,y+h,[[0,p.stone],[.65,'#304558'],[1,'#253849']]),()=>{c.moveTo(x-w,y);c.bezierCurveTo(x-w*.7,y-22,x+w*.5,y-38,x+w,y);c.bezierCurveTo(x+w*.7,y+h*.35,x+w*.15,y+h*.6,x-w*.12,y+h);c.bezierCurveTo(x-w*.35,y+h*.58,x-w*.85,y+h*.45,x-w,y);});
 line(c,p.mist+'99',3,()=>{c.moveTo(x-w,y);c.quadraticCurveTo(x,y-22,x+w,y);});
 path(c,p.leaf,()=>{c.moveTo(x-w,y-2);c.quadraticCurveTo(x,y-28,x+w,y-3);c.lineTo(x+w*.78,y+10);c.quadraticCurveTo(x+w*.5,y+3,x+w*.25,y+17);c.quadraticCurveTo(x-w*.3,y-1,x-w*.72,y+13);});
 for(let j=0;j<22;j++){const xx=x+(noise(j,4)*2-1)*w*.86,yy=y+18+noise(j,6)*h*.5;line(c,j%2?'#cfceb533':'#162f4544',1,()=>{c.moveTo(xx,yy);c.lineTo(xx+8+noise(j)*22,yy-3);});}
 for(let j=0;j<5;j++){const xx=x-w*.7+j*w*.3;line(c,p.leaf+'bb',2,()=>{c.moveTo(xx,y+7);c.bezierCurveTo(xx+12,y+30,xx-10,y+48,xx+7,y+72+noise(j)*25);});}

 for(let i=0;i<9;i++){const xx=x-w*.8+i*w*.18;line(c,'#152f4430',2,()=>{c.moveTo(xx,y+8);c.bezierCurveTo(xx-14,y+h*.2,xx+24,y+h*.45,x-w*.12,y+h*.83);});}
}
function arch(c,x,y,w,h,p){
 for(const side of [-1,1]){
  const xx=x+side*w;path(c,gradient(c,xx-17,0,xx+22,0,[[0,'#354c63'],[.5,p.stone],[.8,p.mist],[1,p.stone]]),()=>{c.moveTo(xx-19,y);c.lineTo(xx-14,y-h*.58);c.bezierCurveTo(xx-16,y-h*.8,x+side*w*.48,y-h,x,y-h);c.bezierCurveTo(x+side*w*.7,y-h*.89,xx+21,y-h*.7,xx+19,y);});
  for(let k=0;k<8;k++)line(c,'#233c4b55',1.4,()=>{const yy=y-k*h*.075;c.moveTo(xx-13,yy);c.lineTo(xx+15,yy-2);});
  c.fillStyle=p.mist;c.fillRect(xx-25,y-10,50,12);
 }
 line(c,p.light+'aa',2,()=>{c.moveTo(x-w+8,y-h*.55);c.bezierCurveTo(x-w,y-h*.88,x+w,y-h*.88,x+w-8,y-h*.55);});
}
function spire(c,x,y,s,p,kind='dome'){
 c.save();c.translate(x,y);c.scale(s,s);
 path(c,gradient(c,-34,0,39,0,[[0,'#2d455b'],[.45,p.stone],[.7,p.mist],[1,p.stone]]),()=>{c.moveTo(-36,0);c.lineTo(-27,-164);c.quadraticCurveTo(0,-183,29,-164);c.lineTo(38,0);});
 if(kind==='antenna'){line(c,p.mist,6,()=>{c.moveTo(0,-170);c.lineTo(0,-270);});for(let j=0;j<3;j++)line(c,p.light+'aa',3,()=>{c.ellipse(0,-197-j*25,42-j*7,9,0,0,TAU);});}
 else path(c,p.light+'bb',()=>{c.moveTo(-39,-165);c.bezierCurveTo(-35,-218,34,-218,39,-165);});
 for(let k=0;k<4;k++)for(const side of [-1,1]){const xx=side*14,yy=-140+k*30;path(c,'#20394b',()=>{c.moveTo(xx-5,yy+13);c.lineTo(xx-5,yy);c.quadraticCurveTo(xx,yy-8,xx+5,yy);c.lineTo(xx+5,yy+13);});line(c,p.light,1,()=>{c.moveTo(xx-3,yy+10);c.lineTo(xx-3,yy);});}
 for(let k=0;k<5;k++)line(c,'#253b4844',1,()=>{c.moveTo(-30,-18-k*28);c.lineTo(31,-20-k*28);});
 c.restore();
}
function tree(c,x,y,s,p,kind='broad'){
 c.save();c.translate(x,y);c.scale(s,s);
 const trunk=gradient(c,-25,0,35,0,[[0,'#253f49'],[.6,p.stone],[1,'#b5b49a']]);
 path(c,trunk,()=>{c.moveTo(-35,20);c.bezierCurveTo(-17,-90,-37,-198,-6,-280);c.bezierCurveTo(-10,-190,27,-120,37,20);c.quadraticCurveTo(3,0,-35,20);});
 for(const side of [-1,1])for(let j=0;j<3;j++)line(c,p.stone,12-j*2,()=>{c.moveTo(0,-105-j*38);c.bezierCurveTo(side*45,-135-j*45,side*85,-215-j*34,side*(110+j*9),-215-j*35);});
 if(kind==='fern'){
  for(let i=0;i<10;i++){const a=-Math.PI+i*Math.PI/9;line(c,p.leaf,5,()=>{c.moveTo(0,-260);c.quadraticCurveTo(Math.cos(a)*120,-300+Math.sin(a)*95,Math.cos(a)*210,-245+Math.sin(a)*100);});for(let j=1;j<10;j++){const xx=Math.cos(a)*j*20,yy=-260+Math.sin(a)*j*10;oval(c,xx,yy,24,6,j%2?p.leaf:p.mist,a+.4);}}
 }else{
  for(let i=0;i<21;i++){const a=i*2.399,r=35+Math.sqrt(i)*29,xx=Math.cos(a)*r,yy=-278+Math.sin(a)*r*.44;cloud(c,xx,yy,43+noise(i)*19,25+noise(i,4)*20,i%7===0?tone(p.leaf,32):i%3===0?tone(p.leaf,-17):p.leaf);}
  for(let i=0;i<95;i++){const xx=(noise(i,5)-.5)*290,yy=-289+(noise(i,9)-.5)*130,a=noise(i,2)*2-1;oval(c,xx,yy,3+noise(i)*5,1.6,i%4===0?p.light+'99':tone(p.leaf,i%2?28:-28),a);if(i%4===0)line(c,p.mist+'66',.5,()=>{c.moveTo(xx-3,yy);c.lineTo(xx+3,yy-1);});}
 for(let i=0;i<9;i++){const xx=(noise(i,7)-.5)*180;line(c,p.leaf+'88',1,()=>{c.moveTo(xx,-230);c.bezierCurveTo(xx+12,-199,xx-9,-175,xx+4,-145-noise(i)*40);});}
 }
 for(let i=0;i<7;i++)line(c,'#d5cba544',1.2,()=>{const xx=-14+i*5;c.moveTo(xx,0);c.bezierCurveTo(xx-18,-80,xx+9,-130,xx-4,-190);});
 c.restore();
}
function waterfall(c,x,y,w,h,p){
 c.fillStyle=gradient(c,x-w,y,x+w,y,[[0,p.light+'00'],[.25,p.mist+'99'],[.5,'#f0fff1bb'],[.7,p.light+'77'],[1,p.light+'00']]);c.fillRect(x-w,y,w*2,h);
 for(let i=0;i<9;i++)line(c,'#f2ffec66',1,()=>{const xx=x-w+i*w/4;c.moveTo(xx,y);c.bezierCurveTo(xx-3,y+h*.3,xx+4,y+h*.7,xx+9,y+h);});
 cloud(c,x,y+h,w*2,15,p.mist+'55');
}
function house(c,x,y,s,p,roof='#bd766b'){
 c.save();c.translate(x,y);c.scale(s,s);
 path(c,gradient(c,-45,-70,45,0,[[0,tone(p.mist,-22)],[.65,p.mist],[1,tone(p.mist,-35)]]),()=>{c.moveTo(-45,0);c.lineTo(-45,-79);c.quadraticCurveTo(0,-98,45,-79);c.lineTo(45,0);});
 path(c,gradient(c,0,-123,0,-72,[[0,tone(roof,26)],[.62,roof],[1,tone(roof,-25)]]),()=>{c.moveTo(-58,-75);c.bezierCurveTo(-40,-127,35,-123,58,-75);c.quadraticCurveTo(0,-93,-58,-75);},'#493f50',2);
 for(let j=0;j<7;j++)line(c,'#f3d6a466',2,()=>{const xx=-44+j*14;c.moveTo(xx,-84);c.lineTo(xx*.67,-108);});
 path(c,'#374754',()=>{c.moveTo(-12,0);c.lineTo(-12,-37);c.quadraticCurveTo(0,-54,12,-37);c.lineTo(12,0);});
 for(const side of [-1,1]){c.fillStyle='#536c71';c.fillRect(side*28-6,-61,12,20);c.fillStyle=p.light;c.fillRect(side*28-4,-59,3,16);}
 for(let k=0;k<5;k++)line(c,'#7b796733',.7,()=>{c.moveTo(-42,-12-k*12);c.lineTo(-27,-14-k*12);c.moveTo(19,-9-k*12);c.lineTo(41,-10-k*12);});
 line(c,'#f4dfbb',3,()=>{c.moveTo(-16,0);c.lineTo(-16,-38);c.quadraticCurveTo(0,-61,16,-38);c.lineTo(16,0);});
 c.fillStyle=tone(p.stone,-8);c.fillRect(25,-117,13,30);c.fillStyle=p.mist;c.fillRect(22,-120,19,5);
 line(c,'#5b696b',2,()=>{c.moveTo(-44,-35);c.lineTo(-20,-35);c.moveTo(-44,-35);c.lineTo(-44,-25);});
 c.fillStyle='#4f7665';c.fillRect(-44,-10,21,9);for(let j=0;j<5;j++)oval(c,-43+j*5,-11,4,6,p.leaf,-.4);
 c.restore();
}
function celestialRing(c,x,y,r,p){
 for(let j=0;j<3;j++)line(c,j===1?p.light:p.mist,2+j,()=>c.ellipse(x,y,r*(1-j*.12),r*(.28+j*.21),-.35+j*.5,0,TAU));
 for(let i=0;i<12;i++){const a=i*TAU/12;oval(c,x+Math.cos(a)*r,y+Math.sin(a)*r,3,5,p.light,a);}
}
function paintFar(c,hero,p){
 for(let layer=0;layer<3;layer++)ridge(c,520+layer*65,100+layer*40,[p.mist+'55',p.stone+'77',p.stone+'bb'][layer],layer+hero.length);
 if(hero==='stitcho'){
  for(let i=0;i<8;i++){const x=120+i*255;cliff(c,x,665,140,110,p);spire(c,x,650,.55+noise(i)*.5,p,i%2?'dome':'antenna');}
 }else if(hero==='dragon'){
  for(let i=0;i<4;i++){const x=100+i*530;path(c,'#5a4c65',()=>{c.moveTo(x-250,650);c.bezierCurveTo(x-180,570,x-68,265,x-20,240);c.quadraticCurveTo(x+5,266,x+35,240);c.bezierCurveTo(x+105,370,x+130,540,x+260,650);});line(c,p.light,3,()=>{c.moveTo(x+5,260);c.bezierCurveTo(x-15,350,x+85,390,x+40,540);});}
 }else if(['chispin','yomi','final'].includes(hero)){
  for(let i=0;i<7;i++){const x=90+i*290;cliff(c,x,600+noise(i)*70,130,160,p);spire(c,x,595+noise(i)*70,.7+noise(i,1)*.7,p,hero==='chispin'?'antenna':'dome');}
 }else if(hero==='pizza'||hero==='frita'){
  // Inhabited terraces are rooted in visible land, never buildings in water.
  for(let i=0;i<13;i++){const x=50+i*155,y=590+Math.sin(i*.85)*45;path(c,tone(p.stone,22),()=>{c.moveTo(x-90,900);c.lineTo(x-90,y+20);c.quadraticCurveTo(x,y-5,x+90,y+20);c.lineTo(x+90,900);});}
  for(let i=0;i<13;i++){const x=50+i*155,y=590+Math.sin(i*.85)*45;house(c,x,y,.6+noise(i)*.35,p,hero==='pizza'?'#bc7360':'#c69a66');}

 }else{
  for(let i=0;i<10;i++)tree(c,60+i*205,690,.45+noise(i)*.4,p,hero==='dino'?'fern':'broad');
 }
}
function paintMiddle(c,hero,p){
 if(hero==='stitcho'){
  c.fillStyle=gradient(c,0,600,0,900,[[0,'#315c70'],[1,'#172f49']]);c.fillRect(0,635,TILE,265);
  for(let i=0;i<3;i++){const x=250+i*600;cliff(c,x,655,200,190,p);spire(c,x-65,647,1.3,p,'antenna');house(c,x+65,650,1.05,p,'#416f89');
   line(c,'#294653',11,()=>{c.moveTo(x+140,649);c.lineTo(x+140,360);c.lineTo(x+320,360);});line(c,'#bbac82',3,()=>{c.moveTo(x+147,372);c.lineTo(x+308,372);});
   line(c,p.light+'66',2,()=>{c.moveTo(x+20,550);c.bezierCurveTo(x-40,480,x+160,450,x+210,500);});
  }
 }else if(hero==='chispin'){
  for(let i=0;i<3;i++){const x=260+i*600;cliff(c,x,740,260,230,p);arch(c,x,720,150,350,p);spire(c,x+185,720,1.25,p,'antenna');
   line(c,p.mist,17,()=>{c.moveTo(x-290,637);c.quadraticCurveTo(x-190,601,x-140,635);});for(let j=0;j<4;j++)arch(c,x-290+j*60,715,24,82,p);
  }
 }else if(hero==='cat'){
  for(let i=0;i<3;i++){const x=240+i*650;tree(c,x-130,800,1.3,p);arch(c,x+80,770,94,240,p);
   oval(c,x+80,780,145,17,'#e0d1df77');for(let j=0;j<7;j++){const xx=x-90+j*48;line(c,'#626c85',5,()=>{c.moveTo(xx,825);c.quadraticCurveTo(xx-25,730,xx,685-j%3*24);});oval(c,xx,685-j%3*24,48,21,j%2?'#b5a3c6':'#e1bfd1');oval(c,xx,682-j%3*24,37,7,p.light+'99');}
  }
 }else if(hero==='cuerno'){
  for(let i=0;i<3;i++){const x=210+i*670;tree(c,x,830,1.22,p);cliff(c,x+195,740,126,200,p);waterfall(c,x+191,740,13,165,p);
   for(let j=0;j<4;j++)line(c,['#e4bbac88','#e7d39d88','#9ad1c988','#b6b0d388'][j],4,()=>{c.moveTo(x-140,730+j*5);c.bezierCurveTo(x-95,460+j*5,x+240,470+j*5,x+310,740+j*5);});
  }
 }else if(hero==='dragon'){
  for(let i=0;i<3;i++){const x=250+i*650;cliff(c,x,715,250,290,p);arch(c,x+60,700,80,170,p);
   for(let j=0;j<4;j++){line(c,'#ffbe7e99',5-j,()=>{const xx=x-130+j*60;c.moveTo(xx,723);c.bezierCurveTo(xx-18,760,xx+40,780,xx-5,870);});}
   for(let j=0;j<8;j++)path(c,j%2?'#6e5368':'#8c6876',()=>{const xx=x-220+j*58;c.moveTo(xx,730);c.lineTo(xx+3,650-noise(j)*80);c.quadraticCurveTo(xx+22,630-noise(j)*80,xx+36,730);});
  }
 }else if(hero==='dino'){
  for(let i=0;i<3;i++){const x=220+i*680;tree(c,x-110,835,1.5,p,'fern');cliff(c,x+210,690,160,210,p);waterfall(c,x+200,687,18,200,p);
   // Giant buried ribs, articulated bones and a fern-covered shoulder.
   for(let j=0;j<6;j++)line(c,'#d6d1ad',12-j*.7,()=>{const xx=x+j*36;c.moveTo(xx,813);c.bezierCurveTo(xx-40,743-j*8,xx+5,698-j*8,xx+36,735);});
   line(c,'#9dba98',9,()=>{c.moveTo(x-12,795);c.quadraticCurveTo(x+102,718,x+215,784);});
  }
 }else if(hero==='pizza'||hero==='frita'){
  const pizza=hero==='pizza';ridge(c,815,65,tone(p.stone,-16),8);
  for(let i=0;i<3;i++){const x=230+i*650;
   path(c,gradient(c,0,660,0,900,[[0,tone(p.stone,21)],[1,tone(p.stone,-16)]]),()=>{c.moveTo(x-330,900);c.lineTo(x-330,790);c.bezierCurveTo(x-210,660,x+180,660,x+330,790);c.lineTo(x+330,900);});for(let k=0;k<5;k++)line(c,p.mist+'66',2,()=>{const yy=770+k*24;c.moveTo(x-260,yy+22);c.quadraticCurveTo(x,yy-32,x+260,yy+22);});for(let j=0;j<4;j++)house(c,x-180+j*110,735-Math.sin(j*.9)*45,.9+noise(j)*.3,p,pizza?'#c57a62':'#d0a866');
   if(pizza){spire(c,x+20,705,1.2,p);path(c,'#d9b088',()=>{c.moveTo(x-90,775);c.lineTo(x-90,722);c.bezierCurveTo(x-88,647,x+86,647,x+90,722);c.lineTo(x+90,775);});oval(c,x,737,42,31,'#704a50');oval(c,x,743,31,19,'#ffc47a');}
   else{for(let j=0;j<3;j++){const xx=x-140+j*130;line(c,'#5a6870',3,()=>{c.moveTo(xx-45,795);c.lineTo(xx-45,687);c.moveTo(xx+45,795);c.lineTo(xx+45,687);});path(c,j%2?'#e9c293':'#b7747c',()=>{c.moveTo(xx-55,700);c.quadraticCurveTo(xx,665,xx+55,700);c.lineTo(xx+50,715);c.quadraticCurveTo(xx,690,xx-50,715);});for(let k=0;k<4;k++)oval(c,xx-28+k*18,769,7,9,p.light);}}
   tree(c,x+250,800,.65,p);
  }
 }else if(hero==='yomi'){
  for(let i=0;i<3;i++){const x=240+i*600;cliff(c,x,750,210,220,p);arch(c,x,735,120,355,p);celestialRing(c,x,430,105,p);spire(c,x-180,730,.9,p);spire(c,x+180,730,.9,p);
   for(let j=0;j<8;j++){const xx=x-99+j*27;path(c,j%2?'#b8d4c4':'#d9c6bd',()=>{c.moveTo(xx,659);c.lineTo(xx,600);c.quadraticCurveTo(xx+7,593,xx+15,600);c.lineTo(xx+15,660);});}
  }
 }else if(hero==='final'){
  for(let i=0;i<3;i++){const x=260+i*600;cliff(c,x,790,290,270,p);arch(c,x,760,185,485,p);celestialRing(c,x,410,133,p);
   for(let j=0;j<10;j++){const a=(j-4.5)*.18,xx=x+Math.sin(a)*170,yy=430-Math.cos(a)*170;oval(c,xx,yy,8,11,['#f5cc93','#8adcca','#e7c8dc','#d0bbf0','#e7dea1'][j%5],a);}
   for(let j=0;j<8;j++){c.fillStyle=j%2?'#9eaaa0':'#bbc5ad';c.fillRect(x-140-j*9,764+j*9,280+j*18,8);}
  }
 }
}
function paintSignature(c,hero,p){
 for(let i=0;i<2;i++){
  const x=450+i*1030,y=605;
  if(hero==='stitcho'){
   c.save();c.translate(x,y);c.rotate(-.18);
   path(c,gradient(c,-100,-30,90,30,[[0,'#6eafac'],[.45,'#b2d9c3'],[1,'#34556e']]),()=>{c.moveTo(-122,0);c.bezierCurveTo(-92,-55,98,-49,126,0);c.bezierCurveTo(78,50,-78,51,-122,0);},'#1e3f52',3);
   path(c,'#b7f9e3bb',()=>{c.moveTo(-65,-17);c.bezierCurveTo(-54,-105,67,-104,74,-17);c.quadraticCurveTo(0,6,-65,-17);},'#608f9c',3);
   for(let k=0;k<9;k++){const xx=-92+k*23;oval(c,xx,7,5,3,p.light);line(c,'#2c526455',1,()=>{c.moveTo(xx,15);c.lineTo(xx+3,26);});}
   for(const side of [-1,1]){path(c,'#38677b',()=>{c.moveTo(side*94,-5);c.quadraticCurveTo(side*169,-61,side*145,37);c.lineTo(side*96,23);});oval(c,side*105,18,12,6,'#72e6d0');}
   c.restore();line(c,p.light+'66',2,()=>{c.moveTo(x-10,y+50);c.quadraticCurveTo(x+20,y+90,x,y+120);});
  }else if(hero==='chispin'){
   line(c,'#aa8a67',5,()=>{c.moveTo(x,278);c.quadraticCurveTo(x-10,370,x,400);});
   glow(c,x,445,90,'#fff1bd55');oval(c,x,445,43,49,'#e8f2db');
   for(let j=0;j<3;j++)line(c,j%2?'#b88d5e':'#e2d2a0',4,()=>{c.ellipse(x,445,65,20+j*15,j*.7,0,TAU);});
   for(let j=0;j<6;j++){const a=j*TAU/6;path(c,'#9dbec4',()=>{c.moveTo(x+Math.cos(a)*60,445+Math.sin(a)*60);c.quadraticCurveTo(x+Math.cos(a+.3)*110,445+Math.sin(a+.3)*110,x+Math.cos(a+.5)*120,445+Math.sin(a+.5)*120);c.lineTo(x+Math.cos(a+.17)*76,445+Math.sin(a+.17)*76);});}
  }else if(hero==='cat'){
   oval(c,x,y+85,170,17,'#c5b8d97a');
   for(let j=0;j<9;j++){const a=-Math.PI+j*Math.PI/8;path(c,gradient(c,x,y-28,x,y+50,[[0,'#f2d4de'],[1,'#988bb6']]),()=>{c.moveTo(x,y+55);c.bezierCurveTo(x+Math.cos(a)*120,y+Math.sin(a)*90,x+Math.cos(a)*170,y-95+Math.sin(a)*45,x+Math.cos(a)*80,y+38);});}
   oval(c,x,y+40,34,10,p.light);for(let j=0;j<13;j++)line(c,p.light+'77',1,()=>{const xx=x-135+j*21;c.moveTo(xx,y+103);c.lineTo(xx+17,y+103);});
  }else if(hero==='cuerno'){
   for(let j=0;j<5;j++){const xx=x-70+j*34,yy=y+75,h=48+Math.sin(j*.9)*78;
    const colors=['#b6d2ec','#b8dbcb','#f4d8ba','#b7c6e8','#d7c1dc'];
    path(c,gradient(c,xx-12,0,xx+16,0,[[0,colors[j]],[.48,'#fff7d9'],[.5,colors[j]],[1,'#719d9b']]),()=>{c.moveTo(xx-15,yy);c.lineTo(xx-13,yy-h);c.lineTo(xx,yy-h-24);c.lineTo(xx+17,yy-h);c.lineTo(xx+19,yy);},'#5a8f9777');
    line(c,'#efffeccc',1,()=>{c.moveTo(xx,yy-h-20);c.lineTo(xx+3,yy-4);});
   }
   for(let j=0;j<7;j++)oval(c,x-96+j*29,y+85,18,5,p.leaf,-.2);
  }else if(hero==='dragon'){
   // A fossilised dragon gate, with carved wings rather than a generic spire.
   for(const side of [-1,1]){
    path(c,gradient(c,0,y-240,0,y+20,[[0,'#c8a394'],[1,'#795b6f']]),()=>{c.moveTo(x+side*30,y);c.bezierCurveTo(x+side*65,y-90,x+side*46,y-160,x+side*15,y-206);c.lineTo(x+side*52,y-253);c.bezierCurveTo(x+side*94,y-183,x+side*180,y-201,x+side*230,y-238);c.quadraticCurveTo(x+side*154,y-139,x+side*79,y-136);c.quadraticCurveTo(x+side*98,y-53,x+side*79,y+5);});
    for(let j=0;j<5;j++)line(c,'#493e5755',2,()=>{c.moveTo(x+side*63,y-163);c.quadraticCurveTo(x+side*(90+j*24),y-145-j*13,x+side*(106+j*26),y-175-j*14);});
   }
   glow(c,x,y-45,85,'#ffc37c44');line(c,'#ffcb9b',3,()=>{c.moveTo(x-11,y+40);c.quadraticCurveTo(x+20,y-50,x-2,y-124);});
  }else if(hero==='dino'){
   // An ancient egg sanctuary nestled among articulated fossil vertebrae.
   for(let j=0;j<11;j++){const xx=x-110+j*22,yy=y+63+Math.sin(j*.4)*13;oval(c,xx,yy,16,11,'#c1bb96',-.2);oval(c,xx,yy-4,5,3,'#e6dfbd');}
   c.save();c.translate(x,y+38);c.rotate(-.12);oval(c,0,-16,37,49,gradient(c,-35,-60,35,25,[[0,'#fff0cb'],[.7,'#d9cca0'],[1,'#92a487']]));for(let j=0;j<8;j++)oval(c,(noise(j)-.5)*48,-24+(noise(j,2)-.5)*62,4+noise(j)*3,5,'#9aa88a',j);c.restore();
  }else if(hero==='frita'||hero==='pizza'){
   const pizza=hero==='pizza';
   c.save();c.translate(x,y+70);
   if(pizza){
    path(c,gradient(c,-105,0,100,0,[[0,'#85594e'],[.5,'#d9a27c'],[1,'#8c6055']]),()=>{c.moveTo(-110,0);c.lineTo(-110,-50);c.bezierCurveTo(-103,-190,102,-190,110,-50);c.lineTo(110,0);});
    for(let ring=0;ring<4;ring++)line(c,ring%2?'#f3cca2':'#9c7060',3,()=>{c.ellipse(0,-30,51+ring*12,61+ring*16,0,Math.PI,TAU);});
    path(c,'#423c49',()=>{c.moveTo(-49,0);c.lineTo(-49,-31);c.bezierCurveTo(-46,-105,46,-105,49,-31);c.lineTo(49,0);});
    for(let j=0;j<7;j++)path(c,j%2?'#eaa563':'#ffe0a0',()=>{const xx=-34+j*10;c.moveTo(xx,0);c.quadraticCurveTo(xx-6,-28,xx+4,-42-j%3*7);c.quadraticCurveTo(xx+1,-15,xx+12,0);});
    for(let j=0;j<8;j++)line(c,'#5d655244',1,()=>{c.moveTo(-100+j*26,-41);c.lineTo(-100+j*26,-24);});
   }else{
    for(const side of [-1,1])line(c,'#674e55',8,()=>{c.moveTo(side*79,3);c.lineTo(side*79,-167);});
    for(let j=0;j<9;j++)path(c,j%2?'#f0d09b':'#b77678',()=>{const xx=-110+j*25;c.moveTo(xx,-152);c.quadraticCurveTo(xx+12,-176,xx+25,-152);c.lineTo(xx+25,-131);c.quadraticCurveTo(xx+12,-112,xx,-131);});
    path(c,'#6a7c79',()=>{c.moveTo(-61,-15);c.quadraticCurveTo(-84,-97,-55,-100);c.lineTo(55,-100);c.quadraticCurveTo(87,-90,61,-15);c.closePath();});oval(c,0,-99,58,12,'#e2cc9d');oval(c,0,-99,44,7,'#f2dc9b');
    for(let j=0;j<5;j++)oval(c,-37+j*18,-104,7,11,'#f9e9bd',-.4);
   }c.restore();
  }else if(hero==='yomi'||hero==='final'){
   // A suspended orrery with an engraved spine, pendulum and hanging ribbons.
   for(const side of [-1,1]){line(c,p.mist+'aa',2,()=>{c.moveTo(x+side*90,y-250);c.quadraticCurveTo(x+side*110,y-140,x+side*79,y-45);});path(c,side<0?'#aacbc0aa':'#b9b0d4aa',()=>{c.moveTo(x+side*80,y-40);c.quadraticCurveTo(x+side*92,y+5,x+side*65,y+53);c.lineTo(x+side*83,y+38);c.lineTo(x+side*93,y+56);c.quadraticCurveTo(x+side*118,y+8,x+side*98,y-40);});}
   celestialRing(c,x,y-142,78,p);line(c,p.light+'aa',1.5,()=>{c.moveTo(x,y-143);c.lineTo(x,y-25);});oval(c,x,y-17,8,17,p.light);glow(c,x,y-142,28,p.light+'55');
  }
 }
}
function paintNear(c,hero,p){
 for(let i=0;i<9;i++){
  const x=i*220+noise(i,12)*90,y=870+noise(i)*25;
  if(['cuerno','cat','dino','final'].includes(hero)&&i%6===0){tree(c,x,y,.40+noise(i,2)*.25,p,hero==='dino'?'fern':'broad');continue;}
  for(let j=0;j<6;j++){
   const xx=x+j*12,top=y-20-noise(i+j,3)*45;
   line(c,p.leaf,2,()=>{c.moveTo(xx,y);c.quadraticCurveTo(xx-10,top+20,xx+4,top);});
   oval(c,xx-3,top+17,12,4,p.leaf,-.5);oval(c,xx+5,top+8,10,3,p.mist,-.3);
   if(['cat','cuerno','frita','pizza','final'].includes(hero)){oval(c,xx+4,top,6,4,p.light);oval(c,xx+4,top,2,2,'#b38c88');}
  }
  if(['stitcho','chispin','yomi'].includes(hero)){const yy=y-75;line(c,p.stone,3,()=>{c.moveTo(x,yy+75);c.lineTo(x,yy-30);});oval(c,x,yy,11,23,p.stone);oval(c,x,yy,5,17,p.light);}
 }
}
function weather(c,surface){
 if(!paper){
  if(typeof OffscreenCanvas!=='undefined')paper=new OffscreenCanvas(64,64);
  else if(typeof document!=='undefined'){paper=document.createElement('canvas');paper.width=paper.height=64;}
  if(paper){const pc=paper.getContext('2d'),data=pc.createImageData(64,64);for(let i=0;i<4096;i++){const n=Math.floor(noise(i,17)*255);data.data.set([n,n,n,255],i*4);}pc.putImageData(data,0,0);}
 }
 if(!paper)return;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';c.globalAlpha=.065;c.fillStyle=c.createPattern(paper,'repeat');c.fillRect(0,0,surface.width,surface.height);c.restore();
}
function makeLayer(hero,layer,q){
 const w=Math.ceil(TILE*q),h=Math.ceil(HEIGHT*q);let surface;
 if(typeof OffscreenCanvas!=='undefined')surface=new OffscreenCanvas(w,h);
 else if(typeof document!=='undefined'){surface=document.createElement('canvas');surface.width=w;surface.height=h;}
 if(!surface)return null;const c=surface.getContext('2d');c.scale(q,q);
 [paintFar,paintMiddle,paintNear][layer](c,hero,REALM_STYLES[hero]);if(layer===1)paintSignature(c,hero,REALM_STYLES[hero]);weather(c,surface);return surface;
}
function layers(hero,q){const key=hero+':'+q;let entry=cache.get(key);if(entry){cache.delete(key);cache.set(key,entry);return entry;}
 entry=[0,1,2].map(layer=>makeLayer(hero,layer,q));cache.set(key,entry);while(cache.size>2)cache.delete(cache.keys().next().value);return entry;
}
function live(c,hero,p,cam,t,W,H){
 const scale=H/HEIGHT;
 c.save();c.scale(scale,scale);const width=W/scale,middleX=mod(cam.x*.16/scale,TILE),middleY=cam.y*.16*.28/scale;
 // Drifting clouds use their own depth, independently of the painted geology.
 for(let i=-1;i<5;i++){const x=mod(i*430-cam.x*.025-t*.08,width+700)-200;cloud(c,x,135+(i%3)*64,100,22,p.mist+'35');}
 const night=['stitcho','cat','yomi'].includes(hero);
 for(let i=0;i<(night?32:16);i++){const x=mod(i*131.71-cam.x*.09+t*(hero==='dragon'?.12:.025),width+80)-40,y=170+mod(i*83.13-t*(hero==='dragon'?.34:.06),520);const a=.2+(Math.sin(t*.018+i)+1)*.16;
  c.globalAlpha=a;oval(c,x,y,i%5?1.5:3,i%5?1.5:3,p.light);}
 c.globalAlpha=1;
 if(hero==='stitcho'){
  for(let i=0;i<20;i++){const x=mod(i*149-cam.x*.16+t*.4,width+160)-80,y=660+(i%8)*21;line(c,p.light+'35',1,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+24,y+Math.sin(t*.02+i)*3,x+58,y);});}
  for(let tile=-TILE-middleX;tile<width+TILE;tile+=TILE)for(let i=0;i<3;i++){
   const x=tile+530+i*600,y=360-middleY;if(x< -40||x>width+40)continue;
   line(c,'#b7d4c0',1.5,()=>{c.moveTo(x,y);c.lineTo(x+Math.sin(t*.016+i)*18,y+110);});oval(c,x+Math.sin(t*.016+i)*18,y+119,25,10,p.light+'99');
  }
 }else if(hero==='chispin'||hero==='yomi'||hero==='final'){
  const anchors=hero==='chispin'?[450,1480]:[0,1,2].map(i=>(hero==='final'?260:240)+i*600),height=hero==='chispin'?445:hero==='final'?410:430;
  for(let tile=-TILE-middleX;tile<width+TILE;tile+=TILE)for(const anchor of anchors){const x=tile+anchor;if(x< -145||x>width+145)continue;
   c.save();c.translate(x,height-middleY);c.rotate(t*(hero==='chispin'?.004:.001));line(c,p.light+'99',2,()=>{c.ellipse(0,0,hero==='final'?105:68,21,-.3,0,TAU);});for(let j=0;j<5;j++){const a=j*TAU/5;oval(c,Math.cos(a)*68,Math.sin(a)*21,3,3,p.light);}c.restore();
  }
 }else if(hero==='frita'||hero==='pizza'){
  for(let i=0;i<7;i++){const x=mod(i*313-cam.x*.16,width+200)-100,phase=mod(t*.35+i*47,180);c.globalAlpha=(1-phase/180)*.22;cloud(c,x+Math.sin(t*.008+i)*15,650-phase,18+phase*.15,10+phase*.13,p.mist);}c.globalAlpha=1;
 }else if(['cat','cuerno','dino'].includes(hero)){
  for(let i=0;i<12;i++){const x=mod(i*193+t*.24-cam.x*.25,width+120)-60,y=mod(i*91+t*.13,820);c.save();c.translate(x,y);c.rotate(Math.sin(t*.012+i)*.8);oval(c,0,0,5,2,i%2?p.light:p.mist);c.restore();}
 }
 c.restore();
}
export function livingRealmCache(){return {entries:cache.size,bytes:[...cache.values()].flat().reduce((n,s)=>n+(s?s.width*s.height*4:0),0)};}
export function drawLivingRealm(c,hero,cam,W,H,t=0,{reduceMotion=false}={}){
 const p=REALM_STYLES[hero];if(!p||!(W>0&&H>0))return false;
 const time=reduceMotion?0:t,scale=H/HEIGHT,q=Math.max(.35,Math.min(1,Math.ceil(Math.min(scale,Math.sqrt(W*H/(1440*HEIGHT)))*4)/4));
 c.save();try{
  c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';
  c.fillStyle=gradient(c,0,0,0,H,[[0,p.sky[0]],[.52,p.sky[1]],[1,p.sky[2]]]);c.fillRect(0,0,W,H);
  const night=['stitcho','cat','yomi'].includes(hero),sunX=W*.74-cam.x*.008,sunY=H*.23-cam.y*.018;
  glow(c,sunX,sunY,H*.35,p.light+'55');oval(c,sunX,sunY,H*(night?.054:.046),H*(night?.054:.046),p.light);
  if(hero==='cat'){oval(c,sunX+H*.022,sunY-H*.012,H*.048,H*.048,p.sky[0]);}
  c.save();c.globalCompositeOperation='screen';for(let j=0;j<4;j++){const x=sunX-H*.11+j*H*.09;path(c,gradient(c,x,sunY,x-H*.4,H,[[0,p.light+'00'],[.25,p.light+'14'],[1,p.light+'00']]),()=>{c.moveTo(x,sunY);c.lineTo(x-H*.1,H);c.lineTo(x-H*.38,H);});}c.restore();

  if(night)for(let i=0;i<45;i++){const x=mod(i*137.73-cam.x*.018,W),y=noise(i,8)*H*.47;oval(c,x,y,i%7?1:2,i%7?1:2,p.mist+'88');}
  const plates=layers(hero,q),depths=[.045,.16,.32];
  for(let layer=0;layer<3;layer++){
   const depth=depths[layer],span=TILE*scale,offset=mod(cam.x*depth,span),y=-cam.y*depth*.28;
   for(let x=-offset-span;x<W+span;x+=span){if(plates[layer])c.drawImage(plates[layer],x,y,span,H);else{c.save();c.translate(x,y);c.scale(scale,scale);[paintFar,paintMiddle,paintNear][layer](c,hero,p);if(layer===1)paintSignature(c,hero,p);c.restore();}}
   if(layer===0){c.fillStyle=gradient(c,0,H*.48,0,H*.83,[[0,p.sky[1]+'00'],[.65,p.sky[1]+'55'],[1,p.sky[2]+'00']]);c.fillRect(0,H*.48,W,H*.35);}
  }
  live(c,hero,p,cam,time,W,H);
  // Quiet values around the actual play lane; distant ornament never collides.
  c.fillStyle=gradient(c,0,H*.65,0,H,[[0,'#132c3900'],[1,'#132c3933']]);c.fillRect(0,H*.65,W,H*.35);
 }finally{c.restore();}return true;
}
