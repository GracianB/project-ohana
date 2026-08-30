$root = $PSScriptRoot
$g = Join-Path $root "game.js"
$t = Get-Content -Raw -Path $g
$t = $t.Replace('const ctx = canvas.getContext("2d");', 'const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });')
$t = $t.Replace(
  'function fit() { canvas.width = innerWidth; canvas.height = innerHeight; }',
  'function fit() { const w = Math.min(1280, innerWidth|0), h = Math.min(720, innerHeight|0); if (canvas.width !== w) canvas.width = w; if (canvas.height !== h) canvas.height = h; }'
)
$t = $t.Replace('ctx.shadowBlur = 14; ctx.shadowColor = "#ffe66a";', '')
$t = $t.Replace('ctx.shadowBlur = 12; ctx.shadowColor = pr.color;', '')
$t = $t.Replace('ctx.shadowBlur = 0;', '')
$t = $t.Replace('updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); updateCam(); updateHUD();', 'updatePlayer(); updateEnemies(); updateProjectiles(); game.fx.update(); updateCam(); if ((t & 3) === 0) updateHUD();')
Set-Content -Path $g -Value $t -NoNewline -Encoding utf8

$a = Join-Path $root "systems\abilities.js"
if (Test-Path $a) {
  $ta = Get-Content -Raw -Path $a
  $ta = $ta.Replace('ctx.shadowBlur = 16;', 'ctx.shadowBlur = 0;')
  Set-Content -Path $a -Value $ta -NoNewline -Encoding utf8
}
Write-Host "perf OK: canvas 1280x720, sin glow caro"
