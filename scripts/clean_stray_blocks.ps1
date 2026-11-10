$filePath = 'C:/Users/graci/.gemini/antigravity/scratch/project-ohana/characters/roster.js'
$lines = Get-Content -Path $filePath
$newLines = @()
$skipMode = $false
$skipDepth = 0

foreach ($i in 0..($lines.Count-1)) {
    $line = $lines[$i]
    if (-not $skipMode) {
        if ($line -match '^\s*// New hero: Baby Michi' -and $i+1 -lt $lines.Count -and $lines[$i+1] -match '^\s*\{') {
            # start skipping from next line (the stray opening brace)
            $skipMode = $true
            $skipDepth = 1
            # also skip this comment line
            continue
        }
        $newLines += $line
    } else {
        # inside skip mode, track braces
        $open = ($line -split "\\{").Length - 1
        $close = ($line -split "\\}").Length - 1
        $skipDepth += $open - $close
        if ($skipDepth -le 0) {
            # end of block reached, exit skip mode
            $skipMode = $false
        }
        # do not add line to newLines while skipping
    }
}

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Output 'Removed stray Baby Michi placeholder blocks.'
