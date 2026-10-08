# Генерирует PNG-иконки для манифеста без внешних инструментов (System.Drawing).
# powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot "..\icons"
New-Item -ItemType Directory -Force $out | Out-Null

function Draw-Icon([int]$size, [string]$path, [bool]$maskable) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.Clear([System.Drawing.Color]::Transparent)

    $bg = [System.Drawing.Color]::FromArgb(255, 0x1F, 0x29, 0x33)
    $accent = [System.Drawing.Color]::FromArgb(255, 0xF5, 0x9E, 0x0B)
    $ink = [System.Drawing.Color]::FromArgb(255, 0xF8, 0xFA, 0xFC)
    $red = [System.Drawing.Color]::FromArgb(255, 0xEF, 0x44, 0x44)

    $s = $size / 512.0
    if ($maskable) {
        $g.FillRectangle((New-Object System.Drawing.SolidBrush $bg), 0, 0, $size, $size)
    } else {
        $r = 112 * $s
        $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
        $gp.AddArc(0, 0, 2*$r, 2*$r, 180, 90)
        $gp.AddArc($size-2*$r, 0, 2*$r, 2*$r, 270, 90)
        $gp.AddArc($size-2*$r, $size-2*$r, 2*$r, 2*$r, 0, 90)
        $gp.AddArc(0, $size-2*$r, 2*$r, 2*$r, 90, 90)
        $gp.CloseFigure()
        $g.FillPath((New-Object System.Drawing.SolidBrush $bg), $gp)
    }

    # Для maskable рисунок меньше: безопасная зона — центральные 80 %.
    $k = if ($maskable) { 0.78 } else { 1.0 }
    $c = $size / 2.0
    $R1 = 150 * $s * $k; $R2 = 118 * $s * $k
    $g.FillEllipse((New-Object System.Drawing.SolidBrush $accent), $c-$R1, $c-$R1, 2*$R1, 2*$R1)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush $bg), $c-$R2, $c-$R2, 2*$R2, 2*$R2)

    $penScale = New-Object System.Drawing.Pen $ink, (14 * $s * $k)
    $penScale.StartCap = 'Round'; $penScale.EndCap = 'Round'
    $g.DrawArc($penScale, $c-$R2+10*$s*$k, $c-$R2+10*$s*$k, 2*($R2-10*$s*$k), 2*($R2-10*$s*$k), 135, 90)

    $penRed = New-Object System.Drawing.Pen $red, (16 * $s * $k)
    $penRed.StartCap = 'Round'; $penRed.EndCap = 'Round'
    $g.DrawArc($penRed, $c-$R2+10*$s*$k, $c-$R2+10*$s*$k, 2*($R2-10*$s*$k), 2*($R2-10*$s*$k), 300, 30)

    $penNeedle = New-Object System.Drawing.Pen $ink, (22 * $s * $k)
    $penNeedle.StartCap = 'Round'; $penNeedle.EndCap = 'Round'
    $g.DrawLine($penNeedle, $c, $c, $c - 78*$s*$k, $c - 74*$s*$k)
    $rn = 18 * $s * $k
    $g.FillEllipse((New-Object System.Drawing.SolidBrush $ink), $c-$rn, $c-$rn, 2*$rn, 2*$rn)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "ok $path"
}

Draw-Icon 192 (Join-Path $out "icon-192.png") $false
Draw-Icon 512 (Join-Path $out "icon-512.png") $false
Draw-Icon 512 (Join-Path $out "maskable-512.png") $true
