const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function linkSubscriptionToOrg() {
  console.log('Linking Enterprise User subscription to organization...');
  
  // Find enterprise user
  const usersSnapshot = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  
  if (!usersSnapshot.empty) {
    const user = usersSnapshot.docs[0].data();
    const userId = usersSnapshot.docs[0].id;
    
    // Get the updated user with organizationId
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const updatedUser = updatedUserDoc.data();
    
    console.log('Enterprise User:', {
      id: userId,
      email: updatedUser.email,
      organizationId: updatedUser.organizationId
    });
    
    if (!updatedUser.organizationId) {
      console.log('Error: User still has no organizationId');
      return;
    }
    
    // Update all subscriptions for this user with the organizationId
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Found ${subscriptionsSnapshot.size} subscriptions to update`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    subscriptionsSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        organizationId: updatedUser.organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updateCount++;
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Updated ${updateCount} subscriptions with organizationId ${updatedUser.organizationId}`);
    }
    
    // Update all licenses for this user with the organizationId
    const licensesSnapshot = await db.collection('licenses')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Found ${licensesSnapshot.size} licenses to update`);
    
    const licensesBatch = db.batch();
    let licenseUpdateCount = 0;
    
    licensesSnapshot.forEach(doc => {
      licensesBatch.update(doc.ref, {
        organizationId: updatedUser.organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      licenseUpdateCount++;
    });
    
    if (licenseUpdateCount > 0) {
      await licensesBatch.commit();
      console.log(`Updated ${licenseUpdateCount} licenses with organizationId ${updatedUser.organizationId}`);
    }
    
    // Verify the updates
    const verifySubscription = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!verifySubscription.empty) {
      const subscription = verifySubscription.docs[0].data();
      console.log('Verified subscription:', {
        id: verifySubscription.docs[0].id,
        tier: subscription.tier,
        seats: subscription.seats,
        organizationId: subscription.organizationId
      });
    }
    
    // Check if any team members exist
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', updatedUser.organizationId)
      .get();
    
    console.log(`Found ${teamMembersSnapshot.size} team members in organization`);
    
    // If no team members exist, create a sample one
    if (teamMembersSnapshot.size === 0) {
      console.log('Creating sample team member...');
      
      const teamMemberRef = db.collection('teamMembers').doc();
      await teamMemberRef.set({
        email: 'sample.team.member@example.com',
        firstName: 'Sample',
        lastName: 'Member',
        organizationId: updatedUser.organizationId,
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: userId
      });
      
      console.log(`Created sample team member ${teamMemberRef.id}`);
    }
  } else {
    console.log('Enterprise User not found');
  }
}

linkSubscriptionToOrg().catch(console.error);
