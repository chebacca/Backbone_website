/**
 * ============================================================================
 * ENHANCED ROLE BRIDGE SERVICE - UNIFIED ROLE SYSTEM
 * ============================================================================
 * 
 * This service bridges the licensing website role system with the Dashboard
 * UserRole enum system, providing seamless role mapping and hierarchy preservation.
 * 
 * Key Features:
 * - Maps 800+ industry templates to Dashboard UserRole enum
 * - Preserves hierarchy levels (1-100 scale)
 * - Handles permission inheritance
 * - Provides real-time role synchronization
 * - Validates role assignments across applications
 */

import { EnhancedRoleTemplate, getAllEnhancedTemplates } from '../components/EnhancedRoleTemplates';

// Dashboard UserRole enum (matching Dashboard-v14_2 system)
export enum DashboardUserRole {
  ADMIN = 'ADMIN',
  EXEC = 'EXEC',
  POST_PRODUCTION_SUPERVISOR = 'POST_PRODUCTION_SUPERVISOR',
  MEDIA_MANAGER = 'MEDIA_MANAGER',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  POST_COORDINATOR = 'POST_COORDINATOR',
  ART_DIRECTOR = 'ART_DIRECTOR',
  POST_PRODUCER = 'POST_PRODUCER',
  LINE_PRODUCER = 'LINE_PRODUCER',
  PRODUCER = 'PRODUCER',
  NETWORKING = 'NETWORKING',
  ASSOCIATE_PRODUCER = 'ASSOCIATE_PRODUCER',
  ASSIST_DIRECTOR = 'ASSIST_DIRECTOR',
  EDITOR = 'EDITOR',
  CAMERA_OPERATOR = 'CAMERA_OPERATOR',
  SOUND_ENGINEER = 'SOUND_ENGINEER',
  DIT = 'DIT',
  COLORIST = 'COLORIST',
  AUDIO_PRODUCTION = 'AUDIO_PRODUCTION',
  AUDIO_POST = 'AUDIO_POST',
  GFX_ARTIST = 'GFX_ARTIST',
  KEYNOTE_PRODUCER = 'KEYNOTE_PRODUCER',
  QC_SPECIALIST = 'QC_SPECIALIST',
  ASSISTANT_EDITOR = 'ASSISTANT_EDITOR',
  LIGHTING_TECHNICIAN = 'LIGHTING_TECHNICIAN',
  TECH = 'TECH',
  KEYNOTE_POST = 'KEYNOTE_POST',
  PRODUCTION_ASSISTANT = 'PRODUCTION_ASSISTANT',
  POST_PA = 'POST_PA',
  KEYNOTE_PROD = 'KEYNOTE_PROD',
  GUEST = 'GUEST'
}

// Dashboard Role Hierarchy (matching Dashboard system)
export const DASHBOARD_ROLE_HIERARCHY: Record<DashboardUserRole, number> = {
  [DashboardUserRole.ADMIN]: 100,
  [DashboardUserRole.EXEC]: 90,
  [DashboardUserRole.POST_PRODUCTION_SUPERVISOR]: 55,
  [DashboardUserRole.MEDIA_MANAGER]: 50,
  [DashboardUserRole.MANAGER]: 45,
  [DashboardUserRole.DIRECTOR]: 45,
  [DashboardUserRole.POST_COORDINATOR]: 40,
  [DashboardUserRole.ART_DIRECTOR]: 40,
  [DashboardUserRole.POST_PRODUCER]: 40,
  [DashboardUserRole.LINE_PRODUCER]: 40,
  [DashboardUserRole.PRODUCER]: 35,
  [DashboardUserRole.NETWORKING]: 30,
  [DashboardUserRole.ASSOCIATE_PRODUCER]: 30,
  [DashboardUserRole.ASSIST_DIRECTOR]: 30,
  [DashboardUserRole.EDITOR]: 25,
  [DashboardUserRole.CAMERA_OPERATOR]: 25,
  [DashboardUserRole.SOUND_ENGINEER]: 25,
  [DashboardUserRole.DIT]: 25,
  [DashboardUserRole.COLORIST]: 25,
  [DashboardUserRole.AUDIO_PRODUCTION]: 25,
  [DashboardUserRole.AUDIO_POST]: 25,
  [DashboardUserRole.GFX_ARTIST]: 25,
  [DashboardUserRole.KEYNOTE_PRODUCER]: 25,
  [DashboardUserRole.QC_SPECIALIST]: 20,
  [DashboardUserRole.ASSISTANT_EDITOR]: 20,
  [DashboardUserRole.LIGHTING_TECHNICIAN]: 20,
  [DashboardUserRole.TECH]: 20,
  [DashboardUserRole.KEYNOTE_POST]: 20,
  [DashboardUserRole.PRODUCTION_ASSISTANT]: 15,
  [DashboardUserRole.POST_PA]: 15,
  [DashboardUserRole.KEYNOTE_PROD]: 15,
  [DashboardUserRole.GUEST]: 10
};

// Licensing Website Basic Roles
export enum LicensingRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DO_ER = 'DO_ER',
  VIEWER = 'VIEWER'
}

// Enhanced Role Mapping Interface
export interface EnhancedRoleMapping {
  licensingRole: LicensingRole;
  templateRole?: EnhancedRoleTemplate;
  dashboardRole: DashboardUserRole;
  effectiveHierarchy: number;
  permissions: RolePermissions;
  isCustomMapping: boolean;
}

// Role Permissions Interface
export interface RolePermissions {
  canManageTeam: boolean;
  canManageProjects: boolean;
  canViewFinancials: boolean;
  canEditContent: boolean;
  canApproveContent: boolean;
  canAccessReports: boolean;
  canManageSettings: boolean;
  hierarchyLevel: number;
}

/**
 * Enhanced Role Bridge Service
 * Handles mapping between licensing website roles and Dashboard UserRole enum
 */
export class EnhancedRoleBridgeService {
  private static instance: EnhancedRoleBridgeService;
  private roleMappingCache: Map<string, EnhancedRoleMapping> = new Map();

  static getInstance(): EnhancedRoleBridgeService {
    if (!EnhancedRoleBridgeService.instance) {
      EnhancedRoleBridgeService.instance = new EnhancedRoleBridgeService();
    }
    return EnhancedRoleBridgeService.instance;
  }

  /**
   * Map licensing website role to Dashboard UserRole
   */
  mapLicensingRoleToDashboard(
    licensingRole: LicensingRole,
    templateRole?: EnhancedRoleTemplate,
    organizationTier: 'BASIC' | 'PRO' | 'ENTERPRISE' = 'PRO'
  ): EnhancedRoleMapping {
    console.log(`🔄 [RoleBridge] Mapping licensing role: ${licensingRole}${templateRole ? ` with template: ${templateRole.displayName}` : ''}`);

    // Check cache first
    const cacheKey = `${licensingRole}-${templateRole?.id || 'basic'}-${organizationTier}`;
    if (this.roleMappingCache.has(cacheKey)) {
      return this.roleMappingCache.get(cacheKey)!;
    }

    let dashboardRole: DashboardUserRole;
    let effectiveHierarchy: number;
    let isCustomMapping = false;

    // If template role is provided, use intelligent mapping
    if (templateRole) {
      const mappingResult = this.mapTemplateRoleToDashboard(templateRole, licensingRole);
      dashboardRole = mappingResult.dashboardRole;
      effectiveHierarchy = mappingResult.effectiveHierarchy;
      isCustomMapping = mappingResult.isCustomMapping;
    } else {
      // Use basic role mapping
      const basicMapping = this.mapBasicLicensingRole(licensingRole);
      dashboardRole = basicMapping.dashboardRole;
      effectiveHierarchy = basicMapping.effectiveHierarchy;
    }

    // Apply tier-based restrictions
    effectiveHierarchy = this.applyTierRestrictions(effectiveHierarchy, organizationTier);

    // Generate permissions
    const permissions = this.generateRolePermissions(dashboardRole, effectiveHierarchy, organizationTier);

    const mapping: EnhancedRoleMapping = {
      licensingRole,
      templateRole,
      dashboardRole,
      effectiveHierarchy,
      permissions,
      isCustomMapping
    };

    // Cache the result
    this.roleMappingCache.set(cacheKey, mapping);

    console.log(`✅ [RoleBridge] Mapped to Dashboard role: ${dashboardRole} (hierarchy: ${effectiveHierarchy})`);
    return mapping;
  }

  /**
   * Map template role to Dashboard UserRole using intelligent matching
   */
  private mapTemplateRoleToDashboard(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } {
    const templateName = templateRole.name.toUpperCase();
    const templateDisplayName = templateRole.displayName.toUpperCase();
    
    // Direct name matching first
    for (const [dashboardRole, hierarchy] of Object.entries(DASHBOARD_ROLE_HIERARCHY)) {
      if (templateName.includes(dashboardRole) || dashboardRole.includes(templateName)) {
        return {
          dashboardRole: dashboardRole as DashboardUserRole,
          effectiveHierarchy: Math.max(templateRole.hierarchy, hierarchy),
          isCustomMapping: false
        };
      }
    }

    // Semantic matching based on role characteristics
    const semanticMapping = this.getSemanticRoleMapping(templateRole, licensingRole);
    if (semanticMapping) {
      return semanticMapping;
    }

    // Fallback to hierarchy-based mapping
    return this.getHierarchyBasedMapping(templateRole, licensingRole);
  }

  /**
   * Semantic role mapping based on role characteristics
   */
  private getSemanticRoleMapping(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } | null {
    const name = templateRole.displayName.toLowerCase();
    const responsibilities = templateRole.keyResponsibilities.join(' ').toLowerCase();
    const hierarchy = templateRole.hierarchy;

    // Management roles (hierarchy 80-100)
    if (hierarchy >= 80 || name.includes('manager') || name.includes('supervisor') || name.includes('director')) {
      if (hierarchy >= 90) return { dashboardRole: DashboardUserRole.EXEC, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('post') || name.includes('production')) return { dashboardRole: DashboardUserRole.POST_PRODUCTION_SUPERVISOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Creative roles
    if (name.includes('director') && !name.includes('assistant')) {
      return { dashboardRole: DashboardUserRole.DIRECTOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Editorial roles
    if (name.includes('editor')) {
      if (name.includes('assistant')) return { dashboardRole: DashboardUserRole.ASSISTANT_EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Production roles
    if (name.includes('producer')) {
      if (name.includes('associate')) return { dashboardRole: DashboardUserRole.ASSOCIATE_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('line')) return { dashboardRole: DashboardUserRole.LINE_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('post')) return { dashboardRole: DashboardUserRole.POST_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Technical roles
    if (name.includes('camera')) return { dashboardRole: DashboardUserRole.CAMERA_OPERATOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('sound') || name.includes('audio')) return { dashboardRole: DashboardUserRole.SOUND_ENGINEER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('lighting')) return { dashboardRole: DashboardUserRole.LIGHTING_TECHNICIAN, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('color')) return { dashboardRole: DashboardUserRole.COLORIST, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('graphics') || name.includes('gfx')) return { dashboardRole: DashboardUserRole.GFX_ARTIST, effectiveHierarchy: hierarchy, isCustomMapping: true };

    // Quality control
    if (name.includes('qc') || name.includes('quality')) return { dashboardRole: DashboardUserRole.QC_SPECIALIST, effectiveHierarchy: hierarchy, isCustomMapping: true };

    // Support roles
    if (name.includes('assistant') || name.includes('support') || hierarchy <= 20) {
      return { dashboardRole: DashboardUserRole.PRODUCTION_ASSISTANT, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    return null;
  }

  /**
   * Hierarchy-based mapping fallback
   */
  private getHierarchyBasedMapping(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } {
    const hierarchy = templateRole.hierarchy;

    // Map based on hierarchy ranges
    if (hierarchy >= 90) return { dashboardRole: DashboardUserRole.EXEC, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 80) return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 60) return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 40) return { dashboardRole: DashboardUserRole.EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 20) return { dashboardRole: DashboardUserRole.PRODUCTION_ASSISTANT, effectiveHierarchy: hierarchy, isCustomMapping: true };
    
    return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: hierarchy, isCustomMapping: true };
  }

  /**
   * Map basic licensing roles to Dashboard roles
   */
  private mapBasicLicensingRole(licensingRole: LicensingRole): { dashboardRole: DashboardUserRole; effectiveHierarchy: number } {
    switch (licensingRole) {
      case LicensingRole.ADMIN:
        return { dashboardRole: DashboardUserRole.ADMIN, effectiveHierarchy: 100 };
      case LicensingRole.MANAGER:
        return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: 80 };
      case LicensingRole.DO_ER:
        return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: 60 };
      case LicensingRole.VIEWER:
        return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: 10 };
      default:
        return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: 10 };
    }
  }

  /**
   * Apply tier-based restrictions to hierarchy
   */
  private applyTierRestrictions(hierarchy: number, tier: 'BASIC' | 'PRO' | 'ENTERPRISE'): number {
    switch (tier) {
      case 'BASIC':
        return Math.min(hierarchy, 40); // Cap at 40 for BASIC tier
      case 'PRO':
        return Math.min(hierarchy, 80); // Cap at 80 for PRO tier
      case 'ENTERPRISE':
        return hierarchy; // No restrictions for ENTERPRISE
      default:
        return Math.min(hierarchy, 40);
    }
  }

  /**
   * Generate role permissions based on Dashboard role and hierarchy
   */
  private generateRolePermissions(
    dashboardRole: DashboardUserRole,
    hierarchy: number,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): RolePermissions {
    const basePermissions: RolePermissions = {
      canManageTeam: hierarchy >= 80,
      canManageProjects: hierarchy >= 60,
      canViewFinancials: hierarchy >= 70 && (tier === 'PRO' || tier === 'ENTERPRISE'),
      canEditContent: hierarchy >= 25,
      canApproveContent: hierarchy >= 40,
      canAccessReports: hierarchy >= 30,
      canManageSettings: hierarchy >= 90,
      hierarchyLevel: hierarchy
    };

    // Apply tier-specific restrictions
    if (tier === 'BASIC') {
      basePermissions.canViewFinancials = false;
      basePermissions.canManageSettings = false;
    }

    return basePermissions;
  }

  /**
   * Get available Dashboard roles for a licensing role and tier
   */
  getAvailableDashboardRoles(
    licensingRole: LicensingRole,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): DashboardUserRole[] {
    const maxHierarchy = this.applyTierRestrictions(100, tier);
    
    return Object.entries(DASHBOARD_ROLE_HIERARCHY)
      .filter(([_, hierarchy]) => hierarchy <= maxHierarchy)
      .map(([role, _]) => role as DashboardUserRole);
  }

  /**
   * Validate role assignment compatibility
   */
  validateRoleAssignment(
    licensingRole: LicensingRole,
    dashboardRole: DashboardUserRole,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): { isValid: boolean; reason?: string } {
    const dashboardHierarchy = DASHBOARD_ROLE_HIERARCHY[dashboardRole];
    const maxAllowedHierarchy = this.applyTierRestrictions(100, tier);

    if (dashboardHierarchy > maxAllowedHierarchy) {
      return {
        isValid: false,
        reason: `Role ${dashboardRole} (hierarchy ${dashboardHierarchy}) exceeds maximum allowed for ${tier} tier (${maxAllowedHierarchy})`
      };
    }

    return { isValid: true };
  }

  /**
   * Clear role mapping cache
   */
  clearCache(): void {
    this.roleMappingCache.clear();
    console.log('🧹 [RoleBridge] Role mapping cache cleared');
  }
}

export default EnhancedRoleBridgeService;
 * ============================================================================
 * ENHANCED ROLE BRIDGE SERVICE - UNIFIED ROLE SYSTEM
 * ============================================================================
 * 
 * This service bridges the licensing website role system with the Dashboard
 * UserRole enum system, providing seamless role mapping and hierarchy preservation.
 * 
 * Key Features:
 * - Maps 800+ industry templates to Dashboard UserRole enum
 * - Preserves hierarchy levels (1-100 scale)
 * - Handles permission inheritance
 * - Provides real-time role synchronization
 * - Validates role assignments across applications
 */

import { EnhancedRoleTemplate, getAllEnhancedTemplates } from '../components/EnhancedRoleTemplates';

// Dashboard UserRole enum (matching Dashboard-v14_2 system)
export enum DashboardUserRole {
  ADMIN = 'ADMIN',
  EXEC = 'EXEC',
  POST_PRODUCTION_SUPERVISOR = 'POST_PRODUCTION_SUPERVISOR',
  MEDIA_MANAGER = 'MEDIA_MANAGER',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  POST_COORDINATOR = 'POST_COORDINATOR',
  ART_DIRECTOR = 'ART_DIRECTOR',
  POST_PRODUCER = 'POST_PRODUCER',
  LINE_PRODUCER = 'LINE_PRODUCER',
  PRODUCER = 'PRODUCER',
  NETWORKING = 'NETWORKING',
  ASSOCIATE_PRODUCER = 'ASSOCIATE_PRODUCER',
  ASSIST_DIRECTOR = 'ASSIST_DIRECTOR',
  EDITOR = 'EDITOR',
  CAMERA_OPERATOR = 'CAMERA_OPERATOR',
  SOUND_ENGINEER = 'SOUND_ENGINEER',
  DIT = 'DIT',
  COLORIST = 'COLORIST',
  AUDIO_PRODUCTION = 'AUDIO_PRODUCTION',
  AUDIO_POST = 'AUDIO_POST',
  GFX_ARTIST = 'GFX_ARTIST',
  KEYNOTE_PRODUCER = 'KEYNOTE_PRODUCER',
  QC_SPECIALIST = 'QC_SPECIALIST',
  ASSISTANT_EDITOR = 'ASSISTANT_EDITOR',
  LIGHTING_TECHNICIAN = 'LIGHTING_TECHNICIAN',
  TECH = 'TECH',
  KEYNOTE_POST = 'KEYNOTE_POST',
  PRODUCTION_ASSISTANT = 'PRODUCTION_ASSISTANT',
  POST_PA = 'POST_PA',
  KEYNOTE_PROD = 'KEYNOTE_PROD',
  GUEST = 'GUEST'
}

// Dashboard Role Hierarchy (matching Dashboard system)
export const DASHBOARD_ROLE_HIERARCHY: Record<DashboardUserRole, number> = {
  [DashboardUserRole.ADMIN]: 100,
  [DashboardUserRole.EXEC]: 90,
  [DashboardUserRole.POST_PRODUCTION_SUPERVISOR]: 55,
  [DashboardUserRole.MEDIA_MANAGER]: 50,
  [DashboardUserRole.MANAGER]: 45,
  [DashboardUserRole.DIRECTOR]: 45,
  [DashboardUserRole.POST_COORDINATOR]: 40,
  [DashboardUserRole.ART_DIRECTOR]: 40,
  [DashboardUserRole.POST_PRODUCER]: 40,
  [DashboardUserRole.LINE_PRODUCER]: 40,
  [DashboardUserRole.PRODUCER]: 35,
  [DashboardUserRole.NETWORKING]: 30,
  [DashboardUserRole.ASSOCIATE_PRODUCER]: 30,
  [DashboardUserRole.ASSIST_DIRECTOR]: 30,
  [DashboardUserRole.EDITOR]: 25,
  [DashboardUserRole.CAMERA_OPERATOR]: 25,
  [DashboardUserRole.SOUND_ENGINEER]: 25,
  [DashboardUserRole.DIT]: 25,
  [DashboardUserRole.COLORIST]: 25,
  [DashboardUserRole.AUDIO_PRODUCTION]: 25,
  [DashboardUserRole.AUDIO_POST]: 25,
  [DashboardUserRole.GFX_ARTIST]: 25,
  [DashboardUserRole.KEYNOTE_PRODUCER]: 25,
  [DashboardUserRole.QC_SPECIALIST]: 20,
  [DashboardUserRole.ASSISTANT_EDITOR]: 20,
  [DashboardUserRole.LIGHTING_TECHNICIAN]: 20,
  [DashboardUserRole.TECH]: 20,
  [DashboardUserRole.KEYNOTE_POST]: 20,
  [DashboardUserRole.PRODUCTION_ASSISTANT]: 15,
  [DashboardUserRole.POST_PA]: 15,
  [DashboardUserRole.KEYNOTE_PROD]: 15,
  [DashboardUserRole.GUEST]: 10
};

// Licensing Website Basic Roles
export enum LicensingRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DO_ER = 'DO_ER',
  VIEWER = 'VIEWER'
}

// Enhanced Role Mapping Interface
export interface EnhancedRoleMapping {
  licensingRole: LicensingRole;
  templateRole?: EnhancedRoleTemplate;
  dashboardRole: DashboardUserRole;
  effectiveHierarchy: number;
  permissions: RolePermissions;
  isCustomMapping: boolean;
}

// Role Permissions Interface
export interface RolePermissions {
  canManageTeam: boolean;
  canManageProjects: boolean;
  canViewFinancials: boolean;
  canEditContent: boolean;
  canApproveContent: boolean;
  canAccessReports: boolean;
  canManageSettings: boolean;
  hierarchyLevel: number;
}

/**
 * Enhanced Role Bridge Service
 * Handles mapping between licensing website roles and Dashboard UserRole enum
 */
export class EnhancedRoleBridgeService {
  private static instance: EnhancedRoleBridgeService;
  private roleMappingCache: Map<string, EnhancedRoleMapping> = new Map();

  static getInstance(): EnhancedRoleBridgeService {
    if (!EnhancedRoleBridgeService.instance) {
      EnhancedRoleBridgeService.instance = new EnhancedRoleBridgeService();
    }
    return EnhancedRoleBridgeService.instance;
  }

  /**
   * Map licensing website role to Dashboard UserRole
   */
  mapLicensingRoleToDashboard(
    licensingRole: LicensingRole,
    templateRole?: EnhancedRoleTemplate,
    organizationTier: 'BASIC' | 'PRO' | 'ENTERPRISE' = 'PRO'
  ): EnhancedRoleMapping {
    console.log(`🔄 [RoleBridge] Mapping licensing role: ${licensingRole}${templateRole ? ` with template: ${templateRole.displayName}` : ''}`);

    // Check cache first
    const cacheKey = `${licensingRole}-${templateRole?.id || 'basic'}-${organizationTier}`;
    if (this.roleMappingCache.has(cacheKey)) {
      return this.roleMappingCache.get(cacheKey)!;
    }

    let dashboardRole: DashboardUserRole;
    let effectiveHierarchy: number;
    let isCustomMapping = false;

    // If template role is provided, use intelligent mapping
    if (templateRole) {
      const mappingResult = this.mapTemplateRoleToDashboard(templateRole, licensingRole);
      dashboardRole = mappingResult.dashboardRole;
      effectiveHierarchy = mappingResult.effectiveHierarchy;
      isCustomMapping = mappingResult.isCustomMapping;
    } else {
      // Use basic role mapping
      const basicMapping = this.mapBasicLicensingRole(licensingRole);
      dashboardRole = basicMapping.dashboardRole;
      effectiveHierarchy = basicMapping.effectiveHierarchy;
    }

    // Apply tier-based restrictions
    effectiveHierarchy = this.applyTierRestrictions(effectiveHierarchy, organizationTier);

    // Generate permissions
    const permissions = this.generateRolePermissions(dashboardRole, effectiveHierarchy, organizationTier);

    const mapping: EnhancedRoleMapping = {
      licensingRole,
      templateRole,
      dashboardRole,
      effectiveHierarchy,
      permissions,
      isCustomMapping
    };

    // Cache the result
    this.roleMappingCache.set(cacheKey, mapping);

    console.log(`✅ [RoleBridge] Mapped to Dashboard role: ${dashboardRole} (hierarchy: ${effectiveHierarchy})`);
    return mapping;
  }

  /**
   * Map template role to Dashboard UserRole using intelligent matching
   */
  private mapTemplateRoleToDashboard(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } {
    const templateName = templateRole.name.toUpperCase();
    const templateDisplayName = templateRole.displayName.toUpperCase();
    
    // Direct name matching first
    for (const [dashboardRole, hierarchy] of Object.entries(DASHBOARD_ROLE_HIERARCHY)) {
      if (templateName.includes(dashboardRole) || dashboardRole.includes(templateName)) {
        return {
          dashboardRole: dashboardRole as DashboardUserRole,
          effectiveHierarchy: Math.max(templateRole.hierarchy, hierarchy),
          isCustomMapping: false
        };
      }
    }

    // Semantic matching based on role characteristics
    const semanticMapping = this.getSemanticRoleMapping(templateRole, licensingRole);
    if (semanticMapping) {
      return semanticMapping;
    }

    // Fallback to hierarchy-based mapping
    return this.getHierarchyBasedMapping(templateRole, licensingRole);
  }

  /**
   * Semantic role mapping based on role characteristics
   */
  private getSemanticRoleMapping(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } | null {
    const name = templateRole.displayName.toLowerCase();
    const responsibilities = templateRole.keyResponsibilities.join(' ').toLowerCase();
    const hierarchy = templateRole.hierarchy;

    // Management roles (hierarchy 80-100)
    if (hierarchy >= 80 || name.includes('manager') || name.includes('supervisor') || name.includes('director')) {
      if (hierarchy >= 90) return { dashboardRole: DashboardUserRole.EXEC, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('post') || name.includes('production')) return { dashboardRole: DashboardUserRole.POST_PRODUCTION_SUPERVISOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Creative roles
    if (name.includes('director') && !name.includes('assistant')) {
      return { dashboardRole: DashboardUserRole.DIRECTOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Editorial roles
    if (name.includes('editor')) {
      if (name.includes('assistant')) return { dashboardRole: DashboardUserRole.ASSISTANT_EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Production roles
    if (name.includes('producer')) {
      if (name.includes('associate')) return { dashboardRole: DashboardUserRole.ASSOCIATE_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('line')) return { dashboardRole: DashboardUserRole.LINE_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes('post')) return { dashboardRole: DashboardUserRole.POST_PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    // Technical roles
    if (name.includes('camera')) return { dashboardRole: DashboardUserRole.CAMERA_OPERATOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('sound') || name.includes('audio')) return { dashboardRole: DashboardUserRole.SOUND_ENGINEER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('lighting')) return { dashboardRole: DashboardUserRole.LIGHTING_TECHNICIAN, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('color')) return { dashboardRole: DashboardUserRole.COLORIST, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes('graphics') || name.includes('gfx')) return { dashboardRole: DashboardUserRole.GFX_ARTIST, effectiveHierarchy: hierarchy, isCustomMapping: true };

    // Quality control
    if (name.includes('qc') || name.includes('quality')) return { dashboardRole: DashboardUserRole.QC_SPECIALIST, effectiveHierarchy: hierarchy, isCustomMapping: true };

    // Support roles
    if (name.includes('assistant') || name.includes('support') || hierarchy <= 20) {
      return { dashboardRole: DashboardUserRole.PRODUCTION_ASSISTANT, effectiveHierarchy: hierarchy, isCustomMapping: true };
    }

    return null;
  }

  /**
   * Hierarchy-based mapping fallback
   */
  private getHierarchyBasedMapping(
    templateRole: EnhancedRoleTemplate,
    licensingRole: LicensingRole
  ): { dashboardRole: DashboardUserRole; effectiveHierarchy: number; isCustomMapping: boolean } {
    const hierarchy = templateRole.hierarchy;

    // Map based on hierarchy ranges
    if (hierarchy >= 90) return { dashboardRole: DashboardUserRole.EXEC, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 80) return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 60) return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 40) return { dashboardRole: DashboardUserRole.EDITOR, effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 20) return { dashboardRole: DashboardUserRole.PRODUCTION_ASSISTANT, effectiveHierarchy: hierarchy, isCustomMapping: true };
    
    return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: hierarchy, isCustomMapping: true };
  }

  /**
   * Map basic licensing roles to Dashboard roles
   */
  private mapBasicLicensingRole(licensingRole: LicensingRole): { dashboardRole: DashboardUserRole; effectiveHierarchy: number } {
    switch (licensingRole) {
      case LicensingRole.ADMIN:
        return { dashboardRole: DashboardUserRole.ADMIN, effectiveHierarchy: 100 };
      case LicensingRole.MANAGER:
        return { dashboardRole: DashboardUserRole.MANAGER, effectiveHierarchy: 80 };
      case LicensingRole.DO_ER:
        return { dashboardRole: DashboardUserRole.PRODUCER, effectiveHierarchy: 60 };
      case LicensingRole.VIEWER:
        return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: 10 };
      default:
        return { dashboardRole: DashboardUserRole.GUEST, effectiveHierarchy: 10 };
    }
  }

  /**
   * Apply tier-based restrictions to hierarchy
   */
  private applyTierRestrictions(hierarchy: number, tier: 'BASIC' | 'PRO' | 'ENTERPRISE'): number {
    switch (tier) {
      case 'BASIC':
        return Math.min(hierarchy, 40); // Cap at 40 for BASIC tier
      case 'PRO':
        return Math.min(hierarchy, 80); // Cap at 80 for PRO tier
      case 'ENTERPRISE':
        return hierarchy; // No restrictions for ENTERPRISE
      default:
        return Math.min(hierarchy, 40);
    }
  }

  /**
   * Generate role permissions based on Dashboard role and hierarchy
   */
  private generateRolePermissions(
    dashboardRole: DashboardUserRole,
    hierarchy: number,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): RolePermissions {
    const basePermissions: RolePermissions = {
      canManageTeam: hierarchy >= 80,
      canManageProjects: hierarchy >= 60,
      canViewFinancials: hierarchy >= 70 && (tier === 'PRO' || tier === 'ENTERPRISE'),
      canEditContent: hierarchy >= 25,
      canApproveContent: hierarchy >= 40,
      canAccessReports: hierarchy >= 30,
      canManageSettings: hierarchy >= 90,
      hierarchyLevel: hierarchy
    };

    // Apply tier-specific restrictions
    if (tier === 'BASIC') {
      basePermissions.canViewFinancials = false;
      basePermissions.canManageSettings = false;
    }

    return basePermissions;
  }

  /**
   * Get available Dashboard roles for a licensing role and tier
   */
  getAvailableDashboardRoles(
    licensingRole: LicensingRole,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): DashboardUserRole[] {
    const maxHierarchy = this.applyTierRestrictions(100, tier);
    
    return Object.entries(DASHBOARD_ROLE_HIERARCHY)
      .filter(([_, hierarchy]) => hierarchy <= maxHierarchy)
      .map(([role, _]) => role as DashboardUserRole);
  }

  /**
   * Validate role assignment compatibility
   */
  validateRoleAssignment(
    licensingRole: LicensingRole,
    dashboardRole: DashboardUserRole,
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE'
  ): { isValid: boolean; reason?: string } {
    const dashboardHierarchy = DASHBOARD_ROLE_HIERARCHY[dashboardRole];
    const maxAllowedHierarchy = this.applyTierRestrictions(100, tier);

    if (dashboardHierarchy > maxAllowedHierarchy) {
      return {
        isValid: false,
        reason: `Role ${dashboardRole} (hierarchy ${dashboardHierarchy}) exceeds maximum allowed for ${tier} tier (${maxAllowedHierarchy})`
      };
    }

    return { isValid: true };
  }

  /**
   * Clear role mapping cache
   */
  clearCache(): void {
    this.roleMappingCache.clear();
    console.log('🧹 [RoleBridge] Role mapping cache cleared');
  }
}

export default EnhancedRoleBridgeService;
