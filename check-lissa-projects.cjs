const https = require('https');

async function checkLissaProjects() {
  console.log('🔍 Checking Lissa\'s project assignments...');
  
  // First authenticate to get a token
  const authData = JSON.stringify({
    email: 'lissa@apple.com',
    password: 'Admin1234!'
  });

  const authOptions = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: '/api/team-members/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': authData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(authOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.success && result.data?.tokens?.accessToken) {
            console.log('✅ Authentication successful, checking projects...');
            
            // Now check her project access
            const token = result.data.tokens.accessToken;
            checkProjectAccess(token, result.data.user.id);
          } else {
            console.log('❌ Authentication failed:', result.error);
            reject(new Error(result.error || 'Authentication failed'));
          }
        } catch (error) {
          console.error('❌ Failed to parse auth response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Auth request failed:', error);
      reject(error);
    });

    req.write(authData);
    req.end();
  });
}

async function checkProjectAccess(token, teamMemberId) {
  console.log(`🔍 Checking project access for team member: ${teamMemberId}`);
  
  const options = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: `/api/team-members/${teamMemberId}/projects`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('📊 Project Access Response:', {
          status: res.statusCode,
          success: result.success,
          projectCount: result.data?.length || 0
        });
        
        if (result.success && result.data) {
          console.log('\n📁 Projects assigned to Lissa:');
          result.data.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name || project.projectName} (${project.role || 'MEMBER'})`);
          });
        } else {
          console.log('❌ No projects found or error:', result.error);
        }
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Failed to parse project response:', error);
        console.log('Raw response:', responseData);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Project check request failed:', error);
    process.exit(1);
  });

  req.end();
}

async function main() {
  try {
    await checkLissaProjects();
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

main();
