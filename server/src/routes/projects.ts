import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { licenseValidationMiddleware, requireValidLicense, enforceProjectLimits } from '../middleware/licenseValidation.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

const router: ExpressRouter = Router();

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['standalone', 'networked', 'network', 'hybrid']),
  applicationMode: z.enum(['standalone', 'shared_network']).optional(),
  visibility: z.enum(['private', 'organization', 'public']).optional(),
  organizationId: z.string().optional(),
  storageBackend: z.enum(['firestore', 'gcs', 's3', 'local', 'azure-blob']).optional(),
  gcsBucket: z.string().optional(),
  gcsPrefix: z.string().optional(),
  // AWS S3 fields
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  s3Prefix: z.string().optional(),
  // Azure Blob Storage fields
  azureStorageAccount: z.string().optional(),
  azureContainer: z.string().optional(),
  azurePrefix: z.string().optional(),
  // Standalone
  filePath: z.string().optional(),
  offlineMode: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  backupEnabled: z.boolean().optional(),
  encryptionEnabled: z.boolean().optional(),
  // Network
  allowCollaboration: z.boolean().optional(),
  maxCollaborators: z.number().int().optional(),
  realTimeEnabled: z.boolean().optional(),
  autoSync: z.boolean().optional(),
  syncInterval: z.number().int().optional(),
  conflictResolution: z.string().optional(),
  enableOfflineMode: z.boolean().optional(),
  allowRealTimeEditing: z.boolean().optional(),
  enableComments: z.boolean().optional(),
  enableChat: z.boolean().optional(),
  enablePresenceIndicators: z.boolean().optional(),
  enableActivityLog: z.boolean().optional(),
  allowGuestUsers: z.boolean().optional(),
  inviteUsers: z.array(z.string().email()).optional(),
  // Settings (including preferred dev ports for desktop/web compatibility)
  settings: z
    .object({
      preferredPorts: z
        .object({
          website: z.number().int().min(1024).max(65535).optional(),
          api: z.number().int().min(1024).max(65535).optional(),
        })
        .partial()
        .optional(),
    })
    .partial()
    .optional(),
});

function transformProject(p: any, participants: any[] = []) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    type: p.type === 'networked' ? 'network' : p.type,
    applicationMode: p.applicationMode,
    visibility: p.visibility,
    ownerId: p.ownerId,
    organizationId: p.organizationId,
    metadata: p.metadata || {},
    settings: p.settings || {},
    isActive: p.isArchived ? false : (p.isActive !== false),
    isArchived: !!p.isArchived,
    archivedAt: p.archivedAt || null,
    archivedBy: p.archivedBy || null,
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
    lastAccessedAt: p.lastAccessedAt?.toISOString?.() || p.updatedAt,
    storageBackend: p.storageBackend || 'firestore',
    gcsBucket: p.gcsBucket,
    gcsPrefix: p.gcsPrefix,
    s3Bucket: p.s3Bucket,
    s3Region: p.s3Region,
    s3Prefix: p.s3Prefix,
    azureStorageAccount: p.azureStorageAccount,
    azureContainer: p.azureContainer,
    azurePrefix: p.azurePrefix,
    filePath: p.filePath,
    fileSize: p.fileSize,
    lastSyncedAt: p.lastSyncedAt,
    offlineMode: !!p.offlineMode,
    autoSave: p.autoSave ?? true,
    backupEnabled: !!p.backupEnabled,
    encryptionEnabled: !!p.encryptionEnabled,
    allowCollaboration: !!p.allowCollaboration,
    maxCollaborators: p.maxCollaborators ?? 10,
    realTimeEnabled: !!p.realTimeEnabled,
    participants: participants.map((x) => ({
      id: x.id,
      userId: x.userId,
      userEmail: x.userEmail,
      userName: x.userName,
      role: x.role,
      permissions: x.permissions || [],
      joinedAt: x.joinedAt,
      lastActiveAt: x.lastActiveAt || x.joinedAt,
      isOnline: false,
      isActive: x.isActive !== false,
    })),
    participantCount: participants.length,
    syncSettings: {
      autoSync: !!p.autoSync,
      syncInterval: p.syncInterval ?? 300,
      conflictResolution: p.conflictResolution || 'manual',
      enableOfflineMode: !!p.enableOfflineMode,
    },
    collaborationSettings: {
      allowRealTimeEditing: !!p.allowRealTimeEditing,
      enableComments: !!p.enableComments,
      enableChat: !!p.enableChat,
      enablePresenceIndicators: !!p.enablePresenceIndicators,
      enableActivityLog: p.enableActivityLog ?? true,
      allowGuestUsers: !!p.allowGuestUsers,
    },
  };
}

// Public list
router.get('/public', async (req, res) => {
  try {
    const items = await firestoreService.listPublicProjects({
      type: req.query.type as any,
      applicationMode: req.query.applicationMode as any,
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      sortBy: String(req.query.sortBy || 'lastAccessedAt'),
      sortOrder: (req.query.sortOrder === 'asc' ? 'asc' : 'desc') as any,
    });
    res.json({ success: true, data: items.map((p) => transformProject(p)) });
  } catch (e: any) {
    logger.error('projects/public', e);
    res.status(500).json({ success: false, error: 'Failed to fetch public projects' });
  }
});

// Authenticated list
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    let items: any[] = [];
    try {
      items = await firestoreService.listUserProjects(userId, req.query);
    } catch (err) {
      // Fallback to simple owner-only listing to avoid index/order issues in prod
      items = await firestoreService.simpleListUserProjectsByOwner(userId);
    }
    const participantsMap = await firestoreService.getParticipantsForProjects(items.map((p) => p.id));
    res.json({ success: true, data: items.map((p) => transformProject(p, participantsMap.get(p.id) || [])) });
  } catch (e: any) {
    logger.error('projects list', e);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// Convenience: list archived projects for current user
router.get('/archived/list', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const items = await firestoreService.listUserProjects(userId, { ...req.query, isArchived: 'true' });
    const participantsMap = await firestoreService.getParticipantsForProjects(items.map((p) => p.id));
    res.json({ success: true, data: items.map((p) => transformProject(p, participantsMap.get(p.id) || [])) });
  } catch (e: any) {
    logger.error('projects archived list', e);
    res.status(500).json({ success: false, error: 'Failed to fetch archived projects' });
  }
});

// Get by id
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const project = await firestoreService.getProjectByIdAuthorized(req.params.id, req.user.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    const participants = await firestoreService.listParticipants(req.params.id);
    res.json({ success: true, data: transformProject(project, participants) });
  } catch (e: any) {
    logger.error('project get', e);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// Create
router.post('/', 
  authenticateToken, 
  licenseValidationMiddleware,
  requireValidLicense('create'),
  enforceProjectLimits,
  async (req: any, res) => {
  try {
    const payload = createProjectSchema.parse(req.body);
    const userId = req.user.id;
    
    // License validation is now handled by middleware
    // Get collaboration limits from license context
    const maxAllowedCollaborators = req.licenseContext?.projectAccess?.maxProjects === -1 ? 
      250 : // Unlimited (Enterprise)
      req.licenseContext?.projectAccess?.maxProjects || 3; // Demo default

    console.log(`🔍 [Projects Routes] User ${userId} maxAllowedCollaborators from license context:`, maxAllowedCollaborators);

    // Validate maxCollaborators against license limit
    if (payload.maxCollaborators && payload.maxCollaborators > maxAllowedCollaborators) {
      res.status(400).json({ 
        success: false, 
        error: `Maximum collaborators (${payload.maxCollaborators}) exceeds your license limit of ${maxAllowedCollaborators}`,
        code: 'LICENSE_LIMIT_EXCEEDED',
        limit: maxAllowedCollaborators,
        licenseType: req.licenseContext?.validation?.licenseType,
        upgradeUrl: req.licenseContext?.upgradeUrl
      });
      return;
    }

    // If no maxCollaborators specified, set it to the license limit
    if (!payload.maxCollaborators && payload.allowCollaboration) {
      payload.maxCollaborators = maxAllowedCollaborators;
    }

    let orgId = payload.organizationId;
    if (orgId) {
      const ok = await firestoreService.verifyOrgMembership(userId, orgId, ['ADMIN', 'MANAGER', 'OWNER']);
      if (!ok) {
        res.status(403).json({ success: false, error: 'Insufficient org permissions' });
        return;
      }
    }
    
    const created = await firestoreService.createProject({
      ...payload,
      ownerId: userId,
      organizationId: orgId,
      applicationMode: payload.applicationMode || (payload.type === 'standalone' ? 'standalone' : 'shared_network'),
      visibility: payload.visibility || (orgId ? 'organization' : 'private'),
    });
    const participants = await firestoreService.listParticipants(created.id);
    res.status(201).json({ success: true, data: transformProject(created, participants) });
  } catch (e: any) {
    logger.error('project create', e);
    // Provide clearer validation feedback if Zod parsing failed
    if (e && typeof e === 'object' && Array.isArray(e.issues)) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: e.issues,
      });
      return;
    }
    res.status(400).json({ success: false, error: e?.message || 'Failed to create project' });
  }
});

// Update
router.patch('/:id', authenticateToken, async (req: any, res) => {
  try {
    // Validate optional settings.preferredPorts on update to enforce port ranges when provided
    const updates = req.body || {};
    const validated = (() => {
      const schema = z.object({
        settings: z.object({
          preferredPorts: z.object({
            website: z.number().int().min(1024).max(65535).optional(),
            api: z.number().int().min(1024).max(65535).optional(),
          }).partial().optional(),
        }).partial().optional(),
      }).partial();
      try {
        return schema.parse(updates);
      } catch (e: any) {
        throw Object.assign(new Error(e?.message || 'Invalid update payload'), { code: 'BAD_REQUEST' });
      }
    })();

    const updated = await firestoreService.updateProjectAuthorized(req.params.id, req.user.id, validated);
    const participants = await firestoreService.listParticipants(req.params.id);
    res.json({ success: true, data: transformProject(updated, participants) });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : e?.code === 'BAD_REQUEST' ? 400 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to update project' });
  }
});

// Delete/archive
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const permanent = String(req.query.permanent) === 'true';
    await firestoreService.deleteProjectAuthorized(req.params.id, req.user.id, permanent);
    res.json({ success: true, message: permanent ? 'Project deleted permanently' : 'Project archived' });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to delete project' });
  }
});

// Soft archive a project (alias, easier for UI): PATCH /:id/archive { isArchived: true|false }
router.patch('/:id/archive', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { isArchived } = req.body || {};
    const updated = await firestoreService.updateProjectAuthorized(projectId, userId, { isArchived: Boolean(isArchived) });
    const participants = await firestoreService.listParticipants(projectId);
    res.json({ success: true, data: transformProject(updated, participants) });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to archive project' });
  }
});

// Add participant
router.post('/:id/participants', authenticateToken, async (req: any, res) => {
  try {
    const participant = await firestoreService.addParticipantAuthorized(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: participant });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to add participant' });
  }
});

// Remove participant
router.delete('/:id/participants/:participantId', authenticateToken, async (req: any, res) => {
  try {
    await firestoreService.removeParticipantAuthorized(req.params.id, req.user.id, req.params.participantId);
    res.json({ success: true, message: 'Participant removed' });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to remove participant' });
  }
});

// Generate a signed URL for project-scoped storage operations (upload/download)
router.post('/:id/storage/signed-url', authenticateToken, async (req: any, res) => {
  try {
    const schema = z.object({
      filename: z.string().min(1),
      operation: z.enum(['upload', 'download']).default('upload'),
      contentType: z.string().optional(),
      ttlSec: z.number().int().min(60).max(24 * 60 * 60).optional(),
    });
    const { filename, operation, contentType, ttlSec } = schema.parse(req.body || {});

    const projectId = req.params.id as string;
    const userId = req.user?.id as string;

    // Authorization: ensure user can access project
    const project = await firestoreService.getProjectByIdAuthorized(projectId, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Resolve bucket and object key
    const bucketName = (project.gcsBucket as string) || process.env.GCS_BUCKET || (process.env.FIREBASE_STORAGE_BUCKET || '');
    const adminProjectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    const defaultBucket = adminProjectId ? `${adminProjectId}.appspot.com` : '';
    const finalBucketName = bucketName || defaultBucket;
    if (!finalBucketName) {
      res.status(500).json({ success: false, error: 'No storage bucket configured' });
      return;
    }

    // Basic filename sanitization
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const prefix = (project.gcsPrefix as string) || `projects/${projectId}`;
    const objectKey = `${prefix.replace(/\/$/, '')}/${safeName}`;

    const bucket = getStorage().bucket(finalBucketName);
    const file = bucket.file(objectKey);
    const expiresAt = Date.now() + (ttlSec ? ttlSec * 1000 : 15 * 60 * 1000); // default 15 min

    if (operation === 'upload') {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: expiresAt,
        contentType: contentType || 'application/octet-stream',
      });
      res.json({
        success: true,
        data: {
          url,
          method: 'PUT',
          headers: contentType ? { 'Content-Type': contentType } : undefined,
          bucket: finalBucketName,
          key: objectKey,
        },
      });
      return;
    }

    // download
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    });
    res.json({
      success: true,
      data: {
        url,
        method: 'GET',
        bucket: finalBucketName,
        key: objectKey,
      },
    });
  } catch (e: any) {
    logger.error('signed-url generation failed', e);
    const code = e?.name === 'ZodError' ? 400 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to generate signed URL' });
  }
});

// Record uploaded file metadata for a project (Firestore)
router.post('/:id/storage/record', authenticateToken, async (req: any, res) => {
  try {
    const schema = z.object({
      key: z.string().min(1),
      name: z.string().min(1),
      size: z.number().int().min(0),
      contentType: z.string().optional(),
      bucket: z.string().optional(),
      url: z.string().url().optional(),
    });
    const { key, name, size, contentType, bucket, url } = schema.parse(req.body || {});

    const projectId = req.params.id as string;
    const userId = req.user?.id as string;

    // Authorization
    const project = await firestoreService.getProjectByIdAuthorized(projectId, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const db = getFirestore();
    const filesCol = db.collection('projects').doc(projectId).collection('files');
    const doc = await filesCol.add({
      key,
      name,
      size,
      contentType: contentType || null,
      bucket: bucket || project.gcsBucket || null,
      url: url || null,
      uploadedBy: userId,
      createdAt: new Date(),
    });

    res.json({ success: true, data: { id: doc.id } });
  } catch (e: any) {
    logger.error('storage record failed', e);
    const code = e?.name === 'ZodError' ? 400 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to record file metadata' });
  }
});

// Get team members for a project
router.get('/:id/team-members', authenticateToken, async (req: any, res) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user?.id as string;

    // Authorization - ensure user can access project
    const project = await firestoreService.getProjectByIdAuthorized(projectId, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Get project team members from Firestore
    const teamMembers = await firestoreService.getProjectTeamMembers(projectId);
    
    res.json({ success: true, data: teamMembers });
  } catch (e: any) {
    logger.error('get project team members failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get project team members' });
  }
});

// Add team member to project
router.post('/:id/team-members', authenticateToken, async (req: any, res) => {
  try {
    const schema = z.object({
      teamMemberId: z.string().min(1),
      role: z.enum(['ADMIN', 'MANAGER', 'DO_ER', 'VIEWER']).default('DO_ER'),
    });
    const { teamMemberId, role } = schema.parse(req.body || {});

    const projectId = req.params.id as string;
    const userId = req.user?.id as string;

    // Authorization - ensure user can manage project (owner or admin)
    const project = await firestoreService.getProjectByIdAuthorized(projectId, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Check if user has permission to add team members (owner or admin)
    if (project.ownerId !== userId) {
      const userRole = await firestoreService.getUserProjectRole(projectId, userId);
      if (userRole !== 'ADMIN') {
        res.status(403).json({ success: false, error: 'Insufficient permissions to add team members' });
        return;
      }
    }

    // Check if adding this team member would exceed the project's collaboration limit
    if (project.allowCollaboration && project.maxCollaborators) {
      const currentTeamMembers = await firestoreService.getProjectTeamMembers(projectId);
      if (currentTeamMembers.length >= project.maxCollaborators) {
        res.status(400).json({ 
          success: false, 
          error: `Cannot add team member: project has reached its collaboration limit of ${project.maxCollaborators} users`,
          code: 'COLLABORATION_LIMIT_REACHED',
          limit: project.maxCollaborators,
          current: currentTeamMembers.length
        });
        return;
      }
    }

    // Add team member to project
    const projectTeamMember = await firestoreService.addTeamMemberToProject(projectId, teamMemberId, role, userId);
    
    res.status(201).json({ success: true, data: projectTeamMember });
  } catch (e: any) {
    logger.error('add team member to project failed', e);
    const code = e?.name === 'ZodError' ? 400 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to add team member to project' });
  }
});

// Remove team member from project
router.delete('/:id/team-members/:teamMemberId', authenticateToken, async (req: any, res) => {
  try {
    const projectId = req.params.id as string;
    const teamMemberId = req.params.teamMemberId as string;
    const userId = req.user?.id as string;

    // Authorization - ensure user can manage project
    const project = await firestoreService.getProjectByIdAuthorized(projectId, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Check permissions
    if (project.ownerId !== userId) {
      const userRole = await firestoreService.getUserProjectRole(projectId, userId);
      if (userRole !== 'ADMIN') {
        res.status(403).json({ success: false, error: 'Insufficient permissions to remove team members' });
        return;
      }
    }

    // Remove team member from project
    await firestoreService.removeTeamMemberFromProject(projectId, teamMemberId);
    
    res.json({ success: true, message: 'Team member removed from project' });
  } catch (e: any) {
    logger.error('remove team member from project failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to remove team member from project' });
  }
});

export const projectsRouter: ExpressRouter = router;
export default router;
