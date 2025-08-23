const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function checkEnterpriseUser() {
  console.log('Checking Enterprise User details...');
  
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
    
    // Check if they have a subscription
    if (user.subscriptionId) {
      const subDoc = await db.collection('subscriptions').doc(user.subscriptionId).get();
      if (subDoc.exists()) {
        const sub = subDoc.data();
        console.log('Subscription:', {
          id: subDoc.id,
          tier: sub.tier,
          seats: sub.seats,
          organizationId: sub.organizationId
        });
      }
    }
    
    // Check if they have an organization
    if (user.organizationId) {
      const orgDoc = await db.collection('organizations').doc(user.organizationId).get();
      if (orgDoc.exists()) {
        const org = orgDoc.data();
        console.log('Organization:', {
          id: orgDoc.id,
          name: org.name,
          tier: org.tier
        });
      }
    }
  }
}

checkEnterpriseUser().catch(console.error);
