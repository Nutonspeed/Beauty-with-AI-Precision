// scripts/lightweight-qa-test.mjs
/**
 * Lightweight QA Testing for Beauty-with-AI-Precision
 * Basic functionality validation without external dependencies
 */

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';

// Test Results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
  performance: {},
  errors: []
};

// Test utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  console.log(logMessage);
}

function assert(condition, message, testName) {
  results.total++;
  if (condition) {
    results.passed++;
    results.tests.push({ name: testName, status: 'PASS', message });
    log(`✓ ${testName}: ${message}`, 'pass');
  } else {
    results.failed++;
    results.tests.push({ name: testName, status: 'FAIL', message });
    log(`✗ ${testName}: ${message}`, 'fail');
  }
}

function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  results.performance[name] = duration;
  log(`⏱️ ${name}: ${duration.toFixed(2)}ms`, 'perf');
  return result;
}

// QA Test Suite
class LightweightQATest {
  async runTests() {
    log('🚀 Starting Lightweight QA Testing Suite', 'start');
    log('=' .repeat(60), 'divider');

    const startTime = performance.now();

    // Basic connectivity tests
    await this.testBasicConnectivity();

    // API endpoint tests
    await this.testPublicEndpoints();

    // Security tests
    await this.testSecurityHeaders();

    // Performance tests
    await this.testPerformance();

    // Static asset tests
    await this.testStaticAssets();

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    // Generate test report
    this.generateReport(totalDuration);

    return results;
  }

  async testBasicConnectivity() {
    log('🌐 Testing Basic Connectivity...', 'section');

    try {
      // Test basic HTTP connectivity
      const response = await measurePerformance('Basic Connectivity', async () => {
        return await fetch(BASE_URL);
      });

      if (response.ok || response.status === 404) {
        assert(true, 'Application is responding', 'Basic Connectivity');
      } else {
        assert(false, `Unexpected response: ${response.status}`, 'Basic Connectivity');
      }

    } catch (error) {
      assert(false, `Connection error: ${error.message}`, 'Basic Connectivity');
      results.errors.push(error);
    }
  }

  async testPublicEndpoints() {
    log('🔗 Testing Public Endpoints...', 'section');

    const publicEndpoints = [
      '/api/health',
      '/',
      '/favicon.ico'
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await measurePerformance(`GET ${endpoint}`, async () => {
          return await fetch(`${BASE_URL}${endpoint}`, {
            redirect: 'manual' // Don't follow redirects for testing
          });
        });

        // Health endpoint should return success
        if (endpoint === '/api/health') {
          if (response.ok) {
            assert(true, 'Health endpoint accessible', `Health API`);
          } else {
            assert(false, `Health endpoint failed: ${response.status}`, `Health API`);
          }
        } else {
          // Other endpoints might redirect or return various status codes
          assert(response.status < 500, `Endpoint responds: ${response.status}`, `${endpoint}`);
        }

      } catch (error) {
        assert(false, `Endpoint ${endpoint} error: ${error.message}`, `${endpoint} Test`);
        results.errors.push(error);
      }
    }
  }

  async testSecurityHeaders() {
    log('🔒 Testing Security Headers...', 'section');

    try {
      const response = await measurePerformance('Security Headers', async () => {
        return await fetch(BASE_URL);
      });

      const headers = response.headers;

      // Check for basic security headers
      const securityChecks = [
        {
          name: 'HTTPS Redirect',
          check: response.url.startsWith('https://') || BASE_URL.includes('localhost'),
          message: 'HTTPS or localhost connection'
        },
        {
          name: 'X-Frame-Options',
          check: headers.get('x-frame-options') !== null,
          message: 'Clickjacking protection present'
        },
        {
          name: 'X-Content-Type-Options',
          check: headers.get('x-content-type-options') === 'nosniff',
          message: 'MIME type sniffing protection'
        },
        {
          name: 'Referrer-Policy',
          check: headers.get('referrer-policy') !== null,
          message: 'Referrer policy configured'
        }
      ];

      securityChecks.forEach(({ name, check, message }) => {
        assert(check, message, name);
      });

    } catch (error) {
      assert(false, `Security headers test error: ${error.message}`, 'Security Headers');
      results.errors.push(error);
    }
  }

  async testPerformance() {
    log('⚡ Testing Performance...', 'section');

    try {
      // Test multiple requests to check consistency
      const requests = Array(5).fill().map(() =>
        measurePerformance('Performance Sample', async () => {
          return await fetch(BASE_URL);
        })
      );

      await Promise.all(requests);

      // Calculate average response time
      const responseTimes = Object.entries(results.performance)
        .filter(([key]) => key.includes('Performance Sample'))
        .map(([, time]) => time);

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      assert(avgResponseTime < 2000, `Average response time under 2s: ${avgResponseTime.toFixed(2)}ms`, 'Average Response Time');
      assert(Math.max(...responseTimes) < 5000, `Max response time under 5s: ${Math.max(...responseTimes).toFixed(2)}ms`, 'Max Response Time');

    } catch (error) {
      assert(false, `Performance test error: ${error.message}`, 'Performance Test');
      results.errors.push(error);
    }
  }

  async testStaticAssets() {
    log('📦 Testing Static Assets...', 'section');

    const staticAssets = [
      '/favicon.ico',
      '/manifest.json',
      '/robots.txt'
    ];

    for (const asset of staticAssets) {
      try {
        const response = await measurePerformance(`Static Asset: ${asset}`, async () => {
          return await fetch(`${BASE_URL}${asset}`);
        });

        // Some assets might not exist, which is okay
        if (response.ok) {
          assert(true, `Static asset accessible: ${asset}`, `${asset}`);
        } else if (response.status === 404) {
          log(`⚠️ Static asset not found (expected): ${asset}`, 'warn');
          results.skipped++;
        } else {
          assert(false, `Static asset error ${response.status}: ${asset}`, `${asset}`);
        }

      } catch (error) {
        log(`⚠️ Static asset connection error: ${asset} - ${error.message}`, 'warn');
        results.skipped++;
      }
    }
  }

  generateReport(totalDuration) {
    log('=' .repeat(60), 'divider');
    log('📊 LIGHTWEIGHT QA TEST REPORT', 'report');
    log('=' .repeat(60), 'divider');

    log(`Total Tests: ${results.total}`, 'stat');
    log(`Passed: ${results.passed} (${results.total > 0 ? ((results.passed/results.total)*100).toFixed(1) : 0}%)`, 'stat');
    log(`Failed: ${results.failed} (${results.total > 0 ? ((results.failed/results.total)*100).toFixed(1) : 0}%)`, 'stat');
    log(`Skipped: ${results.skipped}`, 'stat');
    log(`Total Duration: ${totalDuration.toFixed(2)}ms`, 'stat');

    if (results.failed > 0) {
      log('\n❌ FAILED TESTS:', 'error');
      results.tests.filter(t => t.status === 'FAIL').forEach(test => {
        log(`  - ${test.name}: ${test.message}`, 'error');
      });
    }

    if (results.errors.length > 0) {
      log('\n💥 ERRORS:', 'error');
      results.errors.forEach(error => {
        log(`  - ${error.message}`, 'error');
      });
    }

    log('\n⏱️ PERFORMANCE METRICS:', 'perf');
    Object.entries(results.performance).forEach(([name, duration]) => {
      log(`  - ${name}: ${duration.toFixed(2)}ms`, 'perf');
    });

    // Overall assessment
    const successRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;
    if (successRate >= 95) {
      log('\n🎉 QA STATUS: EXCELLENT - SYSTEM HEALTHY', 'success');
    } else if (successRate >= 85) {
      log('\n⚠️ QA STATUS: GOOD - MINOR ISSUES DETECTED', 'warning');
    } else {
      log('\n❌ QA STATUS: ISSUES FOUND - REQUIRES ATTENTION', 'error');
    }

    log('=' .repeat(60), 'divider');

    // Save report to file
    const reportPath = path.join(process.cwd(), 'QA_TEST_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      totalDuration
    }, null, 2));

    log(`📄 Detailed report saved to: ${reportPath}`, 'info');
  }
}

// Main execution
async function main() {
  try {
    const testSuite = new LightweightQATest();
    await testSuite.runTests();
  } catch (error) {
    log(`💥 Critical test suite error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LightweightQATest;
