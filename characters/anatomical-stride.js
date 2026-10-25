// The phase drives the artists' actual elbows, knees, paws, tail and wing rigs.
// A weighted stance lasts longer than its swing; this is not a whole-body bob.
export const STRIDE_PROFILES=Object.freeze({
 kilo:{stance:1.2,tempo:.9,landing:.8},stitcho:{stance:.85,tempo:1.15,landing:1},
 chispin:{stance:.75,tempo:1.25,landing:1.1},cat:{stance:1.05,tempo:1.05,landing:.7},
 dragon:{stance:1.2,tempo:.82,landing:1.15},dino:{stance:1.55,tempo:.74,landing:1.4},
 frita:{stance:.8,tempo:1.2,landing:1.15},pizza:{stance:1.15,tempo:.95,landing:1.2},
 yomi:{stance:.9,tempo:.8,landing:.55},cuerno:{stance:.78,tempo:1.24,landing:.9}
});
export function articulateStride(pose,id){
 const profile=STRIDE_PROFILES[id];if(!profile||pose.reduceMotion)return pose;
 const phase=(Number(pose.phase)||0)*profile.tempo;
 // Preserve cycle continuity while shortening airborne foot recovery.
 const cycle=Math.floor((phase+Math.PI)/(Math.PI*2));
 pose.phase=cycle*Math.PI*2+Math.atan2(Math.sin(phase)*profile.stance,Math.cos(phase));
 pose.land=Math.min(1,(Number(pose.land)||0)*profile.landing);
 return pose;
}
