# 🧙‍♂️ Collection Creation Wizard

## Overview

The Collection Creation Wizard allows users in the licensing website to create new Firebase collections while maintaining strict schema compliance with the Dashboard app's structure. This ensures data consistency and proper organization-scoped access control across both applications.

## 🎯 Key Features

### ✅ **Schema-Enforced Collection Creation**
- Users can only create collections that follow established patterns from the Dashboard app
- Pre-defined templates ensure consistency and compatibility
- Custom collections with guided schema builder

### ✅ **Automatic Infrastructure Setup**
- **Firestore Indexes**: Automatically created based on collection type and usage patterns
- **Security Rules**: Organization-scoped access control rules applied automatically
- **Collection Registry**: Tracks all created collections with metadata

### ✅ **Organization-Scoped**
- All collections are properly scoped to the user's organization
- Data isolation between organizations
- Role-based access control

### ✅ **Template-Based Creation**
- **Sessions & Workflows**: Production sessions, tasks, workflows, reviews
- **Media & Content**: Media files, reviews, notes, reports
- **Inventory & Equipment**: Equipment tracking, network management
- **Team & Organization**: Team members, roles, permissions
- **Business & Projects**: Projects, clients, business management
- **Custom Collections**: User-defined schemas with guided builder

## 🏗️ Architecture

### Core Components

1. **CollectionCreationWizard.tsx** - Main wizard UI component
2. **CollectionSchemaService.ts** - Manages collection templates and schemas
3. **FirebaseCollectionCreator.ts** - Handles collection creation with Firebase
4. **collectionManagement.js** - Firebase Functions for server-side operations
5. **autoCreateIndexes.js** - Automatic Firestore index creation
6. **firestore-dynamic-collections.rules** - Enhanced security rules

### Integration Points

- **DashboardCloudProjectsBridge**: Main integration point in licensing website
- **Firebase Functions**: Server-side validation and creation
- **Firestore Security Rules**: Dynamic collection access control
- **Index Automation**: Automatic performance optimization

## 🚀 Usage Guide

### For End Users

#### 1. Access the Wizard
- Navigate to the Dashboard Cloud Projects page in the licensing website
- Click the "Actions" dropdown menu
- Select "Create Collection"

#### 2. Select Collection Category
Choose from available categories:
- **Sessions & Workflows**: For production management
- **Media & Content**: For media file management
- **Inventory & Equipment**: For equipment tracking
- **Team & Organization**: For team management
- **Business & Projects**: For business operations
- **Custom Collection**: For custom data structures

#### 3. Choose Template
Select a specific template within your chosen category. Each template includes:
- Pre-configured fields with proper types
- Optimized Firestore indexes
- Security rules for organization-scoped access
- Relationships with other collections

#### 4. Configure Collection
- **Collection Name**: Must be unique and follow naming conventions
- **Custom Fields**: For custom collections, define your own fields
- **Field Configuration**: Set field types, requirements, and indexing

#### 5. Review & Create
Review the collection configuration including:
- Collection details and template
- Fields that will be created
- Indexes for query optimization
- Security rules for access control

### For Developers

#### Adding New Templates

1. **Define Template in CollectionSchemaService.ts**:
```typescript
this.templates.set('myNewCollection', {
  name: 'myNewCollection',
  category: 'business',
  displayName: 'My New Collection',
  description: 'Description of the collection',
  organizationScoped: true,
  fields: [
    { name: 'id', type: 'string', required: true, indexed: true },
    { name: 'organizationId', type: 'string', required: true, indexed: true },
    // ... more fields
  ],
  indexes: [
    {
      fields: [
        { field: 'organizationId', order: 'asc' },
        { field: 'status', order: 'asc' }
      ],
      queryScope: 'COLLECTION'
    }
  ],
  securityRules: {
    read: ['MEMBER', 'ADMIN', 'OWNER'],
    write: ['ADMIN', 'OWNER'],
    admin: ['ADMIN', 'OWNER']
  }
});
```

2. **Add Index Template in autoCreateIndexes.js**:
```javascript
'myNewCollection': [
  {
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  }
]
```

3. **Add Security Rules in firestore-dynamic-collections.rules**:
```javascript
match /myNewCollection/{docId} {
  allow read: if isAuthenticated() && 
    belongsToOrganization(resource.data.organizationId);
  
  allow write: if isAuthenticated() && 
    hasAnyRole(['ADMIN', 'OWNER']) &&
    request.resource.data.organizationId == getOrganizationId();
}
```

## 🔧 Technical Implementation

### Collection Creation Flow

1. **Client-Side Validation**: CollectionCreationWizard validates input
2. **Firebase Function Call**: createCollection function handles server-side logic
3. **Collection Registry**: Metadata stored in collectionRegistry collection
4. **Index Creation**: autoCreateIndexes script generates required indexes
5. **Security Rules**: Dynamic rules applied based on collection type
6. **Initial Document**: Metadata document created to establish collection

### Security Model

#### Organization Scoping
- All collections include `organizationId` field
- Users can only access collections within their organization
- Data isolation enforced at the Firestore rules level

#### Role-Based Access Control
- **Read Access**: MEMBER, ADMIN, OWNER (varies by collection type)
- **Write Access**: ADMIN, OWNER, specific roles (varies by collection type)
- **Admin Access**: ADMIN, OWNER only

#### Collection Creation Permissions
- Only ADMIN, OWNER, SUPER_ADMIN roles can create collections
- Server-side validation ensures proper permissions
- Audit trail maintained in collectionActivityLogs

### Performance Optimization

#### Automatic Indexing
- Base indexes for all organization-scoped collections
- Template-specific indexes for common query patterns
- Custom field indexes for user-defined fields
- Monitoring script watches for new collections

#### Caching Strategy
- Collection templates cached in CollectionSchemaService
- Firebase Functions use efficient queries
- Client-side validation reduces server calls

## 📋 Collection Templates

### Sessions & Workflows
- **sessions**: Production sessions with scheduling
- **sessionTasks**: Tasks associated with sessions
- **sessionWorkflows**: Workflow management
- **sessionAssignments**: Team member assignments
- **sessionReviews**: Review and approval processes
- **postProductionTasks**: Post-production workflow

### Media & Content
- **mediaFiles**: Media file tracking and metadata
- **reviews**: Content review and approval
- **notes**: General notes and comments
- **reports**: Reporting and analytics
- **callSheets**: Production call sheets
- **stages**: Production stages and milestones

### Inventory & Equipment
- **inventoryItems**: Equipment and asset tracking
- **inventory**: General inventory management
- **networks**: Network configuration and management
- **networkIPAssignments**: IP address management
- **mapLayouts**: Facility and equipment layouts
- **setupProfiles**: Equipment setup configurations

### Team & Organization
- **teamMembers**: Team member management
- **roles**: Role definitions and permissions
- **permissions**: Granular permission management
- **organizations**: Organization metadata
- **contacts**: Contact management

### Business & Projects
- **projects**: Project management and tracking
- **clients**: Client relationship management
- **pbmProjects**: Project budget management
- **pbmSchedules**: Scheduling and resource allocation
- **licenses**: License management
- **subscriptions**: Subscription tracking

## 🛡️ Security Considerations

### Data Validation
- Server-side validation in Firebase Functions
- Schema enforcement through templates
- Field type and requirement validation
- Naming convention enforcement

### Access Control
- Organization-based data isolation
- Role-based operation permissions
- Audit logging for all operations
- Secure collection registry management

### Error Handling
- Graceful fallbacks for service unavailability
- Comprehensive error logging
- User-friendly error messages
- Retry mechanisms for transient failures

## 🚀 Deployment

### Prerequisites
- Firebase project with Firestore enabled
- Firebase Functions deployed
- Proper IAM permissions configured
- Security rules updated

### Deployment Steps

1. **Deploy Firebase Functions**:
```bash
cd dashboard-v14-licensing-website\ 2/server
firebase deploy --only functions
```

2. **Update Security Rules**:
```bash
firebase deploy --only firestore:rules
```

3. **Run Index Automation**:
```bash
node server/scripts/autoCreateIndexes.js monitor
```

4. **Test Collection Creation**:
- Access licensing website
- Navigate to Dashboard Cloud Projects
- Test collection creation wizard

### Monitoring

#### Index Automation
```bash
# Monitor and create missing indexes
node autoCreateIndexes.js monitor

# Watch for new collections (continuous)
node autoCreateIndexes.js watch

# Create indexes for specific collection
node autoCreateIndexes.js collection sessions
```

#### Collection Registry
- Monitor `collectionRegistry` collection for new entries
- Check `collectionActivityLogs` for audit trail
- Review `firestoreIndexes` for index status

## 🔍 Troubleshooting

### Common Issues

#### Collection Creation Fails
1. Check user permissions in teamMembers collection
2. Verify Firebase Functions are deployed and accessible
3. Check Firestore security rules are updated
4. Review Firebase Functions logs for errors

#### Indexes Not Created
1. Run index automation script manually
2. Check `firestoreIndexes` collection for status
3. Verify Firebase CLI access for index deployment
4. Review script logs for errors

#### Security Rule Errors
1. Verify user has proper organizationId token claim
2. Check collection has organizationId field
3. Ensure collection is registered in collectionRegistry
4. Review Firestore security rules syntax

### Debug Commands

```bash
# Check collection registry
firebase firestore:get collectionRegistry

# Monitor function logs
firebase functions:log

# Test security rules
firebase firestore:rules:test

# Check index status
node autoCreateIndexes.js monitor
```

## 📚 Related Documentation

- [Firebase Persistence Architecture MPC](../shared-mpc-library/FIREBASE_PERSISTENCE_ARCHITECTURE_MPC.md)
- [Complete Firebase Functions Implementation](../shared-mpc-library/COMPLETE_FIREBASE_FUNCTIONS_IMPLEMENTATION.md)
- [Firebase WebOnly Production Mode](../shared-mpc-library/FIREBASE_WEBONLY_PRODUCTION_MODE.md)
- [Dashboard v14.2 Core System](../backbone-v14-specs/specs/dashboard-v14-2-core-system.md)

## 🎉 Success Metrics

### User Experience
- ✅ Intuitive wizard interface with step-by-step guidance
- ✅ Real-time validation and error feedback
- ✅ Template preview and configuration options
- ✅ Comprehensive review before creation

### Technical Excellence
- ✅ Automatic infrastructure setup (indexes, security rules)
- ✅ Organization-scoped data isolation
- ✅ Schema compliance with Dashboard app
- ✅ Performance optimization through proper indexing

### Operational Benefits
- ✅ Reduced manual configuration overhead
- ✅ Consistent data structures across applications
- ✅ Audit trail for compliance and debugging
- ✅ Scalable architecture for future enhancements

---

**The Collection Creation Wizard provides a powerful, user-friendly way to extend your Firebase data model while maintaining strict schema compliance and security standards. It bridges the gap between the licensing website and Dashboard app, ensuring seamless data integration and consistent user experience.**
