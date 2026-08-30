$p = Join-Path $PSScriptRoot "game.js"
$t = Get-Content -Raw -Path $p
$t = $t.Replace('const XP_NEED = [0, 40, 100];', 'const XP_NEED = [0, 20, 50, 90, 150];')
$t = $t.Replace('if (p.evo >= 2)', 'if (p.evo >= 4)')
$t = $t.Replace('p.evo < 2 && p.xp', 'p.evo < 4 && p.xp')
$t = $t.Replace('p.evo >= 2 ? p.xp', 'p.evo >= 4 ? p.xp')
$t = $t.Replace('p.evo < 2 ? "/" + need', 'p.evo < 4 ? "/" + need')
$t = $t.Replace('p.evo >= 2 ? 1', 'p.evo >= 4 ? 1')
$t = $t.Replace('p.evo >= 2 ? "100%"', 'p.evo >= 4 ? "100%"')
$t = $t.Replace('Forma " + (p.evo + 1) + "/3', 'Forma " + (p.evo + 1) + "/5')
$t = $t.Replace('applyForm(p); return p;', 'applyForm(p, { silent: true }); return p;')
if ($t -notmatch "drawSigns") {
  $t = $t.Replace(
    'import { ROOMS, ROOM_W, ROOM_H } from "./systems/map.js";',
    'import { ROOMS, ROOM_W, ROOM_H, drawSigns } from "./systems/map.js";'
  )
  $t = $t.Replace(
    'ctx.fillStyle = world.groundTop || "#8fd98a"; ctx.fillRect(x, y, plat.w, 10);
  }',
    "ctx.fillStyle = world.groundTop || `"#8fd98a`"; ctx.fillRect(x, y, plat.w, 10);`n  }`n  drawSigns(ctx, r, game.cam, t);"
  )
}
$t = $t.Replace(
  'if (r.doors.down && p.y > game.worldH - 80 && p.x > 700 && p.x < 920)',
  'if (r.doors.down && r.pit && p.y > game.worldH - 40 && p.x > 700 && p.x < 920)'
)
Set-Content -Path $p -Value $t -NoNewline -Encoding utf8
Write-Host "OK 5 formas + flechas. Nueva partida. Ctrl+F5"
