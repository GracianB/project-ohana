// Authored constellations: each outline follows its hero, not a shared polygon.
// Live Canvas only. The sky uses slow parallax; neon stays behind the terrain.
export const REALM_SIGNATURES=Object.freeze({
 kilo:{color:'#ffb8db',points:[[-28,12],[-31,-15],[-17,-27],[-12,-44],[0,-35],[12,-44],[17,-27],[31,-15],[28,12],[15,30],[-15,30],[-28,12]]},
 stitcho:{color:'#63e8ff',points:[[-20,8],[-43,-38],[-15,-22],[0,-27],[15,-22],[43,-38],[20,8],[28,30],[0,22],[-28,30],[-20,8]]},
 chispin:{color:'#ffe465',points:[[-20,3],[-29,-42],[-9,-25],[10,-25],[27,-43],[23,0],[40,-8],[30,10],[45,8],[22,31],[-20,31],[-20,3]]},
 cat:{color:'#d9acff',points:[[-27,12],[-20,-15],[-29,-42],[-6,-25],[0,-46],[6,-25],[29,-42],[20,-15],[27,12],[10,30],[-10,30],[-27,12]]},
 cuerno:{color:'#90ffcf',points:[[-32,20],[-24,-5],[-5,-18],[0,-48],[7,-22],[24,-14],[34,0],[22,8],[15,28],[-9,28],[-22,37],[-32,20]]},
 dragon:{color:'#ff9b60',points:[[0,-36],[15,-20],[49,-35],[38,3],[18,-3],[22,26],[42,37],[6,30],[-18,30],[-18,-3],[-38,3],[-49,-35],[-15,-20],[0,-36]]},
 dino:{color:'#b9ff78',points:[[-35,24],[-25,-7],[-17,-30],[0,-39],[24,-31],[34,-12],[15,-7],[18,22],[39,33],[5,30],[-10,37],[-16,22],[-35,24]]},
 frita:{color:'#ffcc64',points:[[-29,31],[-32,-4],[-23,-4],[-23,-37],[-12,-37],[-12,-17],[-5,-17],[-5,-45],[5,-45],[5,-17],[13,-17],[13,-35],[24,-35],[24,-4],[32,-4],[29,31],[-29,31]]},
 pizza:{color:'#ff997f',points:[[-37,-29],[0,-42],[37,-29],[28,-18],[0,40],[-28,-18],[-37,-29],[0,-20],[37,-29]]},
 yomi:{color:'#88fff0',points:[[-25,4],[-25,-25],[-9,-36],[0,-36],[0,-49],[0,-36],[13,-36],[26,-25],[26,4],[15,13],[20,34],[0,25],[-20,34],[-15,13],[-25,4]]}
});
export function drawRealmSignatures(c,hero,cam,W,H,t,reduced=false){
 const art=REALM_SIGNATURES[hero];if(!art)return;
 c.save();c.lineJoin='round';c.lineCap='round';
 // A constellation remains in the upper sky, readable in daylight as well.
 const span=Math.min(170,W*.25),x=W*.40-Math.sin((cam.x||0)*.00015)*W*.05,y=H*.20;
 c.translate(x,y);c.scale(span/100,span/100);
 c.strokeStyle='#172d53';c.lineWidth=3;c.globalAlpha=.45;
 c.beginPath();art.points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();
 c.strokeStyle=art.color;c.lineWidth=.9;c.globalAlpha=.9;c.stroke();
 art.points.forEach(([px,py],i)=>{c.globalAlpha=reduced?.85:.70+.25*Math.sin(t*.018+i);c.fillStyle=art.color;c.beginPath();c.arc(px,py,i%3?1.4:2,0,Math.PI*2);c.fill();});c.restore();
 // Small anchored lantern sculptures, not bright lines over opponents.
 c.save();c.lineJoin='round';
 const first=Math.floor((cam.x-300)/1300);
 for(let i=first;i<=first+Math.ceil(W/1300)+1;i++){
  const nx=420+i*1300-cam.x,ny=1075-cam.y;if(nx< -80||nx>W+80)continue;
  c.save();c.translate(nx,ny);c.fillStyle='#233b4d';c.fillRect(-4,-78,8,137);c.fillRect(-18,51,36,8);
  c.translate(0,-85);c.scale(.42,.42);c.beginPath();art.points.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));
  c.strokeStyle='#172637';c.lineWidth=9;c.stroke();c.strokeStyle=art.color;c.lineWidth=4;c.stroke();
  c.strokeStyle='#fff7de';c.lineWidth=1;c.stroke();c.restore();
 }c.restore();
}
