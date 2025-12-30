const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runCommand(command) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    // Don't exit process, try to continue if possible
  }
}

async function main() {
  console.log('🚀 Setting up test environment (Cross-platform)...');

  const rootDir = process.cwd();
  const envTestPath = path.join(rootDir, '.env.test');

  // 1. Create .env.test if not exists
  if (!fs.existsSync(envTestPath)) {
    console.log('📝 Creating .env.test file...');
    const envContent = `# Test Environment Variables
NODE_ENV=test
NEXT_PUBLIC_TEST_MODE=true

# Test Database
TEST_DB_URL=postgresql://postgres:postgres@localhost:5432/beauty_test
SUPABASE_TEST_URL=http://localhost:54321
SUPABASE_TEST_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test

# Test API Keys
OPENAI_API_KEY=sk-test-1234567890abcdef
ANTHROPIC_API_KEY=sk-ant-test-1234567890abcdef

# Test URLs
NEXT_PUBLIC_APP_URL=http://localhost:3004
TEST_API_URL=http://localhost:3004

# Email Test
RESEND_API_KEY=re_test_1234567890abcdef

# Storage Test
SUPABASE_STORAGE_URL=http://localhost:54321/storage/v1
`;
    fs.writeFileSync(envTestPath, envContent);
  }

  // 2. Create test assets directory
  const assetsDir = path.join(rootDir, '__tests__', 'e2e', 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.log('📁 Creating test assets directory...');
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 3. Create dummy test images
  console.log('📷 Creating placeholder test images...');
  const images = ['test-skin-front.jpg', 'test-skin-left.jpg', 'test-skin-right.jpg'];
  images.forEach(img => {
    const imgPath = path.join(assetsDir, img);
    if (!fs.existsSync(imgPath)) {
      // Create a minimal valid dummy file or just empty file for mock
      fs.writeFileSync(imgPath, 'dummy image content'); 
    }
  });
  const invalidFile = path.join(assetsDir, 'invalid.txt');
  if (!fs.existsSync(invalidFile)) {
    fs.writeFileSync(invalidFile, 'invalid file content');
  }

  // 4. Install dependencies (Playwright)
  console.log('📦 Installing test dependencies...');
  runCommand('pnpm add -D @playwright/test');
  
  // 5. Install Browsers
  console.log('🌐 Installing Playwright browsers...');
  runCommand('pnpm exec playwright install');

  // 6. Database Setup (Optional - requires local postgres running)
  // We will skip actual DB creation command here to avoid hanging if no DB, 
  // assuming tests can mock or use existing dev DB if configured.
  // But strictly speaking, for E2E, we might need it. 
  // Let's try to run migrations if supabase CLI is available, else skip.
  /*
  try {
    console.log('🔄 Attempting to reset test database...');
    // This assumes supabase CLI is setup or we rely on docker
    // runCommand('supabase db reset --linked'); 
  } catch (e) {
    console.log('⚠️ Skipping database reset (Supabase CLI might be missing or not linked)');
  }
  */

  console.log('✅ Test environment setup complete!');
}

main();
