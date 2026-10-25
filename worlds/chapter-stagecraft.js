// A shared rendering vocabulary with ten authored materials and ten landmarks.
// All painted surfaces use the actual collision rectangle supplied by the room.
const TAU=Math.PI*2;
const P={
 kilo:['#637d5e','#c4c99b','#344f44','#a2b88a'],stitcho:['#718a8d','#dbc6a3','#395b65','#afc7c5'],chispin:['#a4b9c1','#ece7cc','#658493','#d3dedd'],cat:['#a49ab5','#e7d8e8','#716887','#c9b9d5'],cuerno:['#92aa8a','#e4e4b9','#5e7d71','#bdcfa4'],dragon:['#927f78','#dfbc94','#5c555c','#c89b7b'],dino:['#8d9e82','#d7d9b4','#5c7669','#b8c4a2'],frita:['#8d8393','#edcba1','#565d75','#bba6af'],pizza:['#b28e78','#efcf9f','#826459','#d9b399'],yomi:['#8aa6b1','#dae9df','#506f82','#b3ccd0']
};
const ellipse=(c,x,y,rx,ry,col,a=0)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,a,0,TAU);c.fill();};
const stroke=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
export function drawChapterSurface(c,p,world,cam,t){
 const h=world.chapterHero,col=P[h];if(!col||p._campaignLift)return false;
 const [body,rim,ink,light]=col,x=p.x-cam.x,y=p.y-cam.y,w=p.w,deep=p.h>40;
 c.save();c.lineJoin='round';c.lineCap='round';
 if(deep){
  c.fillStyle=body;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(x+w,y+p.h);c.bezierCurveTo(x+w*.72,y+p.h-9,x+w*.28,y+p.h+8,x,y+p.h);c.closePath();c.fill();
  c.save();c.beginPath();c.rect(x,y,w,p.h);c.clip();
  // Layered shading stays attached to the surface during camera movement.
  c.fillStyle='#243646';for(let band=0;band<12;band++){c.globalAlpha=.03+.23*(band/11)**1.5;c.fillRect(x,y+band*p.h/12,w,p.h/12+1);}c.globalAlpha=1;

  // Wavy strata replace the old flat dark rectangle. Quays carry masonry.
  const masonry=['stitcho','chispin','frita','pizza','yomi'].includes(h);
  for(let row=0;row<5;row++){const yy=y+23+row*25;c.globalAlpha=.3;stroke(c,row%2?light:ink,masonry?1:1.2,()=>{c.moveTo(x,yy);c.bezierCurveTo(x+w*.3,yy+(masonry?0:6),x+w*.7,yy-(masonry?0:5),x+w,yy);});
   if(masonry)for(let xx=Math.floor(p.x/95)*95+(row%2)*45;xx<p.x+w;xx+=95)stroke(c,light,1,()=>{c.moveTo(xx-cam.x,yy-23);c.lineTo(xx-cam.x,yy);});
  }
  if(!masonry)for(let xx=Math.floor(p.x/170)*170;xx<p.x+w;xx+=170){const px=xx-cam.x;stroke(c,light,1.5,()=>{c.moveTo(px,y+20);c.quadraticCurveTo(px+21,y+37,px+8,y+58);c.moveTo(px+8,y+58);c.quadraticCurveTo(px-6,y+70,px+12,y+91);});}
  c.restore();
  c.fillStyle=rim;c.fillRect(x,y,w,8);c.globalAlpha=.5;c.fillStyle='#f4eedb';c.fillRect(x,y,w,2);c.globalAlpha=1;stroke(c,ink,1.5,()=>{c.moveTo(x,y+8);c.lineTo(x+w,y+8);});
 }else{
  const built=['stitcho','chispin','frita','pizza','yomi'].includes(h);
  c.fillStyle=body;c.strokeStyle=ink;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.bezierCurveTo(x+w-8,y+31,x+w*.68,y+38,x+w*.5,y+35);c.bezierCurveTo(x+w*.24,y+42,x+8,y+28,x,y);c.fill();c.stroke();
  if(built){c.fillStyle=light;c.beginPath();c.roundRect(x+9,y+9,Math.max(1,w-18),13,5);c.fill();
   for(let xx=x+25;xx<x+w-10;xx+=43)ellipse(c,xx,y+15,2.1,2.1,ink);
  }else{
   for(let xx=x+22;xx<x+w-10;xx+=49)stroke(c,light,1.3,()=>{c.moveTo(xx,y+7);c.lineTo(xx-5,y+21);c.lineTo(xx+7,y+29);});
   if(['kilo','cat','cuerno'].includes(h)){for(let k=0;k<2;k++){const xx=x+w*(.25+k*.5);stroke(c,ink,2,()=>{c.moveTo(xx,y+29);c.bezierCurveTo(xx-12,y+47,xx+12,y+54,xx+2,y+66);});}}
  }
  c.fillStyle=rim;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.quadraticCurveTo(x+w-4,y+8,x+w-16,y+8);c.lineTo(x+12,y+8);c.quadraticCurveTo(x+3,y+7,x,y);c.fill();stroke(c,ink,1.5,()=>{c.moveTo(x,y);c.lineTo(x+w,y);});
 }
 // Fine flora/copper/brick trim differentiates each material at walking height.
 for(let wx=Math.ceil(p.x/63)*63;wx<p.x+w-9;wx+=63){const xx=wx-cam.x;
  if(['kilo','cat','cuerno','dino'].includes(h)){stroke(c,ink,1.3,()=>{c.moveTo(xx,y);c.quadraticCurveTo(xx-4,y-10,xx+5,y-14);});ellipse(c,xx+3,y-10,5,2,light,-.3);if(h==='kilo'||h==='cat')for(let k=0;k<4;k++)ellipse(c,xx+5+Math.cos(k*TAU/4)*3,y-14+Math.sin(k*TAU/4)*3,2.4,1.8,h==='kilo'?'#edb5a8':'#e8d3e5');}
  else if(h==='dragon'){stroke(c,'#e5bf91',1.5,()=>{c.moveTo(xx,y+11);c.lineTo(xx-9,y+25);c.lineTo(xx+1,y+36);});}
  else if(h==='chispin'||h==='yomi'){stroke(c,h==='chispin'?'#c7a46e':'#b8e2d5',2,()=>{c.moveTo(xx-11,y+5);c.lineTo(xx+11,y+5);});}
  else if(h==='stitcho'){stroke(c,ink,1.4,()=>{c.moveTo(xx,y+9);c.lineTo(xx,y+28);});}
 }
 c.restore();return true;
}
function glass(c,x,y,w,h,ink,fill){
 c.fillStyle=fill;c.strokeStyle=ink;c.lineWidth=3;c.beginPath();c.moveTo(x-w/2,y);c.bezierCurveTo(x-w*.6,y-h*1.3,x+w*.6,y-h*1.3,x+w/2,y);c.closePath();c.fill();c.stroke();
 for(let i=-1;i<=1;i++)stroke(c,ink,1.5,()=>{c.moveTo(x+i*w*.2,y);c.quadraticCurveTo(x+i*w*.4,y-h*.65,x,y-h*.97);});
}
function tree(c,x,y,moon=false){
 c.fillStyle=moon?'#8e829c':'#7e8a70';c.beginPath();c.moveTo(x-24,y);c.bezierCurveTo(x-11,y-93,x-42,y-190,x-6,y-248);c.bezierCurveTo(x-19,y-140,x+38,y-87,x+26,y);c.fill();
 for(let side of [-1,1])stroke(c,moon?'#a294ab':'#8d9c7d',12,()=>{c.moveTo(x,y-123);c.quadraticCurveTo(x+side*75,y-207,x+side*161,y-205);});
 for(let i=-3;i<=3;i++){const xx=x+i*56,yy=y-235+Math.abs(i)*10;ellipse(c,xx,yy,64,40,moon?'#d1bfd6':'#bbcfac');stroke(c,moon?'#b8a3c2':'#8fae8f',1.3,()=>{c.moveTo(xx,yy+20);c.quadraticCurveTo(xx-12,yy+73,xx+8,yy+104);});}
 ellipse(c,x+2,y-75,15,27,moon?'#eddec7':'#dedbb1');stroke(c,moon?'#a99bb1':'#a3ad89',2,()=>{c.moveTo(x-9,y-75);c.lineTo(x+12,y-75);});
}
function ribs(c,x,y){
 for(let i=0;i<7;i++){const xx=x-190+i*60,height=130+Math.sin(i/6*Math.PI)*80;stroke(c,'#8b9880',15,()=>{c.moveTo(xx+7,y);c.bezierCurveTo(xx+45,y-height*.5,xx+31,y-height,xx-20,y-height);});stroke(c,'#e3dcc0',10,()=>{c.moveTo(xx,y);c.bezierCurveTo(xx+39,y-height*.5,xx+25,y-height,xx-20,y-height);});}
 stroke(c,'#d1cfb0',13,()=>{c.moveTo(x-245,y-115);c.bezierCurveTo(x-120,y-245,x+130,y-245,x+240,y-110);});
}
function canopy(c,x,y,col){
 stroke(c,'#686d70',5,()=>{c.moveTo(x-98,y);c.lineTo(x-98,y-135);c.moveTo(x+98,y);c.lineTo(x+98,y-135);});
 c.fillStyle=col;c.beginPath();c.moveTo(x-125,y-133);c.quadraticCurveTo(x,y-190,x+125,y-133);for(let i=5;i>=0;i--)c.quadraticCurveTo(x-125+i*50-25,y-108,x-125+i*50-50,y-133);c.fill();
 c.fillStyle='#f1e1bf';c.beginPath();c.roundRect(x-99,y-73,198,52,8);c.fill();stroke(c,'#a58d7d',2,()=>{c.moveTo(x-96,y-48);c.lineTo(x+96,y-48);});
 for(let i=-2;i<=2;i++)ellipse(c,x+i*32,y-78,11,7,['#d8b17d','#b8c399','#ce9c88'][(i+2)%3]);
}
function harbor(c,x,y,dock=false){
 c.fillStyle=dock?'#b3c7c5':'#e3c8a6';c.strokeStyle=dock?'#5e7d84':'#ac806b';c.lineWidth=3;c.beginPath();c.moveTo(x-90,y);c.lineTo(x-90,y-160);c.bezierCurveTo(x-100,y-240,x+100,y-240,x+90,y-160);c.lineTo(x+90,y);c.fill();c.stroke();
 for(let i=-1;i<=1;i++){c.fillStyle=dock?'#7199a4':'#94b4a1';c.beginPath();c.roundRect(x+i*49-16,y-153,32,53,14);c.fill();c.stroke();}
 stroke(c,'#f0ddbc',7,()=>{c.moveTo(x-108,y-89);c.lineTo(x+108,y-89);});
 if(dock){stroke(c,'#617d84',12,()=>{c.moveTo(x+154,y);c.lineTo(x+154,y-295);c.quadraticCurveTo(x+154,y-317,x+130,y-317);c.lineTo(x-30,y-317);});stroke(c,'#c5a77b',5,()=>{c.moveTo(x-25,y-317);c.lineTo(x-25,y-210);});c.fillStyle='#9f7c67';c.beginPath();c.moveTo(x-170,y-38);c.bezierCurveTo(x-155,y+7,x-54,y+7,x-40,y-38);c.closePath();c.fill();stroke(c,'#e5cba5',3,()=>{c.moveTo(x-163,y-37);c.lineTo(x-45,y-37);});}
 else{c.fillStyle='#c58e79';c.beginPath();c.moveTo(x-108,y-204);c.quadraticCurveTo(x,y-249,x+108,y-204);c.fill();for(let side of [-1,1]){stroke(c,'#9c9c7c',2,()=>{c.moveTo(x+side*69,y-78);c.lineTo(x+side*69,y-58);});ellipse(c,x+side*69,y-53,15,7,'#a6bc8b');}}
}
export function drawChapterLandmarks(c,g,cam,t,W,H){
 const r=g.roomDef,plan=r?.composition;if(!plan)return;const h=r.hero,col=P[h],time=g.reduceMotion?0:t;
 const anchors=[plan.terraces[0][0]+130,plan.branch[1][0]+80,6900];
 c.save();c.globalAlpha=.92;c.lineJoin='round';
 for(let i=0;i<anchors.length;i++){const wx=anchors[i],x=wx-cam.x;if(x<-430||x>W+430)continue;const y=(r.terraces.find(q=>wx>=q.x&&wx<q.x+q.w)?.y??1134)-cam.y;
  ellipse(c,x,y-2,155,12,'#38505b14');
  if(h==='kilo')tree(c,x,y,false);
  else if(h==='cat'){tree(c,x,y,true);for(let k=-1;k<=1;k++){stroke(c,'#a897b4',2,()=>{c.moveTo(x+k*91,y);c.quadraticCurveTo(x+k*91-12,y-32,x+k*91,y-59);});ellipse(c,x+k*91,y-58,25,8,'#e3ccd9');}}
  else if(h==='dino')ribs(c,x,y);
  else if(h==='stitcho')harbor(c,x,y,true);
  else if(h==='pizza')harbor(c,x,y,false);
  else if(h==='frita'){canopy(c,x,y,'#c08e91');canopy(c,x+270,y,'#c5b181');stroke(c,'#d0d5d3',2,()=>{c.moveTo(x-120,y-205);c.quadraticCurveTo(x+130,y-160,x+390,y-205);});for(let j=0;j<8;j++)ellipse(c,x-100+j*63,y-200+Math.sin(j/7*Math.PI)*29,3,4,j%2?'#bce7dc':'#f3d8a2');}
  else if(h==='cuerno'){glass(c,x,y,260,228,'#82a098','#c7d9c46b');for(let k=-2;k<=2;k++){const xx=x+k*44;stroke(c,'#9aa78a',3,()=>{c.moveTo(xx,y);c.quadraticCurveTo(xx+10,y-46,xx,y-75);});ellipse(c,xx,y-75,12,17,['#d5bdd0','#e6d5a4','#afd4ca'][(k+2)%3],.2);}}
  else if(h==='dragon'){c.fillStyle='#9a8b80';c.strokeStyle='#675f60';c.lineWidth=4;c.beginPath();c.moveTo(x-180,y);c.bezierCurveTo(x-205,y-280,x+205,y-280,x+180,y);c.lineTo(x+110,y);c.bezierCurveTo(x+115,y-173,x-115,y-173,x-110,y);c.closePath();c.fill();c.stroke();c.fillStyle='#b88b6e';c.beginPath();c.ellipse(x,y-22,100,29,0,0,TAU);c.fill();for(let k=0;k<4;k++){const yy=y-40-k*22;stroke(c,'#e2bb8b',2,()=>{c.moveTo(x-42,yy);c.bezierCurveTo(x-22,yy-7,x+20,yy+9,x+42,yy);});}}
  else if(h==='chispin'){glass(c,x,y-36,210,175,'#8aadb7','#cfdddd');c.fillStyle='#b8c9c8';c.fillRect(x-118,y-36,236,36);stroke(c,'#b89b70',6,()=>{c.moveTo(x,y-203);c.lineTo(x,y-286);});for(let k=0;k<3;k++){c.strokeStyle='#d7bd8e';c.lineWidth=3;c.beginPath();c.ellipse(x,y-225-k*19,38-k*7,11,0,0,TAU);c.stroke();}ellipse(c,x,y-289,8,11,'#f0deb2');}
  else if(h==='yomi'){glass(c,x,y,280,211,'#7899a8','#b8d1d26b');const a=time*.004;c.strokeStyle='#aec4b8';c.lineWidth=4;for(let k=0;k<3;k++){c.beginPath();c.ellipse(x,y-117,91-k*19,30+k*11,k*.6+a,0,TAU);c.stroke();}ellipse(c,x,y-117,17,17,'#e5e7bd');}
 }
 c.restore();
}
