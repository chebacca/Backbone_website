# Firestore Standardization Plan
## Single Source of Truth Implementation

### Collection Naming Standard
All collections should use camelCase for consistency:

**CURRENT INCONSISTENCIES:**
- `team_members` → `teamMembers` ✅
- `org_members` → `orgMembers` ✅  
- `project_team_members` → `projectTeamMembers` ✅
- `audit_log` → `auditLogs` ✅
- `user_time_cards` → `userTimeCards` ✅

### Service Consolidation
**BEFORE:** Multiple services with overlapping functionality
- `FirestoreLicenseService`
- `FirebaseTeamMemberService` 
- `firestoreService`

**AFTER:** Single unified service
- `UnifiedFirestoreService` - handles all Firestore operations
- Consistent data transformation
- Single point of truth for all collections

### Security Rules Alignment
**CURRENT:** Different rules between projects
**TARGET:** Unified rules covering all use cases

### Index Optimization
**CURRENT:** 767 indexes with potential redundancy
**TARGET:** Optimized set with only necessary composite indexes

## Implementation Priority
1. ✅ Collection naming standardization
2. ✅ Service consolidation  
3. ✅ Security rules unification
4. ✅ Index optimization
5. ✅ Documentation update
