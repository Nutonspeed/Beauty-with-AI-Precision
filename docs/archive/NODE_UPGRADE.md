# 🔄 Node.js Upgrade Guide

## 📋 Why Upgrade?

Prisma v6.19+ requires **Node.js v20.19+** for full compatibility. Current version v20.18.0 may cause issues with latest features.

## 🎯 Target Version
- **Minimum**: Node.js v20.19.0
- **Recommended**: Node.js v20.x LTS (Latest)
- **Future-proof**: Node.js v22.x LTS

---

## 🪟 Windows Upgrade

### Option 1: Official Installer (Recommended)
1. **Download**: https://nodejs.org/
2. **Run installer**: Download Windows MSI (.msi)
3. **Automatic upgrade**: Installer overwrites existing version
4. **Verify**: Open new terminal and run `node -v`

### Option 2: Chocolatey
```powershell
# Upgrade to latest
choco upgrade nodejs

# Or specific version
choco install nodejs --version=20.19.0
```

### Option 3: Scoop
```powershell
# Update scoop
scoop update

# Upgrade Node.js
scoop upgrade nodejs

# Or install specific version
scoop install nodejs@20
```

---

## 🍎 macOS Upgrade

### Option 1: Homebrew (Recommended)
```bash
# Install Node.js 20
brew install node@20

# Unlink current and link new version
brew unlink node && brew link --overwrite node@20

# Or upgrade existing
brew upgrade node
```

### Option 2: NVM (Node Version Manager)
```bash
# Install NVM (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

### Option 3: Official Installer
1. Download from https://nodejs.org/
2. Run .pkg installer
3. Follow installation wizard

---

## 🐧 Linux Upgrade

### Option 1: NVM (Recommended)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v
```

### Option 2: NodeSource (Ubuntu/Debian)
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify
node -v
```

### Option 3: Package Manager
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo yum install nodejs npm
# or
sudo dnf install nodejs npm
```

---

## 🔧 Post-Upgrade Steps

### 1. Restart Terminal
Close and reopen your terminal to ensure new Node.js version is loaded.

### 2. Update Dependencies
```bash
# Clear cache
pnpm store prune

# Reinstall dependencies
pnpm install

# Update to latest compatible versions
pnpm update
```

### 3. Verify Build
```bash
# Test TypeScript compilation
pnpm run type-check

# Test build process
pnpm run build

# Test Prisma
pnpm run db:generate
pnpm run db:push
```

### 4. Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Full test suite
pnpm run test:ci
```

---

## 🔍 Verification

### Check Node.js Version
```bash
node -v
# Should show: v20.19.0 or higher
```

### Check npm/pnpm Version
```bash
npm -v
pnpm -v
```

### Check Project Compatibility
```bash
# Run our upgrade script
node scripts/upgrade-node.js

# Check Prisma compatibility
pnpm run db:generate
```

### Test Application
```bash
# Start development server
pnpm run dev

# Check health endpoint
curl http://localhost:3004/api/health

# Test AI services
curl http://localhost:3004/api/health/ai-status
```

---

## 🚨 Troubleshooting

### Issue: "Command not found: node"
**Solution**: Restart terminal or add Node.js to PATH
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="/usr/local/bin:$PATH"
```

### Issue: "Permission denied"
**Solution**: Use sudo or fix permissions
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue: "Module not found" after upgrade
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Prisma errors
**Solution**: Regenerate Prisma client
```bash
pnpm run db:generate
pnpm run db:push
```

### Issue: Build fails
**Solution**: Check TypeScript and dependencies
```bash
pnpm run type-check
pnpm audit
pnpm update
```

---

## 🔄 Version Management

### Using NVM (Recommended)
```bash
# List installed versions
nvm list

# Switch between versions
nvm use 20
nvm use 18

# Set default version
nvm alias default 20

# Install latest LTS
nvm install --lts
```

### Project-Specific Version
```bash
# .nvmrc file in project root
echo "20" > .nvmrc

# Auto-switch when entering directory
nvm use
```

---

## 📊 Benefits of Upgrading

### ✅ Prisma Compatibility
- Full support for Prisma v6.19+
- Latest database features
- Improved performance

### ✅ Performance Improvements
- Faster startup times
- Better memory management
- Improved ES module support

### ✅ Security Updates
- Latest security patches
- Vulnerability fixes
- Updated TLS support

### ✅ New Features
- Enhanced ES2023 support
- Better TypeScript integration
- Improved debugging tools

---

## 🎯 Production Considerations

### CI/CD Pipeline
Update your CI/CD configuration:
```yaml
# GitHub Actions
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'pnpm'
```

### Docker Images
Update Dockerfile:
```dockerfile
FROM node:20-alpine
# or
FROM node:20.19.0-alpine
```

### Deployment Platforms
- **Vercel**: Automatically uses latest Node.js 20
- **Heroku**: Set via `heroku/nodejs` buildpack
- **AWS**: Update ECS/EKS Node.js runtime
- **Docker**: Update base image

---

## 📞 Support

If you encounter issues:
1. Check Node.js documentation: https://nodejs.org/docs/
2. Review Prisma compatibility: https://www.prisma.io/docs/support
3. Check project issues: https://github.com/Nutonspeed/Beauty-with-AI-Precision/issues

---

## ✅ Upgrade Checklist

- [ ] Backup current project
- [ ] Choose upgrade method
- [ ] Upgrade Node.js to v20.19+
- [ ] Restart terminal
- [ ] Run `pnpm install`
- [ ] Update dependencies
- [ ] Test `pnpm run build`
- [ ] Test `pnpm run db:generate`
- [ ] Run all tests
- [ ] Update CI/CD configuration
- [ ] Update Docker images
- [ ] Deploy to staging
- [ ] Verify production

---

**🚀 After upgrade, your project will be fully compatible with latest Prisma features and ready for production deployment!**
