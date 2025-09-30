/**
 * ============================================================================
 * COMPREHENSIVE ROLE TEMPLATE SYSTEM
 * ============================================================================
 * 
 * Industry-agnostic role template system that leverages the 50+ production roles
 * to create templates for various industries and event types.
 * 
 * Features:
 * - Film & Television templates
 * - Corporate Events templates  
 * - Live Events & Concerts templates
 * - Educational & Training templates
 * - Sports & Broadcasting templates
 * - Interactive role guide with search and filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Collapse,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Autocomplete,
  Popover,
  Paper,
  InputAdornment,
  Badge,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Movie as MovieIcon,
  Business as BusinessIcon,
  MusicNote as MusicIcon,
  School as SchoolIcon,
  SportsEsports as SportsIcon,
  Event as EventIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  Recommend as RecommendIcon,
  Category as CategoryIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

// Define UserRole enum locally (matching the Dashboard system)
export enum UserRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  MANAGER = 'MANAGER',
  EXEC = 'EXEC',
  POST_COORDINATOR = 'POST_COORDINATOR',
  POST_PRODUCTION_SUPERVISOR = 'POST_PRODUCTION_SUPERVISOR',
  MEDIA_MANAGER = 'MEDIA_MANAGER',
  PRODUCER = 'PRODUCER',
  ASSOCIATE_PRODUCER = 'ASSOCIATE_PRODUCER',
  POST_PRODUCER = 'POST_PRODUCER',
  LINE_PRODUCER = 'LINE_PRODUCER',
  KEYNOTE_PRODUCER = 'KEYNOTE_PRODUCER',
  KEYNOTE_PROD = 'KEYNOTE_PROD',
  PRODUCTION_ASSISTANT = 'PRODUCTION_ASSISTANT',
  POST_PA = 'POST_PA',
  DIRECTOR = 'DIRECTOR',
  ART_DIRECTOR = 'ART_DIRECTOR',
  ASSIST_DIRECTOR = 'ASSIST_DIRECTOR',
  EDITOR = 'EDITOR',
  ASSISTANT_EDITOR = 'ASSISTANT_EDITOR',
  CAMERA_OPERATOR = 'CAMERA_OPERATOR',
  SOUND_ENGINEER = 'SOUND_ENGINEER',
  LIGHTING_TECHNICIAN = 'LIGHTING_TECHNICIAN',
  DIT = 'DIT',
  TECH = 'TECH',
  NETWORKING = 'NETWORKING',
  COLORIST = 'COLORIST',
  AUDIO_PRODUCTION = 'AUDIO_PRODUCTION',
  AUDIO_POST = 'AUDIO_POST',
  GFX_ARTIST = 'GFX_ARTIST',
  KEYNOTE_POST = 'KEYNOTE_POST',
  QC_SPECIALIST = 'QC_SPECIALIST'
}

// Industry Categories
export enum IndustryType {
  FILM_TV = 'FILM_TV',
  CORPORATE = 'CORPORATE', 
  LIVE_EVENTS = 'LIVE_EVENTS',
  EDUCATION = 'EDUCATION',
  SPORTS = 'SPORTS',
  STREAMING = 'STREAMING',
  GAMING = 'GAMING',
  MARKETING = 'MARKETING'
}

// Event Types
export enum EventType {
  FEATURE_FILM = 'FEATURE_FILM',
  TV_SERIES = 'TV_SERIES',
  DOCUMENTARY = 'DOCUMENTARY',
  COMMERCIAL = 'COMMERCIAL',
  MUSIC_VIDEO = 'MUSIC_VIDEO',
  CORPORATE_VIDEO = 'CORPORATE_VIDEO',
  TRAINING_VIDEO = 'TRAINING_VIDEO',
  WEBINAR = 'WEBINAR',
  CONFERENCE = 'CONFERENCE',
  CONCERT = 'CONCERT',
  SPORTS_BROADCAST = 'SPORTS_BROADCAST',
  LIVE_STREAM = 'LIVE_STREAM',
  PODCAST = 'PODCAST',
  GAMING_STREAM = 'GAMING_STREAM'
}

// Role Template Interface
export interface RoleTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  industry: IndustryType;
  eventTypes: EventType[];
  category: string;
  hierarchy: number;
  baseRole: UserRole;
  permissions: any;
  tags: string[];
  isPopular: boolean;
  usageCount: number;
  icon: string;
  color: string;
}

// Industry Template Collections
export const INDUSTRY_TEMPLATES: Record<IndustryType, RoleTemplate[]> = {
  [IndustryType.FILM_TV]: [
    {
      id: 'film-director',
      name: 'FILM_DIRECTOR',
      displayName: 'Film Director',
      description: 'Creative vision and direction for film projects',
      industry: IndustryType.FILM_TV,
      eventTypes: [EventType.FEATURE_FILM, EventType.TV_SERIES, EventType.DOCUMENTARY],
      category: 'Creative Leadership',
      hierarchy: 85,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      tags: ['creative', 'leadership', 'vision', 'storytelling'],
      isPopular: true,
      usageCount: 1250,
      icon: '🎬',
      color: '#388e3c'
    },
    {
      id: 'lead-editor',
      name: 'LEAD_EDITOR',
      displayName: 'Lead Editor',
      description: 'Primary editor responsible for final cut and editorial decisions',
      industry: IndustryType.FILM_TV,
      eventTypes: [EventType.FEATURE_FILM, EventType.TV_SERIES, EventType.DOCUMENTARY, EventType.COMMERCIAL],
      category: 'Editorial',
      hierarchy: 70,
      baseRole: UserRole.EDITOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, access_media_library: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, manage_review_cycles: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        inventory: { create_assets: true, edit_assets: true, manage_checkouts: true, view_asset_reports: true }
      },
      tags: ['editing', 'storytelling', 'post-production', 'creative'],
      isPopular: true,
      usageCount: 2100,
      icon: '✂️',
      color: '#ff9800'
    },
    {
      id: 'post-supervisor',
      name: 'POST_SUPERVISOR',
      displayName: 'Post-Production Supervisor',
      description: 'Oversees entire post-production pipeline and workflow',
      industry: IndustryType.FILM_TV,
      eventTypes: [EventType.FEATURE_FILM, EventType.TV_SERIES, EventType.DOCUMENTARY],
      category: 'Post-Production Management',
      hierarchy: 75,
      baseRole: UserRole.POST_PRODUCTION_SUPERVISOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true, manage_post_tasks: true, access_media_library: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        system: { access_settings: true, manage_integrations: true }
      },
      tags: ['management', 'post-production', 'workflow', 'coordination'],
      isPopular: true,
      usageCount: 890,
      icon: '🎭',
      color: '#512da8'
    }
  ],

  [IndustryType.CORPORATE]: [
    {
      id: 'corporate-producer',
      name: 'CORPORATE_PRODUCER',
      displayName: 'Corporate Video Producer',
      description: 'Manages corporate video production from concept to delivery',
      industry: IndustryType.CORPORATE,
      eventTypes: [EventType.CORPORATE_VIDEO, EventType.TRAINING_VIDEO, EventType.WEBINAR],
      category: 'Production Management',
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true }
      },
      tags: ['corporate', 'production', 'management', 'business'],
      isPopular: true,
      usageCount: 1560,
      icon: '🏢',
      color: '#1976d2'
    },
    {
      id: 'training-coordinator',
      name: 'TRAINING_COORDINATOR',
      displayName: 'Training Content Coordinator',
      description: 'Coordinates educational and training video content production',
      industry: IndustryType.CORPORATE,
      eventTypes: [EventType.TRAINING_VIDEO, EventType.WEBINAR, EventType.CONFERENCE],
      category: 'Educational Production',
      hierarchy: 55,
      baseRole: UserRole.POST_COORDINATOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, manage_post_tasks: true },
        postProduction: { manage_tasks: true, manage_review_cycles: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true }
      },
      tags: ['training', 'education', 'coordination', 'learning'],
      isPopular: false,
      usageCount: 720,
      icon: '📚',
      color: '#7b1fa2'
    }
  ],

  [IndustryType.LIVE_EVENTS]: [
    {
      id: 'live-director',
      name: 'LIVE_DIRECTOR',
      displayName: 'Live Event Director',
      description: 'Directs live event broadcasts and streaming productions',
      industry: IndustryType.LIVE_EVENTS,
      eventTypes: [EventType.CONCERT, EventType.CONFERENCE, EventType.LIVE_STREAM, EventType.SPORTS_BROADCAST],
      category: 'Live Production',
      hierarchy: 80,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, view_all_alerts: true, manage_automation: true, configure_settings: true },
        system: { access_settings: true, manage_integrations: true }
      },
      tags: ['live', 'broadcast', 'real-time', 'events'],
      isPopular: true,
      usageCount: 980,
      icon: '📡',
      color: '#d32f2f'
    },
    {
      id: 'technical-director',
      name: 'TECHNICAL_DIRECTOR',
      displayName: 'Technical Director',
      description: 'Manages technical aspects of live productions and broadcasts',
      industry: IndustryType.LIVE_EVENTS,
      eventTypes: [EventType.CONCERT, EventType.SPORTS_BROADCAST, EventType.LIVE_STREAM],
      category: 'Technical Management',
      hierarchy: 70,
      baseRole: UserRole.NETWORKING,
      permissions: {
        system: { access_settings: true, manage_integrations: true, view_system_logs: true },
        automation: { view_all_sessions: true, manage_automation: true, configure_settings: true },
        inventory: { create_assets: true, edit_assets: true, delete_assets: true, manage_checkouts: true, manage_ip_addresses: true, bulk_operations: true }
      },
      tags: ['technical', 'live', 'broadcast', 'infrastructure'],
      isPopular: false,
      usageCount: 450,
      icon: '⚡',
      color: '#546e7a'
    }
  ],

  [IndustryType.EDUCATION]: [
    {
      id: 'educational-producer',
      name: 'EDUCATIONAL_PRODUCER',
      displayName: 'Educational Content Producer',
      description: 'Produces educational videos and e-learning content',
      industry: IndustryType.EDUCATION,
      eventTypes: [EventType.TRAINING_VIDEO, EventType.WEBINAR, EventType.DOCUMENTARY],
      category: 'Educational Production',
      hierarchy: 60,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        postProduction: { manage_tasks: true, manage_review_cycles: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true }
      },
      tags: ['education', 'learning', 'content', 'instructional'],
      isPopular: false,
      usageCount: 650,
      icon: '🎓',
      color: '#388e3c'
    }
  ],

  [IndustryType.SPORTS]: [
    {
      id: 'sports-producer',
      name: 'SPORTS_PRODUCER',
      displayName: 'Sports Broadcast Producer',
      description: 'Produces live sports broadcasts and highlight packages',
      industry: IndustryType.SPORTS,
      eventTypes: [EventType.SPORTS_BROADCAST, EventType.LIVE_STREAM],
      category: 'Sports Production',
      hierarchy: 75,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, manage_automation: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      tags: ['sports', 'live', 'broadcast', 'highlights'],
      isPopular: false,
      usageCount: 380,
      icon: '🏆',
      color: '#ff5722'
    }
  ],

  [IndustryType.STREAMING]: [
    {
      id: 'stream-producer',
      name: 'STREAM_PRODUCER',
      displayName: 'Streaming Content Producer',
      description: 'Produces content specifically for streaming platforms',
      industry: IndustryType.STREAMING,
      eventTypes: [EventType.TV_SERIES, EventType.DOCUMENTARY, EventType.LIVE_STREAM],
      category: 'Streaming Production',
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, export_final_media: true },
        reports: { create_reports: true, access_analytics: true }
      },
      tags: ['streaming', 'digital', 'platform', 'content'],
      isPopular: true,
      usageCount: 1200,
      icon: '📺',
      color: '#9c27b0'
    }
  ],

  [IndustryType.GAMING]: [
    {
      id: 'gaming-producer',
      name: 'GAMING_PRODUCER',
      displayName: 'Gaming Content Producer',
      description: 'Produces gaming content, streams, and esports events',
      industry: IndustryType.GAMING,
      eventTypes: [EventType.GAMING_STREAM, EventType.LIVE_STREAM],
      category: 'Gaming Production',
      hierarchy: 60,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true },
        automation: { view_all_sessions: true, manage_automation: true },
        reports: { create_reports: true, access_analytics: true }
      },
      tags: ['gaming', 'esports', 'streaming', 'interactive'],
      isPopular: false,
      usageCount: 290,
      icon: '🎮',
      color: '#673ab7'
    }
  ],

  [IndustryType.MARKETING]: [
    {
      id: 'marketing-producer',
      name: 'MARKETING_PRODUCER',
      displayName: 'Marketing Video Producer',
      description: 'Produces marketing and promotional video content',
      industry: IndustryType.MARKETING,
      eventTypes: [EventType.COMMERCIAL, EventType.MUSIC_VIDEO, EventType.CORPORATE_VIDEO],
      category: 'Marketing Production',
      hierarchy: 60,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      tags: ['marketing', 'promotional', 'commercial', 'brand'],
      isPopular: true,
      usageCount: 1100,
      icon: '📢',
      color: '#ff9800'
    }
  ]
};

// Role Guide Interface
interface RoleGuideProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelectTemplate: (template: RoleTemplate) => void;
  onCreateCustom: () => void;
}

export const RoleGuide: React.FC<RoleGuideProps> = ({
  open,
  anchorEl,
  onClose,
  onSelectTemplate,
  onCreateCustom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  // Get all templates (prioritize enhanced templates)
  const allTemplates = useMemo(() => {
    try {
      // Import enhanced templates dynamically
      const enhancedModule = (globalThis as any).require?.('./EnhancedRoleTemplates');
      const enhancedTemplates = enhancedModule?.getAllEnhancedTemplates?.();
      
      // If we have enhanced templates, use them
      if (enhancedTemplates && enhancedTemplates.length > 0) {
        console.log(`🎯 Loaded ${enhancedTemplates.length} enhanced role templates`);
        return enhancedTemplates;
      }
    } catch (error) {
      console.warn('Enhanced templates not available, using basic templates:', error);
    }
    
    // Fallback to basic templates
    const basicTemplates = Object.values(INDUSTRY_TEMPLATES).flat();
    console.log(`📋 Loaded ${basicTemplates.length} basic role templates`);
    return basicTemplates;
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((template: any) => {
      const matchesSearch = template.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesIndustry = selectedIndustry === 'ALL' || template.industry === selectedIndustry;
      const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory;
      const matchesPopular = !showPopularOnly || template.isPopular;

      return matchesSearch && matchesIndustry && matchesCategory && matchesPopular;
    });
  }, [allTemplates, searchQuery, selectedIndustry, selectedCategory, showPopularOnly]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allTemplates.map((t: any) => t.category));
    return Array.from(cats).sort();
  }, [allTemplates]);

  // Get industry icons
  const getIndustryIcon = (industry: IndustryType) => {
    const icons = {
      [IndustryType.FILM_TV]: <MovieIcon />,
      [IndustryType.CORPORATE]: <BusinessIcon />,
      [IndustryType.LIVE_EVENTS]: <EventIcon />,
      [IndustryType.EDUCATION]: <SchoolIcon />,
      [IndustryType.SPORTS]: <SportsIcon />,
      [IndustryType.STREAMING]: <MovieIcon />,
      [IndustryType.GAMING]: <SportsIcon />,
      [IndustryType.MARKETING]: <BusinessIcon />
    };
    return icons[industry] || <GroupIcon />;
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
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
          width: 600,
          maxHeight: 700,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Role Guide
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search and Filters */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search roles, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value as IndustryType | 'ALL')}
                >
                  <MenuItem value="ALL">All Industries</MenuItem>
                  {Object.values(IndustryType).map(industry => (
                    <MenuItem key={industry} value={industry}>
                      <Box display="flex" alignItems="center">
                        {getIndustryIcon(industry)}
                        <Typography sx={{ ml: 1 }}>
                          {industry.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={String(category)} value={String(category)}>
                      {String(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Switch
                checked={showPopularOnly}
                onChange={(e) => setShowPopularOnly(e.target.checked)}
              />
            }
            label="Show popular only"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Templates Grid */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {filteredTemplates.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No templates found matching your criteria
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredTemplates.map((template: any) => (
                <Grid item xs={12} key={template.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box display="flex" alignItems="flex-start" flex={1}>
                          <Typography sx={{ fontSize: '1.5em', mr: 2 }}>
                            {template.icon}
                          </Typography>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {template.displayName}
                              </Typography>
                              {template.isPopular && (
                                <Chip 
                                  label="Popular" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {template.description}
                            </Typography>
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              <Chip 
                                label={template.industry.replace('_', ' ')} 
                                size="small" 
                                variant="outlined"
                              />
                              <Chip 
                                label={`Level ${template.hierarchy}`} 
                                size="small" 
                                color="secondary"
                              />
                              {template.tags.slice(0, 2).map((tag: string) => (
                                <Chip 
                                  key={tag}
                                  label={tag} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {template.usageCount} uses
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {filteredTemplates.length} templates found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateCustom}
          >
            Create Custom Role
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default RoleGuide;
