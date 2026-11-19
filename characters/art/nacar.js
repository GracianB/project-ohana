import {drawRecoveredMarine} from './cat.js';
function draw(c,p={}){c.save();if(p.nacarWelcome&&!p.reduceMotion){c.translate(0,-(p.nacarWelcome.float||0)*8);c.rotate((p.nacarWelcome.greet||0)*.1);}drawRecoveredMarine(c,p);c.restore();}
export default {id:'nacar',draw,cacheKey:p=>'tide:'+Math.floor((p.reduceMotion?0:p.t||0)/2)+':'+Math.round((p.nacarWelcome?.float||0)*20)};
