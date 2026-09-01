#!/bin/bash
# ============================================
# Amplizo - GitHub Upload Script
# ============================================
# Run this script after installing Git
# Make sure you're in the project root directory

echo "🚀 Amplizo GitHub Upload Script"
echo "================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Download Git from: https://git-scm.com/download/win"
    echo "Install with default settings, then run this script again."
    exit 1
fi

# Check if we're in a git repository
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
else
    echo "📦 Initializing Git repository..."
    git init
fi

# Configure Git (change these values)
echo ""
echo "⚙️  Git Configuration"
read -p "Enter your Git username: " GIT_USER
read -p "Enter your Git email: " GIT_EMAIL
git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.db-journal
backend/prisma/dev.db
backend/prisma/prod.db

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep

# IDE
.vscode/
.idea/

# Docker
docker-compose.override.yml

# Logs
logs/
*.log

# OS
Thumbs.db
EOF
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Show status
echo ""
echo "📋 Files to be committed:"
git status --short

# Commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: Amplizo AI-Powered Live Chat Platform

Features:
- Next.js 14 frontend with Tailwind CSS
- NestJS 10 backend with Prisma ORM
- AI Employees, Customer Brain, Decision Engine
- Real-time chat with WebSocket
- Multi-branch support
- OAuth authentication (Google, Facebook)
- Admin dashboard with client management
- Dark/Light mode support
- Responsive design"

# Add remote
echo ""
echo "🔗 Setting up GitHub remote..."
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter repository name (amplizo): " REPO_NAME
REPO_NAME=${REPO_NAME:-amplizo}

git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Push
echo ""
echo "⬆️  Pushing to GitHub..."
echo "Note: You may need to enter your GitHub credentials"
echo "Use your Personal Access Token as password"
echo ""

git branch -M main
git push -u origin main --force

echo ""
echo "✅ Done! Your project is now on GitHub!"
echo "🌐 View at: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "📚 Next steps:"
echo "   1. Add a license file"
echo "   2. Set up GitHub Actions for CI/CD"
echo "   3. Configure branch protection rules"
