const { FirestoreService } = require('./dist/services/firestoreService.js');
const { LicenseService } = require('./dist/services/licenseService.js');

async function createLicenseForUser() {
  try {
    console.log('🔧 Creating license for existing user...');
    
    const userId = 'uFwVXyCwZIySPDiXKimV'; // lissa@apple.com
    const userEmail = 'lissa@apple.com';
    
    console.log(`📋 User ID: ${userId}`);
    console.log(`📧 User Email: ${userEmail}`);
    
    // Check if user already has subscriptions
    const existingSubscriptions = await FirestoreService.getSubscriptionsByUserId(userId);
    console.log(`📊 Existing subscriptions: ${existingSubscriptions.length}`);
    
    if (existingSubscriptions.length > 0) {
      console.log('✅ User already has subscriptions:');
      existingSubscriptions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.tier} - ${sub.status} - ${sub.seats} seats`);
      });
      
      // Check for existing licenses
      const existingLicenses = await FirestoreService.getLicensesByUserId(userId);
      console.log(`🎫 Existing licenses: ${existingLicenses.length}`);
      
      if (existingLicenses.length > 0) {
        console.log('✅ User already has licenses:');
        existingLicenses.forEach((license, index) => {
          console.log(`  ${index + 1}. ${license.tier} - ${license.status} - Expires: ${license.expiresAt}`);
        });
        return;
      }
    }
    
    // Create a new subscription
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 12); // 1 year subscription
    
    console.log('🆕 Creating new subscription...');
    const subscription = await FirestoreService.createSubscription({
      userId: userId,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      seats: 1,
      pricePerSeat: 19900, // $199.00
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false,
    });
    
    console.log(`✅ Created subscription: ${subscription.id}`);
    
    // Generate licenses
    console.log('🎫 Generating licenses...');
    await LicenseService.generateLicenses(
      userId,
      subscription.id,
      'ENTERPRISE',
      1,
      'ACTIVE',
      12 // 12 months
    );
    
    console.log('🎉 Successfully created subscription and license for user!');
    
    // Verify the license was created
    const newLicenses = await FirestoreService.getLicensesByUserId(userId);
    console.log(`✅ User now has ${newLicenses.length} licenses`);
    
    if (newLicenses.length > 0) {
      newLicenses.forEach((license, index) => {
        console.log(`  ${index + 1}. ${license.tier} - ${license.status} - Key: ${license.key.substring(0, 20)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating license:', error);
  }
}

createLicenseForUser();
