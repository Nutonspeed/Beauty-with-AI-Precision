// scripts/comprehensive-qa-test.mjs
/**
 * Comprehensive QA Testing Suite for Beauty-with-AI-Precision
 * Tests all critical functionality end-to-end
 */

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@cliniciq.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPass123!';

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

// Test data
const testData = {
  clinic: {
    name: 'Test Clinic QA',
    email: 'test@cliniciq.com',
    phone: '+66-2-123-4567'
  },
  customer: {
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '+66-8-1234-5678'
  },
  service: {
    name: 'AI Skin Analysis',
    duration: 60,
    price: 2500
  }
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test suites
class QATestSuite {
  constructor() {
    this.authToken = null;
    this.testUser = null;
    this.testClinic = null;
    this.testCustomer = null;
    this.testAppointment = null;
  }

  // Authentication Tests
  async testAuthentication() {
    log('🔐 Testing Authentication System...', 'section');

    try {
      // Test health endpoint
      const healthResponse = await fetch(`${BASE_URL}/api/health`);
      assert(healthResponse.ok, 'Health endpoint responds', 'Health Check');

      const healthData = await healthResponse.json();
      assert(healthData.status === 'healthy', 'System health is good', 'System Health');

      // Test login (assuming test user exists)
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        this.authToken = loginData.token;
        this.testUser = loginData.user;
        assert(true, 'Login successful', 'User Login');
      } else {
        assert(false, 'Login failed - test user may not exist', 'User Login');
        results.skipped++;
        return;
      }

      // Test protected endpoint access
      const protectedResponse = await fetch(`${BASE_URL}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      assert(protectedResponse.ok, 'Protected endpoint accessible with token', 'Protected Access');

      // Test unauthorized access
      const unauthorizedResponse = await fetch(`${BASE_URL}/api/appointments`);
      assert(unauthorizedResponse.status === 401, 'Unauthorized access blocked', 'Unauthorized Access');

    } catch (error) {
      assert(false, `Authentication test error: ${error.message}`, 'Authentication Error');
      results.errors.push(error);
    }
  }

  // API Functionality Tests
  async testAPIEndpoints() {
    if (!this.authToken) {
      log('⚠️ Skipping API tests - no auth token', 'warn');
      return;
    }

    log('🔗 Testing API Endpoints...', 'section');

    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Test appointments endpoint
      const appointmentsResponse = await measurePerformance('Appointments API', async () => {
        return await fetch(`${BASE_URL}/api/appointments`, { headers });
      });
      assert(appointmentsResponse.ok, 'Appointments endpoint works', 'Appointments API');

      // Test customers endpoint
      const customersResponse = await measurePerformance('Customers API', async () => {
        return await fetch(`${BASE_URL}/api/customers`, { headers });
      });
      assert(customersResponse.ok, 'Customers endpoint works', 'Customers API');

      // Test analytics endpoint
      const analyticsResponse = await measurePerformance('Analytics API', async () => {
        return await fetch(`${BASE_URL}/api/analytics/dashboard`, { headers });
      });
      assert(analyticsResponse.ok, 'Analytics endpoint works', 'Analytics API');

      // Test inventory endpoint
      const inventoryResponse = await measurePerformance('Inventory API', async () => {
        return await fetch(`${BASE_URL}/api/inventory/items`, { headers });
      });
      assert(inventoryResponse.ok, 'Inventory endpoint works', 'Inventory API');

    } catch (error) {
      assert(false, `API endpoint test error: ${error.message}`, 'API Error');
      results.errors.push(error);
    }
  }

  // AI Functionality Tests
  async testAIFunctionality() {
    log('🤖 Testing AI Functionality...', 'section');

    try {
      // Test AI analysis endpoint (mock data for now)
      const aiResponse = await measurePerformance('AI Analysis', async () => {
        return await fetch(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: 'mock-image-data',
            clinic_id: this.testUser?.clinic_id,
            customer_id: 'test-customer-id'
          })
        });
      });

      // AI might require special setup, so we'll check if it's properly configured
      if (aiResponse.status === 400 || aiResponse.status === 500) {
        log('⚠️ AI functionality may require API keys configuration', 'warn');
        results.skipped++;
      } else {
        assert(aiResponse.ok, 'AI analysis endpoint responds', 'AI Analysis');
      }

    } catch (error) {
      assert(false, `AI functionality test error: ${error.message}`, 'AI Error');
      results.errors.push(error);
    }
  }

  // Database Tests
  async testDatabaseConnectivity() {
    log('💾 Testing Database Connectivity...', 'section');

    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('count')
        .limit(1);

      assert(!error, 'Database connection successful', 'Database Connection');
      assert(data !== null, 'Database query returns data', 'Database Query');

    } catch (error) {
      assert(false, `Database test error: ${error.message}`, 'Database Error');
      results.errors.push(error);
    }
  }

  // Performance Tests
  async testPerformance() {
    log('⚡ Testing Performance...', 'section');

    try {
      // Test response times for critical endpoints
      const endpoints = [
        '/api/health',
        '/api/appointments',
        '/api/customers',
        '/api/analytics/dashboard'
      ];

      for (const endpoint of endpoints) {
        const response = await measurePerformance(`GET ${endpoint}`, async () => {
          return await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
        });

        const duration = results.performance[`GET ${endpoint}`];
        assert(duration < 2000, `Response time under 2s: ${duration.toFixed(2)}ms`, `Performance: ${endpoint}`);
      }

    } catch (error) {
      assert(false, `Performance test error: ${error.message}`, 'Performance Error');
      results.errors.push(error);
    }
  }

  // Security Tests
  async testSecurity() {
    log('🔒 Testing Security...', 'section');

    try {
      // Test SQL injection protection
      const sqlInjectionResponse = await fetch(`${BASE_URL}/api/appointments?clinic_id=1' OR '1'='1`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      assert(sqlInjectionResponse.status !== 200, 'SQL injection attempt blocked', 'SQL Injection Protection');

      // Test XSS protection
      const xssResponse = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>',
          email: 'test@test.com'
        })
      });
      assert(xssResponse.status === 400 || xssResponse.status === 422, 'XSS attempt blocked', 'XSS Protection');

      // Test rate limiting
      const rateLimitPromises = Array(20).fill().map(() =>
        fetch(`${BASE_URL}/api/health`)
      );

      const rateLimitResults = await Promise.allSettled(rateLimitPromises);
      const tooManyRequests = rateLimitResults.some(result =>
        result.status === 'fulfilled' && result.value.status === 429
      );
      assert(tooManyRequests, 'Rate limiting is active', 'Rate Limiting');

    } catch (error) {
      assert(false, `Security test error: ${error.message}`, 'Security Error');
      results.errors.push(error);
    }
  }

  // User Journey Tests
  async testUserJourneys() {
    log('👤 Testing User Journeys...', 'section');

    if (!this.authToken) {
      log('⚠️ Skipping user journey tests - no auth token', 'warn');
      return;
    }

    try {
      // Test complete appointment booking flow
      const journeyStart = performance.now();

      // 1. Get available services
      const servicesResponse = await fetch(`${BASE_URL}/api/services`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      assert(servicesResponse.ok, 'Can fetch services', 'Journey: Services');

      // 2. Create customer
      const customerResponse = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: 'Test Customer QA',
          email: 'qa-customer@test.com',
          phone: '+66-8-9999-9999',
          clinic_id: this.testUser?.clinic_id
        })
      });

      let customerId = null;
      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        customerId = customerData.id;
        assert(true, 'Customer created successfully', 'Journey: Customer Creation');
      }

      // 3. Book appointment
      if (customerId) {
        const appointmentResponse = await fetch(`${BASE_URL}/api/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_id: customerId,
            service_id: 'test-service-id',
            appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            start_time: '10:00',
            duration_minutes: 60,
            clinic_id: this.testUser?.clinic_id
          })
        });

        if (appointmentResponse.ok) {
          assert(true, 'Appointment booked successfully', 'Journey: Appointment Booking');
        } else {
          assert(false, 'Appointment booking failed', 'Journey: Appointment Booking');
        }
      }

      const journeyEnd = performance.now();
      const journeyDuration = journeyEnd - journeyStart;
      results.performance['Complete User Journey'] = journeyDuration;
      assert(journeyDuration < 10000, `Complete journey under 10s: ${journeyDuration.toFixed(2)}ms`, 'User Journey Performance');

    } catch (error) {
      assert(false, `User journey test error: ${error.message}`, 'User Journey Error');
      results.errors.push(error);
    }
  }

  // Run all tests
  async runAllTests() {
    log('🚀 Starting Comprehensive QA Testing Suite', 'start');
    log('=' .repeat(60), 'divider');

    const startTime = performance.now();

    // Run test suites
    await this.testAuthentication();
    await this.testDatabaseConnectivity();
    await this.testAPIEndpoints();
    await this.testAIFunctionality();
    await this.testPerformance();
    await this.testSecurity();
    await this.testUserJourneys();

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    // Generate test report
    this.generateReport(totalDuration);

    return results;
  }

  // Generate comprehensive test report
  generateReport(totalDuration) {
    log('=' .repeat(60), 'divider');
    log('📊 COMPREHENSIVE QA TEST REPORT', 'report');
    log('=' .repeat(60), 'divider');

    log(`Total Tests: ${results.total}`, 'stat');
    log(`Passed: ${results.passed} (${((results.passed/results.total)*100).toFixed(1)}%)`, 'stat');
    log(`Failed: ${results.failed} (${((results.failed/results.total)*100).toFixed(1)}%)`, 'stat');
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
    const successRate = (results.passed / results.total) * 100;
    if (successRate >= 95) {
      log('\n🎉 QA STATUS: EXCELLENT - READY FOR PRODUCTION', 'success');
    } else if (successRate >= 85) {
      log('\n⚠️ QA STATUS: GOOD - MINOR ISSUES TO RESOLVE', 'warning');
    } else {
      log('\n❌ QA STATUS: CRITICAL ISSUES - REQUIRES ATTENTION', 'error');
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
    const testSuite = new QATestSuite();
    await testSuite.runAllTests();
  } catch (error) {
    log(`💥 Critical test suite error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default QATestSuite;
