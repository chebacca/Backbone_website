import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import SecurityApiService from './SecurityApiService';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login_attempt' | 'data_access' | 'api_call' | 'file_upload' | 'permission_change' | 'suspicious_activity';
  source: 'dashboard_app' | 'licensing_website' | 'firebase_auth' | 'firestore' | 'api';
  userId: string;
  userRole: string;
  organizationId: string;
  details: {
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceInfo?: string;
  };
  riskScore: number; // 0-100
  isAnomalous: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityThreat {
  id: string;
  timestamp: Date;
  type: 'brute_force' | 'data_exfiltration' | 'privilege_escalation' | 'cross_org_access' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'dashboard_app' | 'licensing_website' | 'firebase_auth' | 'firestore' | 'api';
  description: string;
  affectedUsers: string[];
  indicators: string[];
  resolved: boolean;
  autoResolved: boolean;
  resolutionNotes?: string;
}

class CrossPlatformSecurityMonitor {
  private static instance: CrossPlatformSecurityMonitor;
  private db: any = null;
  private securityApiService: SecurityApiService;
  private eventListeners: Map<string, Unsubscribe> = new Map();
  private isMonitoring: boolean = false;
  private threatDetectionRules: Map<string, (event: SecurityEvent) => boolean> = new Map();

  private constructor() {
    this.initializeFirestore();
    this.securityApiService = SecurityApiService.getInstance();
    this.setupThreatDetectionRules();
  }

  public static getInstance(): CrossPlatformSecurityMonitor {
    if (!CrossPlatformSecurityMonitor.instance) {
      CrossPlatformSecurityMonitor.instance = new CrossPlatformSecurityMonitor();
    }
    return CrossPlatformSecurityMonitor.instance;
  }

  private async initializeFirestore() {
    try {
      this.db = getFirestore();
    } catch (error) {
      console.error('Failed to initialize Firestore for CrossPlatformSecurityMonitor:', error);
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
   * Setup threat detection rules
   */
  private setupThreatDetectionRules() {
    // Brute force detection
    this.threatDetectionRules.set('brute_force', (event: SecurityEvent) => {
      return event.type === 'login_attempt' && event.riskScore > 80;
    });

    // Data exfiltration detection
    this.threatDetectionRules.set('data_exfiltration', (event: SecurityEvent) => {
      return event.type === 'data_access' && 
             event.details.resource.includes('sensitive') && 
             event.riskScore > 70;
    });

    // Privilege escalation detection
    this.threatDetectionRules.set('privilege_escalation', (event: SecurityEvent) => {
      return event.type === 'permission_change' && 
             event.details.action.includes('elevate') && 
             event.riskScore > 60;
    });

    // Cross-organization access detection
    this.threatDetectionRules.set('cross_org_access', (event: SecurityEvent) => {
      return event.type === 'data_access' && 
             event.details.resource.includes('organization') && 
             event.riskScore > 50;
    });

    // Suspicious pattern detection
    this.threatDetectionRules.set('suspicious_pattern', (event: SecurityEvent) => {
      return event.isAnomalous && event.riskScore > 40;
    });
  }

  /**
   * Start cross-platform security monitoring
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Cross-platform security monitoring already active');
      return;
    }

    try {
      await this.waitForFirestore();
      
      console.log('🛡️ Starting cross-platform security monitoring...');
      
      // Monitor security events from both platforms
      await this.setupEventMonitoring('dashboard_app');
      await this.setupEventMonitoring('licensing_website');
      
      // Monitor Firebase Auth events
      await this.setupFirebaseAuthMonitoring();
      
      // Monitor Firestore access patterns
      await this.setupFirestoreMonitoring();
      
      this.isMonitoring = true;
      console.log('✅ Cross-platform security monitoring started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start cross-platform security monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop cross-platform security monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🛑 Stopping cross-platform security monitoring...');
    
    // Clean up all event listeners
    this.eventListeners.forEach(unsubscribe => unsubscribe());
    this.eventListeners.clear();
    
    this.isMonitoring = false;
    console.log('✅ Cross-platform security monitoring stopped');
  }

  /**
   * Setup event monitoring for a specific platform
   */
  private async setupEventMonitoring(platform: 'dashboard_app' | 'licensing_website'): Promise<void> {
    try {
      const eventsQuery = query(
        collection(this.db, 'securityEvents'),
        where('source', '==', platform),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        })) as SecurityEvent[];

        // Process events for threat detection
        events.forEach(event => this.processSecurityEvent(event));
      });

      this.eventListeners.set(`events_${platform}`, unsubscribe);
    } catch (error) {
      console.error(`Error setting up event monitoring for ${platform}:`, error);
    }
  }

  /**
   * Setup Firebase Auth monitoring
   */
  private async setupFirebaseAuthMonitoring(): Promise<void> {
    try {
      // Monitor authentication events
      const authEventsQuery = query(
        collection(this.db, 'authEvents'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(authEventsQuery, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));

        // Process auth events for security analysis
        events.forEach(event => this.processAuthEvent(event));
      });

      this.eventListeners.set('auth_events', unsubscribe);
    } catch (error) {
      console.error('Error setting up Firebase Auth monitoring:', error);
    }
  }

  /**
   * Setup Firestore monitoring
   */
  private async setupFirestoreMonitoring(): Promise<void> {
    try {
      // Monitor Firestore access patterns
      const firestoreEventsQuery = query(
        collection(this.db, 'firestoreEvents'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(firestoreEventsQuery, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));

        // Process Firestore events for security analysis
        events.forEach(event => this.processFirestoreEvent(event));
      });

      this.eventListeners.set('firestore_events', unsubscribe);
    } catch (error) {
      console.error('Error setting up Firestore monitoring:', error);
    }
  }

  /**
   * Process security event for threat detection
   */
  private async processSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Check against all threat detection rules
      for (const [ruleName, ruleFunction] of this.threatDetectionRules) {
        if (ruleFunction(event)) {
          await this.createSecurityThreat(ruleName, event);
        }
      }

      // Store the event for analysis
      await this.storeSecurityEvent(event);
    } catch (error) {
      console.error('Error processing security event:', error);
    }
  }

  /**
   * Process authentication event
   */
  private async processAuthEvent(event: any): Promise<void> {
    try {
      // Convert auth event to security event format
      const securityEvent: SecurityEvent = {
        id: event.id,
        timestamp: event.timestamp,
        type: 'login_attempt',
        source: 'firebase_auth',
        userId: event.userId || 'unknown',
        userRole: event.userRole || 'USER',
        organizationId: event.organizationId || 'unknown',
        details: {
          action: event.action || 'login',
          resource: 'authentication',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          location: event.location,
          deviceInfo: event.deviceInfo
        },
        riskScore: this.calculateRiskScore(event),
        isAnomalous: this.detectAnomaly(event),
        threatLevel: this.calculateThreatLevel(event)
      };

      await this.processSecurityEvent(securityEvent);
    } catch (error) {
      console.error('Error processing auth event:', error);
    }
  }

  /**
   * Process Firestore event
   */
  private async processFirestoreEvent(event: any): Promise<void> {
    try {
      // Convert Firestore event to security event format
      const securityEvent: SecurityEvent = {
        id: event.id,
        timestamp: event.timestamp,
        type: 'data_access',
        source: 'firestore',
        userId: event.userId || 'unknown',
        userRole: event.userRole || 'USER',
        organizationId: event.organizationId || 'unknown',
        details: {
          action: event.action || 'read',
          resource: event.collection || 'unknown',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          location: event.location,
          deviceInfo: event.deviceInfo
        },
        riskScore: this.calculateRiskScore(event),
        isAnomalous: this.detectAnomaly(event),
        threatLevel: this.calculateThreatLevel(event)
      };

      await this.processSecurityEvent(securityEvent);
    } catch (error) {
      console.error('Error processing Firestore event:', error);
    }
  }

  /**
   * Calculate risk score for an event
   */
  private calculateRiskScore(event: any): number {
    let score = 0;

    // Base score from event type
    switch (event.type) {
      case 'login_attempt':
        score += 20;
        break;
      case 'data_access':
        score += 30;
        break;
      case 'permission_change':
        score += 50;
        break;
      case 'file_upload':
        score += 40;
        break;
    }

    // Add score for suspicious patterns
    if (event.isAnomalous) score += 30;
    if (event.riskScore) score += event.riskScore;

    // Add score for high-risk resources
    if (event.details?.resource?.includes('sensitive')) score += 20;
    if (event.details?.resource?.includes('admin')) score += 15;

    return Math.min(score, 100);
  }

  /**
   * Detect anomalies in events
   */
  private detectAnomaly(event: any): boolean {
    // Simple anomaly detection - can be enhanced with ML
    const now = new Date();
    const eventTime = event.timestamp?.toDate?.() || new Date();
    const timeDiff = now.getTime() - eventTime.getTime();
    
    // Flag events that are very recent (potential real-time threats)
    if (timeDiff < 60000) return true;
    
    // Flag events with high risk scores
    if (event.riskScore > 70) return true;
    
    // Flag events from unusual locations or devices
    if (event.details?.location && event.details.location.includes('unusual')) return true;
    
    return false;
  }

  /**
   * Calculate threat level based on risk score
   */
  private calculateThreatLevel(event: any): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = this.calculateRiskScore(event);
    
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Create security threat
   */
  private async createSecurityThreat(ruleName: string, event: SecurityEvent): Promise<void> {
    try {
      const threat: Omit<SecurityThreat, 'id'> = {
        timestamp: new Date(),
        type: ruleName as any,
        severity: event.threatLevel,
        source: event.source,
        description: `Security threat detected: ${ruleName} - ${event.details.action} on ${event.details.resource}`,
        affectedUsers: [event.userId],
        indicators: [
          `User: ${event.userId}`,
          `Action: ${event.details.action}`,
          `Resource: ${event.details.resource}`,
          `Risk Score: ${event.riskScore}`,
          `IP: ${event.details.ipAddress || 'unknown'}`
        ],
        resolved: false,
        autoResolved: false
      };

      await addDoc(collection(this.db, 'securityThreats'), threat);
      
      // Also create a security alert
      await this.securityApiService.createSecurityAlert({
        severity: event.threatLevel,
        type: 'threat',
        source: event.source,
        description: threat.description,
        userContext: {
          userId: event.userId,
          userRole: event.userRole,
          organizationId: event.organizationId,
          isAnonymized: false
        },
        resolved: false,
        autoResolved: false
      });

      console.log(`🚨 Security threat created: ${ruleName} for user ${event.userId}`);
    } catch (error) {
      console.error('Error creating security threat:', error);
    }
  }

  /**
   * Store security event
   */
  private async storeSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await addDoc(collection(this.db, 'securityEvents'), {
        ...event,
        timestamp: event.timestamp
      });
    } catch (error) {
      console.error('Error storing security event:', error);
    }
  }

  /**
   * Get security threats
   */
  public async getSecurityThreats(): Promise<SecurityThreat[]> {
    try {
      await this.waitForFirestore();
      
      const threatsQuery = query(
        collection(this.db, 'securityThreats'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(threatsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      })) as SecurityThreat[];
    } catch (error) {
      console.error('Error getting security threats:', error);
      return [];
    }
  }

  /**
   * Resolve security threat
   */
  public async resolveSecurityThreat(threatId: string, resolutionNotes?: string): Promise<void> {
    try {
      await this.waitForFirestore();
      
      await this.db.collection('securityThreats').doc(threatId).update({
        resolved: true,
        resolvedAt: new Date(),
        resolutionNotes
      });
    } catch (error) {
      console.error('Error resolving security threat:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopMonitoring();
  }
}

export default CrossPlatformSecurityMonitor;
