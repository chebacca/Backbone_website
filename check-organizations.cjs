const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkOrganizations() {
  try {
    console.log('🔍 Checking organizations collection...');
    
    // Get all organizations
    const orgsSnapshot = await getDocs(collection(db, 'organizations'));
    console.log(`📊 Found ${orgsSnapshot.size} organizations in Firestore:`);
    
    orgsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Name: ${data.name || 'N/A'}`);
      console.log(`    Type: ${data.type || 'N/A'}`);
      console.log(`    Created: ${data.createdAt || 'N/A'}`);
      console.log('    ---');
    });
    
    // Check if the specific organization ID exists
    const targetOrgId = '24H6zaiCUycuT8ukx9Jz';
    console.log(`\n🎯 Looking for specific organization ID: ${targetOrgId}`);
    
    const orgQuery = query(collection(db, 'organizations'), where('__name__', '==', targetOrgId));
    const orgDoc = await getDocs(orgQuery);
    
    if (orgDoc.empty) {
      console.log(`❌ Organization with ID ${targetOrgId} NOT found in Firestore`);
      console.log('💡 This explains why TeamPage can\'t find the organization!');
    } else {
      console.log(`✅ Organization with ID ${targetOrgId} found in Firestore`);
    }
    
    // Check users collection for organizationId references
    console.log('\n👥 Checking users collection for organizationId references...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersWithOrg = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.organizationId) {
        usersWithOrg.push({
          id: doc.id,
          email: data.email,
          organizationId: data.organizationId
        });
      }
    });
    
    console.log(`📊 Found ${usersWithOrg.length} users with organizationId:`);
    usersWithOrg.forEach(user => {
      console.log(`  - User: ${user.email} (${user.id})`);
      console.log(`    Organization ID: ${user.organizationId}`);
    });
    
    // Check teamMembers collection
    console.log('\n👥 Checking teamMembers collection...');
    const teamMembersSnapshot = await getDocs(collection(db, 'teamMembers'));
    const teamMembersWithOrg = [];
    
    teamMembersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.organizationId) {
        teamMembersWithOrg.push({
          id: doc.id,
          email: data.email,
          organizationId: data.organizationId
        });
      }
    });
    
    console.log(`📊 Found ${teamMembersWithOrg.length} team members with organizationId:`);
    teamMembersWithOrg.forEach(member => {
      console.log(`  - Member: ${member.email} (${member.id})`);
      console.log(`    Organization ID: ${member.organizationId}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking organizations:', error);
  }
}

// Run the check
checkOrganizations().then(() => {
  console.log('\n✅ Organization check complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
