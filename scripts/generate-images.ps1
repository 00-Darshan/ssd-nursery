$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\public\images"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$plants = @(
  @{ File = "snake-plant.jpg"; Bg1 = "#f3f8ed"; Bg2 = "#d8ead2"; Leaf = "#2f7d32"; Accent = "#9fca68"; Pot = "#c98f63"; Style = "upright" },
  @{ File = "areca-palm.jpg"; Bg1 = "#f6fbef"; Bg2 = "#d7f0d5"; Leaf = "#3a9f54"; Accent = "#78c270"; Pot = "#b98260"; Style = "palm" },
  @{ File = "tulsi.jpg"; Bg1 = "#fffaf0"; Bg2 = "#dcefd8"; Leaf = "#2f8a43"; Accent = "#764c9e"; Pot = "#c87953"; Style = "herb" },
  @{ File = "hibiscus.jpg"; Bg1 = "#fff7f0"; Bg2 = "#dff1cf"; Leaf = "#2e7c45"; Accent = "#dc3f52"; Pot = "#a96d49"; Style = "flower" },
  @{ File = "jasmine.jpg"; Bg1 = "#f9fbef"; Bg2 = "#e3f2d0"; Leaf = "#39864b"; Accent = "#fffdf0"; Pot = "#bb875d"; Style = "jasmine" },
  @{ File = "neem.jpg"; Bg1 = "#f3f8ed"; Bg2 = "#cfe8ce"; Leaf = "#2f7d42"; Accent = "#7cb35d"; Pot = "#9f704f"; Style = "tree" },
  @{ File = "bougainvillea.jpg"; Bg1 = "#fff8f5"; Bg2 = "#e3efd0"; Leaf = "#3d8349"; Accent = "#d24b91"; Pot = "#b17454"; Style = "vine" },
  @{ File = "aloe-vera.jpg"; Bg1 = "#f8fbef"; Bg2 = "#d5ead0"; Leaf = "#5e9b5a"; Accent = "#a7d77d"; Pot = "#c1875e"; Style = "succulent" },
  @{ File = "money-plant.jpg"; Bg1 = "#f2fbf4"; Bg2 = "#d9efe0"; Leaf = "#2f8f50"; Accent = "#a5d56d"; Pot = "#be825d"; Style = "trailing" },
  @{ File = "marigold.jpg"; Bg1 = "#fffaf0"; Bg2 = "#ecedc5"; Leaf = "#498443"; Accent = "#e59b24"; Pot = "#bd7551"; Style = "marigold" },
  @{ File = "ixora.jpg"; Bg1 = "#fff8f1"; Bg2 = "#dceccd"; Leaf = "#347e47"; Accent = "#e35f45"; Pot = "#b17652"; Style = "cluster" },
  @{ File = "peace-lily.jpg"; Bg1 = "#f7fbf2"; Bg2 = "#d6ebe1"; Leaf = "#2d7d4b"; Accent = "#fffdf5"; Pot = "#b98768"; Style = "lily" }
)

function Convert-HexColor {
  param([string]$Hex)

  return [System.Drawing.ColorTranslator]::FromHtml($Hex)
}

function New-SolidBrush {
  param([string]$Hex)

  return New-Object System.Drawing.SolidBrush (Convert-HexColor $Hex)
}

function New-PenFromHex {
  param([string]$Hex, [float]$Width = 3)

  $pen = New-Object System.Drawing.Pen ((Convert-HexColor $Hex), $Width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Draw-Leaf {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [float]$Width,
    [float]$Height,
    [float]$Angle,
    [System.Drawing.Brush]$Fill,
    [System.Drawing.Pen]$Stroke
  )

  $state = $Graphics.Save()
  $Graphics.TranslateTransform($CenterX, $CenterY)
  $Graphics.RotateTransform($Angle)

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier(0, -$Height / 2, $Width / 2, -$Height / 4, $Width / 2, $Height / 4, 0, $Height / 2)
  $path.AddBezier(0, $Height / 2, -$Width / 2, $Height / 4, -$Width / 2, -$Height / 4, 0, -$Height / 2)
  $path.CloseFigure()

  $Graphics.FillPath($Fill, $path)
  $Graphics.DrawPath($Stroke, $path)
  $Graphics.DrawLine($Stroke, 0, -$Height / 3, 0, $Height / 3)
  $Graphics.Restore($state)
}

function Draw-Petal {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [float]$Width,
    [float]$Height,
    [float]$Angle,
    [System.Drawing.Brush]$Fill
  )

  $state = $Graphics.Save()
  $Graphics.TranslateTransform($CenterX, $CenterY)
  $Graphics.RotateTransform($Angle)
  $Graphics.FillEllipse($Fill, -$Width / 2, -$Height / 2, $Width, $Height)
  $Graphics.Restore($state)
}

function Draw-Pot {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Brush]$Fill,
    [float]$X = 330,
    [float]$Y = 510,
    [float]$Width = 300,
    [float]$Height = 115
  )

  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38, 75, 64, 54))
  $Graphics.FillEllipse($shadowBrush, $X - 20, $Y + $Height - 8, $Width + 40, 34)

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddLine($X + 24, $Y, $X + $Width - 24, $Y)
  $path.AddLine($X + $Width - 48, $Y + $Height, $X + 48, $Y + $Height)
  $path.CloseFigure()

  $Graphics.FillPath($Fill, $path)
  $Graphics.FillEllipse($Fill, $X, $Y - 22, $Width, 48)
  $rimPen = New-PenFromHex "#8c6347" 4
  $Graphics.DrawEllipse($rimPen, $X, $Y - 22, $Width, 48)
}

function Draw-Flower {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [System.Drawing.Brush]$PetalBrush,
    [System.Drawing.Brush]$CenterBrush,
    [float]$Scale = 1
  )

  for ($angle = 0; $angle -lt 360; $angle += 45) {
    Draw-Petal $Graphics $CenterX $CenterY (34 * $Scale) (84 * $Scale) $angle $PetalBrush
  }

  $Graphics.FillEllipse($CenterBrush, $CenterX - (18 * $Scale), $CenterY - (18 * $Scale), 36 * $Scale, 36 * $Scale)
}

foreach ($plant in $plants) {
  $bitmap = New-Object System.Drawing.Bitmap 960, 720
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $rect = New-Object System.Drawing.Rectangle 0, 0, 960, 720
  $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (Convert-HexColor $plant.Bg1), (Convert-HexColor $plant.Bg2), 90
  $graphics.FillRectangle($backgroundBrush, $rect)

  $softCircleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(56, 255, 255, 255))
  $graphics.FillEllipse($softCircleBrush, 118, 72, 724, 510)

  $leafBrush = New-SolidBrush $plant.Leaf
  $accentBrush = New-SolidBrush $plant.Accent
  $potBrush = New-SolidBrush $plant.Pot
  $stemPen = New-PenFromHex "#507842" 8
  $leafPen = New-PenFromHex "#225d34" 3

  switch ($plant.Style) {
    "upright" {
      Draw-Pot $graphics $potBrush
      Draw-Leaf $graphics 430 360 94 330 -8 $leafBrush $leafPen
      Draw-Leaf $graphics 512 332 86 360 7 $accentBrush $leafPen
      Draw-Leaf $graphics 575 382 82 300 18 $leafBrush $leafPen
      Draw-Leaf $graphics 362 395 76 270 -22 $accentBrush $leafPen
    }
    "palm" {
      Draw-Pot $graphics $potBrush
      $graphics.DrawLine($stemPen, 480, 535, 480, 255)
      foreach ($angle in @(-68, -44, -22, 18, 42, 66)) {
        Draw-Leaf $graphics 480 260 70 265 $angle $leafBrush $leafPen
      }
      foreach ($angle in @(-50, -30, 30, 50)) {
        Draw-Leaf $graphics 480 340 58 205 $angle $accentBrush $leafPen
      }
    }
    "herb" {
      Draw-Pot $graphics $potBrush
      foreach ($x in @(405, 445, 485, 525, 565)) {
        $graphics.DrawLine($stemPen, 480, 530, $x, 285)
        Draw-Leaf $graphics ($x - 24) 365 62 110 -45 $leafBrush $leafPen
        Draw-Leaf $graphics ($x + 24) 335 58 104 43 $accentBrush $leafPen
      }
      Draw-Flower $graphics 502 275 $accentBrush (New-SolidBrush "#f4d35e") 0.45
    }
    "flower" {
      Draw-Pot $graphics $potBrush
      foreach ($target in @(@(420, 310), @(520, 265), @(590, 352))) {
        $graphics.DrawLine($stemPen, 480, 525, $target[0], $target[1])
        Draw-Leaf $graphics ($target[0] - 48) ($target[1] + 88) 66 120 -42 $leafBrush $leafPen
        Draw-Flower $graphics $target[0] $target[1] $accentBrush (New-SolidBrush "#f7c948") 0.9
      }
    }
    "jasmine" {
      Draw-Pot $graphics $potBrush
      foreach ($target in @(@(420, 312), @(505, 275), @(585, 338))) {
        $graphics.DrawLine($stemPen, 480, 530, $target[0], $target[1])
        Draw-Leaf $graphics ($target[0] + 36) ($target[1] + 92) 62 118 35 $leafBrush $leafPen
        Draw-Flower $graphics $target[0] $target[1] $accentBrush (New-SolidBrush "#f0c55a") 0.62
      }
    }
    "tree" {
      $trunkPen = New-PenFromHex "#806044" 20
      $graphics.DrawLine($trunkPen, 480, 560, 480, 300)
      for ($i = 0; $i -lt 22; $i++) {
        $cx = 300 + (($i * 73) % 360)
        $cy = 170 + (($i * 47) % 250)
        $canopyBrush = $leafBrush
        if ($i % 2 -ne 0) {
          $canopyBrush = $accentBrush
        }
        $graphics.FillEllipse($canopyBrush, $cx, $cy, 116, 88)
      }
      Draw-Pot $graphics $potBrush 350 560 260 72
    }
    "vine" {
      Draw-Pot $graphics $potBrush
      $vinePen = New-PenFromHex "#5f7e3a" 7
      $path = New-Object System.Drawing.Drawing2D.GraphicsPath
      $path.AddBezier(360, 520, 250, 360, 440, 265, 320, 155)
      $path.AddBezier(480, 520, 675, 365, 510, 260, 650, 145)
      $graphics.DrawPath($vinePen, $path)
      foreach ($point in @(@(330, 170), @(402, 285), @(630, 156), @(555, 295), @(390, 385), @(575, 405))) {
        Draw-Leaf $graphics ($point[0] + 26) ($point[1] + 28) 54 100 36 $leafBrush $leafPen
        Draw-Flower $graphics $point[0] $point[1] $accentBrush (New-SolidBrush "#f9c4d8") 0.5
      }
    }
    "succulent" {
      Draw-Pot $graphics $potBrush
      foreach ($angle in @(-52, -34, -18, 0, 18, 34, 52)) {
        Draw-Leaf $graphics 480 440 78 285 $angle $leafBrush $leafPen
      }
      foreach ($angle in @(-26, 0, 26)) {
        Draw-Leaf $graphics 480 435 52 220 $angle $accentBrush $leafPen
      }
    }
    "trailing" {
      Draw-Pot $graphics $potBrush 345 250 270 95
      $vinePen = New-PenFromHex "#3e7d3f" 7
      foreach ($start in @(385, 455, 535, 585)) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddBezier($start, 320, $start - 70, 410, $start + 55, 500, $start - 30, 620)
        $graphics.DrawPath($vinePen, $path)
        for ($i = 0; $i -lt 4; $i++) {
          $leafAngle = 35
          if ($i % 2 -eq 0) {
            $leafAngle = -35
          }
          Draw-Leaf $graphics ($start - 42 + ($i * 28)) (380 + ($i * 58)) 58 78 $leafAngle $leafBrush $leafPen
        }
      }
    }
    "marigold" {
      Draw-Pot $graphics $potBrush
      foreach ($target in @(@(400, 310), @(500, 260), @(595, 330), @(455, 380))) {
        $graphics.DrawLine($stemPen, 480, 535, $target[0], $target[1])
        Draw-Flower $graphics $target[0] $target[1] $accentBrush (New-SolidBrush "#8f5b12") 0.72
      }
    }
    "cluster" {
      Draw-Pot $graphics $potBrush
      foreach ($target in @(@(405, 290), @(510, 255), @(590, 325))) {
        $graphics.DrawLine($stemPen, 480, 535, $target[0], $target[1])
        Draw-Leaf $graphics ($target[0] - 38) ($target[1] + 115) 68 120 -34 $leafBrush $leafPen
        for ($i = 0; $i -lt 8; $i++) {
          $dx = (($i % 4) * 22) - 34
          $dy = ([math]::Floor($i / 4) * 22) - 14
          $graphics.FillEllipse($accentBrush, $target[0] + $dx, $target[1] + $dy, 30, 30)
        }
      }
    }
    "lily" {
      Draw-Pot $graphics $potBrush
      Draw-Leaf $graphics 405 415 98 270 -35 $leafBrush $leafPen
      Draw-Leaf $graphics 500 390 98 290 0 $leafBrush $leafPen
      Draw-Leaf $graphics 590 420 92 250 32 $leafBrush $leafPen
      foreach ($target in @(@(455, 295), @(550, 250))) {
        $graphics.DrawLine($stemPen, 485, 535, $target[0], $target[1])
        Draw-Petal $graphics $target[0] $target[1] 70 110 18 $accentBrush
        $graphics.FillEllipse((New-SolidBrush "#f4d35e"), $target[0] - 8, $target[1] + 10, 16, 32)
      }
    }
  }

  $path = Join-Path $outputDir $plant.File
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $graphics.Dispose()
  $bitmap.Dispose()
}
