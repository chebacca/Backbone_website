/**
 * Team Member Template Service
 * 
 * Pre-configured role templates and bulk operations for team members
 * with industry-specific configurations and best practices.
 */

import { StreamlinedTeamMember } from './UnifiedDataService';

export interface TeamMemberTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry: string[];
  role: 'admin' | 'member' | 'viewer' | 'owner';
  permissions: string[];
  defaultSettings: {
    department?: string;
    position?: string;
    licenseType: string;
    status: 'active' | 'pending' | 'suspended';
    customFields?: { [key: string]: any };
  };
  isDefault: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 
  | 'executive'
  | 'management'
  | 'technical'
  | 'creative'
  | 'support'
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'custom';

export interface BulkOperation {
  id: string;
  name: string;
  description: string;
  operation: 'create' | 'update' | 'delete' | 'assign_license' | 'change_role' | 'update_role' | 'change_status' | 'bulk_invite';
  template?: TeamMemberTemplate;
  criteria: BulkCriteria;
  affectedMembers: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: BulkOperationResult;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface BulkCriteria {
  memberIds?: string[];
  roles?: string[];
  departments?: string[];
  statuses?: string[];
  licenseTypes?: string[];
  customFilters?: { [key: string]: any };
}

export interface BulkOperationResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: BulkOperationError[];
  details: { [memberId: string]: string };
}

export interface BulkOperationError {
  memberId: string;
  error: string;
  field?: string;
}

export class TeamMemberTemplateService {
  private static instance: TeamMemberTemplateService;
  private templates: TeamMemberTemplate[] = [];
  private bulkOperations: BulkOperation[] = [
    {
      id: 'sample_1',
      name: 'Update All Members to Professional License',
      description: 'Upgrade all team members to Professional license type',
      operation: 'assign_license',
      criteria: {
        roles: ['member', 'admin'],
        statuses: ['active']
      },
      affectedMembers: [],
      status: 'completed',
      progress: 100,
      results: {
        totalProcessed: 15,
        successful: 15,
        failed: 0,
        errors: [],
        details: {}
      },
      createdBy: 'system',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'sample_2',
      name: 'Bulk Role Update - Engineering Team',
      description: 'Update all engineering team members to admin role',
      operation: 'update_role',
      criteria: {
        departments: ['Engineering'],
        statuses: ['active']
      },
      affectedMembers: [],
      status: 'pending',
      progress: 0,
      results: {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        details: {}
      },
      createdBy: 'system',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 'sample_3',
      name: 'Activate Pending Members',
      description: 'Activate all pending team member invitations',
      operation: 'change_status',
      criteria: {
        statuses: ['pending']
      },
      affectedMembers: [],
      status: 'running',
      progress: 60,
      results: {
        totalProcessed: 5,
        successful: 3,
        failed: 0,
        errors: [],
        details: {}
      },
      createdBy: 'system',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    }
  ];

  public static getInstance(): TeamMemberTemplateService {
    if (!TeamMemberTemplateService.instance) {
      TeamMemberTemplateService.instance = new TeamMemberTemplateService();
      TeamMemberTemplateService.instance.initializeDefaultTemplates();
    }
    return TeamMemberTemplateService.instance;
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    this.templates = [
      {
        id: 'executive_admin',
        name: 'Executive Administrator',
        description: 'Full administrative access with all permissions',
        category: 'executive',
        industry: ['all'],
        role: 'admin',
        permissions: [
          'manage_team',
          'manage_licenses',
          'manage_projects',
          'view_analytics',
          'manage_organization',
          'audit_access'
        ],
        defaultSettings: {
          department: 'Executive',
          position: 'Administrator',
          licenseType: 'ENTERPRISE',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'project_manager',
        name: 'Project Manager',
        description: 'Project management role with team coordination permissions',
        category: 'management',
        industry: ['all'],
        role: 'member',
        permissions: [
          'manage_projects',
          'assign_team_members',
          'view_analytics',
          'manage_tasks'
        ],
        defaultSettings: {
          department: 'Project Management',
          position: 'Project Manager',
          licenseType: 'PROFESSIONAL',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'software_developer',
        name: 'Software Developer',
        description: 'Technical role for software development teams',
        category: 'technical',
        industry: ['technology', 'software', 'it'],
        role: 'member',
        permissions: [
          'access_projects',
          'manage_tasks',
          'view_documentation'
        ],
        defaultSettings: {
          department: 'Engineering',
          position: 'Software Developer',
          licenseType: 'PROFESSIONAL',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'creative_director',
        name: 'Creative Director',
        description: 'Creative leadership role for design and content teams',
        category: 'creative',
        industry: ['media', 'advertising', 'design', 'entertainment'],
        role: 'member',
        permissions: [
          'manage_creative_projects',
          'approve_content',
          'manage_assets',
          'view_analytics'
        ],
        defaultSettings: {
          department: 'Creative',
          position: 'Creative Director',
          licenseType: 'PROFESSIONAL',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sales_representative',
        name: 'Sales Representative',
        description: 'Sales role with client management permissions',
        category: 'sales',
        industry: ['all'],
        role: 'member',
        permissions: [
          'manage_clients',
          'view_sales_analytics',
          'manage_opportunities'
        ],
        defaultSettings: {
          department: 'Sales',
          position: 'Sales Representative',
          licenseType: 'BASIC',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'support_specialist',
        name: 'Support Specialist',
        description: 'Customer support role with limited access',
        category: 'support',
        industry: ['all'],
        role: 'viewer',
        permissions: [
          'view_tickets',
          'manage_support_cases',
          'view_documentation'
        ],
        defaultSettings: {
          department: 'Support',
          position: 'Support Specialist',
          licenseType: 'BASIC',
          status: 'active'
        },
        isDefault: true,
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Get all templates
   */
  getTemplates(category?: TemplateCategory, industry?: string): TeamMemberTemplate[] {
    let filteredTemplates = [...this.templates];

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (industry) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.industry.includes('all') || t.industry.includes(industry)
      );
    }

    return filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): TeamMemberTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  /**
   * Create custom template
   */
  createTemplate(
    template: Omit<TeamMemberTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'isCustom'>,
    createdBy: string
  ): TeamMemberTemplate {
    const newTemplate: TeamMemberTemplate = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isDefault: false,
      isCustom: true,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  /**
   * Update template
   */
  updateTemplate(id: string, updates: Partial<TeamMemberTemplate>): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date()
    };

    return true;
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1 || this.templates[index].isDefault) return false;

    this.templates.splice(index, 1);
    return true;
  }

  /**
   * Create team member from template
   */
  createMemberFromTemplate(
    templateId: string,
    memberData: Partial<StreamlinedTeamMember>,
    organizationId: string
  ): StreamlinedTeamMember {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const member: StreamlinedTeamMember = {
      id: '', // Will be generated by the service
      email: memberData.email || '',
      firstName: memberData.firstName || '',
      lastName: memberData.lastName || '',
      role: template.role,
      status: template.defaultSettings.status,
      organization: {
        id: organizationId,
        name: '',
        tier: 'BASIC'
      },
      organizationId,
      department: template.defaultSettings.department || memberData.department || '',
      position: template.defaultSettings.position || memberData.position || '',
      phone: memberData.phone || '',
      licenseType: template.defaultSettings.licenseType,
      assignedProjects: [],
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...memberData,
      ...template.defaultSettings.customFields
    };

    return member;
  }

  /**
   * Create bulk operation
   */
  createBulkOperation(
    name: string,
    description: string,
    operation: BulkOperation['operation'],
    criteria: BulkCriteria,
    createdBy: string,
    templateId?: string
  ): BulkOperation {
    const bulkOp: BulkOperation = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      operation,
      template: templateId ? this.getTemplate(templateId) : undefined,
      criteria,
      affectedMembers: [],
      status: 'pending',
      progress: 0,
      results: {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        details: {}
      },
      createdBy,
      createdAt: new Date()
    };

    this.bulkOperations.push(bulkOp);
    return bulkOp;
  }

  /**
   * Execute bulk operation
   */
  async executeBulkOperation(
    operationId: string,
    members: StreamlinedTeamMember[],
    onProgress?: (progress: number) => void
  ): Promise<BulkOperationResult> {
    const operation = this.bulkOperations.find(op => op.id === operationId);
    if (!operation) {
      throw new Error('Bulk operation not found');
    }

    operation.status = 'running';
    operation.progress = 0;

    const result: BulkOperationResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      details: {}
    };

    // Filter members based on criteria
    const filteredMembers = this.filterMembersByCriteria(members, operation.criteria);
    operation.affectedMembers = filteredMembers.map(m => m.id);

    result.totalProcessed = filteredMembers.length;

    // Execute operation based on type
    for (let i = 0; i < filteredMembers.length; i++) {
      const member = filteredMembers[i];
      
      try {
        switch (operation.operation) {
          case 'create':
            // This would typically call the actual service
            result.details[member.id] = 'Created successfully';
            result.successful++;
            break;
          case 'update':
            // This would typically call the actual service
            result.details[member.id] = 'Updated successfully';
            result.successful++;
            break;
          case 'delete':
            // This would typically call the actual service
            result.details[member.id] = 'Deleted successfully';
            result.successful++;
            break;
          case 'assign_license':
            // This would typically call the actual service
            result.details[member.id] = 'License assigned successfully';
            result.successful++;
            break;
          case 'change_role':
            // This would typically call the actual service
            result.details[member.id] = 'Role changed successfully';
            result.successful++;
            break;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          memberId: member.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.details[member.id] = 'Failed';
      }

      // Update progress
      operation.progress = Math.round(((i + 1) / filteredMembers.length) * 100);
      if (onProgress) {
        onProgress(operation.progress);
      }
    }

    operation.results = result;
    operation.status = result.failed === 0 ? 'completed' : 'failed';
    operation.completedAt = new Date();

    return result;
  }

  /**
   * Filter members based on bulk criteria
   */
  private filterMembersByCriteria(
    members: StreamlinedTeamMember[],
    criteria: BulkCriteria
  ): StreamlinedTeamMember[] {
    let filteredMembers = [...members];

    if (criteria.memberIds && criteria.memberIds.length > 0) {
      filteredMembers = filteredMembers.filter(m => criteria.memberIds!.includes(m.id));
    }

    if (criteria.roles && criteria.roles.length > 0) {
      filteredMembers = filteredMembers.filter(m => criteria.roles!.includes(m.role));
    }

    if (criteria.departments && criteria.departments.length > 0) {
      filteredMembers = filteredMembers.filter(m => 
        m.department && criteria.departments!.includes(m.department)
      );
    }

    if (criteria.statuses && criteria.statuses.length > 0) {
      filteredMembers = filteredMembers.filter(m => criteria.statuses!.includes(m.status));
    }

    if (criteria.licenseTypes && criteria.licenseTypes.length > 0) {
      filteredMembers = filteredMembers.filter(m => 
        m.licenseType && criteria.licenseTypes!.includes(m.licenseType)
      );
    }

    return filteredMembers;
  }

  /**
   * Get bulk operations
   */
  getBulkOperations(createdBy?: string): BulkOperation[] {
    let operations = [...this.bulkOperations];

    if (createdBy) {
      operations = operations.filter(op => op.createdBy === createdBy);
    }

    return operations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get bulk operation by ID
   */
  getBulkOperation(id: string): BulkOperation | undefined {
    return this.bulkOperations.find(op => op.id === id);
  }

  /**
   * Get template categories
   */
  getCategories(): TemplateCategory[] {
    return [
      'executive',
      'management',
      'technical',
      'creative',
      'support',
      'sales',
      'marketing',
      'operations',
      'custom'
    ];
  }

  /**
   * Get industries
   */
  getIndustries(): string[] {
    return [
      'technology',
      'software',
      'it',
      'media',
      'advertising',
      'design',
      'entertainment',
      'finance',
      'healthcare',
      'education',
      'retail',
      'manufacturing',
      'consulting',
      'nonprofit',
      'government',
      'all'
    ];
  }
}

export const teamMemberTemplateService = TeamMemberTemplateService.getInstance();
