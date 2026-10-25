const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5;return x-Math.floor(x);};
export function drawNaturalLedge(ctx,p,world,cam,t){
 const id=world.id;if(['lab','space'].includes(id))return false;
 const x=p.x-cam.x,y=p.y-cam.y,w=p.w;
 const reef=id==='aquatic',hot=['volcano','ember-forge','pizza-harbor'].includes(id),rocky=['cave','ridge','boss'].includes(id);
 const lunar=id==='lunar-garden',prism=['prism-grove','fossil-valley'].includes(id);
 const depth=34+random(p.x+p.y)*35;
 ctx.save();
 const stone=ctx.createLinearGradient(0,y,0,y+depth);
 stone.addColorStop(0,lunar?'#c4b5d6':prism?'#b1c3a2':hot?'#875144':reef?'#628e9e':rocky?'#899697':'#a89168');
 stone.addColorStop(.38,lunar?'#8e81a8':prism?'#7a9a82':hot?'#593d42':reef?'#365e76':rocky?'#536c76':'#6e7351');
 stone.addColorStop(1,lunar?'#635e80':prism?'#486c65':hot?'#2a2533':reef?'#203f60':rocky?'#324b58':'#3a5a4d');ctx.fillStyle=stone;
 ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x+w,y+3);ctx.lineTo(x+w-10,y+depth*.58);
 for(let i=5;i>=0;i--){const u=i/5;ctx.lineTo(x+w*u,y+depth*(.55+Math.sin(u*Math.PI)*.45)-random(p.x+i)*7);}
 ctx.lineTo(x+7,y+depth*.4);ctx.closePath();ctx.fill();
 ctx.strokeStyle=reef?'#7eb9ba55':hot?'#d078514d':'#c4c2a34d';ctx.lineWidth=1;
 for(let i=0;i<3;i++){ctx.beginPath();const xx=x+w*(.18+i*.3);ctx.moveTo(xx,y+10);ctx.lineTo(xx-7,y+depth*.5);ctx.lineTo(xx+7,y+depth*.72);ctx.stroke();}
 // Walkable top is exactly the collision surface; vegetation stays low.
 ctx.fillStyle=lunar?'#e8d9f1':prism?'#dce5be':hot?'#cc8762':reef?'#b3ded4':rocky?'#c2cec3':'#a9ce83';
 ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.quadraticCurveTo(x+w-5,y+9,x+w-18,y+10);ctx.lineTo(x+13,y+10);ctx.quadraticCurveTo(x+2,y+7,x,y);ctx.fill();
 ctx.fillStyle=hot?'#f2b68d':'#e0eac4';ctx.fillRect(x+2,y-2,Math.max(0,w-4),2);ctx.fillRect(x,y-2,Math.min(8,w*.08),7);ctx.fillRect(x+w-Math.min(8,w*.08),y-2,Math.min(8,w*.08),7);
 ctx.strokeStyle=hot?'#f2b68d':'#e0eac4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+1,y);ctx.lineTo(x+w-1,y);ctx.stroke();
 if(!hot&&!rocky&&!reef&&!lunar){ctx.strokeStyle='#557f5d';ctx.lineWidth=2;for(let i=0;i<Math.floor(w/48);i++){const xx=x+20+i*48;ctx.beginPath();ctx.moveTo(xx,y+5);ctx.quadraticCurveTo(xx-6,y-9,xx+2,y-7);ctx.moveTo(xx,y+4);ctx.quadraticCurveTo(xx+7,y-7,xx+10,y-4);ctx.stroke();}
  if(id==='grove')for(let i=0;i<Math.floor(w/100);i++){
   const xx=x+45+i*100,yy=y-4;
   ctx.fillStyle=['#ffacc2','#eb554a','#ffe9a8'][i%3];
   for(let petal=0;petal<5;petal++){const a=petal*Math.PI*2/5;ctx.beginPath();ctx.ellipse(xx+Math.cos(a)*4,yy+Math.sin(a)*3,3,2,a,0,Math.PI*2);ctx.fill();}
   ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(xx,yy,1.6,0,Math.PI*2);ctx.fill();
  }
  // Hanging roots give the ledge weight without hiding a lower landing.
  for(let i=0;i<2;i++){const xx=x+w*(.3+i*.42),length=12+random(p.x+i*3)*24;ctx.strokeStyle='#567654';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx,y+depth*.7);ctx.quadraticCurveTo(xx-7,y+depth+8,xx+Math.sin(t*.025+i)*2,y+depth+length);ctx.stroke();}
 }
 ctx.restore();return true;
}
