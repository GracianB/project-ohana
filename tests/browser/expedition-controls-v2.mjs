// Real keyboard controller for the authored V2 discoveries. No state grants.
export async function advanceExpeditionControls(page,s,hero,step){
 const info=await page.evaluate(()=>({exp:window.__OHANA_E2E.expeditionState?.(),foes:window.__OHANA_E2E.roomCast()}));
 if(!info.exp||s.world1.done<s.world1.total||info.foes.some(e=>e.hp>0&&(e.chapterBoss||e.guardian||e.stitchoBoss||e.chispinBoss)))return null;
 const nodes=await page.evaluate(async hero=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].expedition?.nodes||[],hero);
 const node=nodes.find(n=>!info.exp.done.includes(n.id));if(!node)return null;
 const p=s.player,dy=node.y-p.y-p.h/2,ndx=node.x-p.x-p.w/2;
 let target=node.kind==='supper'&&info.exp.carry!==node.id?node.x-700:node.x,jump=false;
 if(node.kind==='nest'&&p.y+p.h/2>node.y+90)target=node.x-190;
 if(node.kind==='spice'&&p.grounded&&p.x+p.w/2<node.x-150)target=node.x-230;
 if(hero==='kilo'){
  if(s.kiloFlight?.mode!=='solar')await page.keyboard.press('k');
  if(Math.abs(dy)>20)await page.keyboard.down(dy>0?'s':'w');
  if(Math.abs(ndx)<150&&Math.abs(dy)<130)await page.keyboard.press('j');
 }else{
  if(['moon','spice'].includes(node.kind)&&p.grounded&&Math.abs(ndx)<100)jump=true;
  if(dy< -35&&Math.abs(ndx)<350&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps))jump=true;
  if(['cell','conductor','nest','archive'].includes(node.kind)&&Math.abs(ndx)<150&&Math.abs(dy)<130)await page.keyboard.press('j');
  if(node.kind==='plate'&&Math.abs(ndx)<140){if(p.grounded)jump=true;else if(p.vy>0)await page.keyboard.press('k');}
 }
 const dx=target-p.x-p.w/2;if(Math.abs(dx)>24)await page.keyboard.down(dx>0?'d':'a');
 if(info.foes.some(e=>e.hp>0&&Math.abs(e.x-p.x)<430)){await page.keyboard.press('h');await page.keyboard.press('j');}
 if(jump)await page.keyboard.down('w');
 let next=await step(jump?16:Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
 for(const key of ['d','a','w','s'])await page.keyboard.up(key);
 if(jump)next=await step(1);return next;
}
