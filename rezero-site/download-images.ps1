$BASE = "https://re-zero-anime.jp/tv/assets/character"
$OUT_C = "public\characters\c"
$OUT_F = "public\characters\f"

# Portrait images (c/)
$cImages = @(
  "1c.webp", "2a.webp", "3.webp", "4c.webp", "5c.webp", "6a.webp", "7b.webp",
  "8b.webp", "9b.webp", "10b.webp", "11c.webp", "12.webp", "13c.webp", "14c.webp",
  "15c.webp", "16c.webp", "17.webp", "18.png", "19.webp", "20.webp", "21.webp",
  "22b.webp", "23.webp", "24.png", "25.png", "26.png", "27.png", "28.png",
  "29.png", "30.png", "32b.webp", "33b.webp", "34.webp", "35b.webp", "36.webp",
  "37.webp", "38.webp", "39.webp", "40b.webp", "41.webp", "42.webp", "43.webp",
  "44.webp", "45.webp", "46.webp", "47.webp", "48.webp"
)

# Full body images (f/)
$fImages = @(
  "1.webp", "2.webp", "3.webp", "4.webp", "5.webp", "6.webp", "7.webp",
  "8.webp", "9.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp",
  "15.webp", "16.webp", "17.webp", "18.png", "22.png", "24.png", "25.png",
  "26.png", "27.png", "28.png", "29.png", "30.png", "32.webp", "33.webp",
  "35.webp", "36.webp", "37.webp", "38.webp", "39.webp", "40.webp", "41.webp",
  "42.webp", "43.webp", "44.webp"
)

$total = $cImages.Count + $fImages.Count
$count = 0

function Download-Image($url, $outPath, $label) {
  $count = $script:count
  $script:count++
  Write-Host "[$count/$total] Downloading $label ..." -NoNewline
  try {
    Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing -TimeoutSec 30
    Write-Host " OK" -ForegroundColor Green
  } catch {
    Write-Host " FAILED: $_" -ForegroundColor Red
  }
}

foreach ($img in $cImages) {
  Download-Image "$BASE/c/$img" "$OUT_C\$img" "c/$img"
}

foreach ($img in $fImages) {
  Download-Image "$BASE/f/$img" "$OUT_F\$img" "f/$img"
}

Write-Host "`nDone! Downloaded $script:count / $total images."
