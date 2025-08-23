/**
 * Base service interface and abstract class
 */
import { ApiRequestOptions, ServiceConfig } from '../models/types';
import { FirestoreAdapter } from '../adapters/FirestoreAdapter';

export interface IBaseService {
  isWebOnlyMode(): boolean;
  getConfig(): ServiceConfig;
}

export abstract class BaseService implements IBaseService {
  protected config: ServiceConfig;
  protected firestoreAdapter: FirestoreAdapter;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.firestoreAdapter = FirestoreAdapter.getInstance();
  }

  public isWebOnlyMode(): boolean {
    return this.config.isWebOnlyMode;
  }

  public getConfig(): ServiceConfig {
    return this.config;
  }

  /**
   * Make an API request
   */
  protected async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const baseUrl = this.config.apiBaseUrl || '/api';
      const url = `${baseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders
      };
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include'
      };
      
      if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error(`❌ [BaseService] API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: any, context: string): void {
    console.error(`❌ [${this.constructor.name}] Error in ${context}:`, error);
    
    // Additional error handling logic can be added here
    // For example, sending errors to a monitoring service
  }
}
