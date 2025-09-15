#!/usr/bin/env node

/**
 * 🚀 AUTOMATIC FIRESTORE INDEX CREATION
 * 
 * This script automatically creates Firestore indexes for dynamically created collections
 * based on their templates and usage patterns. It monitors the collectionRegistry and
 * creates indexes as needed.
 */

const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

/**
 * Collection templates with their index patterns
 */
const INDEX_TEMPLATES = {
  // Sessions & Workflows
  'sessions': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'projectId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'assignedTo', arrayConfig: 'CONTAINS' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    }
  ],
  
  'sessionTasks': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'sessionId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'assignedTo', order: 'ASCENDING' },
        { fieldPath: 'dueDate', order: 'ASCENDING' }
      ]
    }
  ],
  
  'mediaFiles': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'sessionId', order: 'ASCENDING' },
        { fieldPath: 'fileType', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'uploadedAt', order: 'DESCENDING' },
        { fieldPath: 'fileType', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'tags', arrayConfig: 'CONTAINS' },
        { fieldPath: 'uploadedAt', order: 'DESCENDING' }
      ]
    }
  ],
  
  'projects': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'projectManager', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    }
  ],
  
  'teamMembers': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'email', order: 'ASCENDING' },
        { fieldPath: 'role', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'department', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    }
  ],
  
  'inventoryItems': [
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'category', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'organizationId', order: 'ASCENDING' },
        { fieldPath: 'assignedTo', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    }
  ]
};

/**
 * Base indexes that every organization-scoped collection should have
 */
const BASE_INDEXES = [
  {
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' }
    ]
  }
];

/**
 * Monitor collection registry for new collections and create indexes
 */
async function monitorAndCreateIndexes() {
  console.log('🚀 Starting Firestore index automation...');
  
  try {
    // Get all registered collections
    const registrySnapshot = await db.collection('collectionRegistry')
      .where('isActive', '==', true)
      .get();
    
    console.log(`📋 Found ${registrySnapshot.size} registered collections`);
    
    for (const doc of registrySnapshot.docs) {
      const collectionData = doc.data();
      const collectionName = collectionData.collectionName;
      
      console.log(`🔍 Processing collection: ${collectionName}`);
      
      // Check if indexes already exist
      const existingIndexes = await getExistingIndexes(collectionName);
      
      // Generate required indexes
      const requiredIndexes = generateIndexesForCollection(collectionName, collectionData);
      
      // Create missing indexes
      const missingIndexes = findMissingIndexes(requiredIndexes, existingIndexes);
      
      if (missingIndexes.length > 0) {
        console.log(`📝 Creating ${missingIndexes.length} missing indexes for ${collectionName}`);
        await createIndexes(collectionName, missingIndexes);
      } else {
        console.log(`✅ All indexes exist for ${collectionName}`);
      }
    }
    
    console.log('🎉 Index automation completed successfully');
    
  } catch (error) {
    console.error('❌ Index automation failed:', error);
    throw error;
  }
}

/**
 * Generate indexes for a specific collection
 */
function generateIndexesForCollection(collectionName, collectionData) {
  const indexes = [];
  
  // Add base indexes for organization-scoped collections
  if (collectionData.schema?.organizationScoped !== false) {
    indexes.push(...BASE_INDEXES);
  }
  
  // Add template-specific indexes
  const templateIndexes = INDEX_TEMPLATES[collectionName] || INDEX_TEMPLATES[collectionData.template];
  if (templateIndexes) {
    indexes.push(...templateIndexes);
  }
  
  // Add custom indexes from schema
  if (collectionData.schema?.indexes) {
    indexes.push(...collectionData.schema.indexes.map(index => ({
      fields: index.fields.map(field => ({
        fieldPath: field.field,
        order: field.order === 'array-contains' ? undefined : field.order.toUpperCase(),
        arrayConfig: field.order === 'array-contains' ? 'CONTAINS' : undefined
      })).filter(field => field.order || field.arrayConfig)
    })));
  }
  
  // Add indexes for custom fields
  if (collectionData.customFields) {
    collectionData.customFields.forEach(field => {
      if (field.indexed && collectionData.schema?.organizationScoped !== false) {
        indexes.push({
          fields: [
            { fieldPath: 'organizationId', order: 'ASCENDING' },
            { fieldPath: field.name, order: 'ASCENDING' }
          ]
        });
      }
    });
  }
  
  return indexes;
}

/**
 * Get existing indexes for a collection (mock implementation)
 */
async function getExistingIndexes(collectionName) {
  try {
    // Check our index registry
    const indexDoc = await db.collection('firestoreIndexes').doc(`${collectionName}_indexes`).get();
    
    if (indexDoc.exists) {
      const data = indexDoc.data();
      return data.indexConfig?.indexes || [];
    }
    
    return [];
  } catch (error) {
    console.warn(`⚠️ Could not get existing indexes for ${collectionName}:`, error);
    return [];
  }
}

/**
 * Find missing indexes by comparing required vs existing
 */
function findMissingIndexes(requiredIndexes, existingIndexes) {
  const missing = [];
  
  for (const required of requiredIndexes) {
    const exists = existingIndexes.some(existing => 
      indexesMatch(required, existing)
    );
    
    if (!exists) {
      missing.push(required);
    }
  }
  
  return missing;
}

/**
 * Check if two index configurations match
 */
function indexesMatch(index1, index2) {
  if (!index1.fields || !index2.fields) return false;
  if (index1.fields.length !== index2.fields.length) return false;
  
  return index1.fields.every((field1, i) => {
    const field2 = index2.fields[i];
    return field1.fieldPath === field2.fieldPath &&
           field1.order === field2.order &&
           field1.arrayConfig === field2.arrayConfig;
  });
}

/**
 * Create indexes for a collection
 */
async function createIndexes(collectionName, indexes) {
  try {
    const indexConfig = {
      indexes: indexes.map(index => ({
        collectionGroup: collectionName,
        queryScope: 'COLLECTION',
        fields: index.fields
      }))
    };
    
    // Store index configuration in registry
    await db.collection('firestoreIndexes').doc(`${collectionName}_indexes`).set({
      collectionName,
      indexConfig,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'CREATED',
      indexCount: indexes.length
    });
    
    // Also save to local file for Firebase CLI deployment
    await saveIndexesToFile(collectionName, indexConfig);
    
    console.log(`✅ Created ${indexes.length} indexes for ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Failed to create indexes for ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Save indexes to a file for Firebase CLI deployment
 */
async function saveIndexesToFile(collectionName, indexConfig) {
  try {
    const indexesDir = path.join(__dirname, '../indexes');
    
    // Ensure directory exists
    try {
      await fs.access(indexesDir);
    } catch {
      await fs.mkdir(indexesDir, { recursive: true });
    }
    
    const filePath = path.join(indexesDir, `${collectionName}-indexes.json`);
    await fs.writeFile(filePath, JSON.stringify(indexConfig, null, 2));
    
    console.log(`📄 Saved indexes to ${filePath}`);
  } catch (error) {
    console.warn(`⚠️ Could not save indexes to file:`, error);
  }
}

/**
 * Watch for new collections and auto-create indexes
 */
async function watchForNewCollections() {
  console.log('👀 Watching for new collections...');
  
  const unsubscribe = db.collection('collectionRegistry')
    .where('isActive', '==', true)
    .onSnapshot(async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const collectionData = change.doc.data();
          const collectionName = collectionData.collectionName;
          
          console.log(`🆕 New collection detected: ${collectionName}`);
          
          try {
            // Generate and create indexes for the new collection
            const requiredIndexes = generateIndexesForCollection(collectionName, collectionData);
            
            if (requiredIndexes.length > 0) {
              console.log(`📝 Creating ${requiredIndexes.length} indexes for new collection ${collectionName}`);
              await createIndexes(collectionName, requiredIndexes);
            }
          } catch (error) {
            console.error(`❌ Failed to create indexes for new collection ${collectionName}:`, error);
          }
        }
      }
    }, (error) => {
      console.error('❌ Error watching collections:', error);
    });
  
  // Return unsubscribe function
  return unsubscribe;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  
  try {
    switch (command) {
      case 'monitor':
        await monitorAndCreateIndexes();
        break;
        
      case 'watch':
        const unsubscribe = await watchForNewCollections();
        console.log('Press Ctrl+C to stop watching...');
        
        // Keep process alive
        process.on('SIGINT', () => {
          console.log('\n👋 Stopping watcher...');
          unsubscribe();
          process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {}, 1000);
        break;
        
      case 'collection':
        const collectionName = args[1];
        if (!collectionName) {
          console.error('❌ Collection name required');
          process.exit(1);
        }
        
        // Create indexes for specific collection
        const collectionDoc = await db.collection('collectionRegistry').doc(collectionName).get();
        if (!collectionDoc.exists) {
          console.error(`❌ Collection ${collectionName} not found in registry`);
          process.exit(1);
        }
        
        const collectionData = collectionDoc.data();
        const requiredIndexes = generateIndexesForCollection(collectionName, collectionData);
        
        if (requiredIndexes.length > 0) {
          await createIndexes(collectionName, requiredIndexes);
        } else {
          console.log(`ℹ️ No indexes required for ${collectionName}`);
        }
        break;
        
      default:
        console.log(`
Usage: node autoCreateIndexes.js [command] [options]

Commands:
  monitor     - Check all registered collections and create missing indexes (default)
  watch       - Watch for new collections and auto-create indexes
  collection  - Create indexes for a specific collection
  
Examples:
  node autoCreateIndexes.js monitor
  node autoCreateIndexes.js watch
  node autoCreateIndexes.js collection sessions
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  monitorAndCreateIndexes,
  watchForNewCollections,
  generateIndexesForCollection,
  createIndexes
};
