import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router: ExpressRouter = Router();

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['standalone', 'networked', 'network', 'hybrid']),
  applicationMode: z.enum(['standalone', 'shared_network']).optional(),
  visibility: z.enum(['private', 'organization', 'public']).optional(),
  organizationId: z.string().optional(),
  storageBackend: z.enum(['firestore', 'gcs']).optional(),
  gcsBucket: z.string().optional(),
  gcsPrefix: z.string().optional(),
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
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const payload = createProjectSchema.parse(req.body);
    const userId = req.user.id;
    // Allow SUPERADMIN/ADMIN to create projects regardless of license; otherwise require active license
    const isAdmin = req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN';
    const hasActive = isAdmin ? true : await firestoreService.userHasActiveLicense(userId);
    if (!hasActive) {
      res.status(403).json({ success: false, error: 'Active license required' });
      return;
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
    res.status(400).json({ success: false, error: e?.message || 'Failed to create project' });
  }
});

// Update
router.patch('/:id', authenticateToken, async (req: any, res) => {
  try {
    const updated = await firestoreService.updateProjectAuthorized(req.params.id, req.user.id, req.body);
    const participants = await firestoreService.listParticipants(req.params.id);
    res.json({ success: true, data: transformProject(updated, participants) });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
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

export const projectsRouter: ExpressRouter = router;
export default router;
