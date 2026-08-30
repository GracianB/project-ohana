$p = Join-Path $PSScriptRoot "characters\draw.js"
$t = Get-Content -Raw -Path $p
if ($t -notmatch "drawBaby") {
  $t = "import { drawBaby } from `"./baby.js`";`n" + $t
}
if ($t -notmatch "evo \|\| 0\) === 0") {
  $needle = "ctx.scale(p.facing || 1, 1);"
  $insert = @"
ctx.scale(p.facing || 1, 1);
  if ((evo || 0) === 0) {
    drawBaby(ctx, p, t);
    ctx.restore();
    return;
  }
"@
  $t = $t.Replace($needle, $insert)
}
Set-Content -Path $p -Value $t -NoNewline -Encoding utf8
Write-Host "draw.js: bebés in-game OK"
