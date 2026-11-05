import {drawMichiEye} from './michi-eyes.js';
// Michicornio bebé · a moon kitten sculpted from connected fur contours.
// Character-space only: fixed foot origin, simulation-owned resources and clocks.
const TAU = Math.PI * 2;
const P = Object.freeze({
  ink: '#51425f', coat: '#f5eafa', shade: '#cdb8dc', deep: '#aa8cbd',
  light: '#fff9ef', rose: '#e9b6ce', ear: '#d591bb', gold: '#e5bb75'
});
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
const unit = v => Math.max(0, Math.min(1, finite(v)));
const STATES = new Set(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']);

function shape(c, color, trace, width = 1.15) {
  c.beginPath(); trace(); c.closePath(); c.fillStyle = color; c.fill();
  if (width) { c.strokeStyle = P.ink; c.lineWidth = width; c.stroke(); }
}
function line(c, color, width, trace) {
  c.beginPath(); trace(); c.strokeStyle = color; c.lineWidth = width; c.stroke();
}
function oval(c, x, y, rx, ry, color, angle = 0) {
  shape(c, color, () => c.ellipse(x, y, rx, ry, angle, 0, TAU), 0);
}

// A wrist grows out of its shoulder and narrows before widening into soft toes.
// Neither the knee nor the ankle is an exposed circle or a cylindrical sleeve.
function limb(c, hip, paw, far, hind = false, tuck = 0) {
  const color = far ? P.shade : P.coat;
  const bend = hind ? -5 : 2;
  const contour = () => {
    c.moveTo(hip.x - (hind ? 6 : 3.6), hip.y - 1);
    c.bezierCurveTo(hip.x - 9 + bend, hip.y + 9, paw.x - 5, paw.y - 10 - tuck, paw.x - 6, paw.y - 4);
    c.bezierCurveTo(paw.x - 11, paw.y - 2, paw.x - 8, paw.y + 1, paw.x - 3, paw.y + 1);
    c.bezierCurveTo(paw.x + 2, paw.y + 2, paw.x + 11, paw.y + 1, paw.x + 10, paw.y - 2);
    c.quadraticCurveTo(paw.x + 9, paw.y - 5, paw.x + 3, paw.y - 5);
    c.bezierCurveTo(paw.x + 1, paw.y - 12 - tuck, hip.x + 6, hip.y + 8, hip.x + (hind ? 6 : 4), hip.y - 2);
  };
  shape(c, color, contour, 0);
  // Open shoulder edge lets the limb merge into its torso instead of a sleeve.
  line(c, P.ink, 1.1, contour);
  if (!far) {
    shape(c, P.light, () => {
      c.moveTo(paw.x - 6, paw.y - 3); c.quadraticCurveTo(paw.x + 1, paw.y - 7, paw.x + 8, paw.y - 2);
      c.quadraticCurveTo(paw.x + 1, paw.y, paw.x - 6, paw.y - 3);
    }, 0);
    for (const dx of [3, 6.5]) line(c, P.deep, .5, () => {
      c.moveTo(paw.x + dx, paw.y - 2.3); c.quadraticCurveTo(paw.x + dx + .3, paw.y - .5, paw.x + dx - .2, paw.y + .3);
    });
  }
}
function ear(c, x, y, turn, far) {
  c.save(); c.translate(x, y); c.rotate(turn);
  shape(c, far ? P.shade : P.coat, () => {
    c.moveTo(-7, 4); c.bezierCurveTo(-12, -8, -11, -22, -6, -28);
    c.bezierCurveTo(-3, -33, 7, -15, 8, -4); c.quadraticCurveTo(8, 3, 3, 6);
  });
  shape(c, far ? P.ear : P.rose, () => {
    c.moveTo(-4, -1); c.quadraticCurveTo(-8, -13, -5.5, -23);
    c.quadraticCurveTo(1, -16, 3.5, -3); c.quadraticCurveTo(0, 0, -4, -1);
  }, 0);
  line(c, far ? P.deep : P.light, 1, () => {
    c.moveTo(-8, -7); c.quadraticCurveTo(-10, -17, -6, -26);
  });
  // The soft inward tuft belongs to the ear root.
  shape(c, P.light, () => {
    c.moveTo(-4, 4); c.quadraticCurveTo(-4, -2, -1, -5);
    c.quadraticCurveTo(-1, 0, 3, 1); c.quadraticCurveTo(2, 6, -4, 4);
  }, 0);
  c.restore();
}
function eye(c,x,y,scale,r){
 drawMichiEye(c,x,y,7.2*scale,{closed:r.closed,happy:r.happy,look:{x:r.gaze,y:0}});
}
function face(c, r) {
  c.save(); c.translate(7 + r.reach * 2.4, -44 + r.headY); c.rotate(r.headTilt);
  // Both eyes share the same frontal facial plane. The nose stays between them.
  // The coat may face right, while the kitten turns its whole head toward us.
  ear(c, -15, -11, -.22 + r.earFar, true);
  ear(c, 14, -12, .18 + r.earNear, false);
  shape(c, P.coat, () => {
    c.moveTo(-24, -6); c.bezierCurveTo(-27, -19, -13, -28, 1, -26);
    c.bezierCurveTo(16, -27, 27, -19, 26, -7);
    c.quadraticCurveTo(25, -1, 29, 2); c.quadraticCurveTo(26, 4, 23, 4);
    c.quadraticCurveTo(28, 7, 27, 9); c.quadraticCurveTo(23, 10, 21, 9);
    c.bezierCurveTo(17, 18, 6, 21, -4, 19);
    c.quadraticCurveTo(-18, 18, -22, 9); c.quadraticCurveTo(-27, 10, -28, 7);
    c.quadraticCurveTo(-25, 4, -23, 3); c.quadraticCurveTo(-29, 2, -29, 0);
    c.quadraticCurveTo(-25, -2, -24, -6);
  }, 1.35);
  // Layered planes follow brow, cheeks and jaw rather than a flat geometric mask.
  shape(c, P.shade, () => {
    c.moveTo(-24, 2); c.bezierCurveTo(-19, 13, 0, 18, 19, 11);
    c.quadraticCurveTo(11, 22, -3, 19); c.quadraticCurveTo(-20, 18, -24, 2);
  }, 0);
  shape(c, '#fff6fa', () => {
    c.moveTo(-20, -11); c.bezierCurveTo(-17, -24, 3, -28, 17, -18);
    c.quadraticCurveTo(4, -24, -4, -17); c.quadraticCurveTo(-12, -19, -20, -11);
  }, 0);
  shape(c, P.light, () => {
    c.moveTo(-16, 6); c.quadraticCurveTo(-9, 1, -2, 6);
    c.quadraticCurveTo(2, 8, 6, 6); c.quadraticCurveTo(13, 0, 20, 7);
    c.quadraticCurveTo(20, 16, 5, 17); c.quadraticCurveTo(-9, 19, -16, 6);
  }, 0);
  eye(c, -10, -3.5, .94, r); eye(c, 11, -3.5, 1, r);
  oval(c, -17, 7.4, 3.9, 1.8, P.rose); oval(c, 19, 7.2, 3.7, 1.8, P.rose);
  // Nose, philtrum and paired muzzle lobes are one centered construction.
  shape(c, '#d697ae', () => {
    c.moveTo(-1, 7.8); c.quadraticCurveTo(2.4, 5.4, 6, 7.8);
    c.quadraticCurveTo(6, 9.3, 2.5, 11); c.quadraticCurveTo(-.6, 9.3, -1, 7.8);
  }, .65);
  if (r.open > .05) {
    shape(c, '#66445f', () => {
      c.moveTo(-2.5, 12); c.quadraticCurveTo(2, 11.3, 7.5, 12);
      c.quadraticCurveTo(5, 15 + r.open * 3, 2.5, 15 + r.open * 3);
      c.quadraticCurveTo(-1.5, 15 + r.open * 2, -2.5, 12);
    }, .7);
    oval(c, 3, 15 + r.open, 2.7, 1.1, '#ec9fb9');
  }
  line(c, P.ink, .9, () => {
    c.moveTo(2.5, 11); c.lineTo(2.5, 12.2);
    c.quadraticCurveTo(-1, 15.2, -4.8, 12.2); c.moveTo(2.5, 12.2);
    c.quadraticCurveTo(6, 15.1, 9.8, 11.8);
  });
  for (const side of [-1, 1]) for (let i = 0; i < 2; i++) line(c, P.deep, .5, () => {
    const x = 2.5 + side * 13, y = 9 + i * 2.8;
    c.moveTo(x, y); c.quadraticCurveTo(2.5 + side * 23, y - 1, 2.5 + side * 29, y - 3 + i * 1.7);
  });
  // Crown fur has a flow, with one attached ivory horn bud and moon birthmark.
  shape(c, P.light, () => {
    c.moveTo(-7, -24); c.quadraticCurveTo(-4, -32, 0, -29);
    c.quadraticCurveTo(3, -34, 8, -26); c.quadraticCurveTo(3, -29, 1, -24);
    c.quadraticCurveTo(-2, -28, -7, -24);
  }, .7);
  shape(c, '#ffebbc', () => {
    c.moveTo(-.5, -28); c.quadraticCurveTo(-1.5, -34, 3.4, -38);
    c.quadraticCurveTo(7.6, -32, 7, -27); c.quadraticCurveTo(3, -25, -.5, -28);
  }, .85);
  line(c, '#c69b5f', .65, () => {
    c.moveTo(.1, -30.3); c.quadraticCurveTo(3.7, -28.9, 6.7, -31);
  });
  line(c, P.light, .8, () => { c.moveTo(1.6, -30); c.quadraticCurveTo(1.6, -33, 3.3, -35.3); });
  shape(c, P.gold, () => {
    c.moveTo(3, -20); c.bezierCurveTo(-4.8, -21, -4.8, -12.5, 3, -13.5);
    c.bezierCurveTo(-1.6, -15, -1.6, -18.4, 3, -20);
  }, 0);
  c.restore();
}

export function drawMoonKitten(c, p = {}) {
  const state = STATES.has(p.state) ? p.state : 'idle';
  const reduced = !!p.reduceMotion, dead = state === 'dead';
  const t = reduced || dead ? 0 : finite(p.t), phase = reduced ? 0 : finite(p.phase, t * .27);
  const run = state === 'run', jump = state === 'jump', fall = state === 'fall';
  const air = jump || fall || state === 'glide', hurt = state === 'hurt', victory = state === 'victory';
  const reach = state === 'attack' ? Math.sin(Math.PI * (reduced ? .5 : unit(finite(p.atk, .5)))) : 0;
  const spell = state === 'cast' ? Math.sin(Math.PI * (reduced ? .5 : unit(finite(p.cast, .5)))) : 0;
  const power = Number.isInteger(p.michiPowerIndex) ? p.michiPowerIndex : Math.trunc(finite(p.castSlot, -1));
  const step = run ? Math.sin(phase) : 0, follow = run ? Math.sin(phase - .7) : 0;
  const breath = reduced ? 0 : Math.sin(t * .062), w = p.michiWelcome || {};
  const inspect = reduced ? 0 : unit(w.inspect), groom = reduced ? 0 : unit(w.groom), purr = reduced ? 0 : unit(w.purr);
  const land = reduced ? 0 : unit(p.land), blink = dead || hurt || (!reduced && (t + 29) % 199 < 6);
  const headTilt = hurt ? -.15 : state === 'wall' ? -.13 : victory ? -.09 : -follow * .035 + inspect * .12 - groom * .055;
  const r = {
    reach, headY: jump ? -2 : fall ? 1 : victory ? -2 : land * 2,
    headTilt, earFar: hurt ? -.28 : jump ? -.2 : follow * -.065 - inspect * .2,
    earNear: hurt ? .22 : jump ? -.1 : follow * -.085 + inspect * .16,
    closed: blink || purr > .75, happy: victory || purr > .3,
    gaze: Math.max(-1, Math.min(1, finite(p.look?.x, .3))) * .5 + inspect * .2,
    open: Math.max(reach * .55, victory ? .45 : 0, power === 5 ? spell * .5 : 0),
    focus: reach * .65
  };
  if (spell) {
    r.headTilt += (power === 1 ? .12 : power === 3 ? -.14 : power === 5 ? -.1 : .02) * spell;
    r.earFar -= spell * (power === 1 ? .28 : power === 4 ? .35 : .1);
    r.earNear += spell * (power === 1 ? .24 : power === 4 ? .18 : .08);
    r.headY -= spell * (power === 2 ? 4 : power === 4 ? 3 : 0);
  }
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.translate(reach * 2 - hurt * 2, run ? -Math.max(0, step) * 3.7 : breath * .4 + land * 2);
  c.rotate(dead ? .5 : jump ? -.045 : state === 'glide' ? .06 : hurt ? -.07 : 0);
  if (dead) c.translate(-3, -12);
  // Rooted plume tail: broad at the rump, delicately tapered at its lifted tip.
  const lag = reduced ? 0 : Math.sin(t * .058) * 2.4 - follow * 5;
  c.save(); c.translate(-19, -21); c.rotate(hurt ? -.25 : inspect * .14 + purr * .17);
  shape(c, P.shade, () => {
    c.moveTo(3, 5); c.bezierCurveTo(-15, 6, -30, -4, -27, -18 + lag);
    c.bezierCurveTo(-26, -28 + lag, -16, -31 + lag, -13, -23 + lag);
    c.quadraticCurveTo(-11, -16 + lag, -17, -13 + lag);
    c.quadraticCurveTo(-20, -13 + lag, -19, -18 + lag);
    c.bezierCurveTo(-23, -9, -13, -2, 4, -2);
  });
  shape(c, P.light, () => {
    c.moveTo(-25, -23 + lag); c.quadraticCurveTo(-20, -32 + lag, -14, -25 + lag);
    c.quadraticCurveTo(-11, -17 + lag, -17, -13 + lag);
    c.quadraticCurveTo(-17, -18 + lag, -20, -18 + lag);
    c.quadraticCurveTo(-20, -22 + lag, -25, -23 + lag);
  }, 0);
  line(c, '#e6d6ed', .8, () => { c.moveTo(-21, -9); c.quadraticCurveTo(-15, -3, -3, -1); });
  c.restore();
  const hind = {x: -15 + step * 8, y: jump ? -10 : fall ? -1 : -1 - Math.max(0, Math.cos(phase)) * run * 5};
  let fore = {x: 15 - step * 7 + reach * 19, y: jump ? -15 : fall ? 1 : victory ? -21 : -1 - Math.max(0, Math.cos(phase + .8)) * run * 5};
  if (state === 'wall') fore = {x: 24, y: -39};
  if (state === 'glide') fore = {x: 28, y: -19};
  if (hurt) fore = {x: 13, y: -18};
  if (spell) {
    const poses = [[30,-14],[10,-16],[21,-35],[34,-5],[27,-31],[25,-24]];
    const target = poses[power] || [24,-17];
    fore = {x: fore.x + (target[0] - fore.x) * spell, y: fore.y + (target[1] - fore.y) * spell};
  }
  fore.y -= groom * 14;
  limb(c, {x:-17,y:-20}, {x:hind.x-6,y:hind.y-1}, true, true, air ? 2 : 0);
  limb(c, {x:10,y:-27}, {x:fore.x-6,y:fore.y-2}, true, false, air ? 2 : 0);
  // The pear-shaped haunch, spine, breast and belly share one continuous mass.
  shape(c, P.coat, () => {
    c.moveTo(-25, -18); c.bezierCurveTo(-31, -33, -17, -42, -4, -38);
    c.bezierCurveTo(5, -37, 13, -35, 19, -30); c.bezierCurveTo(27, -26, 26, -13, 16, -9);
    c.quadraticCurveTo(4, -3, -9, -6); c.quadraticCurveTo(-22, -7, -25, -18);
  }, 1.3);
  shape(c, P.shade, () => {
    c.moveTo(-25, -19); c.bezierCurveTo(-16, -9, 5, -10, 22, -19);
    c.quadraticCurveTo(21, -9, 7, -6); c.quadraticCurveTo(-18, -2, -25, -19);
  }, 0);
  shape(c, '#fff5fa', () => {
    c.moveTo(-23, -28); c.quadraticCurveTo(-18, -40, -5, -35);
    c.quadraticCurveTo(-1, -35, 4, -31); c.quadraticCurveTo(-13, -34, -23, -28);
  }, 0);
  // Hip fur is implied by a short fold, not a detached round haunch.
  line(c, P.deep, .65, () => { c.moveTo(-22, -19); c.quadraticCurveTo(-24, -27, -15, -30); });
  limb(c, {x:-16,y:-19}, hind, false, true, air ? 2 : 0);
  shape(c, P.light, () => {
    c.moveTo(6,-33); c.quadraticCurveTo(13,-39,20,-31);
    c.quadraticCurveTo(22,-22,20,-19); c.quadraticCurveTo(18,-20,17,-22);
    c.quadraticCurveTo(15,-15,13,-16); c.lineTo(11,-21);
    c.quadraticCurveTo(7,-18,6,-21); c.quadraticCurveTo(8,-26,6,-33);
  }, .75);
  limb(c, {x:12,y:-27}, fore, false, false, air ? 2 : 0);
  face(c, r);
  c.restore();
}
