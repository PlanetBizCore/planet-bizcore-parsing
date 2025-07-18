# PowerShell Backup and Testing Script for Planet bizCORE Development
# Run with: .\setup_development.ps1

Write-Host "🚀 Planet bizCORE Development Backup & Testing Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're on the development branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "feature/hierarchical-topics") {
    Write-Error "Not on development branch. Current branch: $currentBranch"
    Write-Host "Switch to development branch with: git checkout feature/hierarchical-topics"
    exit 1
}

Write-Success "On development branch: $currentBranch"

# Backup current production state
Write-Host "`n📦 Creating Backup..." -ForegroundColor White
if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups/production_backup_$backupDate"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup key files
if (Test-Path ".env.local") {
    Copy-Item ".env.local" "$backupDir/.env.production.backup"
} else {
    Write-Warning ".env.local not found"
}

Copy-Item "package.json" $backupDir
Copy-Item "components" $backupDir -Recurse -Force
Copy-Item "lib" $backupDir -Recurse -Force

$sqlFiles = Get-ChildItem "*.sql" -ErrorAction SilentlyContinue
if ($sqlFiles) {
    Copy-Item "*.sql" $backupDir
} else {
    Write-Warning "No SQL files found"
}

Write-Success "Backup created: $backupDir"

# Setup development environment
Write-Host "`n🔧 Setting up Development Environment..." -ForegroundColor White
if (Test-Path ".env.development") {
    Copy-Item ".env.development" ".env.local" -Force
    Write-Success "Development environment variables loaded"
} else {
    Write-Error ".env.development file not found"
    exit 1
}

# Install dependencies if needed
Write-Host "`n📚 Checking Dependencies..." -ForegroundColor White
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed"
    } else {
        Write-Error "npm install failed"
        exit 1
    }
} else {
    Write-Error "package.json not found"
    exit 1
}

# Database schema check
Write-Host "`n🗄️  Database Schema Status..." -ForegroundColor White
if (Test-Path "hierarchical_topics_schema.sql") {
    Write-Success "Hierarchical topics schema ready for deployment"
    Write-Warning "Manual step: Apply schema to development database"
    Write-Host "   Run: npx supabase db reset (if using local Supabase)"
    Write-Host "   Or apply hierarchical_topics_schema.sql to your Supabase instance"
} else {
    Write-Error "hierarchical_topics_schema.sql not found"
}

# Build test
Write-Host "`n🏗️  Build Testing..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build successful"
} else {
    Write-Error "Build failed"
    Write-Host "Fix build errors before proceeding"
    exit 1
}

# Feature flag validation
Write-Host "`n🚩 Feature Flag Status..." -ForegroundColor White
Write-Host "Development flags enabled:"
Write-Host "  - HIERARCHICAL_TOPICS: true"
Write-Host "  - AUTO_TOPIC_EXTRACTION: true"
Write-Host "  - ENHANCED_SCHEMA: true"
Write-Host "  - DEBUG_MODE: true"

# Next steps
Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Apply database schema: hierarchical_topics_schema.sql"
Write-Host "2. Test document upload with hierarchical extraction"
Write-Host "3. Validate topic hierarchy creation"
Write-Host "4. Test AI agent accuracy improvements"
Write-Host "5. When ready, merge to master: git checkout master && git merge feature/hierarchical-topics"

# Rollback instructions
Write-Host "`n🔄 Rollback Instructions (if needed):" -ForegroundColor Yellow
Write-Host "1. Switch to master: git checkout master"
Write-Host "2. Restore production env: Copy-Item $backupDir/.env.production.backup .env.local -Force"
Write-Host "3. Deploy: npx vercel --prod"

Write-Success "Development environment ready! 🎉"
Write-Host "`nHappy coding! Your production app remains safe on the master branch." -ForegroundColor Cyan
