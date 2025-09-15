/**
 * 🔥 FIREBASE COLLECTION CREATOR
 * 
 * Handles the actual creation of Firebase collections with proper indexes,
 * security rules, and organization scoping. Integrates with Firebase Functions
 * to ensure proper setup.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from './firebase';
import { CollectionTemplate, CollectionField } from './CollectionSchemaService';

interface CollectionCreationRequest {
  name: string;
  template: CollectionTemplate;
  organizationId: string;
  createdBy: string;
  customFields?: CollectionField[];
}

interface CollectionCreationResult {
  success: boolean;
  collectionName?: string;
  error?: string;
  details?: {
    collectionCreated: boolean;
    indexesCreated: boolean;
    securityRulesUpdated: boolean;
    initialDocumentCreated: boolean;
  };
}

export class FirebaseCollectionCreator {
  private functions = getFunctions();
  private createCollectionFunction = httpsCallable(this.functions, 'createCollection');
  private updateSecurityRulesFunction = httpsCallable(this.functions, 'updateSecurityRules');
  private createFirestoreIndexesFunction = httpsCallable(this.functions, 'createFirestoreIndexes');

  /**
   * Check if a collection already exists
   */
  async checkCollectionExists(collectionName: string, organizationId?: string): Promise<boolean> {
    try {
      const collectionRef = collection(db, collectionName);
      let testQuery;
      
      if (organizationId) {
        testQuery = query(
          collectionRef, 
          where('organizationId', '==', organizationId),
          limit(1)
        );
      } else {
        testQuery = query(collectionRef, limit(1));
      }
      
      const snapshot = await getDocs(testQuery);
      return !snapshot.empty;
    } catch (error) {
      console.warn('Error checking collection existence:', error);
      return false;
    }
  }

  /**
   * Create a new collection with all necessary components
   */
  async createCollection(request: CollectionCreationRequest): Promise<CollectionCreationResult> {
    try {
      console.log('🚀 Creating collection:', request.name);

      // Step 1: Validate the request
      const validation = this.validateCreationRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Step 2: Check if collection already exists
      const exists = await this.checkCollectionExists(request.name, request.organizationId);
      if (exists) {
        return {
          success: false,
          error: 'Collection already exists'
        };
      }

      // Step 3: Create the collection structure
      const collectionResult = await this.createCollectionStructure(request);
      if (!collectionResult.success) {
        return collectionResult;
      }

      // Step 4: Create Firestore indexes
      const indexResult = await this.createFirestoreIndexes(request);
      
      // Step 5: Update security rules
      const securityResult = await this.updateSecurityRules(request);

      // Step 6: Create initial document to establish collection
      const docResult = await this.createInitialDocument(request);

      return {
        success: true,
        collectionName: request.name,
        details: {
          collectionCreated: collectionResult.success,
          indexesCreated: indexResult.success,
          securityRulesUpdated: securityResult.success,
          initialDocumentCreated: docResult.success
        }
      };

    } catch (error: any) {
      console.error('Collection creation failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate the collection creation request
   */
  private validateCreationRequest(request: CollectionCreationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.name || !request.name.trim()) {
      errors.push('Collection name is required');
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(request.name)) {
      errors.push('Collection name must start with a letter and contain only letters, numbers, and underscores');
    }

    if (!request.template) {
      errors.push('Collection template is required');
    }

    if (!request.organizationId) {
      errors.push('Organization ID is required');
    }

    if (!request.createdBy) {
      errors.push('Creator user ID is required');
    }

    // Validate custom fields if provided
    if (request.customFields) {
      request.customFields.forEach((field, index) => {
        if (!field.name || !field.name.trim()) {
          errors.push(`Custom field ${index + 1}: name is required`);
        }
        if (!field.type) {
          errors.push(`Custom field ${index + 1}: type is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create the collection structure using Firebase Functions
   */
  private async createCollectionStructure(request: CollectionCreationRequest): Promise<CollectionCreationResult> {
    try {
      // Use Firebase Function to create collection with proper server-side validation
      const result = await this.createCollectionFunction({
        collectionName: request.name,
        template: request.template,
        organizationId: request.organizationId,
        createdBy: request.createdBy,
        customFields: request.customFields
      });

      const data = result.data as any;
      
      if (data.success) {
        console.log('✅ Collection structure created successfully');
        return { success: true };
      } else {
        console.error('❌ Collection structure creation failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Failed to create collection structure' 
        };
      }
    } catch (error: any) {
      console.error('❌ Collection structure creation error:', error);
      
      // Fallback: Create collection locally if Firebase Function is not available
      console.log('🔄 Attempting local collection creation as fallback...');
      return await this.createCollectionLocally(request);
    }
  }

  /**
   * Fallback method to create collection locally
   */
  private async createCollectionLocally(request: CollectionCreationRequest): Promise<CollectionCreationResult> {
    try {
      // Create a metadata document for the collection
      const metadataDoc = {
        collectionName: request.name,
        template: request.template.name,
        organizationId: request.organizationId,
        createdBy: request.createdBy,
        createdAt: Timestamp.now(),
        schema: {
          fields: request.template.fields,
          indexes: request.template.indexes,
          securityRules: request.template.securityRules
        },
        customFields: request.customFields || [],
        isActive: true
      };

      // Store metadata in a special collections registry
      const metadataRef = doc(db, 'collectionRegistry', request.name);
      await setDoc(metadataRef, metadataDoc);

      console.log('✅ Collection metadata created locally');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Local collection creation failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create collection locally' 
      };
    }
  }

  /**
   * Create Firestore indexes for the collection
   */
  private async createFirestoreIndexes(request: CollectionCreationRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate index configuration
      const indexConfig = {
        indexes: request.template.indexes.map(index => ({
          collectionGroup: request.name,
          queryScope: index.queryScope,
          fields: index.fields.map(field => ({
            fieldPath: field.field,
            order: field.order === 'array-contains' ? undefined : field.order.toUpperCase(),
            arrayConfig: field.order === 'array-contains' ? 'CONTAINS' : undefined
          })).filter(field => field.order || field.arrayConfig)
        }))
      };

      // Use Firebase Function to create indexes
      const result = await this.createFirestoreIndexesFunction({
        collectionName: request.name,
        indexConfig: indexConfig,
        organizationId: request.organizationId
      });

      const data = result.data as any;
      
      if (data.success) {
        console.log('✅ Firestore indexes created successfully');
        return { success: true };
      } else {
        console.warn('⚠️ Firestore indexes creation failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Failed to create Firestore indexes' 
        };
      }
    } catch (error: any) {
      console.warn('⚠️ Firestore indexes creation error:', error);
      // Indexes are not critical for basic functionality
      return { 
        success: false, 
        error: error.message || 'Failed to create Firestore indexes' 
      };
    }
  }

  /**
   * Update Firebase security rules for the collection
   */
  private async updateSecurityRules(request: CollectionCreationRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate security rules
      const securityRules = this.generateSecurityRules(request.name, request.template);

      // Use Firebase Function to update security rules
      const result = await this.updateSecurityRulesFunction({
        collectionName: request.name,
        securityRules: securityRules,
        organizationId: request.organizationId
      });

      const data = result.data as any;
      
      if (data.success) {
        console.log('✅ Security rules updated successfully');
        return { success: true };
      } else {
        console.warn('⚠️ Security rules update failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Failed to update security rules' 
        };
      }
    } catch (error: any) {
      console.warn('⚠️ Security rules update error:', error);
      // Security rules update is not critical for basic functionality
      return { 
        success: false, 
        error: error.message || 'Failed to update security rules' 
      };
    }
  }

  /**
   * Create an initial document to establish the collection
   */
  private async createInitialDocument(request: CollectionCreationRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Create initial document data based on template
      const initialData: any = {
        id: 'initial-doc',
        organizationId: request.organizationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: request.createdBy,
        isInitialDocument: true,
        collectionTemplate: request.template.name
      };

      // Add default values for required fields
      request.template.fields.forEach(field => {
        if (field.required && field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });

      // Add custom field defaults
      if (request.customFields) {
        request.customFields.forEach(field => {
          if (field.required && field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          }
        });
      }

      // Create the document
      const docRef = doc(db, request.name, 'initial-doc');
      await setDoc(docRef, initialData);

      console.log('✅ Initial document created successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Initial document creation failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create initial document' 
      };
    }
  }

  /**
   * Generate security rules for a collection
   */
  private generateSecurityRules(collectionName: string, template: CollectionTemplate): string {
    const readRoles = template.securityRules.read.map(role => `'${role}'`).join(', ');
    const writeRoles = template.securityRules.write.map(role => `'${role}'`).join(', ');

    return `
    // ${template.displayName} Collection - Auto-generated
    match /${collectionName}/{docId} {
      allow read: if isAuthenticated() && 
        belongsToOrganization(resource.data.organizationId) &&
        hasAnyRole([${readRoles}]);
      
      allow write: if isAuthenticated() && 
        belongsToOrganization(request.resource.data.organizationId) &&
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
      
      allow create: if isAuthenticated() && 
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
    }`;
  }

  /**
   * Get collection creation status
   */
  async getCollectionStatus(collectionName: string, organizationId: string): Promise<{
    exists: boolean;
    hasDocuments: boolean;
    hasMetadata: boolean;
    documentCount?: number;
  }> {
    try {
      // Check if collection has documents
      const collectionRef = collection(db, collectionName);
      const docsQuery = query(
        collectionRef,
        where('organizationId', '==', organizationId),
        limit(10)
      );
      const docsSnapshot = await getDocs(docsQuery);
      
      // Check if metadata exists
      const metadataRef = doc(db, 'collectionRegistry', collectionName);
      const metadataDoc = await getDoc(metadataRef);

      return {
        exists: !docsSnapshot.empty || metadataDoc.exists(),
        hasDocuments: !docsSnapshot.empty,
        hasMetadata: metadataDoc.exists(),
        documentCount: docsSnapshot.size
      };
    } catch (error) {
      console.error('Error checking collection status:', error);
      return {
        exists: false,
        hasDocuments: false,
        hasMetadata: false
      };
    }
  }

  /**
   * Delete a collection (admin only)
   */
  async deleteCollection(collectionName: string, organizationId: string): Promise<CollectionCreationResult> {
    try {
      // This would typically be handled by a Firebase Function with proper admin permissions
      console.warn('Collection deletion should be handled by Firebase Functions with admin permissions');
      
      return {
        success: false,
        error: 'Collection deletion must be performed by an administrator through Firebase Functions'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete collection'
      };
    }
  }
}

export default FirebaseCollectionCreator;
