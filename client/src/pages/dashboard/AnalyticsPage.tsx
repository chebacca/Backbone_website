import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Grid,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Analytics,
  Speed,
  Devices,
  TrendingUp,
  TrendingDown,
  Storage as StorageIcon,
  LocationOn,
  Code,
  Security,
  Assessment,
  Timeline,
  BarChart,
  Refresh,
} from '@mui/icons-material';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import MetricCard from '@/components/common/MetricCard';
import StorageWarningCard from '@/components/StorageWarningCard';
import { StorageAnalyticsService } from '@/services/storageAnalytics';

interface ChartData {
  label: string;
  value: number;
  change?: number;
}

interface UsageMetric {
  name: string;
  value: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface AnalyticsData {
  totalApiCalls: number;
  responseTime: number;
  activeDevices: number;
  dataTransfer: number;
  dailyUsage: ChartData[];
  topEndpoints: Array<{
    name: string;
    calls: number;
    percentage: number;
  }>;
  geographicData: Array<{
    region: string;
    users: number;
    percentage: number;
  }>;
  usageMetrics: UsageMetric[];
}

const emptyUsageData: ChartData[] = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 },
  { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 },
];

const defaultAnalyticsData: AnalyticsData = {
  totalApiCalls: 0,
  responseTime: 0,
  activeDevices: 0,
  dataTransfer: 0,
  dailyUsage: emptyUsageData,
  topEndpoints: [],
  geographicData: [],
  usageMetrics: [],
};

const SimpleChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1, px: 2 }}>
      {data.map((item) => (
        <Box key={item.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'api_calls' | 'data_transfer' | 'devices'>('api_calls');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(defaultAnalyticsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const roleUpper = String(user?.role || '').toUpperCase();
      const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN';

      let data: AnalyticsData;

      if (isAdmin) {
        // Admin: Fetch system-wide analytics
        try {
          const [licenseAnalytics, systemHealth, userStats] = await Promise.allSettled([
            api.get(`${endpoints.admin.licenseAnalytics()}?period=${timeRange}`),
            api.get(endpoints.admin.systemHealth()),
            api.get(endpoints.admin.dashboardStats()),
          ]);

          const la = licenseAnalytics.status === 'fulfilled' ? licenseAnalytics.value.data?.data?.analytics || {} : {};
          const sh = systemHealth.status === 'fulfilled' ? systemHealth.value.data?.data || {} : {};
          const us = userStats.status === 'fulfilled' ? userStats.value.data?.data || {} : {};

          data = {
            totalApiCalls: la.totalApiCalls || la.activeLicenses || 0,
            responseTime: sh.averageResponseTime || 98.7,
            activeDevices: la.activeDevices || la.newLicenses || 0,
            dataTransfer: (la.totalDataTransfer || la.totalLicenses || 0) / 1000, // Convert to GB
            dailyUsage: (la.dailyCounts || []).map((d: any) => ({ 
              label: d.date, 
              value: d.count,
              change: d.change || 0
            })) || emptyUsageData,
            topEndpoints: la.topEndpoints || [],
            geographicData: la.geographicDistribution || [],
            usageMetrics: [
              { 
                name: 'API Calls', 
                value: la.totalApiCalls || la.activeLicenses || 0, 
                limit: 100000, 
                unit: 'calls', 
                icon: <Code />, 
                color: '#00d4ff' 
              },
              { 
                name: 'Data Transfer', 
                value: (la.totalDataTransfer || la.totalLicenses || 0) / 1000, 
                limit: 100, 
                unit: 'GB', 
                icon: <StorageIcon />, 
                color: '#667eea' 
              },
              { 
                name: 'Active Devices', 
                value: la.activeDevices || la.newLicenses || 0, 
                limit: 50, 
                unit: 'devices', 
                icon: <Devices />, 
                color: '#f093fb' 
              },
              { 
                name: 'Uptime', 
                value: sh.uptimePercentage || 99.8, 
                limit: 100, 
                unit: '%', 
                icon: <Security />, 
                color: '#4facfe' 
              },
            ],
          };
        } catch (adminError) {
          console.warn('Admin analytics failed, falling back to basic data:', adminError);
          data = defaultAnalyticsData;
        }
      } else {
        // Non-admin: Fetch user-specific analytics with fallbacks
        try {
          // Try to fetch license analytics first
          const licenseAnalytics = await api.get(endpoints.licenses.analytics());
          const la = licenseAnalytics.data?.data || {};

          data = {
            totalApiCalls: la.totalEvents || la.totalApiCalls || 0,
            responseTime: la.averageResponseTime || 98.7,
            activeDevices: la.activeDevices || Object.keys(la.eventTypes || {}).length,
            dataTransfer: (la.totalDataTransfer || la.totalEvents || 0) / 1000, // Convert to GB
            dailyUsage: Object.entries(la.dailyUsage || la.eventTypes || {}).map(([k, v]: any) => ({ 
              label: k, 
              value: v,
              change: la.dailyChanges?.[k] || 0
            })) || emptyUsageData,
            topEndpoints: la.topEndpoints || [],
            geographicData: la.geographicData || [],
            usageMetrics: [
              { 
                name: 'API Calls', 
                value: la.totalEvents || la.totalApiCalls || 0, 
                limit: 100000, // Default limit
                unit: 'calls', 
                icon: <Code />, 
                color: '#00d4ff' 
              },
              { 
                name: 'Data Transfer', 
                value: (la.totalDataTransfer || la.totalEvents || 0) / 1000, 
                limit: 100, // Default limit
                unit: 'GB', 
                icon: <StorageIcon />, 
                color: '#667eea' 
              },
              { 
                name: 'Active Devices', 
                value: la.activeDevices || Object.keys(la.eventTypes || {}).length, 
                limit: 50, // Default limit
                unit: 'devices', 
                icon: <Devices />, 
                color: '#f093fb' 
              },
              { 
                name: 'Uptime', 
                value: la.uptimePercentage || 99.8, 
                limit: 100, 
                unit: '%', 
                icon: <Security />, 
                color: '#4facfe' 
              },
            ],
          };
        } catch (userError) {
          console.warn('User analytics failed, using default data:', userError);
          data = defaultAnalyticsData;
        }
      }

      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
      
      // Fallback to default data
      setAnalyticsData(defaultAnalyticsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user?.role, timeRange]);

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value as '7d' | '30d' | '90d');
  };

  const handleMetricChange = (metric: 'api_calls' | 'data_transfer' | 'devices') => {
    setSelectedMetric(metric);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const avgGrowth = useMemo(() => {
    if (!analyticsData.dailyUsage.length) return 0;
    return analyticsData.dailyUsage.reduce((s, d) => s + (d.change || 0), 0) / analyticsData.dailyUsage.length;
  }, [analyticsData.dailyUsage]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Usage Analytics
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Monitor your BackboneLogic, Inc. usage patterns and performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              disabled={loading}
              inputProps={{
                'aria-label': 'Select time range for analytics',
                title: 'Choose the time period for analytics data'
              }}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={selectedMetric === 'api_calls' ? 'contained' : 'outlined'}
              onClick={() => handleMetricChange('api_calls')}
              disabled={loading}
            >
              API Calls
            </Button>
            <Button
              variant={selectedMetric === 'data_transfer' ? 'contained' : 'outlined'}
              onClick={() => handleMetricChange('data_transfer')}
              disabled={loading}
            >
              Data Transfer
            </Button>
            <Button
              variant={selectedMetric === 'devices' ? 'contained' : 'outlined'}
              onClick={() => handleMetricChange('devices')}
              disabled={loading}
            >
              Devices
            </Button>
          </ButtonGroup>

          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Storage Warning Card */}
      <StorageWarningCard 
        onUpgrade={() => window.open('/pricing', '_blank')}
        compact={false}
      />

      {/* Summary Cards - Using MetricCard component like Overview page */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total API Calls"
            value={loading ? 'Loading...' : analyticsData.totalApiCalls.toLocaleString()}
            icon={<Analytics />}
            trend={{ value: avgGrowth, direction: 'up' }}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Response Time"
            value={loading ? 'Loading...' : `${analyticsData.responseTime}%`}
            icon={<Speed />}
            trend={{ value: 2.3, direction: 'up' }}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Devices"
            value={loading ? 'Loading...' : analyticsData.activeDevices.toString()}
            icon={<Devices />}
            trend={{ value: 12, direction: 'up' }}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Data Transfer"
            value={loading ? 'Loading...' : `${analyticsData.dataTransfer.toFixed(1)} GB`}
            icon={<StorageIcon />}
            trend={{ value: 0.2, direction: 'down' }}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Usage Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Usage Trends
              </Typography>
              <SimpleChart data={analyticsData.dailyUsage} loading={loading} />
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Metrics */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              mb: 3,
              height: 'fit-content',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Real-time Status
              </Typography>

              <Grid container spacing={2}>
                {analyticsData.usageMetrics.map((metric) => (
                  <Grid item xs={12} key={metric.name}>
                    <Box>
                      <Card
                        sx={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Avatar sx={{ bgcolor: metric.color, width: 40, height: 40 }}>
                              {metric.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {loading ? (
                                <Skeleton width={80} height={32} />
                              ) : (
                                <>
                                  {metric.value.toLocaleString()}
                                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    {metric.unit}
                                  </Typography>
                                </>
                              )}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {metric.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={loading ? 0 : (metric.value / metric.limit) * 100}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  backgroundColor: metric.color,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                              {loading ? (
                                <Skeleton width={30} height={16} />
                              ) : (
                                `${((metric.value / metric.limit) * 100).toFixed(1)}%`
                              )}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Endpoints */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top API Endpoints
              </Typography>

              {loading ? (
                <Box>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={40} />
                    </Box>
                  ))}
                </Box>
              ) : analyticsData.topEndpoints.length > 0 ? (
                <List dense>
                  {analyticsData.topEndpoints.map((endpoint, index) => (
                    <React.Fragment key={endpoint.name}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={endpoint.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={endpoint.percentage}
                                sx={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: 'linear-gradient(90deg, #00d4ff 0%, #667eea 100%)',
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ minWidth: 60 }}>
                                {endpoint.calls.toLocaleString()} calls
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                            sx: { fontFamily: 'monospace' },
                          }}
                        />
                      </ListItem>
                      {index < analyticsData.topEndpoints.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No endpoint data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Geographic Distribution
              </Typography>

              {loading ? (
                <Box>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={40} />
                    </Box>
                  ))}
                </Box>
              ) : analyticsData.geographicData.length > 0 ? (
                <List dense>
                  {analyticsData.geographicData.map((region, index) => (
                    <React.Fragment key={region.region}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LocationOn sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={region.region}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={region.percentage}
                                sx={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ minWidth: 60 }}>
                                {region.users} users
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < analyticsData.geographicData.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No geographic data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
