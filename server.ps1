$ErrorActionPreference = "Continue"

$root = $PSScriptRoot
$port = 8080

if ([string]::IsNullOrWhiteSpace($root)) {
    $root = "X:\GitHub\systems-lab\project-ohana"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
}
catch {
    Write-Host ""
    Write-Host "ERROR AL INICIAR EL SERVIDOR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pulsa ENTER para salir"
    exit
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
    ".ogg"  = "audio/ogg"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PROJECT OHANA - SERVIDOR LOCAL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Carpeta:" -ForegroundColor Gray
Write-Host $root -ForegroundColor White
Write-Host ""
Write-Host "Abre en tu navegador:" -ForegroundColor Yellow
Write-Host "http://localhost:$port/" -ForegroundColor White
Write-Host ""
Write-Host "Pulsa CTRL+C para detener el servidor." -ForegroundColor DarkGray
Write-Host ""

while ($listener.IsListening) {

    $context = $null

    try {
        $context = $listener.GetContext()

        $request = $context.Request
        $response = $context.Response

        $requestPath = $request.Url.AbsolutePath

        if ([string]::IsNullOrWhiteSpace($requestPath)) {
            $requestPath = "/"
        }

        $requestPath = [System.Uri]::UnescapeDataString($requestPath)

        $relativePath = $requestPath.TrimStart('/')

        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            $relativePath = "index.html"
        }

        $relativePath = $relativePath.Replace("/", "\")
        $relativePath = $relativePath.TrimStart("\")

        $filePath = Join-Path -Path $root -ChildPath $relativePath

        # ProtecciÃ³n contra salir de la carpeta del proyecto
        $fullRoot = [System.IO.Path]::GetFullPath($root)
        $fullFilePath = [System.IO.Path]::GetFullPath($filePath)

        if (-not $fullFilePath.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403

            $message = [System.Text.Encoding]::UTF8.GetBytes("403 - Acceso denegado")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $message.Length
            $response.OutputStream.Write($message, 0, $message.Length)

            continue
        }

        if (Test-Path -LiteralPath $fullFilePath -PathType Leaf) {

            $extension = [System.IO.Path]::GetExtension($fullFilePath).ToLowerInvariant()

            if ($mimeTypes.ContainsKey($extension)) {
                $response.ContentType = $mimeTypes[$extension]
            }
            else {
                $response.ContentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($fullFilePath)

            $response.StatusCode = 200
            $response.ContentLength64 = $bytes.Length

            $response.OutputStream.Write($bytes, 0, $bytes.Length)

            Write-Host "[200] $requestPath" -ForegroundColor Green
        }
        else {

            $response.StatusCode = 404

            $messageText = "404 - Archivo no encontrado: $requestPath"
            $message = [System.Text.Encoding]::UTF8.GetBytes($messageText)

            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $message.Length

            $response.OutputStream.Write($message, 0, $message.Length)

            Write-Host "[404] $requestPath" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host ""
        Write-Host "[ERROR]" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
    }
    finally {
        if ($context -ne $null) {
            try {
                $context.Response.OutputStream.Close()
                $context.Response.Close()
            }
            catch {}
        }
    }
}

try {
    $listener.Stop()
    $listener.Close()
}
catch {}
