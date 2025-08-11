import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, IconButton, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { api, endpoints, apiUtils } from '@/services/api';
import projectAssets from '@/services/projectAssets';

type Project = {
  id: string;
  name: string;
  description?: string;
  type: string;
  applicationMode: string;
  visibility: 'private' | 'organization' | 'public';
  storageBackend?: 'firestore' | 'gcs';
  gcsBucket?: string | null;
  gcsPrefix?: string | null;
  lastAccessedAt?: string;
  isArchived?: boolean;
};

const CloudProjectsPage: React.FC = () => {
  const [tab, setTab] = useState(0); // 0 = Active, 1 = Recycle Bin
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [archived, setArchived] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'private' | 'organization' | 'public',
    storageMode: 'cloud' as 'cloud' | 'local',
    cloudType: 'firestore' as 'firestore' | 'gcs',
    gcsBucket: '',
    gcsPrefix: '',
  });

  const loadActive = async () => {
    try {
      setError(null);
      const data = await apiUtils.withLoading<Project[]>(() => api.get('projects'), setLoading);
      setProjects(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects');
    }
  };

  const loadArchived = async () => {
    try {
      setError(null);
      // Try dedicated archived endpoint first
      try {
        const res = await api.get('projects/archived/list');
        const data = res.data?.data || [];
        setArchived(Array.isArray(data) ? data : []);
        return;
      } catch (err: any) {
        const status = err?.status || err?.response?.status;
        if (status !== 404) throw err;
        // Fallback: fetch all with includeArchived and filter client-side
      }
      const resAll = await api.get('projects', { params: { includeArchived: true } as any } as any);
      const all = resAll.data?.data || [];
      setArchived((all as Project[]).filter(p => (p as any).isArchived));
    } catch (e: any) {
      setError(e?.message || 'Failed to load archived projects');
    }
  };

  useEffect(() => {
    loadActive();
    loadArchived();
  }, []);

  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({ name: '', description: '', visibility: 'private', storageMode: 'cloud', cloudType: 'firestore', gcsBucket: '', gcsPrefix: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setIsEditing(true);
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      visibility: p.visibility || 'private',
      storageMode: p.storageBackend ? 'cloud' : 'local',
      cloudType: (p.storageBackend || 'firestore') as 'firestore' | 'gcs',
      gcsBucket: p.gcsBucket || '',
      gcsPrefix: p.gcsPrefix || '',
    });
    setDialogOpen(true);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Project name is required';
    if (form.storageMode === 'cloud' && form.cloudType === 'gcs' && !form.gcsBucket.trim()) return 'GCS Bucket is required for GCS storage';
    return null;
  };

  const submitForm = async () => {
    const v = validateForm();
    if (v) { setError(v); return; }
    try {
      setError(null);
      if (isEditing && editingId) {
        await api.patch(`projects/${editingId}`, {
          name: form.name,
          description: form.description,
          visibility: form.visibility,
        });
      } else {
        await api.post('projects', {
          name: form.name,
          description: form.description,
          type: 'network',
          applicationMode: 'shared_network',
          visibility: form.visibility,
          storageBackend: form.storageMode === 'cloud' ? form.cloudType : undefined,
          gcsBucket: form.storageMode === 'cloud' && form.cloudType === 'gcs' ? form.gcsBucket || undefined : undefined,
          gcsPrefix: form.storageMode === 'cloud' && form.cloudType === 'gcs' ? form.gcsPrefix || undefined : undefined,
        });
      }
      setDialogOpen(false);
      await Promise.all([loadActive(), loadArchived()]);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await api.delete(`projects/${projectId}`); // soft delete
      await Promise.all([loadActive(), loadArchived()]);
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  const handleRestore = async (projectId: string) => {
    try {
      await api.post(`projects/${projectId}/restore`, {});
      await Promise.all([loadActive(), loadArchived()]);
    } catch (e: any) {
      setError(e?.message || 'Restore failed');
    }
  };

  const renderItem = (p: Project, isArchivedList: boolean) => (
    <ListItem key={p.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
      secondaryAction={
        isArchivedList ? (
          <IconButton onClick={() => handleRestore(p.id)} aria-label="Restore project">
            <RestoreIcon />
          </IconButton>
        ) : (
          <Box>
            <IconButton onClick={() => openEdit(p)} aria-label="Edit project" sx={{ mr: 1 }}>
              {/* simple pencil emoji as placeholder */}
              <span role="img" aria-label="edit">✏️</span>
            </IconButton>
            <IconButton onClick={() => handleDelete(p.id)} aria-label="Delete project">
              <DeleteIcon />
            </IconButton>
            {p.storageBackend === 'gcs' && (
              <>
                <Button size="small" sx={{ ml: 1 }} onClick={async () => {
                  try {
                    // Prompt for file then upload
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = async () => {
                      const file = (input.files && input.files[0]) || null;
                      if (!file) return;
                      await projectAssets.uploadAsset(p.id, file);
                    };
                    input.click();
                  } catch (e: any) {
                    setError(e?.message || 'Upload failed');
                  }
                }}>Upload</Button>
                <Button size="small" onClick={async () => {
                  try {
                    // Simple prompt for filename to download
                    const name = window.prompt('Enter filename to download (exact match):');
                    if (!name) return;
                    await projectAssets.downloadAsset(p.id, name);
                  } catch (e: any) {
                    setError(e?.message || 'Download failed');
                  }
                }}>Download</Button>
              </>
            )}
          </Box>
        )
      }
    >
      <ListItemIcon>
        <CloudIcon color={isArchivedList ? 'disabled' : 'primary'} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>{p.name}</Typography>
            {p.storageBackend && (
              <Chip size="small" variant="outlined" label={p.storageBackend === 'gcs' ? 'GCS' : 'Firestore'} color={p.storageBackend === 'gcs' ? 'secondary' : 'primary'} />
            )}
            <Chip size="small" variant="outlined" label={p.visibility} />
          </Box>
        }
        secondary={p.description || ''}
      />
    </ListItem>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Cloud Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Create Project</Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Active (${projects.length})`} />
        <Tab label={`Recycle Bin (${archived.length})`} />
      </Tabs>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {tab === 0 ? (
        <List>
          {projects.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No projects yet.</Typography>
          ) : (
            projects.map(p => renderItem(p, false))
          )}
        </List>
      ) : (
        <List>
          {archived.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Recycle Bin is empty.</Typography>
          ) : (
            archived.map(p => renderItem(p, true))
          )}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Project' : 'Create Project'}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <TextField
            fullWidth
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            multiline rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Visibility</FormLabel>
            <Select value={form.visibility} onChange={(e) => setForm(prev => ({ ...prev, visibility: e.target.value as any }))}>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>
          {!isEditing && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Storage Location</FormLabel>
                <Select value={form.storageMode} onChange={(e) => setForm(prev => ({ ...prev, storageMode: e.target.value as any }))}>
                  <MenuItem value="cloud">Cloud</MenuItem>
                  <MenuItem value="local">Local (.dbproj)</MenuItem>
                </Select>
              </FormControl>
              {form.storageMode === 'cloud' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Cloud Type</FormLabel>
                  <Select value={form.cloudType} onChange={(e) => setForm(prev => ({ ...prev, cloudType: e.target.value as any }))}>
                    <MenuItem value="firestore">Firestore (metadata)</MenuItem>
                    <MenuItem value="gcs">Google Cloud Storage (assets)</MenuItem>
                  </Select>
                </FormControl>
              )}
              {form.storageMode === 'cloud' && form.cloudType === 'gcs' && (
                <>
                  <TextField fullWidth label="GCS Bucket" value={form.gcsBucket} onChange={(e) => setForm(prev => ({ ...prev, gcsBucket: e.target.value }))} sx={{ mb: 2 }} />
                  <TextField fullWidth label="GCS Prefix (optional)" value={form.gcsPrefix} onChange={(e) => setForm(prev => ({ ...prev, gcsPrefix: e.target.value }))} sx={{ mb: 2 }} />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitForm}>{isEditing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CloudProjectsPage;


