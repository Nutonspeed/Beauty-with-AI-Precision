import { config } from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// Test Gemini API directly
async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API directly...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Analyze this skin description in one sentence: 'Oily T-zone with occasional breakouts and dry cheeks'"
          }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Gemini API Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Gemini API Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    return true;
  } catch (error) {
    console.error('❌ Gemini API Failed:', error);
    return false;
  }
}

// Test Hugging Face API directly
async function testHuggingFaceAPI() {
  console.log('🔍 Testing Hugging Face API directly...');
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: "Analyze this skin condition: oily T-zone with occasional breakouts"
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Hugging Face API Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Hugging Face API Response:', data);
    return true;
  } catch (error) {
    console.error('❌ Hugging Face API Failed:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Direct AI APIs');
  console.log('=====================================');
  
  const geminiWorking = await testGeminiAPI();
  const huggingFaceWorking = await testHuggingFaceAPI();
  
  console.log('\n📊 Test Results:');
  console.log('=====================================');
  console.log(`Gemini API: ${geminiWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`Hugging Face API: ${huggingFaceWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (geminiWorking || huggingFaceWorking) {
    console.log('\n✅ At least one AI service is working!');
    console.log('💡 The system can operate in hybrid mode with available services.');
  } else {
    console.log('\n❌ No AI services are working');
    console.log('🔧 Please check your API keys and internet connection');
  }
}

// Run the tests
runTests().catch(console.error);
