#!/usr/bin/env node

/**
 * Simple Team Member Removal Test
 * 
 * This script will:
 * 1. Create a test team member directly in Firestore
 * 2. Test the removal functionality using the licensing website API
 * 3. Verify the cleanup worked
 */

const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

class SimpleTeamMemberTest {
  
  /**
   * Create a test team member directly in Firestore
   */
  static async createTestTeamMember() {
    console.log('👤 [Test] Creating test team member in Firestore...');
    
    const testMember = {
      email: 'test.removal@example.com',
      firstName: 'Test',
      lastName: 'Removal',
      role: 'TEAM_MEMBER',
      organizationId: 'enterprise-org-001',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Create in teamMembers collection
      const memberRef = db.collection('teamMembers').doc();
      await memberRef.set({
        ...testMember,
        id: memberRef.id
      });
      
      // Also create in users collection (as the system expects)
      await db.collection('users').doc(testMember.email).set({
        ...testMember,
        id: memberRef.id,
        name: `${testMember.firstName} ${testMember.lastName}`
      });
      
      console.log(`   ✅ Created test team member: ${memberRef.id} (${testMember.email})`);
      return memberRef.id;
      
    } catch (error) {
      console.error('   ❌ Failed to create test team member:', error);
      throw error;
    }
  }

  /**
   * Test the team member removal using the licensing website API
   */
  static async testRemovalViaAPI(teamMemberId) {
    console.log('🗑️ [Test] Testing team member removal via licensing website API...');
    
    try {
      // Use the licensing website API directly
      const response = await axios.post(
        'https://backbone-logic.web.app/api/team-members/remove-completely',
        {
          teamMemberId: teamMemberId,
          organizationId: 'enterprise-org-001'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // For testing, we'll create a simple auth header
            'Authorization': 'Bearer test-token'
          }
        }
      );
      
      if (response.data.success) {
        console.log('   ✅ API call successful!');
        console.log('   📊 Cleanup results:', response.data.data);
        return true;
      } else {
        console.error('   ❌ API call failed:', response.data);
        return false;
      }
      
    } catch (error) {
      console.error('   ❌ API call error:', error.response?.data || error.message);
      
      // If it's an auth error, that's expected - let's test the backend service directly
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('   ℹ️ Auth error expected - testing backend service directly...');
        return await this.testRemovalDirectly(teamMemberId);
      }
      
      return false;
    }
  }

  /**
   * Test removal by calling the backend service directly
   */
  static async testRemovalDirectly(teamMemberId) {
    console.log('🔧 [Test] Testing removal via backend service directly...');
    
    try {
      // Import the cleanup service
      const { TeamMemberCleanupService } = require('./server/src/services/teamMemberCleanupService');
      
      const result = await TeamMemberCleanupService.removeTeamMemberCompletely(
        teamMemberId,
        'enterprise-org-001',
        'enterprise.admin@example.com' // Removed by admin
      );
      
      console.log('   ✅ Direct service call successful!');
      console.log('   📊 Cleanup results:', result);
      return true;
      
    } catch (error) {
      console.error('   ❌ Direct service call failed:', error.message);
      return false;
    }
  }

  /**
   * Verify the team member was completely removed
   */
  static async verifyRemoval(teamMemberId, email) {
    console.log('🔍 [Test] Verifying complete removal...');
    
    try {
      const collections = ['teamMembers', 'team_members', 'orgMembers', 'org_members', 'users'];
      let foundInCollections = [];
      
      // Check by document ID
      for (const collectionName of collections) {
        try {
          const doc = await db.collection(collectionName).doc(teamMemberId).get();
          if (doc.exists) {
            foundInCollections.push(`${collectionName} (by ID)`);
          }
        } catch (error) {
          // Collection might not exist, that's fine
        }
      }
      
      // Check by email in users collection
      try {
        const userDoc = await db.collection('users').doc(email).get();
        if (userDoc.exists) {
          foundInCollections.push('users (by email)');
        }
      } catch (error) {
        // That's fine
      }
      
      // Check for any documents with this email
      for (const collectionName of collections) {
        try {
          const query = await db.collection(collectionName).where('email', '==', email).get();
          if (!query.empty) {
            foundInCollections.push(`${collectionName} (by email query)`);
          }
        } catch (error) {
          // Collection might not exist or not have email field, that's fine
        }
      }
      
      if (foundInCollections.length === 0) {
        console.log('   ✅ Team member completely removed from all collections');
        return true;
      } else {
        console.log(`   ⚠️ Team member still found in: ${foundInCollections.join(', ')}`);
        return false;
      }
      
    } catch (error) {
      console.error('   ❌ Error verifying removal:', error);
      return false;
    }
  }

  /**
   * Run the complete test
   */
  static async runTest() {
    console.log('🧪 [Test] Starting simple team member removal test...');
    console.log('==============================================');
    
    let teamMemberId = null;
    const testEmail = 'test.removal@example.com';
    
    try {
      // Step 1: Create test team member
      teamMemberId = await this.createTestTeamMember();
      
      // Step 2: Test removal
      const removalSuccess = await this.testRemovalViaAPI(teamMemberId);
      
      // Step 3: Verify removal
      const verificationSuccess = await this.verifyRemoval(teamMemberId, testEmail);
      
      console.log('\n==============================================');
      console.log('🏁 [Test] Test Results:');
      console.log(`   Team Member Creation: ✅ Success`);
      console.log(`   Team Member Removal: ${removalSuccess ? '✅ Success' : '❌ Failed'}`);
      console.log(`   Removal Verification: ${verificationSuccess ? '✅ Success' : '❌ Failed'}`);
      
      if (removalSuccess && verificationSuccess) {
        console.log('\n🎉 Test passed! Team member removal functionality is working.');
        return true;
      } else {
        console.log('\n⚠️ Test had issues. Check the logs above for details.');
        return false;
      }
      
    } catch (error) {
      console.error('\n💥 Test failed:', error);
      
      // Cleanup: Remove the test team member if it still exists
      if (teamMemberId) {
        console.log('\n🧹 [Cleanup] Removing test team member...');
        try {
          await db.collection('teamMembers').doc(teamMemberId).delete();
          await db.collection('users').doc(testEmail).delete();
          console.log('   ✅ Test cleanup completed');
        } catch (cleanupError) {
          console.log('   ⚠️ Test cleanup failed:', cleanupError.message);
        }
      }
      
      return false;
    }
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  SimpleTeamMemberTest.runTest()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = SimpleTeamMemberTest;
