# Publish-Auto.ps1 - Script pentru publicare automata pe GitHub
# Autor: Police Helper
# Versiune: 1.0

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = ""
)

# Adăugăm Git în PATH dacă nu există
$gitPath = "C:\Program Files\Git\bin"
if ($env:PATH -notlike [string]::Format("*{0}*", $gitPath)) {
    $env:PATH = "$gitPath;C:\Program Files\Git\mingw64\bin;" + $env:PATH
    Write-Host "   Git adăugat în PATH" -ForegroundColor Gray
}

# Verificam daca avem token
if (-not $GitHubToken -or $GitHubToken.Length -lt 10) {
    # Incercam sa citim din variabila de mediu
    $GitHubToken = $env:GH_TOKEN
}

# Daca nici token-ul nu este setat, folosim token-ul default
if (-not $GitHubToken -or $GitHubToken.Length -lt 10) {
    $GitHubToken = "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"
}

Write-Host "   Token GitHub: $($GitHubToken.Substring(0, 10))..." -ForegroundColor Gray

# Setam token-ul ca variabila de mediu pentru electron-builder
$env:GH_TOKEN = $GitHubToken

Write-Host "   Incepere publicare pe GitHub..." -ForegroundColor Yellow

try {
    # Verificam daca exista build-uri in folderul dist
    if (-not (Test-Path "dist")) {
        Write-Host "   Eroare: Folderul 'dist' nu exista! Ruleaza mai intai build-ul." -ForegroundColor Red
        exit 1
    }
    
    # Cautam fisiere executabile
    $exeFiles = Get-ChildItem "dist\*.exe" -ErrorAction SilentlyContinue
    
    if ($exeFiles.Count -eq 0) {
        Write-Host "   Eroare: Nu s-au gasit fisiere .exe in folderul dist!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   Fisiere gasite pentru publicare:" -ForegroundColor Green
    foreach ($file in $exeFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "   - $($file.Name) ($sizeMB MB)" -ForegroundColor Gray
    }
    
    # Publicam direct build-ul portabil existent
    Write-Host "   Publicare build portabil existent..." -ForegroundColor Yellow
    
    # Cautam fisierul portabil
    $portableFile = Get-ChildItem "dist\*.exe" | Where-Object { $_.Name -notlike "*Setup*" } | Select-Object -First 1
    
    if ($portableFile) {
        Write-Host "   Se publica fisierul portabil: $($portableFile.Name)" -ForegroundColor Green
        
        # Folosind GitHub CLI pentru upload (daca e disponibila)
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            Write-Host "   Folosind GitHub CLI pentru upload..." -ForegroundColor Yellow
            $version = (Get-Content "package.json" -Raw | ConvertFrom-Json).version
            
            # Creare release si upload
            gh release create "v$version" --title "Police Helper Enhanced v$version" --notes "Actualizare la versiunea $version" "$($portableFile.FullName)" --latest --repo LaurBalaurAI/helpermdt
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Publicare finalizata cu succes!" -ForegroundColor Green
                Write-Host "   Verificati release-ul pe: https://github.com/LaurBalaurAI/helpermdt/releases" -ForegroundColor Cyan
            } else {
                Write-Host "   Eroare la publicare cu GitHub CLI! Incercam metoda alternativa..." -ForegroundColor Yellow
                # Folosind metoda alternativa direct
            }
        }
        
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
            Write-Host "   GitHub CLI nu este disponibila. Folosind metoda alternativa..." -ForegroundColor Yellow
            
            # Metoda alternativa: copiem fisierul portabil cu nume corect pentru electron-builder
            $version = (Get-Content "package.json" -Raw | ConvertFrom-Json).version
            $tempPortable = "dist\Police.Helper.Enhanced.$version.exe"
            
            if (Test-Path $tempPortable) {
                Remove-Item $tempPortable -Force
            }
            
            Copy-Item $portableFile.FullName $tempPortable
            
            # Publicam folosind electron-builder doar pentru upload
            Write-Host "   Upload fisier portabil pe GitHub..." -ForegroundColor Yellow
            & npx electron-builder --publish=always --win portable --config.nsis.oneClick=false --config.directories.output="dist"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Publicare finalizata cu succes!" -ForegroundColor Green
                Write-Host "   Verificati release-ul pe: https://github.com/LaurBalaurAI/helpermdt/releases" -ForegroundColor Cyan
            } else {
                Write-Host "   Eroare la publicare! Code: $LASTEXITCODE" -ForegroundColor Red
                exit $LASTEXITCODE
            }
        }
    } else {
        Write-Host "   Eroare: Nu s-a gasit fisier portabil in folderul dist!" -ForegroundColor Red
        Write-Host "   Ruleaza mai intai optiunea 2 (Build portable)" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "   Eroare la publicare: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "   Script publicare finalizat." -ForegroundColor Green
