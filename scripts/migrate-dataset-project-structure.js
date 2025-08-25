#!/usr/bin/env node

/**
 * Migration Script: Update Dataset Project Structure
 * 
 * This script migrates existing datasets from the old single projectId field
 * to the new multiple projectIds array structure to support multiple datasets per project.
 * 
 * Usage: node scripts/migrate-dataset-project-structure.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

// Firebase configuration - update with your project details
const firebaseConfig = {
  // Add your Firebase config here
  // This should match your project's configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateDatasetProjectStructure() {
  console.log('🚀 Starting dataset project structure migration...');
  
  try {
    // Get all datasets that still have the old projectId field
    const datasetsRef = collection(db, 'datasets');
    const datasetsSnapshot = await getDocs(datasetsRef);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const datasetDoc of datasetsSnapshot.docs) {
      const dataset = datasetDoc.data();
      
      // Check if dataset needs migration
      if (dataset.projectId && !dataset.projectIds) {
        try {
          console.log(`📝 Migrating dataset: ${dataset.name} (${datasetDoc.id})`);
          
          // Create new structure
          const updates = {
            projectIds: [dataset.projectId], // Convert single projectId to array
            primaryProjectId: dataset.projectId, // Set as primary for backward compatibility
            updatedAt: new Date().toISOString()
          };
          
          // Remove old field
          updates.projectId = null;
          
          // Update the document
          await updateDoc(doc(db, 'datasets', datasetDoc.id), updates);
          
          console.log(`✅ Successfully migrated dataset: ${dataset.name}`);
          migratedCount++;
          
        } catch (error) {
          console.error(`❌ Failed to migrate dataset ${dataset.name}:`, error);
          errorCount++;
        }
      } else {
        console.log(`⏭️  Skipping dataset ${dataset.name} - already migrated or no projectId`);
        skippedCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} datasets`);
    console.log(`⏭️  Skipped (already migrated): ${skippedCount} datasets`);
    console.log(`❌ Failed to migrate: ${errorCount} datasets`);
    console.log(`📝 Total processed: ${datasetsSnapshot.docs.length} datasets`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some datasets failed to migrate. Check the logs above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatasetProjectStructure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatasetProjectStructure };
