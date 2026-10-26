// The ten personal things the Echo stole. Independent of combat/save engine.
export const KEEPSAKE_ORDER=Object.freeze(['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']);
export const KEEPSAKES=Object.freeze({
 kilo:{name:'Tabla del hogar',guardian:'Tambor de la marea',key:'_drummer',pattern:'tide',color:'#ebc38e',memory:'La primera ola daba miedo. Volver a la orilla siempre fue volver a casa.'},
 stitcho:{name:'Peluche verde',guardian:'Aracne de los remiendos',key:'_glitch',pattern:'crossfire',color:'#9fd1c6',memory:'Tiene una costura torcida. Por eso sabe que este abrazo es suyo.'},
 chispin:{name:'Cascabel de tormenta',guardian:'Titán del cielo partido',key:'_titan',pattern:'lightning',color:'#f4dfa1',memory:'Antes de aprender a rugir, hizo sonar este pequeño cascabel.'},
 cat:{name:'Cinta de luna',guardian:'León del eclipse',key:'_astralCat',pattern:'moons',color:'#d5b6df',memory:'El nudo nunca quedó perfecto. Nadie quiso deshacerlo.'},
 cuerno:{name:'Primer pincel',guardian:'Ciervo de la aurora',key:'_prismBeast',pattern:'charge',color:'#b5dfc6',memory:'La primera aurora fue una mancha de color compartida.'},
 dragon:{name:'Farol del nido',guardian:'Wyvern de la brasa antigua',key:'_igneousDragon',pattern:'fire',color:'#eeb79b',memory:'Una llama pequeña fue suficiente para que nadie durmiera a oscuras.'},
 dino:{name:'Huevo del mañana',guardian:'Coloso del cascarón',key:'_stoneColossus',pattern:'quake',color:'#d5dcae',memory:'Todavía no ha nacido. Ya tiene una familia esperándolo.'},
 frita:{name:'Receta de casa',guardian:'Rey del mercado dorado',key:'_crispyKing',pattern:'geysers',color:'#f0cf9b',memory:'Las manchas de esta receta también son parte del sabor.'},
 pizza:{name:'Pala del primer horno',guardian:'Chef de la medianoche',key:'_magmaChef',pattern:'discs',color:'#eac3a0',memory:'Con esta pala salió la primera cena para todos.'},
 yomi:{name:'Cinta de las voces',guardian:'Custodio del último archivo',key:'_spiritGuide',pattern:'prism',color:'#add8dc',memory:'Una grabación imperfecta. Diez voces que nunca quiere olvidar.'}
});
export const KEEPSAKE_SAVE_KEY='ohana-keepsakes-v1';
export function cleanKeepsakes(value){return Array.isArray(value)?KEEPSAKE_ORDER.filter(id=>value.includes(id)):[];}
export function readKeepsakes(storage=globalThis.localStorage){try{return cleanKeepsakes(JSON.parse(storage?.getItem(KEEPSAKE_SAVE_KEY)||'[]'));}catch{return [];}}
export function rememberKeepsake(hero,storage=globalThis.localStorage){if(!KEEPSAKES[hero])return false;const found=readKeepsakes(storage);if(found.includes(hero))return false;try{storage?.setItem(KEEPSAKE_SAVE_KEY,JSON.stringify([...found,hero]));return true;}catch{return false;}}
const TAU=Math.PI*2;
function line(c,color,width,fn){c.strokeStyle=color;c.lineWidth=width;c.beginPath();fn();c.stroke();}
function form(c,color,fn){c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#27384d';c.lineWidth=2;c.stroke();}
function oval(c,x,y,rx,ry,col,a=0){form(c,col,()=>c.ellipse(x,y,rx,ry,a,0,TAU));}
export function drawKeepsake(c,hero,x,y,size=80,{ghost=false}={}){
 if(!KEEPSAKES[hero])return;c.save();c.translate(x,y);c.scale(size/100,size/100);c.lineJoin='round';c.lineCap='round';if(ghost)c.globalAlpha*=.3;
 if(hero==='kilo'){
  c.rotate(.18);const g=c.createLinearGradient(-24,-90,22,0);g.addColorStop(0,'#fff0c7');g.addColorStop(.5,'#dcae82');g.addColorStop(1,'#8b6d69');
  form(c,g,()=>{c.moveTo(0,-100);c.bezierCurveTo(40,-68,28,-17,0,0);c.bezierCurveTo(-28,-17,-40,-68,0,-100);});line(c,'#eb979f',6,()=>{c.moveTo(0,-91);c.quadraticCurveTo(9,-50,0,-7);});for(let i=0;i<5;i++)oval(c,Math.cos(i*TAU/5)*9,-56+Math.sin(i*TAU/5)*9,7,4,'#f7c4c0',i*TAU/5);oval(c,0,-56,4,4,'#ffe6a5');
 }else if(hero==='stitcho'){
  oval(c,-25,-65,11,23,'#80ac7c',-.4);oval(c,25,-65,11,23,'#80ac7c',.4);oval(c,0,-39,28,31,'#a3c78d');oval(c,0,-72,28,24,'#b5d29a');for(const side of [-1,1]){oval(c,side*12,-73,5,5,'#34505b');oval(c,side*24,-31,8,17,'#8eb57f',side*.5);oval(c,side*13,-7,11,8,'#86a779');}line(c,'#4f725e',1.7,()=>{c.moveTo(-9,-59);c.quadraticCurveTo(0,-53,10,-60);c.moveTo(0,-45);c.lineTo(4,-15);});for(let k=0;k<4;k++)line(c,'#e8e0b8',1.4,()=>{c.moveTo(-2,-39+k*6);c.lineTo(6,-41+k*6);});
 }else if(hero==='dino'){
  const g=c.createRadialGradient(-12,-56,2,0,-40,48);g.addColorStop(0,'#fff2d3');g.addColorStop(.5,'#dbe1b3');g.addColorStop(1,'#7b9f83');form(c,g,()=>{c.moveTo(0,-96);c.bezierCurveTo(-35,-77,-44,-14,-19,-5);c.quadraticCurveTo(0,7,23,-6);c.bezierCurveTo(45,-23,29,-84,0,-96);});for(const [a,b,r]of[[-12,-65,8],[14,-46,11],[-16,-24,10],[2,-12,4]])oval(c,a,b,r,r*.7,'#88aa7f',.4);
 }else if(hero==='chispin'){
  line(c,'#d4b77f',4,()=>{c.moveTo(-3,-82);c.quadraticCurveTo(-22,-103,-20,-88);c.quadraticCurveTo(-14,-76,-3,-82);});form(c,'#ddc695',()=>{c.moveTo(-15,-78);c.quadraticCurveTo(-31,-63,-29,-26);c.lineTo(-37,-18);c.quadraticCurveTo(0,-2,37,-18);c.lineTo(28,-29);c.quadraticCurveTo(28,-67,14,-78);});oval(c,0,-16,35,10,'#af915f');oval(c,0,-10,8,9,'#ead5a4');line(c,'#fff0ba',3,()=>{c.moveTo(-17,-68);c.quadraticCurveTo(-25,-49,-21,-33);});
 }else if(hero==='cat'){
  line(c,'#917ba5',13,()=>{c.moveTo(-12,-5);c.bezierCurveTo(-39,-42,-32,-92,0,-78);c.bezierCurveTo(40,-100,47,-41,6,-28);c.quadraticCurveTo(-15,-21,-1,-7);});line(c,'#ead0de',7,()=>{c.moveTo(-12,-5);c.bezierCurveTo(-39,-42,-32,-92,0,-78);c.bezierCurveTo(40,-100,47,-41,6,-28);});form(c,'#ead7b4',()=>{c.moveTo(8,-48);c.quadraticCurveTo(39,-59,31,-79);c.quadraticCurveTo(52,-43,8,-48);});
 }else if(hero==='cuerno'){
  c.rotate(.38);form(c,'#a77865',()=>{c.moveTo(-6,-9);c.lineTo(-4,-66);c.lineTo(5,-66);c.lineTo(6,-9);c.quadraticCurveTo(0,3,-6,-9);});form(c,'#cbd4bb',()=>{c.moveTo(-10,-64);c.lineTo(-13,-79);c.lineTo(12,-79);c.lineTo(10,-64);});form(c,'#e9d5c7',()=>{c.moveTo(-13,-78);c.quadraticCurveTo(-18,-95,0,-109);c.quadraticCurveTo(10,-96,13,-78);});for(let k=0;k<4;k++)line(c,['#c398ba','#cfb67e','#a6c9b2','#9dbaca'][k],2,()=>{c.moveTo(-9+k*6,-80);c.lineTo(-7+k*5,-94);});
 }else if(hero==='dragon'){
  line(c,'#bfae85',4,()=>{c.moveTo(-12,-80);c.bezierCurveTo(-25,-109,25,-109,12,-80);});form(c,'#666b79',()=>{c.moveTo(-22,-82);c.lineTo(22,-82);c.lineTo(29,-17);c.lineTo(0,-2);c.lineTo(-29,-17);});form(c,'#ffe2a1',()=>{c.moveTo(-14,-72);c.lineTo(15,-72);c.lineTo(20,-24);c.lineTo(0,-14);c.lineTo(-20,-25);});form(c,'#e88d68',()=>{c.moveTo(-10,-31);c.quadraticCurveTo(-15,-45,3,-62);c.quadraticCurveTo(1,-42,11,-37);c.quadraticCurveTo(13,-21,-10,-31);});
 }else if(hero==='frita'){
  form(c,'#f1ddb4',()=>{c.moveTo(-31,-94);c.lineTo(22,-91);c.lineTo(34,-14);c.quadraticCurveTo(0,-2,-30,-13);});line(c,'#bc9b7e',2,()=>{c.moveTo(-18,-72);c.lineTo(12,-72);c.moveTo(-19,-59);c.lineTo(20,-59);c.moveTo(-17,-46);c.lineTo(15,-46);});oval(c,0,-25,13,7,'#d2b07e');line(c,'#aa806b',2,()=>{c.moveTo(0,-28);c.quadraticCurveTo(-11,-33,-6,-39);});
 }else if(hero==='pizza'){
  c.rotate(-.22);form(c,'#c89e77',()=>{c.moveTo(-5,-7);c.lineTo(-5,-58);c.bezierCurveTo(-44,-64,-32,-107,0,-108);c.bezierCurveTo(33,-108,43,-65,6,-58);c.lineTo(6,-7);c.quadraticCurveTo(0,3,-5,-7);});for(let k=-1;k<=1;k++)line(c,'#8f705f',1,()=>{c.moveTo(k*9,-97);c.quadraticCurveTo(k*8+5,-82,k*9,-67);});
 }else{
  form(c,'#6f9daa',()=>{c.moveTo(-36,-76);c.quadraticCurveTo(0,-88,36,-76);c.lineTo(34,-16);c.lineTo(-34,-16);});form(c,'#c7dfd3',()=>{c.moveTo(-27,-68);c.lineTo(26,-68);c.lineTo(26,-34);c.lineTo(-27,-34);});for(const side of [-1,1]){oval(c,side*14,-50,9,9,'#769caf');oval(c,side*14,-50,3,3,'#e9e5bc');}line(c,'#dbe8d4',2,()=>{c.moveTo(-20,-24);c.lineTo(20,-24);});
 }
 c.restore();
}
