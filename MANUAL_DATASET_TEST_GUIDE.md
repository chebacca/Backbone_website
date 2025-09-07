# 🧪 Manual Dataset Collection Assignment System Test Guide

## Overview
This guide provides step-by-step instructions to manually test the Dataset Collection Assignment system using the "Corporate Video - Incredible Cotton Shirt" project in the enterprise.user@enterprisemedia.com organization.

## Prerequisites
- Access to https://backbone-logic.web.app
- Enterprise user account credentials
- "Corporate Video - Incredible Cotton Shirt" project exists
- At least one dataset available in the organization

## Test Scenarios

### 🎯 Test 1: Dataset Creation with Collection Assignment

**Objective**: Create a new dataset and assign specific Dashboard collections to it.

**Steps**:
1. Navigate to https://backbone-logic.web.app/dashboard/cloud-projects
2. Log in with enterprise.user@enterprisemedia.com
3. Click the "Actions" dropdown → "Create Dataset"
4. Fill in dataset details:
   - **Name**: "Corporate Video Test Dataset"
   - **Description**: "Test dataset for validating collection assignments"
   - **Storage Backend**: Firestore
   - **Visibility**: Organization
5. In the "Collection Assignment" step, select these collections:
   - **Core System**: `projects`, `teamMembers`
   - **Sessions & Workflows**: `sessions`, `sessionWorkflows`
   - **Media & Content**: `mediaFiles`, `reports`
   - **Timecards & Scheduling**: `timecard_entries`
6. Enable "Organization Scoped Data"
7. Click "Create Dataset"

**Expected Result**: 
- Dataset created successfully
- Collections properly assigned and visible in dataset details
- No conflict warnings (unless intentional overlaps exist)

---

### 🎯 Test 2: Assign Dataset to Project

**Objective**: Assign the created dataset to the "Corporate Video - Incredible Cotton Shirt" project.

**Steps**:
1. In the Cloud Projects page, find "Corporate Video - Incredible Cotton Shirt"
2. Click the "⋮" menu → "Details"
3. Scroll to "Assigned Datasets" section
4. Select the dataset you created from the dropdown
5. Click "Assign"

**Expected Result**:
- Dataset appears in the "Currently Assigned Datasets" list
- Collection assignment details are visible
- "Organization scoped for data isolation" indicator shows

---

### 🎯 Test 3: Edit Dataset Collections

**Objective**: Modify collection assignments in an existing dataset.

**Steps**:
1. In the project details dialog, find your assigned dataset
2. Click the "Edit" button next to the dataset
3. In the Edit Dataset dialog, you should see:
   - **Categorized collections** organized by type
   - **Dashboard collections** (not licensing website collections)
   - **Visual selection interface** with categories and icons
4. Add/remove collections:
   - Add: `inventoryItems` from "Inventory & Equipment"
   - Remove: `reports` from "Media & Content"
5. Click "Save Changes"

**Expected Result**:
- Changes saved successfully
- Updated collection list reflects modifications
- Real-time conflict analysis shows any warnings

---

### 🎯 Test 4: Test Data Isolation

**Objective**: Verify that data is properly isolated by organization.

**Steps**:
1. Open browser developer tools (F12)
2. Go to Network tab
3. In the project details, refresh the datasets
4. Look at the Firestore queries in the network tab
5. Verify all queries include `organizationId` filters

**Expected Result**:
- All Firestore queries include organization-based filtering
- No cross-organization data leakage
- Proper multi-tenant isolation

---

### 🎯 Test 5: Dataset Insights and Conflict Detection

**Objective**: Test the global dataset analysis and conflict detection system.

**Steps**:
1. In the Cloud Projects page, click "Actions" → "Dataset Insights"
2. Review the analysis dashboard:
   - **Total Datasets**: Should show organization count
   - **Collection Overlaps**: Any conflicts between datasets
   - **Health Score**: Overall organization score
   - **Recommendations**: Optimization suggestions
3. Create a conflicting dataset:
   - Create another dataset with overlapping collections
   - Check if conflicts are detected and reported

**Expected Result**:
- Comprehensive analysis of dataset organization
- Clear conflict detection and recommendations
- Health score reflects dataset organization quality

---

### 🎯 Test 6: Dataset Removal and Access Revocation

**Objective**: Test that removing a dataset properly revokes access.

**Steps**:
1. In the project details, find your test dataset
2. Click "Remove" to unassign it from the project
3. Verify the dataset is no longer listed in "Currently Assigned Datasets"
4. Go to "Actions" → "Manage Datasets" to see all organization datasets
5. The dataset should still exist but not be assigned to the project

**Expected Result**:
- Dataset successfully removed from project
- Data access through that dataset is revoked
- Dataset still exists in organization but unassigned

---

### 🎯 Test 7: Cross-Organization Security

**Objective**: Verify that different organizations cannot access each other's data.

**Steps**:
1. Log out from enterprise.user@enterprisemedia.com
2. Log in with a different organization account (if available)
3. Navigate to Cloud Projects
4. Verify you cannot see:
   - "Corporate Video - Incredible Cotton Shirt" project
   - Datasets from the enterprise organization
   - Any data from the other organization

**Expected Result**:
- Complete isolation between organizations
- No cross-organization data visibility
- Proper multi-tenant security

---

## 🔍 Validation Checklist

After completing all tests, verify:

### ✅ Dataset Management
- [ ] Can create datasets with collection assignments
- [ ] Can edit collection assignments with categorized interface
- [ ] Can assign/unassign datasets to/from projects
- [ ] Can view dataset details and collection assignments

### ✅ Collection Assignment
- [ ] Dashboard collections are available (not licensing website collections)
- [ ] Collections are organized by categories with icons
- [ ] Visual selection interface works properly
- [ ] Organization scoping is enforced

### ✅ Data Isolation
- [ ] Organization-based data filtering is active
- [ ] No cross-organization data leakage
- [ ] Proper multi-tenant isolation
- [ ] Security rules prevent unauthorized access

### ✅ Conflict Detection
- [ ] Dataset conflicts are detected and reported
- [ ] Global insights provide useful recommendations
- [ ] Health score reflects dataset organization quality
- [ ] Real-time conflict analysis during editing

### ✅ User Experience
- [ ] Intuitive categorized collection interface
- [ ] Clear visual feedback for selections
- [ ] Helpful descriptions and icons
- [ ] Smooth workflow for dataset management

## 🚨 Common Issues to Watch For

### Collection Source Issues
- **Problem**: Seeing licensing website collections instead of Dashboard collections
- **Solution**: Ensure latest deployment includes updated collection definitions

### Data Isolation Issues
- **Problem**: Seeing data from other organizations
- **Solution**: Check Firestore security rules and organization filtering

### Assignment Issues
- **Problem**: Cannot assign datasets to projects
- **Solution**: Verify user permissions and organization membership

### Performance Issues
- **Problem**: Slow loading of collections or datasets
- **Solution**: Check for efficient queries and proper indexing

## 📊 Success Criteria

The system passes if:
1. **All 7 test scenarios complete successfully**
2. **No cross-organization data leakage detected**
3. **Collection assignments work as expected**
4. **Dataset removal properly revokes access**
5. **Conflict detection provides useful insights**
6. **User interface is intuitive and responsive**

## 🔧 Troubleshooting

### If Tests Fail:
1. Check browser console for JavaScript errors
2. Verify Firebase authentication and permissions
3. Ensure latest code is deployed
4. Check Firestore security rules
5. Validate organization and project setup

### Performance Issues:
1. Monitor Firestore query performance
2. Check for proper indexing
3. Verify efficient data filtering
4. Monitor network requests

## 📖 Additional Resources

- **MPC Documentation**: `shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_MPC.md`
- **Deployment Guide**: `shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_DEPLOYMENT_GUIDE.md`
- **Testing Guide**: `shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_TESTING_GUIDE.md`

---

**🎉 If all tests pass, the Dataset Collection Assignment system is working correctly and provides proper multi-tenant data isolation with modular dataset management!**
