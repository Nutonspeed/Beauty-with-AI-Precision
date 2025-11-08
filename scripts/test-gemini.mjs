import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔑 API Key found:', apiKey.substring(0, 20) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('\n📋 Fetching available models...\n');
    
    // Try different model names
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro',
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello" in Thai');
        const response = result.response.text();
        console.log(`✅ ${modelName} works!`);
        console.log(`   Response: ${response}\n`);
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message, '\n');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
