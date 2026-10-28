// V617 — Observatorio Astral de Yomi EXTREMO
// Fauna cuántica con más personalidad, glitch, runas y colores familiares.
// 100% vector, determinista (hash), sin Math.random en arte.

const TAU = Math.PI * 2;
const FAM = ["#eb554a","#5ad1ff","#ffe14a","#c9a8ff","#ff6a2a","#4cbf56","#f0b43a","#e0402a","#f2c1ff","#4ff0c8"];

function hn(i){const x=Math.sin(i*127.1+11.7)*43758.5453;return x-Math.floor(x);}

export function drawYomiCreature(ctx, e, cam, t, reduced = false) {
  if (!e || (e.roomId !== 'w1-yomi' && !e._yomiEncounter && !e.roomPersona?.yomiEncounter)) return false;
  const kind = e.kind || e._species;
  if (!['ufo','phosquito','brasita','medusa','murcielago'].includes(kind)) return false;

  const x = e.x + e.w / 2 - cam.x, y = e.y + e.h - cam.y, facing = e.facing || 1;
  const hurt = e.invuln > 0 || e.stun > 4;
  const glitch = hurt && !reduced ? Math.floor(hn(t * 0.3 + (e.spawnIndex||0)) * 6) - 3 : 0;

  ctx.save();
  ctx.translate(x + glitch, y);
  ctx.scale(facing, 1);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  if (kind === 'ufo') {
    const hover = reduced ? 0 : Math.sin(t * 0.14 + (e.spawnIndex||0)) * 7;
    ctx.translate(0, -24 + hover);
    ctx.fillStyle = hurt ? '#fff' : '#f4f7ff';
    ctx.strokeStyle = '#2a3160'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 11, 0, 0, TAU); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + t * 0.04;
      const lx = Math.cos(a) * 20, ly = Math.sin(a) * 7;
      ctx.fillStyle = FAM[i % FAM.length];
      ctx.beginPath(); ctx.arc(lx, ly, 2.2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(79,240,200,0.85)';
    ctx.beginPath(); ctx.arc(0, -5, 13, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#4ff0c8'; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -6, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0d1430';
    ctx.beginPath(); ctx.arc(facing > 0 ? 1.5 : -1.5, -6, 2, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7986cb'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -28); ctx.stroke();
    ctx.fillStyle = '#ffd56b';
    ctx.beginPath(); ctx.arc(0, -30, 3.5, 0, TAU); ctx.fill();
  } else if (kind === 'phosquito') {
    const flap = reduced ? 0 : Math.sin(t * 0.32) * 16;
    ctx.translate(0, -22 + Math.sin(t * 0.11) * 4);
    ctx.fillStyle = hurt ? '#fff' : '#0d1430';
    ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 6.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
    for (let side of [-1, 1]) {
      ctx.save(); ctx.scale(side, 1);
      ctx.fillStyle = 'rgba(79,240,200,0.28)';
      ctx.strokeStyle = '#80deea';
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.quadraticCurveTo(18, -28 + flap, 32, -22 + flap);
      ctx.quadraticCurveTo(26, 2 + flap * 0.4, 6, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ffd56b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(18, -18 + flap); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#4ff0c8';
    ctx.beginPath(); ctx.arc(15, 0, 5.5, 0, TAU); ctx.fill();
  } else if (kind === 'brasita') {
    const bob = reduced ? 0 : Math.sin(t * 0.13 + (e.spawnIndex||0)) * 6;
    ctx.translate(0, -20 + bob);
    ctx.fillStyle = 'rgba(79,240,200,0.35)';
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = hurt ? '#fff' : '#e0f7fa';
    ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(12, 0); ctx.lineTo(0, 12); ctx.lineTo(-12, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    const runes = ['{}', '</>', 'λ'];
    for (let r = 0; r < 3; r++) {
      const ang = t * 0.07 + r * (TAU / 3);
      const rx = Math.cos(ang) * 20, ry = Math.sin(ang) * 10;
      ctx.fillStyle = '#ffd56b';
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(runes[r], rx, ry + 4);
    }
  } else if (kind === 'medusa') {
    const floatY = reduced ? 0 : Math.sin(t * 0.12 + (e.spawnIndex||0)) * 6;
    ctx.translate(0, -26 + floatY);
    ctx.fillStyle = 'rgba(42,36,104,0.85)';
    ctx.strokeStyle = '#80deea'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, 2); ctx.bezierCurveTo(-22, -24, 22, -24, 20, 2);
    ctx.quadraticCurveTo(10, 6, 0, 2); ctx.quadraticCurveTo(-10, 6, -20, 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const fx = -18 + i * 4;
      const wave = reduced ? 0 : Math.sin(t * 0.16 + i) * 5;
      ctx.strokeStyle = FAM[i];
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(fx, 3);
      ctx.quadraticCurveTo(fx + wave, 14, fx - wave * 0.6, 28);
      ctx.stroke();
    }
  } else if (kind === 'murcielago') {
    const beat = reduced ? 0 : Math.sin(t * 0.26) * 14;
    ctx.translate(0, -22);
    ctx.fillStyle = hurt ? '#fff' : '#1a237e';
    ctx.strokeStyle = '#304ffe'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(12, 4); ctx.lineTo(0, 14); ctx.lineTo(-12, 4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    for (let side of [-1, 1]) {
      ctx.save(); ctx.scale(side, 1);
      ctx.fillStyle = '#283593'; ctx.strokeStyle = '#536dfe';
      ctx.beginPath();
      ctx.moveTo(8, -4); ctx.lineTo(28, -24 + beat); ctx.lineTo(38, -12 + beat); ctx.lineTo(20, 8); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#4ff0c8';
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.floor(t * 0.2) % 2 ? '1' : '0', -5, 3);
    ctx.fillText(Math.floor(t * 0.2 + 1) % 2 ? '1' : '0', 5, 3);
  }

  ctx.restore();
  return true;
}

export function drawYomiTerminalV617(ctx, g, s, cam, done, t = 0, reduced = false) {
  const x = s.x - cam.x, y = s.y - cam.y;
  const tick = g.world1?.tick || 0;
  const isLive = (g.world1?.yomiWindows?.[s.id] || 0) > tick || ((tick + (s.phase || 0)) % 180 + 180) % 180 < 55;
  const isWarn = !isLive && ((tick + (s.phase || 0)) % 180 + 180) % 180 >= 150;

  ctx.save();
  ctx.fillStyle = '#1a237e'; ctx.strokeStyle = '#3949ab'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 36, y); ctx.quadraticCurveTo(x - 16, y - 32, x - 20, y - 56);
  ctx.lineTo(x + 20, y - 56); ctx.quadraticCurveTo(x + 16, y - 32, x + 36, y);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  const screenCol = done ? '#004d40' : isLive ? '#006064' : isWarn ? '#3e2723' : '#0a1026';
  const borderCol = done ? '#4ff0c8' : isLive ? '#00e5ff' : isWarn ? '#ffd54f' : '#3f51b5';
  ctx.fillStyle = screenCol; ctx.strokeStyle = borderCol; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.roundRect?.(x - 46, y - 118, 92, 56, 10) || ctx.rect(x - 46, y - 118, 92, 56);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = isLive ? '#00e5ff' : isWarn ? '#ffd54f' : '#7986cb';
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  if (done) ctx.fillText('NODO COMPILADO', x, y - 96);
  else if (isLive) ctx.fillText('¡AHORA!  J', x, y - 96);
  else if (isWarn) ctx.fillText('SINCRONIZANDO', x, y - 96);
  else ctx.fillText('ESPERA · K', x, y - 96);

  ctx.strokeStyle = '#7986cb'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y - 128); ctx.lineTo(x, y - 162); ctx.stroke();
  ctx.fillStyle = isLive || done ? '#4ff0c8' : '#7986cb';
  ctx.beginPath(); ctx.arc(x, y - 166, 9, 0, TAU); ctx.fill();

  ctx.restore();
}
