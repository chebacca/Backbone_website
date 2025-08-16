import { logger } from '../utils/logger.js';

/**
 * ProjectBridgeService
 * Bridges admin actions from the licensing site to the Project server (Dashboard-v14_2).
 * - Authenticates with the project API using admin credentials
 * - Finds or creates a user by email
 * - Sets/updates the user's password for project login
 *
 * Environment variables required:
 * - PROJECT_API_URL
 * - PROJECT_ADMIN_EMAIL
 * - PROJECT_ADMIN_PASSWORD
 */
class ProjectBridgeService {
  private static cachedToken: { token: string; acquiredAt: number } | null = null;

  private static get apiBase(): string {
    return (process.env.PROJECT_API_URL || '').replace(/\/$/, '');
  }

  private static get adminEmail(): string {
    return process.env.PROJECT_ADMIN_EMAIL || '';
  }

  private static get adminPassword(): string {
    return process.env.PROJECT_ADMIN_PASSWORD || '';
  }

  private static isConfigured(): boolean {
    return Boolean(this.apiBase && this.adminEmail && this.adminPassword);
  }

  private static async ensureToken(): Promise<string | null> {
    try {
      if (!this.isConfigured()) return null;
      const now = Date.now();
      if (this.cachedToken && now - this.cachedToken.acquiredAt < 10 * 60 * 1000) {
        return this.cachedToken.token;
      }
      const res = await fetch(`${this.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.adminEmail, password: this.adminPassword })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        logger.warn('ProjectBridgeService login failed', { status: res.status, text: text?.slice(0, 200) });
        return null;
      }
      const json: any = await res.json().catch(() => ({}));
      const token: string | undefined = json?.token || json?.data?.token || json?.accessToken;
      if (!token) return null;
      this.cachedToken = { token, acquiredAt: now };
      return token;
    } catch (err) {
      logger.warn('ProjectBridgeService ensureToken error', { error: (err as any)?.message });
      return null;
    }
  }

  private static async findUserByEmail(token: string, email: string): Promise<string | null> {
    const url = `${this.apiBase}/api/users/search?q=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const json: any = await res.json().catch(() => null);
    const list: any[] = json?.data || json || [];
    const hit = Array.isArray(list) ? list.find((u) => String(u.email).toLowerCase() === email.toLowerCase()) : null;
    return hit?.id || null;
  }

  private static async createUser(token: string, email: string, password: string): Promise<string | null> {
    const url = `${this.apiBase}/api/admin/users`;
    const body = {
      email,
      username: email.split('@')[0],
      role: 'GUEST',
      status: 'ACTIVE',
      password,
      firstName: email.split('@')[0],
      lastName: ''
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('ProjectBridgeService createUser failed', { status: res.status, text: text?.slice(0, 200) });
      return null;
    }
    const json: any = await res.json().catch(() => ({}));
    return json?.id || json?.data?.id || null;
  }

  private static async updateUserPassword(token: string, userId: string, password: string): Promise<boolean> {
    // Prefer admin endpoint which accepts plain password and hashes server-side
    const url = `${this.apiBase}/api/admin/users/${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('ProjectBridgeService updateUserPassword failed', { status: res.status, text: text?.slice(0, 200) });
      return false;
    }
    return true;
  }

  static async setProjectUserPasswordByEmail(email: string, password: string): Promise<boolean> {
    try {
      const token = await this.ensureToken();
      if (!token) return false;
      let userId = await this.findUserByEmail(token, email);
      if (!userId) {
        userId = await this.createUser(token, email, password);
        if (!userId) return false;
        return true;
      }
      return await this.updateUserPassword(token, userId, password);
    } catch (err) {
      logger.warn('ProjectBridgeService set password error', { error: (err as any)?.message });
      return false;
    }
  }
}

export { ProjectBridgeService };
export default ProjectBridgeService;


