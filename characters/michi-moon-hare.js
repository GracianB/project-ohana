// Fourth form: a moon hare with a spiral horn. Rabbit joints, long ears and
// paired bounding hindquarters replace the former serpentine cat anatomy.
export function drawMoonHare(c,pose={}){
 const reduced=pose.reduceMotion,t=reduced?0:Number(pose.t)||0,run=pose.state==='run',air=['jump','fall','glide'].includes(pose.state),
 phase=reduced?0:Number(pose.phase)||t*.2,bound=run?Math.sin(phase):0,hurt=pose.state==='hurt',cast=pose.state==='cast',attack=pose.state==='attack',
 ink='#60496e',cream='#fff5e5',shade='#dbcee8',pink='#f1b9d7';
 const oval=(x,y,rx,ry,col,a=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);c.fillStyle=col;c.fill();c.strokeStyle=ink;c.lineWidth=1.8;c.stroke();};
 c.save();c.translate(0,run?-Math.max(0,bound)*9:0);if(hurt)c.rotate(-.15);
 // Far hind leg folds at the hock; long toes sweep forward on landing.
 oval(-21,-15,13,16,shade,-.25+bound*.25);
 oval(-13+bound*8,-4,16,4,shade,-bound*.13);
 oval(27,-15,7,15,shade,air?-.65:bound*.25);
 oval(29-bound*5,-3,10,3.7,shade);
 // Cloud tail and pearly body, with a continuous curved spine.
 oval(-40,-27,9,10,cream);oval(-3,-28,33,21,cream,-.08);
 c.beginPath();c.moveTo(-20,-36);c.bezierCurveTo(-6,-50,14,-47,21,-34);c.strokeStyle='#fffef6';c.lineWidth=4;c.stroke();
 oval(-21,-16,15,18,cream,-.22+bound*.32);
 oval(-9+bound*10,-4,20,4.6,cream,-bound*.12);
 oval(23,-16,6,15,cream,air?-.8:-bound*.25);
 oval(27-bound*7,-3,12,4,cream);
 // Long ears are rooted behind the brow and independently follow each bound.
 for(const [side,x]of[[-1,8],[1,22]]){
  c.save();c.translate(x,-53);c.rotate(side*.15+(run?bound*.22:Math.sin(t*.045+side)*.055));
  oval(0,-19,7,27,side<0?shade:cream,-.06);oval(0,-21,3,20,pink,-.06);c.restore();
 }
 c.save();c.translate(21,-44);c.rotate(air?-.08:bound*.035);
 oval(0,0,18,18,cream);oval(12,6,12,9,cream);
 // One clean ivory horn, with a visible gold spiral.
 c.beginPath();c.moveTo(-3,-15);c.quadraticCurveTo(0,-29,6,-38);c.lineTo(7,-14);c.closePath();c.fillStyle='#ffe4ad';c.fill();c.strokeStyle=ink;c.lineWidth=1.5;c.stroke();
 c.strokeStyle='#c89754';for(let i=0;i<3;i++){c.beginPath();c.moveTo(i*.8,-19-i*5);c.lineTo(6,-22-i*5);c.stroke();}
 // Eye and muzzle remain unobscured by ears, horn or effects.
 oval(7,-4,4,6,hurt?'#8a5f83':'#467f9e');oval(8,-6,1.1,1.7,'#fff');
 oval(22,4,2.2,1.6,pink);c.strokeStyle=ink;c.lineWidth=1.4;c.beginPath();c.moveTo(20,8);c.quadraticCurveTo(15,12,12,8);c.stroke();
 if(attack){oval(15,11,4,3,'#2a0f2e');oval(16,12,2,1,'#ff7fae');}
 c.restore();
 // A few orbiting seeds identify moon magic without hiding the silhouette.
 for(let i=0;i<3;i++){const a=t*.025+i*Math.PI*2/3;const x=Math.cos(a)*(cast?57:45),y=-38+Math.sin(a)*15;c.fillStyle=i%2?'#ffe0a3':'#b8d9ed';c.beginPath();c.ellipse(x,y,2,4,a,0,Math.PI*2);c.fill();}
 c.restore();
}
