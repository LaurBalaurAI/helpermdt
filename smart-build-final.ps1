# Smart Build Script pentru Police Helper v2
# Autor: Police Helper
# Versiune: 1.0

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "menu",
    [string]$NewVersion = ""
)

# Functie pentru citirea versiunii din package.json
function Get-CurrentVersion {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        return $packageJson.version
    } catch {
        Write-Host "   Eroare la citirea package.json!" -ForegroundColor Red
        return "Necunoscut"
    }
}

# Functie pentru actualizarea versiunii in package.json
function Update-Version {
    param([string]$NewVersion)
    
    if ([string]::IsNullOrEmpty($NewVersion)) {
        $NewVersion = Read-Host "Introdu noua versiune: " -ForegroundColor Green
    }
    
    Write-Host "   Actualizare package.json..."
    try {
        # Citim fișierul ca text
        $packageJson = Get-Content "package.json" -Raw
        
        # Înlocuim versiunea folosind regex
        $packageJson = $packageJson -replace '"version":\s*"[^"]*"', "`"version`": `"$NewVersion`""
        
        # Salvăm fișierul fără BOM
        $utf8WithNoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText("package.json", $packageJson, $utf8WithNoBom)
        
        Write-Host "   package.json actualizat la: $NewVersion" -ForegroundColor Green
    } catch {
        Write-Host "   Eroare la actualizarea package.json!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # NU mai actualizăm main.js - citește dinamic din package.json
    Write-Host "   main.js citeste versiunea dinamic din package.json" -ForegroundColor Yellow
    
    Write-Host "   Versiunea actualizata complet la: $NewVersion" -ForegroundColor Green
    return $true
}

# Functie pentru upgrade Electron
function Update-ElectronVersion {
    Write-Host "   Upgrade Electron la cea mai recenta versiune..." -ForegroundColor Yellow
    
    try {
        # Verificam versiunea curenta
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $currentVersion = $packageJson.devDependencies.electron
        Write-Host "   Versiune curenta: $currentVersion" -ForegroundColor Gray
        
        # Obtinem cea mai recenta versiune
        $latestVersion = npm view electron version
        Write-Host "   Cea mai recenta versiune: $latestVersion" -ForegroundColor Green
        
        if ($currentVersion -eq $latestVersion) {
            Write-Host "   Este deja la cea mai recenta versiune!" -ForegroundColor Green
            return $true
        }
        
        # Actualizam package.json
        $packageContent = Get-Content "package.json" -Raw
        $packageContent = $packageContent -replace '"electron":\s*"[^"]*"', "`"electron`": `"$latestVersion`""
        
        $utf8WithNoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText("package.json", $packageContent, $utf8WithNoBom)
        
        Write-Host "   package.json actualizat la Electron $latestVersion" -ForegroundColor Green
        
        # Upgradam si electron-updater pentru compatibilitate
        $latestUpdaterVersion = npm view electron-updater version
        $packageContent = Get-Content "package.json" -Raw
        $packageContent = $packageContent -replace '"electron-updater":\s*"[^"]*"', "`"electron-updater`": `"$latestUpdaterVersion`""
        [System.IO.File]::WriteAllText("package.json", $packageContent, $utf8WithNoBom)
        
        Write-Host "   electron-updater actualizat la $latestUpdaterVersion" -ForegroundColor Green
        
        # Reinstalam dependentele
        Write-Host "   Reinstalare dependente..." -ForegroundColor Gray
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   Eroare la reinstalare!" -ForegroundColor Red
            return $false
        }
        
        Write-Host "   Upgrade complet cu succes!" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "   Eroare la upgrade Electron: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Functie pentru verificarea si repararea dependențelor
function Repair-Dependencies {
    Write-Host "   Verificare dependente..." -ForegroundColor Yellow
    
    $needsRepair = $false
    
    # Verificam daca node_modules exista
    if (-not (Test-Path "node_modules")) {
        Write-Host "   node_modules lipseste." -ForegroundColor Red
        $needsRepair = $true
    }
    
    # Verificam daca react-app-rewired este instalat
    if (-not (Test-Path "node_modules\.bin\react-app-rewired.cmd")) {
        Write-Host "   react-app-rewired nu este instalat corect." -ForegroundColor Red
        $needsRepair = $true
    }
    
    # Verificam daca pachetele critice exista
    $criticalPackages = @("react-scripts", "react-app-rewired", "electron", "electron-builder", "electron-updater")
    foreach ($package in $criticalPackages) {
        if (-not (Test-Path "node_modules\$package")) {
            Write-Host "   $package lipseste." -ForegroundColor Red
            $needsRepair = $true
        }
    }
    
    # Verificam module BABEL critice care cauzeaza erori
    $criticalModules = @("@babel/types", "@babel/core", "@babel/preset-env", "@babel/preset-react")
    foreach ($module in $criticalModules) {
        if (-not (Test-Path "node_modules\$module")) {
            Write-Host "   $module lipseste (cauzeaza erori Babel)." -ForegroundColor Red
            $needsRepair = $true
        }
    }
    
    # Test suplimentar - incarcare efectiva a modulelor critice
    try {
        $testResult = node -e "try { require('@babel/types'); require('@babel/core'); console.log('OK'); } catch(e) { console.log('MISSING'); }" 2>$null
        if ($testResult -ne "OK") {
            Write-Host "   Module Babel nu pot fi incarcate (corupte)." -ForegroundColor Red
            $needsRepair = $true
        }
    } catch {
        Write-Host "   Eroare la verificarea modulelor Babel." -ForegroundColor Yellow
        $needsRepair = $true
    }
    
    # Fortam repararea daca module Babel lipsesc chiar daca node_modules exista
    if (-not $needsRepair) {
        foreach ($module in $criticalModules) {
            if (-not (Test-Path "node_modules\$module")) {
                Write-Host "   Detectare fortata: $module lipseste." -ForegroundColor Red
                $needsRepair = $true
                break
            }
        }
    }
    
    if ($needsRepair) {
        Write-Host "   Se inceapa repararea dependențelor..." -ForegroundColor Gray
        
        # Inchidem posibile procese electron
        Write-Host "   Verificare procese electron active..." -ForegroundColor Gray
        try {
            $electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue
            if ($electronProcesses) {
                Write-Host "   Atentie: Procese electron gasite. Se recomanda inchiderea aplicatiei." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            }
        } catch {
            # Ignoram erorile la verificarea proceselor
        }
        
        # Stergem node_modules daca exista probleme majore
        if (-not (Test-Path "node_modules") -or -not (Test-Path "node_modules\@babel\core")) {
            if (Test-Path "node_modules") {
                Write-Host "   Stergere node_modules..." -ForegroundColor Gray
                try {
                    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 1
                } catch {
                    Write-Host "   Eroare la stergerea node_modules. Te rugam sa rulezi manual:" -ForegroundColor Yellow
                    Write-Host "   rmdir /s /q node_modules" -ForegroundColor Gray
                    return $false
                }
            }
            
            # Stergem package-lock.json pentru a evita conflicte
            if (Test-Path "package-lock.json") {
                Write-Host "   Stergere package-lock.json..." -ForegroundColor Gray
                Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
            }
            
            # Curatam cache npm pentru a evita conflicte
            Write-Host "   Curatare cache npm..." -ForegroundColor Gray
            npm cache clean --force
            
            # Instalam dependentele
            Write-Host "   Instalare dependente (acest proces poate dura cateva minute)..." -ForegroundColor Gray
            npm install --verbose
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   Eroare la instalarea dependențelor!" -ForegroundColor Red
                Write-Host "   Incearca: npm cache clean --force && npm install" -ForegroundColor Yellow
                return $false
            }
        } else {
            # Doar instalam modulele Babel lipsa
            Write-Host "   Instalare module Babel lipsa..." -ForegroundColor Gray
            npm install @babel/types @babel/core @babel/preset-env @babel/preset-react
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   Eroare la instalarea modulelor Babel!" -ForegroundColor Red
                return $false
            }
        }
        
        # Verificam finalizararea
        try {
            $testResult = node -e "try { require('@babel/types'); require('@babel/core'); console.log('OK'); } catch(e) { console.log('MISSING'); }" 2>$null
            if ($testResult -eq "OK") {
                Write-Host "   Dependente reparate cu succes!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "   Probleme persistente la modulele Babel." -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "   Nu s-a putut verifica modulele Babel." -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "   Dependente sunt in regula." -ForegroundColor Green
        return $true
    }
}

# Functie pentru build portable
function Build-Portable {
    Write-Host "   Incepere build portable..." -ForegroundColor Yellow
    
    # Verificam si reparam dependentele
    if (-not (Repair-Dependencies)) {
        Write-Host "   Nu s-au putut repara dependentele!" -ForegroundColor Red
        return $false
    }
    
    # Curatam build-urile anterioare
    if (Test-Path "dist") {
        Write-Host "   Curatare build-uri anterioare..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    }
    
    # Build React
    Write-Host "   Build React app..." -ForegroundColor Gray
    npm run build-react
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Eroare la build React!" -ForegroundColor Red
        return $false
    }
    
    # Build Electron cu configurare pentru portabil
    Write-Host "   Build Electron portable..." -ForegroundColor Gray
    npm run build-electron -- --win portable
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Eroare la build Electron!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Build portable finalizat!" -ForegroundColor Green
    
    # Verificam daca a creat fisierul portabil
    if (Test-Path "dist\*.exe") {
        Get-ChildItem "dist\*.exe" | ForEach-Object {
            if ($_.Name -like "*Setup*") {
                Write-Host "   Atentie: S-a creat fisier Setup in loc de portabil!" -ForegroundColor Yellow
                Write-Host "   Se cauta fisierul portabil..." -ForegroundColor Green
            } else {
                Write-Host "   $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "   Nu s-a gasit fisierul portabil!" -ForegroundColor Red
    }
    
    return $true
}

function Build-Publish {
    Write-Host "   Incepere build si publish..." -ForegroundColor Yellow
    
    # Verificam si reparam dependentele
    if (-not (Repair-Dependencies)) {
        Write-Host "   Nu s-au putut repara dependentele!" -ForegroundColor Red
        return $false
    }
    
    if (Test-Path "dist") {
        Write-Host "   Curatare build-uri anterioare..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    }
    
    Write-Host "   Build React..." -ForegroundColor Gray
    npm run build-react
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Eroare la build React!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Build Electron..." -ForegroundColor Gray
    npm run build-electron
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Eroare la build Electron!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Publicare pe GitHub..." -ForegroundColor Yellow
    & ".\Publish-Auto.ps1"
    
    Write-Host "   Build si publish finalizat!" -ForegroundColor Green
    return $true
}

# Meniu principal
function Show-Menu {
    $currentVersion = Get-CurrentVersion
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Police Helper - Smart Build" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Versiune curenta: $currentVersion" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Bump versiune" -ForegroundColor White
    Write-Host "   2. Build portable" -ForegroundColor White
    Write-Host "   3. Build portable si publish" -ForegroundColor White
    Write-Host "   4. Publish" -ForegroundColor White
    Write-Host "   5. Repara dependente" -ForegroundColor White
    Write-Host "   6. Upgrade Electron" -ForegroundColor White
    Write-Host "   7. Iesire" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Alege o optiune (1-7): " -ForegroundColor Green
    return $choice
}

# Logica principala
switch ($Action) {
    "menu" {
        while ($true) {
            $choice = Show-Menu
            
            switch ($choice) {
                "1" { 
                    $newVersion = Read-Host "Introdu noua versiune: " -ForegroundColor Green
                    if (Update-Version $newVersion) {
                        Write-Host "   Versiune actualizata! Apasa orice tasta pentru a continua..." -ForegroundColor Green
                        Read-Host
                        # Force refresh current version from package.json
                        $currentVersion = Get-CurrentVersion
                        Write-Host "   Versiune curenta actualizata: $currentVersion" -ForegroundColor Green
                        # Small delay to ensure file is saved
                        Start-Sleep -Milliseconds 500
                    }
                }
                "2" { Build-Portable }
                "3" { 
                    Write-Host "   Incepere build portabil..." -ForegroundColor Yellow
                    Build-Portable
                    Write-Host "   Build portabil finalizat!" -ForegroundColor Green
                    Write-Host "   Incepere publicare pe GitHub..." -ForegroundColor Yellow
                    & ".\Publish-Auto.ps1"
                    Write-Host "   Build portabil si publicare finalizat!" -ForegroundColor Green
                }
                "4" { 
                    Write-Host "   Incepere publicare pe GitHub..." -ForegroundColor Yellow
                    & ".\Publish-Auto.ps1"
                    Write-Host "   Publicare finalizat!" -ForegroundColor Green
                }
                "5" { 
                    Write-Host "   Reparare dependente..." -ForegroundColor Yellow
                    if (Repair-Dependencies) {
                        Write-Host "   Dependente reparate cu succes!" -ForegroundColor Green
                    } else {
                        Write-Host "   Eroare la repararea dependențelor!" -ForegroundColor Red
                    }
                    Write-Host "   Apasa orice tasta pentru a continua..." -ForegroundColor Gray
                    Read-Host
                }
                "6" { 
                    Write-Host "   Upgrade Electron..." -ForegroundColor Yellow
                    if (Update-ElectronVersion) {
                        Write-Host "   Electron upgradat cu succes!" -ForegroundColor Green
                    } else {
                        Write-Host "   Eroare la upgrade Electron!" -ForegroundColor Red
                    }
                    Write-Host "   Apasa orice tasta pentru a continua..." -ForegroundColor Gray
                    Read-Host
                }
                "7" { 
                    Write-Host "   Iesire din script..." -ForegroundColor Yellow
                    exit 0
                }
                default {
                    Write-Host "   Optiune invalida!" -ForegroundColor Red
                }
            }
        }
    }
    
    "bump" {
        if ($NewVersion -ne "") {
            if (Update-Version $NewVersion) {
                Write-Host "   Versiunea actualizata la: $NewVersion" -ForegroundColor Green
            }
        } else {
            Write-Host "   Trebuie sa specificati o versiune!" -ForegroundColor Red
        }
    }
    
    "build" { Build-Portable }
    default {
        Write-Host "   Actiune necunoscuta: $Action" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Proces finalizat!" -ForegroundColor Green
