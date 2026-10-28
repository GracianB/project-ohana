// Small, outlined Canvas keepsakes. Their silhouettes differ from gold XP gems.
export const MEMORY_PICKUPS = Object.freeze({
  kilo: {name:'Pétalo de canción', plural:'pétalos de canción'},
  stitcho: {name:'Engranaje de la nave', plural:'engranajes de la nave'},
  chispin: {name:'Bobina de tormenta', plural:'bobinas de tormenta'},
  cat: {name:'Perla de sueño', plural:'perlas de sueño'},
  cuerno: {name:'Lazo de aurora', plural:'lazos de aurora'},
  dragon: {name:'Llama ancestral', plural:'llamas ancestrales'},
  dino: {name:'Ámbar fósil', plural:'ámbares fósiles'},
  frita: {name:'Frasco de especias', plural:'frascos de especias'},
  pizza: {name:'Tomate de albahaca', plural:'tomates de albahaca'},
  yomi: {name:'Farol de memoria', plural:'faroles de memoria'}
});
const TAU=Math.PI*2;
function path(c,fill,draw,ink='#263747',width=1.6){c.beginPath();draw();c.fillStyle=fill;c.fill();if(ink){c.strokeStyle=ink;c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,fill,ink){path(c,fill,()=>c.ellipse(x,y,rx,ry,0,0,TAU),ink);}
function line(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function star(c,x,y,r,fill){path(c,fill,()=>{for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,s=i%2?r*.3:r;c.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}c.closePath();},null);}

export function drawMemoryPickup(c,hero,x,y,{phase=0,challenge=false,reduceMotion=false}={}){
  if(!MEMORY_PICKUPS[hero])return;
  const sway=reduceMotion?0:Math.sin(phase)*.08;
  c.save();c.translate(x,y);c.rotate(sway);c.lineCap='round';c.lineJoin='round';
  switch(hero){
    case 'kilo':
      path(c,'#efb7b0',()=>{c.moveTo(-10,6);c.bezierCurveTo(-15,-5,-2,-16,9,-13);c.bezierCurveTo(17,0,5,13,-10,6);c.closePath();});
      line(c,'#fff5dd',1,()=>{c.moveTo(-7,6);c.quadraticCurveTo(0,0,8,-9);});break;
    case 'stitcho': {
      c.rotate(reduceMotion?0:Math.sin(phase*.35)*.15);
      path(c,'#91bddd',()=>{for(let i=0;i<32;i++){const a=i*TAU/32,r=i%4<2?13:10;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();});
      oval(c,0,0,7,7,'#2b5269','#263747');oval(c,0,0,4,4,'#a8ffe0','#477e8b');
      line(c,'#edf9ff',1.4,()=>{c.moveTo(-9,-5);c.lineTo(-6,-9);c.lineTo(-2,-9);});
      break;
    }
    case 'chispin':
      path(c,'#6d698b',()=>c.roundRect(-8,-11,16,23,4));
      path(c,'#f4c47d',()=>c.roundRect(-11,-12,22,5,2));path(c,'#f4c47d',()=>c.roundRect(-11,8,22,5,2));
      for(let j=0;j<4;j++)line(c,j%2?'#c78755':'#ffe3a0',2.8,()=>{c.moveTo(-7,-6+j*4);c.quadraticCurveTo(0,-2+j*4,7,-6+j*4);});
      star(c,11,-11,5,'#efffff');break;
    case 'cat':
      line(c,'#a38cc4',1.4,()=>{for(const dx of [-5,0,5]){c.moveTo(dx,5);c.bezierCurveTo(dx-5,12,dx+5,13,dx-1,18);}});
      path(c,'#e4d6f4',()=>{c.moveTo(0,-15);c.bezierCurveTo(2,-11,12,-6,10,3);c.bezierCurveTo(8,12,-8,12,-10,3);c.bezierCurveTo(-12,-6,-2,-11,0,-15);c.closePath();},'#75658f');
      oval(c,0,0,5.8,6.5,'#fff8f0',null);oval(c,-3,-4,2,2.8,'#fff',null);star(c,11,-11,3,'#f4d39c');break;
    case 'cuerno':
      for(const [r,color] of [[14,'#bfa9e7'],[11,'#99daca'],[8,'#f3ca90']])line(c,color,3,()=>c.arc(0,1,r,Math.PI*1.08,Math.PI*1.92));
      path(c,'#efd8f3',()=>{c.moveTo(0,1);c.bezierCurveTo(-18,-15,-18,14,-2,7);c.bezierCurveTo(16,18,20,-13,0,1);c.closePath();},'#75658f');
      oval(c,0,4,3,3,'#fff4cf','#88738d');
      line(c,'#fff4cf',1,()=>{c.moveTo(-10,0);c.lineTo(-4,3);c.moveTo(5,6);c.lineTo(11,7);});break;
    case 'dragon':
      path(c,'#ee8d69',()=>{c.moveTo(-2,-17);c.bezierCurveTo(7,-9,4,-7,10,-10);c.bezierCurveTo(17,10,4,18,-6,12);c.bezierCurveTo(-17,6,-6,-3,-8,-9);c.quadraticCurveTo(-5,-5,-2,-17);},'#804647');
      path(c,'#ffe6a8',()=>{c.moveTo(1,-5);c.bezierCurveTo(1,2,9,2,5,10);c.quadraticCurveTo(-6,15,-7,5);c.quadraticCurveTo(-1,7,1,-5);},null);
      oval(c,-1,7,2,3,'#fff7d4',null);break;
    case 'dino':
      path(c,'#d6a963',()=>{c.moveTo(-7,-12);c.quadraticCurveTo(7,-17,12,-6);c.lineTo(10,10);c.quadraticCurveTo(0,18,-11,9);c.lineTo(-14,-3);c.closePath();},'#665648');
      path(c,'#efcc8a',()=>{c.moveTo(-8,-9);c.lineTo(2,-12);c.lineTo(-6,10);c.lineTo(-10,6);c.closePath();},null);
      line(c,'#735e42',2,()=>{for(let i=0;i<=32;i++){const a=i*.2,r=.25+i*.18;c.lineTo(Math.cos(a)*r+1,Math.sin(a)*r+1);}});
      line(c,'#fff0c5',1.4,()=>{c.moveTo(-8,-5);c.lineTo(-6,-9);c.lineTo(-2,-10);});break;
    case 'frita':
      path(c,'#c0e0cc',()=>{c.moveTo(-4,-9);c.lineTo(-4,-4);c.quadraticCurveTo(-12,0,-10,9);c.quadraticCurveTo(0,16,10,9);c.quadraticCurveTo(12,0,4,-4);c.lineTo(4,-9);c.closePath();},'#506e65');
      path(c,'#e9b972',()=>{c.moveTo(-8,3);c.quadraticCurveTo(0,6,8,3);c.lineTo(8,9);c.quadraticCurveTo(0,13,-8,9);c.closePath();},null);
      path(c,'#b98a67',()=>c.roundRect(-6,-12,12,5,2));oval(c,-5,0,1.5,3,'#fff8de',null);
      line(c,'#608f69',1.6,()=>{c.moveTo(0,-12);c.lineTo(3,-18);});oval(c,5,-16,4,2,'#91b97c','#608f69');break;
    case 'pizza':
      path(c,'#dc7769',()=>{c.moveTo(0,-8);c.bezierCurveTo(-17,-18,-17,11,-3,13);c.bezierCurveTo(12,18,20,-9,7,-10);c.closePath();},'#855048');
      path(c,'#83ac78',()=>{c.moveTo(0,-7);c.lineTo(-9,-12);c.lineTo(-3,-12);c.lineTo(-3,-18);c.lineTo(2,-12);c.lineTo(9,-16);c.lineTo(6,-10);c.lineTo(12,-7);c.closePath();},'#4d755f',1.2);
      line(c,'#ffd2a9',2.4,()=>{c.moveTo(-8,-3);c.quadraticCurveTo(-11,1,-8,5);});break;
    case 'yomi':
      line(c,'#83b5c9',1.6,()=>{c.arc(0,-13,4,Math.PI,TAU);c.moveTo(0,13);c.lineTo(0,18);});
      path(c,'#83b5c9',()=>{c.moveTo(-12,-8);c.lineTo(-5,-13);c.lineTo(5,-13);c.lineTo(12,-8);c.closePath();});
      path(c,'#263d65',()=>c.roundRect(-10,-8,20,22,4),'#a9dae2');
      path(c,'#76bcce',()=>c.roundRect(-6,-5,12,15,3),null);star(c,0,2,5.5,'#f7efc7');
      line(c,'#d1eeec',1,()=>{c.moveTo(-7,-4);c.lineTo(-7,7);});break;
  }
  if(challenge){star(c,-15,-12,3.4,'#fff1c3');star(c,15,9,2.3,'#fff1c3');}
  c.restore();
}
