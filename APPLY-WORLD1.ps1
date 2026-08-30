$p = Join-Path $PSScriptRoot "game.js"
$t = Get-Content -Raw -Path $p
if ($t -notmatch "drawProjectile") {
  $t = $t.Replace(
    'import { ABILITY_DEFS, useAbility } from "./systems/abilities.js";',
    'import { ABILITY_DEFS, useAbility, drawProjectile } from "./systems/abilities.js";'
  )
}
if ($t -notmatch "worldClear") {
  $t = $t.Replace('kills: 0', 'kills: 0, won: false, summoned: false')
  $t = $t.Replace(
    'if (r.boss) game.enemies.push({ x: 900, y: 400, w: 74, h: 74, vx: 2, vy: 0, hp: 420, max: 420, kind: "boss", color: "#f36", boss: true, shoot: 0 });',
    'if (r.boss) game.enemies.push({ x: 900, y: 420, w: 90, h: 90, vx: 2.4, vy: 0, hp: 980, max: 980, kind: "boss", color: "#f36", boss: true, shoot: 0, phase: 1, slam: 0 });'
  )
  $t = $t.Replace(
    'showNotification("SALA", r.name); showBanner(r.name); save();',
    'showNotification(r.name, r.hint || "SALA"); showBanner(r.name); save(); worldClear();'
  )
  $t = $t.Replace(
    'if (e.boss) { beep("win"); showNotification("VICTORIA", "Score " + game.score); }',
    "if (e.boss) { game.won = true; beep(`"win`"); showNotification(`"VICTORIA`", `"Contacta a Jun xD`"); dispatchEvent(new CustomEvent(`"ohana-win`", { detail: { score: game.score, kills: game.kills } })); }"
  )
}
$t = $t.Replace(
  'if (r.doors.down && p.y > game.worldH - 80 && p.x > 700 && p.x < 920) {',
  'if (r.doors.down && r.pit && p.y > game.worldH - 40 && p.x > 700 && p.x < 920) {'
)
$oldProj = @'
  for (const pr of game.projectiles) {
    ctx.fillStyle = pr.color; ctx.shadowBlur = 12; ctx.shadowColor = pr.color;
    ctx.fillRect(pr.x - game.cam.x, pr.y - game.cam.y, pr.w, pr.h); ctx.shadowBlur = 0;
  }
'@
$newProj = @'
  for (const pr of game.projectiles) drawProjectile(ctx, pr, game.cam, t);
  for (const b of game.bolts) {
    ctx.strokeStyle = "#e8ffff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x1 - game.cam.x, b.y1 - game.cam.y); ctx.lineTo(b.x2 - game.cam.x, b.y2 - game.cam.y); ctx.stroke();
  }
'@
if ($t.Contains('ctx.fillRect(pr.x - game.cam.x')) {
  $t = $t.Replace($oldProj, $newProj)
}
Set-Content -Path $p -Value $t -NoNewline -Encoding utf8
Write-Host "OK. Ahora Ctrl+F5. Mata al jefe otra vez."
