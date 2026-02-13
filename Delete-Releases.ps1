# Delete-Releases.ps1 - Script pentru a șterge toate releases și tag-urile din repo
# Autor: Police Helper
# Necesită: Git CLI și GitHub CLI (gh)

param(
    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "LaurBalaurAI",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "helpermdt",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = ""
)

# Citim token-ul din fișier dacă nu e specificat
if (-not $GitHubToken -or $GitHubToken.Length -lt 10) {
    $tokenFile = ".\github_token.txt"
    if (Test-Path $tokenFile) {
        $GitHubToken = Get-Content $tokenFile -Raw
        $GitHubToken = $GitHubToken.Trim()
        Write-Host "Token citit din fișierul: $($GitHubToken.Substring(0, 10))..." -ForegroundColor Green
    } else {
        Write-Host "Eroare: Nu am găsit token-ul GitHub în github_token.txt" -ForegroundColor Red
        Write-Host "Specifică token-ul ca parametru sau creează fișierul github_token.txt" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "=== ȘTERGERE RELEASES ȘI TAGS ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoOwner/$RepoName" -ForegroundColor White
Write-Host "Token: $($GitHubToken.Substring(0, 10))..." -ForegroundColor Gray
Write-Host ""

# Setăm token-ul pentru GitHub CLI
$env:GITHUB_TOKEN = $GitHubToken

# Verificăm dacă avem gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Eroare: GitHub CLI (gh) nu este instalat!" -ForegroundColor Red
    Write-Host "Instalează de la: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Verificăm dacă avem git (opțional)
$gitInstalled = $false
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitInstalled = $true
    Write-Host "Git CLI găsit" -ForegroundColor Green
} else {
    Write-Host "Git CLI nu este găsit (opțional)" -ForegroundColor Yellow
}

# Verificăm dacă suntem în repo git
if (-not (Test-Path ".git")) {
    Write-Host "Eroare: Nu sunteți într-un repo git!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Obținere lista de releases..." -ForegroundColor Yellow

# Obținem lista de releases
try {
    $releases = gh release list --repo "$RepoOwner/$RepoName" --limit 100 --json tagName,name
    Write-Host "Găsite $($releases.Count) releases" -ForegroundColor Green
} catch {
    Write-Host "Eroare la obținerea releases: $_" -ForegroundColor Red
    exit 1
}

if ($releases.Count -eq 0) {
    Write-Host "Nu există releases de șters." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "2. Ștergere releases..." -ForegroundColor Yellow

# Ștergem fiecare release
foreach ($release in $releases) {
    $tagName = $release.tagName
    $releaseName = $release.name
    
    Write-Host "Ștergere release: $releaseName (tag: $tagName)" -ForegroundColor White
    
    try {
        gh release delete "$tagName" --repo "$RepoOwner/$RepoName" --yes
        Write-Host "  ✅ Release șters" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Eroare la ștergere release: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Obținere lista de tag-uri..." -ForegroundColor Yellow

# Obținem lista de tag-uri de pe remote
try {
    $remoteTags = gh api --jq '.[].ref' "repos/$RepoOwner/$RepoName/git/refs/tags" | ForEach-Object { $_ -replace 'refs/tags/', '' }
    Write-Host "Găsite $($remoteTags.Count) tag-uri pe remote" -ForegroundColor Green
} catch {
    Write-Host "Eroare la obținerea tag-urilor remote: $_" -ForegroundColor Red
    $remoteTags = @()
}

if ($remoteTags.Count -eq 0) {
    Write-Host "Nu există tag-uri de șters." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "4. Ștergere tag-uri..." -ForegroundColor Yellow
    
    # Ștergem tag-urile de pe remote
    foreach ($tag in $remoteTags) {
        if ([string]::IsNullOrWhiteSpace($tag)) {
            Write-Host "Skip tag gol" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "Ștergere tag remote: $tag" -ForegroundColor White
        
        try {
            gh api --method DELETE "repos/$RepoOwner/$RepoName/git/refs/tags/$tag" --silent
            Write-Host "  ✅ Tag remote șters" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Eroare la ștergere tag remote: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== PROCES FINALIZAT ===" -ForegroundColor Cyan
Write-Host "Toate releases și tag-urile au fost șterse!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifică pe GitHub: https://github.com/$RepoOwner/$RepoName/releases" -ForegroundColor Cyan
Write-Host ""
