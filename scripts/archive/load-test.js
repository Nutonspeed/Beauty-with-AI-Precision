#!/usr/bin/env node

/**
 * Load Testing Script for ClinicIQ
 * 
 * Tests system performance under load for Pilot launch
 * Target: 50-100 concurrent users, 800 total users
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3004',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 50,
  totalRequests: parseInt(process.env.TOTAL_REQUESTS) || 500,
  testDuration: parseInt(process.env.TEST_DURATION) || 60, // seconds
};

// Test scenarios
const SCENARIOS = {
  healthCheck: {
    name: 'Database Health Check',
    path: '/api/health/database',
    method: 'GET',
    weight: 10, // 10% of requests
  },
  clinicsList: {
    name: 'List Clinics (Admin)',
    path: '/api/admin/clinics',
    method: 'GET',
    weight: 5,
  },
  bulkInvitePreview: {
    name: 'Bulk Invite Validation',
    path: '/api/clinic/team/bulk-invite',
    method: 'POST',
    body: {
      invitations: Array.from({ length: 10 }, (_, i) => ({
        email: `test${i}@example.com`,
        name: `Test User ${i}`,
        role: 'sales_staff',
      })),
    },
    weight: 20,
  },
  dashboardLoad: {
    name: 'Sales Dashboard Load',
    path: '/th/sales/dashboard',
    method: 'GET',
    weight: 30,
  },
  apiMetrics: {
    name: 'Sales Metrics API',
    path: '/api/sales/metrics',
    method: 'GET',
    weight: 25,
  },
  skinAnalysisList: {
    name: 'Skin Analysis List',
    path: '/api/analysis/list',
    method: 'GET',
    weight: 10,
  },
};

// Stats tracking
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  byScenario: {},
  errors: [],
};

// Initialize scenario stats
Object.keys(SCENARIOS).forEach(key => {
  stats.byScenario[key] = {
    total: 0,
    success: 0,
    failed: 0,
    totalTime: 0,
  };
});

/**
 * Make HTTP request
 */
function makeRequest(scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(scenario.path, CONFIG.baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: scenario.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClinicIQ-LoadTest/1.0',
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        resolve({
          success,
          statusCode: res.statusCode,
          duration,
          error: success ? null : `HTTP ${res.statusCode}`,
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        statusCode: 0,
        duration,
        error: error.message,
      });
    });

    // Send body if POST
    if (scenario.body) {
      req.write(JSON.stringify(scenario.body));
    }

    req.end();
  });
}

/**
 * Run single test
 */
async function runTest(scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  const result = await makeRequest(scenario);

  // Update stats
  stats.total++;
  stats.totalTime += result.duration;
  stats.minTime = Math.min(stats.minTime, result.duration);
  stats.maxTime = Math.max(stats.maxTime, result.duration);

  const scenarioStats = stats.byScenario[scenarioKey];
  scenarioStats.total++;
  scenarioStats.totalTime += result.duration;

  if (result.success) {
    stats.success++;
    scenarioStats.success++;
  } else {
    stats.failed++;
    scenarioStats.failed++;
    if (stats.errors.length < 10) {
      stats.errors.push({
        scenario: scenario.name,
        error: result.error,
        statusCode: result.statusCode,
      });
    }
  }

  return result;
}

/**
 * Select random scenario based on weight
 */
function selectScenario() {
  const scenarios = Object.keys(SCENARIOS);
  const totalWeight = scenarios.reduce((sum, key) => sum + SCENARIOS[key].weight, 0);
  let random = Math.random() * totalWeight;

  for (const key of scenarios) {
    random -= SCENARIOS[key].weight;
    if (random <= 0) return key;
  }

  return scenarios[0];
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('\n🚀 ClinicIQ Load Testing\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`Total Requests: ${CONFIG.totalRequests}`);
  console.log(`Duration: ${CONFIG.testDuration}s\n`);
  console.log('Starting test...\n');

  const startTime = Date.now();
  const promises = [];

  // Launch concurrent requests
  for (let i = 0; i < CONFIG.totalRequests; i++) {
    const scenarioKey = selectScenario();
    
    // Control concurrency
    if (promises.length >= CONFIG.concurrentUsers) {
      await Promise.race(promises);
      promises.splice(0, 1);
    }

    const promise = runTest(scenarioKey).then(() => {
      // Progress indicator
      if (stats.total % 50 === 0) {
        process.stdout.write('.');
      }
    });

    promises.push(promise);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Wait for all to complete
  await Promise.all(promises);

  const totalDuration = (Date.now() - startTime) / 1000;

  // Print results
  console.log('\n\n📊 Test Results\n');
  console.log('═'.repeat(60));
  console.log(`Total Requests:     ${stats.total}`);
  console.log(`Successful:         ${stats.success} (${(stats.success/stats.total*100).toFixed(1)}%)`);
  console.log(`Failed:             ${stats.failed} (${(stats.failed/stats.total*100).toFixed(1)}%)`);
  console.log(`Duration:           ${totalDuration.toFixed(2)}s`);
  console.log(`Requests/sec:       ${(stats.total/totalDuration).toFixed(2)}`);
  console.log('═'.repeat(60));

  console.log('\n⏱️  Response Times\n');
  console.log(`Average:            ${(stats.totalTime/stats.total).toFixed(0)}ms`);
  console.log(`Min:                ${stats.minTime}ms`);
  console.log(`Max:                ${stats.maxTime}ms`);

  console.log('\n📈 By Scenario\n');
  Object.keys(SCENARIOS).forEach(key => {
    const scenario = SCENARIOS[key];
    const scenarioStats = stats.byScenario[key];
    if (scenarioStats.total > 0) {
      const avg = (scenarioStats.totalTime / scenarioStats.total).toFixed(0);
      const successRate = ((scenarioStats.success / scenarioStats.total) * 100).toFixed(1);
      console.log(`${scenario.name.padEnd(30)} ${scenarioStats.total.toString().padStart(4)} req  ${avg.padStart(5)}ms avg  ${successRate}% success`);
    }
  });

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors (first 10)\n');
    stats.errors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.statusCode}] ${err.scenario}: ${err.error}`);
    });
  }

  console.log('\n✅ Performance Assessment\n');
  const avgTime = stats.totalTime / stats.total;
  const successRate = (stats.success / stats.total) * 100;

  if (avgTime < 500 && successRate > 95) {
    console.log('🟢 EXCELLENT - System performing well under load');
  } else if (avgTime < 1000 && successRate > 90) {
    console.log('🟡 GOOD - System stable, minor optimization recommended');
  } else if (avgTime < 2000 && successRate > 80) {
    console.log('🟠 FAIR - Performance issues detected, optimization needed');
  } else {
    console.log('🔴 POOR - Critical performance issues, immediate action required');
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  // Exit code based on success rate
  process.exit(successRate < 90 ? 1 : 0);
}

// Run test
if (require.main === module) {
  runLoadTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { runLoadTest };
