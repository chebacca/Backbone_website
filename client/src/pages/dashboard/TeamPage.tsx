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
  ChipProps,
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
  InputAdornment,
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
  Visibility,
  VisibilityOff,
  People,
  Person,
  GroupAdd,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import MetricCard from '@/components/common/MetricCard';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member' | 'viewer' | 'owner' | 'manager';
  status: 'active' | 'pending' | 'suspended' | 'removed';
  joinedAt: string;
  lastActive: string;
  licenseAssigned?: string;
  licenseType?: string;
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

type ChipColor = ChipProps['color'];

const getRoleColor = (role: TeamMember['role']): ChipColor => {
  switch (role) {
    case 'admin': return 'secondary';
    case 'owner': return 'secondary';
    case 'manager': return 'info';
    case 'member': return 'success';
    case 'viewer': return 'default';
    default: return 'default';
  }
};

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'suspended': return 'error';
    case 'removed': return 'default';
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
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [orgPrimaryRole, setOrgPrimaryRole] = useState<'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER' | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<null | { id: string; tier: 'BASIC' | 'PRO' | 'ENTERPRISE'; seats: number; status: string; organizationId?: string }>(null);

  // Normalize server date values (string | number | Firestore Timestamp-like)
  const toIsoDate = (value: any, { includeTime = false }: { includeTime?: boolean } = {}): string => {
    try {
      if (!value) {
        const d = new Date();
        return includeTime ? d.toISOString() : d.toISOString().slice(0, 10);
      }
      if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
          return includeTime ? d.toISOString() : d.toISOString().slice(0, 10);
        }
      }
      if (typeof value === 'object') {
        // Firestore Timestamp serialized by Admin SDK: { _seconds, _nanoseconds }
        const seconds = (value as any)._seconds;
        const nanos = (value as any)._nanoseconds ?? 0;
        if (typeof seconds === 'number') {
          const ms = seconds * 1000 + Math.floor(nanos / 1_000_000);
          const d = new Date(ms);
          return includeTime ? d.toISOString() : d.toISOString().slice(0, 10);
        }
      }
    } catch {}
    const d = new Date();
    return includeTime ? d.toISOString() : d.toISOString().slice(0, 10);
  };

  // Fetch organizations, members, and seat usage (prefer org context endpoint when available)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Try richer context endpoint first
        const ctxRes = await api.get(endpoints.organizations.context()).catch(() => null as any);
        const ctxOrg = ctxRes?.data?.data?.organization || null;
        const ctxMembers = ctxRes?.data?.data?.members || [];
        const ctxActiveSub = ctxRes?.data?.data?.activeSubscription || null;
        const ctxRole = ctxRes?.data?.data?.primaryRole || null;

        let primaryOrg = ctxOrg;
        let members: any[] = ctxMembers;
        let activeSub = ctxActiveSub;

        if (!primaryOrg) {
          // Fallback to /organizations/my if context not available
          const orgRes = await api.get(endpoints.organizations.my());
          const owned = orgRes?.data?.data?.owned ?? [];
          const memberOf = orgRes?.data?.data?.memberOf ?? [];
          primaryOrg = (owned[0] || memberOf[0]) || null;
          members = (primaryOrg?.members || []) as any[];
        }

        if (!primaryOrg) {
          if (isMounted) {
            setOrgId(null);
            setOrgName('');
            setTeamMembers([]);
            setStats({ totalMembers: 0, activeMembers: 0, pendingInvites: 0, availableSeats: 0, totalSeats: 0 });
          }
          return;
        }

        const activeMembers = members.filter(m => m.status === 'ACTIVE').length;

        // Determine seats from active org subscription if provided by context; otherwise compute from user subs
        let totalSeats = 0;
        if (activeSub && activeSub.status === 'ACTIVE' && activeSub.organizationId === primaryOrg.id) {
          totalSeats = Number(activeSub.seats || 0);
        } else {
          const subsRes = await api.get(endpoints.subscriptions.mySubscriptions());
          const subscriptions = (subsRes.data?.data?.subscriptions ?? []) as any[];
          const orgSubs = subscriptions.filter(s => s.organizationId === primaryOrg.id && s.status === 'ACTIVE');
          totalSeats = orgSubs.reduce((sum, s) => {
            // Prefer to remember one active subscription for seat management
            if (!activeSub && s.status === 'ACTIVE') activeSub = s;
            return sum + (s.seats || 0);
          }, 0);
        }
        const availableSeats = Math.max(0, totalSeats - activeMembers);

        // Map members to display
        const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
          .filter((m: any) => m && m.status !== 'REMOVED')
          .map((m: any) => {
            const email: string = String(m.email || 'user@example.com');
            const username = email.split('@')[0] || 'User';
            const roleMap: Record<string, TeamMember['role']> = {
              OWNER: 'owner',
              ENTERPRISE_ADMIN: 'admin',
              MANAGER: 'manager',
              MEMBER: 'member',
            };
            const statusMap: Record<string, TeamMember['status']> = {
              INVITED: 'pending',
              ACTIVE: 'active',
              REMOVED: 'removed',
            };
            return {
              id: String(m.id || `${email}-${Math.random().toString(36).slice(2)}`),
              firstName: username.charAt(0).toUpperCase() + username.slice(1),
              lastName: '',
              email,
              role: roleMap[String(m.role)] || 'member',
              status: statusMap[String(m.status)] || 'active',
              department: m.department || '',
              licenseType: m.licenseType || 'PROFESSIONAL',
              joinedAt: toIsoDate(m.joinedAt),
              lastActive: toIsoDate(m.updatedAt || m.joinedAt || new Date(), { includeTime: true }),
            } as TeamMember;
          });

        if (!isMounted) return;
        setOrgId(primaryOrg.id);
        setOrgName(primaryOrg.name || 'Organization');
        setOrgPrimaryRole(ctxRole || null);
        
        // Debug logging for organization ID
        console.log('[TeamPage] Organization ID:', primaryOrg.id, 'Type:', typeof primaryOrg.id, 'Length:', String(primaryOrg.id).length);
        console.log('[TeamPage] Organization ID characters:', Array.from(String(primaryOrg.id)).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
        
        setActiveSubscription(activeSub ? { id: String(activeSub.id), tier: String(activeSub.tier).toUpperCase() as any, seats: Number(activeSub.seats || 0), status: String(activeSub.status || '') , organizationId: activeSub.organizationId } : null);
        setTeamMembers(derivedMembers);
        setStats({
          totalMembers: derivedMembers.length,
          activeMembers,
          pendingInvites: 0, // No more pending invites since we create members directly
          availableSeats,
          totalSeats,
        });
      } catch (error) {
        if (!isMounted) return;
        // Fall back to empty state but surface the cause for debugging
        console.error('[TeamPage] Failed to load team data:', error);
        setTeamMembers([]);
        setStats({ totalMembers: 0, activeMembers: 0, pendingInvites: 0, availableSeats: 0, totalSeats: 0 });
      }
    })();
    return () => { isMounted = false; };
  }, [user?.email]);
  
  // Function to refresh team data
  const refreshTeamData = async () => {
    try {
      // Try richer context endpoint first
      const ctxRes = await api.get(endpoints.organizations.context()).catch(() => null as any);
      const ctxOrg = ctxRes?.data?.data?.organization || null;
      const ctxMembers = ctxRes?.data?.data?.members || [];
      const ctxActiveSub = ctxRes?.data?.data?.activeSubscription || null;
      const ctxRole = ctxRes?.data?.data?.primaryRole || null;

      let primaryOrg = ctxOrg;
      let members: any[] = ctxMembers;
      let activeSub = ctxActiveSub;

      if (!primaryOrg) {
        // Fallback to /organizations/my if context not available
        const orgRes = await api.get(endpoints.organizations.my());
        const owned = orgRes?.data?.data?.owned ?? [];
        const memberOf = orgRes?.data?.data?.memberOf ?? [];
        primaryOrg = (owned[0] || memberOf[0]) || null;
        members = (primaryOrg?.members || []) as any[];
      }

      if (!primaryOrg) {
        setOrgId(null);
        setOrgName('');
        setTeamMembers([]);
        setStats({ totalMembers: 0, activeMembers: 0, pendingInvites: 0, availableSeats: 0, totalSeats: 0 });
        return;
      }

      const activeMembers = members.filter(m => m.status === 'ACTIVE').length;

      // Determine seats from active org subscription if provided by context; otherwise compute from user subs
      let totalSeats = 0;
      if (activeSub && activeSub.status === 'ACTIVE' && activeSub.organizationId === primaryOrg.id) {
        totalSeats = Number(activeSub.seats || 0);
      } else {
        const subsRes = await api.get(endpoints.subscriptions.mySubscriptions());
        const subscriptions = (subsRes.data?.data?.subscriptions ?? []) as any[];
        const orgSubs = subscriptions.filter(s => s.organizationId === primaryOrg.id && s.status === 'ACTIVE');
        totalSeats = orgSubs.reduce((sum, s) => {
          // Prefer to remember one active subscription for seat management
          if (!activeSub && s.status === 'ACTIVE') activeSub = s;
          return sum + (s.seats || 0);
        }, 0);
      }
      const availableSeats = Math.max(0, totalSeats - activeMembers);

      // Map members to display
      const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
        .filter((m: any) => m && m.status !== 'REMOVED')
        .map((m: any) => {
          const email: string = String(m.email || 'user@example.com');
          const username = email.split('@')[0] || 'User';
          const roleMapDisplay: Record<string, TeamMember['role']> = {
            OWNER: 'owner',
            ENTERPRISE_ADMIN: 'admin',
            MANAGER: 'manager',
            MEMBER: 'member',
          };
          const statusMapDisplay: Record<string, TeamMember['status']> = {
            INVITED: 'pending',
            ACTIVE: 'active',
            REMOVED: 'removed',
          };
          return {
            id: String(m.id || `${email}-${Math.random().toString(36).slice(2)}`),
            firstName: username.charAt(0).toUpperCase() + username.slice(1),
            lastName: '',
            email,
            role: roleMapDisplay[String(m.role)] || 'member',
            status: statusMapDisplay[String(m.status)] || 'active',
            department: m.department || '',
            licenseType: m.licenseType || 'PROFESSIONAL',
            joinedAt: toIsoDate(m.joinedAt),
            lastActive: toIsoDate(m.updatedAt || m.joinedAt || new Date(), { includeTime: true }),
          } as TeamMember;
        });

      setOrgId(primaryOrg.id);
      setOrgName(primaryOrg.name || 'Organization');
      setOrgPrimaryRole(ctxRole || null);
      setActiveSubscription(activeSub ? { id: String(activeSub.id), tier: String(activeSub.tier).toUpperCase() as any, seats: Number(activeSub.seats || 0), status: String(activeSub.status || '') , organizationId: activeSub.organizationId } : null);
      setTeamMembers(derivedMembers);
      setStats({
        totalMembers: derivedMembers.length,
        activeMembers,
        pendingInvites: 0, // No more pending invites since we create members directly
        availableSeats,
        totalSeats,
      });
    } catch (error) {
      console.error('[TeamPage] Failed to refresh team data:', error);
    }
  };
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [manageSeatsDialogOpen, setManageSeatsDialogOpen] = useState(false);
  const [seatInput, setSeatInput] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editForm, setEditForm] = useState<{ newPassword: string; confirmPassword: string; email: string; role: TeamMember['role']; status: TeamMember['status'] }>({ newPassword: '', confirmPassword: '', email: '', role: 'member', status: 'active' });
  
  // Add confirmation dialog state for delete action
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
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
  };

  const handleInviteMember = async () => {
    if (!orgId) return;
    // Guard: prevent inviting when no seats are available
    if (stats.availableSeats <= 0) {
      enqueueSnackbar('No seats available. Please add seats from Billing before inviting new members.', { variant: 'warning' });
      return;
    }
    try {
      // Create request payload, filtering out undefined/empty values
      const requestPayload: any = {
        email: inviteForm.email.trim(),
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        licenseType: 'PROFESSIONAL', // Default to professional
        organizationId: orgId,
        createdBy: user?.id || 'unknown', // Required by server
        sendWelcomeEmail: true,
      };
      
      // Only add department if it has a value
      if (inviteForm.department && inviteForm.department.trim()) {
        requestPayload.department = inviteForm.department.trim();
      }
      
      console.log('[TeamPage] Creating team member with payload:', requestPayload);
      console.log('[TeamPage] Organization ID:', orgId, 'Type:', typeof orgId);
      console.log('[TeamPage] Organization ID validation test:', /^[a-zA-Z0-9\-_\.]+$/.test(String(orgId)));
      console.log('[TeamPage] Organization ID characters:', Array.from(String(orgId)).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
      
      // Create team member directly using the automated service
      const teamMemberResponse = await api.post(endpoints.teamMembers.create(), requestPayload);

      if (teamMemberResponse.data?.success) {
        const teamMember = teamMemberResponse.data.data.teamMember;
        const temporaryPassword = teamMemberResponse.data.data.temporaryPassword;
        
        enqueueSnackbar(
          `Team member ${teamMember.email} created successfully! Temporary password: ${temporaryPassword}`, 
          { variant: 'success' }
        );
        
        setInviteDialogOpen(false);
        setInviteForm({ email: '', firstName: '', lastName: '', role: 'member', department: '', message: '' });
        
        // Refresh team data
        await refreshTeamData();
      } else {
        throw new Error('Failed to create team member');
      }
    } catch (err: any) {
      console.error('[TeamPage] Team member creation failed:', err);
      console.error('[TeamPage] Error response:', err?.response?.data);
      console.error('[TeamPage] Error status:', err?.response?.status);
      console.error('[TeamPage] Error headers:', err?.response?.headers);
      
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to create team member';
      enqueueSnackbar(serverMsg, { variant: 'error' });
    }
  };

  const canManageSeats = useMemo(() => {
    const roleUpper = String(user?.role || '').toUpperCase();
    // Only SUPERADMINs can manage seats (moved to Admin Dashboard)
    return roleUpper === 'SUPERADMIN';
  }, [user?.role]);

  const openManageSeats = () => {
    if (!activeSubscription) {
      enqueueSnackbar('No active subscription found for this organization.', { variant: 'warning' });
      return;
    }
    setSeatInput(Number(activeSubscription.seats || 0));
    setManageSeatsDialogOpen(true);
  };

  const saveManageSeats = async () => {
    if (!activeSubscription) return;
    try {
      const tier = activeSubscription.tier;
      const requested = Number(seatInput || 0);
      // Client-side constraints aligned with server rules
      if (tier === 'BASIC' && requested !== 1) {
        enqueueSnackbar('Basic plan supports exactly 1 seat.', { variant: 'warning' });
        return;
      }
      if (tier === 'PRO' && (requested < 1 || requested > 50)) {
        enqueueSnackbar('Pro plan seats must be between 1 and 50.', { variant: 'warning' });
        return;
      }
      if (tier === 'ENTERPRISE' && requested < 10) {
        enqueueSnackbar('Enterprise requires minimum 10 seats.', { variant: 'warning' });
        return;
      }

      await api.put(endpoints.subscriptions.update(activeSubscription.id), { seats: requested });

      // Refresh local view
      setActiveSubscription((s) => (s ? { ...s, seats: requested } : s));
      setStats((s) => ({
        ...s,
        totalSeats: requested,
        availableSeats: Math.max(0, requested - (s.activeMembers + s.pendingInvites)),
      }));
      enqueueSnackbar('Seats updated successfully', { variant: 'success' });
      setManageSeatsDialogOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update seats';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleResendInvite = () => {
    if (selectedMember) {
      enqueueSnackbar(`Invitation resent to ${selectedMember.email}`, { variant: 'success' });
    }
    handleMenuClose();
  };

  const openEditDialog = () => {
    setEditForm({
      newPassword: '',
      confirmPassword: '',
      email: selectedMember?.email || '',
      role: selectedMember?.role || 'member',
      status: selectedMember?.status || 'active',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditDialogOpen(true);
  };

  const handleSavePassword = async () => {
    if (!selectedMember) return;
    if (selectedMember.status !== 'active') {
      enqueueSnackbar('Password can only be set after the member has joined (status Active).', { variant: 'warning' });
      return;
    }
    const email = selectedMember.email;
    const { newPassword, confirmPassword } = editForm;
    if (!newPassword || newPassword.length < 8) {
      enqueueSnackbar('Password must be at least 8 characters.', { variant: 'warning' });
      return;
    }
    if (newPassword !== confirmPassword) {
      enqueueSnackbar('Passwords do not match.', { variant: 'warning' });
      return;
    }
    try {
      setIsSavingEdit(true);
      // Prefer org-scoped endpoint using memberId
      if (!orgId) {
        enqueueSnackbar('Organization context not found.', { variant: 'error' });
        return;
      }
      await api.put(endpoints.organizations.setMemberPassword(orgId, selectedMember.id), { password: newPassword });
      enqueueSnackbar(`Password set for ${email}`, { variant: 'success' });
      setEditDialogOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to set password';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedMember || !orgId) return;
    try {
      setIsSavingEdit(true);
      
      // Update member metadata first
      const roleMap: Record<TeamMember['role'], 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER'> = {
        admin: 'ENTERPRISE_ADMIN',
        owner: 'ENTERPRISE_ADMIN',
        manager: 'MANAGER',
        member: 'MEMBER',
        viewer: 'MEMBER',
      };
      const statusMap: Record<TeamMember['status'], 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED'> = {
        pending: 'INVITED',
        active: 'ACTIVE',
        suspended: 'SUSPENDED',
        removed: 'REMOVED',
      };
      
      console.log('Updating member:', {
        memberId: selectedMember.id,
        email: editForm.email,
        role: roleMap[editForm.role],
        status: statusMap[editForm.status],
      });
      
      await api.patch(endpoints.organizations.updateMember(orgId, selectedMember.id), {
        email: editForm.email,
        role: roleMap[editForm.role],
        status: statusMap[editForm.status],
      });

      // If password provided, set it
      if (editForm.newPassword && editForm.confirmPassword && editForm.newPassword === editForm.confirmPassword) {
        await api.put(endpoints.organizations.setMemberPassword(orgId, selectedMember.id), { password: editForm.newPassword });
      }

      enqueueSnackbar('Member updated successfully', { variant: 'success' });
      setEditDialogOpen(false);

      // Refresh organization data to get updated stats and member list
      const orgRes = await api.get(endpoints.organizations.my());
      const owned = orgRes?.data?.data?.owned ?? [];
      const memberOf = orgRes?.data?.data?.memberOf ?? [];
      const primaryOrg = [...owned, ...memberOf].find((o: any) => o.id === orgId) || owned[0] || memberOf[0];
      
      if (primaryOrg) {
        const members = (primaryOrg.members || []) as any[];
        const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
          .filter((m: any) => m && m.status !== 'REMOVED')
          .map((m: any) => {
            const email: string = String(m.email || 'user@example.com');
            const username = email.split('@')[0] || 'User';
            const roleMapDisplay: Record<string, TeamMember['role']> = {
              OWNER: 'owner',
              ENTERPRISE_ADMIN: 'admin',
              MANAGER: 'manager',
              MEMBER: 'member',
            };
            const statusMapDisplay: Record<string, TeamMember['status']> = {
              INVITED: 'pending',
              ACTIVE: 'active',
              REMOVED: 'removed',
            };
            return {
              id: String(m.id || `${email}-${Math.random().toString(36).slice(2)}`),
              firstName: username.charAt(0).toUpperCase() + username.slice(1),
              lastName: '',
              email,
              role: roleMapDisplay[String(m.role)] || 'member',
              status: statusMapDisplay[String(m.status)] || 'active',
              joinedAt: toIsoDate(m.joinedAt),
              lastActive: toIsoDate(m.updatedAt || m.joinedAt || new Date(), { includeTime: true }),
            } as TeamMember;
          });
        
        const pendingInvites = members.filter(m => m.status === 'INVITED').length;
        const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
        
        setTeamMembers(derivedMembers);
        setStats((s) => ({ 
          ...s, 
          totalMembers: derivedMembers.length, 
          pendingInvites, 
          activeMembers, 
          availableSeats: Math.max(0, s.totalSeats - (activeMembers + pendingInvites)) 
        }));
      }
    } catch (err: any) {
      console.error('[TeamPage] Update member failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update member';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setMemberToDelete(selectedMember);
    setDeleteConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete || !orgId) return;
    try {
      await api.post(endpoints.organizations.removeMember(orgId, memberToDelete.id));
      enqueueSnackbar(`${memberToDelete.email} removed from team`, { variant: 'warning' });
      // Refresh
      const orgRes = await api.get(endpoints.organizations.my());
      const owned = orgRes?.data?.data?.owned ?? [];
      const memberOf = orgRes?.data?.data?.memberOf ?? [];
      const primaryOrg = [...owned, ...memberOf].find((o: any) => o.id === orgId) || owned[0] || memberOf[0];
      if (primaryOrg) {
        const members = (primaryOrg.members || []) as any[];
        const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
          .filter((m: any) => m && m.status !== 'REMOVED')
          .map((m: any) => {
            const email: string = String(m.email || 'user@example.com');
            const username = email.split('@')[0] || 'User';
            const roleMapDisplay: Record<string, TeamMember['role']> = {
              OWNER: 'owner',
              ENTERPRISE_ADMIN: 'admin',
              MANAGER: 'manager',
              MEMBER: 'member',
            };
            const statusMapDisplay: Record<string, TeamMember['status']> = {
              INVITED: 'pending',
              ACTIVE: 'active',
              REMOVED: 'removed',
            };
            return {
              id: String(m.id || `${email}-${Math.random().toString(36).slice(2)}`),
              firstName: username.charAt(0).toUpperCase() + username.slice(1),
              lastName: '',
              email,
              role: roleMapDisplay[String(m.role)] || 'member',
              status: statusMapDisplay[String(m.status)] || 'active',
              joinedAt: toIsoDate(m.joinedAt),
              lastActive: toIsoDate(m.updatedAt || m.joinedAt || new Date(), { includeTime: true }),
            } as TeamMember;
          });
        const pendingInvites = members.filter(m => m.status === 'INVITED').length;
        const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
        setTeamMembers(derivedMembers);
        setStats((s) => ({ ...s, totalMembers: derivedMembers.length, pendingInvites, activeMembers, availableSeats: Math.max(0, s.totalSeats - (activeMembers + pendingInvites)) }));
      }
    } catch (err: any) {
      console.error('[TeamPage] Remove member failed:', err);
      enqueueSnackbar(err?.message || 'Failed to remove member', { variant: 'error' });
    } finally {
      setDeleteConfirmDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleCancelDeleteMember = () => {
    setDeleteConfirmDialogOpen(false);
    setMemberToDelete(null);
  };

  const utilization = useMemo(() => {
    if (stats.totalSeats <= 0) return 0;
    return ((stats.totalSeats - stats.availableSeats) / stats.totalSeats) * 100;
  }, [stats.totalSeats, stats.availableSeats]);

  return (
    <Box>
      {/* Header */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Team Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Create and manage your team members with automatic Firebase Authentication setup. 
              Each member gets their own account and temporary password.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
            disabled={stats.availableSeats <= 0}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Add Team Member
          </Button>
          {canManageSeats && (
            <Button
              variant="outlined"
              onClick={openManageSeats}
              sx={{ ml: 2 }}
            >
              Manage Seats{activeSubscription ? ` (${activeSubscription.seats})` : ''}
            </Button>
          )}
        </Box>
      </Box>

      {/* Team Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Team Members"
            value={stats.totalMembers}
            icon={<People />}
            color="primary"
            trend={{ value: 12, direction: 'up' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Members"
            value={stats.activeMembers}
            icon={<CheckCircle />}
            color="success"
            trend={{ value: 8, direction: 'up' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Seats"
            value={stats.totalSeats}
            icon={<Star />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Seats"
            value={stats.availableSeats}
            icon={<Star />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Team Members Table */}
      <Box>
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
                    <Typography variant="body2">
                      {member.licenseType || 'PROFESSIONAL'}
                    </Typography>
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
      </Box>

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
        <MenuItem onClick={() => { handleMenuClose(); openEditDialog(); }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Member
        </MenuItem>
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
        <DialogTitle>Create New Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new team member account with automatic Firebase Authentication setup. 
            The member will receive a welcome email with their temporary password.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {stats.availableSeats <= 0 && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  No available seats. Add seats on the Billing page to invite more team members.
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                required
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
            disabled={!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || stats.availableSeats <= 0}
          >
            Create Team Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Seats Dialog */}
      <Dialog
        open={manageSeatsDialogOpen}
        onClose={() => setManageSeatsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Manage Seats</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Alert severity="info">
                {activeSubscription ? `${activeSubscription.tier} subscription` : 'No active subscription'}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Total Seats"
                value={seatInput}
                onChange={(e) => setSeatInput(parseInt(e.target.value || '0', 10))}
                inputProps={{ min: 1, max: activeSubscription?.tier === 'PRO' ? 50 : 1000 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageSeatsDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveManageSeats} variant="contained" disabled={!activeSubscription}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog - Set Password */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMember(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
      <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as TeamMember['role'] }))}
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TeamMember['status'] }))}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="removed">Removed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
            <Grid item xs={12}>
              {editForm.status !== 'active' ? (
                <Alert severity="warning">This member has not joined yet (Pending/Suspended/Removed). You can only set a password for Active members.</Alert>
              ) : (
                <Alert severity="info">Set a temporary password for this user to log into Backbone. They can change it later.</Alert>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={editForm.newPassword}
                onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))}
                inputProps={{ minLength: 8 }}
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={editForm.confirmPassword}
                onChange={(e) => setEditForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isSavingEdit}>Cancel</Button>
          <Button
            onClick={handleSaveChanges}
            variant="outlined"
            disabled={isSavingEdit}
          >
            {isSavingEdit ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button onClick={handleSavePassword} variant="contained" disabled={isSavingEdit || !editForm.newPassword || !editForm.confirmPassword || editForm.status !== 'active'}>
            {isSavingEdit ? 'Saving…' : 'Save Password Only'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={handleCancelDeleteMember}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            Remove Team Member
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove <strong>{memberToDelete?.email}</strong> from your team?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This action cannot be undone. The member will lose access to all organization resources and data.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteMember} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteMember}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamPage;
