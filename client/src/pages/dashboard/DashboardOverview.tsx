import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Security,
  Download,
  CardMembership,
  Payment,
  CheckCircle,
  Schedule,
  Notifications,
  Update,
  Star,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useAuth } from '@/context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import api, { endpoints } from '@/services/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary' 
}) => (
  <Box
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
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
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend && (
            <Chip
              label={`${trend.direction === 'up' ? '+' : '-'}${trend.value}%`}
              size="small"
              color={trend.direction === 'up' ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

interface ActivityItem {
  type: 'license' | 'payment' | 'user' | 'security';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

const recentActivity: ActivityItem[] = [
  {
    type: 'license',
    title: 'License Activated',
    description: 'Pro license activated for john.doe@company.com',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    type: 'payment',
    title: 'Payment Successful',
    description: 'Monthly subscription renewed for $297.00',
    timestamp: '1 day ago',
    status: 'success',
  },
  {
    type: 'user',
    title: 'Team Member Added',
    description: 'Sarah Johnson added to development team',
    timestamp: '2 days ago',
    status: 'success',
  },
  {
    type: 'security',
    title: 'Security Alert',
    description: 'New device login detected from New York',
    timestamp: '3 days ago',
    status: 'warning',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'license': return <CardMembership />;
    case 'payment': return <Payment />;
    case 'user': return <People />;
    case 'security': return <Security />;
    default: return <Notifications />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success': return 'success.main';
    case 'warning': return 'warning.main';
    case 'error': return 'error.main';
    default: return 'text.secondary';
  }
};

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  const [_, setLoading] = useState<boolean>(true);
  const [activeLicenses, setActiveLicenses] = useState<number>(0);
  const [totalLicenses, setTotalLicenses] = useState<number>(0);
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [daysUntilRenewal, setDaysUntilRenewal] = useState<string>('');
  const [hasEnterpriseFeatures, setHasEnterpriseFeatures] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subsRes, analyticsRes] = await Promise.all([
          api.get(endpoints.subscriptions.mySubscriptions()),
          api.get(endpoints.licenses.analytics()),
        ]);

        // Subscriptions
        const subscriptions = subsRes.data?.data?.subscriptions ?? [];
        const totalLic = subscriptions.reduce((acc: number, s: any) => acc + (s._count?.licenses ?? s.licenses?.length ?? 0), 0);
        const activeLic = subscriptions.reduce(
          (acc: number, s: any) => acc + (s.licenses?.filter((l: any) => l.status === 'ACTIVE').length ?? 0),
          0
        );
        if (!isMounted) return;
        setTotalLicenses(totalLic);
        setActiveLicenses(activeLic);

        // Plan and renewal
        const primary = subscriptions[0];
        if (primary) {
          setCurrentPlan(primary.tier?.toLowerCase?.() ?? String(primary.tier));
          if (primary.currentPeriodEnd) {
            const end = new Date(primary.currentPeriodEnd);
            const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            setDaysUntilRenewal(`${days} day${days === 1 ? '' : 's'}`);
          }
          setHasEnterpriseFeatures(primary.tier === 'ENTERPRISE');
        }

        // Analytics summary
        const summary = analyticsRes.data?.data?.summary;
        if (summary) {
          setMonthlyUsage(summary.totalEvents ?? 0);
          const downloads = (summary.eventTypes && (summary.eventTypes.SDK_DOWNLOAD_REQUEST || summary.eventTypes['SDK_DOWNLOAD_REQUEST'])) || 0;
          setTotalDownloads(downloads);
        }
      } catch (err) {
        // Fallback to zeros on error
        if (!isMounted) return;
        setActiveLicenses(0);
        setTotalLicenses(0);
        setMonthlyUsage(0);
        setTotalDownloads(0);
        setCurrentPlan('');
        setDaysUntilRenewal('');
        setHasEnterpriseFeatures(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const licenseUtilization = useMemo(() => {
    if (totalLicenses <= 0) return 0;
    return Math.round((activeLicenses / totalLicenses) * 100);
  }, [activeLicenses, totalLicenses]);

  return (
    <Box>
      {/* Welcome Header */}
      <Box
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Here's what's happening with your BackboneLogic, Inc. licenses
          </Typography>
        </Box>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Licenses"
            value={activeLicenses}
            icon={<CardMembership />}
            trend={{ value: 12, direction: 'up' }}
            color="primary"
          />
        </Grid>
        {hasEnterpriseFeatures && (
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Team Members"
              value={8}
              icon={<People />}
              trend={{ value: 8, direction: 'up' }}
              color="secondary"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Monthly Usage"
            value={monthlyUsage}
            icon={<TrendingUp />}
            trend={{ value: 5, direction: 'up' }}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Downloads"
            value={totalDownloads.toLocaleString()}
            icon={<Download />}
            trend={{ value: 23, direction: 'up' }}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* License Status */}
        <Grid item xs={12} lg={8}>
          <Box
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                  License Overview
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          License Utilization
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {licenseUtilization}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={licenseUtilization}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: licenseUtilization > 80 
                              ? 'linear-gradient(90deg, #ff9800 0%, #f44336 100%)'
                              : 'linear-gradient(90deg, #00d4ff 0%, #667eea 100%)',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {activeLicenses} of {totalLicenses} licenses in use
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current Plan
                      </Typography>
                      <Chip
                        label={(currentPlan && currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase()) || '—'}
                        color="primary"
                        sx={{ fontWeight: 600, mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {daysUntilRenewal ? `Next renewal in ${daysUntilRenewal}` : '—'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {hasEnterpriseFeatures && (
                        <Button
                          variant="outlined"
                          startIcon={<People />}
                          component={RouterLink}
                          to="/dashboard/team"
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Add Team Member
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        component={RouterLink}
                        to="/dashboard/downloads"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Download SDK
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Star />}
                        component={RouterLink}
                        to="/dashboard/billing"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Upgrade Plan
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Box
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: 'fit-content',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>

                <List dense>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: getStatusColor(activity.status),
                              fontSize: '1rem',
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp}
                              </Typography>
                            </React.Fragment>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && (
                        <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="text"
                  size="small"
                  sx={{ mt: 2, color: 'primary.main' }}
                  component={RouterLink}
                  to="/dashboard/activity"
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Status
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        License Server
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        API Services
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Maintenance
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        Scheduled 2AM EST
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Update sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        SDK Version
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        v14.2.1 Available
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
