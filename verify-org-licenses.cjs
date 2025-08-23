const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function verifyOrgLicenses() {
  console.log('Verifying organization and licenses setup...');
  
  // Find enterprise user
  const usersSnapshot = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  
  if (!usersSnapshot.empty) {
    const user = usersSnapshot.docs[0].data();
    const userId = usersSnapshot.docs[0].id;
    
    console.log('Enterprise User:', {
      id: userId,
      email: user.email,
      organizationId: user.organizationId
    });
    
    if (!user.organizationId) {
      console.log('Error: User has no organizationId');
      return;
    }
    
    // Check organization
    const orgDoc = await db.collection('organizations').doc(user.organizationId).get();
    if (orgDoc.exists) {
      const org = orgDoc.data();
      console.log('Organization:', {
        id: orgDoc.id,
        name: org.name,
        ownerId: org.ownerId,
        tier: org.tier,
        status: org.status
      });
    } else {
      console.log('Error: Organization does not exist');
      return;
    }
    
    // Check subscriptions
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Found ${subscriptionsSnapshot.size} subscriptions`);
    
    subscriptionsSnapshot.forEach(doc => {
      const subscription = doc.data();
      console.log('Subscription:', {
        id: doc.id,
        tier: subscription.tier,
        seats: subscription.seats,
        organizationId: subscription.organizationId,
        userId: subscription.userId
      });
      
      if (subscription.organizationId !== user.organizationId) {
        console.log(`Warning: Subscription ${doc.id} has different organizationId: ${subscription.organizationId} vs ${user.organizationId}`);
      }
    });
    
    // Check licenses
    const licensesSnapshot = await db.collection('licenses')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Found ${licensesSnapshot.size} licenses for user`);
    
    // Check how many licenses have organizationId
    const licensesWithOrgId = licensesSnapshot.docs.filter(doc => 
      doc.data().organizationId === user.organizationId
    ).length;
    
    console.log(`Licenses with correct organizationId: ${licensesWithOrgId} out of ${licensesSnapshot.size}`);
    
    // Check assigned licenses
    const assignedLicenses = licensesSnapshot.docs.filter(doc => 
      doc.data().assignedToUserId || doc.data().assignedToEmail
    ).length;
    
    console.log(`Assigned licenses: ${assignedLicenses}`);
    console.log(`Available licenses: ${licensesSnapshot.size - assignedLicenses}`);
    
    // Check team members
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', user.organizationId)
      .get();
    
    console.log(`Found ${teamMembersSnapshot.size} team members in organization`);
    
    teamMembersSnapshot.forEach(doc => {
      const member = doc.data();
      console.log('Team Member:', {
        id: doc.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        status: member.status
      });
    });
  } else {
    console.log('Enterprise User not found');
  }
}

verifyOrgLicenses().catch(console.error);
