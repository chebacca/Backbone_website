# 🔥 Firebase Indexes Guide for UnifiedDataService

## Overview

The UnifiedDataService requires specific composite indexes for optimal performance. This guide lists all required indexes and provides creation instructions.

## 🚨 Required Indexes

Based on the UnifiedDataService queries, the following composite indexes are required:

### 1. Users Collection
**Query**: `where('organization.id', '==', organizationId)`
```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "organization.id",
      "order": "ASCENDING"
    }
  ]
}
```

### 2. Projects Collection
**Query**: `where('organization.id', '==', organizationId)`
```json
{
  "collectionGroup": "projects",
  "queryScope": "COLLECTION", 
  "fields": [
    {
      "fieldPath": "organization.id",
      "order": "ASCENDING"
    }
  ]
}
```

### 3. Subscriptions Collection
**Query**: `where('organizationId', '==', organizationId).where('status', '==', 'ACTIVE')`
```json
{
  "collectionGroup": "subscriptions",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "organizationId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "status", 
      "order": "ASCENDING"
    }
  ]
}
```

### 4. Licenses Collection
**Query**: `where('organization.id', '==', organizationId).orderBy('createdAt', 'desc')`
```json
{
  "collectionGroup": "licenses",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "organization.id",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 5. Team Members Collection
**Query**: `where('organization.id', '==', organizationId).orderBy('createdAt', 'desc')`
```json
{
  "collectionGroup": "team_members",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "organization.id",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 6. Datasets Collection
**Query**: `where('owner.organizationId', '==', organizationId).where('status', '==', 'ACTIVE').orderBy('updatedAt', 'desc')`
```json
{
  "collectionGroup": "datasets",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "owner.organizationId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "updatedAt",
      "order": "DESCENDING"
    }
  ]
}
```

## 🛠️ How to Create Indexes

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/project/backbone-logic/firestore/indexes)
2. Click "Create Index"
3. Fill in the collection name and fields as specified above
4. Click "Create"

### Option 2: Use Error Links
When you run queries that need indexes, Firestore will provide direct links to create them. Look for error messages like:
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### Option 3: Firebase CLI (Advanced)
You can also define indexes in `firestore.indexes.json` and deploy them:
```bash
firebase deploy --only firestore:indexes
```

## 📊 Current Status

Run the verification script to check current status:
```bash
node verify-firebase-indexes.js
```

## ⚠️ Important Notes

1. **Field Paths**: The UnifiedDataService uses nested field paths like `organization.id` instead of flat `organizationId`
2. **Existing Indexes**: Some similar indexes may exist with different field paths - these won't work for UnifiedDataService queries
3. **Build Time**: New indexes can take several minutes to build, especially for large collections
4. **Single Field Indexes**: Firestore automatically creates single-field indexes, so only composite indexes need manual creation

## 🚀 Deployment Checklist

Before deploying the updated LicensesPage and TeamPage:

- [ ] Create all 6 required composite indexes
- [ ] Wait for indexes to finish building (check Firebase Console)
- [ ] Run verification script to confirm
- [ ] Test queries in Firebase Console
- [ ] Deploy the updated pages

## 🔍 Troubleshooting

If you see "requires an index" errors:
1. Check the error message for the exact query
2. Compare with the required indexes above
3. Create any missing indexes
4. Wait for indexes to build (can take 5-10 minutes)
5. Retry the operation

## 📝 Migration Notes

The existing `licenses` collection has an index with `organizationId` + `createdAt`, but UnifiedDataService needs `organization.id` + `createdAt`. Both can coexist, but make sure to create the new one for UnifiedDataService compatibility.
