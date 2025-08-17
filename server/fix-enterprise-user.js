#!/usr/bin/env node

/**
 * Fix Enterprise User Script
 * This script fixes the enterprise.user@example.com password and ensures proper project access
 */

import { firestoreService } from './src/services/firestoreService.js';
import { PasswordUtil } from './src/utils/password.js';
import { logger } from './src/utils/logger.js';

async function fixEnterpriseUser() {
  try {
    console.log('🔧 Fixing enterprise user credentials and project access...');
    
    // Find the enterprise user
    const user = await firestoreService.getUserByEmail('enterprise.user@example.com');
    
    if (!user) {
      console.log('❌ Enterprise user not found. Creating new user...');
      
      // Create the user with correct password
      const hashedPassword = await PasswordUtil.hash('Admin1234!');
      const newUser = await firestoreService.createUser({
        email: 'enterprise.user@example.com',
        name: 'Enterprise User',
        password: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: false,
        termsAcceptedAt: new Date(),
        termsVersionAccepted: 'v1',
        privacyPolicyAcceptedAt: new Date(),
        privacyPolicyVersionAccepted: 'v1',
        identityVerified: false,
        kycStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ Created enterprise user:', newUser.id);
      
      // Create enterprise organization
      const org = await firestoreService.createOrganization({
        name: 'Enterprise User Org',
        ownerUserId: newUser.id,
        tier: 'ENTERPRISE'
      });
      
      // Add user as owner of the organization
      await firestoreService.createOrgMember({
        orgId: org.id,
        email: 'enterprise.user@example.com',
        userId: newUser.id,
        role: 'OWNER',
        status: 'ACTIVE',
        seatReserved: true,
        invitedAt: new Date(),
        joinedAt: new Date()
      });
      
      console.log('✅ Created enterprise organization:', org.id);
      
    } else {
      console.log('✅ Enterprise user found:', user.id);
      
      // Update password to Admin1234!
      const hashedPassword = await PasswordUtil.hash('Admin1234!');
      await firestoreService.updateUser(user.id, {
        password: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        updatedAt: new Date()
      });
      
      console.log('✅ Updated enterprise user password to Admin1234!');
    }
    
    // Create some sample projects for the enterprise user
    const updatedUser = await firestoreService.getUserByEmail('enterprise.user@example.com');
    if (updatedUser) {
      await createSampleProjects(updatedUser.id);
    }
    
    console.log('🎉 Enterprise user fix completed successfully!');
    console.log('📧 Email: enterprise.user@example.com');
    console.log('🔑 Password: Admin1234!');
    
  } catch (error) {
    console.error('❌ Error fixing enterprise user:', error);
    process.exit(1);
  }
}

async function createSampleProjects(userId) {
  try {
    console.log('📁 Creating sample projects for enterprise user...');
    
    const projects = [
      {
        name: 'Enterprise Production Project',
        description: 'Main production project for enterprise team',
        type: 'networked',
        visibility: 'organization',
        applicationMode: 'shared_network',
        ownerId: userId,
        isActive: true,
        isArchived: false,
        settings: {
          allowCollaboration: true,
          maxCollaborators: 50,
          realTimeEnabled: true,
          cloudConfig: {
            provider: 'firebase',
            projectId: 'backbone-logic'
          }
        }
      },
      {
        name: 'Enterprise Development Project',
        description: 'Development and testing project',
        type: 'networked',
        visibility: 'public',
        applicationMode: 'shared_network',
        ownerId: userId,
        isActive: true,
        isArchived: false,
        settings: {
          allowCollaboration: true,
          maxCollaborators: 20,
          realTimeEnabled: true,
          cloudConfig: {
            provider: 'firebase',
            projectId: 'backbone-logic'
          }
        }
      }
    ];
    
    for (const projectData of projects) {
      try {
        // Check if project already exists
        const existingProjects = await firestoreService.getProjectsByOwner(userId);
        const exists = existingProjects.some(p => p.name === projectData.name);
        
        if (!exists) {
          const project = await firestoreService.createProject({
            ...projectData,
            id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date()
          });
          
          console.log(`✅ Created project: ${project.name}`);
        } else {
          console.log(`⏭️  Project already exists: ${projectData.name}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to create project ${projectData.name}:`, error.message);
      }
    }
    
  } catch (error) {
    console.warn('⚠️  Error creating sample projects:', error.message);
  }
}

// Run the fix
fixEnterpriseUser().catch(console.error);
