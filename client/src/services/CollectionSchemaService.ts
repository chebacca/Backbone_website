/**
 * 🏗️ COLLECTION SCHEMA SERVICE
 * 
 * Manages collection templates and schemas based on the Dashboard app's structure.
 * Provides pre-defined templates with proper fields, indexes, and security rules.
 */

import { Timestamp } from 'firebase/firestore';

export interface CollectionField {
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

export interface CollectionTemplate {
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

export class CollectionSchemaService {
  private templates: Map<string, CollectionTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Sessions & Workflows Templates
    this.templates.set('sessions', {
      name: 'sessions',
      category: 'sessions',
      displayName: 'Sessions',
      description: 'Production sessions with scheduling and status tracking',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true, description: 'Unique session identifier' },
        { name: 'organizationId', type: 'string', required: true, indexed: true, description: 'Organization ID for access control' },
        { name: 'projectId', type: 'string', required: false, indexed: true, description: 'Associated project ID' },
        { name: 'sessionName', type: 'string', required: true, indexed: false, description: 'Display name for the session' },
        { name: 'description', type: 'string', required: false, indexed: false, description: 'Session description' },
        { name: 'status', type: 'string', required: true, indexed: true, description: 'Session status', validation: { enum: ['PLANNING', 'SCHEDULED', 'IN_PRODUCTION', 'POST_PRODUCTION', 'COMPLETED', 'CANCELLED'] } },
        { name: 'sessionDate', type: 'string', required: false, indexed: true, description: 'Session date (YYYY-MM-DD)' },
        { name: 'callTime', type: 'timestamp', required: false, indexed: true, description: 'Call time' },
        { name: 'wrapTime', type: 'timestamp', required: false, indexed: true, description: 'Wrap time' },
        { name: 'location', type: 'string', required: false, indexed: false, description: 'Session location' },
        { name: 'assignedTo', type: 'array', required: false, indexed: true, description: 'Array of assigned user IDs' },
        { name: 'createdBy', type: 'string', required: true, indexed: true, description: 'User ID who created the session' },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true, description: 'Creation timestamp' },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true, description: 'Last update timestamp' }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'projectId', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'assignedTo', order: 'array-contains' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PRODUCER', 'DIRECTOR'],
        admin: ['ADMIN', 'OWNER']
      },
      relationships: [
        { collection: 'projects', type: 'many-to-many', field: 'projectId' },
        { collection: 'sessionTasks', type: 'one-to-many', field: 'sessionId' }
      ]
    });

    this.templates.set('sessionTasks', {
      name: 'sessionTasks',
      category: 'sessions',
      displayName: 'Session Tasks',
      description: 'Tasks associated with production sessions',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'sessionId', type: 'string', required: true, indexed: true },
        { name: 'taskName', type: 'string', required: true, indexed: false },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
        { name: 'priority', type: 'string', required: false, indexed: true, validation: { enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
        { name: 'assignedTo', type: 'string', required: false, indexed: true },
        { name: 'dueDate', type: 'timestamp', required: false, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'sessionId', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'assignedTo', order: 'asc' },
            { field: 'dueDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PRODUCER', 'COORDINATOR'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('mediaFiles', {
      name: 'mediaFiles',
      category: 'media',
      displayName: 'Media Files',
      description: 'Media file tracking and management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'sessionId', type: 'string', required: false, indexed: true },
        { name: 'fileName', type: 'string', required: true, indexed: true },
        { name: 'fileType', type: 'string', required: true, indexed: true },
        { name: 'fileSize', type: 'number', required: false, indexed: false },
        { name: 'duration', type: 'number', required: false, indexed: false },
        { name: 'resolution', type: 'string', required: false, indexed: false },
        { name: 'codec', type: 'string', required: false, indexed: false },
        { name: 'storageUrl', type: 'string', required: true, indexed: false },
        { name: 'thumbnailUrl', type: 'string', required: false, indexed: false },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'uploadedBy', type: 'string', required: true, indexed: true },
        { name: 'uploadedAt', type: 'timestamp', required: true, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['UPLOADING', 'PROCESSING', 'READY', 'ARCHIVED', 'ERROR'] } }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'sessionId', order: 'asc' },
            { field: 'fileType', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'uploadedAt', order: 'desc' },
            { field: 'fileType', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'tags', order: 'array-contains' },
            { field: 'uploadedAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'MEDIA_MANAGER', 'EDITOR'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('projects', {
      name: 'projects',
      category: 'business',
      displayName: 'Projects',
      description: 'Project management and tracking',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'name', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] } },
        { name: 'priority', type: 'string', required: false, indexed: true, validation: { enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
        { name: 'startDate', type: 'timestamp', required: false, indexed: true },
        { name: 'endDate', type: 'timestamp', required: false, indexed: true },
        { name: 'budget', type: 'number', required: false, indexed: false },
        { name: 'clientId', type: 'string', required: false, indexed: true },
        { name: 'projectManager', type: 'string', required: false, indexed: true },
        { name: 'teamMembers', type: 'array', required: false, indexed: true },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'isActive', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'projectManager', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PROJECT_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('teamMembers', {
      name: 'teamMembers',
      category: 'team',
      displayName: 'Team Members',
      description: 'Team member management and roles',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'userId', type: 'string', required: true, indexed: true },
        { name: 'email', type: 'string', required: true, indexed: true },
        { name: 'firstName', type: 'string', required: true, indexed: false },
        { name: 'lastName', type: 'string', required: true, indexed: false },
        { name: 'role', type: 'string', required: true, indexed: true },
        { name: 'department', type: 'string', required: false, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] } },
        { name: 'permissions', type: 'array', required: false, indexed: false },
        { name: 'joinedAt', type: 'timestamp', required: true, indexed: true },
        { name: 'lastActiveAt', type: 'timestamp', required: false, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'email', order: 'asc' },
            { field: 'role', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'department', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'HR_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('inventoryItems', {
      name: 'inventoryItems',
      category: 'inventory',
      displayName: 'Inventory Items',
      description: 'Equipment and inventory tracking',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'itemName', type: 'string', required: true, indexed: true },
        { name: 'category', type: 'string', required: true, indexed: true },
        { name: 'subcategory', type: 'string', required: false, indexed: true },
        { name: 'serialNumber', type: 'string', required: false, indexed: true },
        { name: 'barcode', type: 'string', required: false, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST'] } },
        { name: 'condition', type: 'string', required: false, indexed: true, validation: { enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'] } },
        { name: 'location', type: 'string', required: false, indexed: true },
        { name: 'assignedTo', type: 'string', required: false, indexed: true },
        { name: 'purchaseDate', type: 'timestamp', required: false, indexed: true },
        { name: 'purchasePrice', type: 'number', required: false, indexed: false },
        { name: 'warrantyExpiry', type: 'timestamp', required: false, indexed: true },
        { name: 'notes', type: 'string', required: false, indexed: false },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'category', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'assignedTo', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'INVENTORY_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add missing media templates
    this.templates.set('reviews', {
      name: 'reviews',
      category: 'media',
      displayName: 'Reviews',
      description: 'Content review and approval system',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'sessionId', type: 'string', required: false, indexed: true },
        { name: 'mediaFileId', type: 'string', required: false, indexed: true },
        { name: 'reviewTitle', type: 'string', required: true, indexed: false },
        { name: 'reviewType', type: 'string', required: true, indexed: true, validation: { enum: ['CONTENT', 'TECHNICAL', 'CREATIVE', 'FINAL'] } },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_NEEDED'] } },
        { name: 'reviewerId', type: 'string', required: true, indexed: true },
        { name: 'reviewerName', type: 'string', required: false, indexed: false },
        { name: 'reviewNotes', type: 'string', required: false, indexed: false },
        { name: 'dueDate', type: 'timestamp', required: false, indexed: true },
        { name: 'completedAt', type: 'timestamp', required: false, indexed: true },
        { name: 'priority', type: 'string', required: false, indexed: true, validation: { enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'dueDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'reviewerId', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PRODUCER', 'DIRECTOR', 'POST_SUPERVISOR'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('reports', {
      name: 'reports',
      category: 'media',
      displayName: 'Reports',
      description: 'Analytics and reporting system',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'reportTitle', type: 'string', required: true, indexed: true },
        { name: 'reportType', type: 'string', required: true, indexed: true, validation: { enum: ['ANALYTICS', 'PERFORMANCE', 'USAGE', 'FINANCIAL', 'OPERATIONAL'] } },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'ARCHIVED'] } },
        { name: 'generatedBy', type: 'string', required: true, indexed: true },
        { name: 'reportData', type: 'object', required: false, indexed: false },
        { name: 'parameters', type: 'object', required: false, indexed: false },
        { name: 'dateRange', type: 'object', required: false, indexed: false },
        { name: 'fileUrl', type: 'string', required: false, indexed: false },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'isPublic', type: 'boolean', required: false, indexed: true, defaultValue: false },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'reportType', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'generatedBy', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('notes', {
      name: 'notes',
      category: 'media',
      displayName: 'Notes',
      description: 'General notes and comments',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'title', type: 'string', required: true, indexed: true },
        { name: 'content', type: 'string', required: true, indexed: false },
        { name: 'noteType', type: 'string', required: false, indexed: true, validation: { enum: ['GENERAL', 'PRODUCTION', 'TECHNICAL', 'CREATIVE', 'MEETING'] } },
        { name: 'authorId', type: 'string', required: true, indexed: true },
        { name: 'authorName', type: 'string', required: false, indexed: false },
        { name: 'sessionId', type: 'string', required: false, indexed: true },
        { name: 'projectId', type: 'string', required: false, indexed: true },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'isPrivate', type: 'boolean', required: false, indexed: true, defaultValue: false },
        { name: 'attachments', type: 'array', required: false, indexed: false },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'authorId', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'noteType', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['MEMBER', 'ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('callSheets', {
      name: 'callSheets',
      category: 'media',
      displayName: 'Call Sheets',
      description: 'Production call sheets',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'sessionId', type: 'string', required: true, indexed: true },
        { name: 'callSheetNumber', type: 'string', required: true, indexed: true },
        { name: 'productionDate', type: 'timestamp', required: true, indexed: true },
        { name: 'location', type: 'string', required: false, indexed: true },
        { name: 'callTime', type: 'timestamp', required: false, indexed: true },
        { name: 'wrapTime', type: 'timestamp', required: false, indexed: true },
        { name: 'weather', type: 'string', required: false, indexed: false },
        { name: 'sunrise', type: 'string', required: false, indexed: false },
        { name: 'sunset', type: 'string', required: false, indexed: false },
        { name: 'crewList', type: 'array', required: false, indexed: false },
        { name: 'equipmentList', type: 'array', required: false, indexed: false },
        { name: 'specialNotes', type: 'string', required: false, indexed: false },
        { name: 'emergencyContacts', type: 'array', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['DRAFT', 'PUBLISHED', 'REVISED', 'CANCELLED'] } },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'sessionId', order: 'asc' },
            { field: 'productionDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'productionDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PRODUCER', 'COORDINATOR'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('stages', {
      name: 'stages',
      category: 'media',
      displayName: 'Stages',
      description: 'Production stages and milestones',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'projectId', type: 'string', required: false, indexed: true },
        { name: 'stageName', type: 'string', required: true, indexed: true },
        { name: 'stageType', type: 'string', required: true, indexed: true, validation: { enum: ['PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'DELIVERY', 'ARCHIVE'] } },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'] } },
        { name: 'startDate', type: 'timestamp', required: false, indexed: true },
        { name: 'endDate', type: 'timestamp', required: false, indexed: true },
        { name: 'estimatedDuration', type: 'number', required: false, indexed: false },
        { name: 'actualDuration', type: 'number', required: false, indexed: false },
        { name: 'assignedTo', type: 'array', required: false, indexed: true },
        { name: 'dependencies', type: 'array', required: false, indexed: false },
        { name: 'deliverables', type: 'array', required: false, indexed: false },
        { name: 'completionPercentage', type: 'number', required: false, indexed: true, defaultValue: 0 },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'projectId', order: 'asc' },
            { field: 'stageType', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'startDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PRODUCER', 'PROJECT_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add missing inventory templates
    this.templates.set('inventory', {
      name: 'inventory',
      category: 'inventory',
      displayName: 'Inventory',
      description: 'General inventory management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'inventoryName', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'location', type: 'string', required: false, indexed: true },
        { name: 'managedBy', type: 'string', required: false, indexed: true },
        { name: 'totalItems', type: 'number', required: false, indexed: false, defaultValue: 0 },
        { name: 'totalValue', type: 'number', required: false, indexed: false, defaultValue: 0 },
        { name: 'lastAuditDate', type: 'timestamp', required: false, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED'] } },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'INVENTORY_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('networks', {
      name: 'networks',
      category: 'inventory',
      displayName: 'Networks',
      description: 'Network configuration and management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'networkName', type: 'string', required: true, indexed: true },
        { name: 'networkType', type: 'string', required: true, indexed: true, validation: { enum: ['LAN', 'WAN', 'WIFI', 'VPN', 'CELLULAR'] } },
        { name: 'ipRange', type: 'string', required: false, indexed: true },
        { name: 'subnet', type: 'string', required: false, indexed: false },
        { name: 'gateway', type: 'string', required: false, indexed: false },
        { name: 'dns', type: 'array', required: false, indexed: false },
        { name: 'vlan', type: 'number', required: false, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR'] } },
        { name: 'location', type: 'string', required: false, indexed: true },
        { name: 'managedBy', type: 'string', required: false, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'networkType', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'NETWORK_ADMIN'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('networkIPAssignments', {
      name: 'networkIPAssignments',
      category: 'inventory',
      displayName: 'Network IP Assignments',
      description: 'IP address management and assignments',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'ipAddress', type: 'string', required: true, indexed: true },
        { name: 'networkId', type: 'string', required: true, indexed: true },
        { name: 'deviceName', type: 'string', required: false, indexed: true },
        { name: 'deviceType', type: 'string', required: false, indexed: true },
        { name: 'macAddress', type: 'string', required: false, indexed: true },
        { name: 'assignedTo', type: 'string', required: false, indexed: true },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ASSIGNED', 'AVAILABLE', 'RESERVED', 'BLOCKED'] } },
        { name: 'assignedDate', type: 'timestamp', required: false, indexed: true },
        { name: 'notes', type: 'string', required: false, indexed: false },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'networkId', order: 'asc' },
            { field: 'status', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'NETWORK_ADMIN'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add missing team templates
    this.templates.set('roles', {
      name: 'roles',
      category: 'team',
      displayName: 'Roles',
      description: 'Role definitions and permissions',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'roleName', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'hierarchy', type: 'number', required: true, indexed: true },
        { name: 'permissions', type: 'array', required: false, indexed: false },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'hierarchy', order: 'asc' },
            { field: 'isActive', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('permissions', {
      name: 'permissions',
      category: 'team',
      displayName: 'Permissions',
      description: 'Granular permission management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'roleId', type: 'string', required: true, indexed: true },
        { name: 'resource', type: 'string', required: true, indexed: true },
        { name: 'action', type: 'string', required: true, indexed: true },
        { name: 'granted', type: 'boolean', required: true, indexed: true },
        { name: 'conditions', type: 'object', required: false, indexed: false },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'roleId', order: 'asc' },
            { field: 'resource', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('contacts', {
      name: 'contacts',
      category: 'team',
      displayName: 'Contacts',
      description: 'Contact management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'firstName', type: 'string', required: true, indexed: true },
        { name: 'lastName', type: 'string', required: true, indexed: true },
        { name: 'email', type: 'string', required: false, indexed: true },
        { name: 'phone', type: 'string', required: false, indexed: true },
        { name: 'company', type: 'string', required: false, indexed: true },
        { name: 'title', type: 'string', required: false, indexed: false },
        { name: 'contactType', type: 'string', required: false, indexed: true, validation: { enum: ['CLIENT', 'VENDOR', 'CONTRACTOR', 'PARTNER', 'OTHER'] } },
        { name: 'address', type: 'object', required: false, indexed: false },
        { name: 'notes', type: 'string', required: false, indexed: false },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'contactType', order: 'asc' },
            { field: 'lastName', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'BUSINESS_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add missing business templates
    this.templates.set('clients', {
      name: 'clients',
      category: 'business',
      displayName: 'Clients',
      description: 'Client relationship management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'clientName', type: 'string', required: true, indexed: true },
        { name: 'companyName', type: 'string', required: false, indexed: true },
        { name: 'email', type: 'string', required: false, indexed: true },
        { name: 'phone', type: 'string', required: false, indexed: true },
        { name: 'address', type: 'object', required: false, indexed: false },
        { name: 'clientType', type: 'string', required: false, indexed: true, validation: { enum: ['INDIVIDUAL', 'BUSINESS', 'ENTERPRISE', 'GOVERNMENT'] } },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'FORMER'] } },
        { name: 'accountManager', type: 'string', required: false, indexed: true },
        { name: 'contractValue', type: 'number', required: false, indexed: false },
        { name: 'notes', type: 'string', required: false, indexed: false },
        { name: 'tags', type: 'array', required: false, indexed: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'clientName', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'BUSINESS_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add remaining missing templates
    this.templates.set('mapLayouts', {
      name: 'mapLayouts',
      category: 'inventory',
      displayName: 'Map Layouts',
      description: 'Facility and equipment layouts',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'layoutName', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'layoutType', type: 'string', required: true, indexed: true, validation: { enum: ['FLOOR_PLAN', 'SITE_MAP', 'NETWORK_DIAGRAM', 'EQUIPMENT_LAYOUT'] } },
        { name: 'imageUrl', type: 'string', required: false, indexed: false },
        { name: 'coordinates', type: 'object', required: false, indexed: false },
        { name: 'scale', type: 'number', required: false, indexed: false },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'layoutType', order: 'asc' },
            { field: 'isActive', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'FACILITY_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('mapLocations', {
      name: 'mapLocations',
      category: 'inventory',
      displayName: 'Map Locations',
      description: 'Location markers and points of interest',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'mapLayoutId', type: 'string', required: true, indexed: true },
        { name: 'locationName', type: 'string', required: true, indexed: true },
        { name: 'locationType', type: 'string', required: true, indexed: true, validation: { enum: ['EQUIPMENT', 'ROOM', 'EXIT', 'UTILITY', 'STORAGE', 'OFFICE'] } },
        { name: 'coordinates', type: 'object', required: true, indexed: false },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'capacity', type: 'number', required: false, indexed: false },
        { name: 'isAccessible', type: 'boolean', required: false, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'mapLayoutId', order: 'asc' },
            { field: 'locationType', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'FACILITY_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('setupProfiles', {
      name: 'setupProfiles',
      category: 'inventory',
      displayName: 'Setup Profiles',
      description: 'Equipment setup configurations',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'profileName', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'equipmentType', type: 'string', required: true, indexed: true },
        { name: 'configuration', type: 'object', required: true, indexed: false },
        { name: 'settings', type: 'object', required: false, indexed: false },
        { name: 'isDefault', type: 'boolean', required: false, indexed: true, defaultValue: false },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'equipmentType', order: 'asc' },
            { field: 'isActive', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'TECHNICAL_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('schemas', {
      name: 'schemas',
      category: 'inventory',
      displayName: 'Schemas',
      description: 'Data schema definitions',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'schemaName', type: 'string', required: true, indexed: true },
        { name: 'version', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'schemaType', type: 'string', required: true, indexed: true, validation: { enum: ['DATABASE', 'API', 'FILE', 'MESSAGE'] } },
        { name: 'definition', type: 'object', required: true, indexed: false },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'schemaType', order: 'asc' },
            { field: 'version', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'DEVELOPER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('organizations', {
      name: 'organizations',
      category: 'team',
      displayName: 'Organizations',
      description: 'Organization metadata',
      organizationScoped: false, // Organizations are global
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'name', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'type', type: 'string', required: false, indexed: true, validation: { enum: ['BUSINESS', 'NON_PROFIT', 'GOVERNMENT', 'EDUCATIONAL'] } },
        { name: 'industry', type: 'string', required: false, indexed: true },
        { name: 'size', type: 'string', required: false, indexed: true, validation: { enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] } },
        { name: 'address', type: 'object', required: false, indexed: false },
        { name: 'website', type: 'string', required: false, indexed: false },
        { name: 'phone', type: 'string', required: false, indexed: false },
        { name: 'email', type: 'string', required: false, indexed: true },
        { name: 'settings', type: 'object', required: false, indexed: false },
        { name: 'isActive', type: 'boolean', required: true, indexed: true, defaultValue: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'name', order: 'asc' },
            { field: 'isActive', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('pbmProjects', {
      name: 'pbmProjects',
      category: 'business',
      displayName: 'PBM Projects',
      description: 'Project budget management projects',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'projectName', type: 'string', required: true, indexed: true },
        { name: 'projectCode', type: 'string', required: false, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'budget', type: 'number', required: false, indexed: false },
        { name: 'actualCost', type: 'number', required: false, indexed: false, defaultValue: 0 },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] } },
        { name: 'startDate', type: 'timestamp', required: false, indexed: true },
        { name: 'endDate', type: 'timestamp', required: false, indexed: true },
        { name: 'projectManager', type: 'string', required: false, indexed: true },
        { name: 'clientId', type: 'string', required: false, indexed: true },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'startDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PROJECT_MANAGER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('pbmSchedules', {
      name: 'pbmSchedules',
      category: 'business',
      displayName: 'PBM Schedules',
      description: 'Scheduling and resource allocation',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'projectId', type: 'string', required: true, indexed: true },
        { name: 'scheduleName', type: 'string', required: true, indexed: true },
        { name: 'description', type: 'string', required: false, indexed: false },
        { name: 'startDate', type: 'timestamp', required: true, indexed: true },
        { name: 'endDate', type: 'timestamp', required: true, indexed: true },
        { name: 'resources', type: 'array', required: false, indexed: false },
        { name: 'milestones', type: 'array', required: false, indexed: false },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'DELAYED', 'CANCELLED'] } },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'projectId', order: 'asc' },
            { field: 'startDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER', 'PROJECT_MANAGER', 'SCHEDULER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('licenses', {
      name: 'licenses',
      category: 'business',
      displayName: 'Licenses',
      description: 'License management',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'licenseKey', type: 'string', required: true, indexed: true },
        { name: 'licenseName', type: 'string', required: true, indexed: true },
        { name: 'licenseType', type: 'string', required: true, indexed: true, validation: { enum: ['BASIC', 'PRO', 'ENTERPRISE', 'TRIAL'] } },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED'] } },
        { name: 'assignedTo', type: 'string', required: false, indexed: true },
        { name: 'issuedDate', type: 'timestamp', required: true, indexed: true },
        { name: 'expiryDate', type: 'timestamp', required: false, indexed: true },
        { name: 'maxUsers', type: 'number', required: false, indexed: false },
        { name: 'features', type: 'array', required: false, indexed: false },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'expiryDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    this.templates.set('subscriptions', {
      name: 'subscriptions',
      category: 'business',
      displayName: 'Subscriptions',
      description: 'Subscription tracking',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true },
        { name: 'organizationId', type: 'string', required: true, indexed: true },
        { name: 'subscriptionName', type: 'string', required: true, indexed: true },
        { name: 'plan', type: 'string', required: true, indexed: true, validation: { enum: ['BASIC', 'PRO', 'ENTERPRISE'] } },
        { name: 'status', type: 'string', required: true, indexed: true, validation: { enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING'] } },
        { name: 'billingCycle', type: 'string', required: false, indexed: true, validation: { enum: ['MONTHLY', 'YEARLY', 'QUARTERLY'] } },
        { name: 'amount', type: 'number', required: false, indexed: false },
        { name: 'currency', type: 'string', required: false, indexed: false, defaultValue: 'USD' },
        { name: 'startDate', type: 'timestamp', required: true, indexed: true },
        { name: 'endDate', type: 'timestamp', required: false, indexed: true },
        { name: 'nextBillingDate', type: 'timestamp', required: false, indexed: true },
        { name: 'paymentMethod', type: 'string', required: false, indexed: false },
        { name: 'createdBy', type: 'string', required: true, indexed: true },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'status', order: 'asc' },
            { field: 'nextBillingDate', order: 'asc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });

    // Add custom template
    this.templates.set('custom', {
      name: 'custom',
      category: 'custom',
      displayName: 'Custom Collection',
      description: 'Create a custom collection with your own fields',
      organizationScoped: true,
      fields: [
        { name: 'id', type: 'string', required: true, indexed: true, description: 'Unique document identifier' },
        { name: 'organizationId', type: 'string', required: true, indexed: true, description: 'Organization ID for access control' },
        { name: 'createdAt', type: 'timestamp', required: true, indexed: true, description: 'Creation timestamp' },
        { name: 'updatedAt', type: 'timestamp', required: true, indexed: true, description: 'Last update timestamp' }
      ],
      indexes: [
        {
          fields: [
            { field: 'organizationId', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ],
          queryScope: 'COLLECTION'
        }
      ],
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    });
  }

  /**
   * Get a collection template by name
   */
  async getCollectionTemplate(templateName: string): Promise<CollectionTemplate> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    return { ...template }; // Return a copy
  }

  /**
   * Get all available templates for a category
   */
  getTemplatesByCategory(category: string): CollectionTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): CollectionTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Validate a custom field configuration
   */
  validateField(field: CollectionField): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate field name
    if (!field.name || !field.name.trim()) {
      errors.push('Field name is required');
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
      errors.push('Field name must start with a letter and contain only letters, numbers, and underscores');
    }

    // Reserved field names
    const reservedNames = ['id', 'organizationId', 'createdAt', 'updatedAt'];
    if (reservedNames.includes(field.name)) {
      errors.push(`'${field.name}' is a reserved field name`);
    }

    // Validate field type
    const validTypes = ['string', 'number', 'boolean', 'timestamp', 'array', 'object', 'reference'];
    if (!validTypes.includes(field.type)) {
      errors.push('Invalid field type');
    }

    // Validate validation rules
    if (field.validation) {
      if (field.type === 'number') {
        if (field.validation.min !== undefined && field.validation.max !== undefined) {
          if (field.validation.min >= field.validation.max) {
            errors.push('Minimum value must be less than maximum value');
          }
        }
      }
      
      if (field.type === 'string' && field.validation.pattern) {
        try {
          new RegExp(field.validation.pattern);
        } catch (e) {
          errors.push('Invalid regex pattern');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate Firestore indexes for a template
   */
  generateFirestoreIndexes(template: CollectionTemplate): any {
    return {
      indexes: template.indexes.map(index => ({
        collectionGroup: template.name,
        queryScope: index.queryScope,
        fields: index.fields.map(field => ({
          fieldPath: field.field,
          order: field.order === 'array-contains' ? undefined : field.order.toUpperCase(),
          arrayConfig: field.order === 'array-contains' ? 'CONTAINS' : undefined
        })).filter(field => field.order || field.arrayConfig)
      }))
    };
  }

  /**
   * Generate Firebase security rules for a template
   */
  generateSecurityRules(template: CollectionTemplate): string {
    const collectionName = template.name;
    const readRoles = template.securityRules.read.map(role => `'${role}'`).join(', ');
    const writeRoles = template.securityRules.write.map(role => `'${role}'`).join(', ');

    return `
    // ${template.displayName} Collection
    match /${collectionName}/{docId} {
      allow read: if isAuthenticated() && 
        belongsToOrganization(resource.data.organizationId) &&
        hasAnyRole([${readRoles}]);
      
      allow write: if isAuthenticated() && 
        belongsToOrganization(request.resource.data.organizationId) &&
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
      
      allow create: if isAuthenticated() && 
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
    }`;
  }

  /**
   * Create a custom template from user-defined fields
   */
  createCustomTemplate(
    name: string, 
    customFields: CollectionField[], 
    organizationScoped: boolean = true
  ): CollectionTemplate {
    // Base fields that are always included
    const baseFields: CollectionField[] = [
      { name: 'id', type: 'string', required: true, indexed: true, description: 'Unique document identifier' },
      { name: 'createdAt', type: 'timestamp', required: true, indexed: true, description: 'Creation timestamp' },
      { name: 'updatedAt', type: 'timestamp', required: true, indexed: true, description: 'Last update timestamp' }
    ];

    if (organizationScoped) {
      baseFields.splice(1, 0, { 
        name: 'organizationId', 
        type: 'string', 
        required: true, 
        indexed: true, 
        description: 'Organization ID for access control' 
      });
    }

    // Combine base fields with custom fields
    const allFields = [...baseFields, ...customFields];

    // Generate basic indexes
    const indexes = [
      {
        fields: organizationScoped 
          ? [{ field: 'organizationId', order: 'asc' as const }, { field: 'createdAt', order: 'desc' as const }]
          : [{ field: 'createdAt', order: 'desc' as const }],
        queryScope: 'COLLECTION' as const
      }
    ];

    // Add indexes for indexed custom fields
    customFields.forEach(field => {
      if (field.indexed && organizationScoped) {
        indexes.push({
          fields: [
            { field: 'organizationId', order: 'asc' as const },
            { field: field.name, order: 'asc' as const }
          ],
          queryScope: 'COLLECTION' as const
        });
      }
    });

    return {
      name,
      category: 'custom',
      displayName: name,
      description: `Custom collection: ${name}`,
      organizationScoped,
      fields: allFields,
      indexes,
      securityRules: {
        read: ['MEMBER', 'ADMIN', 'OWNER'],
        write: ['ADMIN', 'OWNER'],
        admin: ['ADMIN', 'OWNER']
      }
    };
  }
}

export default CollectionSchemaService;
