# Clean duplicate hero entries in characters/roster.js
# This script parses the roster file, keeps the first occurrence of each hero `id`, and writes a cleaned version.

$rosterPath = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\..\characters\roster.js"
$backupPath = "$rosterPath.bak"
Copy-Item -Path $rosterPath -Destination $backupPath -Force

$lines = Get-Content -Path $rosterPath -Raw
# Split on object boundaries assuming each hero is defined as a JavaScript object ending with "},"
$objects = $lines -split "},\s*\n"
$unique = @{}
$cleaned = @()
foreach ($obj in $objects) {
    if ($obj -match "id\s*[:=]\s*['\"]([^'\"]+)['\"]") {
        $id = $Matches[1]
        if (-not $unique.ContainsKey($id)) {
            $unique[$id] = $true
            $cleaned += $obj + "},"  # add closing brace and comma back
        }
    }
}
# Write cleaned content back
Set-Content -Path $rosterPath -Value ($cleaned -join "`n")
Write-Host "Cleaned roster written. Duplicates removed: $($unique.Count) ids kept."