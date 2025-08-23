const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBxGJwAqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "backbone-logic.firebaseapp.com",
  projectId: "backbone-logic",
  storageBucket: "backbone-logic.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createMissingOrganization() {
  try {
    console.log('🔧 Creating missing organization document...');
    
    const organizationId = '24H6zaiCUycuT8ukx9Jz';
    const organizationData = {
      id: organizationId,
      name: 'Enterprise Organization',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Add any other fields that might be needed
      description: 'Enterprise organization for license management',
      tier: 'ENTERPRISE',
      maxSeats: 1000,
      features: ['team_management', 'license_management', 'analytics', 'support']
    };
    
    console.log(`📝 Creating organization with ID: ${organizationId}`);
    console.log('📋 Organization data:', JSON.stringify(organizationData, null, 2));
    
    // Create the organization document
    await setDoc(doc(db, 'organizations', organizationId), organizationData);
    
    console.log('✅ Organization document created successfully!');
    console.log('🎯 TeamPage should now be able to find the organization and fetch licenses');
    
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Permission denied - you may need to run this with proper authentication');
      console.log('🔑 Try running: firebase login');
    }
  }
}

// Run the creation
createMissingOrganization().then(() => {
  console.log('\n✅ Organization creation attempt complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
