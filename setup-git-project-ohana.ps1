$ErrorActionPreference = "Stop"

$ProjectPath = "X:\GitHub\systems-lab\project-ohana"

Clear-Host

try {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " PROJECT OHANA - INSTALAR GIT" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Set-Location $ProjectPath

    Write-Host "[1/4] Comprobando Git..." -ForegroundColor Yellow

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git no encontrado. Intentando instalar..." -ForegroundColor Yellow

        if (Get-Command winget -ErrorAction SilentlyContinue) {
            winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
        }
        else {
            throw "No se encontro winget para instalar Git automaticamente."
        }

        $GitFolders = @(
            "C:\Program Files\Git\cmd",
            "$env:LOCALAPPDATA\Programs\Git\cmd"
        )

        foreach ($Folder in $GitFolders) {
            if (Test-Path $Folder) {
                $env:Path += ";$Folder"
            }
        }
    }

    Write-Host ""
    Write-Host "[2/4] Verificando Git..." -ForegroundColor Yellow

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git no se detecta todavia. Cierra PowerShell y abre una nueva ventana."
    }

    git --version

    Write-Host ""
    Write-Host "[3/4] Inicializando repositorio..." -ForegroundColor Yellow

    if (-not (Test-Path ".git")) {
        git init
    }

    git branch -M main

    Write-Host ""
    Write-Host "[4/4] Preparando archivos..." -ForegroundColor Yellow

    git add .

    $Changes = git status --porcelain

    if ($Changes) {
        git commit -m "feat: initialize PROJECT OHANA"
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " PROCESO COMPLETADO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green

    git status
}
catch {
    Write-Host ""
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pulsa ENTER para salir"
