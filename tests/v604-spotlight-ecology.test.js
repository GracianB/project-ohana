import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_THEMES,WORLD1_ORDER,buildWorld1HeroRoom} from '../systems/world1-rooms.js';
import {welcomeSpotlightAllows,welcomeSpotlightSpot} from '../systems/welcome-spotlight.js';
test('V604: five authored and actual species in every chapter',()=>{
 for(const hero of WORLD1_ORDER){const cast=WORLD1_THEMES[hero].cast;
  assert.equal(cast.length,5,hero);assert.equal(new Set(cast).size,5,hero);
  const foes=new Set(buildWorld1HeroRoom(hero).foes.filter(f=>!f[4]?.special).map(f=>f[2]));
  for(const kind of cast)assert.ok(foes.has(kind),hero+' missing '+kind);
 }
});
test('V604: opening stages only the featured pair',()=>{
 const d={hero:'dragon',partner:'dino'},base={x:10,foot:20,slotWidth:10,row:2};
 assert.equal(welcomeSpotlightAllows('dragon',d),true);
 assert.equal(welcomeSpotlightAllows('dino',d),true);
 assert.equal(welcomeSpotlightAllows('pizza',d),false);
 assert.equal(welcomeSpotlightAllows('pizza',null),false);
 const a=welcomeSpotlightSpot('dragon',base,1200,720,90,d),b=welcomeSpotlightSpot('dino',base,1200,720,90,d);
 assert.ok(a.x>420&&a.x<516);assert.ok(b.x>720&&b.x<840);
 assert.equal(a.row,0);assert.equal(b.row,0);
 assert.equal(welcomeSpotlightSpot('pizza',base,1200,720,90,d),base);
 assert.equal(welcomeSpotlightAllows('kilo',null),true);
 assert.equal(welcomeSpotlightSpot('kilo',base,1200,720,90,null).row,0);
});
