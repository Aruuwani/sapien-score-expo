/**
 * API Testing Script for SapienScore WebApp
 * 
 * HOW TO USE:
 * 1. Open http://localhost:3000 in browser
 * 2. Login to the app
 * 3. Open DevTools Console (F12 or Cmd+Option+I)
 * 4. Copy and paste this entire file into the console
 * 5. Run: testAllAPIs()
 */

const API_BASE_URL = 'https://sapio.one/node/api';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  const token = localStorage.getItem('auth_token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 ${method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, result);
      return { success: true, data: result, status: response.status };
    } else {
      console.error(`❌ Error (${response.status}):`, result);
      return { success: false, error: result, status: response.status };
    }
  } catch (error) {
    console.error(`❌ Network Error:`, error);
    return { success: false, error: error.message };
  }
}

// Test individual APIs
const tests = {
  // User APIs
  async testGetUserProfile() {
    console.log('\n📝 Testing: Get User Profile');
    return await apiCall('GET', '/users/user');
  },

  async testGetUserNames() {
    console.log('\n📝 Testing: Get User Names');
    return await apiCall('GET', '/users/usernames');
  },

  // Rating APIs
  async testGetRatingsForMe() {
    console.log('\n📝 Testing: Get Ratings For Me (Who Scored Me)');
    return await apiCall('GET', '/ratings/who-scored-me');
  },

  async testGetSapiensIScored() {
    console.log('\n📝 Testing: Get Sapiens I Scored (Whom I Scored)');
    return await apiCall('GET', '/ratings/whom-i-scored');
  },

  async testGetUserRatings() {
    console.log('\n📝 Testing: Get User Ratings');
    return await apiCall('GET', '/ratings/getuser_rating');
  },

  // Chatroom APIs
  async testGetChatrooms() {
    console.log('\n📝 Testing: Get Chatrooms');
    return await apiCall('GET', '/chatroom/rooms');
  },

  async testGetFavChatrooms() {
    console.log('\n📝 Testing: Get Favorite Chatrooms');
    return await apiCall('GET', '/chatroom/rooms/favorite');
  },

  // Notification APIs
  async testGetNotifications() {
    console.log('\n📝 Testing: Get Notifications');
    return await apiCall('GET', '/notifications');
  },

  // Test with sample data
  async testCheckIfScored(receiverId, relation) {
    console.log('\n📝 Testing: Check If Scored');
    if (!receiverId || !relation) {
      console.warn('⚠️ Skipping: Need receiverId and relation parameters');
      return { success: false, error: 'Missing parameters' };
    }
    return await apiCall('GET', `/ratings/check-if-scored?receiver_id=${receiverId}&sender_relation=${relation}`);
  },

  async testGetMessages(roomId) {
    console.log('\n📝 Testing: Get Messages');
    if (!roomId) {
      console.warn('⚠️ Skipping: Need roomId parameter');
      return { success: false, error: 'Missing roomId' };
    }
    return await apiCall('GET', `/messages/rooms/${roomId}/messages`);
  }
};

// Run all tests
async function testAllAPIs() {
  console.clear();
  console.log('🚀 Starting API Tests...\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('❌ No auth token found! Please login first.');
    return;
  }

  console.log('✅ Auth token found:', token.substring(0, 20) + '...\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Test User APIs
  console.log('📦 USER APIs');
  console.log('───────────────────────────────────────────────────────');
  let result = await tests.testGetUserProfile();
  result.success ? results.passed++ : results.failed++;
  
  result = await tests.testGetUserNames();
  result.success ? results.passed++ : results.failed++;

  // Test Rating APIs
  console.log('\n📦 RATING APIs');
  console.log('───────────────────────────────────────────────────────');
  result = await tests.testGetRatingsForMe();
  result.success ? results.passed++ : results.failed++;
  
  result = await tests.testGetSapiensIScored();
  result.success ? results.passed++ : results.failed++;
  
  result = await tests.testGetUserRatings();
  result.success ? results.passed++ : results.failed++;

  // Test Chatroom APIs
  console.log('\n📦 CHATROOM APIs');
  console.log('───────────────────────────────────────────────────────');
  result = await tests.testGetChatrooms();
  result.success ? results.passed++ : results.failed++;
  
  result = await tests.testGetFavChatrooms();
  result.success ? results.passed++ : results.failed++;

  // Test Notification APIs
  console.log('\n📦 NOTIFICATION APIs');
  console.log('───────────────────────────────────────────────────────');
  result = await tests.testGetNotifications();
  result.success ? results.passed++ : results.failed++;

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (results.failed === 0) {
    console.log('🎉 All tests passed! APIs are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
}

// Quick test functions
function quickTestUser() {
  return tests.testGetUserProfile();
}

function quickTestRatings() {
  return tests.testGetRatingsForMe();
}

function quickTestChatrooms() {
  return tests.testGetChatrooms();
}

// Export for console use
console.log('✅ API Testing Script Loaded!');
console.log('\nAvailable commands:');
console.log('  testAllAPIs()          - Run all API tests');
console.log('  quickTestUser()        - Test user profile API');
console.log('  quickTestRatings()     - Test ratings API');
console.log('  quickTestChatrooms()   - Test chatrooms API');
console.log('\nRun: testAllAPIs() to start testing\n');

