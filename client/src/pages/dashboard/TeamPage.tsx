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

  // Helper function to generate secure passwords
  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    availableSeats: 0,
    totalSeats: 0,
  });

  // Web-only mode detection
  const isWebOnlyHost = typeof window !== 'undefined' && (
    window.location.hostname.includes('web.app') ||
    window.location.hostname.includes('firebaseapp.com') ||
    window.location.hostname.includes('backbone-logic.web.app') ||
    window.location.hostname.includes('backbone-client.web.app') ||
    (window as any).WEBONLY_MODE === true ||
    localStorage.getItem('WEB_ONLY') === 'true' ||
    localStorage.getItem('USE_FIRESTORE') === 'true'
  );
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
        // Debug web-only mode detection
        console.log('[TeamPage] useEffect - Web-only mode detection:');
        console.log('  - isWebOnlyHost:', isWebOnlyHost);
        console.log('  - hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
        console.log('  - WEBONLY_MODE:', typeof window !== 'undefined' ? (window as any).WEBONLY_MODE : 'N/A');
        console.log('  - localStorage WEB_ONLY:', typeof window !== 'undefined' ? localStorage.getItem('WEB_ONLY') : 'N/A');
        console.log('  - localStorage USE_FIRESTORE:', typeof window !== 'undefined' ? localStorage.getItem('USE_FIRESTORE') : 'N/A');
        console.log('  - user?.id:', user?.id);

        let primaryOrg: any = null;
        let members: any[] = [];
        let activeSub: any = null;
        let ctxRole: any = null;

        if (isWebOnlyHost && user?.id) {
          // In web-only mode, get data directly from Firestore
          try {
            console.log('[TeamPage] Web-only mode: Getting data from Firestore...');
            
            // Import Firestore services
            const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
            const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../../services/firebase');
            
            // Get user's organization from Firestore
            const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', user.id)));
            console.log('[TeamPage] User document query result:', userDoc.empty ? 'empty' : 'found', userDoc.docs.length, 'docs');
            
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              console.log('[TeamPage] User data from Firestore:', userData);
              
              if (userData.organizationId) {
                console.log('[TeamPage] User has organizationId:', userData.organizationId);
                
                // Get organization data
                const orgDoc = await getDocs(query(collection(db, 'organizations'), where('id', '==', userData.organizationId)));
                console.log('[TeamPage] Organization query result:', orgDoc.empty ? 'empty' : 'found', orgDoc.docs.length, 'docs');
                
                if (!orgDoc.empty) {
                  primaryOrg = { id: userData.organizationId, ...orgDoc.docs[0].data() };
                  console.log('[TeamPage] Found organization in Firestore:', primaryOrg);
                } else {
                  console.warn('[TeamPage] No organization found for ID:', userData.organizationId);
                  console.log('[TeamPage] Creating fallback organization object...');
                  
                  // Create a fallback organization object since the document doesn't exist
                  primaryOrg = {
                    id: userData.organizationId,
                    name: 'Enterprise Organization',
                    type: 'ENTERPRISE',
                    status: 'ACTIVE',
                    // Add any other required fields
                  };
                  console.log('[TeamPage] Created fallback organization:', primaryOrg);
                }
                
                // Get team members from Firestore
                const teamMembersQuery = query(collection(db, 'teamMembers'), where('organizationId', '==', userData.organizationId));
                const teamMembersSnapshot = await getDocs(teamMembersQuery);
                members = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('[TeamPage] Found team members in Firestore:', members.length);
                
                // Get user's role from org_members
                const orgMemberQuery = query(collection(db, 'org_members'), where('userId', '==', user.id));
                const orgMemberSnapshot = await getDocs(orgMemberQuery);
                if (!orgMemberSnapshot.empty) {
                  ctxRole = orgMemberSnapshot.docs[0].data().role;
                  console.log('[TeamPage] User role from Firestore:', ctxRole);
                } else {
                  console.warn('[TeamPage] No org_members record found for user:', user.id);
                }
                          } else {
              console.warn('[TeamPage] User has no organizationId in Firestore');
              
              // Try to get organization ID from team members
              console.log('[TeamPage] Trying to get organization ID from team members...');
              const allTeamMembersQuery = query(collection(db, 'teamMembers'));
              const allTeamMembersSnapshot = await getDocs(allTeamMembersQuery);
              const userTeamMember = allTeamMembersSnapshot.docs.find(doc => doc.data().email === user.email);
              
              if (userTeamMember) {
                const teamMemberData = userTeamMember.data();
                console.log('[TeamPage] Found team member data:', teamMemberData);
                
                                   if (teamMemberData.organizationId) {
                     console.log('[TeamPage] Using organization ID from team member:', teamMemberData.organizationId);
                     
                     // Get organization data
                     const orgDoc = await getDocs(query(collection(db, 'organizations'), where('id', '==', teamMemberData.organizationId)));
                     if (!orgDoc.empty) {
                       primaryOrg = { id: teamMemberData.organizationId, ...orgDoc.docs[0].data() };
                       console.log('[TeamPage] Found organization from team member:', primaryOrg);
                       
                       // Get all team members for this organization
                       const teamMembersQuery = query(collection(db, 'teamMembers'), where('organizationId', '==', teamMemberData.organizationId));
                       const teamMembersSnapshot = await getDocs(teamMembersQuery);
                       members = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                       console.log('[TeamPage] Found team members from team member query:', members.length);
                     } else {
                       console.log('[TeamPage] Creating fallback organization from team member data...');
                       
                       // Create a fallback organization object
                       primaryOrg = {
                         id: teamMemberData.organizationId,
                         name: 'Enterprise Organization',
                         type: 'ENTERPRISE',
                         status: 'ACTIVE',
                       };
                       console.log('[TeamPage] Created fallback organization from team member:', primaryOrg);
                       
                       // Get all team members for this organization
                       const teamMembersQuery = query(collection(db, 'teamMembers'), where('organizationId', '==', teamMemberData.organizationId));
                       const teamMembersSnapshot = await getDocs(teamMembersQuery);
                       members = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                       console.log('[TeamPage] Found team members from team member query:', members.length);
                     }
                   }
              }
            }
          } else {
            console.warn('[TeamPage] No user document found in Firestore for ID:', user.id);
          }
        } catch (error) {
          console.warn('[TeamPage] Failed to get data from Firestore:', error);
        }
        }

        // Only fall back to API calls if NOT in web-only mode
        if (!isWebOnlyHost && !primaryOrg) {
          console.log('[TeamPage] Not in web-only mode, falling back to API calls...');
          // Try richer context endpoint first
          const ctxRes = await api.get(endpoints.organizations.context()).catch(() => null as any);
          const ctxOrg = ctxRes?.data?.data?.organization || null;
          const ctxMembers = ctxRes?.data?.data?.members || [];
          const ctxActiveSub = ctxRes?.data?.data?.activeSubscription || null;
          const ctxRole = ctxRes?.data?.data?.primaryRole || null;

          primaryOrg = ctxOrg;
          members = ctxMembers;
          activeSub = ctxActiveSub;

          if (!primaryOrg) {
            // Fallback to /organizations/my if context not available
            const orgRes = await api.get(endpoints.organizations.my());
            const owned = orgRes?.data?.data?.owned ?? [];
            const memberOf = orgRes?.data?.data?.memberOf ?? [];
            primaryOrg = (owned[0] || memberOf[0]) || null;
            members = (primaryOrg?.members || []) as any[];
          }
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
        } else if (!isWebOnlyHost) {
          // Only make API calls if NOT in web-only mode
          const subsRes = await api.get(endpoints.subscriptions.mySubscriptions());
          const subscriptions = (subsRes.data?.data?.subscriptions ?? []) as any[];
          const orgSubs = subscriptions.filter(s => s.organizationId === primaryOrg.id && s.status === 'ACTIVE');
          totalSeats = orgSubs.reduce((sum, s) => {
            // Prefer to remember one active subscription for seat management
            if (!activeSub && s.status === 'ACTIVE') activeSub = s;
            return sum + (s.seats || 0);
          }, 0);
        }
        
        // In web-only mode, also check actual available licenses from Firestore
        let availableSeats = Math.max(0, totalSeats - activeMembers);
        
        console.log(`[TeamPage] Web-only mode check: ${isWebOnlyHost}, User ID: ${user?.id}, Org ID: ${primaryOrg?.id}`);
        
        if (isWebOnlyHost && user?.id && primaryOrg?.id) {
          try {
            // Import Firestore license service to check actual available licenses
            const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
            
            console.log(`[TeamPage] Checking Firestore licenses for organization: ${primaryOrg.id}`);
            
            // First try to get unassigned licenses directly (most efficient)
            let availableLicenses = await firestoreLicenseService.getUnassignedLicenses(primaryOrg.id);
            console.log(`[TeamPage] Unassigned licenses found: ${availableLicenses.length}`);
            
            // If no unassigned licenses found, try the broader organization licenses method
            if (availableLicenses.length === 0) {
              console.log('[TeamPage] No unassigned licenses found, trying organization licenses...');
              const allLicenses = await firestoreLicenseService.getOrganizationLicenses(primaryOrg.id);
              console.log(`[TeamPage] Organization licenses found: ${allLicenses.length}`);
              
              // Filter to only include active, unassigned licenses
              availableLicenses = allLicenses.filter(l => 
                l.status === 'ACTIVE' && 
                !l.assignedToUserId && 
                !l.assignedToEmail
              );
              console.log(`[TeamPage] Filtered available licenses: ${availableLicenses.length}`);
            }
            
            // If still no licenses found, try the fallback method
            if (availableLicenses.length === 0) {
              console.log('[TeamPage] No organization licenses found, trying fallback method...');
              const allLicenses = await firestoreLicenseService.getAllAccessibleLicenses();
              console.log(`[TeamPage] Fallback licenses found: ${allLicenses.length}`);
              
              // Filter to only include licenses that belong to this organization or are unassigned
              const orgLicenses = allLicenses.filter(l => 
                !l.organizationId || 
                l.organizationId === primaryOrg.id ||
                (!l.assignedToUserId && !l.assignedToEmail)
              );
              console.log(`[TeamPage] Filtered licenses for org: ${orgLicenses.length}`);
              
              availableLicenses = orgLicenses.filter(l => 
                l.status === 'ACTIVE' && 
                !l.assignedToUserId && 
                !l.assignedToEmail
              );
            }
            
            // Final fallback: try to get any unassigned licenses
            if (availableLicenses.length === 0) {
              console.log('[TeamPage] Still no licenses found, trying final fallback...');
              availableLicenses = await firestoreLicenseService.getAllUnassignedLicenses();
              console.log(`[TeamPage] Final fallback found: ${availableLicenses.length} unassigned licenses`);
            }
            
            console.log(`[TeamPage] Final result: ${availableLicenses.length} available licenses for organization ${primaryOrg.id}`);
            console.log(`[TeamPage] License details:`, availableLicenses.map(l => ({
              id: l.id,
              status: l.status,
              assignedToUserId: l.assignedToUserId,
              assignedToEmail: l.assignedToEmail,
              organizationId: l.organizationId
            })));
            
            // Use the actual available license count if it's more reliable
            if (availableLicenses.length > 0) {
              // Estimate total seats based on available + assigned
              const allOrgLicenses = await firestoreLicenseService.getOrganizationLicenses(primaryOrg.id);
              totalSeats = allOrgLicenses.filter(l => l.status === 'ACTIVE').length;
              const assignedLicenses = allOrgLicenses.filter(l => 
                l.status === 'ACTIVE' && (l.assignedToUserId || l.assignedToEmail)
              );
              availableSeats = availableLicenses.length;
              
              console.log(`[TeamPage] Updated from Firestore: totalSeats=${totalSeats}, assignedLicenses=${assignedLicenses.length}, availableSeats=${availableSeats}`);
            }
          } catch (error) {
            console.warn('[TeamPage] Failed to check Firestore licenses:', error);
            console.error('[TeamPage] Error details:', error);
          }
        }

        // Map members to display - filter out removed members
        const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
          .filter((m: any) => m && m.status !== 'REMOVED' && m.status !== 'removed')
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
            
            // Properly handle firstName and lastName from server response
            const firstName = m.firstName || m.name?.split(' ')[0] || username.charAt(0).toUpperCase() + username.slice(1);
            const lastName = m.lastName || m.name?.split(' ').slice(1).join(' ') || '';
            
            return {
              id: String(m.id || `${email}-${Math.random().toString(36).slice(2)}`),
              firstName,
              lastName,
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

  // In webonly mode, subscribe to Firestore teamMembers for live updates
  useEffect(() => {
    if (!isWebOnlyHost || !orgId) return;

    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { db } = await import('../../services/firebase');
        const { collection, query, where, onSnapshot } = await import('firebase/firestore');

        const q = query(
          collection(db, 'teamMembers'),
          where('organizationId', '==', String(orgId))
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('[TeamPage] Firestore subscription: received', snapshot.docs.length, 'team members');
          
          const mapped: TeamMember[] = snapshot.docs
            .filter((docSnap) => {
              const data: any = docSnap.data();
              // Filter out removed members
              const isRemoved = data && (data.status === 'REMOVED' || data.status === 'removed');
              if (isRemoved) {
                console.log('[TeamPage] Filtering out removed member:', data.email, 'with status:', data.status);
              }
              return data && !isRemoved;
            })
            .map((docSnap) => {
              const data: any = docSnap.data();
              const email: string = String(data.email || 'user@example.com');
              const username = email.split('@')[0] || 'User';
              const firstName = data.firstName || username.charAt(0).toUpperCase() + username.slice(1);
              const lastName = data.lastName || '';
              const statusMap: Record<string, TeamMember['status']> = {
                INVITED: 'pending',
                ACTIVE: 'active',
                REMOVED: 'removed',
                SUSPENDED: 'suspended',
              };
              const roleMap: Record<string, TeamMember['role']> = {
                OWNER: 'owner',
                ENTERPRISE_ADMIN: 'admin',
                MANAGER: 'manager',
                MEMBER: 'member',
              };
              return {
                id: docSnap.id,
                firstName,
                lastName,
                email,
                role: roleMap[String(data.role)] || 'member',
                status: statusMap[String(data.status)] || 'active',
                department: data.department || '',
                licenseType: data.licenseType || 'PROFESSIONAL',
                joinedAt: toIsoDate(data.createdAt),
                lastActive: toIsoDate(data.updatedAt || data.createdAt || new Date(), { includeTime: true }),
              } as TeamMember;
            });

          // Sort client-side by createdAt desc to avoid composite index requirement
          const sorted = mapped.sort((a, b) => {
            const toMs = (v: any): number => {
              if (!v) return 0;
              const d = new Date(v);
              return isNaN(d.getTime()) ? 0 : d.getTime();
            };
            return toMs(b.joinedAt) - toMs(a.joinedAt);
          });

          const activeMembers = sorted.filter((m) => m.status === 'active').length;
          setTeamMembers(sorted);
          setStats((s) => ({
            ...s,
            totalMembers: sorted.length,
            activeMembers,
            pendingInvites: 0,
            availableSeats: Math.max(0, s.totalSeats - activeMembers),
          }));
        });
      } catch (err) {
        console.warn('[TeamPage] Firestore subscription failed:', err);
      }
    })();

    return () => {
      try { if (unsubscribe) unsubscribe(); } catch {}
    };
  }, [orgId]);
  
  // Function to refresh team data
  const refreshTeamData = async () => {
    try {
      let primaryOrg: any = null;
      let members: any[] = [];
      let activeSub: any = null;
      let ctxRole: any = null;

      // Check if we're in web-only mode first
      if (isWebOnlyHost && user?.id) {
        // In web-only mode, get data directly from Firestore
        try {
          console.log('[TeamPage] Refresh: Web-only mode - Getting data from Firestore...');
          
          // Import Firestore services
          const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
          const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('../../services/firebase');
          
          // Get user's organization from Firestore
          const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', user.id)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            if (userData.organizationId) {
              // Get organization data
              const orgDoc = await getDocs(query(collection(db, 'organizations'), where('id', '==', userData.organizationId)));
              if (!orgDoc.empty) {
                primaryOrg = { id: userData.organizationId, ...orgDoc.docs[0].data() };
                console.log('[TeamPage] Refresh: Found organization in Firestore:', primaryOrg);
              }
              
              // Get team members from Firestore
              const teamMembersQuery = query(collection(db, 'teamMembers'), where('organizationId', '==', userData.organizationId));
              const teamMembersSnapshot = await getDocs(teamMembersQuery);
              members = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              console.log('[TeamPage] Refresh: Found team members in Firestore:', members.length);
              
              // Get user's role from org_members
              const orgMemberQuery = query(collection(db, 'org_members'), where('userId', '==', user.id));
              const orgMemberSnapshot = await getDocs(orgMemberQuery);
              if (!orgMemberSnapshot.empty) {
                ctxRole = orgMemberSnapshot.docs[0].data().role;
                console.log('[TeamPage] Refresh: User role from Firestore:', ctxRole);
              }
            }
          }
        } catch (error) {
          console.warn('[TeamPage] Refresh: Failed to get data from Firestore:', error);
        }
      }

      // Only fall back to API calls if not in web-only mode or Firestore failed
      if (!isWebOnlyHost && !primaryOrg) {
        console.log('[TeamPage] Refresh: Using API calls...');
        // Try richer context endpoint first
        const ctxRes = await api.get(endpoints.organizations.context()).catch(() => null as any);
        const ctxOrg = ctxRes?.data?.data?.organization || null;
        const ctxMembers = ctxRes?.data?.data?.members || [];
        const ctxActiveSub = ctxRes?.data?.data?.activeSubscription || null;
        ctxRole = ctxRes?.data?.data?.primaryRole || null;

        primaryOrg = ctxOrg;
        members = ctxMembers;
        activeSub = ctxActiveSub;

        if (!primaryOrg) {
          // Fallback to /organizations/my if context not available
          const orgRes = await api.get(endpoints.organizations.my());
          const owned = orgRes?.data?.data?.owned ?? [];
          const memberOf = orgRes?.data?.data?.memberOf ?? [];
          primaryOrg = (owned[0] || memberOf[0]) || null;
          members = (primaryOrg?.members || []) as any[];
        }
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
      } else if (!isWebOnlyHost) {
        // Only make API calls if NOT in web-only mode
        const subsRes = await api.get(endpoints.subscriptions.mySubscriptions());
        const subscriptions = (subsRes.data?.data?.subscriptions ?? []) as any[];
        const orgSubs = subscriptions.filter(s => s.organizationId === primaryOrg.id && s.status === 'ACTIVE');
        totalSeats = orgSubs.reduce((sum, s) => {
          // Prefer to remember one active subscription for seat management
          if (!activeSub && s.status === 'ACTIVE') activeSub = s;
          return sum + (s.seats || 0);
        }, 0);
      }
      
      // In web-only mode, also check actual available licenses from Firestore
      let availableSeats = Math.max(0, totalSeats - activeMembers);
      
      if (isWebOnlyHost && user?.id && primaryOrg?.id) {
        try {
          // Import Firestore license service to check actual available licenses
          const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
          
          console.log(`[TeamPage] Refresh - Checking Firestore licenses for organization: ${primaryOrg.id}`);
          
          // First try to get unassigned licenses directly (most efficient)
          let availableLicenses = await firestoreLicenseService.getUnassignedLicenses(primaryOrg.id);
          console.log(`[TeamPage] Refresh - Unassigned licenses found: ${availableLicenses.length}`);
          
          // If no unassigned licenses found, try the broader organization licenses method
          if (availableLicenses.length === 0) {
            console.log('[TeamPage] Refresh - No unassigned licenses found, trying organization licenses...');
            const allLicenses = await firestoreLicenseService.getOrganizationLicenses(primaryOrg.id);
            console.log(`[TeamPage] Refresh - Organization licenses found: ${allLicenses.length}`);
            
            // Filter to only include active, unassigned licenses
            availableLicenses = allLicenses.filter(l => 
              l.status === 'ACTIVE' && 
              !l.assignedToUserId && 
              !l.assignedToEmail
            );
            console.log(`[TeamPage] Refresh - Filtered available licenses: ${availableLicenses.length}`);
          }
          
          // If still no licenses found, try the fallback method
          if (availableLicenses.length === 0) {
            console.log('[TeamPage] Refresh - No organization licenses found, trying fallback method...');
            const allLicenses = await firestoreLicenseService.getAllAccessibleLicenses();
            console.log(`[TeamPage] Refresh - Fallback licenses found: ${allLicenses.length}`);
            
            // Filter to only include licenses that belong to this organization or are unassigned
            const orgLicenses = allLicenses.filter(l => 
              !l.organizationId || 
              l.organizationId === primaryOrg.id ||
              (!l.assignedToUserId && !l.assignedToEmail)
            );
            console.log(`[TeamPage] Refresh - Filtered licenses for org: ${orgLicenses.length}`);
            
            availableLicenses = orgLicenses.filter(l => 
              l.status === 'ACTIVE' && 
              !l.assignedToUserId && 
              !l.assignedToEmail
            );
          }
          
          // Final fallback: try to get any unassigned licenses
          if (availableLicenses.length === 0) {
            console.log('[TeamPage] Refresh - Still no licenses found, trying final fallback...');
            availableLicenses = await firestoreLicenseService.getAllUnassignedLicenses();
            console.log(`[TeamPage] Refresh - Final fallback found: ${availableLicenses.length} unassigned licenses`);
          }
          
          console.log(`[TeamPage] Refresh - Final result: ${availableLicenses.length} available licenses for organization ${primaryOrg.id}`);
          
          // Use the actual available license count if it's more reliable
          if (availableLicenses.length > 0) {
            // Estimate total seats based on available + assigned
            const allOrgLicenses = await firestoreLicenseService.getOrganizationLicenses(primaryOrg.id);
            totalSeats = allOrgLicenses.filter(l => l.status === 'ACTIVE').length;
            const assignedLicenses = allOrgLicenses.filter(l => 
              l.status === 'ACTIVE' && (l.assignedToUserId || l.assignedToEmail)
            );
            availableSeats = availableLicenses.length;
            
            console.log(`[TeamPage] Refresh - Updated from Firestore: totalSeats=${totalSeats}, assignedLicenses=${assignedLicenses.length}, availableSeats=${availableSeats}`);
          }
        } catch (error) {
          console.warn('[TeamPage] Refresh - Failed to check Firestore licenses:', error);
        }
      }

      // Map members to display - filter out removed members
      const derivedMembers: TeamMember[] = (Array.isArray(members) ? members : [])
        .filter((m: any) => m && m.status !== 'REMOVED' && m.status !== 'removed')
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
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [showInviteConfirmPassword, setShowInviteConfirmPassword] = useState(false);
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
    password: '',
    confirmPassword: '',
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
    // Guard: prevent inviting when no seats are available (but skip this check in web-only mode)
    if (!isWebOnlyHost && stats.availableSeats <= 0) {
      enqueueSnackbar('No licenses available. Please check your organization\'s licenses before inviting new members.', { variant: 'warning' });
      return;
    }

    // Validate password fields if provided
    if (inviteForm.password || inviteForm.confirmPassword) {
      if (inviteForm.password !== inviteForm.confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'error' });
        return;
      }
      if (inviteForm.password.length < 8) {
        enqueueSnackbar('Password must be at least 8 characters long', { variant: 'error' });
        return;
      }
    }

    try {
      // Check if we're in webonly mode
      const isWebOnly = typeof window !== 'undefined' && (
        (window as any).WEBONLY_MODE === true ||
        localStorage.getItem('WEB_ONLY') === 'true' ||
        localStorage.getItem('USE_FIRESTORE') === 'true' ||
        window.location.hostname.includes('backbone-client.web.app') ||
        window.location.hostname.includes('web.app') ||
        window.location.hostname.includes('firebaseapp.com')
      );

      if (isWebOnly) {
        console.log('[TeamPage] WebOnly mode detected - checking Firebase Auth...');
        
        // Import Firebase services for webonly mode
        const { db, auth } = await import('../../services/firebase');
        const { collection, addDoc, serverTimestamp, doc, setDoc } = await import('firebase/firestore');
        const { createUserWithEmailAndPassword, signInAnonymously } = await import('firebase/auth');
        
        // Check if Firebase Auth is initialized
        if (!auth.currentUser) {
          console.log('[TeamPage] No Firebase Auth user - attempting anonymous sign-in...');
          try {
            await signInAnonymously(auth);
            console.log('[TeamPage] Anonymous sign-in successful');
          } catch (authError) {
            console.error('[TeamPage] Anonymous sign-in failed:', authError);
            throw new Error('Firebase authentication required for team member creation');
          }
        }
        
        console.log('[TeamPage] Creating Firebase Auth user account...');
        
        // Generate a password if none provided
        const password = inviteForm.password || generateSecurePassword();
        
        try {
          // Create the Firebase Auth user account
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            inviteForm.email.trim(), 
            password
          );
          
          const firebaseUser = userCredential.user;
          console.log('[TeamPage] Firebase Auth user created successfully:', firebaseUser.uid);
          
          // Create team member document for Firestore
          const teamMemberData = {
            id: firebaseUser.uid, // Use Firebase Auth UID as the ID
            email: inviteForm.email.trim(),
            firstName: inviteForm.firstName.trim(),
            lastName: inviteForm.lastName.trim(),
            licenseType: 'PROFESSIONAL',
            organizationId: orgId,
            role: 'MEMBER',
            status: 'ACTIVE',
            department: inviteForm.department?.trim() || undefined,
            createdBy: auth.currentUser?.uid || user?.id || 'unknown',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Store the password for reference
            temporaryPassword: password
          };

          // Clean the data to remove undefined values
          const cleanData = Object.fromEntries(
            Object.entries(teamMemberData).filter(([_, value]) => value !== undefined && value !== null)
          );

          console.log('[TeamPage] Creating team member in Firestore with data:', cleanData);
          
          // Add to teamMembers collection using the Firebase Auth UID as document ID
          const docRef = await setDoc(doc(db, 'teamMembers', firebaseUser.uid), cleanData);
          
          console.log('[TeamPage] Team member created successfully in Firestore:', firebaseUser.uid);
          
          // 🔧 CRITICAL FIX: Automatically assign an available license to the new team member
          try {
            console.log('[TeamPage] Attempting to assign license to new team member via API...');
            
            // Import Firestore license service for license assignment
            const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
            
            // Get available licenses for this organization
            const availableLicenses = await firestoreLicenseService.getUnassignedLicenses(orgId);
            console.log(`[TeamPage] Found ${availableLicenses.length} available licenses for organization ${orgId}`);
            
            if (availableLicenses.length > 0) {
              // Find the best available license (prefer ENTERPRISE > PRO > BASIC)
              const sortedLicenses = availableLicenses.sort((a, b) => {
                const tierOrder = { ENTERPRISE: 3, PRO: 2, BASIC: 1 };
                const tierA = tierOrder[a.tier] || 0;
                const tierB = tierOrder[b.tier] || 0;
                return tierB - tierA;
              });
              
              const licenseToAssign = sortedLicenses[0];
              console.log(`[TeamPage] Assigning license ${licenseToAssign.id} (${licenseToAssign.tier}) to new team member`);
              
              // Assign the license
              await firestoreLicenseService.assignLicense(licenseToAssign.id, inviteForm.email.trim());
              console.log(`[TeamPage] Successfully assigned license ${licenseToAssign.id} to ${inviteForm.email}`);
              
              enqueueSnackbar(`License automatically assigned to ${inviteForm.email}`, { variant: 'info' });
            } else {
              console.warn('[TeamPage] No available licenses found for automatic assignment');
              enqueueSnackbar('Team member created but no licenses available for automatic assignment', { variant: 'warning' });
            }
          } catch (licenseError) {
            console.error('[TeamPage] Failed to automatically assign license:', licenseError);
            enqueueSnackbar('Team member created but license assignment failed', { variant: 'warning' });
          }
          
          const message = inviteForm.password 
            ? `Team member ${inviteForm.email} created successfully with your custom password!`
            : `Team member ${inviteForm.email} created successfully! Temporary password: ${password}`;
          
          enqueueSnackbar(message, { variant: 'success' });
          
          setInviteDialogOpen(false);
          setInviteForm({ email: '', firstName: '', lastName: '', role: 'member', department: '', message: '', password: '', confirmPassword: '' });
          
          // Refresh team data
          await refreshTeamData();
          
        } catch (authError: any) {
          console.error('[TeamPage] Firebase Auth user creation failed:', authError);
          
          if (authError.code === 'auth/email-already-in-use') {
            enqueueSnackbar(`User with email ${inviteForm.email} already exists in Firebase Auth`, { variant: 'error' });
          } else if (authError.code === 'auth/weak-password') {
            enqueueSnackbar('Password is too weak. Please use a stronger password.', { variant: 'error' });
          } else {
            enqueueSnackbar(`Failed to create Firebase Auth user: ${authError.message}`, { variant: 'error' });
          }
          throw authError;
        }
        
      } else {
        console.log('[TeamPage] Using HTTP API for team member creation');
        
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

        // Add password if provided
        if (inviteForm.password && inviteForm.password.trim()) {
          requestPayload.temporaryPassword = inviteForm.password.trim();
        }
        
        // Clean the payload to remove any undefined values that could cause Firestore errors
        const cleanPayload = Object.fromEntries(
          Object.entries(requestPayload).filter(([_, value]) => value !== undefined && value !== null)
        );
        
        console.log('[TeamPage] Creating team member with payload:', cleanPayload);
        console.log('[TeamPage] Organization ID:', orgId, 'Type:', typeof orgId);
        console.log('[TeamPage] Organization ID validation test:', /^[a-zA-Z0-9\-_\.]+$/.test(String(orgId)));
        console.log('[TeamPage] Organization ID characters:', Array.from(String(orgId)).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
        
        // Create team member directly using the automated service
        const teamMemberResponse = await api.post(endpoints.teamMembers.create(), cleanPayload);

        if (teamMemberResponse.data?.success) {
          const teamMember = teamMemberResponse.data.data.teamMember;
          const temporaryPassword = teamMemberResponse.data.data.temporaryPassword;
          
          // 🔧 CRITICAL FIX: Automatically assign an available license to the new team member
          try {
            console.log('[TeamPage] Attempting to assign license to new team member via API...');
            
            // Import Firestore license service for license assignment
            const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
            
            // Get available licenses for this organization
            const availableLicenses = await firestoreLicenseService.getUnassignedLicenses(orgId);
            console.log(`[TeamPage] Found ${availableLicenses.length} available licenses for organization ${orgId}`);
            
            if (availableLicenses.length > 0) {
              // Find the best available license (prefer ENTERPRISE > PRO > BASIC)
              const sortedLicenses = availableLicenses.sort((a, b) => {
                const tierOrder = { ENTERPRISE: 3, PRO: 2, BASIC: 1 };
                const tierA = tierOrder[a.tier] || 0;
                const tierB = tierOrder[b.tier] || 0;
                return tierB - tierA;
              });
              
              const licenseToAssign = sortedLicenses[0];
              console.log(`[TeamPage] Assigning license ${licenseToAssign.id} (${licenseToAssign.tier}) to new team member`);
              
              // Assign the license
              await firestoreLicenseService.assignLicense(licenseToAssign.id, inviteForm.email.trim());
              console.log(`[TeamPage] Successfully assigned license ${licenseToAssign.id} to ${inviteForm.email}`);
              
              enqueueSnackbar(`License automatically assigned to ${inviteForm.email}`, { variant: 'info' });
            } else {
              console.warn('[TeamPage] No available licenses found for automatic assignment');
              enqueueSnackbar('Team member created but no licenses available for automatic assignment', { variant: 'warning' });
            }
          } catch (licenseError) {
            console.error('[TeamPage] Failed to automatically assign license:', licenseError);
            enqueueSnackbar('Team member created but license assignment failed', { variant: 'warning' });
          }
          
          // Show different messages based on whether a custom password was provided
          const message = inviteForm.password 
            ? `Team member ${teamMember.email} created successfully with your custom password!`
            : `Team member ${teamMember.email} created successfully! Temporary password: ${temporaryPassword}`;
          
          enqueueSnackbar(message, { variant: 'success' });
          
          setInviteDialogOpen(false);
          setInviteForm({ email: '', firstName: '', lastName: '', role: 'member', department: '', message: '', password: '', confirmPassword: '' });
          
          // Refresh team data
          await refreshTeamData();
        } else {
          throw new Error('Failed to create team member');
        }
      }
    } catch (err: any) {
      console.error('[TeamPage] Team member creation failed:', err);
      
      if (err?.response) {
        console.error('[TeamPage] Error response:', err?.response?.data);
        console.error('[TeamPage] Error status:', err?.response?.status);
        console.error('[TeamPage] Error headers:', err?.response?.headers);
        
        const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to create team member';
        enqueueSnackbar(serverMsg, { variant: 'error' });
      } else {
        // Firestore error
        const errorMsg = err?.message || 'Failed to create team member';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
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
      
      // Check if we're in webonly mode
      if (isWebOnlyHost) {
        console.log('[TeamPage] Web-only mode detected - updating password in Firestore...');
        
        // Import Firebase services
        const { db } = await import('../../services/firebase');
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        
        // Update password in Firestore
        await updateDoc(doc(db, 'teamMembers', selectedMember.id), {
          temporaryPassword: newPassword,
          updatedAt: serverTimestamp()
        });
      } else {
        // Use API for non-web-only mode
        if (!orgId) {
          enqueueSnackbar('Organization context not found.', { variant: 'error' });
          return;
        }
        await api.put(endpoints.organizations.setMemberPassword(orgId, selectedMember.id), { password: newPassword });
      }
      
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
      
      // Check if we're in webonly mode
      if (isWebOnlyHost) {
        console.log('[TeamPage] Web-only mode detected - updating team member in Firestore...');
        
        // Import Firebase services
        const { db } = await import('../../services/firebase');
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        
        // Update team member in Firestore
        await updateDoc(doc(db, 'teamMembers', selectedMember.id), {
          email: editForm.email,
          role: roleMap[editForm.role],
          status: statusMap[editForm.status],
          updatedAt: serverTimestamp()
        });
        
        // If password provided, update it in Firestore
        if (editForm.newPassword && editForm.confirmPassword && editForm.newPassword === editForm.confirmPassword) {
          await updateDoc(doc(db, 'teamMembers', selectedMember.id), {
            temporaryPassword: editForm.newPassword,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Use API for non-web-only mode
        await api.patch(endpoints.organizations.updateMember(orgId, selectedMember.id), {
          email: editForm.email,
          role: roleMap[editForm.role],
          status: statusMap[editForm.status],
        });

        // If password provided, set it
        if (editForm.newPassword && editForm.confirmPassword && editForm.newPassword === editForm.confirmPassword) {
          await api.put(endpoints.organizations.setMemberPassword(orgId, selectedMember.id), { password: editForm.newPassword });
        }
      }

      enqueueSnackbar('Member updated successfully', { variant: 'success' });
      setEditDialogOpen(false);

      // Refresh team data
      await refreshTeamData();
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
      // Check if we're in webonly mode
      if (isWebOnlyHost) {
        console.log('[TeamPage] Web-only mode detected - removing team member in Firestore...');
        
        // Import Firebase services
        const { db } = await import('../../services/firebase');
        const { doc, updateDoc, serverTimestamp, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
        const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
        const { getAuth } = await import('firebase/auth');
        
        // STEP 1: Find and release any licenses assigned to this team member
        console.log(`[TeamPage] Finding licenses assigned to ${memberToDelete.email}...`);
        try {
          // Query for licenses assigned to this email
          const licensesQuery = query(
            collection(db, 'licenses'),
            where('assignedToEmail', '==', memberToDelete.email)
          );
          
          const licensesSnapshot = await getDocs(licensesQuery);
          
          if (!licensesSnapshot.empty) {
            console.log(`[TeamPage] Found ${licensesSnapshot.size} licenses assigned to ${memberToDelete.email}`);
            
            // Unassign each license
            for (const licenseDoc of licensesSnapshot.docs) {
              console.log(`[TeamPage] Unassigning license ${licenseDoc.id} from ${memberToDelete.email}`);
              await firestoreLicenseService.unassignLicense(licenseDoc.id);
            }
            
            console.log(`[TeamPage] Successfully released all licenses for ${memberToDelete.email}`);
            enqueueSnackbar(`Released ${licensesSnapshot.size} licenses from ${memberToDelete.email}`, { variant: 'info' });
          } else {
            console.log(`[TeamPage] No licenses found for ${memberToDelete.email}`);
          }
        } catch (licenseError) {
          console.error('[TeamPage] Error releasing licenses:', licenseError);
          // Continue with member removal even if license release fails
        }
        
        // STEP 2: Mark as REMOVED (soft delete)
        await updateDoc(doc(db, 'teamMembers', memberToDelete.id), {
          status: 'REMOVED',
          updatedAt: serverTimestamp()
        });
        
        // STEP 3: Try to delete the Firebase Auth user (if we have admin privileges)
        try {
          // This will only work if we have admin privileges or are using the Admin SDK
          // In client-side code, this will likely fail due to permission issues
          // But we'll try anyway in case the environment has proper permissions
          console.log(`[TeamPage] Attempting to delete Firebase Auth user for ${memberToDelete.email}...`);
          
          // Note: This is unlikely to succeed in client-side code without custom auth claims
          // A server-side function would be more appropriate for this task
          const firebaseAuth = getAuth();
          // This would require admin SDK or special privileges
          // await deleteUser(memberToDelete.id);
          
          // Instead, we'll just log that this should be handled by a backend process
          console.log(`[TeamPage] Firebase Auth user deletion should be handled by a backend process`);
        } catch (authError) {
          console.warn('[TeamPage] Could not delete Firebase Auth user (expected in client code):', authError);
        }
      } else {
        // Use API for non-web-only mode
        await api.post(endpoints.organizations.removeMember(orgId, memberToDelete.id));
      }
      
      enqueueSnackbar(`${memberToDelete.email} removed from team`, { variant: 'warning' });
      
      // Refresh team data
      await refreshTeamData();
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
            // In web-only mode, always enable the button since we use licenses directly
            disabled={isWebOnlyHost ? false : stats.availableSeats <= 0}
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
          {/* Debug button for testing license service */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  console.log('🔍 [TeamPage] Debug: Testing license service...');
                  const { firestoreLicenseService } = await import('../../services/FirestoreLicenseService');
                  
                  if (orgId) {
                    console.log('🔍 [TeamPage] Debug: Testing with org ID:', orgId);
                    const unassigned = await firestoreLicenseService.getUnassignedLicenses(orgId);
                    const orgLicenses = await firestoreLicenseService.getOrganizationLicenses(orgId);
                    const allAccessible = await firestoreLicenseService.getAllAccessibleLicenses();
                    
                    console.log('📊 [TeamPage] Debug Results:');
                    console.log('  - Unassigned licenses:', unassigned.length);
                    console.log('  - Organization licenses:', orgLicenses.length);
                    console.log('  - All accessible licenses:', allAccessible.length);
                    console.log('  - Unassigned details:', unassigned);
                    console.log('  - Org licenses details:', orgLicenses);
                  } else {
                    console.log('❌ [TeamPage] Debug: No org ID available');
                  }
                } catch (error) {
                  console.error('❌ [TeamPage] Debug: License service test failed:', error);
                }
              }}
              sx={{ ml: 2 }}
            >
              Debug Licenses
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
        <form onSubmit={(e) => { e.preventDefault(); handleInviteMember(); }}>
          <DialogTitle>Create New Team Member</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create a new team member account with automatic Firebase Authentication setup. 
              You can set a custom password or leave it blank to auto-generate one. The member will receive a welcome email with their login credentials.
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {stats.availableSeats <= 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    No available licenses. Please check your organization's licenses to add more team members.
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Password Setup:</strong> You can either set a custom password for the team member or leave it blank to auto-generate a secure temporary password.
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password (Optional)"
                  type={showInvitePassword ? 'text' : 'password'}
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                  helperText="Leave blank to auto-generate a secure password"
                  inputProps={{ autoComplete: 'new-password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowInvitePassword(!showInvitePassword)} 
                          edge="end" 
                          aria-label="toggle password visibility"
                        >
                          {showInvitePassword ? <VisibilityOff /> : <Visibility />}
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
                  type={showInviteConfirmPassword ? 'text' : 'password'}
                  value={inviteForm.confirmPassword}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={!inviteForm.password}
                  helperText={inviteForm.password ? "Must match the password above" : "Enter a password first"}
                  inputProps={{ autoComplete: 'new-password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowInviteConfirmPassword(!showInviteConfirmPassword)} 
                          edge="end" 
                          aria-label="toggle confirm password visibility"
                          disabled={!inviteForm.password}
                        >
                          {showInviteConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
            <Button onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || (!isWebOnlyHost && stats.availableSeats <= 0)}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                color: '#000',
                fontWeight: 600,
              }}
            >
              Create Team Member
            </Button>
          </DialogActions>
        </form>
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
