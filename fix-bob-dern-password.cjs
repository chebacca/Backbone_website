const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

async function fixBobDernPassword() {
  const email = 'bdern@example.com';
  const password = 'AdminPass123!';
  
  try {
    console.log('🔍 Looking for Bob Dern in team members...');
    
    // Find Bob Dern by email in teamMembers collection
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('email', '==', email)
      .get();
    
    if (teamMembersSnapshot.empty) {
      console.log('❌ Bob Dern not found in teamMembers collection');
      return;
    }
    
    const bobDoc = teamMembersSnapshot.docs[0];
    const bobData = bobDoc.data();
    
    console.log('✅ Found Bob Dern:', {
      id: bobDoc.id,
      email: bobData.email,
      name: bobData.name,
      role: bobData.role,
      hasPassword: !!bobData.password
    });
    
    if (!bobData.password && !bobData.hashedPassword) {
      console.log('🔑 Adding password for Bob Dern...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update the team member document with the hashed password
      await db.collection('teamMembers').doc(bobDoc.id).update({
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      console.log('✅ Password added successfully!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log('\n👉 Bob Dern can now log in to the dashboard');
    } else {
      console.log('ℹ️ Bob Dern already has a password set');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixBobDernPassword().then(() => process.exit(0));
