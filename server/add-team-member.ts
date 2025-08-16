import { FirestoreService } from './src/services/firestoreService.js';
import { LicenseService } from './src/services/licenseService.js';

async function addTeamMember() {
  try {
    const firestoreService = new FirestoreService();
    
    const teamMemberUserId = 'uFwVXyCwZIySPDiXKimV'; // lissa@apple.com
    const enterpriseUserId = 'FNRryE7MnONlNuH4h0n2'; // Enterprise subscription owner
    
    console.log('🔍 Finding Enterprise subscription...');
    
    // Get the enterprise subscription
    const subscriptions = await firestoreService.getSubscriptionsByUserId(enterpriseUserId);
    const enterpriseSubscription = subscriptions.find(sub => sub.tier === 'ENTERPRISE');
    
    if (!enterpriseSubscription) {
      console.error('❌ No Enterprise subscription found');
      return;
    }
    
    console.log(`✅ Found Enterprise subscription: ${enterpriseSubscription.id}`);
    console.log(`📊 Tier: ${enterpriseSubscription.tier}, Seats: ${enterpriseSubscription.seats}, Status: ${enterpriseSubscription.status}`);
    
    // Check how many licenses are already issued for this subscription
    const existingLicenses = await firestoreService.getLicensesBySubscriptionId(enterpriseSubscription.id);
    console.log(`🎫 Existing licenses for this subscription: ${existingLicenses.length}`);
    
    if (existingLicenses.length >= enterpriseSubscription.seats) {
      console.error(`❌ All seats are taken (${existingLicenses.length}/${enterpriseSubscription.seats})`);
      return;
    }
    
    // Check if user already has a license for this subscription
    const userLicense = existingLicenses.find(license => license.userId === teamMemberUserId);
    if (userLicense) {
      console.log(`✅ User already has a license: ${userLicense.status}`);
      return;
    }
    
    console.log('🎫 Creating license for team member...');
    
    // Generate a license for the team member using the existing subscription
    await LicenseService.generateLicenses(
      teamMemberUserId,
      enterpriseSubscription.id,
      'ENTERPRISE',
      1, // Just 1 license for this user
      'ACTIVE',
      12, // 12 months
      enterpriseSubscription.organizationId // If there's an organization
    );
    
    console.log('🎉 Successfully created license for team member!');
    
    // Verify the license was created
    const newLicenses = await firestoreService.getLicensesByUserId(teamMemberUserId);
    console.log(`✅ User now has ${newLicenses.length} licenses`);
    
    if (newLicenses.length > 0) {
      newLicenses.forEach((license, index) => {
        console.log(`  ${index + 1}. ${license.tier} - ${license.status} - Key: ${license.key?.substring(0, 20)}...`);
        console.log(`     Subscription: ${license.subscriptionId}`);
        console.log(`     Expires: ${license.expiresAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding team member:', error);
  }
}

addTeamMember();
