import { processHealthMetrics } from './utils/healthAlerts.js';

// Mock Socket.IO for testing
const mockIo = {
  emit: (event, data) => {
    console.log(`🔔 Socket.IO Event: ${event}`);
    console.log('📊 Alert Data:', JSON.stringify(data, null, 2));
  }
};

// Test cases
const testCases = [
  {
    name: "High Glucose (Critical)",
    userId: 1,
    metrics: { glucose: 250, isFasting: false }
  },
  {
    name: "Low Glucose (Critical)",
    userId: 2,
    metrics: { glucose: 45, isFasting: true }
  },
  {
    name: "Elevated Blood Pressure (High)",
    userId: 3,
    metrics: { systolic: 150, diastolic: 95 }
  },
  {
    name: "Critical Blood Pressure",
    userId: 4,
    metrics: { systolic: 190, diastolic: 125 }
  },
  {
    name: "Low Blood Pressure",
    userId: 5,
    metrics: { systolic: 85, diastolic: 55 }
  },
  {
    name: "Normal Glucose (No Alert)",
    userId: 6,
    metrics: { glucose: 100, isFasting: true }
  },
  {
    name: "Normal Blood Pressure (No Alert)",
    userId: 7,
    metrics: { systolic: 120, diastolic: 80 }
  }
];

async function runTests() {
  console.log('🧪 Testing Real-time Health Alert System\n');
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`👤 User ID: ${testCase.userId}`);
    console.log(`📊 Metrics: ${JSON.stringify(testCase.metrics)}`);
    
    try {
      const alerts = await processHealthMetrics(testCase.userId, testCase.metrics, mockIo);
      
      if (alerts.length > 0) {
        console.log(`✅ Generated ${alerts.length} alert(s):`);
        alerts.forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.message} (${alert.type})`);
        });
      } else {
        console.log('✅ No alerts generated (normal readings)');
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n🎉 Test completed!');
}

// Run the tests
runTests().catch(console.error); 