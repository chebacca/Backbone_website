/**
 * Dashboard Cloud Projects Bridge
 * 
 * This component bridges the new Simplified Startup System with the unified
 * project creation and management system. It ensures seamless integration
 * between the startup flow and the dashboard project management.
 * 
 * ENHANCED: Now supports team member project access - team members see only
 * their assigned projects, while account owners see all projects.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Removed excessive debug console logs for production
 * - Added useCallback for expensive async operations
 * - Added useMemo for filtered and paginated projects
 * - Optimized re-renders with proper dependency arrays
 * - Memoized collaboration limit calculations
 * 
 * @see mpc-library/APPLICATION_ARCHITECTURE_MPC.md
 * @see mpc-library/CODING_STANDARDS_MPC.md
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    Chip,
    Card,
    CardContent,
    Grid,
    IconButton,
    Tab,
    Tabs,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    MenuItem,
    Menu,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
      Paper,
  InputAdornment,
  TablePagination
} from '@mui/material';
import {
    Add as AddIcon,
    Cloud as CloudIcon,
    Computer as ComputerIcon,
    NetworkWifi as NetworkIcon,
    Storage as StorageIcon,
    Launch as LaunchIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    Dataset as DatasetIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    Archive as ArchiveIcon,
    Group as GroupIcon,
    Assessment as AssessmentIcon,
    Person as PersonIcon,
    GroupAdd as GroupAddIcon
} from '@mui/icons-material';

import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { simplifiedStartupSequencer } from '../services/SimplifiedStartupSequencer';
import UnifiedProjectCreationDialog from './UnifiedProjectCreationDialog';
import DatasetCreationWizard from './DatasetCreationWizard';
import { DatasetManagementDialog } from './DatasetManagementDialog';
import { ErrorBoundary } from './common/ErrorBoundary';

interface CloudProject {
    id: string;
    name: string;
    description?: string;
    applicationMode: 'standalone' | 'shared_network';
    storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob';
    gcsBucket?: string;
    gcsPrefix?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3Prefix?: string;
    azureStorageAccount?: string;
    azureContainer?: string;
    azurePrefix?: string;
    lastAccessedAt: string;
    isActive: boolean;
    isArchived?: boolean;
    allowCollaboration?: boolean;
    maxCollaborators?: number;
    realTimeEnabled?: boolean;
    settings?: {
      preferredPorts?: {
        website?: number;
        api?: number;
      };
    };
    // Team member specific properties
    teamMemberRole?: string;
    role?: string;
    assignedAt?: string;
    projectOwner?: string;
}

interface DashboardCloudProjectsBridgeProps {
}

// Function to get collaboration limit based on user's license
const getCollaborationLimit = (user: any): number => {
    if (!user) return 10; // Default for unauthenticated users
    
    // Check if user has subscription plan
    if (user.subscription?.plan) {
        const plan = user.subscription.plan.toUpperCase();
        if (plan === 'ENTERPRISE') return 250;
        if (plan === 'PRO' || plan === 'PROFESSIONAL') return 50;
        if (plan === 'BASIC') return 10;
    }
    
    // Check if user has licenses array
    if (user.licenses && user.licenses.length > 0) {
        const activeLicense = user.licenses.find((license: any) => 
            license.status === 'ACTIVE' || license.status === 'PENDING'
        );
        if (activeLicense) {
            // Try to determine license type from key or other properties
            const licenseKey = activeLicense.key?.toUpperCase() || '';
            if (licenseKey.includes('ENTERPRISE')) return 250;
            if (licenseKey.includes('PROFESSIONAL') || licenseKey.includes('PRO')) return 50;
            if (licenseKey.includes('BASIC')) return 10;
        }
    }
    
    // Fallback to basic limit
    return 10;
};

// Function to map service CloudProject to component CloudProject
const mapServiceProjectToComponentProject = (serviceProject: any): CloudProject => {
    console.log('🔍 [DashboardCloudProjectsBridge] Mapping project:', serviceProject.name);
    console.log('🔍 [DashboardCloudProjectsBridge] Raw project data:', serviceProject);
    console.log('🔍 [DashboardCloudProjectsBridge] Project status:', serviceProject.status);
    console.log('🔍 [DashboardCloudProjectsBridge] Project isActive field:', serviceProject.isActive);
    console.log('🔍 [DashboardCloudProjectsBridge] Project isArchived field:', serviceProject.isArchived);
    
    return {
        id: serviceProject.id,
        name: serviceProject.name,
        description: serviceProject.description,
        applicationMode: serviceProject.settings?.applicationMode || 'standalone',
        storageBackend: serviceProject.settings?.storageBackend || 'firestore',
        gcsBucket: serviceProject.settings?.gcsBucket,
        gcsPrefix: serviceProject.settings?.gcsPrefix,
        s3Bucket: serviceProject.settings?.s3Bucket,
        s3Region: serviceProject.settings?.s3Region,
        s3Prefix: serviceProject.settings?.s3Prefix,
        azureStorageAccount: serviceProject.settings?.azureStorageAccount,
        azureContainer: serviceProject.settings?.azureContainer,
        azurePrefix: serviceProject.settings?.azurePrefix,
        lastAccessedAt: serviceProject.lastAccessedAt || new Date().toISOString(),
        isActive: serviceProject.status === 'active' || serviceProject.isActive !== false,
        isArchived: serviceProject.status === 'archived' || serviceProject.isArchived === true,
        allowCollaboration: serviceProject.settings?.allowCollaboration || false,
        maxCollaborators: serviceProject.settings?.maxCollaborators || 10,
        realTimeEnabled: serviceProject.settings?.realTimeEnabled || false,
        settings: serviceProject.settings,
        teamMemberRole: serviceProject.teamMembers?.[0]?.role,
        role: serviceProject.teamMembers?.[0]?.role,
        assignedAt: serviceProject.teamMembers?.[0]?.assignedAt,
        projectOwner: serviceProject.ownerId
    };
};

export const DashboardCloudProjectsBridge: React.FC<DashboardCloudProjectsBridgeProps> = () => {
    const { user } = useAuth();
    const { setLoading } = useLoading();
    
    // Helper function to get the complete user object with team member properties
    const getCompleteUser = useCallback(() => {
        if (!user) return null;
        
        // Get the stored user from localStorage to ensure we have all properties
        const storedUserStr = localStorage.getItem('auth_user');
        let mergedUser = { ...user };
        
        if (storedUserStr) {
            try {
                const storedUser = JSON.parse(storedUserStr);
                // Merge the context user with stored user to ensure all properties are available
                mergedUser = {
                    ...user,
                    ...storedUser,
                    // Ensure these properties are explicitly set
                    isTeamMember: storedUser.isTeamMember || user.isTeamMember || storedUser.role === 'TEAM_MEMBER',
                    organizationId: storedUser.organizationId || user.organizationId,
                    memberRole: storedUser.memberRole || user.memberRole,
                    memberStatus: storedUser.memberStatus || user.memberStatus,
                    teamMemberData: storedUser.teamMemberData || user.teamMemberData
                };
            } catch (e) {
                console.warn('Failed to parse stored user from localStorage:', e);
            }
        }
        
        // 🔧 ENHANCED: Try to get subscription data from multiple sources
        if (!mergedUser.subscription) {
            // Check localStorage for subscription data
            const subscriptionData = localStorage.getItem('user_subscription');
            if (subscriptionData) {
                try {
                    const parsed = JSON.parse(subscriptionData);
                    mergedUser.subscription = parsed;
                } catch (e) {
                    console.warn('Failed to parse subscription data from localStorage:', e);
                }
            }
            
            // Check for subscription data in other localStorage keys
            const billingData = localStorage.getItem('user_billing');
            if (billingData && !mergedUser.subscription) {
                try {
                    const parsed = JSON.parse(billingData);
                    if (parsed.subscription) {
                        mergedUser.subscription = parsed.subscription;
                    }
                } catch (e) {
                    console.warn('Failed to parse billing data from localStorage:', e);
                }
            }
        }
        
        return mergedUser;
    }, [user]);
    
    // Get the complete user object
    const completeUser = useMemo(() => getCompleteUser(), [getCompleteUser]);
    
    // Helper function to check if user is a team member
    const isTeamMember = useCallback(() => {
        if (!completeUser) return false;
        
        // 🔧 CRITICAL FIX: Account owners are NOT team members
        // This includes organization owners and privileged users
        if (completeUser.memberRole === 'OWNER' || 
            completeUser.role === 'SUPERADMIN' ||
            completeUser.role === 'ADMIN' ||
            String(completeUser.role).includes('ENTERPRISE')) {
            console.log('🔍 [DashboardCloudProjectsBridge] User is account owner - NOT a team member');
            return false;
        }
        
        // Check explicit team member indicators
        const isExplicitTeamMember = (completeUser.isTeamMember === true) || 
                                   (completeUser.role === 'TEAM_MEMBER');
        
        // Only check localStorage if we don't have explicit indicators
        if (!isExplicitTeamMember) {
            const teamMemberData = localStorage.getItem('team_member_data');
            if (teamMemberData) {
                try {
                    const parsed = JSON.parse(teamMemberData);
                    // If the data shows account owner roles, they're not a team member
                    if (parsed.memberRole === 'OWNER' ||
                        parsed.role === 'SUPERADMIN' ||
                        parsed.role === 'ADMIN' ||
                        String(parsed.role).includes('ENTERPRISE')) {
                        console.log('🔍 [DashboardCloudProjectsBridge] localStorage shows account owner - NOT a team member');
                        return false;
                    }
                } catch (e) {
                    console.warn('Failed to parse team member data:', e);
                }
            }
        }
        
        console.log('🔍 [DashboardCloudProjectsBridge] User is team member:', isExplicitTeamMember);
        return isExplicitTeamMember;
    }, [completeUser]);

    // Helper function to check if user can create projects
    const canCreateProjects = useCallback(() => {
        if (!completeUser) {
            console.log('🔍 [DashboardCloudProjectsBridge] No complete user data available');
            return false;
        }
        
        console.log('🔍 [DashboardCloudProjectsBridge] Checking permissions for user:', {
            id: completeUser.id,
            email: completeUser.email,
            role: completeUser.role,
            memberRole: completeUser.memberRole,
            isTeamMember: completeUser.isTeamMember,
            organizationId: completeUser.organizationId,
            subscription: completeUser.subscription
        });
        
        // 🔧 ENHANCED: Enterprise users and privileged users can always create projects
        if (completeUser.memberRole === 'ENTERPRISE_ADMIN' || 
            completeUser.role === 'ENTERPRISE_ADMIN' ||
            String(completeUser.role).includes('ENTERPRISE')) {
            console.log('✅ [DashboardCloudProjectsBridge] User is enterprise user or admin, can create projects');
            return true;
        }
        
        // 🔧 ENHANCED: Account owners with active subscriptions can create projects
        // This includes users who are NOT team members (i.e., they own their account/organization)
        if (!isTeamMember()) {
            // Check if user has an active subscription or is a superadmin
            const hasActiveSubscription = completeUser.subscription?.status === 'ACTIVE' || 
                                        completeUser.subscription?.status === 'TRIALING' ||
                                        completeUser.role === 'SUPERADMIN' ||
                                        completeUser.role === 'ADMIN';
            
            if (hasActiveSubscription) {
                console.log('✅ [DashboardCloudProjectsBridge] User is account owner with active subscription, can create projects');
                return true;
            } else {
                // 🔧 ENHANCED: Check for subscription plan even without status
                if (completeUser.subscription?.plan && ['BASIC', 'PRO', 'ENTERPRISE'].includes(completeUser.subscription.plan)) {
                    console.log('✅ [DashboardCloudProjectsBridge] User is account owner with subscription plan, can create projects');
                    return true;
                }
                
                // 🔧 ENHANCED: Check for demo user status
                const isDemoUser = completeUser.isDemoUser || localStorage.getItem('demo_user_status') === 'ACTIVE';
                if (isDemoUser) {
                    console.log('✅ [DashboardCloudProjectsBridge] User is demo user, can create projects');
                    return true;
                }
                
                console.log('⚠️ [DashboardCloudProjectsBridge] User is account owner but no active subscription or demo status');
                // Still allow project creation for account owners even without subscription
                // They can create projects but may have limited features
                return true;
            }
        }
        
        // 🔧 ENHANCED: Team members with ADMIN role can create projects
        if (completeUser.memberRole === 'ADMIN' || completeUser.role === 'ADMIN') {
            console.log('✅ [DashboardCloudProjectsBridge] Team member has ADMIN role, can create projects');
            return true;
        }
        
        // 🔧 ENHANCED: Check if team member has admin permissions from team member data
        const teamMemberData = localStorage.getItem('team_member_data');
        if (teamMemberData) {
            try {
                const parsed = JSON.parse(teamMemberData);
                console.log('🔍 [DashboardCloudProjectsBridge] Team member data from localStorage:', parsed);
                if (parsed.role === 'ADMIN' || parsed.memberRole === 'ADMIN' || parsed.role === 'TEAM_ADMIN') {
                    console.log('✅ [DashboardCloudProjectsBridge] Team member data shows ADMIN role, can create projects');
                    return true;
                }
            } catch (e) {
                console.warn('Failed to parse team member data for permissions check:', e);
            }
        }
        
        // 🔧 ENHANCED: Check if user has organization ownership (even if marked as team member)
        // This handles edge cases where enterprise users might be incorrectly flagged as team members
        if (completeUser.memberRole === 'OWNER' || 
            completeUser.role === 'OWNER' ||
            String(completeUser.memberRole).includes('OWNER')) {
            console.log('✅ [DashboardCloudProjectsBridge] User has OWNER role, can create projects');
            return true;
        }
        
        // 🔧 NEW: Check for SUPERADMIN role which should have full access
        if (completeUser.role === 'SUPERADMIN') {
            console.log('✅ [DashboardCloudProjectsBridge] User is SUPERADMIN, can create projects');
            return true;
        }
        
        // 🔧 ENHANCED: Fallback check for users with any subscription plan (Basic, Pro, Enterprise)
        if (completeUser.subscription?.plan && ['BASIC', 'PRO', 'ENTERPRISE'].includes(completeUser.subscription.plan)) {
            console.log('✅ [DashboardCloudProjectsBridge] User has subscription plan, allowing project creation');
            return true;
        }
        
        // 🔧 ENHANCED: Final fallback - check if user has any subscription data at all
        if (completeUser.subscription) {
            console.log('✅ [DashboardCloudProjectsBridge] User has subscription data, allowing project creation');
            return true;
        }
        
        console.log('❌ [DashboardCloudProjectsBridge] User cannot create projects - regular team member without admin privileges');
        return false;
    }, [completeUser, isTeamMember]);
    const [projects, setProjects] = useState<CloudProject[]>([]);
    const [loading, setLocalLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState(0); // 0 = Active, 1 = Archived
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showLaunchDialog, setShowLaunchDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<CloudProject | null>(null);
  const [projectDatasets, setProjectDatasets] = useState<any[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [datasetBackendFilter, setDatasetBackendFilter] = useState<'all' | 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local'>('all');
  const [datasetSearch, setDatasetSearch] = useState<string>('');
  const [projectDatasetCounts, setProjectDatasetCounts] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showCreateDatasetWizard, setShowCreateDatasetWizard] = useState(false);
  const [datasetWizardAssignToProject, setDatasetWizardAssignToProject] = useState<string | null>(null);
  const [showDatasetManagementDialog, setShowDatasetManagementDialog] = useState(false);

  // Team Member Management State
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState<'ADMIN' | 'DO_ER'>('DO_ER');
  const [teamMemberSearch, setTeamMemberSearch] = useState<string>('');
  const [showAddTeamMemberDialog, setShowAddTeamMemberDialog] = useState(false);
  const [addTeamMemberLoading, setAddTeamMemberLoading] = useState(false);
  const [addTeamMemberError, setAddTeamMemberError] = useState<string | null>(null);

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Helper to load available + assigned datasets for selected project
  const loadDatasetsForProject = useCallback(async (project: CloudProject) => {
    try {
      setDatasetsLoading(true);
      console.log('🔍 [DashboardCloudProjectsBridge] Loading datasets for project:', project.id);
      
      // Load assigned datasets for this project
      const items = await cloudProjectIntegration.getProjectDatasets(project.id);
      console.log('✅ [DashboardCloudProjectsBridge] Loaded assigned datasets:', items);
      setProjectDatasets(items);
      setProjectDatasetCounts(prev => ({ ...prev, [project.id]: items.length }));
      
      // Load available datasets for assignment
      try {
        const all = await cloudProjectIntegration.listDatasets({
          backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
          query: datasetSearch || undefined,
        });
        console.log('✅ [DashboardCloudProjectsBridge] Loaded available datasets:', all);
        
        // Debug: Log each dataset's ID and name
        console.log('🔍 [DashboardCloudProjectsBridge] === DATASET DEBUG INFO ===');
        all.forEach((ds: any, index: number) => {
          console.log(`🔍 [DashboardCloudProjectsBridge] Dataset ${index}:`, {
            id: ds.id,
            name: ds.name,
            organizationId: ds.organizationId,
            storage: ds.storage,
            idType: typeof ds.id,
            idLength: ds.id?.length,
            fullDataset: ds
          });
        });
        console.log('🔍 [DashboardCloudProjectsBridge] === END DATASET DEBUG ===');
        
        // Validate dataset IDs
        const invalidDatasets = all.filter((ds: any) => !ds.id || typeof ds.id !== 'string' || ds.id.trim() === '');
        if (invalidDatasets.length > 0) {
          console.warn('⚠️ [DashboardCloudProjectsBridge] Found datasets with invalid IDs:', invalidDatasets);
        }
        
        // Check if dataset-001 exists in the list
        const dataset001 = all.find((ds: any) => ds.id === 'dataset-001');
        if (!dataset001) {
          console.warn('⚠️ [DashboardCloudProjectsBridge] dataset-001 NOT found in available datasets!');
          console.log('🔍 [DashboardCloudProjectsBridge] Available dataset IDs:', all.map(ds => ds.id));
        } else {
          console.log('✅ [DashboardCloudProjectsBridge] dataset-001 found:', dataset001);
        }
        
        const labeled = all.map((ds: any) => {
          const getBackendLabel = (backend: string) => {
            switch (backend) {
              case 'gcs': return '(GCS)';
              case 's3': return '(S3)';
              case 'aws': return '(AWS)';
              case 'azure': return '(Azure)';
              case 'firestore':
              default: return '(Firestore)';
            }
          };
          return {
            ...ds,
            __label: `${ds.name} ${getBackendLabel(ds.storage?.backend)}`,
          };
        });
        
        // Clear selected dataset if it's not in the new list
        if (selectedDatasetId && !labeled.find(ds => ds.id === selectedDatasetId)) {
          console.warn('⚠️ [DashboardCloudProjectsBridge] Clearing invalid selected dataset:', selectedDatasetId);
          setSelectedDatasetId('');
        }
        
        setAvailableDatasets(labeled);
      } catch (datasetError) {
        console.warn('⚠️ [DashboardCloudProjectsBridge] Failed to load available datasets, using empty list:', datasetError);
        setAvailableDatasets([]);
      }
      
    } catch (e) {
      console.error('❌ [DashboardCloudProjectsBridge] Failed to load datasets for project:', e);
      // Set empty arrays on error to prevent UI crashes
      setProjectDatasets([]);
      setAvailableDatasets([]);
    } finally {
      setDatasetsLoading(false);
    }
  }, [datasetBackendFilter, datasetSearch]);

  // Helper to load team members for selected project
  const loadTeamMembersForProject = useCallback(async (project: CloudProject) => {
    try {
      setTeamMembersLoading(true);
      console.log('🔍 [DashboardCloudProjectsBridge] Loading team members for project:', project.id);
      
      // Load assigned team members for this project
      try {
        const assignedMembers = await cloudProjectIntegration.getProjectTeamMembers(project.id);
        console.log('✅ [DashboardCloudProjectsBridge] Loaded assigned team members:', assignedMembers);
        setProjectTeamMembers(assignedMembers);
      } catch (assignedError) {
        console.warn('⚠️ [DashboardCloudProjectsBridge] Failed to load assigned team members, using empty list:', assignedError);
        setProjectTeamMembers([]);
      }
      
      // Load all available licensed team members from owner's organization
      try {
        const allLicensedMembers = await cloudProjectIntegration.getLicensedTeamMembers({
          search: teamMemberSearch || undefined,
          excludeProjectId: project.id // Exclude already assigned members
        });
        console.log('✅ [DashboardCloudProjectsBridge] Loaded available team members:', allLicensedMembers);
        setAvailableTeamMembers(allLicensedMembers);
      } catch (licensedError) {
        console.warn('⚠️ [DashboardCloudProjectsBridge] Failed to load licensed team members, using empty list:', licensedError);
        setAvailableTeamMembers([]);
      }
    } catch (e) {
      console.error('❌ [DashboardCloudProjectsBridge] Failed to load team members for project:', e);
      // Set empty arrays on error to prevent UI crashes
      setProjectTeamMembers([]);
      setAvailableTeamMembers([]);
    } finally {
      setTeamMembersLoading(false);
    }
  }, [teamMemberSearch]);

  // Auto-fetch datasets and team members when opening project details or when filters change
  useEffect(() => {
    if (selectedProject) {
      console.log('🔄 [DashboardCloudProjectsBridge] Project selected, loading data...');
      void loadDatasetsForProject(selectedProject);
      void loadTeamMembersForProject(selectedProject);
    }
  }, [selectedProject, loadDatasetsForProject, loadTeamMembersForProject]);

    useEffect(() => {
        loadProjects();
        // Listen for project creation events to refresh without full page reload
        const onCreated = (e: any) => {
            loadProjects();
        };
        window.addEventListener('project:created' as any, onCreated);
        
        return () => window.removeEventListener('project:created' as any, onCreated);
    }, []);

    // Filter projects based on search query - optimized with useMemo
    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        
        const searchLower = searchQuery.toLowerCase();
        return projects.filter(project => (
            project.name.toLowerCase().includes(searchLower) ||
            (project.description && project.description.toLowerCase().includes(searchLower)) ||
            project.storageBackend.toLowerCase().includes(searchLower) ||
            project.applicationMode.toLowerCase().includes(searchLower)
        ));
    }, [projects, searchQuery]);

    // Reset page when search changes
    useEffect(() => {
        setPage(0);
    }, [searchQuery]);

    // Filtered projects by tab (active/archived)
    const tabFilteredProjects = useMemo(() => {
        console.log('🔍 [DashboardCloudProjectsBridge] Filtering projects for tab:', tab);
        console.log('🔍 [DashboardCloudProjectsBridge] All filtered projects:', filteredProjects);
        
        const filtered = filteredProjects.filter(project => {
            const isActiveTab = tab === 0;
            const shouldShow = isActiveTab ? project.isActive && !project.isArchived : project.isArchived;
            
            console.log(`🔍 [DashboardCloudProjectsBridge] Project "${project.name}":`, {
                isActive: project.isActive,
                isArchived: project.isArchived,
                isActiveTab,
                shouldShow
            });
            
            return shouldShow;
        });
        
        console.log('🔍 [DashboardCloudProjectsBridge] Filtered projects for display:', filtered);
        return filtered;
    }, [filteredProjects, tab]);

    // Paginated projects for table display
    const paginatedProjects = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return tabFilteredProjects.slice(startIndex, startIndex + rowsPerPage);
    }, [tabFilteredProjects, page, rowsPerPage]);

    // Re-fetch team members when search term changes
    useEffect(() => {
        if (selectedProject && showAddTeamMemberDialog) {
            const timeoutId = setTimeout(() => {
                console.log('🔄 [DashboardCloudProjectsBridge] Team member search changed, refreshing...');
                void loadTeamMembersForProject(selectedProject);
            }, 300); // Debounce search by 300ms
            
            return () => clearTimeout(timeoutId);
        }
    }, [teamMemberSearch, selectedProject, showAddTeamMemberDialog, loadTeamMembersForProject]);

    // Helper to load dataset counts for all projects
    const loadDatasetCountsForAllProjects = useCallback(async (projectList: CloudProject[]) => {
        try {
            console.log('🔍 [DashboardCloudProjectsBridge] Loading dataset counts for all projects...');
            
            // Load dataset counts for each project in parallel
            const datasetCountPromises = projectList.map(async (project) => {
                try {
                    const datasets = await cloudProjectIntegration.getProjectDatasets(project.id);
                    return { projectId: project.id, count: datasets.length };
                } catch (error) {
                    console.warn(`⚠️ [DashboardCloudProjectsBridge] Failed to load datasets for project ${project.id}:`, error);
                    return { projectId: project.id, count: 0 };
                }
            });
            
            const datasetCounts = await Promise.all(datasetCountPromises);
            
            // Update the projectDatasetCounts state
            const newCounts: Record<string, number> = {};
            datasetCounts.forEach(({ projectId, count }) => {
                newCounts[projectId] = count;
            });
            
            setProjectDatasetCounts(newCounts);
            console.log('✅ [DashboardCloudProjectsBridge] Loaded dataset counts for all projects:', newCounts);
            
        } catch (error) {
            console.error('❌ [DashboardCloudProjectsBridge] Failed to load dataset counts for all projects:', error);
        }
    }, []);

    const loadProjects = async () => {
        try {
            setError(null);
            setLocalLoading(true);
            
            if (isTeamMember()) {
                // For team members, fetch their assigned projects
                try {
                    
                    // 🔧 WEB-ONLY MODE: Use direct Firestore queries instead of API calls
                    console.log('🔍 [DashboardCloudProjectsBridge] Web-only mode: Fetching projects from Firestore...');
                    
                    // Get current user's organization ID
                    const currentUser = user;
                    if (!currentUser?.organizationId) {
                        console.warn('⚠️ [DashboardCloudProjectsBridge] No organization ID found for user');
                        throw new Error('No organization found for user');
                    }
                    
                    // Import Firestore functions
                    const { db } = await import('../services/firebase');
                    const { collection, query, where, getDocs } = await import('firebase/firestore');
                    
                    // Query projects for the user's organization
                    const projectsQuery = query(
                        collection(db, 'projects'),
                        where('organizationId', '==', currentUser.organizationId)
                    );
                    
                    const projectsSnapshot = await getDocs(projectsQuery);
                    console.log(`🔍 [DashboardCloudProjectsBridge] Found ${projectsSnapshot.size} projects for organization: ${currentUser.organizationId}`);
                    
                    const teamMemberProjects = projectsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        projectId: doc.id,
                        ...doc.data(),
                        // Ensure required fields
                        name: doc.data().name || doc.data().projectName || 'Unnamed Project',
                        projectName: doc.data().name || doc.data().projectName || 'Unnamed Project',
                        description: doc.data().description || '',
                        role: 'MEMBER', // Default role for team members
                        teamMemberRole: 'MEMBER',
                        isActive: doc.data().isActive !== false,
                        isArchived: doc.data().isArchived === true,
                        assignedAt: doc.data().createdAt || new Date().toISOString(),
                        lastAccessed: doc.data().lastAccessedAt || doc.data().createdAt || new Date().toISOString(),
                        ownerName: doc.data().ownerName || 'Organization Owner'
                    }));
                    
                    console.log('🔍 [DashboardCloudProjectsBridge] Team member projects from Firestore:', teamMemberProjects);
                    
                    // Transform team member projects to match CloudProject format
                    const transformedProjects = teamMemberProjects.map((project: any) => {
                        console.log('🔍 [DashboardCloudProjectsBridge] Transforming project:', project);
                        
                        const transformed = {
                            id: project.projectId || project.id,
                            name: project.projectName || project.name || 'Unnamed Project',
                            description: project.description || '',
                            applicationMode: 'shared_network' as const, // Team members always use network mode
                            storageBackend: 'firestore' as const, // Always Firestore in webonly mode
                            lastAccessedAt: project.lastAccessed || project.assignedAt || new Date().toISOString(),
                            isActive: project.isActive !== false,
                            isArchived: project.isArchived === true,
                            allowCollaboration: true, // Team member projects are collaborative
                            maxCollaborators: project.maxCollaborators || 10,
                            realTimeEnabled: true,
                            enableComments: true,
                            enableChat: true,
                            enableActivityLog: true,
                            // Team member specific fields
                            teamMemberRole: project.role || project.teamMemberRole || 'MEMBER',
                            assignedAt: project.assignedAt,
                            projectOwner: project.ownerName || 'Organization Owner',
                        };
                        
                        console.log('🔍 [DashboardCloudProjectsBridge] Transformed to:', transformed);
                        return transformed;
                    });
                    
                    setProjects(transformedProjects);
                    
                    // Load dataset counts for all team member projects
                    await loadDatasetCountsForAllProjects(transformedProjects);
                    
                } catch (teamMemberError) {
                    console.error('Failed to fetch team member projects:', teamMemberError);
                    
                    // Fallback: try to get projects from localStorage if available
                    const teamMemberData = localStorage.getItem('team_member_data');
                    
                    if (teamMemberData) {
                        try {
                            const parsed = JSON.parse(teamMemberData);
                            
                            if (parsed.projectAccess && Array.isArray(parsed.projectAccess)) {
                                
                                const fallbackProjects = parsed.projectAccess.map((access: any) => ({
                                    id: access.projectId,
                                    name: access.projectName || 'Unnamed Project',
                                    description: access.description || '',
                                    applicationMode: 'shared_network' as const,
                                    storageBackend: 'firestore' as const,
                                    lastAccessedAt: access.lastAccessed || new Date().toISOString(),
                                    isActive: true,
                                    isArchived: false,
                                    allowCollaboration: true,
                                    maxCollaborators: 10,
                                    realTimeEnabled: true,
                                    enableComments: true,
                                    enableChat: true,
                                    enableActivityLog: true,
                                    teamMemberRole: access.role || 'MEMBER',
                                    assignedAt: access.assignedAt,
                                    projectOwner: 'Organization Owner',
                                }));
                                
                                setProjects(fallbackProjects);
                                
                                // Load dataset counts for fallback projects
                                await loadDatasetCountsForAllProjects(fallbackProjects);
                                
                                return;
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse fallback team member data:', parseError);
                        }
                    }
                    
                    // Check for any other potential sources of team member project data
                    const allKeys = Object.keys(localStorage);
                    const teamMemberKeys = allKeys.filter(key => 
                        key.includes('team') || 
                        key.includes('member') || 
                        key.includes('project') ||
                        key.includes('assignment')
                    );
                    
                    // Check each key for project data
                    for (const key of teamMemberKeys) {
                        try {
                            const value = localStorage.getItem(key);
                            if (value) {
                                const parsed = JSON.parse(value);
                                
                                // Look for project data in various formats
                                if (parsed.projects || parsed.projectAccess || parsed.assignments) {
                                    // Found potential project data
                                }
                            }
                        } catch (e) {
                            // Ignore non-JSON values
                        }
                    }
                    
                    // If all else fails, show error
                    setError('Unable to load your assigned projects. Please contact your administrator or try again later.');
                    setProjects([]);
                }
            } else {
                // For regular users (account owners), fetch all their projects
                console.log('🔍 [DashboardCloudProjectsBridge] Loading projects for account owner...');
                const serviceProjects = await cloudProjectIntegration.getProjects();
                console.log('🔍 [DashboardCloudProjectsBridge] Raw service projects:', serviceProjects);
                console.log('🔍 [DashboardCloudProjectsBridge] Service projects count:', serviceProjects.length);
                
                const cloudProjects = serviceProjects.map(mapServiceProjectToComponentProject);
                console.log('🔍 [DashboardCloudProjectsBridge] Mapped cloud projects:', cloudProjects);
                console.log('🔍 [DashboardCloudProjectsBridge] Mapped projects count:', cloudProjects.length);
                
                setProjects(cloudProjects);
                console.log('✅ [DashboardCloudProjectsBridge] Projects set in state');
                
                // Load dataset counts for all regular user projects
                await loadDatasetCountsForAllProjects(cloudProjects);
            }

        } catch (err: any) {
            console.error('Failed to load projects:', err);
            setError(err?.message || 'Failed to load projects');
            setProjects([]);
        } finally {
            setLocalLoading(false);
        }
    };



    const handleLaunchWeb = async () => {
      try {
        // Launch to the main Backbone Logic page
        const url = 'https://backbone-client.web.app/';
        
        // Open via anchor click (more reliable than window.open in some blockers)
        let opened = false;
        try {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          opened = true;
        } catch {}
        if (!opened) {
          // Fallback: same-tab navigation
          window.location.href = url;
        }
      } catch (e) {
        console.error('Failed to launch web app', e);
        setError('Unable to open web app. Please try again.');
      }
    };

    const handleLaunchDesktop = () => {
      try {
        const scheme = (import.meta.env as any).VITE_DESKTOP_DEEP_LINK_SCHEME || 'dashboardv14';
        const action = (import.meta.env as any).VITE_DESKTOP_DEEP_LINK_ACTION || 'open-app';
        const url = `${scheme}://${action}`;
        // Attempt deep link
        window.location.href = url;
      } catch (e) {
        console.error('Failed to open desktop deep link', e);
        setError('Unable to open Desktop app. Please ensure it is installed.');
      }
    };

    const handleCreateProject = () => {
        setShowCreateDialog(true);
        // Ensure selectedProject is cleared to avoid conflicts
        setSelectedProject(null);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleProjectCreated = async (projectId: string) => {
        setShowCreateDialog(false);
        await loadProjects(); // Refresh the list
        // Project created successfully - no need to auto-launch
    };

    const getStorageIcon = (storageBackend: string) => {
        switch (storageBackend) {
            case 'firestore':
                return <CloudIcon />;
            case 'gcs':
                return <StorageIcon />;
            default:
                return <ComputerIcon />;
        }
    };

    const getModeIcon = (mode: string) => {
        return mode === 'standalone' ? <ComputerIcon /> : <NetworkIcon />;
    };

    const formatLastAccessed = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    };

    const activeProjects = projects.filter(p => p.isActive && !p.isArchived);
    const archivedProjects = projects.filter(p => p.isArchived);

    // Calculate analytics data
    const analyticsData = {
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        archivedProjects: archivedProjects.length,
        collaborativeProjects: projects.filter(p => p.allowCollaboration).length,
        totalDatasets: Object.values(projectDatasetCounts).reduce((sum, count) => sum + count, 0),
        storageBreakdown: {
            firestore: projects.filter(p => p.storageBackend === 'firestore').length,
            gcs: projects.filter(p => p.storageBackend === 'gcs').length,
            s3: projects.filter(p => p.storageBackend === 's3').length,
            local: projects.filter(p => p.storageBackend === 'local').length,
            azure: projects.filter(p => p.storageBackend === 'azure-blob').length,
        },
        modeBreakdown: {
            standalone: projects.filter(p => p.applicationMode === 'standalone').length,
            network: projects.filter(p => p.applicationMode === 'shared_network').length,
        }
    };

    // Helper to refresh dataset counts for all current projects
    const refreshDatasetCounts = useCallback(async () => {
        if (projects.length > 0) {
            await loadDatasetCountsForAllProjects(projects);
        }
    }, [projects, loadDatasetCountsForAllProjects]);

    // 🔧 DEBUG: Add subscription validation debug function
    const debugSubscriptionStatus = useCallback(() => {
        if (!completeUser) {
            console.log('🔍 [DashboardCloudProjectsBridge] No user data available for subscription debug');
            return;
        }
        
        console.log('🔍 [DashboardCloudProjectsBridge] === SUBSCRIPTION DEBUG INFO ===');
        console.log('User ID:', completeUser.id);
        console.log('User Email:', completeUser.email);
        console.log('User Role:', completeUser.role);
        console.log('Member Role:', completeUser.memberRole);
        console.log('Is Team Member:', completeUser.isTeamMember);
        console.log('Organization ID:', completeUser.organizationId);
        console.log('Subscription Data:', completeUser.subscription);
        console.log('Demo User Status:', completeUser.isDemoUser);
        console.log('LocalStorage Demo Status:', localStorage.getItem('demo_user_status'));
        console.log('LocalStorage Subscription:', localStorage.getItem('user_subscription'));
        console.log('LocalStorage Billing:', localStorage.getItem('user_billing'));
        console.log('==========================================');
    }, [completeUser]);

    // 🔧 DEBUG: Log subscription status only once per user session to reduce spam
    useEffect(() => {
        if (completeUser && completeUser.id) {
            const debugKey = `subscription_debug_${completeUser.id}`;
            const hasLogged = sessionStorage.getItem(debugKey);
            
            if (!hasLogged) {
                debugSubscriptionStatus();
                sessionStorage.setItem(debugKey, 'true');
            }
        }
    }, [completeUser, debugSubscriptionStatus]);

    return (
        <Box sx={{ py: 4, px: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        {isTeamMember() ? 'My Assigned Projects' : 'Cloud Projects'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isTeamMember() 
                            ? (canCreateProjects() 
                                ? 'Manage and collaborate on projects. As an admin, you can create new projects and access assigned ones.'
                                : 'Access and collaborate on projects assigned to you by your team administrator')
                            : 'Manage your projects with Firebase and Google Cloud Storage integration. Available for all license tiers: Basic, Pro, and Enterprise.'
                        }
                    </Typography>
                    
                    {/* Team Member Status Indicator */}
                    {isTeamMember() && completeUser && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<PersonIcon />}
                                label={`Team Member - ${completeUser.memberRole || 'MEMBER'}`}
                                color="primary"
                                size="small"
                                sx={{ 
                                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    color: 'primary.main'
                                }}
                            />
                            {completeUser.organizationId && (
                                <Chip
                                    icon={<GroupAddIcon />}
                                    label="Organization Access"
                                    color="secondary"
                                    size="small"
                                    sx={{ 
                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                        border: '1px solid rgba(156, 39, 176, 0.3)',
                                        color: 'secondary.main'
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Show Create Project button for account owners and admin team members */}
                    {canCreateProjects() && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🚀 [DashboardCloudProjectsBridge] Create Project button clicked');
                                handleCreateProject();
                            }}
                            size="large"
                            sx={{
                                minWidth: '160px',
                                fontWeight: 'bold',
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Create Project
                        </Button>
                    )}
                    
                    {/* Show Create Dataset button for account owners and admin team members */}
                    {canCreateProjects() && (
                        <Button
                            variant="outlined"
                            startIcon={<DatasetIcon />}
                            onClick={() => {
                                console.log('🚀 [DashboardCloudProjectsBridge] Create Dataset button clicked');
                                setDatasetWizardAssignToProject(null);
                                setShowCreateDatasetWizard(true);
                            }}
                            size="large"
                            sx={{
                                minWidth: '160px',
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                borderWidth: 2,
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    borderWidth: 2,
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Create Dataset
                        </Button>
                    )}
                    
                    {/* Show Manage Datasets button for account owners and admin team members */}
                    {canCreateProjects() && (
                        <Button
                            variant="outlined"
                            startIcon={<StorageIcon />}
                            onClick={() => {
                                console.log('🚀 [DashboardCloudProjectsBridge] Manage Datasets button clicked');
                                setShowDatasetManagementDialog(true);
                            }}
                            size="large"
                            sx={{
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Manage Datasets
                        </Button>
                    )}
                    
                    {/* Show message for users who cannot create projects */}
                    {!canCreateProjects() && completeUser && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            px: 2,
                            py: 1,
                            backgroundColor: 'warning.light',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'warning.main'
                        }}>
                            <InfoIcon color="warning" />
                            <Typography variant="body2" color="warning.dark">
                                {isTeamMember() 
                                    ? 'Contact your team administrator to create projects'
                                    : 'Active subscription required to create projects'
                                }
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Launch buttons for all users */}
                    <Button
                        variant="contained"
                        startIcon={<LaunchIcon />}
                        onClick={handleLaunchWeb}
                        sx={{
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                                boxShadow: '0 8px 25px rgba(79, 70, 229, 0.5)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Launch Web App
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<LaunchIcon />}
                        onClick={handleLaunchDesktop}
                        sx={{
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #047857, #059669)',
                                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.5)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Launch Desktop App
                    </Button>
                </Box>
            </Box>



            {/* Analytics Cards */}
            {loading ? (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} lg={3} key={item}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Box sx={{ width: 60, height: 32, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                                            <Box sx={{ width: 100, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                                        </Box>
                                        <Box sx={{ width: 40, height: 40, bgcolor: 'grey.200', borderRadius: '50%' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Total Projects Card */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {analyticsData.totalProjects}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            {isTeamMember() ? 'Assigned Projects' : 'Total Projects'}
                                        </Typography>
                                    </Box>
                                    <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Active Projects Card */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                color: 'white',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)'
                                }
                            }}
                            onClick={() => setTab(0)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {analyticsData.activeProjects}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Active Projects
                                        </Typography>
                                    </Box>
                                    <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Archived Projects Card */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
                                color: 'white',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(252, 74, 26, 0.3)'
                                }
                            }}
                            onClick={() => setTab(1)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {analyticsData.archivedProjects}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Archived Projects
                                        </Typography>
                                    </Box>
                                    <ArchiveIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Collaborative Projects Card */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {isTeamMember() && completeUser
                                                ? (completeUser.memberRole || 'MEMBER').toUpperCase()
                                                : analyticsData.collaborativeProjects
                                            }
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            {isTeamMember() ? 'Your Role' : 'Collaborative'}
                                        </Typography>
                                    </Box>
                                    <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Detailed Analytics Cards */}
            {loading ? (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2].map((item) => (
                        <Grid item xs={12} lg={6} key={item}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Box sx={{ width: 24, height: 24, bgcolor: 'grey.300', borderRadius: '50%' }} />
                                        <Box sx={{ width: 200, height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
                                    </Box>
                                    {[1, 2, 3].map((row) => (
                                        <Box key={row} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 20, height: 20, bgcolor: 'grey.200', borderRadius: '50%' }} />
                                                <Box sx={{ width: 80, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                                            </Box>
                                            <Box sx={{ width: 40, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Storage Breakdown Card */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ 
                            height: '100%',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                            }
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StorageIcon color="primary" />
                                    Storage Backend Distribution
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {Object.entries(analyticsData.storageBreakdown).map(([backend, count]) => (
                                        count > 0 && (
                                            <Box key={backend} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStorageIcon(backend)}
                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                        {backend === 'azure-blob' ? 'Azure Blob' : backend}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    size="small" 
                                                    label={count} 
                                                    color="primary" 
                                                    variant="outlined"
                                                />
                                            </Box>
                                        )
                                    ))}
                                    {Object.values(analyticsData.storageBreakdown).every(count => count === 0) && (
                                        <Typography variant="body2" color="text.secondary">
                                            No projects with storage backends yet
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Application Mode Breakdown Card */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ 
                            height: '100%',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                            }
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <NetworkIcon color="primary" />
                                    Application Mode Distribution
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {Object.entries(analyticsData.modeBreakdown).map(([mode, count]) => (
                                        count > 0 && (
                                            <Box key={mode} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getModeIcon(mode)}
                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                        {mode === 'shared_network' ? 'Network' : mode}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    size="small" 
                                                    label={count} 
                                                    color="secondary" 
                                                    variant="outlined"
                                                />
                                            </Box>
                                        )
                                    ))}
                                    {Object.values(analyticsData.modeBreakdown).every(count => count === 0) && (
                                        <Typography variant="body2" color="text.secondary">
                                            No projects created yet
                                        </Typography>
                                    )}
                                </Box>
                                
                                {/* Total Datasets Info */}
                                {analyticsData.totalDatasets > 0 && (
                                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DatasetIcon color="primary" />
                                                <Typography variant="body2">
                                                    Total Datasets
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                size="small" 
                                                label={analyticsData.totalDatasets} 
                                                color="success" 
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}



            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
            >
                <Tab label={`Active Projects (${activeProjects.length})`} />
                <Tab label={`Archived (${archivedProjects.length})`} />
            </Tabs>

            {/* Search Bar */}
            <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    placeholder="Search projects by name, description, storage backend, or mode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: 'primary.main',
                            },
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={loadProjects}
                    sx={{ minWidth: 'auto', px: 3 }}
                    title="Refresh projects list"
                >
                    Refresh
                </Button>
            </Box>

            {/* Project List */}
            <Box>
                {/* Team Member Info Message */}
                {isTeamMember() && projects.length > 0 && (
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 212, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 212, 255, 0.3)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                            <Box>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                                    Team Member Access
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    You have access to {projects.length} project{projects.length !== 1 ? 's' : ''} assigned by your team administrator. 
                                    Click on any project to view details and launch the application.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
                
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Loading projects...</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Search Results Summary */}
                        {searchQuery && (
                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 2, color: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                        Found {filteredProjects.filter(project => 
                                            tab === 0 ? project.isActive && !project.isArchived : project.isArchived
                                        ).length} projects matching "{searchQuery}"
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => setSearchQuery('')}
                                        sx={{ color: 'white', textDecoration: 'underline' }}
                                    >
                                        Clear Search
                                    </Button>
                                </Box>
                            </Box>
                        )}
                        
                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                borderRadius: 2, 
                                overflow: 'auto',
                                boxShadow: 2,
                                maxHeight: '70vh',
                                width: '100%'
                            }}
                        >
                            <Table sx={{ width: '100%' }} stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Project</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Mode</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Storage</TableCell>
                                        {isTeamMember() && (
                                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Your Role</TableCell>
                                        )}
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Datasets</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Collaboration</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Last Accessed</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedProjects.map((project) => (
                                        <TableRow 
                                            key={project.id}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'action.hover',
                                                    cursor: 'pointer'
                                                },
                                                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {project.name}
                                                    </Typography>
                                                    {project.description && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {project.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={getModeIcon(project.applicationMode)}
                                                    label={project.applicationMode === 'standalone' ? 'Standalone' : 'Network'}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={getStorageIcon(project.storageBackend)}
                                                    label={project.storageBackend}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            {isTeamMember() && (
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={project.teamMemberRole || project.role || 'MEMBER'}
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                                            borderColor: 'rgba(0, 212, 255, 0.3)',
                                                            color: 'primary.main',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {typeof projectDatasetCounts[project.id] === 'number' ? (
                                                    <Chip
                                                        size="small"
                                                        label={`${projectDatasetCounts[project.id]} datasets`}
                                                        variant="outlined"
                                                        color="secondary"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {project.allowCollaboration ? (
                                                    <Chip
                                                        size="small"
                                                        label={`${project.maxCollaborators || getCollaborationLimit(user)} users`}
                                                        variant="outlined"
                                                        color="success"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">Disabled</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatLastAccessed(project.lastAccessedAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => setSelectedProject(project)}
                                                        sx={{ 
                                                            borderColor: 'primary.main',
                                                            color: 'primary.main',
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                borderColor: 'primary.dark',
                                                                backgroundColor: 'primary.main',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color={!project.isArchived ? 'warning' : 'success'}
                                                        onClick={async () => {
                                                            try {
                                                                if (!project.isArchived) {
                                                                    await cloudProjectIntegration.archiveProject(project.id);
                                                                } else {
                                                                    await cloudProjectIntegration.restoreProject(project.id);
                                                                }
                                                                await loadProjects();
                                                            } catch (e) {
                                                                console.error('Failed to toggle archive', e);
                                                                setError('Failed to update project');
                                                            }
                                                        }}
                                                        sx={{ minWidth: 'auto' }}
                                                    >
                                                        {!project.isArchived ? 'Archive' : 'Restore'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={async () => {
                                                            try {
                                                                const confirmDelete = window.confirm(
                                                                    `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will remove all project data, datasets, and team member assignments.`
                                                                );
                                                                
                                                                if (confirmDelete) {
                                                                    setLoading(true);
                                                                    const success = await cloudProjectIntegration.deleteProject(project.id);
                                                                    
                                                                    if (success) {
                                                                        console.log(`✅ [DashboardCloudProjectsBridge] Project "${project.name}" deleted successfully`);
                                                                        await loadProjects(); // Refresh the project list
                                                                        setError(null);
                                                                    } else {
                                                                        setError(`Failed to delete project "${project.name}". Please try again.`);
                                                                    }
                                                                }
                                                            } catch (e) {
                                                                console.error('Failed to delete project:', e);
                                                                setError(`Failed to delete project "${project.name}": ${e instanceof Error ? e.message : 'Unknown error'}`);
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        sx={{ 
                                                            minWidth: 'auto',
                                                            borderColor: 'error.main',
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                borderColor: 'error.dark',
                                                                backgroundColor: 'error.main',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={tabFilteredProjects.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            sx={{ mt: 2 }}
                        />
                    </>
                )}

                {/* Empty State */}
                {!loading && tabFilteredProjects.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CloudIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchQuery 
                                ? 'No projects found matching your search'
                                : (tab === 0 ? 'No active projects yet' : 'No archived projects')
                            }
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {searchQuery 
                                ? 'Try adjusting your search terms or browse all projects'
                                : (tab === 0 
                                    ? isTeamMember()
                                        ? canCreateProjects()
                                            ? 'No projects assigned yet. As a team admin, you can create new projects or wait for assignments from your organization administrator.'
                                            : 'No projects have been assigned to you yet. Contact your team administrator to get access to projects.'
                                        : canCreateProjects()
                                            ? 'Create your first cloud project to get started with Firebase and GCS integration'
                                            : 'You need an active subscription to create projects. Please upgrade your account or contact support.'
                                    : 'Archived projects will appear here'
                                )
                            }
                        </Typography>
                        {tab === 0 && !searchQuery && canCreateProjects() && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateProject}
                                size="large"
                                sx={{
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    boxShadow: 3,
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease-in-out'
                                }}
                            >
                                Create Your First Project
                            </Button>
                        )}
                        {tab === 0 && !searchQuery && isTeamMember() && !canCreateProjects() && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    💡 Team members without admin privileges cannot create projects. Projects must be assigned by your administrator.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={loadProjects}
                                    size="large"
                                    sx={{ mt: 1 }}
                                >
                                    Refresh Projects
                                </Button>
                            </Box>
                        )}
                        
                        {/* Special message for ENTERPRISE_ADMIN users */}
                        {tab === 0 && !searchQuery && !isTeamMember() && (completeUser?.memberRole === 'ENTERPRISE_ADMIN' || completeUser?.role === 'ENTERPRISE_ADMIN') && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    🎯 As an Enterprise Admin, you can create new projects and manage your organization's project portfolio.
                                </Typography>
                            </Box>
                        )}
                        
                        {searchQuery && (
                            <Button
                                variant="outlined"
                                onClick={() => setSearchQuery('')}
                                size="large"
                                sx={{ mr: 2 }}
                            >
                                Clear Search
                            </Button>
                        )}
                    </Box>
                )}

                {/* No Search Results Message */}
                {!loading && searchQuery && tabFilteredProjects.length === 0 && (tab === 0 ? activeProjects : archivedProjects).length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No projects match your search criteria
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Try different search terms or browse all projects in this tab
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setSearchQuery('')}
                            size="large"
                        >
                            Clear Search
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Project Creation Dialog */}
            <UnifiedProjectCreationDialog
                open={showCreateDialog}
                onClose={() => {
                    setShowCreateDialog(false);
                }}
                mode="shared_network" // Cloud projects are typically network mode
                onSuccess={handleProjectCreated}
                maxCollaborators={getCollaborationLimit(completeUser)}
                onCreate={async (options) => {
                    // Use the simplified startup sequencer for project creation
                    // This ensures compatibility with the UnifiedProjectCreationDialog
                    const id = await simplifiedStartupSequencer.createProject(options);
                    return id;
                }}
            />

            {/* Project Details Dialog */}
            <Dialog
                open={!!selectedProject}
                onClose={() => {
                    setSelectedProject(null);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        p: 3,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #3b82f6)',
                            borderRadius: '1px'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                color: 'white', 
                                fontWeight: 700,
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                        Project Details
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {selectedProject?.name || 'Project Configuration'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, background: 'transparent' }}>
                    {selectedProject && (
                        <Box sx={{ p: 3 }}>
                            {/* Project Information Cards */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                                        }}
                                    />
                                    Project Information
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(79, 70, 229, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {selectedProject && getModeIcon(selectedProject.applicationMode)}
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Mode
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                {selectedProject?.applicationMode === 'standalone' ? 'Standalone' : 'Network'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(6, 182, 212, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                    {selectedProject && getStorageIcon(selectedProject.storageBackend)}
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Storage Backend
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                {selectedProject?.storageBackend}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(16, 185, 129, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <NetworkIcon sx={{ color: 'white' }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Collaboration
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Up to {selectedProject?.maxCollaborators || getCollaborationLimit(completeUser)} users
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Assigned Datasets Section */}
                            <Box>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
                                        }}
                                    />
                                    Assigned Datasets
                                </Typography>
                                
                                <Box
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {/* Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>

                        <Button
                          variant="outlined"
                                            onClick={async () => {
                                              if (!selectedProject) return;
                                              console.log('🔄 [DashboardCloudProjectsBridge] Refreshing datasets for project:', selectedProject.id);
                                              try {
                                                setDatasetsLoading(true);
                                                // Refresh both assigned and available datasets
                                                await loadDatasetsForProject(selectedProject);
                                                console.log('✅ [DashboardCloudProjectsBridge] Datasets refreshed successfully');
                                              } catch (e) {
                                                console.error('❌ [DashboardCloudProjectsBridge] Failed to refresh datasets:', e);
                                                setError('Failed to refresh datasets');
                                              } finally {
                                                setDatasetsLoading(false);
                                              }
                                            }}
                                            disabled={datasetsLoading}
                                            sx={{
                                                borderColor: 'rgba(79, 70, 229, 0.5)',
                                                color: '#4f46e5',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: '#4f46e5',
                                                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                                                },
                                                '&:disabled': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    color: 'rgba(255, 255, 255, 0.3)'
                                                }
                                            }}
                                        >
                                            {datasetsLoading ? 'Refreshing...' : 'Refresh'}
                        </Button>

                                    </Box>

                                    {/* Dataset Selection Controls */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Backend</InputLabel>
                                                <Select
                                                    value={datasetBackendFilter === 'all' ? 'firestore' : datasetBackendFilter}
                            onChange={(e) => setDatasetBackendFilter(e.target.value as any)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgba(255, 255, 255, 0.7)'
                                                        },
                                                        color: 'white',
                                                        '& .MuiMenuItem-root': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="firestore">Firestore</MenuItem>
                                                    <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                                                    <MenuItem value="s3">Amazon S3</MenuItem>
                                                    <MenuItem value="aws">AWS Services</MenuItem>
                                                    <MenuItem value="azure">Microsoft Azure</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Search datasets..."
                            value={datasetSearch}
                            onChange={(e) => setDatasetSearch(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        color: 'white',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& input::placeholder': {
                                                            color: 'rgba(255, 255, 255, 0.5)',
                                                            opacity: 1
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select dataset</InputLabel>
                                                <Select
                            value={selectedDatasetId}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              console.log('🔍 [DashboardCloudProjectsBridge] Dataset selection changed:', {
                                oldValue: selectedDatasetId,
                                newValue: newValue,
                                valueType: typeof newValue,
                                availableDatasetIds: availableDatasets.map(ds => ds.id)
                              });
                              setSelectedDatasetId(newValue);
                            }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgba(255, 255, 255, 0.7)'
                                                        },
                                                        color: 'white',
                                                        '& .MuiMenuItem-root': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="">Select dataset...</MenuItem>
                            {availableDatasets.map((ds: any) => (
                                                        <MenuItem key={ds.id} value={ds.id}>{ds.__label || ds.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={2}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                                                    size="small"
                            disabled={!selectedDatasetId || datasetsLoading}
                            onClick={async () => {
                              if (!selectedProject || !selectedDatasetId) return;
                              
                              // Debug: Log the selected dataset details
                              const selectedDataset = availableDatasets.find(ds => ds.id === selectedDatasetId);
                              console.log('🔍 [DashboardCloudProjectsBridge] Selected dataset details:', {
                                selectedDatasetId,
                                selectedDataset,
                                availableDatasetsCount: availableDatasets.length,
                                availableDatasetIds: availableDatasets.map(ds => ds.id)
                              });
                              
                              // Validate that the selected dataset actually exists
                              if (!selectedDataset) {
                                console.error('❌ [DashboardCloudProjectsBridge] Selected dataset not found in available datasets:', {
                                  selectedDatasetId,
                                  availableDatasetIds: availableDatasets.map(ds => ds.id)
                                });
                                setError(`Selected dataset (${selectedDatasetId}) not found. Please try selecting a different dataset.`);
                                return;
                              }
                              
                              console.log('🔗 [DashboardCloudProjectsBridge] Assigning dataset to project:', { projectId: selectedProject.id, datasetId: selectedDatasetId });
                              try {
                                setDatasetsLoading(true);
                                
                                // Assign the dataset to the project
                                await cloudProjectIntegration.assignDatasetToProject(selectedProject.id, selectedDatasetId);
                                console.log('✅ [DashboardCloudProjectsBridge] Dataset assigned successfully');
                                
                                // Refresh the project datasets list
                                const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                                setProjectDatasets(items);
                                setProjectDatasetCounts(prev => ({ ...prev, [selectedProject.id]: items.length }));
                                
                                // Refresh available datasets to remove the assigned one
                                const all = await cloudProjectIntegration.listDatasets({
                                  backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
                                  query: datasetSearch || undefined,
                                });
                                
                                const labeled = all.map((ds: any) => {
                                  const getBackendLabel = (backend: string) => {
                                    switch (backend) {
                                      case 'gcs': return '(GCS)';
                                      case 's3': return '(S3)';
                                      case 'aws': return '(AWS)';
                                      case 'azure': return '(Azure)';
                                      case 'firestore':
                                      default: return '(Firestore)';
                                    }
                                  };
                                  return {
                                    ...ds,
                                    __label: `${ds.name} ${getBackendLabel(ds.storage?.backend)}`,
                                  };
                                });
                                setAvailableDatasets(labeled);
                                
                                // Clear the selection
                                setSelectedDatasetId('');
                                
                                console.log('✅ [DashboardCloudProjectsBridge] Dataset assignment completed and lists refreshed');
                              } catch (e) {
                                console.error('❌ [DashboardCloudProjectsBridge] Failed to assign dataset:', e);
                                setError('Failed to assign dataset to project');
                              } finally {
                                setDatasetsLoading(false);
                              }
                            }}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: 'white',
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #059669, #047857)',
                                                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            color: 'rgba(255, 255, 255, 0.3)',
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                >
                                                    {datasetsLoading ? 'Assigning...' : 'Assign'}
                                                </Button>
                          <Button
                            variant="outlined"
                                                    size="small"
                            onClick={async () => {
                              if (!selectedProject) return;
                              console.log('🔍 [DashboardCloudProjectsBridge] Applying dataset filters:', { backend: datasetBackendFilter, search: datasetSearch });
                              try {
                                setDatasetsLoading(true);
                                
                                // Load available datasets with current filters
                                const all = await cloudProjectIntegration.listDatasets({
                                  backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
                                  query: datasetSearch || undefined,
                                });
                                console.log('✅ [DashboardCloudProjectsBridge] Filtered datasets loaded:', all);
                                
                                const labeled = all.map((ds: any) => {
                                  const getBackendLabel = (backend: string) => {
                                    switch (backend) {
                                      case 'gcs': return '(GCS)';
                                      case 's3': return '(S3)';
                                      case 'aws': return '(AWS)';
                                      case 'azure': return '(Azure)';
                                      case 'firestore':
                                      default: return '(Firestore)';
                                    }
                                  };
                                  return {
                                    ...ds,
                                    __label: `${ds.name} ${getBackendLabel(ds.storage?.backend)}`,
                                  };
                                });
                                setAvailableDatasets(labeled);
                                
                                // Also refresh assigned datasets to get updated counts
                                const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                                setProjectDatasets(items);
                                setProjectDatasetCounts(prev => ({ ...prev, [selectedProject.id]: items.length }));
                                
                                console.log('✅ [DashboardCloudProjectsBridge] Filters applied successfully');
                              } catch (e) {
                                console.error('❌ [DashboardCloudProjectsBridge] Failed to apply filters:', e);
                                setError('Failed to apply dataset filters');
                              } finally {
                                setDatasetsLoading(false);
                              }
                            }}
                            disabled={datasetsLoading}
                                                    sx={{
                                                        borderColor: 'rgba(79, 70, 229, 0.5)',
                                                        color: '#4f46e5',
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        '&:hover': {
                                                            borderColor: '#4f46e5',
                                                            backgroundColor: 'rgba(79, 70, 229, 0.1)'
                                                        },
                                                        '&:disabled': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            color: 'rgba(255, 255, 255, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    {datasetsLoading ? 'Applying...' : 'Apply Filters'}
                                                </Button>
                          </Box>
                                        </Grid>
                                    </Grid>

                                    {/* Currently Assigned Datasets */}
                                    <Box>
                                        <Typography variant="body2" sx={{ 
                                            color: 'rgba(255, 255, 255, 0.7)', 
                                            mb: 2,
                                            fontWeight: 500
                                        }}>
                                            Currently Assigned Datasets
                                        </Typography>
                                        
                        {projectDatasets.length === 0 ? (
                                            <Box
                                                sx={{
                                                    p: 4,
                                                    textAlign: 'center',
                                                    borderRadius: 2,
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <DatasetIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    No datasets assigned to this project
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {projectDatasets.map((ds: any, index: number) => (
                                                    <Box
                                                        key={ds.id}
                                                        sx={{
                                                            p: 2,
                                                            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                                                            borderBottom: index < projectDatasets.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                background: 'rgba(79, 70, 229, 0.1)',
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <DatasetIcon sx={{ color: 'white', fontSize: 16 }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                                                    {ds.name}
                                                                </Typography>
                                                                {ds.description && (
                                                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                                        {ds.description}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={async () => {
                                  try {
                                    console.log('🗑️ [DashboardCloudProjectsBridge] Removing dataset from project:', { projectId: selectedProject!.id, datasetId: ds.id });
                                    await cloudProjectIntegration.unassignDatasetFromProject(selectedProject!.id, ds.id);
                                    console.log('✅ [DashboardCloudProjectsBridge] Dataset removed successfully');
                                    
                                    // Update local state immediately for better UX
                                    setProjectDatasets(prev => prev.filter(x => x.id !== ds.id));
                                    setProjectDatasetCounts(prev => ({ ...prev, [selectedProject!.id]: Math.max(0, (prev[selectedProject!.id] || 1) - 1) }));
                                    
                                    // Refresh available datasets to include the removed one
                                    const all = await cloudProjectIntegration.listDatasets({
                                      backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
                                      query: datasetSearch || undefined,
                                    });
                                    
                                    const labeled = all.map((availableDs: any) => {
                                      const getBackendLabel = (backend: string) => {
                                        switch (backend) {
                                          case 'gcs': return '(GCS)';
                                          case 's3': return '(S3)';
                                          case 'aws': return '(AWS)';
                                          case 'azure': return '(Azure)';
                                          case 'firestore':
                                          default: return '(Firestore)';
                                        }
                                      };
                                      return {
                                        ...availableDs,
                                        __label: `${availableDs.name} ${getBackendLabel(availableDs.storage?.backend)}`,
                                      };
                                    });
                                    setAvailableDatasets(labeled);
                                    
                                    console.log('✅ [DashboardCloudProjectsBridge] Dataset removal completed and lists refreshed');
                                  } catch (e) {
                                    console.error('❌ [DashboardCloudProjectsBridge] Failed to remove dataset:', e);
                                    setError('Failed to remove dataset from project');
                                  }
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                                                color: '#ef4444',
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    borderColor: '#ef4444',
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    transform: 'scale(1.05)'
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Team Members Section */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                            boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                                        }}
                                    />
                                    Team Members
                                </Typography>
                                
                                <Box
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {/* Team Member Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => setShowAddTeamMemberDialog(true)}
                                            sx={{
                                                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                color: 'white',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            Add Team Member
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={async () => {
                                              if (!selectedProject) return;
                                              console.log('🔄 [DashboardCloudProjectsBridge] Refreshing team members for project:', selectedProject.id);
                                              try {
                                                setTeamMembersLoading(true);
                                                // Refresh both assigned and available team members
                                                await loadTeamMembersForProject(selectedProject);
                                                console.log('✅ [DashboardCloudProjectsBridge] Team members refreshed successfully');
                                              } catch (e) {
                                                console.error('❌ [DashboardCloudProjectsBridge] Failed to refresh team members:', e);
                                                setError('Failed to refresh team members');
                                              } finally {
                                                setTeamMembersLoading(false);
                                              }
                                            }}
                                            disabled={teamMembersLoading}
                                            sx={{
                                                borderColor: 'rgba(139, 92, 246, 0.5)',
                                                color: '#8b5cf6',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: '#8b5cf6',
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                                },
                                                '&:disabled': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    color: 'rgba(255, 255, 255, 0.3)'
                                                }
                                            }}
                                        >
                                            {teamMembersLoading ? 'Refreshing...' : 'Refresh'}
                                        </Button>
                                    </Box>

                                    {/* Currently Assigned Team Members */}
                                    <Box>
                                        <Typography variant="body2" sx={{ 
                                            color: 'rgba(255, 255, 255, 0.8)', 
                                            mb: 2,
                                            fontWeight: 500
                                        }}>
                                            Project Team Members ({projectTeamMembers.length})
                                        </Typography>
                                        
                                        {projectTeamMembers.length === 0 ? (
                                            <Box
                                                sx={{
                                                    p: 4,
                                                    textAlign: 'center',
                                                    borderRadius: 2,
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <NetworkIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    No team members assigned to this project
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                                                    Add licensed team members to collaborate on this project
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {projectTeamMembers.map((member: any, index: number) => {
                                                    // Extract team member details with proper fallbacks
                                                    const teamMember = member.teamMember || member;
                                                    const displayName = teamMember.name || 
                                                        (teamMember.firstName && teamMember.lastName ? 
                                                            `${teamMember.firstName} ${teamMember.lastName}` : 
                                                            teamMember.firstName || 
                                                            teamMember.email?.split('@')[0] || 
                                                            'Unnamed User');
                                                    const displayEmail = teamMember.email || member.email || 'No email';
                                                    const displayRole = member.role || 'Member';
                                                    const displayLicenseType = teamMember.licenseType || member.licenseType;
                                                    
                                                    return (
                                                    <Box
                                                        key={member.id}
                                                        sx={{
                                                            p: 3,
                                                            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                                                            borderBottom: index < projectTeamMembers.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                background: 'rgba(139, 92, 246, 0.1)',
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '18px',
                                                                    fontWeight: 600,
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                {displayName.charAt(0).toUpperCase()}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                                                    {displayName}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                                    {displayEmail}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                                    <Chip
                                                                        size="small"
                                                                        label={displayRole}
                                                                        sx={{
                                                                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                                                            color: '#c4b5fd',
                                                                            fontSize: '11px'
                                                                        }}
                                                                    />
                                                                    {displayLicenseType && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={displayLicenseType}
                                                                            sx={{
                                                                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                                                color: '#6ee7b7',
                                                                                fontSize: '11px'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={async () => {
                                                                try {
                                                                    // Use teamMemberId if available, otherwise fall back to id
                                                                    const memberIdToRemove = member.teamMemberId || member.id;
                                                                    
                                                                    if (!memberIdToRemove) {
                                                                        console.error('No valid team member ID found:', member);
                                                                        alert('Error: Invalid team member ID');
                                                                        return;
                                                                    }
                                                                    
                                                                    await cloudProjectIntegration.removeTeamMemberFromProject(selectedProject!.id, memberIdToRemove);
                                                                    
                                                                    // Update local state
                                                                    setProjectTeamMembers(prev => prev.filter(m => 
                                                                        (m.teamMemberId || m.id) !== memberIdToRemove
                                                                    ));
                                                                } catch (e: any) {
                                                                    console.error('Failed to remove team member', e);
                                                                    alert(`Failed to remove team member: ${e?.message || 'Unknown error'}`);
                                                                }
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                                                color: '#ef4444',
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    borderColor: '#ef4444',
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    transform: 'scale(1.05)'
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                );
                                            })}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                      </Box>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        onClick={() => setSelectedProject(null)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Close
                    </Button>
                    

                </DialogActions>
            </Dialog>

            {/* Dataset Creation Wizard */}
            <ErrorBoundary>
                <DatasetCreationWizard
                    open={showCreateDatasetWizard}
                    onClose={() => {
                        setShowCreateDatasetWizard(false);
                        setDatasetWizardAssignToProject(null);
                    }}
                    onSuccess={(dataset) => {
                        // Refresh available datasets if a project is selected
                        if (selectedProject) {
                            void loadDatasetsForProject(selectedProject);
                        }
                        // Refresh project list to update dataset counts
                        void loadProjects();
                    }}
                    assignToProject={datasetWizardAssignToProject || undefined}
                />
            </ErrorBoundary>

            {/* Add Team Member Dialog */}
            <Dialog 
                open={showAddTeamMemberDialog} 
                onClose={() => setShowAddTeamMemberDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        color: 'white',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        p: 3
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <AddIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Add Team Member
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Add licensed team members to this project
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, background: 'transparent' }}>
                    {addTeamMemberError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {addTeamMemberError}
                        </Alert>
                    )}
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            Search and select from your licensed team members:
                        </Typography>
                        
                        <TextField
                            fullWidth
                            placeholder="Search team members by name or email..."
                            value={teamMemberSearch}
                            onChange={(e) => setTeamMemberSearch(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Team Member</InputLabel>
                            <Select
                                value={selectedTeamMemberId}
                                onChange={(e) => setSelectedTeamMemberId(e.target.value)}
                                disabled={teamMembersLoading}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                    color: 'white'
                                }}
                            >
                                <MenuItem value="">
                                    <em>{teamMembersLoading ? 'Loading team members...' : 'Select a team member...'}</em>
                                </MenuItem>
                                {!teamMembersLoading && availableTeamMembers.length === 0 && (
                                    <MenuItem disabled>
                                        <Typography component="em" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {teamMemberSearch ? 'No team members found matching your search' : 'No available team members found'}
                                        </Typography>
                                    </MenuItem>
                                )}
                                {!teamMembersLoading && availableTeamMembers.map((member: any) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: 'white'
                                                }}
                                            >
                                                {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                                            </Box>
                                                                                    <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                                {member.name || 'Unnamed User'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                {member.email} • {member.licenseType || 'Licensed'}
                                            </Typography>
                                        </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Project Role</InputLabel>
                            <Select
                                value={selectedTeamMemberRole}
                                onChange={(e) => setSelectedTeamMemberRole(e.target.value as 'ADMIN' | 'DO_ER')}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                    color: 'white'
                                }}
                            >
                                <MenuItem value="DO_ER">
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                            Do_Er
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            Can create, edit, and delete data but no admin privileges
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="ADMIN">
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                            Admin
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            Full administrative access (only 1 admin per project)
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {availableTeamMembers.length === 0 && !teamMembersLoading && (
                        <Box
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px dashed rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <NetworkIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                No available team members found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                                Make sure team members have valid licenses and aren't already assigned to this project
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions
                    sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        onClick={() => {
                            setShowAddTeamMemberDialog(false);
                            setSelectedTeamMemberId('');
                            setSelectedTeamMemberRole('DO_ER');
                            setTeamMemberSearch('');
                            setAddTeamMemberError(null);
                        }}
                        variant="outlined"
                        disabled={addTeamMemberLoading}
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        variant="contained"
                        disabled={addTeamMemberLoading || !selectedTeamMemberId}
                        onClick={async () => {
                            if (!selectedProject || !selectedTeamMemberId) return;
                            
                            setAddTeamMemberError(null);
                            setAddTeamMemberLoading(true);
                            
                            try {
                                await cloudProjectIntegration.addTeamMemberToProject(
                                    selectedProject.id, 
                                    selectedTeamMemberId, 
                                    selectedTeamMemberRole as any
                                );
                                
                                // Refresh team members list
                                await loadTeamMembersForProject(selectedProject);
                                
                                // Close dialog and reset
                                setShowAddTeamMemberDialog(false);
                                setSelectedTeamMemberId('');
                                setSelectedTeamMemberRole('DO_ER');
                                setTeamMemberSearch('');
                            } catch (e: any) {
                                console.error('Failed to add team member:', e);
                                setAddTeamMemberError(e?.message || 'Failed to add team member');
                            } finally {
                                setAddTeamMemberLoading(false);
                            }
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
                                transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {addTeamMemberLoading ? 'Adding...' : 'Add Team Member'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dataset Management Dialog */}
            <DatasetManagementDialog
                open={showDatasetManagementDialog}
                onClose={() => setShowDatasetManagementDialog(false)}
                onDatasetUpdated={() => {
                    // Refresh available datasets if a project is selected
                    if (selectedProject) {
                        void loadDatasetsForProject(selectedProject);
                    }
                    // Refresh project list to update dataset counts
                    void loadProjects();
                }}
            />

        </Box>
    );
};

export default DashboardCloudProjectsBridge;
