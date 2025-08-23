/**
 * Offline Storage Manager
 * 
 * Provides utilities for storing and retrieving data offline.
 * Uses IndexedDB for offline storage to handle larger datasets.
 */

import { v4 as uuidv4 } from 'uuid';

// Define storage keys
const STORAGE_KEYS = {
  PENDING_PROJECTS: 'offline_pending_projects',
  SYNC_QUEUE: 'offline_sync_queue',
};

// Types
export interface OfflineProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  storageMode: 'local' | 'cloud' | 'hybrid';
  applicationMode: 'standalone' | 'shared_network';
  pendingSync: boolean;
  syncAttempts: number;
  lastSyncAttempt?: string;
  originalOptions: any;
}

export interface SyncQueueItem {
  id: string;
  type: 'project_create' | 'project_update' | 'project_delete';
  data: any;
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private dbName = 'backbone_offline_storage';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<boolean> | null = null;

  private constructor() {
    this.initPromise = this.initDatabase();
  }

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async initDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!window.indexedDB) {
          console.warn('IndexedDB not supported - offline storage will be limited');
          resolve(false);
          return;
        }

        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('projects')) {
            const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
            projectsStore.createIndex('pendingSync', 'pendingSync', { unique: false });
            projectsStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncQueueStore.createIndex('type', 'type', { unique: false });
            syncQueueStore.createIndex('createdAt', 'createdAt', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          console.log('✅ IndexedDB initialized for offline storage');
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to initialize IndexedDB:', event);
          resolve(false);
        };
      } catch (error) {
        console.error('❌ Error initializing IndexedDB:', error);
        resolve(false);
      }
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.db) return true;
    if (this.initPromise) return this.initPromise;
    return this.initDatabase();
  }

  /**
   * Store a project for offline use
   */
  public async storeOfflineProject(project: OfflineProject): Promise<string> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage if IndexedDB is not available
      try {
        const projects = this.getLocalStorageProjects();
        projects.push(project);
        localStorage.setItem(STORAGE_KEYS.PENDING_PROJECTS, JSON.stringify(projects));
        return project.id;
      } catch (error) {
        console.error('❌ Failed to store project in localStorage:', error);
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = store.put(project);

        request.onsuccess = () => {
          console.log('✅ Project stored offline:', project.id);
          resolve(project.id);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to store project offline:', event);
          reject(new Error('Failed to store project offline'));
        };
      } catch (error) {
        console.error('❌ Error storing project offline:', error);
        reject(error);
      }
    });
  }

  /**
   * Get all offline projects
   */
  public async getOfflineProjects(): Promise<OfflineProject[]> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      return this.getLocalStorageProjects();
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.getAll();

        request.onsuccess = (event) => {
          const projects = (event.target as IDBRequest).result as OfflineProject[];
          resolve(projects);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to get offline projects:', event);
          reject(new Error('Failed to get offline projects'));
        };
      } catch (error) {
        console.error('❌ Error getting offline projects:', error);
        reject(error);
      }
    });
  }

  /**
   * Get offline projects from localStorage (fallback)
   */
  private getLocalStorageProjects(): OfflineProject[] {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PENDING_PROJECTS);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error('❌ Failed to get projects from localStorage:', error);
      return [];
    }
  }

  /**
   * Get pending sync projects
   */
  public async getPendingSyncProjects(): Promise<OfflineProject[]> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      const projects = this.getLocalStorageProjects();
      return projects.filter(p => p.pendingSync);
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const index = store.index('pendingSync');
        const request = index.getAll(IDBKeyRange.only(true));

        request.onsuccess = (event) => {
          const projects = (event.target as IDBRequest).result as OfflineProject[];
          resolve(projects);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to get pending sync projects:', event);
          reject(new Error('Failed to get pending sync projects'));
        };
      } catch (error) {
        console.error('❌ Error getting pending sync projects:', error);
        reject(error);
      }
    });
  }

  /**
   * Mark a project as synced
   */
  public async markProjectSynced(projectId: string, onlineId?: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      try {
        const projects = this.getLocalStorageProjects();
        const updatedProjects = projects.map(p => {
          if (p.id === projectId) {
            return { ...p, pendingSync: false, onlineId };
          }
          return p;
        });
        localStorage.setItem(STORAGE_KEYS.PENDING_PROJECTS, JSON.stringify(updatedProjects));
      } catch (error) {
        console.error('❌ Failed to mark project as synced in localStorage:', error);
        throw error;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const getRequest = store.get(projectId);

        getRequest.onsuccess = (event) => {
          const project = (event.target as IDBRequest).result as OfflineProject;
          if (!project) {
            reject(new Error(`Project not found: ${projectId}`));
            return;
          }

          project.pendingSync = false;
          if (onlineId) {
            project.id = onlineId;
          }
          
          const updateRequest = store.put(project);
          updateRequest.onsuccess = () => {
            console.log('✅ Project marked as synced:', projectId);
            resolve();
          };
          
          updateRequest.onerror = (event) => {
            console.error('❌ Failed to mark project as synced:', event);
            reject(new Error('Failed to mark project as synced'));
          };
        };

        getRequest.onerror = (event) => {
          console.error('❌ Failed to get project for sync update:', event);
          reject(new Error('Failed to get project for sync update'));
        };
      } catch (error) {
        console.error('❌ Error marking project as synced:', error);
        reject(error);
      }
    });
  }

  /**
   * Add item to sync queue
   */
  public async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>): Promise<string> {
    await this.ensureInitialized();
    
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    
    if (!this.db) {
      // Fallback to localStorage
      try {
        const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        queue.push(queueItem);
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
        return queueItem.id;
      } catch (error) {
        console.error('❌ Failed to add to sync queue in localStorage:', error);
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.add(queueItem);

        request.onsuccess = () => {
          console.log('✅ Item added to sync queue:', queueItem.id);
          resolve(queueItem.id);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to add item to sync queue:', event);
          reject(new Error('Failed to add item to sync queue'));
        };
      } catch (error) {
        console.error('❌ Error adding item to sync queue:', error);
        reject(error);
      }
    });
  }

  /**
   * Get all sync queue items
   */
  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      try {
        const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        return queueJson ? JSON.parse(queueJson) : [];
      } catch (error) {
        console.error('❌ Failed to get sync queue from localStorage:', error);
        return [];
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        const request = store.getAll();

        request.onsuccess = (event) => {
          const queue = (event.target as IDBRequest).result as SyncQueueItem[];
          resolve(queue);
        };

        request.onerror = (event) => {
          console.error('❌ Failed to get sync queue:', event);
          reject(new Error('Failed to get sync queue'));
        };
      } catch (error) {
        console.error('❌ Error getting sync queue:', error);
        reject(error);
      }
    });
  }

  /**
   * Remove item from sync queue
   */
  public async removeFromSyncQueue(itemId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      try {
        const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        const updatedQueue = queue.filter((item: SyncQueueItem) => item.id !== itemId);
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
      } catch (error) {
        console.error('❌ Failed to remove from sync queue in localStorage:', error);
        throw error;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.delete(itemId);

        request.onsuccess = () => {
          console.log('✅ Item removed from sync queue:', itemId);
          resolve();
        };

        request.onerror = (event) => {
          console.error('❌ Failed to remove item from sync queue:', event);
          reject(new Error('Failed to remove item from sync queue'));
        };
      } catch (error) {
        console.error('❌ Error removing item from sync queue:', error);
        reject(error);
      }
    });
  }

  /**
   * Update sync attempt for queue item
   */
  public async updateSyncAttempt(itemId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.db) {
      // Fallback to localStorage
      try {
        const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        const updatedQueue = queue.map((item: SyncQueueItem) => {
          if (item.id === itemId) {
            return {
              ...item,
              attempts: (item.attempts || 0) + 1,
              lastAttempt: new Date().toISOString()
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
      } catch (error) {
        console.error('❌ Failed to update sync attempt in localStorage:', error);
        throw error;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const getRequest = store.get(itemId);

        getRequest.onsuccess = (event) => {
          const item = (event.target as IDBRequest).result as SyncQueueItem;
          if (!item) {
            reject(new Error(`Sync queue item not found: ${itemId}`));
            return;
          }

          item.attempts = (item.attempts || 0) + 1;
          item.lastAttempt = new Date().toISOString();
          
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => {
            console.log('✅ Sync attempt updated for item:', itemId);
            resolve();
          };
          
          updateRequest.onerror = (event) => {
            console.error('❌ Failed to update sync attempt:', event);
            reject(new Error('Failed to update sync attempt'));
          };
        };

        getRequest.onerror = (event) => {
          console.error('❌ Failed to get sync queue item:', event);
          reject(new Error('Failed to get sync queue item'));
        };
      } catch (error) {
        console.error('❌ Error updating sync attempt:', error);
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const offlineStorageManager = OfflineStorageManager.getInstance();

export default offlineStorageManager;
