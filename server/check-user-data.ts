import { FirestoreService } from './src/services/firestoreService.js';

async function checkUserData() {
  try {
    const userId = 'uFwVXyCwZIySPDiXKimV'; // lissa@apple.com from the logs
    
    console.log('🔍 Checking user data for:', userId);
    
    // Create FirestoreService instance
    const firestoreService = new FirestoreService();
    
    // Check subscriptions
    const subscriptions = await firestoreService.getSubscriptionsByUserId(userId);
    console.log('📊 Subscriptions:', subscriptions.length);
    subscriptions.forEach((sub, i) => {
      console.log(`  ${i+1}. ${sub.tier} - ${sub.status} - ${sub.seats} seats - ID: ${sub.id}`);
    });
    
    // Check licenses
    const licenses = await firestoreService.getLicensesByUserId(userId);
    console.log('🎫 Licenses:', licenses.length);
    licenses.forEach((license, i) => {
      console.log(`  ${i+1}. ${license.tier} - ${license.status} - Expires: ${license.expiresAt} - Key: ${license.key?.substring(0, 20)}...`);
    });
    
    // Check all subscriptions to see if user might be part of an organization
    if (licenses.length === 0) {
      console.log('🏢 Checking all subscriptions for organization memberships...');
      const allSubscriptions = await firestoreService.getAllSubscriptions();
      console.log(`📋 Total subscriptions in database: ${allSubscriptions.length}`);
      
      // Look for enterprise subscriptions that might include this user
      const enterpriseSubscriptions = allSubscriptions.filter(sub => sub.tier === 'ENTERPRISE');
      console.log(`🏢 Enterprise subscriptions: ${enterpriseSubscriptions.length}`);
      
      enterpriseSubscriptions.forEach((sub, i) => {
        console.log(`  ${i+1}. User: ${sub.userId} - ${sub.tier} - ${sub.status} - ${sub.seats} seats`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserData();
