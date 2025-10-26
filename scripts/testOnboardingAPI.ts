/**
 * Test script for the onboarding API endpoint
 * Run with: npx tsx scripts/testOnboardingAPI.ts
 */

const API_BASE_URL = 'http://localhost:3000'; // Adjust if your dev server runs on a different port

async function testOnboardingAPI() {
  const testData = {
    userId: 'test_user_123',
    paragraph: `Hi! I'm a 25-year-old software developer who wants to get back into fitness. I used to work out in college but haven't been consistent for the past 2 years. I prefer working out at home with dumbbells and resistance bands, but I'm open to gym workouts too. My main goals are to build muscle and improve my overall strength. I like push-pull-legs split and prefer compound exercises. I can work out 4-5 times per week for about 45-60 minutes per session. I have some lower back issues, so I need to be careful with deadlifts and squats.`
  };

  try {
    console.log('🚀 Testing onboarding API endpoint...');
    console.log('📝 Test data:', testData);
    console.log('');

    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Error!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      console.log('🔢 Status:', response.status);
    }

  } catch (error) {
    console.error('💥 Network or other error:', error);
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🧪 Testing error cases...\n');

  // Test missing userId
  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraph: 'Test paragraph' }),
    });
    const result = await response.json();
    console.log('Missing userId test:', response.status, result);
  } catch (error) {
    console.error('Missing userId test error:', error);
  }

  // Test missing paragraph
  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test_user' }),
    });
    const result = await response.json();
    console.log('Missing paragraph test:', response.status, result);
  } catch (error) {
    console.error('Missing paragraph test error:', error);
  }

  // Test invalid method
  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: 'GET',
    });
    const result = await response.json();
    console.log('Invalid method test:', response.status, result);
  } catch (error) {
    console.error('Invalid method test error:', error);
  }
}

// Run tests
(async () => {
  await testOnboardingAPI();
  await testErrorCases();
})();
