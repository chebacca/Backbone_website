#!/usr/bin/env node

/**
 * 🚨 CRITICAL MIGRATION: Fix Dataset Assignment Collection Data
 * 
 * This script migrates existing project_datasets assignments to include
 * the collection assignment data that the Dashboard app expects.
 * 
 * The Dashboard app reads dataset assignments from the project_datasets collection
 * and expects to find:
 * - assignedCollections: array of collection names
 * - collectionAssignment: object with selectedCollections
 * - organizationId: for tenant isolation
 * - tenantId: for tenant isolation
 * - isActive: boolean flag
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

async function migrateDatasetAssignments() {
  console.log('🚀 Starting dataset assignment migration...');
  
  try {
    // Get all project_datasets assignments
    const projectDatasetsSnapshot = await db.collection('project_datasets').get();
    console.log(`📋 Found ${projectDatasetsSnapshot.size} project_datasets assignments to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const assignmentDoc of projectDatasetsSnapshot.docs) {
      try {
        const assignmentData = assignmentDoc.data();
        const assignmentId = assignmentDoc.id;
        
        console.log(`🔍 Processing assignment ${assignmentId}:`, {
          projectId: assignmentData.projectId,
          datasetId: assignmentData.datasetId,
          hasCollections: !!assignmentData.assignedCollections,
          hasCollectionAssignment: !!assignmentData.collectionAssignment
        });
        
        // Skip if already migrated
        if (assignmentData.assignedCollections && assignmentData.collectionAssignment) {
          console.log(`⏭️  Skipping ${assignmentId} - already migrated`);
          skippedCount++;
          continue;
        }
        
        // Get the dataset to extract collection data
        const datasetDoc = await db.collection('datasets').doc(assignmentData.datasetId).get();
        
        if (!datasetDoc.exists) {
          console.error(`❌ Dataset ${assignmentData.datasetId} not found for assignment ${assignmentId}`);
          errorCount++;
          continue;
        }
        
        const datasetData = datasetDoc.data();
        
        // Get the project to extract organization data
        const projectDoc = await db.collection('projects').doc(assignmentData.projectId).get();
        
        if (!projectDoc.exists) {
          console.error(`❌ Project ${assignmentData.projectId} not found for assignment ${assignmentId}`);
          errorCount++;
          continue;
        }
        
        const projectData = projectDoc.data();
        
        // Extract collection assignments from dataset
        const collections = datasetData.collections || 
                          datasetData.collectionAssignment?.selectedCollections || 
                          [];
        
        const organizationId = projectData.organizationId || projectData.organization_id;
        
        console.log(`🔧 Migrating assignment ${assignmentId}:`, {
          collections,
          organizationId
        });
        
        // Update the assignment with collection data
        await assignmentDoc.ref.update({
          assignedCollections: collections,
          collectionAssignment: {
            selectedCollections: collections,
            assignmentMode: 'EXCLUSIVE',
            priority: 1,
            routingEnabled: true
          },
          organizationId: organizationId,
          tenantId: organizationId,
          isActive: true,
          updatedAt: new Date()
        });
        
        console.log(`✅ Migrated assignment ${assignmentId}`);
        migratedCount++;
        
      } catch (assignmentError) {
        console.error(`❌ Error migrating assignment ${assignmentDoc.id}:`, assignmentError);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${migratedCount + skippedCount + errorCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateDatasetAssignments()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
