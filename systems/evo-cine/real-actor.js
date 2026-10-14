import cat from '../../characters/art/cat.js';
import chispin from '../../characters/art/chispin.js';
import pizza from '../../characters/art/pizza.js';
import yomi from '../../characters/art/yomi.js';
import {R} from '../../characters/rig.js';
import {flatCtx} from './stitcho.js';
const ART={cat,chispin,pizza,yomi};
const HEIGHT={cat:[72,88,94,108,116],chispin:[80,94,105,114,125],pizza:[102,107,129,135,134],yomi:[66,86,92,98,116]};
export function drawEvolutionActor(ctx,id,x,y,s,form,t){
 const f=Math.max(0,Math.min(4,(form|0)-1));
 ctx.save();ctx.translate(x,y);const size=id==='cat'||id==='yomi'?52:68;ctx.scale(s*size/HEIGHT[id][f],s*size/HEIGHT[id][f]);
 ART[id].draw(flatCtx(ctx),{form:f,state:'idle',t:t*60,phase:0,look:{x:.2,y:0},reduceMotion:true,flourish:0,cast:0,atk:0},R);
 ctx.restore();
}
