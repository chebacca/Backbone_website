// Generated validation schemas
import { z } from 'zod';


export const UserFirestoreSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  password: z.string(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  position: z.string().optional(),
  department: z.string(),
  pod: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  positionType: z.string().optional(),
  personId: z.string().optional(),
  appleConnect: z.boolean(),
  box: z.boolean(),
  frameIO: z.boolean(),
  maui: z.boolean(),
  mdm: z.boolean(),
  slack: z.boolean(),
  webex: z.boolean(),
  mail: z.boolean(),
  quip: z.boolean(),
  company: z.string().optional(),
  lastLogin: z.date().optional(),
  productionDepartmentId: z.string().optional(),
  productionRoleId: z.string().optional(),
});

export type UserFirestore = z.infer<typeof UserFirestoreSchema>;

export const UserSettingsFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: z.string(),
  notifications: z.boolean(),
  language: z.string(),
  timezone: z.string(),
  toolbarPermissions: z.array(z.string()),
  accentColor: z.string().optional(),
  activityTracking: z.boolean(),
  aiAssistantEnabled: z.boolean(),
  aiAutoSuggestions: z.boolean(),
  aiDataProcessing: z.boolean(),
  aiPersonality: z.string().optional(),
  analytics: z.boolean(),
  animationsEnabled: z.boolean(),
  apiKeys: z.object({}).passthrough().optional(),
});

export type UserSettingsFirestore = z.infer<typeof UserSettingsFirestoreSchema>;

export const CustomRoleFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  category: z.string(),
  hierarchy: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomRoleFirestore = z.infer<typeof CustomRoleFirestoreSchema>;

export const WorkflowDiagramFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.object({}).passthrough(),
  edges: z.object({}).passthrough(),
  metadata: z.object({}).passthrough(),
});

export type WorkflowDiagramFirestore = z.infer<typeof WorkflowDiagramFirestoreSchema>;

export const UserGroupFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserGroupFirestore = z.infer<typeof UserGroupFirestoreSchema>;

export const UserGroupMembershipFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userGroupId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserGroupMembershipFirestore = z.infer<typeof UserGroupMembershipFirestoreSchema>;

export const StageFirestoreSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string().optional(),
  name: z.string(),
  order: z.number(),
});

export type StageFirestore = z.infer<typeof StageFirestoreSchema>;

export const SessionRoleFirestoreSchema = z.object({
  id: z.string(),
  roleName: z.string(),
  department: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SessionRoleFirestore = z.infer<typeof SessionRoleFirestoreSchema>;

export const RoleFirestoreSchema = z.object({
  id: z.string(),
  roleName: z.string(),
  department: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoleFirestore = z.infer<typeof RoleFirestoreSchema>;

export const ProductionSessionFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().optional(),
  callTime: z.date().optional(),
  wrapTime: z.date().optional(),
  estimatedDuration: z.number().optional(),
  crewSize: z.number().optional(),
  equipmentCount: z.number().optional(),
  budget: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  mapId: z.string().optional(),
  postProductionCallTime: z.date().optional(),
  postProductionNotes: z.string().optional(),
  postProductionWrapTime: z.date().optional(),
  deletedAt: z.date().optional(),
  deletedByUserId: z.string().optional(),
  isDeleted: z.boolean(),
  dueDate: z.date().optional(),
  sessionDate: z.date().optional(),
  currentPostProductionStageId: z.string().optional(),
  description: z.string().optional(),
  fileLocation: z.string().optional(),
  isOnHold: z.boolean(),
  metadata: z.object({}).passthrough().optional(),
});

export type ProductionSessionFirestore = z.infer<typeof ProductionSessionFirestoreSchema>;

export const ProductionStageFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  stageName: z.string(),
  stageOrder: z.number(),
  estimatedDays: z.number(),
  isRequired: z.boolean(),
  status: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionStageFirestore = z.infer<typeof ProductionStageFirestoreSchema>;

export const ProductionTaskFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  stageId: z.string().optional(),
  taskName: z.string(),
  status: z.string(),
  location: z.string().optional(),
  callTime: z.date().optional(),
  wrapTime: z.date().optional(),
  estimatedDuration: z.number().optional(),
  equipment: z.object({}).passthrough().optional(),
  crew: z.object({}).passthrough().optional(),
  notes: z.string().optional(),
  priority: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionTaskFirestore = z.infer<typeof ProductionTaskFirestoreSchema>;

export const ProductionTaskAssigneeFirestoreSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  roleId: z.string().optional(),
  assignedBy: z.string(),
  assignedAt: z.date(),
  status: z.string(),
  notes: z.string().optional(),
  callTime: z.date().optional(),
  estimatedHours: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionTaskAssigneeFirestore = z.infer<typeof ProductionTaskAssigneeFirestoreSchema>;

export const ProductionCrewMemberFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  department: z.string(),
  assignedToTaskId: z.string().optional(),
  callTime: z.date().optional(),
  status: z.string(),
  rate: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionCrewMemberFirestore = z.infer<typeof ProductionCrewMemberFirestoreSchema>;

export const ProductionWorkflowCorrelationFirestoreSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  workflowStepId: z.string().optional(),
  correlationType: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  autoSync: z.boolean(),
  createdByUserId: z.string(),
  lastSyncAt: z.date().optional(),
  syncDirection: z.string(),
});

export type ProductionWorkflowCorrelationFirestore = z.infer<typeof ProductionWorkflowCorrelationFirestoreSchema>;

export const SessionAssignmentFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  stageId: z.string().optional(),
  roleId: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sessionRoleId: z.string().optional(),
  assignmentStartTime: z.date().optional(),
  assignmentEndTime: z.date().optional(),
  userId: z.string(),
});

export type SessionAssignmentFirestore = z.infer<typeof SessionAssignmentFirestoreSchema>;

export const UnifiedWorkflowInstanceFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  workflowDiagramId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  progress: z.number(),
  dependencyConfig: z.object({}).passthrough(),
});

export type UnifiedWorkflowInstanceFirestore = z.infer<typeof UnifiedWorkflowInstanceFirestoreSchema>;

export const UnifiedSessionAssignmentFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  assignmentType: z.string(),
  userId: z.string().optional(),
  roleId: z.string().optional(),
  stageId: z.string().optional(),
  assignedByUserId: z.string(),
  podAssignment: z.string().optional(),
  isLead: z.boolean(),
  permissions: z.object({}).passthrough(),
  assignmentStartTime: z.date().optional(),
  assignmentEndTime: z.date().optional(),
  notes: z.string().optional(),
  metadata: z.object({}).passthrough(),
});

export type UnifiedSessionAssignmentFirestore = z.infer<typeof UnifiedSessionAssignmentFirestoreSchema>;

export const UnifiedSessionStepFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  workflowInstanceId: z.string(),
  nodeId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number(),
  dependencies: z.object({}).passthrough(),
  dependents: z.object({}).passthrough(),
  blockedBy: z.object({}).passthrough(),
  isParallel: z.boolean(),
  requiredRole: z.string().optional(),
  assignedUserId: z.string().optional(),
  assignedAt: z.date().optional(),
  assignedByUserId: z.string().optional(),
  progress: z.number(),
  estimatedHours: z.number(),
  actualHours: z.number(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedDate: z.date().optional(),
  deliverables: z.object({}).passthrough(),
  files: z.object({}).passthrough(),
  notes: z.string().optional(),
  workNotes: z.object({}).passthrough(),
  isRequired: z.boolean(),
  canSkip: z.boolean(),
  isQualityGate: z.boolean(),
  approvalRequired: z.boolean(),
  approvedByUserId: z.string().optional(),
  approvedAt: z.date().optional(),
  isQcStep: z.boolean(),
  qcConfig: z.object({}).passthrough().optional(),
});

export type UnifiedSessionStepFirestore = z.infer<typeof UnifiedSessionStepFirestoreSchema>;

export const FileChecklistFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  fileDescription: z.string(),
  expectedLocation: z.string().optional(),
  actualLocation: z.string().optional(),
  fileName: z.string().optional(),
  status: z.string().optional(),
  checkedAt: z.date().optional(),
  notes: z.string().optional(),
  fileTrackingId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FileChecklistFirestore = z.infer<typeof FileChecklistFirestoreSchema>;

export const PostProductionStageFirestoreSchema = z.object({
  id: z.string(),
  stageName: z.string(),
  stageOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PostProductionStageFirestore = z.infer<typeof PostProductionStageFirestoreSchema>;

export const PostProductionTaskFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  roleId: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  postProductionStageId: z.string().optional(),
  taskName: z.string().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedDate: z.date().optional(),
  createdByUserId: z.string(),
  lastUpdatedByUserId: z.string().optional(),
  filePath: z.string().optional(),
  assignmentId: z.string().optional(),
  assignedToUserId: z.string().optional(),
});

export type PostProductionTaskFirestore = z.infer<typeof PostProductionTaskFirestoreSchema>;

export const TaskAssigneeFirestoreSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  assignedAt: z.date(),
  assignedById: z.string(),
  sessionId: z.string().optional(),
  userId: z.string(),
});

export type TaskAssigneeFirestore = z.infer<typeof TaskAssigneeFirestoreSchema>;

export const ReviewSessionFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  cutTypeName: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type ReviewSessionFirestore = z.infer<typeof ReviewSessionFirestoreSchema>;

export const ReviewNoteFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  content: z.string(),
  timecode: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdByUserId: z.string(),
});

export type ReviewNoteFirestore = z.infer<typeof ReviewNoteFirestoreSchema>;

export const ReviewApprovalFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  approverUserId: z.string(),
  notes: z.string().optional(),
  approvedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ReviewApprovalFirestore = z.infer<typeof ReviewApprovalFirestoreSchema>;

export const ReviewAssignmentFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  assignedUserId: z.string(),
  assignedByUserId: z.string(),
  assignedAt: z.date(),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type ReviewAssignmentFirestore = z.infer<typeof ReviewAssignmentFirestoreSchema>;

export const ReviewSessionReviewerFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  notes: z.string().optional(),
  attended: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type ReviewSessionReviewerFirestore = z.infer<typeof ReviewSessionReviewerFirestoreSchema>;

export const ReviewSectionFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  sectionName: z.string(),
  startTimecode: z.string().optional(),
  endTimecode: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedToUserId: z.string().optional(),
});

export type ReviewSectionFirestore = z.infer<typeof ReviewSectionFirestoreSchema>;

export const CutApprovalFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  cutTypeId: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().optional(),
  status: z.string(),
});

export type CutApprovalFirestore = z.infer<typeof CutApprovalFirestoreSchema>;

export const CutTypeFirestoreSchema = z.object({
  id: z.string(),
  cutTypeName: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CutTypeFirestore = z.infer<typeof CutTypeFirestoreSchema>;

export const NotificationFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  read: z.boolean(),
  timestamp: z.date(),
  metadata: z.object({}).passthrough().optional(),
});

export type NotificationFirestore = z.infer<typeof NotificationFirestoreSchema>;

export const PortfolioFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  currency: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  parentPortfolioId: z.string().optional(),
  isDeleted: z.boolean(),
});

export type PortfolioFirestore = z.infer<typeof PortfolioFirestoreSchema>;

export const AssetFirestoreSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  quantity: z.number().optional(),
  purchasePrice: z.number().optional(),
  currentPrice: z.number().optional(),
  purchaseDate: z.date().optional(),
  portfolioId: z.string(),
  notes: z.string().optional(),
  isSold: z.boolean(),
  sellDate: z.date().optional(),
  sellPrice: z.number().optional(),
  network: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AssetFirestore = z.infer<typeof AssetFirestoreSchema>;

export const RWADetailsFirestoreSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  lastAppraisalDate: z.date().optional(),
  lastAppraisalValue: z.number().optional(),
  maintenanceCosts: z.number().optional(),
  insuranceCosts: z.number().optional(),
  storageLocation: z.string().optional(),
  storageConditions: z.object({}).passthrough().optional(),
  authenticityCertificate: z.string().optional(),
  notes: z.string().optional(),
  updatedAt: z.date(),
});

export type RWADetailsFirestore = z.infer<typeof RWADetailsFirestoreSchema>;

export const RwaDocumentFirestoreSchema = z.object({
  id: z.string(),
  rwaId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fileUrl: z.string(),
  fileType: z.string(),
  uploadDate: z.date(),
});

export type RwaDocumentFirestore = z.infer<typeof RwaDocumentFirestoreSchema>;

export const TaxLotFirestoreSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  purchaseDate: z.date(),
  quantity: z.number(),
  purchasePrice: z.number(),
  sellDate: z.date().optional(),
  sellPrice: z.number().optional(),
  realizedGain: z.number().optional(),
  holdingPeriod: z.number().optional(),
  isLongTerm: z.boolean().optional(),
  notes: z.string().optional(),
});

export type TaxLotFirestore = z.infer<typeof TaxLotFirestoreSchema>;

export const AssetPerformanceFirestoreSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  date: z.date(),
  return: z.number(),
  volatility: z.number(),
  beta: z.number(),
  alpha: z.number(),
  sharpeRatio: z.number(),
  sortinoRatio: z.number(),
  maxDrawdown: z.number(),
  correlation: z.number(),
});

export type AssetPerformanceFirestore = z.infer<typeof AssetPerformanceFirestoreSchema>;

export const AssetPriceHistoryFirestoreSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  price: z.number(),
  timestamp: z.date(),
  volume: z.number().optional(),
  marketCap: z.number().optional(),
});

export type AssetPriceHistoryFirestore = z.infer<typeof AssetPriceHistoryFirestoreSchema>;

export const PortfolioPerformanceFirestoreSchema = z.object({
  id: z.string(),
  portfolioId: z.string(),
  date: z.date(),
  totalValue: z.number(),
  dailyReturn: z.number(),
  monthlyReturn: z.number(),
  yearlyReturn: z.number(),
  realizedGains: z.number(),
  unrealizedGains: z.number(),
  dividendIncome: z.number(),
  interestIncome: z.number(),
  capitalGains: z.number(),
  taxLossHarvesting: z.number(),
  metrics: z.object({}).passthrough().optional(),
  allocation: z.object({}).passthrough().optional(),
});

export type PortfolioPerformanceFirestore = z.infer<typeof PortfolioPerformanceFirestoreSchema>;

export const PortfolioTaxSummaryFirestoreSchema = z.object({
  id: z.string(),
  portfolioId: z.string(),
  year: z.number(),
  realizedGains: z.number(),
  unrealizedGains: z.number(),
  dividendIncome: z.number(),
  interestIncome: z.number(),
  capitalGains: z.number(),
  taxLossHarvesting: z.number(),
  washSales: z.number(),
  foreignTaxPaid: z.number(),
  taxEfficiency: z.number(),
});

export type PortfolioTaxSummaryFirestore = z.infer<typeof PortfolioTaxSummaryFirestoreSchema>;

export const PortfolioAllocationFirestoreSchema = z.object({
  id: z.string(),
  portfolioId: z.string(),
  date: z.date(),
  assetAllocation: z.object({}).passthrough(),
  sectorAllocation: z.object({}).passthrough().optional(),
  geographicAllocation: z.object({}).passthrough().optional(),
});

export type PortfolioAllocationFirestore = z.infer<typeof PortfolioAllocationFirestoreSchema>;

export const BudgetFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  categories: z.object({}).passthrough().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BudgetFirestore = z.infer<typeof BudgetFirestoreSchema>;

export const TransactionFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  date: z.date(),
  categoryId: z.string(),
  budgetId: z.string(),
  type: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TransactionFirestore = z.infer<typeof TransactionFirestoreSchema>;

export const ContactFirestoreSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  positionType: z.string().optional(),
  roomNumber: z.string().optional(),
  idBadgeNumber: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  appleConnect: z.boolean(),
  box: z.boolean(),
  frameIO: z.boolean(),
  maui: z.boolean(),
  mdm: z.boolean(),
  slack: z.boolean(),
  webex: z.boolean(),
  mail: z.boolean(),
  quip: z.boolean(),
});

export type ContactFirestore = z.infer<typeof ContactFirestoreSchema>;

export const InvoiceFirestoreSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  userId: z.string(),
  clientId: z.string(),
  issueDate: z.date(),
  dueDate: z.date(),
  subtotal: z.number(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
  total: z.number(),
  currency: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InvoiceFirestore = z.infer<typeof InvoiceFirestoreSchema>;

export const InvoiceItemFirestoreSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});

export type InvoiceItemFirestore = z.infer<typeof InvoiceItemFirestoreSchema>;

export const InvoicePaymentFirestoreSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  date: z.date(),
  reference: z.string().optional(),
});

export type InvoicePaymentFirestore = z.infer<typeof InvoicePaymentFirestoreSchema>;

export const InvoiceAttachmentFirestoreSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  uploadDate: z.date(),
});

export type InvoiceAttachmentFirestore = z.infer<typeof InvoiceAttachmentFirestoreSchema>;

export const ReportFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  content: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  description: z.string().optional(),
  updatedAt: z.date(),
});

export type ReportFirestore = z.infer<typeof ReportFirestoreSchema>;

export const ContactGroupFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContactGroupFirestore = z.infer<typeof ContactGroupFirestoreSchema>;

export const ContactGroupMembershipFirestoreSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  contactGroupId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContactGroupMembershipFirestore = z.infer<typeof ContactGroupMembershipFirestoreSchema>;

export const ChatFirestoreSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  type: z.string(),
});

export type ChatFirestore = z.infer<typeof ChatFirestoreSchema>;

export const ChatParticipantFirestoreSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  userId: z.string(),
  joinedAt: z.date(),
  leftAt: z.date().optional(),
  isAdmin: z.boolean(),
});

export type ChatParticipantFirestore = z.infer<typeof ChatParticipantFirestoreSchema>;

export const MessageFirestoreSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.string(),
});

export type MessageFirestore = z.infer<typeof MessageFirestoreSchema>;

export const MessageReadFirestoreSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.date(),
});

export type MessageReadFirestore = z.infer<typeof MessageReadFirestoreSchema>;

export const AgentFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  capabilities: z.object({}).passthrough().optional(),
  parameters: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentFirestore = z.infer<typeof AgentFirestoreSchema>;

export const AgentMemoryFirestoreSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  content: z.string(),
  context: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentMemoryFirestore = z.infer<typeof AgentMemoryFirestoreSchema>;

export const AgentFunctionLogFirestoreSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  functionName: z.string(),
  parameters: z.object({}).passthrough().optional(),
  result: z.object({}).passthrough().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  error: z.string().optional(),
});

export type AgentFunctionLogFirestore = z.infer<typeof AgentFunctionLogFirestoreSchema>;

export const ResearchSessionFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.string(),
  notes: z.string().optional(),
  activeModule: z.string().optional(),
  results: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ResearchSessionFirestore = z.infer<typeof ResearchSessionFirestoreSchema>;

export const SchedulerEventFirestoreSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  isReminder: z.boolean(),
  assignToAgent: z.boolean(),
  agentId: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  endDate: z.date().optional(),
  eventType: z.string(),
  location: z.string().optional(),
});

export type SchedulerEventFirestore = z.infer<typeof SchedulerEventFirestoreSchema>;

export const SchedulerEventAssignmentFirestoreSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  assignedAt: z.date(),
  assignedBy: z.string(),
  status: z.string(),
  notes: z.string().optional(),
});

export type SchedulerEventAssignmentFirestore = z.infer<typeof SchedulerEventAssignmentFirestoreSchema>;

export const SchedulerTaskFirestoreSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date(),
  assignedAgent: z.string().optional(),
  status: z.string(),
  userId: z.string(),
  isRecurring: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SchedulerTaskFirestore = z.infer<typeof SchedulerTaskFirestoreSchema>;

export const NoteFirestoreSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  category: z.string().optional(),
  sessionId: z.string().optional(),
  tags: z.array(z.string()),
  color: z.string().optional(),
  isArchived: z.boolean(),
  isFavorite: z.boolean(),
  lastEdited: z.date(),
});

export type NoteFirestore = z.infer<typeof NoteFirestoreSchema>;

export const TestModelFirestoreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type TestModelFirestore = z.infer<typeof TestModelFirestoreSchema>;

export const MessageSessionFirestoreSchema = z.object({
  id: z.string(),
  productionSessionId: z.string().optional(),
  createdAt: z.date(),
  description: z.string().optional(),
  isArchived: z.boolean(),
  name: z.string().optional(),
  updatedAt: z.date(),
});

export type MessageSessionFirestore = z.infer<typeof MessageSessionFirestoreSchema>;

export const MessageParticipantFirestoreSchema = z.object({
  id: z.string(),
  messageSessionId: z.string(),
  contactId: z.string().optional(),
  userId: z.string().optional(),
  joinedAt: z.date(),
  leftAt: z.date().optional(),
  isAdmin: z.boolean(),
});

export type MessageParticipantFirestore = z.infer<typeof MessageParticipantFirestoreSchema>;

export const SessionMessageFirestoreSchema = z.object({
  id: z.string(),
  messageSessionId: z.string(),
  senderId: z.string(),
  content: z.string(),
  timestamp: z.date(),
  isRead: z.boolean(),
  replyToId: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
});

export type SessionMessageFirestore = z.infer<typeof SessionMessageFirestoreSchema>;

export const SessionMessageReadFirestoreSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.date(),
});

export type SessionMessageReadFirestore = z.infer<typeof SessionMessageReadFirestoreSchema>;

export const InventoryItemFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.string(),
  location: z.string().optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string().optional(),
  subLocation: z.string().optional(),
  assetUuid: z.string().optional(),
  assetTag: z.string().optional(),
  macSerialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchasePrice: z.number().optional(),
  serialNumber: z.string().optional(),
  warrantyExpires: z.date().optional(),
  assignedTo: z.string().optional(),
  specifications: z.object({}).passthrough().optional(),
});

export type InventoryItemFirestore = z.infer<typeof InventoryItemFirestoreSchema>;

export const SchemaFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  appliesTo: z.array(z.string()),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SchemaFirestore = z.infer<typeof SchemaFirestoreSchema>;

export const SchemaFieldFirestoreSchema = z.object({
  id: z.string(),
  schemaId: z.string(),
  name: z.string(),
  key: z.string(),
  type: z.string(),
  options: z.array(z.string()),
  section: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  defaultValue: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SchemaFieldFirestore = z.infer<typeof SchemaFieldFirestoreSchema>;

export const NetworkIPAssignmentFirestoreSchema = z.object({
  id: z.string(),
  ipAddress: z.string(),
  assetId: z.string().optional(),
  dns: z.string().optional(),
  gateway: z.string().optional(),
  subnetMask: z.string().optional(),
  vlan: z.string().optional(),
  assignedAt: z.date(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  releasedAt: z.date().optional(),
  status: z.string(),
});

export type NetworkIPAssignmentFirestore = z.infer<typeof NetworkIPAssignmentFirestoreSchema>;

export const InventoryHistoryFirestoreSchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  userId: z.string().optional(),
  timestamp: z.date(),
  changedField: z.string().optional(),
  description: z.string(),
  newValue: z.string().optional(),
  oldValue: z.string().optional(),
  action: z.string(),
  metadata: z.object({}).passthrough().optional(),
});

export type InventoryHistoryFirestore = z.infer<typeof InventoryHistoryFirestoreSchema>;

export const InventoryAssignmentHistoryFirestoreSchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  assignedTo: z.string().optional(),
  assignedBy: z.string().optional(),
  assignedAt: z.date(),
  returnedAt: z.date().optional(),
  returnedBy: z.string().optional(),
  assignmentType: z.string(),
  notes: z.string().optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  userDepartment: z.string().optional(),
  checkoutDate: z.date(),
  expectedReturnDate: z.date().optional(),
  actualReturnDate: z.date().optional(),
});

export type InventoryAssignmentHistoryFirestore = z.infer<typeof InventoryAssignmentHistoryFirestoreSchema>;

export const ServerFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  ipAddress: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  inventoryItemId: z.string().optional(),
  cpuInfo: z.string().optional(),
  description: z.string().optional(),
  hostname: z.string().optional(),
  loginUsername: z.string().optional(),
  memoryInfo: z.string().optional(),
  networkInfo: z.string().optional(),
  osName: z.string().optional(),
  osVersion: z.string().optional(),
  storageInfo: z.string().optional(),
  userId: z.string().optional(),
});

export type ServerFirestore = z.infer<typeof ServerFirestoreSchema>;

export const AssetSetupFirestoreSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  configurations: z.object({}).passthrough().optional(),
});

export type AssetSetupFirestore = z.infer<typeof AssetSetupFirestoreSchema>;

export const SetupProfileFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.string().optional(),
});

export type SetupProfileFirestore = z.infer<typeof SetupProfileFirestoreSchema>;

export const SetupChecklistFirestoreSchema = z.object({
  id: z.string(),
  setupProfileId: z.string(),
  item: z.string(),
  description: z.string().optional(),
  isRequired: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SetupChecklistFirestore = z.infer<typeof SetupChecklistFirestoreSchema>;

export const AssetSetupChecklistFirestoreSchema = z.object({
  id: z.string(),
  assetSetupId: z.string(),
  checklistId: z.string(),
  isCompleted: z.boolean(),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AssetSetupChecklistFirestore = z.infer<typeof AssetSetupChecklistFirestoreSchema>;

export const ChapterMarkerFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  title: z.string(),
  timecode: z.string(),
  description: z.string().optional(),
});

export type ChapterMarkerFirestore = z.infer<typeof ChapterMarkerFirestoreSchema>;

export const ProjectFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.string().optional(),
  allowCollaboration: z.boolean(),
  allowGuestUsers: z.boolean(),
  allowRealTimeEditing: z.boolean(),
  applicationMode: z.string(),
  archivedAt: z.date().optional(),
  archivedBy: z.string().optional(),
  autoSave: z.boolean(),
  autoSync: z.boolean(),
  backupEnabled: z.boolean(),
  conflictResolution: z.string(),
  createdAt: z.date(),
  enableActivityLog: z.boolean(),
  enableChat: z.boolean(),
  enableComments: z.boolean(),
  enableOfflineMode: z.boolean(),
  enablePresenceIndicators: z.boolean(),
  encryptionEnabled: z.boolean(),
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  isActive: z.boolean(),
  isArchived: z.boolean(),
  lastAccessedAt: z.date().optional(),
  lastSyncedAt: z.date().optional(),
  maxCollaborators: z.number(),
  metadata: z.object({}).passthrough().optional(),
});

export type ProjectFirestore = z.infer<typeof ProjectFirestoreSchema>;

export const ProjectParticipantFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  role: z.string(),
  permissions: z.object({}).passthrough().optional(),
  joinedAt: z.date(),
  lastActiveAt: z.date().optional(),
  isOnline: z.boolean(),
  isActive: z.boolean(),
});

export type ProjectParticipantFirestore = z.infer<typeof ProjectParticipantFirestoreSchema>;

export const QcStatusFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  actualHours: z.number().optional(),
  completedAt: z.date().optional(),
  estimatedHours: z.number().optional(),
  overallScore: z.number().optional(),
  passThreshold: z.number(),
  qcSpecialistId: z.string().optional(),
});

export type QcStatusFirestore = z.infer<typeof QcStatusFirestoreSchema>;

export const QcSessionFirestoreSchema = z.object({
  id: z.string(),
  qcStatusId: z.string(),
  sessionId: z.string(),
  workflowStepId: z.string().optional(),
  reviewSessionId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  assignedAt: z.date().optional(),
  assignedByUserId: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  dueDate: z.date().optional(),
  overallScore: z.number().optional(),
  passThreshold: z.number(),
  criticalIssues: z.number(),
  majorIssues: z.number(),
  minorIssues: z.number(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type QcSessionFirestore = z.infer<typeof QcSessionFirestoreSchema>;

export const QcChecklistItemFirestoreSchema = z.object({
  id: z.string(),
  qcStatusId: z.string().optional(),
  qcSessionId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  isRequired: z.boolean(),
  weight: z.number(),
  order: z.number(),
  score: z.number().optional(),
  notes: z.string().optional(),
  checkedByUserId: z.string().optional(),
  checkedAt: z.date().optional(),
  expectedValue: z.string().optional(),
  actualValue: z.string().optional(),
  tolerance: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QcChecklistItemFirestore = z.infer<typeof QcChecklistItemFirestoreSchema>;

export const QcFindingFirestoreSchema = z.object({
  id: z.string(),
  qcSessionId: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  resolution: z.string().optional(),
  resolvedAt: z.date().optional(),
  resolvedByUserId: z.string().optional(),
  screenshot: z.string().optional(),
  attachments: z.object({}).passthrough().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type QcFindingFirestore = z.infer<typeof QcFindingFirestoreSchema>;

export const QcReportFirestoreSchema = z.object({
  id: z.string(),
  qcStatusId: z.string().optional(),
  qcSessionId: z.string().optional(),
  sessionId: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  recommendations: z.string().optional(),
  overallScore: z.number().optional(),
  totalChecks: z.number(),
  passedChecks: z.number(),
  failedChecks: z.number(),
  criticalIssues: z.number(),
  majorIssues: z.number(),
  minorIssues: z.number(),
  generatedAt: z.date(),
  generatedByUserId: z.string(),
  reportData: z.object({}).passthrough().optional(),
});

export type QcReportFirestore = z.infer<typeof QcReportFirestoreSchema>;

export const QcActivityFirestoreSchema = z.object({
  id: z.string(),
  qcSessionId: z.string(),
  description: z.string(),
  details: z.object({}).passthrough().optional(),
});

export type QcActivityFirestore = z.infer<typeof QcActivityFirestoreSchema>;

export const SessionArchiveFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  archivedAt: z.date(),
  archivedByUserId: z.string(),
  archiveLocation: z.string().optional(),
  archiveNotes: z.string().optional(),
  finalCutPath: z.string().optional(),
  finalAudioPath: z.string().optional(),
  finalColorPath: z.string().optional(),
  finalGfxPath: z.string().optional(),
  keynotePath: z.string().optional(),
  finalCutProjectPath: z.string().optional(),
  finalQcReportPath: z.string().optional(),
  deliverables: z.object({}).passthrough().optional(),
});

export type SessionArchiveFirestore = z.infer<typeof SessionArchiveFirestoreSchema>;

export const SessionFileFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  filePath: z.string(),
  uploadDate: z.date(),
});

export type SessionFileFirestore = z.infer<typeof SessionFileFirestoreSchema>;

export const TaskNotificationFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  taskId: z.string(),
  type: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.date(),
});

export type TaskNotificationFirestore = z.infer<typeof TaskNotificationFirestoreSchema>;

export const NetworkFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NetworkFirestore = z.infer<typeof NetworkFirestoreSchema>;

export const NetworkIPRangeFirestoreSchema = z.object({
  id: z.string(),
  startIP: z.string(),
  endIP: z.string(),
  subnetMask: z.string(),
  gateway: z.string(),
  dns: z.string(),
  vlan: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  networkId: z.string().optional(),
});

export type NetworkIPRangeFirestore = z.infer<typeof NetworkIPRangeFirestoreSchema>;

export const PodAssignmentFirestoreSchema = z.object({
  id: z.string(),
  podId: z.string(),
  podNumber: z.number(),
  personId: z.string(),
  roleId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PodAssignmentFirestore = z.infer<typeof PodAssignmentFirestoreSchema>;

export const SystemAssetFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  key: z.string(),
  data: z.unknown(),
  contentType: z.string(),
  size: z.number(),
  metadata: z.object({}).passthrough().optional(),
});

export type SystemAssetFirestore = z.infer<typeof SystemAssetFirestoreSchema>;

export const TenantStorageUsageFirestoreSchema = z.object({
  tenantId: z.string(),
  plan: z.string().optional(),
  customQuotaMb: z.number().optional(),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export type TenantStorageUsageFirestore = z.infer<typeof TenantStorageUsageFirestoreSchema>;

export const InventoryMapFirestoreSchema = z.object({
  id: z.string(),
  items: z.array(z.string()),
  positions: z.object({}).passthrough(),
  containers: z.object({}).passthrough(),
  customMapImage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InventoryMapFirestore = z.infer<typeof InventoryMapFirestoreSchema>;

export const MapDataFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  data: z.object({}).passthrough(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MapDataFirestore = z.infer<typeof MapDataFirestoreSchema>;

export const MapLayoutFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  data: z.object({}).passthrough(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  googleMapsData: z.object({}).passthrough().optional(),
  locationData: z.object({}).passthrough().optional(),
  mapType: z.string(),
});

export type MapLayoutFirestore = z.infer<typeof MapLayoutFirestoreSchema>;

export const MapLocationFirestoreSchema = z.object({
  id: z.string(),
  mapLayoutId: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  placeId: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  metadata: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MapLocationFirestore = z.infer<typeof MapLocationFirestoreSchema>;

export const CommandCenterLayoutFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  widgets: z.object({}).passthrough(),
  gridSettings: z.object({}).passthrough(),
  isDefault: z.boolean(),
  isShared: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CommandCenterLayoutFirestore = z.infer<typeof CommandCenterLayoutFirestoreSchema>;

export const SlackIntegrationFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  slackUserId: z.string(),
  slackTeamId: z.string(),
  accessToken: z.string(),
  scope: z.string().optional(),
  botUserId: z.string().optional(),
  appId: z.string().optional(),
  workspaceName: z.string().optional(),
  teamName: z.string().optional(),
  isActive: z.boolean(),
  metadata: z.object({}).passthrough().optional(),
});

export type SlackIntegrationFirestore = z.infer<typeof SlackIntegrationFirestoreSchema>;

export const WorkflowStepFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodeId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowStepFirestore = z.infer<typeof WorkflowStepFirestoreSchema>;

export const WorkflowDependencyFirestoreSchema = z.object({
  id: z.string(),
  sourceStepId: z.string(),
  targetStepId: z.string(),
  createdAt: z.date(),
});

export type WorkflowDependencyFirestore = z.infer<typeof WorkflowDependencyFirestoreSchema>;

export const WorkflowTriggerFirestoreSchema = z.object({
  id: z.string(),
  conditions: z.object({}).passthrough(),
});

export type WorkflowTriggerFirestore = z.infer<typeof WorkflowTriggerFirestoreSchema>;

export const SessionWorkflowFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  workflowId: z.string().optional(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SessionWorkflowFirestore = z.infer<typeof SessionWorkflowFirestoreSchema>;

export const WorkflowNotificationFirestoreSchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  message: z.string(),
  type: z.string(),
  isRead: z.boolean(),
  createdAt: z.date(),
});

export type WorkflowNotificationFirestore = z.infer<typeof WorkflowNotificationFirestoreSchema>;

export const WorkflowActivityFirestoreSchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  activity: z.string(),
  metadata: z.object({}).passthrough().optional(),
});

export type WorkflowActivityFirestore = z.infer<typeof WorkflowActivityFirestoreSchema>;

export const SessionWorkflowTaskIntegrationFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  taskId: z.string().optional(),
  workflowId: z.string().optional(),
  status: z.string(),
  createdAt: z.date(),
});

export type SessionWorkflowTaskIntegrationFirestore = z.infer<typeof SessionWorkflowTaskIntegrationFirestoreSchema>;

export const PostProductionWorkflowCorrelationFirestoreSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  workflowStepId: z.string().optional(),
  correlationType: z.string(),
  createdAt: z.date(),
});

export type PostProductionWorkflowCorrelationFirestore = z.infer<typeof PostProductionWorkflowCorrelationFirestoreSchema>;

export const TeamFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeamFirestore = z.infer<typeof TeamFirestoreSchema>;

export const SessionStepsFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  stepId: z.string().optional(),
  status: z.string(),
  order: z.number(),
  createdAt: z.date(),
});

export type SessionStepsFirestore = z.infer<typeof SessionStepsFirestoreSchema>;

export const UnifiedStepProgressionFirestoreSchema = z.object({
  id: z.string(),
  stepId: z.string(),
  sessionId: z.string(),
  progress: z.number(),
  startedAt: z.date().optional(),
  pausedAt: z.date().optional(),
  resumedAt: z.date().optional(),
  completedAt: z.date().optional(),
  totalPausedTime: z.number(),
  startedByUserId: z.string().optional(),
  completedByUserId: z.string().optional(),
  currentWorkingUserId: z.string().optional(),
  dependencyStatus: z.object({}).passthrough(),
});

export type UnifiedStepProgressionFirestore = z.infer<typeof UnifiedStepProgressionFirestoreSchema>;

export const UnifiedStepEventFirestoreSchema = z.object({
  id: z.string(),
  stepId: z.string(),
  sessionId: z.string(),
  eventData: z.object({}).passthrough(),
  triggeredByUserId: z.string().optional(),
  timestamp: z.date(),
});

export type UnifiedStepEventFirestore = z.infer<typeof UnifiedStepEventFirestoreSchema>;

export const SessionElementFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  sessionId: z.string().optional(),
  stepId: z.string().optional(),
  workflowInstanceId: z.string().optional(),
  parentElementId: z.string().optional(),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  checksum: z.string().optional(),
  additionalFiles: z.object({}).passthrough(),
  previewFiles: z.object({}).passthrough(),
  metadata: z.object({}).passthrough(),
});

export type SessionElementFirestore = z.infer<typeof SessionElementFirestoreSchema>;

export const ElementActivityFirestoreSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  description: z.string(),
  metadata: z.object({}).passthrough(),
});

export type ElementActivityFirestore = z.infer<typeof ElementActivityFirestoreSchema>;

export const ElementReviewFirestoreSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  reviewerUserId: z.string(),
  rating: z.number().optional(),
  feedback: z.string().optional(),
  requestedChanges: z.object({}).passthrough(),
  metadata: z.object({}).passthrough(),
});

export type ElementReviewFirestore = z.infer<typeof ElementReviewFirestoreSchema>;

export const ElementFileFirestoreSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  checksum: z.string().optional(),
  fileType: z.string(),
  uploadedByUserId: z.string(),
  metadata: z.object({}).passthrough(),
});

export type ElementFileFirestore = z.infer<typeof ElementFileFirestoreSchema>;

export const ElementDependencyFirestoreSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  dependencyElementId: z.string(),
  createdByUserId: z.string(),
  metadata: z.object({}).passthrough(),
});

export type ElementDependencyFirestore = z.infer<typeof ElementDependencyFirestoreSchema>;

export const MediaFileTagFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaFileTagFirestore = z.infer<typeof MediaFileTagFirestoreSchema>;

export const MediaFileFirestoreSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalFileName: z.string().optional(),
  filePath: z.string(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  fileType: z.string(),
  uploadedBy: z.string().optional(),
  uploadedAt: z.date(),
  description: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type MediaFileFirestore = z.infer<typeof MediaFileFirestoreSchema>;

export const ReviewFilePathFirestoreSchema = z.object({
  id: z.string(),
  reviewSessionId: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  cutType: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ReviewFilePathFirestore = z.infer<typeof ReviewFilePathFirestoreSchema>;

export const MediaIndexFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  userId: z.string(),
  lastIndexed: z.date(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaIndexFirestore = z.infer<typeof MediaIndexFirestoreSchema>;

export const MediaIndexItemFirestoreSchema = z.object({
  id: z.string(),
  mediaIndexId: z.string(),
  name: z.string(),
  path: z.string(),
  type: z.string(),
  size: z.number(),
  modified: z.date(),
  created: z.date(),
  extension: z.string(),
  mimeType: z.string(),
  category: z.string(),
  parentPath: z.string(),
  depth: z.number(),
  isAccessible: z.boolean(),
  metadata: z.object({}).passthrough().optional(),
});

export type MediaIndexItemFirestore = z.infer<typeof MediaIndexItemFirestoreSchema>;

export const ProductionSessionToProjectFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionSessionToProjectFirestore = z.infer<typeof ProductionSessionToProjectFirestoreSchema>;

export const ProductionSessionToStageFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionSessionToStageFirestore = z.infer<typeof ProductionSessionToStageFirestoreSchema>;

export const ProductionSessionToUserFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionSessionToUserFirestore = z.infer<typeof ProductionSessionToUserFirestoreSchema>;

export const ProductionSession_archivedByToUserFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionSession_archivedByToUserFirestore = z.infer<typeof ProductionSession_archivedByToUserFirestoreSchema>;

export const ProductionTaskAssignedToUserFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionTaskAssignedToUserFirestore = z.infer<typeof ProductionTaskAssignedToUserFirestoreSchema>;

export const ProductionTaskCreatedByFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionTaskCreatedByFirestore = z.infer<typeof ProductionTaskCreatedByFirestoreSchema>;

export const ProductionTaskLastUpdatedByFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionTaskLastUpdatedByFirestore = z.infer<typeof ProductionTaskLastUpdatedByFirestoreSchema>;

export const ProductionTaskToRoleFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionTaskToRoleFirestore = z.infer<typeof ProductionTaskToRoleFirestoreSchema>;

export const ProductionTaskToSessionAssignmentFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type ProductionTaskToSessionAssignmentFirestore = z.infer<typeof ProductionTaskToSessionAssignmentFirestoreSchema>;

export const SessionOnHoldByFirestoreSchema = z.object({
  A: z.string(),
  B: z.string(),
});

export type SessionOnHoldByFirestore = z.infer<typeof SessionOnHoldByFirestoreSchema>;

export const websocket_serversFirestoreSchema = z.object({
  id: z.string(),
  host: z.string(),
  port: z.number(),
  last_heartbeat: z.date().optional(),
  created_at: z.date().optional(),
});

export type websocket_serversFirestore = z.infer<typeof websocket_serversFirestoreSchema>;

export const websocket_sessionsFirestoreSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  server_id: z.string(),
  data: z.object({}).passthrough().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type websocket_sessionsFirestore = z.infer<typeof websocket_sessionsFirestoreSchema>;

export const AutomationAlertAcknowledgmentFirestoreSchema = z.object({
  id: z.string(),
  alertId: z.string(),
  sessionId: z.string(),
  sessionName: z.string(),
  alertType: z.string(),
  urgencyLevel: z.string(),
  message: z.string(),
  acknowledgedByUserId: z.string(),
  acknowledgedAt: z.date(),
  expiresAt: z.date().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type AutomationAlertAcknowledgmentFirestore = z.infer<typeof AutomationAlertAcknowledgmentFirestoreSchema>;

export const LifecycleRuleFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  triggerType: z.string(),
  triggerEvent: z.string(),
  triggerParameters: z.object({}).passthrough().optional(),
  conditions: z.object({}).passthrough().optional(),
  actions: z.object({}).passthrough().optional(),
  priority: z.number(),
  cooldownMinutes: z.number(),
  maxExecutions: z.number().optional(),
  sessionId: z.string().optional(),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LifecycleRuleFirestore = z.infer<typeof LifecycleRuleFirestoreSchema>;

export const AutomationExecutionFirestoreSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  sessionId: z.string(),
  triggeredBy: z.string(),
  status: z.string(),
  triggeredAt: z.date(),
  completedAt: z.date().optional(),
  result: z.object({}).passthrough().optional(),
  logs: z.object({}).passthrough().optional(),
  context: z.object({}).passthrough().optional(),
});

export type AutomationExecutionFirestore = z.infer<typeof AutomationExecutionFirestoreSchema>;

export const SessionPhaseTransitionFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  transitionDate: z.date(),
  transitionedBy: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type SessionPhaseTransitionFirestore = z.infer<typeof SessionPhaseTransitionFirestoreSchema>;

export const SessionLifecycleStateFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  isOnTrack: z.boolean(),
  blockers: z.object({}).passthrough().optional(),
  automationHistory: z.object({}).passthrough().optional(),
  nextScheduledActions: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  actualPhaseEnd: z.date().optional(),
  actualStageEnd: z.date().optional(),
  actualStatusEnd: z.date().optional(),
  expectedPhaseEnd: z.date().optional(),
  expectedStageEnd: z.date().optional(),
  expectedStatusEnd: z.date().optional(),
  phaseNotes: z.string().optional(),
  stageNotes: z.string().optional(),
  statusNotes: z.string().optional(),
  phaseStartDate: z.date(),
  stageStartDate: z.date(),
  statusStartDate: z.date(),
});

export type SessionLifecycleStateFirestore = z.infer<typeof SessionLifecycleStateFirestoreSchema>;

export const UserTimeCardFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionId: z.string().optional(),
  taskId: z.string().optional(),
  date: z.date(),
  timeIn: z.date().optional(),
  timeOut: z.date().optional(),
  totalHours: z.number().optional(),
  mealBreakStart: z.date().optional(),
  mealBreakEnd: z.date().optional(),
  mealBreakTaken: z.boolean(),
  mealPenalty: z.boolean(),
  breaks: z.object({}).passthrough().optional(),
  regularHours: z.number(),
  overtimeHours: z.number(),
  doubleTimeHours: z.number(),
  location: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  hourlyRate: z.number().optional(),
  overtimeRate: z.number().optional(),
  doubleTimeRate: z.number().optional(),
  totalPay: z.number().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  rejectedReason: z.string().optional(),
  turnaroundHours: z.number().optional(),
  turnaroundViolation: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  entryNumber: z.number(),
});

export type UserTimeCardFirestore = z.infer<typeof UserTimeCardFirestoreSchema>;

export const TimecardTemplateFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  standardHoursPerDay: z.number(),
  overtimeThreshold: z.number(),
  doubleTimeThreshold: z.number(),
  overtimeMultiplier: z.number(),
  doubleTimeMultiplier: z.number(),
  mealBreakRequired: z.boolean(),
  mealBreakThreshold: z.number(),
  mealPenaltyHours: z.number(),
  restBreakRequired: z.boolean(),
  restBreakThreshold: z.number(),
  minimumTurnaround: z.number(),
  turnaroundViolationPenalty: z.number(),
  department: z.string().optional(),
  role: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type TimecardTemplateFirestore = z.infer<typeof TimecardTemplateFirestoreSchema>;

export const UserTimecardAssignmentFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  templateId: z.string(),
  isActive: z.boolean(),
  effectiveDate: z.date(),
  endDate: z.date().optional(),
  assignedBy: z.string(),
  assignmentReason: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserTimecardAssignmentFirestore = z.infer<typeof UserTimecardAssignmentFirestoreSchema>;

export const TimecardConfigurationFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  templateId: z.string().optional(),
  standardHoursPerDay: z.number().optional(),
  overtimeThreshold: z.number().optional(),
  doubleTimeThreshold: z.number().optional(),
  overtimeMultiplier: z.number().optional(),
  doubleTimeMultiplier: z.number().optional(),
  mealBreakRequired: z.boolean().optional(),
  mealBreakThreshold: z.number().optional(),
  mealPenaltyHours: z.number().optional(),
  minimumTurnaround: z.number().optional(),
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  hourlyRate: z.number().optional(),
  enableEscalation: z.boolean().optional(),
  escalationComplianceIssues: z.boolean().optional(),
  escalationOvertimeThreshold: z.number().optional(),
  escalationReason: z.string().optional(),
  escalationThreshold: z.number().optional(),
  escalationTurnaroundViolations: z.boolean().optional(),
});

export type TimecardConfigurationFirestore = z.infer<typeof TimecardConfigurationFirestoreSchema>;

export const UserDirectReportFirestoreSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  managerId: z.string(),
  department: z.string().optional(),
  project: z.string().optional(),
  isActive: z.boolean(),
  effectiveDate: z.date(),
  endDate: z.date().optional(),
  assignedBy: z.string(),
  assignmentReason: z.string().optional(),
  notes: z.string().optional(),
  canApproveTimecards: z.boolean(),
  canApproveOvertime: z.boolean(),
  maxApprovalHours: z.number().optional(),
  requiresEscalation: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDirectReportFirestore = z.infer<typeof UserDirectReportFirestoreSchema>;

export const TimecardApprovalFlowFirestoreSchema = z.object({
  id: z.string(),
  timecardId: z.string(),
  employeeId: z.string(),
  primaryApproverId: z.string().optional(),
  escalationApproverId: z.string().optional(),
  finalApproverId: z.string().optional(),
  submittedAt: z.date().optional(),
  firstApprovalAt: z.date().optional(),
  escalatedAt: z.date().optional(),
  finalApprovalAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  approvalComments: z.string().optional(),
  rejectionReason: z.string().optional(),
  escalationReason: z.string().optional(),
  requiresOvertimeApproval: z.boolean(),
  requiresExecutiveApproval: z.boolean(),
  hasComplianceIssues: z.boolean(),
  complianceNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TimecardApprovalFlowFirestore = z.infer<typeof TimecardApprovalFlowFirestoreSchema>;

export const TimecardAssistanceDismissalFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  alertId: z.string(),
  dismissedAt: z.date(),
});

export type TimecardAssistanceDismissalFirestore = z.infer<typeof TimecardAssistanceDismissalFirestoreSchema>;

export const WorkflowAssignmentFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  workflowId: z.string(),
  assignedAt: z.date(),
  assignedBy: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  metadata: z.object({}).passthrough(),
});

export type WorkflowAssignmentFirestore = z.infer<typeof WorkflowAssignmentFirestoreSchema>;

export const CallSheetFirestoreSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  jobId: z.string().optional(),
  shootDay: z.string().optional(),
  date: z.date(),
  generalCrewCall: z.date().optional(),
  weatherHigh: z.string().optional(),
  weatherLow: z.string().optional(),
  sunrise: z.date().optional(),
  sunset: z.date().optional(),
  hospitalName: z.string().optional(),
  hospitalAddress: z.string().optional(),
  hospitalPhone: z.string().optional(),
  notes: z.string().optional(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  nextDaySessionId: z.string().optional(),
  sessionId: z.string().optional(),
  isTemplate: z.boolean(),
});

export type CallSheetFirestore = z.infer<typeof CallSheetFirestoreSchema>;

export const DailyCallSheetRecordFirestoreSchema = z.object({
  id: z.string(),
  templateCallSheetId: z.string().optional(),
  projectName: z.string(),
  jobId: z.string().optional(),
  shootDay: z.string().optional(),
  recordDate: z.date(),
  generalCrewCall: z.date().optional(),
  weatherHigh: z.string().optional(),
  weatherLow: z.string().optional(),
  sunrise: z.date().optional(),
  sunset: z.date().optional(),
  hospitalName: z.string().optional(),
  hospitalAddress: z.string().optional(),
  hospitalPhone: z.string().optional(),
  notes: z.string().optional(),
  isArchived: z.boolean(),
  publishedAt: z.date().optional(),
  publishedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  sessionId: z.string().optional(),
  nextDaySessionId: z.string().optional(),
});

export type DailyCallSheetRecordFirestore = z.infer<typeof DailyCallSheetRecordFirestoreSchema>;

export const DailyCallSheetLocationFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  name: z.string(),
  address: z.string(),
  description: z.string().optional(),
  isPrimary: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetLocationFirestore = z.infer<typeof DailyCallSheetLocationFirestoreSchema>;

export const DailyCallSheetPersonnelFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  userId: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  departmentId: z.string().optional(),
  subDepartmentId: z.string().optional(),
  roleId: z.string().optional(),
  callTime: z.date().optional(),
  wrapTime: z.date().optional(),
  callLocation: z.string().optional(),
  wrapLocation: z.string().optional(),
  mealTime: z.date().optional(),
  mealLocation: z.string().optional(),
  notes: z.string().optional(),
  specialRequirements: z.string().optional(),
  transportationNeeds: z.string().optional(),
  order: z.number(),
  isConfirmed: z.boolean(),
  expectedHours: z.number().optional(),
  hourlyRate: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetPersonnelFirestore = z.infer<typeof DailyCallSheetPersonnelFirestoreSchema>;

export const DailyCallSheetDepartmentCallTimeFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  departmentId: z.string().optional(),
  subDepartmentId: z.string().optional(),
  roleId: z.string().optional(),
  callTime: z.date(),
  wrapTime: z.date().optional(),
  mealTime: z.date().optional(),
  callLocation: z.string().optional(),
  wrapLocation: z.string().optional(),
  mealLocation: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean(),
  affectsAllRoles: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetDepartmentCallTimeFirestore = z.infer<typeof DailyCallSheetDepartmentCallTimeFirestoreSchema>;

export const DailyCallSheetScheduleFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  time: z.string(),
  description: z.string(),
  location: z.string().optional(),
  isHighlight: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetScheduleFirestore = z.infer<typeof DailyCallSheetScheduleFirestoreSchema>;

export const DailyCallSheetVendorFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetVendorFirestore = z.infer<typeof DailyCallSheetVendorFirestoreSchema>;

export const DailyCallSheetWalkieChannelFirestoreSchema = z.object({
  id: z.string(),
  dailyCallSheetId: z.string(),
  channel: z.string(),
  assignment: z.string(),
  description: z.string().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyCallSheetWalkieChannelFirestore = z.infer<typeof DailyCallSheetWalkieChannelFirestoreSchema>;

export const ProductionDepartmentFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string(),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionDepartmentFirestore = z.infer<typeof ProductionDepartmentFirestoreSchema>;

export const ProductionSubDepartmentFirestoreSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionSubDepartmentFirestore = z.infer<typeof ProductionSubDepartmentFirestoreSchema>;

export const ProductionRoleFirestoreSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  subDepartmentId: z.string().optional(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  hourlyRateRange: z.string().optional(),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionRoleFirestore = z.infer<typeof ProductionRoleFirestoreSchema>;

export const CallSheetLocationFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  name: z.string(),
  address: z.string(),
  description: z.string().optional(),
  isPrimary: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CallSheetLocationFirestore = z.infer<typeof CallSheetLocationFirestoreSchema>;

export const CallSheetPersonnelFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  title: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  wrapLocation: z.string().optional(),
  notes: z.string().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  callLocation: z.string().optional(),
  departmentId: z.string().optional(),
  expectedHours: z.number().optional(),
  hourlyRate: z.number().optional(),
  isConfirmed: z.boolean(),
  mealLocation: z.string().optional(),
  mealTime: z.date().optional(),
  roleId: z.string().optional(),
  specialRequirements: z.string().optional(),
  subDepartmentId: z.string().optional(),
  transportationNeeds: z.string().optional(),
  userId: z.string().optional(),
  wrapTime: z.date().optional(),
  callTime: z.date().optional(),
});

export type CallSheetPersonnelFirestore = z.infer<typeof CallSheetPersonnelFirestoreSchema>;

export const CallSheetDepartmentCallTimeFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  departmentId: z.string().optional(),
  subDepartmentId: z.string().optional(),
  roleId: z.string().optional(),
  callTime: z.date(),
  wrapTime: z.date().optional(),
  mealTime: z.date().optional(),
  callLocation: z.string().optional(),
  wrapLocation: z.string().optional(),
  mealLocation: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean(),
  affectsAllRoles: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CallSheetDepartmentCallTimeFirestore = z.infer<typeof CallSheetDepartmentCallTimeFirestoreSchema>;

export const CallSheetScheduleFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  time: z.string(),
  description: z.string(),
  location: z.string().optional(),
  isHighlight: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CallSheetScheduleFirestore = z.infer<typeof CallSheetScheduleFirestoreSchema>;

export const CallSheetVendorFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CallSheetVendorFirestore = z.infer<typeof CallSheetVendorFirestoreSchema>;

export const CallSheetWalkieChannelFirestoreSchema = z.object({
  id: z.string(),
  callSheetId: z.string(),
  channel: z.string(),
  assignment: z.string(),
  description: z.string().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CallSheetWalkieChannelFirestore = z.infer<typeof CallSheetWalkieChannelFirestoreSchema>;

export const PBMProjectFirestoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  totalBudget: z.number().optional(),
  projectedBudget: z.number().optional(),
  actualCosts: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export type PBMProjectFirestore = z.infer<typeof PBMProjectFirestoreSchema>;

export const PBMScheduleFirestoreSchema = z.object({
  id: z.string(),
  pbmProjectId: z.string(),
  sessionId: z.string().optional(),
  sessionNumber: z.number().optional(),
  sceneNumber: z.string(),
  sceneDescription: z.string(),
  pageReference: z.string().optional(),
  setLocation: z.string().optional(),
  cast: z.object({}).passthrough(),
  stunts: z.object({}).passthrough(),
  vehicles: z.object({}).passthrough(),
  pageCount: z.number().optional(),
  estimatedTime: z.string().optional(),
  notes: z.string().optional(),
  day: z.string().optional(),
  date: z.date().optional(),
  callTime: z.date().optional(),
  shootTime: z.date().optional(),
  wrapTime: z.date().optional(),
  lunchTime: z.date().optional(),
  secondMealTime: z.date().optional(),
  companyWrapTime: z.date().optional(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PBMScheduleFirestore = z.infer<typeof PBMScheduleFirestoreSchema>;

export const PBMPayscaleFirestoreSchema = z.object({
  id: z.string(),
  pbmProjectId: z.string(),
  accountNumber: z.string(),
  department: z.string(),
  description: z.string(),
  union: z.boolean(),
  guaranteedDays: z.number(),
  rate: z.number(),
  overtimeRate1_5x: z.number(),
  overtimeRate2x: z.number(),
  sixthDayRate: z.number(),
  seventhDayRate: z.number(),
  totalBudget: z.number(),
  lockedBudget: z.number(),
  actualOvertime: z.number(),
  mealPenalties: z.number(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PBMPayscaleFirestore = z.infer<typeof PBMPayscaleFirestoreSchema>;

export const PBMDailyStatusFirestoreSchema = z.object({
  id: z.string(),
  pbmProjectId: z.string(),
  payscaleId: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  actualHours: z.number().optional(),
  overtimeHours: z.number().optional(),
  isConfirmed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PBMDailyStatusFirestore = z.infer<typeof PBMDailyStatusFirestoreSchema>;

export const BrainChatSessionFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().optional(),
  context: z.object({}).passthrough().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  lastMessage: z.date().optional(),
});

export type BrainChatSessionFirestore = z.infer<typeof BrainChatSessionFirestoreSchema>;

export const BrainChatMessageFirestoreSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  content: z.string(),
  context: z.object({}).passthrough().optional(),
  metadata: z.object({}).passthrough().optional(),
  createdAt: z.date(),
});

export type BrainChatMessageFirestore = z.infer<typeof BrainChatMessageFirestoreSchema>;

export const SavedProjectPathFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  filePath: z.string().optional(),
  projectId: z.string().optional(),
  projectType: z.string(),
  lastAccessed: z.date(),
  accessCount: z.number(),
  isFavorite: z.boolean(),
  isValid: z.boolean(),
  metadata: z.object({}).passthrough().optional(),
});

export type SavedProjectPathFirestore = z.infer<typeof SavedProjectPathFirestoreSchema>;

export const UserMemoryProfileFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  memoryEnabled: z.boolean(),
  memoryRetentionDays: z.number(),
  maxMemorySlots: z.number(),
  usedMemorySlots: z.number(),
  preferredTone: z.string().optional(),
  communicationStyle: z.string().optional(),
  expertiseAreas: z.array(z.string()),
  learningPreferences: z.object({}).passthrough().optional(),
  emotionalBaseline: z.string().optional(),
  stressIndicators: z.array(z.string()),
  motivationTriggers: z.array(z.string()),
  roleContext: z.string().optional(),
  projectContext: z.string().optional(),
  teamContext: z.string().optional(),
  memoryAccuracy: z.number(),
  memoryRelevance: z.number(),
  lastMemoryOptimization: z.date().optional(),
});

export type UserMemoryProfileFirestore = z.infer<typeof UserMemoryProfileFirestoreSchema>;

export const ConversationPatternFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  patternType: z.string(),
  patternData: z.object({}).passthrough(),
  frequency: z.number(),
  confidence: z.number(),
  lastObserved: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z.string(),
  subcategory: z.string().optional(),
  keywords: z.array(z.string()),
  contexts: z.array(z.string()),
  effectiveness: z.number().optional(),
});

export type ConversationPatternFirestore = z.infer<typeof ConversationPatternFirestoreSchema>;

export const DomainKnowledgeFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  domain: z.string(),
  knowledgeType: z.string(),
  content: z.object({}).passthrough(),
  importance: z.number(),
  lastAccessed: z.date(),
  accessCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  source: z.string().optional(),
  confidence: z.number(),
  relationships: z.array(z.string()),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
  version: z.number(),
});

export type DomainKnowledgeFirestore = z.infer<typeof DomainKnowledgeFirestoreSchema>;

export const RelationshipAnchorFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  anchorType: z.string(),
  anchorName: z.string(),
  anchorData: z.object({}).passthrough(),
  strength: z.number(),
  lastInteraction: z.date(),
  interactionCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z.string(),
  subcategory: z.string().optional(),
  context: z.string().optional(),
  emotionalValence: z.number().optional(),
  trustLevel: z.number().optional(),
  influenceLevel: z.number().optional(),
  interactionPatterns: z.object({}).passthrough().optional(),
  preferences: z.object({}).passthrough().optional(),
});

export type RelationshipAnchorFirestore = z.infer<typeof RelationshipAnchorFirestoreSchema>;

export const MemorySlotFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  slotType: z.string(),
  content: z.object({}).passthrough(),
  importance: z.number(),
  emotionalWeight: z.number().optional(),
  lastAccessed: z.date(),
  accessCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  source: z.string().optional(),
  context: z.string().optional(),
  tags: z.array(z.string()),
  relationships: z.array(z.string()),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
  isProtected: z.boolean(),
  accuracy: z.number().optional(),
  relevance: z.number().optional(),
  usefulness: z.number().optional(),
});

export type MemorySlotFirestore = z.infer<typeof MemorySlotFirestoreSchema>;

export const MemorySystemMetricsFirestoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  metricDate: z.date(),
  metricType: z.string(),
  metricValue: z.number(),
  context: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type MemorySystemMetricsFirestore = z.infer<typeof MemorySystemMetricsFirestoreSchema>;

export const CollaborationInvitationFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  inviterUserId: z.string(),
  inviteeEmail: z.string().optional(),
  inviteeUserId: z.string().optional(),
  code: z.string(),
  role: z.string(),
  permissions: z.object({}).passthrough().optional(),
});

export type CollaborationInvitationFirestore = z.infer<typeof CollaborationInvitationFirestoreSchema>;

export const ProjectCollaborationSettingsFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  allowPublicJoin: z.boolean(),
  allowCodeSharing: z.boolean(),
  maxInvitations: z.number(),
  invitationExpiryHours: z.number(),
  requireApproval: z.boolean(),
  allowGuestAccess: z.boolean(),
  defaultPermissions: z.object({}).passthrough(),
});

export type ProjectCollaborationSettingsFirestore = z.infer<typeof ProjectCollaborationSettingsFirestoreSchema>;

export const ProjectActivityFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  description: z.string(),
  metadata: z.object({}).passthrough().optional(),
});

export type ProjectActivityFirestore = z.infer<typeof ProjectActivityFirestoreSchema>;

export const RealTimePresenceFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  currentView: z.string().optional(),
  cursorPosition: z.object({}).passthrough().optional(),
});

export type RealTimePresenceFirestore = z.infer<typeof RealTimePresenceFirestoreSchema>;

export const TeamMemberFirestoreSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  licenseType: z.string(),
  organizationId: z.string().optional(),
  department: z.string().optional(),
  lastActive: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeamMemberFirestore = z.infer<typeof TeamMemberFirestoreSchema>;

export const ProjectTeamMemberFirestoreSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  teamMemberId: z.string(),
  assignedBy: z.string(),
  assignedAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectTeamMemberFirestore = z.infer<typeof ProjectTeamMemberFirestoreSchema>;
