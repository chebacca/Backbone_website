/**
 * Team Member Types and Enums
 * 
 * Defines the structure for Team Members who can be assigned to projects
 * and their corresponding roles in the Backbone Desktop/Web application.
 */

export enum TeamMemberRole {
    ADMIN = 'admin',
    MEMBER = 'member'
}

export enum TeamMemberStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

export enum LicenseType {
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise',
    BASIC = 'basic'
}

/**
 * Team Member interface - represents users who can be assigned to projects
 */
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    
    // License and Status
    licenseType: LicenseType;
    status: TeamMemberStatus;
    
    // Organization
    organizationId: string;
    department?: string;
    company?: string;
    
    // Role and permissions
    role?: TeamMemberRole; // Add missing role property
    
    // Authentication
    firebaseUid?: string; // Add missing firebaseUid property
    hashedPassword?: string; // For team member login
    lastLoginAt?: string;
    
    // Additional properties
    isEmailVerified?: boolean;
    permissions?: string[];
    position?: string;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    lastActive?: string;
    
    // Profile
    avatar?: string;
    bio?: string;
}

/**
 * Project Team Member Assignment - represents a team member assigned to a specific project
 */
export interface ProjectTeamMember {
    id: string;
    projectId: string;
    teamMemberId: string;
    role: TeamMemberRole;
    
    // Team Member details (populated from TeamMember)
    teamMember?: TeamMember; // Make optional since we're not always populating it
    
    // Assignment details
    assignedAt: string;
    assignedBy?: string; // Make optional since we're not always populating it
    
    // Status
    isActive: boolean;
    
    // Additional properties needed for the integration
    email?: string; // Add missing email property
    name?: string; // Add missing name property
    status?: string; // Add missing status property
    permissions?: string[]; // Add array permissions for compatibility
    
    // Project-specific permissions (optional overrides)
    projectPermissions?: {
        canManageUsers?: boolean;
        canManageRoles?: boolean;
        canAccessSettings?: boolean;
        canViewReports?: boolean;
        canManageData?: boolean;
        canDeleteData?: boolean;
    };
}

/**
 * Team Member Role Mapping to Backbone App User Roles
 * This defines how Team Member roles translate to User roles in the actual app
 */
export interface TeamMemberRoleMapping {
    teamMemberRole: TeamMemberRole;
    backboneUserRole: string; // Maps to UserRole enum from UserManagementPage
    permissions: string[];
    description: string;
}

/**
 * Default role mappings
 */
export const TEAM_MEMBER_ROLE_MAPPINGS: TeamMemberRoleMapping[] = [
    {
        teamMemberRole: TeamMemberRole.ADMIN,
        backboneUserRole: 'ADMIN', // Maps to UserRole.ADMIN
        permissions: [
            'userManagement.create_users',
            'userManagement.edit_users',
            'userManagement.delete_users',
            'userManagement.manage_roles',
            'userManagement.assign_permissions',
            'system.access_settings',
            'system.manage_integrations',
            'reports.access_analytics',
            'sessions.manage_workflow_steps',
            'inventory.manage_assets',
            'messages.manage_notifications'
        ],
        description: 'Full administrative access to the project. Can manage users, roles, and all project settings.'
    },
    {
        teamMemberRole: TeamMemberRole.MEMBER,
        backboneUserRole: 'MEMBER', // Maps to UserRole.MEMBER
        permissions: [
            'sessions.create_sessions',
            'sessions.edit_sessions',
            'sessions.delete_sessions',
            'inventory.create_assets',
            'inventory.edit_assets',
            'inventory.delete_assets',
            'reports.create_reports',
            'reports.edit_reports',
            'messages.create_channels'
        ],
        description: 'Can create, edit, and delete data but cannot manage users or administrative settings.'
    }
];

/**
 * Project Access Control - determines what projects a team member can access
 */
export interface ProjectAccess {
    teamMemberId: string;
    projectId: string;
    role: TeamMemberRole;
    canAccess: boolean;
    accessLevel: 'read' | 'write' | 'admin';
}

/**
 * Team Member Authentication Result
 */
export interface TeamMemberAuthResult {
    isValid: boolean;
    teamMember?: TeamMember;
    projectAccess?: ProjectAccess[];
    error?: string;
}

/**
 * Team Member Project Context - used when a team member logs into a specific project
 */
export interface TeamMemberProjectContext {
    teamMember: TeamMember;
    project: {
        id: string;
        name: string;
        role: TeamMemberRole;
    };
    backboneUserRole: string;
    permissions: string[];
    canManageTeam: boolean;
}
