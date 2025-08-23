#!/usr/bin/env node

// Debug script to check user role and authentication state
// Run this in the browser console to debug role detection issues

console.log('🔍 Debugging User Role and Authentication State...');

// Check localStorage
console.log('📦 LocalStorage Contents:');
console.log('- auth_token:', localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing');
console.log('- auth_user:', localStorage.getItem('auth_user') ? '✅ Present' : '❌ Missing');

// Parse user data
const userStr = localStorage.getItem('auth_user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('👤 User Data:', user);
    console.log('🎭 Role:', user.role);
    console.log('🔑 Firebase UID:', user.firebaseUid);
    console.log('🏢 Is Team Member:', user.isTeamMember);
    console.log('🏢 Organization ID:', user.organizationId);
    console.log('👥 Member Role:', user.memberRole);
  } catch (e) {
    console.error('❌ Failed to parse user data:', e);
  }
}

// Check if we're in the right context
console.log('📍 Current URL:', window.location.href);
console.log('🎯 Expected Route for SUPERADMIN:', '/admin');

// Check if user should be redirected
const user = userStr ? JSON.parse(userStr) : null;
if (user && user.role) {
  const roleUpper = String(user.role).toUpperCase();
  console.log('🎭 Role Check:', roleUpper);
  
  if (roleUpper === 'SUPERADMIN') {
    console.log('✅ User is SUPERADMIN - should be at /admin');
    if (window.location.pathname !== '/admin') {
      console.log('⚠️ User should be redirected to /admin');
      console.log('💡 Try navigating to /admin manually');
    }
  } else {
    console.log('❌ User is NOT SUPERADMIN - current role:', user.role);
    console.log('💡 Check server-side role assignment');
  }
}

console.log('�� Debug Complete');
