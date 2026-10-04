# PROJECT OHANA · Git PowerShell Shell
# Uso:
#   .\OHANA-SHELL.ps1
#
# Funciones:
#   1  Cargar / comprobar proyecto
#   2  Git status
#   3  Pull seguro
#   4  Commit + Push
#   5  Push
#   6  Pull + Push (sync)
#   7  Tests
#   8  Servidor local
#   9  VS Code
#   0  Salir

[CmdletBinding()]
param(
    [ValidateSet("menu","status","pull","push","sync","test","serve","code")]
    [string]$Action = "menu",

    [string]$Message,

    [string]$Root = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " PROJECT OHANA · GIT SHELL" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Find-ProjectRoot {
    param([string]$RequestedRoot)

    $candidates = New-Object System.Collections.Generic.List[string]

    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        [void]$candidates.Add($RequestedRoot)
    }

    if ($PSScriptRoot) {
        [void]$candidates.Add($PSScriptRoot)
    }

    [void]$candidates.Add("D:\GitHub\project-ohana")
    [void]$candidates.Add("X:\GitHub\systems-lab\project-ohana")

    foreach ($candidate in $candidates) {
        try {
            $resolved = [System.IO.Path]::GetFullPath($candidate)
            if (
                (Test-Path -LiteralPath $resolved -PathType Container) -and
                (Test-Path -LiteralPath (Join-Path $resolved ".git") -PathType Container)
            ) {
                return $resolved
            }
        }
        catch {
        }
    }

    throw "No se encontró un checkout Git válido de PROJECT OHANA. Usa -Root ""D:\ruta\project-ohana""."
}

function Invoke-Git {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments,

        [switch]$AllowFailure
    )

    $output = & git @Arguments 2>&1
    $exitCode = $LASTEXITCODE

    if ($output) {
        $output | ForEach-Object {
            if ($_ -match "^(fatal:|error:)" ) {
                Write-Host $_ -ForegroundColor Red
            }
            elseif ($_ -match "^(warning:|From |To )") {
                Write-Host $_ -ForegroundColor Yellow
            }
            else {
                Write-Host $_
            }
        }
    }

    if ($exitCode -ne 0 -and -not $AllowFailure) {
        throw "git terminó con código $exitCode."
    }

    return $output
}

function Assert-Dependencies {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git no está instalado o no está en PATH."
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "Aviso: Node.js no está disponible. Los tests no podrán ejecutarse." -ForegroundColor Yellow
    }
}

function Get-RepoInfo {
    Write-Host "Proyecto : $script:ProjectRoot" -ForegroundColor White
    Write-Host "Rama     : " -NoNewline -ForegroundColor White
    $branch = & git branch --show-current 2>$null
    Write-Host $branch -ForegroundColor Green

    Write-Host "Remoto   : " -NoNewline -ForegroundColor White
    $remote = & git remote get-url origin 2>$null
    Write-Host $remote -ForegroundColor DarkCyan

    Write-Host ""
}

function Ensure-MainBranch {
    $branch = (& git branch --show-current 2>$null).Trim()

    if ([string]::IsNullOrWhiteSpace($branch)) {
        throw "HEAD está separado. No se ejecutará pull/push desde detached HEAD."
    }

    if ($branch -ne "main") {
        Write-Host "Rama actual: $branch" -ForegroundColor Yellow
        $answer = Read-Host "Cambiar a main ahora? [S/N]"
        if ($answer -match "^[sSyY]$") {
            Invoke-Git @("switch","main")
        }
        else {
            throw "Operación cancelada: esta shell trabaja por defecto sobre main."
        }
    }
}

function Show-Status {
    Write-Header
    Get-RepoInfo

    Write-Host "=== STATUS ===" -ForegroundColor Cyan
    Invoke-Git @("status","--short","--branch")
    Write-Host ""
}

function Pull-Safe {
    Write-Header
    Get-RepoInfo
    Ensure-MainBranch

    Write-Host "=== FETCH ===" -ForegroundColor Cyan
    Invoke-Git @("fetch","origin","main")

    Write-Host ""
    Write-Host "=== DIVERGENCIA ===" -ForegroundColor Cyan
    $ahead = (& git rev-list --count "origin/main..main").Trim()
    $behind = (& git rev-list --count "main..origin/main").Trim()
    Write-Host "Local ahead : $ahead"
    Write-Host "Local behind: $behind"
    Write-Host ""

    if ([int]$behind -gt 0) {
        Write-Host "=== PULL --REBASE ===" -ForegroundColor Cyan
        Invoke-Git @("pull","--rebase","--autostash","origin","main")
    }
    else {
        Write-Host "No hay commits remotos pendientes." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "PULL COMPLETADO." -ForegroundColor Green
}

function Push-Safe {
    Write-Header
    Get-RepoInfo
    Ensure-MainBranch

    Write-Host "=== PUSH ===" -ForegroundColor Cyan

    $status = & git status --porcelain
    if ($status) {
        Write-Host "Hay cambios sin commit. Se detiene el push para evitar subir basura a ciegas." -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host $_ }
        throw "Haz commit primero."
    }

    Invoke-Git @("fetch","origin","main")

    $ahead = [int]((& git rev-list --count "origin/main..main").Trim())
    $behind = [int]((& git rev-list --count "main..origin/main").Trim())

    if ($behind -gt 0) {
        throw "El remoto tiene $behind commit(s) que no tienes. Ejecuta PULL antes del PUSH."
    }

    if ($ahead -eq 0) {
        Write-Host "Nada que subir. Local y remoto están sincronizados." -ForegroundColor Green
        return
    }

    Invoke-Git @("push","origin","main")
    Write-Host ""
    Write-Host "PUSH COMPLETADO · $ahead commit(s)." -ForegroundColor Green
}

function Commit-And-Push {
    Write-Header
    Get-RepoInfo
    Ensure-MainBranch

    $changes = & git status --porcelain
    if (-not $changes) {
        Write-Host "No hay cambios para commit." -ForegroundColor Yellow
        return
    }

    Write-Host "=== CAMBIOS ===" -ForegroundColor Cyan
    $changes | ForEach-Object { Write-Host $_ }
    Write-Host ""

    $commitMessage = $Message
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = Read-Host "Mensaje del commit"
    }

    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        throw "El mensaje del commit no puede estar vacío."
    }

    Write-Host ""
    Write-Host "=== VALIDACIÓN PRE-COMMIT ===" -ForegroundColor Cyan
    Run-Tests

    Write-Host ""
    Write-Host "=== COMMIT ===" -ForegroundColor Cyan
    Invoke-Git @("add","-A")
    Invoke-Git @("commit","-m",$commitMessage)

    Write-Host ""
    Write-Host "=== PUSH ===" -ForegroundColor Cyan
    Invoke-Git @("fetch","origin","main")

    $behind = [int]((& git rev-list --count "main..origin/main").Trim())
    if ($behind -gt 0) {
        Write-Host "El remoto avanzó mientras validábamos. Se hace rebase antes del push." -ForegroundColor Yellow
        Invoke-Git @("pull","--rebase","--autostash","origin","main")
    }

    Invoke-Git @("push","origin","main")

    Write-Host ""
    Write-Host "COMMIT + PUSH COMPLETADOS." -ForegroundColor Green
}

function Sync-Repo {
    Write-Header
    Get-RepoInfo
    Ensure-MainBranch

    Write-Host "=== SYNC SEGURO ===" -ForegroundColor Cyan
    Invoke-Git @("fetch","origin","main")

    $ahead = [int]((& git rev-list --count "origin/main..main").Trim())
    $behind = [int]((& git rev-list --count "main..origin/main").Trim())

    Write-Host "Ahead : $ahead"
    Write-Host "Behind: $behind"
    Write-Host ""

    if ($behind -gt 0) {
        Invoke-Git @("pull","--rebase","--autostash","origin","main")
    }

    $changes = & git status --porcelain
    if ($changes) {
        Write-Host "Hay cambios locales. No se hace commit automático." -ForegroundColor Yellow
        $changes | ForEach-Object { Write-Host $_ }
        return
    }

    $ahead = [int]((& git rev-list --count "origin/main..main").Trim())
    if ($ahead -gt 0) {
        Invoke-Git @("push","origin","main")
    }

    Write-Host ""
    Write-Host "SYNC COMPLETADO." -ForegroundColor Green
}

function Run-Tests {
    $testFiles = @(
        "tests/core.test.js",
        "tests/runtime.test.js"
    )

    foreach ($testFile in $testFiles) {
        $fullPath = Join-Path $script:ProjectRoot $testFile
        if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
            Write-Host "Falta $testFile" -ForegroundColor Red
            throw "No se puede ejecutar la batería completa."
        }
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js no está disponible."
    }

    Push-Location $script:ProjectRoot
    try {
        Write-Host "Ejecutando core + runtime..." -ForegroundColor White
        & node --test tests/core.test.js tests/runtime.test.js
        if ($LASTEXITCODE -ne 0) {
            throw "Los tests han fallado."
        }

        Write-Host ""
        Write-Host "TESTS PASS." -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

function Start-LocalServer {
    Write-Header
    Get-RepoInfo

    $server = Join-Path $script:ProjectRoot "server.ps1"
    if (-not (Test-Path -LiteralPath $server -PathType Leaf)) {
        throw "No existe server.ps1."
    }

    Write-Host "Servidor local: http://localhost:8080/" -ForegroundColor Yellow
    Write-Host "Se ejecutará server.ps1. CTRL+C para detenerlo." -ForegroundColor DarkGray
    Write-Host ""

    Push-Location $script:ProjectRoot
    try {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $server
    }
    finally {
        Pop-Location
    }
}

function Open-Code {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        & code $script:ProjectRoot
        return
    }

    Write-Host "VS Code no está en PATH." -ForegroundColor Yellow
}

function Show-Menu {
    while ($true) {
        Write-Header
        Get-RepoInfo

        Write-Host "  [1] Cargar / comprobar proyecto"
        Write-Host "  [2] Git status"
        Write-Host "  [3] Pull seguro"
        Write-Host "  [4] Commit + Push"
        Write-Host "  [5] Push"
        Write-Host "  [6] Pull + Push (sync)"
        Write-Host "  [7] Ejecutar tests"
        Write-Host "  [8] Lanzar servidor local"
        Write-Host "  [9] Abrir VS Code"
        Write-Host "  [0] Salir"
        Write-Host ""

        $choice = Read-Host "Acción"

        try {
            switch ($choice) {
                "1" {
                    Write-Host ""
                    Write-Host "Proyecto cargado correctamente:" -ForegroundColor Green
                    Write-Host $script:ProjectRoot
                    Read-Host "ENTER para continuar" | Out-Null
                }
                "2" { Show-Status; Read-Host "ENTER para continuar" | Out-Null }
                "3" { Pull-Safe; Read-Host "ENTER para continuar" | Out-Null }
                "4" { Commit-And-Push; Read-Host "ENTER para continuar" | Out-Null }
                "5" { Push-Safe; Read-Host "ENTER para continuar" | Out-Null }
                "6" { Sync-Repo; Read-Host "ENTER para continuar" | Out-Null }
                "7" { Write-Header; Run-Tests; Read-Host "ENTER para continuar" | Out-Null }
                "8" { Start-LocalServer }
                "9" { Open-Code; Read-Host "ENTER para continuar" | Out-Null }
                "0" { return }
                default {
                    Write-Host "Opción no válida." -ForegroundColor Yellow
                    Start-Sleep -Milliseconds 700
                }
            }
        }
        catch {
            Write-Host ""
            Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Read-Host "ENTER para continuar" | Out-Null
        }
    }
}

Assert-Dependencies
$script:ProjectRoot = Find-ProjectRoot -RequestedRoot $Root
Set-Location $script:ProjectRoot

switch ($Action) {
    "status" { Show-Status }
    "pull"   { Pull-Safe }
    "push"   { Push-Safe }
    "sync"   { Sync-Repo }
    "test"   { Write-Header; Run-Tests }
    "serve"  { Start-LocalServer }
    "code"   { Open-Code }
    "menu"   { Show-Menu }
}
