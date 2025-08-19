#!/usr/bin/env node

/**
 * Check Enterprise Team Members Script
 * This script checks the current state of team members for enterprise.user@example.com
 * and ensures proper organization and team member data exists
 */

import { firestoreService } from './dist/services/firestoreService.js';
import { logger } from './dist/utils/logger.js';

async function checkEnterpriseTeamMembers() {
  try {
    console.log('🔍 Checking enterprise user team member setup...');
    
    // Find the enterprise user
    const user = await firestoreService.getUserByEmail('enterprise.user@example.com');
    
    if (!user) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    console.log('✅ Enterprise user found:', user.id, user.email);
    
    // Get user's organizations
    const organizations = await firestoreService.getOrganizationsForUser(user.id);
    console.log(`📋 User organizations: ${organizations.length}`);
    
    if (organizations.length === 0) {
      console.log('❌ No organizations found for enterprise user');
      return;
    }
    
    for (const org of organizations) {
      console.log(`🏢 Organization: ${org.name} (${org.id}) - Tier: ${org.tier}`);
      
      // Get organization members
      const orgMembers = await firestoreService.getOrgMembers(org.id);
      console.log(`👥 Organization members: ${orgMembers.length}`);
      
      orgMembers.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name || member.email} (${member.id})`);
        console.log(`     Email: ${member.email}`);
        console.log(`     Role: ${member.role}`);
        console.log(`     Status: ${member.status}`);
        console.log(`     License Type: ${member.licenseType || 'Not set'}`);
        console.log('');
      });
      
      // If no team members exist, create some sample ones
      if (orgMembers.length <= 1) { // Only the owner
        console.log('🔧 Creating sample team members...');
        await createSampleTeamMembers(org.id, user.id);
      }
    }
    
    console.log('🎉 Enterprise team member check completed!');
    
  } catch (error) {
    console.error('❌ Error checking enterprise team members:', error);
  }
}

async function createSampleTeamMembers(orgId, ownerUserId) {
  const sampleMembers = [
    {
      email: 'audrey.johnson@enterprise.com',
      firstName: 'Audrey',
      lastName: 'Johnson',
      role: 'MANAGER',
      licenseType: 'PROFESSIONAL'
    },
    {
      email: 'lissa.chen@enterprise.com',
      firstName: 'Lissa',
      lastName: 'Chen',
      role: 'MEMBER',
      licenseType: 'ENTERPRISE'
    },
    {
      email: 'marcus.rodriguez@enterprise.com',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      role: 'MEMBER',
      licenseType: 'PROFESSIONAL'
    }
  ];
  
  for (const memberData of sampleMembers) {
    try {
      // Check if member already exists
      const existingMembers = await firestoreService.getOrgMembers(orgId);
      const exists = existingMembers.some(m => m.email === memberData.email);
      
      if (!exists) {
        const orgMember = await firestoreService.createOrgMember({
          orgId: orgId,
          email: memberData.email,
          name: `${memberData.firstName} ${memberData.lastName}`,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          role: memberData.role,
          status: 'ACTIVE',
          seatReserved: true,
          licenseType: memberData.licenseType,
          department: 'Engineering',
          invitedByUserId: ownerUserId,
          invitedAt: new Date(),
          joinedAt: new Date(),
          lastActiveAt: new Date()
        });
        
        console.log(`✅ Created team member: ${memberData.firstName} ${memberData.lastName} (${orgMember.id})`);
      } else {
        console.log(`⏭️  Team member already exists: ${memberData.email}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to create team member ${memberData.email}:`, error.message);
    }
  }
}

// Run the check
checkEnterpriseTeamMembers().catch(console.error);
