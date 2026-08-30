$g = Join-Path $PSScriptRoot "game.js"
$t = Get-Content -Raw -Path $g
$t = $t.Replace('const XP_NEED = [0, 40, 100];', 'const XP_NEED = [0, 18, 40, 70, 110];')
$t = $t.Replace('if (p.evo >= 2) { if (reason === "manual") showNotification("MAX", "Forma final."); return; }', 'if (p.evo >= 4) { if (reason === "manual") showNotification("MAX", "GOD."); return; }')
$t = $t.Replace('if (p.evo < 2 && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");', 'if (p.evo < 4 && p.xp >= XP_NEED[p.evo + 1]) evolve("xp");')
$t = $t.Replace('const need = p.evo >= 2 ? p.xp : XP_NEED[p.evo + 1];', 'const need = p.evo >= 4 ? p.xp : XP_NEED[p.evo + 1];')
$t = $t.Replace('p.evo < 2 ? "/" + need : ""', 'p.evo < 4 ? "/" + need : ""')
$t = $t.Replace('const nxt = p.evo >= 2 ? 1 : XP_NEED[p.evo + 1];', 'const nxt = p.evo >= 4 ? 1 : XP_NEED[p.evo + 1];')
$t = $t.Replace('xpEl.style.width = p.evo >= 2 ? "100%"', 'xpEl.style.width = p.evo >= 4 ? "100%"')
$t = $t.Replace('Forma " + (p.evo + 1) + "/3', 'Forma " + (p.evo + 1) + "/5')
Set-Content -Path $g -Value $t -NoNewline -Encoding utf8
Write-Host "Evo 1-5 desbloqueada. E hasta GOD. Ctrl+F5"
