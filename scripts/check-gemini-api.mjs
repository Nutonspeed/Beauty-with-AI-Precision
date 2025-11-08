import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Checking Gemini API Key...\n');

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✅ API Key found in .env.local');
console.log('   Key:', apiKey);
console.log('   Length:', apiKey.length, 'characters');

// Test with REST API directly
console.log('\n🌐 Testing API key with REST API...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

try {
  const response = await fetch(url);
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ API Key is valid!\n');
    console.log('📋 Available models:');
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`   - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('   No models available');
    }
  } else {
    console.error('❌ API Key is invalid or expired');
    console.error('   Status:', response.status);
    console.error('   Error:', data);
  }
} catch (error) {
  console.error('❌ Network error:', error.message);
}
