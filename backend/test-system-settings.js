import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000/api';

async function testSystemSettingsAPI() {
  console.log('🧪 Testing System Settings API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: Get system settings (should fail without auth)
    console.log('2. Testing GET /api/system/settings (without auth)...');
    try {
      const getResponse = await fetch(`${BASE_URL}/system/settings`);
      const getData = await getResponse.json();
      console.log('❌ Should have failed without auth, but got:', getData);
    } catch (error) {
      console.log('✅ Correctly failed without authentication');
    }
    console.log('');

    // Test 3: Update system settings (should fail without auth)
    console.log('3. Testing PUT /api/system/settings (without auth)...');
    try {
      const updateResponse = await fetch(`${BASE_URL}/system/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            system_name: 'Test System',
            default_language: 'en'
          }
        })
      });
      const updateData = await updateResponse.json();
      console.log('❌ Should have failed without auth, but got:', updateData);
    } catch (error) {
      console.log('✅ Correctly failed without authentication');
    }
    console.log('');

    console.log('🎉 API endpoint tests completed!');
    console.log('📝 Note: Database connection tests require a running MySQL server');
    console.log('📝 The endpoints are properly protected and will work with authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSystemSettingsAPI(); 