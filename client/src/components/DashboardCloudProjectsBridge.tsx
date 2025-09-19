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
import CollectionCreationWizard from './CollectionCreationWizard';
import ProjectDetailsDialog from './ProjectDetailsDialog';
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
    TableSortLabel,
      Paper,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Popover,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge
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
    GroupAdd as GroupAddIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    CheckCircle,
    Schedule,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    Pause as PauseIcon,
    Check as CheckIcon,
    Warning as WarningIcon,
    Edit as EditIcon,
    Help as HelpIcon,
    School as SchoolIcon,
    Lightbulb as LightbulbIcon,
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Storage as StorageIconAlt,
    Link as LinkIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    ArrowForward as ArrowForwardIcon,
    Extension as ExtensionIcon
} from '@mui/icons-material';

import { cloudProjectIntegration, CloudDataset } from '../services/CloudProjectIntegration';
import { simplifiedStartupSequencer } from '../services/SimplifiedStartupSequencer';
import { datasetConflictAnalyzer, DatasetConflictAnalysis } from '../services/DatasetConflictAnalyzer';
import UnifiedProjectCreationDialog from './UnifiedProjectCreationDialog';
import DatasetCreationWizard from './DatasetCreationWizard';
import EditDatasetDialog from './EditDatasetDialog';
// import { DatasetManagementDialog } from './DatasetManagementDialog';
import { ErrorBoundary } from './common/ErrorBoundary';
import { ProjectRoleManagementDialog } from './ProjectRoleManagementDialog';
import TeamRoleWizard from './TeamRoleWizard';
import { projectRoleService, ProjectRole } from '../services/ProjectRoleService';

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
    // Enhanced project status management
    status: UnifiedProjectStatus;
    completionPercentage?: number;
    lastActivityAt?: string;
    teamMemberCount?: number;
    collaborationEnabled?: boolean;
    settings?: {
      preferredPorts?: {
        website?: number;
        api?: number;
      };
      autoEnableCollaboration?: boolean;
      completionCriteria?: {
        requiresDatasets?: boolean;
        requiresTeamMembers?: boolean;
        minimumActivity?: number;
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

// Function to get collaboration limit based on active licenses
const getCollaborationLimit = (user: any): number => {
    if (!user) return 1; // Default for unauthenticated users - just themselves
    
    let totalActiveLicenses = 0;
    
    // Count active licenses from user.licenses array
    if (user.licenses && Array.isArray(user.licenses)) {
        const activeLicenses = user.licenses.filter((license: any) => 
            license.status === 'ACTIVE' || license.status === 'PENDING'
        );
        totalActiveLicenses += activeLicenses.length;
    }
    
    // Check subscription-based licenses
    if (user.subscription?.plan) {
        const plan = user.subscription.plan.toUpperCase();
        // Subscription plans typically include a base number of licenses
        if (plan === 'ENTERPRISE') {
            totalActiveLicenses += user.subscription.seats || 100; // Enterprise typically has many seats
        } else if (plan === 'PRO' || plan === 'PROFESSIONAL') {
            totalActiveLicenses += user.subscription.seats || 25; // Pro typically has moderate seats
        } else if (plan === 'BASIC') {
            totalActiveLicenses += user.subscription.seats || 5; // Basic typically has few seats
        }
    }
    
    // For organization owners, check organization-level licenses
    if (user.organizationId && !user.isTeamMember) {
        // Organization owners can use all licenses in their organization
        // This will be the actual limit for collaboration
        const orgLicenseCount = user.organizationLicenseCount || totalActiveLicenses;
        totalActiveLicenses = Math.max(totalActiveLicenses, orgLicenseCount);
    }
    
    // Ensure minimum of 1 (the user themselves) and reasonable maximum for performance
    // Since it's frontend-heavy, we can be generous but still set a reasonable cap
    const minLimit = 1;
    const maxLimit = 1000; // Performance-conscious upper limit
    
    return Math.max(minLimit, Math.min(totalActiveLicenses, maxLimit));
};

// Import unified status utilities
import { calculateEnhancedStatus, getStatusColor, getStatusDisplayText, countProjectsByStatus, type ProjectStatus as UnifiedProjectStatus } from '../utils/status-utils';

// Helper functions for project status and collaboration management
const getProjectStatus = (project: any, teamMemberCount: number = 0, datasetCount: number = 0): UnifiedProjectStatus => {
    return calculateEnhancedStatus(project, teamMemberCount, datasetCount);
};

const shouldEnableCollaboration = (project: any, teamMemberCount: number = 0): boolean => {
    // Always enable collaboration for shared network projects (cloud projects are collaborative by nature)
    if (project.applicationMode === 'shared_network') {
        return true;
    }
    
    // Enable if team members are assigned (they need to collaborate)
    if (teamMemberCount > 0) {
        return true;
    }
    
    // Enable if explicitly set in project settings
    if (project.settings?.autoEnableCollaboration !== false) {
        // Default to true for cloud projects unless explicitly disabled
        return true;
    }
    
    // Enable if allowCollaboration is explicitly true
    if (project.allowCollaboration === true) {
        return true;
    }
    
    // For cloud projects, default to enabled since they're designed for collaboration
    // Only disable if explicitly set to false
    return project.allowCollaboration !== false;
};

const calculateCompletionPercentage = (project: any, teamMemberCount: number = 0, datasetCount: number = 0): number => {
    let completionScore = 0;
    let totalCriteria = 0;
    
    // Basic project setup (20%)
    if (project.name && project.description) {
        completionScore += 20;
    } else if (project.name) {
        completionScore += 10;
    }
    totalCriteria += 20;
    
    // Team member assignment (30%)
    if (teamMemberCount > 0) {
        completionScore += Math.min(30, teamMemberCount * 10);
    }
    totalCriteria += 30;
    
    // Dataset assignment (25%)
    if (datasetCount > 0) {
        completionScore += Math.min(25, datasetCount * 5);
    }
    totalCriteria += 25;
    
    // Recent activity (25%)
    if (project.lastAccessedAt) {
        const daysSinceAccess = (new Date().getTime() - new Date(project.lastAccessedAt).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceAccess <= 1) {
            completionScore += 25;
        } else if (daysSinceAccess <= 7) {
            completionScore += 15;
        } else if (daysSinceAccess <= 30) {
            completionScore += 5;
        }
    }
    totalCriteria += 25;
    
    return Math.min(100, Math.round((completionScore / totalCriteria) * 100));
};

// Use unified status color function
const getStatusColorLocal = (status: string) => getStatusColor(status as UnifiedProjectStatus);

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'draft': return <InfoIcon />;
        case 'active': return <TrendingUpIcon />;
        case 'in-progress': return <AssessmentIcon />;
        case 'completed': return <CheckCircle />;
        case 'archived': return <ArchiveIcon />;
        case 'paused': return <Schedule />;
        default: return <InfoIcon />;
    }
};

// Function to map service CloudProject to component CloudProject
const mapServiceProjectToComponentProject = (serviceProject: any, teamMemberCount: number = 0, datasetCount: number = 0, user?: any): CloudProject => {
    console.log('🔍 [DashboardCloudProjectsBridge] Mapping project:', serviceProject.name);
    console.log('🔍 [DashboardCloudProjectsBridge] Raw project data:', serviceProject);
    console.log('🔍 [DashboardCloudProjectsBridge] Team member count:', teamMemberCount);
    console.log('🔍 [DashboardCloudProjectsBridge] Dataset count:', datasetCount);
    
    // Calculate enhanced project properties
    const projectStatus = getProjectStatus(serviceProject, teamMemberCount, datasetCount);
    const collaborationEnabled = shouldEnableCollaboration(serviceProject, teamMemberCount);
    const completionPercentage = calculateCompletionPercentage(serviceProject, teamMemberCount, datasetCount);
    const lastActivityAt = serviceProject.lastActivityAt || serviceProject.lastAccessedAt || serviceProject.updatedAt;
    
    console.log('🔍 [DashboardCloudProjectsBridge] Calculated status:', projectStatus);
    console.log('🔍 [DashboardCloudProjectsBridge] Collaboration enabled:', collaborationEnabled);
    console.log('🔍 [DashboardCloudProjectsBridge] Completion percentage:', completionPercentage);
    
    return {
        id: serviceProject.id,
        name: serviceProject.name,
        description: serviceProject.description,
        applicationMode: serviceProject.settings?.applicationMode || 'shared_network', // Default to shared_network for cloud projects
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
        isActive: projectStatus !== 'archived' && projectStatus !== 'paused',
        isArchived: projectStatus === 'archived',
        allowCollaboration: collaborationEnabled,
        maxCollaborators: serviceProject.settings?.maxCollaborators || getCollaborationLimit(user),
        realTimeEnabled: serviceProject.settings?.realTimeEnabled || collaborationEnabled, // Enable real-time if collaboration is enabled
        // Enhanced properties
        status: projectStatus,
        completionPercentage,
        lastActivityAt,
        teamMemberCount,
        collaborationEnabled,
        settings: {
            ...serviceProject.settings,
            autoEnableCollaboration: serviceProject.settings?.autoEnableCollaboration ?? true, // Default to true for cloud projects
            completionCriteria: {
                requiresDatasets: true,
                requiresTeamMembers: true,
                minimumActivity: 1,
                ...serviceProject.settings?.completionCriteria
            }
        },
        teamMemberRole: serviceProject.teamMembers?.[0]?.role,
        role: serviceProject.teamMembers?.[0]?.role,
        assignedAt: serviceProject.teamMembers?.[0]?.assignedAt,
        projectOwner: serviceProject.ownerId
    };
};

export const DashboardCloudProjectsBridge: React.FC<DashboardCloudProjectsBridgeProps> = () => {
    const { user } = useAuth();
    const { setLoading } = useLoading();
    
    // State for subscription data
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    
    // Function to fetch subscription data from Firestore
    const fetchSubscriptionData = useCallback(async (organizationId: string) => {
        if (subscriptionLoading) return; // Prevent multiple simultaneous requests
        
        setSubscriptionLoading(true);
        try {
            console.log('🔍 [DashboardCloudProjectsBridge] Fetching subscription from Firestore for org:', organizationId);
            
            // Import Firebase services dynamically
            const { getFirestore, collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
            const { getAuth } = await import('firebase/auth');
            
            const db = getFirestore();
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                console.warn('No authenticated user for subscription fetch');
                return;
            }
            
            // Query subscriptions by organizationId
            const subscriptionsQuery = query(
                collection(db, 'subscriptions'),
                where('organizationId', '==', organizationId),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            
            const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
            
            if (!subscriptionsSnapshot.empty) {
                const subDoc = subscriptionsSnapshot.docs[0];
                const subData = subDoc.data();
                
                console.log('✅ [DashboardCloudProjectsBridge] Found subscription in Firestore:', {
                    id: subDoc.id,
                    tier: subData.tier,
                    status: subData.status,
                    organizationId: subData.organizationId
                });
                
                const subscription = {
                    plan: subData.tier?.toLowerCase() || 'basic',
                    status: subData.status?.toLowerCase() || 'active',
                    currentPeriodEnd: subData.currentPeriodEnd?.toDate?.() || subData.currentPeriodEnd
                };
                
                setSubscriptionData(subscription);
                
                // Cache the subscription data in localStorage
                localStorage.setItem('user_subscription', JSON.stringify(subscription));
            } else {
                console.log('⚠️ [DashboardCloudProjectsBridge] No subscription found in Firestore for org:', organizationId);
            }
        } catch (error) {
            console.warn('Failed to fetch subscription from Firestore:', error);
        } finally {
            setSubscriptionLoading(false);
        }
    }, [subscriptionLoading]);
    
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
        
        // 🔧 CRITICAL FIX: Use subscription data from state if available
        if (subscriptionData) {
            mergedUser.subscription = subscriptionData;
        }
        
        // 🔧 CRITICAL FIX: If still no subscription data, try to fetch from Firestore
        if (!mergedUser.subscription && mergedUser.organizationId && !subscriptionLoading) {
            console.log('🔍 [DashboardCloudProjectsBridge] No subscription found in localStorage, fetching from Firestore for org:', mergedUser.organizationId);
            fetchSubscriptionData(mergedUser.organizationId);
        }
        
        return mergedUser;
    }, [user, subscriptionData, subscriptionLoading, fetchSubscriptionData]);
    
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
        
        return isExplicitTeamMember;
    }, [completeUser]);

    // Helper function to check if user can create projects (memoized for performance)
    const canCreateProjects = useMemo(() => {
        if (!completeUser) {
            return false;
        }
        
        // 🔧 ENHANCED: Enterprise users and privileged users can always create projects
        if (completeUser.memberRole === 'ENTERPRISE_ADMIN' || 
            completeUser.role === 'ENTERPRISE_ADMIN' ||
            String(completeUser.role).includes('ENTERPRISE')) {
            return true;
        }
        
        // 🔧 CRITICAL FIX: Account owners (OWNER role) can ALWAYS create projects
        // This includes users who are NOT team members (i.e., they own their account/organization)
        if (!isTeamMember()) {
            // 🔧 CRITICAL FIX: OWNER role users can always create projects regardless of subscription
            if (completeUser.role === 'OWNER' || completeUser.memberRole === 'OWNER') {
                return true;
            }
            
            // Check if user has an active subscription or is a superadmin
            const hasActiveSubscription = completeUser.subscription?.status === 'ACTIVE' || 
                                        completeUser.subscription?.status === 'TRIALING' ||
                                        completeUser.role === 'SUPERADMIN' ||
                                        completeUser.role === 'ADMIN';
            
            if (hasActiveSubscription) {
                return true;
            } else {
                // 🔧 ENHANCED: Check for subscription plan even without status
                if (completeUser.subscription?.plan && ['BASIC', 'PRO', 'ENTERPRISE'].includes(completeUser.subscription.plan)) {
                    return true;
                }
                
                // 🔧 ENHANCED: Check for demo user status
                const isDemoUser = completeUser.isDemoUser || localStorage.getItem('demo_user_status') === 'ACTIVE';
                if (isDemoUser) {
                    return true;
                }
                
                // Still allow project creation for account owners even without subscription
                // They can create projects but may have limited features
                return true;
            }
        }
        
        // 🔧 ENHANCED: Team members with ADMIN role can create projects
        if (completeUser.memberRole === 'ADMIN' || completeUser.role === 'ADMIN') {
            return true;
        }
        
        // 🔧 ENHANCED: Check if team member has admin permissions from team member data
        const teamMemberData = localStorage.getItem('team_member_data');
        if (teamMemberData) {
            try {
                const parsed = JSON.parse(teamMemberData);
                if (parsed.role === 'ADMIN' || parsed.memberRole === 'ADMIN' || parsed.role === 'TEAM_ADMIN') {
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
            return true;
        }
        
        // 🔧 NEW: Check for SUPERADMIN role which should have full access
        if (completeUser.role === 'SUPERADMIN') {
            return true;
        }
        
        // 🔧 ENHANCED: Fallback check for users with any subscription plan (Basic, Pro, Enterprise)
        if (completeUser.subscription?.plan && ['BASIC', 'PRO', 'ENTERPRISE'].includes(completeUser.subscription.plan)) {
            return true;
        }
        
        // 🔧 ENHANCED: Final fallback - check if user has any subscription data at all
        if (completeUser.subscription) {
            return true;
        }
        
        return false;
    }, [completeUser, isTeamMember]);
    const [projects, setProjects] = useState<CloudProject[]>([]);
    const [loading, setLocalLoading] = useState(true);
    const [datasetCountsLoading, setDatasetCountsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState(0); // 0 = Active, 1 = Archived
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showLaunchDialog, setShowLaunchDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<CloudProject | null>(null);
    
    // Debug logging for selectedProject
    useEffect(() => {
        console.log('🔍 DashboardCloudProjectsBridge - selectedProject changed:', selectedProject?.name, 'open:', !!selectedProject);
    }, [selectedProject]);
    const [showCollectionWizard, setShowCollectionWizard] = useState(false);
  const [projectDatasets, setProjectDatasets] = useState<any[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [organizationDatasets, setOrganizationDatasets] = useState<any[]>([]);
  const [organizationDatasetsLoading, setOrganizationDatasetsLoading] = useState(false);
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
  const [showDatasetInsightsDialog, setShowDatasetInsightsDialog] = useState(false);
  const [datasetAnalysis, setDatasetAnalysis] = useState<DatasetConflictAnalysis | null>(null);
  const [loadingDatasetAnalysis, setLoadingDatasetAnalysis] = useState(false);
  
  // Edit Dataset Dialog State
  const [showEditDatasetDialog, setShowEditDatasetDialog] = useState(false);
  const [datasetToEdit, setDatasetToEdit] = useState<CloudDataset | null>(null);
  
  // Dataset Management State
  const [selectedDatasetForManagement, setSelectedDatasetForManagement] = useState<any | null>(null);
  const [showDatasetCollectionsDialog, setShowDatasetCollectionsDialog] = useState(false);
  
  // Role Management State
  const [showRoleManagementDialog, setShowRoleManagementDialog] = useState(false);
  const [showTeamRoleWizard, setShowTeamRoleWizard] = useState(false);

  // Team Member Management State
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<ProjectRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [teamMemberSearch, setTeamMemberSearch] = useState<string>('');
  const [showAddTeamMemberDialog, setShowAddTeamMemberDialog] = useState(false);
  const [addTeamMemberLoading, setAddTeamMemberLoading] = useState(false);
  const [addTeamMemberError, setAddTeamMemberError] = useState<string | null>(null);

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Info popover state
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [infoPopoverAnchor, setInfoPopoverAnchor] = useState<HTMLElement | null>(null);

  // Table Sorting State
  const [orderBy, setOrderBy] = useState<keyof CloudProject>('lastAccessedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Enhanced project tracking state
  const [projectTeamMemberCounts, setProjectTeamMemberCounts] = useState<Record<string, number>>({});
  const [projectStatusUpdating, setProjectStatusUpdating] = useState<Record<string, boolean>>({});

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<Record<string, HTMLElement | null>>({});
  const [actionsDropdownAnchor, setActionsDropdownAnchor] = useState<HTMLElement | null>(null);

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

  // Load available roles for project when Add Team Member dialog opens
  useEffect(() => {
    if (selectedProject && showAddTeamMemberDialog && !rolesLoading && availableRoles.length === 0) {
      const loadRoles = async () => {
        try {
          setRolesLoading(true);
          console.log('🎭 [DashboardCloudProjectsBridge] Loading available roles for project:', selectedProject.id);
          
          const roles = await projectRoleService.getAvailableRoles(selectedProject.id);
          console.log(`✅ [DashboardCloudProjectsBridge] Found ${roles?.length || 0} available roles`);
          
          setAvailableRoles(roles || []);
          
          // Set default role to DO_ER if available
          if (roles && roles.length > 0) {
            const defaultRole = roles.find(role => role.name === 'DO_ER') || roles[0];
            setSelectedTeamMemberRole(defaultRole.id);
          }
        } catch (error) {
          console.error('❌ [DashboardCloudProjectsBridge] Failed to load available roles:', error);
          setAvailableRoles([]);
        } finally {
          setRolesLoading(false);
        }
      };
      
      loadRoles();
    }
  }, [selectedProject, showAddTeamMemberDialog, rolesLoading, availableRoles.length]);

    useEffect(() => {
        loadProjects();
        // Listen for project creation events to refresh without full page reload
        const onCreated = (e: any) => {
            loadProjects();
        };
        window.addEventListener('project:created' as any, onCreated);
        
        return () => window.removeEventListener('project:created' as any, onCreated);
    }, []);

    // Sorting function
    const getComparator = <Key extends keyof CloudProject>(
        order: 'asc' | 'desc',
        orderBy: Key,
    ): ((a: CloudProject, b: CloudProject) => number) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (bValue < aValue) {
            return -1;
        }
        if (bValue > aValue) {
            return 1;
        }
        return 0;
    };

    // Handle sort request
    const handleRequestSort = (property: keyof CloudProject) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Filter and sort projects - optimized with useMemo
    const filteredProjects = useMemo(() => {
        let filtered = projects;
        
        // Apply search filter
        if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase();
            filtered = projects.filter(project => (
                project.name.toLowerCase().includes(searchLower) ||
                (project.description && project.description.toLowerCase().includes(searchLower)) ||
                project.storageBackend.toLowerCase().includes(searchLower) ||
                project.applicationMode.toLowerCase().includes(searchLower)
            ));
        }
        
        // Apply sorting
        return filtered.sort(getComparator(order, orderBy));
    }, [projects, searchQuery, order, orderBy]);

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

    // Helper to load team member counts for all projects
    const loadTeamMemberCountsForAllProjects = useCallback(async (projectList: CloudProject[]) => {
        try {
            console.log('🔍 [DashboardCloudProjectsBridge] Loading team member counts for all projects in batch...');
            
            const projectIds = projectList.map(project => project.id);
            
            // Use batch method for better performance
            const teamMemberBatch = await cloudProjectIntegration.getProjectTeamMembersBatch(projectIds).catch(error => {
                console.warn('⚠️ [DashboardCloudProjectsBridge] Failed to load team members in batch, falling back to individual calls:', error);
                return {};
            });
            
            // Update the projectTeamMemberCounts state
            const newCounts: Record<string, number> = {};
            projectIds.forEach(projectId => {
                newCounts[projectId] = teamMemberBatch[projectId]?.length || 0;
            });
            
            setProjectTeamMemberCounts(newCounts);
            console.log('✅ [DashboardCloudProjectsBridge] Loaded team member counts for all projects:', newCounts);
            
        } catch (error) {
            console.error('❌ [DashboardCloudProjectsBridge] Failed to load team member counts for all projects:', error);
        }
    }, []);

    // Helper to load dataset counts for all projects
    // 🚀 PERFORMANCE OPTIMIZATION: Load dataset counts in parallel with better error handling
    const loadDatasetCountsForAllProjects = useCallback(async (projectList: CloudProject[]) => {
        try {
            console.log('🔍 [DashboardCloudProjectsBridge] Loading dataset counts for all projects...');
            setDatasetCountsLoading(true);
            
            // 🚀 PERFORMANCE OPTIMIZATION: Batch all dataset count requests in parallel
            // This reduces the total loading time from sequential to parallel execution
            const datasetCountPromises = projectList.map(async (project) => {
                try {
                    const datasets = await cloudProjectIntegration.getProjectDatasets(project.id);
                    console.log(`🔍 [DashboardCloudProjectsBridge] Project "${project.name}" has ${datasets.length} assigned datasets`);
                    return { projectId: project.id, count: datasets.length, success: true };
                } catch (error) {
                    console.warn(`⚠️ [DashboardCloudProjectsBridge] Failed to load datasets for project ${project.id}:`, error);
                    return { projectId: project.id, count: 0, success: false };
                }
            });
            
            // Wait for all dataset count requests to complete in parallel
            const datasetCounts = await Promise.all(datasetCountPromises);
            
            // Update the projectDatasetCounts state
            const newCounts: Record<string, number> = {};
            let successCount = 0;
            
            datasetCounts.forEach(({ projectId, count, success }) => {
                newCounts[projectId] = count;
                if (success) successCount++;
            });
            
            setProjectDatasetCounts(prev => ({ ...prev, ...newCounts }));
            console.log(`✅ [DashboardCloudProjectsBridge] Updated dataset counts for ${successCount}/${projectList.length} projects:`, newCounts);
            
        } catch (error) {
            console.error('❌ [DashboardCloudProjectsBridge] Failed to load dataset counts for all projects:', error);
        } finally {
            setDatasetCountsLoading(false);
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
                        
                        // Calculate enhanced properties for team member projects
                        const teamMemberCount = 1; // At least the current user
                        const datasetCount = 0; // Default to 0, will be updated later
                        const projectStatus = getProjectStatus(project, teamMemberCount, datasetCount);
                        const collaborationEnabled = shouldEnableCollaboration(project, teamMemberCount);
                        const completionPercentage = calculateCompletionPercentage(project, teamMemberCount, datasetCount);
                        
                        const transformed = {
                            id: project.projectId || project.id,
                            name: project.projectName || project.name || 'Unnamed Project',
                            description: project.description || '',
                            applicationMode: 'shared_network' as const, // Team members always use network mode
                            storageBackend: 'firestore' as const, // Always Firestore in webonly mode
                            lastAccessedAt: project.lastAccessed || project.assignedAt || new Date().toISOString(),
                            isActive: projectStatus !== 'archived' && projectStatus !== 'paused',
                            isArchived: projectStatus === 'archived',
                            allowCollaboration: collaborationEnabled,
                            maxCollaborators: project.maxCollaborators || getCollaborationLimit(completeUser),
                            realTimeEnabled: collaborationEnabled,
                            // Enhanced properties
                            status: projectStatus,
                            completionPercentage,
                            lastActivityAt: project.lastAccessed || project.assignedAt || new Date().toISOString(),
                            teamMemberCount,
                            collaborationEnabled,
                            settings: {
                                autoEnableCollaboration: true,
                                completionCriteria: {
                                    requiresDatasets: true,
                                    requiresTeamMembers: true,
                                    minimumActivity: 1
                                }
                            },
                            // Team member specific fields
                            teamMemberRole: project.role || project.teamMemberRole || 'MEMBER',
                            role: project.role || project.teamMemberRole || 'MEMBER', // Ensure both fields are set
                            assignedAt: project.assignedAt,
                            projectOwner: project.ownerName || 'Organization Owner',
                        };
                        
                        console.log('🔍 [DashboardCloudProjectsBridge] Transformed to:', transformed);
                        return transformed;
                    });
                    
                    setProjects(transformedProjects);
                    
                    // 🚀 PERFORMANCE OPTIMIZATION: Load dataset counts in parallel (non-blocking)
                    // This allows the UI to show projects immediately while counts load in background
                    loadDatasetCountsForAllProjects(transformedProjects).catch(error => {
                        console.warn('⚠️ [DashboardCloudProjectsBridge] Background dataset count loading failed:', error);
                    });
                    
                } catch (teamMemberError) {
                    console.error('Failed to fetch team member projects:', teamMemberError);
                    
                    // Fallback: try to get projects from localStorage if available
                    const teamMemberData = localStorage.getItem('team_member_data');
                    
                    if (teamMemberData) {
                        try {
                            const parsed = JSON.parse(teamMemberData);
                            
                            if (parsed.projectAccess && Array.isArray(parsed.projectAccess)) {
                                
                                const fallbackProjects = parsed.projectAccess.map((access: any) => {
                                    const teamMemberCount = 1;
                                    const datasetCount = 0;
                                    const projectStatus = getProjectStatus(access, teamMemberCount, datasetCount);
                                    const collaborationEnabled = shouldEnableCollaboration(access, teamMemberCount);
                                    const completionPercentage = calculateCompletionPercentage(access, teamMemberCount, datasetCount);
                                    
                                    return {
                                        id: access.projectId,
                                        name: access.projectName || 'Unnamed Project',
                                        description: access.description || '',
                                        applicationMode: 'shared_network' as const,
                                        storageBackend: 'firestore' as const,
                                        lastAccessedAt: access.lastAccessed || new Date().toISOString(),
                                        isActive: projectStatus !== 'archived' && projectStatus !== 'paused',
                                        isArchived: projectStatus === 'archived',
                                        allowCollaboration: collaborationEnabled,
                                        maxCollaborators: getCollaborationLimit(completeUser),
                                        realTimeEnabled: collaborationEnabled,
                                        // Enhanced properties
                                        status: projectStatus,
                                        completionPercentage,
                                        lastActivityAt: access.lastAccessed || new Date().toISOString(),
                                        teamMemberCount,
                                        collaborationEnabled,
                                        settings: {
                                            autoEnableCollaboration: true,
                                            completionCriteria: {
                                                requiresDatasets: true,
                                                requiresTeamMembers: true,
                                                minimumActivity: 1
                                            }
                                        },
                                        teamMemberRole: access.role || 'MEMBER',
                                        assignedAt: access.assignedAt,
                                        projectOwner: 'Organization Owner',
                                    };
                                });
                                
                                setProjects(fallbackProjects);
                                
                                // 🚀 PERFORMANCE OPTIMIZATION: Load dataset counts in parallel (non-blocking)
                                loadDatasetCountsForAllProjects(fallbackProjects).catch(error => {
                                    console.warn('⚠️ [DashboardCloudProjectsBridge] Background dataset count loading failed for fallback projects:', error);
                                });
                                
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
                
                // 🚀 PERFORMANCE OPTIMIZATION: Load team member and dataset counts in batch
                console.log('🔍 [DashboardCloudProjectsBridge] Loading team member and dataset counts in batch...');
                
                const projectIds = serviceProjects.map(project => project.id);
                
                const [teamMemberBatch, datasetCounts] = await Promise.all([
                    // Use batch method for team members
                    cloudProjectIntegration.getProjectTeamMembersBatch(projectIds).catch(error => {
                        console.warn('⚠️ [DashboardCloudProjectsBridge] Failed to load team members in batch, falling back to individual calls:', error);
                        return {};
                    }),
                    // Keep individual calls for datasets (already optimized)
                    Promise.all(serviceProjects.map(async (project) => {
                        try {
                            const datasets = await cloudProjectIntegration.getProjectDatasets(project.id);
                            return { projectId: project.id, count: datasets.length };
                        } catch (error) {
                            console.warn(`⚠️ [DashboardCloudProjectsBridge] Failed to load datasets for project ${project.id}:`, error);
                            return { projectId: project.id, count: 0 };
                        }
                    }))
                ]);
                
                // Convert batch result to count format
                const teamMemberCounts = projectIds.map(projectId => ({
                    projectId,
                    count: teamMemberBatch[projectId]?.length || 0
                }));
                
                // Create lookup maps
                const teamMemberCountMap: Record<string, number> = {};
                const datasetCountMap: Record<string, number> = {};
                
                teamMemberCounts.forEach(({ projectId, count }) => {
                    teamMemberCountMap[projectId] = count;
                });
                
                datasetCounts.forEach(({ projectId, count }) => {
                    datasetCountMap[projectId] = count;
                });
                
                // Update state with counts
                setProjectTeamMemberCounts(teamMemberCountMap);
                setProjectDatasetCounts(datasetCountMap);
                
                // Map projects with enhanced data
                const cloudProjects = serviceProjects.map(project => 
                    mapServiceProjectToComponentProject(
                        project, 
                        teamMemberCountMap[project.id] || 0, 
                        datasetCountMap[project.id] || 0,
                        completeUser
                    )
                );
                
                console.log('🔍 [DashboardCloudProjectsBridge] Mapped cloud projects with enhanced data:', cloudProjects);
                console.log('🔍 [DashboardCloudProjectsBridge] Mapped projects count:', cloudProjects.length);
                
                setProjects(cloudProjects);
                console.log('✅ [DashboardCloudProjectsBridge] Projects set in state with enhanced status and collaboration logic');
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
    };

    const handleCreateCollection = () => {
        setShowCollectionWizard(true);
    };

    const handleCollectionCreated = (collectionName: string, template: any) => {
        console.log(`✅ Collection '${collectionName}' created successfully`);
        // Refresh projects or show success message
        loadProjects();
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

    // Action menu handlers
    const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
        setActionMenuAnchor(prev => ({
            ...prev,
            [projectId]: event.currentTarget
        }));
    };

    const handleActionMenuClose = (projectId: string) => {
        setActionMenuAnchor(prev => ({
            ...prev,
            [projectId]: null
        }));
    };

    const handleActionsDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
        setActionsDropdownAnchor(event.currentTarget);
    };

    const handleActionsDropdownClose = () => {
        setActionsDropdownAnchor(null);
    };

    // Info popover handlers
    const handleInfoPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setInfoPopoverAnchor(event.currentTarget);
        setShowInfoPopover(true);
    };

    const handleInfoPopoverClose = () => {
        setShowInfoPopover(false);
        setInfoPopoverAnchor(null);
    };

    const handleProjectCreated = async (projectId: string) => {
        setShowCreateDialog(false);
        await loadProjects(); // Refresh the list
        // Project created successfully - no need to auto-launch
    };

    // Function to update project status
    const updateProjectStatus = useCallback(async (projectId: string, newStatus: UnifiedProjectStatus) => {
        try {
            setProjectStatusUpdating(prev => ({ ...prev, [projectId]: true }));
            
            // Map extended status to supported ProjectStatus enum values
            let mappedStatus: 'draft' | 'active' | 'archived';
            switch (newStatus) {
                case 'draft':
                    mappedStatus = 'draft';
                    break;
                case 'active':
                case 'in-progress':
                case 'completed':
                    mappedStatus = 'active';
                    break;
                case 'archived':
                case 'paused':
                    mappedStatus = 'archived';
                    break;
                default:
                    mappedStatus = 'active';
            }
            
            // Update project status via the cloud integration service
            // Using updateProject with status field since updateProjectStatus doesn't exist yet
            await cloudProjectIntegration.updateProject(projectId, { 
                status: mappedStatus as any, // Cast to any to work with the service interface
                lastActivityAt: new Date().toISOString(),
                isActive: mappedStatus !== 'archived',
                isArchived: mappedStatus === 'archived',
                // Store the extended status in metadata for UI purposes
                metadata: {
                    extendedStatus: newStatus,
                    statusUpdatedAt: new Date().toISOString()
                }
            });
            
            // Refresh the projects list to reflect the change
            await loadProjects();
            
            console.log(`✅ [DashboardCloudProjectsBridge] Project ${projectId} status updated to ${newStatus} (mapped to ${mappedStatus})`);
        } catch (error) {
            console.error(`❌ [DashboardCloudProjectsBridge] Failed to update project status:`, error);
            setError(`Failed to update project status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setProjectStatusUpdating(prev => ({ ...prev, [projectId]: false }));
        }
    }, []);

    // Function to toggle collaboration
    const toggleProjectCollaboration = useCallback(async (projectId: string, enable: boolean) => {
        try {
            setProjectStatusUpdating(prev => ({ ...prev, [projectId]: true }));
            
            // Update collaboration settings via the cloud integration service
            // Using updateProject with collaboration fields since updateProjectCollaboration doesn't exist yet
            const maxCollaborators = getCollaborationLimit(completeUser);
            await cloudProjectIntegration.updateProject(projectId, { 
                settings: {
                    allowCollaboration: enable,
                    autoEnableCollaboration: enable,
                    realTimeEnabled: enable,
                    maxCollaborators: enable ? maxCollaborators : 1
                },
                allowCollaboration: enable,
                collaborationEnabled: enable,
                realTimeEnabled: enable,
                maxCollaborators: enable ? maxCollaborators : 1,
                lastActivityAt: new Date().toISOString()
            });
            
            // Refresh the projects list to reflect the change
            await loadProjects();
            
            console.log(`✅ [DashboardCloudProjectsBridge] Project ${projectId} collaboration ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error(`❌ [DashboardCloudProjectsBridge] Failed to toggle collaboration:`, error);
            setError(`Failed to update collaboration settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setProjectStatusUpdating(prev => ({ ...prev, [projectId]: false }));
        }
    }, []);

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

    // Use unified status counting for consistent statistics
    const statusCounts = countProjectsByStatus(projects, projectTeamMemberCounts, projectDatasetCounts);
    
    const activeProjects = projects.filter(p => {
        const teamMemberCount = projectTeamMemberCounts[p.id] || 0;
        const datasetCount = projectDatasetCounts[p.id] || 0;
        const status = getProjectStatus(p, teamMemberCount, datasetCount);
        return status === 'active' || status === 'in-progress';
    });
    const archivedProjects = projects.filter(p => {
        const teamMemberCount = projectTeamMemberCounts[p.id] || 0;
        const datasetCount = projectDatasetCounts[p.id] || 0;
        const status = getProjectStatus(p, teamMemberCount, datasetCount);
        return status === 'archived';
    });

    // Calculate analytics data using unified status counting
    const analyticsData = {
        totalProjects: projects.length,
        activeProjects: statusCounts.active + statusCounts['in-progress'],
        archivedProjects: statusCounts.archived,
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

    // Helper to load all organization datasets for the management dialog
    const loadOrganizationDatasets = useCallback(async () => {
        try {
            setOrganizationDatasetsLoading(true);
            console.log('🔍 [DashboardCloudProjectsBridge] Loading organization datasets for management dialog...');
            
            const allDatasets = await cloudProjectIntegration.getAllOrganizationDatasets();
            console.log('✅ [DashboardCloudProjectsBridge] Loaded organization datasets:', allDatasets);
            
            // Add backend labels for display
            const labeled = allDatasets.map((ds: any) => {
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
            
            setOrganizationDatasets(labeled);
            
        } catch (error) {
            console.error('❌ [DashboardCloudProjectsBridge] Failed to load organization datasets:', error);
        } finally {
            setOrganizationDatasetsLoading(false);
        }
    }, []);

    // Load organization datasets when the dataset management dialog opens
    useEffect(() => {
        if (showDatasetManagementDialog) {
            loadOrganizationDatasets();
        }
    }, [showDatasetManagementDialog, loadOrganizationDatasets]);

    // 🆕 NEW: Load dataset conflict analysis
    const loadDatasetAnalysis = useCallback(async () => {
        if (!completeUser?.organizationId) {
            console.warn('⚠️ [DashboardCloudProjectsBridge] No organization ID for dataset analysis');
            return;
        }

        setLoadingDatasetAnalysis(true);
        try {
            console.log('🔍 [DashboardCloudProjectsBridge] Loading dataset conflict analysis...');
            
            // Get all organization datasets - use the same data as the management dialog
            let allDatasets = organizationDatasets;
            
            // If organization datasets aren't loaded yet, load them
            if (allDatasets.length === 0) {
                console.log('🔄 [DashboardCloudProjectsBridge] Loading organization datasets for analysis...');
                allDatasets = await cloudProjectIntegration.getAllOrganizationDatasets();
                
                // Add backend labels for consistency
                allDatasets = allDatasets.map((ds: any) => {
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
            }
            
            console.log('📊 [DashboardCloudProjectsBridge] Analyzing datasets:', {
                totalDatasets: allDatasets.length,
                firestoreDatasets: allDatasets.filter(ds => ds.storage?.backend === 'firestore').length,
                datasetsWithCollections: allDatasets.filter(ds => ds.collectionAssignment?.selectedCollections?.length > 0).length
            });
            
            // Analyze conflicts and overlaps
            const analysis = await datasetConflictAnalyzer.analyzeOrganizationDatasets(
                completeUser.organizationId,
                allDatasets
            );
            
            setDatasetAnalysis(analysis);
            console.log('✅ [DashboardCloudProjectsBridge] Dataset analysis complete:', {
                datasets: analysis.totalDatasets,
                collections: analysis.totalCollections,
                overlaps: analysis.overlaps.length,
                healthScore: analysis.healthScore,
                recommendations: analysis.globalInsights.recommendations.length
            });
            
        } catch (error) {
            console.error('❌ [DashboardCloudProjectsBridge] Failed to load dataset analysis:', error);
            setDatasetAnalysis(null);
        } finally {
            setLoadingDatasetAnalysis(false);
        }
    }, [completeUser?.organizationId, organizationDatasets]);

    // Load dataset analysis when insights dialog opens
    useEffect(() => {
        if (showDatasetInsightsDialog) {
            loadDatasetAnalysis();
        }
    }, [showDatasetInsightsDialog, loadDatasetAnalysis]);

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                            {isTeamMember() ? 'My Assigned Projects' : 'Cloud Projects'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {isTeamMember() 
                                ? (canCreateProjects 
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
                    
                    {/* Info Button */}
                    <Tooltip title="Project Management Guide" arrow>
                        <IconButton
                            onClick={handleInfoPopoverOpen}
                            sx={{
                                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                
                {/* Button row removed - consolidated into dropdown menu in tab row */}
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
            ) : null}



            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs with Actions Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => setTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label={`Active Projects (${activeProjects.length})`} />
                    <Tab label={`Archived (${archivedProjects.length})`} />
                </Tabs>
                
                {/* Consolidated Actions Dropdown */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Show message for users who cannot create projects */}
                    {!canCreateProjects && completeUser && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            px: 2,
                            py: 1,
                            backgroundColor: 'warning.light',
                            borderRadius: 2,
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
                    
                    {/* Actions Dropdown Button */}
                    <Button
                        variant="contained"
                        startIcon={<MoreVertIcon />}
                        onClick={handleActionsDropdownOpen}
                        sx={{
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: 'white',
                            borderRadius: 2,
                            px: 3,
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
                        Actions
                    </Button>
                    
                    {/* Actions Dropdown Menu */}
                    <Menu
                        anchorEl={actionsDropdownAnchor}
                        open={Boolean(actionsDropdownAnchor)}
                        onClose={handleActionsDropdownClose}
                        PaperProps={{
                            sx: {
                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                minWidth: 200,
                                '& .MuiMenuItem-root': {
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }
                            }
                        }}
                    >
                        {/* Create Project */}
                        {canCreateProjects && (
                            <MenuItem 
                                onClick={() => {
                                    handleActionsDropdownClose();
                                    console.log('🚀 [DashboardCloudProjectsBridge] Create Project button clicked');
                                    handleCreateProject();
                                }}
                            >
                                <AddIcon sx={{ mr: 2 }} />
                                Create Project
                            </MenuItem>
                        )}

                        {/* Create Collection */}
                        {canCreateProjects && (
                            <MenuItem 
                                onClick={() => {
                                    handleActionsDropdownClose();
                                    console.log('🧙‍♂️ [DashboardCloudProjectsBridge] Create Collection button clicked');
                                    handleCreateCollection();
                                }}
                            >
                                <ExtensionIcon sx={{ mr: 2 }} />
                                Create Collection
                            </MenuItem>
                        )}
                        
                        {/* Create Dataset */}
                        {canCreateProjects && (
                            <MenuItem 
                                onClick={() => {
                                    handleActionsDropdownClose();
                                    console.log('🚀 [DashboardCloudProjectsBridge] Create Dataset button clicked');
                                    setDatasetWizardAssignToProject(null);
                                    setShowCreateDatasetWizard(true);
                                }}
                            >
                                <DatasetIcon sx={{ mr: 2 }} />
                                Create Dataset
                            </MenuItem>
                        )}
                        
                        {/* Manage Datasets */}
                        {canCreateProjects && (
                            <MenuItem 
                                onClick={() => {
                                    handleActionsDropdownClose();
                                    console.log('🚀 [DashboardCloudProjectsBridge] Manage Datasets button clicked');
                                    setShowDatasetManagementDialog(true);
                                }}
                            >
                                <StorageIcon sx={{ mr: 2 }} />
                                Manage Datasets
                            </MenuItem>
                        )}
                        
                        {/* Dataset Insights */}
                        {canCreateProjects && (
                            <MenuItem 
                                onClick={() => {
                                    handleActionsDropdownClose();
                                    console.log('🚀 [DashboardCloudProjectsBridge] Dataset Insights button clicked');
                                    setShowDatasetInsightsDialog(true);
                                }}
                            >
                                <AssessmentIcon sx={{ mr: 2 }} />
                                Dataset Insights
                            </MenuItem>
                        )}
                        
                        {/* Divider */}
                        <MenuItem disabled sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', my: 1 }} />
                        
                        {/* Launch Web App */}
                        <MenuItem 
                            onClick={() => {
                                handleActionsDropdownClose();
                                handleLaunchWeb();
                            }}
                        >
                            <LaunchIcon sx={{ mr: 2 }} />
                            Launch Web App
                        </MenuItem>
                        
                        {/* Launch Desktop App */}
                        <MenuItem 
                            onClick={() => {
                                handleActionsDropdownClose();
                                handleLaunchDesktop();
                            }}
                        >
                            <LaunchIcon sx={{ mr: 2 }} />
                            Launch Desktop App
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

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
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                            <TableSortLabel
                                                active={orderBy === 'name'}
                                                direction={orderBy === 'name' ? order : 'asc'}
                                                onClick={() => handleRequestSort('name')}
                                                sx={{ color: 'white', '& .MuiTableSortLabel-icon': { color: 'white' } }}
                                            >
                                                Project
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                            <TableSortLabel
                                                active={orderBy === 'status'}
                                                direction={orderBy === 'status' ? order : 'asc'}
                                                onClick={() => handleRequestSort('status')}
                                                sx={{ color: 'white', '& .MuiTableSortLabel-icon': { color: 'white' } }}
                                            >
                                                Status
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                            <TableSortLabel
                                                active={orderBy === 'applicationMode'}
                                                direction={orderBy === 'applicationMode' ? order : 'asc'}
                                                onClick={() => handleRequestSort('applicationMode')}
                                                sx={{ color: 'white', '& .MuiTableSortLabel-icon': { color: 'white' } }}
                                            >
                                                Mode
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                            <TableSortLabel
                                                active={orderBy === 'storageBackend'}
                                                direction={orderBy === 'storageBackend' ? order : 'asc'}
                                                onClick={() => handleRequestSort('storageBackend')}
                                                sx={{ color: 'white', '& .MuiTableSortLabel-icon': { color: 'white' } }}
                                            >
                                                Storage
                                            </TableSortLabel>
                                        </TableCell>
                                        {isTeamMember() && (
                                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Your Role</TableCell>
                                        )}
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Team</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Datasets</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Collaboration</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                            <TableSortLabel
                                                active={orderBy === 'lastAccessedAt'}
                                                direction={orderBy === 'lastAccessedAt' ? order : 'asc'}
                                                onClick={() => handleRequestSort('lastAccessedAt')}
                                                sx={{ color: 'white', '& .MuiTableSortLabel-icon': { color: 'white' } }}
                                            >
                                                Last Accessed
                                            </TableSortLabel>
                                        </TableCell>
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
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {project.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={getStatusIcon(project.status)}
                                                    label={project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                                                    color={getStatusColorLocal(project.status)}
                                                    variant="filled"
                                                    sx={{ fontWeight: 600 }}
                                                />
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
                                                {typeof projectTeamMemberCounts[project.id] === 'number' ? (
                                                    <Chip
                                                        size="small"
                                                        icon={<GroupIcon />}
                                                        label={`${projectTeamMemberCounts[project.id]} member${projectTeamMemberCounts[project.id] !== 1 ? 's' : ''}`}
                                                        variant="outlined"
                                                        color={projectTeamMemberCounts[project.id] > 0 ? "primary" : "default"}
                                                        title={`${projectTeamMemberCounts[project.id]} team members assigned to this project`}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {datasetCountsLoading ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <CircularProgress size={16} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Loading...
                                                        </Typography>
                                                    </Box>
                                                ) : typeof projectDatasetCounts[project.id] === 'number' ? (
                                                    <Chip
                                                        size="small"
                                                        icon={<DatasetIcon />}
                                                        label={`${projectDatasetCounts[project.id]} dataset${projectDatasetCounts[project.id] !== 1 ? 's' : ''}`}
                                                        variant="outlined"
                                                        color={projectDatasetCounts[project.id] > 0 ? "secondary" : "default"}
                                                        title={`${projectDatasetCounts[project.id]} datasets assigned to this project`}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {project.collaborationEnabled ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            icon={<GroupIcon />}
                                                            label="Enabled"
                                                            variant="outlined"
                                                            color="success"
                                                            sx={{ fontWeight: 600 }}
                                                            title="Collaboration is enabled for this project"
                                                        />
                                                        {project.realTimeEnabled && (
                                                            <Chip
                                                                size="small"
                                                                label="Real-time"
                                                                variant="filled"
                                                                color="info"
                                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                                            />
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        label="Disabled"
                                                        variant="outlined"
                                                        color="default"
                                                        sx={{ color: 'text.secondary' }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatLastAccessed(project.lastAccessedAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => handleActionMenuOpen(event, project.id)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                backgroundColor: 'action.hover',
                                                                color: 'text.primary'
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    
                                                    <Menu
                                                        anchorEl={actionMenuAnchor[project.id]}
                                                        open={Boolean(actionMenuAnchor[project.id])}
                                                        onClose={() => handleActionMenuClose(project.id)}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
                                                        }}
                                                        PaperProps={{
                                                            sx: {
                                                                backgroundColor: 'background.paper',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                borderRadius: 2,
                                                                minWidth: 200,
                                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                                            }
                                                        }}
                                                    >
                                                        {/* Details */}
                                                        <MenuItem 
                                                            onClick={() => {
                                                                setSelectedProject(project);
                                                                handleActionMenuClose(project.id);
                                                            }}
                                                            sx={{ py: 1.5 }}
                                                        >
                                                            <VisibilityIcon sx={{ mr: 2, fontSize: 20 }} />
                                                            <Typography variant="body2">Details</Typography>
                                                        </MenuItem>
                                                        
                                                        {/* Status Actions */}
                                                        {project.status === 'draft' && (
                                                            <MenuItem 
                                                                onClick={() => {
                                                                    updateProjectStatus(project.id, 'active');
                                                                    handleActionMenuClose(project.id);
                                                                }}
                                                                disabled={projectStatusUpdating[project.id]}
                                                                sx={{ py: 1.5 }}
                                                            >
                                                                <PlayArrowIcon sx={{ mr: 2, fontSize: 20, color: 'success.main' }} />
                                                                <Typography variant="body2">Activate</Typography>
                                                            </MenuItem>
                                                        )}
                                                        
                                                        {project.status === 'active' && (
                                                            <MenuItem 
                                                                onClick={() => {
                                                                    updateProjectStatus(project.id, 'in-progress');
                                                                    handleActionMenuClose(project.id);
                                                                }}
                                                                disabled={projectStatusUpdating[project.id]}
                                                                sx={{ py: 1.5 }}
                                                            >
                                                                <PlayArrowIcon sx={{ mr: 2, fontSize: 20, color: 'info.main' }} />
                                                                <Typography variant="body2">Start</Typography>
                                                            </MenuItem>
                                                        )}
                                                        
                                                        {project.status === 'in-progress' && (
                                                            <MenuItem 
                                                                onClick={() => {
                                                                    updateProjectStatus(project.id, 'completed');
                                                                    handleActionMenuClose(project.id);
                                                                }}
                                                                disabled={projectStatusUpdating[project.id]}
                                                                sx={{ py: 1.5 }}
                                                            >
                                                                <CheckIcon sx={{ mr: 2, fontSize: 20, color: 'success.main' }} />
                                                                <Typography variant="body2">Complete</Typography>
                                                            </MenuItem>
                                                        )}
                                                        
                                                        {/* Collaboration Toggle */}
                                                        <MenuItem 
                                                            onClick={() => {
                                                                toggleProjectCollaboration(project.id, !project.collaborationEnabled);
                                                                handleActionMenuClose(project.id);
                                                            }}
                                                            disabled={projectStatusUpdating[project.id]}
                                                            sx={{ py: 1.5 }}
                                                        >
                                                            {project.collaborationEnabled ? (
                                                                <StopIcon sx={{ mr: 2, fontSize: 20, color: 'warning.main' }} />
                                                            ) : (
                                                                <PlayArrowIcon sx={{ mr: 2, fontSize: 20, color: 'success.main' }} />
                                                            )}
                                                            <Typography variant="body2">
                                                                {project.collaborationEnabled ? 'Disable Collab' : 'Enable Collab'}
                                                            </Typography>
                                                        </MenuItem>
                                                        
                                                        {/* Archive/Restore */}
                                                        <MenuItem 
                                                            onClick={async () => {
                                                                try {
                                                                    if (!project.isArchived) {
                                                                        await updateProjectStatus(project.id, 'archived');
                                                                    } else {
                                                                        await updateProjectStatus(project.id, 'active');
                                                                    }
                                                                    handleActionMenuClose(project.id);
                                                                } catch (e) {
                                                                    console.error('Failed to toggle archive', e);
                                                                    setError('Failed to update project');
                                                                }
                                                            }}
                                                            disabled={projectStatusUpdating[project.id]}
                                                            sx={{ py: 1.5 }}
                                                        >
                                                            <ArchiveIcon sx={{ mr: 2, fontSize: 20, color: project.isArchived ? 'success.main' : 'warning.main' }} />
                                                            <Typography variant="body2">
                                                                {!project.isArchived ? 'Archive' : 'Restore'}
                                                            </Typography>
                                                        </MenuItem>
                                                        
                                                        {/* Delete */}
                                                        <MenuItem 
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
                                                                    handleActionMenuClose(project.id);
                                                                } catch (e) {
                                                                    console.error('Failed to delete project:', e);
                                                                    setError(`Failed to delete project "${project.name}": ${e instanceof Error ? e.message : 'Unknown error'}`);
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            sx={{ 
                                                                py: 1.5,
                                                                color: 'error.main',
                                                                '&:hover': {
                                                                    backgroundColor: 'error.light',
                                                                    color: 'error.dark'
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
                                                            <Typography variant="body2">Delete</Typography>
                                                        </MenuItem>
                                                    </Menu>
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
                                        ? canCreateProjects
                                            ? 'No projects assigned yet. As a team admin, you can create new projects or wait for assignments from your organization administrator.'
                                            : 'No projects have been assigned to you yet. Contact your team administrator to get access to projects.'
                                        : canCreateProjects
                                            ? 'Create your first cloud project to get started with Firebase and GCS integration'
                                            : 'You need an active subscription to create projects. Please upgrade your account or contact support.'
                                    : 'Archived projects will appear here'
                                )
                            }
                        </Typography>
                        {tab === 0 && !searchQuery && canCreateProjects && (
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
                        {tab === 0 && !searchQuery && isTeamMember() && !canCreateProjects && (
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

            {/* Collection Creation Wizard */}
            <CollectionCreationWizard
                open={showCollectionWizard}
                onClose={() => setShowCollectionWizard(false)}
                onCollectionCreated={handleCollectionCreated}
            />

            {/* Enhanced Project Details Dialog */}
            <ProjectDetailsDialog
                open={!!selectedProject}
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
                onProjectUpdated={loadProjects}
                // Dataset management props
                projectDatasets={projectDatasets}
                availableDatasets={availableDatasets}
                datasetsLoading={datasetsLoading}
                datasetSearch={datasetSearch}
                datasetBackendFilter={datasetBackendFilter}
                selectedDatasetId={selectedDatasetId}
                uploading={uploading}
                onLoadDatasetsForProject={loadDatasetsForProject}
                onSetDatasetSearch={setDatasetSearch}
                onSetDatasetBackendFilter={setDatasetBackendFilter}
                onSetSelectedDatasetId={setSelectedDatasetId}
                onSetError={setError}
                // Team management props
                projectTeamMembers={projectTeamMembers}
                teamMembersLoading={teamMembersLoading}
                projectTeamMemberCounts={projectTeamMemberCounts}
                onLoadTeamMembersForProject={loadTeamMembersForProject}
                onShowTeamRoleWizard={() => setShowTeamRoleWizard(true)}
                onShowCreateDatasetWizard={() => setShowCreateDatasetWizard(true)}
                onShowDatasetManagementDialog={() => setShowDatasetManagementDialog(true)}
                onShowDatasetInsightsDialog={() => setShowDatasetInsightsDialog(true)}
            />            {/* Dataset Creation Wizard */}
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
                                borderRadius: 2,
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
                                                                                {!teamMembersLoading && availableTeamMembers.map((member: any) => {
                                                    // Enhanced name extraction for available team members
                                                    let memberDisplayName = 'Unnamed User';
                                                    
                                                    if (member.name) {
                                                        memberDisplayName = member.name;
                                                    } else if (member.fullName) {
                                                        memberDisplayName = member.fullName;
                                                    } else if (member.displayName) {
                                                        memberDisplayName = member.displayName;
                                                    } else if (member.firstName && member.lastName) {
                                                        memberDisplayName = `${member.firstName} ${member.lastName}`;
                                                    } else if (member.firstName) {
                                                        memberDisplayName = member.firstName;
                                                    } else if (member.lastName) {
                                                        memberDisplayName = member.lastName;
                                                    } else if (member.email) {
                                                        memberDisplayName = member.email.split('@')[0];
                                                    }
                                                    
                                                    return (
                                                    <MenuItem key={member.id} value={member.id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 2,
                                                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                {memberDisplayName.charAt(0)?.toUpperCase() || 'U'}
                                                            </Box>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                                                    {memberDisplayName}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                                    {member.email} • {member.licenseType || 'Licensed'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                );
                                                })}
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Project Role</InputLabel>
                            <Select
                                value={selectedTeamMemberRole}
                                onChange={(e) => setSelectedTeamMemberRole(e.target.value as string)}
                                disabled={rolesLoading}
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
                                {rolesLoading ? (
                                    <MenuItem disabled>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={16} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                Loading roles...
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ) : availableRoles.length === 0 ? (
                                    <MenuItem disabled>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            No roles available
                                        </Typography>
                                    </MenuItem>
                                ) : (
                                    availableRoles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                                        {role.displayName}
                                                    </Typography>
                                                    <Chip 
                                                        label={role.category} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 16, 
                                                            fontSize: '0.65rem',
                                                            backgroundColor: projectRoleService.getRoleDisplayColor(role.category),
                                                            color: 'white'
                                                        }} 
                                                    />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                    {projectRoleService.formatRoleDescription(role)}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
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
                            setSelectedTeamMemberRole('');
                            setAvailableRoles([]);
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
                                // Use the new unified project role service
                                await projectRoleService.addTeamMemberToProject(
                                    selectedProject.id, 
                                    selectedTeamMemberId, 
                                    selectedTeamMemberRole
                                );
                                
                                // Refresh team members list
                                await loadTeamMembersForProject(selectedProject);
                                
                                // Close dialog and reset
                                setShowAddTeamMemberDialog(false);
                                setSelectedTeamMemberId('');
                                setSelectedTeamMemberRole('');
                                setAvailableRoles([]);
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
            <Dialog
                open={showDatasetManagementDialog}
                onClose={() => setShowDatasetManagementDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxHeight: '80vh'
                    }
                }}

            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    pb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    Dataset Management
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setShowDatasetManagementDialog(false);
                            setShowCreateDatasetWizard(true);
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: 'white',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.5)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Create Dataset
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflow: 'auto' }}>
                    {organizationDatasetsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <Typography variant="body2" sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                                Loading datasets...
                            </Typography>
                        </Box>
                    ) : organizationDatasets.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <StorageIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                No Datasets Found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                                Create your first dataset to get started with data management.
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <StorageIcon sx={{ mr: 1 }} />
                                Available Datasets ({organizationDatasets.length})
                            </Typography>
                            <Grid container spacing={2}>
                                {organizationDatasets.map((dataset) => (
                                    <Grid item xs={12} sm={6} md={4} key={dataset.id}>
                                        <Card
                                            sx={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 2,
                                                color: 'white',
                                                position: 'relative',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, pb: 1 }}>
                                                <Typography variant="h6" sx={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 600, 
                                                    mb: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {dataset.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    color: 'rgba(255, 255, 255, 0.7)', 
                                                    mb: 2,
                                                    minHeight: '2.5em',
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {dataset.description || 'No description available'}
                                                </Typography>
                                                
                                                {/* Collection Info */}
                                                {dataset.storage?.backend === 'firestore' && dataset.collectionAssignment?.selectedCollections?.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ 
                                                            color: 'rgba(255, 255, 255, 0.6)', 
                                                            display: 'block', 
                                                            mb: 0.5,
                                                            fontWeight: 500
                                                        }}>
                                                            Collections ({dataset.collectionAssignment.selectedCollections.length}):
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {dataset.collectionAssignment.selectedCollections.slice(0, 2).map((collection: string) => (
                                                                <Chip
                                                                    key={collection}
                                                                    label={collection}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 18,
                                                                        fontSize: '0.65rem',
                                                                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                                                                        color: '#ffffff',
                                                                        border: '1px solid rgba(79, 70, 229, 0.3)'
                                                                    }}
                                                                />
                                                            ))}
                                                            {dataset.collectionAssignment.selectedCollections.length > 2 && (
                                                                <Chip
                                                                    label={`+${dataset.collectionAssignment.selectedCollections.length - 2}`}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 18,
                                                                        fontSize: '0.65rem',
                                                                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                                                                        color: '#9ca3af'
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}
                                                
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Chip
                                                        size="small"
                                                        label={dataset.__label?.match(/\((.*?)\)$/)?.[1] || 'Firestore'}
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                            color: 'rgba(255, 255, 255, 0.8)',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={dataset.visibility || 'private'}
                                                        variant="filled"
                                                        sx={{
                                                            backgroundColor: dataset.visibility === 'public' ? 'rgba(34, 197, 94, 0.2)' : 
                                                                           dataset.visibility === 'organization' ? 'rgba(59, 130, 246, 0.2)' : 
                                                                           'rgba(156, 163, 175, 0.2)',
                                                            color: dataset.visibility === 'public' ? '#22c55e' : 
                                                                   dataset.visibility === 'organization' ? '#3b82f6' : 
                                                                   '#9ca3af',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </Box>
                                                
                                                {/* Action Buttons */}
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('✏️ [DashboardCloudProjectsBridge] Edit dataset clicked:', dataset.id);
                                                            setDatasetToEdit(dataset);
                                                            setShowEditDatasetDialog(true);
                                                        }}
                                                        sx={{
                                                            borderColor: 'rgba(139, 92, 246, 0.3)',
                                                            color: '#8b5cf6',
                                                            minWidth: 'auto',
                                                            px: 1.5,
                                                            py: 0.5,
                                                            fontSize: '0.75rem',
                                                            '&:hover': {
                                                                borderColor: '#8b5cf6',
                                                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    
                                                    {dataset.storage?.backend === 'firestore' && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<DatasetIcon />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log('📊 [DashboardCloudProjectsBridge] View collections clicked:', dataset.id);
                                                                setSelectedDatasetForManagement(dataset);
                                                                setShowDatasetCollectionsDialog(true);
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                                                color: '#3b82f6',
                                                                minWidth: 'auto',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                fontSize: '0.75rem',
                                                                '&:hover': {
                                                                    borderColor: '#3b82f6',
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            Collections
                                                        </Button>
                                                    )}
                                                    
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const confirmDelete = window.confirm(
                                                                `Are you sure you want to delete dataset "${dataset.name}"? This action cannot be undone and will remove the dataset from all projects.`
                                                            );
                                                            
                                                            if (confirmDelete) {
                                                                try {
                                                                    console.log('🗑️ [DashboardCloudProjectsBridge] Deleting dataset:', dataset.id);
                                                                    await cloudProjectIntegration.deleteDataset(dataset.id);
                                                                    console.log('✅ [DashboardCloudProjectsBridge] Dataset deleted successfully');
                                                                    
                                                                    // Refresh organization datasets
                                                                    await loadOrganizationDatasets();
                                                                    
                                                                    // Refresh dataset counts for all projects
                                                                    await refreshDatasetCounts();
                                                                    
                                                                } catch (error) {
                                                                    console.error('❌ [DashboardCloudProjectsBridge] Failed to delete dataset:', error);
                                                                    setError(`Failed to delete dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                                }
                                                            }
                                                        }}
                                                        sx={{
                                                            borderColor: 'rgba(239, 68, 68, 0.3)',
                                                            color: '#ef4444',
                                                            minWidth: 'auto',
                                                            px: 1.5,
                                                            py: 0.5,
                                                            fontSize: '0.75rem',
                                                            '&:hover': {
                                                                borderColor: '#ef4444',
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                                
                                                <Typography variant="caption" sx={{ 
                                                    color: 'rgba(255, 255, 255, 0.5)', 
                                                    mt: 1,
                                                    display: 'block'
                                                }}>
                                                    ID: {dataset.id}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        onClick={loadOrganizationDatasets}
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        disabled={organizationDatasetsLoading}
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setShowDatasetManagementDialog(false)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
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

            {/* Team & Role Management Wizard */}
            {selectedProject && (
                <TeamRoleWizard
                    open={showTeamRoleWizard}
                    onClose={() => setShowTeamRoleWizard(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    organizationId={completeUser?.organizationId || ''}
                    existingProjectTeamMembers={projectTeamMembers}
                    onTeamMembersUpdated={() => {
                        console.log('🔄 [DashboardCloudProjectsBridge] Refreshing team members after wizard update');
                        if (selectedProject) {
                            loadTeamMembersForProject(selectedProject);
                        }
                    }}
                />
            )}

            {/* Legacy Project Role Management Dialog (kept for fallback) */}
            {selectedProject && (
                <ProjectRoleManagementDialog
                    open={showRoleManagementDialog}
                    onClose={() => setShowRoleManagementDialog(false)}
                    projectId={selectedProject.id}
                    organizationId={completeUser?.organizationId || ''}
                    projectName={selectedProject.name}
                />
            )}

            {/* Dataset Insights Dialog */}
            <Dialog
                open={showDatasetInsightsDialog}
                onClose={() => setShowDatasetInsightsDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    pb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AssessmentIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Dataset Insights & Analysis
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Global overview of dataset organization and conflicts
                            </Typography>
                        </Box>
                    </Box>
                    {datasetAnalysis && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ 
                                color: datasetAnalysis.healthScore >= 80 ? '#10b981' : 
                                       datasetAnalysis.healthScore >= 60 ? '#f59e0b' : '#ef4444',
                                fontWeight: 700
                            }}>
                                {datasetAnalysis.healthScore}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Health Score
                            </Typography>
                        </Box>
                    )}
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, overflow: 'auto' }}>
                    {loadingDatasetAnalysis ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#8b5cf6', mr: 2 }} />
                            <Typography variant="body1">Analyzing dataset organization...</Typography>
                        </Box>
                    ) : datasetAnalysis ? (
                        <Box>
                            {/* Dataset Summary */}
                            <Box sx={{ mb: 4, p: 3, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AssessmentIcon sx={{ color: '#8b5cf6' }} />
                                    Dataset Analysis Summary
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea' }}>
                                                {datasetAnalysis.totalDatasets}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Total Datasets
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#f093fb' }}>
                                                {organizationDatasets.filter(ds => ds.storage?.backend === 'firestore').length}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Firestore Datasets
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#4facfe' }}>
                                                {datasetAnalysis.totalCollections}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Unique Collections
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ 
                                                fontWeight: 700, 
                                                color: datasetAnalysis.overlaps.length > 0 ? '#fc4a1a' : '#11998e'
                                            }}>
                                                {datasetAnalysis.overlaps.length}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Collection Overlaps
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Overview Cards */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {datasetAnalysis.totalDatasets}
                                        </Typography>
                                        <Typography variant="body2">Total Datasets</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: 'white',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {datasetAnalysis.totalCollections}
                                        </Typography>
                                        <Typography variant="body2">Unique Collections</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        color: 'white',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {datasetAnalysis.overlaps.length}
                                        </Typography>
                                        <Typography variant="body2">Collection Overlaps</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Card sx={{ 
                                        background: datasetAnalysis.globalInsights.redundantAssignments.length > 0 ?
                                            'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' :
                                            'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                        color: 'white',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {datasetAnalysis.globalInsights.redundantAssignments.length}
                                        </Typography>
                                        <Typography variant="body2">Redundancies</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Collection Overlaps */}
                            {datasetAnalysis.overlaps.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WarningIcon color="warning" />
                                        Collection Overlaps
                                    </Typography>
                                    {datasetAnalysis.overlaps.map((overlap, index) => (
                                        <Card key={index} sx={{ 
                                            mb: 2, 
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            border: `2px solid ${
                                                overlap.conflictLevel === 'high' ? '#ef4444' :
                                                overlap.conflictLevel === 'medium' ? '#f59e0b' : '#10b981'
                                            }`
                                        }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <StorageIcon />
                                                        {overlap.collection}
                                                    </Typography>
                                                    <Chip 
                                                        label={overlap.conflictLevel.toUpperCase()} 
                                                        color={
                                                            overlap.conflictLevel === 'high' ? 'error' :
                                                            overlap.conflictLevel === 'medium' ? 'warning' : 'success'
                                                        }
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    Used by {overlap.datasets.length} datasets: {overlap.datasets.map(d => d.name).join(', ')}
                                                </Typography>
                                                {overlap.conflictReasons.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                                            Issues:
                                                        </Typography>
                                                        {overlap.conflictReasons.map((reason, i) => (
                                                            <Typography key={i} variant="body2" sx={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                                                • {reason}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                )}
                                                {overlap.recommendations.length > 0 && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                                            Recommendations:
                                                        </Typography>
                                                        {overlap.recommendations.map((rec, i) => (
                                                            <Typography key={i} variant="body2" sx={{ color: '#10b981', fontSize: '0.85rem' }}>
                                                                💡 {rec}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}

                            {/* Most Used Collections */}
                            {datasetAnalysis.globalInsights.mostUsedCollections.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUpIcon color="primary" />
                                        Most Used Collections
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {datasetAnalysis.globalInsights.mostUsedCollections.slice(0, 6).map((item, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 2 }}>
                                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <DatasetIcon color="primary" />
                                                        {item.collection}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                        Used by {item.count} dataset{item.count !== 1 ? 's' : ''}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        {item.datasets.slice(0, 2).map((dataset, i) => (
                                                            <Chip 
                                                                key={i}
                                                                label={dataset} 
                                                                size="small" 
                                                                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                                            />
                                                        ))}
                                                        {item.datasets.length > 2 && (
                                                            <Chip 
                                                                label={`+${item.datasets.length - 2} more`} 
                                                                size="small" 
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Global Recommendations */}
                            {datasetAnalysis.globalInsights.recommendations.length > 0 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <InfoIcon color="info" />
                                        Optimization Recommendations
                                    </Typography>
                                    {datasetAnalysis.globalInsights.recommendations.map((rec, index) => (
                                        <Alert key={index} severity="info" sx={{ mb: 1, bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
                                            {rec}
                                        </Alert>
                                    ))}
                                </Box>
                            )}

                            {/* Perfect State Message */}
                            {datasetAnalysis.overlaps.length === 0 && datasetAnalysis.globalInsights.redundantAssignments.length === 0 && datasetAnalysis.totalDatasets > 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CheckCircle sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
                                    <Typography variant="h5" sx={{ color: '#10b981', mb: 1 }}>
                                        Excellent Dataset Organization!
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        No conflicts or redundancies detected. Your datasets are well-organized.
                                    </Typography>
                                </Box>
                            )}
                            
                            {/* No Datasets State */}
                            {datasetAnalysis.totalDatasets === 0 && (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <StorageIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)', mb: 3 }} />
                                    <Typography variant="h5" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                                        No Datasets Found
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, maxWidth: 400, mx: 'auto' }}>
                                        Create your first dataset to start organizing your data and see detailed insights about collection usage and potential conflicts.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                            setShowDatasetInsightsDialog(false);
                                            setShowCreateDatasetWizard(true);
                                        }}
                                        sx={{
                                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                            color: 'white',
                                            borderRadius: 2,
                                            px: 4,
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Create Your First Dataset
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <AssessmentIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)', mb: 3 }} />
                            <Typography variant="h5" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                                Dataset Analysis Unavailable
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, maxWidth: 400, mx: 'auto' }}>
                                Unable to load dataset analysis. This could be due to missing organization data or a temporary service issue.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadDatasetAnalysis}
                                    sx={{
                                        borderColor: 'rgba(139, 92, 246, 0.3)',
                                        color: '#8b5cf6',
                                        '&:hover': {
                                            borderColor: '#8b5cf6',
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                        }
                                    }}
                                >
                                    Retry Analysis
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        setShowDatasetInsightsDialog(false);
                                        setShowCreateDatasetWizard(true);
                                    }}
                                    sx={{
                                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #7c3aed, #9333ea)'
                                        }
                                    }}
                                >
                                    Create Dataset
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ 
                    p: 3, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        onClick={loadDatasetAnalysis}
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        disabled={loadingDatasetAnalysis}
                        sx={{
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            color: '#8b5cf6',
                            '&:hover': {
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                            }
                        }}
                    >
                        Refresh Analysis
                    </Button>
                    <Button
                        onClick={() => setShowDatasetInsightsDialog(false)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
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

            {/* Dataset Collections Dialog */}
            <Dialog
                open={showDatasetCollectionsDialog}
                onClose={() => {
                    setShowDatasetCollectionsDialog(false);
                    setSelectedDatasetForManagement(null);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    pb: 2,
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <DatasetIcon sx={{ color: '#3b82f6' }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Dataset Collections
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {selectedDatasetForManagement?.name || 'Dataset'}
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3 }}>
                    {selectedDatasetForManagement && (
                        <Box>
                            {/* Dataset Info */}
                            <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {selectedDatasetForManagement.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                                    {selectedDatasetForManagement.description || 'No description available'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        size="small" 
                                        label={selectedDatasetForManagement.storage?.backend || 'firestore'} 
                                        sx={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc' }}
                                    />
                                    <Chip 
                                        size="small" 
                                        label={selectedDatasetForManagement.visibility || 'private'} 
                                        sx={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}
                                    />
                                </Box>
                            </Box>

                            {/* Collections Section */}
                            {selectedDatasetForManagement.storage?.backend === 'firestore' ? (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StorageIcon sx={{ color: '#f59e0b' }} />
                                        Firestore Collections
                                    </Typography>
                                    
                                    {selectedDatasetForManagement.collectionAssignment?.selectedCollections?.length > 0 ? (
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                                                This dataset includes {selectedDatasetForManagement.collectionAssignment.selectedCollections.length} collection(s):
                                            </Typography>
                                            
                                            <Grid container spacing={1}>
                                                {selectedDatasetForManagement.collectionAssignment.selectedCollections.map((collection: string, index: number) => (
                                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                background: 'rgba(245, 158, 11, 0.1)',
                                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <DatasetIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {collection}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                            
                                            {selectedDatasetForManagement.collectionAssignment.organizationScope && (
                                                <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                    <Typography variant="body2" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <SecurityIcon sx={{ fontSize: 16 }} />
                                                        Organization scoped for data isolation
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <WarningIcon sx={{ fontSize: 48, color: 'rgba(245, 158, 11, 0.5)', mb: 2 }} />
                                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                                No Collections Assigned
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                This Firestore dataset doesn't have any collections assigned yet.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <InfoIcon sx={{ fontSize: 48, color: 'rgba(59, 130, 246, 0.5)', mb: 2 }} />
                                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                        Non-Firestore Dataset
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        Collection management is only available for Firestore datasets.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ 
                    p: 3, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        onClick={() => {
                            if (selectedDatasetForManagement) {
                                setDatasetToEdit(selectedDatasetForManagement);
                                setShowEditDatasetDialog(true);
                                setShowDatasetCollectionsDialog(false);
                            }
                        }}
                        variant="outlined"
                        startIcon={<EditIcon />}
                        sx={{
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            color: '#8b5cf6',
                            '&:hover': {
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                            }
                        }}
                    >
                        Edit Dataset
                    </Button>
                    <Button
                        onClick={() => {
                            setShowDatasetCollectionsDialog(false);
                            setSelectedDatasetForManagement(null);
                        }}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
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

            {/* Edit Dataset Dialog */}
            <EditDatasetDialog
                open={showEditDatasetDialog}
                onClose={() => {
                    setShowEditDatasetDialog(false);
                    setDatasetToEdit(null);
                }}
                dataset={datasetToEdit}
                existingDatasets={organizationDatasets}
                onDatasetUpdated={(updatedDataset) => {
                    console.log('✅ [DashboardCloudProjectsBridge] Dataset updated:', updatedDataset);
                    
                    // Update the dataset in project datasets if it's currently displayed
                    if (selectedProject) {
                        setProjectDatasets(prev => 
                            prev.map(ds => ds.id === updatedDataset.id ? updatedDataset : ds)
                        );
                    }
                    
                    // Update organization datasets
                    setOrganizationDatasets(prev => 
                        prev.map(ds => ds.id === updatedDataset.id ? updatedDataset : ds)
                    );
                    
                    // Update selected dataset for management if it's the same
                    if (selectedDatasetForManagement?.id === updatedDataset.id) {
                        setSelectedDatasetForManagement(updatedDataset);
                    }
                    
                    // Refresh dataset analysis if insights dialog is open
                    if (showDatasetInsightsDialog) {
                        loadDatasetAnalysis();
                    }
                }}
            />

            {/* Comprehensive Info Popover */}
            <Popover
                open={showInfoPopover}
                anchorEl={infoPopoverAnchor}
                onClose={handleInfoPopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        width: 800,
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        borderRadius: 3,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Project Management Guide
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Step-by-step instructions for effective project setup and management
                            </Typography>
                        </Box>
                    </Box>

                    {/* Step-by-Step Workflow */}
                    <Stepper orientation="vertical" sx={{ mb: 3 }}>
                        {/* Step 1: Create Project */}
                        <Step active={true}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        1
                                    </Box>
                                )}
                                sx={{ color: 'white' }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                    Create Your Project
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ pl: 2, pb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                                        Start by creating a new project with the proper configuration:
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Click 'Create Project' button or use the Actions menu"
                                                secondary="Choose between Standalone (local) or Network (collaborative) mode"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Configure storage backend"
                                                secondary="Select Firestore for web-only projects, or GCS/S3 for file storage"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Set project name and description"
                                                secondary="Use descriptive names that clearly identify the project purpose"
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </StepContent>
                        </Step>

                        {/* Step 2: Create Datasets with Collections */}
                        <Step active={true}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        2
                                    </Box>
                                )}
                                sx={{ color: 'white' }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                    Create Datasets with Collections
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ pl: 2, pb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                                        Datasets organize your data and define which Firestore collections to use:
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <StorageIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Access Dataset Management from Actions menu"
                                                secondary="Click 'Dataset Management' to view and create datasets"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Create new dataset with 'Create Dataset' button"
                                                secondary="Configure dataset name, description, and visibility settings"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Select Firestore collections to include"
                                                secondary="Choose which collections from your Firestore database to include in this dataset"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Set dataset visibility and permissions"
                                                secondary="Configure whether dataset is private, organization-wide, or public"
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </StepContent>
                        </Step>

                        {/* Step 3: Assign Datasets to Projects */}
                        <Step active={true}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        3
                                    </Box>
                                )}
                                sx={{ color: 'white' }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                    Assign Datasets to Projects
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ pl: 2, pb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                                        Connect your datasets to specific projects for organized data access:
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <LinkIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Click on any project in the table"
                                                secondary="This opens the project details and management options"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Use 'Assign Dataset' option"
                                                secondary="Select from available datasets to assign to this project"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Configure dataset permissions for the project"
                                                secondary="Set read/write permissions and access levels for team members"
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </StepContent>
                        </Step>

                        {/* Step 4: Assign Team Members */}
                        <Step active={true}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        4
                                    </Box>
                                )}
                                sx={{ color: 'white' }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                    Assign Team Members to Project Roles
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ pl: 2, pb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                                        Add team members and assign appropriate roles for collaboration:
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <PeopleIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Access 'Team Management' from project actions"
                                                secondary="Click on a project, then select team management options"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Add team members to the project"
                                                secondary="Search and select team members from your organization"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Assign appropriate roles (Admin, Member, Viewer)"
                                                secondary="Set role-based permissions for project access and management"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemIcon>
                                                <CheckCircleOutlineIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Configure collaboration settings"
                                                secondary="Enable real-time collaboration and set collaboration limits"
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </StepContent>
                        </Step>
                    </Stepper>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Best Practices Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LightbulbIcon sx={{ color: '#fbbf24' }} />
                            Best Practices
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white'
                                }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#10b981' }}>
                                            Project Organization
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            • Use descriptive project names that clearly identify purpose<br/>
                                            • Group related projects with consistent naming conventions<br/>
                                            • Archive completed projects to keep active list clean
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white'
                                }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#3b82f6' }}>
                                            Dataset Management
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            • Create datasets for specific data types or use cases<br/>
                                            • Use clear collection naming in Firestore<br/>
                                            • Set appropriate visibility levels for data security
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white'
                                }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8b5cf6' }}>
                                            Team Collaboration
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            • Assign roles based on team member responsibilities<br/>
                                            • Use Admin role sparingly for security<br/>
                                            • Enable collaboration only when needed
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white'
                                }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#f59e0b' }}>
                                            Security & Access
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            • Review dataset visibility settings regularly<br/>
                                            • Monitor team member access and roles<br/>
                                            • Use organization-level permissions when appropriate
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Quick Actions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon sx={{ color: '#ef4444' }} />
                            Quick Actions
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        handleInfoPopoverClose();
                                        handleCreateProject();
                                    }}
                                    sx={{
                                        borderColor: 'rgba(16, 185, 129, 0.3)',
                                        color: '#10b981',
                                        '&:hover': {
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                        }
                                    }}
                                >
                                    Create New Project
                                </Button>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<StorageIcon />}
                                    onClick={() => {
                                        handleInfoPopoverClose();
                                        setShowDatasetManagementDialog(true);
                                    }}
                                    sx={{
                                        borderColor: 'rgba(59, 130, 246, 0.3)',
                                        color: '#3b82f6',
                                        '&:hover': {
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                        }
                                    }}
                                >
                                    Manage Datasets
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Need more help? Contact support or check the documentation.
                        </Typography>
                        <Button
                            variant="text"
                            onClick={handleInfoPopoverClose}
                            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        >
                            Close Guide
                        </Button>
                    </Box>
                </Box>
            </Popover>

        </Box>
    );
};

export default DashboardCloudProjectsBridge;
