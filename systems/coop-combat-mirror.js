// OHANA shared enemy presentation: bounded, host-authored cosmetic state.
// This does not grant network peers the ability to deal damage to the host.
const finite=(x,f=0)=>Number.isFinite(x)?x:f;
const bound=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const num=(x,lo,hi)=>bound(finite(x),lo,hi);
const eFlags=["telegraph","wind","hopWind","clawWind","phase","flash","stun","dying","fell","attackT","charge"];
const projectile=(p)=>({
 x:num(p.x,-4096,20000),y:num(p.y,-4096,20000),w:num(p.w,1,256),
 h:num(p.h,1,256),vx:num(p.vx,-60,60),vy:num(p.vy,-60,60),
 life:num(p.life,0,240),dmg:num(p.dmg,0,1000),color:typeof p.color==="string"&&/^#[0-9a-f]{3,8}$/i.test(p.color)?p.color:"#ffd36a",
 owner:"enemy"
});
export function captureCombatFrame(game,frameNo){
 return {
  roomId:String(game?.roomId||"").slice(0,24),frameNo:num(frameNo,0,1e9),
  enemies:(game?.enemies||[]).slice(0,24).map((e,i)=>({
    index:Number.isInteger(e.spawnIndex)?e.spawnIndex:(e.boss?-2:i),
    kind:String(e.kind||"").slice(0,30),boss:!!e.boss,
    x:num(e.x,-4096,20000),y:num(e.y,-4096,20000),
    vx:num(e.vx,-40,40),vy:num(e.vy,-40,40),
    hp:num(e.hp,0,100000),
    flags:Object.fromEntries(eFlags.filter(k=>typeof e[k]==="number"||typeof e[k]==="boolean")
       .map(k=>[k,typeof e[k]==="boolean"?e[k]:num(e[k],-1000,1000)]))
  })),
  bullets:(game?.projectiles||[]).filter(p=>p.owner!=="player"&&p.life>0)
    .slice(0,16).map(projectile)
 };
}
export function applyCombatFrame(game,frame){
 if(!frame||frame.roomId!==game?.roomId||!Array.isArray(frame.enemies)||frame.enemies.length>24||
 !Array.isArray(frame.bullets)||frame.bullets.length>16)return false;
 const targets=Array.isArray(game.enemies)?game.enemies:[];
 for(const item of frame.enemies){
  if(!item||typeof item.kind!=="string"||typeof item.x!=="number"||typeof item.y!=="number")continue;
  const target=targets.find((e,i)=>(Number.isInteger(e.spawnIndex)?e.spawnIndex:(e.boss?-2:i))===item.index
    &&e.kind===item.kind&&!!e.boss===item.boss);
  if(!target)continue;
  // Correct toward host without jolting across a room; teleports are immediate.
  const delta=Math.hypot(item.x-target.x,item.y-target.y);
  const factor=delta>250?1:.6;
  target.x+=bound(item.x-target.x,-600,600)*factor;
  target.y+=bound(item.y-target.y,-600,600)*factor;
  target.vx=num(item.vx,-40,40);target.vy=num(item.vy,-40,40);
  target.hp=num(item.hp,0,Math.max(1,finite(target.max,100000)));
  for(const k of eFlags)if(Object.hasOwn(item.flags||{},k)){
   const v=item.flags[k];
   if(typeof v==="boolean")target[k]=v;
   else if(typeof v==="number"&&Number.isFinite(v))target[k]=num(v,-1000,1000);
  }
 }
 game.coopRemoteEnemyBullets=frame.bullets.filter(p=>p&&
  ["x","y","w","h","vx","vy","life"].every(k=>typeof p[k]==="number"&&Number.isFinite(p[k]))).map(projectile);
 return true;
}

/**
 * Guest-side prediction only. While host frames are fresh, never run a
 * second enemy brain on the guest: it could select a different target and
 * telegraph a different attack. Movement uses the host velocity and is
 * bounded to 12 simulation frames between incoming snapshots.
 */
export function advanceMirroredEnemies(game,frameAgeMs){
 if(!Array.isArray(game?.enemies)||!Number.isFinite(frameAgeMs)||frameAgeMs<0||frameAgeMs>=750)return false;
 const speed=frameAgeMs<=220?1:frameAgeMs<=440?.6:.2;
 for(const enemy of game.enemies){
  if(!enemy||enemy.hp<=0||enemy.dying||enemy.fell)continue;
  const dx=num(enemy.vx,-40,40)*speed,dy=num(enemy.vy,-40,40)*speed;
  enemy.x=num(enemy.x+dx,-4096,20000);
  enemy.y=num(enemy.y+dy,-4096,20000);
  if(enemy.flash>0)enemy.flash=Math.max(0,enemy.flash-1);
  if(enemy._hitT>0)enemy._hitT=Math.max(0,enemy._hitT-1);
 }
 return true;
}
