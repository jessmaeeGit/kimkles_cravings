// Test API connection
import ApiService from './services/apiService.js';

async function testApiConnection() {
  console.log('🧪 Testing API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing API health check...');
    const healthResult = await ApiService.healthCheck();
    
    if (healthResult.success) {
      console.log('✅ API Health Check:', healthResult.message);
    } else {
      console.log('❌ API Health Check Failed:', healthResult.error);
    }

    // Test 2: PayPal order creation (this will fail without real credentials, but we can test the structure)
    console.log('\n2. Testing PayPal order creation...');
    try {
      const orderResult = await ApiService.createPayPalOrder({
        items: [
          {
            name: 'Test Product',
            price: 100,
            quantity: 1
          }
        ],
        total: 100,
        currency: 'PHP'
      });
      
      console.log('✅ PayPal Order Result:', orderResult);
    } catch (error) {
      console.log('⚠️  PayPal Order Failed (expected without real credentials):', error.message);
    }

    console.log('\n🎉 API connection test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your backend is running on Railway');
    console.log('2. Add your PayPal credentials to the backend');
    console.log('3. Test with real PayPal sandbox credentials');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testApiConnection();
