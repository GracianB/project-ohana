$p = Join-Path $PSScriptRoot "game.js"
$t = Get-Content -Raw -Path $p
if ($t -match "worldClear") { Write-Host "ya parcheado"; exit 0 }
$t = $t.Replace(
  'kills: 0',
  'kills: 0, won: false, summoned: false'
)
$t = $t.Replace(
  'if (r.boss) game.enemies.push({ x: 900, y: 400, w: 74, h: 74, vx: 2, vy: 0, hp: 420, max: 420, kind: "boss", color: "#f36", boss: true, shoot: 0 });',
  'if (r.boss) game.enemies.push({ x: 900, y: 420, w: 90, h: 90, vx: 2.4, vy: 0, hp: 980, max: 980, kind: "boss", color: "#f36", boss: true, shoot: 0, phase: 1, slam: 0 });'
)
$t = $t.Replace(
  'showNotification("SALA", r.name); showBanner(r.name); save();',
  'showNotification(r.name, r.hint || r.goal || "SALA"); showBanner(r.name); save(); worldClear();'
)
$t = $t.Replace(
  'if (aabb(box, e)) { const d = 22 + p.evo * 8; e.hp -= d; e.vx = 8 * p.facing; game.nums.add(e.x, e.y, "" + d, "#fff"); punch(e.x, e.y, p.color); p.xp += 4; }',
  'if (aabb(box, e)) { let d = 22 + p.evo * 8; if (e.boss) d = Math.ceil(d * 0.5); e.hp -= d; e.vx = (e.boss ? 3 : 8) * p.facing; game.nums.add(e.x, e.y, "" + d, "#fff"); punch(e.x, e.y, p.color); p.xp += 4; }'
)
$t = $t.Replace(
  'game.fx.emit(x, y, { color, count: 14, size: 4, up: 1.2 }); beep("hit");',
  @'
game.fx.emit(x, y, { color, count: 10, size: 3.2, up: 1.2 });
  game.fx.emit(x, y, { color: "#fff", count: 6, size: 2, up: 1.8, speed: 4.4, life: 16, star: true });
  beep("hit");
}
function worldClear() {
  const need = ["hub", "beach", "jungle", "cave", "lab", "ridge", "space", "volcano"];
  if (game.won || game.summoned || game.roomId === "boss") return;
  if (!need.every((id) => game.visited[id])) return;
  game.summoned = true;
  showNotification("MUNDO 1", "Todas las salas. El nido te reclama.");
  setTimeout(() => { if (!game.won && game.running) loadRoom("boss", "right"); }, 1100);
'@)
$t = $t.Replace(
  'if (e.boss) { e.vx += Math.sign((game.player.x - e.x) || 1) * 0.06; if (t % 90 === 0) e.vy = -8; }',
  @'
if (e.boss) {
      if (e.hp < e.max * 0.45 && e.phase === 1) {
        e.phase = 2; e.color = "#ff2040"; game.flash = 10; game.shake = 16;
        showNotification("FASE 2", "El nido se enfurece");
        game.fx.emit(e.x, e.y, { color: "#ff2040", count: 24, size: 5, up: 2, star: true });
      }
      const aggro = e.phase === 2 ? 0.12 : 0.07;
      e.vx += Math.sign((game.player.x - e.x) || 1) * aggro;
      e.vx = Math.max(-4.2, Math.min(4.2, e.vx));
      if (t % (e.phase === 2 ? 70 : 95) === 0) e.vy = -9;
      e.slam = (e.slam || 0) + 1;
      if (e.slam > (e.phase === 2 ? 140 : 190)) {
        e.slam = 0; e.vy = 12;
        game.fx.emit(e.x + 40, e.y + 70, { color: "#f84", count: 16, size: 4, up: 2 });
        if (Math.abs(game.player.x - e.x) < 140 && game.player.y > e.y) {
          game.player.health -= 18; game.player.invuln = 24; game.shake = 14;
        }
      }
    }
'@)
$t = $t.Replace(
  'if ((e.kind === "brute" || e.boss) && e.shoot > 90) {
      e.shoot = 0;
      game.projectiles.push({ x: e.x, y: e.y + 10, vx: Math.sign(game.player.x - e.x) * 5, vy: 0, w: 12, h: 8, life: 70, dmg: 10, color: "#f84", owner: "enemy" });
    }',
  @'
const rate = e.boss ? (e.phase === 2 ? 48 : 70) : 90;
    if ((e.kind === "brute" || e.boss) && e.shoot > rate) {
      e.shoot = 0;
      const aim = Math.sign(game.player.x - e.x) || 1;
      const shots = e.boss && e.phase === 2 ? 3 : 1;
      for (let s = 0; s < shots; s++) {
        game.projectiles.push({
          x: e.x + 20, y: e.y + 18, vx: aim * (5 + s), vy: e.boss ? (s - 1) * 1.6 : 0,
          w: e.boss ? 16 : 12, h: e.boss ? 12 : 8, life: 80,
          dmg: e.boss ? 14 : 10, color: e.boss ? "#ff5a6a" : "#f84", owner: "enemy"
        });
      }
    }
'@)
$t = $t.Replace('p.health -= e.boss ? 16 : 8;', 'p.health -= e.boss ? 22 : 8;')
$t = $t.Replace(
  'if (e.boss) { beep("win"); showNotification("VICTORIA", "Score " + game.score); }',
  @'
if (e.boss) {
      game.won = true; game.flash = 24; game.shake = 20; beep("win");
      game.fx.emit(e.x + 40, e.y, { color: "#ffe66a", count: 36, size: 6, up: 3, star: true });
      showNotification("VICTORIA", "Contacta a Jun xD");
      dispatchEvent(new CustomEvent("ohana-win", { detail: { score: game.score, kills: game.kills } }));
    }
'@)
$t = $t.Replace(
  'const dmg = pr.dmg * (1 + game.player.evo * 0.35);',
  'let dmg = pr.dmg * (1 + game.player.evo * 0.35); if (e.boss) dmg *= 0.55;'
)
Set-Content -Path $p -Value $t -NoNewline -Encoding utf8
Write-Host "Mundo 1 parcheado. Ctrl+F5"
