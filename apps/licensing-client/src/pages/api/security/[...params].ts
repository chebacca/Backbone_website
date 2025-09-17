import { NextApiRequest, NextApiResponse } from 'next';
import SecurityApiService from '../../services/security/SecurityApiService';

const securityApiService = SecurityApiService.getInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params } = req.query;
  const [endpoint, source] = params as string[];

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (endpoint) {
      case 'metrics':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const sourceParam = req.query.source as 'dashboard_app' | 'licensing_website';
        const organizationId = req.query.organizationId as string;
        
        if (!sourceParam) {
          return res.status(400).json({ error: 'Source parameter is required' });
        }

        const metrics = await securityApiService.getSecurityMetrics(sourceParam, organizationId);
        return res.status(200).json(metrics);

      case 'alerts':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const alertsSource = req.query.source as 'dashboard_app' | 'licensing_website';
        const organizationId = req.query.organizationId as string;
        
        if (!alertsSource) {
          return res.status(400).json({ error: 'Source parameter is required' });
        }

        const alerts = await securityApiService.getSecurityAlerts(alertsSource, organizationId);
        return res.status(200).json(alerts);

      case 'users':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const usersSource = req.query.source as 'dashboard_app' | 'licensing_website';
        const organizationId = req.query.organizationId as string;
        
        if (!usersSource) {
          return res.status(400).json({ error: 'Source parameter is required' });
        }

        const users = await securityApiService.getUserSecurityOverviews(usersSource, organizationId);
        return res.status(200).json(users);

      case 'create-alert':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const alertData = req.body;
        const alertId = await securityApiService.createSecurityAlert(alertData);
        return res.status(201).json({ id: alertId });

      case 'resolve-alert':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { alertId, resolvedBy } = req.body;
        if (!alertId || !resolvedBy) {
          return res.status(400).json({ error: 'Alert ID and resolvedBy are required' });
        }

        await securityApiService.resolveSecurityAlert(alertId, resolvedBy);
        return res.status(200).json({ success: true });

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Security API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
