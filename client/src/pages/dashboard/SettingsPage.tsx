import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Switch,
  Divider,
  Avatar,
  IconButton,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Security,
  Notifications,
  Download,
  Delete,
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Warning,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import api, { endpoints, apiUtils } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  type: 'security' | 'privacy' | 'notifications';
}

const securitySettings: SecuritySetting[] = [
  {
    id: 'two_factor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: false,
    icon: <Security />,
    type: 'security',
  },
  {
    id: 'email_notifications',
    title: 'Email Notifications',
    description: 'Receive email alerts for important account activities',
    enabled: true,
    icon: <Notifications />,
    type: 'notifications',
  },
  {
    id: 'login_alerts',
    title: 'Login Alerts',
    description: 'Get notified when someone logs into your account',
    enabled: true,
    icon: <Security />,
    type: 'security',
  },
  {
    id: 'data_export',
    title: 'Data Export Access',
    description: 'Allow downloading of your account data',
    enabled: true,
    icon: <Download />,
    type: 'privacy',
  },
];

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    firstName: (user as any)?.firstName || '',
    lastName: (user as any)?.lastName || '',
    email: user?.email || '',
    company: '',
    jobTitle: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [settings, setSettings] = useState(securitySettings);
  const [twoFA, setTwoFA] = useState<{ qr?: string; secret?: string; enabled?: boolean; backupCodes?: string[] }>({});
  const [twoFADialog, setTwoFADialog] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  // KYC form state
  const [kyc, setKyc] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    phoneNumber: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdCountry: '',
    governmentIdExpiry: '',
  });
  const kycStatus = String((user as any)?.kycStatus || '').toUpperCase();

  // Sync tab with URL hash (e.g., #compliance)
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (hash && ['profile','security','notifications','privacy','compliance','danger'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // When user clicks tab, update hash for deep-linkability
  const selectTab = (id: string) => {
    setActiveTab(id);
    const url = `${location.pathname}#${id}`;
    navigate(url, { replace: true });
  };

  const handleProfileUpdate = async () => {
    try {
      const fullName = `${(profile.firstName || '').trim()} ${(profile.lastName || '').trim()}`.trim();
      if (!fullName) {
        enqueueSnackbar('Please provide your first and last name', { variant: 'warning' });
        return;
      }
      await authService.updateProfile({ name: fullName } as any);
      await refreshUser();
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to update profile', { variant: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    if (!security.currentPassword || !security.newPassword) {
      enqueueSnackbar('Please fill in all password fields', { variant: 'warning' });
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    try {
      await authService.changePassword(security.currentPassword, security.newPassword);
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to change password', { variant: 'error' });
    }
  };

  const persistNotificationPreferences = async (nextSettings: SecuritySetting[]) => {
    try {
      const emailNotifications = !!nextSettings.find(s => s.id === 'email_notifications')?.enabled;
      const securityAlerts = !!nextSettings.find(s => s.id === 'login_alerts')?.enabled;
      await apiUtils.withLoading(async () => api.put(endpoints.users.notifications(), {
        emailNotifications,
        securityAlerts,
      }));
      enqueueSnackbar('Notification preferences saved', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to save notification preferences', { variant: 'error' });
    }
  };

  const handleSettingToggle = (settingId: string) => {
    setSettings(prev => {
      const next = prev.map(setting => setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting);
      void persistNotificationPreferences(next);
      return next;
    });
  };

  const handleEnable2FA = async () => {
    try {
      const init = await authService.twoFASetupInitiate();
      setTwoFA({ qr: init.qrCodeDataUrl, secret: init.secret, enabled: false });
      setTwoFADialog(true);
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to start 2FA setup', { variant: 'error' });
    }
  };

  const handleVerify2FA = async () => {
    try {
      const res = await authService.twoFASetupVerify(twoFAToken.trim());
      setTwoFA(prev => ({ ...prev, enabled: true, backupCodes: res.backupCodes }));
      enqueueSnackbar('Two-factor authentication enabled', { variant: 'success' });
      setTwoFADialog(false);
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Invalid code', { variant: 'error' });
    }
  };

  const handleDisable2FA = async () => {
    try {
      await authService.twoFADisable();
      setTwoFA({ enabled: false });
      enqueueSnackbar('Two-factor authentication disabled', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to disable 2FA', { variant: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.post(endpoints.users.requestDeletion(), { reason: deleteReason, confirmEmail: deleteConfirmEmail });
      enqueueSnackbar('Account deletion request submitted. Please check your email.', { variant: 'warning' });
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
      setDeleteConfirmEmail('');
      setDeleteReason('');
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Failed to request account deletion', { variant: 'error' });
    }
  };

  const TabButton = ({ id, label, isActive }: { id: string; label: string; isActive: boolean }) => (
    <Button
      variant={isActive ? 'contained' : 'outlined'}
      onClick={() => selectTab(id)}
      sx={{
        mr: 1,
        mb: 1,
        ...(isActive && {
          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
          color: '#000',
        }),
      }}
    >
      {label}
    </Button>
  );

  return (
    <Box>
      {/* Header */}
      <Box >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and security settings
          </Typography>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box >
        <Box sx={{ mb: 4 }}>
          <TabButton id="profile" label="Profile" isActive={activeTab === 'profile'} />
          <TabButton id="security" label="Security" isActive={activeTab === 'security'} />
          <TabButton id="notifications" label="Notifications" isActive={activeTab === 'notifications'} />
          <TabButton id="privacy" label="Privacy" isActive={activeTab === 'privacy'} />
          <TabButton id="compliance" label="Compliance" isActive={activeTab === 'compliance'} />
          <TabButton id="danger" label="Danger Zone" isActive={activeTab === 'danger'} />
        </Box>
      </Box>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Box >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '3rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: '#000',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
                <Chip
                  label={(user as any)?.subscription?.tier || 'Pro'}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled
                      helperText="Contact support to change your email address"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="timezone-select-label">Timezone</InputLabel>
                      <Select
                        labelId="timezone-select-label"
                        id="timezone-select"
                        value={profile.timezone}
                        label="Timezone"
                        onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                        inputProps={{
                          'aria-label': 'Select timezone',
                          title: 'Select your timezone',
                          name: 'timezone'
                        }}
                        aria-labelledby="timezone-select-label"
                        title="Select your timezone"
                      >
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="America/New_York">Eastern Time</MenuItem>
                        <MenuItem value="America/Chicago">Central Time</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleProfileUpdate}
                    sx={{
                      background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                      color: '#000',
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button variant="outlined">
                    Cancel
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Box >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Change Password
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPasswords ? 'text' : 'password'}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPasswords(!showPasswords)}
                            edge="end"
                          >
                            {showPasswords ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPasswords ? 'text' : 'password'}
                      value={security.newPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPasswords ? 'text' : 'password'}
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={handlePasswordChange}
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                    color: '#000',
                  }}
                >
                  Update Password
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Security Settings
                </Typography>

                <List>
                  {settings.filter(s => s.type === 'security').map((setting) => (
                    <ListItem key={setting.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {setting.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={setting.title}
                        secondary={setting.description}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={setting.enabled}
                          onChange={() => handleSettingToggle(setting.id)}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication (TOTP)"
                      secondary={twoFA.enabled ? 'Enabled' : 'Disabled'}
                    />
                    <ListItemSecondaryAction>
                      {twoFA.enabled ? (
                        <Button variant="outlined" color="error" onClick={handleDisable2FA}>Disable</Button>
                      ) : (
                        <Button variant="contained" onClick={handleEnable2FA} sx={{ background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)', color: '#000' }}>Enable</Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Box >
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Notification Preferences
            </Typography>

            <List>
              {settings.filter(s => s.type === 'notifications').map((setting) => (
                <ListItem key={setting.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {setting.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={setting.title}
                    secondary={setting.description}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={setting.enabled}
                      onChange={() => handleSettingToggle(setting.id)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Box >
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Privacy & Data Controls
            </Typography>

            <List>
              {settings.filter(s => s.type === 'privacy').map((setting) => (
                <ListItem key={setting.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {setting.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={setting.title}
                    secondary={setting.description}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={setting.enabled}
                      onChange={() => handleSettingToggle(setting.id)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Data Export:</strong> You can download a copy of your data at any time. 
                This includes your profile information, license history, and usage analytics.
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{ mr: 2 }}
              onClick={async () => {
                try {
                  const res = await api.post(endpoints.users.exportData());
                  if (!res.data?.success) throw new Error(res.data?.message || 'Export failed');
                  const userData = res.data.data?.userData ?? res.data.data;
                  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'user-data.json';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  enqueueSnackbar('Data export ready', { variant: 'success' });
                } catch (e: any) {
                  enqueueSnackbar(e.message || 'Failed to export data', { variant: 'error' });
                }
              }}
            >
              Export My Data
            </Button>
          </Paper>
        </Box>
      )}

      {/* Compliance Tab (KYC) */}
      {activeTab === 'compliance' && (
        <Box>
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Identity Verification (KYC)
            </Typography>
            <Alert severity={kycStatus === 'COMPLETED' ? 'success' : 'warning'} sx={{ mb: 2 }}>
              Status: {kycStatus || 'PENDING'}
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" value={kyc.firstName} onChange={(e) => setKyc({ ...kyc, firstName: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" value={kyc.lastName} onChange={(e) => setKyc({ ...kyc, lastName: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={kyc.dateOfBirth} onChange={(e) => setKyc({ ...kyc, dateOfBirth: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nationality (ISO alpha-2)" placeholder="US" value={kyc.nationality} onChange={(e) => setKyc({ ...kyc, nationality: e.target.value.toUpperCase() })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Country of Residence (ISO alpha-2)" placeholder="US" value={kyc.countryOfResidence} onChange={(e) => setKyc({ ...kyc, countryOfResidence: e.target.value.toUpperCase() })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" value={kyc.phoneNumber} onChange={(e) => setKyc({ ...kyc, phoneNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Government ID Type (optional)" value={kyc.governmentIdType} onChange={(e) => setKyc({ ...kyc, governmentIdType: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Government ID Number (optional)" value={kyc.governmentIdNumber} onChange={(e) => setKyc({ ...kyc, governmentIdNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Government ID Country (ISO alpha-2)" value={kyc.governmentIdCountry} onChange={(e) => setKyc({ ...kyc, governmentIdCountry: e.target.value.toUpperCase() })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Government ID Expiry (optional)" InputLabelProps={{ shrink: true }} value={kyc.governmentIdExpiry} onChange={(e) => setKyc({ ...kyc, governmentIdExpiry: e.target.value })} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await apiUtils.withLoading(async () => api.post(endpoints.users.kycVerify(), kyc));
                    enqueueSnackbar('KYC submitted successfully', { variant: 'success' });
                  } catch (e: any) {
                    enqueueSnackbar(e.message || 'Failed to submit KYC', { variant: 'error' });
                  }
                }}
                sx={{ background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)', color: '#000' }}
              >
                Submit Verification
              </Button>
              <Button variant="outlined" onClick={() => setKyc({
                firstName: '', lastName: '', dateOfBirth: '', nationality: '', countryOfResidence: '', phoneNumber: '', governmentIdType: '', governmentIdNumber: '', governmentIdCountry: '', governmentIdExpiry: ''
              })}>Clear</Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <Box >
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'error.main' }}>
              Danger Zone
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> These actions are irreversible. Please proceed with caution.
              </Typography>
            </Alert>

            <Box sx={{ p: 3, border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete My Account
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(244, 67, 54, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete your account? This will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Warning color="error" />
              </ListItemIcon>
              <ListItemText primary="Permanently delete all your data" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="error" />
              </ListItemIcon>
              <ListItemText primary="Cancel all active subscriptions" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="error" />
              </ListItemIcon>
              <ListItemText primary="Revoke all license keys" />
            </ListItem>
          </List>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            sx={{ mt: 2 }}
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <TextField
            fullWidth
            label="Confirm your email"
            sx={{ mt: 2 }}
            placeholder={user?.email}
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Reason (optional)"
            sx={{ mt: 2 }}
            multiline
            minRows={2}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== 'DELETE' || (deleteConfirmEmail || '').toLowerCase() !== (user?.email || '').toLowerCase()}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog
        open={twoFADialog}
        onClose={() => setTwoFADialog(false)}
        PaperProps={{
          sx: { backgroundColor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.1)' },
        }}
      >
        <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Scan the QR code with Google Authenticator, Authy, or another TOTP app. Then enter the 6-digit code to confirm.
          </Typography>
            {twoFA.qr && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img src={twoFA.qr} alt="2FA QR Code" width={200} height={200} />
              </Box>
            )}
          {twoFA.secret && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Secret: {twoFA.secret}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Authentication code"
            value={twoFAToken}
            onChange={(e) => setTwoFAToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFADialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVerify2FA} sx={{ background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)', color: '#000' }}>Verify & Enable</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
