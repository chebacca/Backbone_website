import CrossPlatformSecurityMonitor from './CrossPlatformSecurityMonitor';
import SecurityApiService from './SecurityApiService';

class SecurityInitializer {
  private static instance: SecurityInitializer;
  private isInitialized: boolean = false;
  private securityMonitor: CrossPlatformSecurityMonitor;
  private securityApiService: SecurityApiService;

  private constructor() {
    this.securityMonitor = CrossPlatformSecurityMonitor.getInstance();
    this.securityApiService = SecurityApiService.getInstance();
  }

  public static getInstance(): SecurityInitializer {
    if (!SecurityInitializer.instance) {
      SecurityInitializer.instance = new SecurityInitializer();
    }
    return SecurityInitializer.instance;
  }

  /**
   * Initialize security monitoring for the licensing website
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🛡️ Security system already initialized');
      return;
    }

    try {
      console.log('🛡️ Initializing cross-platform security monitoring...');

      // Initialize security API service
      await this.securityApiService.initializeFirestore();

      // Start cross-platform security monitoring
      await this.securityMonitor.startMonitoring();

      // Set up security event logging
      this.setupSecurityEventLogging();

      // Set up periodic security health checks
      this.setupSecurityHealthChecks();

      this.isInitialized = true;
      console.log('✅ Cross-platform security monitoring initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize security monitoring:', error);
      throw error;
    }
  }

  /**
   * Setup security event logging
   */
  private setupSecurityEventLogging(): void {
    // Log security events to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Security event logging enabled for development');
    }

    // Set up global security event listeners
    window.addEventListener('security-event', (event: CustomEvent) => {
      this.logSecurityEvent(event.detail);
    });

    // Set up authentication event listeners
    window.addEventListener('auth-event', (event: CustomEvent) => {
      this.logAuthEvent(event.detail);
    });

    // Set up data access event listeners
    window.addEventListener('data-access-event', (event: CustomEvent) => {
      this.logDataAccessEvent(event.detail);
    });
  }

  /**
   * Setup periodic security health checks
   */
  private setupSecurityHealthChecks(): void {
    // Run health check every 5 minutes
    setInterval(async () => {
      try {
        await this.performSecurityHealthCheck();
      } catch (error) {
        console.error('Security health check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Perform security health check
   */
  private async performSecurityHealthCheck(): Promise<void> {
    try {
      console.log('🔍 Performing security health check...');

      // Check if security monitoring is active
      if (!this.isInitialized) {
        console.warn('⚠️ Security monitoring not initialized');
        return;
      }

      // Check for recent security events
      const recentEvents = await this.getRecentSecurityEvents();
      if (recentEvents.length > 0) {
        console.log(`📊 Security health check: ${recentEvents.length} recent events`);
      }

      // Check for critical alerts
      const criticalAlerts = await this.getCriticalAlerts();
      if (criticalAlerts.length > 0) {
        console.warn(`🚨 Security health check: ${criticalAlerts.length} critical alerts`);
      }

      console.log('✅ Security health check completed');
    } catch (error) {
      console.error('❌ Security health check failed:', error);
    }
  }

  /**
   * Get recent security events
   */
  private async getRecentSecurityEvents(): Promise<any[]> {
    try {
      const response = await fetch('/api/security/alerts?source=licensing_website');
      const alerts = await response.json();
      return alerts.filter((alert: any) => {
        const eventTime = new Date(alert.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return eventTime > oneHourAgo;
      });
    } catch (error) {
      console.error('Error getting recent security events:', error);
      return [];
    }
  }

  /**
   * Get critical alerts
   */
  private async getCriticalAlerts(): Promise<any[]> {
    try {
      const response = await fetch('/api/security/alerts?source=licensing_website');
      const alerts = await response.json();
      return alerts.filter((alert: any) => 
        alert.severity === 'critical' && !alert.resolved
      );
    } catch (error) {
      console.error('Error getting critical alerts:', error);
      return [];
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: any): Promise<void> {
    try {
      const securityEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type: event.type || 'security_event',
        source: 'licensing_website',
        userId: event.userId || 'unknown',
        userRole: event.userRole || 'USER',
        organizationId: event.organizationId || 'unknown',
        details: {
          action: event.action || 'unknown',
          resource: event.resource || 'unknown',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          location: event.location,
          deviceInfo: event.deviceInfo
        },
        riskScore: event.riskScore || 0,
        isAnomalous: event.isAnomalous || false,
        threatLevel: event.threatLevel || 'low'
      };

      // Store the event
      await this.securityApiService.createSecurityAlert({
        severity: securityEvent.threatLevel,
        type: 'threat',
        source: 'licensing_website',
        description: `Security event: ${securityEvent.details.action} on ${securityEvent.details.resource}`,
        userContext: {
          userId: securityEvent.userId,
          userRole: securityEvent.userRole,
          organizationId: securityEvent.organizationId,
          isAnonymized: false
        },
        resolved: false,
        autoResolved: false
      });

      console.log('📝 Security event logged:', securityEvent);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Log authentication event
   */
  private async logAuthEvent(event: any): Promise<void> {
    try {
      const authEvent = {
        ...event,
        type: 'login_attempt',
        source: 'licensing_website',
        timestamp: new Date()
      };

      await this.logSecurityEvent(authEvent);
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  }

  /**
   * Log data access event
   */
  private async logDataAccessEvent(event: any): Promise<void> {
    try {
      const dataEvent = {
        ...event,
        type: 'data_access',
        source: 'licensing_website',
        timestamp: new Date()
      };

      await this.logSecurityEvent(dataEvent);
    } catch (error) {
      console.error('Error logging data access event:', error);
    }
  }

  /**
   * Get security status
   */
  public getSecurityStatus(): {
    isInitialized: boolean;
    isMonitoring: boolean;
    lastHealthCheck: Date;
  } {
    return {
      isInitialized: this.isInitialized,
      isMonitoring: this.isInitialized,
      lastHealthCheck: new Date()
    };
  }

  /**
   * Cleanup security resources
   */
  public cleanup(): void {
    if (this.isInitialized) {
      this.securityMonitor.cleanup();
      this.securityApiService.cleanup();
      this.isInitialized = false;
      console.log('🧹 Security resources cleaned up');
    }
  }
}

export default SecurityInitializer;
