/**
 * Team Member Audit Service
 * 
 * Tracks all team member changes and activities for compliance
 * and audit purposes.
 */

import { StreamlinedTeamMember } from './UnifiedDataService';

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  targetMemberId: string;
  targetMemberEmail: string;
  changes: AuditChange[];
  metadata: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

export interface AuditMetadata {
  organizationId: string;
  sessionId?: string;
  requestId?: string;
  additionalContext?: { [key: string]: any };
}

export type AuditAction = 
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'member_activated'
  | 'member_suspended'
  | 'member_role_changed'
  | 'member_license_assigned'
  | 'member_license_removed'
  | 'member_password_reset'
  | 'member_invited'
  | 'member_joined'
  | 'member_left'
  | 'member_exported'
  | 'member_imported'
  | 'bulk_operation';

export interface AuditQuery {
  memberId?: string;
  actorId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalActions: number;
  actionsByType: { [action: string]: number };
  recentActivity: AuditLog[];
  topActors: { actorId: string; actorEmail: string; actionCount: number }[];
  complianceScore: number;
}

export class TeamMemberAuditService {
  private static instance: TeamMemberAuditService;
  private auditLogs: AuditLog[] = [];

  public static getInstance(): TeamMemberAuditService {
    if (!TeamMemberAuditService.instance) {
      TeamMemberAuditService.instance = new TeamMemberAuditService();
    }
    return TeamMemberAuditService.instance;
  }

  /**
   * Log a team member action
   */
  logAction(
    action: AuditAction,
    actorId: string,
    actorEmail: string,
    targetMemberId: string,
    targetMemberEmail: string,
    changes: AuditChange[],
    metadata: AuditMetadata,
    additionalContext?: { [key: string]: any }
  ): void {
    const auditLog: AuditLog = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      action,
      actorId,
      actorEmail,
      targetMemberId,
      targetMemberEmail,
      changes,
      metadata: {
        ...metadata,
        additionalContext: {
          ...metadata.additionalContext,
          ...additionalContext
        }
      }
    };

    this.auditLogs.push(auditLog);
    
    // In a real implementation, this would be saved to a database
    console.log('🔍 [Audit] Team member action logged:', auditLog);
  }

  /**
   * Log member creation
   */
  logMemberCreation(
    actorId: string,
    actorEmail: string,
    member: StreamlinedTeamMember,
    metadata: AuditMetadata
  ): void {
    const changes: AuditChange[] = [
      {
        field: 'email',
        oldValue: null,
        newValue: member.email,
        changeType: 'added'
      },
      {
        field: 'firstName',
        oldValue: null,
        newValue: member.firstName,
        changeType: 'added'
      },
      {
        field: 'lastName',
        oldValue: null,
        newValue: member.lastName,
        changeType: 'added'
      },
      {
        field: 'role',
        oldValue: null,
        newValue: member.role,
        changeType: 'added'
      },
      {
        field: 'status',
        oldValue: null,
        newValue: member.status,
        changeType: 'added'
      }
    ];

    this.logAction(
      'member_created',
      actorId,
      actorEmail,
      member.id,
      member.email,
      changes,
      metadata
    );
  }

  /**
   * Log member update
   */
  logMemberUpdate(
    actorId: string,
    actorEmail: string,
    memberId: string,
    memberEmail: string,
    oldMember: Partial<StreamlinedTeamMember>,
    newMember: Partial<StreamlinedTeamMember>,
    metadata: AuditMetadata
  ): void {
    const auditChanges: AuditChange[] = [];

    // Compare fields and log changes
    const fieldsToTrack = [
      'firstName', 'lastName', 'email', 'role', 'status', 
      'department', 'position', 'phone', 'licenseType'
    ];

    fieldsToTrack.forEach(field => {
      const oldValue = oldMember[field as keyof StreamlinedTeamMember];
      const newValue = newMember[field as keyof StreamlinedTeamMember];
      
      if (oldValue !== newValue) {
        auditChanges.push({
          field,
          oldValue,
          newValue,
          changeType: oldValue === undefined ? 'added' : 
                     newValue === undefined ? 'removed' : 'modified'
        });
      }
    });

    if (auditChanges.length > 0) {
      this.logAction(
        'member_updated',
        actorId,
        actorEmail,
        memberId,
        memberEmail,
        auditChanges,
        metadata
      );
    }
  }

  /**
   * Log member deletion
   */
  logMemberDeletion(
    actorId: string,
    actorEmail: string,
    member: StreamlinedTeamMember,
    metadata: AuditMetadata
  ): void {
    const changes: AuditChange[] = [
      {
        field: 'status',
        oldValue: member.status,
        newValue: 'deleted',
        changeType: 'modified'
      }
    ];

    this.logAction(
      'member_deleted',
      actorId,
      actorEmail,
      member.id,
      member.email,
      changes,
      metadata
    );
  }

  /**
   * Log password reset
   */
  logPasswordReset(
    actorId: string,
    actorEmail: string,
    memberId: string,
    memberEmail: string,
    metadata: AuditMetadata
  ): void {
    const changes: AuditChange[] = [
      {
        field: 'password',
        oldValue: '[REDACTED]',
        newValue: '[RESET]',
        changeType: 'modified'
      }
    ];

    this.logAction(
      'member_password_reset',
      actorId,
      actorEmail,
      memberId,
      memberEmail,
      changes,
      metadata
    );
  }

  /**
   * Log license assignment
   */
  logLicenseAssignment(
    actorId: string,
    actorEmail: string,
    memberId: string,
    memberEmail: string,
    oldLicenseType: string | undefined,
    newLicenseType: string,
    metadata: AuditMetadata
  ): void {
    const changes: AuditChange[] = [
      {
        field: 'licenseType',
        oldValue: oldLicenseType || 'BASIC',
        newValue: newLicenseType,
        changeType: 'modified'
      }
    ];

    this.logAction(
      'member_license_assigned',
      actorId,
      actorEmail,
      memberId,
      memberEmail,
      changes,
      metadata
    );
  }

  /**
   * Log bulk operation
   */
  logBulkOperation(
    actorId: string,
    actorEmail: string,
    operation: string,
    memberIds: string[],
    bulkChanges: AuditChange[],
    metadata: AuditMetadata
  ): void {
    const changes: AuditChange[] = [
      {
        field: 'bulk_operation',
        oldValue: null,
        newValue: operation,
        changeType: 'added'
      },
      {
        field: 'affected_members',
        oldValue: null,
        newValue: memberIds.length,
        changeType: 'added'
      },
      ...bulkChanges
    ];

    this.logAction(
      'bulk_operation',
      actorId,
      actorEmail,
      memberIds[0] || 'multiple',
      'multiple',
      changes,
      metadata
    );
  }

  /**
   * Query audit logs
   */
  queryAuditLogs(query: AuditQuery): AuditLog[] {
    let filteredLogs = [...this.auditLogs];

    if (query.memberId) {
      filteredLogs = filteredLogs.filter(log => log.targetMemberId === query.memberId);
    }

    if (query.actorId) {
      filteredLogs = filteredLogs.filter(log => log.actorId === query.actorId);
    }

    if (query.action) {
      filteredLogs = filteredLogs.filter(log => log.action === query.action);
    }

    if (query.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!);
    }

    if (query.organizationId) {
      filteredLogs = filteredLogs.filter(log => log.metadata.organizationId === query.organizationId);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (query.offset) {
      filteredLogs = filteredLogs.slice(query.offset);
    }

    if (query.limit) {
      filteredLogs = filteredLogs.slice(0, query.limit);
    }

    return filteredLogs;
  }

  /**
   * Get audit summary
   */
  getAuditSummary(organizationId: string, days: number = 30): AuditSummary {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentLogs = this.auditLogs.filter(
      log => log.metadata.organizationId === organizationId && log.timestamp >= cutoffDate
    );

    const actionsByType: { [action: string]: number } = {};
    recentLogs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });

    const actorCounts: { [actorId: string]: { actorEmail: string; count: number } } = {};
    recentLogs.forEach(log => {
      if (!actorCounts[log.actorId]) {
        actorCounts[log.actorId] = { actorEmail: log.actorEmail, count: 0 };
      }
      actorCounts[log.actorId].count++;
    });

    const topActors = Object.entries(actorCounts)
      .map(([actorId, data]) => ({ actorId, actorEmail: data.actorEmail, actionCount: data.count }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 5);

    const complianceScore = this.calculateComplianceScore(recentLogs);

    return {
      totalActions: recentLogs.length,
      actionsByType,
      recentActivity: recentLogs.slice(0, 10),
      topActors,
      complianceScore
    };
  }

  /**
   * Calculate compliance score based on audit logs
   */
  private calculateComplianceScore(logs: AuditLog[]): number {
    if (logs.length === 0) return 100;

    let score = 100;
    
    // Deduct points for suspicious activities
    const suspiciousActions = logs.filter(log => 
      log.action === 'member_deleted' || 
      log.action === 'member_suspended' ||
      log.action === 'member_password_reset'
    );
    
    score -= suspiciousActions.length * 5;
    
    // Deduct points for bulk operations (potential mass changes)
    const bulkOperations = logs.filter(log => log.action === 'bulk_operation');
    score -= bulkOperations.length * 2;
    
    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export audit logs for compliance
   */
  exportAuditLogs(query: AuditQuery): string {
    const logs = this.queryAuditLogs(query);
    
    const csvHeaders = [
      'Timestamp',
      'Action',
      'Actor ID',
      'Actor Email',
      'Target Member ID',
      'Target Member Email',
      'Changes',
      'Organization ID'
    ];

    const csvRows = logs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.actorId,
      log.actorEmail,
      log.targetMemberId,
      log.targetMemberEmail,
      JSON.stringify(log.changes),
      log.metadata.organizationId
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const teamMemberAuditService = TeamMemberAuditService.getInstance();
