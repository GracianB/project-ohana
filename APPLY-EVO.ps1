$g = Join-Path $PSScriptRoot "game.js"
$t = [IO.File]::ReadAllText($g)
$t = $t -replace 'XP_NEED = \[[^\]]+\]', 'XP_NEED = [0, 18, 40, 70, 110]'
$t = $t -replace 'p\.evo >= 2', 'p.evo >= 4'
$t = $t -replace 'p\.evo < 2', 'p.evo < 4'
$t = $t -replace '/3 · Orbes', '/5 · Orbes'
$t = $t -replace '/3 \xC2\xB7 Orbes', '/5 · Orbes'
$t = $t -replace 'Forma final\.', 'GOD.'
[IO.File]::WriteAllText($g, $t)
$c4 = ([regex]::Matches($t, 'p\.evo >= 4')).Count
$c5 = ([regex]::Matches($t, '/5')).Count
$xp = $t.Contains('[0, 18, 40, 70, 110]')
Write-Host ("evo>=4 count={0}  /5 count={1}  XP5={2}" -f $c4, $c5, $xp)
if ($c4 -lt 1 -or -not $xp) { Write-Host "FALLO: game.js no se parcheo"; exit 1 }
Write-Host "OK forma 1-5. Ctrl+F5"
