# Workflows (MPC)

## 2025-08-10 — Compliance & Security Hardening

- Stripe webhooks: Use `express.raw({ type: 'application/json' })` and verify with `stripe.webhooks.constructEvent`. Mount `/api/webhooks` before global `express.json()`.
- HTTP security: Enable HSTS via Helmet in production.
- Setup/debug endpoints: Require `x-setup-token`; block in production.
- Persistence: Use Firestore Admin (`services/firestoreService.ts`); `services/db.ts` maps legacy interface to Firestore.

## Current Status
- **Deployment**: Fully deployed on Firebase
- **Database**: PostgreSQL production database
- **Email**: Resend API for transactional emails
- **Payments**: Stripe production integration

## Core User Workflows

### User Registration & Onboarding
1. **Sign Up**: User creates account with email/password
2. **Email Verification**: Verification email sent via Resend
3. **Profile Setup**: User completes business profile and preferences
4. **Consent Management**: Versioned ToS/Privacy consent at registration; GDPR and marketing consent collection
5. **KYC Verification**: Business verification for enterprise features

### Subscription & Payment Flow
1. **Plan Selection**: User chooses Basic, Pro, or Enterprise tier
2. **Seat Configuration**: Select number of licenses needed
3. **Payment Method**: Enter Stripe payment details
4. **Subscription Creation**: Stripe subscription created
5. **License Generation**: Licenses generated based on subscription
6. **Invoice Delivery**: Invoice sent via Resend email
7. **Access Granted**: User can access dashboard and licenses

### License Management
1. **License Activation**: Activate licenses on devices
2. **Usage Tracking**: Monitor license usage and analytics
3. **License Transfer**: Transfer licenses between users
4. **Renewal Management**: Handle subscription renewals
5. **Expiration Handling**: Manage expired licenses

### Enterprise Features
1. **Organization Setup**: Multi-user organization creation
   - Owner purchase creates/locates `organization`; OWNER seeded as ACTIVE member
   - Seats tracked on `subscriptions.seats`; Team UI uses `GET /organizations/my/context` for `{ organization, members, primaryRole, activeSubscription }`
2. **Role Management**: Admin and user role assignment
3. **Bulk Operations**: Mass license and user management
4. **Compliance Monitoring**: KYC/AML and audit tracking
5. **Support Integration**: Enterprise customer support

## Administrative Workflows

### User Management
1. **User Overview**: View all users and their status
2. **Role Assignment**: Assign admin or super admin roles
3. **Compliance Monitoring**: Track KYC and compliance status
4. **Support Actions**: Handle user issues and requests
5. **Per-user Licenses**: From the Users/Licenses tab, click the license icon on a user to open a popover showing that user’s active licenses.

### Subscription Management
1. **Subscription Overview**: Monitor all active subscriptions
2. **Payment Processing**: Handle payment issues and refunds
3. **License Allocation**: Manage license distribution (Users tab → per-user license popover). Licenses for PRO/ENTERPRISE are issued JIT on org invite acceptance.
4. **Revenue Analytics**: Track revenue and growth metrics

### Seat Management
1. **Org Admins/Owners**: Increase/decrease seats via Team page Manage Seats dialog → `PUT /subscriptions/:subscriptionId` within plan rules (BASIC=1, PRO=1–50, ENTERPRISE>=10)
2. **SUPERADMIN**: From Admin Dashboard → Users → Edit User → Manage Seats; updates the user’s active PRO/ENTERPRISE subscription

### Compliance & Security
1. **Audit Logging**: Monitor system access and changes
2. **Consent Review**: Accounting/Legal tab surfaces users’ latest ToS/Privacy snapshots and CSV export of histories
3. **Compliance Events**: Track and resolve compliance issues
4. **Data Export**: Handle GDPR data export requests
5. **System Health**: Monitor system performance and security

## Technical Workflows

### Development & Deployment
1. **Local Development**: `pnpm dev` for local development
2. **Building**: `pnpm build` for production builds
3. **Deployment**: `pnpm deploy` to Firebase
4. **Database Migrations**: Prisma migration management
5. **Environment Updates**: Firebase Functions configuration

### Data Management
1. **Seeding**: Use seeding scripts for test data
2. **Backup**: Database backup and recovery procedures
3. **Migration**: Schema updates and data migrations
4. **Monitoring**: Database performance and health monitoring

### Integration Workflows
1. **Stripe Webhooks**: Payment event processing
2. **Resend Webhooks**: Email delivery tracking
3. **External APIs**: Third-party service integrations
4. **Webhook Retry**: Failed webhook processing
5. **Desktop Application Integration**: Unified startup and project management with desktop app

### Desktop Application Integration Workflow
1. **Application Launch**: Desktop app starts with simplified AppLaunchManager
2. **Authentication Bridge**: WebsiteLoginBridge connects to licensing website API
3. **License Validation**: Real-time license status verification via Firestore
4. **Mode Selection**: User chooses Standalone or Network mode
5. **Project Selection**: Unified project creation/selection using web components
6. **Application Ready**: Main app launches with user context and project data

## Compliance Workflows

### GDPR Compliance
1. **Consent Collection**: User consent tracking with event-level records and per-user snapshots. Re-acceptance prompted on login if versions change.
2. **Data Processing**: Audit logging of data operations
3. **Data Export**: User data export functionality
4. **Data Deletion**: Right to be forgotten implementation

### KYC/AML Compliance
1. **Identity Verification**: Business and individual verification
2. **Risk Assessment**: AML screening and risk scoring
3. **Compliance Monitoring**: Ongoing compliance tracking
4. **Reporting**: Regulatory reporting and documentation

## Monitoring & Alerting

### System Health
1. **Performance Monitoring**: API response times and throughput
2. **Error Tracking**: Error logging and alerting
3. **Security Monitoring**: Authentication and access monitoring
4. **Business Metrics**: Revenue, user growth, and usage analytics

### Operational Workflows
1. **Incident Response**: Problem identification and resolution
2. **Capacity Planning**: Resource scaling and optimization
3. **Backup & Recovery**: Data protection and disaster recovery
4. **Security Updates**: Security patch management

## Current Implementation Status
- ✅ **User Management**: Fully implemented
- ✅ **Payment Processing**: Stripe integration complete
- ✅ **License System**: Full license lifecycle management
- ✅ **Admin Dashboard**: Comprehensive administrative tools
- ✅ **Compliance**: GDPR and KYC/AML features
- ✅ **Email System**: Resend integration for all notifications
- 🔄 **Testing**: Framework setup in progress
- 🔄 **Monitoring**: Basic monitoring implemented
