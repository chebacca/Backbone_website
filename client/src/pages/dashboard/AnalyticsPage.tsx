import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Speed,
  Storage,
  Devices,
  LocationOn,
  Code,
  Security,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

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

const emptyUsageData: ChartData[] = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 },
  { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 },
];

const makeUsageMetrics = (totals: { apiCalls: number; dataTransferGB: number; activeDevices: number; uptimePct: number; }) : UsageMetric[] => [
  { name: 'API Calls', value: totals.apiCalls, limit: 100000, unit: 'calls', icon: <Code />, color: '#00d4ff' },
  { name: 'Data Transfer', value: totals.dataTransferGB, limit: 100, unit: 'GB', icon: <Storage />, color: '#667eea' },
  { name: 'Active Devices', value: totals.activeDevices, limit: 50, unit: 'devices', icon: <Devices />, color: '#f093fb' },
  { name: 'Uptime', value: totals.uptimePct, limit: 100, unit: '%', icon: <Security />, color: '#4facfe' },
];

const topEndpoints = [
  { name: '/api/v1/licenses/validate', calls: 23567, percentage: 45.2 },
  { name: '/api/v1/users/profile', calls: 12890, percentage: 24.7 },
  { name: '/api/v1/analytics/usage', calls: 8234, percentage: 15.8 },
  { name: '/api/v1/downloads/sdk', calls: 4567, percentage: 8.8 },
  { name: '/api/v1/auth/refresh', calls: 2890, percentage: 5.5 },
];

const activeRegions = [
  { region: 'United States', users: 145, percentage: 42.3 },
  { region: 'United Kingdom', users: 89, percentage: 26.0 },
  { region: 'Germany', users: 67, percentage: 19.5 },
  { region: 'Canada', users: 23, percentage: 6.7 },
  { region: 'Australia', users: 19, percentage: 5.5 },
];

const SimpleChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1, px: 2 }}>
      {data.map((item) => (
        <Box key={item.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 160}px` }}
            transition={{ duration: 0.8, delay: data.indexOf(item) * 0.1 }}
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #00d4ff 0%, #667eea 100%)',
              borderRadius: '4px 4px 0 0',
              marginBottom: '8px',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const MetricCard: React.FC<{ metric: UsageMetric }> = ({ metric }) => {
  const percentage = (metric.value / metric.limit) * 100;
  
  return (
    <Box
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
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
              {metric.value.toLocaleString()}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {metric.unit}
              </Typography>
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {metric.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
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
              {percentage.toFixed(1)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'api_calls' | 'data_transfer' | 'devices'>('api_calls');
  const [chartData, setChartData] = useState<ChartData[]>(emptyUsageData);
  const [metrics, setMetrics] = useState(makeUsageMetrics({ apiCalls: 0, dataTransferGB: 0, activeDevices: 0, uptimePct: 99.8 }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const roleUpper = String(user?.role || '').toUpperCase();
        const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN';

        if (isAdmin) {
          // Use admin license analytics as a proxy for system usage
          const lic = await api.get(`${endpoints.admin.licenseAnalytics()}?period=${timeRange}`);
          const la = lic.data?.data?.analytics || {};
          setChartData((la.dailyCounts || []).map((d: any) => ({ label: d.date, value: d.count })) || emptyUsageData);
          setMetrics(makeUsageMetrics({
            apiCalls: la.activeLicenses ?? 0, // placeholder mapping; replace with real if added
            dataTransferGB: (la.totalLicenses || 0) / 10,
            activeDevices: la.newLicenses || 0,
            uptimePct: 99.8,
          }));
        } else {
          // Non-admin: pull per-user license analytics summary
          const usr = await api.get(endpoints.licenses.analytics());
          const summary = usr.data?.data?.summary || {};
          setChartData(Object.entries(summary.eventTypes || {}).map(([k, v]: any) => ({ label: k, value: v })) || emptyUsageData);
          setMetrics(makeUsageMetrics({
            apiCalls: summary.totalEvents || 0,
            dataTransferGB: (summary.totalEvents || 0) / 100,
            activeDevices: Object.keys(summary.eventTypes || {}).length,
            uptimePct: 99.8,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        if (isMounted) {
          setChartData(emptyUsageData);
          setMetrics(makeUsageMetrics({ apiCalls: 0, dataTransferGB: 0, activeDevices: 0, uptimePct: 99.8 }));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.role, timeRange]);

  const totalApiCalls = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);
  const avgGrowth = useMemo(() => chartData.length ? chartData.reduce((s, d) => s + (d.change || 0), 0) / chartData.length : 0, [chartData]);

  return (
    <Box>
      {/* Header */}
      <Box
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                inputProps={{
                  'aria-label': 'Select time range for analytics',
                  title: 'Choose the time period for analytics data'
                }}
              >
                <MenuItem value="1d">Last 24h</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
            
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={selectedMetric === 'api_calls' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMetric('api_calls')}
              >
                API Calls
              </Button>
              <Button
                variant={selectedMetric === 'data_transfer' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMetric('data_transfer')}
              >
                Data Transfer
              </Button>
              <Button
                variant={selectedMetric === 'devices' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMetric('devices')}
              >
                Devices
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Analytics sx={{ color: 'primary.main' }} />
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${avgGrowth.toFixed(1)}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {totalApiCalls.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total API Calls
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Speed sx={{ color: 'secondary.main' }} />
                  <Chip
                    icon={<TrendingUp />}
                    label="+2.3%"
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  98.7%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Response Time
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Devices sx={{ color: 'warning.main' }} />
                  <Chip
                    icon={<TrendingUp />}
                    label="+12"
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  342
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Devices
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Storage sx={{ color: 'info.main' }} />
                  <Chip
                    icon={<TrendingDown />}
                    label="-0.2%"
                    color="error"
                    size="small"
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  2.4 TB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Transfer
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Usage Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Box
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Usage Trends
              </Typography>
              <SimpleChart data={chartData} />
            </Paper>
          </Box>
        </Grid>

        {/* Real-time Metrics */}
        <Grid item xs={12} lg={4}>
          <Box
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
                height: 'fit-content',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Real-time Status
              </Typography>

              <Grid container spacing={2}>
                {metrics.map((metric) => (
                  <Grid item xs={12} key={metric.name}>
                    <MetricCard metric={metric} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </Grid>

        {/* Top Endpoints */}
        <Grid item xs={12} md={6}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top API Endpoints
              </Typography>

              <List dense>
                {topEndpoints.map((endpoint, index) => (
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
                    {index < topEndpoints.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Geographic Distribution
              </Typography>

              <List dense>
                {activeRegions.map((region, index) => (
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
                    {index < activeRegions.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
