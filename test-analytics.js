// Simple test script to verify analytics endpoint
import fetch from 'node-fetch';

async function testAnalyticsEndpoint() {
  try {
    console.log("🧪 Testing analytics endpoint...");
    
    // Test the basic endpoint first
    const testResponse = await fetch('http://localhost:4000/api/analytics/test');
    const testData = await testResponse.json();
    console.log("✅ Test endpoint response:", testData);
    
    // Test the patient summary endpoint (will fail without auth, but we can see the error)
    try {
      const summaryResponse = await fetch('http://localhost:4000/api/analytics/patient-summary');
      const summaryData = await summaryResponse.json();
      console.log("✅ Patient summary response:", summaryData);
    } catch (error) {
      console.log("❌ Patient summary error (expected without auth):", error.message);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testAnalyticsEndpoint(); 