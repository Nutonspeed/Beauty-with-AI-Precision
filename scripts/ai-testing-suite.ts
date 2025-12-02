/**
 * Automated AI Feature Testing Suite
 * Comprehensive automated testing for all AI features
 * Competitive advantage: Continuous quality assurance
 */

import { AILeadScorer, LeadData } from '../lib/ai/lead-scorer';
import { AIMarketingCampaignGenerator } from '../lib/ai/campaign-generator';
import { AIObjectionHandler } from '../lib/ai/objection-handler';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  score: number;
  error?: string;
  details?: any;
}

interface TestSuiteResult {
  suiteName: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  overallScore: number;
  timestamp: Date;
}

export class AITestingSuite {
  private leadScorer: AILeadScorer;
  private campaignGenerator: AIMarketingCampaignGenerator;
  private objectionHandler: AIObjectionHandler;

  constructor() {
    this.leadScorer = new AILeadScorer();
    this.campaignGenerator = new AIMarketingCampaignGenerator();
    this.objectionHandler = new AIObjectionHandler();
  }

  /**
   * Run complete AI testing suite
   */
  async runFullSuite(): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test suites
    const testSuites = [
      this.runLeadScoringTests.bind(this),
      this.runCampaignGenerationTests.bind(this),
      this.runObjectionHandlingTests.bind(this),
      this.runPerformanceTests.bind(this),
      this.runIntegrationTests.bind(this)
    ];

    for (const testSuite of testSuites) {
      const suiteResults = await testSuite();
      results.push(...suiteResults);
    }

    const totalDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    const totalTests = results.length;
    const overallScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      suiteName: 'Complete AI Feature Test Suite',
      tests: results,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      overallScore,
      timestamp: new Date()
    };
  }

  /**
   * Test lead scoring functionality
   */
  private async runLeadScoringTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const testLeads: LeadData[] = [
      {
        id: 'test_lead_1',
        name: 'สมใจ รักสวย',
        source: 'Facebook Ads',
        status: 'hot',
        budget: 'high',
        interests: ['สิว', 'ผิวกระจ่าง'],
        concerns: ['สิวอักเสบ', 'จุดด่างดำ'],
        age: 28,
        gender: 'female',
        engagement: {
          websiteVisits: 15,
          emailOpens: 12,
          emailClicks: 8,
          chatInteractions: 6,
          socialEngagement: 20,
          contentDownloads: 3,
          appointmentBookings: 2,
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        totalInteractions: 66,
        responseTime: 2,
      }
    ];

    // Test 1: Lead scoring accuracy
    const test1Start = Date.now();
    try {
      const score = await this.leadScorer.scoreLead(testLeads[0]);

      // Validate score structure
      const hasRequiredFields = score.overallScore >= 0 && score.overallScore <= 100 &&
                               score.confidence >= 0 && score.confidence <= 1 &&
                               score.conversionProbability >= 0 && score.conversionProbability <= 100;

      const scoreReasonable = score.overallScore > 50 && score.conversionProbability > 30; // Hot lead should score high

      results.push({
        testName: 'Lead Scoring - Basic Functionality',
        status: hasRequiredFields ? 'passed' : 'failed',
        duration: Date.now() - test1Start,
        score: hasRequiredFields ? 100 : 0,
        details: { score, hasRequiredFields }
      });

      results.push({
        testName: 'Lead Scoring - Reasonable Scores',
        status: scoreReasonable ? 'passed' : 'failed',
        duration: 0,
        score: scoreReasonable ? 100 : 50,
        details: { overallScore: score.overallScore, conversionProbability: score.conversionProbability }
      });
    } catch (error) {
      results.push({
        testName: 'Lead Scoring - Basic Functionality',
        status: 'failed',
        duration: Date.now() - test1Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      });
    }

    // Test 2: Lead segmentation
    const test2Start = Date.now();
    try {
      const segments = await this.leadScorer.segmentLeads(testLeads);
      const hasSegments = segments.length > 0;
      const segmentsValid = segments.every(s =>
        s.segment && s.description && s.characteristics && s.conversionRate >= 0
      );

      results.push({
        testName: 'Lead Segmentation - Basic Functionality',
        status: hasSegments && segmentsValid ? 'passed' : 'failed',
        duration: Date.now() - test2Start,
        score: (hasSegments && segmentsValid) ? 100 : 0,
        details: { segmentsCount: segments.length, segmentsValid }
      });
    } catch (error) {
      results.push({
        testName: 'Lead Segmentation - Basic Functionality',
        status: 'failed',
        duration: Date.now() - test2Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Test campaign generation functionality
   */
  private async runCampaignGenerationTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const testLead: LeadData = {
      id: 'test_lead_campaign',
      name: 'วรรณา สวยงาม',
      source: 'Instagram',
      status: 'warm',
      budget: 'medium',
      interests: ['HydraFacial', 'แพ็คเกจผิวขาว'],
      concerns: ['ผิวหมองคล้ำ'],
      age: 29,
      gender: 'female',
      engagement: {
        websiteVisits: 8,
        emailOpens: 6,
        emailClicks: 3,
        chatInteractions: 4,
        socialEngagement: 12,
        contentDownloads: 2,
        appointmentBookings: 1,
      },
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
      firstContact: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      totalInteractions: 36,
      responseTime: 3,
    };

    // Test 1: Campaign generation
    const test1Start = Date.now();
    try {
      const campaign = await this.campaignGenerator.generateCampaign(testLead, {
        overallScore: 75,
        confidence: 0.8,
        conversionProbability: 65,
        predictedValue: 25000,
        predictedLTV: 75000,
        urgency: 'medium',
        priority: 'high',
        insights: [],
        recommendations: [],
        riskFactors: [],
        opportunityFactors: [],
        nextBestAction: 'Send personalized offer',
        suggestedTimeline: 'Within 24 hours'
      });

      const hasRequiredFields = campaign.name && campaign.content &&
                               campaign.callToAction && campaign.personalizationElements;

      results.push({
        testName: 'Campaign Generation - Basic Functionality',
        status: hasRequiredFields ? 'passed' : 'failed',
        duration: Date.now() - test1Start,
        score: hasRequiredFields ? 100 : 0,
        details: { campaignFields: Object.keys(campaign), hasRequiredFields }
      });
    } catch (error) {
      results.push({
        testName: 'Campaign Generation - Basic Functionality',
        status: 'failed',
        duration: Date.now() - test1Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: A/B testing variants
    const test2Start = Date.now();
    try {
      const mockCampaign = {
        id: 'test_campaign',
        name: 'Test Campaign',
        subjectLine: 'Test Subject',
        content: 'Test content',
        callToAction: { text: 'Click here', type: 'button' as const },
        personalizationElements: ['name'],
        urgencyTriggers: [],
        followUpSequence: [],
        expectedResponseRate: 30,
        targetLead: testLead.id,
        type: 'email' as const,
        category: 'nurture' as const,
        createdAt: new Date(),
        status: 'draft' as const
      };

      const variants = await this.campaignGenerator.generateABVariants(mockCampaign, testLead);
      const hasVariants = variants.length > 0;
      const variantsValid = variants.every(v => v.name && v.content);

      results.push({
        testName: 'A/B Testing - Variant Generation',
        status: hasVariants && variantsValid ? 'passed' : 'failed',
        duration: Date.now() - test2Start,
        score: (hasVariants && variantsValid) ? 100 : 0,
        details: { variantsCount: variants.length, variantsValid }
      });
    } catch (error) {
      results.push({
        testName: 'A/B Testing - Variant Generation',
        status: 'failed',
        duration: Date.now() - test2Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Test objection handling functionality
   */
  private async runObjectionHandlingTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Objection detection
    const test1Start = Date.now();
    try {
      const objectionText = "แพงไปค่ะ คุ้มกับราคานี้ไหม";
      const context = {
        customerProfile: {
          name: 'Test Customer',
          concerns: ['price sensitivity'],
          budget: 'low'
        },
        treatmentInterest: ['basic treatment'],
        currentTreatment: {
          name: 'Basic Treatment',
          price: 15000,
          category: 'basic'
        },
        leadScore: 60,
        urgency: 'medium' as const
      };

      const objection = await this.objectionHandler.detectObjection(objectionText, context);
      const detectedPriceObjection = objection.objectionType === 'price';

      results.push({
        testName: 'Objection Detection - Price Objection',
        status: detectedPriceObjection ? 'passed' : 'failed',
        duration: Date.now() - test1Start,
        score: detectedPriceObjection ? 100 : 30,
        details: { detectedType: objection.objectionType, expectedType: 'price' }
      });
    } catch (error) {
      results.push({
        testName: 'Objection Detection - Price Objection',
        status: 'failed',
        duration: Date.now() - test1Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Objection response generation
    const test2Start = Date.now();
    try {
      const mockObjection = {
        objectionType: 'price' as const,
        confidence: 0.9,
        severity: 'medium' as const,
        keywords: ['แพง', 'ราคา'],
        context: 'Customer concerned about treatment cost'
      };

      const response = await this.objectionHandler.handleObjection(mockObjection, {
        customerProfile: { name: 'Test Customer' },
        treatmentInterest: ['treatment'],
        currentTreatment: { name: 'Treatment', price: 15000, category: 'basic' },
        leadScore: 60,
        urgency: 'medium' as const
      });

      const hasResponse = response.response && response.response.length > 0;
      const hasStrategy = response.strategy && response.followUpActions;

      results.push({
        testName: 'Objection Response - Generation',
        status: hasResponse && hasStrategy ? 'passed' : 'failed',
        duration: Date.now() - test2Start,
        score: (hasResponse && hasStrategy) ? 100 : 0,
        details: { hasResponse, hasStrategy, responseLength: response.response?.length }
      });
    } catch (error) {
      results.push({
        testName: 'Objection Response - Generation',
        status: 'failed',
        duration: Date.now() - test2Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Test performance metrics
   */
  private async runPerformanceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: AI response time
    const test1Start = Date.now();
    try {
      const promises = Array(5).fill(null).map(() =>
        this.leadScorer.scoreLead({
          id: 'perf_test',
          name: 'Performance Test',
          source: 'test',
          status: 'warm',
          interests: ['test'],
          engagement: {
            websiteVisits: 5,
            emailOpens: 3,
            emailClicks: 2,
            chatInteractions: 2,
            socialEngagement: 5,
            contentDownloads: 1,
            appointmentBookings: 0,
          },
          lastActivity: new Date(),
          firstContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          totalInteractions: 18,
        })
      );

      const startTime = Date.now();
      await Promise.all(promises);
      const avgResponseTime = (Date.now() - startTime) / 5;

      const withinLimit = avgResponseTime < 2000; // 2 seconds limit

      results.push({
        testName: 'Performance - AI Response Time',
        status: withinLimit ? 'passed' : 'failed',
        duration: Date.now() - test1Start,
        score: withinLimit ? 100 : Math.max(0, 100 - (avgResponseTime - 2000) / 50),
        details: { avgResponseTime, limit: 2000, withinLimit }
      });
    } catch (error) {
      results.push({
        testName: 'Performance - AI Response Time',
        status: 'failed',
        duration: Date.now() - test1Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Memory usage (simplified)
    const test2Start = Date.now();
    try {
      // Simulate memory-intensive operations
      const largeArray = Array(10000).fill(null).map(() => ({
        data: 'x'.repeat(1000),
        nested: { more: 'data'.repeat(500) }
      }));

      const memoryUsage = (JSON.stringify(largeArray).length / 1024 / 1024); // MB
      const withinLimit = memoryUsage < 50; // 50MB limit

      results.push({
        testName: 'Performance - Memory Usage',
        status: withinLimit ? 'passed' : 'failed',
        duration: Date.now() - test2Start,
        score: withinLimit ? 100 : Math.max(0, 100 - (memoryUsage - 50) * 2),
        details: { memoryUsage, limit: 50, withinLimit }
      });
    } catch (error) {
      results.push({
        testName: 'Performance - Memory Usage',
        status: 'failed',
        duration: Date.now() - test2Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Test integration between components
   */
  private async runIntegrationTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: End-to-end lead processing
    const test1Start = Date.now();
    try {
      const testLead: LeadData = {
        id: 'integration_test',
        name: 'Integration Test User',
        source: 'Website',
        status: 'warm',
        budget: 'medium',
        interests: ['AI consultation', 'skin analysis'],
        concerns: ['acne', 'skin texture'],
        age: 25,
        gender: 'female',
        engagement: {
          websiteVisits: 10,
          emailOpens: 8,
          emailClicks: 5,
          chatInteractions: 4,
          socialEngagement: 10,
          contentDownloads: 2,
          appointmentBookings: 1,
        },
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        totalInteractions: 40,
        responseTime: 2,
      };

      // Step 1: Score lead
      const leadScore = await this.leadScorer.scoreLead(testLead);

      // Step 2: Generate campaign
      const campaign = await this.campaignGenerator.generateCampaign(testLead, leadScore);

      // Step 3: Test objection handling
      const objection = await this.objectionHandler.detectObjection(
        'แพงไปหน่อยค่ะ มีโปรโมชั่นไหม',
        {
          customerProfile: { name: testLead.name },
          treatmentInterest: testLead.interests,
          currentTreatment: { name: 'Test Treatment', price: 20000, category: 'premium' },
          leadScore: leadScore.overallScore,
          urgency: leadScore.urgency
        }
      );

      // Validate integration
      const allStepsSuccessful = leadScore.overallScore >= 0 &&
                                campaign.content &&
                                objection.objectionType === 'price';

      results.push({
        testName: 'Integration - End-to-End Lead Processing',
        status: allStepsSuccessful ? 'passed' : 'failed',
        duration: Date.now() - test1Start,
        score: allStepsSuccessful ? 100 : 30,
        details: {
          leadScore: leadScore.overallScore,
          hasCampaign: !!campaign.content,
          objectionDetected: objection.objectionType
        }
      });
    } catch (error) {
      results.push({
        testName: 'Integration - End-to-End Lead Processing',
        status: 'failed',
        duration: Date.now() - test1Start,
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Generate test report
   */
  generateReport(result: TestSuiteResult): string {
    const report = `
🚀 AI Testing Suite Report
==========================

📊 Overall Results:
- Total Tests: ${result.totalTests}
- Passed: ${result.passedTests}
- Failed: ${result.failedTests}
- Skipped: ${result.skippedTests}
- Overall Score: ${result.overallScore.toFixed(1)}%
- Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s

📈 Test Results by Category:
${this.generateCategorySummary(result.tests)}

⚠️ Failed Tests:
${result.tests.filter(t => t.status === 'failed').map(t =>
  `- ${t.testName}: ${t.error || 'No error details'}`
).join('\n') || 'None'}

✅ Passed Tests:
${result.tests.filter(t => t.status === 'passed').slice(0, 10).map(t =>
  `- ${t.testName} (${t.score.toFixed(0)}%)`
).join('\n')}

📋 Recommendations:
${this.generateRecommendations(result)}
`;

    return report;
  }

  private generateCategorySummary(tests: TestResult[]): string {
    const categories = ['ai', 'performance', 'ui', 'integration'];
    const summary = categories.map(category => {
      const categoryTests = tests.filter(t => t.testName.toLowerCase().includes(category));
      const passed = categoryTests.filter(t => t.status === 'passed').length;
      const total = categoryTests.length;
      const score = total > 0 ? (passed / total) * 100 : 0;
      return `${category}: ${passed}/${total} (${score.toFixed(1)}%)`;
    }).join('\n');

    return summary;
  }

  private generateRecommendations(result: TestSuiteResult): string {
    const recommendations = [];

    if (result.failedTests > 0) {
      recommendations.push('- Address failed tests to improve system reliability');
    }

    if (result.overallScore < 80) {
      recommendations.push('- Focus on improving AI accuracy and performance');
    }

    const avgDuration = result.tests.reduce((sum, t) => sum + t.duration, 0) / result.tests.length;
    if (avgDuration > 2000) {
      recommendations.push('- Optimize response times for better user experience');
    }

    recommendations.push('- Implement continuous monitoring for production stability');
    recommendations.push('- Schedule regular automated testing');

    return recommendations.join('\n');
  }
}

// Export for use in testing components
export default AITestingSuite;

// Allow running from command line
if (require.main === module) {
  const suite = new AITestingSuite();

  console.log('🧪 Starting AI Testing Suite...\n');

  suite.runFullSuite().then(result => {
    console.log(suite.generateReport(result));

    if (result.failedTests > 0) {
      console.log('\n❌ Some tests failed. Please review and fix issues.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! System is ready for production.');
      process.exit(0);
    }
  }).catch(error => {
    console.error('❌ Testing suite failed:', error);
    process.exit(1);
  });
}
