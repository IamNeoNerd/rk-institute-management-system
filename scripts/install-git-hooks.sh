#!/bin/bash
# RK Institute Management System - Git Hooks Installation Script
# Professional Development & CI/CD Protocol v2.0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🔧 Installing Git Hooks for Professional Development Workflow...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "${RED}❌ Error: Not in a Git repository root directory${NC}"
    echo "${YELLOW}💡 Please run this script from the project root directory${NC}"
    exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f ".githooks/pre-commit" ]; then
    echo "${BLUE}📋 Installing pre-commit hook...${NC}"
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "${GREEN}✅ Pre-commit hook installed${NC}"
else
    echo "${RED}❌ Error: .githooks/pre-commit not found${NC}"
    exit 1
fi

# Install commit-msg hook for Conventional Commits validation
echo "${BLUE}📋 Creating commit-msg hook...${NC}"
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/sh
# Conventional Commits validation

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# Conventional Commits pattern
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+"

if [[ ! "$COMMIT_MSG" =~ $PATTERN ]]; then
    echo "${RED}❌ COMMIT MESSAGE VIOLATION: Must follow Conventional Commits format${NC}"
    echo "${YELLOW}📋 Required format: type(scope): description${NC}"
    echo "${YELLOW}📋 Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert${NC}"
    echo ""
    echo "${YELLOW}Examples:${NC}"
    echo "   ${GREEN}feat(auth): add user authentication${NC}"
    echo "   ${GREEN}fix(dashboard): resolve navigation bug${NC}"
    echo "   ${GREEN}docs(readme): update installation guide${NC}"
    echo "   ${GREEN}refactor(api): improve error handling${NC}"
    echo ""
    echo "${YELLOW}Your message: ${NC}$COMMIT_MSG"
    exit 1
fi

echo "${GREEN}✅ Commit message format valid${NC}"
EOF

chmod +x .git/hooks/commit-msg
echo "${GREEN}✅ Commit-msg hook installed${NC}"

# Install pre-push hook for additional safety
echo "${BLUE}📋 Creating pre-push hook...${NC}"
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
# Pre-push hook for additional workflow validation

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}🚀 Running pre-push validation...${NC}"

# Get the branch being pushed
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Prevent direct pushes to main and develop
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
    echo "${RED}❌ WORKFLOW VIOLATION: Direct pushes to '$CURRENT_BRANCH' are prohibited!${NC}"
    echo "${YELLOW}📋 Professional Development & CI/CD Protocol v2.0 requires:${NC}"
    echo "   1. Use Pull Requests for all changes to main/develop"
    echo "   2. Ensure proper code review and CI/CD checks"
    echo "   3. Follow the established workflow"
    echo ""
    echo "${YELLOW}💡 To push feature branches:${NC}"
    echo "   ${GREEN}git checkout -b feature/your-feature${NC}"
    echo "   ${GREEN}git push origin feature/your-feature${NC}"
    echo "   ${GREEN}# Then create a Pull Request${NC}"
    echo ""
    exit 1
fi

# Run final tests before push
if command -v npm >/dev/null 2>&1; then
    echo "${BLUE}🧪 Running final test suite...${NC}"
    if ! npm run test >/dev/null 2>&1; then
        echo "${RED}❌ Tests failed. Please fix before pushing.${NC}"
        exit 1
    fi
    echo "${GREEN}✅ Tests passed${NC}"
fi

echo "${GREEN}🎉 Pre-push validation passed!${NC}"
EOF

chmod +x .git/hooks/pre-push
echo "${GREEN}✅ Pre-push hook installed${NC}"

# Create a backup of existing hooks (if any)
if [ -d ".git/hooks.backup" ]; then
    echo "${YELLOW}⚠️  Previous hook backup found at .git/hooks.backup${NC}"
else
    echo "${BLUE}📋 Creating backup of any existing hooks...${NC}"
    mkdir -p .git/hooks.backup
    echo "${GREEN}✅ Backup directory created${NC}"
fi

# Set up git config for better workflow
echo "${BLUE}📋 Configuring Git settings for professional workflow...${NC}"

# Configure git to use the hooks
git config core.hooksPath .git/hooks

# Configure git to always use conventional commits template
git config commit.template .gitmessage 2>/dev/null || true

# Configure git to automatically setup remote tracking
git config push.autoSetupRemote true

# Configure git to use rebase for pulls
git config pull.rebase true

echo "${GREEN}✅ Git configuration updated${NC}"

# Create commit message template
echo "${BLUE}📋 Creating commit message template...${NC}"
cat > .gitmessage << 'EOF'
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Type should be one of the following:
# * feat: A new feature
# * fix: A bug fix
# * docs: Documentation only changes
# * style: Changes that do not affect the meaning of the code
# * refactor: A code change that neither fixes a bug nor adds a feature
# * perf: A code change that improves performance
# * test: Adding missing tests or correcting existing tests
# * chore: Changes to the build process or auxiliary tools
# * ci: Changes to CI configuration files and scripts
# * build: Changes that affect the build system or external dependencies
# * revert: Reverts a previous commit

# Scope is optional and should be the name of the package affected
# Subject should be imperative mood, lowercase, no period at the end
# Body should explain what and why vs. how (optional)
# Footer should contain any breaking changes or issue references (optional)

# Examples:
# feat(auth): add user authentication
# fix(dashboard): resolve navigation bug
# docs(readme): update installation guide
EOF

echo "${GREEN}✅ Commit message template created${NC}"

echo ""
echo "${GREEN}🎉 Git Hooks Installation Complete!${NC}"
echo ""
echo "${BLUE}📋 Installed Hooks:${NC}"
echo "   ✅ pre-commit: Validates workflow, linting, TypeScript, security"
echo "   ✅ commit-msg: Enforces Conventional Commits format"
echo "   ✅ pre-push: Prevents direct pushes to protected branches"
echo ""
echo "${BLUE}📋 Git Configuration:${NC}"
echo "   ✅ Hooks path configured"
echo "   ✅ Auto-setup remote tracking enabled"
echo "   ✅ Rebase on pull configured"
echo "   ✅ Commit message template created"
echo ""
echo "${YELLOW}💡 Next Steps:${NC}"
echo "   1. Test the hooks by making a commit"
echo "   2. Ensure your team runs this script on their local machines"
echo "   3. Follow the Professional Development & CI/CD Protocol v2.0"
echo ""
echo "${GREEN}Happy coding! 🚀${NC}"
