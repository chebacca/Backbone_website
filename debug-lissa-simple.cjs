const https = require('https');

async function testLissaAuth() {
  console.log('🔍 Testing Lissa authentication for Dashboard...');
  
  const data = JSON.stringify({
    email: 'lissa@apple.com',
    password: 'Admin1234!'
  });

  const options = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: '/api/team-members/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('📊 Authentication Response:', {
            status: res.statusCode,
            success: result.success,
            userId: result.data?.user?.id,
            userEmail: result.data?.user?.email,
            userName: result.data?.user?.name,
            organizationId: result.data?.user?.organizationId,
            hasToken: !!result.data?.tokens,
            hasFirebaseToken: !!result.data?.firebaseCustomToken,
            firebaseTokenLength: result.data?.firebaseCustomToken?.length || 0
          });
          
          if (result.success && result.data?.user) {
            console.log('✅ Lissa authenticated successfully with ID:', result.data.user.id);
            console.log('🎯 Now test the Dashboard login flow:');
            console.log('   1. Go to: https://backbone-client.web.app/login');
            console.log('   2. Login with: lissa@apple.com / Admin1234!');
            console.log('   3. Select "Network Mode"');
            console.log('   4. Check if you see only assigned projects');
            
            if (result.data.firebaseCustomToken) {
              console.log('🔥 Firebase custom token received - Firestore access should work!');
            } else {
              console.log('⚠️ No Firebase custom token - Firestore access may fail');
            }
            
            console.log('\n🎉 Authentication test complete!');
            console.log('💡 Next steps:');
            console.log('   - Test Dashboard login at: https://backbone-client.web.app/login');
            console.log('   - Verify project filtering works correctly');
            console.log('   - Check browser console for debug information');
          } else {
            console.log('❌ Authentication failed:', result.error || 'Unknown error');
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    await testLissaAuth();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main();
