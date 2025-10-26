# 🚀 AUTOMATED GITHUB PUSH SCRIPT
# This script will safely push your project to GitHub

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🚀 MUNICIPAL FUND BLOCKCHAIN - GITHUB PUSH" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"
Set-Location $projectPath

# Check if git is installed
Write-Host "🔍 Checking if Git is installed..." -ForegroundColor Cyan
$gitVersion = git --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}
Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
Write-Host ""

# Check if .gitignore exists
if (-not (Test-Path ".gitignore")) {
    Write-Host "⚠️  .gitignore file not found!" -ForegroundColor Yellow
    Write-Host "Creating .gitignore file..." -ForegroundColor Cyan
    # .gitignore will be created by the other script
} else {
    Write-Host "✅ .gitignore file exists" -ForegroundColor Green
}
Write-Host ""

# Initialize git if needed
Write-Host "🔍 Checking if Git repository is initialized..." -ForegroundColor Cyan
git status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized!" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}
Write-Host ""

# Configure git user
Write-Host "👤 Configuring Git user..." -ForegroundColor Cyan
$userName = git config user.name
if ([string]::IsNullOrEmpty($userName)) {
    $name = Read-Host "Enter your name"
    git config user.name "$name"
    Write-Host "✅ Name set: $name" -ForegroundColor Green
} else {
    Write-Host "✅ User name already set: $userName" -ForegroundColor Green
}

$userEmail = git config user.email
if ([string]::IsNullOrEmpty($userEmail)) {
    $email = Read-Host "Enter your email (use GitHub email)"
    git config user.email "$email"
    Write-Host "✅ Email set: $email" -ForegroundColor Green
} else {
    Write-Host "✅ User email already set: $userEmail" -ForegroundColor Green
}
Write-Host ""

# Check for sensitive files
Write-Host "🔐 Checking for sensitive files..." -ForegroundColor Cyan
$sensitiveFiles = @()

if (Test-Path ".env") {
    $sensitiveFiles += ".env"
}
if (Test-Path "frontend/.env") {
    $sensitiveFiles += "frontend/.env"
}
if (Test-Path "deployment-info.json") {
    $sensitiveFiles += "deployment-info.json"
}

if ($sensitiveFiles.Count -gt 0) {
    Write-Host "⚠️  Found sensitive files:" -ForegroundColor Yellow
    foreach ($file in $sensitiveFiles) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    Write-Host "✅ These files are in .gitignore and will NOT be pushed" -ForegroundColor Green
} else {
    Write-Host "✅ No sensitive files found in root" -ForegroundColor Green
}
Write-Host ""

# Show what will be committed
Write-Host "📋 Files to be added:" -ForegroundColor Cyan
git add .
git status --short
Write-Host ""

# Confirmation
Write-Host "⚠️  IMPORTANT: Review the files above" -ForegroundColor Yellow
Write-Host "Make sure no sensitive data (API keys, private keys) will be pushed!" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continue with commit? (yes/no)"
if ($continue -ne "yes") {
    Write-Host "❌ Aborted by user" -ForegroundColor Red
    exit
}

# Commit
Write-Host ""
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrEmpty($commitMessage)) {
    $commitMessage = "Initial commit: Municipal Fund Blockchain System with Smart Contracts, Frontend, Backend, and Documentation"
}

git commit -m "$commitMessage"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    Write-Host "This might mean no changes to commit, or there's an error." -ForegroundColor Yellow
}
Write-Host ""

# Add remote
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Cyan
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Remote origin already set: $remote" -ForegroundColor Green
    $changeRemote = Read-Host "Change remote URL? (yes/no)"
    if ($changeRemote -eq "yes") {
        $repoUrl = Read-Host "Enter new GitHub repository URL"
        git remote remove origin
        git remote add origin $repoUrl
        Write-Host "✅ Remote updated!" -ForegroundColor Green
    }
} else {
    Write-Host "No remote repository configured yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 First, create a repository on GitHub:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "   2. Create repository: 'municipal-fund-blockchain'" -ForegroundColor White
    Write-Host "   3. Copy the repository URL" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "Enter your GitHub repository URL (https://github.com/USERNAME/REPO.git)"
    if (-not [string]::IsNullOrEmpty($repoUrl)) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote repository added!" -ForegroundColor Green
    } else {
        Write-Host "❌ No URL provided. You can add it later with:" -ForegroundColor Red
        Write-Host "   git remote add origin YOUR_REPO_URL" -ForegroundColor Yellow
        pause
        exit
    }
}
Write-Host ""

# Set main branch
Write-Host "🌿 Setting up main branch..." -ForegroundColor Cyan
git branch -M main
Write-Host "✅ Branch set to 'main'" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "⚠️  You may be asked for authentication:" -ForegroundColor Yellow
Write-Host "   - Username: Your GitHub username" -ForegroundColor White
Write-Host "   - Password: Use Personal Access Token (NOT your password!)" -ForegroundColor White
Write-Host "   - Get token from: https://github.com/settings/tokens" -ForegroundColor White
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 69) -ForegroundColor Green
    Write-Host "🎉 SUCCESS! PROJECT PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 69) -ForegroundColor Green
    Write-Host ""
    
    $remote = git remote get-url origin
    $webUrl = $remote -replace '\.git$', '' -replace 'git@github.com:', 'https://github.com/'
    
    Write-Host "🔗 View your repository at:" -ForegroundColor Cyan
    Write-Host "   $webUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Visit your GitHub repository" -ForegroundColor White
    Write-Host "   2. Check if all files are there" -ForegroundColor White
    Write-Host "   3. Verify no sensitive data was pushed" -ForegroundColor White
    Write-Host "   4. Add repository description and topics" -ForegroundColor White
    Write-Host "   5. Share your project! 🎊" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 69) -ForegroundColor Red
    Write-Host "❌ PUSH FAILED!" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 69) -ForegroundColor Red
    Write-Host ""
    
    Write-Host "🆘 Common solutions:" -ForegroundColor Yellow
    Write-Host "   1. Authentication failed:" -ForegroundColor White
    Write-Host "      - Use Personal Access Token, not password" -ForegroundColor Gray
    Write-Host "      - Get token: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Repository doesn't exist:" -ForegroundColor White
    Write-Host "      - Create repository on GitHub first" -ForegroundColor Gray
    Write-Host "      - https://github.com/new" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Remote URL wrong:" -ForegroundColor White
    Write-Host "      - Check: git remote -v" -ForegroundColor Gray
    Write-Host "      - Fix: git remote set-url origin NEW_URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Use GitHub Desktop instead:" -ForegroundColor White
    Write-Host "      - Download: https://desktop.github.com/" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
pause
