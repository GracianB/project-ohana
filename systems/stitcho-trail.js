// Stitcho's first playable route within the shared Claro, independent of Kilo's song.
// Three timed beacons must be activated in order; progress persists in the hero save.
export const STITCHO_BEACONS=Object.freeze([
  Object.freeze({id:'stitcho-spark',x:430,y:1074,label:'CHISPA'}),
  Object.freeze({id:'stitcho-echo',x:1720,y:1090,label:'ECO'}),
  Object.freeze({id:'stitcho-star',x:3050,y:1084,label:'ESTRELLA'})
]);
const SAVE_KEY='stitcho-trail-v1';
export function enterStitchoTrail(g){
  if(g.roomId!=='hub'||g.player?.id!=='stitcho'){g.stitchoTrail=null;return;}
  const saved=g.secrets?.hub||[];
  const complete=saved.includes(SAVE_KEY);
  g.stitchoTrail={index:complete?STITCHO_BEACONS.length:0,complete,pulse:0,last:''};
}
export function stitchoTrailPrompt(g){
  const s=g.stitchoTrail,p=g.player;
  if(!s||s.complete||!p||p.dead)return '';
  const b=STITCHO_BEACONS[s.index];
  return b&&Math.hypot(p.x+p.w/2-b.x,p.y+p.h/2-b.y)<105
    ?'E · activar '+b.label.toLowerCase()+' ('+(s.index+1)+'/3)':'';
}
export function interactStitchoTrail(g){
  const s=g.stitchoTrail,p=g.player;
  if(!s||s.complete||!p||p.dead)return false;
  const b=STITCHO_BEACONS[s.index];
  if(!b||Math.hypot(p.x+p.w/2-b.x,p.y+p.h/2-b.y)>=105)return false;
  s.index++;s.pulse=70;s.last=b.label;
  if(s.index===STITCHO_BEACONS.length){
    s.complete=true;
    g.secrets||={};g.secrets.hub||=[];
    if(!g.secrets.hub.includes(SAVE_KEY)){
      g.secrets.hub.push(SAVE_KEY);
      g.score=(g.score||0)+600;
      p.xp=(p.xp||0)+30;
      g.save?.();
    }
  }
  g.nums?.add?.(b.x,b.y-55,s.complete?'¡RUTA DE STITCHO COMPLETA!':b.label+' · '+s.index+'/3','#aee9ff',true);
  return true;
}
export function updateStitchoTrail(g){if(g.stitchoTrail)g.stitchoTrail.pulse=Math.max(0,g.stitchoTrail.pulse-1);}
export function drawStitchoTrail(ctx,g,cam,t){
  const s=g.stitchoTrail;if(!s)return;
  ctx.save();
  STITCHO_BEACONS.forEach((b,i)=>{
    const x=b.x-cam.x,y=b.y-cam.y;
    const active=i===s.index&&!s.complete,done=i<s.index;
    ctx.globalAlpha=done?.55:active?1:.22;
    ctx.strokeStyle=done?'#88ffd5':'#9de8ff';ctx.lineWidth=3;
    const bob=g.reduceMotion?0:Math.sin(t*.045+i)*5;
    ctx.beginPath();ctx.moveTo(x,y-50+bob);ctx.lineTo(x+22,y-25+bob);ctx.lineTo(x,y+bob);ctx.lineTo(x-22,y-25+bob);ctx.closePath();ctx.stroke();
    ctx.fillStyle=done?'#88ffd5':'#dff8ff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
    ctx.fillText(b.label,x,y-63+bob);
  });
  ctx.restore();
}
export function stitchoTrailSnapshot(g){const s=g.stitchoTrail;return s?{index:s.index,complete:s.complete,last:s.last}:null;}
