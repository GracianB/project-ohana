// Native Michi terrain painter: decorates real collision geometry, never invents solids.
const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const colors={
 crypt:['#1b343d','#537b79','#81b6a8'],
 gallery:['#39485b','#95a0b1','#ccb8c9'],
 canopy:['#28515c','#75b7aa','#bce4bb'],
 arena:['#403d4f','#ad8c8f','#e9bea4'],
 return:['#4d555a','#c0ab91','#fae0a9']
};
const ellipse=(c,x,y,a,b,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
export function drawMichiSanctuaryTerrain(c,platforms=[],cam={},W=1280,H=720,zone='court',lit=0){
 const cx=cam.x||0,cy=cam.y||0,tone=colors[zone]||['#234550','#74a497','#a6ddba'];
 const energy=clamp(lit);
 let painted=0;
 for(const p of platforms){
  if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.w)||!Number.isFinite(p.h))continue;
  if(p.w<=0||p.h<=0||p.x+p.w<cx-80||p.x>cx+W+80||p.y>cy+H+110||p.y+p.h<cy-90)continue;
  const x=p.x-cx,y=p.y-cy,heavy=p.h>40,base=tone[0];
  // A deep underside makes the physical support legible at every exposure.
  const rock=c.createLinearGradient(0,y,0,y+Math.max(p.h,12));
  rock.addColorStop(0,heavy?'#345963':base);
  rock.addColorStop(.35,base);
  rock.addColorStop(1,heavy?'#112c38':'#1d3d47');
  c.fillStyle=rock;c.fillRect(x,y,p.w,p.h);
  c.fillStyle=tone[1];c.fillRect(x,y,p.w,5);
  c.fillStyle='rgba(246,239,198,.45)';c.fillRect(x+4,y+1,Math.max(0,p.w-8),1);
  // Staggered mortar seams, clipped to the real platform width.
  if(heavy){
   const length=Math.min(p.w, W+160),start=Math.max(0,cx-60-p.x);
   c.strokeStyle='rgba(10,39,48,.43)';c.lineWidth=1.3;
   for(let dx=start;dx<Math.min(p.w,start+length);dx+=61){
    const yy=y+20+(Math.floor((p.x+dx)/61)%3)*20;
    if(yy>y+p.h-5)continue;
    c.beginPath();c.moveTo(x+dx,yy);c.lineTo(x+Math.min(p.w,dx+38),yy);c.stroke();
    c.beginPath();c.moveTo(x+dx+19,yy);c.lineTo(x+dx+14,Math.min(y+p.h,yy+12));c.stroke();
   }
  }
  // Organic silhouettes grow from supports; none are collision bodies.
  const first=Math.max(0,Math.floor((cx-p.x-60)/68));
  const last=Math.min(Math.ceil(p.w/68),Math.ceil((cx+W-p.x+60)/68));
  for(let i=first;i<last;i++){
   const px=x+i*68+20;
   if(px < -60 || px > W+60)continue;
   const seed=Math.abs(Math.floor(p.x/37))+i*7;
   c.strokeStyle=seed%3===0?'#75aaa0':'#58897e';c.lineWidth=1.4;
   c.beginPath();c.moveTo(px,y+1);c.quadraticCurveTo(px-10,y-12,px-8,y-22);c.stroke();
   c.beginPath();c.moveTo(px,y);c.quadraticCurveTo(px+10,y-14,px+15,y-16);c.stroke();
   ellipse(c,px-7,y-13,7,3,'#6b9a88');
   ellipse(c,px+12,y-11,8,3,'#67978b');
   if(seed%4===0){
    // Clusters use teal stems and warm pollen. Their light follows earned lanterns.
    const flower=seed%8===0?'#f0bfd7':tone[2];
    c.strokeStyle='#81b5a0';c.lineWidth=1.5;
    c.beginPath();c.moveTo(px+28,y+1);c.quadraticCurveTo(px+24,y-16,px+29,y-25);c.stroke();
    for(let petal=0;petal<4;petal++){
     const a=petal*TAU/4;
     ellipse(c,px+29+Math.cos(a)*4,y-25+Math.sin(a)*4,3.4,4.4,flower);
    }
    ellipse(c,px+29,y-25,2,2,'#fff1cd');
    if(energy>.19&&seed%8===0){
     ellipse(c,px+29,y-25,6,5,'rgba(255,236,198,'+(.08+energy*.12)+')');
    }
   }
  }
  painted++;
 }
 return painted;
}
