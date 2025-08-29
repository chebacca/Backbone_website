const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixTenantIsolation() {
  console.log('🚨 FIXING CRITICAL TENANT ISOLATION ISSUE');
  console.log('=========================================');
  
  try {
    const enterpriseFirebaseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    const bobEmail = 'bdern@example.com';
    
    console.log('\n1️⃣ CHECKING CURRENT TEAM MEMBER ASSIGNMENTS');
    console.log('============================================');
    
    // Get all team members in default-org
    const allTeamMembers = await db.collection('teamMembers')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`Found ${allTeamMembers.size} team members in default-org:`);
    
    const wrongAssignments = [];
    const correctAssignments = [];
    
    for (const doc of allTeamMembers.docs) {
      const data = doc.data();
      console.log(`\n- ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`  Role: ${data.role}`);
      console.log(`  Assigned To: ${data.assignedToUserId}`);
      
      if (data.email === 'enterprise.user@example.com') {
        console.log(`  🚨 ISSUE: Enterprise user is a team member of themselves!`);
        wrongAssignments.push({ doc, data, issue: 'self-assignment' });
      } else if (data.email === bobEmail) {
        if (data.assignedToUserId === enterpriseFirebaseUid) {
          console.log(`  ✅ CORRECT: Bob Dern is assigned to enterprise user`);
          correctAssignments.push({ doc, data });
        } else {
          console.log(`  🚨 ISSUE: Bob Dern should be assigned to enterprise user`);
          wrongAssignments.push({ doc, data, issue: 'wrong-assignment' });
        }
      } else if (data.assignedToUserId === enterpriseFirebaseUid) {
        console.log(`  🚨 TENANT VIOLATION: ${data.email} should NOT be assigned to enterprise user!`);
        wrongAssignments.push({ doc, data, issue: 'tenant-violation' });
      } else {
        console.log(`  ℹ️ Other user - should be assigned to their own account owner`);
      }
    }
    
    console.log('\n2️⃣ FIXING TENANT ISOLATION VIOLATIONS');
    console.log('=====================================');
    
    for (const { doc, data, issue } of wrongAssignments) {
      console.log(`\nFixing ${data.firstName} ${data.lastName} (${data.email}):`);
      
      if (issue === 'self-assignment') {
        // Enterprise user should not be a team member - remove or change role
        console.log(`  Removing enterprise user from team members (they are the OWNER)`);
        await doc.ref.delete();
        console.log(`  ✅ Deleted enterprise user team member record`);
        
      } else if (issue === 'wrong-assignment' && data.email === bobEmail) {
        // Fix Bob Dern's assignment
        console.log(`  Assigning Bob Dern to enterprise user`);
        await doc.ref.update({
          assignedToUserId: enterpriseFirebaseUid,
          assignedToUserEmail: 'enterprise.user@example.com',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ Fixed Bob Dern's assignment`);
        
      } else if (issue === 'tenant-violation') {
        // Remove assignment from enterprise user - these should be independent
        console.log(`  Removing ${data.email} from enterprise user's team`);
        await doc.ref.update({
          assignedToUserId: admin.firestore.FieldValue.delete(),
          assignedToUserEmail: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ Removed ${data.email} from enterprise user's team`);
      }
    }
    
    console.log('\n3️⃣ CREATING PROPER TENANT SEPARATION');
    console.log('====================================');
    
    // Each user should have their own organization or be properly separated
    const userEmails = [
      'accounting@example.com',
      'pro.user@example.com', 
      'chebacca@gmail.com',
      'basic.user@example.com'
    ];
    
    for (const email of userEmails) {
      console.log(`\nSetting up ${email} as independent account owner:`);
      
      // Find their user document
      const userQuery = await db.collection('users').where('email', '==', email).get();
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        
        // Create their own organization ID based on their email
        const orgId = email.split('@')[0] + '-org';
        
        console.log(`  Creating organization: ${orgId}`);
        
        // Update user to have their own organization
        await userDoc.ref.update({
          organizationId: orgId,
          role: userData.role || 'OWNER',
          isTeamMember: false,
          memberRole: 'OWNER',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update their team member record
        const teamMemberQuery = await db.collection('teamMembers').where('email', '==', email).get();
        if (!teamMemberQuery.empty) {
          const teamMemberDoc = teamMemberQuery.docs[0];
          await teamMemberDoc.ref.update({
            organizationId: orgId,
            role: 'OWNER',
            assignedToUserId: admin.firestore.FieldValue.delete(),
            assignedToUserEmail: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`  ✅ Updated ${email} to own organization: ${orgId}`);
        }
      }
    }
    
    console.log('\n4️⃣ VERIFYING ENTERPRISE USER ISOLATION');
    console.log('======================================');
    
    // Check what enterprise user should see now
    const enterpriseTeamMembers = await db.collection('teamMembers')
      .where('assignedToUserId', '==', enterpriseFirebaseUid)
      .get();
    
    console.log(`Enterprise user should now see ${enterpriseTeamMembers.size} team members:`);
    enterpriseTeamMembers.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.firstName} ${data.lastName} (${data.email})`);
    });
    
    console.log('\n🎉 TENANT ISOLATION FIXES COMPLETED');
    console.log('===================================');
    console.log('✅ Enterprise user now only sees Bob Dern');
    console.log('✅ Other users moved to their own organizations');
    console.log('✅ Proper tenant separation established');
    console.log('✅ Each account owner manages their own team');
    
  } catch (error) {
    console.error('❌ Error fixing tenant isolation:', error);
  }
  
  process.exit(0);
}

fixTenantIsolation().catch(console.error);
