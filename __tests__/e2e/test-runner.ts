// @ts-nocheck
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

// Test suites configuration
const testSuites = [
  {
    name: 'Authentication & Authorization',
    file: 'features/auth-authorization.spec.ts',
    tags: ['@auth', '@critical'],
    timeout: 30000
  },
  {
    name: 'Super Admin Dashboard',
    file: 'dashboard/super-admin.spec.ts',
    tags: ['@dashboard', '@admin', '@critical'],
    timeout: 45000
  },
  {
    name: 'Clinic Owner Dashboard',
    file: 'dashboard/clinic-owner.spec.ts',
    tags: ['@dashboard', '@clinic', '@critical'],
    timeout: 45000
  },
  {
    name: 'Sales Dashboard',
    file: 'dashboard/sales-dashboard.spec.ts',
    tags: ['@dashboard', '@sales', '@critical'],
    timeout: 45000
  },
  {
    name: 'Customer Dashboard',
    file: 'dashboard/customer-dashboard.spec.ts',
    tags: ['@dashboard', '@customer', '@critical'],
    timeout: 45000
  },
  {
    name: 'AI Skin Analysis',
    file: 'features/ai-skin-analysis.spec.ts',
    tags: ['@ai', '@analysis', '@critical'],
    timeout: 60000
  },
  {
    name: 'AR Simulator 3D',
    file: 'features/ar-simulator.spec.ts',
    tags: ['@ar', '@3d', '@medium'],
    timeout: 60000
  },
  {
    name: 'Multi-language Support',
    file: 'features/multi-language.spec.ts',
    tags: ['@i18n', '@localization', '@medium'],
    timeout: 45000
  },
  {
    name: 'Real-time Features',
    file: 'features/realtime-features.spec.ts',
    tags: ['@realtime', '@websocket', '@medium'],
    timeout: 45000
  },
  {
    name: 'Mobile Responsiveness',
    file: 'features/mobile-responsiveness.spec.ts',
    tags: ['@mobile', '@responsive', '@critical'],
    timeout: 60000
  }
];

// Create test results directory
const resultsDir = path.join(process.cwd(), 'test-results');
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

// Test runner class
class E2ETestRunner {
  private config: any;
  private results: any[] = [];

  constructor() {
    this.config = {
      timeout: 60000,
      retries: 2,
      workers: process.env.CI ? 1 : 4,
      reporter: [
        ['html', { outputFolder: resultsDir }],
        ['json', { outputFile: path.join(resultsDir, 'test-results.json') }],
        ['junit', { outputFile: path.join(resultsDir, 'junit-results.xml') }],
        ['list']
      ]
    };
  }

  async runAllTests() {
    console.log('🚀 Starting E2E Test Suite for Beauty-with-AI-Precision');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const suite of testSuites) {
      console.log(`\n📋 Running: ${suite.name}`);
      console.log(`   File: ${suite.file}`);
      console.log(`   Tags: ${suite.tags.join(', ')}`);
      
      const result = await this.runTestSuite(suite);
      
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
      
      this.results.push({
        suite: suite.name,
        ...result,
        duration: result.duration
      });
      
      console.log(`   ✅ Passed: ${result.passed}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      console.log(`   ⏭️  Skipped: ${result.skipped}`);
      console.log(`   ⏱️  Duration: ${result.duration}ms`);
    }

    const totalTime = Date.now() - startTime;
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 E2E Test Results Summary');
    console.log('='.repeat(60));
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`⏱️  Total Duration: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);
    
    // Generate detailed report
    await this.generateReport();
    
    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
  }

  async runTestSuite(suite: any) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let passed = 0;
      let failed = 0;
      let skipped = 0;

      const resultsPath = path.join(
        resultsDir,
        `${suite.name.replace(/\s+/g, '-').toLowerCase()}-results.json`
      ).replace(/\\/g, '/');

      const args = [
        'exec',
        'playwright',
        'test',
        `__tests__/e2e/${suite.file}`,
        '--config=playwright.config.ts',
        `--timeout=${suite.timeout}`,
        `--reporter=list,json=${resultsPath}`
      ];

      if (process.env.CI) {
        args.push('--headed=false');
      } else {
        args.push('--headed');
      }

      const child = spawn(pnpmCmd, args, {
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: false
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        // Parse results from JSON file
        try {
          const resultsFile = path.join(resultsDir, `${suite.name.replace(/\s+/g, '-').toLowerCase()}-results.json`);
          if (existsSync(resultsFile)) {
            const results = require(resultsFile);
            passed = results.suites?.[0]?.specs?.reduce((acc: number, spec: any) => 
              acc + spec.tests.filter((t: any) => t.results?.[0]?.status === 'passed').length, 0) || 0;
            failed = results.suites?.[0]?.specs?.reduce((acc: number, spec: any) => 
              acc + spec.tests.filter((t: any) => t.results?.[0]?.status === 'failed').length, 0) || 0;
            skipped = results.suites?.[0]?.specs?.reduce((acc: number, spec: any) => 
              acc + spec.tests.filter((t: any) => t.results?.[0]?.status === 'skipped').length, 0) || 0;
          }
        } catch (error) {
          console.error(`Error parsing results for ${suite.name}:`, error);
        }

        resolve({
          passed,
          failed,
          skipped,
          duration,
          exitCode: code
        });
      });

      child.on('error', (error) => {
        console.error(`Error running ${suite.name}:`, error);
        resolve({
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: Date.now() - startTime,
          exitCode: 1,
          error: error.message
        });
      });
    });
  }

  async generateReport() {
    const reportPath = path.join(resultsDir, 'e2e-test-report.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report - Beauty-with-AI-Precision</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; margin: 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .suite-results { margin-top: 30px; }
        .suite { border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px; font-weight: bold; }
        .suite-details { padding: 15px; }
        .progress-bar { background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 E2E Test Report</h1>
            <p>Beauty-with-AI-Precision - Comprehensive Test Suite</p>
            <p class="timestamp">Generated: ${new Date().toISOString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <h3>Total Tests Run</h3>
                    <p class="value">${this.results.reduce((acc, r) => acc + r.passed + r.failed + r.skipped, 0)}</p>
                </div>
                <div class="metric">
                    <h3>Passed</h3>
                    <p class="value passed">${this.results.reduce((acc, r) => acc + r.passed, 0)}</p>
                </div>
                <div class="metric">
                    <h3>Failed</h3>
                    <p class="value failed">${this.results.reduce((acc, r) => acc + r.failed, 0)}</p>
                </div>
                <div class="metric">
                    <h3>Success Rate</h3>
                    <p class="value passed">${((this.results.reduce((acc, r) => acc + r.passed, 0) / this.results.reduce((acc, r) => acc + r.passed + r.failed, 0)) * 100).toFixed(1)}%</p>
                </div>
            </div>
            
            <div class="suite-results">
                <h2>📋 Test Suite Results</h2>
                ${this.results.map(result => `
                    <div class="suite">
                        <div class="suite-header">
                            ${result.suite}
                            <span style="float: right;">${result.duration}ms</span>
                        </div>
                        <div class="suite-details">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(result.passed / (result.passed + result.failed)) * 100}%"></div>
                            </div>
                            <p>✅ Passed: ${result.passed} | ❌ Failed: ${result.failed} | ⏭️ Skipped: ${result.skipped}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    require('fs').writeFileSync(reportPath, html);
    console.log(`\n📄 Detailed report generated: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 E2E Test Runner for Beauty-with-AI-Precision

Usage:
  node test-runner.ts [options]

Options:
  --help, -h          Show this help message
  --list, -l          List all available test suites
  --suite <name>      Run specific test suite
  --tag <tag>         Run tests with specific tag
  --ci                Run in CI mode (headless)
  --reporter <type>   Specify reporter (html, json, junit)

Available Test Suites:
${testSuites.map(suite => `  - ${suite.name} (${suite.file})`).join('\n')}

Available Tags:
${[...new Set(testSuites.flatMap(s => s.tags))].map(tag => `  - ${tag}`).join('\n')}
    `);
    process.exit(0);
  }

  if (args.includes('--list') || args.includes('-l')) {
    console.log('\n📋 Available Test Suites:');
    testSuites.forEach((suite, index) => {
      console.log(`${index + 1}. ${suite.name}`);
      console.log(`   File: ${suite.file}`);
      console.log(`   Tags: ${suite.tags.join(', ')}`);
      console.log('');
    });
    process.exit(0);
  }

  const runner = new E2ETestRunner();
  await runner.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { E2ETestRunner, testSuites };
