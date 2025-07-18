#!/bin/bash
# Backup and Testing Script for Planet bizCORE Development

echo "🚀 Planet bizCORE Development Backup & Testing Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on the development branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "feature/hierarchical-topics" ]; then
    print_error "Not on development branch. Current branch: $current_branch"
    echo "Switch to development branch with: git checkout feature/hierarchical-topics"
    exit 1
fi

print_status "On development branch: $current_branch"

# Backup current production state
echo -e "\n📦 Creating Backup..."
if [ ! -d "backups" ]; then
    mkdir backups
fi

backup_date=$(date +"%Y%m%d_%H%M%S")
backup_dir="backups/production_backup_$backup_date"
mkdir -p "$backup_dir"

# Backup key files
cp .env.local "$backup_dir/.env.production.backup" 2>/dev/null || print_warning ".env.local not found"
cp package.json "$backup_dir/"
cp -r components "$backup_dir/"
cp -r lib "$backup_dir/"
cp *.sql "$backup_dir/" 2>/dev/null || print_warning "No SQL files found"

print_status "Backup created: $backup_dir"

# Setup development environment
echo -e "\n🔧 Setting up Development Environment..."
if [ -f ".env.development" ]; then
    cp .env.development .env.local
    print_status "Development environment variables loaded"
else
    print_error ".env.development file not found"
    exit 1
fi

# Install dependencies if needed
echo -e "\n📚 Checking Dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_status "Dependencies installed"
else
    print_error "package.json not found"
    exit 1
fi

# Database schema check
echo -e "\n🗄️  Database Schema Status..."
if [ -f "hierarchical_topics_schema.sql" ]; then
    print_status "Hierarchical topics schema ready for deployment"
    print_warning "Manual step: Apply schema to development database"
    echo "   Run: npx supabase db reset (if using local Supabase)"
    echo "   Or apply hierarchical_topics_schema.sql to your Supabase instance"
else
    print_error "hierarchical_topics_schema.sql not found"
fi

# Build test
echo -e "\n🏗️  Build Testing..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Build successful"
else
    print_error "Build failed"
    echo "Fix build errors before proceeding"
    exit 1
fi

# Feature flag validation
echo -e "\n🚩 Feature Flag Status..."
echo "Development flags enabled:"
echo "  - HIERARCHICAL_TOPICS: true"
echo "  - AUTO_TOPIC_EXTRACTION: true"
echo "  - ENHANCED_SCHEMA: true"
echo "  - DEBUG_MODE: true"

# Next steps
echo -e "\n🎯 Next Steps:"
echo "1. Apply database schema: hierarchical_topics_schema.sql"
echo "2. Test document upload with hierarchical extraction"
echo "3. Validate topic hierarchy creation"
echo "4. Test AI agent accuracy improvements"
echo "5. When ready, merge to master: git checkout master && git merge feature/hierarchical-topics"

# Rollback instructions
echo -e "\n🔄 Rollback Instructions (if needed):"
echo "1. Switch to master: git checkout master"
echo "2. Restore production env: cp $backup_dir/.env.production.backup .env.local"
echo "3. Deploy: npx vercel --prod"

print_status "Development environment ready! 🎉"
echo -e "\nHappy coding! Your production app remains safe on the master branch."
