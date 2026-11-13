// Attached visual trails and a truthful flight reserve. No simulation/particle allocation.
export function drawMichiAura(c,p,H,t,reduced=false){
 if(p.id!=='cat'||p.dead)return;
 const flying=!!p._michiWingAir&&!p.grounded,ghost=p.evo===4;const moving=Math.abs(p.vx||0)>1;if(!flying&&!ghost&&!moving)return;
 if(ghost)H*=.7; // Match the compact spirit instead of its unchanged physical box.
 c.save();c.lineCap='round';
 if(!reduced&&(ghost||moving))for(let i=0;i<3;i++){
  const drift=Math.sin(t*.06+i)*H*.035,x=-H*(.25+i*.09),y=-H*(.35+i*.15);
  c.globalAlpha=(ghost?.22:.18)-i*.035;c.strokeStyle=['#77ffe5','#ff88df','#ce94ff','#67fff0','#bbfff2'][p.evo||0];c.lineWidth=ghost?2:1.2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-H*.22,y+drift,x-H*.38,y+H*.08+drift);c.stroke();
 }
 if(p.evo===1&&flying){const pct=Math.max(0,Math.min(1,(p._michiWingFuel||0)/(p._michiWingMax||210))),w=32,y=-H-9;
  c.globalAlpha=.9;c.fillStyle='#122d40';c.fillRect(-w/2-2,y-2,w+4,6);c.fillStyle=pct>.25?'#b9e4e1':'#e9b080';c.fillRect(-w/2,y,w*pct,2);
 }
 c.restore();
}
