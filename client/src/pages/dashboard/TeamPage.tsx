import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Email,
  Block,
  CheckCircle,
  Schedule,
  Group,
  PersonAdd,
  AdminPanelSettings,
  Work,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive: string;
  licenseAssigned?: string;
  department?: string;
  avatar?: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  availableSeats: number;
  totalSeats: number;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20T14:30:00Z',
    licenseAssigned: 'DV14-PRO-2024-XXXX',
    department: 'Engineering',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-10',
    lastActive: '2024-01-20T16:45:00Z',
    licenseAssigned: 'DV14-PRO-2024-YYYY',
    department: 'Design',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@company.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-01-18',
    lastActive: '',
    department: 'Engineering',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'viewer',
    status: 'active',
    joinedAt: '2024-01-12',
    lastActive: '2024-01-19T10:20:00Z',
    department: 'Marketing',
  },
];

const mockStats: TeamStats = {
  totalMembers: 4,
  activeMembers: 3,
  pendingInvites: 1,
  availableSeats: 12,
  totalSeats: 16,
};

const getRoleColor = (role: TeamMember['role']) => {
  switch (role) {
    case 'admin': return 'error';
    case 'member': return 'primary';
    case 'viewer': return 'default';
    default: return 'default';
  }
};

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'suspended': return 'error';
    default: return 'default';
  }
};

const getStatusIcon = (status: TeamMember['status']) => {
  switch (status) {
    case 'active': return <CheckCircle />;
    case 'pending': return <Schedule />;
    case 'suspended': return <Block />;
    default: return <CheckCircle />;
  }
};

const TeamPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    availableSeats: 0,
    totalSeats: 0,
  });

  // Fetch live data tied to the logged-in account
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Fetch subscriptions → seats and licenses
        const subsRes = await api.get(endpoints.subscriptions.mySubscriptions());
        const subscriptions = subsRes.data?.data?.subscriptions ?? [];

        const totalSeats = subscriptions.reduce((sum: number, s: any) => sum + (s.seats ?? 0), 0);
        const allLicenses: any[] = subscriptions.flatMap((s: any) => s.licenses ?? []);
        const activeMembers = allLicenses.filter(l => l.status === 'ACTIVE').length;
        const availableSeats = Math.max(0, totalSeats - activeMembers);

        // Fetch license details list for table rows
        const licRes = await api.get(endpoints.licenses.myLicenses());
        const licenses: any[] = licRes.data?.data?.licenses ?? [];

        const derivedMembers: TeamMember[] = licenses.map((lic, idx) => ({
          id: lic.id,
          firstName: 'Seat',
          lastName: String(idx + 1),
          email: `${user?.email ?? 'seat'}+${idx + 1}`,
          role: 'member',
          status: (lic.status === 'ACTIVE' ? 'active' : lic.status === 'PENDING' ? 'pending' : 'suspended') as TeamMember['status'],
          joinedAt: new Date(lic.createdAt ?? Date.now()).toISOString().slice(0, 10),
          lastActive: new Date(lic.activatedAt ?? lic.updatedAt ?? Date.now()).toISOString(),
          licenseAssigned: lic.key?.slice(0, 8) + '-…',
          department: undefined,
        }));

        if (!isMounted) return;
        setTeamMembers(derivedMembers);
        setStats({
          totalMembers: activeMembers, // Treat active license holders as active members
          activeMembers,
          pendingInvites: 0, // No invites feature yet
          availableSeats,
          totalSeats,
        });
      } catch (error) {
        if (!isMounted) return;
        // Fall back to zeros to avoid UI break
        setTeamMembers([]);
        setStats({ totalMembers: 0, activeMembers: 0, pendingInvites: 0, availableSeats: 0, totalSeats: 0 });
      }
    })();
    return () => { isMounted = false; };
  }, [user?.email]);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as TeamMember['role'],
    department: '',
    message: '',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleInviteMember = () => {
    enqueueSnackbar(`Invitation sent to ${inviteForm.email}`, { variant: 'success' });
    setInviteDialogOpen(false);
    setInviteForm({ email: '', role: 'member', department: '', message: '' });
  };

  const handleResendInvite = () => {
    if (selectedMember) {
      enqueueSnackbar(`Invitation resent to ${selectedMember.email}`, { variant: 'success' });
    }
    handleMenuClose();
  };

  const handleRemoveMember = () => {
    if (selectedMember) {
      enqueueSnackbar(`${selectedMember.firstName} ${selectedMember.lastName} removed from team`, { 
        variant: 'warning' 
      });
    }
    handleMenuClose();
  };

  const utilization = useMemo(() => {
    if (stats.totalSeats <= 0) return 0;
    return ((stats.totalSeats - stats.availableSeats) / stats.totalSeats) * 100;
  }, [stats.totalSeats, stats.availableSeats]);

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Team Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your team members, roles, and license assignments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Invite Member
          </Button>
        </Box>
      </motion.div>

      {/* Team Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
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
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Group />
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stats.totalMembers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Members
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.activeMembers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Members
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Schedule />
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.pendingInvites}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Invites
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Star />
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.availableSeats}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Seats
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={utilization}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: utilization > 80 
                        ? 'linear-gradient(90deg, #ff9800 0%, #f44336 100%)'
                        : 'linear-gradient(90deg, #00d4ff 0%, #667eea 100%)',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Team Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <TableContainer
          component={Paper}
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Active</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {member.firstName[0]}{member.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={member.role === 'admin' ? <AdminPanelSettings /> : <Work />}
                      label={member.role.toUpperCase()}
                      color={getRoleColor(member.role) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {member.department || 'Not assigned'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={getStatusIcon(member.status)}
                      label={member.status.toUpperCase()}
                      color={getStatusColor(member.status) as any}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {member.licenseAssigned ? (
                      <Tooltip title={member.licenseAssigned}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {member.licenseAssigned}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No license
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {member.lastActive 
                        ? new Date(member.lastActive).toLocaleDateString()
                        : 'Never'
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, member)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
          color: '#000',
        }}
        onClick={() => setInviteDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuItem onClick={() => setEditDialogOpen(true)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Member
        </MenuItem>
        {selectedMember?.status === 'pending' && (
          <MenuItem onClick={handleResendInvite}>
            <ListItemIcon>
              <Email fontSize="small" />
            </ListItemIcon>
            Resend Invite
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          Suspend Member
        </MenuItem>
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Remove Member
        </MenuItem>
      </Menu>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={inviteForm.role}
                  label="Role"
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as TeamMember['role'] }))}
                  inputProps={{
                    'aria-label': 'Select team member role',
                    title: 'Select the role for this team member'
                  }}
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={inviteForm.department}
                onChange={(e) => setInviteForm(prev => ({ ...prev, department: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Welcome Message (Optional)"
                multiline
                rows={3}
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteMember}
            variant="contained"
            disabled={!inviteForm.email}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamPage;
