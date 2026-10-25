// Bespoke fantasy landmarks, painted once as transparent Canvas layers. Nothing
// here owns collision; the authored terrain and mechanisms remain the only solids.
const TAU=Math.PI*2,tiles=new WeakMap();
const INK='#294153';
function oval(c,x,y,rx,ry,col,rot=0){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fill();}
function stroke(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();fn();c.stroke();}
function shape(c,col,fn){c.fillStyle=col;c.beginPath();fn();c.closePath();c.fill();}
function leaf(c,x,y,s,col,a=0){c.save();c.translate(x,y);c.rotate(a);shape(c,col,()=>{c.moveTo(-s,0);c.bezierCurveTo(-s*.3,-s*.7,s*.5,-s*.5,s,0);c.bezierCurveTo(s*.4,s*.5,-s*.4,s*.6,-s,0);});stroke(c,'#e9e7b580',1,()=>{c.moveTo(-s*.6,0);c.lineTo(s*.6,0);});c.restore();}
function bloom(c,x,y,r,col){for(let k=0;k<5;k++)oval(c,x+Math.cos(k*TAU/5)*r*.6,y+Math.sin(k*TAU/5)*r*.6,r*.55,r*.35,col,k*TAU/5);oval(c,x,y,r*.25,r*.25,'#ffe7a0');}
function arch(c,x,y,w,h,col,trim){
 shape(c,col,()=>{c.moveTo(x-w*.5,y);c.bezierCurveTo(x-w*.6,y-h*1.25,x+w*.6,y-h*1.25,x+w*.5,y);c.lineTo(x+w*.34,y);c.bezierCurveTo(x+w*.35,y-h*.87,x-w*.35,y-h*.87,x-w*.34,y);});
 stroke(c,trim,3,()=>{c.moveTo(x-w*.43,y);c.bezierCurveTo(x-w*.48,y-h*1.08,x+w*.48,y-h*1.08,x+w*.43,y);});
}
function stone(c,x,y,w,h,col){
 shape(c,col,()=>{c.moveTo(x-w*.5,y);c.bezierCurveTo(x-w*.58,y-h*.5,x-w*.2,y-h,x+w*.04,y-h);c.bezierCurveTo(x+w*.4,y-h*.96,x+w*.6,y-h*.3,x+w*.5,y);});
 stroke(c,'#f7d7a780',2,()=>{c.moveTo(x-w*.28,y-h*.25);c.quadraticCurveTo(x+w*.1,y-h*.37,x+w*.32,y-h*.3);});
}
function window(c,x,y,w,h,col){c.fillStyle=col;c.beginPath();c.roundRect(x-w/2,y-h,w,h,w/2);c.fill();stroke(c,'#ffebbc90',2,()=>{c.moveTo(x,y-h+3);c.lineTo(x,y-3);c.moveTo(x-w/2+2,y-h*.5);c.lineTo(x+w/2-2,y-h*.5);});}
function fern(c,x,y,s,col){stroke(c,col,3,()=>{c.moveTo(x,y);c.quadraticCurveTo(x-s*.2,y-s*.8,x+s*.15,y-s);});for(let k=1;k<8;k++)for(let side of [-1,1])leaf(c,x+side*s*.17,y-k*s*.11,s*(.22-k*.018),col,side*.55);}
function lantern(c,x,y,col){stroke(c,'#78948b',1.5,()=>{c.moveTo(x,y-40);c.quadraticCurveTo(x-8,y-25,x,y);});oval(c,x,y+8,7,12,col);oval(c,x-2,y+5,2,5,'#fff2ce');}
function house(c,x,y,w,h,col){c.fillStyle=col;c.beginPath();c.roundRect(x-w/2,y-h,w,h,5);c.fill();shape(c,'#af685a',()=>{c.moveTo(x-w*.63,y-h);c.quadraticCurveTo(x,y-h-28,x+w*.63,y-h);});for(let k=-1;k<=1;k++)window(c,x+k*w*.27,y-h*.35,10,21,'#4c7b80');}
function moonLily(c,x,y,s){stroke(c,'#8da6bc',3,()=>{c.moveTo(x,y);c.bezierCurveTo(x-35*s,y-65*s,x+30*s,y-95*s,x,y-140*s);});for(let k=0;k<5;k++)oval(c,x+(k-2)*14*s,y-140*s+Math.abs(k-2)*3*s,24*s,10*s,['#c6b5e6','#efd6e6','#f6e7c3'][k%3],(k-2)*.18);lantern(c,x,y-118*s,'#fae9ba');}
function paint(c,hero){
 c.lineCap='round';c.lineJoin='round';
 if(hero==='kilo'){
  // A rooted amphitheatre: water flows through the tree, flowers follow its arch.
  stroke(c,'#527d69',45,()=>{c.moveTo(170,620);c.bezierCurveTo(245,440,155,196,415,135);c.bezierCurveTo(610,85,785,292,827,620);});
  stroke(c,'#aed8bc',8,()=>{c.moveTo(203,608);c.bezierCurveTo(280,410,201,228,430,169);});
  for(let i=0;i<14;i++){const a=Math.PI+i*Math.PI/13,x=500+Math.cos(a)*330,y=500+Math.sin(a)*335;leaf(c,x,y,62,['#6eaa89','#90c39a','#b1d4a7'][i%3],a);if(i%2===0)bloom(c,x+17,y+12,17,i%4?'#efb7bf':'#f4d696');}
  for(let side of [-1,1])for(let k=0;k<5;k++)stroke(c,'#8ed3cf90',4-k*.45,()=>{c.moveTo(500+side*60+k*3,255);c.bezierCurveTo(500+side*85,350,500+side*28,460,500+side*60,604);});
  oval(c,500,613,240,16,'#6aa9ad80');for(let i=0;i<7;i++)bloom(c,270+i*69,600-Math.sin(i)*13,12,'#f5c1b9');
 }else if(hero==='stitcho'){
  // A half-repaired skyship hangs above its dry dock, not an abstract island.
  arch(c,510,625,620,390,'#628c9d','#c8d8cd');
  for(let side of [-1,1])stroke(c,'#d8b87e',9,()=>{c.moveTo(510+side*245,620);c.lineTo(510+side*245,125);c.lineTo(510,125);});
  shape(c,'#486b86',()=>{c.moveTo(300,310);c.bezierCurveTo(330,410,710,410,760,302);c.bezierCurveTo(640,263,419,270,300,310);});
  stroke(c,'#bde3e2',5,()=>{c.moveTo(320,311);c.quadraticCurveTo(535,359,739,307);});
  for(let k=0;k<7;k++){window(c,375+k*48,329,19,19,'#a7e4dd');stroke(c,'#adc4bc',1.5,()=>{c.moveTo(365+k*48,300);c.lineTo(372+k*48,341);});}
  for(let x of [360,695]){stroke(c,'#526f82',3,()=>{c.moveTo(x,127);c.lineTo(x,300);});oval(c,x,292,24,10,'#e9c18c');}
  for(let k=0;k<3;k++){house(c,380+k*130,620,110,95+k%2*35,'#b0cbd0');fern(c,235+k*290,625,65,'#6a9d92');}
 }else if(hero==='chispin'){
  // Marble instruments float on cloud shoals, tethered by copper strings.
  for(let i=0;i<3;i++){const x=270+i*260,y=540-Math.sin(i)*150;for(let k=0;k<6;k++)oval(c,x+(k-2)*30,y+12+(k%2)*7,48,24,'#d9e7e6');arch(c,x,y,180,165,'#a6c1ce','#f4e6b8');stroke(c,'#d6af75',5,()=>{c.moveTo(x,y-165);c.lineTo(x,y-235);});
   for(let k=0;k<3;k++){stroke(c,'#d8be8e',2,()=>{c.moveTo(x-30+k*28,y-175);c.lineTo(x-30+k*28,y-125+k*9);});oval(c,x-30+k*28,y-120+k*9,6,10,'#f6df9b');}}
  stroke(c,'#bf9d72',2,()=>{c.moveTo(270,370);c.bezierCurveTo(370,565,430,260,530,244);c.bezierCurveTo(630,265,700,520,790,414);});
 }else if(hero==='cat'){
  // A garden of lunar flowers and suspended lantern-bells reflected in water.
  oval(c,530,617,390,20,'#b9b7df55');
  for(let i=0;i<7;i++)moonLily(c,220+i*103,620,.75+(i%3)*.3);
  for(let i=0;i<5;i++){const x=260+i*145,y=230+(i%2)*70;shape(c,'#dbbfdf',()=>{c.moveTo(x-35,y);c.bezierCurveTo(x-42,y-69,x+42,y-69,x+35,y);c.quadraticCurveTo(x,y+12,x-35,y);});for(let j=-1;j<=1;j++)stroke(c,'#eed4e2',1.4,()=>{c.moveTo(x+j*16,y);c.bezierCurveTo(x+j*21,y+23,x+j*8,y+40,x+j*15,y+59);});bloom(c,x,y-27,8,'#f8e4b9');}
  stroke(c,'#c4b8dc',7,()=>{c.moveTo(180,620);c.bezierCurveTo(380,558,690,560,920,620);});
 }else if(hero==='cuerno'){
  // An old bridge grown through a prism river, with a living stained-glass gate.
  arch(c,540,620,650,300,'#628e81','#c8d4aa');
  for(let k=0;k<7;k++){const x=330+k*65;leaf(c,x,430-Math.sin(k/6*Math.PI)*100,28,'#a8c995',-.4+k*.1);lantern(c,x,465-Math.sin(k/6*Math.PI)*100,k%2?'#e8bce0':'#f1df9d');}
  for(let i=0;i<7;i++)stroke(c,['#e1b0c4','#e9ce96','#bed6a6','#9fd8cc','#b3c4e2'][i%5],2,()=>{c.moveTo(460+i*16,414);c.bezierCurveTo(390+i*26,482,620-i*20,540,540+i*22,620);});
  for(let k=0;k<8;k++)bloom(c,260+k*80,608-(k%2)*14,10,'#dcc8e0');
 }else if(hero==='dragon'){
  // A breached volcanic bowl: glowing falls thread carved, curved basalt.
  stone(c,510,625,750,410,'#6c566e');
  shape(c,'#3c354f',()=>{c.moveTo(210,390);c.bezierCurveTo(350,480,620,482,826,383);c.bezierCurveTo(668,537,369,553,210,390);});
  stroke(c,'#f8ba76',10,()=>{c.moveTo(230,390);c.bezierCurveTo(391,467,663,462,805,389);});
  for(let i=0;i<4;i++){const x=350+i*105;stroke(c,'#d47d6b',18,()=>{c.moveTo(x,460);c.bezierCurveTo(x-40,510,x+24,569,x-15,625);});stroke(c,'#ffcf82',5,()=>{c.moveTo(x,463);c.bezierCurveTo(x-35,510,x+18,570,x-15,622);});}
  for(let k=0;k<9;k++)stroke(c,'#bc8b8d',2,()=>{c.moveTo(195+k*78,585);c.lineTo(220+k*68,550);c.lineTo(204+k*70,520);});
 }else if(hero==='dino'){
  // Fossil skull and rib bridge: curved jaw, tooth sockets, roots and ferns.
  stone(c,530,625,800,300,'#81987e');
  shape(c,'#d8d4ac',()=>{c.moveTo(260,470);c.bezierCurveTo(230,245,567,218,699,367);c.lineTo(814,430);c.bezierCurveTo(875,463,771,514,665,490);c.lineTo(592,537);c.bezierCurveTo(440,571,330,537,260,470);});
  oval(c,470,394,66,51,'#758277',-.3);oval(c,655,445,16,12,'#758277');
  for(let i=0;i<7;i++)pathTooth(c,390+i*42,491+(i%2)*4);
  for(let i=0;i<5;i++)stroke(c,'#ddd9b2',12,()=>{c.moveTo(285+i*110,620);c.bezierCurveTo(255+i*110,545,313+i*110,523,355+i*110,551);});
  for(let i=0;i<6;i++)fern(c,190+i*135,625,55+(i%3)*15,['#659877','#7dab86'][i%2]);
 }else if(hero==='frita'){
  // A travelling market hangs from a warm-air balloon, fed by geyser steam.
  for(let i=0;i<3;i++){const x=270+i*270,y=500-(i%2)*115;oval(c,x,y-180,75,103,['#d6a1a9','#e4c18b','#90bcc1'][i]);for(let k=-1;k<=1;k++)stroke(c,'#f5e0b6',2,()=>{c.moveTo(x+k*26,y-277);c.quadraticCurveTo(x+k*68,y-180,x+k*23,y-90);});
   for(let side of [-1,1])stroke(c,'#b69c7c',2,()=>{c.moveTo(x+side*42,y-93);c.lineTo(x+side*32,y-15);});house(c,x,y+45,114,73,'#cda77c');
   for(let k=-1;k<=1;k++)oval(c,x+k*21,y+75+Math.abs(k)*12,20,35,'#e9e2d055');}
  stroke(c,'#e4d1a2',2,()=>{c.moveTo(165,570);c.quadraticCurveTo(530,500,905,568);});for(let i=0;i<12;i++){const x=185+i*62;shape(c,['#d3a9ac','#c5d8ba','#ead295'][i%3],()=>{c.moveTo(x,557-Math.sin(i/11*Math.PI)*33);c.lineTo(x+18,570-Math.sin(i/11*Math.PI)*33);c.lineTo(x+25,553-Math.sin(i/11*Math.PI)*33);});}
 }else if(hero==='pizza'){
  // Houses live on a cliff and a visible quay; boats are below that wall.
  stone(c,530,625,830,230,'#9d7b79');
  for(let row=0;row<2;row++)for(let i=0;i<5;i++)house(c,260+i*129+row*30,590-row*105,102,95+(i%2)*26,['#e6a782','#f2cc98','#cb8e87','#e5d2ac','#9fbcaa'][(i+row)%5]);
  c.fillStyle='#e3ca9e';c.fillRect(150,590,770,12);c.fillStyle='#657b87';c.fillRect(140,625,800,16);
  for(let k=0;k<8;k++)stroke(c,'#6d6974',3,()=>{c.moveTo(160+k*106,603);c.lineTo(160+k*106,638);});
  stroke(c,'#66737c',2,()=>{c.moveTo(210,270);c.quadraticCurveTo(550,440,880,320);});
  for(let i=0;i<4;i++){const x=285+i*145,y=316+Math.sin(i/3*Math.PI)*50;house(c,x,y+22,38,35,'#edca91');stroke(c,'#68747c',1,()=>{c.moveTo(x,y-14);c.lineTo(x,y-28);});}
 }else if(hero==='yomi'){
  // The library grows like a luminous tree; books become folded birds.
  arch(c,530,625,680,390,'#7eabb3','#e9d9a8');
  for(let side of [-1,1])stroke(c,'#9ec9c6',17,()=>{c.moveTo(530,620);c.bezierCurveTo(530+side*25,440,530+side*210,366,530+side*260,244);});
  for(let side of [-1,1])for(let k=0;k<4;k++){const x=530+side*(85+k*42),y=500-k*58;house(c,x,y,60,50,['#c4d9d0','#e4d4b2','#c5c6df'][k%3]);window(c,x,y-15,19,25,'#8adad2');}
  oval(c,530,366,61,61,'#dcdbb580');oval(c,530,366,39,39,'#d6ece1');
  for(let i=0;i<9;i++){const x=230+i*72,y=145+Math.sin(i*1.3)*43;shape(c,i%2?'#dbe9d5':'#e4d7ba',()=>{c.moveTo(x,y);c.lineTo(x-20,y-15);c.lineTo(x-8,y+9);c.lineTo(x+17,y-13);c.lineTo(x+5,y+12);});}
 }
}
function pathTooth(c,x,y){shape(c,'#f2e5bd',()=>{c.moveTo(x-11,y);c.lineTo(x+10,y);c.quadraticCurveTo(x+9,y+25,x,y+30);c.closePath();});}
export function drawChapterVista(c,g,cam,t,W,H){
 const hero=g.roomDef?.hero;if(!g.roomDef?.composition||!hero)return;
 let cache=tiles.get(c);if(!cache)tiles.set(c,cache=new Map());
 let tile=cache.get(hero);
 if(!tile&&typeof OffscreenCanvas!=='undefined'){
  tile=new OffscreenCanvas(1100,650);const art=tile.getContext('2d');paint(art,hero);
  // Warm rim light and cool lower occlusion are baked once, not filtered per frame.
  art.globalCompositeOperation='source-atop';
  const light=art.createLinearGradient(0,100,0,650);light.addColorStop(0,'rgba(255,237,183,.12)');light.addColorStop(.45,'rgba(255,237,183,0)');light.addColorStop(1,'rgba(10,38,58,.22)');
  art.fillStyle=light;art.fillRect(0,0,1100,650);art.globalCompositeOperation='source-over';
  if(cache.size>=3)cache.delete(cache.keys().next().value);cache.set(hero,tile);
 }
 const scale=Math.max(.55,Math.min(1,H/900)),span=2250*scale,offset=((cam.x*.24)%span+span)%span;
 c.save();c.globalAlpha=.82;
 for(let x=-offset-span;x<W+span;x+=span){
  const left=x+span*.3,y=H*.83-650*scale-cam.y*.035;
  if(left+1100*scale<0||left>W)continue;
  if(tile)c.drawImage(tile,left,y,1100*scale,650*scale);
  else{c.save();c.translate(left,y);c.scale(scale,scale);paint(c,hero);c.restore();}
 }
 c.restore();
}
