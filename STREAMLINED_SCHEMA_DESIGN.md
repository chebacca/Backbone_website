# Streamlined Schema Design

## 🎯 Goal
Create a single source of truth for team member and project management with minimal collections and clear relationships.

## 📋 Simplified Collections

### 1. **`users`** (Single source for all users)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  firebaseUid: string;
  
  // Role determines user type
  role: 'OWNER' | 'TEAM_MEMBER' | 'SUPERADMIN' | 'ACCOUNTING';
  
  // Organization relationship (for both owners and team members)
  organizationId: string;
  
  // Team member specific fields (only populated if role === 'TEAM_MEMBER')
  teamMemberData?: {
    licenseType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    department?: string;
    status: 'ACTIVE' | 'SUSPENDED';
    createdBy: string; // Owner who created this team member
    joinedAt: Date;
  };
  
  // Standard fields
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

### 2. **`organizations`** (Organization details)
```typescript
interface Organization {
  id: string;
  name: string;
  ownerId: string; // References users.id where role === 'OWNER'
  tier: 'PRO' | 'ENTERPRISE';
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. **`subscriptions`** (Billing/License data)
```typescript
interface Subscription {
  id: string;
  organizationId: string; // References organizations.id
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  seats: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. **`projects`** (Project data)
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // References users.id where role === 'OWNER'
  organizationId: string; // References organizations.id
  
  // Project settings
  isActive: boolean;
  isArchived: boolean;
  allowCollaboration: boolean;
  maxCollaborators: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. **`projectAssignments`** (Single source for project team assignments)
```typescript
interface ProjectAssignment {
  id: string;
  projectId: string; // References projects.id
  userId: string; // References users.id (team member)
  role: 'ADMIN' | 'MANAGER' | 'DO_ER' | 'VIEWER';
  assignedBy: string; // References users.id (owner who assigned)
  assignedAt: Date;
  isActive: boolean;
}
```

## 🔄 Data Flow

### Owner Workflow:
1. **Owner** exists in `users` with `role: 'OWNER'`
2. **Organization** exists in `organizations` with `ownerId` pointing to owner
3. **Subscription** exists in `subscriptions` with `organizationId`
4. **Owner creates team member** → New record in `users` with `role: 'TEAM_MEMBER'` and `organizationId`
5. **Owner creates project** → New record in `projects` with `ownerId` and `organizationId`
6. **Owner assigns team member to project** → New record in `projectAssignments`

### Team Member Workflow:
1. **Team member logs in** → Query `users` where `firebaseUid` matches
2. **Team member views assigned projects** → Query `projectAssignments` where `userId` matches, join with `projects`

## ✅ Benefits

### Single Source of Truth:
- **Users**: All user data (owners + team members) in one place
- **Project Assignments**: All assignments in `projectAssignments` only
- **No Duplication**: No more `teamMembers`, `org_members`, `project_participants` collections

### Simplified Queries:
- **Get team members for org**: `users.where('organizationId', '==', orgId).where('role', '==', 'TEAM_MEMBER')`
- **Get assigned projects**: `projectAssignments.where('userId', '==', teamMemberId)` → join `projects`
- **Get project team**: `projectAssignments.where('projectId', '==', projectId)` → join `users`

### Clear Relationships:
- **Owner** → **Organization** (1:1)
- **Organization** → **Subscription** (1:1)
- **Organization** → **Team Members** (1:many via `users.organizationId`)
- **Owner** → **Projects** (1:many via `projects.ownerId`)
- **Team Members** → **Project Assignments** (many:many via `projectAssignments`)

## 🚀 Migration Strategy

1. **Consolidate user data** into single `users` collection
2. **Migrate project assignments** to single `projectAssignments` collection
3. **Remove redundant collections**: `teamMembers`, `org_members`, `projectTeamMembers`, `project_participants`
4. **Update all API endpoints** to use new schema
5. **Test all workflows** end-to-end
