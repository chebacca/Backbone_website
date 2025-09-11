/**
 * Core domain models for the application
 */

// Base entity type with common fields
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
  [key: string]: any; // Allow additional properties for flexibility
}

// User and authentication related types
export interface User extends BaseEntity {
  email: string;
  name?: string;
  role?: string;
  organizationId?: string;
  firebaseUid?: string;
  isEmailVerified?: boolean;
}

// Team member types
export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

export enum TeamMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum LicenseType {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export interface TeamMember extends User {
  status: TeamMemberStatus;
  role: TeamMemberRole;
  licenseType: LicenseType;
  lastActive?: string;
  permissions?: string[];
  department?: string;
  position?: string;
  avatar?: string;
}

export interface ProjectTeamMember extends BaseEntity {
  teamMemberId: string;
  projectId: string;
  role: string;
  permissions?: string[];
  assignedAt?: string;
  assignedBy?: string;
  isActive: boolean;
  email?: string;
  name?: string;
  status?: string;
  teamMember?: TeamMember;
}

// Project related types
export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  DRAFT = 'draft'
}

export interface CloudProject extends BaseEntity {
  name: string;
  description?: string;
  ownerId: string;
  organizationId?: string;
  status: 'draft' | 'active' | 'in-progress' | 'completed' | 'archived' | 'paused';
  type?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  lastAccessedAt?: string;
  teamMembers?: ProjectTeamMember[];
}

// Dataset related types
export interface CloudDataset extends BaseEntity {
  name: string;
  description?: string;
  // Support multiple project assignments
  projectIds?: string[]; // Array of project IDs this dataset is assigned to
  primaryProjectId?: string | null; // Primary project for backward compatibility
  type?: string;
  status?: string;
  size?: number;
  recordCount?: number;
  schema?: Record<string, any>;
  tags?: string[];
  isPublic?: boolean;
  ownerId: string;
  storage?: {
    backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local';
    path?: string;
    bucket?: string;
    region?: string;
  };
  visibility?: 'private' | 'organization' | 'public';
}

// API related types
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export interface TeamMemberAuthResult {
  isValid: boolean;
  error?: string;
  teamMember?: TeamMember;
  projectAccess?: any[];
}

// Configuration type
export interface ServiceConfig {
  isWebOnlyMode: boolean;
  apiBaseUrl?: string;
  organizationId?: string;
}
