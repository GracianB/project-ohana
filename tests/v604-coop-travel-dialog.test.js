import test from 'node:test';import assert from 'node:assert/strict';
import {travelDialogView} from '../systems/coop-travel-dialog-v604.js';
test('V604 co-op: host waits, guest accepts, both stats are visible and card expires',()=>{
 const vote={id:'travel:a-b-c',from:'w1-kilo',to:'w1-stitcho',createdAt:1000,status:'pending',players:['a1','b1'],accepted:['a1']};
 const snapshot={mode:'adventure',travel:vote,players:[{name:'Jugador 1',characterId:'dino',evolution:2,experience:230,health:80},{name:'Jugador 2',characterId:'cat',evolution:3,experience:300,health:55}]};
 const owner=travelDialogView(snapshot,'a1',1600),guest=travelDialogView(snapshot,'b1',1600);
 assert.equal(owner.waiting,true);assert.equal(guest.waiting,false);
 assert.equal(guest.players.length,2);assert.equal(guest.players[0].form,3);assert.equal(guest.players[1].xp,300);
 assert.equal(guest.to,'w1-stitcho');
 assert.equal(travelDialogView(snapshot,'b1',26000),null);
 assert.equal(travelDialogView({...snapshot,mode:'classic'},'b1',1600),null);
});
