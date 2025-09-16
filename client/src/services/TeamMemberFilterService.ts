/**
 * Team Member Filter Service
 * 
 * Advanced filtering and search functionality for team members
 * with multiple criteria, sorting, and pagination.
 */

import { StreamlinedTeamMember } from './UnifiedDataService';

export interface FilterCriteria {
  search?: string;
  role?: string[];
  status?: string[];
  department?: string[];
  licenseType?: string[];
  dateRange?: {
    field: 'createdAt' | 'lastActive' | 'updatedAt';
    start?: Date;
    end?: Date;
  };
  hasLicense?: boolean;
  isActive?: boolean;
  customFields?: { [key: string]: any };
}

export interface SortOptions {
  field: keyof StreamlinedTeamMember;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface FilterResult {
  filteredMembers: StreamlinedTeamMember[];
  totalCount: number;
  filteredCount: number;
  hasMore: boolean;
  pageInfo: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
}

export class TeamMemberFilterService {
  private static instance: TeamMemberFilterService;

  public static getInstance(): TeamMemberFilterService {
    if (!TeamMemberFilterService.instance) {
      TeamMemberFilterService.instance = new TeamMemberFilterService();
    }
    return TeamMemberFilterService.instance;
  }

  /**
   * Filter and search team members with advanced criteria
   */
  filterTeamMembers(
    members: StreamlinedTeamMember[],
    criteria: FilterCriteria,
    sortOptions?: SortOptions,
    pagination?: PaginationOptions
  ): FilterResult {
    let filteredMembers = [...members];

    // Apply search filter
    if (criteria.search) {
      filteredMembers = this.applySearchFilter(filteredMembers, criteria.search);
    }

    // Apply role filter
    if (criteria.role && criteria.role.length > 0) {
      filteredMembers = filteredMembers.filter(member => 
        criteria.role!.includes(member.role)
      );
    }

    // Apply status filter
    if (criteria.status && criteria.status.length > 0) {
      filteredMembers = filteredMembers.filter(member => 
        criteria.status!.includes(member.status)
      );
    }

    // Apply department filter
    if (criteria.department && criteria.department.length > 0) {
      filteredMembers = filteredMembers.filter(member => 
        member.department && criteria.department!.includes(member.department)
      );
    }

    // Apply license type filter
    if (criteria.licenseType && criteria.licenseType.length > 0) {
      filteredMembers = filteredMembers.filter(member => 
        member.licenseType && criteria.licenseType!.includes(member.licenseType)
      );
    }

    // Apply date range filter
    if (criteria.dateRange) {
      filteredMembers = this.applyDateRangeFilter(filteredMembers, criteria.dateRange);
    }

    // Apply license status filter
    if (criteria.hasLicense !== undefined) {
      filteredMembers = filteredMembers.filter(member => 
        criteria.hasLicense ? !!member.licenseType : !member.licenseType
      );
    }

    // Apply active status filter
    if (criteria.isActive !== undefined) {
      filteredMembers = filteredMembers.filter(member => 
        criteria.isActive ? member.status === 'active' : member.status !== 'active'
      );
    }

    // Apply custom field filters
    if (criteria.customFields) {
      filteredMembers = this.applyCustomFieldFilters(filteredMembers, criteria.customFields);
    }

    // Apply sorting
    if (sortOptions) {
      filteredMembers = this.applySorting(filteredMembers, sortOptions);
    }

    const totalCount = members.length;
    const filteredCount = filteredMembers.length;

    // Apply pagination
    let paginatedMembers = filteredMembers;
    let hasMore = false;
    let pageInfo = {
      currentPage: 1,
      totalPages: 1,
      pageSize: filteredCount,
      totalItems: filteredCount
    };

    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      
      paginatedMembers = filteredMembers.slice(startIndex, endIndex);
      hasMore = endIndex < filteredCount;
      
      pageInfo = {
        currentPage: pagination.page,
        totalPages: Math.ceil(filteredCount / pagination.pageSize),
        pageSize: pagination.pageSize,
        totalItems: filteredCount
      };
    }

    return {
      filteredMembers: paginatedMembers,
      totalCount,
      filteredCount,
      hasMore,
      pageInfo
    };
  }

  /**
   * Apply search filter across multiple fields
   */
  private applySearchFilter(members: StreamlinedTeamMember[], searchTerm: string): StreamlinedTeamMember[] {
    const searchLower = searchTerm.toLowerCase();
    
    return members.filter(member => {
      const searchableFields = [
        member.email,
        member.firstName,
        member.lastName,
        member.department,
        member.position,
        member.phone,
        member.role,
        member.status,
        member.licenseType
      ];

      return searchableFields.some(field => 
        field && field.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * Apply date range filter
   */
  private applyDateRangeFilter(
    members: StreamlinedTeamMember[], 
    dateRange: FilterCriteria['dateRange']
  ): StreamlinedTeamMember[] {
    if (!dateRange) return members;

    return members.filter(member => {
      const fieldValue = member[dateRange.field];
      if (!fieldValue) return false;

      const date = new Date(fieldValue);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;

      if (start && date < start) return false;
      if (end && date > end) return false;

      return true;
    });
  }

  /**
   * Apply custom field filters
   */
  private applyCustomFieldFilters(
    members: StreamlinedTeamMember[], 
    customFields: { [key: string]: any }
  ): StreamlinedTeamMember[] {
    return members.filter(member => {
      return Object.entries(customFields).every(([field, value]) => {
        const memberValue = member[field as keyof StreamlinedTeamMember];
        
        if (value === null || value === undefined) {
          return memberValue === value;
        }
        
        if (typeof value === 'string') {
          return memberValue && 
            String(memberValue).toLowerCase().includes(value.toLowerCase());
        }
        
        return memberValue === value;
      });
    });
  }

  /**
   * Apply sorting to filtered members
   */
  private applySorting(
    members: StreamlinedTeamMember[], 
    sortOptions: SortOptions
  ): StreamlinedTeamMember[] {
    return members.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOptions.direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOptions.direction === 'asc' ? -1 : 1;

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Get available filter options from team members
   */
  getFilterOptions(members: StreamlinedTeamMember[]) {
    const roles = [...new Set(members.map(m => m.role))].sort();
    const statuses = [...new Set(members.map(m => m.status))].sort();
    const departments = [...new Set(members.map(m => m.department).filter(Boolean))].sort();
    const licenseTypes = [...new Set(members.map(m => m.licenseType).filter(Boolean))].sort();
    
    return {
      roles,
      statuses,
      departments,
      licenseTypes,
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      pendingMembers: members.filter(m => m.status === 'pending').length,
      licensedMembers: members.filter(m => m.licenseType).length
    };
  }

  /**
   * Get quick filter presets
   */
  getQuickFilters() {
    return {
      all: { label: 'All Members', criteria: {} },
      active: { 
        label: 'Active Members', 
        criteria: { isActive: true } 
      },
      pending: { 
        label: 'Pending Invites', 
        criteria: { status: ['pending'] } 
      },
      admins: { 
        label: 'Administrators', 
        criteria: { role: ['admin', 'owner'] } 
      },
      licensed: { 
        label: 'Licensed Members', 
        criteria: { hasLicense: true } 
      },
      recent: { 
        label: 'Recently Added', 
        criteria: { 
          dateRange: { 
            field: 'createdAt', 
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          } 
        } 
      }
    };
  }
}

export const teamMemberFilterService = TeamMemberFilterService.getInstance();
