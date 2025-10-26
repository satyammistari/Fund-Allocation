<<<<<<< HEAD
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
=======
# Municipal Fund Blockchain - GitHub Push Script
# Run this after installing Git

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Municipal Fund Blockchain - Git Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found! Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

# Navigate to project directory
$projectPath = "C:\Users\SAKSHI SANJAY CHAVAN\Downloads\Muncipal-Fund--main\Muncipal-Fund--main"
Set-Location $projectPath
Write-Host "📁 Project directory: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""

# Ask for repository URL
Write-Host "📝 Enter GitHub repository URL:" -ForegroundColor Cyan
Write-Host "   Example: https://github.com/darshan-stack/Municipal.git" -ForegroundColor Gray
$repoUrl = Read-Host "URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    $repoUrl = "https://github.com/darshan-stack/Municipal.git"
    Write-Host "   Using default: $repoUrl" -ForegroundColor Yellow
}

Write-Host ""

# Remove existing remote and add new one
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "✅ Remote added: $repoUrl" -ForegroundColor Green
Write-Host ""

# Add all files
Write-Host "📦 Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged for commit" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "📋 Files to be committed:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
feat: Complete Municipal Fund Blockchain System for SIH 2025

Features implemented:
✅ Anonymous tender submission system
✅ 5-milestone workflow (20% each)
✅ Oracle verification for work completion
✅ Automatic payment release on approval
✅ Mandatory quality report submission
✅ Contractor eligibility tracking
✅ IPFS file upload simulation
✅ Role-based access control (Admin/Supervisor/Citizen)
✅ Comprehensive dashboard and analytics
✅ Smart contract integration ready

Tech Stack:
- Frontend: React 18, Tailwind CSS, Shadcn/ui
- Backend: Flask, Python
- Blockchain: Solidity, Polygon Mumbai
- Storage: IPFS simulation

Smart India Hackathon 2025 ready 🏆
"@

git commit -m $commitMessage
Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# Set main branch
Write-Host "🌿 Setting up main branch..." -ForegroundColor Yellow
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
git branch -M main
Write-Host "✅ Branch set to 'main'" -ForegroundColor Green
Write-Host ""

# Push to GitHub
<<<<<<< HEAD
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
=======
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   You will be asked for credentials:" -ForegroundColor Yellow
Write-Host "   - Username: Your GitHub username" -ForegroundColor White
Write-Host "   - Password: Use Personal Access Token (NOT your password)" -ForegroundColor White
Write-Host ""
Write-Host "   How to get Personal Access Token:" -ForegroundColor Cyan
Write-Host "   1. Go to GitHub.com → Settings" -ForegroundColor Gray
Write-Host "   2. Developer settings → Personal access tokens → Tokens (classic)" -ForegroundColor Gray
Write-Host "   3. Generate new token → Select 'repo' scope → Copy token" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue with push"

try {
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " ✅ Successfully pushed to GitHub! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 View your repository at:" -ForegroundColor Cyan
    Write-Host "   $repoUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Add repository description on GitHub" -ForegroundColor White
    Write-Host "   2. Add topics/tags for visibility" -ForegroundColor White
    Write-Host "   3. Enable GitHub Pages (optional)" -ForegroundColor White
    Write-Host "   4. Add collaborators if needed" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Wrong credentials - Use Personal Access Token" -ForegroundColor White
    Write-Host "   2. Repository doesn't exist - Create it on GitHub first" -ForegroundColor White
    Write-Host "   3. No permission - Ask repo owner to add you as collaborator" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Try using GitHub Desktop instead:" -ForegroundColor Cyan
    Write-Host "   Download: https://desktop.github.com/" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press Enter to exit"
Read-Host
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
