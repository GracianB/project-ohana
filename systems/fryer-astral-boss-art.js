const TAU=Math.PI*2;
export function drawFryerKing(c,e,t){
 const b=e._crispyKing,gold=b.tier===3?'#d29c65':'#d5b57c',edge='#645b58';c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=edge;c.lineWidth=3;
 for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*(22+i*12);c.strokeStyle=edge;c.lineWidth=9;c.beginPath();c.moveTo(x,-12);c.quadraticCurveTo(side*(68+i*10),15,side*(70+i*11),43);c.stroke();c.strokeStyle=gold;c.lineWidth=5;c.stroke();}
 c.fillStyle=gold;c.strokeStyle=edge;c.lineWidth=3;c.beginPath();c.ellipse(0,-28,67,48,0,0,TAU);c.fill();c.stroke();
 c.fillStyle='#e7d3a3';c.beginPath();c.ellipse(-5,-43,52,24,-.12,Math.PI,TAU);c.fill();
 c.strokeStyle='#ad946e';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*19,-61);c.quadraticCurveTo(i*30,-27,i*20,8);c.stroke();}
 for(const side of [-1,1]){const x=side*24;c.strokeStyle=edge;c.lineWidth=8;c.beginPath();c.moveTo(x,-56);c.lineTo(x+side*5,-85);c.stroke();c.fillStyle='#f6e8be';c.beginPath();c.ellipse(x+side*5,-88,12,15,0,0,TAU);c.fill();c.stroke();c.fillStyle=b.phase==='warn'?'#f2ae68':'#3d5656';c.beginPath();c.arc(x+side*7,-88,5,0,TAU);c.fill();}
 c.fillStyle='#e8c27e';c.strokeStyle=edge;c.lineWidth=2;c.beginPath();c.moveTo(-25,-87);c.lineTo(-30,-122);c.lineTo(-12,-108);c.lineTo(0,-132);c.lineTo(13,-108);c.lineTo(30,-122);c.lineTo(25,-87);c.closePath();c.fill();c.stroke();
 c.fillStyle='#f4ecd1';c.beginPath();c.moveTo(-29,-15);c.quadraticCurveTo(0,-4,29,-15);c.lineTo(30,16);c.quadraticCurveTo(0,30,-30,16);c.closePath();c.fill();c.stroke();
 c.fillStyle=b.exposed?'#fff1b4':'#b5c5a6';c.beginPath();c.ellipse(0,6,11,14,.2,0,TAU);c.fill();c.stroke();
 for(const side of [-1,1]){c.strokeStyle=edge;c.lineWidth=13;c.beginPath();c.moveTo(side*54,-21);c.quadraticCurveTo(side*77,-40,side*86,-52);c.stroke();c.fillStyle=gold;c.lineWidth=3;c.beginPath();c.ellipse(side*91,-58,22,28,side*.3,0,TAU);c.fill();c.stroke();c.fillStyle='#f0dba7';c.beginPath();c.moveTo(side*82,-76);c.quadraticCurveTo(side*103,-62,side*82,-45);c.lineTo(side*(b.phase==='warn'?94:88),-61);c.closePath();c.fill();c.stroke();}
 // Engraved shell, polished claw rims and jewels make the king distinct.
 c.strokeStyle='#f2deb1';c.lineWidth=2;c.beginPath();c.ellipse(-3,-34,57,34,-.06,Math.PI*1.05,Math.PI*1.92);c.stroke();
 for(let i=0;i<11;i++){const a=Math.PI+(i+.5)*Math.PI/11;c.fillStyle=i%2?'#a88e68':'#eaddad';c.beginPath();c.arc(Math.cos(a)*57,-28+Math.sin(a)*36,2,0,TAU);c.fill();}
 c.fillStyle='#507f7e';c.strokeStyle='#f5df9b';c.lineWidth=2;c.beginPath();c.moveTo(0,-116);c.quadraticCurveTo(12,-105,0,-95);c.quadraticCurveTo(-12,-105,0,-116);c.fill();c.stroke();
 for(const side of [-1,1]){c.strokeStyle='#f1d9a8';c.lineWidth=2;c.beginPath();c.ellipse(side*91,-58,15,20,side*.3,Math.PI*1.1,Math.PI*1.9);c.stroke();for(let i=0;i<3;i++){const xx=side*(68+i*11);c.fillStyle='#b59b72';c.beginPath();c.arc(xx,23+i*4,4,0,TAU);c.fill();}}
 c.strokeStyle='#aa9c7e';c.lineWidth=1.5;c.beginPath();c.moveTo(-23,9);c.quadraticCurveTo(0,19,23,9);c.stroke();
 c.restore();
}
export function drawAstralCustodian(c,e,t){
 const b=e._spiritGuide,edge='#456879',metal=b.tier===3?'#8fa9b7':'#aec6cb',light=b.phase==='warn'?'#f2d5a7':'#bfe8d8';c.save();c.strokeStyle=edge;c.lineWidth=3;c.lineJoin='round';c.lineCap='round';
 for(const side of [-1,1]){c.fillStyle='#8da8b3';c.beginPath();c.moveTo(side*12,16);c.lineTo(side*30,16);c.lineTo(side*32,39);c.quadraticCurveTo(side*46,39,side*42,50);c.lineTo(side*8,50);c.closePath();c.fill();c.stroke();}
 c.fillStyle=metal;c.beginPath();c.moveTo(-32,-55);c.bezierCurveTo(-58,-28,-45,10,-31,24);c.quadraticCurveTo(0,38,31,24);c.bezierCurveTo(45,10,58,-28,32,-55);c.closePath();c.fill();c.stroke();
 c.fillStyle='#d2e1da';c.beginPath();c.ellipse(0,-8,26,31,0,0,TAU);c.fill();c.stroke();c.fillStyle=b.exposed?'#fbf4c5':'#7598a4';c.beginPath();c.arc(0,-8,12,0,TAU);c.fill();c.stroke();
 for(const side of [-1,1]){c.strokeStyle=edge;c.lineWidth=15;c.beginPath();c.moveTo(side*37,-37);c.quadraticCurveTo(side*65,-21,side*53,3);c.stroke();c.strokeStyle=metal;c.lineWidth=9;c.stroke();c.fillStyle='#cadcd5';c.lineWidth=2;c.beginPath();c.ellipse(side*54,6,11,15,side*.2,0,TAU);c.fill();c.stroke();}
 c.fillStyle='#b9d2d4';c.strokeStyle=edge;c.lineWidth=3;c.beginPath();c.ellipse(0,-76,39,42,0,0,TAU);c.fill();c.stroke();c.fillStyle='#345773';c.beginPath();c.roundRect(-28,-94,56,36,14);c.fill();c.fillStyle=light;for(const side of [-1,1]){c.beginPath();c.ellipse(side*11,-78,4,7,0,0,TAU);c.fill();}
 c.strokeStyle='#d8e7dc';c.lineWidth=3;c.beginPath();c.moveTo(-25,-101);c.quadraticCurveTo(-19,-116,0,-112);c.stroke();
 c.strokeStyle=edge;c.lineWidth=3;c.beginPath();c.moveTo(0,-118);c.lineTo(0,-135);c.stroke();c.fillStyle=light;c.beginPath();c.arc(0,-139,7,0,TAU);c.fill();
 c.strokeStyle=light;c.lineWidth=2;const a=t*.015;for(const side of [-1,1]){const x=side*(64+Math.sin(a)*3),y=-62+Math.cos(a)*14;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();c.beginPath();c.moveTo(x-12,y);c.lineTo(x+12,y);c.stroke();}
 // Brass joints, layered plates and etched data paths give the custodian
 // the same level of surface detail as Yomi's final constellation form.
 c.strokeStyle='#d9d4ad';c.lineWidth=3;c.beginPath();c.ellipse(0,-76,44,47,0,Math.PI*.85,Math.PI*2.15);c.stroke();
 c.strokeStyle='#e3ebe0';c.lineWidth=2;c.beginPath();c.moveTo(-29,-108);c.quadraticCurveTo(-10,-126,10,-114);c.stroke();
 c.fillStyle='#d9e8df';for(const side of [-1,1]){c.beginPath();c.ellipse(side*36,-43,10,8,side*.25,0,TAU);c.fill();c.stroke();c.strokeStyle='#6e919e';c.lineWidth=2;c.beginPath();c.moveTo(side*29,-28);c.quadraticCurveTo(side*45,-3,side*29,14);c.stroke();c.beginPath();c.moveTo(side*19,30);c.lineTo(side*24,41);c.lineTo(side*34,43);c.stroke();c.beginPath();c.moveTo(side*51,8);c.lineTo(side*57,14);c.moveTo(side*56,7);c.lineTo(side*60,11);c.stroke();}
 c.strokeStyle='#d8d6aa';c.lineWidth=2;c.beginPath();c.ellipse(0,-8,17,20,.25,0,TAU);c.stroke();
 const spin=t*.015;for(let i=0;i<6;i++){const a=i*TAU/6+spin;c.fillStyle=b.exposed?'#fff2b8':'#78aaa9';c.beginPath();c.arc(Math.cos(a)*19,-8+Math.sin(a)*22,2.2,0,TAU);c.fill();}
 c.strokeStyle='#e6e6c0';c.lineWidth=2;c.beginPath();c.moveTo(-12,-51);c.quadraticCurveTo(0,-45,12,-51);c.stroke();
 c.strokeStyle='#b8d9d1';c.lineWidth=1.5;for(const side of [-1,1]){c.beginPath();c.moveTo(side*18,-32);c.lineTo(side*27,-19);c.lineTo(side*23,4);c.stroke();}
 c.fillStyle='#e7efdf';c.beginPath();c.arc(-16,-87,2.5,0,TAU);c.fill();
 c.strokeStyle='#d3dbbb';c.lineWidth=2;c.beginPath();c.ellipse(0,-129,27,5,-.12,0,TAU);c.stroke();
 c.restore();
}
