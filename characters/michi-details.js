// Character-bound materials and ornaments. They never spawn gameplay entities.
export function drawMichiDetails(a,p,form){
 const{c,shape,stroke,oval}=a;
 if(form===0){
  // Worn denim vest: seam, moon patch and a safety pin, readable at baby scale.
  shape('#3b4960',()=>{c.moveTo(-28,-30);c.lineTo(-14,-34);c.lineTo(3,-27);c.lineTo(0,-16);c.lineTo(-23,-14);});
  stroke('#a1a9ad',.8,()=>{c.moveTo(-24,-27);c.lineTo(-22,-17);c.moveTo(-8,-29);c.lineTo(-5,-18);});
  oval(-15,-24,5,5,'#e6c39f');oval(-13,-26,4,4,'#344357');
  stroke('#c6ced2',1.2,()=>{c.moveTo(-23,-22);c.lineTo(-19,-19);c.moveTo(-24,-20);c.lineTo(-20,-17);});
 }else if(form===1){
  // Flight harness follows the chest; brass fasteners distinguish it from fur.
  stroke('#9a6d73',3,()=>{c.moveTo(-12,-49);c.lineTo(8,-28);c.moveTo(13,-49);c.lineTo(-8,-28);});
  oval(0,-39,3,4,'#e2c196');for(const side of[-1,1])stroke('#ddd2bd',.8,()=>{c.moveTo(side*7,-45);c.lineTo(side*3,-38);});stroke('#ced4d1',1,()=>{c.moveTo(-8,-28);c.lineTo(8,-28);});
 }else if(form===2){
  // Irregular eclipse rosettes sit on the flank rather than floating outside it.
  for(let i=0;i<4;i++){const x=-24+i*12,y=-39+(i%2)*5;stroke('#050608',2.2,()=>{c.moveTo(x-3,y+4);c.quadraticCurveTo(x-8,y-5,x+2,y-5);c.moveTo(x+4,y-3);c.lineTo(x+5,y+2);});}
  stroke('#30383e',.8,()=>{c.moveTo(-27,-47);c.quadraticCurveTo(-13,-55,1,-47);});
 }else if(form===3){
  // Asymmetric split coat and a crescent clasp anchor the duellist silhouette.
  shape('#252238',()=>{c.moveTo(-13,-47);c.lineTo(-2,-40);c.lineTo(-12,-18);c.lineTo(-26,-25);c.lineTo(-20,-36);});
  shape('#494060',()=>{c.moveTo(4,-43);c.lineTo(14,-48);c.lineTo(21,-27);c.lineTo(10,-20);});
  stroke('#7eb6b5',1,()=>{c.moveTo(-15,-40);c.lineTo(-20,-27);c.moveTo(12,-40);c.lineTo(16,-28);});
  for(let i=0;i<3;i++)stroke('#c8adcf',.75,()=>{const y=-37+i*5;c.moveTo(-15,y);c.lineTo(-12,y+2);c.lineTo(-16,y+3);});oval(-2,-42,4,4,'#e4d6ac');oval(0,-44,3,3,'#293c50');
 }else{
  // Three small feline soul-lights follow the nine trailing ribbons.
  for(let i=0;i<3;i++){const phase=p.still?i*2:p.t*.025+i*2,x=Math.cos(phase)*(34+i*3),y=-65+Math.sin(phase)*15;
   c.save();c.globalAlpha=.35+i*.12;c.translate(x,y);shape('#c1fae7',()=>{c.moveTo(-5,1);c.lineTo(-6,-8);c.lineTo(-1,-5);c.lineTo(5,-9);c.lineTo(6,1);c.quadraticCurveTo(5,8,1,6);c.lineTo(-3,9);c.lineTo(-2,5);c.quadraticCurveTo(-7,6,-5,1);},null);oval(-2,-1,.7,1.3,'#486c83');oval(3,-1,.7,1.3,'#486c83');c.restore();
  }
 }
}

export function drawMichiNeon(a,p,form){
 if(form===2)return; // Melanistic coat stays black, without violet/neon body paint.
 const{c,stroke,oval}=a,colors=['#77ffe5','#ff88df','#ce94ff','#67fff0','#baffed'],col=colors[form];
 c.save();c.globalAlpha=.68+p.breath*.09;c.strokeStyle=col;c.shadowBlur=0;c.lineCap='round';
 const paths=[[-24,-29,-10,-31,0,-25],[-12,-50,0,-42,12,-50],[-31,-43,-15,-51,4,-46],[-14,-63,-1,-50,13,-63],[-15,-45,-8,-30,2,-19]],q=paths[form];
 c.globalAlpha=.15;stroke(col,5,()=>{c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[2],q[3],q[4],q[5]);});c.globalAlpha=.78+p.breath*.07;stroke(col,1.6,()=>{c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[2],q[3],q[4],q[5]);});
 // Three luminous fur marks, contained on the actor rather than a screen veil.
 const x=form===2?-13:form===4?-12:form===0?-15:-7,y=form===2?-34:form===4?-43:form===0?-21:form===3?-52:-35;
 for(let i=0;i<3;i++)stroke(col,1.1,()=>{c.moveTo(x+i*5,y);c.lineTo(x+i*5-2,y+5);});
 if(form===4){oval(0,-46,1.6,3,'#f1ffd9');}
 c.restore();
}

// Bound to the far hand; pages and runes are visual, never autonomous attacks.
export function drawMichiGrimoire(a,p,x,y){const{c,shape,stroke,oval}=a;
 c.save();c.translate(x,y-2);c.rotate(p.still?-.12:-.12+Math.sin(p.t*.04)*.035-(p.charge||0)*.1+(p.brake||0)*.08);
 shape('#342b50',()=>{c.moveTo(-12,-15);c.lineTo(0,-12);c.lineTo(12,-15);c.lineTo(12,6);c.lineTo(0,9);c.lineTo(-12,6);},'#15263a');
 shape('#d9d8ba',()=>{c.moveTo(-10,-13);c.lineTo(-1,-10);c.lineTo(-1,6);c.lineTo(-10,4);},null);shape('#f0e7c8',()=>{c.moveTo(1,-10);c.lineTo(10,-13);c.lineTo(10,4);c.lineTo(1,6);},null);
 stroke('#80718f',.75,()=>{for(let i=0;i<3;i++){c.moveTo(-8,-8+i*4);c.lineTo(-3,-6+i*4);c.moveTo(3,-6+i*4);c.lineTo(8,-8+i*4);}});oval(0,6,1.2,2.4,'#e7bd81');c.restore();
}
