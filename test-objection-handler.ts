/**
 * Test script for AI Objection Handler
 * Quick test to validate the objection detection and handling functionality
 */

import { AIObjectionHandler } from './lib/ai/objection-handler';

async function testObjectionHandler() {
  console.log('🧪 Testing AI Objection Handler...');

  const handler = new AIObjectionHandler();

  // Test objection detection
  const testMessage = "แพงไปค่ะ คุ้มไหมกับราคานี้";
  const context = {
    customerProfile: {
      name: "สมหญิง",
      concerns: ["ฝ้า", "จุดด่างดำ"],
      budget: "medium"
    },
    treatmentInterest: ["Laser Treatment"],
    currentTreatment: {
      name: "Q-Switch Laser",
      price: 15000,
      category: "laser"
    },
    leadScore: 65,
    urgency: "medium" as const
  };

  console.log('📝 Test Message:', testMessage);

  try {
    // Test objection detection
    console.log('🔍 Detecting objections...');
    const objection = await handler.detectObjection(testMessage, context);
    console.log('📊 Objection Analysis:', objection);

    // Test objection handling
    if (objection.objectionType !== 'none') {
      console.log('💬 Generating response...');
      const response = await handler.handleObjection(objection, context);
      console.log('🤖 AI Response:', response);
    }

    // Test conversion strategies
    console.log('📈 Getting conversion strategies...');
    const strategies = await handler.getConversionStrategies(context);
    console.log('🎯 Strategies:', strategies);

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testObjectionHandler();
}

export { testObjectionHandler };
