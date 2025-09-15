/**
 * 🔥 FIREBASE FUNCTIONS - COLLECTION MANAGEMENT
 * 
 * Server-side functions for creating and managing Firebase collections
 * with proper security, indexing, and organization scoping.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * Create a new collection with proper schema validation
 */
exports.createCollection = onCall(async (request) => {
  try {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { collectionName, template, organizationId, createdBy, customFields } = request.data;

    // Validate required parameters
    if (!collectionName || !template || !organizationId || !createdBy) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Validate collection name
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collectionName)) {
      throw new HttpsError('invalid-argument', 'Invalid collection name format');
    }

    // Check if user has permission to create collections
    const hasPermission = await checkCollectionCreationPermission(request.auth.uid, organizationId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'User does not have permission to create collections');
    }

    // Check if collection already exists
    const existingCollection = await checkCollectionExists(collectionName, organizationId);
    if (existingCollection) {
      throw new HttpsError('already-exists', 'Collection already exists');
    }

    // Create collection metadata
    const collectionMetadata = {
      collectionName,
      template: template.name,
      displayName: template.displayName,
      description: template.description,
      organizationId,
      createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      schema: {
        fields: template.fields,
        indexes: template.indexes,
        securityRules: template.securityRules,
        organizationScoped: template.organizationScoped
      },
      customFields: customFields || [],
      isActive: true,
      version: '1.0.0'
    };

    // Store collection metadata
    await db.collection('collectionRegistry').doc(collectionName).set(collectionMetadata);

    // Create initial document to establish the collection
    const initialDocData = {
      id: 'collection-metadata',
      organizationId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
      isMetadataDocument: true,
      collectionTemplate: template.name,
      collectionVersion: '1.0.0'
    };

    // Add default values for required fields
    template.fields.forEach(field => {
      if (field.required && field.defaultValue !== undefined) {
        initialDocData[field.name] = field.defaultValue;
      }
    });

    // Add custom field defaults
    if (customFields) {
      customFields.forEach(field => {
        if (field.required && field.defaultValue !== undefined) {
          initialDocData[field.name] = field.defaultValue;
        }
      });
    }

    // Create the initial document
    await db.collection(collectionName).doc('collection-metadata').set(initialDocData);

    // Log the collection creation
    await logCollectionActivity(organizationId, 'COLLECTION_CREATED', {
      collectionName,
      template: template.name,
      createdBy,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Collection '${collectionName}' created successfully for organization '${organizationId}'`);

    return {
      success: true,
      collectionName,
      message: 'Collection created successfully'
    };

  } catch (error) {
    console.error('❌ Collection creation failed:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Collection creation failed');
  }
});

/**
 * Create Firestore indexes for a collection
 */
exports.createFirestoreIndexes = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { collectionName, indexConfig, organizationId } = request.data;

    // Validate parameters
    if (!collectionName || !indexConfig || !organizationId) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Check permissions
    const hasPermission = await checkCollectionManagementPermission(request.auth.uid, organizationId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'User does not have permission to manage indexes');
    }

    // Store index configuration for reference
    const indexMetadata = {
      collectionName,
      indexConfig,
      organizationId,
      createdBy: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      status: 'PENDING'
    };

    await db.collection('firestoreIndexes').doc(`${collectionName}_indexes`).set(indexMetadata);

    // Log the index creation request
    await logCollectionActivity(organizationId, 'INDEXES_REQUESTED', {
      collectionName,
      indexCount: indexConfig.indexes.length,
      createdBy: request.auth.uid,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Firestore indexes requested for collection '${collectionName}'`);

    return {
      success: true,
      message: 'Firestore indexes creation requested. Indexes will be created automatically.',
      indexCount: indexConfig.indexes.length
    };

  } catch (error) {
    console.error('❌ Firestore indexes creation failed:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Firestore indexes creation failed');
  }
});

/**
 * Update security rules for a collection
 */
exports.updateSecurityRules = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { collectionName, securityRules, organizationId } = request.data;

    // Validate parameters
    if (!collectionName || !securityRules || !organizationId) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Check permissions (only admins can update security rules)
    const hasPermission = await checkSecurityRulesPermission(request.auth.uid, organizationId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'User does not have permission to update security rules');
    }

    // Store security rules configuration
    const rulesMetadata = {
      collectionName,
      securityRules,
      organizationId,
      updatedBy: request.auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
      status: 'PENDING_DEPLOYMENT'
    };

    await db.collection('securityRules').doc(`${collectionName}_rules`).set(rulesMetadata);

    // Log the security rules update
    await logCollectionActivity(organizationId, 'SECURITY_RULES_UPDATED', {
      collectionName,
      updatedBy: request.auth.uid,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Security rules updated for collection '${collectionName}'`);

    return {
      success: true,
      message: 'Security rules updated successfully'
    };

  } catch (error) {
    console.error('❌ Security rules update failed:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Security rules update failed');
  }
});

/**
 * Get collection information and status
 */
exports.getCollectionInfo = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { collectionName, organizationId } = request.data;

    if (!collectionName || !organizationId) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Check permissions
    const hasPermission = await checkCollectionReadPermission(request.auth.uid, organizationId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'User does not have permission to read collection info');
    }

    // Get collection metadata
    const metadataDoc = await db.collection('collectionRegistry').doc(collectionName).get();
    
    if (!metadataDoc.exists) {
      throw new HttpsError('not-found', 'Collection not found');
    }

    const metadata = metadataDoc.data();

    // Get document count
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.where('organizationId', '==', organizationId).count().get();
    const documentCount = snapshot.data().count;

    // Get index status
    const indexDoc = await db.collection('firestoreIndexes').doc(`${collectionName}_indexes`).get();
    const indexStatus = indexDoc.exists ? indexDoc.data().status : 'NOT_CONFIGURED';

    // Get security rules status
    const rulesDoc = await db.collection('securityRules').doc(`${collectionName}_rules`).get();
    const rulesStatus = rulesDoc.exists ? rulesDoc.data().status : 'NOT_CONFIGURED';

    return {
      success: true,
      collection: {
        ...metadata,
        documentCount,
        indexStatus,
        rulesStatus
      }
    };

  } catch (error) {
    console.error('❌ Get collection info failed:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to get collection info');
  }
});

/**
 * List all collections for an organization
 */
exports.listOrganizationCollections = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { organizationId } = request.data;

    if (!organizationId) {
      throw new HttpsError('invalid-argument', 'Organization ID is required');
    }

    // Check permissions
    const hasPermission = await checkCollectionReadPermission(request.auth.uid, organizationId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'User does not have permission to list collections');
    }

    // Get all collections for the organization
    const collectionsSnapshot = await db.collection('collectionRegistry')
      .where('organizationId', '==', organizationId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const collections = [];
    
    for (const doc of collectionsSnapshot.docs) {
      const data = doc.data();
      
      // Get document count for each collection
      try {
        const collectionRef = db.collection(data.collectionName);
        const countSnapshot = await collectionRef
          .where('organizationId', '==', organizationId)
          .count()
          .get();
        
        collections.push({
          ...data,
          documentCount: countSnapshot.data().count
        });
      } catch (countError) {
        console.warn(`Failed to get document count for ${data.collectionName}:`, countError);
        collections.push({
          ...data,
          documentCount: 0
        });
      }
    }

    return {
      success: true,
      collections
    };

  } catch (error) {
    console.error('❌ List collections failed:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to list collections');
  }
});

// Helper Functions

/**
 * Check if a collection already exists
 */
async function checkCollectionExists(collectionName, organizationId) {
  try {
    const metadataDoc = await db.collection('collectionRegistry').doc(collectionName).get();
    
    if (metadataDoc.exists) {
      const data = metadataDoc.data();
      return data.organizationId === organizationId;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking collection existence:', error);
    return false;
  }
}

/**
 * Check if user has permission to create collections
 */
async function checkCollectionCreationPermission(userId, organizationId) {
  try {
    // Get user's role in the organization
    const teamMemberDoc = await db.collection('teamMembers')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();

    if (teamMemberDoc.empty) {
      return false;
    }

    const memberData = teamMemberDoc.docs[0].data();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN'];
    
    return allowedRoles.includes(memberData.role);
  } catch (error) {
    console.error('Error checking collection creation permission:', error);
    return false;
  }
}

/**
 * Check if user has permission to manage collections
 */
async function checkCollectionManagementPermission(userId, organizationId) {
  return await checkCollectionCreationPermission(userId, organizationId);
}

/**
 * Check if user has permission to update security rules
 */
async function checkSecurityRulesPermission(userId, organizationId) {
  try {
    const teamMemberDoc = await db.collection('teamMembers')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();

    if (teamMemberDoc.empty) {
      return false;
    }

    const memberData = teamMemberDoc.docs[0].data();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN'];
    
    return allowedRoles.includes(memberData.role);
  } catch (error) {
    console.error('Error checking security rules permission:', error);
    return false;
  }
}

/**
 * Check if user has permission to read collection info
 */
async function checkCollectionReadPermission(userId, organizationId) {
  try {
    const teamMemberDoc = await db.collection('teamMembers')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();

    if (teamMemberDoc.empty) {
      return false;
    }

    const memberData = teamMemberDoc.docs[0].data();
    
    // All active team members can read collection info
    return memberData.status === 'ACTIVE';
  } catch (error) {
    console.error('Error checking collection read permission:', error);
    return false;
  }
}

/**
 * Log collection activity for audit purposes
 */
async function logCollectionActivity(organizationId, activityType, details) {
  try {
    const activityLog = {
      organizationId,
      activityType,
      details,
      timestamp: FieldValue.serverTimestamp(),
      source: 'collection-management-function'
    };

    await db.collection('collectionActivityLogs').add(activityLog);
  } catch (error) {
    console.error('Error logging collection activity:', error);
    // Don't throw error for logging failures
  }
}
