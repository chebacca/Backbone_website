#!/usr/bin/env node

/**
 * Cleanup Duplicate Lissa Script
 * 
 * This script finds and removes duplicate Lissa accounts, keeping only the original one
 */

import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'backbone-logic'
      });
    }
    
    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return false;
  }
}

/**
 * Find all Lissa accounts
 */
async function findAllLissaAccounts() {
  try {
    console.log('🔍 Searching for all Lissa accounts...');
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Find all Firebase Auth users with lissa@apple.com
    const authUsers = [];
    try {
      const lissaAuth = await auth.getUserByEmail('lissa@apple.com');
      authUsers.push(lissaAuth);
      console.log('✅ Found Lissa in Firebase Auth:', lissaAuth.uid);
    } catch (error) {
      console.log('ℹ️ No Lissa found in Firebase Auth');
    }
    
    // Find all Firestore users with lissa@apple.com
    const firestoreQuery = await db.collection('users')
      .where('email', '==', 'lissa@apple.com')
      .get();
    
    const firestoreUsers = [];
    firestoreQuery.forEach(doc => {
      const userData = doc.data();
      firestoreUsers.push({
        id: doc.id,
        data: userData
      });
      console.log('✅ Found Lissa in Firestore:', doc.id, {
        name: userData.name,
        role: userData.role,
        isTeamMember: userData.isTeamMember,
        organizationId: userData.organizationId,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt
      });
    });
    
    return {
      authUsers,
      firestoreUsers
    };
    
  } catch (error) {
    console.error('❌ Error finding Lissa accounts:', error.message);
    return { authUsers: [], firestoreUsers: [] };
  }
}

/**
 * Determine which Lissa account to keep
 */
function determineAccountToKeep(firestoreUsers) {
  if (firestoreUsers.length <= 1) {
    return firestoreUsers[0] || null;
  }
  
  console.log('🤔 Multiple Lissa accounts found, determining which to keep...');
  
  // Prefer the account with organizationId (original team member)
  const teamMemberAccount = firestoreUsers.find(user => 
    user.data.organizationId && user.data.isTeamMember
  );
  
  if (teamMemberAccount) {
    console.log('✅ Keeping original team member account:', teamMemberAccount.id);
    return teamMemberAccount;
  }
  
  // Fallback to the oldest account
  const sortedByDate = firestoreUsers.sort((a, b) => {
    const dateA = a.data.createdAt?.toDate?.() || new Date(a.data.createdAt || 0);
    const dateB = b.data.createdAt?.toDate?.() || new Date(b.data.createdAt || 0);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log('✅ Keeping oldest account:', sortedByDate[0].id);
  return sortedByDate[0];
}

/**
 * Remove duplicate Firestore accounts
 */
async function removeDuplicateAccounts(firestoreUsers, accountToKeep) {
  try {
    const db = admin.firestore();
    
    const accountsToRemove = firestoreUsers.filter(user => user.id !== accountToKeep.id);
    
    if (accountsToRemove.length === 0) {
      console.log('ℹ️ No duplicate accounts to remove');
      return true;
    }
    
    console.log('🗑️ Removing duplicate accounts...');
    
    for (const account of accountsToRemove) {
      console.log('🗑️ Removing duplicate account:', account.id);
      await db.collection('users').doc(account.id).delete();
      console.log('✅ Removed duplicate account:', account.id);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error removing duplicate accounts:', error.message);
    return false;
  }
}

/**
 * Update project team member references
 */
async function updateProjectReferences(correctLissaId) {
  try {
    console.log('🔄 Updating project team member references...');
    
    const db = admin.firestore();
    
    // Find projects where Lissa is a team member
    const projectsQuery = await db.collection('projects').get();
    
    let updatedProjects = 0;
    
    for (const projectDoc of projectsQuery.docs) {
      const projectData = projectDoc.data();
      const teamMembers = projectData.teamMembers || [];
      
      // Check if Lissa is in team members
      const lissaMembers = teamMembers.filter(tm => tm.email === 'lissa@apple.com');
      
      if (lissaMembers.length > 0) {
        console.log('📁 Found Lissa in project:', projectDoc.id, projectData.name);
        
        // Remove all Lissa entries and add one with correct ID
        const otherMembers = teamMembers.filter(tm => tm.email !== 'lissa@apple.com');
        
        // Add the correct Lissa entry
        const correctLissaEntry = {
          userId: correctLissaId,
          email: 'lissa@apple.com',
          name: 'Lissa Tuejenez',
          role: 'MEMBER',
          status: 'ACTIVE',
          addedAt: lissaMembers[0].addedAt || new Date(),
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: false,
            canManageMembers: false
          }
        };
        
        const updatedTeamMembers = [...otherMembers, correctLissaEntry];
        
        await projectDoc.ref.update({
          teamMembers: updatedTeamMembers,
          updatedAt: new Date()
        });
        
        console.log('✅ Updated project team members:', projectDoc.id);
        updatedProjects++;
      }
    }
    
    console.log('✅ Updated', updatedProjects, 'projects');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating project references:', error.message);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupDuplicateLissa() {
  console.log('🧹 Starting Lissa duplicate cleanup...\n');
  
  // Initialize Firebase
  const firebaseInitialized = await initializeFirebase();
  if (!firebaseInitialized) {
    console.error('❌ Cannot proceed without Firebase initialization');
    process.exit(1);
  }
  
  // Step 1: Find all Lissa accounts
  console.log('=== Step 1: Find All Lissa Accounts ===');
  const accounts = await findAllLissaAccounts();
  
  if (accounts.firestoreUsers.length === 0) {
    console.log('ℹ️ No Lissa accounts found in Firestore');
    process.exit(0);
  }
  
  if (accounts.firestoreUsers.length === 1) {
    console.log('ℹ️ Only one Lissa account found, no cleanup needed');
    
    // Still update project references to make sure they're correct
    console.log('\n=== Verifying Project References ===');
    await updateProjectReferences(accounts.firestoreUsers[0].id);
    
    process.exit(0);
  }
  
  // Step 2: Determine which account to keep
  console.log('\n=== Step 2: Determine Account to Keep ===');
  const accountToKeep = determineAccountToKeep(accounts.firestoreUsers);
  
  if (!accountToKeep) {
    console.error('❌ Could not determine which account to keep');
    process.exit(1);
  }
  
  // Step 3: Remove duplicate accounts
  console.log('\n=== Step 3: Remove Duplicate Accounts ===');
  const removalSuccess = await removeDuplicateAccounts(accounts.firestoreUsers, accountToKeep);
  
  if (!removalSuccess) {
    console.error('❌ Failed to remove duplicate accounts');
    process.exit(1);
  }
  
  // Step 4: Update project references
  console.log('\n=== Step 4: Update Project References ===');
  const updateSuccess = await updateProjectReferences(accountToKeep.id);
  
  if (!updateSuccess) {
    console.error('❌ Failed to update project references');
    process.exit(1);
  }
  
  console.log('\n✅ Cleanup completed successfully!');
  console.log('\n📋 Results:');
  console.log('👤 Kept Lissa account:', accountToKeep.id);
  console.log('📧 Email: lissa@apple.com');
  console.log('👥 Role:', accountToKeep.data.role);
  console.log('🏢 Organization ID:', accountToKeep.data.organizationId || 'None');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Verify Lissa can log in with her existing credentials');
  console.log('2. Check that she appears only once in the Cloud Projects page');
  console.log('3. Test project visibility for both enterprise.user@example.com and lissa@apple.com');
}

// Run the cleanup
cleanupDuplicateLissa().catch(console.error);
