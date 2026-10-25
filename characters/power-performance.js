export const POWER_PERFORMANCE_LENGTH=Object.freeze({kilo:72,stitcho:44,chispin:38,cat:52,dragon:78,dino:84,frita:42,pizza:58,yomi:68,cuerno:40});
const clamp=x=>Math.max(0,Math.min(1,x));
const PERFORMANCES=Object.freeze({
 kilo:{slot:0,lean:-.24,lift:.04,release:'victory'},
 stitcho:{slot:0,lean:.32,lift:.06,release:'attack'},
 chispin:{slot:0,lean:-.34,lift:.12,release:'attack'},
 cat:{slot:1,lean:.48,lift:.08,release:'attack'},
 dragon:{slot:0,lean:-.28,lift:.12,release:'glide'},
 dino:{slot:2,lean:-.3,lift:.04,release:'attack'},
 frita:{slot:0,lean:.32,lift:.08,release:'jump'},
 pizza:{slot:1,lean:.42,lift:.1,release:'attack'},
 yomi:{slot:2,lean:-.22,lift:.09,release:'attack'},
 cuerno:{slot:0,lean:-.28,lift:.08,release:'victory'}
});

// Visual timing only: this never moves the player's collision body.
export function applyPowerPerformance(pose,p,t){
 const cast=p._powerPerformance,def=PERFORMANCES[p.id];
 if(!cast||!def||p.dead||pose.state==='hurt')return pose;
 const age=t-cast.start,duration=cast.index===3?Math.round(POWER_PERFORMANCE_LENGTH[p.id]*1.5):cast.index===5?POWER_PERFORMANCE_LENGTH[p.id]+24:POWER_PERFORMANCE_LENGTH[p.id];
 if(age<0||age>=duration)return pose;
 const wind=clamp(age/10),release=clamp((age-10)/12),settle=1-clamp((age-22)/(duration-22));
 pose.powerBeat=age<10?'anticipation':age<22?'release':'recovery';
 pose.powerProgress=age/duration;
 pose.castSlot=cast.index===3?3:def.slot;pose.cast=Math.max(.15,settle);pose.atk=Math.max(pose.atk||0,age>=10?settle*.85:0);
 if(!pose.air)pose.state=age<10?'cast':def.release;
 if(pose.reduceMotion){pose.powerLift=0;return pose;}
 const pulse=age<10?-wind:Math.sin(release*Math.PI)*settle;
 pose.bodyTilt=(pose.bodyTilt||0)+def.lean*pulse;
 pose.headTilt=(pose.headTilt||0)-def.lean*pulse*.45;
 pose.armSwing=age<10?-wind:Math.sin(release*Math.PI)*settle;
 pose.powerLift=age<10?0:Math.sin(release*Math.PI)*def.lift*settle;
 pose.squash=Math.min(.18,Math.max(pose.squash||0,age<10?wind*.13:0));
 pose.anticipation=age<10?wind:0;pose.impact=age>=10&&age<18?1-(age-10)/8:0;
 return pose;
}
