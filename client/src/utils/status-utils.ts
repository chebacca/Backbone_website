/**
 * Unified Project Status Management
 * 
 * This utility provides consistent status calculation and mapping across all components
 * to ensure status chips and statistics match between the licensing website and dashboard app.
 */

export type ProjectStatus = 'draft' | 'active' | 'in-progress' | 'completed' | 'archived' | 'paused';
export type DatabaseStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED';

/**
 * Maps database status values to component status values
 */
export const mapDatabaseStatusToComponent = (dbStatus: string | undefined): ProjectStatus => {
  if (!dbStatus) return 'draft';
  
  const normalized = dbStatus.toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'draft';
    case 'DRAFT':
      return 'draft';
    case 'COMPLETED':
      return 'completed';
    case 'ARCHIVED':
      return 'archived';
    case 'PAUSED':
      return 'paused';
    default:
      return 'draft';
  }
};

/**
 * Enhanced status calculation that respects database status but can override based on activity
 * This is used by the licensing website for more detailed status information
 */
export const calculateEnhancedStatus = (
  project: any,
  teamMemberCount: number = 0,
  datasetCount: number = 0
): ProjectStatus => {
  // First, check if there's an explicit status override in metadata
  if (project.metadata?.extendedStatus) {
    const extendedStatus = project.metadata.extendedStatus;
    if (['draft', 'active', 'in-progress', 'completed', 'archived', 'paused'].includes(extendedStatus)) {
      return extendedStatus;
    }
  }
  
  // Check for explicit database status first
  const dbStatus = mapDatabaseStatusToComponent(project.status);
  
  // If explicitly archived or paused, respect that
  if (dbStatus === 'archived' || project.isArchived) {
    return 'archived';
  }
  
  if (dbStatus === 'paused') {
    return 'paused';
  }
  
  if (dbStatus === 'completed') {
    return 'completed';
  }
  
  // For active projects, determine if they're in-progress based on activity
  if (dbStatus === 'active') {
    const hasTeamMembers = teamMemberCount > 0;
    const hasDatasets = datasetCount > 0;
    const hasRecentActivity = project.lastAccessedAt && 
      (new Date().getTime() - new Date(project.lastAccessedAt).getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
    
    // If project has team members and datasets and recent activity, it's in progress
    if (hasTeamMembers && hasDatasets && hasRecentActivity) {
      return 'in-progress';
    }
    
    // If project has some setup but no recent activity, it's active but not progressing
    if ((hasTeamMembers || hasDatasets) && !hasRecentActivity) {
      return 'active';
    }
    
    // If project has recent activity but minimal setup, it's active
    if (hasRecentActivity) {
      return 'active';
    }
    
    // Default to active for projects with database status ACTIVE
    return 'active';
  }
  
  // Default to draft for new projects
  return 'draft';
};

/**
 * Simple status mapping for dashboard app (binary active/inactive)
 */
export const mapToDashboardStatus = (project: any): 'active' | 'inactive' => {
  const dbStatus = mapDatabaseStatusToComponent(project.status);
  return dbStatus === 'active' || dbStatus === 'in-progress' ? 'active' : 'inactive';
};

/**
 * Get status color for UI components
 */
export const getStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'in-progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'default';
    case 'paused':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Get status display text
 */
export const getStatusDisplayText = (status: ProjectStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'in-progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'draft':
      return 'Draft';
    case 'archived':
      return 'Archived';
    case 'paused':
      return 'Paused';
    default:
      return 'Unknown';
  }
};

/**
 * Count projects by status for statistics
 */
export const countProjectsByStatus = (projects: any[], teamMemberCounts: Record<string, number> = {}, datasetCounts: Record<string, number> = {}): Record<ProjectStatus, number> => {
  const counts: Record<ProjectStatus, number> = {
    draft: 0,
    active: 0,
    'in-progress': 0,
    completed: 0,
    archived: 0,
    paused: 0
  };
  
  projects.forEach(project => {
    const teamMemberCount = teamMemberCounts[project.id] || 0;
    const datasetCount = datasetCounts[project.id] || 0;
    const status = calculateEnhancedStatus(project, teamMemberCount, datasetCount);
    counts[status]++;
  });
  
  return counts;
};
