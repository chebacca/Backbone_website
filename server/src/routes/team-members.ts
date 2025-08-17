import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';

const router: ExpressRouter = Router();

// Get licensed team members (available for assignment to projects)
router.get('/licensed', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id as string;
    const { search, excludeProjectId } = req.query;

    logger.info(`🔍 Fetching licensed team members for user: ${userId}`);

    // Get user's organization to find team members
    const userOrgs = await firestoreService.getOrganizationsForUser(userId);
    logger.info(`📋 User organizations found: ${userOrgs.length}`, { orgIds: userOrgs.map(org => org.id) });
    
    if (!userOrgs || userOrgs.length === 0) {
      logger.warn(`⚠️ No organizations found for user: ${userId}`);
      res.json({ success: true, data: [] });
      return;
    }

    // For now, use the first organization
    const orgId = userOrgs[0].id;
    logger.info(`🏢 Using organization: ${orgId}`);
    
    // Get all active organization members
    const orgMembers = await firestoreService.getOrgMembers(orgId);
    logger.info(`👥 Raw organization members found: ${orgMembers.length}`, { 
      members: orgMembers.map(m => ({ id: m.id, email: m.email, status: m.status, role: m.role, licenseType: m.licenseType }))
    });
    
    // Filter for active members - include all active members regardless of license type
    // The license information will be determined by their role and subscription
    const activeMembers = orgMembers.filter(member => 
      member.status === 'ACTIVE'
    );
    logger.info(`✅ Active members after status filter: ${activeMembers.length}`, {
      activeMembers: activeMembers.map(m => ({ id: m.id, email: m.email, role: m.role, licenseType: m.licenseType }))
    });

    let filteredMembers = activeMembers;

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredMembers = filteredMembers.filter(member => 
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower)
      );
      logger.info(`🔍 After search filter "${search}": ${filteredMembers.length} members`);
    }

    // Exclude members already assigned to the project
    if (excludeProjectId && typeof excludeProjectId === 'string') {
      const projectMembers = await firestoreService.getProjectTeamMembers(excludeProjectId);
      const assignedMemberIds = projectMembers.map(pm => pm.teamMemberId);
      logger.info(`🚫 Project ${excludeProjectId} already has ${assignedMemberIds.length} members:`, assignedMemberIds);
      
      filteredMembers = filteredMembers.filter(member => 
        !assignedMemberIds.includes(member.id)
      );
      logger.info(`✅ After excluding assigned members: ${filteredMembers.length} available members`);
    }

    // Transform to expected format
    const teamMembers = filteredMembers.map(member => {
      // Generate a better display name
      let displayName = member.name;
      
      if (!displayName) {
        if (member.firstName && member.lastName) {
          displayName = `${member.firstName} ${member.lastName}`;
        } else if (member.firstName) {
          displayName = member.firstName;
        } else if (member.lastName) {
          displayName = member.lastName;
        } else {
          // If no name fields at all, create a name from email
          const emailParts = member.email.split('@');
          const username = emailParts[0];
          // Convert username to title case (e.g., "john.doe" -> "John Doe")
          displayName = username
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }

      return {
        id: member.id,
        name: displayName,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        licenseType: member.licenseType || 'PROFESSIONAL', // Default to PROFESSIONAL if not set
        status: member.status,
        organizationId: orgId,
        department: member.department || 'Not assigned',
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        lastActive: member.lastActiveAt || member.updatedAt
      };
    });

    logger.info(`🎯 Final team members being returned: ${teamMembers.length}`, {
      teamMembers: teamMembers.map(tm => ({ id: tm.id, email: tm.email, name: tm.name, licenseType: tm.licenseType }))
    });

    res.json({ success: true, data: teamMembers });
  } catch (e: any) {
    logger.error('❌ get licensed team members failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get licensed team members' });
  }
});

// Get team member by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const teamMemberId = req.params.id as string;
    const userId = req.user?.id as string;

    // Get team member details
    const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
    if (!teamMember) {
      res.status(404).json({ success: false, error: 'Team member not found' });
      return;
    }

    // Verify user has access to this team member (same organization)
    const userOrgs = await firestoreService.getOrganizationsForUser(userId);
    const memberOrgs = await firestoreService.getOrganizationsForUser(teamMemberId);
    
    const hasSharedOrg = userOrgs.some(userOrg => 
      memberOrgs.some(memberOrg => memberOrg.id === userOrg.id)
    );

    if (!hasSharedOrg && teamMemberId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: teamMember });
  } catch (e: any) {
    logger.error('get team member by id failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get team member' });
  }
});

export const teamMembersRouter: ExpressRouter = router;
export default router;

