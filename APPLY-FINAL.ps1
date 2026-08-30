$root = $PSScriptRoot
$draw = Join-Path $root "characters\draw.js"
$td = Get-Content -Raw -Path $draw
if ($td -notmatch "drawBaby") {
  $td = "import { drawBaby } from `"./baby.js`";`r`n" + $td
}
if ($td -notmatch "Number\(p.evo\)") {
  $td = $td.Replace(
    "ctx.scale(p.facing || 1, 1);`r`n  ctx.fillStyle = `"rgba(0,0,0,.3)`";",
    "ctx.scale(p.facing || 1, 1);`r`n  if ((Number(p.evo) || 0) === 0) { drawBaby(ctx, p, t); ctx.restore(); return; }`r`n  ctx.fillStyle = `"rgba(0,0,0,.3)`";"
  )
  $td = $td.Replace(
    "ctx.scale(p.facing || 1, 1);`n  ctx.fillStyle = `"rgba(0,0,0,.3)`";",
    "ctx.scale(p.facing || 1, 1);`n  if ((Number(p.evo) || 0) === 0) { drawBaby(ctx, p, t); ctx.restore(); return; }`n  ctx.fillStyle = `"rgba(0,0,0,.3)`";"
  )
}
Set-Content -Path $draw -Value $td -NoNewline -Encoding utf8

$g = Join-Path $root "game.js"
$t = Get-Content -Raw -Path $g
$t = $t.Replace("applyForm(p); return p;", "applyForm(p, { silent: true }); return p;")
$old = @"
function start(def) {
  game.player = makePlayer(def); game.combo = 0; game.score = 0; game.kills = 0; game.shake = 0; game.visited = { hub: true };
  game.projectiles = []; game.bolts = []; game.ghosts = []; game.running = true; paused = false;
  document.body.classList.add("playing");
  document.getElementById("char-select").classList.add("hidden"); renderAbilityBar(); loadRoom("hub");
}
"@
$new = @"
function start(def) {
  const resume = (function () { try { return localStorage.getItem("ohana-resume") === "1"; } catch (e) { return false; } })();
  try { localStorage.removeItem("ohana-resume"); } catch (e) {}
  game.player = makePlayer(def); game.combo = 0; game.score = 0; game.kills = 0; game.shake = 0; game.visited = { hub: true };
  game.projectiles = []; game.bolts = []; game.ghosts = []; game.running = true; paused = false;
  let roomId = "hub";
  if (resume) {
    try {
      const s = JSON.parse(localStorage.getItem("ohana") || "null");
      if (s && s.id === def.id) {
        game.player.evo = Math.max(0, Number(s.evo) || 0);
        game.player.xp = s.xp || 0;
        game.visited = s.visited || { hub: true };
        game.score = s.score || 0;
        applyForm(game.player, { silent: true });
        roomId = s.roomId || "hub";
      }
    } catch (e) {}
  }
  document.body.classList.add("playing");
  document.getElementById("char-select").classList.add("hidden"); renderAbilityBar(); loadRoom(roomId);
}
"@
if ($t.Contains("function start(def)")) { $t = $t.Replace($old, $new) }
Set-Content -Path $g -Value $t -NoNewline -Encoding utf8
Write-Host "Listo: bebe + continuar. Nueva partida / Continuar + Ctrl+F5"
