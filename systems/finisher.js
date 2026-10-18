export function finisherCharge(player){return Math.max(0,Math.min(100,Number(player?.finisherCharge)||0));}
export function chargeFinisher(game,damage){
 const p=game?.player,d=Number(damage);if(!p||p.dead||!(d>0)||p._finisherActive)return 0;
 const tick=Number(game.t)||0,window=Math.floor(tick/24);
 if(p._chargeWindow!==window){p._chargeWindow=window;p._chargeEarned=0;}
 const action=Number(p._chargeAction)||0;
 if(p._chargeSource!==action){p._chargeSource=action;p._chargeActionEarned=0;}
 const gain=Math.max(0,Math.min(24-(p._chargeActionEarned||0),16-(p._chargeEarned||0),Math.ceil(d*.2),100-finisherCharge(p)));
 p._chargeActionEarned=(p._chargeActionEarned||0)+gain;
 p._chargeEarned=(p._chargeEarned||0)+gain;p.finisherCharge=finisherCharge(p)+gain;return gain;
}
export function consumeFinisher(p){if(finisherCharge(p)<100)return false;p.finisherCharge=0;return true;}
