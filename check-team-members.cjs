// Check Team Members in Firestore
// Using CommonJS format to avoid ES module issues

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

// Get Firestore instance
const db = admin.firestore();

// Organization ID for enterprise.user
const organizationId = '24H6zaiCUycuT8ukx9Jz';

async function checkTeamMembers() {
  try {
    console.log('Checking team members for organization:', organizationId);
    
    // Check 'teamMembers' collection
    console.log('\n=== Checking teamMembers collection ===');
    try {
      const teamMembersSnapshot = await db.collection('teamMembers')
        .where('organizationId', '==', organizationId)
        .get();
      
      console.log(`Found ${teamMembersSnapshot.size} team members in 'teamMembers' collection:`);
      teamMembersSnapshot.forEach(doc => {
        const member = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Name: ${member.name || 'No name'}`);
        console.log(`  Email: ${member.email || 'No email'}`);
        console.log(`  Role: ${member.role || 'No role'}`);
        console.log(`  Status: ${member.status || 'No status'}`);
        console.log(`  License Type: ${member.licenseType || 'No license type'}`);
        console.log('---');
      });
    } catch (error) {
      console.log('No teamMembers collection found or error accessing it:', error.message);
    }
    
    // Check 'org_members' collection
    console.log('\n=== Checking org_members collection ===');
    try {
      const orgMembersSnapshot = await db.collection('org_members')
        .where('orgId', '==', organizationId)
        .get();
      
      console.log(`Found ${orgMembersSnapshot.size} org members in 'org_members' collection:`);
      orgMembersSnapshot.forEach(doc => {
        const member = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Name: ${member.name || 'No name'}`);
        console.log(`  Email: ${member.email || 'No email'}`);
        console.log(`  Role: ${member.role || 'No role'}`);
        console.log(`  Status: ${member.status || 'No status'}`);
        console.log(`  License Type: ${member.licenseType || 'No license type'}`);
        console.log('---');
      });
    } catch (error) {
      console.log('No org_members collection found or error accessing it:', error.message);
    }
    
    // Check 'users' collection
    console.log('\n=== Checking users collection ===');
    try {
      const usersSnapshot = await db.collection('users')
        .where('organizationId', '==', organizationId)
        .get();
      
      console.log(`Found ${usersSnapshot.size} users in 'users' collection:`);
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Name: ${user.name || 'No name'}`);
        console.log(`  Email: ${user.email || 'No email'}`);
        console.log(`  Role: ${user.role || 'No role'}`);
        console.log(`  Status: ${user.status || 'No status'}`);
        console.log('---');
      });
    } catch (error) {
      console.log('No users collection found or error accessing it:', error.message);
    }
    
    // List all collections to see what's available
    console.log('\n=== Listing all collections in the database ===');
    const collections = await db.listCollections();
    console.log('Collections in the database:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
  } catch (error) {
    console.error('Error checking team members:', error);
  }
}

checkTeamMembers()
  .then(() => {
    console.log('\nDone checking team members!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
