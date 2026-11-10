$filePath = 'C:/Users/graci/.gemini/antigravity/scratch/project-ohana/characters/roster.js'

$lines = Get-Content -Path $filePath
$newLines = @()
$inRoster = $false
$objectBuffer = @()
$braceDepth = 0
$seenIds = @{}

foreach ($line in $lines) {
    if (-not $inRoster) {
        $newLines += $line
        if ($line -match '^\s*export const ALL_ROSTER = \[') {
            $inRoster = $true
        }
        continue
    }
    # We're inside the ALL_ROSTER array
    if ($line -match '^\s*\];') {
        # End of roster – flush any pending buffer (should be empty)
        $inRoster = $false
        $newLines += $line
        continue
    }
    # Detect start of an object
    if ($line -match '^\s*\{') {
        $braceDepth = 1
        $objectBuffer = @($line)
        continue
    }
    if ($braceDepth -gt 0) {
        $objectBuffer += $line
        $braceDepth += ($line -replace "[^"]", "") -replace "[^{}]", "" | ForEach-Object { ($_ -split "").Count - 1 }
        # simpler: count opening and closing braces in the line
        $open = ($line -split "\\{").Length - 1
        $close = ($line -split "\\}").Length - 1
        $braceDepth = $braceDepth + $open - $close
        if ($braceDepth -le 0) {
            # End of object reached
            # Determine id
            $objText = $objectBuffer -join "`n"
            $idMatch = $objText -match 'id:\s*"([^\"]+)"'
            $id = $Matches[1]
            $keep = $true
            if ($id) {
                if ($seenIds.ContainsKey($id)) {
                    $keep = $false
                } else {
                    $seenIds[$id] = $true
                }
            }
            if ($keep) {
                # Append object and a trailing comma (except maybe last, but we'll add later)
                $newLines += $objectBuffer
                $newLines += ','
            }
            # reset buffer
            $objectBuffer = @()
            $braceDepth = 0
        }
        continue
    }
    # Lines outside objects (e.g., comments) – keep
    $newLines += $line
}

# Remove possible trailing comma before the closing ];
for ($i = $newLines.Count - 1; $i -ge 0; $i--) {
    if ($newLines[$i] -match '^\s*,\s*$') {
        $newLines.RemoveAt($i)
    } elseif ($newLines[$i] -match '^\s*\];') {
        break
    }
}

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Output 'Deduplication with proper object parsing completed.'
