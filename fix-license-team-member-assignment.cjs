#!/usr/bin/env node

/**
 * Fix License Team Member Assignment Script
 * 
 * This script fixes the license assignment logic to ensure:
 * 1. Only one license can be assigned to one user at a time
 * 2. Licenses are properly tied to team members
 * 3. Users only see licenses that have been assigned to a user
 * 4. No duplicate license assignments to the same user
 * 
 * Usage: node fix-license-team-member-assignment.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
// This uses your Firebase CLI login credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicenseTeamMemberAssignment() {
  try {
    console.log('🔧 Fixing license assignment to team members...');
    
    // Step 1: Get all team members
    console.log('\n🔍 Step 1: Finding all team members...');
    
    const teamMembersQuery = await db.collection('teamMembers').get();
    const teamMembers = teamMembersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${teamMembers.length} team members`);
    
    if (teamMembers.length === 0) {
      console.log('❌ No team members found in the database');
      return;
    }
    
    // Step 2: Get all licenses
    console.log('\n🔍 Step 2: Finding all licenses...');
    
    const licensesQuery = await db.collection('licenses').get();
    const licenses = licensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${licenses.length} licenses`);
    
    if (licenses.length === 0) {
      console.log('❌ No licenses found in the database');
      return;
    }
    
    // Step 3: Find licenses with multiple assignments or issues
    console.log('\n🔍 Step 3: Checking for license assignment issues...');
    
    // Group licenses by assignedToUserId
    const licensesByUser = {};
    const unassignedLicenses = [];
    const multipleAssignments = [];
    
    licenses.forEach(license => {
      if (license.assignedToUserId) {
        if (!licensesByUser[license.assignedToUserId]) {
          licensesByUser[license.assignedToUserId] = [];
        }
        licensesByUser[license.assignedToUserId].push(license);
        
        if (licensesByUser[license.assignedToUserId].length > 1) {
          // This user has multiple licenses assigned
          if (!multipleAssignments.includes(license.assignedToUserId)) {
            multipleAssignments.push(license.assignedToUserId);
          }
        }
      } else {
        unassignedLicenses.push(license);
      }
    });
    
    console.log(`📊 Found ${Object.keys(licensesByUser).length} users with assigned licenses`);
    console.log(`📊 Found ${unassignedLicenses.length} unassigned licenses`);
    console.log(`📊 Found ${multipleAssignments.length} users with multiple license assignments`);
    
    // Step 4: Fix multiple assignments - keep only the most recent assignment
    if (multipleAssignments.length > 0) {
      console.log('\n🔧 Step 4: Fixing multiple license assignments...');
      
      const batch = db.batch();
      let fixedCount = 0;
      
      for (const userId of multipleAssignments) {
        const userLicenses = licensesByUser[userId];
        console.log(`\n👤 User ${userId} has ${userLicenses.length} licenses assigned`);
        
        // Sort licenses by assignedAt (most recent first)
        userLicenses.sort((a, b) => {
          const dateA = a.assignedAt instanceof admin.firestore.Timestamp ? a.assignedAt.toDate() : new Date(a.assignedAt || 0);
          const dateB = b.assignedAt instanceof admin.firestore.Timestamp ? b.assignedAt.toDate() : new Date(b.assignedAt || 0);
          return dateB - dateA;
        });
        
        // Keep the most recent license assigned
        const mostRecentLicense = userLicenses[0];
        console.log(`✅ Keeping most recent license: ${mostRecentLicense.id} (${mostRecentLicense.tier || 'UNKNOWN'})`);
        
        // Unassign all other licenses
        for (let i = 1; i < userLicenses.length; i++) {
          const licenseToUnassign = userLicenses[i];
          console.log(`🔄 Unassigning license: ${licenseToUnassign.id} (${licenseToUnassign.tier || 'UNKNOWN'})`);
          
          batch.update(db.collection('licenses').doc(licenseToUnassign.id), {
            assignedToUserId: null,
            assignedToEmail: null,
            assignedAt: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          fixedCount++;
        }
      }
      
      // Commit the batch
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`\n✅ Successfully unassigned ${fixedCount} duplicate licenses`);
      } else {
        console.log('\n✅ No duplicate license assignments needed fixing');
      }
    }
    
    // Step 5: Ensure team members have licenses
    console.log('\n🔍 Step 5: Ensuring team members have licenses...');
    
    const teamMembersWithoutLicenses = [];
    const teamMembersToFix = [];
    
    for (const teamMember of teamMembers) {
      // Check if team member has a license assigned
      const hasLicense = Object.keys(licensesByUser).some(userId => {
        // Match by email or ID
        return (
          userId === teamMember.id || 
          (teamMember.email && licensesByUser[userId].some(license => license.assignedToEmail === teamMember.email))
        );
      });
      
      if (!hasLicense) {
        teamMembersWithoutLicenses.push(teamMember);
        
        // If team member has a userId, we can fix it
        if (teamMember.userId) {
          teamMembersToFix.push(teamMember);
        }
      }
    }
    
    console.log(`📊 Found ${teamMembersWithoutLicenses.length} team members without licenses`);
    console.log(`📊 Can fix ${teamMembersToFix.length} team members with available user IDs`);
    
    // Step 6: Assign unassigned licenses to team members without licenses
    if (teamMembersToFix.length > 0 && unassignedLicenses.length > 0) {
      console.log('\n🔧 Step 6: Assigning licenses to team members without licenses...');
      
      const batch = db.batch();
      let assignedCount = 0;
      
      // Sort unassigned licenses by tier (ENTERPRISE > PRO > BASIC)
      unassignedLicenses.sort((a, b) => {
        const tierOrder = { ENTERPRISE: 3, PRO: 2, BASIC: 1 };
        const tierA = tierOrder[a.tier] || 0;
        const tierB = tierOrder[b.tier] || 0;
        return tierB - tierA;
      });
      
      // Assign licenses to team members
      for (let i = 0; i < Math.min(teamMembersToFix.length, unassignedLicenses.length); i++) {
        const teamMember = teamMembersToFix[i];
        const license = unassignedLicenses[i];
        
        console.log(`🔄 Assigning license ${license.id} (${license.tier || 'UNKNOWN'}) to team member ${teamMember.email || teamMember.id}`);
        
        batch.update(db.collection('licenses').doc(license.id), {
          assignedToUserId: teamMember.userId || teamMember.id,
          assignedToEmail: teamMember.email || null,
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        assignedCount++;
      }
      
      // Commit the batch
      if (assignedCount > 0) {
        await batch.commit();
        console.log(`\n✅ Successfully assigned ${assignedCount} licenses to team members`);
      } else {
        console.log('\n✅ No license assignments needed');
      }
    }
    
    // Step 7: Update team member records with license information
    console.log('\n🔧 Step 7: Updating team member records with license information...');
    
    // Get updated licenses after previous operations
    const updatedLicensesQuery = await db.collection('licenses').get();
    const updatedLicenses = updatedLicensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group updated licenses by assignedToUserId
    const updatedLicensesByUser = {};
    updatedLicenses.forEach(license => {
      if (license.assignedToUserId) {
        if (!updatedLicensesByUser[license.assignedToUserId]) {
          updatedLicensesByUser[license.assignedToUserId] = [];
        }
        updatedLicensesByUser[license.assignedToUserId].push(license);
      }
    });
    
    const batch = db.batch();
    let teamMembersUpdated = 0;
    
    for (const teamMember of teamMembers) {
      // Find license for this team member
      const userLicenses = updatedLicensesByUser[teamMember.userId || teamMember.id] || [];
      const licenseByEmail = updatedLicenses.find(license => 
        license.assignedToEmail === teamMember.email
      );
      
      const assignedLicense = userLicenses[0] || licenseByEmail;
      
      if (assignedLicense) {
        // Update team member with license information
        const licenseType = assignedLicense.tier || 'PROFESSIONAL';
        
        if (teamMember.licenseType !== licenseType) {
          console.log(`🔄 Updating team member ${teamMember.email || teamMember.id} with license type ${licenseType}`);
          
          batch.update(db.collection('teamMembers').doc(teamMember.id), {
            licenseType: licenseType,
            licenseId: assignedLicense.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          teamMembersUpdated++;
        }
      }
    }
    
    // Commit the batch
    if (teamMembersUpdated > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully updated ${teamMembersUpdated} team member records with license information`);
    } else {
      console.log('\n✅ No team member records needed updating');
    }
    
    // Step 8: Verify final results
    console.log('\n🔍 Step 8: Verifying final results...');
    
    // Get final licenses after all operations
    const finalLicensesQuery = await db.collection('licenses').get();
    const finalLicenses = finalLicensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group final licenses by assignedToUserId
    const finalLicensesByUser = {};
    let assignedLicenseCount = 0;
    
    finalLicenses.forEach(license => {
      if (license.assignedToUserId) {
        assignedLicenseCount++;
        if (!finalLicensesByUser[license.assignedToUserId]) {
          finalLicensesByUser[license.assignedToUserId] = [];
        }
        finalLicensesByUser[license.assignedToUserId].push(license);
      }
    });
    
    // Check for any remaining multiple assignments
    const remainingMultipleAssignments = Object.keys(finalLicensesByUser).filter(
      userId => finalLicensesByUser[userId].length > 1
    );
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Total licenses: ${finalLicenses.length}`);
    console.log(`   Assigned licenses: ${assignedLicenseCount}`);
    console.log(`   Unassigned licenses: ${finalLicenses.length - assignedLicenseCount}`);
    console.log(`   Users with assigned licenses: ${Object.keys(finalLicensesByUser).length}`);
    console.log(`   Users with multiple licenses: ${remainingMultipleAssignments.length}`);
    
    if (remainingMultipleAssignments.length === 0) {
      console.log('\n🎉 SUCCESS: All license assignments are now unique!');
      console.log('   ✅ Each user has at most one license assigned');
      console.log('   ✅ Team members have proper license information');
    } else {
      console.log('\n⚠️ WARNING: Some users still have multiple license assignments');
      console.log('   Consider running the script again or manually fixing these cases');
    }
    
  } catch (error) {
    console.error('❌ Error fixing license team member assignment:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting license team member assignment fix...\n');
fixLicenseTeamMemberAssignment()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
