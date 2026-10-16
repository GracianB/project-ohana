import {damageEnemy} from './mutations.js';
import {markAt} from '../characters/signature.js';
import {ROSTER} from '../characters/roster.js';
export const STAR_TICKS=600;
export const STAR_STYLES=Object.freeze({kilo:['#ffd1a1','♪'],stitcho:['#a6d8ff','✧'],chispin:['#ffe88b','ϟ'],cat:['#edb6e8','☾'],dragon:['#ffba85','♨'],dino:['#c4e69a','◆'],frita:['#f8d09b','≋'],pizza:['#f8e49b','△'],yomi:['#cab5e9','◇'],cuerno:['#dfb8f3','✦']});
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function actorBox(p){const f=ROSTER.find(r=>r.id===(p.id||p.characterId))?.forms[p.evo??p.evolution??0];return {x:p.x,y:p.y,w:p.w||f?.w||24,h:p.h||f?.h||34};}
export function createStars(room,scale=1){
 const fallback=room.plats?.find(p=>p[2]>=300&&p[1]>=600);
 const points=room.stars|| (fallback?[[fallback[0]+Math.min(520,fallback[2]/2),fallback[1]-34]]:[]);
 return points.slice(0,4).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])).map(p=>({x:p[0]*scale,y:p[1]*scale,taken:false}));
}
export function updateStellar(game,{authority=true,remote=null,onStart=()=>{},onEnd=()=>{}}={}){
 const actors=[game.player,...(remote?[remote]:[])].filter(Boolean);
 for(const p of actors){if(p.starLeft>0){p.starLeft=Math.max(0,p.starLeft-1);if(!p.starLeft)onEnd(p);}if(p.dead||p.health<=0)p.starLeft=0;}
 if(!authority)return;
 for(const star of game.stars||[]){if(star.taken)continue;for(const p of actors){if(p.dead||p.health<=0)continue;const box=actorBox(p);if(Math.hypot(box.x+box.w/2-star.x,box.y+box.h/2-star.y)<38){star.taken=true;p.starLeft=STAR_TICKS;onStart(p);break;}}}
 for(const p of actors){if(!(p.starLeft>0)||p.dead)continue;
  for(const e of game.enemies||[]){if(!e||e.hp<=0||e.dying||!overlap(actorBox(p),e))continue;
   if(e.boss){if(e.invuln>0||e.vulnerable===false)continue;const key=p===game.player?'_starHostHit':'_starGuestHit';if((e[key]??-60)+60>(game.t||0))continue;e[key]=game.t||0;damageEnemy(e,Math.ceil(markAt(p.id||p.characterId,p.evo??p.evolution).dmg*.55));}
   else {damageEnemy(e,e.hp);e.starDefeated=true;e.canSplit=false;e.split=false;}
   e.flash=10;
  }
 }
}
export function starSnapshot(game,remote){return {mask:(game.stars||[]).reduce((mask,s,i)=>mask|(s.taken?1<<i:0),0),host:Math.max(0,Math.min(600,Math.floor(game.player?.starLeft||0))),guest:Math.max(0,Math.min(600,Math.floor(remote?.starLeft||0)))};}
export function validStarSnapshot(value){return !!value&&Number.isInteger(value.mask)&&value.mask>=0&&value.mask<=15&&['host','guest'].every(k=>Number.isInteger(value[k])&&value[k]>=0&&value[k]<=600);}
export function applyStarSnapshot(game,value){if(!validStarSnapshot(value))return false;for(const [i,s] of (game.stars||[]).entries())s.taken=!!(value.mask&(1<<i));if(game.player)game.player.starLeft=value.guest;if(game.coopRemote)game.coopRemote.starLeft=value.host;return true;}
function starPath(ctx,x,y,r,rotation=0){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+rotation+i*Math.PI/5,rr=i%2?r*.49:r;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;if(i)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);}ctx.closePath();}
export function drawStars(ctx,stars,cam,t,reduce=false){for(const s of stars||[]){if(s.taken)continue;const x=s.x-cam.x,y=s.y-cam.y+(reduce?0:Math.sin(t*.06)*5);ctx.save();starPath(ctx,x,y,19,reduce?0:Math.sin(t*.025)*.12);ctx.fillStyle='#ffe6a1';ctx.strokeStyle='#6c577d';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.fillStyle='#584669';ctx.beginPath();ctx.ellipse(x-5,y-1,2,3,0,0,7);ctx.ellipse(x+5,y-1,2,3,0,0,7);ctx.fill();ctx.restore();}}
export function drawStellarActor(ctx,p,cam,t,reduce=false){if(!p||p.dead||!(p.starLeft>0))return;const [color,glyph]=STAR_STYLES[p.id]||STAR_STYLES.kilo,x=p.x+p.w/2-cam.x,y=p.y+p.h*.45-cam.y,r=Math.max(28,p.h*.72);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(x,y,r,r*1.05,0,0,7);ctx.stroke();ctx.font='700 17px Outfit,sans-serif';ctx.fillStyle=color;ctx.textAlign='center';for(let i=0;i<3;i++){const a=i*Math.PI*2/3+(reduce?0:t*.035);ctx.fillText(glyph,x+Math.cos(a)*r,y+Math.sin(a)*r+5);}if(p.starLeft<=180){ctx.globalAlpha=1;ctx.fillStyle='#fff2be';ctx.font='800 15px Outfit,sans-serif';ctx.fillText(String(Math.ceil(p.starLeft/60)),x,y-r-12);}ctx.restore();}
