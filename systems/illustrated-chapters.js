// One decoded chapter plate per active room, with a spare for transitions.
// Gameplay terrain, threats and interactions remain real Canvas actors on top.
const HEROES=new Set(['stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi','final']);
const plates=new Map();
function plate(hero){
 let p=plates.get(hero);if(p)return p;
 if(typeof Image==='undefined')return null;
 p={image:new Image(),ready:false};plates.set(hero,p);
 p.image.onload=()=>{p.ready=true;};p.image.src=new URL(hero==='final'?'../assets/scenes/observatory-keyart.png':`../assets/scenes/${hero}-realm.webp`,import.meta.url).href;
 while(plates.size>2){const key=plates.keys().next().value;if(key===hero)break;plates.delete(key);}
 return p;
}
export function drawIllustratedChapter(c,hero,cam,W,H){
 if(!HEROES.has(hero))return false;const p=plate(hero);if(!p?.ready)return false;
 const im=p.image,scale=Math.max(W*1.28/im.width,H*1.08/im.height),w=im.width*scale,h=im.height*scale;
 const travel=Math.max(0,w-W),pan=Math.max(0,Math.min(1,(cam.x||0)/11500));
 c.drawImage(im,-travel*pan,Math.min(0,(H-h)*.55-(cam.y||0)*.012),w,h);
 // A thin near-ground atmospheric veil ties painted distance to live geometry.
 const shade=c.createLinearGradient(0,H*.68,0,H);shade.addColorStop(0,'#081c2900');shade.addColorStop(1,'#081c292c');c.fillStyle=shade;c.fillRect(0,H*.68,W,H*.32);
 return true;
}
