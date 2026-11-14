// Presentation follows the existing projectile radius / purr radius exactly.
export function drawSanctuaryYarn(c,f,cam,t,reduced){
 const r=f.r||12,x=f.x-cam.x,y=f.y-cam.y,d=Math.sign(f.vx)||1;c.save();c.translate(x,y);c.lineCap='round';c.strokeStyle='#e7a394';c.lineWidth=2;c.beginPath();c.moveTo(-d*r*3,Math.sin(reduced?0:t*.12)*4);c.quadraticCurveTo(-d*r*2,10,0,0);c.stroke();c.rotate(reduced?0:t*.12*d);c.fillStyle='#d5b6a1';c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.strokeStyle='#735b64';c.lineWidth=1.2;for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(i*r*.2,0,r*.45,r*.9,i*.6,0,Math.PI*2);c.stroke();}c.fillStyle='#e9dfbc';c.fillRect(-r*.4,-r*.6,3,2);c.restore();
}
export function drawSanctuaryPurr(c,f,cam,t,p){
 const u=Math.max(0,Math.min(1,1-f.life/(f.max||72))),r=Math.min(f.R,36+u*f.R),x=p.x+p.w/2-cam.x,y=p.y+p.h/2-cam.y;c.save();c.lineCap='round';c.globalAlpha=(1-u)*.8;c.lineWidth=2;c.strokeStyle='#8dd7c6';
 // Interrupted arcs leave the combat silhouettes and projectile lanes readable.
 for(let i=0;i<4;i++){const a=i*Math.PI*.5+.18;c.beginPath();c.arc(x,y,r,a,a+.9);c.stroke();}c.strokeStyle='#e9dfbc';c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.arc(x,y,r*(.35+i*.2),-.65,.65);c.stroke();}c.restore();
}
