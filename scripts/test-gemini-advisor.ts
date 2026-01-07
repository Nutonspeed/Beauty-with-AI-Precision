import { analyzeSkinWithGemini, getChatAdvice } from '../lib/ai/gemini-advisor';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGemini() {
  console.log('🧪 Testing Gemini AI Advisor...');

  // Test Case 1: Skin Analysis (Mocked Image + VISIA Metrics)
  console.log('\n--- Test 1: Skin Analysis with Metrics ---');
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  try {
    const analysis = await analyzeSkinWithGemini(dummyBase64, { 
      name: 'Test User', 
      age: 30,
      existingAnalysis: {
        spots_score: 85,
        wrinkles_score: 40, // Low score = High concern
        texture_score: 70,
        pores_score: 55,
        uv_spots_score: 90,
        brown_spots_score: 88,
        red_areas_score: 30, // Low score = High concern
        porphyrins_score: 95,
        overall_score: 65,
        skin_health_grade: 'B-'
      }
    });
    console.log('✅ Analysis Result:', JSON.stringify(analysis, null, 2));
    if (analysis.medicalInsight) {
      console.log('💡 AI Medical Insight:', analysis.medicalInsight);
    }
  } catch (error) {
    console.error('❌ Analysis Failed:', error);
  }

  // Test Case 2: Chat Advice (Thai)
  console.log('\n--- Test 2: Chat Advice (Thai) ---');
  try {
    const advice = await getChatAdvice('ขอคำแนะนำการดูแลผิวหน้าที่มีริ้วรอยหน่อยครับ', {
      locale: 'th',
      userName: 'Test User',
      skinAnalysis: {
        skin_age: 35,
        concerns: ['Wrinkles', 'Dry Skin']
      }
    });
    console.log('✅ Thai Advice:', advice);
  } catch (error) {
    console.error('❌ Thai Advice Failed:', error);
  }

  // Test Case 3: Chat Advice (English)
  console.log('\n--- Test 3: Chat Advice (English) ---');
  try {
    const advice = await getChatAdvice('What skincare routine do you recommend for oily skin?', {
      locale: 'en',
      userName: 'Test User'
    });
    console.log('✅ English Advice:', advice);
  } catch (error) {
    console.error('❌ English Advice Failed:', error);
  }
}

testGemini().catch(console.error);
