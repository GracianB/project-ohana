// White/gold thunder spirits. Atlas geometry measured from opaque sprite pixels.
const METRICS=[[0, 0, 198, 195, 56, 65, 150, 175], [198, 0, 198, 195, 45, 65, 152, 177], [396, 0, 198, 195, 38, 46, 167, 176], [594, 0, 198, 195, 49, 63, 161, 176], [792, 0, 198, 195, 41, 50, 155, 174], [990, 0, 198, 195, 33, 53, 133, 176], [1188, 0, 198, 195, 12, 55, 154, 171], [1386, 0, 198, 195, 36, 48, 171, 176], [0, 195, 198, 185, 35, 22, 150, 166], [198, 195, 198, 185, 28, 23, 161, 166], [396, 195, 198, 185, 32, 24, 165, 153], [594, 195, 198, 185, 31, 22, 161, 166], [792, 195, 198, 185, 28, 26, 173, 140], [990, 195, 198, 185, 35, 23, 198, 168], [1188, 195, 198, 185, 0, 23, 164, 168], [1386, 195, 198, 185, 18, 25, 180, 165], [0, 380, 198, 180, 31, 19, 173, 160], [198, 380, 198, 180, 26, 19, 185, 158], [396, 380, 198, 180, 24, 19, 193, 159], [594, 380, 198, 180, 21, 21, 198, 162], [792, 380, 198, 180, 0, 14, 194, 155], [990, 380, 198, 180, 50, 19, 160, 170], [1188, 380, 198, 180, 4, 32, 183, 164], [1386, 380, 198, 180, 20, 20, 181, 164], [0, 560, 198, 205, 34, 14, 169, 184], [198, 560, 198, 205, 27, 15, 185, 185], [396, 560, 198, 205, 32, 17, 183, 185], [594, 560, 198, 205, 31, 16, 171, 185], [792, 560, 198, 205, 22, 16, 170, 183], [990, 560, 198, 205, 31, 16, 175, 187], [1188, 560, 198, 205, 22, 22, 181, 181], [1386, 560, 198, 205, 17, 18, 181, 183], [0, 765, 198, 228, 23, 4, 178, 189], [198, 765, 198, 228, 22, 9, 179, 190], [396, 765, 198, 228, 30, 13, 184, 190], [594, 765, 198, 228, 20, 6, 177, 193], [792, 765, 198, 228, 20, 10, 181, 192], [990, 765, 198, 228, 28, 7, 186, 191], [1188, 765, 198, 228, 16, 12, 178, 189], [1386, 765, 198, 228, 17, 8, 181, 194]];
const KIRIN_METRICS=[[0, 0, 272, 724, 25, 245, 253, 503], [272, 0, 271, 724, 11, 264, 258, 502], [543, 0, 271, 724, 12, 265, 271, 501], [814, 0, 272, 724, 0, 260, 272, 503], [1086, 0, 272, 724, 0, 261, 272, 472], [1358, 0, 271, 724, 0, 228, 271, 479], [1629, 0, 271, 724, 0, 245, 271, 502], [1900, 0, 272, 724, 0, 223, 258, 504]];
let atlas=null,kirin=null,ready=false,loading=null;
const number=(v,f=0)=>Number.isFinite(v)?v:f;
const wrap=(v,n)=>((v%n)+n)%n;
export function chispaSpriteFrame(pose={}){
 const row=Math.max(0,Math.min(4,pose.form|0)),state=pose.state||'idle';
 let col=0;
 if(state==='run')col=pose.reduceMotion?1:1+Math.floor(wrap(number(pose.phase),Math.PI*2)/(Math.PI*2)*4);
 else if(['jump','fall','glide','wall','hurt'].includes(state))col=5;
 else if(state==='attack')col=6;
 else if(state==='cast'||(!pose.reduceMotion&&number(pose.chispinWelcome?.charge)>.5))col=7;
 return row*8+col;
}
export function preloadChispaAtlas(){
 if(loading)return loading;
 if(typeof Image==='undefined')return Promise.resolve(false);
 const load=path=>new Promise(resolve=>{const image=new Image();image.decoding='async';image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=new URL(path,import.meta.url).href;});
 loading=Promise.all([load('../../assets/sprites/chispa-white-gold-v3.png'),load('../../assets/sprites/chispa-kirin-four-legs-v4.png')]).then(images=>{
  [atlas,kirin]=images;ready=!!atlas&&!!kirin;return ready;
 });return loading;
}
export function chispaAtlasStatus(){return {ready,width:atlas?.naturalWidth||0,height:atlas?.naturalHeight||0};}
export function chispaSpriteCacheKey(pose){return `${ready?'thunder-v4':'fallback'}:${chispaSpriteFrame(pose)}`;}
export function drawChispaSprite(ctx,pose){
 if(!ready)return false;
 const frame=chispaSpriteFrame(pose),isKirin=Math.floor(frame/8)===2;
 const m=isKirin?KIRIN_METRICS[frame%8]:METRICS[frame],base=isKirin?KIRIN_METRICS[0]:METRICS[Math.floor(frame/8)*8];
 const scale=100/(base[7]-base[5]),center=(m[4]+m[6])/2;
 ctx.save();
 if(pose.state==='dead'){ctx.translate(0,-18);ctx.rotate(-Math.PI*.45);ctx.scale(.9,.9);}
 ctx.drawImage(isKirin?kirin:atlas,m[0],m[1],m[2],m[3],-center*scale,-m[7]*scale,m[2]*scale,m[3]*scale);
 ctx.restore();return true;
}
preloadChispaAtlas();
