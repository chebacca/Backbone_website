import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { CloudDataset } from '../types/CloudDataset';

interface DatasetManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onDatasetUpdated?: () => void;
}

interface EditingDataset {
  id: string;
  name: string;
  description: string;
  storage: {
    backend: string;
    path: string;
  };
}

export const DatasetManagementDialog: React.FC<DatasetManagementDialogProps> = ({
  open,
  onClose,
  onDatasetUpdated
}) => {
  const [datasets, setDatasets] = useState<CloudDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingDataset, setEditingDataset] = useState<EditingDataset | null>(null);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [datasetToDelete, setDatasetToDelete] = useState<CloudDataset | null>(null);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);

  // Use the cloudProjectIntegration service which has proper initialization
  const datasetService = cloudProjectIntegration;

  useEffect(() => {
    if (open) {
      loadDatasets();
    }
  }, [open]);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const allDatasets = await datasetService.listDatasets();
      setDatasets(allDatasets);
    } catch (err) {
      setError('Failed to load datasets: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dataset: CloudDataset) => {
    setEditingDataset({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description || '',
      storage: {
        backend: dataset.storage?.backend || 'firestore',
        path: dataset.storage?.path || ''
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDataset) return;

    try {
      setLoading(true);
      setError(null);
      
      // Update dataset using the service
      const updatedDataset = await datasetService.updateDataset(editingDataset.id, {
        name: editingDataset.name,
        description: editingDataset.description,
        storage: editingDataset.storage
      });

      if (updatedDataset) {
        setSuccess('Dataset updated successfully');
        setEditingDataset(null);
        await loadDatasets();
        onDatasetUpdated?.();
      } else {
        setError('Failed to update dataset');
      }
    } catch (err) {
      setError('Failed to update dataset: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDataset(null);
  };

  const handleDeleteClick = (dataset: CloudDataset, event: React.MouseEvent<HTMLElement>) => {
    setDatasetToDelete(dataset);
    setDeleteConfirmAnchor(event.currentTarget);
  };

  const handleDeleteConfirm = async () => {
    if (!datasetToDelete) return;

    try {
      setLoading(true);
      setError(null);
      
      const success = await datasetService.deleteDataset(datasetToDelete.id);
      
      if (success) {
        setSuccess(`Dataset "${datasetToDelete.name}" deleted successfully`);
        await loadDatasets();
        onDatasetUpdated?.();
      } else {
        setError('Failed to delete dataset');
      }
    } catch (err) {
      setError('Failed to delete dataset: ' + (err as Error).message);
    } finally {
      setLoading(false);
      setDeleteConfirmAnchor(null);
      setDatasetToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmAnchor(null);
    setDatasetToDelete(null);
  };

  const handleCleanupCorrupted = async () => {
    try {
      setCleanupInProgress(true);
      setError(null);
      
      const result = await datasetService.cleanupCorruptedDatasets();
      
      if (result.cleaned > 0) {
        setSuccess(`Cleaned up ${result.cleaned} corrupted datasets`);
        await loadDatasets();
        onDatasetUpdated?.();
      } else {
        setSuccess('No corrupted datasets found to clean up');
      }
      
      if (result.errors.length > 0) {
        setError(`Some errors occurred: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError('Failed to cleanup corrupted datasets: ' + (err as Error).message);
    } finally {
      setCleanupInProgress(false);
    }
  };

  const getStorageBackendLabel = (backend: string) => {
    switch (backend) {
      case 'gcs': return 'Google Cloud Storage';
      case 's3': return 'Amazon S3';
      case 'aws': return 'AWS';
      case 'azure': return 'Azure';
      case 'firestore':
      default: return 'Firestore';
    }
  };

  const getStorageBackendColor = (backend: string) => {
    switch (backend) {
      case 'gcs': return 'primary';
      case 's3': return 'warning';
      case 'aws': return 'info';
      case 'azure': return 'secondary';
      case 'firestore':
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            minHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StorageIcon />
            <Typography variant="h6">Manage Datasets</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Clean up corrupted datasets">
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleCleanupCorrupted}
                disabled={cleanupInProgress}
                startIcon={cleanupInProgress ? <CircularProgress size={16} /> : <WarningIcon />}
              >
                {cleanupInProgress ? 'Cleaning...' : 'Cleanup'}
              </Button>
            </Tooltip>
            <Tooltip title="Refresh datasets">
              <IconButton onClick={loadDatasets} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {loading && !cleanupInProgress ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Storage</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Updated</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datasets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No datasets found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    datasets.map((dataset) => (
                      <TableRow key={dataset.id} hover>
                        <TableCell>
                          {editingDataset?.id === dataset.id ? (
                            <TextField
                              value={editingDataset.name}
                              onChange={(e) => setEditingDataset({
                                ...editingDataset,
                                name: e.target.value
                              })}
                              size="small"
                              fullWidth
                            />
                          ) : (
                            <Typography variant="body2" fontWeight="medium">
                              {dataset.name}
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {editingDataset?.id === dataset.id ? (
                            <TextField
                              value={editingDataset.description}
                              onChange={(e) => setEditingDataset({
                                ...editingDataset,
                                description: e.target.value
                              })}
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {dataset.description || 'No description'}
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {editingDataset?.id === dataset.id ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel>Backend</InputLabel>
                                <Select
                                  value={editingDataset.storage.backend}
                                  onChange={(e) => setEditingDataset({
                                    ...editingDataset,
                                    storage: {
                                      ...editingDataset.storage,
                                      backend: e.target.value
                                    }
                                  })}
                                  label="Backend"
                                >
                                  <MenuItem value="firestore">Firestore</MenuItem>
                                  <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                                  <MenuItem value="s3">Amazon S3</MenuItem>
                                  <MenuItem value="aws">AWS</MenuItem>
                                  <MenuItem value="azure">Azure</MenuItem>
                                </Select>
                              </FormControl>
                              <TextField
                                value={editingDataset.storage.path}
                                onChange={(e) => setEditingDataset({
                                  ...editingDataset,
                                  storage: {
                                    ...editingDataset.storage,
                                    path: e.target.value
                                  }
                                })}
                                size="small"
                                fullWidth
                                label="Path"
                              />
                            </Box>
                          ) : (
                            <Chip
                              label={getStorageBackendLabel(dataset.storage?.backend || 'firestore')}
                              color={getStorageBackendColor(dataset.storage?.backend || 'firestore') as any}
                              size="small"
                            />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {dataset.createdAt ? formatDate(dataset.createdAt) : 'Unknown'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {dataset.updatedAt ? formatDate(dataset.updatedAt) : 'Unknown'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          {editingDataset?.id === dataset.id ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Save changes">
                                <IconButton
                                  onClick={handleSaveEdit}
                                  color="primary"
                                  size="small"
                                  disabled={loading}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel editing">
                                <IconButton
                                  onClick={handleCancelEdit}
                                  color="secondary"
                                  size="small"
                                  disabled={loading}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Edit dataset">
                                <IconButton
                                  onClick={() => handleEdit(dataset)}
                                  color="primary"
                                  size="small"
                                  disabled={loading}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete dataset">
                                <IconButton
                                  onClick={(e) => handleDeleteClick(dataset, e)}
                                  color="error"
                                  size="small"
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Popover */}
      <Popover
        open={Boolean(deleteConfirmAnchor)}
        anchorEl={deleteConfirmAnchor}
        onClose={handleDeleteCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Are you sure you want to delete "{datasetToDelete?.name}"?
          </Typography>
          <Typography variant="caption" color="error" display="block" gutterBottom>
            This action cannot be undone and will remove the dataset from all projects.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleDeleteCancel} size="small">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              size="small"
              disabled={loading}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
