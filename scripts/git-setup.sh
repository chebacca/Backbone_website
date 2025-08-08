#!/bin/bash

# Git Setup Script for Dashboard v14 Licensing Website
# This script helps with common git operations

set -e

echo "🚀 Dashboard v14 Licensing Website - Git Setup"
echo "=============================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     - Show git status"
    echo "  commit     - Add all changes and commit with message"
    echo "  push       - Push to remote repository (if configured)"
    echo "  pull       - Pull from remote repository (if configured)"
    echo "  log        - Show recent commits"
    echo "  setup      - Initial setup (run this first)"
    echo ""
}

# Function to setup remote repository
setup_remote() {
    echo "📝 Setting up remote repository..."
    echo "Please enter your remote repository URL (e.g., https://github.com/username/repo.git):"
    read -r remote_url
    
    if [ -n "$remote_url" ]; then
        git remote add origin "$remote_url"
        echo "✅ Remote repository added: $remote_url"
        echo "To push your code, run: git push -u origin main"
    else
        echo "❌ No remote URL provided. You can add it later with:"
        echo "   git remote add origin <your-repo-url>"
    fi
}

# Function to show git status
show_status() {
    echo "📊 Git Status:"
    git status --short
    echo ""
    echo "📈 Recent Commits:"
    git log --oneline -5
}

# Function to commit changes
commit_changes() {
    echo "💾 Committing changes..."
    echo "Enter commit message:"
    read -r commit_message
    
    if [ -n "$commit_message" ]; then
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed successfully!"
    else
        echo "❌ No commit message provided."
    fi
}

# Function to push changes
push_changes() {
    echo "🚀 Pushing changes to remote..."
    if git remote get-url origin >/dev/null 2>&1; then
        git push origin main
        echo "✅ Changes pushed successfully!"
    else
        echo "❌ No remote repository configured."
        echo "Run '$0 setup' to configure a remote repository."
    fi
}

# Function to pull changes
pull_changes() {
    echo "📥 Pulling changes from remote..."
    if git remote get-url origin >/dev/null 2>&1; then
        git pull origin main
        echo "✅ Changes pulled successfully!"
    else
        echo "❌ No remote repository configured."
        echo "Run '$0 setup' to configure a remote repository."
    fi
}

# Function to show recent commits
show_log() {
    echo "📋 Recent Commits:"
    git log --oneline -10
}

# Function to perform initial setup
initial_setup() {
    echo "🔧 Initial Git Setup"
    echo "==================="
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        echo "❌ Git repository not initialized."
        echo "Please run 'git init' first."
        exit 1
    fi
    
    # Check if we have commits
    if ! git rev-parse HEAD >/dev/null 2>&1; then
        echo "❌ No commits found. Please make an initial commit first."
        exit 1
    fi
    
    echo "✅ Git repository is properly initialized."
    echo "✅ Initial commit found."
    
    # Setup remote if not already configured
    if ! git remote get-url origin >/dev/null 2>&1; then
        setup_remote
    else
        echo "✅ Remote repository already configured."
        git remote -v
    fi
    
    echo ""
    echo "🎉 Setup complete! Your repository is ready for development."
    echo ""
    echo "Common commands:"
    echo "  $0 status  - Check repository status"
    echo "  $0 commit  - Commit changes"
    echo "  $0 push    - Push to remote"
    echo "  $0 pull    - Pull from remote"
}

# Main script logic
case "${1:-}" in
    "status")
        show_status
        ;;
    "commit")
        commit_changes
        ;;
    "push")
        push_changes
        ;;
    "pull")
        pull_changes
        ;;
    "log")
        show_log
        ;;
    "setup")
        initial_setup
        ;;
    *)
        show_usage
        ;;
esac
