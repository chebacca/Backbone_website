const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function checkUserAndOrg() {
  console.log('Checking Enterprise User and Organization details...');
  
  // Find enterprise user
  const usersSnapshot = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  
  if (!usersSnapshot.empty) {
    const user = usersSnapshot.docs[0].data();
    console.log('Enterprise User:', {
      id: usersSnapshot.docs[0].id,
      email: user.email,
      organizationId: user.organizationId,
      subscriptionId: user.subscriptionId
    });
    
    // Check if they have an organization
    if (user.organizationId) {
      const orgDoc = await db.collection('organizations').doc(user.organizationId).get();
      if (orgDoc.exists) {
        console.log('Organization exists:', orgDoc.id);
        const org = orgDoc.data();
        console.log('Organization data:', org);
        
        // Check team members in organization
        const teamMembersSnapshot = await db.collection('teamMembers')
          .where('organizationId', '==', user.organizationId)
          .get();
        
        console.log(`Found ${teamMembersSnapshot.size} team members in organization`);
        
        if (teamMembersSnapshot.size > 0) {
          console.log('Sample team member:', teamMembersSnapshot.docs[0].data());
        }
      } else {
        console.log('Organization does not exist');
      }
    } else {
      console.log('User has no organizationId');
      
      // Create organization for user
      console.log('Creating organization for Enterprise User...');
      const orgRef = db.collection('organizations').doc();
      await orgRef.set({
        name: 'Enterprise Organization',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ownerId: usersSnapshot.docs[0].id,
        tier: 'ENTERPRISE',
        status: 'ACTIVE'
      });
      
      // Update user with organizationId
      await db.collection('users').doc(usersSnapshot.docs[0].id).update({
        organizationId: orgRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Created organization ${orgRef.id} and assigned to user`);
    }
    
    // Check subscriptions
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', usersSnapshot.docs[0].id)
      .get();
    
    console.log(`Found ${subscriptionsSnapshot.size} subscriptions for user`);
    
    if (subscriptionsSnapshot.size > 0) {
      const subscription = subscriptionsSnapshot.docs[0].data();
      console.log('First subscription:', {
        id: subscriptionsSnapshot.docs[0].id,
        tier: subscription.tier,
        seats: subscription.seats,
        organizationId: subscription.organizationId
      });
      
      // If subscription doesn't have organizationId, update it
      if (!subscription.organizationId && user.organizationId) {
        await db.collection('subscriptions').doc(subscriptionsSnapshot.docs[0].id).update({
          organizationId: user.organizationId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Updated subscription ${subscriptionsSnapshot.docs[0].id} with organizationId ${user.organizationId}`);
      }
    }
  } else {
    console.log('Enterprise User not found');
  }
}

checkUserAndOrg().catch(console.error);
