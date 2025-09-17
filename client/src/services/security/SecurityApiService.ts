import { getFirestore, collection, query, where, orderBy, limit, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';

interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'breach' | 'threat' | 'unauthorized_access' | 'suspicious_activity' | 'data_exfiltration';
  source: 'dashboard_app' | 'licensing_website' | 'firebase_auth' | 'firestore' | 'api';
  description: string;
  userContext: {
    userId: string;
    userRole: string;
    organizationId: string;
    isAnonymized: boolean;
  };
  resolved: boolean;
  autoResolved: boolean;
}

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

interface UserSecurityOverview {
  userId: string;
  userRole: string;
  organizationId: string;
  lastActivity: Date;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: number;
  totalAlerts: number;
  isOnline: boolean;
  lastLogin: Date;
  deviceCount: number;
  suspiciousActivity: boolean;
}

class SecurityApiService {
  private static instance: SecurityApiService;
  private db: any = null;
  private alertListeners: Map<string, Unsubscribe> = new Map();

  private constructor() {
    this.initializeFirestore();
  }

  public static getInstance(): SecurityApiService {
    if (!SecurityApiService.instance) {
      SecurityApiService.instance = new SecurityApiService();
    }
    return SecurityApiService.instance;
  }

  private async initializeFirestore() {
    try {
      this.db = getFirestore();
    } catch (error) {
      console.error('Failed to initialize Firestore for SecurityApiService:', error);
    }
  }

  private async waitForFirestore(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Firestore initialization timeout'));
      }, 10000);

      const checkFirestore = () => {
        if (this.db) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkFirestore, 100);
        }
      };

      checkFirestore();
    });
  }

  /**
   * Get security metrics for a specific source
   */
  public async getSecurityMetrics(source: 'dashboard_app' | 'licensing_website', organizationId?: string): Promise<SecurityMetrics> {
    try {
      await this.waitForFirestore();
      
      // Get user counts (filter by organization if specified)
      let usersQuery = collection(this.db, 'users');
      let teamMembersQuery = collection(this.db, 'teamMembers');
      
      if (organizationId) {
        usersQuery = query(usersQuery, where('organizationId', '==', organizationId));
        teamMembersQuery = query(teamMembersQuery, where('organizationId', '==', organizationId));
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      const teamMembersSnapshot = await getDocs(teamMembersQuery);
      
      const totalUsers = usersSnapshot.size + teamMembersSnapshot.size;
      
      // Get active users (users with recent activity)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        const lastActivity = userData.lastActivity?.toDate?.() || new Date(0);
        return lastActivity > oneHourAgo;
      }).length;

      // Get security alerts (filter by organization if specified)
      let alertsQuery = collection(this.db, 'securityAlerts');
      if (organizationId) {
        alertsQuery = query(alertsQuery, where('userContext.organizationId', '==', organizationId));
      }
      const alertsSnapshot = await getDocs(alertsQuery);
      const alerts = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const securityAlerts = alerts.length;
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
      const resolvedAlerts = alerts.filter(alert => alert.resolved).length;

      // Calculate threat level
      let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (criticalAlerts > 0) threatLevel = 'critical';
      else if (securityAlerts > 10) threatLevel = 'high';
      else if (securityAlerts > 5) threatLevel = 'medium';

      return {
        totalUsers,
        activeUsers,
        securityAlerts,
        criticalAlerts,
        resolvedAlerts,
        threatLevel,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        securityAlerts: 0,
        criticalAlerts: 0,
        resolvedAlerts: 0,
        threatLevel: 'low',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get security alerts for a specific source
   */
  public async getSecurityAlerts(source: 'dashboard_app' | 'licensing_website', organizationId?: string): Promise<SecurityAlert[]> {
    try {
      await this.waitForFirestore();
      
      let alertsQuery = query(
        collection(this.db, 'securityAlerts'),
        where('source', '==', source),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      if (organizationId) {
        alertsQuery = query(
          collection(this.db, 'securityAlerts'),
          where('source', '==', source),
          where('userContext.organizationId', '==', organizationId),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
      }
      
      const snapshot = await getDocs(alertsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      })) as SecurityAlert[];
    } catch (error) {
      console.error('Error getting security alerts:', error);
      return [];
    }
  }

  /**
   * Get user security overviews (anonymized for DEV ADMIN, full for ORG ADMIN)
   */
  public async getUserSecurityOverviews(source: 'dashboard_app' | 'licensing_website', organizationId?: string): Promise<UserSecurityOverview[]> {
    try {
      await this.waitForFirestore();
      
      // Get users from both users and teamMembers collections (filter by organization if specified)
      let usersQuery = collection(this.db, 'users');
      let teamMembersQuery = collection(this.db, 'teamMembers');
      
      if (organizationId) {
        usersQuery = query(usersQuery, where('organizationId', '==', organizationId));
        teamMembersQuery = query(teamMembersQuery, where('organizationId', '==', organizationId));
      }
      
      const [usersSnapshot, teamMembersSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(teamMembersQuery)
      ]);

      const allUsers = [
        ...usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'user' })),
        ...teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'teamMember' }))
      ];

      // Get security alerts for each user
      const alertsSnapshot = await getDocs(collection(this.db, 'securityAlerts'));
      const alerts = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Process users and create security overviews
      const userOverviews: UserSecurityOverview[] = allUsers.map(user => {
        const userAlerts = alerts.filter(alert => 
          alert.userContext?.userId === user.id || 
          alert.userContext?.userId === user.userId
        );
        
        const activeAlerts = userAlerts.filter(alert => !alert.resolved).length;
        const criticalAlerts = userAlerts.filter(alert => alert.severity === 'critical').length;
        
        let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (criticalAlerts > 0) threatLevel = 'critical';
        else if (activeAlerts > 5) threatLevel = 'high';
        else if (activeAlerts > 2) threatLevel = 'medium';

        // Anonymize user ID for DEV ADMIN (cross-platform view), keep full for ORG ADMIN
        const displayUserId = organizationId ? user.id : `user_${user.id.slice(-4)}`;

        return {
          userId: displayUserId,
          userRole: user.role || user.userRole || 'USER',
          organizationId: user.organizationId || 'unknown',
          lastActivity: user.lastActivity?.toDate?.() || new Date(0),
          threatLevel,
          activeAlerts,
          totalAlerts: userAlerts.length,
          isOnline: user.isOnline || false,
          lastLogin: user.lastLogin?.toDate?.() || new Date(0),
          deviceCount: user.deviceCount || 1,
          suspiciousActivity: user.suspiciousActivity || false
        };
      });

      return userOverviews.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      console.error('Error getting user security overviews:', error);
      return [];
    }
  }

  /**
   * Create a security alert
   */
  public async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<string> {
    try {
      await this.waitForFirestore();
      
      const alertData = {
        ...alert,
        timestamp: new Date(),
        createdAt: new Date()
      };

      const docRef = await this.db.collection('securityAlerts').add(alertData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }

  /**
   * Resolve a security alert
   */
  public async resolveSecurityAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      await this.waitForFirestore();
      
      await this.db.collection('securityAlerts').doc(alertId).update({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy
      });
    } catch (error) {
      console.error('Error resolving security alert:', error);
      throw error;
    }
  }

  /**
   * Listen to security alerts in real-time
   */
  public subscribeToSecurityAlerts(
    source: 'dashboard_app' | 'licensing_website',
    callback: (alerts: SecurityAlert[]) => void
  ): Unsubscribe {
    try {
      const alertsQuery = query(
        collection(this.db, 'securityAlerts'),
        where('source', '==', source),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
        const alerts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        })) as SecurityAlert[];
        
        callback(alerts);
      });

      this.alertListeners.set(source, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to security alerts:', error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from security alerts
   */
  public unsubscribeFromSecurityAlerts(source: 'dashboard_app' | 'licensing_website'): void {
    const unsubscribe = this.alertListeners.get(source);
    if (unsubscribe) {
      unsubscribe();
      this.alertListeners.delete(source);
    }
  }

  /**
   * Clean up all listeners
   */
  public cleanup(): void {
    this.alertListeners.forEach(unsubscribe => unsubscribe());
    this.alertListeners.clear();
  }
}

export default SecurityApiService;
