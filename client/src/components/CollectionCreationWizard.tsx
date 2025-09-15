/**
 * 🧙‍♂️ COLLECTION CREATION WIZARD
 * 
 * Allows users to create new Firebase collections while maintaining strict schema compliance
 * with the Dashboard app's structure. Provides guided collection creation with automatic
 * index generation, security rules, and organization scoping.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Movie as MovieIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';
import { CollectionSchemaService } from '../services/CollectionSchemaService';
import { FirebaseCollectionCreator } from '../services/FirebaseCollectionCreator';
import { useAuth } from '../context/AuthContext';

// Collection template categories based on Dashboard app structure
const COLLECTION_CATEGORIES = {
  'sessions': {
    icon: <MovieIcon />,
    name: 'Sessions & Workflows',
    description: 'Production sessions, workflows, and task management',
    templates: [
      'sessions',
      'sessionWorkflows', 
      'sessionTasks',
      'sessionAssignments',
      'sessionReviews',
      'postProductionTasks',
      'workflowTemplates',
      'workflowInstances'
    ]
  },
  'media': {
    icon: <StorageIcon />,
    name: 'Media & Content',
    description: 'Media files, reviews, and content management',
    templates: [
      'mediaFiles',
      'reviews',
      'notes',
      'reports',
      'callSheets',
      'stages'
    ]
  },
  'inventory': {
    icon: <InventoryIcon />,
    name: 'Inventory & Equipment',
    description: 'Equipment tracking, network management, and inventory systems',
    templates: [
      'inventoryItems',
      'inventory',
      'networks',
      'networkIPAssignments',
      'mapLayouts',
      'mapLocations',
      'setupProfiles',
      'schemas'
    ]
  },
  'team': {
    icon: <GroupIcon />,
    name: 'Team & Organization',
    description: 'Team members, roles, and organizational data',
    templates: [
      'teamMembers',
      'roles',
      'permissions',
      'organizations',
      'contacts'
    ]
  },
  'business': {
    icon: <BusinessIcon />,
    name: 'Business & Projects',
    description: 'Projects, clients, and business management',
    templates: [
      'projects',
      'clients',
      'pbmProjects',
      'pbmSchedules',
      'licenses',
      'subscriptions'
    ]
  },
  'custom': {
    icon: <ExtensionIcon />,
    name: 'Custom Collection',
    description: 'Create a custom collection with guided schema builder',
    templates: ['custom']
  }
};

interface CollectionField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'timestamp' | 'array' | 'object' | 'reference';
  required: boolean;
  indexed: boolean;
  description?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

interface CollectionTemplate {
  name: string;
  category: string;
  displayName: string;
  description: string;
  organizationScoped: boolean;
  fields: CollectionField[];
  indexes: Array<{
    fields: Array<{ field: string; order: 'asc' | 'desc' | 'array-contains' }>;
    queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  }>;
  securityRules: {
    read: string[];
    write: string[];
    admin: string[];
  };
  relationships?: Array<{
    collection: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    field: string;
  }>;
}

interface CollectionCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onCollectionCreated: (collectionName: string, template: CollectionTemplate) => void;
}

const steps = [
  'Select Category',
  'Choose Template', 
  'Configure Collection',
  'Review & Create'
];

export const CollectionCreationWizard: React.FC<CollectionCreationWizardProps> = ({
  open,
  onClose,
  onCollectionCreated
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [collectionName, setCollectionName] = useState<string>('');
  const [customFields, setCustomFields] = useState<CollectionField[]>([]);
  const [template, setTemplate] = useState<CollectionTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize services
  const [schemaService] = useState(() => new CollectionSchemaService());
  const [creatorService] = useState(() => new FirebaseCollectionCreator());

  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'custom') {
      loadTemplate();
    }
  }, [selectedTemplate]);

  const loadTemplate = async () => {
    try {
      const templateData = await schemaService.getCollectionTemplate(selectedTemplate);
      setTemplate(templateData);
      setCollectionName(selectedTemplate);
    } catch (error) {
      console.error('Failed to load template:', error);
      setError('Failed to load collection template');
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleCreateCollection();
    } else {
      const isValid = await validateStep(activeStep);
      if (isValid) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const errors: string[] = [];

    switch (step) {
      case 0: // Category selection
        if (!selectedCategory) {
          errors.push('Please select a collection category');
        }
        break;
      
      case 1: // Template selection
        if (!selectedTemplate) {
          errors.push('Please select a collection template');
        }
        break;
      
      case 2: // Configuration
        if (!collectionName.trim()) {
          errors.push('Collection name is required');
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collectionName)) {
          errors.push('Collection name must start with a letter and contain only letters, numbers, and underscores');
        }
        
        if (selectedTemplate === 'custom' && customFields.length === 0) {
          errors.push('Custom collections must have at least one field');
        }
        
        // Check if collection already exists
        const exists = await creatorService.checkCollectionExists(collectionName, user?.organizationId);
        if (exists) {
          errors.push('A collection with this name already exists');
        }
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCreateCollection = async () => {
    setLoading(true);
    setError('');

    try {
      if (!template || !user?.organizationId) {
        throw new Error('Missing required data for collection creation');
      }

      // Create the collection with all necessary components
      const result = await creatorService.createCollection({
        name: collectionName,
        template: template,
        organizationId: user.organizationId,
        createdBy: user.firebaseUid || user.id,
        customFields: selectedTemplate === 'custom' ? customFields : undefined
      });

      if (result.success) {
        onCollectionCreated(collectionName, template);
        onClose();
        resetWizard();
      } else {
        setError(result.error || 'Failed to create collection');
      }
    } catch (error: any) {
      console.error('Collection creation failed:', error);
      setError(error.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setActiveStep(0);
    setSelectedCategory('');
    setSelectedTemplate('');
    setCollectionName('');
    setCustomFields([]);
    setTemplate(null);
    setError('');
    setValidationErrors([]);
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        name: '',
        type: 'string',
        required: false,
        indexed: false
      }
    ]);
  };

  const updateCustomField = (index: number, field: Partial<CollectionField>) => {
    const updatedFields = [...customFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setCustomFields(updatedFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderCategorySelection();
      case 1:
        return renderTemplateSelection();
      case 2:
        return renderConfiguration();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  const renderCategorySelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Collection Category
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the type of collection you want to create. Each category provides templates
        that follow the Dashboard app's schema patterns.
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(COLLECTION_CATEGORIES).map(([key, category]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedCategory === key ? 2 : 1,
                borderColor: selectedCategory === key ? 'primary.main' : 'divider',
                '&:hover': { borderColor: 'primary.main' }
              }}
              onClick={() => setSelectedCategory(key)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {category.icon}
                  <Typography variant="h6" ml={1}>
                    {category.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
                <Box mt={1}>
                  <Chip 
                    size="small" 
                    label={`${category.templates.length} templates`}
                    color={selectedCategory === key ? 'primary' : 'default'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTemplateSelection = () => {
    const category = COLLECTION_CATEGORIES[selectedCategory as keyof typeof COLLECTION_CATEGORIES];
    if (!category) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Choose Collection Template
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a template from the {category.name} category. Templates include
          pre-configured fields, indexes, and security rules.
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Template</InputLabel>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            label="Template"
          >
            {category.templates.map((templateName) => (
              <MenuItem key={templateName} value={templateName}>
                <Box display="flex" alignItems="center" width="100%">
                  <Typography>{templateName}</Typography>
                  {templateName === 'custom' && (
                    <Chip size="small" label="Custom" color="secondary" sx={{ ml: 1 }} />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedTemplate && selectedTemplate !== 'custom' && (
          <Box mt={2}>
            <Alert severity="info" icon={<InfoIcon />}>
              This template includes pre-configured fields, indexes, and security rules
              based on the Dashboard app's schema patterns.
            </Alert>
          </Box>
        )}
      </Box>
    );
  };

  const renderConfiguration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Collection
      </Typography>
      
      <TextField
        fullWidth
        label="Collection Name"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        margin="normal"
        helperText="Must start with a letter and contain only letters, numbers, and underscores"
        error={validationErrors.some(error => error.includes('Collection name'))}
      />

      {selectedTemplate === 'custom' && (
        <Box mt={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Custom Fields</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addCustomField}
              variant="outlined"
              size="small"
            >
              Add Field
            </Button>
          </Box>

          {customFields.map((field, index) => (
            <Card key={index} sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Field Name"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, { name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, { type: e.target.value as any })}
                      label="Type"
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="timestamp">Timestamp</MenuItem>
                      <MenuItem value="array">Array</MenuItem>
                      <MenuItem value="object">Object</MenuItem>
                      <MenuItem value="reference">Reference</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Required</InputLabel>
                    <Select
                      value={field.required ? "true" : "false"}
                      onChange={(e) => updateCustomField(index, { required: e.target.value === "true" })}
                      label="Required"
                    >
                      <MenuItem value="false">No</MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Indexed</InputLabel>
                    <Select
                      value={field.indexed ? "true" : "false"}
                      onChange={(e) => updateCustomField(index, { indexed: e.target.value === "true" })}
                      label="Indexed"
                    >
                      <MenuItem value="false">No</MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={field.description || ''}
                    onChange={(e) => updateCustomField(index, { description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeCustomField(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Card>
          ))}

          {customFields.length === 0 && (
            <Alert severity="warning">
              Custom collections require at least one field. Click "Add Field" to get started.
            </Alert>
          )}
        </Box>
      )}

      {template && (
        <Box mt={3}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Template Preview</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Fields:</Typography>
                <List dense>
                  {template.fields.map((field, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {field.required ? <CheckCircleIcon color="success" /> : <InfoIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={field.name}
                        secondary={`${field.type}${field.required ? ' (required)' : ''}${field.indexed ? ' (indexed)' : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Create Collection
      </Typography>
      
      {template && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Collection Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                  <Typography variant="body1">{collectionName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Typography variant="body1">
                    {COLLECTION_CATEGORIES[selectedCategory as keyof typeof COLLECTION_CATEGORIES]?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Template:</Typography>
                  <Typography variant="body1">{selectedTemplate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Organization Scoped:</Typography>
                  <Typography variant="body1">{template.organizationScoped ? 'Yes' : 'No'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                What will be created:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Firestore Collection" 
                    secondary={`Collection '${collectionName}' with ${template.fields.length} fields`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Firestore Indexes" 
                    secondary={`${template.indexes.length} optimized indexes for queries`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Security Rules" 
                    secondary="Organization-scoped access control rules"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Alert severity="info">
            <Typography variant="subtitle2">Ready to Create</Typography>
            <Typography variant="body2">
              This collection will be created in your organization's Firebase project with
              all necessary indexes and security rules. The collection will follow the
              Dashboard app's schema patterns for consistency.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '600px' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ExtensionIcon sx={{ mr: 1 }} />
          Create New Collection
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Please fix the following issues:</Typography>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {activeStep === steps.length - 1 ? 'Create Collection' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollectionCreationWizard;
