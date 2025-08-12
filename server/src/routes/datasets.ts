import type { Router as ExpressRouter, Request, Response } from 'express';
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';
import { z } from 'zod';

const router: ExpressRouter = Router();

const createDatasetSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  visibility: z.enum(['private', 'organization', 'public']).default('private'),
  organizationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  schema: z.any().optional(),
  storage: z.object({
    backend: z.enum(['firestore', 'gcs', 's3', 'local']).default('firestore'),
    gcsBucket: z.string().optional(),
    gcsPrefix: z.string().optional(),
    path: z.string().optional(),
  }).partial().optional(),
});

// List datasets accessible to current user
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const items = await firestoreService.listUserDatasets(req.user.id, {
      organizationId: req.query.organizationId as string | undefined,
      visibility: (req.query.visibility as any) || undefined,
    });
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to fetch datasets' });
  }
});

// Create dataset
router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const payload = createDatasetSchema.parse(req.body);
    // If organizationId specified, ensure membership when visibility is organization
    if (payload.organizationId && payload.visibility === 'organization') {
      const ok = await firestoreService.verifyOrgMembership(req.user.id, payload.organizationId, ['OWNER', 'ENTERPRISE_ADMIN', 'ADMIN', 'MANAGER']);
      if (!ok) { res.status(403).json({ success: false, error: 'Insufficient org permissions' }); return; }
    }
    const created = await firestoreService.createDataset({
      name: payload.name,
      description: payload.description,
      visibility: payload.visibility,
      ownerId: req.user.id,
      organizationId: payload.organizationId || null,
      tags: payload.tags || [],
      schema: payload.schema || {},
      storage: payload.storage ? { backend: payload.storage.backend || 'firestore', ...payload.storage } : { backend: 'firestore' },
    });
    res.status(201).json({ success: true, data: created });
  } catch (e: any) {
    const msg = e?.message || 'Failed to create dataset';
    const code = msg.includes('Invalid') ? 400 : 500;
    res.status(code).json({ success: false, error: msg });
  }
});

// Get dataset by id (authorized)
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const ds = await firestoreService.getDatasetByIdAuthorized(req.params.id, req.user.id);
    if (!ds) { res.status(404).json({ success: false, error: 'Dataset not found' }); return; }
    res.json({ success: true, data: ds });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to fetch dataset' });
  }
});

// Update dataset
router.patch('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const updated = await firestoreService.updateDatasetAuthorized(req.params.id, req.user.id, req.body || {});
    res.json({ success: true, data: updated });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to update dataset' });
  }
});

// Delete dataset
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    await firestoreService.deleteDatasetAuthorized(req.params.id, req.user.id);
    res.json({ success: true, message: 'Dataset deleted' });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to delete dataset' });
  }
});

// Project-dataset associations
router.get('/project/:projectId', authenticateToken, async (req: any, res: Response) => {
  try {
    const items = await firestoreService.listProjectDatasetsAuthorized(req.params.projectId, req.user.id);
    res.json({ success: true, data: items });
  } catch (e: any) {
    const code = e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to fetch project datasets' });
  }
});

router.post('/project/:projectId/:datasetId', authenticateToken, async (req: any, res: Response) => {
  try {
    const link = await firestoreService.assignDatasetToProjectAuthorized(req.params.projectId, req.params.datasetId, req.user.id);
    res.status(201).json({ success: true, data: link });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to assign dataset' });
  }
});

router.delete('/project/:projectId/:datasetId', authenticateToken, async (req: any, res: Response) => {
  try {
    await firestoreService.unassignDatasetFromProjectAuthorized(req.params.projectId, req.params.datasetId, req.user.id);
    res.json({ success: true, message: 'Dataset unassigned' });
  } catch (e: any) {
    const code = e?.code === 'FORBIDDEN' ? 403 : e?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ success: false, error: e?.message || 'Failed to unassign dataset' });
  }
});

export const datasetsRouter: ExpressRouter = router;
export default router;


