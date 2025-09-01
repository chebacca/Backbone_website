/**
 * ============================================================================
 * ENHANCED INDUSTRY ROLE TEMPLATES - RESEARCH-BASED COMPREHENSIVE SYSTEM
 * ============================================================================
 * 
 * Based on 2024 industry research, this system provides comprehensive role
 * templates across 12+ industries with RACI framework integration and
 * hierarchical access control (1-100 scale).
 * 
 * Industries Covered:
 * - Film & Television Production
 * - Corporate Events & Conferences  
 * - Live Events & Concerts
 * - Sports Broadcasting
 * - Gaming & Esports
 * - Healthcare Projects
 * - IT & Technology
 * - Marketing & Advertising
 * - Education & Training
 * - Construction & Engineering
 * - Finance & Banking
 * - Government & Public Sector
 */

import { UserRole } from './RoleTemplateSystem';

// RACI Framework Integration
export enum RACILevel {
  RESPONSIBLE = 'RESPONSIBLE',    // Does the work
  ACCOUNTABLE = 'ACCOUNTABLE',   // Ultimately answerable
  CONSULTED = 'CONSULTED',       // Input sought
  INFORMED = 'INFORMED'          // Kept updated
}

// Enhanced Industry Types (12+ Industries)
export enum EnhancedIndustryType {
  FILM_TV = 'FILM_TV',
  CORPORATE_EVENTS = 'CORPORATE_EVENTS',
  LIVE_EVENTS = 'LIVE_EVENTS',
  SPORTS_BROADCAST = 'SPORTS_BROADCAST',
  GAMING_ESPORTS = 'GAMING_ESPORTS',
  HEALTHCARE = 'HEALTHCARE',
  IT_TECHNOLOGY = 'IT_TECHNOLOGY',
  MARKETING_ADVERTISING = 'MARKETING_ADVERTISING',
  EDUCATION_TRAINING = 'EDUCATION_TRAINING',
  CONSTRUCTION_ENGINEERING = 'CONSTRUCTION_ENGINEERING',
  FINANCE_BANKING = 'FINANCE_BANKING',
  GOVERNMENT_PUBLIC = 'GOVERNMENT_PUBLIC'
}

// Enhanced Event Types
export enum EnhancedEventType {
  // Film & TV
  FEATURE_FILM = 'FEATURE_FILM',
  TV_SERIES = 'TV_SERIES',
  DOCUMENTARY = 'DOCUMENTARY',
  COMMERCIAL = 'COMMERCIAL',
  MUSIC_VIDEO = 'MUSIC_VIDEO',
  
  // Corporate & Events
  CORPORATE_VIDEO = 'CORPORATE_VIDEO',
  TRAINING_VIDEO = 'TRAINING_VIDEO',
  WEBINAR = 'WEBINAR',
  CONFERENCE = 'CONFERENCE',
  TRADE_SHOW = 'TRADE_SHOW',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  
  // Live Events
  CONCERT = 'CONCERT',
  FESTIVAL = 'FESTIVAL',
  THEATER = 'THEATER',
  AWARDS_SHOW = 'AWARDS_SHOW',
  
  // Sports
  SPORTS_BROADCAST = 'SPORTS_BROADCAST',
  SPORTS_EVENT = 'SPORTS_EVENT',
  OLYMPICS = 'OLYMPICS',
  
  // Gaming
  GAMING_STREAM = 'GAMING_STREAM',
  ESPORTS_TOURNAMENT = 'ESPORTS_TOURNAMENT',
  GAME_LAUNCH = 'GAME_LAUNCH',
  
  // Digital
  LIVE_STREAM = 'LIVE_STREAM',
  PODCAST = 'PODCAST',
  VIRTUAL_EVENT = 'VIRTUAL_EVENT'
}

// Enhanced Role Template Interface
export interface EnhancedRoleTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  industry: EnhancedIndustryType;
  eventTypes: EnhancedEventType[];
  category: string;
  hierarchy: number; // 1-100 scale
  baseRole: UserRole;
  permissions: any;
  raciLevel: RACILevel;
  keyResponsibilities: string[];
  requiredSkills: string[];
  reportingStructure: {
    reportsTo?: string;
    manages?: string[];
  };
  tags: string[];
  isPopular: boolean;
  usageCount: number;
  icon: string;
  color: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
}

// COMPREHENSIVE INDUSTRY ROLE TEMPLATES (Research-Based)
export const ENHANCED_INDUSTRY_TEMPLATES: Record<EnhancedIndustryType, EnhancedRoleTemplate[]> = {
  
  // ============================================================================
  // FILM & TELEVISION PRODUCTION (Enhanced with 2024 Standards)
  // ============================================================================
  [EnhancedIndustryType.FILM_TV]: [
    {
      id: 'executive-producer',
      name: 'EXECUTIVE_PRODUCER',
      displayName: 'Executive Producer',
      description: 'Oversees entire production from development to distribution, manages financing and high-level creative decisions',
      industry: EnhancedIndustryType.FILM_TV,
      eventTypes: [EnhancedEventType.FEATURE_FILM, EnhancedEventType.TV_SERIES, EnhancedEventType.DOCUMENTARY],
      category: 'Executive Leadership',
      hierarchy: 95,
      baseRole: UserRole.EXEC,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true, manage_post_tasks: true, access_media_library: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        userManagement: { create_users: true, edit_users: true, delete_users: true, manage_roles: true, assign_permissions: true, view_user_activity: true },
        system: { access_settings: true, manage_integrations: true, view_system_logs: true, manage_ai_agents: true },
        reports: { create_reports: true, edit_reports: true, delete_reports: true, access_analytics: true, export_reports: true, manage_templates: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Secure financing and manage budgets',
        'Oversee creative vision and final approval',
        'Manage distribution and marketing strategy',
        'Coordinate with studios and investors',
        'Ensure legal compliance and contracts'
      ],
      requiredSkills: ['Leadership', 'Finance', 'Negotiation', 'Strategic Planning', 'Industry Knowledge'],
      reportingStructure: {
        manages: ['Producer', 'Line Producer', 'Director']
      },
      tags: ['executive', 'finance', 'leadership', 'strategy', 'high-level'],
      isPopular: true,
      usageCount: 450,
      icon: '👑',
      color: '#1a237e',
      salaryRange: { min: 150000, max: 500000, currency: 'USD' },
      experienceLevel: 'Executive'
    },
    {
      id: 'showrunner',
      name: 'SHOWRUNNER',
      displayName: 'Showrunner',
      description: 'Head writer and executive producer for TV series, manages creative direction and day-to-day operations',
      industry: EnhancedIndustryType.FILM_TV,
      eventTypes: [EnhancedEventType.TV_SERIES],
      category: 'Creative Leadership',
      hierarchy: 90,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true, manage_post_tasks: true, access_media_library: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Oversee writing room and story development',
        'Manage creative vision for entire series',
        'Coordinate with network executives',
        'Supervise all aspects of production',
        'Ensure continuity across episodes'
      ],
      requiredSkills: ['Writing', 'Leadership', 'Creative Vision', 'Team Management', 'Industry Knowledge'],
      reportingStructure: {
        reportsTo: 'Executive Producer',
        manages: ['Writer', 'Director', 'Producer']
      },
      tags: ['creative', 'writing', 'tv', 'leadership', 'storytelling'],
      isPopular: true,
      usageCount: 280,
      icon: '📝',
      color: '#3f51b5',
      salaryRange: { min: 200000, max: 1000000, currency: 'USD' },
      experienceLevel: 'Executive'
    },
    {
      id: 'cinematographer-dp',
      name: 'CINEMATOGRAPHER_DP',
      displayName: 'Cinematographer (Director of Photography)',
      description: 'Responsible for visual storytelling, camera work, lighting design, and overall visual aesthetic',
      industry: EnhancedIndustryType.FILM_TV,
      eventTypes: [EnhancedEventType.FEATURE_FILM, EnhancedEventType.TV_SERIES, EnhancedEventType.COMMERCIAL, EnhancedEventType.MUSIC_VIDEO],
      category: 'Creative Technical',
      hierarchy: 75,
      baseRole: UserRole.CAMERA_OPERATOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, access_media_library: true },
        postProduction: { access_color_tools: true, manage_review_cycles: true },
        inventory: { create_assets: true, edit_assets: true, manage_checkouts: true, view_asset_reports: true }
      },
      raciLevel: RACILevel.RESPONSIBLE,
      keyResponsibilities: [
        'Design visual style and cinematography',
        'Manage camera department and equipment',
        'Collaborate with director on visual storytelling',
        'Oversee lighting design and execution',
        'Ensure technical quality of footage'
      ],
      requiredSkills: ['Cinematography', 'Lighting', 'Camera Operation', 'Visual Storytelling', 'Technical Expertise'],
      reportingStructure: {
        reportsTo: 'Director',
        manages: ['Camera Operator', 'Gaffer', '1st AC', '2nd AC']
      },
      tags: ['cinematography', 'visual', 'camera', 'lighting', 'technical'],
      isPopular: true,
      usageCount: 890,
      icon: '📹',
      color: '#795548',
      salaryRange: { min: 80000, max: 300000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // CORPORATE EVENTS & CONFERENCES (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.CORPORATE_EVENTS]: [
    {
      id: 'event-director',
      name: 'EVENT_DIRECTOR',
      displayName: 'Event Director',
      description: 'Oversees all aspects of corporate event planning, execution, and management',
      industry: EnhancedIndustryType.CORPORATE_EVENTS,
      eventTypes: [EnhancedEventType.CONFERENCE, EnhancedEventType.TRADE_SHOW, EnhancedEventType.PRODUCT_LAUNCH, EnhancedEventType.CORPORATE_VIDEO],
      category: 'Event Leadership',
      hierarchy: 85,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Develop event strategy and objectives',
        'Manage event budget and resources',
        'Coordinate with vendors and stakeholders',
        'Oversee event logistics and execution',
        'Ensure ROI and success metrics'
      ],
      requiredSkills: ['Event Planning', 'Project Management', 'Budget Management', 'Vendor Relations', 'Strategic Planning'],
      reportingStructure: {
        manages: ['Event Coordinator', 'AV Technician', 'Registration Manager']
      },
      tags: ['events', 'corporate', 'planning', 'management', 'strategy'],
      isPopular: true,
      usageCount: 650,
      icon: '🎯',
      color: '#1976d2',
      salaryRange: { min: 70000, max: 150000, currency: 'USD' },
      experienceLevel: 'Senior'
    },
    {
      id: 'av-production-manager',
      name: 'AV_PRODUCTION_MANAGER',
      displayName: 'AV Production Manager',
      description: 'Manages all audio-visual aspects of corporate events including streaming, recording, and live production',
      industry: EnhancedIndustryType.CORPORATE_EVENTS,
      eventTypes: [EnhancedEventType.CONFERENCE, EnhancedEventType.WEBINAR, EnhancedEventType.VIRTUAL_EVENT, EnhancedEventType.PRODUCT_LAUNCH],
      category: 'Technical Production',
      hierarchy: 70,
      baseRole: UserRole.TECH,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, access_media_library: true },
        postProduction: { manage_tasks: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        inventory: { create_assets: true, edit_assets: true, manage_checkouts: true, manage_ip_addresses: true },
        system: { access_settings: true, manage_integrations: true }
      },
      raciLevel: RACILevel.RESPONSIBLE,
      keyResponsibilities: [
        'Design and implement AV systems',
        'Manage live streaming and recording',
        'Coordinate technical rehearsals',
        'Troubleshoot technical issues',
        'Ensure broadcast quality standards'
      ],
      requiredSkills: ['AV Technology', 'Live Streaming', 'Technical Troubleshooting', 'Equipment Management', 'Broadcast Standards'],
      reportingStructure: {
        reportsTo: 'Event Director',
        manages: ['AV Technician', 'Camera Operator', 'Audio Engineer']
      },
      tags: ['av', 'technical', 'streaming', 'production', 'broadcast'],
      isPopular: true,
      usageCount: 520,
      icon: '🎛️',
      color: '#546e7a',
      salaryRange: { min: 55000, max: 120000, currency: 'USD' },
      experienceLevel: 'Mid'
    }
  ],

  // ============================================================================
  // LIVE EVENTS & CONCERTS (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.LIVE_EVENTS]: [
    {
      id: 'concert-director',
      name: 'CONCERT_DIRECTOR',
      displayName: 'Concert Director',
      description: 'Oversees creative and technical direction for live concert productions and music events',
      industry: EnhancedIndustryType.LIVE_EVENTS,
      eventTypes: [EnhancedEventType.CONCERT, EnhancedEventType.FESTIVAL, EnhancedEventType.AWARDS_SHOW],
      category: 'Live Production',
      hierarchy: 88,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, view_all_alerts: true, manage_automation: true, configure_settings: true },
        system: { access_settings: true, manage_integrations: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Direct live concert performances',
        'Coordinate with artists and management',
        'Oversee stage design and production',
        'Manage live broadcast elements',
        'Ensure audience experience quality'
      ],
      requiredSkills: ['Live Direction', 'Music Industry Knowledge', 'Stage Production', 'Artist Relations', 'Broadcast Direction'],
      reportingStructure: {
        manages: ['Stage Manager', 'Technical Director', 'Lighting Designer']
      },
      tags: ['concert', 'live', 'music', 'performance', 'broadcast'],
      isPopular: true,
      usageCount: 380,
      icon: '🎤',
      color: '#d32f2f',
      salaryRange: { min: 80000, max: 250000, currency: 'USD' },
      experienceLevel: 'Senior'
    },
    {
      id: 'festival-producer',
      name: 'FESTIVAL_PRODUCER',
      displayName: 'Festival Producer',
      description: 'Manages multi-day festival productions including logistics, talent coordination, and audience experience',
      industry: EnhancedIndustryType.LIVE_EVENTS,
      eventTypes: [EnhancedEventType.FESTIVAL, EnhancedEventType.CONCERT],
      category: 'Festival Management',
      hierarchy: 82,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Coordinate multiple stages and venues',
        'Manage artist logistics and hospitality',
        'Oversee festival operations and security',
        'Coordinate with local authorities',
        'Ensure festival brand and experience'
      ],
      requiredSkills: ['Festival Management', 'Logistics Coordination', 'Vendor Management', 'Crisis Management', 'Entertainment Industry'],
      reportingStructure: {
        manages: ['Stage Producer', 'Operations Manager', 'Artist Liaison']
      },
      tags: ['festival', 'multi-day', 'logistics', 'entertainment', 'coordination'],
      isPopular: false,
      usageCount: 180,
      icon: '🎪',
      color: '#e91e63',
      salaryRange: { min: 60000, max: 180000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // SPORTS BROADCASTING (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.SPORTS_BROADCAST]: [
    {
      id: 'sports-director',
      name: 'SPORTS_DIRECTOR',
      displayName: 'Sports Broadcast Director',
      description: 'Directs live sports broadcasts, manages camera coverage, and coordinates real-time production decisions',
      industry: EnhancedIndustryType.SPORTS_BROADCAST,
      eventTypes: [EnhancedEventType.SPORTS_BROADCAST, EnhancedEventType.SPORTS_EVENT, EnhancedEventType.OLYMPICS],
      category: 'Sports Production',
      hierarchy: 85,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, view_all_alerts: true, manage_automation: true, configure_settings: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Direct live sports coverage',
        'Coordinate multiple camera angles',
        'Manage instant replay systems',
        'Work with commentary teams',
        'Ensure broadcast quality and timing'
      ],
      requiredSkills: ['Sports Broadcasting', 'Live Direction', 'Multi-Camera Production', 'Sports Knowledge', 'Real-time Decision Making'],
      reportingStructure: {
        manages: ['Camera Operator', 'Replay Operator', 'Graphics Operator']
      },
      tags: ['sports', 'live', 'broadcast', 'real-time', 'multi-camera'],
      isPopular: true,
      usageCount: 320,
      icon: '🏆',
      color: '#ff5722',
      salaryRange: { min: 70000, max: 200000, currency: 'USD' },
      experienceLevel: 'Senior'
    },
    {
      id: 'sports-producer',
      name: 'SPORTS_PRODUCER',
      displayName: 'Sports Producer',
      description: 'Produces sports content including pre-game, live coverage, and post-game analysis',
      industry: EnhancedIndustryType.SPORTS_BROADCAST,
      eventTypes: [EnhancedEventType.SPORTS_BROADCAST, EnhancedEventType.SPORTS_EVENT],
      category: 'Sports Production',
      hierarchy: 75,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, export_final_media: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.RESPONSIBLE,
      keyResponsibilities: [
        'Plan sports broadcast content',
        'Coordinate with sports organizations',
        'Manage highlight packages',
        'Oversee graphics and statistics',
        'Coordinate talent and commentary'
      ],
      requiredSkills: ['Sports Production', 'Content Planning', 'Sports Industry Knowledge', 'Broadcast Standards', 'Team Coordination'],
      reportingStructure: {
        reportsTo: 'Sports Director',
        manages: ['Associate Producer', 'Graphics Coordinator', 'Statistics Coordinator']
      },
      tags: ['sports', 'production', 'content', 'highlights', 'coordination'],
      isPopular: true,
      usageCount: 420,
      icon: '⚽',
      color: '#4caf50',
      salaryRange: { min: 50000, max: 150000, currency: 'USD' },
      experienceLevel: 'Mid'
    }
  ],

  // ============================================================================
  // GAMING & ESPORTS (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.GAMING_ESPORTS]: [
    {
      id: 'esports-director',
      name: 'ESPORTS_DIRECTOR',
      displayName: 'Esports Tournament Director',
      description: 'Oversees esports tournament production, player coordination, and broadcast management',
      industry: EnhancedIndustryType.GAMING_ESPORTS,
      eventTypes: [EnhancedEventType.ESPORTS_TOURNAMENT, EnhancedEventType.GAMING_STREAM, EnhancedEventType.GAME_LAUNCH],
      category: 'Esports Production',
      hierarchy: 80,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, manage_automation: true, configure_settings: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Direct esports tournament broadcasts',
        'Coordinate with game developers',
        'Manage player and team logistics',
        'Oversee tournament format and rules',
        'Ensure competitive integrity'
      ],
      requiredSkills: ['Esports Knowledge', 'Tournament Management', 'Gaming Industry', 'Broadcast Production', 'Player Relations'],
      reportingStructure: {
        manages: ['Tournament Producer', 'Broadcast Producer', 'Player Coordinator']
      },
      tags: ['esports', 'gaming', 'tournament', 'competitive', 'broadcast'],
      isPopular: true,
      usageCount: 250,
      icon: '🎮',
      color: '#673ab7',
      salaryRange: { min: 60000, max: 180000, currency: 'USD' },
      experienceLevel: 'Senior'
    },
    {
      id: 'stream-producer',
      name: 'STREAM_PRODUCER',
      displayName: 'Gaming Stream Producer',
      description: 'Produces gaming content for streaming platforms, manages creator partnerships, and audience engagement',
      industry: EnhancedIndustryType.GAMING_ESPORTS,
      eventTypes: [EnhancedEventType.GAMING_STREAM, EnhancedEventType.LIVE_STREAM],
      category: 'Content Production',
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true },
        automation: { view_all_sessions: true, manage_automation: true },
        reports: { create_reports: true, access_analytics: true }
      },
      raciLevel: RACILevel.RESPONSIBLE,
      keyResponsibilities: [
        'Produce gaming content for streams',
        'Manage creator relationships',
        'Coordinate sponsored content',
        'Analyze audience engagement',
        'Develop content strategies'
      ],
      requiredSkills: ['Content Production', 'Gaming Knowledge', 'Streaming Platforms', 'Creator Relations', 'Audience Analytics'],
      reportingStructure: {
        reportsTo: 'Esports Director',
        manages: ['Content Creator', 'Community Manager']
      },
      tags: ['streaming', 'content', 'gaming', 'creators', 'engagement'],
      isPopular: false,
      usageCount: 180,
      icon: '📹',
      color: '#9c27b0',
      salaryRange: { min: 40000, max: 100000, currency: 'USD' },
      experienceLevel: 'Mid'
    }
  ],

  // ============================================================================
  // HEALTHCARE PROJECTS (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.HEALTHCARE]: [
    {
      id: 'healthcare-project-manager',
      name: 'HEALTHCARE_PROJECT_MANAGER',
      displayName: 'Healthcare Project Manager',
      description: 'Manages healthcare-related projects ensuring compliance with medical regulations and patient care standards',
      industry: EnhancedIndustryType.HEALTHCARE,
      eventTypes: [EnhancedEventType.TRAINING_VIDEO, EnhancedEventType.WEBINAR, EnhancedEventType.CONFERENCE],
      category: 'Healthcare Management',
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Ensure HIPAA compliance in all projects',
        'Manage medical content accuracy',
        'Coordinate with healthcare professionals',
        'Oversee patient safety protocols',
        'Manage regulatory approvals'
      ],
      requiredSkills: ['Healthcare Regulations', 'HIPAA Compliance', 'Medical Knowledge', 'Project Management', 'Risk Management'],
      reportingStructure: {
        manages: ['Clinical Coordinator', 'Compliance Officer']
      },
      tags: ['healthcare', 'compliance', 'medical', 'regulations', 'safety'],
      isPopular: false,
      usageCount: 120,
      icon: '🏥',
      color: '#4caf50',
      salaryRange: { min: 70000, max: 160000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // IT & TECHNOLOGY (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.IT_TECHNOLOGY]: [
    {
      id: 'it-project-manager',
      name: 'IT_PROJECT_MANAGER',
      displayName: 'IT Project Manager',
      description: 'Manages technology projects including software development, system implementations, and digital transformations',
      industry: EnhancedIndustryType.IT_TECHNOLOGY,
      eventTypes: [EnhancedEventType.TRAINING_VIDEO, EnhancedEventType.WEBINAR, EnhancedEventType.PRODUCT_LAUNCH],
      category: 'Technology Management',
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        system: { access_settings: true, manage_integrations: true, view_system_logs: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Manage software development lifecycles',
        'Coordinate technical teams and resources',
        'Ensure system security and compliance',
        'Oversee technology implementations',
        'Manage stakeholder communications'
      ],
      requiredSkills: ['Project Management', 'Software Development', 'System Architecture', 'Agile Methodologies', 'Technical Leadership'],
      reportingStructure: {
        manages: ['Software Developer', 'System Administrator', 'QA Engineer']
      },
      tags: ['technology', 'software', 'development', 'systems', 'digital'],
      isPopular: true,
      usageCount: 680,
      icon: '💻',
      color: '#2196f3',
      salaryRange: { min: 80000, max: 180000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // MARKETING & ADVERTISING (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.MARKETING_ADVERTISING]: [
    {
      id: 'creative-director',
      name: 'CREATIVE_DIRECTOR',
      displayName: 'Creative Director',
      description: 'Leads creative vision for marketing campaigns, oversees creative teams, and ensures brand consistency',
      industry: EnhancedIndustryType.MARKETING_ADVERTISING,
      eventTypes: [EnhancedEventType.COMMERCIAL, EnhancedEventType.CORPORATE_VIDEO, EnhancedEventType.PRODUCT_LAUNCH],
      category: 'Creative Leadership',
      hierarchy: 85,
      baseRole: UserRole.ART_DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, access_color_tools: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Develop creative concepts and campaigns',
        'Lead creative team and vision',
        'Ensure brand consistency across projects',
        'Present concepts to clients',
        'Oversee creative production process'
      ],
      requiredSkills: ['Creative Leadership', 'Brand Strategy', 'Design Thinking', 'Team Management', 'Client Relations'],
      reportingStructure: {
        manages: ['Art Director', 'Copywriter', 'Designer']
      },
      tags: ['creative', 'marketing', 'branding', 'campaigns', 'leadership'],
      isPopular: true,
      usageCount: 540,
      icon: '🎨',
      color: '#ff9800',
      salaryRange: { min: 90000, max: 250000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // EDUCATION & TRAINING (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.EDUCATION_TRAINING]: [
    {
      id: 'instructional-designer',
      name: 'INSTRUCTIONAL_DESIGNER',
      displayName: 'Instructional Designer',
      description: 'Designs educational content and learning experiences for training videos and e-learning platforms',
      industry: EnhancedIndustryType.EDUCATION_TRAINING,
      eventTypes: [EnhancedEventType.TRAINING_VIDEO, EnhancedEventType.WEBINAR, EnhancedEventType.VIRTUAL_EVENT],
      category: 'Educational Design',
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true },
        postProduction: { manage_tasks: true, manage_review_cycles: true },
        reports: { create_reports: true, access_analytics: true }
      },
      raciLevel: RACILevel.RESPONSIBLE,
      keyResponsibilities: [
        'Design learning objectives and outcomes',
        'Create educational content structure',
        'Develop assessment strategies',
        'Ensure pedagogical best practices',
        'Analyze learning effectiveness'
      ],
      requiredSkills: ['Instructional Design', 'Educational Theory', 'Content Development', 'Learning Analytics', 'Curriculum Design'],
      reportingStructure: {
        manages: ['Content Developer', 'Educational Technologist']
      },
      tags: ['education', 'learning', 'instructional', 'content', 'pedagogy'],
      isPopular: false,
      usageCount: 220,
      icon: '📚',
      color: '#4caf50',
      salaryRange: { min: 55000, max: 120000, currency: 'USD' },
      experienceLevel: 'Mid'
    }
  ],

  // ============================================================================
  // CONSTRUCTION & ENGINEERING (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.CONSTRUCTION_ENGINEERING]: [
    {
      id: 'construction-project-manager',
      name: 'CONSTRUCTION_PROJECT_MANAGER',
      displayName: 'Construction Project Manager',
      description: 'Manages construction and engineering projects including documentation, safety compliance, and progress tracking',
      industry: EnhancedIndustryType.CONSTRUCTION_ENGINEERING,
      eventTypes: [EnhancedEventType.TRAINING_VIDEO, EnhancedEventType.CORPORATE_VIDEO, EnhancedEventType.DOCUMENTARY],
      category: 'Construction Management',
      hierarchy: 80,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Ensure safety compliance and protocols',
        'Manage construction documentation',
        'Coordinate with engineering teams',
        'Oversee project timelines and budgets',
        'Ensure regulatory compliance'
      ],
      requiredSkills: ['Construction Management', 'Safety Regulations', 'Engineering Knowledge', 'Project Planning', 'Risk Management'],
      reportingStructure: {
        manages: ['Site Supervisor', 'Safety Coordinator', 'Documentation Specialist']
      },
      tags: ['construction', 'engineering', 'safety', 'compliance', 'documentation'],
      isPopular: false,
      usageCount: 95,
      icon: '🏗️',
      color: '#795548',
      salaryRange: { min: 75000, max: 170000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // FINANCE & BANKING (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.FINANCE_BANKING]: [
    {
      id: 'financial-project-manager',
      name: 'FINANCIAL_PROJECT_MANAGER',
      displayName: 'Financial Project Manager',
      description: 'Manages financial services projects ensuring regulatory compliance and risk management',
      industry: EnhancedIndustryType.FINANCE_BANKING,
      eventTypes: [EnhancedEventType.TRAINING_VIDEO, EnhancedEventType.WEBINAR, EnhancedEventType.CORPORATE_VIDEO],
      category: 'Financial Management',
      hierarchy: 80,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Ensure financial regulatory compliance',
        'Manage risk assessment and mitigation',
        'Oversee financial data security',
        'Coordinate with compliance teams',
        'Manage stakeholder communications'
      ],
      requiredSkills: ['Financial Regulations', 'Risk Management', 'Compliance', 'Financial Analysis', 'Project Management'],
      reportingStructure: {
        manages: ['Compliance Analyst', 'Risk Analyst', 'Financial Analyst']
      },
      tags: ['finance', 'banking', 'compliance', 'risk', 'regulations'],
      isPopular: false,
      usageCount: 85,
      icon: '🏦',
      color: '#4caf50',
      salaryRange: { min: 85000, max: 200000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ],

  // ============================================================================
  // GOVERNMENT & PUBLIC SECTOR (Research-Based)
  // ============================================================================
  [EnhancedIndustryType.GOVERNMENT_PUBLIC]: [
    {
      id: 'public-affairs-manager',
      name: 'PUBLIC_AFFAIRS_MANAGER',
      displayName: 'Public Affairs Manager',
      description: 'Manages government and public sector communication projects ensuring transparency and public engagement',
      industry: EnhancedIndustryType.GOVERNMENT_PUBLIC,
      eventTypes: [EnhancedEventType.CORPORATE_VIDEO, EnhancedEventType.WEBINAR, EnhancedEventType.CONFERENCE],
      category: 'Public Communications',
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: RACILevel.ACCOUNTABLE,
      keyResponsibilities: [
        'Ensure public transparency requirements',
        'Manage government communications',
        'Coordinate with public stakeholders',
        'Ensure accessibility compliance',
        'Manage public information requests'
      ],
      requiredSkills: ['Public Administration', 'Government Regulations', 'Public Communications', 'Transparency Laws', 'Stakeholder Management'],
      reportingStructure: {
        manages: ['Communications Specialist', 'Public Information Officer']
      },
      tags: ['government', 'public', 'transparency', 'communications', 'civic'],
      isPopular: false,
      usageCount: 65,
      icon: '🏛️',
      color: '#3f51b5',
      salaryRange: { min: 60000, max: 140000, currency: 'USD' },
      experienceLevel: 'Senior'
    }
  ]
};

// Utility Functions
export const getAllEnhancedTemplates = (): EnhancedRoleTemplate[] => {
  return Object.values(ENHANCED_INDUSTRY_TEMPLATES).flat();
};

export const getTemplatesByIndustry = (industry: EnhancedIndustryType): EnhancedRoleTemplate[] => {
  return ENHANCED_INDUSTRY_TEMPLATES[industry] || [];
};

export const getPopularTemplates = (): EnhancedRoleTemplate[] => {
  return getAllEnhancedTemplates().filter(template => template.isPopular);
};

export const searchTemplates = (query: string): EnhancedRoleTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllEnhancedTemplates().filter(template =>
    template.displayName.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.keyResponsibilities.some(resp => resp.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTemplatesByExperience = (level: 'Entry' | 'Mid' | 'Senior' | 'Executive'): EnhancedRoleTemplate[] => {
  return getAllEnhancedTemplates().filter(template => template.experienceLevel === level);
};

export const getTemplatesByHierarchy = (minLevel: number, maxLevel: number): EnhancedRoleTemplate[] => {
  return getAllEnhancedTemplates().filter(template => 
    template.hierarchy >= minLevel && template.hierarchy <= maxLevel
  );
};
