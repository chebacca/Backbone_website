/**
 * Team Analytics Dashboard Component
 * 
 * Comprehensive analytics and reporting for team members
 * with charts, metrics, and insights.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Avatar,
  Stack,
  Rating,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Group,
  AdminPanelSettings,
  Work,
  VpnKey,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Analytics,
  BarChart,
  PieChart,
  Timeline as TimelineIcon,
  Assessment,
  Insights,
  Speed,
  Star,
  ThumbUp,
  ThumbDown,
  Refresh,
  Download,
  Share,
  FilterList,
  ExpandMore,
  ExpandLess,
  ArrowUpward,
  ArrowDownward,
  Remove,
  Person,
  PersonAdd,
  PersonRemove,
  PersonOff,
  PersonPin,
  PersonPinCircle,
  GroupWork,
  SupervisedUserCircle,
  ManageAccounts,
  PersonSearch,
  PersonAddAlt1,
  PersonRemoveAlt1,
  PersonAddDisabled,
  PersonOffOutlined,
  PersonPinOutlined,
  PersonPinCircleOutlined,
  GroupWorkOutlined,
  SupervisedUserCircleOutlined,
  ManageAccountsOutlined,
  PersonSearchOutlined,
  PersonAddAlt1Outlined,
  PersonRemoveAlt1Outlined,
  PersonAddDisabledOutlined,
  PersonOffOutlined as PersonOffOutlinedIcon,
  PersonPinOutlined as PersonPinOutlinedIcon,
  PersonPinCircleOutlined as PersonPinCircleOutlinedIcon,
  GroupWorkOutlined as GroupWorkOutlinedIcon,
  SupervisedUserCircleOutlined as SupervisedUserCircleOutlinedIcon,
  ManageAccountsOutlined as ManageAccountsOutlinedIcon,
  PersonSearchOutlined as PersonSearchOutlinedIcon,
  PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon,
  PersonRemoveAlt1Outlined as PersonRemoveAlt1OutlinedIcon,
  PersonAddDisabledOutlined as PersonAddDisabledOutlinedIcon,
} from '@mui/icons-material';
import { TeamAnalytics, teamMemberAnalyticsService } from '@/services/TeamMemberAnalyticsService';
import { StreamlinedTeamMember } from '@/services/UnifiedDataService';

interface TeamAnalyticsDashboardProps {
  teamMembers: StreamlinedTeamMember[];
  onRefresh?: () => void;
}

const TeamAnalyticsDashboard: React.FC<TeamAnalyticsDashboardProps> = ({
  teamMembers,
  onRefresh
}) => {
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');

  // Load analytics data
  useEffect(() => {
    if (teamMembers.length > 0) {
      loadAnalytics();
    }
  }, [teamMembers, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analyticsData = teamMemberAnalyticsService.generateAnalytics(teamMembers);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
    onRefresh?.();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Error Loading Analytics</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No analytics data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Team Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="overview">Overview</ToggleButton>
            <ToggleButton value="detailed">Detailed</ToggleButton>
            <ToggleButton value="trends">Trends</ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Members
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.totalMembers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Members
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.activeMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((analytics.overview.activeMembers / analytics.overview.totalMembers) * 100)}% of total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Licensed Members
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.licensedMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((analytics.overview.licensedMembers / analytics.overview.totalMembers) * 100)}% of total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <VpnKey />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Activity Score
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.averageActivityScore}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average team activity
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Speed />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Role Distribution" />
            <CardContent>
              <List>
                {analytics.roleDistribution.map((role, index) => (
                  <ListItem key={role.role}>
                    <ListItemIcon>
                      {role.role === 'admin' ? <AdminPanelSettings /> :
                       role.role === 'member' ? <People /> :
                       role.role === 'viewer' ? <Info /> : <Star />}
                    </ListItemIcon>
                    <ListItemText
                      primary={role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                      secondary={`${role.count} members (${role.percentage}%)`}
                    />
                    <Box sx={{ width: 100, ml: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={role.percentage}
                        color={index === 0 ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Department Breakdown" />
            <CardContent>
              <List>
                {analytics.departmentBreakdown.slice(0, 5).map((dept, index) => (
                  <ListItem key={dept.department}>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary={dept.department}
                      secondary={`${dept.memberCount} members`}
                    />
                    <Box sx={{ width: 100, ml: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(dept.memberCount / analytics.overview.totalMembers) * 100}
                        color="info"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* License Utilization */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="License Utilization" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {analytics.licenseUtilization.utilizationRate}%
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  License Utilization Rate
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.licenseUtilization.utilizationRate}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>License Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analytics.licenseUtilization.byType).map(([type, count]) => (
                      <TableRow key={type}>
                        <TableCell>
                          <Chip label={type} size="small" />
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">
                          {Math.round((count / analytics.licenseUtilization.totalLicenses) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Top Performers" />
        <CardContent>
          <List>
            {analytics.topPerformers.map((performer, index) => (
              <ListItem key={performer.memberId}>
                <ListItemIcon>
                  <Badge badgeContent={index + 1} color="primary">
                    <Avatar>
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={performer.name}
                  secondary={performer.email}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating value={performer.score} readOnly precision={0.1} />
                  <Typography variant="body2" color="textSecondary">
                    {performer.score.toFixed(2)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Recommendations" />
        <CardContent>
          <List>
            {analytics.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {rec.priority === 'high' ? <Warning color="error" /> :
                   rec.priority === 'medium' ? <Info color="warning" /> :
                   <Info color="info" />}
                </ListItemIcon>
                <ListItemText
                  primary={rec.title}
                  secondary={rec.description}
                />
                <Chip
                  label={rec.priority}
                  color={rec.priority === 'high' ? 'error' : 
                         rec.priority === 'medium' ? 'warning' : 'info'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Growth Trends */}
      <Card>
        <CardHeader title="Growth Trends" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Monthly Growth Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {analytics.growthMetrics.monthlyGrowthRate > 0 ? (
                  <ArrowUpward color="success" />
                ) : analytics.growthMetrics.monthlyGrowthRate < 0 ? (
                  <ArrowDownward color="error" />
                ) : (
                  <Remove color="disabled" />
                )}
                <Typography variant="h4" color={
                  analytics.growthMetrics.monthlyGrowthRate > 0 ? 'success.main' :
                  analytics.growthMetrics.monthlyGrowthRate < 0 ? 'error.main' : 'text.secondary'
                }>
                  {Math.abs(analytics.growthMetrics.monthlyGrowthRate).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Projected Growth
              </Typography>
              <Typography variant="h4" color="primary">
                +{analytics.growthMetrics.projectedGrowth}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                members in the next month
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamAnalyticsDashboard;
