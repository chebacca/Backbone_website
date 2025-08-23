// Browser Console Debug Script for User Role
// Copy and paste this into your browser console while logged in

console.log('🔍 Debugging Current User State...\n');

// Check localStorage
console.log('📦 LocalStorage Contents:');
console.log('- auth_token:', localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing');
console.log('- auth_user:', localStorage.getItem('auth_user') ? '✅ Present' : '❌ Missing');

// Parse user data
const userStr = localStorage.getItem('auth_user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('\n👤 User Data:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Is Team Member:', user.isTeamMember);
    console.log('- Organization ID:', user.organizationId);
    console.log('- Member Role:', user.memberRole);
    console.log('- Member Status:', user.memberStatus);
    console.log('- Firebase UID:', user.firebaseUid);
    
    // Role analysis
    console.log('\n🎭 Role Analysis:');
    const roleUpper = String(user.role || '').toUpperCase();
    console.log('- Normalized Role:', roleUpper);
    
    if (roleUpper === 'SUPERADMIN') {
      console.log('✅ User is SUPERADMIN');
      console.log('🎯 Should be redirected to: /admin');
      console.log('📍 Current URL:', window.location.href);
      
      if (window.location.pathname === '/admin') {
        console.log('✅ Correctly at admin dashboard');
      } else {
        console.log('⚠️ Should be at /admin but currently at:', window.location.pathname);
        console.log('💡 Try navigating to /admin manually');
      }
    } else if (roleUpper === 'ADMIN') {
      console.log('✅ User is ADMIN');
      console.log('🎯 Should be redirected to: /admin');
    } else if (roleUpper === 'TEAM_MEMBER') {
      console.log('⚠️ User is TEAM_MEMBER (may have been downgraded)');
      console.log('🎯 Should be redirected to: /dashboard');
    } else {
      console.log('❓ User role is:', user.role);
      console.log('🎯 Default redirect: /dashboard');
    }
    
    // Team member analysis
    console.log('\n🏢 Team Member Analysis:');
    if (user.isTeamMember) {
      console.log('⚠️ User is marked as team member');
      console.log('- This may interfere with role-based routing');
      console.log('- Organization ID:', user.organizationId);
      console.log('- Member Role:', user.memberRole);
    } else {
      console.log('✅ User is NOT marked as team member');
    }
    
  } catch (e) {
    console.error('❌ Failed to parse user data:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Check current routing
console.log('\n📍 Current Routing State:');
console.log('- URL:', window.location.href);
console.log('- Pathname:', window.location.pathname);
console.log('- Expected for SUPERADMIN:', '/admin');
console.log('- Expected for regular users:', '/dashboard');

// Check if we should redirect
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    const roleUpper = String(user.role || '').toUpperCase();
    
    if (roleUpper === 'SUPERADMIN' && window.location.pathname !== '/admin') {
      console.log('\n🔄 REDIRECT NEEDED:');
      console.log('User is SUPERADMIN but not at /admin');
      console.log('💡 Try navigating to /admin manually');
      console.log('💡 Or log out and log back in');
    }
  } catch (e) {
    console.error('Error checking redirect:', e);
  }
}

console.log('\n🔍 Debug Complete');
console.log('\n💡 Next Steps:');
console.log('1. If role is not SUPERADMIN, check server logs');
console.log('2. If role is SUPERADMIN but routing wrong, try /admin manually');
console.log('3. Log out and log back in to test role preservation');
