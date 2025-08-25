/**
 * FirestoreAdapter - Abstracts Firestore operations
 */
import { BaseEntity } from '../models/types';

export class FirestoreAdapter {
  private static instance: FirestoreAdapter;
  private db: any;
  private auth: any;

  // Helper functions for array operations
  public static arrayUnion(value: any) {
    return { _method: 'arrayUnion', value };
  }

  public static arrayRemove(value: any) {
    return { _method: 'arrayRemove', value };
  }

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): FirestoreAdapter {
    if (!FirestoreAdapter.instance) {
      FirestoreAdapter.instance = new FirestoreAdapter();
    }
    return FirestoreAdapter.instance;
  }

  /**
   * Initialize Firestore adapter
   */
  public async initialize(): Promise<void> {
    const firebase = await import('../firebase');
    this.db = firebase.db;
    this.auth = firebase.auth;
  }

  /**
   * Get the current authenticated user
   */
  public getCurrentUser(): any {
    return this.auth?.currentUser;
  }

  /**
   * Get a document by ID from a collection
   */
  public async getDocumentById<T extends BaseEntity>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...this.convertFirestoreDates(data)
        } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error getting document ${docId} from ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Query documents from a collection
   */
  public async queryDocuments<T extends BaseEntity>(
    collectionName: string,
    queryConditions: Array<{
      field: string;
      operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
      value: any;
    }> = []
  ): Promise<T[]> {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const collRef = collection(this.db, collectionName);
      
      // Build query with conditions
      let queryRef;
      if (queryConditions.length > 0) {
        let conditions = [];
        
        for (const condition of queryConditions) {
          conditions.push(where(condition.field, condition.operator, condition.value));
        }
        
        queryRef = query(collRef, ...conditions);
      } else {
        queryRef = query(collRef);
      }
      
      const snapshot = await getDocs(queryRef);
      const results: T[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        results.push({
          id: doc.id,
          ...this.convertFirestoreDates(data)
        } as T);
      });
      
      return results;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error querying ${collectionName}:`, error);
      return [];
    }
  }

  /**
   * Create a document in a collection
   */
  public async createDocument<T extends BaseEntity>(
    collectionName: string,
    data: Omit<T, 'id'>
  ): Promise<T | null> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      
      const cleanedData = this.cleanDocumentData({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const docRef = await addDoc(collection(this.db, collectionName), cleanedData);
      
      return {
        id: docRef.id,
        ...cleanedData
      } as T;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error creating document in ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Update a document in a collection with array operations
   */
  public async updateDocumentWithArrayOps<T extends BaseEntity>(
    collectionName: string,
    docId: string,
    data: Record<string, any>
  ): Promise<boolean> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { arrayUnion, arrayRemove } = await import('firebase/firestore');
      
      // Process array operations
      const processedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && value._method === 'arrayUnion') {
          processedData[key] = arrayUnion(value.value);
        } else if (value && typeof value === 'object' && value._method === 'arrayRemove') {
          processedData[key] = arrayRemove(value.value);
        } else {
          processedData[key] = value;
        }
      }
      
      const cleanedData = this.cleanDocumentData({
        ...processedData,
        updatedAt: new Date()
      });
      
      await updateDoc(doc(this.db, collectionName, docId), cleanedData);
      return true;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error updating document ${docId} in ${collectionName} with array ops:`, error);
      return false;
    }
  }

  /**
   * Update a document in a collection
   */
  public async updateDocument<T extends BaseEntity>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<boolean> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const cleanedData = this.cleanDocumentData({
        ...data,
        updatedAt: new Date()
      });
      
      await updateDoc(doc(this.db, collectionName, docId), cleanedData);
      return true;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error updating document ${docId} in ${collectionName}:`, error);
      return false;
    }
  }

  /**
   * Delete a document from a collection
   */
  public async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(this.db, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`❌ [FirestoreAdapter] Error deleting document ${docId} from ${collectionName}:`, error);
      return false;
    }
  }

  /**
   * Clean document data for Firestore (remove undefined values)
   */
  private cleanDocumentData(data: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values
      if (value === undefined) continue;
      
      // Handle null values
      if (value === null) {
        cleaned[key] = null;
        continue;
      }
      
      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = this.cleanDocumentData(value);
        continue;
      }
      
      // Handle all other values
      cleaned[key] = value;
    }
    
    return cleaned;
  }

  /**
   * Convert Firestore timestamps to ISO strings
   */
  private convertFirestoreDates(data: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
        // Convert Firestore timestamp to ISO string
        converted[key] = value.toDate().toISOString();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects
        converted[key] = this.convertFirestoreDates(value);
      } else {
        // Keep other values as is
        converted[key] = value;
      }
    }
    
    return converted;
  }
}
