import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['standalone', 'networked', 'network', 'hybrid']),
  applicationMode: z.enum(['standalone', 'shared_network']).optional(),
  visibility: z.enum(['private', 'organization', 'public']).optional(),
  organizationId: z.string().optional(),
  storageBackend: z.enum(['firestore', 'gcs']).optional(),
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
  inviteUsers: z.array(z.string().email()).optional()
});

function transformProject(project: any, participants: any[] = []) {
  const p = project;
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
    isActive: p.isActive !== false,
    isArchived: p.isArchived === true,
    archivedAt: p.archivedAt || null,
    archivedBy: p.archivedBy || null,
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
    lastAccessedAt: p.lastAccessedAt?.toISOString?.() || p.updatedAt,
    // Standalone
    filePath: p.filePath,
    fileSize: p.fileSize,
    lastSyncedAt: p.lastSyncedAt,
    offlineMode: !!p.offlineMode,
    autoSave: !!p.autoSave,
    backupEnabled: !!p.backupEnabled,
    encryptionEnabled: !!p.encryptionEnabled,
    // Network
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
      isActive: x.isActive !== false
    })),
    participantCount: participants.length,
    // Network sync settings
    syncSettings: {
      autoSync: !!p.autoSync,
      syncInterval: p.syncInterval ?? 300,
      conflictResolution: p.conflictResolution || 'manual',
      enableOfflineMode: !!p.enableOfflineMode
    },
    // Collaboration settings
    collaborationSettings: {
      allowRealTimeEditing: !!p.allowRealTimeEditing,
      enableComments: !!p.enableComments,
      enableChat: !!p.enableChat,
      enablePresenceIndicators: !!p.enablePresenceIndicators,
      enableActivityLog: p.enableActivityLog ?? true,
      allowGuestUsers: !!p.allowGuestUsers
    }
  };
}

// Public projects (no auth)
router.get('/public', async (req, res): Promise<void> => {
  try {
    const { type = 'network', applicationMode = 'shared_network', limit = 50, offset = 0, sortBy = 'lastAccessedAt', sortOrder = 'desc' } = req.query as any;
    const items = await firestoreService.listPublicProjects({
      type,
      applicationMode,
      limit: Number(limit),
      offset: Number(offset),
      sortBy: String(sortBy),
      sortOrder: String(sortOrder) === 'asc' ? 'asc' : 'desc'
    });
    res.json({ success: true, data: items.map((d: any) => transformProject(d)), meta: { total: items.length, limit: Number(limit), offset: Number(offset), hasMore: items.length === Number(limit) } });
    return;
  } catch (e: any) {
    logger.error('projects/public error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch public projects' });
    return;
  }
});

// Authenticated projects
router.get('/', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const items = await firestoreService.listUserProjects(userId, req.query as any);
    const participantsMap = await firestoreService.getParticipantsForProjects(items.map((p: any) => p.id));
    const out = items.map((p: any) => transformProject(p, participantsMap.get(p.id) || []));
    res.json({ success: true, data: out, pagination: null, metadata: { ts: new Date().toISOString() } });
    return;
  } catch (e: any) {
    logger.error('projects list error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
    return;
  }
});

router.get('/:id', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const project = await firestoreService.getProjectByIdAuthorized(req.params.id, userId);
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    const participants = await firestoreService.listParticipants(project.id);
    res.json({ success: true, data: transformProject(project, participants) });
    return;
  } catch (e: any) {
    logger.error('project get error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
    return;
  }
});

router.post('/', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const body = createProjectSchema.parse(req.body);

    // License/org enforcement
    const hasActive = await firestoreService.userHasActiveLicense(userId);
    if (!hasActive) { res.status(403).json({ success: false, error: 'Active license required' }); return; }

    let orgId = body.organizationId;
    if (orgId) {
      const membership = await firestoreService.verifyOrgMembership(userId, orgId, ['OWNER', 'ENTERPRISE_ADMIN', 'MANAGER']);
      if (!membership) { res.status(403).json({ success: false, error: 'Insufficient org permissions' }); return; }
    }

    const created = await firestoreService.createProject({
      ...body,
      ownerId: userId,
      organizationId: orgId,
      applicationMode: body.applicationMode || (body.type === 'standalone' ? 'standalone' : 'shared_network'),
      visibility: body.visibility || (orgId ? 'organization' : 'private'),
      storageBackend: body.storageBackend || 'firestore'
    });

    if (body.inviteUsers?.length) {
      await firestoreService.inviteParticipantsByEmail(created.id, body.inviteUsers, 'viewer');
    }

    const participants = await firestoreService.listParticipants(created.id);
    res.status(201).json({ success: true, data: transformProject(created, participants) });
    return;
  } catch (e: any) {
    logger.error('project create error', e);
    res.status(400).json({ success: false, error: e?.message || 'Failed to create project' });
    return;
  }
});

router.patch('/:id', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const updated = await firestoreService.updateProjectAuthorized(req.params.id, userId, req.body);
    const participants = await firestoreService.listParticipants(req.params.id);
    res.json({ success: true, data: transformProject(updated, participants) });
    return;
  } catch (e: any) {
    logger.error('project update error', e);
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to update project' });
    return;
  }
});

router.delete('/:id', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const permanent = String(req.query.permanent) === 'true';
    await firestoreService.deleteProjectAuthorized(req.params.id, userId, permanent);
    res.json({ success: true, message: permanent ? 'Project deleted permanently' : 'Project archived' });
    return;
  } catch (e: any) {
    logger.error('project delete error', e);
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to delete project' });
    return;
  }
});

router.post('/:id/participants', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    const { userEmail, role = 'viewer' } = req.body as { userEmail: string; role?: string };
    const participant = await firestoreService.addParticipantAuthorized(req.params.id, userId, { userEmail, role });
    res.status(201).json({ success: true, data: participant });
    return;
  } catch (e: any) {
    logger.error('add participant error', e);
    const code = e?.code === 'FORBIDDEN' ? 403 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to add participant' });
    return;
  }
});

router.delete('/:id/participants/:participantId', authenticateToken, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;
    await firestoreService.removeParticipantAuthorized(req.params.id, userId, req.params.participantId);
    res.json({ success: true, message: 'Participant removed' });
    return;
  } catch (e: any) {
    logger.error('remove participant error', e);
    const code = e?.code === 'FORBIDDEN' ? 403 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to remove participant' });
    return;
  }
});

export const projectsRouter: import('express').Router = router;


