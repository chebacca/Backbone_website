// Generated mapping functions
import { Timestamp } from 'firebase/firestore';


/**
 * Map User from Prisma to Firestore format
 */
export function mapUserToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    email: prismaData.email,
    username: prismaData.username,
    password: prismaData.password,
    name: prismaData.name,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    position: prismaData.position,
    department: prismaData.department,
    pod: prismaData.pod,
    firstName: prismaData.firstName,
    lastName: prismaData.lastName,
    phoneNumber: prismaData.phoneNumber,
    positionType: prismaData.positionType,
    personId: prismaData.personId,
    appleConnect: prismaData.appleConnect,
    box: prismaData.box,
    frameIO: prismaData.frameIO,
    maui: prismaData.maui,
    mdm: prismaData.mdm,
    slack: prismaData.slack,
    webex: prismaData.webex,
    mail: prismaData.mail,
    quip: prismaData.quip,
    company: prismaData.company,
    lastLogin: prismaData.lastLogin ? Timestamp.fromDate(new Date(prismaData.lastLogin)) : null,
    productionDepartmentId: prismaData.productionDepartmentId,
    productionRoleId: prismaData.productionRoleId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map User from Firestore to Prisma format
 */
export function mapUserFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    email: firestoreData.email,
    username: firestoreData.username,
    password: firestoreData.password,
    name: firestoreData.name,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    position: firestoreData.position,
    department: firestoreData.department,
    pod: firestoreData.pod,
    firstName: firestoreData.firstName,
    lastName: firestoreData.lastName,
    phoneNumber: firestoreData.phoneNumber,
    positionType: firestoreData.positionType,
    personId: firestoreData.personId,
    appleConnect: firestoreData.appleConnect,
    box: firestoreData.box,
    frameIO: firestoreData.frameIO,
    maui: firestoreData.maui,
    mdm: firestoreData.mdm,
    slack: firestoreData.slack,
    webex: firestoreData.webex,
    mail: firestoreData.mail,
    quip: firestoreData.quip,
    company: firestoreData.company,
    lastLogin: firestoreData.lastLogin?.toDate() || null,
    productionDepartmentId: firestoreData.productionDepartmentId,
    productionRoleId: firestoreData.productionRoleId,
  };
}


/**
 * Map UserSettings from Prisma to Firestore format
 */
export function mapUserSettingsToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    theme: prismaData.theme,
    notifications: prismaData.notifications,
    language: prismaData.language,
    timezone: prismaData.timezone,
    toolbarPermissions: prismaData.toolbarPermissions,
    accentColor: prismaData.accentColor,
    activityTracking: prismaData.activityTracking,
    aiAssistantEnabled: prismaData.aiAssistantEnabled,
    aiAutoSuggestions: prismaData.aiAutoSuggestions,
    aiDataProcessing: prismaData.aiDataProcessing,
    aiPersonality: prismaData.aiPersonality,
    analytics: prismaData.analytics,
    animationsEnabled: prismaData.animationsEnabled,
    apiKeys: prismaData.apiKeys || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserSettings from Firestore to Prisma format
 */
export function mapUserSettingsFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    theme: firestoreData.theme,
    notifications: firestoreData.notifications,
    language: firestoreData.language,
    timezone: firestoreData.timezone,
    toolbarPermissions: firestoreData.toolbarPermissions,
    accentColor: firestoreData.accentColor,
    activityTracking: firestoreData.activityTracking,
    aiAssistantEnabled: firestoreData.aiAssistantEnabled,
    aiAutoSuggestions: firestoreData.aiAutoSuggestions,
    aiDataProcessing: firestoreData.aiDataProcessing,
    aiPersonality: firestoreData.aiPersonality,
    analytics: firestoreData.analytics,
    animationsEnabled: firestoreData.animationsEnabled,
    apiKeys: firestoreData.apiKeys,
  };
}


/**
 * Map CustomRole from Prisma to Firestore format
 */
export function mapCustomRoleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    displayName: prismaData.displayName,
    description: prismaData.description,
    category: prismaData.category,
    hierarchy: prismaData.hierarchy,
    isActive: prismaData.isActive,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CustomRole from Firestore to Prisma format
 */
export function mapCustomRoleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    displayName: firestoreData.displayName,
    description: firestoreData.description,
    category: firestoreData.category,
    hierarchy: firestoreData.hierarchy,
    isActive: firestoreData.isActive,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map WorkflowDiagram from Prisma to Firestore format
 */
export function mapWorkflowDiagramToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    name: prismaData.name,
    description: prismaData.description,
    nodes: prismaData.nodes || {},
    edges: prismaData.edges || {},
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowDiagram from Firestore to Prisma format
 */
export function mapWorkflowDiagramFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    name: firestoreData.name,
    description: firestoreData.description,
    nodes: firestoreData.nodes,
    edges: firestoreData.edges,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map UserGroup from Prisma to Firestore format
 */
export function mapUserGroupToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserGroup from Firestore to Prisma format
 */
export function mapUserGroupFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map UserGroupMembership from Prisma to Firestore format
 */
export function mapUserGroupMembershipToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    userGroupId: prismaData.userGroupId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserGroupMembership from Firestore to Prisma format
 */
export function mapUserGroupMembershipFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    userGroupId: firestoreData.userGroupId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Stage from Prisma to Firestore format
 */
export function mapStageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    description: prismaData.description,
    name: prismaData.name,
    order: prismaData.order,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Stage from Firestore to Prisma format
 */
export function mapStageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    description: firestoreData.description,
    name: firestoreData.name,
    order: firestoreData.order,
  };
}


/**
 * Map SessionRole from Prisma to Firestore format
 */
export function mapSessionRoleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    roleName: prismaData.roleName,
    department: prismaData.department,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionRole from Firestore to Prisma format
 */
export function mapSessionRoleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    roleName: firestoreData.roleName,
    department: firestoreData.department,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Role from Prisma to Firestore format
 */
export function mapRoleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    roleName: prismaData.roleName,
    department: prismaData.department,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Role from Firestore to Prisma format
 */
export function mapRoleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    roleName: firestoreData.roleName,
    department: firestoreData.department,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionSession from Prisma to Firestore format
 */
export function mapProductionSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    location: prismaData.location,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    estimatedDuration: prismaData.estimatedDuration,
    crewSize: prismaData.crewSize,
    equipmentCount: prismaData.equipmentCount,
    budget: prismaData.budget,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    isArchived: prismaData.isArchived,
    mapId: prismaData.mapId,
    postProductionCallTime: prismaData.postProductionCallTime ? Timestamp.fromDate(new Date(prismaData.postProductionCallTime)) : null,
    postProductionNotes: prismaData.postProductionNotes,
    postProductionWrapTime: prismaData.postProductionWrapTime ? Timestamp.fromDate(new Date(prismaData.postProductionWrapTime)) : null,
    deletedAt: prismaData.deletedAt ? Timestamp.fromDate(new Date(prismaData.deletedAt)) : null,
    deletedByUserId: prismaData.deletedByUserId,
    isDeleted: prismaData.isDeleted,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    sessionDate: prismaData.sessionDate ? Timestamp.fromDate(new Date(prismaData.sessionDate)) : null,
    currentPostProductionStageId: prismaData.currentPostProductionStageId,
    description: prismaData.description,
    fileLocation: prismaData.fileLocation,
    isOnHold: prismaData.isOnHold,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSession from Firestore to Prisma format
 */
export function mapProductionSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    location: firestoreData.location,
    callTime: firestoreData.callTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    estimatedDuration: firestoreData.estimatedDuration,
    crewSize: firestoreData.crewSize,
    equipmentCount: firestoreData.equipmentCount,
    budget: firestoreData.budget,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    isArchived: firestoreData.isArchived,
    mapId: firestoreData.mapId,
    postProductionCallTime: firestoreData.postProductionCallTime?.toDate() || null,
    postProductionNotes: firestoreData.postProductionNotes,
    postProductionWrapTime: firestoreData.postProductionWrapTime?.toDate() || null,
    deletedAt: firestoreData.deletedAt?.toDate() || null,
    deletedByUserId: firestoreData.deletedByUserId,
    isDeleted: firestoreData.isDeleted,
    dueDate: firestoreData.dueDate?.toDate() || null,
    sessionDate: firestoreData.sessionDate?.toDate() || null,
    currentPostProductionStageId: firestoreData.currentPostProductionStageId,
    description: firestoreData.description,
    fileLocation: firestoreData.fileLocation,
    isOnHold: firestoreData.isOnHold,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ProductionStage from Prisma to Firestore format
 */
export function mapProductionStageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    stageName: prismaData.stageName,
    stageOrder: prismaData.stageOrder,
    estimatedDays: prismaData.estimatedDays,
    isRequired: prismaData.isRequired,
    status: prismaData.status,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionStage from Firestore to Prisma format
 */
export function mapProductionStageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    stageName: firestoreData.stageName,
    stageOrder: firestoreData.stageOrder,
    estimatedDays: firestoreData.estimatedDays,
    isRequired: firestoreData.isRequired,
    status: firestoreData.status,
    startDate: firestoreData.startDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionTask from Prisma to Firestore format
 */
export function mapProductionTaskToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    stageId: prismaData.stageId,
    taskName: prismaData.taskName,
    status: prismaData.status,
    location: prismaData.location,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    estimatedDuration: prismaData.estimatedDuration,
    equipment: prismaData.equipment || {},
    crew: prismaData.crew || {},
    notes: prismaData.notes,
    priority: prismaData.priority,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTask from Firestore to Prisma format
 */
export function mapProductionTaskFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    stageId: firestoreData.stageId,
    taskName: firestoreData.taskName,
    status: firestoreData.status,
    location: firestoreData.location,
    callTime: firestoreData.callTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    estimatedDuration: firestoreData.estimatedDuration,
    equipment: firestoreData.equipment,
    crew: firestoreData.crew,
    notes: firestoreData.notes,
    priority: firestoreData.priority,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionTaskAssignee from Prisma to Firestore format
 */
export function mapProductionTaskAssigneeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    taskId: prismaData.taskId,
    userId: prismaData.userId,
    roleId: prismaData.roleId,
    assignedBy: prismaData.assignedBy,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    status: prismaData.status,
    notes: prismaData.notes,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    estimatedHours: prismaData.estimatedHours,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskAssignee from Firestore to Prisma format
 */
export function mapProductionTaskAssigneeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    taskId: firestoreData.taskId,
    userId: firestoreData.userId,
    roleId: firestoreData.roleId,
    assignedBy: firestoreData.assignedBy,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    status: firestoreData.status,
    notes: firestoreData.notes,
    callTime: firestoreData.callTime?.toDate() || null,
    estimatedHours: firestoreData.estimatedHours,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionCrewMember from Prisma to Firestore format
 */
export function mapProductionCrewMemberToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    role: prismaData.role,
    department: prismaData.department,
    assignedToTaskId: prismaData.assignedToTaskId,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    status: prismaData.status,
    rate: prismaData.rate,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionCrewMember from Firestore to Prisma format
 */
export function mapProductionCrewMemberFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    role: firestoreData.role,
    department: firestoreData.department,
    assignedToTaskId: firestoreData.assignedToTaskId,
    callTime: firestoreData.callTime?.toDate() || null,
    status: firestoreData.status,
    rate: firestoreData.rate,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionWorkflowCorrelation from Prisma to Firestore format
 */
export function mapProductionWorkflowCorrelationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    taskId: prismaData.taskId,
    workflowStepId: prismaData.workflowStepId,
    correlationType: prismaData.correlationType,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    autoSync: prismaData.autoSync,
    createdByUserId: prismaData.createdByUserId,
    lastSyncAt: prismaData.lastSyncAt ? Timestamp.fromDate(new Date(prismaData.lastSyncAt)) : null,
    syncDirection: prismaData.syncDirection,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionWorkflowCorrelation from Firestore to Prisma format
 */
export function mapProductionWorkflowCorrelationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    taskId: firestoreData.taskId,
    workflowStepId: firestoreData.workflowStepId,
    correlationType: firestoreData.correlationType,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    autoSync: firestoreData.autoSync,
    createdByUserId: firestoreData.createdByUserId,
    lastSyncAt: firestoreData.lastSyncAt?.toDate() || null,
    syncDirection: firestoreData.syncDirection,
  };
}


/**
 * Map SessionAssignment from Prisma to Firestore format
 */
export function mapSessionAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    stageId: prismaData.stageId,
    roleId: prismaData.roleId,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    sessionRoleId: prismaData.sessionRoleId,
    assignmentStartTime: prismaData.assignmentStartTime ? Timestamp.fromDate(new Date(prismaData.assignmentStartTime)) : null,
    assignmentEndTime: prismaData.assignmentEndTime ? Timestamp.fromDate(new Date(prismaData.assignmentEndTime)) : null,
    userId: prismaData.userId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionAssignment from Firestore to Prisma format
 */
export function mapSessionAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    stageId: firestoreData.stageId,
    roleId: firestoreData.roleId,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    sessionRoleId: firestoreData.sessionRoleId,
    assignmentStartTime: firestoreData.assignmentStartTime?.toDate() || null,
    assignmentEndTime: firestoreData.assignmentEndTime?.toDate() || null,
    userId: firestoreData.userId,
  };
}


/**
 * Map UnifiedWorkflowInstance from Prisma to Firestore format
 */
export function mapUnifiedWorkflowInstanceToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    workflowDiagramId: prismaData.workflowDiagramId,
    name: prismaData.name,
    description: prismaData.description,
    version: prismaData.version,
    progress: prismaData.progress,
    dependencyConfig: prismaData.dependencyConfig || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UnifiedWorkflowInstance from Firestore to Prisma format
 */
export function mapUnifiedWorkflowInstanceFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    workflowDiagramId: firestoreData.workflowDiagramId,
    name: firestoreData.name,
    description: firestoreData.description,
    version: firestoreData.version,
    progress: firestoreData.progress,
    dependencyConfig: firestoreData.dependencyConfig,
  };
}


/**
 * Map UnifiedSessionAssignment from Prisma to Firestore format
 */
export function mapUnifiedSessionAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    assignmentType: prismaData.assignmentType,
    userId: prismaData.userId,
    roleId: prismaData.roleId,
    stageId: prismaData.stageId,
    assignedByUserId: prismaData.assignedByUserId,
    podAssignment: prismaData.podAssignment,
    isLead: prismaData.isLead,
    permissions: prismaData.permissions || {},
    assignmentStartTime: prismaData.assignmentStartTime ? Timestamp.fromDate(new Date(prismaData.assignmentStartTime)) : null,
    assignmentEndTime: prismaData.assignmentEndTime ? Timestamp.fromDate(new Date(prismaData.assignmentEndTime)) : null,
    notes: prismaData.notes,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UnifiedSessionAssignment from Firestore to Prisma format
 */
export function mapUnifiedSessionAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    assignmentType: firestoreData.assignmentType,
    userId: firestoreData.userId,
    roleId: firestoreData.roleId,
    stageId: firestoreData.stageId,
    assignedByUserId: firestoreData.assignedByUserId,
    podAssignment: firestoreData.podAssignment,
    isLead: firestoreData.isLead,
    permissions: firestoreData.permissions,
    assignmentStartTime: firestoreData.assignmentStartTime?.toDate() || null,
    assignmentEndTime: firestoreData.assignmentEndTime?.toDate() || null,
    notes: firestoreData.notes,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map UnifiedSessionStep from Prisma to Firestore format
 */
export function mapUnifiedSessionStepToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    workflowInstanceId: prismaData.workflowInstanceId,
    nodeId: prismaData.nodeId,
    name: prismaData.name,
    description: prismaData.description,
    order: prismaData.order,
    dependencies: prismaData.dependencies || {},
    dependents: prismaData.dependents || {},
    blockedBy: prismaData.blockedBy || {},
    isParallel: prismaData.isParallel,
    requiredRole: prismaData.requiredRole,
    assignedUserId: prismaData.assignedUserId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    assignedByUserId: prismaData.assignedByUserId,
    progress: prismaData.progress,
    estimatedHours: prismaData.estimatedHours,
    actualHours: prismaData.actualHours,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    completedDate: prismaData.completedDate ? Timestamp.fromDate(new Date(prismaData.completedDate)) : null,
    deliverables: prismaData.deliverables || {},
    files: prismaData.files || {},
    notes: prismaData.notes,
    workNotes: prismaData.workNotes || {},
    isRequired: prismaData.isRequired,
    canSkip: prismaData.canSkip,
    isQualityGate: prismaData.isQualityGate,
    approvalRequired: prismaData.approvalRequired,
    approvedByUserId: prismaData.approvedByUserId,
    approvedAt: prismaData.approvedAt ? Timestamp.fromDate(new Date(prismaData.approvedAt)) : null,
    isQcStep: prismaData.isQcStep,
    qcConfig: prismaData.qcConfig || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UnifiedSessionStep from Firestore to Prisma format
 */
export function mapUnifiedSessionStepFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    workflowInstanceId: firestoreData.workflowInstanceId,
    nodeId: firestoreData.nodeId,
    name: firestoreData.name,
    description: firestoreData.description,
    order: firestoreData.order,
    dependencies: firestoreData.dependencies,
    dependents: firestoreData.dependents,
    blockedBy: firestoreData.blockedBy,
    isParallel: firestoreData.isParallel,
    requiredRole: firestoreData.requiredRole,
    assignedUserId: firestoreData.assignedUserId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    assignedByUserId: firestoreData.assignedByUserId,
    progress: firestoreData.progress,
    estimatedHours: firestoreData.estimatedHours,
    actualHours: firestoreData.actualHours,
    startDate: firestoreData.startDate?.toDate() || null,
    dueDate: firestoreData.dueDate?.toDate() || null,
    completedDate: firestoreData.completedDate?.toDate() || null,
    deliverables: firestoreData.deliverables,
    files: firestoreData.files,
    notes: firestoreData.notes,
    workNotes: firestoreData.workNotes,
    isRequired: firestoreData.isRequired,
    canSkip: firestoreData.canSkip,
    isQualityGate: firestoreData.isQualityGate,
    approvalRequired: firestoreData.approvalRequired,
    approvedByUserId: firestoreData.approvedByUserId,
    approvedAt: firestoreData.approvedAt?.toDate() || null,
    isQcStep: firestoreData.isQcStep,
    qcConfig: firestoreData.qcConfig,
  };
}


/**
 * Map FileChecklist from Prisma to Firestore format
 */
export function mapFileChecklistToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    fileDescription: prismaData.fileDescription,
    expectedLocation: prismaData.expectedLocation,
    actualLocation: prismaData.actualLocation,
    fileName: prismaData.fileName,
    status: prismaData.status,
    checkedAt: prismaData.checkedAt ? Timestamp.fromDate(new Date(prismaData.checkedAt)) : null,
    notes: prismaData.notes,
    fileTrackingId: prismaData.fileTrackingId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map FileChecklist from Firestore to Prisma format
 */
export function mapFileChecklistFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    fileDescription: firestoreData.fileDescription,
    expectedLocation: firestoreData.expectedLocation,
    actualLocation: firestoreData.actualLocation,
    fileName: firestoreData.fileName,
    status: firestoreData.status,
    checkedAt: firestoreData.checkedAt?.toDate() || null,
    notes: firestoreData.notes,
    fileTrackingId: firestoreData.fileTrackingId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map PostProductionStage from Prisma to Firestore format
 */
export function mapPostProductionStageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    stageName: prismaData.stageName,
    stageOrder: prismaData.stageOrder,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PostProductionStage from Firestore to Prisma format
 */
export function mapPostProductionStageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    stageName: firestoreData.stageName,
    stageOrder: firestoreData.stageOrder,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map PostProductionTask from Prisma to Firestore format
 */
export function mapPostProductionTaskToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    roleId: prismaData.roleId,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    postProductionStageId: prismaData.postProductionStageId,
    taskName: prismaData.taskName,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    completedDate: prismaData.completedDate ? Timestamp.fromDate(new Date(prismaData.completedDate)) : null,
    createdByUserId: prismaData.createdByUserId,
    lastUpdatedByUserId: prismaData.lastUpdatedByUserId,
    filePath: prismaData.filePath,
    assignmentId: prismaData.assignmentId,
    assignedToUserId: prismaData.assignedToUserId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PostProductionTask from Firestore to Prisma format
 */
export function mapPostProductionTaskFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    roleId: firestoreData.roleId,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    postProductionStageId: firestoreData.postProductionStageId,
    taskName: firestoreData.taskName,
    startDate: firestoreData.startDate?.toDate() || null,
    dueDate: firestoreData.dueDate?.toDate() || null,
    completedDate: firestoreData.completedDate?.toDate() || null,
    createdByUserId: firestoreData.createdByUserId,
    lastUpdatedByUserId: firestoreData.lastUpdatedByUserId,
    filePath: firestoreData.filePath,
    assignmentId: firestoreData.assignmentId,
    assignedToUserId: firestoreData.assignedToUserId,
  };
}


/**
 * Map TaskAssignee from Prisma to Firestore format
 */
export function mapTaskAssigneeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    taskId: prismaData.taskId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    assignedById: prismaData.assignedById,
    sessionId: prismaData.sessionId,
    userId: prismaData.userId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TaskAssignee from Firestore to Prisma format
 */
export function mapTaskAssigneeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    taskId: firestoreData.taskId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    assignedById: firestoreData.assignedById,
    sessionId: firestoreData.sessionId,
    userId: firestoreData.userId,
  };
}


/**
 * Map ReviewSession from Prisma to Firestore format
 */
export function mapReviewSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    cutTypeName: prismaData.cutTypeName,
    notes: prismaData.notes,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewSession from Firestore to Prisma format
 */
export function mapReviewSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    cutTypeName: firestoreData.cutTypeName,
    notes: firestoreData.notes,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ReviewNote from Prisma to Firestore format
 */
export function mapReviewNoteToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    content: prismaData.content,
    timecode: prismaData.timecode,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdByUserId: prismaData.createdByUserId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewNote from Firestore to Prisma format
 */
export function mapReviewNoteFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    content: firestoreData.content,
    timecode: firestoreData.timecode,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdByUserId: firestoreData.createdByUserId,
  };
}


/**
 * Map ReviewApproval from Prisma to Firestore format
 */
export function mapReviewApprovalToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    approverUserId: prismaData.approverUserId,
    notes: prismaData.notes,
    approvedAt: prismaData.approvedAt ? Timestamp.fromDate(new Date(prismaData.approvedAt)) : null,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewApproval from Firestore to Prisma format
 */
export function mapReviewApprovalFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    approverUserId: firestoreData.approverUserId,
    notes: firestoreData.notes,
    approvedAt: firestoreData.approvedAt?.toDate() || null,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ReviewAssignment from Prisma to Firestore format
 */
export function mapReviewAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    assignedUserId: prismaData.assignedUserId,
    assignedByUserId: prismaData.assignedByUserId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    notes: prismaData.notes,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewAssignment from Firestore to Prisma format
 */
export function mapReviewAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    assignedUserId: firestoreData.assignedUserId,
    assignedByUserId: firestoreData.assignedByUserId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    completedAt: firestoreData.completedAt?.toDate() || null,
    notes: firestoreData.notes,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ReviewSessionReviewer from Prisma to Firestore format
 */
export function mapReviewSessionReviewerToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    notes: prismaData.notes,
    attended: prismaData.attended,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    userId: prismaData.userId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewSessionReviewer from Firestore to Prisma format
 */
export function mapReviewSessionReviewerFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    notes: firestoreData.notes,
    attended: firestoreData.attended,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    userId: firestoreData.userId,
  };
}


/**
 * Map ReviewSection from Prisma to Firestore format
 */
export function mapReviewSectionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    sectionName: prismaData.sectionName,
    startTimecode: prismaData.startTimecode,
    endTimecode: prismaData.endTimecode,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    assignedToUserId: prismaData.assignedToUserId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewSection from Firestore to Prisma format
 */
export function mapReviewSectionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    sectionName: firestoreData.sectionName,
    startTimecode: firestoreData.startTimecode,
    endTimecode: firestoreData.endTimecode,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    assignedToUserId: firestoreData.assignedToUserId,
  };
}


/**
 * Map CutApproval from Prisma to Firestore format
 */
export function mapCutApprovalToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    cutTypeId: prismaData.cutTypeId,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    approvedAt: prismaData.approvedAt ? Timestamp.fromDate(new Date(prismaData.approvedAt)) : null,
    approvedBy: prismaData.approvedBy,
    status: prismaData.status,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CutApproval from Firestore to Prisma format
 */
export function mapCutApprovalFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    cutTypeId: firestoreData.cutTypeId,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    approvedAt: firestoreData.approvedAt?.toDate() || null,
    approvedBy: firestoreData.approvedBy,
    status: firestoreData.status,
  };
}


/**
 * Map CutType from Prisma to Firestore format
 */
export function mapCutTypeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    cutTypeName: prismaData.cutTypeName,
    description: prismaData.description,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CutType from Firestore to Prisma format
 */
export function mapCutTypeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    cutTypeName: firestoreData.cutTypeName,
    description: firestoreData.description,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Notification from Prisma to Firestore format
 */
export function mapNotificationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    title: prismaData.title,
    message: prismaData.message,
    type: prismaData.type,
    read: prismaData.read,
    timestamp: prismaData.timestamp ? Timestamp.fromDate(new Date(prismaData.timestamp)) : null,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Notification from Firestore to Prisma format
 */
export function mapNotificationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    title: firestoreData.title,
    message: firestoreData.message,
    type: firestoreData.type,
    read: firestoreData.read,
    timestamp: firestoreData.timestamp?.toDate() || null,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map Portfolio from Prisma to Firestore format
 */
export function mapPortfolioToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    userId: prismaData.userId,
    description: prismaData.description,
    type: prismaData.type,
    currency: prismaData.currency,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    parentPortfolioId: prismaData.parentPortfolioId,
    isDeleted: prismaData.isDeleted,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Portfolio from Firestore to Prisma format
 */
export function mapPortfolioFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    userId: firestoreData.userId,
    description: firestoreData.description,
    type: firestoreData.type,
    currency: firestoreData.currency,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    parentPortfolioId: firestoreData.parentPortfolioId,
    isDeleted: firestoreData.isDeleted,
  };
}


/**
 * Map Asset from Prisma to Firestore format
 */
export function mapAssetToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    symbol: prismaData.symbol,
    quantity: prismaData.quantity,
    purchasePrice: prismaData.purchasePrice,
    currentPrice: prismaData.currentPrice,
    purchaseDate: prismaData.purchaseDate ? Timestamp.fromDate(new Date(prismaData.purchaseDate)) : null,
    portfolioId: prismaData.portfolioId,
    notes: prismaData.notes,
    isSold: prismaData.isSold,
    sellDate: prismaData.sellDate ? Timestamp.fromDate(new Date(prismaData.sellDate)) : null,
    sellPrice: prismaData.sellPrice,
    network: prismaData.network,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Asset from Firestore to Prisma format
 */
export function mapAssetFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    symbol: firestoreData.symbol,
    quantity: firestoreData.quantity,
    purchasePrice: firestoreData.purchasePrice,
    currentPrice: firestoreData.currentPrice,
    purchaseDate: firestoreData.purchaseDate?.toDate() || null,
    portfolioId: firestoreData.portfolioId,
    notes: firestoreData.notes,
    isSold: firestoreData.isSold,
    sellDate: firestoreData.sellDate?.toDate() || null,
    sellPrice: firestoreData.sellPrice,
    network: firestoreData.network,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map RWADetails from Prisma to Firestore format
 */
export function mapRWADetailsToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetId: prismaData.assetId,
    category: prismaData.category,
    subcategory: prismaData.subcategory,
    condition: prismaData.condition,
    location: prismaData.location,
    manufacturer: prismaData.manufacturer,
    serialNumber: prismaData.serialNumber,
    lastAppraisalDate: prismaData.lastAppraisalDate ? Timestamp.fromDate(new Date(prismaData.lastAppraisalDate)) : null,
    lastAppraisalValue: prismaData.lastAppraisalValue,
    maintenanceCosts: prismaData.maintenanceCosts,
    insuranceCosts: prismaData.insuranceCosts,
    storageLocation: prismaData.storageLocation,
    storageConditions: prismaData.storageConditions || {},
    authenticityCertificate: prismaData.authenticityCertificate,
    notes: prismaData.notes,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map RWADetails from Firestore to Prisma format
 */
export function mapRWADetailsFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetId: firestoreData.assetId,
    category: firestoreData.category,
    subcategory: firestoreData.subcategory,
    condition: firestoreData.condition,
    location: firestoreData.location,
    manufacturer: firestoreData.manufacturer,
    serialNumber: firestoreData.serialNumber,
    lastAppraisalDate: firestoreData.lastAppraisalDate?.toDate() || null,
    lastAppraisalValue: firestoreData.lastAppraisalValue,
    maintenanceCosts: firestoreData.maintenanceCosts,
    insuranceCosts: firestoreData.insuranceCosts,
    storageLocation: firestoreData.storageLocation,
    storageConditions: firestoreData.storageConditions,
    authenticityCertificate: firestoreData.authenticityCertificate,
    notes: firestoreData.notes,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map RwaDocument from Prisma to Firestore format
 */
export function mapRwaDocumentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    rwaId: prismaData.rwaId,
    title: prismaData.title,
    description: prismaData.description,
    fileUrl: prismaData.fileUrl,
    fileType: prismaData.fileType,
    uploadDate: prismaData.uploadDate ? Timestamp.fromDate(new Date(prismaData.uploadDate)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map RwaDocument from Firestore to Prisma format
 */
export function mapRwaDocumentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    rwaId: firestoreData.rwaId,
    title: firestoreData.title,
    description: firestoreData.description,
    fileUrl: firestoreData.fileUrl,
    fileType: firestoreData.fileType,
    uploadDate: firestoreData.uploadDate?.toDate() || null,
  };
}


/**
 * Map TaxLot from Prisma to Firestore format
 */
export function mapTaxLotToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetId: prismaData.assetId,
    purchaseDate: prismaData.purchaseDate ? Timestamp.fromDate(new Date(prismaData.purchaseDate)) : null,
    quantity: prismaData.quantity,
    purchasePrice: prismaData.purchasePrice,
    sellDate: prismaData.sellDate ? Timestamp.fromDate(new Date(prismaData.sellDate)) : null,
    sellPrice: prismaData.sellPrice,
    realizedGain: prismaData.realizedGain,
    holdingPeriod: prismaData.holdingPeriod,
    isLongTerm: prismaData.isLongTerm,
    notes: prismaData.notes,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TaxLot from Firestore to Prisma format
 */
export function mapTaxLotFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetId: firestoreData.assetId,
    purchaseDate: firestoreData.purchaseDate?.toDate() || null,
    quantity: firestoreData.quantity,
    purchasePrice: firestoreData.purchasePrice,
    sellDate: firestoreData.sellDate?.toDate() || null,
    sellPrice: firestoreData.sellPrice,
    realizedGain: firestoreData.realizedGain,
    holdingPeriod: firestoreData.holdingPeriod,
    isLongTerm: firestoreData.isLongTerm,
    notes: firestoreData.notes,
  };
}


/**
 * Map AssetPerformance from Prisma to Firestore format
 */
export function mapAssetPerformanceToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetId: prismaData.assetId,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    return: prismaData.return,
    volatility: prismaData.volatility,
    beta: prismaData.beta,
    alpha: prismaData.alpha,
    sharpeRatio: prismaData.sharpeRatio,
    sortinoRatio: prismaData.sortinoRatio,
    maxDrawdown: prismaData.maxDrawdown,
    correlation: prismaData.correlation,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AssetPerformance from Firestore to Prisma format
 */
export function mapAssetPerformanceFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetId: firestoreData.assetId,
    date: firestoreData.date?.toDate() || null,
    return: firestoreData.return,
    volatility: firestoreData.volatility,
    beta: firestoreData.beta,
    alpha: firestoreData.alpha,
    sharpeRatio: firestoreData.sharpeRatio,
    sortinoRatio: firestoreData.sortinoRatio,
    maxDrawdown: firestoreData.maxDrawdown,
    correlation: firestoreData.correlation,
  };
}


/**
 * Map AssetPriceHistory from Prisma to Firestore format
 */
export function mapAssetPriceHistoryToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetId: prismaData.assetId,
    price: prismaData.price,
    timestamp: prismaData.timestamp ? Timestamp.fromDate(new Date(prismaData.timestamp)) : null,
    volume: prismaData.volume,
    marketCap: prismaData.marketCap,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AssetPriceHistory from Firestore to Prisma format
 */
export function mapAssetPriceHistoryFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetId: firestoreData.assetId,
    price: firestoreData.price,
    timestamp: firestoreData.timestamp?.toDate() || null,
    volume: firestoreData.volume,
    marketCap: firestoreData.marketCap,
  };
}


/**
 * Map PortfolioPerformance from Prisma to Firestore format
 */
export function mapPortfolioPerformanceToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    portfolioId: prismaData.portfolioId,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    totalValue: prismaData.totalValue,
    dailyReturn: prismaData.dailyReturn,
    monthlyReturn: prismaData.monthlyReturn,
    yearlyReturn: prismaData.yearlyReturn,
    realizedGains: prismaData.realizedGains,
    unrealizedGains: prismaData.unrealizedGains,
    dividendIncome: prismaData.dividendIncome,
    interestIncome: prismaData.interestIncome,
    capitalGains: prismaData.capitalGains,
    taxLossHarvesting: prismaData.taxLossHarvesting,
    metrics: prismaData.metrics || {},
    allocation: prismaData.allocation || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PortfolioPerformance from Firestore to Prisma format
 */
export function mapPortfolioPerformanceFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    portfolioId: firestoreData.portfolioId,
    date: firestoreData.date?.toDate() || null,
    totalValue: firestoreData.totalValue,
    dailyReturn: firestoreData.dailyReturn,
    monthlyReturn: firestoreData.monthlyReturn,
    yearlyReturn: firestoreData.yearlyReturn,
    realizedGains: firestoreData.realizedGains,
    unrealizedGains: firestoreData.unrealizedGains,
    dividendIncome: firestoreData.dividendIncome,
    interestIncome: firestoreData.interestIncome,
    capitalGains: firestoreData.capitalGains,
    taxLossHarvesting: firestoreData.taxLossHarvesting,
    metrics: firestoreData.metrics,
    allocation: firestoreData.allocation,
  };
}


/**
 * Map PortfolioTaxSummary from Prisma to Firestore format
 */
export function mapPortfolioTaxSummaryToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    portfolioId: prismaData.portfolioId,
    year: prismaData.year,
    realizedGains: prismaData.realizedGains,
    unrealizedGains: prismaData.unrealizedGains,
    dividendIncome: prismaData.dividendIncome,
    interestIncome: prismaData.interestIncome,
    capitalGains: prismaData.capitalGains,
    taxLossHarvesting: prismaData.taxLossHarvesting,
    washSales: prismaData.washSales,
    foreignTaxPaid: prismaData.foreignTaxPaid,
    taxEfficiency: prismaData.taxEfficiency,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PortfolioTaxSummary from Firestore to Prisma format
 */
export function mapPortfolioTaxSummaryFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    portfolioId: firestoreData.portfolioId,
    year: firestoreData.year,
    realizedGains: firestoreData.realizedGains,
    unrealizedGains: firestoreData.unrealizedGains,
    dividendIncome: firestoreData.dividendIncome,
    interestIncome: firestoreData.interestIncome,
    capitalGains: firestoreData.capitalGains,
    taxLossHarvesting: firestoreData.taxLossHarvesting,
    washSales: firestoreData.washSales,
    foreignTaxPaid: firestoreData.foreignTaxPaid,
    taxEfficiency: firestoreData.taxEfficiency,
  };
}


/**
 * Map PortfolioAllocation from Prisma to Firestore format
 */
export function mapPortfolioAllocationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    portfolioId: prismaData.portfolioId,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    assetAllocation: prismaData.assetAllocation || {},
    sectorAllocation: prismaData.sectorAllocation || {},
    geographicAllocation: prismaData.geographicAllocation || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PortfolioAllocation from Firestore to Prisma format
 */
export function mapPortfolioAllocationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    portfolioId: firestoreData.portfolioId,
    date: firestoreData.date?.toDate() || null,
    assetAllocation: firestoreData.assetAllocation,
    sectorAllocation: firestoreData.sectorAllocation,
    geographicAllocation: firestoreData.geographicAllocation,
  };
}


/**
 * Map Budget from Prisma to Firestore format
 */
export function mapBudgetToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    amount: prismaData.amount,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    categories: prismaData.categories || {},
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Budget from Firestore to Prisma format
 */
export function mapBudgetFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    amount: firestoreData.amount,
    startDate: firestoreData.startDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    categories: firestoreData.categories,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Transaction from Prisma to Firestore format
 */
export function mapTransactionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    amount: prismaData.amount,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    categoryId: prismaData.categoryId,
    budgetId: prismaData.budgetId,
    type: prismaData.type,
    description: prismaData.description,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Transaction from Firestore to Prisma format
 */
export function mapTransactionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    amount: firestoreData.amount,
    date: firestoreData.date?.toDate() || null,
    categoryId: firestoreData.categoryId,
    budgetId: firestoreData.budgetId,
    type: firestoreData.type,
    description: firestoreData.description,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Contact from Prisma to Firestore format
 */
export function mapContactToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    firstName: prismaData.firstName,
    lastName: prismaData.lastName,
    email: prismaData.email,
    phoneNumber: prismaData.phoneNumber,
    department: prismaData.department,
    positionType: prismaData.positionType,
    roomNumber: prismaData.roomNumber,
    idBadgeNumber: prismaData.idBadgeNumber,
    notes: prismaData.notes,
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    appleConnect: prismaData.appleConnect,
    box: prismaData.box,
    frameIO: prismaData.frameIO,
    maui: prismaData.maui,
    mdm: prismaData.mdm,
    slack: prismaData.slack,
    webex: prismaData.webex,
    mail: prismaData.mail,
    quip: prismaData.quip,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Contact from Firestore to Prisma format
 */
export function mapContactFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    firstName: firestoreData.firstName,
    lastName: firestoreData.lastName,
    email: firestoreData.email,
    phoneNumber: firestoreData.phoneNumber,
    department: firestoreData.department,
    positionType: firestoreData.positionType,
    roomNumber: firestoreData.roomNumber,
    idBadgeNumber: firestoreData.idBadgeNumber,
    notes: firestoreData.notes,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    appleConnect: firestoreData.appleConnect,
    box: firestoreData.box,
    frameIO: firestoreData.frameIO,
    maui: firestoreData.maui,
    mdm: firestoreData.mdm,
    slack: firestoreData.slack,
    webex: firestoreData.webex,
    mail: firestoreData.mail,
    quip: firestoreData.quip,
  };
}


/**
 * Map Invoice from Prisma to Firestore format
 */
export function mapInvoiceToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    invoiceNumber: prismaData.invoiceNumber,
    userId: prismaData.userId,
    clientId: prismaData.clientId,
    issueDate: prismaData.issueDate ? Timestamp.fromDate(new Date(prismaData.issueDate)) : null,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    subtotal: prismaData.subtotal,
    taxRate: prismaData.taxRate,
    taxAmount: prismaData.taxAmount,
    total: prismaData.total,
    currency: prismaData.currency,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Invoice from Firestore to Prisma format
 */
export function mapInvoiceFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    invoiceNumber: firestoreData.invoiceNumber,
    userId: firestoreData.userId,
    clientId: firestoreData.clientId,
    issueDate: firestoreData.issueDate?.toDate() || null,
    dueDate: firestoreData.dueDate?.toDate() || null,
    subtotal: firestoreData.subtotal,
    taxRate: firestoreData.taxRate,
    taxAmount: firestoreData.taxAmount,
    total: firestoreData.total,
    currency: firestoreData.currency,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map InvoiceItem from Prisma to Firestore format
 */
export function mapInvoiceItemToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    invoiceId: prismaData.invoiceId,
    description: prismaData.description,
    quantity: prismaData.quantity,
    unitPrice: prismaData.unitPrice,
    amount: prismaData.amount,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InvoiceItem from Firestore to Prisma format
 */
export function mapInvoiceItemFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    invoiceId: firestoreData.invoiceId,
    description: firestoreData.description,
    quantity: firestoreData.quantity,
    unitPrice: firestoreData.unitPrice,
    amount: firestoreData.amount,
  };
}


/**
 * Map InvoicePayment from Prisma to Firestore format
 */
export function mapInvoicePaymentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    invoiceId: prismaData.invoiceId,
    amount: prismaData.amount,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    reference: prismaData.reference,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InvoicePayment from Firestore to Prisma format
 */
export function mapInvoicePaymentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    invoiceId: firestoreData.invoiceId,
    amount: firestoreData.amount,
    date: firestoreData.date?.toDate() || null,
    reference: firestoreData.reference,
  };
}


/**
 * Map InvoiceAttachment from Prisma to Firestore format
 */
export function mapInvoiceAttachmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    invoiceId: prismaData.invoiceId,
    fileName: prismaData.fileName,
    fileUrl: prismaData.fileUrl,
    fileType: prismaData.fileType,
    uploadDate: prismaData.uploadDate ? Timestamp.fromDate(new Date(prismaData.uploadDate)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InvoiceAttachment from Firestore to Prisma format
 */
export function mapInvoiceAttachmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    invoiceId: firestoreData.invoiceId,
    fileName: firestoreData.fileName,
    fileUrl: firestoreData.fileUrl,
    fileType: firestoreData.fileType,
    uploadDate: firestoreData.uploadDate?.toDate() || null,
  };
}


/**
 * Map Report from Prisma to Firestore format
 */
export function mapReportToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    title: prismaData.title,
    content: prismaData.content,
    metadata: prismaData.metadata || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    description: prismaData.description,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Report from Firestore to Prisma format
 */
export function mapReportFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    title: firestoreData.title,
    content: firestoreData.content,
    metadata: firestoreData.metadata,
    createdAt: firestoreData.createdAt?.toDate() || null,
    description: firestoreData.description,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ContactGroup from Prisma to Firestore format
 */
export function mapContactGroupToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ContactGroup from Firestore to Prisma format
 */
export function mapContactGroupFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ContactGroupMembership from Prisma to Firestore format
 */
export function mapContactGroupMembershipToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    contactId: prismaData.contactId,
    contactGroupId: prismaData.contactGroupId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ContactGroupMembership from Firestore to Prisma format
 */
export function mapContactGroupMembershipFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    contactId: firestoreData.contactId,
    contactGroupId: firestoreData.contactGroupId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Chat from Prisma to Firestore format
 */
export function mapChatToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    isArchived: prismaData.isArchived,
    type: prismaData.type,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Chat from Firestore to Prisma format
 */
export function mapChatFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    isArchived: firestoreData.isArchived,
    type: firestoreData.type,
  };
}


/**
 * Map ChatParticipant from Prisma to Firestore format
 */
export function mapChatParticipantToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    chatId: prismaData.chatId,
    userId: prismaData.userId,
    joinedAt: prismaData.joinedAt ? Timestamp.fromDate(new Date(prismaData.joinedAt)) : null,
    leftAt: prismaData.leftAt ? Timestamp.fromDate(new Date(prismaData.leftAt)) : null,
    isAdmin: prismaData.isAdmin,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ChatParticipant from Firestore to Prisma format
 */
export function mapChatParticipantFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    chatId: firestoreData.chatId,
    userId: firestoreData.userId,
    joinedAt: firestoreData.joinedAt?.toDate() || null,
    leftAt: firestoreData.leftAt?.toDate() || null,
    isAdmin: firestoreData.isAdmin,
  };
}


/**
 * Map Message from Prisma to Firestore format
 */
export function mapMessageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    chatId: prismaData.chatId,
    userId: prismaData.userId,
    content: prismaData.content,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    status: prismaData.status,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Message from Firestore to Prisma format
 */
export function mapMessageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    chatId: firestoreData.chatId,
    userId: firestoreData.userId,
    content: firestoreData.content,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    status: firestoreData.status,
  };
}


/**
 * Map MessageRead from Prisma to Firestore format
 */
export function mapMessageReadToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    messageId: prismaData.messageId,
    userId: prismaData.userId,
    readAt: prismaData.readAt ? Timestamp.fromDate(new Date(prismaData.readAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MessageRead from Firestore to Prisma format
 */
export function mapMessageReadFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    messageId: firestoreData.messageId,
    userId: firestoreData.userId,
    readAt: firestoreData.readAt?.toDate() || null,
  };
}


/**
 * Map Agent from Prisma to Firestore format
 */
export function mapAgentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    name: prismaData.name,
    description: prismaData.description,
    capabilities: prismaData.capabilities || {},
    parameters: prismaData.parameters || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Agent from Firestore to Prisma format
 */
export function mapAgentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    name: firestoreData.name,
    description: firestoreData.description,
    capabilities: firestoreData.capabilities,
    parameters: firestoreData.parameters,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map AgentMemory from Prisma to Firestore format
 */
export function mapAgentMemoryToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    agentId: prismaData.agentId,
    content: prismaData.content,
    context: prismaData.context || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AgentMemory from Firestore to Prisma format
 */
export function mapAgentMemoryFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    agentId: firestoreData.agentId,
    content: firestoreData.content,
    context: firestoreData.context,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map AgentFunctionLog from Prisma to Firestore format
 */
export function mapAgentFunctionLogToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    agentId: prismaData.agentId,
    functionName: prismaData.functionName,
    parameters: prismaData.parameters || {},
    result: prismaData.result || {},
    startTime: prismaData.startTime ? Timestamp.fromDate(new Date(prismaData.startTime)) : null,
    endTime: prismaData.endTime ? Timestamp.fromDate(new Date(prismaData.endTime)) : null,
    error: prismaData.error,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AgentFunctionLog from Firestore to Prisma format
 */
export function mapAgentFunctionLogFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    agentId: firestoreData.agentId,
    functionName: firestoreData.functionName,
    parameters: firestoreData.parameters,
    result: firestoreData.result,
    startTime: firestoreData.startTime?.toDate() || null,
    endTime: firestoreData.endTime?.toDate() || null,
    error: firestoreData.error,
  };
}


/**
 * Map ResearchSession from Prisma to Firestore format
 */
export function mapResearchSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    topic: prismaData.topic,
    notes: prismaData.notes,
    activeModule: prismaData.activeModule,
    results: prismaData.results || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ResearchSession from Firestore to Prisma format
 */
export function mapResearchSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    topic: firestoreData.topic,
    notes: firestoreData.notes,
    activeModule: firestoreData.activeModule,
    results: firestoreData.results,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map SchedulerEvent from Prisma to Firestore format
 */
export function mapSchedulerEventToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    isReminder: prismaData.isReminder,
    assignToAgent: prismaData.assignToAgent,
    agentId: prismaData.agentId,
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    eventType: prismaData.eventType,
    location: prismaData.location,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SchedulerEvent from Firestore to Prisma format
 */
export function mapSchedulerEventFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    title: firestoreData.title,
    description: firestoreData.description,
    date: firestoreData.date?.toDate() || null,
    isReminder: firestoreData.isReminder,
    assignToAgent: firestoreData.assignToAgent,
    agentId: firestoreData.agentId,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    eventType: firestoreData.eventType,
    location: firestoreData.location,
  };
}


/**
 * Map SchedulerEventAssignment from Prisma to Firestore format
 */
export function mapSchedulerEventAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    eventId: prismaData.eventId,
    userId: prismaData.userId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    assignedBy: prismaData.assignedBy,
    status: prismaData.status,
    notes: prismaData.notes,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SchedulerEventAssignment from Firestore to Prisma format
 */
export function mapSchedulerEventAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    eventId: firestoreData.eventId,
    userId: firestoreData.userId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    assignedBy: firestoreData.assignedBy,
    status: firestoreData.status,
    notes: firestoreData.notes,
  };
}


/**
 * Map SchedulerTask from Prisma to Firestore format
 */
export function mapSchedulerTaskToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    assignedAgent: prismaData.assignedAgent,
    status: prismaData.status,
    userId: prismaData.userId,
    isRecurring: prismaData.isRecurring,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SchedulerTask from Firestore to Prisma format
 */
export function mapSchedulerTaskFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    title: firestoreData.title,
    description: firestoreData.description,
    dueDate: firestoreData.dueDate?.toDate() || null,
    assignedAgent: firestoreData.assignedAgent,
    status: firestoreData.status,
    userId: firestoreData.userId,
    isRecurring: firestoreData.isRecurring,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map Note from Prisma to Firestore format
 */
export function mapNoteToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    title: prismaData.title,
    content: prismaData.content,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    userId: prismaData.userId,
    category: prismaData.category,
    sessionId: prismaData.sessionId,
    tags: prismaData.tags,
    color: prismaData.color,
    isArchived: prismaData.isArchived,
    isFavorite: prismaData.isFavorite,
    lastEdited: prismaData.lastEdited ? Timestamp.fromDate(new Date(prismaData.lastEdited)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Note from Firestore to Prisma format
 */
export function mapNoteFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    title: firestoreData.title,
    content: firestoreData.content,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    userId: firestoreData.userId,
    category: firestoreData.category,
    sessionId: firestoreData.sessionId,
    tags: firestoreData.tags,
    color: firestoreData.color,
    isArchived: firestoreData.isArchived,
    isFavorite: firestoreData.isFavorite,
    lastEdited: firestoreData.lastEdited?.toDate() || null,
  };
}


/**
 * Map TestModel from Prisma to Firestore format
 */
export function mapTestModelToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TestModel from Firestore to Prisma format
 */
export function mapTestModelFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
  };
}


/**
 * Map MessageSession from Prisma to Firestore format
 */
export function mapMessageSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    productionSessionId: prismaData.productionSessionId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    description: prismaData.description,
    isArchived: prismaData.isArchived,
    name: prismaData.name,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MessageSession from Firestore to Prisma format
 */
export function mapMessageSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    productionSessionId: firestoreData.productionSessionId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    description: firestoreData.description,
    isArchived: firestoreData.isArchived,
    name: firestoreData.name,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MessageParticipant from Prisma to Firestore format
 */
export function mapMessageParticipantToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    messageSessionId: prismaData.messageSessionId,
    contactId: prismaData.contactId,
    userId: prismaData.userId,
    joinedAt: prismaData.joinedAt ? Timestamp.fromDate(new Date(prismaData.joinedAt)) : null,
    leftAt: prismaData.leftAt ? Timestamp.fromDate(new Date(prismaData.leftAt)) : null,
    isAdmin: prismaData.isAdmin,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MessageParticipant from Firestore to Prisma format
 */
export function mapMessageParticipantFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    messageSessionId: firestoreData.messageSessionId,
    contactId: firestoreData.contactId,
    userId: firestoreData.userId,
    joinedAt: firestoreData.joinedAt?.toDate() || null,
    leftAt: firestoreData.leftAt?.toDate() || null,
    isAdmin: firestoreData.isAdmin,
  };
}


/**
 * Map SessionMessage from Prisma to Firestore format
 */
export function mapSessionMessageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    messageSessionId: prismaData.messageSessionId,
    senderId: prismaData.senderId,
    content: prismaData.content,
    timestamp: prismaData.timestamp ? Timestamp.fromDate(new Date(prismaData.timestamp)) : null,
    isRead: prismaData.isRead,
    replyToId: prismaData.replyToId,
    attachmentUrl: prismaData.attachmentUrl,
    attachmentType: prismaData.attachmentType,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionMessage from Firestore to Prisma format
 */
export function mapSessionMessageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    messageSessionId: firestoreData.messageSessionId,
    senderId: firestoreData.senderId,
    content: firestoreData.content,
    timestamp: firestoreData.timestamp?.toDate() || null,
    isRead: firestoreData.isRead,
    replyToId: firestoreData.replyToId,
    attachmentUrl: firestoreData.attachmentUrl,
    attachmentType: firestoreData.attachmentType,
  };
}


/**
 * Map SessionMessageRead from Prisma to Firestore format
 */
export function mapSessionMessageReadToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    messageId: prismaData.messageId,
    userId: prismaData.userId,
    readAt: prismaData.readAt ? Timestamp.fromDate(new Date(prismaData.readAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionMessageRead from Firestore to Prisma format
 */
export function mapSessionMessageReadFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    messageId: firestoreData.messageId,
    userId: firestoreData.userId,
    readAt: firestoreData.readAt?.toDate() || null,
  };
}


/**
 * Map InventoryItem from Prisma to Firestore format
 */
export function mapInventoryItemToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    department: prismaData.department,
    location: prismaData.location,
    purchaseDate: prismaData.purchaseDate ? Timestamp.fromDate(new Date(prismaData.purchaseDate)) : null,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdById: prismaData.createdById,
    subLocation: prismaData.subLocation,
    assetUuid: prismaData.assetUuid,
    assetTag: prismaData.assetTag,
    macSerialNumber: prismaData.macSerialNumber,
    manufacturer: prismaData.manufacturer,
    model: prismaData.model,
    purchasePrice: prismaData.purchasePrice,
    serialNumber: prismaData.serialNumber,
    warrantyExpires: prismaData.warrantyExpires ? Timestamp.fromDate(new Date(prismaData.warrantyExpires)) : null,
    assignedTo: prismaData.assignedTo,
    specifications: prismaData.specifications || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InventoryItem from Firestore to Prisma format
 */
export function mapInventoryItemFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    department: firestoreData.department,
    location: firestoreData.location,
    purchaseDate: firestoreData.purchaseDate?.toDate() || null,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdById: firestoreData.createdById,
    subLocation: firestoreData.subLocation,
    assetUuid: firestoreData.assetUuid,
    assetTag: firestoreData.assetTag,
    macSerialNumber: firestoreData.macSerialNumber,
    manufacturer: firestoreData.manufacturer,
    model: firestoreData.model,
    purchasePrice: firestoreData.purchasePrice,
    serialNumber: firestoreData.serialNumber,
    warrantyExpires: firestoreData.warrantyExpires?.toDate() || null,
    assignedTo: firestoreData.assignedTo,
    specifications: firestoreData.specifications,
  };
}


/**
 * Map Schema from Prisma to Firestore format
 */
export function mapSchemaToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    appliesTo: prismaData.appliesTo,
    isActive: prismaData.isActive,
    isDefault: prismaData.isDefault,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Schema from Firestore to Prisma format
 */
export function mapSchemaFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    appliesTo: firestoreData.appliesTo,
    isActive: firestoreData.isActive,
    isDefault: firestoreData.isDefault,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map SchemaField from Prisma to Firestore format
 */
export function mapSchemaFieldToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    schemaId: prismaData.schemaId,
    name: prismaData.name,
    key: prismaData.key,
    type: prismaData.type,
    options: prismaData.options,
    section: prismaData.section,
    description: prismaData.description,
    placeholder: prismaData.placeholder,
    required: prismaData.required,
    defaultValue: prismaData.defaultValue,
    order: prismaData.order,
    isActive: prismaData.isActive,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SchemaField from Firestore to Prisma format
 */
export function mapSchemaFieldFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    schemaId: firestoreData.schemaId,
    name: firestoreData.name,
    key: firestoreData.key,
    type: firestoreData.type,
    options: firestoreData.options,
    section: firestoreData.section,
    description: firestoreData.description,
    placeholder: firestoreData.placeholder,
    required: firestoreData.required,
    defaultValue: firestoreData.defaultValue,
    order: firestoreData.order,
    isActive: firestoreData.isActive,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map NetworkIPAssignment from Prisma to Firestore format
 */
export function mapNetworkIPAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    ipAddress: prismaData.ipAddress,
    assetId: prismaData.assetId,
    dns: prismaData.dns,
    gateway: prismaData.gateway,
    subnetMask: prismaData.subnetMask,
    vlan: prismaData.vlan,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    notes: prismaData.notes,
    isActive: prismaData.isActive,
    releasedAt: prismaData.releasedAt ? Timestamp.fromDate(new Date(prismaData.releasedAt)) : null,
    status: prismaData.status,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map NetworkIPAssignment from Firestore to Prisma format
 */
export function mapNetworkIPAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    ipAddress: firestoreData.ipAddress,
    assetId: firestoreData.assetId,
    dns: firestoreData.dns,
    gateway: firestoreData.gateway,
    subnetMask: firestoreData.subnetMask,
    vlan: firestoreData.vlan,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    notes: firestoreData.notes,
    isActive: firestoreData.isActive,
    releasedAt: firestoreData.releasedAt?.toDate() || null,
    status: firestoreData.status,
  };
}


/**
 * Map InventoryHistory from Prisma to Firestore format
 */
export function mapInventoryHistoryToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    inventoryId: prismaData.inventoryId,
    userId: prismaData.userId,
    timestamp: prismaData.timestamp ? Timestamp.fromDate(new Date(prismaData.timestamp)) : null,
    changedField: prismaData.changedField,
    description: prismaData.description,
    newValue: prismaData.newValue,
    oldValue: prismaData.oldValue,
    action: prismaData.action,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InventoryHistory from Firestore to Prisma format
 */
export function mapInventoryHistoryFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    inventoryId: firestoreData.inventoryId,
    userId: firestoreData.userId,
    timestamp: firestoreData.timestamp?.toDate() || null,
    changedField: firestoreData.changedField,
    description: firestoreData.description,
    newValue: firestoreData.newValue,
    oldValue: firestoreData.oldValue,
    action: firestoreData.action,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map InventoryAssignmentHistory from Prisma to Firestore format
 */
export function mapInventoryAssignmentHistoryToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    inventoryId: prismaData.inventoryId,
    assignedTo: prismaData.assignedTo,
    assignedBy: prismaData.assignedBy,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    returnedAt: prismaData.returnedAt ? Timestamp.fromDate(new Date(prismaData.returnedAt)) : null,
    returnedBy: prismaData.returnedBy,
    assignmentType: prismaData.assignmentType,
    notes: prismaData.notes,
    userName: prismaData.userName,
    userEmail: prismaData.userEmail,
    userDepartment: prismaData.userDepartment,
    checkoutDate: prismaData.checkoutDate ? Timestamp.fromDate(new Date(prismaData.checkoutDate)) : null,
    expectedReturnDate: prismaData.expectedReturnDate ? Timestamp.fromDate(new Date(prismaData.expectedReturnDate)) : null,
    actualReturnDate: prismaData.actualReturnDate ? Timestamp.fromDate(new Date(prismaData.actualReturnDate)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InventoryAssignmentHistory from Firestore to Prisma format
 */
export function mapInventoryAssignmentHistoryFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    inventoryId: firestoreData.inventoryId,
    assignedTo: firestoreData.assignedTo,
    assignedBy: firestoreData.assignedBy,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    returnedAt: firestoreData.returnedAt?.toDate() || null,
    returnedBy: firestoreData.returnedBy,
    assignmentType: firestoreData.assignmentType,
    notes: firestoreData.notes,
    userName: firestoreData.userName,
    userEmail: firestoreData.userEmail,
    userDepartment: firestoreData.userDepartment,
    checkoutDate: firestoreData.checkoutDate?.toDate() || null,
    expectedReturnDate: firestoreData.expectedReturnDate?.toDate() || null,
    actualReturnDate: firestoreData.actualReturnDate?.toDate() || null,
  };
}


/**
 * Map Server from Prisma to Firestore format
 */
export function mapServerToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    ipAddress: prismaData.ipAddress,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    inventoryItemId: prismaData.inventoryItemId,
    cpuInfo: prismaData.cpuInfo,
    description: prismaData.description,
    hostname: prismaData.hostname,
    loginUsername: prismaData.loginUsername,
    memoryInfo: prismaData.memoryInfo,
    networkInfo: prismaData.networkInfo,
    osName: prismaData.osName,
    osVersion: prismaData.osVersion,
    storageInfo: prismaData.storageInfo,
    userId: prismaData.userId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Server from Firestore to Prisma format
 */
export function mapServerFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    ipAddress: firestoreData.ipAddress,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    inventoryItemId: firestoreData.inventoryItemId,
    cpuInfo: firestoreData.cpuInfo,
    description: firestoreData.description,
    hostname: firestoreData.hostname,
    loginUsername: firestoreData.loginUsername,
    memoryInfo: firestoreData.memoryInfo,
    networkInfo: firestoreData.networkInfo,
    osName: firestoreData.osName,
    osVersion: firestoreData.osVersion,
    storageInfo: firestoreData.storageInfo,
    userId: firestoreData.userId,
  };
}


/**
 * Map AssetSetup from Prisma to Firestore format
 */
export function mapAssetSetupToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetId: prismaData.assetId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    configurations: prismaData.configurations || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AssetSetup from Firestore to Prisma format
 */
export function mapAssetSetupFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetId: firestoreData.assetId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    configurations: firestoreData.configurations,
  };
}


/**
 * Map SetupProfile from Prisma to Firestore format
 */
export function mapSetupProfileToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    type: prismaData.type,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SetupProfile from Firestore to Prisma format
 */
export function mapSetupProfileFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    type: firestoreData.type,
  };
}


/**
 * Map SetupChecklist from Prisma to Firestore format
 */
export function mapSetupChecklistToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    setupProfileId: prismaData.setupProfileId,
    item: prismaData.item,
    description: prismaData.description,
    isRequired: prismaData.isRequired,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SetupChecklist from Firestore to Prisma format
 */
export function mapSetupChecklistFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    setupProfileId: firestoreData.setupProfileId,
    item: firestoreData.item,
    description: firestoreData.description,
    isRequired: firestoreData.isRequired,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map AssetSetupChecklist from Prisma to Firestore format
 */
export function mapAssetSetupChecklistToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    assetSetupId: prismaData.assetSetupId,
    checklistId: prismaData.checklistId,
    isCompleted: prismaData.isCompleted,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AssetSetupChecklist from Firestore to Prisma format
 */
export function mapAssetSetupChecklistFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    assetSetupId: firestoreData.assetSetupId,
    checklistId: firestoreData.checklistId,
    isCompleted: firestoreData.isCompleted,
    completedAt: firestoreData.completedAt?.toDate() || null,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ChapterMarker from Prisma to Firestore format
 */
export function mapChapterMarkerToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    title: prismaData.title,
    timecode: prismaData.timecode,
    description: prismaData.description,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ChapterMarker from Firestore to Prisma format
 */
export function mapChapterMarkerFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    title: firestoreData.title,
    timecode: firestoreData.timecode,
    description: firestoreData.description,
  };
}


/**
 * Map Project from Prisma to Firestore format
 */
export function mapProjectToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    status: prismaData.status,
    allowCollaboration: prismaData.allowCollaboration,
    allowGuestUsers: prismaData.allowGuestUsers,
    allowRealTimeEditing: prismaData.allowRealTimeEditing,
    applicationMode: prismaData.applicationMode,
    archivedAt: prismaData.archivedAt ? Timestamp.fromDate(new Date(prismaData.archivedAt)) : null,
    archivedBy: prismaData.archivedBy,
    autoSave: prismaData.autoSave,
    autoSync: prismaData.autoSync,
    backupEnabled: prismaData.backupEnabled,
    conflictResolution: prismaData.conflictResolution,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    enableActivityLog: prismaData.enableActivityLog,
    enableChat: prismaData.enableChat,
    enableComments: prismaData.enableComments,
    enableOfflineMode: prismaData.enableOfflineMode,
    enablePresenceIndicators: prismaData.enablePresenceIndicators,
    encryptionEnabled: prismaData.encryptionEnabled,
    filePath: prismaData.filePath,
    fileSize: prismaData.fileSize,
    isActive: prismaData.isActive,
    isArchived: prismaData.isArchived,
    lastAccessedAt: prismaData.lastAccessedAt ? Timestamp.fromDate(new Date(prismaData.lastAccessedAt)) : null,
    lastSyncedAt: prismaData.lastSyncedAt ? Timestamp.fromDate(new Date(prismaData.lastSyncedAt)) : null,
    maxCollaborators: prismaData.maxCollaborators,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Project from Firestore to Prisma format
 */
export function mapProjectFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    startDate: firestoreData.startDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    status: firestoreData.status,
    allowCollaboration: firestoreData.allowCollaboration,
    allowGuestUsers: firestoreData.allowGuestUsers,
    allowRealTimeEditing: firestoreData.allowRealTimeEditing,
    applicationMode: firestoreData.applicationMode,
    archivedAt: firestoreData.archivedAt?.toDate() || null,
    archivedBy: firestoreData.archivedBy,
    autoSave: firestoreData.autoSave,
    autoSync: firestoreData.autoSync,
    backupEnabled: firestoreData.backupEnabled,
    conflictResolution: firestoreData.conflictResolution,
    createdAt: firestoreData.createdAt?.toDate() || null,
    enableActivityLog: firestoreData.enableActivityLog,
    enableChat: firestoreData.enableChat,
    enableComments: firestoreData.enableComments,
    enableOfflineMode: firestoreData.enableOfflineMode,
    enablePresenceIndicators: firestoreData.enablePresenceIndicators,
    encryptionEnabled: firestoreData.encryptionEnabled,
    filePath: firestoreData.filePath,
    fileSize: firestoreData.fileSize,
    isActive: firestoreData.isActive,
    isArchived: firestoreData.isArchived,
    lastAccessedAt: firestoreData.lastAccessedAt?.toDate() || null,
    lastSyncedAt: firestoreData.lastSyncedAt?.toDate() || null,
    maxCollaborators: firestoreData.maxCollaborators,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ProjectParticipant from Prisma to Firestore format
 */
export function mapProjectParticipantToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    userId: prismaData.userId,
    role: prismaData.role,
    permissions: prismaData.permissions || {},
    joinedAt: prismaData.joinedAt ? Timestamp.fromDate(new Date(prismaData.joinedAt)) : null,
    lastActiveAt: prismaData.lastActiveAt ? Timestamp.fromDate(new Date(prismaData.lastActiveAt)) : null,
    isOnline: prismaData.isOnline,
    isActive: prismaData.isActive,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProjectParticipant from Firestore to Prisma format
 */
export function mapProjectParticipantFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    userId: firestoreData.userId,
    role: firestoreData.role,
    permissions: firestoreData.permissions,
    joinedAt: firestoreData.joinedAt?.toDate() || null,
    lastActiveAt: firestoreData.lastActiveAt?.toDate() || null,
    isOnline: firestoreData.isOnline,
    isActive: firestoreData.isActive,
  };
}


/**
 * Map QcStatus from Prisma to Firestore format
 */
export function mapQcStatusToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    status: prismaData.status,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    actualHours: prismaData.actualHours,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    estimatedHours: prismaData.estimatedHours,
    overallScore: prismaData.overallScore,
    passThreshold: prismaData.passThreshold,
    qcSpecialistId: prismaData.qcSpecialistId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcStatus from Firestore to Prisma format
 */
export function mapQcStatusFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    status: firestoreData.status,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    actualHours: firestoreData.actualHours,
    completedAt: firestoreData.completedAt?.toDate() || null,
    estimatedHours: firestoreData.estimatedHours,
    overallScore: firestoreData.overallScore,
    passThreshold: firestoreData.passThreshold,
    qcSpecialistId: firestoreData.qcSpecialistId,
  };
}


/**
 * Map QcSession from Prisma to Firestore format
 */
export function mapQcSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    qcStatusId: prismaData.qcStatusId,
    sessionId: prismaData.sessionId,
    workflowStepId: prismaData.workflowStepId,
    reviewSessionId: prismaData.reviewSessionId,
    assignedToUserId: prismaData.assignedToUserId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    assignedByUserId: prismaData.assignedByUserId,
    startedAt: prismaData.startedAt ? Timestamp.fromDate(new Date(prismaData.startedAt)) : null,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    estimatedDuration: prismaData.estimatedDuration,
    actualDuration: prismaData.actualDuration,
    dueDate: prismaData.dueDate ? Timestamp.fromDate(new Date(prismaData.dueDate)) : null,
    overallScore: prismaData.overallScore,
    passThreshold: prismaData.passThreshold,
    criticalIssues: prismaData.criticalIssues,
    majorIssues: prismaData.majorIssues,
    minorIssues: prismaData.minorIssues,
    notes: prismaData.notes,
    recommendations: prismaData.recommendations,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcSession from Firestore to Prisma format
 */
export function mapQcSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    qcStatusId: firestoreData.qcStatusId,
    sessionId: firestoreData.sessionId,
    workflowStepId: firestoreData.workflowStepId,
    reviewSessionId: firestoreData.reviewSessionId,
    assignedToUserId: firestoreData.assignedToUserId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    assignedByUserId: firestoreData.assignedByUserId,
    startedAt: firestoreData.startedAt?.toDate() || null,
    completedAt: firestoreData.completedAt?.toDate() || null,
    estimatedDuration: firestoreData.estimatedDuration,
    actualDuration: firestoreData.actualDuration,
    dueDate: firestoreData.dueDate?.toDate() || null,
    overallScore: firestoreData.overallScore,
    passThreshold: firestoreData.passThreshold,
    criticalIssues: firestoreData.criticalIssues,
    majorIssues: firestoreData.majorIssues,
    minorIssues: firestoreData.minorIssues,
    notes: firestoreData.notes,
    recommendations: firestoreData.recommendations,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map QcChecklistItem from Prisma to Firestore format
 */
export function mapQcChecklistItemToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    qcStatusId: prismaData.qcStatusId,
    qcSessionId: prismaData.qcSessionId,
    title: prismaData.title,
    description: prismaData.description,
    isRequired: prismaData.isRequired,
    weight: prismaData.weight,
    order: prismaData.order,
    score: prismaData.score,
    notes: prismaData.notes,
    checkedByUserId: prismaData.checkedByUserId,
    checkedAt: prismaData.checkedAt ? Timestamp.fromDate(new Date(prismaData.checkedAt)) : null,
    expectedValue: prismaData.expectedValue,
    actualValue: prismaData.actualValue,
    tolerance: prismaData.tolerance,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcChecklistItem from Firestore to Prisma format
 */
export function mapQcChecklistItemFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    qcStatusId: firestoreData.qcStatusId,
    qcSessionId: firestoreData.qcSessionId,
    title: firestoreData.title,
    description: firestoreData.description,
    isRequired: firestoreData.isRequired,
    weight: firestoreData.weight,
    order: firestoreData.order,
    score: firestoreData.score,
    notes: firestoreData.notes,
    checkedByUserId: firestoreData.checkedByUserId,
    checkedAt: firestoreData.checkedAt?.toDate() || null,
    expectedValue: firestoreData.expectedValue,
    actualValue: firestoreData.actualValue,
    tolerance: firestoreData.tolerance,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map QcFinding from Prisma to Firestore format
 */
export function mapQcFindingToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    qcSessionId: prismaData.qcSessionId,
    title: prismaData.title,
    description: prismaData.description,
    location: prismaData.location,
    resolution: prismaData.resolution,
    resolvedAt: prismaData.resolvedAt ? Timestamp.fromDate(new Date(prismaData.resolvedAt)) : null,
    resolvedByUserId: prismaData.resolvedByUserId,
    screenshot: prismaData.screenshot,
    attachments: prismaData.attachments || {},
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcFinding from Firestore to Prisma format
 */
export function mapQcFindingFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    qcSessionId: firestoreData.qcSessionId,
    title: firestoreData.title,
    description: firestoreData.description,
    location: firestoreData.location,
    resolution: firestoreData.resolution,
    resolvedAt: firestoreData.resolvedAt?.toDate() || null,
    resolvedByUserId: firestoreData.resolvedByUserId,
    screenshot: firestoreData.screenshot,
    attachments: firestoreData.attachments,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map QcReport from Prisma to Firestore format
 */
export function mapQcReportToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    qcStatusId: prismaData.qcStatusId,
    qcSessionId: prismaData.qcSessionId,
    sessionId: prismaData.sessionId,
    title: prismaData.title,
    summary: prismaData.summary,
    recommendations: prismaData.recommendations,
    overallScore: prismaData.overallScore,
    totalChecks: prismaData.totalChecks,
    passedChecks: prismaData.passedChecks,
    failedChecks: prismaData.failedChecks,
    criticalIssues: prismaData.criticalIssues,
    majorIssues: prismaData.majorIssues,
    minorIssues: prismaData.minorIssues,
    generatedAt: prismaData.generatedAt ? Timestamp.fromDate(new Date(prismaData.generatedAt)) : null,
    generatedByUserId: prismaData.generatedByUserId,
    reportData: prismaData.reportData || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcReport from Firestore to Prisma format
 */
export function mapQcReportFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    qcStatusId: firestoreData.qcStatusId,
    qcSessionId: firestoreData.qcSessionId,
    sessionId: firestoreData.sessionId,
    title: firestoreData.title,
    summary: firestoreData.summary,
    recommendations: firestoreData.recommendations,
    overallScore: firestoreData.overallScore,
    totalChecks: firestoreData.totalChecks,
    passedChecks: firestoreData.passedChecks,
    failedChecks: firestoreData.failedChecks,
    criticalIssues: firestoreData.criticalIssues,
    majorIssues: firestoreData.majorIssues,
    minorIssues: firestoreData.minorIssues,
    generatedAt: firestoreData.generatedAt?.toDate() || null,
    generatedByUserId: firestoreData.generatedByUserId,
    reportData: firestoreData.reportData,
  };
}


/**
 * Map QcActivity from Prisma to Firestore format
 */
export function mapQcActivityToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    qcSessionId: prismaData.qcSessionId,
    description: prismaData.description,
    details: prismaData.details || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map QcActivity from Firestore to Prisma format
 */
export function mapQcActivityFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    qcSessionId: firestoreData.qcSessionId,
    description: firestoreData.description,
    details: firestoreData.details,
  };
}


/**
 * Map SessionArchive from Prisma to Firestore format
 */
export function mapSessionArchiveToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    archivedAt: prismaData.archivedAt ? Timestamp.fromDate(new Date(prismaData.archivedAt)) : null,
    archivedByUserId: prismaData.archivedByUserId,
    archiveLocation: prismaData.archiveLocation,
    archiveNotes: prismaData.archiveNotes,
    finalCutPath: prismaData.finalCutPath,
    finalAudioPath: prismaData.finalAudioPath,
    finalColorPath: prismaData.finalColorPath,
    finalGfxPath: prismaData.finalGfxPath,
    keynotePath: prismaData.keynotePath,
    finalCutProjectPath: prismaData.finalCutProjectPath,
    finalQcReportPath: prismaData.finalQcReportPath,
    deliverables: prismaData.deliverables || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionArchive from Firestore to Prisma format
 */
export function mapSessionArchiveFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    archivedAt: firestoreData.archivedAt?.toDate() || null,
    archivedByUserId: firestoreData.archivedByUserId,
    archiveLocation: firestoreData.archiveLocation,
    archiveNotes: firestoreData.archiveNotes,
    finalCutPath: firestoreData.finalCutPath,
    finalAudioPath: firestoreData.finalAudioPath,
    finalColorPath: firestoreData.finalColorPath,
    finalGfxPath: firestoreData.finalGfxPath,
    keynotePath: firestoreData.keynotePath,
    finalCutProjectPath: firestoreData.finalCutProjectPath,
    finalQcReportPath: firestoreData.finalQcReportPath,
    deliverables: firestoreData.deliverables,
  };
}


/**
 * Map SessionFile from Prisma to Firestore format
 */
export function mapSessionFileToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    fileName: prismaData.fileName,
    fileType: prismaData.fileType,
    fileSize: prismaData.fileSize,
    filePath: prismaData.filePath,
    uploadDate: prismaData.uploadDate ? Timestamp.fromDate(new Date(prismaData.uploadDate)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionFile from Firestore to Prisma format
 */
export function mapSessionFileFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    fileName: firestoreData.fileName,
    fileType: firestoreData.fileType,
    fileSize: firestoreData.fileSize,
    filePath: firestoreData.filePath,
    uploadDate: firestoreData.uploadDate?.toDate() || null,
  };
}


/**
 * Map TaskNotification from Prisma to Firestore format
 */
export function mapTaskNotificationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    taskId: prismaData.taskId,
    type: prismaData.type,
    message: prismaData.message,
    isRead: prismaData.isRead,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TaskNotification from Firestore to Prisma format
 */
export function mapTaskNotificationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    taskId: firestoreData.taskId,
    type: firestoreData.type,
    message: firestoreData.message,
    isRead: firestoreData.isRead,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map Network from Prisma to Firestore format
 */
export function mapNetworkToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    category: prismaData.category,
    isActive: prismaData.isActive,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Network from Firestore to Prisma format
 */
export function mapNetworkFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    category: firestoreData.category,
    isActive: firestoreData.isActive,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map NetworkIPRange from Prisma to Firestore format
 */
export function mapNetworkIPRangeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    startIP: prismaData.startIP,
    endIP: prismaData.endIP,
    subnetMask: prismaData.subnetMask,
    gateway: prismaData.gateway,
    dns: prismaData.dns,
    vlan: prismaData.vlan,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    networkId: prismaData.networkId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map NetworkIPRange from Firestore to Prisma format
 */
export function mapNetworkIPRangeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    startIP: firestoreData.startIP,
    endIP: firestoreData.endIP,
    subnetMask: firestoreData.subnetMask,
    gateway: firestoreData.gateway,
    dns: firestoreData.dns,
    vlan: firestoreData.vlan,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    networkId: firestoreData.networkId,
  };
}


/**
 * Map PodAssignment from Prisma to Firestore format
 */
export function mapPodAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    podId: prismaData.podId,
    podNumber: prismaData.podNumber,
    personId: prismaData.personId,
    roleId: prismaData.roleId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PodAssignment from Firestore to Prisma format
 */
export function mapPodAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    podId: firestoreData.podId,
    podNumber: firestoreData.podNumber,
    personId: firestoreData.personId,
    roleId: firestoreData.roleId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map SystemAsset from Prisma to Firestore format
 */
export function mapSystemAssetToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    type: prismaData.type,
    key: prismaData.key,
    data: prismaData.data,
    contentType: prismaData.contentType,
    size: prismaData.size,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SystemAsset from Firestore to Prisma format
 */
export function mapSystemAssetFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    type: firestoreData.type,
    key: firestoreData.key,
    data: firestoreData.data,
    contentType: firestoreData.contentType,
    size: firestoreData.size,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map TenantStorageUsage from Prisma to Firestore format
 */
export function mapTenantStorageUsageToFirestore(prismaData: any): any {
  return {
    tenantId: prismaData.tenantId,
    plan: prismaData.plan,
    customQuotaMb: prismaData.customQuotaMb,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TenantStorageUsage from Firestore to Prisma format
 */
export function mapTenantStorageUsageFromFirestore(firestoreData: any): any {
  return {
    tenantId: firestoreData.tenantId,
    plan: firestoreData.plan,
    customQuotaMb: firestoreData.customQuotaMb,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map InventoryMap from Prisma to Firestore format
 */
export function mapInventoryMapToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    items: prismaData.items,
    positions: prismaData.positions || {},
    containers: prismaData.containers || {},
    customMapImage: prismaData.customMapImage,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map InventoryMap from Firestore to Prisma format
 */
export function mapInventoryMapFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    items: firestoreData.items,
    positions: firestoreData.positions,
    containers: firestoreData.containers,
    customMapImage: firestoreData.customMapImage,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MapData from Prisma to Firestore format
 */
export function mapMapDataToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    data: prismaData.data || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MapData from Firestore to Prisma format
 */
export function mapMapDataFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    data: firestoreData.data,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MapLayout from Prisma to Firestore format
 */
export function mapMapLayoutToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    data: prismaData.data || {},
    isDefault: prismaData.isDefault,
    isActive: prismaData.isActive,
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    googleMapsData: prismaData.googleMapsData || {},
    locationData: prismaData.locationData || {},
    mapType: prismaData.mapType,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MapLayout from Firestore to Prisma format
 */
export function mapMapLayoutFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    data: firestoreData.data,
    isDefault: firestoreData.isDefault,
    isActive: firestoreData.isActive,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    googleMapsData: firestoreData.googleMapsData,
    locationData: firestoreData.locationData,
    mapType: firestoreData.mapType,
  };
}


/**
 * Map MapLocation from Prisma to Firestore format
 */
export function mapMapLocationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    mapLayoutId: prismaData.mapLayoutId,
    entityType: prismaData.entityType,
    entityId: prismaData.entityId,
    latitude: prismaData.latitude,
    longitude: prismaData.longitude,
    address: prismaData.address,
    placeId: prismaData.placeId,
    positionX: prismaData.positionX,
    positionY: prismaData.positionY,
    metadata: prismaData.metadata || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MapLocation from Firestore to Prisma format
 */
export function mapMapLocationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    mapLayoutId: firestoreData.mapLayoutId,
    entityType: firestoreData.entityType,
    entityId: firestoreData.entityId,
    latitude: firestoreData.latitude,
    longitude: firestoreData.longitude,
    address: firestoreData.address,
    placeId: firestoreData.placeId,
    positionX: firestoreData.positionX,
    positionY: firestoreData.positionY,
    metadata: firestoreData.metadata,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CommandCenterLayout from Prisma to Firestore format
 */
export function mapCommandCenterLayoutToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    userId: prismaData.userId,
    widgets: prismaData.widgets || {},
    gridSettings: prismaData.gridSettings || {},
    isDefault: prismaData.isDefault,
    isShared: prismaData.isShared,
    tags: prismaData.tags,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CommandCenterLayout from Firestore to Prisma format
 */
export function mapCommandCenterLayoutFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    userId: firestoreData.userId,
    widgets: firestoreData.widgets,
    gridSettings: firestoreData.gridSettings,
    isDefault: firestoreData.isDefault,
    isShared: firestoreData.isShared,
    tags: firestoreData.tags,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map SlackIntegration from Prisma to Firestore format
 */
export function mapSlackIntegrationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    slackUserId: prismaData.slackUserId,
    slackTeamId: prismaData.slackTeamId,
    accessToken: prismaData.accessToken,
    scope: prismaData.scope,
    botUserId: prismaData.botUserId,
    appId: prismaData.appId,
    workspaceName: prismaData.workspaceName,
    teamName: prismaData.teamName,
    isActive: prismaData.isActive,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SlackIntegration from Firestore to Prisma format
 */
export function mapSlackIntegrationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    slackUserId: firestoreData.slackUserId,
    slackTeamId: firestoreData.slackTeamId,
    accessToken: firestoreData.accessToken,
    scope: firestoreData.scope,
    botUserId: firestoreData.botUserId,
    appId: firestoreData.appId,
    workspaceName: firestoreData.workspaceName,
    teamName: firestoreData.teamName,
    isActive: firestoreData.isActive,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map WorkflowStep from Prisma to Firestore format
 */
export function mapWorkflowStepToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    nodeId: prismaData.nodeId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowStep from Firestore to Prisma format
 */
export function mapWorkflowStepFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    nodeId: firestoreData.nodeId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map WorkflowDependency from Prisma to Firestore format
 */
export function mapWorkflowDependencyToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sourceStepId: prismaData.sourceStepId,
    targetStepId: prismaData.targetStepId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowDependency from Firestore to Prisma format
 */
export function mapWorkflowDependencyFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sourceStepId: firestoreData.sourceStepId,
    targetStepId: firestoreData.targetStepId,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map WorkflowTrigger from Prisma to Firestore format
 */
export function mapWorkflowTriggerToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    conditions: prismaData.conditions || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowTrigger from Firestore to Prisma format
 */
export function mapWorkflowTriggerFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    conditions: firestoreData.conditions,
  };
}


/**
 * Map SessionWorkflow from Prisma to Firestore format
 */
export function mapSessionWorkflowToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    workflowId: prismaData.workflowId,
    status: prismaData.status,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionWorkflow from Firestore to Prisma format
 */
export function mapSessionWorkflowFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    workflowId: firestoreData.workflowId,
    status: firestoreData.status,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map WorkflowNotification from Prisma to Firestore format
 */
export function mapWorkflowNotificationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    workflowId: prismaData.workflowId,
    message: prismaData.message,
    type: prismaData.type,
    isRead: prismaData.isRead,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowNotification from Firestore to Prisma format
 */
export function mapWorkflowNotificationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    workflowId: firestoreData.workflowId,
    message: firestoreData.message,
    type: firestoreData.type,
    isRead: firestoreData.isRead,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map WorkflowActivity from Prisma to Firestore format
 */
export function mapWorkflowActivityToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    workflowId: prismaData.workflowId,
    activity: prismaData.activity,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowActivity from Firestore to Prisma format
 */
export function mapWorkflowActivityFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    workflowId: firestoreData.workflowId,
    activity: firestoreData.activity,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map SessionWorkflowTaskIntegration from Prisma to Firestore format
 */
export function mapSessionWorkflowTaskIntegrationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    taskId: prismaData.taskId,
    workflowId: prismaData.workflowId,
    status: prismaData.status,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionWorkflowTaskIntegration from Firestore to Prisma format
 */
export function mapSessionWorkflowTaskIntegrationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    taskId: firestoreData.taskId,
    workflowId: firestoreData.workflowId,
    status: firestoreData.status,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map PostProductionWorkflowCorrelation from Prisma to Firestore format
 */
export function mapPostProductionWorkflowCorrelationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    taskId: prismaData.taskId,
    workflowStepId: prismaData.workflowStepId,
    correlationType: prismaData.correlationType,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PostProductionWorkflowCorrelation from Firestore to Prisma format
 */
export function mapPostProductionWorkflowCorrelationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    taskId: firestoreData.taskId,
    workflowStepId: firestoreData.workflowStepId,
    correlationType: firestoreData.correlationType,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map Team from Prisma to Firestore format
 */
export function mapTeamToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    isActive: prismaData.isActive,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map Team from Firestore to Prisma format
 */
export function mapTeamFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    isActive: firestoreData.isActive,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map SessionSteps from Prisma to Firestore format
 */
export function mapSessionStepsToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    stepId: prismaData.stepId,
    status: prismaData.status,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionSteps from Firestore to Prisma format
 */
export function mapSessionStepsFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    stepId: firestoreData.stepId,
    status: firestoreData.status,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map UnifiedStepProgression from Prisma to Firestore format
 */
export function mapUnifiedStepProgressionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    stepId: prismaData.stepId,
    sessionId: prismaData.sessionId,
    progress: prismaData.progress,
    startedAt: prismaData.startedAt ? Timestamp.fromDate(new Date(prismaData.startedAt)) : null,
    pausedAt: prismaData.pausedAt ? Timestamp.fromDate(new Date(prismaData.pausedAt)) : null,
    resumedAt: prismaData.resumedAt ? Timestamp.fromDate(new Date(prismaData.resumedAt)) : null,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    totalPausedTime: prismaData.totalPausedTime,
    startedByUserId: prismaData.startedByUserId,
    completedByUserId: prismaData.completedByUserId,
    currentWorkingUserId: prismaData.currentWorkingUserId,
    dependencyStatus: prismaData.dependencyStatus || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UnifiedStepProgression from Firestore to Prisma format
 */
export function mapUnifiedStepProgressionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    stepId: firestoreData.stepId,
    sessionId: firestoreData.sessionId,
    progress: firestoreData.progress,
    startedAt: firestoreData.startedAt?.toDate() || null,
    pausedAt: firestoreData.pausedAt?.toDate() || null,
    resumedAt: firestoreData.resumedAt?.toDate() || null,
    completedAt: firestoreData.completedAt?.toDate() || null,
    totalPausedTime: firestoreData.totalPausedTime,
    startedByUserId: firestoreData.startedByUserId,
    completedByUserId: firestoreData.completedByUserId,
    currentWorkingUserId: firestoreData.currentWorkingUserId,
    dependencyStatus: firestoreData.dependencyStatus,
  };
}


/**
 * Map UnifiedStepEvent from Prisma to Firestore format
 */
export function mapUnifiedStepEventToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    stepId: prismaData.stepId,
    sessionId: prismaData.sessionId,
    eventData: prismaData.eventData || {},
    triggeredByUserId: prismaData.triggeredByUserId,
    timestamp: prismaData.timestamp ? Timestamp.fromDate(new Date(prismaData.timestamp)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UnifiedStepEvent from Firestore to Prisma format
 */
export function mapUnifiedStepEventFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    stepId: firestoreData.stepId,
    sessionId: firestoreData.sessionId,
    eventData: firestoreData.eventData,
    triggeredByUserId: firestoreData.triggeredByUserId,
    timestamp: firestoreData.timestamp?.toDate() || null,
  };
}


/**
 * Map SessionElement from Prisma to Firestore format
 */
export function mapSessionElementToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    version: prismaData.version,
    sessionId: prismaData.sessionId,
    stepId: prismaData.stepId,
    workflowInstanceId: prismaData.workflowInstanceId,
    parentElementId: prismaData.parentElementId,
    filePath: prismaData.filePath,
    fileName: prismaData.fileName,
    fileSize: prismaData.fileSize,
    mimeType: prismaData.mimeType,
    checksum: prismaData.checksum,
    additionalFiles: prismaData.additionalFiles || {},
    previewFiles: prismaData.previewFiles || {},
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionElement from Firestore to Prisma format
 */
export function mapSessionElementFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    version: firestoreData.version,
    sessionId: firestoreData.sessionId,
    stepId: firestoreData.stepId,
    workflowInstanceId: firestoreData.workflowInstanceId,
    parentElementId: firestoreData.parentElementId,
    filePath: firestoreData.filePath,
    fileName: firestoreData.fileName,
    fileSize: firestoreData.fileSize,
    mimeType: firestoreData.mimeType,
    checksum: firestoreData.checksum,
    additionalFiles: firestoreData.additionalFiles,
    previewFiles: firestoreData.previewFiles,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ElementActivity from Prisma to Firestore format
 */
export function mapElementActivityToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    elementId: prismaData.elementId,
    description: prismaData.description,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ElementActivity from Firestore to Prisma format
 */
export function mapElementActivityFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    elementId: firestoreData.elementId,
    description: firestoreData.description,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ElementReview from Prisma to Firestore format
 */
export function mapElementReviewToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    elementId: prismaData.elementId,
    reviewerUserId: prismaData.reviewerUserId,
    rating: prismaData.rating,
    feedback: prismaData.feedback,
    requestedChanges: prismaData.requestedChanges || {},
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ElementReview from Firestore to Prisma format
 */
export function mapElementReviewFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    elementId: firestoreData.elementId,
    reviewerUserId: firestoreData.reviewerUserId,
    rating: firestoreData.rating,
    feedback: firestoreData.feedback,
    requestedChanges: firestoreData.requestedChanges,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ElementFile from Prisma to Firestore format
 */
export function mapElementFileToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    elementId: prismaData.elementId,
    fileName: prismaData.fileName,
    filePath: prismaData.filePath,
    fileSize: prismaData.fileSize,
    mimeType: prismaData.mimeType,
    checksum: prismaData.checksum,
    fileType: prismaData.fileType,
    uploadedByUserId: prismaData.uploadedByUserId,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ElementFile from Firestore to Prisma format
 */
export function mapElementFileFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    elementId: firestoreData.elementId,
    fileName: firestoreData.fileName,
    filePath: firestoreData.filePath,
    fileSize: firestoreData.fileSize,
    mimeType: firestoreData.mimeType,
    checksum: firestoreData.checksum,
    fileType: firestoreData.fileType,
    uploadedByUserId: firestoreData.uploadedByUserId,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ElementDependency from Prisma to Firestore format
 */
export function mapElementDependencyToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    elementId: prismaData.elementId,
    dependencyElementId: prismaData.dependencyElementId,
    createdByUserId: prismaData.createdByUserId,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ElementDependency from Firestore to Prisma format
 */
export function mapElementDependencyFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    elementId: firestoreData.elementId,
    dependencyElementId: firestoreData.dependencyElementId,
    createdByUserId: firestoreData.createdByUserId,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map MediaFileTag from Prisma to Firestore format
 */
export function mapMediaFileTagToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    color: prismaData.color,
    category: prismaData.category,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MediaFileTag from Firestore to Prisma format
 */
export function mapMediaFileTagFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    color: firestoreData.color,
    category: firestoreData.category,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MediaFile from Prisma to Firestore format
 */
export function mapMediaFileToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    fileName: prismaData.fileName,
    originalFileName: prismaData.originalFileName,
    filePath: prismaData.filePath,
    fileSize: prismaData.fileSize,
    mimeType: prismaData.mimeType,
    fileType: prismaData.fileType,
    uploadedBy: prismaData.uploadedBy,
    uploadedAt: prismaData.uploadedAt ? Timestamp.fromDate(new Date(prismaData.uploadedAt)) : null,
    description: prismaData.description,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MediaFile from Firestore to Prisma format
 */
export function mapMediaFileFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    fileName: firestoreData.fileName,
    originalFileName: firestoreData.originalFileName,
    filePath: firestoreData.filePath,
    fileSize: firestoreData.fileSize,
    mimeType: firestoreData.mimeType,
    fileType: firestoreData.fileType,
    uploadedBy: firestoreData.uploadedBy,
    uploadedAt: firestoreData.uploadedAt?.toDate() || null,
    description: firestoreData.description,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ReviewFilePath from Prisma to Firestore format
 */
export function mapReviewFilePathToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    reviewSessionId: prismaData.reviewSessionId,
    filePath: prismaData.filePath,
    fileName: prismaData.fileName,
    fileType: prismaData.fileType,
    cutType: prismaData.cutType,
    uploadedBy: prismaData.uploadedBy,
    uploadedAt: prismaData.uploadedAt ? Timestamp.fromDate(new Date(prismaData.uploadedAt)) : null,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ReviewFilePath from Firestore to Prisma format
 */
export function mapReviewFilePathFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    reviewSessionId: firestoreData.reviewSessionId,
    filePath: firestoreData.filePath,
    fileName: firestoreData.fileName,
    fileType: firestoreData.fileType,
    cutType: firestoreData.cutType,
    uploadedBy: firestoreData.uploadedBy,
    uploadedAt: firestoreData.uploadedAt?.toDate() || null,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MediaIndex from Prisma to Firestore format
 */
export function mapMediaIndexToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    path: prismaData.path,
    userId: prismaData.userId,
    lastIndexed: prismaData.lastIndexed ? Timestamp.fromDate(new Date(prismaData.lastIndexed)) : null,
    isActive: prismaData.isActive,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MediaIndex from Firestore to Prisma format
 */
export function mapMediaIndexFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    path: firestoreData.path,
    userId: firestoreData.userId,
    lastIndexed: firestoreData.lastIndexed?.toDate() || null,
    isActive: firestoreData.isActive,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map MediaIndexItem from Prisma to Firestore format
 */
export function mapMediaIndexItemToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    mediaIndexId: prismaData.mediaIndexId,
    name: prismaData.name,
    path: prismaData.path,
    type: prismaData.type,
    size: prismaData.size,
    modified: prismaData.modified ? Timestamp.fromDate(new Date(prismaData.modified)) : null,
    created: prismaData.created ? Timestamp.fromDate(new Date(prismaData.created)) : null,
    extension: prismaData.extension,
    mimeType: prismaData.mimeType,
    category: prismaData.category,
    parentPath: prismaData.parentPath,
    depth: prismaData.depth,
    isAccessible: prismaData.isAccessible,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MediaIndexItem from Firestore to Prisma format
 */
export function mapMediaIndexItemFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    mediaIndexId: firestoreData.mediaIndexId,
    name: firestoreData.name,
    path: firestoreData.path,
    type: firestoreData.type,
    size: firestoreData.size,
    modified: firestoreData.modified?.toDate() || null,
    created: firestoreData.created?.toDate() || null,
    extension: firestoreData.extension,
    mimeType: firestoreData.mimeType,
    category: firestoreData.category,
    parentPath: firestoreData.parentPath,
    depth: firestoreData.depth,
    isAccessible: firestoreData.isAccessible,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map ProductionSessionToProject from Prisma to Firestore format
 */
export function mapProductionSessionToProjectToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSessionToProject from Firestore to Prisma format
 */
export function mapProductionSessionToProjectFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionSessionToStage from Prisma to Firestore format
 */
export function mapProductionSessionToStageToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSessionToStage from Firestore to Prisma format
 */
export function mapProductionSessionToStageFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionSessionToUser from Prisma to Firestore format
 */
export function mapProductionSessionToUserToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSessionToUser from Firestore to Prisma format
 */
export function mapProductionSessionToUserFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionSession_archivedByToUser from Prisma to Firestore format
 */
export function mapProductionSession_archivedByToUserToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSession_archivedByToUser from Firestore to Prisma format
 */
export function mapProductionSession_archivedByToUserFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionTaskAssignedToUser from Prisma to Firestore format
 */
export function mapProductionTaskAssignedToUserToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskAssignedToUser from Firestore to Prisma format
 */
export function mapProductionTaskAssignedToUserFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionTaskCreatedBy from Prisma to Firestore format
 */
export function mapProductionTaskCreatedByToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskCreatedBy from Firestore to Prisma format
 */
export function mapProductionTaskCreatedByFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionTaskLastUpdatedBy from Prisma to Firestore format
 */
export function mapProductionTaskLastUpdatedByToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskLastUpdatedBy from Firestore to Prisma format
 */
export function mapProductionTaskLastUpdatedByFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionTaskToRole from Prisma to Firestore format
 */
export function mapProductionTaskToRoleToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskToRole from Firestore to Prisma format
 */
export function mapProductionTaskToRoleFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map ProductionTaskToSessionAssignment from Prisma to Firestore format
 */
export function mapProductionTaskToSessionAssignmentToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionTaskToSessionAssignment from Firestore to Prisma format
 */
export function mapProductionTaskToSessionAssignmentFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map SessionOnHoldBy from Prisma to Firestore format
 */
export function mapSessionOnHoldByToFirestore(prismaData: any): any {
  return {
    A: prismaData.A,
    B: prismaData.B,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionOnHoldBy from Firestore to Prisma format
 */
export function mapSessionOnHoldByFromFirestore(firestoreData: any): any {
  return {
    A: firestoreData.A,
    B: firestoreData.B,
  };
}


/**
 * Map websocket_servers from Prisma to Firestore format
 */
export function mapwebsocket_serversToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    host: prismaData.host,
    port: prismaData.port,
    last_heartbeat: prismaData.last_heartbeat ? Timestamp.fromDate(new Date(prismaData.last_heartbeat)) : null,
    created_at: prismaData.created_at ? Timestamp.fromDate(new Date(prismaData.created_at)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map websocket_servers from Firestore to Prisma format
 */
export function mapwebsocket_serversFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    host: firestoreData.host,
    port: firestoreData.port,
    last_heartbeat: firestoreData.last_heartbeat?.toDate() || null,
    created_at: firestoreData.created_at?.toDate() || null,
  };
}


/**
 * Map websocket_sessions from Prisma to Firestore format
 */
export function mapwebsocket_sessionsToFirestore(prismaData: any): any {
  return {
    session_id: prismaData.session_id,
    user_id: prismaData.user_id,
    server_id: prismaData.server_id,
    data: prismaData.data || {},
    created_at: prismaData.created_at ? Timestamp.fromDate(new Date(prismaData.created_at)) : null,
    updated_at: prismaData.updated_at ? Timestamp.fromDate(new Date(prismaData.updated_at)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map websocket_sessions from Firestore to Prisma format
 */
export function mapwebsocket_sessionsFromFirestore(firestoreData: any): any {
  return {
    session_id: firestoreData.session_id,
    user_id: firestoreData.user_id,
    server_id: firestoreData.server_id,
    data: firestoreData.data,
    created_at: firestoreData.created_at?.toDate() || null,
    updated_at: firestoreData.updated_at?.toDate() || null,
  };
}


/**
 * Map AutomationAlertAcknowledgment from Prisma to Firestore format
 */
export function mapAutomationAlertAcknowledgmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    alertId: prismaData.alertId,
    sessionId: prismaData.sessionId,
    sessionName: prismaData.sessionName,
    alertType: prismaData.alertType,
    urgencyLevel: prismaData.urgencyLevel,
    message: prismaData.message,
    acknowledgedByUserId: prismaData.acknowledgedByUserId,
    acknowledgedAt: prismaData.acknowledgedAt ? Timestamp.fromDate(new Date(prismaData.acknowledgedAt)) : null,
    expiresAt: prismaData.expiresAt ? Timestamp.fromDate(new Date(prismaData.expiresAt)) : null,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AutomationAlertAcknowledgment from Firestore to Prisma format
 */
export function mapAutomationAlertAcknowledgmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    alertId: firestoreData.alertId,
    sessionId: firestoreData.sessionId,
    sessionName: firestoreData.sessionName,
    alertType: firestoreData.alertType,
    urgencyLevel: firestoreData.urgencyLevel,
    message: firestoreData.message,
    acknowledgedByUserId: firestoreData.acknowledgedByUserId,
    acknowledgedAt: firestoreData.acknowledgedAt?.toDate() || null,
    expiresAt: firestoreData.expiresAt?.toDate() || null,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map LifecycleRule from Prisma to Firestore format
 */
export function mapLifecycleRuleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    isActive: prismaData.isActive,
    triggerType: prismaData.triggerType,
    triggerEvent: prismaData.triggerEvent,
    triggerParameters: prismaData.triggerParameters || {},
    conditions: prismaData.conditions || {},
    actions: prismaData.actions || {},
    priority: prismaData.priority,
    cooldownMinutes: prismaData.cooldownMinutes,
    maxExecutions: prismaData.maxExecutions,
    sessionId: prismaData.sessionId,
    createdBy: prismaData.createdBy,
    updatedBy: prismaData.updatedBy,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map LifecycleRule from Firestore to Prisma format
 */
export function mapLifecycleRuleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    isActive: firestoreData.isActive,
    triggerType: firestoreData.triggerType,
    triggerEvent: firestoreData.triggerEvent,
    triggerParameters: firestoreData.triggerParameters,
    conditions: firestoreData.conditions,
    actions: firestoreData.actions,
    priority: firestoreData.priority,
    cooldownMinutes: firestoreData.cooldownMinutes,
    maxExecutions: firestoreData.maxExecutions,
    sessionId: firestoreData.sessionId,
    createdBy: firestoreData.createdBy,
    updatedBy: firestoreData.updatedBy,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map AutomationExecution from Prisma to Firestore format
 */
export function mapAutomationExecutionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    ruleId: prismaData.ruleId,
    sessionId: prismaData.sessionId,
    triggeredBy: prismaData.triggeredBy,
    status: prismaData.status,
    triggeredAt: prismaData.triggeredAt ? Timestamp.fromDate(new Date(prismaData.triggeredAt)) : null,
    completedAt: prismaData.completedAt ? Timestamp.fromDate(new Date(prismaData.completedAt)) : null,
    result: prismaData.result || {},
    logs: prismaData.logs || {},
    context: prismaData.context || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map AutomationExecution from Firestore to Prisma format
 */
export function mapAutomationExecutionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    ruleId: firestoreData.ruleId,
    sessionId: firestoreData.sessionId,
    triggeredBy: firestoreData.triggeredBy,
    status: firestoreData.status,
    triggeredAt: firestoreData.triggeredAt?.toDate() || null,
    completedAt: firestoreData.completedAt?.toDate() || null,
    result: firestoreData.result,
    logs: firestoreData.logs,
    context: firestoreData.context,
  };
}


/**
 * Map SessionPhaseTransition from Prisma to Firestore format
 */
export function mapSessionPhaseTransitionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    transitionDate: prismaData.transitionDate ? Timestamp.fromDate(new Date(prismaData.transitionDate)) : null,
    transitionedBy: prismaData.transitionedBy,
    reason: prismaData.reason,
    notes: prismaData.notes,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionPhaseTransition from Firestore to Prisma format
 */
export function mapSessionPhaseTransitionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    transitionDate: firestoreData.transitionDate?.toDate() || null,
    transitionedBy: firestoreData.transitionedBy,
    reason: firestoreData.reason,
    notes: firestoreData.notes,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map SessionLifecycleState from Prisma to Firestore format
 */
export function mapSessionLifecycleStateToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    isOnTrack: prismaData.isOnTrack,
    blockers: prismaData.blockers || {},
    automationHistory: prismaData.automationHistory || {},
    nextScheduledActions: prismaData.nextScheduledActions || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    actualPhaseEnd: prismaData.actualPhaseEnd ? Timestamp.fromDate(new Date(prismaData.actualPhaseEnd)) : null,
    actualStageEnd: prismaData.actualStageEnd ? Timestamp.fromDate(new Date(prismaData.actualStageEnd)) : null,
    actualStatusEnd: prismaData.actualStatusEnd ? Timestamp.fromDate(new Date(prismaData.actualStatusEnd)) : null,
    expectedPhaseEnd: prismaData.expectedPhaseEnd ? Timestamp.fromDate(new Date(prismaData.expectedPhaseEnd)) : null,
    expectedStageEnd: prismaData.expectedStageEnd ? Timestamp.fromDate(new Date(prismaData.expectedStageEnd)) : null,
    expectedStatusEnd: prismaData.expectedStatusEnd ? Timestamp.fromDate(new Date(prismaData.expectedStatusEnd)) : null,
    phaseNotes: prismaData.phaseNotes,
    stageNotes: prismaData.stageNotes,
    statusNotes: prismaData.statusNotes,
    phaseStartDate: prismaData.phaseStartDate ? Timestamp.fromDate(new Date(prismaData.phaseStartDate)) : null,
    stageStartDate: prismaData.stageStartDate ? Timestamp.fromDate(new Date(prismaData.stageStartDate)) : null,
    statusStartDate: prismaData.statusStartDate ? Timestamp.fromDate(new Date(prismaData.statusStartDate)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SessionLifecycleState from Firestore to Prisma format
 */
export function mapSessionLifecycleStateFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    isOnTrack: firestoreData.isOnTrack,
    blockers: firestoreData.blockers,
    automationHistory: firestoreData.automationHistory,
    nextScheduledActions: firestoreData.nextScheduledActions,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    actualPhaseEnd: firestoreData.actualPhaseEnd?.toDate() || null,
    actualStageEnd: firestoreData.actualStageEnd?.toDate() || null,
    actualStatusEnd: firestoreData.actualStatusEnd?.toDate() || null,
    expectedPhaseEnd: firestoreData.expectedPhaseEnd?.toDate() || null,
    expectedStageEnd: firestoreData.expectedStageEnd?.toDate() || null,
    expectedStatusEnd: firestoreData.expectedStatusEnd?.toDate() || null,
    phaseNotes: firestoreData.phaseNotes,
    stageNotes: firestoreData.stageNotes,
    statusNotes: firestoreData.statusNotes,
    phaseStartDate: firestoreData.phaseStartDate?.toDate() || null,
    stageStartDate: firestoreData.stageStartDate?.toDate() || null,
    statusStartDate: firestoreData.statusStartDate?.toDate() || null,
  };
}


/**
 * Map UserTimeCard from Prisma to Firestore format
 */
export function mapUserTimeCardToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    sessionId: prismaData.sessionId,
    taskId: prismaData.taskId,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    timeIn: prismaData.timeIn ? Timestamp.fromDate(new Date(prismaData.timeIn)) : null,
    timeOut: prismaData.timeOut ? Timestamp.fromDate(new Date(prismaData.timeOut)) : null,
    totalHours: prismaData.totalHours,
    mealBreakStart: prismaData.mealBreakStart ? Timestamp.fromDate(new Date(prismaData.mealBreakStart)) : null,
    mealBreakEnd: prismaData.mealBreakEnd ? Timestamp.fromDate(new Date(prismaData.mealBreakEnd)) : null,
    mealBreakTaken: prismaData.mealBreakTaken,
    mealPenalty: prismaData.mealPenalty,
    breaks: prismaData.breaks || {},
    regularHours: prismaData.regularHours,
    overtimeHours: prismaData.overtimeHours,
    doubleTimeHours: prismaData.doubleTimeHours,
    location: prismaData.location,
    department: prismaData.department,
    role: prismaData.role,
    notes: prismaData.notes,
    hourlyRate: prismaData.hourlyRate,
    overtimeRate: prismaData.overtimeRate,
    doubleTimeRate: prismaData.doubleTimeRate,
    totalPay: prismaData.totalPay,
    approvedBy: prismaData.approvedBy,
    approvedAt: prismaData.approvedAt ? Timestamp.fromDate(new Date(prismaData.approvedAt)) : null,
    rejectedReason: prismaData.rejectedReason,
    turnaroundHours: prismaData.turnaroundHours,
    turnaroundViolation: prismaData.turnaroundViolation,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    entryNumber: prismaData.entryNumber,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserTimeCard from Firestore to Prisma format
 */
export function mapUserTimeCardFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    sessionId: firestoreData.sessionId,
    taskId: firestoreData.taskId,
    date: firestoreData.date?.toDate() || null,
    timeIn: firestoreData.timeIn?.toDate() || null,
    timeOut: firestoreData.timeOut?.toDate() || null,
    totalHours: firestoreData.totalHours,
    mealBreakStart: firestoreData.mealBreakStart?.toDate() || null,
    mealBreakEnd: firestoreData.mealBreakEnd?.toDate() || null,
    mealBreakTaken: firestoreData.mealBreakTaken,
    mealPenalty: firestoreData.mealPenalty,
    breaks: firestoreData.breaks,
    regularHours: firestoreData.regularHours,
    overtimeHours: firestoreData.overtimeHours,
    doubleTimeHours: firestoreData.doubleTimeHours,
    location: firestoreData.location,
    department: firestoreData.department,
    role: firestoreData.role,
    notes: firestoreData.notes,
    hourlyRate: firestoreData.hourlyRate,
    overtimeRate: firestoreData.overtimeRate,
    doubleTimeRate: firestoreData.doubleTimeRate,
    totalPay: firestoreData.totalPay,
    approvedBy: firestoreData.approvedBy,
    approvedAt: firestoreData.approvedAt?.toDate() || null,
    rejectedReason: firestoreData.rejectedReason,
    turnaroundHours: firestoreData.turnaroundHours,
    turnaroundViolation: firestoreData.turnaroundViolation,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    entryNumber: firestoreData.entryNumber,
  };
}


/**
 * Map TimecardTemplate from Prisma to Firestore format
 */
export function mapTimecardTemplateToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    isActive: prismaData.isActive,
    standardHoursPerDay: prismaData.standardHoursPerDay,
    overtimeThreshold: prismaData.overtimeThreshold,
    doubleTimeThreshold: prismaData.doubleTimeThreshold,
    overtimeMultiplier: prismaData.overtimeMultiplier,
    doubleTimeMultiplier: prismaData.doubleTimeMultiplier,
    mealBreakRequired: prismaData.mealBreakRequired,
    mealBreakThreshold: prismaData.mealBreakThreshold,
    mealPenaltyHours: prismaData.mealPenaltyHours,
    restBreakRequired: prismaData.restBreakRequired,
    restBreakThreshold: prismaData.restBreakThreshold,
    minimumTurnaround: prismaData.minimumTurnaround,
    turnaroundViolationPenalty: prismaData.turnaroundViolationPenalty,
    department: prismaData.department,
    role: prismaData.role,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TimecardTemplate from Firestore to Prisma format
 */
export function mapTimecardTemplateFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    isActive: firestoreData.isActive,
    standardHoursPerDay: firestoreData.standardHoursPerDay,
    overtimeThreshold: firestoreData.overtimeThreshold,
    doubleTimeThreshold: firestoreData.doubleTimeThreshold,
    overtimeMultiplier: firestoreData.overtimeMultiplier,
    doubleTimeMultiplier: firestoreData.doubleTimeMultiplier,
    mealBreakRequired: firestoreData.mealBreakRequired,
    mealBreakThreshold: firestoreData.mealBreakThreshold,
    mealPenaltyHours: firestoreData.mealPenaltyHours,
    restBreakRequired: firestoreData.restBreakRequired,
    restBreakThreshold: firestoreData.restBreakThreshold,
    minimumTurnaround: firestoreData.minimumTurnaround,
    turnaroundViolationPenalty: firestoreData.turnaroundViolationPenalty,
    department: firestoreData.department,
    role: firestoreData.role,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map UserTimecardAssignment from Prisma to Firestore format
 */
export function mapUserTimecardAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    templateId: prismaData.templateId,
    isActive: prismaData.isActive,
    effectiveDate: prismaData.effectiveDate ? Timestamp.fromDate(new Date(prismaData.effectiveDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    assignedBy: prismaData.assignedBy,
    assignmentReason: prismaData.assignmentReason,
    notes: prismaData.notes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserTimecardAssignment from Firestore to Prisma format
 */
export function mapUserTimecardAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    templateId: firestoreData.templateId,
    isActive: firestoreData.isActive,
    effectiveDate: firestoreData.effectiveDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    assignedBy: firestoreData.assignedBy,
    assignmentReason: firestoreData.assignmentReason,
    notes: firestoreData.notes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map TimecardConfiguration from Prisma to Firestore format
 */
export function mapTimecardConfigurationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    templateId: prismaData.templateId,
    standardHoursPerDay: prismaData.standardHoursPerDay,
    overtimeThreshold: prismaData.overtimeThreshold,
    doubleTimeThreshold: prismaData.doubleTimeThreshold,
    overtimeMultiplier: prismaData.overtimeMultiplier,
    doubleTimeMultiplier: prismaData.doubleTimeMultiplier,
    mealBreakRequired: prismaData.mealBreakRequired,
    mealBreakThreshold: prismaData.mealBreakThreshold,
    mealPenaltyHours: prismaData.mealPenaltyHours,
    minimumTurnaround: prismaData.minimumTurnaround,
    isActive: prismaData.isActive,
    createdBy: prismaData.createdBy,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    hourlyRate: prismaData.hourlyRate,
    enableEscalation: prismaData.enableEscalation,
    escalationComplianceIssues: prismaData.escalationComplianceIssues,
    escalationOvertimeThreshold: prismaData.escalationOvertimeThreshold,
    escalationReason: prismaData.escalationReason,
    escalationThreshold: prismaData.escalationThreshold,
    escalationTurnaroundViolations: prismaData.escalationTurnaroundViolations,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TimecardConfiguration from Firestore to Prisma format
 */
export function mapTimecardConfigurationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    templateId: firestoreData.templateId,
    standardHoursPerDay: firestoreData.standardHoursPerDay,
    overtimeThreshold: firestoreData.overtimeThreshold,
    doubleTimeThreshold: firestoreData.doubleTimeThreshold,
    overtimeMultiplier: firestoreData.overtimeMultiplier,
    doubleTimeMultiplier: firestoreData.doubleTimeMultiplier,
    mealBreakRequired: firestoreData.mealBreakRequired,
    mealBreakThreshold: firestoreData.mealBreakThreshold,
    mealPenaltyHours: firestoreData.mealPenaltyHours,
    minimumTurnaround: firestoreData.minimumTurnaround,
    isActive: firestoreData.isActive,
    createdBy: firestoreData.createdBy,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    hourlyRate: firestoreData.hourlyRate,
    enableEscalation: firestoreData.enableEscalation,
    escalationComplianceIssues: firestoreData.escalationComplianceIssues,
    escalationOvertimeThreshold: firestoreData.escalationOvertimeThreshold,
    escalationReason: firestoreData.escalationReason,
    escalationThreshold: firestoreData.escalationThreshold,
    escalationTurnaroundViolations: firestoreData.escalationTurnaroundViolations,
  };
}


/**
 * Map UserDirectReport from Prisma to Firestore format
 */
export function mapUserDirectReportToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    employeeId: prismaData.employeeId,
    managerId: prismaData.managerId,
    department: prismaData.department,
    project: prismaData.project,
    isActive: prismaData.isActive,
    effectiveDate: prismaData.effectiveDate ? Timestamp.fromDate(new Date(prismaData.effectiveDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    assignedBy: prismaData.assignedBy,
    assignmentReason: prismaData.assignmentReason,
    notes: prismaData.notes,
    canApproveTimecards: prismaData.canApproveTimecards,
    canApproveOvertime: prismaData.canApproveOvertime,
    maxApprovalHours: prismaData.maxApprovalHours,
    requiresEscalation: prismaData.requiresEscalation,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserDirectReport from Firestore to Prisma format
 */
export function mapUserDirectReportFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    employeeId: firestoreData.employeeId,
    managerId: firestoreData.managerId,
    department: firestoreData.department,
    project: firestoreData.project,
    isActive: firestoreData.isActive,
    effectiveDate: firestoreData.effectiveDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    assignedBy: firestoreData.assignedBy,
    assignmentReason: firestoreData.assignmentReason,
    notes: firestoreData.notes,
    canApproveTimecards: firestoreData.canApproveTimecards,
    canApproveOvertime: firestoreData.canApproveOvertime,
    maxApprovalHours: firestoreData.maxApprovalHours,
    requiresEscalation: firestoreData.requiresEscalation,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map TimecardApprovalFlow from Prisma to Firestore format
 */
export function mapTimecardApprovalFlowToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    timecardId: prismaData.timecardId,
    employeeId: prismaData.employeeId,
    primaryApproverId: prismaData.primaryApproverId,
    escalationApproverId: prismaData.escalationApproverId,
    finalApproverId: prismaData.finalApproverId,
    submittedAt: prismaData.submittedAt ? Timestamp.fromDate(new Date(prismaData.submittedAt)) : null,
    firstApprovalAt: prismaData.firstApprovalAt ? Timestamp.fromDate(new Date(prismaData.firstApprovalAt)) : null,
    escalatedAt: prismaData.escalatedAt ? Timestamp.fromDate(new Date(prismaData.escalatedAt)) : null,
    finalApprovalAt: prismaData.finalApprovalAt ? Timestamp.fromDate(new Date(prismaData.finalApprovalAt)) : null,
    rejectedAt: prismaData.rejectedAt ? Timestamp.fromDate(new Date(prismaData.rejectedAt)) : null,
    approvalComments: prismaData.approvalComments,
    rejectionReason: prismaData.rejectionReason,
    escalationReason: prismaData.escalationReason,
    requiresOvertimeApproval: prismaData.requiresOvertimeApproval,
    requiresExecutiveApproval: prismaData.requiresExecutiveApproval,
    hasComplianceIssues: prismaData.hasComplianceIssues,
    complianceNotes: prismaData.complianceNotes,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TimecardApprovalFlow from Firestore to Prisma format
 */
export function mapTimecardApprovalFlowFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    timecardId: firestoreData.timecardId,
    employeeId: firestoreData.employeeId,
    primaryApproverId: firestoreData.primaryApproverId,
    escalationApproverId: firestoreData.escalationApproverId,
    finalApproverId: firestoreData.finalApproverId,
    submittedAt: firestoreData.submittedAt?.toDate() || null,
    firstApprovalAt: firestoreData.firstApprovalAt?.toDate() || null,
    escalatedAt: firestoreData.escalatedAt?.toDate() || null,
    finalApprovalAt: firestoreData.finalApprovalAt?.toDate() || null,
    rejectedAt: firestoreData.rejectedAt?.toDate() || null,
    approvalComments: firestoreData.approvalComments,
    rejectionReason: firestoreData.rejectionReason,
    escalationReason: firestoreData.escalationReason,
    requiresOvertimeApproval: firestoreData.requiresOvertimeApproval,
    requiresExecutiveApproval: firestoreData.requiresExecutiveApproval,
    hasComplianceIssues: firestoreData.hasComplianceIssues,
    complianceNotes: firestoreData.complianceNotes,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map TimecardAssistanceDismissal from Prisma to Firestore format
 */
export function mapTimecardAssistanceDismissalToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    alertId: prismaData.alertId,
    dismissedAt: prismaData.dismissedAt ? Timestamp.fromDate(new Date(prismaData.dismissedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TimecardAssistanceDismissal from Firestore to Prisma format
 */
export function mapTimecardAssistanceDismissalFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    alertId: firestoreData.alertId,
    dismissedAt: firestoreData.dismissedAt?.toDate() || null,
  };
}


/**
 * Map WorkflowAssignment from Prisma to Firestore format
 */
export function mapWorkflowAssignmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    workflowId: prismaData.workflowId,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    assignedBy: prismaData.assignedBy,
    status: prismaData.status,
    notes: prismaData.notes,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map WorkflowAssignment from Firestore to Prisma format
 */
export function mapWorkflowAssignmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    workflowId: firestoreData.workflowId,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    assignedBy: firestoreData.assignedBy,
    status: firestoreData.status,
    notes: firestoreData.notes,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map CallSheet from Prisma to Firestore format
 */
export function mapCallSheetToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectName: prismaData.projectName,
    jobId: prismaData.jobId,
    shootDay: prismaData.shootDay,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    generalCrewCall: prismaData.generalCrewCall ? Timestamp.fromDate(new Date(prismaData.generalCrewCall)) : null,
    weatherHigh: prismaData.weatherHigh,
    weatherLow: prismaData.weatherLow,
    sunrise: prismaData.sunrise ? Timestamp.fromDate(new Date(prismaData.sunrise)) : null,
    sunset: prismaData.sunset ? Timestamp.fromDate(new Date(prismaData.sunset)) : null,
    hospitalName: prismaData.hospitalName,
    hospitalAddress: prismaData.hospitalAddress,
    hospitalPhone: prismaData.hospitalPhone,
    notes: prismaData.notes,
    isArchived: prismaData.isArchived,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdBy: prismaData.createdBy,
    updatedBy: prismaData.updatedBy,
    nextDaySessionId: prismaData.nextDaySessionId,
    sessionId: prismaData.sessionId,
    isTemplate: prismaData.isTemplate,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheet from Firestore to Prisma format
 */
export function mapCallSheetFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectName: firestoreData.projectName,
    jobId: firestoreData.jobId,
    shootDay: firestoreData.shootDay,
    date: firestoreData.date?.toDate() || null,
    generalCrewCall: firestoreData.generalCrewCall?.toDate() || null,
    weatherHigh: firestoreData.weatherHigh,
    weatherLow: firestoreData.weatherLow,
    sunrise: firestoreData.sunrise?.toDate() || null,
    sunset: firestoreData.sunset?.toDate() || null,
    hospitalName: firestoreData.hospitalName,
    hospitalAddress: firestoreData.hospitalAddress,
    hospitalPhone: firestoreData.hospitalPhone,
    notes: firestoreData.notes,
    isArchived: firestoreData.isArchived,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdBy: firestoreData.createdBy,
    updatedBy: firestoreData.updatedBy,
    nextDaySessionId: firestoreData.nextDaySessionId,
    sessionId: firestoreData.sessionId,
    isTemplate: firestoreData.isTemplate,
  };
}


/**
 * Map DailyCallSheetRecord from Prisma to Firestore format
 */
export function mapDailyCallSheetRecordToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    templateCallSheetId: prismaData.templateCallSheetId,
    projectName: prismaData.projectName,
    jobId: prismaData.jobId,
    shootDay: prismaData.shootDay,
    recordDate: prismaData.recordDate ? Timestamp.fromDate(new Date(prismaData.recordDate)) : null,
    generalCrewCall: prismaData.generalCrewCall ? Timestamp.fromDate(new Date(prismaData.generalCrewCall)) : null,
    weatherHigh: prismaData.weatherHigh,
    weatherLow: prismaData.weatherLow,
    sunrise: prismaData.sunrise ? Timestamp.fromDate(new Date(prismaData.sunrise)) : null,
    sunset: prismaData.sunset ? Timestamp.fromDate(new Date(prismaData.sunset)) : null,
    hospitalName: prismaData.hospitalName,
    hospitalAddress: prismaData.hospitalAddress,
    hospitalPhone: prismaData.hospitalPhone,
    notes: prismaData.notes,
    isArchived: prismaData.isArchived,
    publishedAt: prismaData.publishedAt ? Timestamp.fromDate(new Date(prismaData.publishedAt)) : null,
    publishedBy: prismaData.publishedBy,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdBy: prismaData.createdBy,
    updatedBy: prismaData.updatedBy,
    sessionId: prismaData.sessionId,
    nextDaySessionId: prismaData.nextDaySessionId,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetRecord from Firestore to Prisma format
 */
export function mapDailyCallSheetRecordFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    templateCallSheetId: firestoreData.templateCallSheetId,
    projectName: firestoreData.projectName,
    jobId: firestoreData.jobId,
    shootDay: firestoreData.shootDay,
    recordDate: firestoreData.recordDate?.toDate() || null,
    generalCrewCall: firestoreData.generalCrewCall?.toDate() || null,
    weatherHigh: firestoreData.weatherHigh,
    weatherLow: firestoreData.weatherLow,
    sunrise: firestoreData.sunrise?.toDate() || null,
    sunset: firestoreData.sunset?.toDate() || null,
    hospitalName: firestoreData.hospitalName,
    hospitalAddress: firestoreData.hospitalAddress,
    hospitalPhone: firestoreData.hospitalPhone,
    notes: firestoreData.notes,
    isArchived: firestoreData.isArchived,
    publishedAt: firestoreData.publishedAt?.toDate() || null,
    publishedBy: firestoreData.publishedBy,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdBy: firestoreData.createdBy,
    updatedBy: firestoreData.updatedBy,
    sessionId: firestoreData.sessionId,
    nextDaySessionId: firestoreData.nextDaySessionId,
  };
}


/**
 * Map DailyCallSheetLocation from Prisma to Firestore format
 */
export function mapDailyCallSheetLocationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    name: prismaData.name,
    address: prismaData.address,
    description: prismaData.description,
    isPrimary: prismaData.isPrimary,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetLocation from Firestore to Prisma format
 */
export function mapDailyCallSheetLocationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    name: firestoreData.name,
    address: firestoreData.address,
    description: firestoreData.description,
    isPrimary: firestoreData.isPrimary,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map DailyCallSheetPersonnel from Prisma to Firestore format
 */
export function mapDailyCallSheetPersonnelToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    userId: prismaData.userId,
    title: prismaData.title,
    name: prismaData.name,
    phone: prismaData.phone,
    email: prismaData.email,
    departmentId: prismaData.departmentId,
    subDepartmentId: prismaData.subDepartmentId,
    roleId: prismaData.roleId,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    callLocation: prismaData.callLocation,
    wrapLocation: prismaData.wrapLocation,
    mealTime: prismaData.mealTime ? Timestamp.fromDate(new Date(prismaData.mealTime)) : null,
    mealLocation: prismaData.mealLocation,
    notes: prismaData.notes,
    specialRequirements: prismaData.specialRequirements,
    transportationNeeds: prismaData.transportationNeeds,
    order: prismaData.order,
    isConfirmed: prismaData.isConfirmed,
    expectedHours: prismaData.expectedHours,
    hourlyRate: prismaData.hourlyRate,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetPersonnel from Firestore to Prisma format
 */
export function mapDailyCallSheetPersonnelFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    userId: firestoreData.userId,
    title: firestoreData.title,
    name: firestoreData.name,
    phone: firestoreData.phone,
    email: firestoreData.email,
    departmentId: firestoreData.departmentId,
    subDepartmentId: firestoreData.subDepartmentId,
    roleId: firestoreData.roleId,
    callTime: firestoreData.callTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    callLocation: firestoreData.callLocation,
    wrapLocation: firestoreData.wrapLocation,
    mealTime: firestoreData.mealTime?.toDate() || null,
    mealLocation: firestoreData.mealLocation,
    notes: firestoreData.notes,
    specialRequirements: firestoreData.specialRequirements,
    transportationNeeds: firestoreData.transportationNeeds,
    order: firestoreData.order,
    isConfirmed: firestoreData.isConfirmed,
    expectedHours: firestoreData.expectedHours,
    hourlyRate: firestoreData.hourlyRate,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map DailyCallSheetDepartmentCallTime from Prisma to Firestore format
 */
export function mapDailyCallSheetDepartmentCallTimeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    departmentId: prismaData.departmentId,
    subDepartmentId: prismaData.subDepartmentId,
    roleId: prismaData.roleId,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    mealTime: prismaData.mealTime ? Timestamp.fromDate(new Date(prismaData.mealTime)) : null,
    callLocation: prismaData.callLocation,
    wrapLocation: prismaData.wrapLocation,
    mealLocation: prismaData.mealLocation,
    notes: prismaData.notes,
    isDefault: prismaData.isDefault,
    affectsAllRoles: prismaData.affectsAllRoles,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetDepartmentCallTime from Firestore to Prisma format
 */
export function mapDailyCallSheetDepartmentCallTimeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    departmentId: firestoreData.departmentId,
    subDepartmentId: firestoreData.subDepartmentId,
    roleId: firestoreData.roleId,
    callTime: firestoreData.callTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    mealTime: firestoreData.mealTime?.toDate() || null,
    callLocation: firestoreData.callLocation,
    wrapLocation: firestoreData.wrapLocation,
    mealLocation: firestoreData.mealLocation,
    notes: firestoreData.notes,
    isDefault: firestoreData.isDefault,
    affectsAllRoles: firestoreData.affectsAllRoles,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map DailyCallSheetSchedule from Prisma to Firestore format
 */
export function mapDailyCallSheetScheduleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    time: prismaData.time,
    description: prismaData.description,
    location: prismaData.location,
    isHighlight: prismaData.isHighlight,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetSchedule from Firestore to Prisma format
 */
export function mapDailyCallSheetScheduleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    time: firestoreData.time,
    description: firestoreData.description,
    location: firestoreData.location,
    isHighlight: firestoreData.isHighlight,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map DailyCallSheetVendor from Prisma to Firestore format
 */
export function mapDailyCallSheetVendorToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    name: prismaData.name,
    phone: prismaData.phone,
    email: prismaData.email,
    address: prismaData.address,
    description: prismaData.description,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetVendor from Firestore to Prisma format
 */
export function mapDailyCallSheetVendorFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    name: firestoreData.name,
    phone: firestoreData.phone,
    email: firestoreData.email,
    address: firestoreData.address,
    description: firestoreData.description,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map DailyCallSheetWalkieChannel from Prisma to Firestore format
 */
export function mapDailyCallSheetWalkieChannelToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    dailyCallSheetId: prismaData.dailyCallSheetId,
    channel: prismaData.channel,
    assignment: prismaData.assignment,
    description: prismaData.description,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DailyCallSheetWalkieChannel from Firestore to Prisma format
 */
export function mapDailyCallSheetWalkieChannelFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    dailyCallSheetId: firestoreData.dailyCallSheetId,
    channel: firestoreData.channel,
    assignment: firestoreData.assignment,
    description: firestoreData.description,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionDepartment from Prisma to Firestore format
 */
export function mapProductionDepartmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    displayName: prismaData.displayName,
    description: prismaData.description,
    color: prismaData.color,
    icon: prismaData.icon,
    isActive: prismaData.isActive,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionDepartment from Firestore to Prisma format
 */
export function mapProductionDepartmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    displayName: firestoreData.displayName,
    description: firestoreData.description,
    color: firestoreData.color,
    icon: firestoreData.icon,
    isActive: firestoreData.isActive,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionSubDepartment from Prisma to Firestore format
 */
export function mapProductionSubDepartmentToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    departmentId: prismaData.departmentId,
    name: prismaData.name,
    displayName: prismaData.displayName,
    description: prismaData.description,
    color: prismaData.color,
    icon: prismaData.icon,
    isActive: prismaData.isActive,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionSubDepartment from Firestore to Prisma format
 */
export function mapProductionSubDepartmentFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    departmentId: firestoreData.departmentId,
    name: firestoreData.name,
    displayName: firestoreData.displayName,
    description: firestoreData.description,
    color: firestoreData.color,
    icon: firestoreData.icon,
    isActive: firestoreData.isActive,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProductionRole from Prisma to Firestore format
 */
export function mapProductionRoleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    departmentId: prismaData.departmentId,
    subDepartmentId: prismaData.subDepartmentId,
    name: prismaData.name,
    displayName: prismaData.displayName,
    description: prismaData.description,
    hourlyRateRange: prismaData.hourlyRateRange,
    isActive: prismaData.isActive,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProductionRole from Firestore to Prisma format
 */
export function mapProductionRoleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    departmentId: firestoreData.departmentId,
    subDepartmentId: firestoreData.subDepartmentId,
    name: firestoreData.name,
    displayName: firestoreData.displayName,
    description: firestoreData.description,
    hourlyRateRange: firestoreData.hourlyRateRange,
    isActive: firestoreData.isActive,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CallSheetLocation from Prisma to Firestore format
 */
export function mapCallSheetLocationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    name: prismaData.name,
    address: prismaData.address,
    description: prismaData.description,
    isPrimary: prismaData.isPrimary,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetLocation from Firestore to Prisma format
 */
export function mapCallSheetLocationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    name: firestoreData.name,
    address: firestoreData.address,
    description: firestoreData.description,
    isPrimary: firestoreData.isPrimary,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CallSheetPersonnel from Prisma to Firestore format
 */
export function mapCallSheetPersonnelToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    title: prismaData.title,
    name: prismaData.name,
    phone: prismaData.phone,
    email: prismaData.email,
    wrapLocation: prismaData.wrapLocation,
    notes: prismaData.notes,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    callLocation: prismaData.callLocation,
    departmentId: prismaData.departmentId,
    expectedHours: prismaData.expectedHours,
    hourlyRate: prismaData.hourlyRate,
    isConfirmed: prismaData.isConfirmed,
    mealLocation: prismaData.mealLocation,
    mealTime: prismaData.mealTime ? Timestamp.fromDate(new Date(prismaData.mealTime)) : null,
    roleId: prismaData.roleId,
    specialRequirements: prismaData.specialRequirements,
    subDepartmentId: prismaData.subDepartmentId,
    transportationNeeds: prismaData.transportationNeeds,
    userId: prismaData.userId,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetPersonnel from Firestore to Prisma format
 */
export function mapCallSheetPersonnelFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    title: firestoreData.title,
    name: firestoreData.name,
    phone: firestoreData.phone,
    email: firestoreData.email,
    wrapLocation: firestoreData.wrapLocation,
    notes: firestoreData.notes,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    callLocation: firestoreData.callLocation,
    departmentId: firestoreData.departmentId,
    expectedHours: firestoreData.expectedHours,
    hourlyRate: firestoreData.hourlyRate,
    isConfirmed: firestoreData.isConfirmed,
    mealLocation: firestoreData.mealLocation,
    mealTime: firestoreData.mealTime?.toDate() || null,
    roleId: firestoreData.roleId,
    specialRequirements: firestoreData.specialRequirements,
    subDepartmentId: firestoreData.subDepartmentId,
    transportationNeeds: firestoreData.transportationNeeds,
    userId: firestoreData.userId,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    callTime: firestoreData.callTime?.toDate() || null,
  };
}


/**
 * Map CallSheetDepartmentCallTime from Prisma to Firestore format
 */
export function mapCallSheetDepartmentCallTimeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    departmentId: prismaData.departmentId,
    subDepartmentId: prismaData.subDepartmentId,
    roleId: prismaData.roleId,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    mealTime: prismaData.mealTime ? Timestamp.fromDate(new Date(prismaData.mealTime)) : null,
    callLocation: prismaData.callLocation,
    wrapLocation: prismaData.wrapLocation,
    mealLocation: prismaData.mealLocation,
    notes: prismaData.notes,
    isDefault: prismaData.isDefault,
    affectsAllRoles: prismaData.affectsAllRoles,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetDepartmentCallTime from Firestore to Prisma format
 */
export function mapCallSheetDepartmentCallTimeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    departmentId: firestoreData.departmentId,
    subDepartmentId: firestoreData.subDepartmentId,
    roleId: firestoreData.roleId,
    callTime: firestoreData.callTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    mealTime: firestoreData.mealTime?.toDate() || null,
    callLocation: firestoreData.callLocation,
    wrapLocation: firestoreData.wrapLocation,
    mealLocation: firestoreData.mealLocation,
    notes: firestoreData.notes,
    isDefault: firestoreData.isDefault,
    affectsAllRoles: firestoreData.affectsAllRoles,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CallSheetSchedule from Prisma to Firestore format
 */
export function mapCallSheetScheduleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    time: prismaData.time,
    description: prismaData.description,
    location: prismaData.location,
    isHighlight: prismaData.isHighlight,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetSchedule from Firestore to Prisma format
 */
export function mapCallSheetScheduleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    time: firestoreData.time,
    description: firestoreData.description,
    location: firestoreData.location,
    isHighlight: firestoreData.isHighlight,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CallSheetVendor from Prisma to Firestore format
 */
export function mapCallSheetVendorToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    name: prismaData.name,
    phone: prismaData.phone,
    email: prismaData.email,
    address: prismaData.address,
    description: prismaData.description,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetVendor from Firestore to Prisma format
 */
export function mapCallSheetVendorFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    name: firestoreData.name,
    phone: firestoreData.phone,
    email: firestoreData.email,
    address: firestoreData.address,
    description: firestoreData.description,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map CallSheetWalkieChannel from Prisma to Firestore format
 */
export function mapCallSheetWalkieChannelToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    callSheetId: prismaData.callSheetId,
    channel: prismaData.channel,
    assignment: prismaData.assignment,
    description: prismaData.description,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CallSheetWalkieChannel from Firestore to Prisma format
 */
export function mapCallSheetWalkieChannelFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    callSheetId: firestoreData.callSheetId,
    channel: firestoreData.channel,
    assignment: firestoreData.assignment,
    description: firestoreData.description,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map PBMProject from Prisma to Firestore format
 */
export function mapPBMProjectToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    name: prismaData.name,
    description: prismaData.description,
    startDate: prismaData.startDate ? Timestamp.fromDate(new Date(prismaData.startDate)) : null,
    endDate: prismaData.endDate ? Timestamp.fromDate(new Date(prismaData.endDate)) : null,
    totalBudget: prismaData.totalBudget,
    projectedBudget: prismaData.projectedBudget,
    actualCosts: prismaData.actualCosts,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    createdBy: prismaData.createdBy,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PBMProject from Firestore to Prisma format
 */
export function mapPBMProjectFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    name: firestoreData.name,
    description: firestoreData.description,
    startDate: firestoreData.startDate?.toDate() || null,
    endDate: firestoreData.endDate?.toDate() || null,
    totalBudget: firestoreData.totalBudget,
    projectedBudget: firestoreData.projectedBudget,
    actualCosts: firestoreData.actualCosts,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    createdBy: firestoreData.createdBy,
  };
}


/**
 * Map PBMSchedule from Prisma to Firestore format
 */
export function mapPBMScheduleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    pbmProjectId: prismaData.pbmProjectId,
    sessionId: prismaData.sessionId,
    sessionNumber: prismaData.sessionNumber,
    sceneNumber: prismaData.sceneNumber,
    sceneDescription: prismaData.sceneDescription,
    pageReference: prismaData.pageReference,
    setLocation: prismaData.setLocation,
    cast: prismaData.cast || {},
    stunts: prismaData.stunts || {},
    vehicles: prismaData.vehicles || {},
    pageCount: prismaData.pageCount,
    estimatedTime: prismaData.estimatedTime,
    notes: prismaData.notes,
    day: prismaData.day,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    callTime: prismaData.callTime ? Timestamp.fromDate(new Date(prismaData.callTime)) : null,
    shootTime: prismaData.shootTime ? Timestamp.fromDate(new Date(prismaData.shootTime)) : null,
    wrapTime: prismaData.wrapTime ? Timestamp.fromDate(new Date(prismaData.wrapTime)) : null,
    lunchTime: prismaData.lunchTime ? Timestamp.fromDate(new Date(prismaData.lunchTime)) : null,
    secondMealTime: prismaData.secondMealTime ? Timestamp.fromDate(new Date(prismaData.secondMealTime)) : null,
    companyWrapTime: prismaData.companyWrapTime ? Timestamp.fromDate(new Date(prismaData.companyWrapTime)) : null,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PBMSchedule from Firestore to Prisma format
 */
export function mapPBMScheduleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    pbmProjectId: firestoreData.pbmProjectId,
    sessionId: firestoreData.sessionId,
    sessionNumber: firestoreData.sessionNumber,
    sceneNumber: firestoreData.sceneNumber,
    sceneDescription: firestoreData.sceneDescription,
    pageReference: firestoreData.pageReference,
    setLocation: firestoreData.setLocation,
    cast: firestoreData.cast,
    stunts: firestoreData.stunts,
    vehicles: firestoreData.vehicles,
    pageCount: firestoreData.pageCount,
    estimatedTime: firestoreData.estimatedTime,
    notes: firestoreData.notes,
    day: firestoreData.day,
    date: firestoreData.date?.toDate() || null,
    callTime: firestoreData.callTime?.toDate() || null,
    shootTime: firestoreData.shootTime?.toDate() || null,
    wrapTime: firestoreData.wrapTime?.toDate() || null,
    lunchTime: firestoreData.lunchTime?.toDate() || null,
    secondMealTime: firestoreData.secondMealTime?.toDate() || null,
    companyWrapTime: firestoreData.companyWrapTime?.toDate() || null,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map PBMPayscale from Prisma to Firestore format
 */
export function mapPBMPayscaleToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    pbmProjectId: prismaData.pbmProjectId,
    accountNumber: prismaData.accountNumber,
    department: prismaData.department,
    description: prismaData.description,
    union: prismaData.union,
    guaranteedDays: prismaData.guaranteedDays,
    rate: prismaData.rate,
    overtimeRate1_5x: prismaData.overtimeRate1_5x,
    overtimeRate2x: prismaData.overtimeRate2x,
    sixthDayRate: prismaData.sixthDayRate,
    seventhDayRate: prismaData.seventhDayRate,
    totalBudget: prismaData.totalBudget,
    lockedBudget: prismaData.lockedBudget,
    actualOvertime: prismaData.actualOvertime,
    mealPenalties: prismaData.mealPenalties,
    notes: prismaData.notes,
    isActive: prismaData.isActive,
    order: prismaData.order,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PBMPayscale from Firestore to Prisma format
 */
export function mapPBMPayscaleFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    pbmProjectId: firestoreData.pbmProjectId,
    accountNumber: firestoreData.accountNumber,
    department: firestoreData.department,
    description: firestoreData.description,
    union: firestoreData.union,
    guaranteedDays: firestoreData.guaranteedDays,
    rate: firestoreData.rate,
    overtimeRate1_5x: firestoreData.overtimeRate1_5x,
    overtimeRate2x: firestoreData.overtimeRate2x,
    sixthDayRate: firestoreData.sixthDayRate,
    seventhDayRate: firestoreData.seventhDayRate,
    totalBudget: firestoreData.totalBudget,
    lockedBudget: firestoreData.lockedBudget,
    actualOvertime: firestoreData.actualOvertime,
    mealPenalties: firestoreData.mealPenalties,
    notes: firestoreData.notes,
    isActive: firestoreData.isActive,
    order: firestoreData.order,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map PBMDailyStatus from Prisma to Firestore format
 */
export function mapPBMDailyStatusToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    pbmProjectId: prismaData.pbmProjectId,
    payscaleId: prismaData.payscaleId,
    date: prismaData.date ? Timestamp.fromDate(new Date(prismaData.date)) : null,
    notes: prismaData.notes,
    actualHours: prismaData.actualHours,
    overtimeHours: prismaData.overtimeHours,
    isConfirmed: prismaData.isConfirmed,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map PBMDailyStatus from Firestore to Prisma format
 */
export function mapPBMDailyStatusFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    pbmProjectId: firestoreData.pbmProjectId,
    payscaleId: firestoreData.payscaleId,
    date: firestoreData.date?.toDate() || null,
    notes: firestoreData.notes,
    actualHours: firestoreData.actualHours,
    overtimeHours: firestoreData.overtimeHours,
    isConfirmed: firestoreData.isConfirmed,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map BrainChatSession from Prisma to Firestore format
 */
export function mapBrainChatSessionToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    title: prismaData.title,
    context: prismaData.context || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    isActive: prismaData.isActive,
    lastMessage: prismaData.lastMessage ? Timestamp.fromDate(new Date(prismaData.lastMessage)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map BrainChatSession from Firestore to Prisma format
 */
export function mapBrainChatSessionFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    title: firestoreData.title,
    context: firestoreData.context,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    isActive: firestoreData.isActive,
    lastMessage: firestoreData.lastMessage?.toDate() || null,
  };
}


/**
 * Map BrainChatMessage from Prisma to Firestore format
 */
export function mapBrainChatMessageToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    sessionId: prismaData.sessionId,
    content: prismaData.content,
    context: prismaData.context || {},
    metadata: prismaData.metadata || {},
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map BrainChatMessage from Firestore to Prisma format
 */
export function mapBrainChatMessageFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    sessionId: firestoreData.sessionId,
    content: firestoreData.content,
    context: firestoreData.context,
    metadata: firestoreData.metadata,
    createdAt: firestoreData.createdAt?.toDate() || null,
  };
}


/**
 * Map SavedProjectPath from Prisma to Firestore format
 */
export function mapSavedProjectPathToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    name: prismaData.name,
    filePath: prismaData.filePath,
    projectId: prismaData.projectId,
    projectType: prismaData.projectType,
    lastAccessed: prismaData.lastAccessed ? Timestamp.fromDate(new Date(prismaData.lastAccessed)) : null,
    accessCount: prismaData.accessCount,
    isFavorite: prismaData.isFavorite,
    isValid: prismaData.isValid,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map SavedProjectPath from Firestore to Prisma format
 */
export function mapSavedProjectPathFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    name: firestoreData.name,
    filePath: firestoreData.filePath,
    projectId: firestoreData.projectId,
    projectType: firestoreData.projectType,
    lastAccessed: firestoreData.lastAccessed?.toDate() || null,
    accessCount: firestoreData.accessCount,
    isFavorite: firestoreData.isFavorite,
    isValid: firestoreData.isValid,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map UserMemoryProfile from Prisma to Firestore format
 */
export function mapUserMemoryProfileToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    memoryEnabled: prismaData.memoryEnabled,
    memoryRetentionDays: prismaData.memoryRetentionDays,
    maxMemorySlots: prismaData.maxMemorySlots,
    usedMemorySlots: prismaData.usedMemorySlots,
    preferredTone: prismaData.preferredTone,
    communicationStyle: prismaData.communicationStyle,
    expertiseAreas: prismaData.expertiseAreas,
    learningPreferences: prismaData.learningPreferences || {},
    emotionalBaseline: prismaData.emotionalBaseline,
    stressIndicators: prismaData.stressIndicators,
    motivationTriggers: prismaData.motivationTriggers,
    roleContext: prismaData.roleContext,
    projectContext: prismaData.projectContext,
    teamContext: prismaData.teamContext,
    memoryAccuracy: prismaData.memoryAccuracy,
    memoryRelevance: prismaData.memoryRelevance,
    lastMemoryOptimization: prismaData.lastMemoryOptimization ? Timestamp.fromDate(new Date(prismaData.lastMemoryOptimization)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map UserMemoryProfile from Firestore to Prisma format
 */
export function mapUserMemoryProfileFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    memoryEnabled: firestoreData.memoryEnabled,
    memoryRetentionDays: firestoreData.memoryRetentionDays,
    maxMemorySlots: firestoreData.maxMemorySlots,
    usedMemorySlots: firestoreData.usedMemorySlots,
    preferredTone: firestoreData.preferredTone,
    communicationStyle: firestoreData.communicationStyle,
    expertiseAreas: firestoreData.expertiseAreas,
    learningPreferences: firestoreData.learningPreferences,
    emotionalBaseline: firestoreData.emotionalBaseline,
    stressIndicators: firestoreData.stressIndicators,
    motivationTriggers: firestoreData.motivationTriggers,
    roleContext: firestoreData.roleContext,
    projectContext: firestoreData.projectContext,
    teamContext: firestoreData.teamContext,
    memoryAccuracy: firestoreData.memoryAccuracy,
    memoryRelevance: firestoreData.memoryRelevance,
    lastMemoryOptimization: firestoreData.lastMemoryOptimization?.toDate() || null,
  };
}


/**
 * Map ConversationPattern from Prisma to Firestore format
 */
export function mapConversationPatternToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    patternType: prismaData.patternType,
    patternData: prismaData.patternData || {},
    frequency: prismaData.frequency,
    confidence: prismaData.confidence,
    lastObserved: prismaData.lastObserved ? Timestamp.fromDate(new Date(prismaData.lastObserved)) : null,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    category: prismaData.category,
    subcategory: prismaData.subcategory,
    keywords: prismaData.keywords,
    contexts: prismaData.contexts,
    effectiveness: prismaData.effectiveness,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ConversationPattern from Firestore to Prisma format
 */
export function mapConversationPatternFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    patternType: firestoreData.patternType,
    patternData: firestoreData.patternData,
    frequency: firestoreData.frequency,
    confidence: firestoreData.confidence,
    lastObserved: firestoreData.lastObserved?.toDate() || null,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    category: firestoreData.category,
    subcategory: firestoreData.subcategory,
    keywords: firestoreData.keywords,
    contexts: firestoreData.contexts,
    effectiveness: firestoreData.effectiveness,
  };
}


/**
 * Map DomainKnowledge from Prisma to Firestore format
 */
export function mapDomainKnowledgeToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    domain: prismaData.domain,
    knowledgeType: prismaData.knowledgeType,
    content: prismaData.content || {},
    importance: prismaData.importance,
    lastAccessed: prismaData.lastAccessed ? Timestamp.fromDate(new Date(prismaData.lastAccessed)) : null,
    accessCount: prismaData.accessCount,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    source: prismaData.source,
    confidence: prismaData.confidence,
    relationships: prismaData.relationships,
    tags: prismaData.tags,
    isActive: prismaData.isActive,
    expiresAt: prismaData.expiresAt ? Timestamp.fromDate(new Date(prismaData.expiresAt)) : null,
    version: prismaData.version,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map DomainKnowledge from Firestore to Prisma format
 */
export function mapDomainKnowledgeFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    domain: firestoreData.domain,
    knowledgeType: firestoreData.knowledgeType,
    content: firestoreData.content,
    importance: firestoreData.importance,
    lastAccessed: firestoreData.lastAccessed?.toDate() || null,
    accessCount: firestoreData.accessCount,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    source: firestoreData.source,
    confidence: firestoreData.confidence,
    relationships: firestoreData.relationships,
    tags: firestoreData.tags,
    isActive: firestoreData.isActive,
    expiresAt: firestoreData.expiresAt?.toDate() || null,
    version: firestoreData.version,
  };
}


/**
 * Map RelationshipAnchor from Prisma to Firestore format
 */
export function mapRelationshipAnchorToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    anchorType: prismaData.anchorType,
    anchorName: prismaData.anchorName,
    anchorData: prismaData.anchorData || {},
    strength: prismaData.strength,
    lastInteraction: prismaData.lastInteraction ? Timestamp.fromDate(new Date(prismaData.lastInteraction)) : null,
    interactionCount: prismaData.interactionCount,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    category: prismaData.category,
    subcategory: prismaData.subcategory,
    context: prismaData.context,
    emotionalValence: prismaData.emotionalValence,
    trustLevel: prismaData.trustLevel,
    influenceLevel: prismaData.influenceLevel,
    interactionPatterns: prismaData.interactionPatterns || {},
    preferences: prismaData.preferences || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map RelationshipAnchor from Firestore to Prisma format
 */
export function mapRelationshipAnchorFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    anchorType: firestoreData.anchorType,
    anchorName: firestoreData.anchorName,
    anchorData: firestoreData.anchorData,
    strength: firestoreData.strength,
    lastInteraction: firestoreData.lastInteraction?.toDate() || null,
    interactionCount: firestoreData.interactionCount,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    category: firestoreData.category,
    subcategory: firestoreData.subcategory,
    context: firestoreData.context,
    emotionalValence: firestoreData.emotionalValence,
    trustLevel: firestoreData.trustLevel,
    influenceLevel: firestoreData.influenceLevel,
    interactionPatterns: firestoreData.interactionPatterns,
    preferences: firestoreData.preferences,
  };
}


/**
 * Map MemorySlot from Prisma to Firestore format
 */
export function mapMemorySlotToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    slotType: prismaData.slotType,
    content: prismaData.content || {},
    importance: prismaData.importance,
    emotionalWeight: prismaData.emotionalWeight,
    lastAccessed: prismaData.lastAccessed ? Timestamp.fromDate(new Date(prismaData.lastAccessed)) : null,
    accessCount: prismaData.accessCount,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    source: prismaData.source,
    context: prismaData.context,
    tags: prismaData.tags,
    relationships: prismaData.relationships,
    isActive: prismaData.isActive,
    expiresAt: prismaData.expiresAt ? Timestamp.fromDate(new Date(prismaData.expiresAt)) : null,
    isProtected: prismaData.isProtected,
    accuracy: prismaData.accuracy,
    relevance: prismaData.relevance,
    usefulness: prismaData.usefulness,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MemorySlot from Firestore to Prisma format
 */
export function mapMemorySlotFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    slotType: firestoreData.slotType,
    content: firestoreData.content,
    importance: firestoreData.importance,
    emotionalWeight: firestoreData.emotionalWeight,
    lastAccessed: firestoreData.lastAccessed?.toDate() || null,
    accessCount: firestoreData.accessCount,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
    source: firestoreData.source,
    context: firestoreData.context,
    tags: firestoreData.tags,
    relationships: firestoreData.relationships,
    isActive: firestoreData.isActive,
    expiresAt: firestoreData.expiresAt?.toDate() || null,
    isProtected: firestoreData.isProtected,
    accuracy: firestoreData.accuracy,
    relevance: firestoreData.relevance,
    usefulness: firestoreData.usefulness,
  };
}


/**
 * Map MemorySystemMetrics from Prisma to Firestore format
 */
export function mapMemorySystemMetricsToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    userId: prismaData.userId,
    metricDate: prismaData.metricDate ? Timestamp.fromDate(new Date(prismaData.metricDate)) : null,
    metricType: prismaData.metricType,
    metricValue: prismaData.metricValue,
    context: prismaData.context,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map MemorySystemMetrics from Firestore to Prisma format
 */
export function mapMemorySystemMetricsFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    userId: firestoreData.userId,
    metricDate: firestoreData.metricDate?.toDate() || null,
    metricType: firestoreData.metricType,
    metricValue: firestoreData.metricValue,
    context: firestoreData.context,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map CollaborationInvitation from Prisma to Firestore format
 */
export function mapCollaborationInvitationToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    inviterUserId: prismaData.inviterUserId,
    inviteeEmail: prismaData.inviteeEmail,
    inviteeUserId: prismaData.inviteeUserId,
    code: prismaData.code,
    role: prismaData.role,
    permissions: prismaData.permissions || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map CollaborationInvitation from Firestore to Prisma format
 */
export function mapCollaborationInvitationFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    inviterUserId: firestoreData.inviterUserId,
    inviteeEmail: firestoreData.inviteeEmail,
    inviteeUserId: firestoreData.inviteeUserId,
    code: firestoreData.code,
    role: firestoreData.role,
    permissions: firestoreData.permissions,
  };
}


/**
 * Map ProjectCollaborationSettings from Prisma to Firestore format
 */
export function mapProjectCollaborationSettingsToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    allowPublicJoin: prismaData.allowPublicJoin,
    allowCodeSharing: prismaData.allowCodeSharing,
    maxInvitations: prismaData.maxInvitations,
    invitationExpiryHours: prismaData.invitationExpiryHours,
    requireApproval: prismaData.requireApproval,
    allowGuestAccess: prismaData.allowGuestAccess,
    defaultPermissions: prismaData.defaultPermissions || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProjectCollaborationSettings from Firestore to Prisma format
 */
export function mapProjectCollaborationSettingsFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    allowPublicJoin: firestoreData.allowPublicJoin,
    allowCodeSharing: firestoreData.allowCodeSharing,
    maxInvitations: firestoreData.maxInvitations,
    invitationExpiryHours: firestoreData.invitationExpiryHours,
    requireApproval: firestoreData.requireApproval,
    allowGuestAccess: firestoreData.allowGuestAccess,
    defaultPermissions: firestoreData.defaultPermissions,
  };
}


/**
 * Map ProjectActivity from Prisma to Firestore format
 */
export function mapProjectActivityToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    userId: prismaData.userId,
    description: prismaData.description,
    metadata: prismaData.metadata || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProjectActivity from Firestore to Prisma format
 */
export function mapProjectActivityFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    userId: firestoreData.userId,
    description: firestoreData.description,
    metadata: firestoreData.metadata,
  };
}


/**
 * Map RealTimePresence from Prisma to Firestore format
 */
export function mapRealTimePresenceToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    userId: prismaData.userId,
    currentView: prismaData.currentView,
    cursorPosition: prismaData.cursorPosition || {},
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map RealTimePresence from Firestore to Prisma format
 */
export function mapRealTimePresenceFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    userId: firestoreData.userId,
    currentView: firestoreData.currentView,
    cursorPosition: firestoreData.cursorPosition,
  };
}


/**
 * Map TeamMember from Prisma to Firestore format
 */
export function mapTeamMemberToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    firstName: prismaData.firstName,
    lastName: prismaData.lastName,
    email: prismaData.email,
    licenseType: prismaData.licenseType,
    organizationId: prismaData.organizationId,
    department: prismaData.department,
    lastActive: prismaData.lastActive ? Timestamp.fromDate(new Date(prismaData.lastActive)) : null,
    createdAt: prismaData.createdAt ? Timestamp.fromDate(new Date(prismaData.createdAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map TeamMember from Firestore to Prisma format
 */
export function mapTeamMemberFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    firstName: firestoreData.firstName,
    lastName: firestoreData.lastName,
    email: firestoreData.email,
    licenseType: firestoreData.licenseType,
    organizationId: firestoreData.organizationId,
    department: firestoreData.department,
    lastActive: firestoreData.lastActive?.toDate() || null,
    createdAt: firestoreData.createdAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}


/**
 * Map ProjectTeamMember from Prisma to Firestore format
 */
export function mapProjectTeamMemberToFirestore(prismaData: any): any {
  return {
    id: prismaData.id,
    projectId: prismaData.projectId,
    teamMemberId: prismaData.teamMemberId,
    assignedBy: prismaData.assignedBy,
    assignedAt: prismaData.assignedAt ? Timestamp.fromDate(new Date(prismaData.assignedAt)) : null,
    updatedAt: prismaData.updatedAt ? Timestamp.fromDate(new Date(prismaData.updatedAt)) : null,
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ProjectTeamMember from Firestore to Prisma format
 */
export function mapProjectTeamMemberFromFirestore(firestoreData: any): any {
  return {
    id: firestoreData.id,
    projectId: firestoreData.projectId,
    teamMemberId: firestoreData.teamMemberId,
    assignedBy: firestoreData.assignedBy,
    assignedAt: firestoreData.assignedAt?.toDate() || null,
    updatedAt: firestoreData.updatedAt?.toDate() || null,
  };
}
