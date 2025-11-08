/**
 * AI Gateway Test Script
 * Phase 14: Multi-Model Integration Testing
 * 
 * Usage: node --loader ts-node/esm scripts/test-ai-gateway.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { analyzeSkinWithAIGateway } from '../lib/ai/ai-gateway-skin-analyzer';

async function testAIGateway() {
  console.log('🧪 Testing AI Gateway Multi-Model Analysis\n');

  // Check API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  console.log('📋 API Key Status:');
  console.log(`  OpenAI GPT-4o: ${hasOpenAI ? '✅' : '❌ Missing'}`);
  console.log(`  Anthropic Claude 3.5: ${hasClaude ? '✅' : '❌ Missing'}`);
  console.log(`  Google Gemini 2.0: ${hasGemini ? '✅' : '❌ Missing'}`);
  console.log('');

  if (!hasOpenAI || !hasClaude) {
    console.error('❌ Missing required API keys!');
    console.error('📖 Please follow the guide: docs/AI_GATEWAY_SETUP.md');
    process.exit(1);
  }

  try {
    // Load test image
    const testImagePath = join(process.cwd(), 'public', 'test-face.jpg');
    console.log(`📸 Loading test image: ${testImagePath}`);
    const imageBuffer = readFileSync(testImagePath);
    console.log(`✅ Image loaded (${(imageBuffer.length / 1024).toFixed(1)} KB)\n`);

    // Run AI Gateway analysis
    console.log('🚀 Starting Multi-Model Analysis...\n');
    const result = await analyzeSkinWithAIGateway(imageBuffer);

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS RESULTS');
    console.log('='.repeat(60));
    console.log(`\n🎯 Skin Type: ${result.skinType}`);
    console.log(`📝 Concerns: ${result.concerns.join(', ')}`);
    console.log(`\n📈 Severity Scores (1-10):`);
    Object.entries(result.severity).forEach(([concern, score]) => {
      const bar = '█'.repeat(score) + '░'.repeat(10 - score);
      console.log(`  ${concern.padEnd(12)} ${bar} ${score}/10`);
    });

    console.log(`\n🎨 Skin Tone: ${result.skinTone}`);
    console.log(`✨ Texture: ${result.texture}`);
    console.log(`\n🤝 Model Consensus: ${(result.consensusScore * 100).toFixed(1)}%`);
    console.log(`💯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`⏱️  Processing Time: ${(result.processingTime / 1000).toFixed(2)}s`);

    console.log(`\n📝 Detailed Analysis:\n${result.detailedAnalysis}`);

    console.log('\n' + '='.repeat(60));
    console.log('🔍 INDIVIDUAL MODEL RESULTS');
    console.log('='.repeat(60));

    if (result.modelResults.gpt4o) {
      console.log('\n🤖 GPT-4o (45% weight):');
      console.log(`  Skin Type: ${result.modelResults.gpt4o.skinType}`);
      console.log(`  Concerns: ${result.modelResults.gpt4o.concerns.join(', ')}`);
      console.log(`  Confidence: ${(result.modelResults.gpt4o.confidence * 100).toFixed(1)}%`);
    }

    if (result.modelResults.claude) {
      console.log('\n🧠 Claude 3.5 (40% weight):');
      console.log(`  Skin Type: ${result.modelResults.claude.skinType}`);
      console.log(`  Concerns: ${result.modelResults.claude.concerns.join(', ')}`);
      console.log(`  Confidence: ${(result.modelResults.claude.confidence * 100).toFixed(1)}%`);
    }

    if (result.modelResults.gemini) {
      console.log('\n⚡ Gemini 2.0 (15% weight):');
      console.log(`  Skin Type: ${result.modelResults.gemini.skinType}`);
      console.log(`  Concerns: ${result.modelResults.gemini.concerns.join(', ')}`);
      console.log(`  Confidence: ${(result.modelResults.gemini.confidence * 100).toFixed(1)}%`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST PASSED');
    console.log('='.repeat(60));

    // Recommendations
    if (result.consensusScore < 0.6) {
      console.log('\n⚠️  Warning: Low consensus score (<60%)');
      console.log('   Models disagree significantly. Consider:');
      console.log('   - Retaking the photo with better lighting');
      console.log('   - Consulting a dermatologist for validation');
    }

    if (result.confidence < 0.8) {
      console.log('\n⚠️  Warning: Low confidence (<80%)');
      console.log('   Models are uncertain. Possible reasons:');
      console.log('   - Poor image quality');
      console.log('   - Unusual skin condition');
      console.log('   - Lighting issues');
    }

    console.log('\n✨ Multi-Model AI Gateway is working perfectly!\n');
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error(`\nError: ${error instanceof Error ? error.message : error}`);
    
    if (error instanceof Error && error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check API keys in .env.local');
    console.error('  2. Verify you have credits in OpenAI/Anthropic accounts');
    console.error('  3. Check internet connection');
    console.error('  4. See docs/AI_GATEWAY_SETUP.md for help\n');
    
    process.exit(1);
  }
}

// Run test
testAIGateway().catch(console.error);
