// Combat tuning is separate from artwork. Marks use the simulation clock.
export const CHISPA_KIT=Object.freeze([
 {chain:20,targets:2,reach:270,dash:145,storm:18,interval:24},
 {chain:24,targets:3,reach:310,dash:170,storm:21,interval:23},
 {chain:27,targets:4,reach:340,dash:198,storm:23,interval:22},
 {chain:30,targets:5,reach:370,dash:218,storm:25,interval:21},
 {chain:34,targets:5,reach:400,dash:240,storm:28,interval:20},
].map(Object.freeze));
export const chispaKit=evo=>CHISPA_KIT[Math.max(0,Math.min(4,Number(evo)|0))];
export function chispaMarked(enemy,t){return Number.isFinite(enemy?._chispaMarkUntil)&&enemy._chispaMarkUntil>t;}
export function chispaStormTarget(enemies,x,y,t){
 let best=null,score=Infinity;
 for(const e of enemies||[]){
  if(!e||e.hp<=0||e.dying||e.fell)continue;
  const d=Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y);
  if(d>700)continue;
  const value=d-(chispaMarked(e,t)?800:0);
  if(value<score){score=value;best=e;}
 }return best;
}
