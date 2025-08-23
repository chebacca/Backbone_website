const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function checkSubscriptions() {
  console.log('Checking subscriptions for enterprise.user@example.com...');
  
  // Check if there's a subscription with this email
  const subsSnapshot = await db.collection('subscriptions').where('userEmail', '==', 'enterprise.user@example.com').get();
  console.log(`Subscriptions with userEmail enterprise.user@example.com: ${subsSnapshot.size}`);
  
  if (!subsSnapshot.empty) {
    subsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Subscription ${doc.id}:`, {
        tier: data.tier,
        seats: data.seats,
        userEmail: data.userEmail,
        userId: data.userId
      });
    });
  }
  
  // Also check by userId
  const userId = 'l5YKvrhAD72EV2MnugbS';
  const subsByUserId = await db.collection('subscriptions').where('userId', '==', userId).get();
  console.log(`Subscriptions with userId ${userId}: ${subsByUserId.size}`);
  
  if (!subsByUserId.empty) {
    subsByUserId.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Subscription ${doc.id}:`, {
        tier: data.tier,
        seats: data.seats,
        userEmail: data.userEmail,
        userId: data.userId
      });
    });
  }
}

checkSubscriptions().catch(console.error);
