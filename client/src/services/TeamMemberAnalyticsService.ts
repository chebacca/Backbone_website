/**
 * Team Member Analytics Service
 * 
 * Provides detailed analytics and reporting for team members
 * including usage statistics, trends, and insights.
 */

import { StreamlinedTeamMember } from './UnifiedDataService';

export interface TeamAnalytics {
  overview: OverviewStats;
  trends: TrendData[];
  departmentBreakdown: DepartmentStats[];
  roleDistribution: RoleStats[];
  licenseUtilization: LicenseStats;
  activityMetrics: ActivityMetrics;
  growthMetrics: GrowthMetrics;
  topPerformers: TopPerformer[];
  recommendations: Recommendation[];
}

export interface OverviewStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  licensedMembers: number;
  unlicensedMembers: number;
  averageActivityScore: number;
  memberRetentionRate: number;
}

export interface TrendData {
  period: string;
  membersAdded: number;
  membersRemoved: number;
  netGrowth: number;
  activeMembers: number;
  licenseUtilization: number;
}

export interface DepartmentStats {
  department: string;
  memberCount: number;
  activeMembers: number;
  averageActivityScore: number;
  licenseUtilization: number;
  growthRate: number;
}

export interface RoleStats {
  role: string;
  count: number;
  percentage: number;
  averageActivityScore: number;
  licenseUtilization: number;
}

export interface LicenseStats {
  totalLicenses: number;
  assignedLicenses: number;
  availableLicenses: number;
  utilizationRate: number;
  byType: { [licenseType: string]: number };
  projectedNeeds: number;
}

export interface ActivityMetrics {
  averageLastActive: Date;
  mostActiveMembers: string[];
  inactiveMembers: string[];
  activityScoreDistribution: { [range: string]: number };
}

export interface GrowthMetrics {
  monthlyGrowthRate: number;
  quarterlyGrowthRate: number;
  yearlyGrowthRate: number;
  projectedGrowth: number;
  churnRate: number;
}

export interface TopPerformer {
  memberId: string;
  name: string;
  email: string;
  score: number;
  metrics: {
    activityScore: number;
    projectCount: number;
    licenseUtilization: number;
  };
}

export interface Recommendation {
  type: 'license' | 'role' | 'department' | 'activity' | 'growth';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export class TeamMemberAnalyticsService {
  private static instance: TeamMemberAnalyticsService;

  public static getInstance(): TeamMemberAnalyticsService {
    if (!TeamMemberAnalyticsService.instance) {
      TeamMemberAnalyticsService.instance = new TeamMemberAnalyticsService();
    }
    return TeamMemberAnalyticsService.instance;
  }

  /**
   * Generate comprehensive team analytics
   */
  generateAnalytics(members: StreamlinedTeamMember[]): TeamAnalytics {
    return {
      overview: this.calculateOverviewStats(members),
      trends: this.calculateTrends(members),
      departmentBreakdown: this.calculateDepartmentStats(members),
      roleDistribution: this.calculateRoleDistribution(members),
      licenseUtilization: this.calculateLicenseStats(members),
      activityMetrics: this.calculateActivityMetrics(members),
      growthMetrics: this.calculateGrowthMetrics(members),
      topPerformers: this.identifyTopPerformers(members),
      recommendations: this.generateRecommendations(members)
    };
  }

  /**
   * Calculate overview statistics
   */
  private calculateOverviewStats(members: StreamlinedTeamMember[]): OverviewStats {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;
    const suspendedMembers = members.filter(m => m.status === 'suspended').length;
    const licensedMembers = members.filter(m => m.licenseType && m.licenseType !== 'BASIC').length;
    const unlicensedMembers = totalMembers - licensedMembers;
    
    const activityScores = members.map(m => this.calculateActivityScore(m));
    const averageActivityScore = activityScores.reduce((sum, score) => sum + score, 0) / activityScores.length;
    
    const memberRetentionRate = this.calculateRetentionRate(members);

    return {
      totalMembers,
      activeMembers,
      pendingMembers,
      suspendedMembers,
      licensedMembers,
      unlicensedMembers,
      averageActivityScore: Math.round(averageActivityScore * 100) / 100,
      memberRetentionRate: Math.round(memberRetentionRate * 100) / 100
    };
  }

  /**
   * Calculate trend data over time
   */
  private calculateTrends(members: StreamlinedTeamMember[]): TrendData[] {
    const trends: TrendData[] = [];
    const now = new Date();
    
    // Generate last 12 months of data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const membersInPeriod = members.filter(m => {
        const createdAt = new Date(m.createdAt);
        return createdAt >= date && createdAt < nextMonth;
      });
      
      const activeInPeriod = members.filter(m => {
        const lastActive = m.lastActive ? new Date(m.lastActive) : null;
        return lastActive && lastActive >= date && lastActive < nextMonth;
      });
      
      const licensedInPeriod = members.filter(m => 
        m.licenseType && m.licenseType !== 'BASIC' && 
        new Date(m.createdAt) <= nextMonth
      );
      
      trends.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        membersAdded: membersInPeriod.length,
        membersRemoved: 0, // Would need historical data
        netGrowth: membersInPeriod.length,
        activeMembers: activeInPeriod.length,
        licenseUtilization: licensedInPeriod.length
      });
    }
    
    return trends;
  }

  /**
   * Calculate department statistics
   */
  private calculateDepartmentStats(members: StreamlinedTeamMember[]): DepartmentStats[] {
    const departmentMap = new Map<string, StreamlinedTeamMember[]>();
    
    members.forEach(member => {
      const dept = member.department || 'Unassigned';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, []);
      }
      departmentMap.get(dept)!.push(member);
    });
    
    return Array.from(departmentMap.entries()).map(([department, deptMembers]) => {
      const activeMembers = deptMembers.filter(m => m.status === 'active').length;
      const activityScores = deptMembers.map(m => this.calculateActivityScore(m));
      const averageActivityScore = activityScores.reduce((sum, score) => sum + score, 0) / activityScores.length;
      const licensedMembers = deptMembers.filter(m => m.licenseType && m.licenseType !== 'BASIC').length;
      
      return {
        department,
        memberCount: deptMembers.length,
        activeMembers,
        averageActivityScore: Math.round(averageActivityScore * 100) / 100,
        licenseUtilization: Math.round((licensedMembers / deptMembers.length) * 100),
        growthRate: 0 // Would need historical data
      };
    }).sort((a, b) => b.memberCount - a.memberCount);
  }

  /**
   * Calculate role distribution
   */
  private calculateRoleDistribution(members: StreamlinedTeamMember[]): RoleStats[] {
    const roleMap = new Map<string, StreamlinedTeamMember[]>();
    
    members.forEach(member => {
      if (!roleMap.has(member.role)) {
        roleMap.set(member.role, []);
      }
      roleMap.get(member.role)!.push(member);
    });
    
    const total = members.length;
    
    return Array.from(roleMap.entries()).map(([role, roleMembers]) => {
      const activityScores = roleMembers.map(m => this.calculateActivityScore(m));
      const averageActivityScore = activityScores.reduce((sum, score) => sum + score, 0) / activityScores.length;
      const licensedMembers = roleMembers.filter(m => m.licenseType && m.licenseType !== 'BASIC').length;
      
      return {
        role,
        count: roleMembers.length,
        percentage: Math.round((roleMembers.length / total) * 100),
        averageActivityScore: Math.round(averageActivityScore * 100) / 100,
        licenseUtilization: Math.round((licensedMembers / roleMembers.length) * 100)
      };
    }).sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate license utilization statistics
   */
  private calculateLicenseStats(members: StreamlinedTeamMember[]): LicenseStats {
    const totalLicenses = members.length; // Assuming one license per member
    const assignedLicenses = members.filter(m => m.licenseType && m.licenseType !== 'BASIC').length;
    const availableLicenses = totalLicenses - assignedLicenses;
    const utilizationRate = Math.round((assignedLicenses / totalLicenses) * 100);
    
    const byType: { [licenseType: string]: number } = {};
    members.forEach(member => {
      if (member.licenseType) {
        byType[member.licenseType] = (byType[member.licenseType] || 0) + 1;
      }
    });
    
    return {
      totalLicenses,
      assignedLicenses,
      availableLicenses,
      utilizationRate,
      byType,
      projectedNeeds: Math.max(0, Math.ceil(totalLicenses * 0.1)) // 10% growth projection
    };
  }

  /**
   * Calculate activity metrics
   */
  private calculateActivityMetrics(members: StreamlinedTeamMember[]): ActivityMetrics {
    const activeMembers = members.filter(m => m.lastActive);
    const lastActiveDates = activeMembers.map(m => new Date(m.lastActive!));
    
    const averageLastActive = lastActiveDates.length > 0 
      ? new Date(lastActiveDates.reduce((sum, date) => sum + date.getTime(), 0) / lastActiveDates.length)
      : new Date();
    
    const activityScores = members.map(m => ({
      member: m,
      score: this.calculateActivityScore(m)
    }));
    
    const mostActiveMembers = activityScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(m => `${m.member.firstName} ${m.member.lastName}`);
    
    const inactiveMembers = activityScores
      .filter(m => m.score < 0.3)
      .map(m => `${m.member.firstName} ${m.member.lastName}`);
    
    const activityScoreDistribution = {
      'High (0.8-1.0)': activityScores.filter(m => m.score >= 0.8).length,
      'Medium (0.5-0.8)': activityScores.filter(m => m.score >= 0.5 && m.score < 0.8).length,
      'Low (0.3-0.5)': activityScores.filter(m => m.score >= 0.3 && m.score < 0.5).length,
      'Inactive (0.0-0.3)': activityScores.filter(m => m.score < 0.3).length
    };
    
    return {
      averageLastActive,
      mostActiveMembers,
      inactiveMembers,
      activityScoreDistribution
    };
  }

  /**
   * Calculate growth metrics
   */
  private calculateGrowthMetrics(members: StreamlinedTeamMember[]): GrowthMetrics {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const membersThisMonth = members.filter(m => new Date(m.createdAt) >= oneMonthAgo).length;
    const membersLastMonth = members.filter(m => {
      const created = new Date(m.createdAt);
      return created >= new Date(oneMonthAgo.getTime() - 30 * 24 * 60 * 60 * 1000) && created < oneMonthAgo;
    }).length;
    
    const monthlyGrowthRate = membersLastMonth > 0 
      ? ((membersThisMonth - membersLastMonth) / membersLastMonth) * 100 
      : 0;
    
    return {
      monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
      quarterlyGrowthRate: 0, // Would need historical data
      yearlyGrowthRate: 0, // Would need historical data
      projectedGrowth: Math.round(members.length * (monthlyGrowthRate / 100)),
      churnRate: 0 // Would need historical data
    };
  }

  /**
   * Identify top performing team members
   */
  private identifyTopPerformers(members: StreamlinedTeamMember[]): TopPerformer[] {
    return members
      .map(member => ({
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        score: this.calculateActivityScore(member),
        metrics: {
          activityScore: this.calculateActivityScore(member),
          projectCount: 0, // Would need project data
          licenseUtilization: member.licenseType && member.licenseType !== 'BASIC' ? 1 : 0
        }
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(members: StreamlinedTeamMember[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const stats = this.calculateOverviewStats(members);
    
    // License utilization recommendations
    const licenseUtilization = Math.round((stats.licensedMembers / stats.totalMembers) * 100);
    if (licenseUtilization < 50) {
      recommendations.push({
        type: 'license',
        priority: 'high',
        title: 'Low License Utilization',
        description: `Only ${licenseUtilization}% of team members have licenses assigned.`,
        action: 'Review license assignments and consider upgrading more members.',
        impact: 'Improved productivity and feature access for team members.'
      });
    }
    
    // Activity recommendations
    if (stats.averageActivityScore < 0.5) {
      recommendations.push({
        type: 'activity',
        priority: 'medium',
        title: 'Low Team Activity',
        description: `Average activity score is ${stats.averageActivityScore.toFixed(2)}.`,
        action: 'Engage with inactive members and provide training.',
        impact: 'Increased team engagement and productivity.'
      });
    }
    
    // Growth recommendations
    if (stats.totalMembers < 10) {
      recommendations.push({
        type: 'growth',
        priority: 'low',
        title: 'Small Team Size',
        description: `Team has ${stats.totalMembers} members. Consider expanding.`,
        action: 'Invite more team members to scale operations.',
        impact: 'Better resource distribution and team resilience.'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate activity score for a team member
   */
  private calculateActivityScore(member: StreamlinedTeamMember): number {
    let score = 0;
    
    // Base score for active status
    if (member.status === 'active') score += 0.3;
    
    // Score based on last activity
    if (member.lastActive) {
      const daysSinceActive = (Date.now() - new Date(member.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive < 7) score += 0.4;
      else if (daysSinceActive < 30) score += 0.2;
      else if (daysSinceActive < 90) score += 0.1;
    }
    
    // Score for having a license
    if (member.licenseType && member.licenseType !== 'BASIC') score += 0.2;
    
    // Score for complete profile
    if (member.department && member.position) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate member retention rate
   */
  private calculateRetentionRate(members: StreamlinedTeamMember[]): number {
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalMembers = members.length;
    return totalMembers > 0 ? activeMembers / totalMembers : 0;
  }
}

export const teamMemberAnalyticsService = TeamMemberAnalyticsService.getInstance();
