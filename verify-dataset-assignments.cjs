#!/usr/bin/env node

/**
 * 🔍 VERIFICATION: Test Dataset Assignment Reading
 * 
 * This script verifies that the Dashboard app can properly read
 * dataset assignments with collection data from the project_datasets collection.
 * 
 * It simulates the same query that the Dashboard's ProjectDatasetFilterService uses.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables (same as licensing website)
if (!admin.apps.length) {
  const isCloudFunctionsEnv = Boolean(
    process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG
  );
  
  // Try to use Application Default Credentials first (gcloud auth application-default login)
  const hasApplicationDefaultCreds = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT);
  
  if (isCloudFunctionsEnv || hasApplicationDefaultCreds) {
    // In Cloud Functions/Run or with Application Default Credentials, use those
    const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';
    admin.initializeApp({ projectId });
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !rawKey) {
      console.error('❌ Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY.');
      console.error('💡 Run "gcloud auth application-default login" to use Application Default Credentials.');
      process.exit(1);
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');
    admin.initializeApp({ 
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
  }
}

const db = admin.firestore();

async function verifyDatasetAssignments() {
  console.log('🔍 Verifying dataset assignments for Dashboard compatibility...');
  
  try {
    // Get all projects
    const projectsSnapshot = await db.collection('projects').get();
    console.log(`📋 Found ${projectsSnapshot.size} projects to verify`);
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      const projectId = projectDoc.id;
      const organizationId = projectData.organizationId || projectData.organization_id;
      
      console.log(`\n🔍 Verifying project: ${projectData.name} (${projectId})`);
      console.log(`   Organization: ${organizationId}`);
      
      // Query project_datasets collection (same as Dashboard)
      const projectDatasetQuery = await db.collection('project_datasets')
        .where('projectId', '==', projectId)
        .get();
      
      console.log(`   📊 Found ${projectDatasetQuery.size} dataset assignments`);
      
      if (projectDatasetQuery.empty) {
        console.log(`   ⚠️  No dataset assignments found for this project`);
        continue;
      }
      
      // Process each assignment (same as Dashboard)
      for (const linkDoc of projectDatasetQuery.docs) {
        const linkData = linkDoc.data();
        
        console.log(`   🔗 Dataset assignment: ${linkData.datasetId}`);
        console.log(`      - assignedCollections: ${JSON.stringify(linkData.assignedCollections || [])}`);
        console.log(`      - collectionAssignment: ${JSON.stringify(linkData.collectionAssignment || {})}`);
        console.log(`      - organizationId: ${linkData.organizationId}`);
        console.log(`      - tenantId: ${linkData.tenantId}`);
        console.log(`      - isActive: ${linkData.isActive}`);
        
        // Verify required fields for Dashboard compatibility
        const hasCollections = linkData.assignedCollections && linkData.assignedCollections.length > 0;
        const hasCollectionAssignment = linkData.collectionAssignment && linkData.collectionAssignment.selectedCollections;
        const hasOrganizationId = !!linkData.organizationId;
        const hasTenantId = !!linkData.tenantId;
        const isActive = linkData.isActive === true;
        
        console.log(`      ✅ Collections: ${hasCollections ? 'YES' : 'NO'}`);
        console.log(`      ✅ Collection Assignment: ${hasCollectionAssignment ? 'YES' : 'NO'}`);
        console.log(`      ✅ Organization ID: ${hasOrganizationId ? 'YES' : 'NO'}`);
        console.log(`      ✅ Tenant ID: ${hasTenantId ? 'YES' : 'NO'}`);
        console.log(`      ✅ Active: ${isActive ? 'YES' : 'NO'}`);
        
        // Check if Dashboard would be able to read this assignment
        const dashboardCompatible = hasCollections && hasCollectionAssignment && hasOrganizationId && hasTenantId && isActive;
        console.log(`      🎯 Dashboard Compatible: ${dashboardCompatible ? 'YES' : 'NO'}`);
        
        if (!dashboardCompatible) {
          console.log(`      ❌ MISSING DATA - Dashboard will not be able to read this assignment properly`);
        }
        
        // Get the actual dataset to verify collection data matches
        try {
          const datasetDoc = await db.collection('datasets').doc(linkData.datasetId).get();
          
          if (datasetDoc.exists) {
            const datasetData = datasetDoc.data();
            const datasetCollections = datasetData.collections || datasetData.collectionAssignment?.selectedCollections || [];
            
            console.log(`      📁 Dataset collections: ${JSON.stringify(datasetCollections)}`);
            
            // Check if assignment collections match dataset collections
            const collectionsMatch = JSON.stringify(linkData.assignedCollections || []) === JSON.stringify(datasetCollections);
            console.log(`      🔄 Collections Match: ${collectionsMatch ? 'YES' : 'NO'}`);
            
            if (!collectionsMatch) {
              console.log(`      ⚠️  WARNING: Assignment collections don't match dataset collections`);
            }
          } else {
            console.log(`      ❌ Dataset ${linkData.datasetId} not found`);
          }
        } catch (datasetError) {
          console.log(`      ❌ Error loading dataset: ${datasetError.message}`);
        }
      }
    }
    
    console.log('\n🎉 Verification completed!');
    console.log('📊 Check the output above to see which assignments are Dashboard-compatible');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
verifyDatasetAssignments()
  .then(() => {
    console.log('✅ Verification script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });
