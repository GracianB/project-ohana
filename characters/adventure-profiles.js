export const ADVENTURE_PROFILES=Object.freeze({
 kilo:{speed:.98,jump:1.04,hp:1,accel:1.04,brake:.94},stitcho:{speed:1.02,jump:1,hp:1,accel:1.1,brake:.98},chispin:{speed:1.06,jump:1,hp:.94,accel:1.12,brake:1.02},cat:{speed:1.02,jump:1.04,hp:1,accel:1.16,brake:.9},dragon:{speed:.96,jump:1,hp:1.04,accel:.92,brake:1.02},dino:{speed:.94,jump:.98,hp:1.08,accel:.84,brake:1.04},frita:{speed:1.07,jump:1,hp:.96,accel:1.06,brake:1.08},pizza:{speed:.98,jump:1.05,hp:1.02,accel:.94,brake:1.04},yomi:{speed:1,jump:1.02,hp:1,accel:.96,brake:.98},cuerno:{speed:1,jump:1,hp:1,accel:1.02,brake:1}
});
export function adventureProfile(id){return ADVENTURE_PROFILES[id]||ADVENTURE_PROFILES.kilo;}
export function adventureRoster(def){const p=adventureProfile(def.id),round=x=>Math.round(x*100)/100;const forms=def.forms.map(f=>({...f,speed:round(f.speed*p.speed),jump:round(f.jump*p.jump),hp:Math.round(f.hp*p.hp)}));return {...def,forms,speed:forms[0].speed,jumpPower:forms[0].jump,health:forms[0].hp};}
