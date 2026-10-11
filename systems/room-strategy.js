// V288: hand-authored optional footholds. Deliberately avoid the central
// descent gaps used for room-to-room pit travel.
export const STRATEGIC_LEDGES=Object.freeze({
 hub:[[660,730,180,22],[1480,780,170,22]],
 beach:[[610,890,170,22],[1640,630,160,22]],
 jungle:[[570,710,180,22],[1460,740,170,22]],
 cave:[[710,650,170,22],[1450,640,190,22]],
 lab:[[1020,900,170,22],[1480,740,170,22]],
 ridge:[[620,630,180,22],[1570,760,170,22]],
 space:[[690,620,175,22],[1340,730,180,22]],
 reef:[[710,920,180,22],[1420,760,180,22]],
 volcano:[[650,820,180,22],[1370,890,180,22]],
 boss:[[580,820,180,22],[1480,820,180,22]]
});
export function strategicLedgesFor(roomId,platforms,worldWidth=2240){
 const extras=STRATEGIC_LEDGES[roomId]||[];
 return extras.filter(([x,y,w,h])=>
  x>=0&&y>=0&&w>0&&h>0&&x+w<=worldWidth&&
  !(platforms||[]).some(p=>p[0]===x&&p[1]===y&&p[2]===w&&p[3]===h)
 ).map(p=>p.slice());
}
