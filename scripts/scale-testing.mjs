// scripts/scale-testing.mjs
/**
 * Scale Testing Suite for Beauty-with-AI-Precision
 * Tests system performance under various load conditions
 */

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3004',
  testScenarios: [
    {
      name: 'Light Load',
      concurrentUsers: 10,
      duration: 60000, // 1 minute
      rampUp: 5000
    },
    {
      name: 'Medium Load',
      concurrentUsers: 50,
      duration: 120000, // 2 minutes
      rampUp: 10000
    },
    {
      name: 'Heavy Load',
      concurrentUsers: 100,
      duration: 180000, // 3 minutes
      rampUp: 15000
    },
    {
      name: 'Spike Load',
      concurrentUsers: 200,
      duration: 30000, // 30 seconds
      rampUp: 2000
    }
  ],
  endpoints: {
    health: { weight: 30, method: 'GET', path: '/api/health' },
    appointments: { weight: 20, method: 'GET', path: '/api/appointments' },
    customers: { weight: 15, method: 'GET', path: '/api/customers' },
    analytics: { weight: 10, method: 'GET', path: '/api/analytics/dashboard' },
    aiAnalysis: { weight: 5, method: 'POST', path: '/api/analyze', payload: { image: 'test' } },
    booking: { weight: 10, method: 'POST', path: '/api/appointments', payload: {
      customer_id: 'test-customer',
      service_id: 'test-service',
      appointment_date: '2024-12-01',
      start_time: '10:00'
    }},
    auth: { weight: 5, method: 'POST', path: '/api/auth/login', payload: {
      email: 'test@example.com',
      password: 'password'
    }},
    search: { weight: 5, method: 'GET', path: '/api/customers?search=test' }
  }
};

class ScaleTester {
  constructor() {
    this.results = {
      scenarios: [],
      summary: {},
      recommendations: []
    };
  }

  async runScaleTests() {
    console.log('🔥 Starting Scale Testing Suite...\n');

    for (const scenario of CONFIG.testScenarios) {
      console.log(`\n📊 Testing Scenario: ${scenario.name}`);
      console.log(`👥 Concurrent Users: ${scenario.concurrentUsers}`);
      console.log(`⏱️ Duration: ${scenario.duration / 1000}s`);
      console.log(`📈 Ramp-up: ${scenario.rampUp / 1000}s`);
      console.log('-'.repeat(50));

      const scenarioResult = await this.runScenario(scenario);
      this.results.scenarios.push(scenarioResult);

      this.displayScenarioResults(scenarioResult);
    }

    this.generateSummaryReport();
    this.saveScaleTestReport();
  }

  async runScenario(scenario) {
    const startTime = Date.now();
    const results = {
      name: scenario.name,
      config: scenario,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: [],
        errors: [],
        throughput: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        endpointBreakdown: {}
      },
      performance: {
        startTime,
        endTime: null,
        duration: scenario.duration
      }
    };

    // Initialize endpoint tracking
    Object.keys(CONFIG.endpoints).forEach(endpoint => {
      results.metrics.endpointBreakdown[endpoint] = {
        requests: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0,
        responseTimes: []
      };
    });

    // Start users gradually (ramp-up)
    const userPromises = [];
    const userStartDelay = scenario.rampUp / scenario.concurrentUsers;

    for (let i = 0; i < scenario.concurrentUsers; i++) {
      const userPromise = new Promise(async (resolve) => {
        // Delay user start for ramp-up effect
        await new Promise(resolve => setTimeout(resolve, i * userStartDelay));

        await this.simulateUser(scenario.duration, results);
        resolve();
      });

      userPromises.push(userPromise);
    }

    await Promise.all(userPromises);

    // Calculate final metrics
    results.performance.endTime = Date.now();
    results.metrics.throughput = results.metrics.totalRequests / (results.performance.duration / 1000);
    results.metrics.avgResponseTime = results.metrics.responseTimes.length > 0
      ? results.metrics.responseTimes.reduce((a, b) => a + b, 0) / results.metrics.responseTimes.length
      : 0;
    results.metrics.p95ResponseTime = this.calculatePercentile(results.metrics.responseTimes, 95);
    results.metrics.p99ResponseTime = this.calculatePercentile(results.metrics.responseTimes, 99);
    results.metrics.errorRate = results.metrics.totalRequests > 0
      ? (results.metrics.failedRequests / results.metrics.totalRequests) * 100
      : 0;

    // Calculate endpoint metrics
    Object.keys(results.metrics.endpointBreakdown).forEach(endpoint => {
      const breakdown = results.metrics.endpointBreakdown[endpoint];
      if (breakdown.requests > 0) {
        breakdown.avgResponseTime = breakdown.responseTimes.reduce((a, b) => a + b, 0) / breakdown.requests;
      }
    });

    return results;
  }

  async simulateUser(duration, results) {
    const sessionStart = Date.now();

    while (Date.now() - sessionStart < duration) {
      const endpoint = this.selectWeightedEndpoint();
      const endpointConfig = CONFIG.endpoints[endpoint];

      const requestStart = performance.now();

      try {
        const url = `${CONFIG.baseUrl}${endpointConfig.path}`;
        const options = {
          method: endpointConfig.method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ScaleTest/1.0'
          }
        };

        if (endpointConfig.payload) {
          options.body = JSON.stringify(endpointConfig.payload);
        }

        const response = await fetch(url, options);
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;

        results.metrics.totalRequests++;
        results.metrics.responseTimes.push(responseTime);

        const breakdown = results.metrics.endpointBreakdown[endpoint];
        breakdown.requests++;
        breakdown.responseTimes.push(responseTime);

        if (response.ok) {
          results.metrics.successfulRequests++;
          breakdown.successes++;
        } else {
          results.metrics.failedRequests++;
          breakdown.failures++;
          results.metrics.errors.push({
            endpoint,
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;

        results.metrics.totalRequests++;
        results.metrics.failedRequests++;
        results.metrics.responseTimes.push(responseTime);
        results.metrics.errors.push({
          endpoint,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        const breakdown = results.metrics.endpointBreakdown[endpoint];
        breakdown.requests++;
        breakdown.failures++;
        breakdown.responseTimes.push(responseTime);
      }

      // Random delay between requests (0.1-1 second)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 900 + 100));
    }
  }

  selectWeightedEndpoint() {
    const totalWeight = Object.values(CONFIG.endpoints).reduce((sum, endpoint) => sum + endpoint.weight, 0);
    let random = Math.random() * totalWeight;

    for (const [endpoint, config] of Object.entries(CONFIG.endpoints)) {
      random -= config.weight;
      if (random <= 0) {
        return endpoint;
      }
    }

    return Object.keys(CONFIG.endpoints)[0]; // Fallback
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;

    values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  displayScenarioResults(scenarioResult) {
    const m = scenarioResult.metrics;

    console.log(`\n📈 Results for ${scenarioResult.name}:`);
    console.log(`  Total Requests: ${m.totalRequests.toLocaleString()}`);
    console.log(`  Successful: ${m.successfulRequests.toLocaleString()} (${((m.successfulRequests/m.totalRequests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${m.failedRequests.toLocaleString()} (${((m.failedRequests/m.totalRequests)*100).toFixed(1)}%)`);
    console.log(`  Throughput: ${m.throughput.toFixed(2)} req/sec`);
    console.log(`  Avg Response Time: ${m.avgResponseTime.toFixed(2)}ms`);
    console.log(`  95th Percentile: ${m.p95ResponseTime.toFixed(2)}ms`);
    console.log(`  99th Percentile: ${m.p99ResponseTime.toFixed(2)}ms`);
    console.log(`  Error Rate: ${m.errorRate.toFixed(2)}%`);

    // Top 5 slowest endpoints
    const endpointTimes = Object.entries(m.endpointBreakdown)
      .map(([endpoint, data]) => ({ endpoint, avgTime: data.avgResponseTime }))
      .filter(item => item.avgTime > 0)
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    if (endpointTimes.length > 0) {
      console.log(`\n🐌 Slowest Endpoints:`);
      endpointTimes.forEach(item => {
        console.log(`  ${item.endpoint}: ${item.avgTime.toFixed(2)}ms`);
      });
    }

    // Performance assessment
    const assessment = this.assessPerformance(scenarioResult);
    console.log(`\n🎯 Performance Assessment: ${assessment.rating}`);
    console.log(`  ${assessment.message}`);
  }

  assessPerformance(scenarioResult) {
    const m = scenarioResult.metrics;
    const config = scenarioResult.config;

    // Performance thresholds based on scenario
    const thresholds = {
      errorRate: config.concurrentUsers > 100 ? 5 : config.concurrentUsers > 50 ? 2 : 1,
      avgResponseTime: config.concurrentUsers > 100 ? 3000 : config.concurrentUsers > 50 ? 2000 : 1500,
      throughput: config.concurrentUsers * 0.8 // At least 80% of theoretical max
    };

    let score = 0;
    const issues = [];

    if (m.errorRate <= thresholds.errorRate) score += 1;
    else issues.push(`High error rate: ${m.errorRate.toFixed(2)}% > ${thresholds.errorRate}%`);

    if (m.avgResponseTime <= thresholds.avgResponseTime) score += 1;
    else issues.push(`Slow responses: ${m.avgResponseTime.toFixed(2)}ms > ${thresholds.avgResponseTime}ms`);

    if (m.throughput >= thresholds.throughput) score += 1;
    else issues.push(`Low throughput: ${m.throughput.toFixed(2)} req/sec < ${thresholds.throughput.toFixed(2)} req/sec`);

    let rating, message;
    if (score === 3) {
      rating = '✅ EXCELLENT';
      message = 'System handled load exceptionally well';
    } else if (score === 2) {
      rating = '⚠️ GOOD';
      message = 'System performed adequately with minor issues';
    } else if (score === 1) {
      rating = '❌ CONCERNING';
      message = 'System showed performance degradation';
    } else {
      rating = '💥 CRITICAL';
      message = 'System failed to handle load: ' + issues.join(', ');
    }

    return { rating, message, score, issues };
  }

  generateSummaryReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCALE TESTING SUMMARY REPORT');
    console.log('='.repeat(60));

    // Overall assessment
    const assessments = this.results.scenarios.map(s => this.assessPerformance(s));
    const averageScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

    console.log(`\n📈 Overall Performance Score: ${averageScore.toFixed(1)}/3`);

    if (averageScore >= 2.5) {
      console.log('🎉 EXCELLENT: System ready for production load');
    } else if (averageScore >= 1.5) {
      console.log('⚠️ ACCEPTABLE: System can handle moderate load with monitoring');
    } else {
      console.log('❌ CONCERNING: Performance optimization required before production');
    }

    // Scenario breakdown
    console.log('\n📋 Scenario Results:');
    this.results.scenarios.forEach((scenario, index) => {
      const assessment = assessments[index];
      const m = scenario.metrics;
      console.log(`  ${scenario.name}:`);
      console.log(`    Throughput: ${m.throughput.toFixed(2)} req/sec`);
      console.log(`    Avg Response: ${m.avgResponseTime.toFixed(2)}ms`);
      console.log(`    Error Rate: ${m.errorRate.toFixed(2)}%`);
      console.log(`    Assessment: ${assessment.rating}`);
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    this.generateRecommendations().forEach(rec => {
      console.log(`  • ${rec}`);
    });

    // Scalability assessment
    console.log('\n📊 Scalability Assessment:');
    const maxThroughput = Math.max(...this.results.scenarios.map(s => s.metrics.throughput));
    const maxUsers = Math.max(...this.results.scenarios.map(s => s.config.concurrentUsers));

    console.log(`  Peak Throughput: ${maxThroughput.toFixed(2)} req/sec`);
    console.log(`  Max Tested Users: ${maxUsers}`);
    console.log(`  Estimated Capacity: ${Math.floor(maxThroughput * 1.5)} req/sec (${Math.floor(maxUsers * 2)} users)`);

    console.log('\n' + '='.repeat(60));
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze results for patterns
    const scenarios = this.results.scenarios;

    // Check for degrading performance under load
    const heavyLoad = scenarios.find(s => s.name === 'Heavy Load');
    if (heavyLoad) {
      const avgResponse = heavyLoad.metrics.avgResponseTime;
      const errorRate = heavyLoad.metrics.errorRate;

      if (avgResponse > 3000) {
        recommendations.push('Implement horizontal scaling for API servers');
      }

      if (errorRate > 5) {
        recommendations.push('Add circuit breakers and retry logic');
      }
    }

    // Check for memory issues (simulated)
    recommendations.push('Monitor server memory usage under sustained load');
    recommendations.push('Implement database connection pooling optimization');
    recommendations.push('Consider CDN for static asset delivery');
    recommendations.push('Implement API rate limiting per user');

    // Check endpoint performance
    const slowEndpoints = [];
    scenarios.forEach(scenario => {
      Object.entries(scenario.metrics.endpointBreakdown).forEach(([endpoint, data]) => {
        if (data.avgResponseTime > 2000) {
          slowEndpoints.push(endpoint);
        }
      });
    });

    if (slowEndpoints.length > 0) {
      const uniqueEndpoints = [...new Set(slowEndpoints)];
      recommendations.push(`Optimize slow endpoints: ${uniqueEndpoints.join(', ')}`);
    }

    return recommendations;
  }

  saveScaleTestReport() {
    const reportPath = path.join(process.cwd(), 'scale-testing-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      configuration: CONFIG,
      results: this.results,
      summary: {
        scenarios: this.results.scenarios.length,
        totalRequests: this.results.scenarios.reduce((sum, s) => sum + s.metrics.totalRequests, 0),
        averageThroughput: this.results.scenarios.reduce((sum, s) => sum + s.metrics.throughput, 0) / this.results.scenarios.length,
        recommendations: this.generateRecommendations()
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// CLI execution
if (import.meta.url === 'file://' + process.argv[1]) {
  const tester = new ScaleTester();
  tester.runScaleTests().catch(error => {
    console.error('Scale testing failed:', error.message);
    process.exit(1);
  });
}

export default ScaleTester;
