/**
 * Offline Project Creation Test
 * 
 * This file provides a test utility for testing offline project creation
 * and synchronization functionality.
 */

import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { offlineStorageManager } from '../services/OfflineStorageManager';
import { syncService } from '../services/SyncService';
import { isOnline } from '../utils/NetworkUtils';

/**
 * Test offline project creation
 */
export async function testOfflineProjectCreation(): Promise<void> {
  console.log('🧪 Starting offline project creation test...');
  
  try {
    // Check current network status
    const online = isOnline();
    console.log(`🌐 Current network status: ${online ? 'Online' : 'Offline'}`);
    
    // Create a test project
    const projectName = `Test Project ${new Date().toISOString()}`;
    console.log(`📝 Creating test project: ${projectName}`);
    
    const cloudProject = await cloudProjectIntegration.createCloudProject({
      name: projectName,
      description: 'Test project for offline creation',
      storageMode: 'cloud',
      cloudConfig: {
        provider: 'firestore'
      },
      collaborationSettings: {
        maxCollaborators: 5,
        enableRealTime: true,
        enableComments: true,
        enableFileSharing: true
      }
    });
    
    if (!cloudProject || !cloudProject.id) {
      console.error('❌ Failed to create project - no project ID returned');
      return;
    }
    
    const projectId = cloudProject.id;
    console.log(`✅ Project created with ID: ${projectId}`);
    
    // Get the project
    const project = await cloudProjectIntegration.getProject(projectId);
    console.log('📊 Project details:', project);
    
    // Check if the project is offline
    const isOffline = projectId.startsWith('offline_');
    console.log(`📱 Project is ${isOffline ? 'offline' : 'online'}`);
    
    // If offline, try to sync
    if (isOffline) {
      console.log('🔄 Attempting to sync offline project...');
      const syncResult = await syncService.forceSyncNow();
      console.log(`🔄 Sync result: ${syncResult ? 'Success' : 'Failed'}`);
      
      // Check pending projects after sync
      const pendingProjects = await offlineStorageManager.getPendingSyncProjects();
      console.log(`📊 Pending projects after sync: ${pendingProjects.length}`);
    }
    
    // Get all projects
    const allProjects = await cloudProjectIntegration.getUserProjects();
    console.log(`📊 Total projects: ${allProjects.length}`);
    
    console.log('✅ Offline project creation test completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test offline project listing
 */
export async function testOfflineProjectListing(): Promise<void> {
  console.log('🧪 Starting offline project listing test...');
  
  try {
    // Get offline projects
    const offlineProjects = await offlineStorageManager.getOfflineProjects();
    console.log(`📊 Offline projects: ${offlineProjects.length}`);
    
    // Get all projects
    const allProjects = await cloudProjectIntegration.getUserProjects();
    console.log(`📊 Total projects: ${allProjects.length}`);
    
    // Log project details
    allProjects.forEach((project, index) => {
      console.log(`📁 Project ${index + 1}:`, {
        id: project.id,
        name: project.name,
        isOffline: project.id.startsWith('offline_'),
        pendingSync: (project as any).pendingSync || false
      });
    });
    
    console.log('✅ Offline project listing test completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Run all tests
 */
export async function runOfflineTests(): Promise<void> {
  console.log('🧪 Running all offline tests...');
  
  await testOfflineProjectListing();
  await testOfflineProjectCreation();
  await testOfflineProjectListing();
  
  console.log('✅ All offline tests completed');
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).testOfflineProjectCreation = testOfflineProjectCreation;
  (window as any).testOfflineProjectListing = testOfflineProjectListing;
  (window as any).runOfflineTests = runOfflineTests;
}

export default {
  testOfflineProjectCreation,
  testOfflineProjectListing,
  runOfflineTests
};
